"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { InterviewSession, College } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, MapPin, Building2, BookOpen, 
  BarChart, CheckCircle, Phone, ExternalLink, Sparkles 
} from "lucide-react";
import Link from "next/link";

export default function SessionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      if (!user || !id) return;
      const docRef = doc(db, "interviews", user.uid, "sessions", id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSession({ id: docSnap.id, ...docSnap.data() } as InterviewSession);
      }
      setLoading(false);
    };
    fetchSession();
  }, [user, id]);

  if (loading) return <div className="p-20 text-center">Loading recommendations...</div>;
  if (!session) return <div className="p-20 text-center">Session not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => router.back()}
        className="flex items-center text-gray-500 hover:text-primary font-bold mb-8 transition-colors group"
      >
        <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to History
      </button>

      <div className="bg-primary rounded-[3rem] p-10 md:p-16 text-white mb-12 relative overflow-hidden shadow-2xl shadow-primary/30">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
          <Sparkles className="h-64 w-64" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white font-semibold text-xs uppercase tracking-widest mb-6">
            Interview Results
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Top Picks for You</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl leading-relaxed">
            Based on your 12th marks ({session.answers.marks12th}) and {session.answers.stream} stream, 
            we've identified 5 colleges that match your criteria.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {session.suggestions.map((college, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden flex flex-col lg:flex-row hover:border-primary/20 transition-all duration-300"
          >
            <div className="lg:w-1/3 bg-gray-50 p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-100">
              <div>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{college.name}</h3>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600 text-sm font-medium">
                    <MapPin className="h-4 w-4 mr-2 text-primary" /> {college.location}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm font-medium">
                    <CheckCircle className="h-4 w-4 mr-2 text-primary" /> {college.type} Institute
                  </div>
                </div>
              </div>
              
              <div className="mt-10">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Match Score</div>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-primary">{college.matchScore}%</span>
                </div>
              </div>
            </div>

            <div className="lg:w-2/3 p-10 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div>
                  <h4 className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    <BookOpen className="h-4 w-4 mr-2 text-primary" /> Recommended Course
                  </h4>
                  <p className="text-lg font-bold text-gray-900">{college.courseRecommendation}</p>
                </div>
                <div>
                  <h4 className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    <BarChart className="h-4 w-4 mr-2 text-primary" /> Expected Cutoff
                  </h4>
                  <p className="text-lg font-bold text-gray-900">{college.expectedCutoff}</p>
                </div>
              </div>

              <div className="mb-10">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Why it fits you</h4>
                <p className="text-gray-600 leading-relaxed bg-primary/5 p-6 rounded-2xl border border-primary/10 italic">
                  "{college.whyFits}"
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/contact" 
                  className="flex-1 bg-primary text-white text-center py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="h-5 w-5" /> Talk to Counselor
                </Link>
                <Link 
                  href={`/colleges/${idx}`} 
                  className="flex-1 bg-white text-gray-900 border-2 border-gray-100 text-center py-4 rounded-xl font-bold hover:border-primary/30 transition-all flex items-center justify-center gap-2"
                >
                  View Details <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
