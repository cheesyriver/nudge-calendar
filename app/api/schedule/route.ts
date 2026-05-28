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

  const prompt = `
You are an AI study scheduler for a university student.

Today's date is ${today}.

The student's existing schedule is:
${scheduleSummary || '  (no existing events)'}

They have an upcoming ${assignment.type}:
  - Title: "${assignment.title}"
  - Due date: ${assignment.dueDate}
  - Confidence: ${assignment.confidence}/10  (1 = knows nothing, 10 = completely confident)
  - Grade weightage: ${assignment.weightage}%
  ${assignment.notes ? `- Notes: ${assignment.notes}` : ''}

Your task: schedule focused study sessions leading up to the due date.

Rules:
1. Sessions must be 1–2 hours long.
2. Only schedule between 08:00 and 22:00.
3. Do NOT overlap any existing event, leave at least 15 min gap (VERY IMPORTANT).
4. Lower confidence and higher weightage = more sessions and longer sessions.
5. Spread sessions across multiple days; don't stack more than 2 sessions on one day.
6. Do NOT schedule back-to-back sessions.
7. If there is a big gap in the schedule, schedule a study session in that gap INSTEAD of between two events.
8. Do not schedule anything on or after the due date.
9. Start scheduling from tomorrow at the earliest.

Return ONLY a valid JSON array — no markdown, no explanation, nothing else:
[
  {
    "title": "Study: ${assignment.title}",
    "start": "YYYY-MM-DDTHH:mm:00",
    "end": "YYYY-MM-DDTHH:mm:00"
  }
]
`.trim();

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