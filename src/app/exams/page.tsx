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
  CheckCircle2, Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

const STREAMS = [
  "Engineering & Technology",
  "Medical & Health Sciences",
  "Science & Research",
  "Commerce & Finance",
  "Arts & Humanities",
  "Law & Legal Studies",
  "Management & Business",
  "Agriculture & Veterinary",
  "Education & Teaching"
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

      if (!response.ok) throw new Error("Failed to fetch exams");
      const data = await response.json();
      setResults(data);
      toast.success(`Found ${data.length} relevant exams!`);
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
      return 0; // Exam date sorting is complex due to strings, skipping for simplicity or can be added later
    });
  };

  const importanceColor = (imp: string) => {
    if (imp === "High") return "bg-red-500/10 text-red-400 border-red-500/20";
    if (imp === "Medium") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  };

  const levelColor = (lvl: string) => {
    if (lvl === "National") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (lvl === "State") return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0d14]"><Loader2 className="animate-spin text-purple-500" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0d14] py-20 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold uppercase tracking-widest"
          >
            <Award size={16} />
            Entrance Exam Guide
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white font-syne tracking-tighter">
            Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Admissions Journey</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto font-medium">
            Find every national, state, and university-level entrance exam you need to crack your dream college.
          </p>
        </div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#111520] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
        >
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <GraduationCap size={14} /> Course Level
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white focus:border-indigo-500 outline-none transition-all appearance-none"
              >
                {COURSE_LEVELS.map(l => <option key={l} value={l} className="bg-[#111520]">{l}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={14} /> Academic Stream
              </label>
              <select
                value={formData.stream}
                onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white focus:border-indigo-500 outline-none transition-all appearance-none"
              >
                {STREAMS.map(s => <option key={s} value={s} className="bg-[#111520]">{s}</option>)}
              </select>
            </div>

            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Award size={24} />}
                {loading ? "Analyzing Exams..." : "Show Relevant Exams"}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Filters and Sorting */}
        {results.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-widest">
                <Filter size={14} /> Filter Level:
              </div>
              <div className="flex gap-2">
                {["All", "National", "State", "University"].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setFilterLevel(lvl)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                      filterLevel === lvl 
                        ? "bg-indigo-500 border-indigo-400 text-white" 
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-widest">
                <ArrowUpDown size={14} /> Sort By:
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-indigo-500"
              >
                <option value="importance" className="bg-[#111520]">Importance</option>
                <option value="name" className="bg-[#111520]">Name</option>
              </select>
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          <AnimatePresence>
            {getSortedAndFilteredExams().map((exam, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#111520] border border-white/5 rounded-[2.5rem] p-8 space-y-6 hover:border-indigo-500/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all rotate-12">
                   <Award size={120} />
                </div>

                <div className="space-y-1 relative z-10">
                  <div className="flex justify-between items-start">
                    <h3 className="text-3xl font-black text-indigo-400 tracking-tighter">
                      {exam.short_name}
                    </h3>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      importanceColor(exam.importance)
                    )}>
                      {exam.importance} Importance
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-300">{exam.name}</p>
                </div>

                <div className="flex flex-wrap gap-2 relative z-10">
                  <span className={cn("px-3 py-1 border text-[10px] font-black uppercase tracking-widest rounded-full", levelColor(exam.level))}>
                    {exam.level}
                  </span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {exam.mode}
                  </span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {exam.frequency}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 relative z-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={12} /> Exam Date
                    </p>
                    <p className="text-sm font-bold text-white">{exam.exam_date}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Clock size={12} /> Registration
                    </p>
                    <p className="text-sm font-bold text-white">{exam.registration_start}</p>
                  </div>
                </div>

                <div className="space-y-2 relative z-10">
                   <p className="text-sm text-slate-400 font-medium italic border-l-2 border-indigo-500/50 pl-3">
                     &quot;{exam.eligibility}&quot;
                   </p>
                </div>

                <div className="space-y-3 relative z-10">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                    <BookOpen size={14} className="text-indigo-500" /> Syllabus Highlights
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exam.syllabus_highlights.map((topic: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-indigo-500/5 border border-indigo-500/10 text-indigo-300 text-[10px] font-bold rounded-lg">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl relative z-10 group/tip">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">
                    <Lightbulb size={16} className="animate-pulse" /> Expert Tip
                  </div>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed group-hover/tip:text-slate-300 transition-colors">
                    {exam.tip}
                  </p>
                </div>

                <a
                  href={exam.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-14 bg-white/5 border border-white/10 hover:border-indigo-500/50 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all relative z-10 group/btn"
                >
                  Official Exam Site 
                  <ExternalLink size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </a>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {results.length === 0 && !loading && (
          <div className="text-center py-20 space-y-6">
            <div className="h-24 w-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 text-slate-700">
              <Award size={48} />
            </div>
            <p className="text-slate-500 font-bold">Relevant entrance exams will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
