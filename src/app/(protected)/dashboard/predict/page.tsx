"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Loader2,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  BarChart3,
  Lightbulb,
  GraduationCap,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { stateDistricts } from "@/data/stateDistricts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CutoffTrendPoint {
  year: string;
  cutoff: number;
}

interface PredictionResult {
  verdict: "Likely" | "Borderline" | "Unlikely";
  confidence: number;
  reasoning: string;
  cutoff_trend: CutoffTrendPoint[];
  recommendation: string;
  alternative_colleges?: string[];
}

interface PredictFormData {
  cutoff_mark: string;
  community: string;
  stream: string;
  state: string;
  college_name: string;
  course_preference: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COMMUNITIES = ["BC", "MBC", "OC", "SC", "ST"];

const STREAMS = [
  "Engineering",
  "Medical",
  "Arts & Science",
  "Commerce",
  "Law",
  "Agriculture",
  "Architecture",
  "Pharmacy",
  "Nursing",
  "Hotel Management",
  "Design",
  "MBA",
];

const STATE_OPTIONS = Object.keys(stateDistricts);

// ─── Verdict Config ───────────────────────────────────────────────────────────

const VERDICT_CONFIG = {
  Likely: {
    card: "bg-teal-500/10 border-teal-500/20",
    badge: "bg-teal-500/20 border-teal-500/30 text-teal-300",
    bar: "bg-teal-500",
    icon: CheckCircle2,
    iconColor: "text-teal-400",
    label: "Likely",
    glow: "bg-teal-500/5",
  },
  Borderline: {
    card: "bg-amber-500/10 border-amber-500/20",
    badge: "bg-amber-500/20 border-amber-500/30 text-amber-300",
    bar: "bg-amber-500",
    icon: AlertTriangle,
    iconColor: "text-amber-400",
    label: "Borderline",
    glow: "bg-amber-500/5",
  },
  Unlikely: {
    card: "bg-red-500/10 border-red-500/20",
    badge: "bg-red-500/20 border-red-500/30 text-red-300",
    bar: "bg-red-500",
    icon: XCircle,
    iconColor: "text-red-400",
    label: "Unlikely",
    glow: "bg-red-500/5",
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full h-14 px-5 pr-10 rounded-2xl appearance-none",
            "bg-white/[0.04] border border-white/10 text-white",
            "focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06]",
            "transition-all font-bold text-sm",
            !value && "text-white/30"
          )}
        >
          {placeholder && (
            <option value="" disabled className="bg-[#05071a] text-white/30">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-[#0d1030] text-white">
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
        />
      </div>
    </div>
  );
}

function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  min,
  max,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className={cn(
          "w-full h-14 px-5 rounded-2xl",
          "bg-white/[0.04] border border-white/10 text-white placeholder:text-white/20",
          "focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06]",
          "transition-all font-bold text-sm"
        )}
      />
    </div>
  );
}

// ─── CSS Bar Chart ────────────────────────────────────────────────────────────

function CutoffBarChart({
  data,
  verdictBar,
}: {
  data: CutoffTrendPoint[];
  verdictBar: string;
}) {
  const maxVal = Math.max(...data.map((d) => d.cutoff), 1);

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
        <TrendingUp size={12} className="text-indigo-400" />
        Cutoff Trend (Last {data.length} Years)
      </p>
      <div className="flex items-end gap-3 h-28">
        {data.map((point, i) => {
          const heightPct = Math.round((point.cutoff / maxVal) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[9px] font-black text-white/40 tabular-nums">
                {point.cutoff}
              </span>
              <motion.div
                className={cn("w-full rounded-t-lg", verdictBar)}
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%` }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                style={{ minHeight: "4px" }}
              />
              <span className="text-[9px] font-black text-white/30 uppercase tracking-wider">
                {point.year}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PredictPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<PredictFormData>({
    cutoff_mark: "",
    community: "",
    stream: "",
    state: "",
    college_name: "",
    course_preference: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState("");

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // ── Loading / auth spinner ──────────────────────────────────────────────────
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#05071a] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
      </div>
    );
  }

  // ── Form field updater ──────────────────────────────────────────────────────
  const setField = (key: keyof PredictFormData) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ── Validation ──────────────────────────────────────────────────────────────
  const isValid = () => {
    const mark = Number(form.cutoff_mark);
    return (
      form.cutoff_mark !== "" &&
      !isNaN(mark) &&
      mark >= 0 &&
      mark <= 200 &&
      form.community !== "" &&
      form.stream !== "" &&
      form.state !== "" &&
      form.college_name.trim() !== "" &&
      form.course_preference.trim() !== ""
    );
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid()) return;

    setSubmitting(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/predict-cutoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cutoff_mark: Number(form.cutoff_mark),
          community: form.community,
          stream: form.stream,
          state: form.state,
          college_name: form.college_name.trim(),
          course_preference: form.course_preference.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Prediction failed. Please try again.");
      }

      const data: PredictionResult = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Verdict config ──────────────────────────────────────────────────────────
  const verdictCfg = result ? VERDICT_CONFIG[result.verdict] : null;
  const VerdictIcon = verdictCfg?.icon ?? CheckCircle2;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#05071a] text-white relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl relative z-10">
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
            <Target size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">
              AI-Powered Prediction
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight">
            Cutoff Predictor
          </h1>
          <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">
            Know your admission chances before you apply
          </p>
        </motion.header>

        {/* ── Prediction Form ── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[3rem] p-8 sm:p-10 relative overflow-hidden mb-8"
        >
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500 rounded-t-[3rem]" />

          <div className="flex items-center gap-4 mb-10">
            <div className="h-14 w-14 bg-indigo-500/10 border border-indigo-500/20 rounded-[1.5rem] flex items-center justify-center flex-shrink-0">
              <Sparkles size={24} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tighter">
                Prediction Form
              </h2>
              <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">
                Fill in your details for an accurate prediction
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Cutoff Mark + Community */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="Cutoff Mark"
                type="number"
                value={form.cutoff_mark}
                onChange={setField("cutoff_mark")}
                placeholder="e.g. 185"
                min={0}
                max={200}
              />
              <SelectField
                label="Community"
                value={form.community}
                onChange={setField("community")}
                options={COMMUNITIES}
                placeholder="Select community"
              />
            </div>

            {/* Row 2: Stream + State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SelectField
                label="Stream"
                value={form.stream}
                onChange={setField("stream")}
                options={STREAMS}
                placeholder="Select stream"
              />
              <SelectField
                label="State"
                value={form.state}
                onChange={setField("state")}
                options={STATE_OPTIONS}
                placeholder="Select state"
              />
            </div>

            {/* Row 3: College Name */}
            <InputField
              label="College Name"
              value={form.college_name}
              onChange={setField("college_name")}
              placeholder="e.g. PSG College of Technology"
            />

            {/* Row 4: Course Preference */}
            <InputField
              label="Course Preference"
              value={form.course_preference}
              onChange={setField("course_preference")}
              placeholder="e.g. Computer Science"
            />

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={!isValid() || submitting}
              whileHover={isValid() && !submitting ? { scale: 1.02 } : {}}
              whileTap={isValid() && !submitting ? { scale: 0.98 } : {}}
              className={cn(
                "w-full h-16 rounded-[2rem] font-black uppercase tracking-widest text-sm",
                "flex items-center justify-center gap-3 transition-all",
                isValid() && !submitting
                  ? "btn-primary shadow-[0_20px_60px_rgba(99,102,241,0.25)]"
                  : "bg-white/[0.05] border border-white/10 text-white/30 cursor-not-allowed"
              )}
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Predicting…
                </>
              ) : (
                <>
                  <Target size={20} />
                  Predict My Chances
                </>
              )}
            </motion.button>
          </form>
        </motion.section>

        {/* ── Error State ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-[2rem] p-8 flex items-start gap-4 mb-8"
            >
              <XCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-black text-sm mb-1">
                  Prediction Failed
                </p>
                <p className="text-red-400/60 text-xs font-medium">{error}</p>
                <button
                  onClick={() => setError("")}
                  className="mt-4 text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-300 transition-colors"
                >
                  Dismiss →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Result Card ── */}
        <AnimatePresence>
          {result && verdictCfg && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Verdict Card */}
              <div
                className={cn(
                  "backdrop-blur-2xl border rounded-[3rem] p-8 sm:p-10 relative overflow-hidden",
                  verdictCfg.card
                )}
              >
                {/* Glow */}
                <div
                  className={cn(
                    "absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] pointer-events-none",
                    verdictCfg.glow
                  )}
                />

                {/* Verdict header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8 relative z-10">
                  <div
                    className={cn(
                      "h-16 w-16 rounded-[1.5rem] border flex items-center justify-center flex-shrink-0",
                      verdictCfg.card
                    )}
                  >
                    <VerdictIcon size={28} className={verdictCfg.iconColor} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">
                      Admission Verdict
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-4xl font-black text-white tracking-tighter">
                        {result.verdict}
                      </h2>
                      <span
                        className={cn(
                          "px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest",
                          verdictCfg.badge
                        )}
                      >
                        {result.confidence}% Confidence
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="space-y-2 mb-8 relative z-10">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                      Confidence Level
                    </span>
                    <span className="text-[10px] font-black text-white/50 tabular-nums">
                      {result.confidence}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", verdictCfg.bar)}
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                </div>

                {/* Reasoning */}
                <div className="bg-white/[0.04] border border-white/5 rounded-[2rem] p-6 mb-6 relative z-10">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <BarChart3 size={12} className="text-indigo-400" />
                    AI Reasoning
                  </p>
                  <p className="text-white/70 text-sm font-medium leading-relaxed">
                    {result.reasoning}
                  </p>
                </div>

                {/* Cutoff Trend Bar Chart */}
                {result.cutoff_trend && result.cutoff_trend.length > 0 && (
                  <div className="bg-white/[0.04] border border-white/5 rounded-[2rem] p-6 mb-6 relative z-10">
                    <CutoffBarChart
                      data={result.cutoff_trend}
                      verdictBar={verdictCfg.bar}
                    />
                  </div>
                )}

                {/* Recommendation */}
                {result.recommendation && (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] p-6 relative z-10">
                    <p className="text-[10px] font-black text-indigo-300/60 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Lightbulb size={12} className="text-indigo-400" />
                      Recommendation
                    </p>
                    <p className="text-white/70 text-sm font-medium leading-relaxed">
                      {result.recommendation}
                    </p>
                  </div>
                )}
              </div>

              {/* Alternative Colleges (only when Unlikely) */}
              <AnimatePresence>
                {result.verdict === "Unlikely" &&
                  result.alternative_colleges &&
                  result.alternative_colleges.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[3rem] p-8 sm:p-10"
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 bg-indigo-500/10 border border-indigo-500/20 rounded-[1.5rem] flex items-center justify-center flex-shrink-0">
                          <GraduationCap size={22} className="text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">
                            Don&apos;t worry
                          </p>
                          <h3 className="text-xl font-black text-white tracking-tighter">
                            Alternative Colleges
                          </h3>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {result.alternative_colleges.map((college, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-black text-indigo-300 uppercase tracking-wider"
                          >
                            {college}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>

              {/* Footer */}
              <div className="flex items-center justify-center gap-3 opacity-30 py-4">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Verified CollegeMatch AI Predictive Data
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
