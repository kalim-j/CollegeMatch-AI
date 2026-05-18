import { groq } from "@/lib/groq";
import { NextResponse } from "next/server";

interface CutoffTrendEntry {
  year: string;
  cutoff: number;
}

interface PredictionResult {
  verdict: "Likely" | "Borderline" | "Unlikely";
  confidence: number;
  reasoning: string;
  cutoff_trend: CutoffTrendEntry[];
  recommendation: string;
  alternative_colleges: string[];
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      cutoff_mark?: unknown;
      community?: unknown;
      stream?: unknown;
      state?: unknown;
      college_name?: unknown;
      course_preference?: unknown;
    };

    const { cutoff_mark, community, stream, state, college_name, course_preference } = body;

    // Validate required fields
    if (
      cutoff_mark === undefined ||
      cutoff_mark === null ||
      !community ||
      !stream ||
      !state ||
      !college_name ||
      !course_preference
    ) {
      return NextResponse.json(
        { error: "Missing required fields: cutoff_mark, community, stream, state, college_name, course_preference" },
        { status: 400 }
      );
    }

    const userMessage = `Student details:
- Cutoff Mark: ${cutoff_mark}
- Community: ${community}
- Stream: ${stream}
- State: ${state}
- College Name: ${college_name}
- Course Preference: ${course_preference}

Predict the admission chances for this student.`;

    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an Indian college admission cutoff expert with deep knowledge of Tamil Nadu, Karnataka, Maharashtra, Kerala, and all major state university cutoff trends from 2022-2026. Given a student's cutoff mark, community, stream, state, college name, and course — predict admission chances. Return only valid JSON with this exact structure:
{
  verdict: 'Likely' | 'Borderline' | 'Unlikely',
  confidence: number (0-100),
  reasoning: string (3 sentences explaining the prediction),
  cutoff_trend: [
    { year: '2022', cutoff: number },
    { year: '2023', cutoff: number },
    { year: '2024', cutoff: number },
    { year: '2025', cutoff: number }
  ],
  recommendation: string (what the student should do next),
  alternative_colleges: string[] (3 safer alternatives if unlikely, empty array otherwise)
}
Return only valid JSON. No markdown. No explanation.`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const rawContent = chatCompletion.choices[0]?.message?.content ?? "";

    // Strip markdown code fences if present
    const cleaned = rawContent
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let predictionData: PredictionResult;
    try {
      predictionData = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Groq response as JSON:", cleaned);
      return NextResponse.json(
        { error: "Failed to parse AI prediction response" },
        { status: 500 }
      );
    }

    return NextResponse.json(predictionData);
  } catch (error: unknown) {
    console.error("Predict cutoff API error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
