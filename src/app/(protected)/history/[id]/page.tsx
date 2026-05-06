"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { InterviewSession, College } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, MapPin, Building2, BookOpen, 
  BarChart, CheckCircle, Phone, ExternalLink, Sparkles, GraduationCap, Award
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SessionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [visitingId, setVisitingId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      if (!user || !id) return;
      // New Path: interviews/{userId}/sessions/{id}
      const docRef = doc(db, "interviews", user.uid, "sessions", id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSession({ id: docSnap.id, ...docSnap.data() } as InterviewSession);
      }
      setLoading(false);
    };
    fetchSession();
  }, [user, id]);

  if (loading) return <div className="p-20 text-center">Loading your personalized match reports...</div>;
  if (!session) return <div className="p-20 text-center">Session report not found.</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Button 
        variant="ghost"
        onClick={() => router.back()}
        className="mb-8 rounded-xl group"
      >
        <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to History
      </Button>

      <div className="bg-primary rounded-[3rem] p-10 md:p-16 text-white mb-12 relative overflow-hidden shadow-2xl shadow-primary/30">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
          <Sparkles className="h-64 w-64" />
        </div>
        <div className="relative z-10">
          <Badge variant="teal" className="mb-6 px-4 py-1">Interview Results</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Your Dream Matches</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl leading-relaxed">
            Based on your {session.studentProfile?.courseLevel || 'UG'} marks ({session.studentProfile?.percentage12th || 'N/A'}%) and {session.studentProfile?.stream || 'N/A'} focus, 
            we've identified 8 colleges that represent your best path forward.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {session.results && session.results.map((college, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-[2.5rem] border border-primary/5 shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col lg:flex-row overflow-hidden"
          >
            {/* Left Info Panel */}
            <div className="lg:w-1/3 bg-muted/30 p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r">
              <div>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-primary/5">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4 leading-tight">{college.name}</h3>
                <div className="space-y-4">
                  <div className="flex items-center text-muted-foreground text-sm font-medium">
                    <MapPin className="h-4 w-4 mr-2 text-secondary" /> {college.location}, {college.state}
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm font-medium">
                    <Award className="h-4 w-4 mr-2 text-secondary" /> {college.type} Institute
                  </div>
                </div>
              </div>
              
              <div className="mt-10">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Match Probability</div>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-primary">{college.match_score}%</span>
                </div>
              </div>
            </div>

            {/* Right Content Panel */}
            <div className="lg:w-2/3 p-10 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div>
                  <h4 className="flex items-center text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    <BookOpen className="h-4 w-4 mr-2 text-primary" /> Top Courses
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {college.course ? (
                      <Badge variant="outline" className="rounded-lg">{college.course}</Badge>
                    ) : college.courses && college.courses.slice(0, 3).map(c => (
                      <Badge key={c} variant="outline" className="rounded-lg">{c}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="flex items-center text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    <BarChart className="h-4 w-4 mr-2 text-primary" /> Admission Metrics
                  </h4>
                  <p className="text-lg font-bold text-gray-900">
                    Rank: #{college.nirf_rank || 'N/A'} {college.avg_package_lpa ? `| Avg: ${college.avg_package_lpa}L` : ''}
                  </p>
                </div>
              </div>

              <div className="mb-10">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Expert Insight</h4>
                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 italic text-primary/80">
                  "{college.why_fit}"
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact" className="flex-1">
                  <Button className="w-full h-14 rounded-xl font-bold gap-2 text-lg shadow-lg">
                    <Phone className="h-5 w-5" /> Admission Support
                  </Button>
                </Link>
                <a
                  href={college.website || `https://www.google.com/search?q=${encodeURIComponent(college.name + ' official website')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVisitingId(college.id);
                    setTimeout(() => setVisitingId(null), 3000);
                  }}
                  className={cn(
                    "flex-1 inline-flex items-center justify-center gap-2 h-14 rounded-xl font-bold text-lg transition-all duration-200",
                    college.website 
                      ? "bg-purple-500/15 text-purple-400 border border-purple-500/20 hover:bg-purple-500/25" 
                      : "bg-gray-500/15 text-gray-400 border border-gray-500/20 hover:bg-gray-500/25"
                  )}
                >
                  {visitingId === college.id ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Opening...
                    </>
                  ) : college.website ? (
                    <>
                      Official Website <ExternalLink className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Search Online <ExternalLink className="h-4 w-4" />
                    </>
                  )}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
