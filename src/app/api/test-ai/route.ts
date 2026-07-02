import { NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';

export async function GET() {
  const key = process.env.OPENROUTER_API_KEY;

  if (!key) {
    return NextResponse.json({
      success: false,
      error: 'OPENROUTER_API_KEY is missing from Vercel env vars',
    });
  }

  try {
    const reply = await callOpenRouter('You are a test assistant.', 'Say: working', 10);
    return NextResponse.json({
      success: true,
      reply,
      keyPreview: key.slice(0, 15) + '...',
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || String(e) });
  }
}
