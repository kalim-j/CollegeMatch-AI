"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Github, ArrowRight } from "lucide-react";
import Link from "next/link";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  setPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import LoginBackground from "@/components/LoginBackground";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await setPersistence(auth, browserSessionPersistence);
      
      if (isSignIn) {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
        if (email === "kalimdon07@gmail.com") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          fullName: fullName,
          email: email,
          createdAt: new Date(),
          preferredCourse: "Computer Science"
        });

        toast.success("Account created successfully!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await setPersistence(auth, browserSessionPersistence);
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: user.uid,
          fullName: user.displayName || "New Student",
          email: user.email,
          createdAt: new Date(),
          preferredCourse: "Computer Science"
        });
      }

      toast.success("Signed in with Google!");
      if (user.email === "kalimdon07@gmail.com") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Google login failed");
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-[#05071a]">
      <LoginBackground />
      
      <div className="w-full max-w-[1100px] grid lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Side — Branding */}
        <div className="hidden lg:flex flex-col space-y-10">
          <Logo />
          
          <div className="space-y-6">
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tighter">
              Unlock your <br />
              <span className="text-gradient">academic potential.</span>
            </h1>
            <p className="text-xl text-white/40 font-medium leading-relaxed max-w-md">
              Join 10,000+ students using AI to find the perfect college, scholarships, and career roadmap.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/5">
             <div className="space-y-1">
                <p className="text-2xl font-black text-white">500+</p>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Colleges Mapped</p>
             </div>
             <div className="space-y-1">
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Free to use</p>
             </div>
          </div>
        </div>

        {/* Right Side — Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[480px] mx-auto"
        >
          <div className="glass-card p-10 md:p-12 space-y-10 border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tight">
                {isSignIn ? "Welcome back" : "Create Account"}
              </h2>
              <p className="text-white/40 font-medium">
                {isSignIn ? "Enter your credentials to continue" : "Join the smartest admission community"}
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full h-14 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] rounded-2xl flex items-center justify-center gap-3 transition-all group"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-white font-bold text-sm">Continue with Google</span>
              </button>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-[10px] font-black text-white/20 uppercase tracking-widest">or email</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <form onSubmit={handleAuth} className="space-y-5">
                {!isSignIn && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      className="w-full h-14 bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-5 text-white outline-none transition-all placeholder:text-white/20 font-medium"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full h-14 bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-5 text-white outline-none transition-all placeholder:text-white/20 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-14 bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-5 text-white outline-none transition-all placeholder:text-white/20 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full h-16 text-lg group relative overflow-hidden flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>{isSignIn ? "Sign In" : "Create Account"}</span>}
                  {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </div>

            <p className="text-center text-sm font-medium text-white/30">
              {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
              <button 
                onClick={() => setIsSignIn(!isSignIn)}
                className="text-white hover:text-indigo-400 transition-colors font-bold ml-1"
              >
                {isSignIn ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
