"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, MapPin, Loader2, GraduationCap, Calendar, Star, ChevronDown, Filter, X, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type College = {
  id: string;
  name: string;
  state: string;
  city: string;
};

type TrendPoint = {
  year: number;
  [key: string]: number; // Will hold 'General', 'OBC', 'SC', 'ST' or College Names
};

const STATES = [
  "All States", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Chandigarh", "Puducherry", "Jammu & Kashmir"
];

const TYPES = ["All Types", "Government", "Private", "Deemed", "Autonomous", "Central"];
const YEAR_RANGES = ["2020-2024", "2021-2024", "2022-2024"];

const CATEGORIES = [
  { id: 'General', color: '#7c5cfc' },
  { id: 'OBC', color: '#f97316' },
  { id: 'SC', color: '#22c55e' },
  { id: 'ST', color: '#ef4444' }
];

export default function TrendsPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    state: "All States",
    type: "All Types",
    yearRange: "2020-2024"
  });
  const [results, setResults] = useState<College[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedColleges, setSelectedColleges] = useState<College[]>([]);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [activeCategories, setActiveCategories] = useState(['General']);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2 || (query.length === 0 && showDrop)) {
        performSearch();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, filters.state, filters.type]);

  useEffect(() => {
    if (selectedColleges.length > 0) {
      fetchTrends();
    } else {
      setTrendData([]);
    }
  }, [selectedColleges, compareMode, filters.yearRange]);

  const performSearch = async () => {
    setSearching(true);
    try {
      let q = supabase.from("colleges").select("id, name, state, location");
      if (filters.state !== "All States") q = q.eq("state", filters.state);
      if (filters.type !== "All Types") q = q.eq("type", filters.type);
      if (query) q = q.ilike("name", `%${query}%`);
      const { data } = await q.limit(10);
      if (data) {
        setResults(data.map(c => ({
          id: c.id.toString(),
          name: c.name,
          state: c.state,
          city: c.location
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const fetchTrends = async () => {
    setLoadingTrends(true);
    try {
      const startYear = parseInt(filters.yearRange.split("-")[0]);
      const collegeIds = selectedColleges.map(c => c.id);
      
      const { data, error } = await supabase
        .from('cutoff_trends')
        .select('*')
        .in('college_id', collegeIds)
        .gte('year', startYear)
        .order('year', { ascending: true });

      if (data) {
        // Group data by year
        const years = Array.from(new Set(data.map(d => d.year)));
        const formatted: TrendPoint[] = years.map(year => {
          const point: TrendPoint = { year };
          if (compareMode) {
            // In compare mode, show General category for each college
            selectedColleges.forEach(col => {
              const match = data.find(d => d.college_id.toString() === col.id && d.year === year);
              point[col.name] = match ? match.cutoff_general : 0;
            });
          } else {
            // In single mode, show all categories for the first selected college
            const match = data.find(d => d.college_id.toString() === selectedColleges[0].id && d.year === year);
            if (match) {
              point['General'] = match.cutoff_general;
              point['OBC'] = match.cutoff_obc;
              point['SC'] = match.cutoff_sc;
              point['ST'] = match.cutoff_st;
            }
          }
          return point;
        });
        setTrendData(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTrends(false);
    }
  };

  const addCollege = (c: College) => {
    if (selectedColleges.find(s => s.id === c.id)) return;
    if (compareMode) {
        if (selectedColleges.length >= 3) return;
        setSelectedColleges([...selectedColleges, c]);
    } else {
        setSelectedColleges([c]);
    }
    setQuery("");
    setShowDrop(false);
  };

  const toggleCategory = (cat: string) => {
    if (activeCategories.includes(cat)) {
        setActiveCategories(activeCategories.filter(c => c !== cat));
    } else {
        setActiveCategories([...activeCategories, cat]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black text-white font-syne flex items-center gap-4">
                <TrendingUp size={48} className="text-purple-500" />
                Cutoff Trends
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Visualize year-over-year admission changes.</p>
          </div>
          
          {/* Compare Toggle */}
          <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex">
             <button 
                onClick={() => { setCompareMode(false); setSelectedColleges(selectedColleges.slice(0, 1)); }}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!compareMode ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-500 hover:text-slate-300'}`}
             >
                Single College
             </button>
             <button 
                onClick={() => setCompareMode(true)}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${compareMode ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-500 hover:text-slate-300'}`}
             >
                Compare via AI
             </button>
          </div>
        </header>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#111520]/50 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select State</label>
                <div className="relative">
                    <select 
                        value={filters.state}
                        onChange={(e) => setFilters({...filters, state: e.target.value})}
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white outline-none focus:border-purple-500 appearance-none font-bold cursor-pointer"
                    >
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">College Type</label>
                <div className="relative">
                    <select 
                        value={filters.type}
                        onChange={(e) => setFilters({...filters, type: e.target.value})}
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white outline-none focus:border-purple-500 appearance-none font-bold cursor-pointer"
                    >
                        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Year Range</label>
                <div className="relative">
                    <select 
                        value={filters.yearRange}
                        onChange={(e) => setFilters({...filters, yearRange: e.target.value})}
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white outline-none focus:border-purple-500 appearance-none font-bold cursor-pointer"
                    >
                        {YEAR_RANGES.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
             </div>
        </div>

        {/* Search & Selection */}
        <div className="space-y-6">
            <div className="relative max-w-2xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Search college to add to trend..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowDrop(true)}
                    className="w-full h-16 bg-white/5 border-2 border-white/10 rounded-3xl pl-16 pr-6 text-lg font-bold text-white outline-none focus:border-purple-500/50 transition-all"
                />
                
                <AnimatePresence>
                    {showDrop && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 right-0 mt-4 bg-[#111520] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto"
                        >
                            {searching ? (
                                <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-500" /></div>
                            ) : results.map(c => (
                                <button 
                                    key={c.id} 
                                    onClick={() => addCollege(c)}
                                    className="w-full p-4 text-left hover:bg-white/5 flex justify-between items-center group border-b border-white/5 last:border-0"
                                >
                                    <div>
                                        <p className="font-bold text-white group-hover:text-purple-400 transition-colors">{c.name}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-black">{c.city}, {c.state}</p>
                                    </div>
                                    <Plus size={18} className="text-slate-600 group-hover:text-purple-500" />
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex flex-wrap gap-4">
                {selectedColleges.map((c, i) => (
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        key={c.id} 
                        className="flex items-center gap-3 px-5 py-2.5 bg-purple-600/10 border border-purple-500/30 rounded-2xl"
                    >
                        <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-sm font-black text-white">{c.name}</span>
                        <button onClick={() => setSelectedColleges(selectedColleges.filter(s => s.id !== c.id))}>
                            <X size={16} className="text-slate-500 hover:text-red-400" />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Chart Card */}
        {selectedColleges.length > 0 && (
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111520] border border-white/10 rounded-[3rem] p-10 shadow-2xl overflow-hidden relative"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                    <div>
                        <h2 className="text-3xl font-black text-white font-syne">
                            {compareMode ? "Cross-College Comparison" : `${selectedColleges[0].name} Trends`}
                        </h2>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">
                            {compareMode ? "General Category Comparison" : "Cutoff trajectory across all categories"}
                        </p>
                    </div>

                    {!compareMode && (
                        <div className="flex gap-3">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        activeCategories.includes(cat.id) ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-500 border border-white/5'
                                    }`}
                                >
                                    {cat.id}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="h-[500px] w-full">
                    {loadingTrends ? (
                         <div className="h-full flex items-center justify-center">
                            <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
                         </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111520', border: '1px solid #1f2937', borderRadius: '16px', color: '#fff' }}
                                    itemStyle={{ fontWeight: '800', fontSize: '12px' }}
                                />
                                <Legend />
                                {compareMode ? (
                                    selectedColleges.map((c, i) => (
                                        <Line 
                                            key={c.id} 
                                            type="monotone" 
                                            dataKey={c.name} 
                                            stroke={['#7c5cfc', '#f97316', '#22c55e'][i]} 
                                            strokeWidth={4} 
                                            dot={{ r: 6, fill: ['#7c5cfc', '#f97316', '#22c55e'][i] }}
                                            activeDot={{ r: 10, strokeWidth: 0 }}
                                        />
                                    ))
                                ) : (
                                    CATEGORIES.map(cat => (
                                        activeCategories.includes(cat.id) && (
                                            <Line 
                                                key={cat.id} 
                                                type="monotone" 
                                                dataKey={cat.id} 
                                                stroke={cat.color} 
                                                strokeWidth={4}
                                                dot={{ r: 6, fill: cat.color }}
                                                activeDot={{ r: 10, strokeWidth: 0 }}
                                            />
                                        )
                                    ))
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </motion.div>
        )}
      </div>
    </div>
  );
}
