'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

const LoginBackground = dynamic(
  () => import('@/components/LoginBackground'),
  { ssr: false }
);

export default function VerifyOTPPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading } = useAuth();

  const [otp, setOtp] = useState(['','','','','','']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [mounted, setMounted] = useState(false);

  /* Refs for auto-focus between OTP inputs */
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = params.get('email') || '';
  const uid   = params.get('uid')   || '';

  useEffect(() => { setMounted(true); }, []);

  /* Countdown timer for resend cooldown */
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(
      () => setResendCooldown(c => c - 1), 1000
    );
    return () => clearTimeout(t);
  }, [resendCooldown]);

  if (!mounted || loading) return null;

  /* Handle OTP input — auto advance on each digit */
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; /* digits only */
    const next = [...otp];
    next[index] = value.slice(-1); /* only last char */
    setOtp(next);
    setError('');

    /* Auto advance to next input */
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    /* Auto submit when all 6 filled */
    if (value && index === 5) {
      const fullOtp = [...next].join('');
      if (fullOtp.length === 6) {
        setTimeout(() => handleVerify(fullOtp), 100);
      }
    }
  };

  /* Handle backspace — go back to previous input */
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /* Handle paste — fill all 6 boxes */
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
      setTimeout(() => handleVerify(pasted), 100);
    }
  };

  const handleVerify = async (otpValue?: string) => {
    const code = otpValue || otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, otp: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed.');
        /* Shake animation on error */
        setOtp(['','','','','','']);
        inputRefs.current[0]?.focus();
        return;
      }

      setSuccess(true);
      /* Wait 1.5 seconds then go to discover */
      setTimeout(() => router.push('/discover'), 1500);

    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendBusy(true);
    setError('');

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, email }),
      });

      if (res.ok) {
        setResendCooldown(60); /* 60 second cooldown */
        setOtp(['','','','','','']);
        inputRefs.current[0]?.focus();
      } else {
        setError('Could not resend OTP. Try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setResendBusy(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#05071a',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <LoginBackground />

      {/* OTP card — centered glass card */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: 440,
        margin: '0 auto',
        padding: '0 1rem',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(127,119,221,0.25)',
          borderRadius: 24,
          padding: 'clamp(2rem,5vw,3rem)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(127,119,221,0.10)',
          animation: 'fadeUp 0.5s ease forwards',
        }}>

          {success ? (
            /* ── Success state ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72,
                borderRadius: '50%',
                background: 'rgba(29,158,117,0.15)',
                border: '2px solid rgba(29,158,117,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                margin: '0 auto 20px',
                animation: 'pulse-ring 1s ease infinite',
              }}>
                ✅
              </div>
              <h2 style={{
                fontSize: 22, fontWeight: 700,
                color: '#5DCAA5', marginBottom: 8,
              }}>
                Email verified!
              </h2>
              <p style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.55)',
              }}>
                Redirecting you to CollegeMatch-AI...
              </p>
            </div>

          ) : (
            /* ── OTP input state ── */
            <>
              {/* Logo */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 28,
              }}>
                <div style={{
                  width: 40, height: 40,
                  borderRadius: 11,
                  background:
                    'linear-gradient(135deg,#7F77DD,#1D9E75)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                }}>
                  🎓
                </div>
                <span style={{
                  fontSize: 15, fontWeight: 600,
                  background:
                    'linear-gradient(90deg,#a89ef8,#5DCAA5)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: '#a89ef8',
                }}>
                  CollegeMatch-AI
                </span>
              </div>

              {/* Email icon */}
              <div style={{
                width: 64, height: 64,
                borderRadius: '50%',
                background: 'rgba(127,119,221,0.12)',
                border: '1px solid rgba(127,119,221,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
                margin: '0 0 20px',
              }}>
                📧
              </div>

              <h2 style={{
                fontSize: 22, fontWeight: 700,
                color: 'white', marginBottom: 6,
              }}>
                Check your email
              </h2>
              <p style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.6,
                marginBottom: 28,
              }}>
                We sent a 6-digit code to
                <br />
                <strong style={{
                  color: '#a89ef8',
                  fontSize: 15,
                }}>
                  {email || 'your email'}
                </strong>
              </p>

              {/* 6 OTP input boxes */}
              <div
                onPaste={handlePaste}
                style={{
                  display: 'flex',
                  gap: 10,
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e =>
                      handleOtpChange(i, e.target.value)
                    }
                    onKeyDown={e => handleKeyDown(i, e)}
                    autoFocus={i === 0}
                    style={{
                      width: 48, height: 56,
                      borderRadius: 12,
                      border: digit
                        ? '2px solid rgba(127,119,221,0.8)'
                        : '1px solid rgba(255,255,255,0.12)',
                      background: digit
                        ? 'rgba(127,119,221,0.12)'
                        : 'rgba(255,255,255,0.05)',
                      color: 'white',
                      fontSize: 22,
                      fontWeight: 700,
                      textAlign: 'center',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: digit
                        ? '0 0 12px rgba(127,119,221,0.25)'
                        : 'none',
                      caretColor: '#7F77DD',
                    }}
                  />
                ))}
              </div>

              {/* Error message */}
              {error && (
                <div style={{
                  background: 'rgba(226,75,74,0.10)',
                  border: '1px solid rgba(226,75,74,0.25)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  marginBottom: 16,
                  fontSize: 13,
                  color: '#F09595',
                  textAlign: 'center',
                  animation: 'fadeUp 0.3s ease',
                }}>
                  {error}
                </div>
              )}

              {/* Verify button */}
              <button
                onClick={() => handleVerify()}
                disabled={
                  busy || otp.join('').length !== 6
                }
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  border: 'none',
                  background:
                    otp.join('').length === 6 && !busy
                      ? 'linear-gradient(135deg,#7F77DD,#534AB7)'
                      : 'rgba(127,119,221,0.3)',
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor:
                    otp.join('').length === 6 && !busy
                      ? 'pointer'
                      : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow:
                    otp.join('').length === 6
                      ? '0 4px 20px rgba(127,119,221,0.35)'
                      : 'none',
                  transition: 'all 0.2s ease',
                  marginBottom: 16,
                }}
              >
                {busy ? (
                  <>
                    <div style={{
                      width: 16, height: 16,
                      borderRadius: '50%',
                      border:
                        '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    Verifying...
                  </>
                ) : 'Verify email →'}
              </button>

              {/* Resend OTP */}
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.45)',
                  marginBottom: 6,
                }}>
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResend}
                  disabled={
                    resendBusy || resendCooldown > 0
                  }
                  style={{
                    background: 'none',
                    border: 'none',
                    color:
                      resendCooldown > 0
                        ? 'rgba(255,255,255,0.3)'
                        : '#a89ef8',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor:
                      resendCooldown > 0
                        ? 'not-allowed'
                        : 'pointer',
                    padding: 0,
                  }}
                >
                  {resendBusy
                    ? 'Sending...'
                    : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend OTP'}
                </button>
              </div>

              {/* Info note */}
              <p style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.25)',
                textAlign: 'center',
                marginTop: 20,
              }}>
                Code expires in 10 minutes ·
                Check your spam folder
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(29,158,117,0.4); }
          70%  { box-shadow: 0 0 0 12px rgba(29,158,117,0); }
          100% { box-shadow: 0 0 0 0 rgba(29,158,117,0); }
        }
      `}</style>
    </div>
  );
}
