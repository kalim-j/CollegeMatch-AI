"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, Sparkles, User, MapPin, Award, 
  ArrowRight, Search, Zap, Loader2, Star, 
  ChevronRight, BrainCircuit, Wallet, TrendingUp, History, Settings
} from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";

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
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] p-4 md:p-8 space-y-12 pb-24">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-end gap-6 max-w-7xl mx-auto"
      >
        <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black text-white font-syne">
                Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">{profile?.fullName?.split(' ')[0] || "Student"}</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Your CollegeMatch-AI Command Center</p>
        </div>
        <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Preferred Course</p>
                <p className="text-sm font-bold text-white">{profile?.preferredCourse || "Computer Science"}</p>
             </div>
             <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-purple-400">
                {profile?.fullName?.[0]}
             </div>
        </div>
      </motion.div>

      {/* Quick Predictor Section */}
      <section className="max-w-7xl mx-auto">
        <div className="bg-[#111520] border border-white/5 rounded-[3.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 pointer-events-none">
                <Zap size={240} className="text-purple-500" />
             </div>
             
             <div className="relative z-10 space-y-10">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                        <Zap size={24} />
                    </div>
                    <h2 className="text-3xl font-black text-white font-syne">Quick College Predictor</h2>
                </div>

                <div className="flex flex-col items-center justify-center space-y-6">
                    <p className="text-slate-500 font-bold text-center max-w-md">
                        Get a comprehensive AI-driven analysis of your college options based on your academic profile and preferences.
                    </p>
                    <button 
                        onClick={() => router.push("/interview")}
                        className="w-full max-w-md h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[2rem] text-white font-black text-xl shadow-2xl shadow-purple-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group"
                    >
                        <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <Sparkles size={24} />
                        </div>
                        Start Full AI Analysis
                    </button>
                </div>
              </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Navigation Cards */}
           <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/dashboard/compare" className="group">
                    <div className="h-full bg-[#111520] border border-white/5 rounded-[2.5rem] p-8 hover:border-purple-500/30 transition-all relative overflow-hidden">
                        <div className="h-14 w-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                            <BrainCircuit size={28} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 font-syne">AI Comparison</h3>
                        <p className="text-slate-500 font-bold text-sm leading-relaxed">Side-by-side technical and academic breakdown of up to 3 colleges.</p>
                        <div className="mt-8 flex items-center gap-2 text-purple-400 font-black text-xs uppercase tracking-widest">
                            Explore Now <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                        </div>
                    </div>
                </Link>

                <Link href="/dashboard/trends" className="group">
                    <div className="h-full bg-[#111520] border border-white/5 rounded-[2.5rem] p-8 hover:border-orange-500/30 transition-all relative overflow-hidden">
                        <div className="h-14 w-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-400 mb-6 group-hover:scale-110 transition-transform">
                            <TrendingUp size={28} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 font-syne">Cutoff Analytics</h3>
                        <p className="text-slate-500 font-bold text-sm leading-relaxed">Historical data visualization and prediction of upcoming cutoffs.</p>
                        <div className="mt-8 flex items-center gap-2 text-orange-400 font-black text-xs uppercase tracking-widest">
                            View Trends <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                        </div>
                    </div>
                </Link>

                <Link href="/history" className="group">
                    <div className="h-full bg-[#111520] border border-white/5 rounded-[2.5rem] p-8 hover:border-purple-500/30 transition-all flex flex-col items-center justify-center text-center gap-4">
                         <div className="h-16 w-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400">
                            <History size={28} />
                         </div>
                         <h3 className="text-xl font-black text-white font-syne">Analysis History</h3>
                         <ArrowRight size={24} className="text-slate-700 group-hover:text-purple-400 group-hover:translate-x-2 transition-all" />
                    </div>
                </Link>

                {user?.email === "kalimdon07@gmail.com" && (
                    <Link href="/admin" className="group">
                        <div className="h-full bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] p-8 hover:border-emerald-500/40 transition-all flex flex-col items-center justify-center text-center gap-4 shadow-2xl shadow-emerald-500/5">
                            <div className="h-16 w-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                                <Settings size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white font-syne">Admin Panel</h3>
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Management Console</p>
                            </div>
                            <ArrowRight size={24} className="text-emerald-900 group-hover:text-emerald-400 group-hover:translate-x-2 transition-all" />
                        </div>
                    </Link>
                )}
           </div>

           {/* Sidebar Section */}
           <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#7c5cfc] to-[#6d28d9] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                        <GraduationCap size={160} />
                    </div>
                    <h4 className="text-xl font-black mb-2 font-syne uppercase">Premium Support</h4>
                    <p className="text-purple-100 text-sm font-bold opacity-80 leading-relaxed mb-6">Need expert help for direct admission or counseling support?</p>
                    <Link href="/dashboard/contact">
                        <button className="w-full h-12 bg-white text-purple-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-lg">
                            Get Help Now
                        </button>
                    </Link>
                </div>

                <div className="bg-[#111520] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-4">Profile Strength</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-white">Academic Data</span>
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Complete</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-emerald-500" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-white">Preferences</span>
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">90%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-[90%] bg-purple-500" />
                        </div>
                    </div>
                </div>
           </div>
      </div>
    </div>
  );
}
