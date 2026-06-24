import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { previousAnswers, step } = await req.json();

    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY not set' }, { status: 500 });
    }

    const prompt = `You are a career guidance expert for Indian 12th-grade students.
      The student has answered ${step-1} questions so far:
      ${JSON.stringify(previousAnswers)}
      
      Generate Question ${step} of 10 to help determine if they should choose Science (Maths/Bio), Commerce, or Arts/Humanities.
      The question should be distinct from previous questions and highly relevant based on their last answer.
      
      Return ONLY a valid JSON object with this exact format, no markdown formatting:
      {
        "question": "The question text",
        "options": [
          { "id": "opt1", "label": "Option 1 text", "icon": "emoji" },
          { "id": "opt2", "label": "Option 2 text", "icon": "emoji" },
          { "id": "opt3", "label": "Option 3 text", "icon": "emoji" },
          { "id": "other", "label": "Other", "icon": "✍️" }
        ]
      }`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://collegematch-ai.vercel.app',
        'X-Title': 'CollegeMatch-AI',
      },
      body: JSON.stringify({
        models: [
          'google/gemma-4-26b-a4b-it:free',
          'meta-llama/llama-3.3-70b-instruct:free',
          'poolside/laguna-xs.2:free'
        ],
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
        return NextResponse.json({ error: `OpenRouter API error: ${res.status}` }, { status: 500 });
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? '';

    // Strip markdown fences
    const cleaned = content
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    // Extract JSON object
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');

    if (start === -1 || end === -1) {
      return NextResponse.json({ error: 'AI did not return valid JSON' }, { status: 500 });
    }

    const jsonStr = cleaned.slice(start, end + 1);
    const nextQuestion = JSON.parse(jsonStr);
    return NextResponse.json({ nextQuestion });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
