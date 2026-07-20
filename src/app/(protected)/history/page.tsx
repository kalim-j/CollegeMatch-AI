'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  orderBy,
  query
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { 
  History as HistoryIcon, MapPin, Sparkles, 
  ChevronRight, Calendar, BookOpen, 
  Search, X, FileDown, Target, Zap, Loader2,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import StreamResultCard from '@/components/StreamResultCard';
import { useAuthGuard } from '@/lib/auth-guard';

interface CollegeResult {
  name: string;
  location: string;
  state?: string;
  type: string;
  level: string;
  courses: string[];
  cutoff_mark: number;
  match_score: number;
  why_fit: string;
  naac_grade: string;
  nirf_rank: number;
}

interface Session {
  id: string;
  createdAt: string;
  topCollege: string;
  totalResults: number;
  studentProfile: {
    level: string;
    stream: string;
    state: string;
    district: string;
    cutoffMark: number;
    cutoffRange: string;
    budget: string;
    quota: string;
  };
  results: CollegeResult[];
}

export default function HistoryPage() {
  const { user, state, profile } = useAuthGuard();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'colleges' | 'streams'>('colleges');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [discoveries, setDiscoveries] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);



  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      setFetching(true);
      try {
        // Fetch college searches
        const qColleges = query(
          collection(db, 'interviews', user.uid, 'sessions'),
          orderBy('timestamp', 'desc')
        );
        const snapColleges = await getDocs(qColleges);
        const dataColleges: Session[] = snapColleges.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Session, 'id'>),
        }));
        setSessions(dataColleges);

        // Fetch stream discoveries
        const qDiscoveries = query(
          collection(db, `discoveries/${user.uid}/sessions`),
          orderBy('timestamp', 'desc')
        );
        const snapDiscoveries = await getDocs(qDiscoveries);
        const dataDiscoveries = snapDiscoveries.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDiscoveries(dataDiscoveries);
      } catch (err) {
        console.error('History fetch error:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchHistory();
  }, [user]);

  const handleCollegeClick = (college: CollegeResult) => {
    const resultsToStore = sessions.find(s => s.results.some(r => r.name === college.name))?.results;
    if (resultsToStore) {
        sessionStorage.setItem('eduanalytics_results', JSON.stringify(resultsToStore));
    }
    const slug = college.name.toLowerCase().replace(/ /g, "-");
    router.push(`/colleges/${slug}`);
  };

  const handleSelectStream = (stream: any) => {
    sessionStorage.setItem('selectedStream', stream.stream);
    router.push(`/interview?stream=${encodeURIComponent(stream.stream)}&fromDiscover=true`);
  };

  const handleExploreStream = (stream: any) => {
    const slug = stream.stream.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    router.push(`/stream/${slug}`);
  };

  if (state === 'loading' || fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Retrieving analysis history…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] text-gray-900 relative overflow-hidden selection:bg-purple-250/20 pt-24">
      <div className="container mx-auto px-6 py-16 max-w-5xl relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-8 border-b border-purple-100 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 shadow-sm">
              <HistoryIcon size={14} className="text-purple-600" />
              <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">User Intelligence</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-950 tracking-tight leading-tight">Analysis History</h1>
            <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">Revisit your previous AI recommendations</p>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 mb-10 border-b border-purple-100 pb-4 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('colleges'); setExpandedId(null); }}
            className={cn(
              "px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 text-sm",
              activeTab === 'colleges' 
                ? "bg-purple-600 text-white shadow-md shadow-purple-200" 
                : "bg-white/5 text-gray-500 border border-purple-100 hover:bg-white/10"
            )}
          >
            <SchoolIcon className="h-4.5 w-4.5" />
            College Searches
          </button>
          <button
            onClick={() => { setActiveTab('streams'); setExpandedId(null); }}
            className={cn(
              "px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 text-sm",
              activeTab === 'streams' 
                ? "bg-purple-600 text-white shadow-md shadow-purple-200" 
                : "bg-white/5 text-gray-500 border border-purple-100 hover:bg-white/10"
            )}
          >
            <Lightbulb className="h-4.5 w-4.5" />
            Stream Discoveries
          </button>
        </div>

        {activeTab === 'colleges' && (
          <div className="space-y-6 pb-24">
            {sessions.length === 0 ? (
              <div className="text-center py-12 glass-card border border-purple-100/50 rounded-3xl p-8 shadow-sm">
                <div className="h-20 w-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-100">
                  <HistoryIcon className="text-purple-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-950 mb-2">No College Searches</h3>
                <p className="text-gray-500 font-medium text-sm mb-6">You haven't performed any AI college analyses yet.</p>
                <button onClick={() => router.push('/interview')} className="h-12 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-xs tracking-widest uppercase transition-all shadow-sm">Start Analysis</button>
              </div>
            ) : (
              sessions.map((session, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  key={session.id}
                >
                  <div className={cn(
                    "rounded-[2.5rem] border transition-all overflow-hidden glass-card group shadow-sm",
                    expandedId === session.id ? "border-purple-300" : "border-purple-100 hover:border-purple-250"
                  )}>
                    <div className="p-8 md:p-10">
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
                        <div className="space-y-6 flex-1">
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-purple-50 rounded-lg text-[9px] font-black text-purple-700 uppercase tracking-widest border border-purple-100 shadow-sm">
                              {session.studentProfile?.level || "UG"}
                            </span>
                            <span className="px-3 py-1 bg-teal-50 rounded-lg text-[9px] font-black text-teal-700 uppercase tracking-widest border border-teal-100 shadow-sm">
                              {session.studentProfile?.stream || "Engineering"}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-950 leading-tight tracking-tight group-hover:text-purple-700 transition-colors">
                              {session.topCollege}
                            </h3>
                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                              <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                                <MapPin className="h-3.5 w-3.5 text-purple-650" />
                                {session.studentProfile?.district}, {session.studentProfile?.state}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                                <Calendar className="h-3.5 w-3.5 text-purple-650" />
                                {session.createdAt ? new Date(session.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                }) : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4">
                          <button
                            onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                            className={cn(
                              "h-14 px-8 rounded-xl font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2",
                              expandedId === session.id 
                                  ? "bg-gray-100 text-gray-700 hover:bg-gray-250 border border-purple-200" 
                                  : "bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                            )}
                          >
                            {expandedId === session.id ? <><X size={16} /> Close Results</> : <><Search size={16} /> Reveal Analysis</>}
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedId === session.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-10 space-y-6">
                              <div className="grid grid-cols-1 gap-4">
                                {session.results.map((college, idx) => (
                                  <div key={idx} onClick={() => handleCollegeClick(college)} className="group p-5 rounded-2xl bg-white/5 border border-purple-100/50 hover:border-purple-300 cursor-pointer flex justify-between items-center gap-4 shadow-sm transition-all">
                                    <div>
                                      <h4 className="text-base font-bold text-gray-900 group-hover:text-purple-700">{college.name}</h4>
                                      <p className="text-xs text-gray-400 font-bold">{college.location}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-emerald-600">{Math.round(college.match_score)}% Match</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === 'streams' && (
          <div className="space-y-6 pb-24">
            {discoveries.length === 0 ? (
              <div className="text-center py-12 glass-card border border-purple-100/50 rounded-3xl p-8 shadow-sm">
                <div className="h-20 w-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-100">
                  <Lightbulb className="text-purple-650" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-950 mb-2">No Stream Discoveries</h3>
                <p className="text-gray-500 font-medium text-sm mb-6">You haven't run the Stream Discovery AI yet.</p>
                <button onClick={() => router.push('/discover')} className="h-12 px-6 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-750 text-xs uppercase tracking-widest shadow-sm">Discover your stream</button>
              </div>
            ) : (
              discoveries.map((discovery, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.5 }}
                  key={discovery.id}
                >
                  <div className={cn(
                    "rounded-[2.5rem] border transition-all overflow-hidden glass-card group shadow-sm",
                    expandedId === discovery.id ? "border-purple-300" : "border-purple-100 hover:border-purple-250"
                  )}>
                    <div className="p-8 md:p-10">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                            <Calendar className="h-3.5 w-3.5 text-purple-600" />
                            {discovery.timestamp ? new Date(discovery.timestamp.toDate()).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            }) : 'N/A'}
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-purple-700 mb-2">
                            {discovery.results.streams[0].stream}
                          </h3>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-white/5 border border-purple-100/50 rounded-full text-xs font-bold text-purple-700 dark:text-purple-300 shadow-sm">
                              Score: {discovery.results.streams[0].match_score}%
                            </span>
                            {discovery.selectedStream && (
                              <span className="px-3 py-1 bg-indigo-50 border border-indigo-150 text-indigo-750 rounded-full text-xs font-bold shadow-sm">
                                Selected: {discovery.selectedStream}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedId(expandedId === discovery.id ? null : discovery.id)}
                          className={cn(
                            "px-8 py-4 rounded-xl font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2",
                            expandedId === discovery.id 
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-250 border border-purple-200" 
                                : "bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                          )}
                        >
                          {expandedId === discovery.id ? "Close Results" : "View Full Result"}
                        </button>
                      </div>

                      <AnimatePresence>
                        {expandedId === discovery.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-8 mt-8 border-t border-purple-150 space-y-6">
                              {discovery.results.streams.map((stream: any, i: number) => (
                                <StreamResultCard 
                                  key={i} 
                                  stream={stream} 
                                  onSelect={() => handleSelectStream(stream)} 
                                  onExplore={() => handleExploreStream(stream)}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Simple icon for school
function SchoolIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4 6 8-4 8 4" />
      <path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2" />
      <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" />
      <path d="M18 5v17" />
      <path d="M6 5v17" />
      <circle cx="12" cy="9" r="2" />
    </svg>
  );
}
