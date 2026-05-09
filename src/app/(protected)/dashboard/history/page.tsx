"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { History, Search, Trash2, Calendar, MapPin, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data) setHistory(data);
    }
    setLoading(false);
  };

  const clearHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      toast.error("Failed to clear history");
    } else {
      setHistory([]);
      toast.success("History cleared!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] p-4 md:p-8 selection:bg-purple-500/30">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black text-white font-syne flex items-center gap-4">
                <History size={48} className="text-emerald-500" />
                Search History
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Review your previous college explorations.</p>
          </div>
          {history.length > 0 && (
            <button 
                onClick={clearHistory}
                className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            >
                <Trash2 size={16} />
                Clear All
            </button>
          )}
        </header>

        <div className="space-y-4">
            <AnimatePresence mode="popLayout">
                {history.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-[#111520] border border-white/5 rounded-[3rem] p-20 text-center space-y-6"
                    >
                        <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center text-slate-700 mx-auto">
                            <Search size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white font-syne">No History Found</h3>
                            <p className="text-slate-500 font-bold max-w-xs mx-auto">Start searching for colleges to see your history here.</p>
                        </div>
                    </motion.div>
                ) : (
                    history.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-[#111520] border border-white/5 rounded-3xl p-6 hover:border-purple-500/30 transition-all group flex items-center gap-6"
                        >
                            <div className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-purple-500/10 group-hover:text-purple-400 transition-all">
                                <Sparkles size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xl font-black text-white truncate font-syne">"{item.query || 'Global Search'}"</h4>
                                <div className="flex flex-wrap items-center gap-4 mt-1">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                        <Calendar size={14} />
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase tracking-widest">
                                        Explored via CollegeMatch-AI
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex flex-wrap gap-2">
                                    {item.filters?.state && (
                                        <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-slate-400 border border-white/5 uppercase">{item.filters.state}</span>
                                    )}
                                    {item.filters?.type && (
                                        <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-slate-400 border border-white/5 uppercase">{item.filters.type}</span>
                                    )}
                                </div>
                                <button className="h-12 w-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-white transition-all">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
