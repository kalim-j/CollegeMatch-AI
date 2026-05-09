'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  orderBy,
  query
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, MapPin, Sparkles, ChevronRight, History, Calendar, Award, BookOpen, Search, X, FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generatePDFReport } from '@/lib/generateReport';

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
  const { user, loading, profile } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [fetching, setFetching] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, 'interviews', user.uid, 'sessions'),
          orderBy('timestamp', 'desc')
        );
        const snap = await getDocs(q);
        const data: Session[] = snap.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Session, 'id'>),
        }));
        setSessions(data);
      } catch (err) {
        console.error('History fetch error:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchHistory();
  }, [user]);

  const handleCollegeClick = (college: CollegeResult) => {
    // Store current results in sessionStorage so the detail page can find it
    // This is how we handle navigation to colleges that aren't in a global DB
    const resultsToStore = sessions.find(s => s.results.some(r => r.name === college.name))?.results;
    if (resultsToStore) {
        sessionStorage.setItem('eduanalytics_results', JSON.stringify(resultsToStore));
    }
    
    const slug = college.name.toLowerCase().replace(/ /g, "-");
    router.push(`/colleges/${slug}`);
  };

  if (loading || fetching) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Retrieving your analysis history...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-20 w-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <History className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-primary mb-4">No History Yet</h2>
          <p className="text-muted-foreground text-lg mb-10">Start your first AI analysis to see your personalized college matches here.</p>
          <Button onClick={() => router.push('/interview')} size="lg" className="h-16 px-10 rounded-2xl text-xl font-bold shadow-xl shadow-primary/20">
            Start New Interview
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white overflow-hidden relative selection:bg-purple-500/30">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-12 w-12 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white font-syne">Analysis History</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Revisit your previous AI college recommendations</p>
          </div>
        </div>

      <div className="space-y-6">
        {sessions.map((session, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={session.id}
          >
            <Card className="rounded-[2.5rem] border-white/5 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-xl hover:border-purple-500/30 transition-all group">
              <div className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-primary/10 rounded-lg text-[10px] font-black text-primary uppercase tracking-widest">
                            {session.studentProfile?.level || "UG"}
                        </div>
                        <div className="px-3 py-1 bg-secondary/10 rounded-lg text-[10px] font-black text-secondary uppercase tracking-widest">
                            {session.studentProfile?.stream || "Engineering"}
                        </div>
                    </div>
                    
                    <h3 className="text-3xl font-black text-white leading-tight group-hover:text-purple-400 transition-colors">
                        {session.topCollege}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-400 font-bold">
                            <MapPin className="h-4 w-4 text-purple-400/60" />
                            {session.studentProfile?.district}, {session.studentProfile?.state}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400 font-bold">
                            <Calendar className="h-4 w-4 text-purple-400/60" />
                            {session.createdAt ? new Date(session.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            }) : 'N/A'}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                        <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                            Cutoff: <span className="text-white">{session.studentProfile?.cutoffMark}</span>
                        </div>
                        <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                            Quota: <span className="text-white">{session.studentProfile?.quota}</span>
                        </div>
                        <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                            Matches: <span className="text-emerald-400">{session.totalResults}</span>
                        </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const mappedResults = session.results.map(r => ({
                          name: r.name,
                          location: r.location,
                          state: r.state || r.location.split(',').pop()?.trim() || 'India',
                          cutoff_general: r.cutoff_mark,
                          match_score: r.match_score,
                          why_fit: r.why_fit,
                          naac_grade: r.naac_grade,
                          nirf_rank: r.nirf_rank
                        }));

                        generatePDFReport({
                          studentName: profile?.fullName || 'Student',
                          marks: session.studentProfile?.cutoffMark || 0,
                          category: session.studentProfile?.quota || 'General',
                          course: session.studentProfile?.stream || 'Any',
                          aiSummary: `Based on your academic profile with ${session.studentProfile?.cutoffMark} marks in ${session.studentProfile?.stream}, we have analyzed ${session.results.length} colleges that best match your preferences. We recommend focusing on colleges with higher match scores for better admission probability.`,
                          safeColleges: mappedResults.filter(c => (c.match_score || 0) > 80),
                          moderateColleges: mappedResults.filter(c => (c.match_score || 0) > 60 && (c.match_score || 0) <= 80),
                          reachColleges: mappedResults.filter(c => (c.match_score || 0) <= 60),
                        });
                      }}
                      className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest border-white/10 hover:bg-white/5 text-slate-300"
                    >
                      <FileDown className="h-4 w-4 mr-2" /> Download PDF
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                      className={cn(
                        "h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all",
                        expandedId === session.id 
                            ? "bg-white text-slate-900" 
                            : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20"
                      )}
                    >
                      {expandedId === session.id ? (
                          <><X className="h-4 w-4 mr-2" /> Close</>
                      ) : (
                          <><Search className="h-4 w-4 mr-2" /> View Results</>
                      )}
                    </Button>
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
                      <div className="pt-8 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <p className="text-sm font-black text-primary uppercase tracking-widest">Recommended Colleges</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          {session.results.map((college, idx) => (
                            <motion.div
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: idx * 0.05 }}
                              key={idx}
                              onClick={() => handleCollegeClick(college)}
                              className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/10 transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                            >
                              <div className="flex gap-4 items-center">
                                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center font-black text-slate-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                    {idx + 1}
                                </div>
                                <div>
                                    <h4 className="font-black text-white group-hover:text-purple-400 transition-colors">{college.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{college.location} · NAAC: {college.naac_grade}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="text-right hidden sm:block">
                                    <div className="text-lg font-black text-emerald-400">{Math.round(college.match_score)}%</div>
                                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Match Score</div>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-white/5 group-hover:bg-purple-500/20 text-slate-600 group-hover:text-purple-400 flex items-center justify-center transition-all">
                                    <ChevronRight className="h-5 w-5" />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </div>
  );
}
