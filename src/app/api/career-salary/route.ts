import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, parseJSON } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { career, experienceLevel } = await req.json();

    const prompt = `You are a Career & Salary Data Expert for the Indian market.
    
User wants to know the salary and growth trajectory for: "${career}" at experience level: "${experienceLevel}".

Provide a realistic salary estimate in INR (Indian Rupees) along with career growth insights.
Provide the response strictly as a JSON object with this structure:
{
  "average_salary": "e.g. ₹8,00,000 / year",
  "salary_range": "e.g. ₹5L - ₹15L",
  "top_companies": ["Company A", "Company B"],
  "skills_required": ["Skill 1", "Skill 2"],
  "career_path": ["Entry level role", "Mid level role", "Senior role"],
  "market_demand": "High/Medium/Low with a 1 sentence explanation"
}

Ensure the response is ONLY valid JSON without markdown wrapping.`;

    const rawResponse = await callOpenRouter(
      'You are a precise data provider outputting JSON only.', 
      prompt,
      1500
    );
    
    const parsedData = parseJSON(rawResponse);
    return NextResponse.json(parsedData);
    
  } catch (error: any) {
    console.error('Error getting career salary:', error);
    return NextResponse.json({ error: error.message || 'Failed to get salary data' }, { status: 500 });
  }
}
