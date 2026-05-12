"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, Search, Sparkles, History, Phone, 
  ArrowRight, CheckCircle2, Award, ShieldCheck, 
  Zap, ChevronRight, Play, Star, Quote, 
  Users, MapPin, Building, BookOpen, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

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
        // Sort in memory to avoid needing a composite index
        const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        fetched.sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setTestimonials(fetched);
      } catch (error) {
        console.error("Testimonials fetch error:", error);
      }
    };
    fetchTestimonials();
  }, []);

  const stats = [
    { label: "Students Guided", value: "10,000+" },
    { label: "Colleges Mapped", value: "500+" },
    { label: "Accuracy Rate", value: "98%" },
    { label: "Cost to Students", value: "Always Free" },
  ];

  const features = [
    {
      title: "AI-Powered Matching",
      description: "Our advanced algorithms match your unique profile with the best-fit colleges across India.",
      icon: Sparkles,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Scholarship Finder",
      description: "Instantly discover government and private scholarships you qualify for using AI.",
      icon: Award,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "College Insights",
      description: "Deep dive into NIRF rankings, NAAC grades, placements, and campus facilities.",
      icon: Search,
      color: "text-teal-500",
      bgColor: "bg-teal-50",
    },
    {
      title: "Exam Guide",
      description: "Complete roadmap for national and state level entrance exams relevant to your stream.",
      icon: GraduationCap,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      title: "Safe & Private",
      description: "Your academic data is encrypted and used only to provide you with the best recommendations.",
      icon: ShieldCheck,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Instant Results",
      description: "Get your personalized college shortlist in seconds, not days. Fast and reliable.",
      icon: Zap,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
  ];

  const steps = [
    { title: "Enter Details", desc: "Share your marks, preferences, and location." },
    { title: "AI Analyses", desc: "Our engine processes 500+ college datasets." },
    { title: "Get Shortlist", desc: "Receive a curated list of dream colleges." },
    { title: "Decide with Confidence", desc: "Make the right choice for your future." },
  ];

  if (loading) return null;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-transparent">
      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden py-24 lg:py-36">
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center rounded-full border border-primary/20 px-4 py-2 mb-10 text-sm font-bold bg-white/40 backdrop-blur-md shadow-xl">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse mr-2" />
                <span className="text-primary mr-1">New:</span> 
                <span className="text-slate-600 uppercase tracking-widest text-[10px]">Scholarship Finder Now Live</span>
              </div>
              
              <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.9] text-slate-900 font-syne">
                Your Future. <br />
                <span className="text-primary">Optimized.</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-14 leading-relaxed font-medium">
                The most advanced AI-powered admission engine for Indian students. 
                Discover scholarships, entrance exams, and your perfect college match—all for free.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-20 px-12 text-xl rounded-[2rem] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all gap-4 bg-primary font-black">
                    Get Started Free <ArrowRight className="h-6 w-6" />
                  </Button>
                </Link>
                <Link href="/contact" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto h-20 px-10 text-xl rounded-[2rem] bg-white/40 backdrop-blur-md border-primary/10 hover:bg-white/60 transition-all gap-3 font-bold">
                    <Phone className="h-6 w-6 text-primary" /> Talk to Expert
                  </Button>
                </Link>
              </div>
              
              <div className="mt-16 flex flex-col items-center gap-6">
                <div className="flex -space-x-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-14 w-14 rounded-full border-4 border-[#f8fafc] bg-slate-200 shadow-xl overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?img=${i+20}`} alt="Student" />
                    </div>
                  ))}
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
                  Trusted by <span className="text-primary">10,000+</span> ambitious Indian students
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Background Blobs */}
        <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] -z-10 animate-pulse" />
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
         <div className="container px-4 mx-auto relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
               {stats.map((stat, i) => (
                 <div key={i} className="text-center space-y-2">
                    <p className="text-5xl md:text-7xl font-black font-syne tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">{stat.value}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{stat.label}</p>
                 </div>
               ))}
            </div>
         </div>
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,_rgba(59,130,246,0.1),_transparent_50%)]" />
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-24 space-y-6">
            <h2 className="text-5xl md:text-7xl font-black font-syne tracking-tighter">Beyond Simple Prediction</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
              We provide a complete ecosystem for student success. AI-driven tools that save you weeks of research.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white border border-slate-200 p-12 rounded-[3.5rem] shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 cursor-default relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] transition-all group-hover:bg-primary/5" />
                <div className={cn("h-20 w-20 rounded-3xl flex items-center justify-center mb-10 shadow-xl relative z-10 transition-transform group-hover:rotate-6 group-hover:scale-110", feature.bgColor, feature.color)}>
                  <feature.icon size={32} strokeWidth={2.5} />
                </div>
                <h3 className="text-3xl font-black mb-4 font-syne tracking-tight relative z-10">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium relative z-10">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-[#0a0d14] text-white relative overflow-hidden">
        <div className="container px-4 mx-auto relative z-10">
          <div className="text-center mb-24 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
               <Users size={14} /> Student Success Stories
            </div>
            <h2 className="text-5xl md:text-7xl font-black font-syne tracking-tighter">Real Students. <span className="text-primary">Real Results.</span></h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">Hear from students who found their dream college and course using CollegeMatch-AI.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {testimonials.length > 0 ? (
                testimonials.map((t, idx) => (
                  <motion.div 
                    key={t.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/5 border border-white/5 p-10 rounded-[3rem] space-y-8 relative group hover:bg-white/10 transition-all hover:border-primary/30"
                  >
                    <Quote className="text-primary absolute top-10 right-10 opacity-20 group-hover:opacity-40 transition-opacity" size={60} />
                    <div className="flex gap-1 text-amber-400">
                       {[...Array(t.rating || 5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <p className="text-lg italic text-slate-300 font-medium leading-relaxed">
                      &quot;{t.review}&quot;
                    </p>
                    <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                      <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center font-black text-primary text-xl">
                        {t.name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="font-black text-white text-lg truncate">{t.name}</p>
                         <p className="text-xs font-bold text-primary uppercase tracking-widest truncate">{t.college}</p>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-white/5 rounded-md text-[8px] font-black text-slate-500 uppercase tracking-widest border border-white/5">{t.stream}</span>
                            <span className="px-2 py-0.5 bg-white/5 rounded-md text-[8px] font-black text-slate-500 uppercase tracking-widest border border-white/5">Class of {t.year}</span>
                         </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                 // Fallback testimonials if none approved yet
                 [1,2,3].map(i => (
                    <div key={i} className="bg-white/5 border border-white/5 p-10 rounded-[3rem] h-64 animate-pulse" />
                 ))
              )}
            </AnimatePresence>
          </div>
          
          <div className="mt-20 text-center">
             <Link href="/testimonial">
                <Button variant="outline" className="h-16 px-10 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs gap-3">
                   Submit Your Story <MessageSquare size={18} />
                </Button>
             </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32">
        <div className="container px-4 mx-auto">
           <div className="bg-primary rounded-[4rem] p-16 md:p-32 text-center text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(59,130,246,0.5)]">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_40%)]" />
              <div className="relative z-10 space-y-10">
                 <h2 className="text-5xl md:text-8xl font-black font-syne tracking-tighter leading-none">Your Future <br /> Starts Today</h2>
                 <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto font-medium">Join 10,000+ students who optimized their education path with CollegeMatch-AI. Always free, always accurate.</p>
                 <Link href="/register">
                    <Button size="lg" className="h-20 px-16 text-2xl rounded-2xl bg-white text-primary hover:bg-slate-100 shadow-2xl font-black gap-4 transition-transform hover:scale-105 active:scale-95">
                       Create Free Account <Zap className="h-7 w-7 fill-primary" />
                    </Button>
                 </Link>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}
