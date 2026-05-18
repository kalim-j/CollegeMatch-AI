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

// Robustly extract the first valid JSON object from any string
function extractJSON(raw: string): string {
  let text = raw.replace(/```(?:json)?\s*([\s\S]*?)```/gi, "$1").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }
  return text.trim();
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
          content: `You are an Indian college admission cutoff expert with deep knowledge of Tamil Nadu, Karnataka, Maharashtra, Kerala, and all major state university cutoff trends from 2022-2026. Given a student's cutoff mark, community, stream, state, college name, and course — predict admission chances.

Respond with ONLY a raw JSON object — no markdown, no code fences, no explanation, no text before or after.

The JSON must follow this exact structure:
{
  "verdict": "Likely",
  "confidence": 85,
  "reasoning": "3 sentences explaining the prediction",
  "cutoff_trend": [
    { "year": "2022", "cutoff": 185 },
    { "year": "2023", "cutoff": 187 },
    { "year": "2024", "cutoff": 188 },
    { "year": "2025", "cutoff": 190 }
  ],
  "recommendation": "what the student should do next",
  "alternative_colleges": ["College 1", "College 2", "College 3"]
}

verdict must be exactly one of: "Likely", "Borderline", or "Unlikely"
confidence must be a number between 0 and 100
alternative_colleges should be empty array [] if verdict is not "Unlikely"`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const rawContent = chatCompletion.choices[0]?.message?.content ?? "";

    // Robustly extract JSON
    const cleaned = extractJSON(rawContent);

    let predictionData: PredictionResult;
    try {
      predictionData = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Groq response as JSON. Raw:", rawContent);
      console.error("Cleaned attempt:", cleaned);
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
