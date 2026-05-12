import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { collegeName, collegeLocation, matchScore, userEmail } = await req.json();

    // ── EMAIL ──
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"CollegeMatch-AI" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🎓 You explored ${collegeName} — ${matchScore}% Match!`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:20px;border:1px solid #eee;border-radius:12px">
          <h2 style="color:#5b3ee8;text-align:center">CollegeMatch-AI</h2>
          <p>Hi there! You just viewed a college that matches your profile perfectly.</p>
          <div style="background:#f0eef9;border-radius:16px;padding:24px;margin:20px 0;text-align:center">
            <h3 style="color:#1a0f40;margin:0;font-size:1.5rem">${collegeName}</h3>
            <p style="color:#7a6d9a;margin:8px 0">${collegeLocation}</p>
            <div style="font-size:2rem;color:#5b3ee8;font-weight:900;margin:15px 0">${matchScore}% Match</div>
          </div>
          <p style="text-align:center">Log back in to view all your matched colleges and start your admission journey:</p>
          <div style="text-align:center;margin:30px 0">
            <a href="https://collegematch-ai.vercel.app/dashboard"
               style="background:#5b3ee8;color:#fff;padding:14px 30px;border-radius:10px;text-decoration:none;display:inline-block;font-weight:bold;box-shadow:0 4px 10px rgba(91,62,232,0.3)">
              View My Matches
            </a>
          </div>
          <hr style="border:none;border-top:1px solid #eee;margin:30px 0" />
          <p style="color:#aaa;font-size:12px;text-align:center">CollegeMatch-AI · Inspiring ambition since 2024</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Notification Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
