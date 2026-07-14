import { NextResponse } from 'next/server';
import { callOpenRouter, parseJSON } from '@/lib/openrouter';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    const systemPrompt = `You are an expert communication and soft skills coach. The user is requesting a short, interactive lesson on a specific soft skill topic.`;

    const userMessage = `Create a short text guide for: "${topic}"
Structure the guide clearly using HTML tags for formatting. 
Include: Introduction, Key points (bulleted list), Do's and Don'ts, a Practice exercise, and a Quick quiz (3 simple MCQs with answers at the very end).
Do not use Markdown, use only HTML tags for styling (e.g. <h2>, <p>, <ul>, <li>, <strong>).

Return ONLY valid JSON:
{
  "content": "string (html)"
}`;

    const text = await callOpenRouter(systemPrompt, userMessage);
    const data = parseJSON(text);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Soft skill lesson error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
