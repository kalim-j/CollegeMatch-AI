import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@/lib/groq';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
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

  const rawAnswersStr = Array.isArray(answers) 
    ? answers.map((a: any) => `Q: ${a.q}\nA: ${a.a}`).join('\n\n')
    : 'No explicit answers provided.';

  const prompt = `You are an Indian education counsellor helping a student
named ${studentName} choose what to study after 12th grade.

Here is what they answered to our quiz:
${rawAnswersStr}

Their explicit stream interests (based on predefined options they picked):
${freqStr || 'None explicit'}

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
    console.log('Calling Groq API...');

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You output only valid JSON. Do not use markdown blocks." },
        { role: "user", content: prompt }
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0]?.message?.content || "{}";

    // Strip markdown fences
    const cleaned = content
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    const parsed = JSON.parse(cleaned);

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
