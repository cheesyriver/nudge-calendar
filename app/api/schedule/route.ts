import { NextRequest, NextResponse } from 'next/server';

interface EventSummary {
  title: string;
  start: string;
  end: string;
}

interface AssignmentDetails {
  title: string;
  type: 'assignment' | 'exam';
  dueDate: string;
  confidence: number;
  weightage: number;
  notes: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not set. Add it to .env.local (local) or Vercel Environment Variables (deployed).' },
      { status: 500 },
    );
  }

  const { assignment, existingEvents } = (await req.json()) as {
    assignment: AssignmentDetails;
    existingEvents: EventSummary[];
  };

  const scheduleSummary = existingEvents
    .toSorted((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .map((e) => {
      const start = new Date(e.start).toLocaleString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short',
        hour: '2-digit', minute: '2-digit', hour12: true,
      });
      const end = new Date(e.end).toLocaleString('en-GB', {
        hour: '2-digit', minute: '2-digit', hour12: true,
      });
      return `  - ${e.title}: ${start} → ${end}`;
    })
    .join('\n');

  const today = new Date().toISOString().split('T')[0];

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const dayBeforeDue = new Date(assignment.dueDate);
  dayBeforeDue.setDate(dayBeforeDue.getDate() - 1);
  const dayBeforeDueStr = dayBeforeDue.toISOString().split('T')[0];

  const prompt = `Study scheduler. Today: ${today}.
  BLOCKED slots (15-min buffer required around each):
  ${scheduleSummary || '(none)'}
  Any date not listed above is completely free to schedule in.
  Task: "${assignment.title}" (${assignment.type}), due ${assignment.dueDate}, confidence ${assignment.confidence}/10, weight ${assignment.weightage}%${assignment.notes ? `, notes: ${assignment.notes}` : ''}.
  Plan sessions between ${tomorrowStr} and ${dayBeforeDueStr} inclusive. Rules: DO NOT overlap with blocked slots, leave 15-min gap around each blocked slot, 1-2h sessions, 08:00-22:00 only, max 2 sessions/day, spread across days, lower confidence+higher weight=more sessions, fill free days with up to 2 sessions.
  Output ONLY JSON, no markdown: [{"title":"Study: ${assignment.title}","start":"YYYY-MM-DDTHH:mm:00","end":"YYYY-MM-DDTHH:mm:00"}]`.trim();
  let geminiRes: Response;
  try {
    geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2 },
        }),
      },
    );
  } catch (networkErr) {
    return NextResponse.json(
      { error: `Network error reaching Gemini: ${String(networkErr)}` },
      { status: 500 },
    );
  }

  if (!geminiRes.ok) {
    const errBody = await geminiRes.text();
    return NextResponse.json(
      { error: `Gemini returned ${geminiRes.status}: ${errBody}` },
      { status: 500 },
    );
  }

  const geminiData = await geminiRes.json();
  const rawText: string = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  if (!rawText) {
    return NextResponse.json(
      { error: 'Gemini returned an empty response.', raw: geminiData },
      { status: 500 },
    );
  }

  const cleaned = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return NextResponse.json(
      { error: 'Could not find a JSON array in the AI response.', raw: rawText },
      { status: 500 },
    );
  }

  const GAP_MS = 15 * 60 * 1000;

function isOverlapping(
  slotStart: number,
  slotEnd: number,
  events: EventSummary[],
): boolean {
  return events.some((e) => {
    const eStart = new Date(e.start).getTime() - GAP_MS;
    const eEnd   = new Date(e.end).getTime()   + GAP_MS;
    return slotStart < eEnd && slotEnd > eStart;
  });
}

try {
  let studySlots: { title: string; start: string; end: string }[] = JSON.parse(jsonMatch[0]);

  // Find slots that conflict with existing events and ask Gemini to fix only them
  const conflicting = studySlots.filter((slot) =>
    isOverlapping(new Date(slot.start).getTime(), new Date(slot.end).getTime(), existingEvents),
  );

  if (conflicting.length > 0) {
    const fixPrompt = `These study sessions overlap with existing events or their 15-min buffer. Reschedule each to a free slot, keeping the same duration. Rules: 08:00-22:00, before ${assignment.dueDate}, 15-min gap around all existing events.
      Existing events:
      ${scheduleSummary || '(none)'}
      Fix these slots: ${JSON.stringify(conflicting)}
      Return ONLY a JSON array of the corrected slots, no markdown.`;

    const fixRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fixPrompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
        }),
      },
    );

    if (fixRes.ok) {
      const fixData = await fixRes.json();
      const fixText: string = fixData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const fixCleaned = fixText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      const fixMatch = fixCleaned.match(/\[[\s\S]*\]/);
      if (fixMatch) {
        const fixed = JSON.parse(fixMatch[0]);
        const conflictingStarts = new Set(conflicting.map((s) => s.start));
        studySlots = [
          ...studySlots.filter((s) => !conflictingStarts.has(s.start)),
          ...fixed,
        ];
      }
    }
  }

  // Final safety chek to drop anything is still overlapping
  const validated = studySlots.filter(
    (slot) => !isOverlapping(new Date(slot.start).getTime(), new Date(slot.end).getTime(), existingEvents),
  );

  return NextResponse.json({ studySlots: validated });
} catch {
  return NextResponse.json(
    { error: 'AI response contained invalid JSON.', raw: rawText },
    { status: 500 },
  );
}
}