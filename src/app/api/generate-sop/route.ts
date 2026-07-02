import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { 
      fullName,
      course,
      university,
      background,
      goals,
      whyThisUniversity
    } = await req.json();

    const prompt = `You are an expert Statement of Purpose (SOP) Writer for college admissions. Given the following student details, write a highly compelling, professional, and personalized SOP.

Student Details:
Name: ${fullName}
Target Course: ${course}
Target University: ${university}
Academic/Professional Background: ${background}
Short-term & Long-term Goals: ${goals}
Why this university: ${whyThisUniversity}

The SOP should:
1. Have an engaging introduction.
2. Discuss the applicant's background and achievements.
3. Explain their motivation for the course.
4. Highlight why the target university is the perfect fit.
5. Conclude strongly with their future goals.

Output the SOP in pure markdown format.`;

    const rawResponse = await callOpenRouter(
      'You are a professional SOP writer who outputs markdown text.', 
      prompt,
      2000
    );
    
    return NextResponse.json({ markdown: rawResponse });
    
  } catch (error: any) {
    console.error('Error generating SOP:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate SOP' }, { status: 500 });
  }
}
