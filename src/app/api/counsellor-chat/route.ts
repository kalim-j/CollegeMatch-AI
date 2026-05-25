import { NextResponse } from 'next/server';

export const maxDuration = 60; // Set max duration for OpenRouter requests

export async function POST(req: Request) {
  try {
    const { message, history, studentProfile } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is missing");
      return NextResponse.json({ error: "API key is not configured" }, { status: 500 });
    }

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

    const openRouterMessages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((m: any) => ({
        role: m.role,
        content: m.content
      })),
      { role: "user", content: message }
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://collegematch-ai.vercel.app",
        "X-Title": "CollegeMatch-AI Counsellor",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        models: [
          'google/gemma-4-26b-a4b-it:free',
          'meta-llama/llama-3.3-70b-instruct:free',
          'poolside/laguna-xs.2:free'
        ],
        messages: openRouterMessages,
        temperature: 0.7,
        max_tokens: 1000,
        route: "fallback"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter error: ${response.status} ${errorText}`);
      return NextResponse.json({ error: "Failed to connect to AI counsellor" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({
      reply: data.choices[0].message.content,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Counsellor Chat error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
