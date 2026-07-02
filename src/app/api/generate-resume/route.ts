import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { 
      fullName,
      email,
      phone,
      objective,
      education,
      experience,
      skills,
      projects
    } = await req.json();

    const prompt = `You are an expert ATS-friendly Resume Writer. Given the following student details, generate a professional resume.
    
Student Details:
Name: ${fullName}
Email: ${email}
Phone: ${phone}

Objective/Summary: ${objective}
Education: ${education}
Experience: ${experience}
Skills: ${skills}
Projects: ${projects}

Provide the response strictly as a JSON object with this structure:
{
  "personal_info": { "name": "...", "email": "...", "phone": "..." },
  "objective": "...",
  "education": [{ "institution": "...", "degree": "...", "duration": "...", "details": "..." }],
  "experience": [{ "company": "...", "role": "...", "duration": "...", "description": ["bullet1", "bullet2"] }],
  "projects": [{ "name": "...", "description": ["bullet1", "bullet2"] }],
  "skills": ["skill1", "skill2"]
}

Ensure the response is ONLY valid JSON without markdown wrapping.`;

    const rawResponse = await callOpenRouter(
      'You are a professional resume writer who only outputs JSON.', 
      prompt,
      2000
    );
    
    // Parse the JSON directly
    const parsedData = JSON.parse(rawResponse.replace(/```json/g, '').replace(/```/g, '').trim());
    return NextResponse.json(parsedData);
    
  } catch (error: any) {
    console.error('Error generating resume:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate resume' }, { status: 500 });
  }
}
