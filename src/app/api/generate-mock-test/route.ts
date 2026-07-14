import { NextResponse } from 'next/server';
import { callOpenRouter, parseJSON } from '@/lib/openrouter';

export async function POST(req: Request) {
  try {
    const { exam, num_questions } = await req.json();

    const systemPrompt = `You are an expert examiner setting a mock test for Indian competitive exams.`;

    const userMessage = `Generate a full mock test of ${num_questions || 10} MCQs for: ${exam}. 
Include a mix of subjects relevant to the exam (e.g. quantitative, logical, verbal, general knowledge).

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "question": "string",
      "options": [
        { "id": "A", "text": "string" },
        { "id": "B", "text": "string" },
        { "id": "C", "text": "string" },
        { "id": "D", "text": "string" }
      ],
      "correct": "A|B|C|D",
      "explanation": "string"
    }
  ]
}`;

    // The max_tokens might need to be higher for a full mock test
    const text = await callOpenRouter(systemPrompt, userMessage, 4000);
    const data = parseJSON(text);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Generate mock test error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
