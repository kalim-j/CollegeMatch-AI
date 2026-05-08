"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, GraduationCap, Globe, Info, BrainCircuit, Loader2, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const GROQ_KEY   = process.env.NEXT_PUBLIC_GROQ_API_KEY || "";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const CLG_API    = "https://colleges-api.onrender.com";

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
};

// ── tiny debounce hook ─────────────────────────────────────────
function useDebounce<T>(val: T, ms: number = 400): T {
  const [d, setD] = useState(val);
  useEffect(() => { 
    const t = setTimeout(() => setD(val), ms); 
    return () => clearTimeout(t); 
  }, [val, ms]);
  return d;
}

// ── search colleges from Supabase/API ─────────────────────────────
async function searchColleges(query: string): Promise<College[]> {
  if (!query || query.trim().length < 2) return [];
  
  // 1. Try Supabase first
  try {
    const { data: sbData, error } = await supabase
      .from('colleges')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(10);
    
    if (!error && sbData && sbData.length > 0) {
      return sbData.map(c => ({
        id:      c.id.toString(),
        name:    c.name,
        state:   c.state,
        city:    c.location,
        address: c.location,
        website: c.website,
        nirf_rank: c.nirf_rank,
        cutoff_general: c.cutoff_general,
        avg_package_lpa: c.avg_package_lpa,
        max_package_lpa: c.max_package_lpa,
        naac_grade: c.naac_grade,
        type: c.type,
        fees_approx: c.fees_approx
      }));
    }
  } catch (err) {
    console.error("Supabase search error:", err);
  }

  // 2. Fallback to external API if Supabase fails or is empty
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const url = `${CLG_API}/colleges?search=${encodeURIComponent(query.trim())}&limit=20`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.colleges || []);
    return list.map((c: any, i: number) => ({
      id:      `${c.Name}-${i}`,
      name:    c.Name    || c.name    || "Unknown",
      state:   c.State   || c.state   || "",
      city:    c.City    || c.city    || "",
      address: [c.Address_line1, c.Address_line2].filter(Boolean).join(", "),
    }));
  } catch (err) {
    console.error("External search error:", err);
    return [];
  }
}

const POPULAR_COLLEGES: College[] = [
    { id: "p1", name: "IIT Madras", city: "Chennai", state: "Tamil Nadu", address: "Chennai", nirf_rank: 1, type: "Government" },
    { id: "p2", name: "IIT Delhi", city: "New Delhi", state: "Delhi", address: "New Delhi", nirf_rank: 2, type: "Government" },
    { id: "p3", name: "IIT Bombay", city: "Mumbai", state: "Maharashtra", address: "Mumbai", nirf_rank: 3, type: "Government" },
    { id: "p4", name: "VIT Vellore", city: "Vellore", state: "Tamil Nadu", address: "Vellore", nirf_rank: 11, type: "Private" },
    { id: "p5", name: "NIT Trichy", city: "Trichy", state: "Tamil Nadu", address: "Trichy", nirf_rank: 9, type: "Government" },
];

// ── Groq AI comparison ─────────────────────────────────────────
async function getAIComparison(colleges: College[]) {
  if (!GROQ_KEY) return "⚠️ AI analysis currently unavailable. Please check your API configuration.";

  const list = colleges.map((c, i) =>
    `${i + 1}. ${c.name} — Location: ${c.city}, ${c.state}` +
    (c.nirf_rank      ? ` | NIRF Rank: #${c.nirf_rank}`            : "") +
    (c.cutoff_general ? ` | Cutoff (Gen): ${c.cutoff_general}%`     : "") +
    (c.avg_package_lpa? ` | Avg Package: ${c.avg_package_lpa} LPA`  : "") +
    (c.max_package_lpa? ` | Max Package: ${c.max_package_lpa} LPA`  : "") +
    (c.naac_grade     ? ` | NAAC: ${c.naac_grade}`                  : "") +
    (c.type           ? ` | Type: ${c.type}`                         : "")
  ).join("\n");

  const prompt = `You are an expert Indian engineering college counselor.

Compare these ${colleges.length} colleges for an Indian student choosing engineering:

${list}

Give a DETAILED, HONEST comparison under these headings:
🏆 Rankings & Reputation
📚 Academics & Curriculum  
💼 Placements & Salary Packages
📊 Admission Difficulty (Cutoffs)
💰 Fees vs Value for Money
🎯 Who Should Choose Which College
✅ Final Verdict — Best overall pick and why

Be specific and practical. Use numbers. Help the student make a clear decision.`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: GROQ_MODEL, max_tokens: 1500, temperature: 0.6,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) { 
    const e = await res.json().catch(()=>({})); 
    throw new Error(e?.error?.message || `Groq error ${res.status}`); 
  }
  const d = await res.json();
  return d.choices?.[0]?.message?.content || "No response.";
}

export default function ComparePage() {
  const [query,     setQuery]     = useState("");
  const [results,   setResults]   = useState<College[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDrop,  setShowDrop]  = useState(false);
  const [selected,  setSelected]  = useState<College[]>([]);
  const [aiText,    setAiText]    = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErr,     setAiErr]     = useState("");
  const inputRef  = useRef<HTMLInputElement>(null);
  const debouncedQ = useDebounce(query, 400);

  useEffect(() => {
    if (debouncedQ.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    searchColleges(debouncedQ)
      .then(r => { 
        setResults(r); 
        setSearching(false); 
        setShowDrop(true); 
      })
      .catch(() => {
        setSearching(false);
      });
  }, [debouncedQ]);

  useEffect(() => {
    const h = (e: MouseEvent) => { 
      if (!(e.target as HTMLElement).closest("#cmp-search")) setShowDrop(false); 
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const addCollege = useCallback((c: College) => {
    if (selected.length >= 3 || selected.find(s => s.name === c.name)) return;
    setSelected(p => [...p, c]);
    setQuery(""); 
    setResults([]); 
    setShowDrop(false);
    setAiText(""); 
    setAiErr("");
  }, [selected]);

  const removeCollege = (id: string) => { 
    setSelected(p => p.filter(c => c.id !== id)); 
    setAiText(""); 
    setAiErr(""); 
  };

  const handleCompare = async () => {
    setAiLoading(true); 
    setAiText(""); 
    setAiErr("");
    try { 
      const result = await getAIComparison(selected);
      setAiText(result); 
    }
    catch(e: any) { setAiErr(e.message); }
    finally { setAiLoading(false); }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl min-h-screen">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl font-black text-primary mb-3">College Comparison</h1>
        <p className="text-muted-foreground text-lg">Select up to 3 colleges for a detailed side-by-side AI analysis.</p>
      </div>

      <div className="space-y-8">
        {/* Search Section */}
        <div id="cmp-search" className="relative max-w-2xl mx-auto md:mx-0">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              ref={inputRef}
              className="w-full h-14 pl-12 pr-4 bg-white/40 backdrop-blur-md border-2 border-primary/10 rounded-2xl outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-lg"
              placeholder='Search colleges (e.g. "VIT", "Anna", "IIT")...'
              value={query}
              disabled={selected.length >= 3}
              onChange={e => { setQuery(e.target.value); setShowDrop(true); }}
            />
          </div>

          <AnimatePresence>
            {showDrop && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white/80 backdrop-blur-xl border border-primary/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
              >
                {query.length < 2 ? (
                  <div className="p-2">
                    <div className="p-3 text-[10px] font-black text-primary/60 uppercase tracking-widest flex items-center gap-2">
                        <Star className="h-3 w-3" /> Popular Choices
                    </div>
                    {POPULAR_COLLEGES.map(c => (
                        <button
                          key={c.id}
                          className="w-full p-4 text-left hover:bg-primary/5 rounded-xl transition-colors flex justify-between items-center"
                          onMouseDown={() => addCollege(c)}
                        >
                          <div>
                            <div className="font-bold text-primary">{c.name}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                                {[c.city, c.state].filter(Boolean).join(", ")}
                            </div>
                          </div>
                          <div className="text-[10px] font-black text-secondary/60">TOP {c.nirf_rank}</div>
                        </button>
                    ))}
                  </div>
                ) : searching ? (
                  <div className="p-8 text-center text-muted-foreground flex items-center justify-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Searching database...
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No colleges found for "{query}"</div>
                ) : (
                  results.map(c => (
                    <button
                      key={c.id}
                      className="w-full p-4 text-left hover:bg-primary/5 border-b border-primary/5 last:border-0 transition-colors"
                      onMouseDown={() => addCollege(c)}
                    >
                      <div className="font-bold text-primary">{c.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {[c.city, c.state].filter(Boolean).join(", ")}
                      </div>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected Tags */}
        <div className="flex flex-wrap gap-3 min-h-[40px]">
          {selected.map(c => (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={c.id}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-primary font-bold text-sm"
            >
              <GraduationCap className="h-4 w-4" />
              <span className="max-w-[150px] truncate">{c.name}</span>
              <button onClick={() => removeCollege(c.id)} className="hover:text-destructive transition-colors">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
          {selected.length === 3 && (
            <span className="text-xs text-muted-foreground self-center italic">Maximum 3 colleges reached</span>
          )}
        </div>

        {/* Compare Button */}
        <AnimatePresence>
          {selected.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <Button 
                onClick={handleCompare} 
                disabled={aiLoading}
                size="lg"
                className="h-14 px-8 rounded-2xl gap-3 text-lg font-bold shadow-xl shadow-primary/20"
              >
                {aiLoading ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing with AI...</>
                ) : (
                  <><Sparkles className="h-5 w-5" /> Start AI Comparison</>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* College Cards Grid */}
        {selected.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selected.map((c, idx) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="rounded-3xl border-primary/10 shadow-lg bg-white/40 backdrop-blur-md overflow-hidden hover:shadow-xl transition-all h-full">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="inline-flex px-2 py-1 bg-primary/5 rounded-lg text-[10px] font-black text-primary tracking-widest uppercase">
                        Engineering
                      </div>
                      <button onClick={() => removeCollege(c.id)} className="text-muted-foreground hover:text-destructive p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-2 line-clamp-2">{c.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
                      <Globe className="h-3 w-3" />
                      {[c.city, c.state].filter(Boolean).join(", ")}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "NIRF Rank", value: c.nirf_rank ? `#${c.nirf_rank}` : "N/A", color: "text-purple-500" },
                        { label: "Cutoff %", value: c.cutoff_general ? `${c.cutoff_general}%` : "N/A", color: "text-orange-500" },
                        { label: "Avg Package", value: c.avg_package_lpa ? `${c.avg_package_lpa}L` : "N/A", color: "text-green-500" },
                        { label: "NAAC", value: c.naac_grade || "N/A", color: "text-blue-500" },
                        { label: "Est. Fees", value: c.fees_approx || "N/A", color: "text-slate-600", full: true }
                      ].map((stat, i) => (
                        <div key={i} className={cn("p-3 bg-white/50 rounded-2xl border border-primary/5", stat.full && "col-span-2")}>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                          <p className={cn("text-lg font-black", stat.color)}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="rounded-[3rem] border-dashed border-2 border-primary/20 bg-primary/5 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-black text-primary mb-4">Select Colleges to Compare</h2>
              <p className="text-muted-foreground">Search and add at least two colleges to see a side-by-side comparison and get AI-powered insights.</p>
            </div>
          </Card>
        )}

        {/* AI Analysis Result */}
        {(aiLoading || aiText || aiErr) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-8"
          >
            <Card className="rounded-[2.5rem] border-2 border-primary/20 bg-white/80 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="bg-primary/5 p-6 md:p-8 flex items-center gap-4 border-b border-primary/10">
                <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">AI Counselor Comparison</h3>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Llama-3.3 Powered Insights</p>
                </div>
              </div>
              <CardContent className="p-6 md:p-10">
                {aiLoading && (
                  <div className="py-12 space-y-4 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground animate-pulse font-medium">Deeply analyzing placements, campus life, and cutoffs...</p>
                  </div>
                )}
                {aiErr && (
                  <div className="p-6 bg-destructive/5 border border-destructive/20 rounded-3xl text-destructive flex items-center gap-3">
                    <Info className="h-5 w-5" />
                    <p className="font-medium">{aiErr}</p>
                  </div>
                )}
                {aiText && (
                  <div className="prose prose-primary max-w-none prose-p:text-slate-600 prose-headings:text-primary prose-headings:font-black prose-p:leading-relaxed whitespace-pre-wrap">
                    {aiText}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
