"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  Search, GraduationCap, Building, Banknote, 
  Calendar, ExternalLink, Info, Loader2, ChevronDown, ChevronUp,
  MapPin, Users, BookOpen, Wallet, Activity, Zap,
  ShieldCheck, Sparkles, ArrowRight, Award
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh", "Puducherry", "Jammu & Kashmir"
];

const COMMUNITIES = ["BC", "MBC", "OC", "SC", "ST", "EWS", "Minority"];
const COURSE_LEVELS = ["UG", "PG"];
const STREAMS = [
  "Engineering & Technology", "Medical & Health Sciences", "Science & Research",
  "Commerce & Finance", "Arts & Humanities", "Law & Legal Studies",
  "Management & Business", "Agriculture & Veterinary", "Education & Teaching"
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
      toast.error("Academic percentage baseline required.");
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

      if (!response.ok) throw new Error("Intelligence fetch failed.");
      const data = await response.json();
      setResults(data);

      if (user) {
        await addDoc(collection(db, "scholarships", user.uid, "searches"), {
          studentData: formData,
          results: data,
          timestamp: serverTimestamp()
        });
      }

      toast.success(`Discovered ${data.length} financial opportunities!`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-[#05071a] flex items-center justify-center">
      <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05071a] text-white relative overflow-hidden selection:bg-indigo-500/30 py-24">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <header className="text-center space-y-6 mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4"
          >
            <Banknote size={14} />
            Financial Intelligence
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">
            Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400">Education Funds</span>
          </h1>
          <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px] max-w-lg mx-auto">
            Our AI engine scans through 10,000+ government and private endowments to find your perfect matching grants.
          </p>
        </header>

        {/* Search Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-10 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.6)] backdrop-blur-3xl mb-16 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-700">
             <Banknote size={300} className="text-indigo-500" />
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {[
              { label: "Home State", key: "state", options: INDIAN_STATES, icon: MapPin },
              { label: "Community", key: "community", options: COMMUNITIES, icon: Users },
              { label: "Course Level", key: "level", options: COURSE_LEVELS, icon: GraduationCap },
              { label: "Specialization", key: "stream", options: STREAMS, icon: BookOpen },
              { label: "Annual Income", key: "income", options: INCOME_RANGES, icon: Wallet }
            ].map((f) => (
              <div key={f.key} className="space-y-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <f.icon size={12} className="text-indigo-500" /> {f.label}
                </label>
                <div className="relative">
                  <select
                    value={formData[f.key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                    className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white font-bold outline-none focus:border-indigo-500/50 appearance-none transition-all cursor-pointer"
                  >
                    {f.options.map(o => <option key={o} value={o} className="bg-[#05071a]">{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={16} />
                </div>
              </div>
            ))}

            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <Activity size={12} className="text-indigo-500" /> Academic Percentage (%)
              </label>
              <input
                type="number"
                placeholder="e.g. 85"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white font-bold outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/10"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-20 text-xl font-black group"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} className="group-hover:rotate-12 transition-transform" />}
                {loading ? "Executing Grant Search..." : "Execute AI Search"}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Results Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence>
            {results.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 space-y-8 hover:border-indigo-500/30 transition-all group backdrop-blur-md relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <Award size={150} className="text-indigo-500" />
                </div>
                
                <div className="flex justify-between items-start gap-6 relative z-10">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-indigo-400 group-hover:text-white transition-colors leading-tight tracking-tight">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
                      <Building size={14} className="text-indigo-500" />
                      {item.provider}
                    </div>
                  </div>
                  <div className="text-3xl font-black text-teal-400 tabular-nums shadow-teal-500/20 drop-shadow-xl">
                    {item.amount}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 relative z-10">
                  <span className="px-3 py-1 bg-white/[0.05] border border-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest rounded-lg">
                    {item.category}
                  </span>
                  <span className="px-3 py-1 bg-white/[0.05] border border-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest rounded-lg">
                    {item.level}
                  </span>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative z-10">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-3">Eligibility Intelligence</p>
                  <p className="text-white/60 font-medium italic text-base leading-relaxed">
                    &quot;{item.eligibility}&quot;
                  </p>
                </div>

                <div className="flex items-center gap-6 pt-4 border-t border-white/5 relative z-10">
                  <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest">
                    <Calendar size={14} className="text-indigo-500" />
                    Deadline: <span className="text-white">{item.deadline}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 relative z-10">
                  <button
                    onClick={() => setExpandedId(expandedId === index ? null : index)}
                    className="flex items-center justify-between w-full h-16 px-8 bg-white/[0.05] rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/[0.1] hover:text-white transition-all border border-white/5"
                  >
                    <span className="flex items-center gap-3"><Info size={18} className="text-indigo-500" /> Application Protocol</span>
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
                        <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] text-sm text-white/40 leading-relaxed font-medium">
                          {item.how_to_apply}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <a
                    href={item.apply_url || "https://scholarships.gov.in"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-16 btn-primary rounded-2xl flex items-center justify-center gap-3 group text-sm font-black"
                  >
                    Execute Application <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {results.length === 0 && !loading && (
          <div className="text-center py-32 space-y-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />
              <div className="h-32 w-32 bg-white/[0.03] rounded-[3rem] flex items-center justify-center mx-auto border border-white/5 text-white/10 relative z-10 shadow-2xl">
                <Banknote size={56} className="animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-white font-black text-xl tracking-tight">Intelligence Matrix Ready</p>
              <p className="text-white/20 font-bold uppercase tracking-[0.2em] text-[9px]">Input your parameters to discover matching grants</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
