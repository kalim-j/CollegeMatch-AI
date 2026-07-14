import { NextResponse } from 'next/server';
import { callOpenRouter, parseJSON } from '@/lib/openrouter';

export async function POST(req: Request) {
  try {
    const { category, topic, difficulty, previousQuestions } = await req.json();

    const systemPrompt = `You are an expert aptitude trainer for Indian competitive exams (CAT, GMAT, RRB, TNPSC, SSC, Bank PO). Generate unique, high-quality MCQ questions that test real concepts.`;

    const userMessage = `Generate 1 aptitude MCQ:
Category: ${category}
Topic: ${topic}
Difficulty: ${difficulty || 'Medium'}
Avoid these previous questions: ${(previousQuestions || []).join(', ')}

Return ONLY valid JSON:
{
  "question": "string",
  "options": [
    { "id": "A", "text": "string" },
    { "id": "B", "text": "string" },
    { "id": "C", "text": "string" },
    { "id": "D", "text": "string" }
  ],
  "correct": "A|B|C|D",
  "explanation": "string (step-by-step solution, 3-4 sentences)",
  "shortcut": "string (trick or formula to solve faster)",
  "difficulty": "Easy|Medium|Hard",
  "time_limit": 60,
  "category": "${category}",
  "topic": "${topic}"
}`;

    const text = await callOpenRouter(systemPrompt, userMessage);
    const data = parseJSON(text);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Aptitude question error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
