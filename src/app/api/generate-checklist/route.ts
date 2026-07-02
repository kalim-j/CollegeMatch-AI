import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, parseJSON } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { course, state, category } = await req.json();

    const prompt = `You are an expert college admissions counselor in India.
    
Student Profile:
Course: ${course}
State of College: ${state}
Category/Quota: ${category}

Generate a comprehensive list of required documents for college counseling and admission.
Provide the response strictly as a JSON object with this structure:
{
  "mandatory": [
    { "name": "Document Name", "description": "Why it is needed" }
  ],
  "category_specific": [
    { "name": "Document Name", "description": "Why it is needed based on category/quota" }
  ],
  "optional_but_recommended": [
    { "name": "Document Name", "description": "Why it is helpful" }
  ]
}

Ensure the response is ONLY valid JSON without markdown wrapping.`;

    const rawResponse = await callOpenRouter(
      'You are a precise counselor outputting JSON only.', 
      prompt,
      1500
    );
    
    const parsedData = parseJSON(rawResponse);
    return NextResponse.json(parsedData);
    
  } catch (error: any) {
    console.error('Error generating checklist:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate checklist' }, { status: 500 });
  }
}
