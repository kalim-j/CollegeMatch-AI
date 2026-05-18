"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  Loader2,
  MapPin,
  Award,
  BarChart3,
  BookOpen,
  Wallet,
  Star,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { College } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CollegeAnalysis {
  pros: string[];
  cons: string[];
  verdict: string;
}

interface AIComparisonResult {
  summary: string;
  best_pick: string;
  best_pick_reason: string;
  colleges: Record<string, CollegeAnalysis>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACCENT_COLORS = [
  {
    badge: "bg-indigo-500/10 border-indigo-500/20 text-indigo-300",
    icon: "text-indigo-400",
    glow: "bg-indigo-500/5",
    border: "border-indigo-500/30",
    dot: "bg-indigo-500",
  },
  {
    badge: "bg-teal-500/10 border-teal-500/20 text-teal-300",
    icon: "text-teal-400",
    glow: "bg-teal-500/5",
    border: "border-teal-500/30",
    dot: "bg-teal-500",
  },
  {
    badge: "bg-purple-500/10 border-purple-500/20 text-purple-300",
    icon: "text-purple-400",
    glow: "bg-purple-500/5",
    border: "border-purple-500/30",
    dot: "bg-purple-500",
  },
];

function StatCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number | undefined | null;
  accent: string;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-[1.5rem] p-5 text-center">
      <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className={cn("font-black text-xl tabular-nums", accent)}>
        {value ?? "—"}
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ComparePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [colleges, setColleges] = useState<College[]>([]);
  const [aiResult, setAiResult] = useState<AIComparisonResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // ── Read colleges from sessionStorage ──────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("compareColleges");
      if (raw) {
        const parsed: College[] = JSON.parse(raw);
        setColleges(parsed.slice(0, 3));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // ── AI Analysis ─────────────────────────────────────────────────────────────
  const handleAIAnalysis = async () => {
    if (colleges.length < 2) return;
    setAiLoading(true);
    setAiError("");
    setAiResult(null);

    try {
      const res = await fetch("/api/compare-colleges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colleges }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "AI analysis failed");
      }

      const data: AIComparisonResult = await res.json();
      setAiResult(data);
    } catch (err: any) {
      setAiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Loading / auth spinner ──────────────────────────────────────────────────
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#05071a] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (colleges.length === 0) {
    return (
      <div className="min-h-screen bg-[#05071a] flex flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="h-24 w-24 bg-indigo-500/10 border border-indigo-500/20 rounded-[2.5rem] flex items-center justify-center">
          <BarChart3 size={40} className="text-indigo-400" />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-white tracking-tighter">
            No Colleges Selected
          </h2>
          <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">
            Select 2–3 colleges from your results to compare
          </p>
        </div>
        <button
          onClick={() => router.push("/interview")}
          className="btn-primary h-16 px-12 rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center gap-3"
        >
          <ArrowLeft size={18} /> Back to Results
        </button>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#05071a] text-white relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl relative z-10">
        {/* ── Header ── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 space-y-4"
        >
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-white/30 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-4"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <BarChart3 size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">
              Side-by-Side Analysis
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight">
            College Comparison
          </h1>
          <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">
            Comparing {colleges.length} institution
            {colleges.length > 1 ? "s" : ""} — AI-powered insights below
          </p>
        </motion.header>

        {/* ── College Columns ── */}
        <div
          className={cn(
            "grid gap-6 mb-12",
            colleges.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-3"
          )}
        >
          {colleges.map((college, idx) => {
            const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
            return (
              <motion.div
                key={college.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[3rem] p-8 sm:p-10 relative overflow-hidden"
              >
                {/* Glow */}
                <div
                  className={cn(
                    "absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] pointer-events-none",
                    accent.glow
                  )}
                />

                {/* College index badge */}
                <div className="mb-6">
                  <div
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest",
                      accent.badge
                    )}
                  >
                    <GraduationCap size={10} />
                    College {idx + 1}
                  </div>
                </div>

                {/* Name & Location */}
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter leading-tight mb-3">
                  {college.name}
                </h2>
                <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest mb-8">
                  <MapPin size={12} className={accent.icon} />
                  {college.location}
                  {college.state && college.state !== college.location
                    ? `, ${college.state}`
                    : ""}
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <StatCell
                    label="Type"
                    value={college.type}
                    accent={accent.icon}
                  />
                  <StatCell
                    label="NAAC Grade"
                    value={college.naac_grade}
                    accent={accent.icon}
                  />
                  <StatCell
                    label="NIRF Rank"
                    value={
                      college.nirf_rank ? `#${college.nirf_rank}` : undefined
                    }
                    accent={accent.icon}
                  />
                  <StatCell
                    label="Cutoff (Gen)"
                    value={college.cutoff_general}
                    accent={accent.icon}
                  />
                </div>

                {/* Match score */}
                {college.match_score !== undefined && (
                  <div className="bg-white/[0.03] border border-white/5 rounded-[1.5rem] p-5 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Star size={16} className={accent.icon} />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                        Match Score
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-2xl font-black tabular-nums",
                        accent.icon
                      )}
                    >
                      {college.match_score}%
                    </span>
                  </div>
                )}

                {/* Fees */}
                {college.fees_approx && (
                  <div className="flex items-center gap-3 mb-6 bg-white/[0.03] border border-white/5 rounded-[1.5rem] p-5">
                    <Wallet size={16} className={accent.icon} />
                    <div>
                      <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                        Approx Fees
                      </p>
                      <p className="text-white font-black text-sm">
                        {college.fees_approx}
                      </p>
                    </div>
                  </div>
                )}

                {/* Courses */}
                {college.courses && college.courses.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest">
                      <BookOpen size={12} className={accent.icon} />
                      Courses Offered
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {college.courses.slice(0, 6).map((course) => (
                        <span
                          key={course}
                          className="px-3 py-1 bg-white/[0.05] border border-white/5 rounded-full text-[9px] font-black text-white/40 uppercase tracking-wider"
                        >
                          {course}
                        </span>
                      ))}
                      {college.courses.length > 6 && (
                        <span className="px-3 py-1 bg-white/[0.05] border border-white/5 rounded-full text-[9px] font-black text-white/30 uppercase tracking-wider">
                          +{college.courses.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* AI per-college result */}
                <AnimatePresence>
                  {aiResult?.colleges?.[college.name] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-8 pt-8 border-t border-white/5 space-y-4"
                    >
                      {/* Pros */}
                      {aiResult.colleges[college.name].pros?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 size={10} className="text-teal-400" />
                            Pros
                          </p>
                          <ul className="space-y-1.5">
                            {aiResult.colleges[college.name].pros.map(
                              (pro, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-white/50 text-xs font-medium"
                                >
                                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                                  {pro}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Cons */}
                      {aiResult.colleges[college.name].cons?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                            <XCircle size={10} className="text-red-400" />
                            Cons
                          </p>
                          <ul className="space-y-1.5">
                            {aiResult.colleges[college.name].cons.map(
                              (con, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-white/50 text-xs font-medium"
                                >
                                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                  {con}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Verdict */}
                      {aiResult.colleges[college.name].verdict && (
                        <div
                          className={cn(
                            "rounded-[1.5rem] p-4 border",
                            accent.glow,
                            accent.border
                          )}
                        >
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">
                            Verdict
                          </p>
                          <p className="text-white/70 text-xs font-medium leading-relaxed">
                            {aiResult.colleges[college.name].verdict}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* ── AI Analysis Section ── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-[3rem] p-8 sm:p-12 relative overflow-hidden"
        >
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500 rounded-t-[3rem]" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10">
            <div className="h-16 w-16 bg-indigo-500/10 border border-indigo-500/20 rounded-[1.5rem] flex items-center justify-center flex-shrink-0">
              <BrainCircuit size={28} className="text-indigo-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-2">
                <Sparkles size={10} className="text-indigo-400" />
                <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">
                  AI-Powered
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">
                AI Analysis
              </h2>
              <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">
                Deep comparative intelligence for your decision
              </p>
            </div>
          </div>

          {/* Trigger button */}
          {!aiResult && !aiLoading && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAIAnalysis}
              className="btn-primary h-20 px-12 rounded-[2rem] text-lg font-black uppercase tracking-widest flex items-center gap-4 shadow-[0_20px_60px_rgba(99,102,241,0.25)]"
            >
              <BrainCircuit size={24} />
              Run AI Analysis
            </motion.button>
          )}

          {/* Loading state */}
          <AnimatePresence>
            {aiLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 py-16"
              >
                <div className="relative">
                  <div className="h-20 w-20 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] flex items-center justify-center">
                    <Loader2 size={36} className="text-indigo-400 animate-spin" />
                  </div>
                  <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-white font-black text-xl tracking-tight">
                    Analysing Colleges…
                  </p>
                  <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">
                    AI is comparing all factors — this may take a moment
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error state */}
          <AnimatePresence>
            {aiError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-[2rem] p-8 flex items-start gap-4"
              >
                <XCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 font-black text-sm mb-1">
                    Analysis Failed
                  </p>
                  <p className="text-red-400/60 text-xs font-medium">{aiError}</p>
                  <button
                    onClick={handleAIAnalysis}
                    className="mt-4 text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-300 transition-colors"
                  >
                    Try Again →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Result */}
          <AnimatePresence>
            {aiResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                {/* Summary */}
                <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-8">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Award size={12} className="text-indigo-400" />
                    Summary
                  </p>
                  <p className="text-white/70 text-base font-medium leading-relaxed">
                    {aiResult.summary}
                  </p>
                </div>

                {/* Best Pick */}
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.04] pointer-events-none">
                    <Trophy size={120} className="text-indigo-400" />
                  </div>
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="h-12 w-12 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Trophy size={20} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-300/60 uppercase tracking-widest mb-1">
                        Best Pick
                      </p>
                      <p className="text-2xl font-black text-white tracking-tight mb-3">
                        {aiResult.best_pick}
                      </p>
                      <p className="text-white/50 text-sm font-medium leading-relaxed">
                        {aiResult.best_pick_reason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-3 opacity-30 pt-4 border-t border-white/5">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Verified CollegeMatch-AI Predictive Data
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </div>
    </div>
  );
}
