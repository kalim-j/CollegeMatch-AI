'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

const LoginBackground = dynamic(
  () => import('@/components/LoginBackground'),
  { ssr: false }
);

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (profile?.isVerified) {
        router.push('/dashboard');
      }
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timeLeft]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (!value) {
      const newCode = [...code];
      newCode[index] = '';
      setCode(newCode);
      return;
    }
    const newCode = [...code];
    newCode[index] = value[value.length - 1];
    setCode(newCode);
    if (index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const entered = code.join('');
    if (entered.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const docRef = doc(db, 'users', user.uid);
      const snap = await getDoc(docRef);
      const data = snap.data();
      if (!data?.otp) {
        setError('No OTP found. Please request a new one.');
        setBusy(false);
        return;
      }
      
      const { code: savedCode, expiresAt } = data.otp;
      if (Date.now() > expiresAt) {
        setError('OTP has expired. Please request a new one.');
      } else if (savedCode === entered) {
        await updateDoc(docRef, { isVerified: true, otp: null });
        await refreshProfile();
        router.push('/dashboard');
      } else {
        setError('Incorrect OTP. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify OTP. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (!user || resendBusy || timeLeft > 0) return;
    setResendBusy(true);
    setError('');
    try {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        otp: {
          code: newCode,
          expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
        }
      });
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, otp: newCode })
      });
      setTimeLeft(60);
    } catch (err) {
      setError('Failed to resend OTP. Try again.');
    } finally {
      setResendBusy(false);
    }
  };

  if (!mounted || loading || !user) return null;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <LoginBackground />

      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: 420,
        padding: '2.5rem',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 24,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        margin: '1.5rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 1.5rem',
            background: 'linear-gradient(135deg,#7F77DD,#1D9E75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, boxShadow: '0 8px 24px rgba(127,119,221,0.4)',
          }}>✉️</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 8 }}>
            Verify your email
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
            We've sent a 6-digit code to <br/>
            <strong style={{ color: 'white' }}>{user.email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerify}>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
            {code.map((c, i) => (
              <input
                key={i}
                ref={el => { inputs.current[i] = el; }}
                type="text"
                value={c}
                maxLength={1}
                onChange={e => handleChange(e, i)}
                onKeyDown={e => handleKeyDown(e, i)}
                style={{
                  width: 45, height: 55,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white', fontSize: 24,
                  fontWeight: 600, textAlign: 'center',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                }}
              />
            ))}
          </div>

          {error && (
            <div style={{
              background: 'rgba(226,75,74,0.1)',
              border: '1px solid rgba(226,75,74,0.3)',
              borderRadius: 12, padding: '12px',
              marginBottom: 20, fontSize: 13,
              color: '#ff8a8a', textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={busy} style={{
            width: '100%', padding: '16px', borderRadius: 14,
            border: 'none',
            background: busy ? 'rgba(127,119,221,0.5)' : 'linear-gradient(135deg,#7F77DD,#534AB7)',
            color: 'white', fontSize: 16, fontWeight: 600,
            cursor: busy ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 20px rgba(127,119,221,0.4)',
          }}>
            {busy ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 24 }}>
          Didn't receive the code?{' '}
          <button onClick={handleResend} disabled={resendBusy || timeLeft > 0} style={{
            background: 'none', border: 'none',
            color: (resendBusy || timeLeft > 0) ? 'rgba(255,255,255,0.4)' : '#a89ef8',
            fontWeight: 600, cursor: (resendBusy || timeLeft > 0) ? 'not-allowed' : 'pointer',
            textDecoration: (resendBusy || timeLeft > 0) ? 'none' : 'underline'
          }}>
            {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend OTP'}
          </button>
        </p>
      </div>
    </div>
  );
}
