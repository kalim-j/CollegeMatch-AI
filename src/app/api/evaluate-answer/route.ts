import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const { 
      question,
      answer,
    } = await req.json();

    const prompt = `You are an expert admissions interviewer evaluating a candidate's response.
    
Question asked: "${question}"
Candidate's Answer: "${answer}"

Evaluate the answer. Provide your response strictly as a JSON object with this structure:
{
  "score": 8, // out of 10
  "feedback": "Detailed feedback on what was good and what was bad.",
  "ideal_points": ["Point 1 they missed", "Point 2 they should have mentioned"]
}

Ensure the response is ONLY valid JSON without markdown wrapping.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a precise evaluator who only outputs JSON. DO NOT wrap with markdown, just return the raw JSON braces.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 1500,
    });
    
    let rawResponse = chatCompletion.choices[0]?.message?.content || "{}";
    rawResponse = rawResponse.replace(/```json\n?/gi,'').replace(/```\n?/gi,'').trim();
    const start = rawResponse.search(/[\[{]/);
    const end = Math.max(rawResponse.lastIndexOf('}'), rawResponse.lastIndexOf(']'));
    let parsedData = { score: 5, feedback: "Unable to parse feedback properly, but keep practicing!", ideal_points: [] };
    if (start !== -1 && end !== -1) {
      try {
        parsedData = JSON.parse(rawResponse.slice(start, end+1));
      } catch (e) {
        console.error("JSON parse error", e, rawResponse);
      }
    }

    return NextResponse.json(parsedData);
    
  } catch (error: any) {
    console.error('Error evaluating answer:', error);
    return NextResponse.json({ error: error.message || 'Failed to evaluate answer' }, { status: 500 });
  }
}
