"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, ArrowRight, BookOpen, GraduationCap, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CutoffCalculatorPage() {
  const [maths, setMaths] = useState<number | "">("");
  const [physics, setPhysics] = useState<number | "">("");
  const [chemistry, setChemistry] = useState<number | "">("");

  const m = Number(maths) || 0;
  const p = Number(physics) || 0;
  const c = Number(chemistry) || 0;
  const cutoff = m + (p / 2) + (c / 2);
  const calculatedCutoff = Math.round(cutoff * 10) / 10;

  const getCutoffColor = (val: number) => {
    if (val >= 190) return { color: "text-emerald-400", label: "Outstanding", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (val >= 175) return { color: "text-teal-400", label: "Excellent", bg: "bg-teal-500/10", border: "border-teal-500/20" };
    if (val >= 160) return { color: "text-blue-400", label: "Good", bg: "bg-blue-500/10", border: "border-blue-500/20" };
    if (val >= 145) return { color: "text-amber-400", label: "Average", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    if (val > 0) return { color: "text-white/40", label: "Keep trying", bg: "bg-white/5", border: "border-white/10" };
    return { color: "text-white/20", label: "Enter marks", bg: "bg-white/5", border: "border-white/10" };
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
    <div className="min-h-screen bg-[#05071a] pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <Calculator size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">TNEA 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter">
            Smart Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Cutoff Calculator</span>
          </h1>
          <p className="text-white/50 text-lg">Calculate your exact TNEA engineering cutoff instantly based on the latest Directorate of Technical Education formula.</p>
        </div>

        {/* Calculator Tool */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
            <Calculator size={240} className="text-indigo-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mb-12">
            <div className="rounded-3xl bg-white/5 border border-white/5 p-6 space-y-4">
              <div>
                <h4 className="font-black text-white text-lg flex items-center gap-2"><Sparkles size={16} className="text-indigo-400" /> Mathematics</h4>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Out of 100</p>
              </div>
              <input type="number" min="0" max="100" className="w-full h-16 bg-black/20 border border-white/10 rounded-2xl px-6 text-white font-black text-2xl outline-none focus:border-indigo-500/50 transition-all" value={maths} onChange={e => setMaths(Number(e.target.value))} placeholder="0" />
              <div className="flex justify-between items-center text-[10px] font-bold px-1">
                <span className="text-white/40">Weightage: × 1</span>
                <span className="text-indigo-400">{m} marks</span>
              </div>
            </div>
            
            <div className="rounded-3xl bg-white/5 border border-white/5 p-6 space-y-4">
              <div>
                <h4 className="font-black text-white text-lg flex items-center gap-2"><BookOpen size={16} className="text-teal-400" /> Physics</h4>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Out of 100</p>
              </div>
              <input type="number" min="0" max="100" className="w-full h-16 bg-black/20 border border-white/10 rounded-2xl px-6 text-white font-black text-2xl outline-none focus:border-teal-500/50 transition-all" value={physics} onChange={e => setPhysics(Number(e.target.value))} placeholder="0" />
              <div className="flex justify-between items-center text-[10px] font-bold px-1">
                <span className="text-white/40">Weightage: ÷ 2</span>
                <span className="text-teal-400">{(p/2).toFixed(1)} marks</span>
              </div>
            </div>

            <div className="rounded-3xl bg-white/5 border border-white/5 p-6 space-y-4">
              <div>
                <h4 className="font-black text-white text-lg flex items-center gap-2"><BookOpen size={16} className="text-amber-400" /> Chemistry</h4>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Out of 100</p>
              </div>
              <input type="number" min="0" max="100" className="w-full h-16 bg-black/20 border border-white/10 rounded-2xl px-6 text-white font-black text-2xl outline-none focus:border-amber-500/50 transition-all" value={chemistry} onChange={e => setChemistry(Number(e.target.value))} placeholder="0" />
              <div className="flex justify-between items-center text-[10px] font-bold px-1">
                <span className="text-white/40">Weightage: ÷ 2</span>
                <span className="text-amber-400">{(c/2).toFixed(1)} marks</span>
              </div>
            </div>
          </div>

          <div className={cn("rounded-[2rem] border flex flex-col md:flex-row items-center justify-between p-8 md:p-10 transition-all relative z-10 shadow-xl", cColor.bg, cColor.border)}>
            <div className="text-center md:text-left mb-6 md:mb-0">
              <p className={cn("text-[12px] font-black uppercase tracking-widest mb-2", cColor.color)}>Your Final Cutoff</p>
              <p className="text-white/50 text-sm font-mono font-bold tracking-tight">
                Maths ({m}) + Physics ({(p/2).toFixed(1)}) + Chemistry ({(c/2).toFixed(1)})
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <span className={cn("text-7xl md:text-8xl font-black tabular-nums tracking-tighter leading-none", cColor.color)}>
                {calculatedCutoff.toFixed(1)}
              </span>
              <span className={cn("px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest mt-4 shadow-sm", cColor.color, cColor.border, cColor.bg)}>
                {cColor.label}
              </span>
            </div>
          </div>

        </div>

        {/* Action / Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-[2rem] p-8">
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
              <GraduationCap className="text-indigo-400" /> Potential Colleges
            </h3>
            {calculatedCutoff > 0 ? (
              <ul className="space-y-4">
                {getCollegeSuggestions(calculatedCutoff).map((col, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-white/70 font-medium">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span>{col}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white/40 italic">Enter your marks above to see which tier of colleges you might qualify for.</p>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-black text-white tracking-tight">Ready to find your exact matches?</h3>
              <p className="text-white/50 leading-relaxed">Take our AI-powered interview to see your exact admission chances at over 500+ colleges based on your cutoff, category, and preferences.</p>
              <Link 
                href="/register" 
                onClick={handleSaveAndContinue}
                className="btn-primary h-16 w-full text-lg flex items-center justify-center gap-3 font-black uppercase tracking-widest group"
              >
                Find My Dream College <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
