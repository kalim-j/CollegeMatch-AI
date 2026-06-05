import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { supabase } from '@/lib/supabase';
import { collegesDatabase } from '@/data/collegesDatabase';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy_key',
});

export async function POST(request: NextRequest) {
  try {
    const { marks, state, category } = await request.json();

    if (marks === undefined || !state || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call Groq safely (if API key is missing, skip or catch error)
    if (process.env.GROQ_API_KEY) {
      try {
        await groq.chat.completions.create({
          model: 'llama3-8b-8192',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `Based on these details:
- 12th Marks: ${marks}%
- State: ${state}
- Category: ${category}

Suggest top 5 colleges that match this profile. Return as JSON with array of colleges.`,
            },
          ],
        });
      } catch (groqErr) {
        console.error('Groq API call error, continuing with DB lookup:', groqErr);
      }
    }

    // Query Supabase for colleges
    let colleges: any[] = [];
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .eq('state', state)
        .lte('cutoff_general', marks)
        .order('nirf_rank', { ascending: true })
        .limit(8);

      if (!error && data && data.length > 0) {
        colleges = data;
      }
    } catch (dbErr) {
      console.error('Supabase query error, continuing with local fallback:', dbErr);
    }

    // Fallback to local mock database if no colleges found in DB
    if (colleges.length === 0) {
      colleges = (collegesDatabase || [])
        .filter((c: any) => c.state === state && c.cutoff_general <= marks)
        .sort((a: any, b: any) => (a.nirf_rank || 999) - (b.nirf_rank || 999))
        .slice(0, 8);
    }

    return NextResponse.json({ colleges });
  } catch (error) {
    console.error('Prediction route error:', error);
    return NextResponse.json(
      { error: 'Prediction failed' },
      { status: 500 }
    );
  }
}
