"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Mail, Lock, User, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import LoginBackground from "@/components/LoginBackground";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [showOTP, setShowOTP] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setShowOTP(true);
        toast.success("Verification code sent to your email!");
      } else {
        throw new Error(data.error || "Failed to send code");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    setVerifying(true);
    try {
      const { data, error } = await supabase
        .from('otps')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error || !data) {
        toast.error("No code found. Please resend.");
        return;
      }

      const now = new Date();
      const expiresAt = new Date(data.expires_at);

      if (otpInput !== data.code) {
        toast.error("Invalid verification code!");
        return;
      }

      if (now > expiresAt) {
        toast.error("Code expired. Please resend.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name });
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: name,
        email: email,
        createdAt: new Date(),
        isNewUser: true,
      });

      toast.success("Account verified and created!");
      router.push("/discover");
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
    } finally {
      setVerifying(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const isNewUser = !userDocSnap.exists();

      await setDoc(userDocRef, {
        uid: user.uid,
        fullName: user.displayName || "",
        email: user.email || "",
        avatarUrl: user.photoURL || "",
        createdAt: new Date(),
        ...(isNewUser ? { isNewUser: true } : {}),
      }, { merge: true });

      toast.success("Welcome to CollegeMatch!");
      if (isNewUser) {
        router.push("/discover");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Google registration failed");
    }
  };

  return (
    /* Root: dark background, flex row, no gaps */
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'row',
      margin: 0,
      padding: 0,
      backgroundColor: '#05071a',
      position: 'relative',
      overflow: 'hidden',
    }} className="auth-layout">

      {/* Canvas background — covers entire page */}
      <LoginBackground />

      {/* LEFT panel — hero content */}
      <div style={{
        flex: '0 0 50%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(2rem,5vw,4rem)',
        position: 'relative',
        zIndex: 1,
        /* NO background — canvas shows through */
        background: 'transparent',
        /* NO border */
        borderRight: 'none',
      }} className="auth-left hidden lg:flex">
        {/* Logo */}
        <Logo size="lg" theme="dark" showTagline />

        {/* Hero text */}
        <div style={{ marginTop: '3rem' }}>
          <h1 style={{
            fontSize: 'clamp(32px,4vw,52px)',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.2,
            margin: '0 0 8px',
          }}>
            Start your
          </h1>
          <h1 style={{
            fontSize: 'clamp(32px,4vw,52px)',
            fontWeight: 800,
            background: 'linear-gradient(90deg,#a89ef8,#5DCAA5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: '#a89ef8', /* fallback */
            lineHeight: 1.2,
            margin: '0 0 16px',
          }}>
            journey today.
          </h1>
          <p style={{
            fontSize: 'clamp(14px,1.5vw,17px)',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.7,
            maxWidth: '400px',
          }}>
            Discover over 500+ top colleges and find the
            one that fits your dreams and budget.
          </p>
        </div>

        {/* Trust badge */}
        <div style={{
          marginTop: '3rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '14px',
          padding: '14px 18px',
          maxWidth: 'fit-content',
        }}>
          <span style={{ fontSize: '24px' }}>🔒</span>
          <div>
            <p style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'white',
              margin: 0,
            }}>
              Verified Security
            </p>
            <p style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)',
              margin: '2px 0 0',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              Your data is encrypted
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT panel — register form */}
      {/* Uses a vertical separator — NOT a border */}
      <div style={{
        flex: '1',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1.5rem,3vw,3rem)',
        position: 'relative',
        zIndex: 1,
        /* White background ONLY on the right half */
        background: 'white',
        /* NO border-left */
        borderLeft: 'none',
        margin: 0,
      }} className="auth-right">
        {/* Form card */}
        <div style={{
          width: '100%',
          maxWidth: '420px',
        }}>
            <div className="space-y-2 text-center lg:text-left">
              <div className="mb-6 lg:hidden flex justify-center">
                <Logo size="md" showTagline={false} theme="light" />
              </div>
              <h2 className="text-[#1a1340] font-bold text-3xl tracking-tight">
                {showOTP ? "Verify Email" : "Create Account"}
              </h2>
              <p className="text-[#5a5380] font-medium text-sm">
                {showOTP ? `We sent a code to ${email}` : "Join India's smartest admission engine"}
              </p>
            </div>

            {!showOTP ? (
              <div className="space-y-8 mt-8">
                <button
                  onClick={handleGoogleLogin}
                  className="bg-[#f0eeff] border border-[rgba(127,119,221,0.2)] text-[#1a1340] rounded-xl h-14 w-full font-medium flex items-center justify-center gap-3 hover:bg-[rgba(127,119,221,0.1)] transition-all duration-200 text-sm active:scale-[0.98]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-[#1a1340] font-bold text-sm">Sign up with Google</span>
                </button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-[rgba(127,119,221,0.2)]"></div>
                  <span className="flex-shrink mx-4 text-xs text-[#7a7399] font-semibold tracking-widest uppercase">or email</span>
                  <div className="flex-grow border-t border-[rgba(127,119,221,0.2)]"></div>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[#534AB7] text-xs font-semibold tracking-widest uppercase mb-2 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a7399]" size={18} />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="bg-[#f0eeff] border border-[rgba(127,119,221,0.2)] text-[#1a1340] placeholder:text-[#7a7399] rounded-xl pl-12 pr-4 py-3 h-14 w-full outline-none focus:border-[rgba(127,119,221,0.6)] focus:shadow-[0_0_0_3px_rgba(127,119,221,0.15)] transition-all duration-200 text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[#534AB7] text-xs font-semibold tracking-widest uppercase mb-2 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a7399]" size={18} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="bg-[#f0eeff] border border-[rgba(127,119,221,0.2)] text-[#1a1340] placeholder:text-[#7a7399] rounded-xl pl-12 pr-4 py-3 h-14 w-full outline-none focus:border-[rgba(127,119,221,0.6)] focus:shadow-[0_0_0_3px_rgba(127,119,221,0.15)] transition-all duration-200 text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[#534AB7] text-xs font-semibold tracking-widest uppercase mb-2 block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a7399]" size={18} />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-[#f0eeff] border border-[rgba(127,119,221,0.2)] text-[#1a1340] placeholder:text-[#7a7399] rounded-xl pl-12 pr-4 py-3 h-14 w-full outline-none focus:border-[rgba(127,119,221,0.6)] focus:shadow-[0_0_0_3px_rgba(127,119,221,0.15)] transition-all duration-200 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg flex items-center justify-center gap-2 h-14"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Verify Email</span>}
                    {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-8 mt-8">
                <div className="p-4 bg-[#f0eeff] border border-[rgba(127,119,221,0.2)] rounded-2xl text-center">
                  <p className="text-[#1a1340] font-bold text-sm">Enter 6-digit code</p>
                  <p className="text-[#7a7399] text-[11px] mt-1 uppercase tracking-widest font-medium">Sent to your inbox</p>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="bg-[#f0eeff] border border-[rgba(127,119,221,0.2)] text-[#1a1340] placeholder:text-[#7a7399] w-full h-20 focus:border-[rgba(127,119,221,0.6)] focus:shadow-[0_0_0_3px_rgba(127,119,221,0.15)] rounded-2xl text-center text-3xl font-black tracking-[12px] outline-none transition-all"
                />
                <button
                  onClick={handleVerifyAndRegister}
                  disabled={verifying}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg flex items-center justify-center gap-2 h-14"
                >
                  {verifying ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : "Verify & Complete"}
                </button>
                <button 
                  onClick={() => setShowOTP(false)}
                  className="w-full text-center text-sm font-bold text-[#5a5380] hover:text-[#1a1340] transition-colors"
                >
                  Edit information
                </button>
              </div>
            )}

            <p className="text-center text-sm font-medium text-[#5a5380] mt-8">
              Already have an account?{" "}
              <Link href="/login" className="text-[#534AB7] hover:opacity-80 transition-colors font-bold ml-1">
                Sign in
              </Link>
            </p>
        </div>
      </div>

      {/* Mobile: stack vertically */}
      <style>{`
        @media (max-width: 1024px) {
          .auth-layout {
            flex-direction: column !important;
          }
          .auth-left {
            display: none !important;
          }
          .auth-right {
            flex: none !important;
            min-height: 100vh !important;
            padding: 2rem !important;
            background: transparent !important;
          }
        }
      `}</style>
    </div>
  );
}
