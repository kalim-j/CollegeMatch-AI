import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { question, options, selectedOption, subject } = await req.json();

    const systemPrompt = `You are an expert ${subject} tutor who explains concepts clearly for Indian students preparing for competitive exams. Always give specific, educational explanations that help students understand the underlying concept, not just the answer.`;

    const userMessage = `Question: ${question}
Options: ${options.map((o: {id:string;text:string}) => `${o.id}) ${o.text}`).join(', ')}
Student selected: ${selectedOption}

Return ONLY valid JSON:
{
  "correct_option": "B",
  "is_correct": true or false (based on selected option vs correct),
  "explanation": "Detailed 3-4 sentence explanation of WHY the correct answer is correct. Explain the concept, give a real-world example if helpful, and mention why the wrong options are incorrect.",
  "concept_tip": "One sentence memory tip or shortcut for this concept"
}`;

    const raw = await callOpenRouter(systemPrompt, userMessage, 600);
    
    // Parse the JSON block out of the raw response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("MCQ validation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
