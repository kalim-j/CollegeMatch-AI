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

const LoginBackground = dynamic(
  () => import('@/components/LoginBackground'),
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
    if (!loading && user) router.push('/discover');
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
    photoURL: string | null
  ) => {
    await setDoc(doc(db, 'users', uid), {
      name: displayName,
      email: userEmail,
      photoURL: photoURL || null,
      createdAt: serverTimestamp(),
      isNewUser: true,
      shownWelcome: false,
    }, { merge: true });
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
      router.push('/discover');
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
      );
      router.push('/discover');
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
    padding: '13px 16px',
    borderRadius: 12,
    border: '1px solid rgba(127,119,221,0.2)',
    background: '#f0eeff',
    color: '#1a1340',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: '#534AB7',
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 6,
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      margin: 0,
      padding: 0,
      backgroundColor: '#05071a',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <LoginBackground />

      {/* LEFT */}
      <div style={{
        flex: '0 0 50%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(2rem,5vw,4rem)',
        position: 'relative',
        zIndex: 1,
        background: 'transparent',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: 12, marginBottom: '2.5rem',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg,#7F77DD,#1D9E75)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 24,
            boxShadow: '0 0 24px rgba(127,119,221,0.4)',
          }}>🎓</div>
          <div>
            <p style={{
              fontSize: 18, fontWeight: 700,
              background: 'linear-gradient(90deg,#a89ef8,#5DCAA5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', color: '#a89ef8',
              margin: 0,
            }}>CollegeMatch-AI</p>
            <p style={{
              fontSize: 11, margin: '2px 0 0',
              color: 'rgba(255,255,255,0.45)',
            }}>India's smartest college advisor</p>
          </div>
        </div>

        <h1 style={{
          fontSize: 'clamp(28px,3.5vw,48px)',
          fontWeight: 800, color: 'white',
          lineHeight: 1.2, margin: '0 0 8px',
        }}>Start your</h1>
        <h1 style={{
          fontSize: 'clamp(28px,3.5vw,48px)',
          fontWeight: 800,
          background: 'linear-gradient(90deg,#a89ef8,#5DCAA5)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', color: '#a89ef8',
          lineHeight: 1.2, margin: '0 0 16px',
        }}>journey today.</h1>
        <p style={{
          fontSize: 'clamp(14px,1.5vw,16px)',
          color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.7, maxWidth: 380, margin: 0,
        }}>
          Discover 500+ top colleges and find the one
          that fits your dreams and budget — free.
        </p>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 16, marginTop: '2.5rem',
          flexWrap: 'wrap',
        }}>
          {[
            ['🎓','14L+','Students 2026'],
            ['🏫','500+','Colleges'],
            ['💰','Free','Always'],
          ].map(([icon,val,lbl]) => (
            <div key={lbl} style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 12,
              padding: '10px 14px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 16 }}>{icon}</div>
              <div style={{
                fontSize: 16, fontWeight: 700,
                color: 'white', lineHeight: 1,
              }}>{val}</div>
              <div style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.4)',
              }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div style={{
        flex: '0 0 50%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1.5rem,3vw,2.5rem)',
        position: 'relative',
        zIndex: 1,
        background: 'white',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 420,
          paddingTop: '2rem', paddingBottom: '2rem' }}>
          <h2 style={{
            fontSize: 26, fontWeight: 700,
            color: '#1a1340', marginBottom: 6,
          }}>Create free account</h2>
          <p style={{
            fontSize: 14, color: '#6b6894', marginBottom: 24,
          }}>
            Join 10,000+ students finding their dream college
          </p>

          {/* Google */}
          <button onClick={handleGoogle} disabled={busy} style={{
            width: '100%', padding: '13px 16px',
            borderRadius: 12,
            border: '1px solid rgba(127,119,221,0.2)',
            background: '#f0eeff', color: '#534AB7',
            fontSize: 14, fontWeight: 500,
            cursor: busy ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10,
            marginBottom: 18,
            opacity: busy ? 0.7 : 1,
            transition: 'all 0.2s ease',
          }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Sign up with Google
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: 12, marginBottom: 18,
          }}>
            <div style={{ flex:1, height:1,
              background:'rgba(127,119,221,0.15)' }}/>
            <span style={{ fontSize:12, color:'#7a7399' }}>
              or email
            </span>
            <div style={{ flex:1, height:1,
              background:'rgba(127,119,221,0.15)' }}/>
          </div>

          <form onSubmit={handleRegister}>
            {/* Name */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Full name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                required
                style={inputStyle}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  style={{ ...inputStyle, paddingRight: 44 }}
                />
                <button type="button"
                  onClick={() => setShowPwd(p=>!p)}
                  style={{
                    position: 'absolute', right: 14,
                    top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: 15,
                    color: '#7a7399', padding: 0,
                  }}>
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat password"
                required
                style={{
                  ...inputStyle,
                  border: confirm && password !== confirm
                    ? '1px solid #E24B4A'
                    : '1px solid rgba(127,119,221,0.2)',
                }}
              />
              {confirm && password !== confirm && (
                <p style={{
                  fontSize: 12, color: '#A32D2D',
                  margin: '4px 0 0',
                }}>
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(226,75,74,0.08)',
                border: '1px solid rgba(226,75,74,0.25)',
                borderRadius: 10,
                padding: '10px 14px',
                marginBottom: 14,
                fontSize: 13,
                color: '#A32D2D',
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={busy} style={{
              width: '100%', padding: '14px',
              borderRadius: 12, border: 'none',
              background: busy
                ? 'rgba(127,119,221,0.5)'
                : 'linear-gradient(135deg,#7F77DD,#534AB7)',
              color: 'white', fontSize: 15, fontWeight: 600,
              cursor: busy ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
              boxShadow: busy
                ? 'none'
                : '0 4px 20px rgba(127,119,221,0.35)',
              transition: 'all 0.2s ease',
            }}>
              {busy ? (
                <>
                  <div style={{
                    width: 16, height: 16,
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    animation: 'spin 0.8s linear infinite',
                  }}/>
                  Creating account...
                </>
              ) : 'Create free account →'}
            </button>
          </form>

          <p style={{
            textAlign: 'center', fontSize: 13,
            color: '#6b6894', marginTop: 18,
          }}>
            Already have an account?{' '}
            <a href="/login" style={{
              color: '#534AB7', fontWeight: 600,
              textDecoration: 'none',
            }}>Sign in →</a>
          </p>
          <p style={{
            textAlign: 'center', fontSize: 11,
            color: '#9ca3af', marginTop: 12,
          }}>
            🔒 Free forever · No spam · Your data is private
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .auth-root { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}
