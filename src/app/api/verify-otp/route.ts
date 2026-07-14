import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  doc, getDoc, updateDoc, serverTimestamp,
  Timestamp
} from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { uid, otp } = await req.json();

    if (!uid || !otp) {
      return NextResponse.json(
        { error: 'Missing uid or otp' },
        { status: 400 }
      );
    }

    /* Fetch OTP record */
    const otpRef = doc(db, 'otp-verifications', uid);
    const otpSnap = await getDoc(otpRef);

    if (!otpSnap.exists()) {
      return NextResponse.json(
        { error: 'OTP not found. Please request a new one.' },
        { status: 404 }
      );
    }

    const data = otpSnap.data();

    /* Check max attempts (5) */
    if (data.attempts >= 5) {
      return NextResponse.json(
        { error: 'Too many attempts. Please request a new OTP.' },
        { status: 429 }
      );
    }

    /* Check expiry */
    const expiresAt = (data.expiresAt as Timestamp).toDate();
    if (new Date() > expiresAt) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    /* Increment attempts */
    await updateDoc(otpRef, {
      attempts: data.attempts + 1,
    });

    /* Check OTP match */
    if (data.otp !== otp.trim()) {
      return NextResponse.json(
        {
          error: 'Incorrect OTP. Please try again.',
          attemptsLeft: 5 - (data.attempts + 1),
        },
        { status: 400 }
      );
    }

    /* Mark as verified in otp-verifications */
    await updateDoc(otpRef, {
      verified: true,
      verifiedAt: serverTimestamp(),
    });

    /* Mark user as verified in users collection */
    await updateDoc(doc(db, 'users', uid), {
      emailVerified: true,
      verifiedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
    });

  } catch (err) {
    console.error('verify-otp error:', err);
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
