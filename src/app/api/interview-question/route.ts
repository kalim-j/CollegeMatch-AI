import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const { 
      course,
      university,
      round
    } = await req.json();

    const prompt = `You are a strict admissions interviewer at ${university} for the ${course} program.
    
We are in round ${round}. Generate ONE highly relevant, challenging interview question for the candidate.
DO NOT include any pleasantries, greetings, or other text. ONLY return the exact question text.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an admissions interviewer. Only output the question.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.7,
      max_tokens: 500,
    });
    
    const rawResponse = chatCompletion.choices[0]?.message?.content || "Could you tell me why you're interested in this program?";
    
    return NextResponse.json({ question: rawResponse });
    
  } catch (error: any) {
    console.error('Error generating interview question:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate question' }, { status: 500 });
  }
}
