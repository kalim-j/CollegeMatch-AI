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
    card: "bg-emerald-50 border-emerald-200",
    badge: "bg-emerald-100 border-emerald-300 text-emerald-800",
    bar: "bg-emerald-500",
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    label: "Likely",
    glow: "bg-emerald-500/5",
  },
  Borderline: {
    card: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 border-amber-300 text-amber-800",
    bar: "bg-amber-500",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    label: "Borderline",
    glow: "bg-amber-500/5",
  },
  Unlikely: {
    card: "bg-rose-50 border-rose-200",
    badge: "bg-rose-100 border-rose-300 text-rose-800",
    bar: "bg-rose-500",
    icon: XCircle,
    iconColor: "text-rose-600",
    label: "Unlikely",
    glow: "bg-rose-500/5",
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
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full h-14 px-5 pr-10 rounded-2xl appearance-none",
            "bg-white/80 border border-purple-200 text-gray-900",
            "focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 focus:outline-none",
            "transition-all font-bold text-sm",
            !value && "text-gray-400"
          )}
        >
          {placeholder && (
            <option value="" disabled className="bg-white text-gray-400">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-white text-gray-800">
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────

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
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
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
          "bg-white/80 border border-purple-200 text-gray-900 placeholder:text-gray-400",
          "focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 focus:outline-none",
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
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
        <TrendingUp size={12} className="text-purple-600" />
        Cutoff Trend (Last {data.length} Years)
      </p>
      <div className="flex items-end gap-3 h-28 pt-4">
        {data.map((point, i) => {
          const heightPct = Math.round((point.cutoff / maxVal) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[9px] font-black text-gray-600 tabular-nums">
                {point.cutoff}
              </span>
              <motion.div
                className={cn("w-full rounded-t-lg", verdictBar)}
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%` }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                style={{ minHeight: "4px" }}
              />
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
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
      <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
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
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] text-gray-900 relative overflow-hidden selection:bg-purple-200">
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl relative z-10">
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
            <Target size={14} className="text-purple-600" />
            <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">
              AI-Powered Prediction
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-950 tracking-tight leading-tight">
            Cutoff Predictor
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
            Know your admission chances before you apply
          </p>
        </motion.header>

        {/* ── Prediction Form ── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-xl border border-purple-100 rounded-3xl p-8 sm:p-10 relative overflow-hidden mb-8 shadow-sm"
        >
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-teal-500" />

          <div className="flex items-center gap-4 mb-10">
            <div className="h-14 w-14 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Sparkles size={24} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-950 tracking-tight">
                Prediction Form
              </h2>
              <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">
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
                "w-full h-16 rounded-2xl font-semibold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-3",
                isValid() && !submitting
                  ? "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200"
                  : "bg-gray-100 border border-purple-100 text-gray-400 cursor-not-allowed"
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
              className="bg-red-50 border border-red-100 rounded-3xl p-8 flex items-start gap-4 mb-8"
            >
              <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-bold text-sm mb-1">
                  Prediction Failed
                </p>
                <p className="text-red-600 text-xs font-medium">{error}</p>
                <button
                  onClick={() => setError("")}
                  className="mt-4 text-[10px] font-black text-red-700 uppercase tracking-widest hover:text-red-800 transition-colors"
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
                  "backdrop-blur-2xl border rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-sm bg-white/70",
                  verdictCfg.card
                )}
              >
                {/* Verdict header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8 relative z-10">
                  <div
                    className={cn(
                      "h-16 w-16 rounded-2xl border flex items-center justify-center flex-shrink-0 bg-white"
                    )}
                  >
                    <VerdictIcon size={28} className={verdictCfg.iconColor} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Admission Verdict
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-3xl font-bold text-gray-950 tracking-tight">
                        {result.verdict}
                      </h2>
                      <span
                        className={cn(
                          "px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest bg-white/80",
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
                    <span className="text-[10px] font-black text-gray-450 uppercase tracking-widest">
                      Confidence Level
                    </span>
                    <span className="text-[10px] font-black text-gray-600 tabular-nums">
                      {result.confidence}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-purple-100 rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", verdictCfg.bar)}
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                </div>

                {/* Reasoning */}
                <div className="bg-white/50 border border-purple-100/50 rounded-2xl p-6 mb-6 relative z-10 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <BarChart3 size={12} className="text-purple-600" />
                    AI Reasoning
                  </p>
                  <p className="text-gray-700 text-sm font-medium leading-relaxed">
                    {result.reasoning}
                  </p>
                </div>

                {/* Cutoff Trend Bar Chart */}
                {result.cutoff_trend && result.cutoff_trend.length > 0 && (
                  <div className="bg-white/50 border border-purple-100/50 rounded-2xl p-6 mb-6 relative z-10 shadow-sm">
                    <CutoffBarChart
                      data={result.cutoff_trend}
                      verdictBar={verdictCfg.bar}
                    />
                  </div>
                )}

                {/* Recommendation */}
                {result.recommendation && (
                  <div className="bg-purple-100/30 border border-purple-150 rounded-2xl p-6 relative z-10 shadow-sm">
                    <p className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Lightbulb size={12} className="text-purple-600" />
                      Recommendation
                    </p>
                    <p className="text-gray-700 text-sm font-medium leading-relaxed">
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
                      className="bg-white/70 backdrop-blur-xl border border-purple-100 rounded-3xl p-8 sm:p-10 shadow-sm"
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <GraduationCap size={22} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                            Don&apos;t worry
                          </p>
                          <h3 className="text-xl font-bold text-gray-950 tracking-tight">
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
                            className="px-4 py-2 bg-purple-50 border border-purple-100 rounded-full text-xs font-semibold text-purple-700 uppercase tracking-wider"
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
