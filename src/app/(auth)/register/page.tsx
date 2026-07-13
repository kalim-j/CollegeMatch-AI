'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const DashboardBackground = dynamic(
  () => import('@/components/3D/DashboardBackground'),
  { ssr: false }
);

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [busy,     setBusy]     = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading, router]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#05071a',
      }}>
        <div style={{
          width: 40, height: 40,
          borderRadius: '50%',
          border: '3px solid rgba(127,119,221,0.2)',
          borderTop: '3px solid #7F77DD',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  const saveUserToFirestore = async (
    uid: string,
    displayName: string,
    userEmail: string,
    photoURL: string | null,
    isGoogle = false
  ) => {
    const userData: any = {
      name: displayName,
      email: userEmail,
      photoURL: photoURL || null,
      createdAt: serverTimestamp(),
      isNewUser: true,
      shownWelcome: false,
    };
    
    // For Google auth, we implicitly trust the email
    if (isGoogle) {
      userData.isVerified = true;
    }

    await setDoc(doc(db, 'users', uid), userData, { merge: true });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.'); return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.'); return;
    }

    setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth, email, password
      );
      await updateProfile(cred.user, { displayName: name });
      
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save user with OTP
      await setDoc(doc(db, 'users', cred.user.uid), {
        name,
        email,
        photoURL: null,
        createdAt: serverTimestamp(),
        isNewUser: true,
        shownWelcome: false,
        isVerified: false,
        otp: {
          code: otpCode,
          expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
        }
      }, { merge: true });

      // Send OTP Email
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      });

      router.push('/verify-email');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('email-already-in-use'))
        setError('This email is already registered. Try signing in.');
      else if (msg.includes('weak-password'))
        setError('Password is too weak. Use at least 6 characters.');
      else if (msg.includes('invalid-email'))
        setError('Please enter a valid email address.');
      else
        setError('Registration failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await saveUserToFirestore(
        cred.user.uid,
        cred.user.displayName || 'Student',
        cred.user.email || '',
        cred.user.photoURL,
        true // isGoogle
      );
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (!msg.includes('popup-closed'))
        setError('Google sign-up failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  /* Shared input style */
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 18px',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: 'white',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 8,
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 0,
      padding: '2rem',
      backgroundColor: '#05071a',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <DashboardBackground />

      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        maxWidth: 1000,
        background: 'rgba(15, 18, 43, 0.4)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 32,
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }} className="auth-card-container">
        
        {/* LEFT / TOP - Branding */}
        <div style={{
          flex: '1',
          padding: '4rem 3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(127,119,221,0.1), rgba(29,158,117,0.05))',
        }} className="auth-branding-section">
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: 12, marginBottom: '2.5rem',
          }}>
            <div style={{
              width: 54, height: 54, borderRadius: 18,
              background: 'linear-gradient(135deg,#7F77DD,#1D9E75)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 28,
              boxShadow: '0 8px 32px rgba(127,119,221,0.4)',
            }}>🎓</div>
            <div>
              <p style={{
                fontSize: 22, fontWeight: 800,
                color: 'white', margin: 0, letterSpacing: '-0.5px'
              }}>CollegeMatch-AI</p>
              <p style={{
                fontSize: 12, margin: '2px 0 0',
                color: 'rgba(255,255,255,0.5)',
              }}>India's smartest college advisor</p>
            </div>
          </div>

          <h1 style={{
            fontSize: 'clamp(32px,4vw,48px)',
            fontWeight: 800, color: 'white',
            lineHeight: 1.1, margin: '0 0 12px',
          }}>Start your <br/><span style={{
            background: 'linear-gradient(90deg,#a89ef8,#5DCAA5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>journey today.</span></h1>
          <p style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.6, maxWidth: 380, margin: '0 0 40px',
          }}>
            Discover 500+ top colleges and find the one
            that fits your dreams and budget — free.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              ['🎓','14L+','Students'],
              ['🏫','500+','Colleges'],
              ['💰','Free','Always'],
            ].map(([icon,val,lbl]) => (
              <div key={lbl} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 16, padding: '12px 16px',
                textAlign: 'center', backdropFilter: 'blur(10px)',
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{val}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT / BOTTOM - Form */}
        <div style={{
          flex: '0 0 440px',
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'rgba(5,7,26,0.6)',
        }} className="auth-form-section">
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8 }}>
            Create free account
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>
            Join 10,000+ students finding their dream college
          </p>

          <button onClick={handleGoogle} disabled={busy} style={{
            width: '100%', padding: '14px 16px',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)', color: 'white',
            fontSize: 14, fontWeight: 600,
            cursor: busy ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 12,
            marginBottom: 24, transition: 'all 0.3s ease',
          }} className="hover:bg-white/10 active:scale-[0.98]">
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Sign up with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.1)' }}/>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px' }}>or</span>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.1)' }}/>
          </div>

          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Full name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required style={inputStyle} className="focus:border-purple-400 focus:bg-white/10" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle} className="focus:border-purple-400 focus:bg-white/10" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required style={{ ...inputStyle, paddingRight: 44 }} className="focus:border-purple-400 focus:bg-white/10" />
                <button type="button" onClick={() => setShowPwd(p=>!p)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Confirm password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required style={{ ...inputStyle, border: confirm && password !== confirm ? '1px solid #E24B4A' : '1px solid rgba(255,255,255,0.1)' }} className="focus:border-purple-400 focus:bg-white/10" />
              {confirm && password !== confirm && (
                <p style={{ fontSize: 12, color: '#ff8a8a', margin: '6px 0 0' }}>Passwords do not match</p>
              )}
            </div>

            {error && (
              <div style={{ background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.3)', borderRadius: 12, padding: '12px', marginBottom: 20, fontSize: 13, color: '#ff8a8a', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={busy} style={{
              width: '100%', padding: '16px',
              borderRadius: 16, border: 'none',
              background: busy ? 'rgba(127,119,221,0.5)' : 'linear-gradient(135deg,#7F77DD,#534AB7)',
              color: 'white', fontSize: 16, fontWeight: 700,
              cursor: busy ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 10,
              boxShadow: busy ? 'none' : '0 8px 24px rgba(127,119,221,0.4)',
              transition: 'all 0.3s ease',
            }} className="hover:opacity-90 active:scale-[0.98]">
              {busy ? 'Creating account...' : 'Create free account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 24 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#a89ef8', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .auth-card-container { flex-direction: column !important; max-width: 440px !important; }
          .auth-branding-section { padding: 3rem 2rem !important; }
          .auth-form-section { padding: 2rem !important; flex: auto !important; }
        }
      `}</style>
    </div>
  );
}
