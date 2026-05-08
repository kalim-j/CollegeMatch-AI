import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const otp = generateOTP();

    // ── STORE OTP IN FIRESTORE ──
    // Store with an expiry of 10 minutes
    await setDoc(doc(db, 'otps', email), {
      code: otp,
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    // ── SEND EMAIL ──
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"AdmissionIQ Verification" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🛡️ ${otp} is your AdmissionIQ Verification Code`,
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:30px;border:1px solid #eee;border-radius:20px;text-align:center">
          <h2 style="color:#5b3ee8;margin-bottom:10px">AdmissionIQ</h2>
          <p style="color:#666">Verify your email to secure your account.</p>
          <div style="background:#f4f3ff;padding:20px;border-radius:15px;margin:25px 0">
            <span style="font-size:32px;font-weight:900;letter-spacing:10px;color:#5b3ee8">${otp}</span>
          </div>
          <p style="font-size:12px;color:#aaa">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("OTP Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

