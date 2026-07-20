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
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { College } from "@/types";
import { useAuthGuard } from '@/lib/auth-guard';

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
    badge: "bg-indigo-50 border-indigo-200 text-indigo-700",
    icon: "text-indigo-600",
    glow: "bg-indigo-500/5",
    border: "border-indigo-100",
    dot: "bg-indigo-600",
  },
  {
    badge: "bg-teal-50 border-teal-200 text-teal-700",
    icon: "text-teal-600",
    glow: "bg-teal-500/5",
    border: "border-teal-100",
    dot: "bg-teal-600",
  },
  {
    badge: "bg-purple-50 border-purple-200 text-purple-700",
    icon: "text-purple-600",
    glow: "bg-purple-500/5",
    border: "border-purple-100",
    dot: "bg-purple-600",
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
    <div className="bg-white/40 border border-purple-100/50 rounded-2xl p-4 text-center">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className={cn("font-bold text-base tabular-nums", accent)}>
        {value ?? "—"}
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ComparePage() {
  const { user, state } = useAuthGuard();
  const router = useRouter();

  const [colleges, setColleges] = useState<College[]>([]);
  const [aiResult, setAiResult] = useState<AIComparisonResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state === 'unauthenticated' && !user) {
      router.push("/login");
    }
  }, [user, state, router]);

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
  if (state !== 'verified' || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (colleges.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] flex flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="h-24 w-24 bg-purple-50 border border-purple-100 rounded-[2.5rem] flex items-center justify-center shadow-md animate-bounce">
          <BarChart3 size={40} className="text-purple-600" />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">
            No Colleges Selected
          </h2>
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
            Select 2–3 colleges from your results to compare
          </p>
        </div>
        <button
          onClick={() => router.push("/interview")}
          className="px-8 py-4 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 transition-all duration-300 flex items-center gap-3"
        >
          <ArrowLeft size={18} /> Back to Results
        </button>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] text-gray-900 relative overflow-hidden selection:bg-purple-200">
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl relative z-10">
        {/* ── Header ── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 space-y-4"
        >
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-600 transition-colors text-[10px] font-black uppercase tracking-widest mb-4"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100">
            <BarChart3 size={14} className="text-purple-600" />
            <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">
              Side-by-Side Analysis
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-950 tracking-tight leading-tight">
            College Comparison
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">
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
                className="bg-white/70 backdrop-blur-xl border border-purple-100 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
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
                <h2 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight leading-tight mb-3">
                  {college.name}
                </h2>
                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-8">
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
                  <div className="bg-white/40 border border-purple-100/50 rounded-2xl p-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Star size={16} className={accent.icon} />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Match Score
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-xl font-bold tabular-nums",
                        accent.icon
                      )}
                    >
                      {college.match_score}%
                    </span>
                  </div>
                )}

                {/* Fees */}
                {college.fees_approx && (
                  <div className="flex items-center gap-3 mb-6 bg-white/40 border border-purple-100/50 rounded-2xl p-4">
                    <Wallet size={16} className={accent.icon} />
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                        Approx Fees
                      </p>
                      <p className="text-gray-950 font-bold text-xs sm:text-sm">
                        {college.fees_approx}
                      </p>
                    </div>
                  </div>
                )}

                {/* Courses */}
                {college.courses && college.courses.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <BookOpen size={12} className={accent.icon} />
                      Courses Offered
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {college.courses.slice(0, 6).map((course) => (
                        <span
                          key={course}
                          className="px-2.5 py-1 bg-white/60 border border-purple-100/50 rounded-full text-[9px] font-semibold text-gray-600 uppercase tracking-wider"
                        >
                          {course}
                        </span>
                      ))}
                      {college.courses.length > 6 && (
                        <span className="px-2.5 py-1 bg-white/60 border border-purple-100/50 rounded-full text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
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
                      className="mt-8 pt-8 border-t border-purple-100 space-y-4"
                    >
                      {/* Pros */}
                      {aiResult.colleges[college.name].pros?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 size={10} className="text-emerald-600" />
                            Pros
                          </p>
                          <ul className="space-y-1.5">
                            {aiResult.colleges[college.name].pros.map(
                              (pro, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-gray-600 text-xs font-medium"
                                >
                                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
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
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <XCircle size={10} className="text-rose-600" />
                            Cons
                          </p>
                          <ul className="space-y-1.5">
                            {aiResult.colleges[college.name].cons.map(
                              (con, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-gray-600 text-xs font-medium"
                                >
                                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-500 flex-shrink-0" />
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
                            "rounded-[1.5rem] p-4 border bg-purple-50/50",
                            accent.border
                          )}
                        >
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                            Verdict
                          </p>
                          <p className="text-gray-700 text-xs font-medium leading-relaxed">
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
          className="bg-white/70 backdrop-blur-xl border border-purple-100 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-sm"
        >
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10">
            <div className="h-16 w-16 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <BrainCircuit size={28} className="text-purple-600" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 mb-2">
                <Sparkles size={10} className="text-purple-600" />
                <span className="text-[9px] font-black text-purple-700 uppercase tracking-widest">
                  AI-Powered
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
                AI Analysis
              </h2>
              <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">
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
              className="h-16 px-10 rounded-2xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 transition-all duration-300 flex items-center gap-4"
            >
              <BrainCircuit size={20} />
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
                  <div className="h-20 w-20 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center">
                    <Loader2 size={36} className="text-purple-600 animate-spin" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-gray-950 font-bold text-lg tracking-tight">
                    Analysing Colleges…
                  </p>
                  <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
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
                className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4"
              >
                <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-bold text-sm mb-1">
                    Analysis Failed
                  </p>
                  <p className="text-red-600 text-xs font-medium">{aiError}</p>
                  <button
                    onClick={handleAIAnalysis}
                    className="mt-4 text-[10px] font-black text-red-700 uppercase tracking-widest hover:text-red-800 transition-colors"
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
                <div className="bg-white/40 border border-purple-100/50 rounded-2xl p-6">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Award size={12} className="text-purple-600" />
                    Summary
                  </p>
                  <p className="text-gray-700 text-sm font-medium leading-relaxed">
                    {aiResult.summary}
                  </p>
                </div>

                {/* Best Pick */}
                <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.04] pointer-events-none">
                    <Trophy size={120} className="text-purple-600" />
                  </div>
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="h-12 w-12 bg-purple-100 border border-purple-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Trophy size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-1">
                        Best Pick
                      </p>
                      <p className="text-xl font-bold text-gray-950 tracking-tight mb-3">
                        {aiResult.best_pick}
                      </p>
                      <p className="text-gray-600 text-xs sm:text-sm font-medium leading-relaxed">
                        {aiResult.best_pick_reason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-3 opacity-30 pt-4 border-t border-purple-100">
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
