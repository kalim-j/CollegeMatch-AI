import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  doc, setDoc, serverTimestamp, Timestamp
} from 'firebase/firestore';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { uid, email } = await req.json();

    if (!uid || !email) {
      return NextResponse.json(
        { error: 'Missing uid or email' },
        { status: 400 }
      );
    }

    /* Generate 6-digit OTP */
    const otp = Math.floor(100000 + Math.random() * 900000)
      .toString();

    /* Expiry: 10 minutes from now */
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    /* Save OTP to Firestore */
    await setDoc(doc(db, 'otp-verifications', uid), {
      otp,
      email,
      expiresAt: Timestamp.fromDate(expiresAt),
      verified: false,
      attempts: 0,
      createdAt: serverTimestamp(),
    });

    /* Send OTP via Nodemailer */
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"CollegeMatch-AI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your 6-digit OTP for CollegeMatch-AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fafafa;">
          <h2 style="color: #534ab7; text-align: center;">Welcome to CollegeMatch-AI!</h2>
          <p style="color: #333; font-size: 16px;">Hi there,</p>
          <p style="color: #333; font-size: 16px;">Here is your 6-digit verification code to access your dashboard:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1d9e75; background: #eef8f4; border-radius: 8px; border: 1px solid #c2eadd;">
              ${otp}
            </span>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center;">This code will expire in 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">CollegeMatch-AI</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailErr) {
      console.error('Nodemailer OTP send error:', emailErr);
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to ' + email,
      /* Return OTP in dev mode only for testing */
      ...(process.env.NODE_ENV === 'development'
        ? { dev_otp: otp }
        : {}),
    });

  } catch (err) {
    console.error('send-otp error:', err);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
