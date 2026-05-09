"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, LayoutDashboard, Database, TrendingUp, Award, Star, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignIn) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        toast.success("Signed in successfully!");
        if (email === "kalimdon07@gmail.com") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setShowOTP(true);
        toast.success("Account created! Please verify your email.");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Google login failed");
    }
  };

  const handleOtpChange = (element: any, index: number) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
        const token = otp.join("");
        const { error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'signup'
        });
        if (error) throw error;
        toast.success("Email verified!");
        router.push("/dashboard");
    } catch (error: any) {
        toast.error(error.message || "OTP Verification failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0a0d14] overflow-hidden font-sans selection:bg-purple-500/30">
      {/* Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-[1]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-[120px] mix-blend-screen opacity-20"
            style={{
              width: `${300 + i * 50}px`,
              height: `${300 + i * 50}px`,
              background: i % 2 === 0 ? 'linear-gradient(135deg, #7c5cfc, #a78bfa)' : 'linear-gradient(135deg, #06b6d4, #7c5cfc)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -150, 80, 0],
              scale: [1, 1.2, 0.9, 1],
              rotate: [0, 90, -90, 0],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="container relative z-10 grid lg:grid-cols-2 gap-8 items-center px-4 max-w-7xl mx-auto py-12">
        {/* Left Side - Hero */}
        <div className="hidden lg:flex flex-col space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#7c5cfc] to-[#6d28d9] flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-purple-500/20">
                IQ
              </div>
              <span className="text-3xl font-black tracking-tight text-white font-syne">CollegeMatch-AI</span>
            </div>
            <h1 className="text-6xl font-black text-white leading-tight font-syne">
              Your Dream College is <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7c5cfc] via-[#a78bfa] to-[#06b6d4] animate-gradient">
                One Click Away
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-lg font-dm-sans">
              Experience the future of college selection with our AI-driven prediction platform. Accurate, data-backed, and completely free.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: Star, label: "AI Predictions", emoji: "🎯" },
              { icon: TrendingUp, label: "Cutoff Trends", emoji: "📊" },
              { icon: Star, label: "Compare", emoji: "⚡" },
              { icon: Award, label: "43K Colleges", emoji: "🏆" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300 font-bold group">
                <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-500/10 group-hover:border-purple-500/30 transition-all">
                  <item.icon className="h-5 w-5 text-purple-400" />
                </div>
                <span>{item.emoji} {item.label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-10 pt-6 border-t border-white/5">
            {[
              { val: "43K+", label: "Colleges" },
              { val: "28", label: "States" },
              { val: "100%", label: "Free" }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-black text-white">{stat.val}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-y-1/2 h-[60%] w-px bg-gradient-to-b from-transparent via-[#7c5cfc]/30 to-transparent"></div>

        {/* Right Side - Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md mx-auto"
        >
          <div className="glass-card relative overflow-hidden" style={{
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.10)',
            borderRadius: '28px',
            padding: '40px',
            boxShadow: '0 32px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
          }}>
            <AnimatePresence mode="wait">
              {!showOTP ? (
                <motion.div
                  key="auth-form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="flex bg-white/5 p-1 rounded-xl mb-8 border border-white/10">
                    <button
                      onClick={() => setIsSignIn(true)}
                      className={`flex-1 py-2.5 text-sm font-black rounded-lg transition-all duration-300 ${isSignIn ? 'bg-gradient-to-br from-[#7c5cfc] to-[#6d28d9] text-white shadow-lg shadow-purple-500/40' : 'text-slate-400 hover:text-white'}`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setIsSignIn(false)}
                      className={`flex-1 py-2.5 text-sm font-black rounded-lg transition-all duration-300 ${!isSignIn ? 'bg-gradient-to-br from-[#7c5cfc] to-[#6d28d9] text-white shadow-lg shadow-purple-500/40' : 'text-slate-400 hover:text-white'}`}
                    >
                      Create Account
                    </button>
                  </div>

                  <button
                    onClick={handleGoogleLogin}
                    className="w-full h-14 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] rounded-xl flex items-center justify-center gap-3 transition-all group mb-6"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="text-white font-bold text-sm">Continue with Google</span>
                  </button>

                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/5" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">
                      <span className="bg-[#12151d] px-4 rounded-full">or continue with email</span>
                    </div>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
                    {!isSignIn && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full h-14 bg-white/5 border border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/10 rounded-xl px-4 text-white outline-none transition-all placeholder:text-slate-600 font-medium"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full h-14 bg-white/5 border border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/10 rounded-xl px-4 text-white outline-none transition-all placeholder:text-slate-600 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-14 bg-white/5 border border-white/10 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/10 rounded-xl px-4 text-white outline-none transition-all placeholder:text-slate-600 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="relative w-full h-14 bg-gradient-to-br from-[#7c5cfc] to-[#6d28d9] hover:shadow-[0_0_30px_rgba(124,92,252,0.4)] hover:-translate-y-0.5 active:scale-[0.98] rounded-xl text-white font-black transition-all overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isSignIn ? "Sign In" : "Create Account")}
                      </span>
                      {/* Shimmer Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center"
                >
                  <h2 className="text-3xl font-black text-white mb-2 font-syne">Verify Email</h2>
                  <p className="text-slate-400 mb-8 font-dm-sans">Enter the 6-digit code sent to <br /><span className="text-purple-400 font-bold">{email}</span></p>
                  
                  <div className="flex justify-between gap-2 mb-8">
                    {otp.map((data, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={data}
                        onChange={(e) => handleOtpChange(e.target, index)}
                        onFocus={(e) => e.target.select()}
                        className="w-12 h-14 bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:scale-105 rounded-xl text-center text-2xl font-black text-white outline-none transition-all font-syne"
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full h-14 bg-gradient-to-br from-[#7c5cfc] to-[#6d28d9] rounded-xl text-white font-black shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all active:scale-[0.98]"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Verify Account"}
                  </button>

                  <button
                    onClick={() => setShowOTP(false)}
                    className="mt-6 text-slate-500 hover:text-white font-bold text-sm transition-colors"
                  >
                    Back to registration
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
