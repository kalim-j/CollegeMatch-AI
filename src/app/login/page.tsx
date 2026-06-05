'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Text } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import HomepageBackground from '@/components/3D/HomepageBackground';
import PageTransition from '@/components/3D/PageTransition';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  setPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { isAdminEmail } from "@/lib/admin";
import { toast } from "sonner";

function FloatingLoginIndicator() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.01;
      groupRef.current.rotation.y += 0.015;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <group ref={groupRef}>
        {/* Outer ring */}
        <mesh>
          <torusGeometry args={[1, 0.15, 32, 100]} />
          <meshPhongMaterial
            color="#7c3aed"
            emissive="#a78bfa"
            wireframe
          />
        </mesh>

        {/* Inner sphere */}
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshPhongMaterial color="#7c3aed" emissive="#6d28d9" />
        </mesh>

        {/* Text inside */}
        <Text position={[0, 0, 0.6]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle">
          LOG IN
        </Text>
      </group>
    </Float>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await setPersistence(auth, browserSessionPersistence);
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!");
      if (isAdminEmail(email)) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
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
      if (isAdminEmail(user.email || '')) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Google login failed");
      toast.error(err.message || "Google login failed");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  if (!mounted) return null;

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
        
        <HomepageBackground />

        {/* Floating 3D element near title */}
        <div className="fixed right-10 top-20 w-32 h-32 -z-10 hidden md:block">
          <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={1} />
            <FloatingLoginIndicator />
            <OrbitControls autoRotate autoRotateSpeed={1} enableZoom={false} />
          </Canvas>
        </div>

        <div className="relative w-full max-w-md px-4 py-8 z-10">
          <motion.div
            className="w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Logo & Title */}
            <motion.div
              className="text-center mb-8"
              variants={itemVariants}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  CM
                </motion.div>
                <div className="text-left">
                  <h1 className="text-2xl font-black text-gray-900 leading-none">
                    CollegeMatch <span className="text-purple-600 font-extrabold">AI</span>
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">AI College Predictor India</p>
                </div>
              </div>

              <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600 font-semibold">Sign in to continue your college journey</p>
            </motion.div>

            {/* Login Form */}
            <motion.form
              onSubmit={handleLogin}
              className="bg-white/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl shadow-purple-200/30 border border-purple-200/50"
              variants={itemVariants}
              transition={{ delay: 0.2 }}
            >
              {/* Email Input */}
              <motion.div
                className="mb-6"
                variants={itemVariants}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-bold text-gray-750 mb-2 uppercase tracking-wider text-purple-700">
                  Email Address
                </label>
                <motion.input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-5 py-3.5 rounded-xl bg-white/70 backdrop-blur border-2 border-purple-200 text-gray-950 placeholder:text-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-250/20 transition-all duration-300 font-medium text-sm"
                  whileFocus={{ scale: 1.02 }}
                />
              </motion.div>

              {/* Password Input */}
              <motion.div
                className="mb-6"
                variants={itemVariants}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-bold text-gray-750 mb-2 uppercase tracking-wider text-purple-700">
                  Password
                </label>
                <div className="relative">
                  <motion.input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 rounded-xl bg-white/70 backdrop-blur border-2 border-purple-200 text-gray-955 placeholder:text-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-250/20 transition-all duration-300 font-medium text-sm"
                    whileFocus={{ scale: 1.02 }}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-505 hover:text-gray-700 transition"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? '👁️' : '👁️🗨️'}
                  </motion.button>
                </div>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 text-sm font-semibold"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ⚠️ {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  backgroundPosition: { duration: 3, repeat: Infinity },
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <motion.div
                className="my-6 flex items-center gap-3"
                variants={itemVariants}
                transition={{ delay: 0.5 }}
              >
                <div className="flex-1 h-[1px] bg-purple-200" />
                <span className="text-xs text-gray-505 font-semibold">OR</span>
                <div className="flex-1 h-[1px] bg-purple-200" />
              </motion.div>

              {/* Google Login */}
              <motion.button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3 rounded-xl text-sm font-bold text-gray-900 bg-white border-2 border-purple-200 hover:bg-purple-50 transition-all duration-300 flex items-center justify-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                variants={itemVariants}
                transition={{ delay: 0.6 }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </motion.button>
            </motion.form>

            {/* Sign Up Link */}
            <motion.p
              className="text-center mt-6 text-gray-650"
              variants={itemVariants}
              transition={{ delay: 0.7 }}
            >
              Don't have an account?{' '}
              <Link href="/register" className="text-purple-600 font-bold hover:text-purple-755 transition">
                Sign up now
              </Link>
            </motion.p>

            {/* Back to Home */}
            <motion.div
              className="text-center mt-4"
              variants={itemVariants}
              transition={{ delay: 0.8 }}
            >
              <Link href="/" className="text-gray-505 text-sm hover:text-gray-750 transition flex items-center justify-center gap-1">
                ← Back to Home
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
