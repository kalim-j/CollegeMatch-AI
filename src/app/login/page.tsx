"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
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
    <div className="relative min-h-screen min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden px-4 py-8"
      style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 50%, #f5f0ff 100%)' }}>

      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large morphing blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, #7c3aed, #a78bfa)',
            animation: 'morphBlob 12s ease-in-out infinite, float 8s ease-in-out infinite',
            filter: 'blur(60px)',
          }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #2563eb, #60a5fa)',
            animation: 'morphBlob 15s ease-in-out infinite reverse, float 10s ease-in-out infinite 2s',
            filter: 'blur(80px)',
          }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #06b6d4, #a78bfa)',
            animation: 'morphBlob 10s ease-in-out infinite 1s',
            filter: 'blur(70px)',
          }} />

        {/* Floating sparkles */}
        {[...Array(12)].map((_, i) => (
          <div key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${10 + (i * 8)}%`,
              top: `${15 + (i % 5) * 18}%`,
              background: i % 3 === 0 ? '#7c3aed' : i % 3 === 1 ? '#2563eb' : '#06b6d4',
              opacity: 0.4,
              animation: `sparkle ${3 + (i * 0.5)}s ease-in-out infinite ${i * 0.3}s`,
            }} />
        ))}

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(124,58,237,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl p-6 sm:p-10 mx-auto bg-white/70 backdrop-blur-2xl border border-white/80"
        style={{
          boxShadow: '0 25px 50px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.9)',
          animation: 'popIn 0.6s ease forwards',
        }}>

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-lg shadow-violet-500/30 flex-shrink-0">
            <span className="text-white font-black text-sm sm:text-base">CM</span>
          </div>
          <div className="text-left">
            <p className="text-gray-900 font-bold text-lg sm:text-xl leading-tight">
              CollegeMatch <span className="text-purple-600">AI</span>
            </p>
            <p className="text-gray-500 text-xs">
              AI College Predictor India
            </p>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-1 sm:mb-2">
          {isSignIn ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-gray-500 text-center text-sm mb-6 sm:mb-8">
          {isSignIn ? "Sign in to continue your college journey" : "Join the smartest admission community"}
        </p>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium text-gray-700 bg-white/60 border border-purple-200 hover:bg-white/80 transition-all duration-300 shadow-sm"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-gray-800 font-bold text-sm">Continue with Google</span>
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-purple-100"></div>
            <span className="flex-shrink mx-4 text-[10px] font-black text-purple-300 uppercase tracking-widest">or email</span>
            <div className="flex-grow border-t border-purple-100"></div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isSignIn && (
              <div className="space-y-1 text-left">
                <label className="block text-xs font-semibold text-purple-700 mb-2 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-white/60 border border-purple-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 backdrop-blur-sm transition-all duration-300"
                />
              </div>
            )}
            <div className="space-y-1 text-left">
              <label className="block text-xs font-semibold text-purple-700 mb-2 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm bg-white/60 border border-purple-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 backdrop-blur-sm transition-all duration-300"
              />
            </div>
            <div className="space-y-1 text-left">
              <label className="block text-xs font-semibold text-purple-700 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-white/60 border border-purple-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 backdrop-blur-sm transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-purple-300/50 flex items-center justify-center gap-2 mt-6"
              style={{ backgroundSize: '200%', animation: 'gradientShift 3s ease infinite' }}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>{isSignIn ? "Sign In" : "Create Account"}</span>}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>

        <p className="text-center text-sm font-medium text-gray-500 mt-6">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
          <button 
            onClick={() => setIsSignIn(!isSignIn)}
            className="text-purple-600 hover:text-purple-800 transition-colors font-bold ml-1"
          >
            {isSignIn ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>

      {/* Back to home link */}
      <a href="/" className="mt-4 text-gray-500 text-sm hover:text-gray-700 transition flex items-center gap-1">
        ← Back to Home
      </a>
    </div>
  );
}
