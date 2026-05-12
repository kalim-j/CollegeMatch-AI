"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  Search, GraduationCap, Building, Banknote, 
  Calendar, ExternalLink, Info, Loader2, ChevronDown, ChevronUp,
  MapPin, Users, BookOpen, Wallet
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const COMMUNITIES = ["BC", "MBC", "OC", "SC", "ST", "EWS", "Minority"];
const COURSE_LEVELS = ["UG", "PG"];
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
const INCOME_RANGES = ["Below 1L", "1L - 2.5L", "2.5L - 5L", "Above 5L"];

export default function ScholarshipFinder() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    state: "Tamil Nadu",
    community: "BC",
    level: "UG",
    stream: "Engineering & Technology",
    income: "1L - 2.5L",
    percentage: ""
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.percentage) {
      toast.error("Please enter your 12th percentage");
      return;
    }

    setLoading(true);
    setResults([]);
    try {
      const response = await fetch("/api/find-scholarships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Failed to fetch scholarships");
      const data = await response.json();
      setResults(data);

      // Save to Firestore
      if (user) {
        await addDoc(collection(db, "scholarships", user.uid, "searches"), {
          studentData: formData,
          results: data,
          timestamp: serverTimestamp()
        });
      }

      toast.success(`Found ${data.length} potential scholarships!`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold uppercase tracking-widest"
          >
            <Banknote size={16} />
            AI Scholarship Finder
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white font-syne tracking-tighter">
            Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Education Funds</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto font-medium">
            Let our AI search through thousands of government and private scholarships to find the ones you are eligible for.
          </p>
        </div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#111520] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
        >
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} /> Home State
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white focus:border-purple-500 outline-none transition-all appearance-none"
              >
                {INDIAN_STATES.map(s => <option key={s} value={s} className="bg-[#111520]">{s}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Users size={14} /> Community
              </label>
              <select
                value={formData.community}
                onChange={(e) => setFormData({ ...formData, community: e.target.value })}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white focus:border-purple-500 outline-none transition-all appearance-none"
              >
                {COMMUNITIES.map(c => <option key={c} value={c} className="bg-[#111520]">{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <GraduationCap size={14} /> Course Level
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white focus:border-purple-500 outline-none transition-all appearance-none"
              >
                {COURSE_LEVELS.map(l => <option key={l} value={l} className="bg-[#111520]">{l}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={14} /> Stream
              </label>
              <select
                value={formData.stream}
                onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white focus:border-purple-500 outline-none transition-all appearance-none"
              >
                {STREAMS.map(s => <option key={s} value={s} className="bg-[#111520]">{s}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Wallet size={14} /> Annual Income
              </label>
              <select
                value={formData.income}
                onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white focus:border-purple-500 outline-none transition-all appearance-none"
              >
                {INCOME_RANGES.map(i => <option key={i} value={i} className="bg-[#111520]">{i}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} /> 12th Percentage (%)
              </label>
              <input
                type="number"
                placeholder="e.g. 85"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white focus:border-purple-500 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-purple-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Search size={24} />}
                {loading ? "Searching Scholarships..." : "Find Matching Scholarships"}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence>
            {results.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#111520] border border-white/5 rounded-[2rem] p-8 space-y-6 hover:border-purple-500/30 transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-indigo-400 group-hover:text-indigo-300 transition-colors leading-tight">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <Building size={14} />
                      {item.provider}
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-400 tabular-nums">
                    {item.amount}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {item.category}
                  </span>
                  <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {item.level}
                  </span>
                </div>

                <p className="text-sm text-slate-400 font-medium italic">
                  &quot;{item.eligibility}&quot;
                </p>

                <div className="flex items-center gap-6 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                    <Calendar size={16} className="text-purple-500" />
                    <span>{item.deadline}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setExpandedId(expandedId === index ? null : index)}
                    className="flex items-center justify-between w-full p-4 bg-white/5 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/10 transition-all"
                  >
                    <span className="flex items-center gap-2"><Info size={16} /> How to Apply</span>
                    {expandedId === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  <AnimatePresence>
                    {expandedId === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl text-sm text-slate-400 leading-relaxed font-medium">
                          {item.how_to_apply}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {item.apply_url ? (
                    <a
                      href={item.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                    >
                      Apply Now <ExternalLink size={18} />
                    </a>
                  ) : (
                    <a
                      href="https://scholarships.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-14 bg-white/5 border border-white/10 hover:border-purple-500/50 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      Search on NSP Portal <ExternalLink size={18} />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {results.length === 0 && !loading && (
          <div className="text-center py-20 space-y-6">
            <div className="h-24 w-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 text-slate-700">
              <Banknote size={48} />
            </div>
            <p className="text-slate-500 font-bold">Search results will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
