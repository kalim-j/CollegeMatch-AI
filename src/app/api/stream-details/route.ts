import { callOpenRouter, parseJSON } from "@/lib/openrouter";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { stream } = await req.json();

    if (!stream) {
      return NextResponse.json({ error: "Stream is required" }, { status: 400 });
    }

    const systemPrompt = `You are an Indian education expert writing a complete guide about a specific stream/course for a student who just finished 12th grade and is considering this stream.
Write in simple, clear, friendly language — like explaining to a younger sibling.

The stream to write about is: ${stream}

Return JSON:
{
  "stream": string,
  "tagline": string (one exciting sentence about this stream),
  "what_is_it": string (3 sentences: what this stream is, in simple language a 17-year-old understands),
  "what_you_study": string[] (8 subjects/topics they will study),
  "year_by_year": [
    { "year": "Year 1", "focus": string, "highlights": string[] },
    { "year": "Year 2", "focus": string, "highlights": string[] },
    { "year": "Year 3", "focus": string, "highlights": string[] },
    { "year": "Year 4", "focus": string, "highlights": string[] }
  ],
  "career_paths": [
    {
      "title": string (job title),
      "description": string (one sentence),
      "salary": string (range),
      "growth": string ('High' | 'Medium' | 'Stable')
    }
  ],
  "pros": string[] (5 genuine advantages of this stream),
  "cons": string[] (3 honest challenges of this stream),
  "myths": [
    { "myth": string, "truth": string }
  ],
  "day_in_life": string (paragraph describing a typical day as a professional in this field — make it vivid and real),
  "skills_needed": string[] (6 skills that help in this stream),
  "entrance_exams": [
    { "name": string, "level": string, "difficulty": string }
  ],
  "top_colleges_india": string[] (5 top colleges for this stream),
  "is_right_for_you": {
    "yes_if": string[] (3 signs this stream suits you),
    "no_if": string[] (3 signs this may not suit you)
  },
  "salary_growth": [
    { "stage": string, "range": string }
  ]
}
Return only valid JSON. No markdown. No extra text.`;

    const rawText = await callOpenRouter(systemPrompt, "Provide stream details.");
    const result = parseJSON(rawText);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Stream Details Error:", error);
    return NextResponse.json(
      { error: "AI service temporarily unavailable. Please try again." }, 
      { status: 500 }
    );
  }
}
