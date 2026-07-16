import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

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
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
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

    /* Try EmailJS first */
    const serviceId  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_OTP_TEMPLATE_ID
                    || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    let emailSent = false;

    if (serviceId && templateId && publicKey) {
      try {
        const res = await fetch(
          'https://api.emailjs.com/api/v1.0/email/send',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service_id: serviceId,
              template_id: templateId,
              user_id: publicKey,
              accessToken: privateKey,
              template_params: {
                to_email: email,
                to_name: email.split('@')[0],
                otp_code: otp,
                message: `Your CollegeMatch-AI verification code is: ${otp}. Valid for 10 minutes.`,
              },
            }),
          }
        );
        if (res.ok) emailSent = true;
        else {
          const err = await res.text();
          console.error('EmailJS failed:', res.status, err);
        }
      } catch (e) {
        console.error('EmailJS exception:', e);
      }
    }

    return NextResponse.json({
      success: true,
      emailSent,
      otp, /* TEMPORARY: remove after email works */
      message: emailSent
        ? `Code sent to ${email}`
        : `Email failed — use code shown on screen`,
    });

  } catch (err) {
    console.error('send-otp error:', err);
    return NextResponse.json(
      { error: 'Failed to generate OTP' },
      { status: 500 }
    );
  }
}
