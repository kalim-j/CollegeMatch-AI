"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, GraduationCap, Globe, Info, BrainCircuit, Loader2, Star, Filter, ChevronDown, Plus as PlusIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

      // Apply sorting
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
      toast.error("Max 3 colleges allowed for comparison");
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

    const prompt = `You are an expert Indian engineering college counselor.
Compare these ${selected.length} colleges for an Indian student:
${list}

Provide a DETAILED, HONEST comparison under these headings:
🏆 Rankings & Reputation
📚 Academics & Curriculum  
💼 Placements & Salary Packages
📊 Admission Difficulty (Cutoffs)
💰 Fees vs Value for Money
🎯 Who Should Choose Which College
✅ Final Verdict — Best overall pick and why

Be specific, practical, and use numbers.`;

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
      setAiErr("Failed to generate AI comparison. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] p-4 md:p-8 selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-white font-syne"
          >
            College Comparison
          </motion.h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Select up to 3 colleges for a detailed side-by-side AI analysis.</p>
        </header>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">State</label>
            <div className="relative">
              <select 
                value={filters.state} 
                onChange={(e) => setFilters({...filters, state: e.target.value})}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-slate-200 outline-none focus:border-purple-500/50 appearance-none transition-all cursor-pointer font-bold"
              >
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Type</label>
            <div className="relative">
              <select 
                value={filters.type} 
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-slate-200 outline-none focus:border-purple-500/50 appearance-none transition-all cursor-pointer font-bold"
              >
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Entrance Exam</label>
            <div className="relative">
              <select 
                value={filters.exam} 
                onChange={(e) => setFilters({...filters, exam: e.target.value})}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-slate-200 outline-none focus:border-purple-500/50 appearance-none transition-all cursor-pointer font-bold"
              >
                {EXAMS.map(x => <option key={x} value={x}>{x}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sort By</label>
            <div className="relative">
              <select 
                value={filters.sort} 
                onChange={(e) => setFilters({...filters, sort: e.target.value})}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-slate-200 outline-none focus:border-purple-500/50 appearance-none transition-all cursor-pointer font-bold"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative max-w-2xl mx-auto" ref={searchRef}>
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors" />
            <input
              type="text"
              placeholder="Search for a college by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowDrop(true)}
              className="w-full h-20 bg-white/5 border-2 border-white/10 rounded-[2rem] px-16 text-xl font-bold text-white outline-none focus:border-purple-500/50 focus:bg-white/[0.08] transition-all shadow-2xl"
            />
          </div>

          <AnimatePresence>
            {showDrop && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-4 bg-[#111520] border border-white/10 rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden z-50 max-h-[400px] overflow-y-auto backdrop-blur-3xl"
              >
                {searching ? (
                  <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="font-bold tracking-widest uppercase text-xs">Scanning Database...</span>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 font-bold tracking-widest uppercase text-xs">No colleges found matching filters</div>
                ) : (
                  <div className="p-2">
                    {results.map(c => (
                        <button
                          key={c.id}
                          className="w-full p-6 text-left hover:bg-white/5 rounded-2xl transition-all flex justify-between items-center group"
                          onMouseDown={() => addCollege(c)}
                        >
                          <div>
                            <div className="font-black text-white text-lg group-hover:text-purple-400 transition-colors">{c.name}</div>
                            <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">
                                {[c.city, c.state].filter(Boolean).join(", ")}
                            </div>
                          </div>
                          <div className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all">
                              <Sparkles size={16} />
                          </div>
                        </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected Colleges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {selected.map((c, i) => (
                <motion.div
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#111520] border border-white/5 rounded-[2.5rem] p-8 relative group overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => removeCollege(c.id)} className="h-10 w-10 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="mb-6">
                        <div className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2">College {i+1}</div>
                        <h3 className="text-2xl font-black text-white line-clamp-2 font-syne">{c.name}</h3>
                        <p className="text-sm font-bold text-slate-500 mt-2">{c.city}, {c.state}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-2xl p-4">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">NIRF Rank</p>
                            <p className="font-black text-white text-xl">#{c.nirf_rank || '—'}</p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Package</p>
                            <p className="font-black text-emerald-400 text-xl">{c.avg_package_lpa || '—'}L</p>
                        </div>
                    </div>
                </motion.div>
            ))}
            {selected.length < 3 && (
                <div className="border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center">
                    <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center text-slate-600 mb-4">
                        <PlusIcon size={32} />
                    </div>
                    <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Add up to 3 colleges</p>
                </div>
            )}
        </div>

        {selected.length >= 2 && (
            <div className="text-center">
                <button 
                    onClick={handleCompare}
                    disabled={aiLoading}
                    className="h-20 px-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[2rem] text-white font-black text-xl shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-4 mx-auto"
                >
                    {aiLoading ? <Loader2 className="animate-spin" /> : <BrainCircuit size={28} />}
                    {aiLoading ? "AI Processing..." : "Start Deep AI Comparison"}
                </button>
            </div>
        )}

        {/* AI Result */}
        <AnimatePresence>
            {(aiText || aiErr) && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111520] border border-white/10 rounded-[3.5rem] p-10 md:p-16 shadow-[0_48px_120px_rgba(0,0,0,0.6)] relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500" />
                    <div className="flex items-center gap-6 mb-12">
                        <div className="h-20 w-20 bg-purple-500/10 rounded-[2rem] flex items-center justify-center text-purple-400 shadow-2xl border border-purple-500/20">
                            <BrainCircuit size={40} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-white font-syne">CollegeMatch-AI Report</h2>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-1">Intelligent Side-by-Side Analysis</p>
                        </div>
                    </div>

                    <div className="prose prose-invert prose-purple max-w-none prose-h2:text-white prose-h2:font-black prose-p:text-slate-300 prose-p:text-lg prose-p:leading-relaxed whitespace-pre-wrap">
                        {aiText}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}


