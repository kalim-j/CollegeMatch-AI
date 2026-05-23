"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Search, Sparkles, Phone, ArrowRight, Play, Star, 
  Quote, Users, MapPin, Building, Award, Notebook,
  ShieldCheck, Zap, LayoutGrid, ClipboardList, Bot, 
  Building2, ArrowUpRight
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
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-32 overflow-hidden">
        <AppBackground />
        
        <div className="container px-6 mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            {/* AI Pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-indigo-500/30 text-[11px] font-black uppercase tracking-widest text-indigo-300 shadow-[0_0_20px_rgba(127,119,221,0.2)]"
            >
              <Bot size={14} className="text-indigo-400" />
              Powered by Groq AI · Llama-3.3-70b
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[1.1]">
                <span className="text-gradient">Find your dream college</span><br />
                <span className="text-white">with the power of AI</span>
              </h1>
              <p className="text-2xl md:text-3xl text-white/40 font-medium tracking-tight">
                in just 9 smart questions.
              </p>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed"
            >
              CollegeMatch-AI analyses your marks, cutoff, community, district and stream to suggest the best-fit colleges across India — for free.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
            >
              <Link href="/register">
                <button className="btn-primary flex items-center justify-center gap-3 group h-16 px-8 text-lg w-full sm:w-auto">
                  <span>Find colleges</span> <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/register">
                <button className="h-16 px-8 text-lg font-bold rounded-2xl border border-teal-500/30 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 hover:border-teal-500/50 transition-all flex items-center justify-center gap-3 w-full sm:w-auto shadow-[0_0_20px_rgba(45,212,191,0.15)] group">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                  </span>
                  <span>Discover my stream</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform opacity-70" />
                </button>
              </Link>
              <button onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }} className="btn-ghost flex items-center justify-center gap-3 h-16 px-6 text-lg w-full sm:w-auto">
                <Play size={20} className="fill-white" /> How it works
              </button>
            </motion.div>

            {/* Trust Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 text-[12px] font-bold text-white/30 uppercase tracking-[0.1em]"
            >
              <span>10,000+ Students Matched</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>500+ Colleges</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>All India Coverage</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span className="text-teal-500">Free Forever</span>
            </motion.div>
          </div>

          {/* Floating Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto">
            <GlassCard delay={600} className="p-8 text-center space-y-2">
              <p className="text-4xl font-black text-white">92%</p>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Average match accuracy</p>
            </GlassCard>
            <GlassCard delay={700} className="p-8 text-center space-y-2">
              <p className="text-4xl font-black text-white">8</p>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Colleges per result</p>
            </GlassCard>
            <GlassCard delay={800} className="p-8 text-center space-y-2">
              <p className="text-4xl font-black text-white">2 min</p>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Time to your results</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Section 2 — How it works */}
      <section id="how-it-works" className="py-32 relative border-y border-white/5 bg-[#080c24]/50">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-20 space-y-4">
            <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em]">How it works</p>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Three steps to your perfect college</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <GlassCard className="p-10 space-y-6 relative group">
              <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-lg">
                <ClipboardList size={28} />
              </div>
              <h3 className="text-2xl font-black text-white">Answer 9 smart questions</h3>
              <p className="text-white/50 leading-relaxed">Tell us your marks, stream, state, district, cutoff and community. Every detail helps our AI fine-tune your match.</p>
              <div className="absolute top-10 right-10 text-4xl font-black text-white/5 select-none">01</div>
            </GlassCard>

            {/* Step 2 */}
            <GlassCard className="p-10 space-y-6 relative group">
              <div className="h-14 w-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all shadow-lg">
                <Bot size={28} />
              </div>
              <h3 className="text-2xl font-black text-white">AI finds your matches</h3>
              <p className="text-white/50 leading-relaxed">Groq AI analyses 500+ colleges and ranks the top 8 for your profile based on real-time cutoff trends and placement data.</p>
              <div className="absolute top-10 right-10 text-4xl font-black text-white/5 select-none">02</div>
            </GlassCard>

            {/* Step 3 */}
            <GlassCard className="p-10 space-y-6 relative group">
              <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-lg">
                <Building2 size={28} />
              </div>
              <h3 className="text-2xl font-black text-white">Apply with confidence</h3>
              <p className="text-white/50 leading-relaxed">Get detailed cutoff data, NAAC grades, course lists and direct admission expert contact to secure your seat.</p>
              <div className="absolute top-10 right-10 text-4xl font-black text-white/5 select-none">03</div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Section 3 — Features grid */}
      <section id="features" className="py-32">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-20 space-y-4">
            <p className="text-[11px] font-black text-teal-400 uppercase tracking-[0.3em]">What you get</p>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Everything you need for admission</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MapPin, title: "District-wise search", desc: "Find the best colleges near your home or preferred district." },
              { icon: Zap, title: "Cutoff mark matching", desc: "AI calculates ±10 safety and aspirational college ranges for you." },
              { icon: Award, title: "Scholarship finder", desc: "Instantly discover 8+ real scholarships based on your unique profile." },
              { icon: Notebook, title: "Entrance exam guide", desc: "Stay ahead with a complete roadmap of all relevant national and state exams." },
              { icon: Users, title: "UG & PG support", desc: "Tailored recommendations across 15+ streams for both levels." },
              { icon: ShieldCheck, title: "Community quota", desc: "Full support for BC, MBC, OC, SC/ST, and NRI category matching." },
            ].map((f, i) => (
              <GlassCard key={i} className="p-8 group hover:border-indigo-500/30 flex flex-col h-full">
                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 transition-colors mb-6">
                  <f.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Testimonials */}
      <section className="py-32 bg-[#05071a] border-t border-white/5">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Students who found their dream college</h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto">Real students. Real results. Powered by Groq AI.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {testimonials.length > 0 ? (
                testimonials.map((t, idx) => (
                  <GlassCard key={t.id} delay={idx * 100} className="p-10 space-y-8 flex flex-col group h-full">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-1 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < (t.rating || 5) ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <Quote className="text-white/5 group-hover:text-indigo-500/20 transition-colors" size={40} />
                    </div>
                    
                    <p className="text-white/70 italic leading-relaxed text-lg flex-1">
                      &quot;{t.review}&quot;
                    </p>

                    <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                      <div className="h-14 w-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center font-black text-indigo-400 text-xl shadow-lg">
                        {t.name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-white truncate">{t.name}</p>
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest truncate">{t.college}</p>
                        <div className="flex gap-2 mt-2">
                           <span className="px-2 py-0.5 bg-indigo-500/10 rounded-md text-[9px] font-black text-indigo-300 uppercase tracking-wider border border-indigo-500/20">{t.stream}</span>
                           <span className="px-2 py-0.5 bg-white/5 rounded-md text-[9px] font-black text-white/40 uppercase tracking-wider border border-white/5">Class of {t.year}</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))
              ) : (
                [1,2,3].map(i => <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse" />)
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Section 5 — CTA Banner */}
      <section className="py-32 px-6">
        <div className="container mx-auto">
          <div className="relative rounded-[40px] overflow-hidden border border-indigo-500/30 p-12 md:p-24 text-center space-y-10 group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-teal-500/5 to-transparent -z-10" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--indigo),_transparent_70%)] blur-[100px] -z-10 group-hover:opacity-30 transition-opacity" />
            
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-none">
              Your dream college <br /> is one AI away.
            </h2>
            <p className="text-xl text-white/50 max-w-xl mx-auto">Start your free college match analysis in just 2 minutes. No credit card required.</p>
            
            <Link href="/register" className="inline-block">
              <button className="btn-primary h-20 px-16 text-xl rounded-3xl shadow-[0_0_40px_rgba(127,119,221,0.4)] group hover:scale-105 transition-all">
                Start for free <ArrowUpRight size={24} className="inline-block ml-2 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
