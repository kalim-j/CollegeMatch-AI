import { NextResponse } from 'next/server';
import { groq } from '@/lib/groq';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { previousAnswers, step } = await req.json();

    const prompt = `You are a career guidance expert for Indian 12th-grade students.
      The student has answered ${step-1} questions so far:
      ${JSON.stringify(previousAnswers)}
      
      Generate Question ${step} of 10 to help determine if they should choose Science (Maths/Bio), Commerce, or Arts/Humanities.
      The question should be distinct from previous questions and highly relevant based on their last answer.
      
      Return ONLY a valid JSON object with this exact format, no markdown formatting:
      {
        "question": "The question text",
        "options": [
          { "id": "opt1", "label": "Option 1 text", "icon": "emoji" },
          { "id": "opt2", "label": "Option 2 text", "icon": "emoji" },
          { "id": "opt3", "label": "Option 3 text", "icon": "emoji" },
          { "id": "other", "label": "Other", "icon": "✍️" }
        ]
      }`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You output only valid JSON. Do not use markdown blocks." },
        { role: "user", content: prompt }
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "{}";
    
    // Strip any unexpected markdown fences just in case
    const cleaned = responseText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    const nextQuestion = JSON.parse(cleaned);
    return NextResponse.json({ nextQuestion });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
