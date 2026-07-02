import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { stream, type, difficulty, round, totalQ } = await req.json();

    let questionType = 'mcq';
    let category = stream || 'General';

    // Question sequence logic from spec:
    if (round === 1) {
      questionType = 'open';
      category = 'HR';
    } else if (round === totalQ) {
      questionType = 'open';
      category = 'HR';
    } else {
      // Middle questions
      if (type === 'HR') {
        questionType = 'open';
        category = 'HR';
      } else if (type === 'Technical') {
        questionType = 'mcq';
      } else {
        // Mixed: alternate
        questionType = round % 2 === 0 ? 'mcq' : 'open';
        category = questionType === 'mcq' ? stream : 'HR';
      }
    }

    let userMessage = `Generate Question ${round} of ${totalQ} for a mock interview.
Stream: ${stream}
Type: ${type}
Difficulty: ${difficulty}
Target Category: ${category}
Format: ${questionType}`;

    let systemPrompt = `You are an expert interviewer for Indian students.\n`;

    if (questionType === 'mcq') {
      systemPrompt += `When generating MCQ questions:
- Include exactly 4 options labeled A, B, C, D
- Make all 4 options plausible (avoid obvious wrong answers)
- The correct answer should require real knowledge
- For Engineering: focus on Data Structures, Algorithms, OS, DBMS, CN, OOP concepts
- For Medical: focus on Anatomy, Physiology, Biochemistry
- For Commerce: focus on Accountancy, Economics, Business Law

Return JSON exactly like this:
{
  "question": "string",
  "type": "mcq",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "options": [
    { "id": "A", "text": "string" },
    { "id": "B", "text": "string" },
    { "id": "C", "text": "string" },
    { "id": "D", "text": "string" }
  ]
}`;
    } else {
      systemPrompt += `When generating HR/Open text questions, ask behavioral or background questions.
If round 1, ALWAYS ask exactly "Tell me about yourself."
If the last round, ALWAYS ask exactly "Why do you want to study ${stream}?"

Return JSON exactly like this:
{
  "question": "string",
  "type": "open",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "options": [],
  "what_good_answer_covers": ["point 1", "point 2", "point 3"]
}`;
    }

    const raw = await callOpenRouter(systemPrompt, userMessage, 800);
    
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Error generating interview question:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate question' }, { status: 500 });
  }
}
