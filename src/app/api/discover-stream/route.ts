import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Step 1: Parse request body safely
    let body: { answers?: unknown[]; studentName?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { answers = [], studentName = 'Student' } = body;

    // Step 2: Check API key exists
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY is not set');
      return NextResponse.json(
        { error: 'AI service not configured. API key missing.' },
        { status: 500 }
      );
    }

    // Step 3: Build stream frequency map from answers
    const streamCount: Record<string, number> = {};
    if (Array.isArray(answers)) {
      answers.forEach((ans: unknown) => {
        const answer = ans as { streams?: string[] };
        if (answer?.streams && Array.isArray(answer.streams)) {
          answer.streams.forEach((s: string) => {
            streamCount[s] = (streamCount[s] || 0) + 1;
          });
        }
      });
    }

    const streamFrequency = Object.entries(streamCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([stream, count]) => `${stream}: ${count} times`)
      .join(', ');

    // Step 4: Build prompts
    const systemPrompt = `You are CollegeMatch-AI's stream discovery counsellor.
You help Indian students who have no idea what to study after 12th grade.
You are warm, encouraging, and speak like a wise mentor.

A student answered 10 questions about their interests, strengths,
personality, lifestyle, and goals. Based on their answers, recommend
the top 3 streams they should study after 12th.

CRITICAL: Return ONLY a valid JSON object. No markdown. No backticks.
No explanation. Start your response with { and end with }.

Return this exact structure:
{
  "overall_personality": "2 sentences describing this student",
  "strength_summary": "what this student is naturally good at",
  "encouragement": "3 warm encouraging sentences for this student",
  "streams": [
    {
      "rank": 1,
      "stream": "full stream name",
      "short_name": "short name",
      "match_score": 92,
      "why_fits": "3 sentences why this suits this student",
      "career_paths": ["Job 1", "Job 2", "Job 3", "Job 4", "Job 5"],
      "top_companies": ["Company 1", "Company 2", "Company 3", "Company 4", "Company 5"],
      "average_salary": "₹4L–₹12L per year",
      "course_duration": "4 years BTech",
      "difficulty_level": "Moderate",
      "entrance_exams": ["JEE Main", "TNEA"],
      "best_for_personality": "one sentence",
      "inspirational_quote": "a real quote",
      "famous_people": ["Person 1", "Person 2", "Person 3"],
      "next_step": "exact advice for this week"
    },
    {
      "rank": 2,
      "stream": "second stream",
      "short_name": "short",
      "match_score": 85,
      "why_fits": "why this fits",
      "career_paths": ["Job 1", "Job 2", "Job 3", "Job 4", "Job 5"],
      "top_companies": ["Co 1", "Co 2", "Co 3", "Co 4", "Co 5"],
      "average_salary": "₹3L–₹8L per year",
      "course_duration": "3 years BSc",
      "difficulty_level": "Easy to get in",
      "entrance_exams": ["NEET", "KEAM"],
      "best_for_personality": "one sentence",
      "inspirational_quote": "a real quote",
      "famous_people": ["Person 1", "Person 2", "Person 3"],
      "next_step": "advice"
    },
    {
      "rank": 3,
      "stream": "third stream",
      "short_name": "short",
      "match_score": 78,
      "why_fits": "why this fits",
      "career_paths": ["Job 1", "Job 2", "Job 3", "Job 4", "Job 5"],
      "top_companies": ["Co 1", "Co 2", "Co 3", "Co 4", "Co 5"],
      "average_salary": "₹3L–₹6L per year",
      "course_duration": "3 years BCom",
      "difficulty_level": "Easy to get in",
      "entrance_exams": ["CUET"],
      "best_for_personality": "one sentence",
      "inspirational_quote": "a real quote",
      "famous_people": ["Person 1", "Person 2", "Person 3"],
      "next_step": "advice"
    }
  ]
}`;

    const userMessage = `Student name: ${studentName}
Stream frequency from answers: ${streamFrequency}
Total answers given: ${answers.length}
Analyse and recommend top 3 streams. Return only JSON.`;

    // Step 5: Call OpenRouter API
    console.log('Calling OpenRouter with model: meta-llama/llama-3.3-70b-instruct:free');

    const aiResponse = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://collegematch-ai.vercel.app',
          'X-Title': 'CollegeMatch-AI',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          max_tokens: 3000,
          temperature: 0.7,
        }),
      }
    );

    // Step 6: Handle OpenRouter response errors
    if (!aiResponse.ok) {
      const errBody = await aiResponse.text();
      console.error('OpenRouter HTTP error:', aiResponse.status, errBody);
      return NextResponse.json(
        {
          error: `AI API error ${aiResponse.status}: ${errBody}`,
        },
        { status: 500 }
      );
    }

    const aiData = await aiResponse.json();
    console.log('OpenRouter response received');

    // Step 7: Extract content from response
    const rawContent = aiData?.choices?.[0]?.message?.content;
    if (!rawContent) {
      console.error('No content in OpenRouter response:', JSON.stringify(aiData));
      return NextResponse.json(
        { error: 'AI returned empty response' },
        { status: 500 }
      );
    }

    console.log('Raw AI content length:', rawContent.length);

    // Step 8: Parse JSON safely — strip fences
    let parsed: unknown;
    try {
      const cleaned = rawContent
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      // Find first { and last } to extract JSON
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start === -1 || end === -1) {
        throw new Error('No JSON object found in response');
      }
      const jsonStr = cleaned.slice(start, end + 1);
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr);
      console.error('Raw content was:', rawContent.substring(0, 500));
      return NextResponse.json(
        { error: 'AI response was not valid JSON. Please try again.' },
        { status: 500 }
      );
    }

    // Step 9: Return successful result
    return NextResponse.json(parsed);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('discover-stream unhandled error:', message);
    return NextResponse.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}
