'use client';
import {
  useState, useEffect, useRef, Suspense
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { db } from '@/lib/firebase';
import {
  doc, setDoc, getDoc,
  serverTimestamp, Timestamp
} from 'firebase/firestore';

const LoginBackground = dynamic(
  () => import('@/components/LoginBackground'),
  { ssr: false }
);

/* ── Wrap in Suspense because useSearchParams
   needs it in Next.js 14 App Router ── */
export default function VerifyOTPPageWrapper() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight:'100vh',
        background:'#05071a',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
      }}>
        <div style={{
          width:40,height:40,borderRadius:'50%',
          border:'3px solid rgba(127,119,221,0.2)',
          borderTop:'3px solid #7F77DD',
          animation:'spin 0.8s linear infinite',
        }}/>
      </div>
    }>
      <VerifyOTPPage />
    </Suspense>
  );
}

function VerifyOTPPage() {
  const router = useRouter();
  const params = useSearchParams();

  const email = params.get('email') || '';
  const uid   = params.get('uid')   || '';

  const [otp,           setOtp]           = useState(['','','','','','']);
  const [error,         setError]         = useState('');
  const [success,       setSuccess]       = useState(false);
  const [busy,          setBusy]          = useState(false);
  const [resendBusy,    setResendBusy]    = useState(false);
  const [resendTimer,   setResendTimer]   = useState(0);
  const [fallbackCode,  setFallbackCode]  = useState('');
  const [emailSent,     setEmailSent]     = useState(true);
  const [mounted,       setMounted]       = useState(false);
  const [verifyAuto,    setVerifyAuto]    = useState(false);

  const inputRefs = useRef<(HTMLInputElement|null)[]>([]);

  useEffect(() => { setMounted(true); }, []);

  /* Read fallback OTP from sessionStorage */
  useEffect(() => {
    if (!uid) return;
    const stored = sessionStorage.getItem(`otp_${uid}`);
    if (stored) {
      setFallbackCode(stored);
      /* Check if email actually sent */
      const sent = sessionStorage.getItem(`otpSent_${uid}`);
      if (sent === 'false') setEmailSent(false);
    }
  }, [uid]);

  /* Resend countdown */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(n=>n-1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  /* Auto-verify when all 6 digits filled */
  useEffect(() => {
    const code = otp.join('');
    if (code.length === 6 && !busy && !verifyAuto) {
      setVerifyAuto(true);
      setTimeout(() => handleVerify(code), 300);
    }
  }, [otp]);

  if (!mounted) return null;

  /* ── OTP input handlers ── */
  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    setError('');
    setVerifyAuto(false);
    if (val && i < 5) {
      inputRefs.current[i+1]?.focus();
    }
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      const next = [...otp];
      next[i-1] = '';
      setOtp(next);
      inputRefs.current[i-1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData
      .getData('text')
      .replace(/\D/g,'')
      .slice(0,6);
    if (digits.length === 6) {
      setOtp(digits.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  /* ── Verify OTP ── */
  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join('');
    if (otpCode.length !== 6) {
      setError('Enter all 6 digits.'); return;
    }
    if (busy) return;
    setBusy(true);
    setError('');

    try {
      /* Check against Firestore */
      const otpSnap = await getDoc(
        doc(db,'otp-verifications',uid)
      );

      if (!otpSnap.exists()) {
        /* OTP doc not found — check sessionStorage fallback */
        const stored = sessionStorage.getItem(`otp_${uid}`);
        if (stored && stored === otpCode) {
          await markVerified();
          return;
        }
        setError('OTP expired. Please request a new one.');
        resetBoxes(); return;
      }

      const data = otpSnap.data();

      /* Check attempts */
      if ((data.attempts || 0) >= 5) {
        setError('Too many attempts. Request a new OTP.');
        resetBoxes(); return;
      }

      /* Check expiry */
      const expires = (data.expiresAt as Timestamp).toDate();
      if (new Date() > expires) {
        setError('OTP expired. Click "Resend OTP" below.');
        resetBoxes(); return;
      }

      /* Increment attempts */
      await setDoc(
        doc(db,'otp-verifications',uid),
        { attempts: (data.attempts||0)+1 },
        { merge: true }
      );

      /* Check OTP match */
      if (data.otp !== otpCode) {
        const left = 5 - ((data.attempts||0)+1);
        setError(
          left > 0
            ? `Incorrect code. ${left} attempt${left>1?'s':''} left.`
            : 'Too many attempts. Request a new OTP.'
        );
        resetBoxes(); return;
      }

      await markVerified();

    } catch (err) {
      console.error('verify error:', err);
      /* Fallback: check sessionStorage */
      const stored = sessionStorage.getItem(`otp_${uid}`);
      if (stored && stored === otpCode) {
        await markVerified();
      } else {
        setError('Verification failed. Please try again.');
        resetBoxes();
      }
    } finally {
      setBusy(false);
      setVerifyAuto(false);
    }
  };

  const markVerified = async () => {
    try {
      await setDoc(
        doc(db,'users',uid),
        { emailVerified: true, verifiedAt: serverTimestamp() },
        { merge: true }
      );
      await setDoc(
        doc(db,'otp-verifications',uid),
        { verified: true },
        { merge: true }
      );
    } catch (e) {
      console.error('markVerified error:', e);
    }
    /* Clear sessionStorage */
    sessionStorage.removeItem(`otp_${uid}`);
    sessionStorage.removeItem(`otpSent_${uid}`);
    setSuccess(true);
    setTimeout(() => router.push('/discover'), 1800);
  };

  const resetBoxes = () => {
    setOtp(['','','','','','']);
    setVerifyAuto(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  /* ── Resend OTP ── */
  const handleResend = async () => {
    if (resendTimer > 0 || resendBusy) return;
    setResendBusy(true);
    setError('');
    setOtp(['','','','','','']);
    setVerifyAuto(false);

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, email }),
      });
      const data = await res.json();

      if (data.otp) {
        sessionStorage.setItem(`otp_${uid}`, data.otp);
        setFallbackCode(data.otp);
      }
      if (data.emailSent) {
        setEmailSent(true);
        setFallbackCode('');
      } else {
        setEmailSent(false);
      }
      setResendTimer(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setError('Could not resend. Please try again.');
    } finally {
      setResendBusy(false);
    }
  };

  /* ── Styles ── */
  const boxStyle = (i: number): React.CSSProperties => ({
    width: 48, height: 56,
    borderRadius: 12,
    border: otp[i]
      ? '2px solid rgba(127,119,221,0.9)'
      : '1px solid rgba(255,255,255,0.14)',
    background: otp[i]
      ? 'rgba(127,119,221,0.14)'
      : 'rgba(255,255,255,0.05)',
    color: 'white',
    fontSize: 24, fontWeight: 700,
    textAlign: 'center',
    outline: 'none',
    transition: 'all 0.18s ease',
    boxShadow: otp[i]
      ? '0 0 14px rgba(127,119,221,0.28)'
      : 'none',
    caretColor: '#7F77DD',
    fontFamily: 'monospace',
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#05071a',
      position: 'relative',
      overflow: 'hidden',
      padding: '1rem',
    }}>
      <LoginBackground />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 420,
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(127,119,221,0.22)',
          borderRadius: 24,
          padding: 'clamp(2rem,5vw,2.8rem)',
          boxShadow:
            '0 20px 60px rgba(0,0,0,0.5),' +
            '0 0 40px rgba(127,119,221,0.08)',
          animation: 'fadeUp 0.45s ease forwards',
        }}>

          {success ? (
            /* ── Success screen ── */
            <div style={{ textAlign:'center', padding:'1rem 0' }}>
              <div style={{
                width:72,height:72,borderRadius:'50%',
                background:'rgba(29,158,117,0.15)',
                border:'2px solid rgba(29,158,117,0.45)',
                display:'flex',alignItems:'center',
                justifyContent:'center',fontSize:36,
                margin:'0 auto 20px',
                animation:'pulse-ring 1.2s ease infinite',
              }}>✅</div>
              <h2 style={{
                fontSize:22,fontWeight:700,
                color:'#5DCAA5',marginBottom:8,
              }}>
                Email verified!
              </h2>
              <p style={{
                fontSize:14,
                color:'rgba(255,255,255,0.55)',
              }}>
                Taking you to CollegeMatch-AI...
              </p>
              <div style={{
                marginTop:16,
                width:40,height:4,
                borderRadius:2,
                background:'rgba(29,158,117,0.3)',
                margin:'16px auto 0',
                overflow:'hidden',
              }}>
                <div style={{
                  height:'100%',
                  background:'#1D9E75',
                  animation:'loadBar 1.8s linear forwards',
                }}/>
              </div>
            </div>

          ) : (
            <>
              {/* Logo row */}
              <div style={{
                display:'flex',alignItems:'center',
                gap:10,marginBottom:24,
              }}>
                <div style={{
                  width:36,height:36,borderRadius:10,
                  background:
                    'linear-gradient(135deg,#7F77DD,#1D9E75)',
                  display:'flex',alignItems:'center',
                  justifyContent:'center',fontSize:18,
                }}>🎓</div>
                <span style={{
                  fontSize:15,fontWeight:600,
                  background:
                    'linear-gradient(90deg,#a89ef8,#5DCAA5)',
                  WebkitBackgroundClip:'text',
                  WebkitTextFillColor:'transparent',
                  backgroundClip:'text',color:'#a89ef8',
                }}>CollegeMatch-AI</span>
              </div>

              {/* Email icon */}
              <div style={{
                width:60,height:60,borderRadius:'50%',
                background:'rgba(127,119,221,0.12)',
                border:'1px solid rgba(127,119,221,0.25)',
                display:'flex',alignItems:'center',
                justifyContent:'center',fontSize:28,
                marginBottom:18,
              }}>📧</div>

              <h2 style={{
                fontSize:22,fontWeight:700,
                color:'white',marginBottom:6,
              }}>
                Check your email
              </h2>

              <p style={{
                fontSize:14,
                color:'rgba(255,255,255,0.55)',
                lineHeight:1.6, marginBottom:8,
              }}>
                We sent a 6-digit code to
              </p>
              <p style={{
                fontSize:15,fontWeight:600,
                color:'#a89ef8',marginBottom:20,
                wordBreak:'break-all',
              }}>
                {email}
              </p>

              {/* ── FALLBACK: show code on screen ── */}
              {fallbackCode && !emailSent && (
                <div style={{
                  background:'rgba(186,117,23,0.12)',
                  border:'1px solid rgba(186,117,23,0.30)',
                  borderRadius:12,
                  padding:'12px 16px',
                  marginBottom:16,
                  fontSize:13,
                  color:'#FAC775',
                  textAlign:'center',
                }}>
                  <p style={{
                    margin:'0 0 6px',
                    color:'rgba(255,255,255,0.7)',
                    fontSize:12,
                  }}>
                    ⚠️ Email delivery failed.
                    Use this code instead:
                  </p>
                  <div style={{
                    fontSize:28,fontWeight:700,
                    letterSpacing:'0.25em',
                    color:'#FAC775',
                    fontFamily:'monospace',
                  }}>
                    {fallbackCode}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(fallbackCode);
                      setOtp(fallbackCode.split(''));
                    }}
                    style={{
                      marginTop:8,fontSize:11,
                      background:'rgba(186,117,23,0.15)',
                      border:'1px solid rgba(186,117,23,0.30)',
                      borderRadius:6,
                      padding:'4px 12px',
                      color:'#FAC775',cursor:'pointer',
                    }}
                  >
                    Copy & fill code
                  </button>
                </div>
              )}

              {/* ── Sent notice ── */}
              {emailSent && !fallbackCode && (
                <div style={{
                  background:'rgba(29,158,117,0.08)',
                  border:'1px solid rgba(29,158,117,0.20)',
                  borderRadius:10,
                  padding:'8px 14px',
                  marginBottom:16,
                  fontSize:12,
                  color:'#5DCAA5',
                  display:'flex',gap:6,alignItems:'center',
                }}>
                  ✉️ Code sent! Check your inbox + spam folder
                </div>
              )}

              {/* ── 6 OTP boxes ── */}
              <div
                onPaste={handlePaste}
                style={{
                  display:'flex',gap:8,
                  justifyContent:'center',
                  marginBottom:20,
                }}
              >
                {otp.map((digit,i) => (
                  <input
                    key={i}
                    ref={el=>{ inputRefs.current[i]=el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e=>handleChange(i,e.target.value)}
                    onKeyDown={e=>handleKey(i,e)}
                    autoFocus={i===0}
                    disabled={busy}
                    style={boxStyle(i)}
                  />
                ))}
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background:'rgba(226,75,74,0.10)',
                  border:'1px solid rgba(226,75,74,0.28)',
                  borderRadius:10,
                  padding:'9px 14px',
                  marginBottom:14,
                  fontSize:13,
                  color:'#F09595',
                  textAlign:'center',
                  animation:'fadeUp 0.25s ease',
                }}>
                  {error}
                </div>
              )}

              {/* Verify button */}
              <button
                onClick={()=>handleVerify()}
                disabled={busy||otp.join('').length!==6}
                style={{
                  width:'100%', padding:'13px',
                  borderRadius:12, border:'none',
                  background: busy
                    ? 'rgba(127,119,221,0.35)'
                    : otp.join('').length===6
                    ? 'linear-gradient(135deg,#7F77DD,#534AB7)'
                    : 'rgba(127,119,221,0.2)',
                  color:'white', fontSize:15,
                  fontWeight:600,
                  cursor: busy||otp.join('').length!==6
                    ? 'not-allowed' : 'pointer',
                  display:'flex',alignItems:'center',
                  justifyContent:'center',gap:8,
                  boxShadow: otp.join('').length===6&&!busy
                    ? '0 4px 20px rgba(127,119,221,0.35)'
                    : 'none',
                  transition:'all 0.2s ease',
                  marginBottom:14,
                }}
              >
                {busy ? (
                  <>
                    <div style={{
                      width:16,height:16,
                      borderRadius:'50%',
                      border:'2px solid rgba(255,255,255,0.3)',
                      borderTop:'2px solid white',
                      animation:'spin 0.8s linear infinite',
                    }}/>
                    Verifying...
                  </>
                ) : 'Verify email →'}
              </button>

              {/* Resend */}
              <div style={{textAlign:'center'}}>
                <p style={{
                  fontSize:13,
                  color:'rgba(255,255,255,0.4)',
                  marginBottom:5,
                }}>
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResend}
                  disabled={resendBusy||resendTimer>0}
                  style={{
                    background:'none',border:'none',
                    color: resendTimer>0
                      ? 'rgba(255,255,255,0.28)'
                      : '#a89ef8',
                    fontSize:13,fontWeight:500,
                    cursor: resendTimer>0
                      ? 'default' : 'pointer',
                    padding:0,
                  }}
                >
                  {resendBusy ? 'Sending...'
                    : resendTimer>0
                    ? `Resend in ${resendTimer}s`
                    : 'Resend OTP'}
                </button>
              </div>

              {/* Footer note */}
              <p style={{
                fontSize:11,
                color:'rgba(255,255,255,0.22)',
                textAlign:'center',
                marginTop:18,lineHeight:1.6,
              }}>
                Code expires in 10 minutes<br/>
                Check your spam / promotions folder
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from{transform:rotate(0deg);}
          to{transform:rotate(360deg);}
        }
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(14px);}
          to{opacity:1;transform:translateY(0);}
        }
        @keyframes pulse-ring {
          0%{box-shadow:0 0 0 0 rgba(29,158,117,0.4);}
          70%{box-shadow:0 0 0 12px rgba(29,158,117,0);}
          100%{box-shadow:0 0 0 0 rgba(29,158,117,0);}
        }
        @keyframes loadBar {
          from{width:0%;}
          to{width:100%;}
        }
      `}</style>
    </div>
  );
}
