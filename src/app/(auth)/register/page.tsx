'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTheme } from 'next-themes';

const DashboardBackground = dynamic(
  () => import('@/components/3D/DashboardBackground'),
  { ssr: false }
);

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [busy,     setBusy]     = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

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
      await saveUserToFirestore(
        cred.user.uid, name, email, null
      );
      await sendEmailVerification(cred.user);
      setVerificationSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      console.error('Register error:', msg);

      if (msg.includes('email-already-in-use'))
        setError('This email is already registered. Try signing in.');
      else if (msg.includes('weak-password'))
        setError('Password too weak. Use at least 6 characters.');
      else if (msg.includes('invalid-email'))
        setError('Please enter a valid email address.');
      else if (msg.includes('network-request-failed'))
        setError('No internet connection. Please check and retry.');
      else
        setError('Something went wrong. Please try again.');
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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 0,
      padding: '2rem',
      backgroundColor: 'transparent',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <DashboardBackground />

      <div className="auth-card-container relative z-10 flex w-full max-w-[1000px] bg-white/70 dark:bg-[#0f122b]/40 backdrop-blur-2xl rounded-[32px] border border-white/50 dark:border-white/5 shadow-2xl overflow-hidden flex-col md:flex-row">
        
        {/* LEFT / TOP - Branding */}
        <div className="auth-branding-section flex-1 p-12 flex flex-col justify-center bg-gradient-to-br from-indigo-50/50 to-teal-50/50 dark:from-indigo-500/10 dark:to-teal-500/5">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-[54px] h-[54px] rounded-2xl bg-gradient-to-br from-[#7F77DD] to-[#1D9E75] flex items-center justify-center text-2xl shadow-[0_8px_32px_rgba(127,119,221,0.4)]">
              🎓
            </div>
            <div>
              <p className="text-[22px] font-extrabold text-slate-900 dark:text-white m-0 tracking-tight">
                CollegeMatch-AI
              </p>
              <p className="text-[12px] text-slate-500 dark:text-white/50 m-0 mt-0.5">
                India's smartest college advisor
              </p>
            </div>
          </div>

          <h1 className="text-[clamp(32px,4vw,48px)] font-extrabold text-slate-900 dark:text-white leading-[1.1] m-0 mb-3">
            Start your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7F77DD] to-[#5DCAA5] dark:from-[#a89ef8]">
              journey today.
            </span>
          </h1>
          <p className="text-[16px] text-slate-600 dark:text-white/60 leading-[1.6] max-w-[380px] m-0 mb-10">
            Discover 500+ top colleges and find the one that fits your dreams and budget — free.
          </p>

          <div className="flex gap-4 flex-wrap">
            {[
              ['🎓','14L+','Students'],
              ['🏫','500+','Colleges'],
              ['💰','Free','Always'],
            ].map(([icon,val,lbl]) => (
              <div key={lbl} className="bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-2xl p-[12px_16px] text-center backdrop-blur-md">
                <div className="text-[20px] mb-1">{icon}</div>
                <div className="text-[16px] font-bold text-slate-800 dark:text-white">{val}</div>
                <div className="text-[11px] text-slate-500 dark:text-white/40">{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT / BOTTOM - Form */}
        <div className="auth-form-section flex-[0_0_440px] p-12 flex flex-col justify-center" style={{ background: isDark ? '#0d1230' : 'white' }}>
          {verificationSent ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              animation: 'fadeUp 0.5s ease forwards',
            }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📧</div>
              <h2 style={{
                fontSize: 24, fontWeight: 700,
                color: isDark ? 'white' : '#1a1340',
                marginBottom: 8,
              }}>
                Verify your email
              </h2>
              <p style={{
                fontSize: 14,
                color: isDark ? 'rgba(255,255,255,0.6)' : '#6b6894',
                lineHeight: 1.7,
                marginBottom: 24,
              }}>
                We sent a verification link to
                <strong style={{ color: isDark ? '#a89ef8' : '#534AB7', display: 'block', marginTop: 4 }}>
                  {email}
                </strong>
                Click the link in your email to activate your account.
              </p>
              <div style={{
                background: isDark ? 'rgba(29,158,117,0.12)' : 'rgba(29,158,117,0.08)',
                border: '1px solid rgba(29,158,117,0.3)',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 20,
                fontSize: 13,
                color: isDark ? '#5DCAA5' : '#0F6E56',
              }}>
                ✅ Account created successfully!
              </div>
              <button
                onClick={() => router.push('/login')}
                style={{
                  width: '100%', padding: '13px',
                  borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg,#7F77DD,#534AB7)',
                  color: 'white', fontSize: 15,
                  fontWeight: 600, cursor: 'pointer',
                  marginBottom: 12,
                }}>
                Go to login →
              </button>
              <button
                onClick={async () => {
                  if (auth.currentUser) {
                    await sendEmailVerification(auth.currentUser);
                    alert('Verification email resent!');
                  }
                }}
                style={{
                  width: '100%', padding: '11px',
                  borderRadius: 12, cursor: 'pointer',
                  background: 'transparent',
                  border: '1px solid rgba(127,119,221,0.3)',
                  color: isDark ? '#a89ef8' : '#534AB7',
                  fontSize: 13, fontWeight: 500,
                }}>
                Resend verification email
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ color: isDark ? 'white' : '#1a1340', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                Create free account
              </h2>
              <p style={{ color: isDark ? 'rgba(255,255,255,0.55)' : '#6b6894', fontSize: '14px', marginBottom: '32px' }}>
                Join 10,000+ students finding their dream college
              </p>

              <button onClick={handleGoogle} disabled={busy} className="w-full p-[14px_16px] rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 text-slate-800 dark:text-white text-[14px] font-semibold flex items-center justify-center gap-3 mb-6 transition-all hover:bg-slate-50 dark:hover:bg-white/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Sign up with Google
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-[1px] bg-slate-200 dark:bg-white/10"/>
                <span className="text-[12px] text-slate-400 dark:text-white/40 uppercase tracking-widest">or</span>
                <div className="flex-1 h-[1px] bg-slate-200 dark:bg-white/10"/>
              </div>

              <form onSubmit={handleRegister}>
                <div className="mb-4">
                  <label style={{ color: isDark ? '#a89ef8' : '#534AB7' }} className="block text-[12px] font-semibold uppercase tracking-wider mb-2">Full name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f0eeff', color: isDark ? 'rgba(255,255,255,0.9)' : '#1a1340', border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(127,119,221,0.2)' }} className="w-full p-[14px_18px] rounded-2xl text-[14px] outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 placeholder:text-slate-400 dark:placeholder:text-white/30" />
                </div>

                <div className="mb-4">
                  <label style={{ color: isDark ? '#a89ef8' : '#534AB7' }} className="block text-[12px] font-semibold uppercase tracking-wider mb-2">Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f0eeff', color: isDark ? 'rgba(255,255,255,0.9)' : '#1a1340', border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(127,119,221,0.2)' }} className="w-full p-[14px_18px] rounded-2xl text-[14px] outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 placeholder:text-slate-400 dark:placeholder:text-white/30" />
                </div>

                <div className="mb-4">
                  <label style={{ color: isDark ? '#a89ef8' : '#534AB7' }} className="block text-[12px] font-semibold uppercase tracking-wider mb-2">Password</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f0eeff', color: isDark ? 'rgba(255,255,255,0.9)' : '#1a1340', border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(127,119,221,0.2)' }} className="w-full p-[14px_44px_14px_18px] rounded-2xl text-[14px] outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 placeholder:text-slate-400 dark:placeholder:text-white/30" />
                    <button type="button" onClick={() => setShowPwd(p=>!p)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[16px] text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/60 transition-colors">
                      {showPwd ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label style={{ color: isDark ? '#a89ef8' : '#534AB7' }} className="block text-[12px] font-semibold uppercase tracking-wider mb-2">Confirm password</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f0eeff', color: isDark ? 'rgba(255,255,255,0.9)' : '#1a1340', border: confirm && password !== confirm ? '1px solid #f87171' : (isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(127,119,221,0.2)') }} className={`w-full p-[14px_18px] rounded-2xl text-[14px] outline-none transition-all focus:ring-2 placeholder:text-slate-400 dark:placeholder:text-white/30 ${confirm && password !== confirm ? 'focus:border-red-400 focus:ring-red-400/20' : 'focus:border-indigo-400 focus:ring-indigo-400/20'}`} />
                  {confirm && password !== confirm && (
                    <p className="text-[12px] text-red-500 mt-1.5">Passwords do not match</p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-3 mb-5 text-[13px] text-red-600 dark:text-red-400 text-center">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={busy} className="w-full p-4 rounded-2xl border-none bg-gradient-to-br from-indigo-500 to-indigo-700 text-white text-[16px] font-bold flex items-center justify-center gap-2.5 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_24px_rgba(127,119,221,0.3)] disabled:shadow-none hover-lift">
                  {busy ? 'Creating account...' : 'Create free account →'}
                </button>
              </form>

              <p className="text-center text-[14px] text-slate-500 dark:text-white/50 mt-6">
                Already have an account?{' '}
                <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold no-underline hover:underline">Sign in →</Link>
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
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
