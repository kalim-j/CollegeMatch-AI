import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, parseJSON } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { targetExam, currentPrep, studyHours, daysLeft, subjects } = await req.json();

    const prompt = `You are an expert AI Study Planner. Create a study plan for a student preparing for an exam.
    
Student details:
- Target Exam: ${targetExam}
- Current Prep Level: ${currentPrep} (e.g. Beginner, Intermediate, Advanced)
- Daily Study Hours: ${studyHours}
- Days Left: ${daysLeft}
- Subjects/Topics to Cover: ${subjects.join(', ')}

Provide the response strictly as a JSON object with this structure:
{
  "summary": "Brief 2-sentence encouraging summary of the strategy",
  "daily_schedule": [
    { "time": "08:00 AM - 10:00 AM", "task": "Task description" }
  ],
  "weekly_goals": [
    "Goal 1", "Goal 2"
  ],
  "tips": [
    "Tip 1", "Tip 2"
  ]
}

Ensure the response is ONLY valid JSON without markdown wrapping.`;

    const rawResponse = await callOpenRouter(
      'You are a precise study planner generating structured JSON.', 
      prompt,
      1500
    );
    
    const parsedData = parseJSON(rawResponse);
    return NextResponse.json(parsedData);
    
  } catch (error: any) {
    console.error('Error generating study plan:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate study plan' }, { status: 500 });
  }
}
