import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, parseJSON } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { college, branch } = await req.json();

    const prompt = `You are an expert on Indian College Engineering Admissions and Cutoff Trends (TNEA/JEE etc).
    
User wants to know the cutoff trend for:
College: "${college}"
Branch: "${branch}"

Provide simulated but realistic cutoff data for the last 5 years.
Provide the response strictly as a JSON object with this structure:
{
  "years": [2019, 2020, 2021, 2022, 2023],
  "cutoffs": [185, 187, 186, 189, 191],
  "trend_analysis": "Brief analysis of why the cutoff is increasing/decreasing and competitiveness."
}

Ensure the response is ONLY valid JSON without markdown wrapping.`;

    const rawResponse = await callOpenRouter(
      'You are a data provider outputting JSON only.', 
      prompt,
      1500
    );
    
    const parsedData = parseJSON(rawResponse);
    return NextResponse.json(parsedData);
    
  } catch (error: any) {
    console.error('Error getting cutoff history:', error);
    return NextResponse.json({ error: error.message || 'Failed to get cutoff data' }, { status: 500 });
  }
}
