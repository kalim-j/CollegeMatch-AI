import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.OPENROUTER_API_KEY;

  if (!key) {
    return NextResponse.json({
      success: false,
      error: 'OPENROUTER_API_KEY is missing from Vercel env vars',
    });
  }

  try {
    const res = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
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
          messages: [{ role: 'user', content: 'Say: working' }],
          max_tokens: 10,
        }),
      }
    );

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        status: res.status,
        body: text,
        keyPreview: key.slice(0, 15) + '...',
      });
    }

    const data = JSON.parse(text);
    return NextResponse.json({
      success: true,
      reply: data.choices?.[0]?.message?.content,
      keyPreview: key.slice(0, 15) + '...',
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}
