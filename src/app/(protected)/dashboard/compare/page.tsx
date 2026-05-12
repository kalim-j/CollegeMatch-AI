"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, X, Sparkles, GraduationCap, 
  Globe, Info, BrainCircuit, Loader2, 
  Star, Filter, ChevronDown, Plus as PlusIcon,
  Zap, ArrowRight, Activity, ShieldCheck,
  Target, BarChart3, Award, Briefcase, Wallet,
  MapPin
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const GROQ_KEY   = process.env.NEXT_PUBLIC_GROQ_API_KEY || "";
const GROQ_MODEL = "llama-3.3-70b-versatile";

type College = {
  id: string;
  name: string;
  state: string;
  city: string;
  address: string;
  website?: string;
  nirf_rank?: number;
  cutoff_general?: number;
  avg_package_lpa?: number;
  max_package_lpa?: number;
  naac_grade?: string;
  type?: string;
  fees_approx?: string;
  entrance_exam?: string;
  established_year?: number;
  seats?: number;
};

const STATES = [
  "All States", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Chandigarh", "Puducherry", "Jammu & Kashmir"
];

const TYPES = ["All Types", "Government", "Private", "Deemed", "Autonomous", "Central"];

const EXAMS = ["All", "JEE Advanced", "JEE Main", "TNEA", "KEAM", "WBJEE", "TSEAMCET", "BITSAT", "GUJCET", "MHT-CET", "KCET", "State CET"];

const SORT_OPTIONS = [
  { label: "NIRF Rank", value: "nirf_rank" },
  { label: "Avg Package ↑", value: "avg_package_lpa" },
  { label: "Cutoff Low→High", value: "cutoff_asc" },
  { label: "Cutoff High→Low", value: "cutoff_desc" }
];

export default function ComparePage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    state: "All States",
    type: "All Types",
    exam: "All",
    sort: "nirf_rank"
  });
  const [results, setResults] = useState<College[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const [selected, setSelected] = useState<College[]>([]);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErr, setAiErr] = useState("");

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2 || (query.length === 0 && showDrop)) {
        performSearch();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, filters]);

  const performSearch = async () => {
    setSearching(true);
    try {
      let q = supabase.from("colleges").select("*");
      
      if (filters.state !== "All States") q = q.eq("state", filters.state);
      if (filters.type !== "All Types") q = q.eq("type", filters.type);
      if (filters.exam !== "All") q = q.eq("entrance_exam", filters.exam);
      if (query) q = q.ilike("name", `%${query}%`);

      if (filters.sort === "nirf_rank") q = q.order("nirf_rank", { ascending: true, nullsFirst: false });
      else if (filters.sort === "avg_package_lpa") q = q.order("avg_package_lpa", { ascending: false });
      else if (filters.sort === "cutoff_asc") q = q.order("cutoff_general", { ascending: true });
      else if (filters.sort === "cutoff_desc") q = q.order("cutoff_general", { ascending: false });

      const { data, error } = await q.limit(20);
      
      if (!error && data) {
        setResults(data.map(c => ({
          ...c,
          id: c.id.toString(),
          city: c.location,
          address: c.location
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const addCollege = (c: College) => {
    if (selected.find(s => s.id === c.id)) return;
    if (selected.length >= 3) {
      toast.error("Maximum 3 institutions allowed for comparison intelligence.");
      return;
    }
    setSelected([...selected, c]);
    setQuery("");
    setShowDrop(false);
  };

  const removeCollege = (id: string) => {
    setSelected(selected.filter(s => s.id !== id));
  };

  const handleCompare = async () => {
    if (selected.length < 2) return;
    setAiLoading(true);
    setAiErr("");
    setAiText("");

    const list = selected.map((c, i) =>
      `${i + 1}. ${c.name} — Location: ${c.city}, ${c.state}` +
      (c.nirf_rank      ? ` | NIRF Rank: #${c.nirf_rank}`            : "") +
      (c.cutoff_general ? ` | Cutoff: ${c.cutoff_general}%`          : "") +
      (c.avg_package_lpa? ` | Avg Package: ${c.avg_package_lpa} LPA`  : "") +
      (c.max_package_lpa? ` | Max Package: ${c.max_package_lpa} LPA`  : "") +
      (c.fees_approx    ? ` | Fees/Year: ${c.fees_approx}`           : "") +
      (c.entrance_exam  ? ` | Entrance: ${c.entrance_exam}`          : "") +
      (c.established_year? ` | Est: ${c.established_year}`           : "") +
      (c.seats          ? ` | Seats: ${c.seats}`                    : "") +
      (c.naac_grade     ? ` | NAAC: ${c.naac_grade}`                : "")
    ).join("\n");

    const prompt = `You are an expert Indian engineering college counselor. Compare these ${selected.length} colleges for an Indian student: ${list}. Provide a DETAILED comparison under these headings: 🏆 Rankings & Reputation, 📚 Academics, 💼 Placements, 📊 Admission Difficulty, 💰 Fees vs Value, 🎯 Selection Strategy, ✅ Final Verdict.`;

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2
        })
      });
      const data = await res.json();
      setAiText(data.choices[0].message.content);
    } catch (err) {
      setAiErr("Failed to execute AI comparison sequence.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05071a] text-white relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />
      </div>

      <div className="container mx-auto px-6 py-16 max-w-7xl relative z-10">
        <header className="mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <BarChart3 size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Cross-Institutional Analysis</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight">College Comparison</h1>
          <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">Select up to 3 institutions for deep-dive AI comparative intelligence</p>
        </header>

        {/* Filters Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-2xl mb-12 shadow-xl">
          {[
            { label: "Geographic", key: "state", options: STATES },
            { label: "Category", key: "type", options: TYPES },
            { label: "Entrance", key: "exam", options: EXAMS },
            { label: "Sorting", key: "sort", options: SORT_OPTIONS, isSort: true }
          ].map((f) => (
            <div key={f.key} className="space-y-3">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">{f.label}</label>
              <div className="relative">
                <select 
                  value={filters[f.key as keyof typeof filters]} 
                  onChange={(e) => setFilters({...filters, [f.key]: e.target.value})}
                  className="w-full h-14 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white font-bold outline-none focus:border-indigo-500/50 appearance-none transition-all cursor-pointer"
                >
                  {f.options.map((o: any) => (
                    <option key={f.isSort ? o.value : o} value={f.isSort ? o.value : o} className="bg-[#05071a]">{f.isSort ? o.label : o}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={16} />
              </div>
            </div>
          ))}
        </div>

        {/* Search Command Center */}
        <div className="relative max-w-2xl mx-auto mb-16" ref={searchRef}>
          <div className="relative group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-500 transition-colors" size={24} />
            <input
              type="text"
              placeholder="Search institution to add to comparison…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowDrop(true)}
              className="w-full h-24 bg-white/[0.03] border-2 border-white/5 rounded-[3rem] px-20 text-xl font-bold text-white outline-none focus:border-indigo-500/30 focus:bg-white/[0.06] transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)] placeholder:text-white/10"
            />
          </div>

          <AnimatePresence>
            {showDrop && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute top-full left-0 right-0 mt-6 bg-[#0a0d1e] border border-white/10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.7)] overflow-hidden z-50 max-h-[450px] overflow-y-auto backdrop-blur-3xl"
              >
                {searching ? (
                  <div className="p-16 text-center flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-500 opacity-50" />
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Scanning Repository…</span>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-16 text-center text-white/20 font-black text-[10px] uppercase tracking-[0.3em]">No institutional matches found</div>
                ) : (
                  <div className="p-4 space-y-2">
                    {results.map(c => (
                        <button
                          key={c.id}
                          className="w-full p-8 text-left hover:bg-white/[0.05] rounded-[2rem] transition-all flex justify-between items-center group relative overflow-hidden"
                          onMouseDown={() => addCollege(c)}
                        >
                          <div className="relative z-10">
                            <div className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight">{c.name}</div>
                            <div className="text-[10px] font-black text-white/20 mt-2 uppercase tracking-widest flex items-center gap-2">
                                <MapPin size={10} className="text-indigo-500" /> {c.city}, {c.state}
                            </div>
                          </div>
                          <div className="h-12 w-12 bg-white/[0.05] rounded-2xl flex items-center justify-center text-white/10 group-hover:bg-indigo-600 group-hover:text-white transition-all relative z-10">
                              <PlusIcon size={20} />
                          </div>
                        </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selection Theater */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {selected.map((c, i) => (
                <motion.div
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white/[0.03] border border-white/5 rounded-[3.5rem] p-10 relative group overflow-hidden shadow-2xl"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => removeCollege(c.id)} className="h-12 w-12 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="mb-10 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Entity {i+1}</span>
                        </div>
                        <h3 className="text-3xl font-black text-white line-clamp-2 leading-tight tracking-tight min-h-[4.5rem]">{c.name}</h3>
                        <p className="text-[10px] font-black text-white/20 mt-4 uppercase tracking-[0.2em] flex items-center gap-2 justify-center md:justify-start">
                          <MapPin size={12} className="text-indigo-500" /> {c.city}, {c.state}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 text-center">
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">NIRF Ranking</p>
                            <p className="font-black text-indigo-400 text-2xl tabular-nums">#{c.nirf_rank || '—'}</p>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 text-center">
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">Avg Package</p>
                            <p className="font-black text-teal-400 text-2xl tabular-nums">{c.avg_package_lpa || '—'}L</p>
                        </div>
                    </div>
                </motion.div>
            ))}
            {selected.length < 3 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-4 border-dashed border-white/5 rounded-[3.5rem] flex flex-col items-center justify-center p-16 text-center hover:border-indigo-500/30 hover:bg-white/[0.01] transition-all group cursor-pointer"
                  onClick={() => setShowDrop(true)}
                >
                    <div className="h-20 w-20 bg-white/[0.03] border border-white/5 rounded-[2.5rem] flex items-center justify-center text-white/10 mb-6 group-hover:scale-110 group-hover:text-indigo-500 transition-all">
                        <PlusIcon size={32} />
                    </div>
                    <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">Inject Institution</p>
                </motion.div>
            )}
        </div>

        {selected.length >= 2 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-24"
            >
                <button 
                    onClick={handleCompare}
                    disabled={aiLoading}
                    className="h-24 px-16 btn-primary rounded-[2.5rem] text-xl font-black shadow-[0_20px_80px_rgba(99,102,241,0.3)] group flex items-center justify-center gap-6 mx-auto"
                >
                    {aiLoading ? <Loader2 className="animate-spin" size={32} /> : <BrainCircuit size={32} className="group-hover:rotate-12 transition-transform" />}
                    {aiLoading ? "AI Synthesizing Data..." : "Execute Deep AI Analysis"}
                </button>
            </motion.div>
        )}

        {/* Intelligence Report Result */}
        <AnimatePresence>
            {(aiText || aiErr) && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 md:p-20 shadow-[0_60px_150px_rgba(0,0,0,0.6)] relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500" />
                    <div className="flex flex-col md:flex-row items-center gap-10 mb-16 border-b border-white/5 pb-12">
                        <div className="h-24 w-24 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center text-indigo-400 shadow-2xl border border-indigo-500/20 relative">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                            <BrainCircuit size={48} className="relative z-10" />
                        </div>
                        <div className="text-center md:text-left space-y-2">
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">AI Synthesis Report</h2>
                            <p className="text-indigo-400 font-bold uppercase tracking-[0.4em] text-[10px]">Comparative Institutional Intelligence Sequence</p>
                        </div>
                    </div>

                    <div className="prose prose-invert prose-indigo max-w-none prose-h2:text-white prose-h2:font-black prose-p:text-white/60 prose-p:text-xl prose-p:leading-relaxed whitespace-pre-wrap font-medium">
                        {aiText || aiErr}
                    </div>
                    
                    <div className="mt-20 pt-10 border-t border-white/5 flex items-center justify-center gap-3 opacity-30">
                      <ShieldCheck size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Verified CollegeMatch-AI Predictive Data</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
