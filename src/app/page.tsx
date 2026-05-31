"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Search, Sparkles, Phone, ArrowRight, Play, Star, 
  Quote, Users, MapPin, Building, Award, Notebook,
  ShieldCheck, Zap, LayoutGrid, ClipboardList, Bot, 
  Building2, ArrowUpRight, GraduationCap, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import AppBackground from "@/components/AppBackground";
import GlassCard from "@/components/GlassCard";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const q = query(
          collection(db, "testimonials"),
          where("approved", "==", true),
          limit(6)
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        fetched.sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setTestimonials(fetched);
      } catch (error) {
        console.error("Testimonials fetch error:", error);
      }
    };
    fetchTestimonials();
  }, []);

  if (loading) return null;

  return (
    <div className="flex flex-col min-h-screen bg-transparent selection:bg-indigo-500/30 selection:text-white">
      
      {/* Section 1 — Hero */}
      <section className="relative min-h-[95vh] flex items-center justify-center pt-28 pb-32 overflow-hidden">
        <AppBackground />
        
        {/* Animated Background Shapes */}
        <motion.div 
          animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%] w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -z-10"
        />
        <motion.div 
          animate={{ y: [0, 30, 0], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-[10%] w-80 h-80 bg-teal-500/20 rounded-full blur-[100px] -z-10"
        />

        <div className="container px-6 mx-auto relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            {/* AI Pill */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-xs font-black uppercase tracking-widest text-indigo-300 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all cursor-default"
            >
              <Bot size={16} className="text-indigo-400" />
              Powered by Groq AI · Llama-3.3-70b
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="space-y-6"
            >
              <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tighter leading-[1.05] text-white">
                Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">dream college</span><br />
                with the power of AI
              </h1>
              <p className="text-xl md:text-2xl text-white/60 font-medium tracking-tight max-w-2xl mx-auto">
                CollegeMatch AI analyses cutoff data from 30+ top Indian colleges to give you a data-backed roadmap to your dream campus in seconds.
              </p>
            </motion.div>

            {/* CTA Box (Search-like Component) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="max-w-2xl mx-auto mt-12 glass-card p-2 pl-6 rounded-full flex flex-col sm:flex-row items-center gap-4 hover:border-indigo-400/50 transition-colors"
            >
              <div className="flex-1 flex items-center gap-3 w-full sm:w-auto py-2 sm:py-0">
                <Search className="text-white/40 shrink-0" size={24} />
                <span className="text-white/50 font-medium text-lg w-full text-left">Start your free college prediction...</span>
              </div>
              <Link href="/register" className="w-full sm:w-auto">
                <button className="btn-primary h-14 w-full sm:w-auto px-8 rounded-full text-base whitespace-nowrap shadow-md">
                  Analyze My Marks <ArrowRight size={18} className="ml-1" />
                </button>
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="pt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[13px] font-bold text-white/40 uppercase tracking-wider"
            >
              <span className="flex items-center gap-2"><Users size={16} className="text-indigo-400" /> 10K+ Students</span>
              <span className="flex items-center gap-2"><Building size={16} className="text-teal-400" /> 500+ Colleges</span>
              <span className="flex items-center gap-2"><Award size={16} className="text-amber-400" /> Free Forever</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marquee Trust Banner */}
      <section className="border-y border-white/10 bg-white/5 backdrop-blur-md py-6 overflow-hidden flex whitespace-nowrap relative">
        <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-[#05071a] to-transparent z-10" />
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-[#05071a] to-transparent z-10" />
        
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex gap-16 items-center text-white/20 font-black text-2xl uppercase tracking-widest px-8"
        >
          <span>Anna University</span> • <span>PSG Tech</span> • <span>CIT Coimbatore</span> • <span>SSN College</span> • <span>Madras Institute</span> • <span>Thiagarajar</span> •
          <span>Anna University</span> • <span>PSG Tech</span> • <span>CIT Coimbatore</span> • <span>SSN College</span> • <span>Madras Institute</span> • <span>Thiagarajar</span> •
        </motion.div>
      </section>

      {/* Section 2 — How it works */}
      <section id="how-it-works" className="py-32 relative">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-24 space-y-4">
            <p className="text-[12px] font-black text-indigo-400 uppercase tracking-[0.2em] bg-indigo-500/10 border border-indigo-500/20 inline-block px-4 py-1.5 rounded-full">The Process</p>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Three steps to your perfect match</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Step 1 */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="glass-card p-10 relative overflow-hidden group"
            >
              <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                <ClipboardList size={32} />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">1. Share Your Details</h3>
              <p className="text-white/60 leading-relaxed text-lg">Tell us your 12th marks, preferred state, district, stream, and community quota. It takes less than a minute.</p>
              <div className="absolute -bottom-6 -right-4 text-9xl font-black text-white/5 select-none group-hover:text-indigo-500/10 transition-colors">1</div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="glass-card p-10 relative overflow-hidden group"
            >
              <div className="h-16 w-16 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-teal-500/20 transition-all duration-300">
                <Bot size={32} />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">2. AI Analysis</h3>
              <p className="text-white/60 leading-relaxed text-lg">Our advanced AI scans historical cutoff trends, placements, and NAAC grades across 500+ colleges instantly.</p>
              <div className="absolute -bottom-6 -right-4 text-9xl font-black text-white/5 select-none group-hover:text-teal-500/10 transition-colors">2</div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="glass-card p-10 relative overflow-hidden group"
            >
              <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                <GraduationCap size={32} />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">3. Get Admissions</h3>
              <p className="text-white/60 leading-relaxed text-lg">Receive your curated list of top 8 colleges, complete with scholarship info and direct counselor chat.</p>
              <div className="absolute -bottom-6 -right-4 text-9xl font-black text-white/5 select-none group-hover:text-indigo-500/10 transition-colors">3</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 3 — Features grid */}
      <section id="features" className="py-32 bg-[#080c24]/50 border-t border-white/5">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-24 space-y-4">
            <p className="text-[12px] font-black text-teal-400 uppercase tracking-[0.2em] bg-teal-500/10 border border-teal-500/20 inline-block px-4 py-1.5 rounded-full">Core Features</p>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Everything you need, in one place</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: MapPin, title: "District-wise search", desc: "Find the best colleges near your home or preferred district without moving far." },
              { icon: Zap, title: "Smart Cutoff Engine", desc: "Live-calculates your exact TNEA cutoff from subject marks automatically." },
              { icon: Award, title: "Scholarship finder", desc: "Instantly discover 8+ real scholarships based on your unique profile." },
              { icon: MessageSquare, title: "AI Chat Counsellor", desc: "Talk to our 24/7 personalized AI assistant to answer all your admission queries." },
              { icon: Users, title: "Community Quota", desc: "Full support for BC, MBC, SC/ST, and OC category matching algorithms." },
              { icon: Notebook, title: "Exam Guidelines", desc: "Stay ahead with a complete roadmap of relevant national and state entrance exams." },
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="glass-card p-8 group"
              >
                <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors duration-300">
                  <f.icon size={24} />
                </div>
                <h3 className="text-xl font-black text-white mb-3">{f.title}</h3>
                <p className="text-white/50 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Testimonials */}
      <section className="py-32">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Loved by students across India</h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">Real success stories from students who found their perfect match.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatePresence>
              {testimonials.length > 0 ? (
                testimonials.slice(0, 3).map((t, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    key={t.id} 
                    className="glass-card p-10 flex flex-col h-full"
                  >
                    <div className="flex gap-1 text-amber-500 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} fill={i < (t.rating || 5) ? "currentColor" : "none"} />
                      ))}
                    </div>
                    
                    <p className="text-white/70 italic leading-relaxed text-lg flex-1 mb-8">
                      &quot;{t.review}&quot;
                    </p>

                    <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                      <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center font-black text-indigo-400 text-lg">
                        {t.name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-white truncate">{t.name}</p>
                        <p className="text-xs font-bold text-white/50 truncate">{t.college}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                [1,2,3].map(i => <div key={i} className="h-64 rounded-[2rem] bg-white/5 animate-pulse" />)
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Section 5 — CTA Banner */}
      <section className="py-24 px-6 border-t border-white/5 bg-[#080c24]/50">
        <div className="container mx-auto">
          <div className="bg-gradient-to-br from-indigo-500/20 via-teal-500/10 to-transparent border border-indigo-500/30 rounded-[3rem] overflow-hidden p-16 md:p-24 text-center space-y-10 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
            
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight relative z-10">
              Ready to find your <br /> dream college?
            </h2>
            <p className="text-xl text-white/60 max-w-xl mx-auto relative z-10">Join thousands of students and let our AI do the heavy lifting. Free forever.</p>
            
            <div className="relative z-10 mt-8">
              <Link href="/register" className="inline-block">
                <button className="btn-primary h-16 px-12 text-lg font-bold rounded-full shadow-xl flex items-center gap-2">
                  Get Started Now <ArrowRight size={20} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
