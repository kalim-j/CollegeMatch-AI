'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
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
  const [regData, setRegData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const data = sessionStorage.getItem('registrationData');
    if (data) {
      setRegData(JSON.parse(data));
    }
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;
    if (user && profile?.isVerified) {
      router.push('/dashboard');
    } else if (!user && !sessionStorage.getItem('registrationData')) {
      router.push('/login');
    }
  }, [user, profile, loading, router, mounted]);

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
    const entered = code.join('');
    if (entered.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (regData) {
        const { otp, email, password, name } = regData;
        if (Date.now() > otp.expiresAt) {
          setError('OTP has expired. Please request a new one.');
        } else if (otp.code === entered) {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(cred.user, { displayName: name });
          
          await setDoc(doc(db, 'users', cred.user.uid), {
            name,
            email,
            photoURL: null,
            createdAt: serverTimestamp(),
            isNewUser: true,
            shownWelcome: false,
            isVerified: true,
            otp: null
          }, { merge: true });
          
          sessionStorage.removeItem('registrationData');
          await refreshProfile();
          router.push('/dashboard');
        } else {
          setError('Incorrect OTP. Please try again.');
        }
      } else if (user) {
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
      } else {
        setError('No registration data found. Please register again.');
      }
    } catch (err: any) {
      console.error('Verify error:', err);
      setError(err.message || 'Failed to verify OTP. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (resendBusy || timeLeft > 0) return;
    if (!regData && !user) return;
    setResendBusy(true);
    setError('');
    try {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      const targetEmail = regData ? regData.email : user?.email;

      if (regData) {
        const newData = { ...regData, otp: { code: newCode, expiresAt: Date.now() + 10 * 60 * 1000 } };
        sessionStorage.setItem('registrationData', JSON.stringify(newData));
        setRegData(newData);
      } else if (user) {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, {
          otp: {
            code: newCode,
            expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
          }
        });
      }

      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, otp: newCode })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to resend OTP');
      }
      
      setTimeLeft(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Try again.');
    } finally {
      setResendBusy(false);
    }
  };

  if (!mounted || loading) return null;
  if (!user && !regData) return null;

  const displayEmail = regData ? regData.email : user?.email;

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

      <div className="relative z-10 w-full max-w-[420px] p-10 bg-white/70 dark:bg-[#0f122b]/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 rounded-[24px] shadow-2xl m-6">
        <div className="text-center mb-8">
          <div className="w-[56px] h-[56px] rounded-2xl mx-auto mb-6 bg-gradient-to-br from-[#7F77DD] to-[#1D9E75] flex items-center justify-center text-3xl shadow-[0_8px_24px_rgba(127,119,221,0.4)]">
            ✉️
          </div>
          <h2 className="text-[28px] font-bold text-slate-900 dark:text-white mb-2">
            Verify your email
          </h2>
          <p className="text-[14px] text-slate-500 dark:text-white/70 leading-[1.5]">
            We've sent a 6-digit code to <br/>
            <strong className="text-slate-800 dark:text-white">{displayEmail}</strong>
          </p>
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl">
            <p className="text-[13px] text-amber-700 dark:text-amber-400 m-0">
              <strong>Note:</strong> Please check your spam or junk folder if you do not see the email in your inbox.
            </p>
          </div>
        </div>

        <form onSubmit={handleVerify}>
          <div className="flex gap-2 justify-center mb-6">
            {code.map((c, i) => (
              <input
                key={i}
                ref={el => { inputs.current[i] = el; }}
                type="text"
                value={c}
                maxLength={1}
                onChange={e => handleChange(e, i)}
                onKeyDown={e => handleKeyDown(e, i)}
                className="w-[45px] h-[55px] rounded-xl border border-slate-200 dark:border-white/20 bg-white/60 dark:bg-white/5 text-slate-900 dark:text-white text-[24px] font-semibold text-center outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:bg-white dark:focus:bg-white/10"
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-3 mb-5 text-[13px] text-red-600 dark:text-red-400 text-center">
              {error}
            </div>
          )}

          <button type="submit" disabled={busy} className="w-full p-4 rounded-2xl border-none bg-gradient-to-br from-indigo-500 to-indigo-700 text-white text-[16px] font-bold flex items-center justify-center gap-2.5 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(127,119,221,0.4)] hover-lift">
            {busy ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <p className="text-center text-[14px] text-slate-500 dark:text-white/60 mt-6">
          Didn't receive the code?{' '}
          <button onClick={handleResend} disabled={resendBusy || timeLeft > 0} className={`bg-none border-none font-semibold cursor-pointer ${resendBusy || timeLeft > 0 ? 'text-slate-400 dark:text-white/40 cursor-not-allowed no-underline' : 'text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700 dark:hover:text-indigo-300'}`}>
            {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend OTP'}
          </button>
        </p>
      </div>
    </div>
  );
}
