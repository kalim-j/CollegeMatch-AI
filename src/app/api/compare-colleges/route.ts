import { groq } from "@/lib/groq";
import { NextResponse } from "next/server";
import { College } from "@/types";

interface ComparisonResult {
  summary: string;
  best_pick: string;
  best_pick_reason: string;
  colleges: {
    [collegeName: string]: {
      pros: string[];
      cons: string[];
      verdict: string;
    };
  };
}

export async function POST(req: Request) {
  try {
    const { colleges, studentProfile } = await req.json() as {
      colleges: College[];
      studentProfile?: any;
    };

    // Validate minimum college count
    if (!colleges || colleges.length < 2) {
      return NextResponse.json(
        { error: "At least 2 colleges are required for comparison" },
        { status: 400 }
      );
    }

    // Build the user message with college data and optional student profile
    const collegeData = colleges.map((college) => ({
      name: college.name,
      location: college.location,
      state: college.state,
      type: college.type,
      naac_grade: college.naac_grade ?? "N/A",
      nirf_rank: college.nirf_rank,
      cutoff_general: college.cutoff_general,
      match_score: college.match_score ?? null,
      courses: college.courses ?? [college.course],
      fees_approx: college.fees_approx ?? null,
      avg_package_lpa: college.avg_package_lpa,
    }));

    const userMessage = studentProfile
      ? `Compare these colleges for a student with the following profile:\n${JSON.stringify(studentProfile, null, 2)}\n\nColleges:\n${JSON.stringify(collegeData, null, 2)}`
      : `Compare these colleges:\n${JSON.stringify(collegeData, null, 2)}`;

    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are CollegeMatch-AI comparison expert. Given 2-3 Indian colleges and a student profile, provide a JSON response with this exact structure:
{
  summary: string (3 sentences comparing all colleges),
  best_pick: string (name of best college for this student),
  best_pick_reason: string (2 sentences why),
  colleges: {
    [collegeName: string]: {
      pros: string[] (3 pros specific to this student),
      cons: string[] (2 cons specific to this student),
      verdict: string (one sentence)
    }
  }
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

    let comparisonData: ComparisonResult;
    try {
      comparisonData = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Groq response as JSON:", cleaned);
      return NextResponse.json(
        { error: "Failed to parse AI comparison response" },
        { status: 500 }
      );
    }

    return NextResponse.json(comparisonData);
  } catch (error: any) {
    console.error("Compare colleges API error:", error);
    return NextResponse.json(
      { error: error.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
