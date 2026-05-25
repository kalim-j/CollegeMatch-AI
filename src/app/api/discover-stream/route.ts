import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const key = process.env.OPENROUTER_API_KEY;

  if (!key) {
    console.error('FATAL: OPENROUTER_API_KEY not set');
    return NextResponse.json(
      { error: 'OPENROUTER_API_KEY is not configured in Vercel' },
      { status: 500 }
    );
  }

  let body: { answers?: unknown[]; studentName?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  const { answers = [], studentName = 'Student' } = body;

  // Count stream frequency from answers
  const freq: Record<string, number> = {};
  if (Array.isArray(answers)) {
    for (const a of answers) {
      const ans = a as { streams?: string[] };
      for (const s of ans?.streams ?? []) {
        freq[s] = (freq[s] ?? 0) + 1;
      }
    }
  }

  const freqStr = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([s, c]) => `${s}(${c})`)
    .join(', ');

  const prompt = `You are an Indian education counsellor helping a student
named ${studentName} choose what to study after 12th grade.

Their interest analysis shows these streams ranked by frequency:
${freqStr || 'General interests'}

Recommend exactly 3 streams. Return ONLY raw JSON — no markdown,
no backticks, no explanation. Start with { immediately.

{
  "overall_personality": "2 sentences about this student",
  "strength_summary": "their natural strengths in 1 sentence",
  "encouragement": "2 warm encouraging sentences",
  "streams": [
    {
      "rank": 1,
      "stream": "Computer Science Engineering",
      "short_name": "CSE / IT",
      "match_score": 91,
      "why_fits": "3 sentences why this fits this student",
      "career_paths": ["Software Engineer", "Data Scientist",
        "AI Engineer", "Web Developer", "Product Manager"],
      "top_companies": ["TCS", "Infosys", "Google", "Amazon", "Wipro"],
      "average_salary": "₹5L–₹20L per year",
      "course_duration": "4 years BTech",
      "difficulty_level": "Competitive",
      "entrance_exams": ["JEE Main", "TNEA", "VITEEE"],
      "best_for_personality": "Logical thinkers who love building things",
      "inspirational_quote": "The computer was born to solve problems that did not exist before.",
      "famous_people": ["Sundar Pichai", "Satya Nadella", "N. R. Narayana Murthy"],
      "next_step": "Register for JEE Main at jeemain.nta.nic.in this week"
    },
    {
      "rank": 2,
      "stream": "Medicine / MBBS",
      "short_name": "Medical",
      "match_score": 82,
      "why_fits": "why this fits",
      "career_paths": ["Doctor", "Surgeon", "Radiologist",
        "Psychiatrist", "Medical Researcher"],
      "top_companies": ["AIIMS", "Apollo", "Fortis",
        "Manipal Hospitals", "Government hospitals"],
      "average_salary": "₹6L–₹25L per year",
      "course_duration": "5.5 years MBBS",
      "difficulty_level": "Very competitive",
      "entrance_exams": ["NEET UG"],
      "best_for_personality": "Empathetic people who want to heal others",
      "inspirational_quote": "Wherever the art of medicine is loved, there is also a love of humanity.",
      "famous_people": ["Dr. APJ Abdul Kalam", "Devi Shetty", "Naresh Trehan"],
      "next_step": "Start NEET preparation with Biology focus immediately"
    },
    {
      "rank": 3,
      "stream": "Commerce / Business",
      "short_name": "BCom / BBA",
      "match_score": 74,
      "why_fits": "why this fits",
      "career_paths": ["CA", "Business Analyst",
        "Banker", "Entrepreneur", "Financial Advisor"],
      "top_companies": ["Deloitte", "KPMG", "HDFC Bank",
        "Reliance", "Tata Group"],
      "average_salary": "₹4L–₹15L per year",
      "course_duration": "3 years BCom or BBA",
      "difficulty_level": "Easy to get in",
      "entrance_exams": ["CUET", "IPMAT", "SET"],
      "best_for_personality": "Organised minds who love numbers and strategy",
      "inspirational_quote": "Business opportunities are like buses, there is always another one coming.",
      "famous_people": ["Ratan Tata", "Mukesh Ambani", "Kiran Mazumdar-Shaw"],
      "next_step": "Research BCom colleges in your state and check CUET dates"
    }
  ]
}

Replace the 3 stream examples above with the actual best streams
for ${studentName} based on their interests: ${freqStr}`;

  try {
    console.log('Calling OpenRouter...');

    const res = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://collegematch-ai.vercel.app',
          'X-Title': 'CollegeMatch-AI',
        },
        body: JSON.stringify({
          models: [
            'google/gemma-4-26b-a4b-it:free',
            'meta-llama/llama-3.3-70b-instruct:free',
            'nousresearch/hermes-3-llama-3.1-405b:free',
            'google/gemma-4-31b-it:free',
            'qwen/qwen3-coder:free',
            'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
            'liquid/lfm-2.5-1.2b-instruct:free',
            'poolside/laguna-xs.2:free'
          ],
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 3000,
          temperature: 0.7,
        }),
      }
    );

    const rawText = await res.text();
    console.log('OpenRouter status:', res.status);

    if (!res.ok) {
      console.error('OpenRouter error:', res.status, rawText);
      return NextResponse.json(
        { error: `OpenRouter ${res.status}: ${rawText}` },
        { status: 500 }
      );
    }

    const data = JSON.parse(rawText);
    const content: string = data?.choices?.[0]?.message?.content ?? '';

    if (!content) {
      console.error('Empty content from OpenRouter');
      return NextResponse.json(
        { error: 'AI returned empty response' },
        { status: 500 }
      );
    }

    console.log('AI content received, length:', content.length);

    // Strip markdown fences
    const cleaned = content
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    // Extract JSON object
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');

    if (start === -1 || end === -1) {
      console.error('No JSON found in:', cleaned.slice(0, 300));
      return NextResponse.json(
        { error: 'AI did not return valid JSON' },
        { status: 500 }
      );
    }

    const jsonStr = cleaned.slice(start, end + 1);
    const parsed = JSON.parse(jsonStr);

    console.log('Successfully parsed AI response');
    return NextResponse.json({ results: parsed });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('discover-stream crash:', msg);
    return NextResponse.json(
      { error: `Unexpected error: ${msg}` },
      { status: 500 }
    );
  }
}
