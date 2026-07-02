import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { question, subject } = await req.json();

    const prompt = `You are a friendly, expert AI tutor explaining concepts to a high school/college student.
    
Subject: ${subject}
Student's Question: "${question}"

Explain the answer clearly, using analogies if helpful. Do not use overly complex jargon unless you define it.
Output in beautiful markdown format. Use bold text, lists, and emojis for readability.`;

    const rawResponse = await callOpenRouter(
      'You are a helpful AI tutor outputting markdown.', 
      prompt,
      1500
    );
    
    return NextResponse.json({ markdown: rawResponse });
    
  } catch (error: any) {
    console.error('Error solving doubt:', error);
    return NextResponse.json({ error: error.message || 'Failed to solve doubt' }, { status: 500 });
  }
}
