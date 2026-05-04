"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { InterviewSession } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, GraduationCap, MapPin, ChevronRight, BookOpen, Clock, Sparkles } from "lucide-react";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      if (user) {
        try {
          // New Path: interviews/{userId}/sessions
          const q = query(
            collection(db, "interviews", user.uid, "sessions"),
            orderBy("timestamp", "desc")
          );
          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as InterviewSession[];
          setSessions(data);
        } catch (error) {
          console.error("Error fetching history:", error);
        }
      }
      setLoading(false);
    };
    fetchSessions();
  }, [user]);

  if (authLoading || loading) return <div className="flex items-center justify-center h-[80vh]">Loading history...</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">Interview History</h1>
          <p className="text-muted-foreground">Review your past college suggestion sessions</p>
        </div>
        <Link href="/interview">
          <Button className="rounded-2xl gap-2 shadow-lg">
            <Sparkles className="h-4 w-4" /> New Session
          </Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <Card className="rounded-[2rem] border-dashed p-20 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No sessions found</h2>
          <p className="text-muted-foreground mb-8">You haven't completed any admission interviews yet.</p>
          <Link href="/interview">
            <Button className="rounded-xl">Start Your First Interview</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {sessions.map((session) => (
            <Card key={session.id} className="rounded-3xl border-primary/10 shadow-sm overflow-hidden overflow-visible">
              <div 
                className="p-6 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Calendar className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {session.timestamp ? format(session.timestamp.toDate(), "PPP") : 
                         session.createdAt ? format(parseISO(session.createdAt), "PPP") : "Recent Session"}
                      </h3>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {session.studentProfile.courseLevel} {session.studentProfile.stream}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {session.studentProfile.district}, {session.studentProfile.state}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Top Match</p>
                      <p className="font-bold text-primary">{(session.results && session.results[0]?.name.split(' ')[0]) || "Loading"}...</p>
                    </div>
                    <Button variant="outline" className="rounded-xl gap-2">
                      {expandedSession === session.id ? "Hide Results" : "View 8 Matches"}
                      <ChevronRight className={cn("h-4 w-4 transition-transform", expandedSession === session.id && "rotate-90")} />
                    </Button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedSession === session.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-muted/20 border-t"
                  >
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {session.results && session.results.map((college, idx) => (
                          <Card key={idx} className="rounded-2xl border-none shadow-sm bg-white p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <GraduationCap className="h-4 w-4" />
                              </div>
                              <span className="text-xs font-bold text-secondary">{college.match_score}%</span>
                            </div>
                            <h4 className="font-bold text-sm line-clamp-2 mb-1">{college.name}</h4>
                            <p className="text-[10px] text-muted-foreground mb-3">{college.location}</p>
                            <Link href="/contact">
                              <Button size="sm" variant="ghost" className="w-full text-[10px] h-7 rounded-lg">Contact</Button>
                            </Link>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
