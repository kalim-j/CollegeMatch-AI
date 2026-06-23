'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import HomepageBackground from '@/components/3D/HomepageBackground';
import PageTransition from '@/components/3D/PageTransition';
import { db } from '@/lib/firebase';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const q = query(
          collection(db, 'testimonials'),
          where('approved', '==', true),
          limit(3)
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setTestimonials(fetched);
      } catch (error) {
        console.error('Testimonials fetch error:', error);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
        
        {/* 3D Background */}
        <HomepageBackground />

        {/* Content */}
        <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 py-20 z-10">
          
          {/* Hero Section */}
          <motion.div
            className="max-w-4xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-block mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <span className="px-4 py-2 rounded-full text-xs font-bold bg-[#f0eeff] dark:bg-[rgba(127,119,221,0.15)] text-[#534AB7] dark:text-[#a89ef8] border border-[rgba(127,119,221,0.3)] shadow-sm">
                ✨ AI-Powered College Matching
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              className="text-5xl sm:text-7xl font-black mb-6 leading-tight tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <span className="text-[#534AB7] dark:text-[#a89ef8]">
                Find Your Perfect
              </span>
              <br />
              <span className="text-[#1a1340] dark:text-white">College Match</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl text-[#4a4370] dark:text-[rgba(255,255,255,0.72)] mb-8 max-w-2xl mx-auto leading-relaxed font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              CollegeMatch AI analyzes your marks, preferences, and 500+ colleges across India to give you the most accurate predictions in seconds.
            </motion.p>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-4 mb-12 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {[
                { icon: '📊', label: '98.4%', desc: 'Match Accuracy' },
                { icon: '👥', label: '10K+', desc: 'Students' },
                { icon: '🏫', label: '500+', desc: 'Colleges' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="p-4 rounded-2xl bg-white dark:bg-[rgba(255,255,255,0.05)] border border-[rgba(127,119,221,0.12)] dark:border-[rgba(255,255,255,0.10)] shadow-lg backdrop-blur-xl"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <p className="text-2xl mb-1">{stat.icon}</p>
                  <p className="font-black text-[#1a1340] dark:text-white">{stat.label}</p>
                  <p className="text-xs text-[#6b6894] dark:text-[rgba(255,255,255,0.55)] font-semibold">{stat.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link href="/dashboard/predictor"
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg shadow-lg shadow-purple-300/50 hover:shadow-xl transition-all duration-300 flex items-center gap-2 justify-center">
                <span>Get Started</span>
                <motion.svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </Link>
              <Link href="/dashboard/scholarships"
                className="px-8 py-4 rounded-xl backdrop-blur font-bold transition-all duration-300 text-[#534AB7] dark:text-white border border-[#534AB7] dark:border-[rgba(255,255,255,0.25)] hover:bg-[rgba(83,74,183,0.08)] dark:hover:bg-[rgba(255,255,255,0.08)]">
                Find Scholarships
              </Link>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {[
              {
                icon: '⚡',
                title: 'Smart Predictions',
                desc: 'AI analyzes your marks and preferences',
                color: 'from-purple-500 to-purple-600',
              },
              {
                icon: '🎓',
                title: 'Scholarship Finder',
                desc: 'Discover 8+ real scholarships instantly',
                color: 'from-blue-500 to-blue-600',
              },
              {
                icon: '🗺️',
                title: 'College Map',
                desc: 'Interactive map of 500+ colleges',
                color: 'from-cyan-500 to-cyan-600',
              },
              {
                icon: '📊',
                title: 'Cutoff Calculator',
                desc: 'Live-calculates your TNEA cutoff',
                color: 'from-green-500 to-green-600',
              },
              {
                icon: '💬',
                title: 'AI Counsellor',
                desc: '24/7 personalized AI assistant',
                color: 'from-pink-500 to-pink-600',
              },
              {
                icon: '🎯',
                title: 'Perfect Match',
                desc: '98.4% accuracy in predictions',
                color: 'from-amber-500 to-amber-600',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-2xl bg-white/70 dark:bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-purple-100 dark:border-[rgba(255,255,255,0.10)] hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05, y: -10 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-gray-950 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-500 dark:text-[rgba(255,255,255,0.72)] text-sm font-semibold">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* How It Works */}
          <motion.div
            className="max-w-4xl mx-auto mb-16 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <h2 className="text-4xl font-black text-center text-gray-955 dark:text-white mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Share Your Details',
                  desc: 'Tell us your marks and preferences',
                },
                {
                  step: '02',
                  title: 'AI Analysis',
                  desc: 'Our AI scans 500+ colleges instantly',
                },
                {
                  step: '03',
                  title: 'Get Matched',
                  desc: 'Receive your top 8 colleges',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="relative p-6 rounded-2xl bg-white/70 dark:bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-purple-100 dark:border-[rgba(255,255,255,0.10)]"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-5xl font-black text-purple-200 dark:text-purple-400 mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-500 dark:text-[rgba(255,255,255,0.72)] font-semibold">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <motion.div
              className="max-w-5xl mx-auto mb-16 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              <h2 className="text-3xl font-black text-center text-gray-955 dark:text-white mb-12">Success Stories</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t, idx) => (
                  <div key={idx} className="bg-white/70 dark:bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-purple-100 dark:border-[rgba(255,255,255,0.10)] rounded-2xl p-6 shadow-sm">
                    <p className="text-gray-600 dark:text-[rgba(255,255,255,0.72)] italic text-sm mb-4">"{t.review}"</p>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-gray-400 dark:text-[rgba(255,255,255,0.55)] text-xs mt-0.5">{t.college}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Final CTA */}
          <motion.div
            className="bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 rounded-3xl p-12 text-center shadow-2xl shadow-purple-300/50 max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4 }}
          >
            <h2 className="text-4xl font-black text-white mb-4">
              Ready to Find Your Dream College?
            </h2>
            <p className="text-white/80 mb-6 text-lg">
              Join 10,000+ students who found their perfect match
            </p>
            <Link href="/register">
              <motion.button
                className="px-8 py-4 rounded-xl bg-white text-purple-600 font-black hover:bg-white/90 transition-all duration-300 shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Prediction
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
