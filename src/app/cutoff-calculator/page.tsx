"use client";
import { useAuthGuard } from '@/lib/auth-guard';
import ScrollReveal from '@/components/ScrollReveal';

import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, ArrowRight, BookOpen, GraduationCap, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CutoffCalculatorPage() {
  const { state } = useAuthGuard();
  if (state !== 'verified') return null;

  const [maths, setMaths] = useState<number | "">("");
  const [physics, setPhysics] = useState<number | "">("");
  const [chemistry, setChemistry] = useState<number | "">("");

  const m = Number(maths) || 0;
  const p = Number(physics) || 0;
  const c = Number(chemistry) || 0;
  const cutoff = m + (p / 2) + (c / 2);
  const calculatedCutoff = Math.round(cutoff * 10) / 10;

  const getCutoffColor = (val: number) => {
    if (val >= 190) return { color: "text-emerald-700 dark:text-emerald-300", label: "Outstanding", bg: "bg-emerald-50/80 dark:bg-emerald-900/30", border: "border-emerald-200 dark:border-emerald-800" };
    if (val >= 175) return { color: "text-teal-700 dark:text-teal-300", label: "Excellent", bg: "bg-teal-50/80 dark:bg-teal-900/30", border: "border-teal-200 dark:border-teal-800" };
    if (val >= 160) return { color: "text-indigo-700 dark:text-indigo-300", label: "Good", bg: "bg-indigo-50/80 dark:bg-indigo-900/30", border: "border-indigo-200 dark:border-indigo-800" };
    if (val >= 145) return { color: "text-amber-700 dark:text-amber-300", label: "Average", bg: "bg-amber-50/80 dark:bg-amber-900/30", border: "border-amber-200 dark:border-amber-800" };
    if (val > 0) return { color: "text-gray-700 dark:text-gray-300", label: "Keep trying", bg: "bg-gray-50/80 dark:bg-gray-900/30", border: "border-gray-200 dark:border-gray-800" };
    return { color: "text-gray-400 dark:text-gray-500", label: "Enter marks", bg: "bg-gray-50/80 dark:bg-gray-900/30", border: "border-gray-200 dark:border-gray-800" };
  };

  const cColor = getCutoffColor(calculatedCutoff);

  const getCollegeSuggestions = (val: number) => {
    if (val === 0) return [];
    if (val >= 190) return ["Anna University (CEG/MIT)", "PSG College of Technology", "SSN College of Engineering"];
    if (val >= 175) return ["Coimbatore Institute of Technology (CIT)", "Thiagarajar College of Engineering", "SVCE"];
    if (val >= 160) return ["Sri Krishna College (SKCET)", "Kumaraguru College of Technology", "Rajalakshmi Engineering College"];
    if (val >= 145) return ["Sairam Engineering College", "RMD Engineering College", "Chennai Institute of Technology"];
    return ["Explore our AI tool to find the best colleges for your specific cutoff!"];
  };

  const handleSaveAndContinue = () => {
    if (calculatedCutoff > 0) {
      sessionStorage.setItem("calculatedCutoff", calculatedCutoff.toString());
    }
  };

  return (
    
    <ScrollReveal direction="up">
<div className="min-h-screen bg-transparent text-[#1e1b4b] dark:text-white pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 shadow-sm">
            <Calculator size={14} className="text-purple-600" />
            <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">TNEA 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-950 dark:text-white tracking-tight">
            Smart Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">Cutoff Calculator</span>
          </h1>
          <p className="text-gray-500 dark:text-[rgba(255,255,255,0.72)] font-bold text-sm">Calculate your exact TNEA engineering cutoff instantly based on the latest Directorate of Technical Education formula.</p>
        </div>

        {/* Calculator Tool */}
        <div className="glass-card rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mb-12">
            <div className="glass-card rounded-3xl p-6 space-y-4 shadow-sm">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2"><Sparkles size={16} className="text-purple-600" /> Mathematics</h4>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Out of 100</p>
              </div>
              <input type="number" min="0" max="100" className="w-full h-16 bg-white/80 dark:bg-[#05071a] border border-purple-200 dark:border-[rgba(255,255,255,0.1)] rounded-2xl px-6 text-gray-900 dark:text-white font-bold text-2xl outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all dark:placeholder-gray-600" value={maths} onChange={e => setMaths(Number(e.target.value))} placeholder="0" />
              <div className="flex justify-between items-center text-[10px] font-bold px-1">
                <span className="text-gray-400">Weightage: × 1</span>
                <span className="text-purple-600">{m} marks</span>
              </div>
            </div>
            
            <div className="glass-card rounded-3xl p-6 space-y-4 shadow-sm">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2"><BookOpen size={16} className="text-teal-600" /> Physics</h4>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Out of 100</p>
              </div>
              <input type="number" min="0" max="100" className="w-full h-16 bg-white/80 dark:bg-[#05071a] border border-purple-200 dark:border-[rgba(255,255,255,0.1)] rounded-2xl px-6 text-gray-900 dark:text-white font-bold text-2xl outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition-all dark:placeholder-gray-600" value={physics} onChange={e => setPhysics(Number(e.target.value))} placeholder="0" />
              <div className="flex justify-between items-center text-[10px] font-bold px-1">
                <span className="text-gray-400">Weightage: ÷ 2</span>
                <span className="text-teal-600">{(p/2).toFixed(1)} marks</span>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 space-y-4 shadow-sm">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2"><BookOpen size={16} className="text-amber-600" /> Chemistry</h4>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Out of 100</p>
              </div>
              <input type="number" min="0" max="100" className="w-full h-16 bg-white/80 dark:bg-[#05071a] border border-purple-200 dark:border-[rgba(255,255,255,0.1)] rounded-2xl px-6 text-gray-900 dark:text-white font-bold text-2xl outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all dark:placeholder-gray-600" value={chemistry} onChange={e => setChemistry(Number(e.target.value))} placeholder="0" />
              <div className="flex justify-between items-center text-[10px] font-bold px-1">
                <span className="text-gray-400">Weightage: ÷ 2</span>
                <span className="text-amber-600">{(c/2).toFixed(1)} marks</span>
              </div>
            </div>
          </div>

          <div className={cn("rounded-[2rem] border flex flex-col md:flex-row items-center justify-between p-8 md:p-10 transition-all relative z-10 shadow-sm", cColor.bg, cColor.border)}>
            <div className="text-center md:text-left mb-6 md:mb-0">
              <p className={cn("text-[12px] font-black uppercase tracking-widest mb-2", cColor.color)}>Your Final Cutoff</p>
              <p className="text-gray-500 dark:text-[rgba(255,255,255,0.72)] font-mono font-bold tracking-tight">
                Maths ({m}) + Physics ({(p/2).toFixed(1)}) + Chemistry ({(c/2).toFixed(1)})
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <span className={cn("text-7xl md:text-8xl font-black tabular-nums tracking-tighter leading-none", cColor.color)}>
                {calculatedCutoff.toFixed(1)}
              </span>
              <span className={cn("px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest mt-4 shadow-sm", cColor.color, cColor.border, "bg-white/80 dark:bg-transparent dark:text-opacity-80")}>
                {cColor.label}
              </span>
            </div>
          </div>

        </div>

        {/* Action / Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-950 dark:text-white mb-6 flex items-center gap-3">
              <GraduationCap className="text-purple-600" /> Potential Colleges
            </h3>
            {calculatedCutoff > 0 ? (
              <ul className="space-y-4">
                {getCollegeSuggestions(calculatedCutoff).map((col, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-600 dark:text-[rgba(255,255,255,0.72)] font-medium">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                    <span>{col}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 italic">Enter your marks above to see which tier of colleges you might qualify for.</p>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-950 dark:text-white tracking-tight">Ready to find your exact matches?</h3>
              <p className="text-gray-500 dark:text-[rgba(255,255,255,0.72)] leading-relaxed">Take our AI-powered interview to see your exact admission chances at over 500+ colleges based on your cutoff, category, and preferences.</p>
              <Link 
                href="/register" 
                onClick={handleSaveAndContinue}
                className="h-16 w-full text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-2xl shadow-lg shadow-purple-200 transition-all duration-300 flex items-center justify-center gap-3"
              >
                Find My Dream College <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
    </ScrollReveal>
  );
}
