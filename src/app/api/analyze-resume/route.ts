import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, parseJSON } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription } = await req.json();

    const systemPrompt = `You are an expert resume reviewer and ATS optimization specialist with 10+ years experience reviewing resumes for top Indian and global companies. You identify specific issues and provide actionable fixes.`;

    const userMessage = `Analyze this resume text and provide a detailed improvement report:

RESUME:
${resumeText}

${jobDescription ? `JOB DESCRIPTION (optimize resume for this role):\n${jobDescription}` : ''}

Return ONLY valid JSON:
{
  "overall_score": number (0-100),
  "ats_score": number (0-100, ATS compatibility),
  "grade": "A"|"B"|"C"|"D"|"F",
  "summary": "2 sentence overall assessment",
  "sections_found": string[] (sections detected in resume),
  "sections_missing": string[] (important missing sections),
  "issues": [
    {
      "severity": "critical"|"warning"|"suggestion",
      "category": "Grammar"|"Formatting"|"Content"|"ATS"|"Keywords"|"Quantification",
      "issue": "specific problem found",
      "fix": "exact fix or rewrite suggestion",
      "example": "example of improved text"
    }
  ],
  "strengths": string[] (what is already good),
  "keywords_found": string[] (good keywords present),
  "keywords_missing": string[] (important keywords to add),
  "ats_tips": string[] (specific ATS optimization tips),
  "improved_resume": "Complete rewritten resume text with all fixes applied. Professional, ATS-friendly, well-structured.",
  "job_match_score": number or null (0-100, only if job desc provided),
  "job_match_notes": string or null (how well resume matches job)
}`;

    const raw = await callOpenRouter(systemPrompt, userMessage, 4000);
    const result = parseJSON(raw);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error analyzing resume:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze resume' }, { status: 500 });
  }
}
