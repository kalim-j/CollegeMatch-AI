import { NextResponse } from 'next/server';
import { callOpenRouter, parseJSON } from '@/lib/openrouter';

export async function POST(req: Request) {
  try {
    const studentData = await req.json();
    const { state, community, level, stream, income, percentage } = studentData;

    const systemPrompt = `You are an Indian scholarship expert. Given a student's state,
    community, course level, stream, family income, and 12th percentage,
    suggest 8 real scholarships they qualify for.
    For each scholarship return a JSON object:
    {
      "name": string,
      "provider": string (Govt of India / State Govt / Private / NGO),
      "amount": string (e.g. '₹25,000 per year'),
      "eligibility": string (one sentence),
      "deadline": string (approximate or 'Check official site'),
      "apply_url": string (official portal URL if known, else ''),
      "category": string (Merit / Need-based / Community / Sports / Minority),
      "level": string (UG / PG / Both),
      "how_to_apply": string (2 sentences on application process)
    }
    Return only a JSON array of 8 objects. No markdown. No extra text.
    Include NSP (National Scholarship Portal) scholarships,
    state government scholarships, and private scholarships.
    Be accurate — only include real scholarships.`;

    const userPrompt = `Student Profile:
    - State: ${state}
    - Community: ${community}
    - Level: ${level}
    - Stream: ${stream}
    - Income: ${income}
    - 12th Percentage: ${percentage}%`;

    const rawText = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseJSON(rawText) as any;
    
    // Ensure we return an array
    const results = Array.isArray(parsed) ? parsed : (parsed.scholarships || []);

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Scholarship API Error:', error);
    return NextResponse.json(
      { error: 'AI service temporarily unavailable. Please try again.' }, 
      { status: 500 }
    );
  }
}
