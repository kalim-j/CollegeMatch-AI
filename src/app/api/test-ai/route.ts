import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'OPENROUTER_API_KEY is not set in Vercel env vars',
      fix: 'Go to Vercel → Settings → Environment Variables → add OPENROUTER_API_KEY'
    });
  }

  try {
    const res = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://collegematch-ai.vercel.app',
          'X-Title': 'CollegeMatch-AI',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [
            {
              role: 'user',
              content: 'Say exactly: CollegeMatch-AI is working!'
            }
          ],
          max_tokens: 50,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({
        success: false,
        status: res.status,
        error: err,
        keyPrefix: apiKey.substring(0, 12) + '...',
      });
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      message: data.choices?.[0]?.message?.content,
      model: data.model,
      keyPrefix: apiKey.substring(0, 12) + '...',
    });

  } catch (err) {
    return NextResponse.json({
      success: false,
      error: String(err),
    });
  }
}
