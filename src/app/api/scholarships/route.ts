import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { stream, category, level, state, search } = await req.json();

    const prompt = `You are an expert on Indian education scholarships.
    
Return a JSON array of REAL, CURRENTLY ACTIVE scholarships in India for:
- Stream: ${stream || 'All'}
- Category: ${category || 'All'}  
- Level: ${level || 'All'}
- State: ${state || 'All India'}
- Search: ${search || 'latest scholarships'}

Return ONLY a valid JSON array with exactly 12 scholarships.
Each scholarship must have these EXACT fields with REAL data:
[
  {
    "id": 1,
    "name": "exact official scholarship name",
    "provider": "exact government department or organization name",
    "amount_per_year": 75000,
    "stream": "Engineering or Medical or All etc",
    "category": "General or OBC or SC or ST or Minority or All",
    "level": "12th Pass or Undergraduate or Postgraduate or All",
    "state": "state name or All India",
    "deadline": "Month Year format like August 2026",
    "eligibility": "specific eligibility criteria in 1-2 lines",
    "description": "what the scholarship is for in 2-3 lines",
    "apply_link": "https://scholarships.gov.in or official website",
    "status": "Open or Closing Soon or Check Website",
    "tags": ["Government", "Merit-based"] 
  }
]

IMPORTANT RULES:
1. Only include REAL scholarships that actually exist in India
2. Include mix of Central Government + State Government + Private
3. Include scholarships from: NSP portal, AICTE, UGC, state governments, PSUs, private companies
4. Amount must be realistic Indian scholarship amounts in rupees
5. Prioritize scholarships relevant to the filters given
6. Include latest 2025-2026 scholarships
7. Return ONLY the JSON array, no other text
8. Make sure apply_link is a real URL`;

    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: 'You are a scholarship expert. Return only valid JSON arrays with real Indian scholarship data. No markdown, no explanation, just the JSON array.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content || '[]';
    
    // Clean the response
    const cleaned = content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let scholarships = [];
    try {
      scholarships = JSON.parse(cleaned);
    } catch {
      // Try to extract JSON array
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) {
        scholarships = JSON.parse(match[0]);
      }
    }

    return NextResponse.json({
      success: true,
      scholarships,
      generated_at: new Date().toISOString(),
      filters: { stream, category, level, state, search }
    });

  } catch (err) {
    console.error('Scholarship API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch scholarships' },
      { status: 500 }
    );
  }
}
