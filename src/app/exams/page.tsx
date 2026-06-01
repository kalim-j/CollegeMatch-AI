"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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

const STREAMS = [
  "Engineering & Technology", "Medical & Health Sciences", "Science & Research",
  "Commerce & Finance", "Arts & Humanities", "Law & Legal Studies",
  "Management & Business", "Agriculture & Veterinary", "Education & Teaching"
];
const COURSE_LEVELS = ["UG", "PG"];

export default function EntranceExamGuide() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("importance");
  const [filterLevel, setFilterLevel] = useState("All");

  const [formData, setFormData] = useState({
    level: "UG",
    stream: "Engineering & Technology"
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

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
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] text-gray-900 relative overflow-hidden selection:bg-purple-200 py-24">
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
          <h1 className="text-4xl md:text-6xl font-bold text-gray-950 tracking-tight">
            Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Admissions Journey</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] max-w-lg mx-auto">
            Find every national, state, and university-level entrance benchmark required to secure your placement in elite institutions.
          </p>
        </header>

        {/* Search Engine */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-xl border border-purple-100 rounded-3xl p-8 md:p-12 shadow-sm mb-16 relative overflow-hidden group"
        >
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end relative z-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <GraduationCap size={12} className="text-purple-600" /> Academic Level
              </label>
              <div className="relative">
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full h-16 bg-white border border-purple-200 rounded-2xl px-6 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 appearance-none cursor-pointer transition-all"
                >
                  {COURSE_LEVELS.map(l => <option key={l} value={l} className="bg-white text-gray-800">{l}</option>)}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <BookOpen size={12} className="text-purple-600" /> Subject Stream
              </label>
              <div className="relative">
                <select
                  value={formData.stream}
                  onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                  className="w-full h-16 bg-white border border-purple-200 rounded-2xl px-6 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 appearance-none cursor-pointer transition-all"
                >
                  {STREAMS.map(s => <option key={s} value={s} className="bg-white text-gray-800">{s}</option>)}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
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
          <div className="flex flex-col xl:flex-row justify-between items-center gap-8 bg-white/70 backdrop-blur-xl border border-purple-100 p-6 rounded-3xl mb-12 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
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
                        : "bg-white border-purple-100 text-gray-500 hover:bg-purple-50 hover:text-purple-700"
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <ArrowUpDown size={14} className="text-purple-600" /> Sequence Logic:
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-purple-200 rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-900 outline-none focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 appearance-none cursor-pointer"
                >
                  <option value="importance" className="bg-white text-gray-800">Impact Priority</option>
                  <option value="name" className="bg-white text-gray-800">Alphabetic Sequence</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
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
                className="bg-white/70 backdrop-blur-xl border border-purple-100 rounded-3xl p-8 space-y-8 hover:border-purple-300 transition-all group relative overflow-hidden shadow-sm"
              >
                <div className="space-y-3 relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <h3 className="text-2xl font-bold text-purple-700 tracking-tight group-hover:text-purple-900 transition-colors leading-none">
                      {exam.short_name}
                    </h3>
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm",
                      importanceColor(exam.importance)
                    )}>
                      {exam.importance} Priority
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{exam.name}</p>
                </div>

                <div className="flex flex-wrap gap-2 relative z-10">
                  <span className={cn("px-4 py-1.5 border text-[9px] font-black uppercase tracking-widest rounded-lg", levelColor(exam.level))}>
                    {exam.level} Scope
                  </span>
                  <span className="px-4 py-1.5 bg-white border border-purple-100 text-gray-500 text-[9px] font-black uppercase tracking-widest rounded-lg">
                    {exam.mode}
                  </span>
                  <span className="px-4 py-1.5 bg-white border border-purple-100 text-gray-500 text-[9px] font-black uppercase tracking-widest rounded-lg">
                    {exam.frequency}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6 rounded-2xl bg-white/60 border border-purple-100/50 relative z-10 shadow-sm">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={12} className="text-purple-600" /> Examination Window
                    </p>
                    <p className="text-base font-black text-gray-900 tabular-nums">{exam.exam_date}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={12} className="text-purple-600" /> Registration Baseline
                    </p>
                    <p className="text-base font-black text-gray-900 tabular-nums">{exam.registration_start}</p>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Eligibility Protocol</p>
                   <p className="text-base text-gray-600 font-medium italic leading-relaxed pl-4 border-l-2 border-purple-300">
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

                <div className="bg-emerald-50/60 border border-emerald-100 p-6 rounded-3xl relative z-10 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3">
                    <Zap size={14} className="animate-pulse" /> Expert Intelligence Tip
                  </div>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed relative z-10">
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
              <div className="h-32 w-32 bg-white/70 backdrop-blur-xl rounded-[3rem] flex items-center justify-center mx-auto border border-purple-100 text-purple-600 relative z-10 shadow-sm animate-pulse">
                <Target size={56} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-gray-950 font-bold text-xl tracking-tight">Intelligence Matrix Ready</p>
              <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[9px]">Select your academic parameters to discover exams</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
