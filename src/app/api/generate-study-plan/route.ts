import { NextResponse } from 'next/server';
import { callOpenRouter, parseJSON } from '@/lib/openrouter';

export async function POST(req: Request) {
  try {
    const { exam, days, hoursPerDay } = await req.json();

    const systemPrompt = `You are an expert academic counselor and study planner.`;

    const userMessage = `Create a study plan for:
Exam: ${exam}
Duration: ${days} days
Daily Study Time: ${hoursPerDay} hours

Return ONLY valid JSON in this exact format:
{
  "plan": [
    {
      "day": "Day 1-5 (or Week 1)",
      "focus": "string (main topic)",
      "tasks": ["string", "string"],
      "tips": "string"
    }
  ]
}`;

    const text = await callOpenRouter(systemPrompt, userMessage);
    const data = parseJSON(text);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Generate study plan error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
