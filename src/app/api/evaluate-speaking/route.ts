import { NextResponse } from 'next/server';
import { callOpenRouter, parseJSON } from '@/lib/openrouter';

export async function POST(req: Request) {
  try {
    const { transcript, topic, type } = await req.json();

    const systemPrompt = `You are a communication skills trainer specializing in helping Indian students improve their English speaking for job interviews and group discussions.`;

    const userMessage = `Evaluate this student's response:
Topic: ${topic}
Type: ${type}
Transcript: "${transcript}"

Return ONLY valid JSON:
{
  "overall_score": number (0-10),
  "fluency_score": number (0-10),
  "grammar_score": number (0-10),
  "vocabulary_score": number (0-10),
  "confidence_score": number (0-10),
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "corrected_version": "string (how it should have been said for maximum impact)",
  "better_words": [{"original": "string", "better": "string"}],
  "next_tip": "string (one specific thing to practice next)"
}`;

    const text = await callOpenRouter(systemPrompt, userMessage);
    const data = parseJSON(text);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Evaluate speaking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
