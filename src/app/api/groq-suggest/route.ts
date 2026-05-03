import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { marks10th, marks12th, stream, budget, statePreference } = await req.json();

    const systemPrompt = `You are EduAnalytics-AI, an expert Indian college admission counsellor.
Based on student data, suggest 5 best-fit colleges in India.
Provide details for each: name, location, type (govt/private), expected cutoff, course recommendation, and why it fits.
Return the response as a JSON array of objects with these keys: name, location, type, expectedCutoff, courseRecommendation, whyFits, matchScore (0-100).
Ensure the JSON is valid and only return the array.`;

    const userPrompt = `Student Data:
- 10th Marks: ${marks10th}
- 12th Marks: ${marks12th}
- Stream: ${stream}
- Budget: ${budget}
- Preferred States: ${statePreference}

Suggest the 5 best-fit colleges.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content || "{}";
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      console.error("JSON Parse Error:", content);
      return NextResponse.json({ error: "Invalid response format from AI" }, { status: 500 });
    }
    
    // Extract array from various possible keys or direct array
    let colleges = [];
    if (Array.isArray(parsedContent)) {
      colleges = parsedContent;
    } else if (parsedContent.colleges && Array.isArray(parsedContent.colleges)) {
      colleges = parsedContent.colleges;
    } else if (parsedContent.suggestions && Array.isArray(parsedContent.suggestions)) {
      colleges = parsedContent.suggestions;
    } else {
      // Fallback: search for any array in the object
      const arrays = Object.values(parsedContent).filter(val => Array.isArray(val));
      if (arrays.length > 0) colleges = arrays[0] as any[];
    }

    if (colleges.length === 0) {
      return NextResponse.json({ error: "No college suggestions found" }, { status: 500 });
    }

    return NextResponse.json({ colleges });
  } catch (error) {
    console.error("Groq API Error:", error);
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
  }
}
