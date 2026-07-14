import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  doc, setDoc, serverTimestamp, Timestamp
} from 'firebase/firestore';

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

    /* Send OTP via EmailJS REST API */
    const emailjsPayload = {
      service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_OTP_TEMPLATE_ID,
      user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        to_email: email,
        otp_code: otp,
        expires_in: '10 minutes',
        app_name: 'CollegeMatch-AI',
      },
    };

    const emailRes = await fetch(
      'https://api.emailjs.com/api/v1.0/email/send',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailjsPayload),
      }
    );

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error('EmailJS OTP send error:', errText);
      /* Still return success — OTP is saved.
         User can request resend. */
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
