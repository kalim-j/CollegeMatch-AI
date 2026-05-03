"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { InterviewSession } from "@/types";
import { History, Calendar, MapPin, ChevronRight, Loader2, Search, Filter } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "interviews", user.uid, "sessions"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InterviewSession[];
      setSessions(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Interview History</h1>
          <p className="text-gray-500 mt-1">Review your past college recommendations and match scores.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search sessions..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-bold text-gray-600 transition-colors">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-20 text-center shadow-sm">
          <div className="bg-gray-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <History className="h-10 w-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Sessions Yet</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">You haven't completed any AI interviews yet. Start one now to see suggestions!</p>
          <Link href="/interview" className="inline-flex items-center bg-primary text-white font-bold px-8 py-4 rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-primary/20">
            Start First Interview
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {sessions.map((session) => (
            <Link key={session.id} href={`/history/${session.id}`} className="group">
              <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="bg-primary/5 w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                      {session.timestamp?.toDate ? session.timestamp.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date Unknown'}
                    </span>
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">Completed</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                    Top Match: {session.suggestions[0]?.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-3 text-gray-500 text-sm">
                    <span className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-primary/50" /> {session.suggestions[0]?.location}</span>
                    <span className="flex items-center font-semibold text-primary">Score: {session.suggestions[0]?.matchScore}%</span>
                  </div>
                </div>
                <div className="self-end md:self-center">
                  <div className="flex items-center text-primary font-bold">
                    View Details <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
