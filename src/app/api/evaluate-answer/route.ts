import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, parseJSON } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { 
      question,
      answer,
    } = await req.json();

    const prompt = `You are an expert admissions interviewer evaluating a candidate's response.
    
Question asked: "${question}"
Candidate's Answer: "${answer}"

Evaluate the answer. Provide your response strictly as a JSON object with this structure:
{
  "score": 8, // out of 10
  "feedback": "Detailed feedback on what was good and what was bad.",
  "ideal_points": ["Point 1 they missed", "Point 2 they should have mentioned"]
}

Ensure the response is ONLY valid JSON without markdown wrapping.`;

    const rawResponse = await callOpenRouter(
      'You are a precise evaluator who only outputs JSON.', 
      prompt,
      1500
    );
    
    const parsedData = parseJSON(rawResponse);
    return NextResponse.json(parsedData);
    
  } catch (error: any) {
    console.error('Error evaluating answer:', error);
    return NextResponse.json({ error: error.message || 'Failed to evaluate answer' }, { status: 500 });
  }
}
