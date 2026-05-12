"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  GraduationCap, Sparkles, Zap, Loader2,
  BrainCircuit, TrendingUp, History, Settings, ArrowRight,
  BookOpen, Target, Award
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  })
};

export default function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#05071a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
          <p className="text-white/30 text-sm font-bold uppercase tracking-widest">Loading your profile…</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "AI Analyses Run", value: "12", icon: BrainCircuit, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    { label: "Colleges Matched", value: "47", icon: Target, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
    { label: "Exams Tracked", value: "5", icon: BookOpen, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { label: "Scholarship Alerts", value: "3", icon: Award, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  ];

  const navCards = [
    { href: "/interview", label: "AI College Predictor", desc: "Get a full AI-driven college recommendation based on your profile.", icon: Sparkles, color: "text-indigo-400", bg: "bg-indigo-500/10", hover: "hover:border-indigo-500/40", cta: "Start Analysis" },
    { href: "/history", label: "Analysis History", desc: "Review all past AI college analyses and their recommendations.", icon: History, color: "text-purple-400", bg: "bg-purple-500/10", hover: "hover:border-purple-500/40", cta: "View History" },
    { href: "/scholarships", label: "Scholarship Finder", desc: "Discover scholarships and financial aid tailored to your profile.", icon: Award, color: "text-teal-400", bg: "bg-teal-500/10", hover: "hover:border-teal-500/40", cta: "Find Scholarships" },
    { href: "/exams", label: "Entrance Exams", desc: "Track important entrance exam dates, results and cutoffs.", icon: BookOpen, color: "text-amber-400", bg: "bg-amber-500/10", hover: "hover:border-amber-500/40", cta: "Track Exams" },
  ];

  return (
    <div className="min-h-screen bg-[#05071a] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-12 pb-24">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div className="space-y-2">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Welcome back</p>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
              Hello,{" "}
              <span className="text-gradient">
                {profile?.fullName?.split(" ")[0] || "Student"}
              </span>
            </h1>
            <p className="text-white/30 font-bold text-sm">Your CollegeMatch-AI Command Center</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Preferred Course</p>
              <p className="text-sm font-bold text-white">{profile?.preferredCourse || "Computer Science"}</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-300 text-lg">
              {profile?.fullName?.[0] ?? "S"}
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className={`rounded-2xl p-6 border ${stat.border} bg-white/[0.03] backdrop-blur-sm space-y-3 group hover:bg-white/[0.05] transition-colors`}
            >
              <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`${stat.color}`} size={20} />
              </div>
              <div>
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hero CTA — Quick Predictor */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative rounded-[2.5rem] overflow-hidden border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-transparent to-teal-500/10 p-10 md:p-14"
        >
          <div className="absolute inset-0 bg-[#05071a]/60 backdrop-blur-xl" />
          <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
            <Zap size={320} className="text-indigo-500" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-[11px] font-black text-indigo-300 uppercase tracking-widest">AI Powered</span>
              </div>
              <h2 className="text-4xl font-black text-white tracking-tight">Ready for your analysis?</h2>
              <p className="text-white/40 font-medium max-w-md">
                Get a comprehensive, AI-driven college recommendation in under 5 minutes based on your marks, preferences, and location.
              </p>
            </div>
            <button
              onClick={() => router.push("/interview")}
              className="btn-primary h-16 px-10 text-base whitespace-nowrap group flex-shrink-0 flex items-center justify-center gap-3"
            >
              <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
              <span>Start Full AI Analysis</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Nav Cards — 2/3 width */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
            {navCards.map((card, i) => (
              <motion.div
                key={card.label}
                custom={i + 4}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <Link href={card.href} className="group block h-full">
                  <div className={`h-full rounded-[2rem] p-7 border border-white/5 bg-white/[0.03] ${card.hover} transition-all backdrop-blur-sm space-y-5`}>
                    <div className={`h-12 w-12 rounded-xl ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <card.icon className={card.color} size={22} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-white">{card.label}</h3>
                      <p className="text-white/40 text-sm font-medium leading-relaxed">{card.desc}</p>
                    </div>
                    <div className={`flex items-center justify-start gap-2 ${card.color} font-black text-[10px] uppercase tracking-widest`}>
                      <span>{card.cta}</span> <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {user?.email === "kalimdon07@gmail.com" && (
              <motion.div custom={8} variants={cardVariants} initial="hidden" animate="visible">
                <Link href="/admin" className="group block h-full">
                  <div className="h-full rounded-[2rem] p-7 border border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 transition-all backdrop-blur-sm space-y-5">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Settings className="text-emerald-400" size={22} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-white">Admin Panel</h3>
                      <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Management Console</p>
                    </div>
                    <div className="flex items-center justify-start gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                      <span>Open Console</span> <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Sidebar — 1/3 width */}
          <div className="space-y-5">
            {/* Counseling CTA */}
            <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible">
              <div className="rounded-[2rem] p-7 bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <GraduationCap size={180} />
                </div>
                <div className="relative z-10 space-y-5">
                  <h4 className="text-xl font-black">Premium Support</h4>
                  <p className="text-white/70 text-sm font-medium leading-relaxed">
                    Need expert help for direct admission or counseling support?
                  </p>
                  <Link href="/contact">
                    <button className="w-full h-12 bg-white text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/90 transition-colors shadow-lg">
                      Get Expert Help
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Profile Strength */}
            <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible">
              <div className="rounded-[2rem] p-7 border border-white/5 bg-white/[0.03] backdrop-blur-sm space-y-6">
                <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] border-b border-white/5 pb-4">
                  Profile Strength
                </h4>
                {[
                  { label: "Academic Data", pct: 100, color: "bg-teal-500", text: "Complete" },
                  { label: "Preferences", pct: 90, color: "bg-indigo-500", text: "90%" },
                  { label: "Location Data", pct: 70, color: "bg-purple-500", text: "70%" },
                ].map((item) => (
                  <div key={item.label} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white/70">{item.label}</span>
                      <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">{item.text}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
