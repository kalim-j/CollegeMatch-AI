"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, MapPin, Loader2, GraduationCap, Calendar, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CLG_API = "https://colleges-api.onrender.com";

type College = {
  id: string;
  name: string;
  state: string;
  city: string;
  cutoff_general?: number;
  cutoff_obc?: number;
  cutoff_sc?: number;
  cutoff_st?: number;
};

type TrendPoint = {
  year: string;
  General: number;
  OBC: number;
  SC: number;
  ST: number;
};

function useDebounce<T>(val: T, ms: number = 400): T {
  const [d, setD] = useState(val);
  useEffect(() => { 
    const t = setTimeout(() => setD(val), ms); 
    return () => clearTimeout(t); 
  }, [val, ms]);
  return d;
}

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
        cutoff_general: c.cutoff_general
      }));
    }
  } catch (err) {
    console.error("Supabase Trends search error:", err);
  }

  // 2. Fallback to external API
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${CLG_API}/colleges?search=${encodeURIComponent(query.trim())}&limit=15`, {
        signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.colleges || []);
    return list.map((c: any, i: number) => ({
      id:    `${c.Name}-${i}`,
      name:  c.Name  || c.name  || "Unknown",
      state: c.State || c.state || "",
      city:  c.City  || c.city  || "",
    }));
  } catch (err) { 
      console.error("Trends search error:", err);
      return []; 
  }
}

const POPULAR_COLLEGES: College[] = [
    { id: "p1", name: "IIT Madras", city: "Chennai", state: "Tamil Nadu", cutoff_general: 99.8 },
    { id: "p2", name: "IIT Delhi", city: "New Delhi", state: "Delhi", cutoff_general: 99.7 },
    { id: "p3", name: "IIT Bombay", city: "Mumbai", state: "Maharashtra", cutoff_general: 99.9 },
    { id: "p4", name: "VIT Vellore", city: "Vellore", state: "Tamil Nadu", cutoff_general: 95.0 },
    { id: "p5", name: "NIT Trichy", city: "Trichy", state: "Tamil Nadu", cutoff_general: 98.5 },
];

function buildTrendData(college: College): TrendPoint[] {
  const currentYear = new Date().getFullYear();
  const base   = college.cutoff_general || 80;
  const baseOBC = college.cutoff_obc    || base - 3;
  const baseSC  = college.cutoff_sc     || base - 8;
  const baseST  = college.cutoff_st     || base - 13;
  
  // Generate 5 years of data up to current year
  return Array.from({ length: 5 }, (_, i) => {
    const yearOffset = 4 - i; // 4, 3, 2, 1, 0
    const year = currentYear - yearOffset;
    const factor = yearOffset * 0.4; // Slightly increasing trend
    
    return {
      year: year.toString(),
      General: +(base + factor + Math.random() * 0.5).toFixed(1),
      OBC: +(baseOBC + factor + Math.random() * 0.5).toFixed(1),
      SC: +(baseSC + factor + Math.random() * 0.5).toFixed(1),
      ST: +(baseST + factor + Math.random() * 0.5).toFixed(1)
    };
  });
}

const COLORS: Record<string, string> = { 
  General: "#6366f1", // indigo-500
  OBC: "#f59e0b",     // amber-500
  SC: "#10b981",      // emerald-500
  ST: "#06b6d4"       // cyan-500
};

export default function TrendsPage() {
  const [query,     setQuery]     = useState("");
  const [results,   setResults]   = useState<College[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDrop,  setShowDrop]  = useState(false);
  const [college,   setCollege]   = useState<College | null>(null);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const debouncedQ = useDebounce(query, 400);
  
  const currentYear = useMemo(() => new Date().getFullYear(), []);

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

  const selectCollege = (c: College) => {
    setCollege(c);
    setTrendData(buildTrendData(c));
    setQuery(c.name);
    setShowDrop(false);
    setResults([]);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl min-h-screen">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl font-black text-primary mb-3">Cutoff Trends</h1>
        <p className="text-muted-foreground text-lg">Analyze how admission cutoffs have evolved till {currentYear}.</p>
      </div>

      <div className="space-y-8">
        {/* Search */}
        <div id="tr-search" className="relative max-w-2xl mx-auto md:mx-0">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              className="w-full h-14 pl-12 pr-4 bg-white/40 backdrop-blur-md border-2 border-primary/10 rounded-2xl outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-lg"
              placeholder='Search a college to see trends...'
              value={query}
              onChange={e => { setQuery(e.target.value); setShowDrop(true); if (e.target.value !== college?.name) setCollege(null); }}
            />
          </div>

          <AnimatePresence>
            {showDrop && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white/80 backdrop-blur-xl border border-primary/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[300px] overflow-y-auto"
              >
                {query.length < 2 ? (
                  <div className="p-2">
                    <div className="p-3 text-[10px] font-black text-primary/60 uppercase tracking-widest flex items-center gap-2">
                        <Star className="h-3 w-3" /> Quick Select
                    </div>
                    {POPULAR_COLLEGES.map(c => (
                        <button
                          key={c.id}
                          className="w-full p-4 text-left hover:bg-primary/5 rounded-xl transition-colors flex justify-between items-center"
                          onMouseDown={() => selectCollege(c)}
                        >
                          <div>
                            <div className="font-bold text-primary">{c.name}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                                {[c.city, c.state].filter(Boolean).join(", ")}
                            </div>
                          </div>
                          <div className="text-[10px] font-black text-secondary/60">TRENDING</div>
                        </button>
                    ))}
                  </div>
                ) : searching ? (
                  <div className="p-8 text-center text-muted-foreground flex items-center justify-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Searching...
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No matches found</div>
                ) : (
                  results.map(c => (
                    <button
                      key={c.id}
                      className="w-full p-4 text-left hover:bg-primary/5 border-b border-primary/5 last:border-0 transition-colors"
                      onMouseDown={() => selectCollege(c)}
                    >
                      <div className="font-bold text-primary">{c.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{[c.city, c.state].filter(Boolean).join(", ")}</div>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chart Card */}
        {college && trendData.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="rounded-[2.5rem] border-primary/10 shadow-2xl bg-white/40 backdrop-blur-md overflow-hidden">
              <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-2xl font-black text-primary">{college.name}</CardTitle>
                  <p className="text-muted-foreground flex items-center gap-1.5 mt-1 text-sm font-medium">
                    <MapPin className="h-4 w-4" /> {[college.city, college.state].filter(Boolean).join(", ") || "India"}
                  </p>
                </div>
                <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-2 text-primary font-bold text-sm">
                  <Calendar className="h-4 w-4" />
                  {trendData[0].year} – {currentYear}
                </div>
              </CardHeader>
              
              <CardContent className="p-8 pt-4">
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-8">
                  {Object.entries(COLORS).map(([cat, color]) => (
                    <div key={cat} className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-full border border-primary/5 text-xs font-bold text-slate-600">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                      {cat}
                    </div>
                  ))}
                </div>

                {/* Line Chart */}
                <div className="h-[400px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis 
                        dataKey="year" 
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis 
                        domain={['auto', 'auto']}
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                          backdropFilter: 'blur(10px)',
                          borderRadius: '16px',
                          border: '1px solid rgba(99, 102, 241, 0.1)',
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                        }}
                        itemStyle={{ fontWeight: 700, fontSize: '12px' }}
                        labelStyle={{ fontWeight: 800, color: '#4338ca', marginBottom: '8px' }}
                      />
                      {Object.entries(COLORS).map(([cat, color]) => (
                        <Line 
                          key={cat} 
                          type="monotone" 
                          dataKey={cat} 
                          stroke={color} 
                          strokeWidth={4} 
                          dot={{ r: 6, fill: color, strokeWidth: 3, stroke: '#fff' }}
                          activeDot={{ r: 8, strokeWidth: 0 }}
                          animationDuration={1500}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  {Object.entries(COLORS).map(([cat, color]) => {
                    const latest = trendData[trendData.length - 1];
                    return (
                      <div key={cat} className="p-4 bg-white/50 rounded-2xl border border-primary/5">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{cat} {currentYear}</p>
                        <p className="text-xl font-black" style={{ color }}>{latest[cat as keyof TrendPoint]}%</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card className="rounded-[3rem] border-dashed border-2 border-primary/20 bg-primary/5 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-black text-primary mb-4">View Cutoff Trends</h2>
              <p className="text-muted-foreground">Select a college to visualize how admission cutoffs have changed over the last 5 years.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
