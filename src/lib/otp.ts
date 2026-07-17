import {
  doc, setDoc, getDoc, updateDoc,
  serverTimestamp, Timestamp,
} from 'firebase/firestore';
import {
  sendEmailVerification,
  type User,
} from 'firebase/auth';
import { db } from '@/lib/firebase';

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000)
    .toString();
}

export async function saveAndSendOTP(
  user: User
): Promise<string> {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  /* Save OTP to Firestore */
  await setDoc(doc(db, 'otp-verifications', user.uid), {
    otp,
    email: user.email,
    expiresAt: Timestamp.fromDate(expiresAt),
    verified: false,
    attempts: 0,
    createdAt: serverTimestamp(),
  });

  /* Send Firebase verification email (free, reliable) */
  try {
    await sendEmailVerification(user, {
      url: `${window.location.origin}/verify-otp` +
           `?uid=${user.uid}` +
           `&email=${encodeURIComponent(user.email||'')}`,
      handleCodeInApp: false,
    });
  } catch (e) {
    console.warn('Firebase email send failed:', e);
  }

  /* Always return OTP so page can show it on screen */
  return otp;
}

export async function verifyOTP(
  uid: string,
  enteredOtp: string
): Promise<{
  success: boolean;
  error?: string;
  attemptsLeft?: number;
}> {
  try {
    const ref  = doc(db, 'otp-verifications', uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return {
        success: false,
        error: 'OTP not found. Please request a new code.',
      };
    }

    const data = snap.data();

    /* Check max attempts */
    const attempts = data.attempts || 0;
    if (attempts >= 5) {
      return {
        success: false,
        error: 'Too many attempts. Click Resend OTP.',
      };
    }

    /* Check expiry */
    const expires = (data.expiresAt as Timestamp).toDate();
    if (new Date() > expires) {
      return {
        success: false,
        error: 'OTP expired. Click Resend OTP below.',
      };
    }

    /* Increment attempts */
    await updateDoc(ref, { attempts: attempts + 1 });

    /* Check match */
    if (data.otp !== enteredOtp.trim()) {
      const left = 5 - (attempts + 1);
      return {
        success: false,
        attemptsLeft: left,
        error: left > 0
          ? `Wrong code. ${left} attempt${left > 1 ? 's' : ''} left.`
          : 'No attempts left. Click Resend OTP.',
      };
    }

    /* ✅ OTP correct — mark verified */
    await updateDoc(ref, {
      verified: true,
      verifiedAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'users', uid), {
      emailVerified: true,
      verifiedAt: serverTimestamp(),
    });

    return { success: true };

  } catch (err) {
    console.error('verifyOTP error:', err);
    return {
      success: false,
      error: 'Verification failed. Please try again.',
    };
  }
}

export async function resendOTP(
  user: User
): Promise<string> {
  return saveAndSendOTP(user);
}
