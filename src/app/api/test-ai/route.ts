import { NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';

export async function GET() {
  try {
    const result = await callOpenRouter(
      'You are a helpful assistant.',
      'Say "CollegeMatch-AI is working!" and nothing else.'
    );
    return NextResponse.json({ success: true, message: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
