import { NextResponse } from 'next/server';
import { callOpenRouter, parseJSON } from '@/lib/openrouter';

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    const systemPrompt = `You are an expert aptitude trainer. The user wants a detailed explanation for an aptitude question.`;

    const userMessage = `Here is the question:
${question.question}
Options: ${question.options.map((o: any) => o.text).join(', ')}
Correct Answer: ${question.correct}

Provide a full detailed explanation in HTML format (using <p>, <ul>, <strong> etc. for formatting). Include the mathematical formula, an alternative approach (if applicable), and a very brief similar example. Do not use Markdown, use only HTML tags for styling.

Return ONLY valid JSON:
{
  "explanation": "string (html)"
}`;

    const text = await callOpenRouter(systemPrompt, userMessage);
    const data = parseJSON(text);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Aptitude explanation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
