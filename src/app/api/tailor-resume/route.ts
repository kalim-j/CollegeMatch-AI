import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, parseJSON } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription, jobTitle, company } = await req.json();

    const systemPrompt = `You are an expert resume writer specializing in tailoring resumes for specific job roles. You know exactly how to match a resume to job requirements while keeping it authentic and ATS-optimized.`;

    const userMessage = `Tailor this resume specifically for the job description below.

CANDIDATE RESUME:
${resumeText}

JOB TITLE: ${jobTitle || 'Not specified'}
COMPANY: ${company || 'Not specified'}

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON:
{
  "job_title": "${jobTitle || 'Unknown'}",
  "company": "${company || 'Unknown'}",
  "match_score_before": number (0-100, original resume match),
  "match_score_after": number (0-100, tailored resume match),
  "key_requirements": string[] (main requirements from JD),
  "matched_requirements": string[] (requirements candidate meets),
  "gap_requirements": string[] (requirements candidate may lack),
  "changes_made": string[] (list of specific changes made),
  "keywords_added": string[] (job-specific keywords inserted),
  "tailored_resume": "Complete tailored resume text optimized for this specific job. Include all relevant keywords from JD. Reframe experiences to match role requirements. Keep authentic.",
  "cover_letter_points": string[] (5 key points to mention in cover letter),
  "interview_prep": string[] (3 likely interview questions based on JD),
  "application_tips": string (2 sentences of advice for applying to this role)
}`;

    const raw = await callOpenRouter(systemPrompt, userMessage, 4000);
    const result = parseJSON(raw);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error tailoring resume:', error);
    return NextResponse.json({ error: error.message || 'Failed to tailor resume' }, { status: 500 });
  }
}
