"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { GraduationCap, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import LoginBackground from "@/components/LoginBackground";

export default function LoginPage() {
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
      // Step 1: Check credentials first
      await signInWithEmailAndPassword(auth, email, password);
      
      // Step 2: If credentials ok, send OTP
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
      toast.error(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndLogin = async () => {
    setVerifying(true);
    try {
      // Fetch OTP from Firestore
      const { getDoc, doc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      const otpDoc = await getDoc(doc(db, "otps", email));
      
      if (!otpDoc.exists()) {
        toast.error("No code found. Please resend.");
        return;
      }

      const data = otpDoc.data();
      const now = new Date();
      const expiresAt = data.expiresAt.toDate();

      if (otpInput !== data.code) {
        toast.error("Invalid verification code!");
        return;
      }

      if (now > expiresAt) {
        toast.error("Code expired. Please resend.");
        return;
      }

      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };



  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Google login failed");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-transparent overflow-hidden">
      <LoginBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl mb-6 font-bold text-2xl"
          >
            IQ
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
          <p className="text-white/70">Enter your credentials to access your portal</p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 8px 48px rgba(0, 0, 0, 0.4)'
        }}>
          <div className="grid gap-6">
            <button 
              onClick={handleGoogleLogin}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-white/40">Or continue with email</span>
              </div>
            </div>

            {!showOTP ? (
              <form onSubmit={handleSendOTP} className="grid gap-4">
                <div className="grid gap-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <input
                      id="email"
                      placeholder="Email address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: 'white',
                        borderRadius: '10px',
                        padding: '10px 14px 10px 40px',
                        width: '100%',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                      }}
                      className="placeholder:text-white/40 focus:border-white/30"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <input
                      id="password"
                      placeholder="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: 'white',
                        borderRadius: '10px',
                        padding: '10px 14px 10px 40px',
                        width: '100%',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                      }}
                      className="placeholder:text-white/40 focus:border-white/30"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #7F77DD, #534AB7)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontWeight: 500,
                    width: '100%',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(83, 74, 183, 0.3)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {loading ? "Authenticating..." : "Login to Dashboard"}
                </button>
              </form>
            ) : (
              <div className="grid gap-4">
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-center">
                  <p className="text-white text-sm font-medium">Verify Login</p>
                  <p className="text-white/60 text-xs mt-1">Enter the 6-digit code sent to {email}</p>
                </div>
                <div className="grid gap-2">
                  <input
                    placeholder="Enter 6-digit code"
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: 'white',
                      borderRadius: '10px',
                      padding: '12px',
                      width: '100%',
                      textAlign: 'center',
                      fontSize: '24px',
                      letterSpacing: '8px',
                      fontWeight: 'bold',
                      outline: 'none'
                    }}
                  />
                </div>
                <button
                  onClick={handleVerifyAndLogin}
                  disabled={verifying}
                  style={{
                    background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontWeight: 600,
                    width: '100%',
                    cursor: 'pointer'
                  }}
                >
                  {verifying ? "Verifying..." : "Verify & Access Dashboard"}
                </button>
                <button 
                  onClick={() => setShowOTP(false)}
                  className="text-white/40 text-xs hover:text-white transition-colors"
                >
                  Back to credentials
                </button>
              </div>
            )}


            <p className="text-sm text-white/60 text-center mt-4">
              Don't have an account?{" "}
              <Link href="/register" className="text-white font-semibold hover:text-[#7F77DD] transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
