import { callOpenRouter, parseJSON } from "@/lib/openrouter";
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

    const collegeNames = collegeData.map((c) => c.name);

    const userMessage = studentProfile
      ? `Compare these colleges for a student with the following profile:\n${JSON.stringify(studentProfile, null, 2)}\n\nColleges:\n${JSON.stringify(collegeData, null, 2)}`
      : `Compare these colleges:\n${JSON.stringify(collegeData, null, 2)}`;

    const rawContent = await callOpenRouter(
      `You are CollegeMatch-AI comparison expert. Given 2-3 Indian colleges, respond with ONLY a raw JSON object — no markdown, no code fences, no explanation, no text before or after.

The JSON must follow this exact structure:
{
  "summary": "3 sentences comparing all colleges",
  "best_pick": "exact name of best college",
  "best_pick_reason": "2 sentences explaining why",
  "colleges": {
    "EXACT_COLLEGE_NAME_1": {
      "pros": ["pro 1", "pro 2", "pro 3"],
      "cons": ["con 1", "con 2"],
      "verdict": "one sentence verdict"
    },
    "EXACT_COLLEGE_NAME_2": {
      "pros": ["pro 1", "pro 2", "pro 3"],
      "cons": ["con 1", "con 2"],
      "verdict": "one sentence verdict"
    }
  }
}

IMPORTANT: Use the exact college names as keys in the colleges object: ${collegeNames.join(", ")}`,
      userMessage
    );

    let comparisonData: ComparisonResult;
    try {
      comparisonData = parseJSON(rawContent) as ComparisonResult;
    } catch {
      console.error("Failed to parse OpenRouter response as JSON. Raw:", rawContent);
      return NextResponse.json(
        { error: "Failed to parse AI comparison response" },
        { status: 500 }
      );
    }

    // Validate required fields exist
    if (!comparisonData.summary || !comparisonData.best_pick || !comparisonData.colleges) {
      return NextResponse.json(
        { error: "AI returned incomplete comparison data" },
        { status: 500 }
      );
    }

    return NextResponse.json(comparisonData);
  } catch (error: any) {
    console.error("Compare colleges API error:", error);
    return NextResponse.json(
      { error: "AI service temporarily unavailable. Please try again." }, 
      { status: 500 }
    );
  }
}
