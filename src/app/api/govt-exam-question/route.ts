import { NextResponse } from 'next/server';
import { callOpenRouter, parseJSON } from '@/lib/openrouter';

export async function POST(req: Request) {
  try {
    const { exam, subject, difficulty } = await req.json();

    const systemPrompt = `You are an expert tutor for Indian government competitive exams. Generate accurate, exam-pattern questions based on previous year papers and official syllabus.`;

    const userMessage = `Generate 1 MCQ for:
Exam: ${exam}
Subject: ${subject}
Difficulty: ${difficulty || 'Medium'}

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
  "explanation": "string (clear explanation)",
  "difficulty": "Easy|Medium|Hard",
  "time_limit": 60
}`;

    const text = await callOpenRouter(systemPrompt, userMessage);
    const data = parseJSON(text);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Govt exam question error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
