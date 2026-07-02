import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, parseJSON } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  const {
    cutoff, percentage, category, state,
    stream, level, topColleges
  } = await req.json();

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
    const rawContent = await callOpenRouter(prompt, 'Provide insights for the above profile and colleges.', 1200);
    const parsed = parseJSON(rawContent);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Error fetching AI insight:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch AI insight' }, { status: 500 });
  }
}
