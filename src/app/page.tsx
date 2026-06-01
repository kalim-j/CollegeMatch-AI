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
import { collection, query, where, limit, getDocs, doc, getDoc } from "firebase/firestore";
import AppBackground from "@/components/AppBackground";
import GlassCard from "@/components/GlassCard";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [matchAccuracy, setMatchAccuracy] = useState<number>(98.4);
  const [ratedCount, setRatedCount] = useState<number>(1248);

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

    const fetchStats = async () => {
      try {
        const docSnap = await getDoc(doc(db, "publicStats", "ratings"));
        if (docSnap.exists()) {
          const data = docSnap.data();
          const happy = data.happyCount || 0;
          const total = data.totalCount || 0;
          if (total > 0) {
            const acc = Math.round((happy / total) * 100 * 10) / 10;
            setMatchAccuracy(acc);
            setRatedCount(total + 1248);
          }
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll('[data-animate]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              (entry.target as HTMLElement).style.opacity = '1';
              (entry.target as HTMLElement).style.transform = 'translateY(0)';
            }, i * 80);
          }
        });
      },
      { threshold: 0.1 }
    );
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (loading) return null;

  return (
    <div className="flex flex-col min-h-screen bg-transparent selection:bg-purple-200 selection:text-purple-900"
      style={{ background: 'linear-gradient(135deg, #f0f4ff, #faf5ff)' }}>
      
      {/* Section 1 — Hero */}
      <section className="relative min-h-[95vh] flex items-center justify-center pt-28 pb-32 overflow-hidden">
        
        {/* Animated Background Shapes */}
        <div 
          style={{ animation: 'float 5s ease-in-out infinite' }}
          className="absolute top-20 left-[10%] w-64 h-64 bg-purple-300/30 rounded-full blur-[80px] -z-10"
        />
        <div 
          style={{ animation: 'float 7s ease-in-out infinite reverse' }}
          className="absolute bottom-20 right-[10%] w-80 h-80 bg-blue-300/20 rounded-full blur-[100px] -z-10"
        />

        <div className="container px-6 mx-auto relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            {/* AI Pill */}
            <div
              data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-xl border border-purple-100 text-xs font-bold uppercase tracking-wider text-purple-700 shadow-sm hover:shadow-md transition-all cursor-default"
            >
              <Bot size={16} className="text-purple-600" />
              Powered by Groq AI · Llama-3.3-70b
            </div>

            {/* Headline */}
            <div
              data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
              className="space-y-6"
            >
              <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tighter leading-[1.05] text-gray-900">
                Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">dream college</span><br />
                with the power of AI
              </h1>
              <p className="text-xl md:text-2xl text-gray-500 font-medium tracking-tight max-w-2xl mx-auto">
                CollegeMatch AI analyses cutoff data from 30+ top Indian colleges to give you a data-backed roadmap to your dream campus in seconds.
              </p>
            </div>

            {/* CTA Box (Search-like Component) */}
            <div
              data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
              className="max-w-2xl mx-auto mt-12 bg-white/70 backdrop-blur-2xl border border-purple-100 p-2 pl-6 rounded-full flex flex-col sm:flex-row items-center gap-4 hover:border-purple-300 transition-colors shadow-lg shadow-purple-100/30"
            >
              <div className="flex-1 flex items-center gap-3 w-full sm:w-auto py-2 sm:py-0">
                <Search className="text-purple-300 shrink-0" size={24} />
                <span className="text-gray-400 font-medium text-lg w-full text-left">Start your free college prediction...</span>
              </div>
              <Link href="/register" className="w-full sm:w-auto">
                <button className="h-14 w-full sm:w-auto px-8 rounded-full text-base whitespace-nowrap bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2">
                  Analyze My Marks <ArrowRight size={18} />
                </button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div
              data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
              className="pt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[13px] font-bold text-gray-400 uppercase tracking-wider"
            >
              <span className="flex items-center gap-2" title={`${matchAccuracy}% based on ${ratedCount} student ratings`}><Sparkles size={16} className="text-purple-500" /> {matchAccuracy}% Match Accuracy</span>
              <span className="flex items-center gap-2"><Users size={16} className="text-blue-500" /> 10K+ Students</span>
              <span className="flex items-center gap-2"><Building2 size={16} className="text-purple-500" /> 500+ Colleges</span>
              <span className="flex items-center gap-2"><Award size={16} className="text-amber-500" /> Free Forever</span>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Trust Banner */}
      <section className="border-y border-purple-100 bg-white/50 backdrop-blur-md py-6 overflow-hidden flex whitespace-nowrap relative">
        <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-[#f0f4ff] to-transparent z-10" />
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-[#f0f4ff] to-transparent z-10" />
        
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex gap-16 items-center text-purple-700/30 font-black text-2xl uppercase tracking-widest px-8"
        >
          <span>Anna University</span> • <span>PSG Tech</span> • <span>CIT Coimbatore</span> • <span>SSN College</span> • <span>Madras Institute</span> • <span>Thiagarajar</span> •
          <span>Anna University</span> • <span>PSG Tech</span> • <span>CIT Coimbatore</span> • <span>SSN College</span> • <span>Madras Institute</span> • <span>Thiagarajar</span> •
        </motion.div>
      </section>

      {/* Section 2 — How it works */}
      <section id="how-it-works" className="py-32 relative">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-24 space-y-4" data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
            <p className="text-[12px] font-black text-purple-700 uppercase tracking-[0.2em] bg-purple-50 border border-purple-100 inline-block px-4 py-1.5 rounded-full">The Process</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Three steps to your perfect match</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Step 1 */}
            <div 
              data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
              className="bg-white/70 backdrop-blur-xl border border-purple-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-10 relative overflow-hidden group hover:-translate-y-2"
            >
              <div className="h-16 w-16 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-purple-100 transition-all duration-300">
                <ClipboardList size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Share Your Details</h3>
              <p className="text-gray-500 leading-relaxed text-base">Tell us your 12th marks, preferred state, district, stream, and community quota. It takes less than a minute.</p>
              <div className="absolute -bottom-6 -right-4 text-9xl font-black text-purple-100 select-none group-hover:text-purple-200 transition-colors">1</div>
            </div>

            {/* Step 2 */}
            <div 
              data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
              className="bg-white/70 backdrop-blur-xl border border-purple-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-10 relative overflow-hidden group hover:-translate-y-2"
            >
              <div className="h-16 w-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                <Bot size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">2. AI Analysis</h3>
              <p className="text-gray-500 leading-relaxed text-base">Our advanced AI scans historical cutoff trends, placements, and NAAC grades across 500+ colleges instantly.</p>
              <div className="absolute -bottom-6 -right-4 text-9xl font-black text-blue-100 select-none group-hover:text-blue-200 transition-colors">2</div>
            </div>

            {/* Step 3 */}
            <div 
              data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
              className="bg-white/70 backdrop-blur-xl border border-purple-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-10 relative overflow-hidden group hover:-translate-y-2"
            >
              <div className="h-16 w-16 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-purple-100 transition-all duration-300">
                <GraduationCap size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Get Admissions</h3>
              <p className="text-gray-500 leading-relaxed text-base">Receive your curated list of top 8 colleges, complete with scholarship info and direct counselor chat.</p>
              <div className="absolute -bottom-6 -right-4 text-9xl font-black text-purple-100 select-none group-hover:text-purple-200 transition-colors">3</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Features grid */}
      <section id="features" className="py-32 border-t border-purple-100 bg-white/30">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-24 space-y-4" data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
            <p className="text-[12px] font-black text-purple-700 uppercase tracking-[0.2em] bg-purple-50 border border-purple-100 inline-block px-4 py-1.5 rounded-full">Core Features</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Everything you need, in one place</h2>
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
              <div 
                key={i}
                data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
                className="bg-white/70 backdrop-blur-xl border border-purple-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-8 group hover:-translate-y-1.5"
              >
                <div className="h-14 w-14 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-100 transition-colors duration-300">
                  <f.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Testimonials */}
      <section className="py-32">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-24 space-y-4" data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Loved by students across India</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Real success stories from students who found their perfect match.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatePresence>
              {testimonials.length > 0 ? (
                testimonials.slice(0, 3).map((t, idx) => (
                  <div 
                    data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
                    key={t.id} 
                    className="bg-white/70 backdrop-blur-xl border border-purple-100 rounded-2xl shadow-sm p-10 flex flex-col h-full hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex gap-1 text-amber-500 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} fill={i < (t.rating || 5) ? "currentColor" : "none"} />
                      ))}
                    </div>
                    
                    <p className="text-gray-600 italic leading-relaxed text-base flex-1 mb-8">
                      &quot;{t.review}&quot;
                    </p>

                    <div className="flex items-center gap-4 pt-6 border-t border-purple-100">
                      <div className="h-12 w-12 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center font-bold text-purple-700 text-lg">
                        {t.name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{t.name}</p>
                        <p className="text-xs font-bold text-gray-400 truncate">{t.college}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                [1,2,3].map(i => <div key={i} className="h-64 rounded-[2rem] bg-white/5 border border-purple-100 animate-pulse" />)
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Section 5 — CTA Banner */}
      <section className="py-24 px-6 border-t border-purple-100 bg-white/30">
        <div className="container mx-auto">
          <div className="bg-gradient-to-br from-purple-100 via-blue-50 to-transparent border border-purple-200 rounded-[3rem] p-16 md:p-24 text-center space-y-10 relative overflow-hidden shadow-lg"
            data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
            
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight relative z-10">
              Ready to find your <br /> dream college?
            </h2>
            <p className="text-xl text-gray-500 max-w-xl mx-auto relative z-10">Join thousands of students and let our AI do the heavy lifting. Free forever.</p>
            
            <div className="relative z-10 mt-8">
              <Link href="/register" className="inline-block">
                <button className="h-16 px-12 text-lg font-bold rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xl flex items-center justify-center gap-2 mx-auto">
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
