"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, TrendingUp, MapPin, Loader2, 
  GraduationCap, Calendar, Star, ChevronDown, 
  Filter, X, Plus, Target, BarChart3,
  Zap, ArrowRight, Activity
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { cn } from "@/lib/utils";
import DashboardBackground from "@/components/3D/DashboardBackground";

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
  { id: 'General', color: '#6366f1' },
  { id: 'OBC', color: '#f59e0b' },
  { id: 'SC', color: '#10b981' },
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
        const years = Array.from(new Set(data.map(d => d.year)));
        const formatted: TrendPoint[] = years.map(year => {
          const point: TrendPoint = { year };
          if (compareMode) {
            selectedColleges.forEach(col => {
              const match = data.find(d => d.college_id.toString() === col.id && d.year === year);
              point[col.name] = match ? match.cutoff_general : 0;
            });
          } else {
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
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden selection:bg-indigo-500/30">
      <DashboardBackground />
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />
      </div>

      <div className="container mx-auto px-6 py-16 max-w-7xl relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 border-b border-purple-250/20 dark:border-purple-900/20 pb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <Activity size={14} className="text-indigo-400" />
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Market Intelligence</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-4">
                Cutoff Trends
            </h1>
            <p className="text-gray-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Visualize year-over-year admission data and competitive shifts</p>
          </div>
          
          <div className="bg-white/[0.05] p-1.5 rounded-2xl border border-white/10 flex backdrop-blur-md">
             <button 
                onClick={() => { setCompareMode(false); setSelectedColleges(selectedColleges.slice(0, 1)); }}
                className={cn(
                  "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  !compareMode ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-white/30 hover:text-white'
                )}
             >
                Single Entity
             </button>
             <button 
                onClick={() => setCompareMode(true)}
                className={cn(
                  "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  compareMode ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-white/30 hover:text-white'
                )}
             >
                Comparative AI
             </button>
          </div>
        </header>

        {/* Filters Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 backdrop-blur-2xl mb-12 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <BarChart3 size={200} className="text-indigo-500" />
             </div>
             <div className="space-y-3 relative z-10">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Geographic Filter</label>
                <div className="relative">
                    <select 
                        value={filters.state}
                        onChange={(e) => setFilters({...filters, state: e.target.value})}
                        className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white outline-none focus:border-indigo-500/50 appearance-none font-bold cursor-pointer transition-all"
                    >
                        {STATES.map(s => <option key={s} value={s} className="bg-[#05071a] text-white">{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={18} />
                </div>
             </div>
             <div className="space-y-3 relative z-10">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Institutional Type</label>
                <div className="relative">
                    <select 
                        value={filters.type}
                        onChange={(e) => setFilters({...filters, type: e.target.value})}
                        className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white outline-none focus:border-indigo-500/50 appearance-none font-bold cursor-pointer transition-all"
                    >
                        {TYPES.map(t => <option key={t} value={t} className="bg-[#05071a] text-white">{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={18} />
                </div>
             </div>
             <div className="space-y-3 relative z-10">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Temporal Range</label>
                <div className="relative">
                    <select 
                        value={filters.yearRange}
                        onChange={(e) => setFilters({...filters, yearRange: e.target.value})}
                        className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white outline-none focus:border-indigo-500/50 appearance-none font-bold cursor-pointer transition-all"
                    >
                        {YEAR_RANGES.map(y => <option key={y} value={y} className="bg-[#05071a] text-white">{y}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={18} />
                </div>
             </div>
        </div>

        {/* Search & Selection Engine */}
        <div className="space-y-8 mb-12">
            <div className="relative max-w-2xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                <input 
                    type="text" 
                    placeholder="Search institution to inject into graph…" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowDrop(true)}
                    className="w-full h-20 bg-white/[0.03] border-2 border-white/5 rounded-[2.5rem] pl-16 pr-8 text-lg font-bold text-white outline-none focus:border-indigo-500/30 transition-all placeholder:text-white/10"
                />
                
                <AnimatePresence>
                    {showDrop && (
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 15 }}
                            className="absolute top-full left-0 right-0 mt-6 bg-white dark:bg-[#0a0d1e] border border-purple-250/30 dark:border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden z-50 max-h-96 overflow-y-auto backdrop-blur-3xl"
                        >
                            {searching ? (
                                <div className="p-12 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-indigo-500 opacity-50" /></div>
                            ) : results.length === 0 ? (
                                <div className="p-12 text-center text-gray-400 dark:text-white/20 font-black text-[10px] uppercase tracking-widest">No matching entities found</div>
                            ) : results.map(c => (
                                <button 
                                    key={c.id} 
                                    onClick={() => addCollege(c)}
                                    className="w-full p-8 text-left hover:bg-white/[0.05] dark:hover:bg-white/[0.02] flex justify-between items-center group border-b border-purple-250/20 dark:border-white/5 last:border-0 transition-all"
                                >
                                    <div className="space-y-1">
                                        <p className="text-lg font-black text-gray-900 dark:text-white group-hover:text-indigo-400 transition-colors tracking-tight">{c.name}</p>
                                        <p className="text-[9px] text-white/20 uppercase font-black tracking-widest flex items-center gap-2">
                                          <MapPin size={10} className="text-indigo-500" /> {c.city}, {c.state}
                                        </p>
                                    </div>
                                    <div className="h-10 w-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/10 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                      <Plus size={20} />
                                    </div>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex flex-wrap gap-4">
                {selectedColleges.map((c, i) => (
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        key={c.id} 
                        className="flex items-center gap-4 px-6 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl group"
                    >
                        <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        <span className="text-[11px] font-black text-white uppercase tracking-wider">{c.name}</span>
                        <button 
                          onClick={() => setSelectedColleges(selectedColleges.filter(s => s.id !== c.id))}
                          className="text-white/20 hover:text-red-400 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Data Visualization Engine */}
        {selectedColleges.length > 0 && (
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 md:p-16 shadow-2xl overflow-hidden relative"
            >
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 mb-16">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-white tracking-tighter">
                            {compareMode ? "Cross-Entity Comparison" : `${selectedColleges[0].name} Intelligence`}
                        </h2>
                        <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">
                            {compareMode ? "General Category performance benchmark across selected institutions" : "Longitudinal cutoff trajectory across all categories"}
                        </p>
                    </div>

                    {!compareMode && (
                        <div className="flex flex-wrap gap-3 p-1.5 bg-white/[0.05] rounded-[1.5rem] border border-white/5">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => toggleCategory(cat.id)}
                                    className={cn(
                                      "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                      activeCategories.includes(cat.id) 
                                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                                        : 'text-white/30 hover:text-white'
                                    )}
                                >
                                    {cat.id}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="h-[600px] w-full relative">
                    {loadingTrends ? (
                         <div className="h-full flex items-center justify-center">
                            <Loader2 className="h-16 w-16 text-indigo-500 animate-spin opacity-20" />
                         </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis 
                                  dataKey="year" 
                                  stroke="rgba(255,255,255,0.2)" 
                                  fontSize={10} 
                                  tickLine={false} 
                                  axisLine={false} 
                                  dy={20}
                                  className="font-black tracking-widest uppercase"
                                />
                                <YAxis 
                                  stroke="rgba(255,255,255,0.2)" 
                                  fontSize={10} 
                                  tickLine={false} 
                                  axisLine={false} 
                                  dx={-20}
                                  className="font-black tracking-widest"
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: '#0a0d1e', 
                                      border: '1px solid rgba(255,255,255,0.1)', 
                                      borderRadius: '24px', 
                                      padding: '24px',
                                      boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                    cursor={{ stroke: 'rgba(99,102,241,0.2)', strokeWidth: 2 }}
                                />
                                <Legend 
                                  verticalAlign="top" 
                                  align="right" 
                                  iconType="circle"
                                  wrapperStyle={{ paddingBottom: '40px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}
                                />
                                {compareMode ? (
                                    selectedColleges.map((c, i) => (
                                        <Line 
                                            key={c.id} 
                                            type="monotone" 
                                            dataKey={c.name} 
                                            stroke={['#6366f1', '#f59e0b', '#10b981'][i]} 
                                            strokeWidth={5} 
                                            dot={{ r: 8, fill: ['#6366f1', '#f59e0b', '#10b981'][i], strokeWidth: 0 }}
                                            activeDot={{ r: 12, strokeWidth: 0 }}
                                            animationDuration={1500}
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
                                                strokeWidth={5}
                                                dot={{ r: 8, fill: cat.color, strokeWidth: 0 }}
                                                activeDot={{ r: 12, strokeWidth: 0 }}
                                                animationDuration={1500}
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
