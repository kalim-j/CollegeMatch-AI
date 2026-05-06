import { groq } from "@/lib/groq";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { studentProfile } = await req.json();

    const systemPrompt = `You are EduAnalytics-AI, an expert Indian college admission counsellor. 
    Given a student's profile, suggest exactly 8 best-fit colleges.

    Return only a JSON array of 8 objects. No markdown, no extra text.
    
    Structure:
    {
      "id": number (unique random integer),
      "name": string,
      "location": string,
      "state": string,
      "type": "Government" | "Private" | "Deemed" | "Autonomous",
      "course": string (primary recommended course),
      "cutoff_general": number,
      "cutoff_obc": number,
      "cutoff_sc": number,
      "cutoff_st": number,
      "avg_package_lpa": number,
      "max_package_lpa": number,
      "seats": number,
      "nirf_rank": number,
      "website": string,
      "match_score": number (0-100),
      "why_fit": string (2 sentences)
    }

    District-aware: Prefer colleges in or near the student's district (${studentProfile.district}, ${studentProfile.state}).
    Range-aware: If cutoffRange is '-10', include safer colleges. If '+10', include aspirational ones.
    Current Range Selection: ${studentProfile.cutoffRange}. Student Cutoff: ${studentProfile.cutoffMark}.
    
    Student Profile:
    - Level: ${studentProfile.courseLevel}
    - Stream: ${studentProfile.stream}
    - State: ${studentProfile.state}
    - District: ${studentProfile.district}
    - 10th%: ${studentProfile.percentage10th}%
    - 12th%: ${studentProfile.percentage12th}%
    - Cutoff: ${studentProfile.cutoffMark}
    - Budget: ${studentProfile.budget}
    - Quota: ${studentProfile.quota}
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: "Suggest 8 colleges based on my profile.",
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(responseText);
    
    // The model might wrap it in a root object like { "colleges": [...] }
    const colleges = Array.isArray(data) ? data : (data.colleges || data.results || []);

    return NextResponse.json(colleges.slice(0, 8));
  } catch (error: any) {
    console.error("GROQ API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
