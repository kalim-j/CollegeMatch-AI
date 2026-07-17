'use client';
import {
  useState, useEffect, useRef, Suspense
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { verifyOTP, saveAndSendOTP } from '@/lib/otp';
import dynamic from 'next/dynamic';

const LoginBackground = dynamic(
  () => import('@/components/LoginBackground'),
  { ssr: false }
);

export default function VerifyOTPWrapper() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight:'100vh',background:'#05071a',
        display:'flex',alignItems:'center',
        justifyContent:'center',
      }}>
        <div style={{
          width:40,height:40,borderRadius:'50%',
          border:'3px solid rgba(127,119,221,0.2)',
          borderTop:'3px solid #7F77DD',
          animation:'spin 0.8s linear infinite',
        }}/>
        <style>{`
          @keyframes spin{from{transform:rotate(0)}
          to{transform:rotate(360deg)}}
        `}</style>
      </div>
    }>
      <VerifyOTPPage />
    </Suspense>
  );
}

function VerifyOTPPage() {
  const router = useRouter();
  const params = useSearchParams();
  const uid   = params.get('uid')   || '';
  const email = params.get('email') || '';

  const [digits,      setDigits]      = useState(['','','','','','']);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState(false);
  const [busy,        setBusy]        = useState(false);
  const [resendBusy,  setResendBusy]  = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [screenCode,  setScreenCode]  = useState('');
  const [mounted,     setMounted]     = useState(false);

  const refs = useRef<(HTMLInputElement|null)[]>([]);

  useEffect(() => { setMounted(true); }, []);

  /* Load fallback OTP from sessionStorage */
  useEffect(() => {
    if (!uid || !mounted) return;
    const stored = sessionStorage.getItem(`otp_${uid}`);
    if (stored) setScreenCode(stored);
  }, [uid, mounted]);

  /* Resend countdown */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(n=>n-1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  /* Auto-submit when all 6 filled */
  useEffect(() => {
    if (!mounted) return;
    const code = digits.join('');
    if (code.length === 6 && !busy) {
      setTimeout(() => submit(code), 200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits, mounted]);

  if (!mounted) return null;

  /* ── Input handlers ── */
  const onChange = (i:number, val:string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[i] = val.slice(-1);
    setDigits(next);
    setError('');
    if (val && i < 5) refs.current[i+1]?.focus();
  };

  const onKey = (i:number, e:React.KeyboardEvent) => {
    if (e.key==='Backspace' && !digits[i] && i>0) {
      const next=[...digits];
      next[i-1]='';
      setDigits(next);
      refs.current[i-1]?.focus();
    }
  };

  const onPaste = (e:React.ClipboardEvent) => {
    e.preventDefault();
    const d = e.clipboardData.getData('text')
      .replace(/\D/g,'').slice(0,6);
    if (d.length===6) {
      setDigits(d.split(''));
      refs.current[5]?.focus();
    }
  };

  /* ── Submit OTP ── */
  const submit = async (code?:string) => {
    const otpCode = code || digits.join('');
    if (otpCode.length!==6) {
      setError('Please enter all 6 digits.'); return;
    }
    if (busy) return;
    setBusy(true);
    setError('');

    const result = await verifyOTP(uid, otpCode);

    if (result.success) {
      sessionStorage.removeItem(`otp_${uid}`);
      setSuccess(true);
      setTimeout(() => router.push('/discover'), 1800);
    } else {
      setError(result.error || 'Incorrect code.');
      setDigits(['','','','','','']);
      setTimeout(() => refs.current[0]?.focus(), 100);
    }
    setBusy(false);
  };

  /* ── Fill screen code ── */
  const fillScreenCode = () => {
    if (!screenCode) return;
    setDigits(screenCode.split(''));
    setError('');
  };

  /* ── Resend OTP ── */
  const resend = async () => {
    if (resendTimer>0 || resendBusy) return;
    setResendBusy(true);
    setError('');
    setDigits(['','','','','','']);

    try {
      const currentUser = auth.currentUser;
      let newOtp = '';

      if (currentUser) {
        newOtp = await saveAndSendOTP(currentUser);
      } else {
        /* Fallback: generate and save directly */
        const { generateOTP } = await import('@/lib/otp');
        newOtp = generateOTP();
        const { doc, setDoc, Timestamp, serverTimestamp }
          = await import('firebase/firestore');
        await setDoc(doc(db,'otp-verifications',uid),{
          otp: newOtp, email,
          expiresAt: Timestamp.fromDate(
            new Date(Date.now()+10*60*1000)
          ),
          verified:false, attempts:0,
          createdAt: serverTimestamp(),
        });
      }

      sessionStorage.setItem(`otp_${uid}`, newOtp);
      setScreenCode(newOtp);
      setResendTimer(60);
      setTimeout(() => refs.current[0]?.focus(), 100);
    } catch (e) {
      console.error('resend error:', e);
      setError('Could not resend. Please try again.');
    } finally {
      setResendBusy(false);
    }
  };

  /* ── Box style ── */
  const box = (i:number): React.CSSProperties => ({
    width:50, height:58,
    borderRadius:14,
    border: digits[i]
      ? '2px solid rgba(127,119,221,0.9)'
      : '1px solid rgba(255,255,255,0.14)',
    background: digits[i]
      ? 'rgba(127,119,221,0.14)'
      : 'rgba(255,255,255,0.05)',
    color:'white', fontSize:24,fontWeight:700,
    textAlign:'center', outline:'none',
    transition:'all 0.18s ease',
    boxShadow: digits[i]
      ? '0 0 16px rgba(127,119,221,0.30)':'none',
    caretColor:'#7F77DD',
    fontFamily:'monospace',
  });

  return (
    <div style={{
      minHeight:'100vh', display:'flex',
      alignItems:'center', justifyContent:'center',
      backgroundColor:'#05071a',
      position:'relative', overflow:'hidden',
      padding:'1rem',
    }}>
      <LoginBackground />

      <div style={{
        position:'relative',zIndex:1,
        width:'100%',maxWidth:420,
      }}>
        <div style={{
          background:'rgba(255,255,255,0.05)',
          backdropFilter:'blur(32px)',
          WebkitBackdropFilter:'blur(32px)',
          border:'1px solid rgba(127,119,221,0.22)',
          borderRadius:24,
          padding:'clamp(2rem,5vw,2.8rem)',
          boxShadow:
            '0 20px 60px rgba(0,0,0,0.5),' +
            '0 0 40px rgba(127,119,221,0.08)',
          animation:'fadeUp 0.4s ease forwards',
        }}>

          {success ? (
            /* ── Success ── */
            <div style={{textAlign:'center',padding:'1rem 0'}}>
              <div style={{
                width:72,height:72,borderRadius:'50%',
                background:'rgba(29,158,117,0.15)',
                border:'2px solid rgba(29,158,117,0.45)',
                display:'flex',alignItems:'center',
                justifyContent:'center',fontSize:36,
                margin:'0 auto 20px',
                animation:'pulseRing 1.2s ease infinite',
              }}>✅</div>
              <h2 style={{
                fontSize:22,fontWeight:700,
                color:'#5DCAA5',marginBottom:8,
              }}>Email verified!</h2>
              <p style={{
                fontSize:14,
                color:'rgba(255,255,255,0.55)',
              }}>
                Taking you to CollegeMatch-AI...
              </p>
            </div>

          ) : (
            <>
              {/* Logo */}
              <div style={{
                display:'flex',alignItems:'center',
                gap:10,marginBottom:24,
              }}>
                <div style={{
                  width:36,height:36,borderRadius:10,
                  background:'linear-gradient(135deg,#7F77DD,#1D9E75)',
                  display:'flex',alignItems:'center',
                  justifyContent:'center',fontSize:18,
                }}>🎓</div>
                <span style={{
                  fontSize:15,fontWeight:600,
                  background:'linear-gradient(90deg,#a89ef8,#5DCAA5)',
                  WebkitBackgroundClip:'text',
                  WebkitTextFillColor:'transparent',
                  backgroundClip:'text',color:'#a89ef8',
                }}>CollegeMatch-AI</span>
              </div>

              {/* Header */}
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
                Verify your email
              </h2>
              <p style={{
                fontSize:14,
                color:'rgba(255,255,255,0.55)',
                lineHeight:1.6,marginBottom:4,
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

              {/* ── ALWAYS show code on screen ── */}
              {screenCode && (
                <div style={{
                  background:'rgba(127,119,221,0.10)',
                  border:'1px solid rgba(127,119,221,0.28)',
                  borderRadius:14,
                  padding:'14px 16px',
                  marginBottom:18,
                  textAlign:'center',
                }}>
                  <p style={{
                    fontSize:11,
                    color:'rgba(255,255,255,0.50)',
                    marginBottom:8,letterSpacing:'0.04em',
                    textTransform:'uppercase',
                  }}>
                    Your verification code
                  </p>
                  <div style={{
                    fontSize:32,fontWeight:700,
                    letterSpacing:'0.3em',
                    color:'#a89ef8',
                    fontFamily:'monospace',
                    marginBottom:10,
                  }}>
                    {screenCode}
                  </div>
                  <button
                    onClick={fillScreenCode}
                    style={{
                      fontSize:12,
                      background:'rgba(127,119,221,0.18)',
                      border:'1px solid rgba(127,119,221,0.35)',
                      borderRadius:8,
                      padding:'6px 16px',
                      color:'#a89ef8',cursor:'pointer',
                      fontFamily:'inherit',
                      transition:'all 0.2s ease',
                    }}
                  >
                    Auto-fill this code
                  </button>
                  <p style={{
                    fontSize:11,
                    color:'rgba(255,255,255,0.30)',
                    marginTop:8,marginBottom:0,
                  }}>
                    ✉️ Also sent to your email inbox
                  </p>
                </div>
              )}

              {/* 6 OTP boxes */}
              <div
                onPaste={onPaste}
                style={{
                  display:'flex',gap:8,
                  justifyContent:'center',
                  marginBottom:18,
                }}
              >
                {digits.map((d,i)=>(
                  <input
                    key={i}
                    ref={el=>{refs.current[i]=el;}}
                    type="text" inputMode="numeric"
                    maxLength={1} value={d}
                    onChange={e=>onChange(i,e.target.value)}
                    onKeyDown={e=>onKey(i,e)}
                    autoFocus={i===0}
                    disabled={busy}
                    style={box(i)}
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
                  fontSize:13,color:'#F09595',
                  textAlign:'center',
                }}>
                  {error}
                </div>
              )}

              {/* Verify button */}
              <button
                onClick={()=>submit()}
                disabled={busy||digits.join('').length!==6}
                style={{
                  width:'100%',padding:'13px',
                  borderRadius:12,border:'none',
                  background: busy
                    ? 'rgba(127,119,221,0.35)'
                    : digits.join('').length===6
                    ? 'linear-gradient(135deg,#7F77DD,#534AB7)'
                    : 'rgba(127,119,221,0.2)',
                  color:'white',fontSize:15,fontWeight:600,
                  cursor: busy||digits.join('').length!==6
                    ? 'not-allowed':'pointer',
                  display:'flex',alignItems:'center',
                  justifyContent:'center',gap:8,
                  boxShadow: digits.join('').length===6&&!busy
                    ? '0 4px 20px rgba(127,119,221,0.35)':'none',
                  transition:'all 0.2s ease',
                  marginBottom:14,
                }}
              >
                {busy ? (
                  <>
                    <div style={{
                      width:16,height:16,borderRadius:'50%',
                      border:'2px solid rgba(255,255,255,0.3)',
                      borderTop:'2px solid white',
                      animation:'spin 0.8s linear infinite',
                    }}/>
                    Verifying...
                  </>
                ):'Verify email →'}
              </button>

              {/* Resend */}
              <div style={{textAlign:'center'}}>
                <p style={{
                  fontSize:13,
                  color:'rgba(255,255,255,0.4)',
                  marginBottom:5,
                }}>
                  Need a new code?
                </p>
                <button
                  onClick={resend}
                  disabled={resendBusy||resendTimer>0}
                  style={{
                    background:'none',border:'none',
                    color: resendTimer>0
                      ? 'rgba(255,255,255,0.28)'
                      : '#a89ef8',
                    fontSize:13,fontWeight:500,
                    cursor: resendTimer>0
                      ? 'default':'pointer',
                    padding:0,fontFamily:'inherit',
                  }}
                >
                  {resendBusy ? 'Generating...'
                    : resendTimer>0
                    ? `Resend in ${resendTimer}s`
                    : 'Generate new code'}
                </button>
              </div>

              <p style={{
                fontSize:11,
                color:'rgba(255,255,255,0.22)',
                textAlign:'center',marginTop:16,
                lineHeight:1.6,
              }}>
                Code valid for 10 minutes ·
                Check spam if email not received
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin{
          from{transform:rotate(0)}
          to{transform:rotate(360deg)}
        }
        @keyframes fadeUp{
          from{opacity:0;transform:translateY(14px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes pulseRing{
          0%{box-shadow:0 0 0 0 rgba(29,158,117,0.4)}
          70%{box-shadow:0 0 0 12px rgba(29,158,117,0)}
          100%{box-shadow:0 0 0 0 rgba(29,158,117,0)}
        }
      `}</style>
    </div>
  );
}
