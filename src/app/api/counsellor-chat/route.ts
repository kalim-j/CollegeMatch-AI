import { NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';

export const maxDuration = 60; // Set max duration for OpenRouter requests

export async function POST(req: Request) {
  try {
    const { message, history, studentProfile } = await req.json();

    const systemPrompt = `You are the CollegeMatch AI Admission Counsellor, an expert in Indian engineering and medical admissions, specifically Tamil Nadu Engineering Admissions (TNEA).
You are talking to ${studentProfile?.name || 'a student'}.
Here is what you know about them so far:
- Target Degree: ${studentProfile?.courseLevel || 'Unknown'} ${studentProfile?.stream || 'Unknown'}
- Location: ${studentProfile?.district || 'Unknown'}, ${studentProfile?.state || 'Unknown'}
- 10th Marks: ${studentProfile?.percentage10th || 'Unknown'}%
- 12th Marks: ${studentProfile?.percentage12th || 'Unknown'}%
- Cutoff: ${studentProfile?.cutoffMark || 'Unknown'}
- Category: ${studentProfile?.quota || 'Unknown'}
- Preferred Budget: ${studentProfile?.budget || 'Unknown'}

Guidelines:
1. Be encouraging, highly informative, and act as a professional counsellor.
2. If they ask about colleges for their cutoff, suggest realistic options based on previous year TNEA trends. For a cutoff around 190+, suggest top tier (Anna University CEG, MIT, PSG, SSN). For 180-190, suggest tier 2 (CIT, GCT, Thiagarajar, SVCE). For below 180, suggest good autonomous colleges.
3. Keep answers concise but well-formatted with bullet points if listing things.
4. If they ask something unrelated to education or admissions, politely steer the conversation back.`;

    const mappedHistory = (history || []).map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    const reply = await callOpenRouter(systemPrompt, message, 1000, undefined, mappedHistory);

    return NextResponse.json({
      reply,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Counsellor Chat error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
