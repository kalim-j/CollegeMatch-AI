import { NextResponse } from 'next/server';
import { callOpenRouter, parseJSON } from '@/lib/openrouter';

export async function POST(req: Request) {
  try {
    const { level, stream } = await req.json();

    const systemPrompt = `You are an Indian entrance exam expert. Given a student's
    course level (UG/PG) and stream, list all relevant entrance
    exams they should know about.
    For each exam return a JSON object:
    {
      "name": string (full exam name),
      "short_name": string (e.g. JEE, NEET, TNEA),
      "conducting_body": string,
      "level": string (National / State / University),
      "mode": string (Online / Offline / Both),
      "frequency": string (Annual / Twice a year),
      "exam_date": string (approximate month or 'Check official site'),
      "registration_start": string (approximate month),
      "official_url": string,
      "eligibility": string (one sentence),
      "syllabus_highlights": string[] (5 key topics),
      "exam_pattern": string (2 sentences),
      "importance": string (High / Medium / Low),
      "tip": string (one powerful preparation tip)
    }
    Return only a JSON array. No markdown. No extra text.
    Include national exams (JEE Main, JEE Advanced, NEET, CUET,
    CAT, MAT, GATE, etc.) and relevant state exams (TNEA for TN,
    KEAM for Kerala, MHT-CET for Maharashtra, etc.).
    For Engineering UG always include: JEE Main, JEE Advanced,
    TNEA, KEAM, MHT-CET, WBJEE, VITEEE, SRMJEEE, BITSAT.
    For Medical UG always include: NEET UG, AIIMS (via NEET),
    JIPMER (via NEET).
    For MBA always include: CAT, MAT, XAT, SNAP, TANCET.
    For PG Engineering always include: GATE, TANCET PG.`;

    const userPrompt = `Level: ${level}, Stream: ${stream}`;

    const rawText = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseJSON(rawText) as any;
    const results = Array.isArray(parsed) ? parsed : (parsed.exams || []);

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Exams API Error:', error);
    return NextResponse.json(
      { error: 'AI service temporarily unavailable. Please try again.' }, 
      { status: 500 }
    );
  }
}
