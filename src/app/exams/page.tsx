"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  Search, GraduationCap, Building, Calendar, 
  ExternalLink, Info, Loader2, ChevronDown, ChevronUp,
  MapPin, BookOpen, Clock, Award, Star, Filter, ArrowUpDown, 
  CheckCircle2, Lightbulb, Target, ShieldCheck, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import SelectField from "@/components/SelectField";
import { useAuthGuard } from '@/lib/auth-guard';

const STREAMS = [
  "Engineering & Technology", "Medical & Health Sciences", "Science & Research",
  "Commerce & Finance", "Arts & Humanities", "Law & Legal Studies",
  "Management & Business", "Agriculture & Veterinary", "Education & Teaching"
];
const COURSE_LEVELS = ["UG", "PG"];

export default function EntranceExamGuide() {
  const { user, state: authLoading } = useAuthGuard();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("importance");
  const [filterLevel, setFilterLevel] = useState("All");

  const [formData, setFormData] = useState({
    level: "UG",
    stream: "Engineering & Technology"
  });



  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    try {
      const response = await fetch("/api/entrance-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Exam intelligence fetch failure.");
      const data = await response.json();
      setResults(data);
      toast.success(`Discovered ${data.length} exams!`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSortedAndFilteredExams = () => {
    let filtered = results;
    if (filterLevel !== "All") {
      filtered = filtered.filter(e => e.level === filterLevel);
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === "importance") {
        const priority: any = { High: 0, Medium: 1, Low: 2 };
        return priority[a.importance] - priority[b.importance];
      }
      if (sortBy === "name") return a.short_name.localeCompare(b.short_name);
      return 0;
    });
  };

  const importanceColor = (imp: string) => {
    if (imp === "High") return "bg-red-50 text-red-750 border-red-200";
    if (imp === "Medium") return "bg-amber-50 text-amber-750 border-amber-200";
    return "bg-emerald-50 text-emerald-750 border-emerald-200";
  };

  const levelColor = (lvl: string) => {
    if (lvl === "National") return "bg-indigo-50 text-indigo-750 border-indigo-200";
    if (lvl === "State") return "bg-teal-50 text-teal-750 border-teal-200";
    return "bg-purple-50 text-purple-750 border-purple-200";
  };

  if (authLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] flex items-center justify-center">
      <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] dark:from-[#05071a] dark:to-[#0a0d24] text-gray-900 relative overflow-hidden selection:bg-purple-200 py-24">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <header className="text-center space-y-6 mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-sm"
          >
            <Award size={14} />
            Admission Benchmarks
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-950 dark:text-white tracking-tight">
            Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">Admissions Journey</span>
          </h1>
          <p className="text-gray-500 dark:text-[rgba(255,255,255,0.72)] font-bold uppercase tracking-[0.2em] text-[10px] max-w-lg mx-auto">
            Find every national, state, and university-level entrance benchmark required to secure your placement in elite institutions.
          </p>
        </header>

        {/* Search Engine */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 md:p-12 shadow-sm mb-16 relative overflow-hidden group"
        >
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end relative z-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <GraduationCap size={12} className="text-purple-600" /> Academic Level
              </label>
              <SelectField
                value={formData.level}
                onChange={(v) => setFormData({ ...formData, level: v })}
                options={COURSE_LEVELS.map(l => ({ value: l, label: l }))}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <BookOpen size={12} className="text-purple-600" /> Subject Stream
              </label>
              <SelectField
                value={formData.stream}
                onChange={(v) => setFormData({ ...formData, stream: v })}
                options={STREAMS.map(s => ({ value: s, label: s }))}
              />
            </div>

            <div className="md:col-span-2 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 text-xs tracking-widest font-semibold uppercase bg-purple-600 hover:bg-purple-750 text-white rounded-2xl shadow-lg shadow-purple-200 transition duration-300 flex items-center justify-center gap-2 group"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} className="group-hover:rotate-12 transition-transform" />}
                {loading ? "Analyzing Exam Repository..." : "Execute Intelligence Search"}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Intelligence Filters */}
        {results.length > 0 && (
          <div className="flex flex-col xl:flex-row justify-between items-center gap-8 glass-card p-6 rounded-3xl mb-12 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-2 text-gray-400 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest">
                <Filter size={14} className="text-purple-600" /> Geographic Scope:
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {["All", "National", "State", "University"].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setFilterLevel(lvl)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                      filterLevel === lvl 
                        ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-200" 
                        : "bg-white/5 border-purple-100/50 dark:border-[rgba(255,255,255,0.2)] text-gray-500 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/10 hover:text-purple-700 dark:hover:text-white"
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-400 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest">
                <ArrowUpDown size={14} className="text-purple-600" /> Sequence Logic:
              </div>
              <div style={{ width: '200px' }}>
                <SelectField
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { value: 'importance', label: 'Impact Priority' },
                    { value: 'name', label: 'Alphabetic Sequence' }
                  ]}
                />
              </div>
            </div>
          </div>
        )}

        {/* Results Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence>
            {getSortedAndFilteredExams().map((exam, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card rounded-3xl p-8 space-y-8 hover:border-purple-300/50 transition-all group relative overflow-hidden shadow-sm"
              >
                <div className="space-y-3 relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-300 tracking-tight group-hover:text-purple-900 dark:group-hover:text-purple-200 transition-colors leading-none">
                      {exam.short_name}
                    </h3>
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm",
                      importanceColor(exam.importance)
                    )}>
                      {exam.importance} Priority
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-400 dark:text-[rgba(255,255,255,0.55)] uppercase tracking-widest">{exam.name}</p>
                </div>

                <div className="flex flex-wrap gap-2 relative z-10">
                  <span className={cn("px-4 py-1.5 border text-[9px] font-black uppercase tracking-widest rounded-lg", levelColor(exam.level))}>
                    {exam.level} Scope
                  </span>
                  <span className="px-4 py-1.5 bg-white/5 border border-purple-100/50 dark:border-[rgba(255,255,255,0.2)] text-gray-500 dark:text-[rgba(255,255,255,0.72)] text-[9px] font-black uppercase tracking-widest rounded-lg">
                    {exam.mode}
                  </span>
                  <span className="px-4 py-1.5 bg-white/5 border border-purple-100/50 dark:border-[rgba(255,255,255,0.2)] text-gray-500 dark:text-[rgba(255,255,255,0.72)] text-[9px] font-black uppercase tracking-widest rounded-lg">
                    {exam.frequency}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6 rounded-2xl bg-white/5 border border-purple-100/50 dark:border-[rgba(255,255,255,0.05)] relative z-10 shadow-sm">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={12} className="text-purple-600" /> Examination Window
                    </p>
                    <p className="text-base font-black text-gray-900 dark:text-white tabular-nums">{exam.exam_date}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={12} className="text-purple-600" /> Registration Baseline
                    </p>
                    <p className="text-base font-black text-gray-900 dark:text-white tabular-nums">{exam.registration_start}</p>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                   <p className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest">Eligibility Protocol</p>
                   <p className="text-base text-gray-600 dark:text-[rgba(255,255,255,0.72)] font-medium italic leading-relaxed pl-4 border-l-2 border-purple-300">
                     &quot;{exam.eligibility}&quot;
                   </p>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <BookOpen size={16} className="text-purple-600" /> Syllabus Intelligence
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exam.syllabus_highlights.map((topic: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-bold uppercase rounded-lg">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-50/60 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 p-6 rounded-3xl relative z-10 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-3">
                    <Zap size={14} className="animate-pulse" /> Expert Intelligence Tip
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-emerald-200 leading-relaxed relative z-10">
                    {exam.tip}
                  </p>
                </div>

                <a
                  href={exam.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-14 bg-purple-600 hover:bg-purple-750 text-white rounded-xl flex items-center justify-center gap-3 group text-xs font-semibold uppercase relative z-10 shadow-md shadow-purple-250/20"
                >
                  Official Examination Portal 
                  <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {results.length === 0 && !loading && (
          <div className="text-center py-32 space-y-8">
            <div className="relative inline-block">
              <div className="h-32 w-32 glass-card rounded-[3rem] flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400 relative z-10 shadow-sm animate-pulse">
                <Target size={56} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-gray-950 dark:text-white font-bold text-xl tracking-tight">Intelligence Matrix Ready</p>
              <p className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-[0.2em] text-[9px]">Select your academic parameters to discover exams</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
