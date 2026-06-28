import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const {
    cutoff, percentage, category, state,
    stream, level, topColleges
  } = await req.json();

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return NextResponse.json(
    { error: 'API key missing' }, { status: 500 }
  );

  const prompt = `You are an Indian college admission expert.

Student profile:
- Level: ${level} (UG or PG)
- Cutoff/Score: ${cutoff || percentage}
- Category: ${category}
- Preferred state: ${state}
- Stream: ${stream || 'Any'}

Pre-filtered colleges (rank them and add insights):
${topColleges.map((c: {name: string; nirf_rank: number | null; avg_package: string; naac_grade: string}, i: number) =>
  `${i+1}. ${c.name} (NIRF: ${c.nirf_rank || 'Unranked'}, Avg Package: ${c.avg_package}, NAAC: ${c.naac_grade})`
).join('\n')}

For each college return a JSON array:
[{
  "name": "exact college name from list",
  "ai_rank": 1,
  "recommendation": "1 sentence why this is best for this student",
  "best_course": "single best course for this student",
  "insider_tip": "1 practical tip specific to this college"
}]

Order from best fit to lowest fit for THIS student.
Return only valid JSON array. No markdown.`;

  try {
    const res = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://collegematch-ai.vercel.app',
          'X-Title': 'CollegeMatch-AI',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1200,
          temperature: 0.6,
        }),
      }
    );

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content ?? '';
    const clean = raw
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();
    const start = clean.indexOf('[');
    const end = clean.lastIndexOf(']');
    const parsed = JSON.parse(clean.slice(start, end + 1));
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error fetching AI insight:', error);
    return NextResponse.json({ error: 'Failed to fetch AI insight' }, { status: 500 });
  }
}
