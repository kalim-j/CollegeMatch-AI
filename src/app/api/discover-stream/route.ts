import { openrouter } from "@/lib/openrouter";
import { NextResponse } from "next/server";

export const maxDuration = 60; // Allow up to 60 seconds for Groq AI response

export async function POST(req: Request) {
  try {
    const { answers, studentName } = await req.json();

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid answers format" }, { status: 400 });
    }

    // Build stream frequency map
    const streamCounts: Record<string, number> = {};
    answers.forEach((answer: any) => {
      if (answer.streams && Array.isArray(answer.streams)) {
        answer.streams.forEach((stream: string) => {
          streamCounts[stream] = (streamCounts[stream] || 0) + 1;
        });
      }
    });

    const systemPrompt = `You are CollegeMatch-AI's stream discovery counsellor.
You help Indian students who have no idea what to study after 12th grade. You are warm, encouraging, and speak like a wise mentor not a robot.

A student named ${studentName || "Student"} just answered 10 questions about their interests, strengths, personality, lifestyle, and goals.
Here is the frequency of streams based on their answers: ${JSON.stringify(streamCounts)}
Here are their raw answers: ${JSON.stringify(answers)}

Based on their answers, recommend the top 3 streams they should study after 12th.

For each stream return:
{
  "rank": number (1, 2, or 3),
  "stream": string (full stream name e.g. 'Computer Science Engineering'),
  "short_name": string (e.g. 'CSE / IT'),
  "match_score": number (0-100, how well it fits their answers),
  "why_fits": string (3 sentences explaining why this stream suits THIS specific student based on their actual answers - mention their interests, personality, and goals. Make it personal and warm.),
  "career_paths": string[] (5 specific job titles they can get),
  "top_companies": string[] (5 real companies that hire for this stream),
  "average_salary": string (starting salary range in India e.g. '₹4L–₹12L per year'),
  "course_duration": string (e.g. '4 years BTech'),
  "difficulty_level": string ('Easy to get in' | 'Moderate' | 'Competitive' | 'Very competitive'),
  "entrance_exams": string[] (2-3 relevant entrance exams),
  "best_for_personality": string (one sentence - what personality type thrives here),
  "inspirational_quote": string (one real quote from a famous person in this field),
  "famous_people": string[] (3 famous Indians who studied this stream),
  "next_step": string (exact advice: what the student should do THIS WEEK to pursue this stream)
}

Also return:
{
  "overall_personality": string (2 sentences describing this student's personality type),
  "strength_summary": string (what this student is naturally good at, 2 sentences),
  "encouragement": string (3 warm, personal, encouraging sentences for this student addressing their specific answers - not generic motivation),
  "streams": [the 3 stream objects above]
}

Return only valid JSON matching this exact structure.
No markdown. No extra text.`;

    const chatCompletion = await openrouter.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        }
      ],
      model: "google/gemini-2.0-flash-exp:free", // Correct free model alias for OpenRouter
      temperature: 0.7
    });

    let responseContent = chatCompletion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error("No response from OpenRouter");
    }

    // Strip markdown formatting if the model wraps it in ```json ... ```
    responseContent = responseContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const result = JSON.parse(responseContent);

    return NextResponse.json({ results: result });
  } catch (error: any) {
    console.error("Discover Stream Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
