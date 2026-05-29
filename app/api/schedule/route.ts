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

  const prompt = `Study scheduler. Today: ${today}.
    BLOCKED slots (15-min buffer required around each):
    ${scheduleSummary || '(none)'}
    Task: "${assignment.title}" (${assignment.type}), due ${assignment.dueDate}, confidence ${assignment.confidence}/10, weight ${assignment.weightage}%${assignment.notes ? `, notes: ${assignment.notes}` : ''}.

    Rules: (IMPORTANT) DO NOT overlap with existing events, LEAVE 15 MINUTE GAP BETWEEN ANY EVENT AND THE NEW STUDY SESSION, 1-2h sessions, plan times between 08:00-22:00 ONLY, MAX 2 sessions/day, spread across days, lower confidence+higher weight=more sessions, nothing on or after due date, start planning from tomorrow.
    Output ONLY JSON, no markdown: [{"title":"Study: ${assignment.title}","start":"YYYY-MM-DDTHH:mm:00","end":"YYYY-MM-DDTHH:mm:00"}]`.trim();

  let geminiRes: Response;
  try {
    geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
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

  // Strip markdown code fences if Gemini wraps the JSON anyway
  const cleaned = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return NextResponse.json(
      { error: 'Could not find a JSON array in the AI response.', raw: rawText },
      { status: 500 },
    );
  }

  try {
    const studySlots = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ studySlots });
  } catch {
    return NextResponse.json(
      { error: 'AI response contained invalid JSON.', raw: rawText },
      { status: 500 },
    );
  }
}