"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap, MapPin, Award, BookOpen, Globe, Phone, ChevronLeft, Sparkles, CheckCircle2, IndianRupee } from "lucide-react";
import Link from "next/link";
import { College } from "@/types";
import { cn } from "@/lib/utils";

export default function CollegeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [college, setCollege] = useState<College | null>(null);
  const [visitingId, setVisitingId] = useState<number | null>(null);
  
  useEffect(() => {
    // Get results from session storage
    const resultsStr = sessionStorage.getItem('eduanalytics_results');
    if (resultsStr) {
      const results: College[] = JSON.parse(resultsStr);
      // Find the college by its slugified name (which matches the ID we passed in router.push)
      const found = results.find(c => c.name.toLowerCase().replace(/ /g, "-") === params.id);
      if (found) {
        setCollege(found);
      }
    }
  }, [params.id]);

  if (!college) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Loading college details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-8 rounded-xl hover:bg-white/40">
        <ChevronLeft className="h-4 w-4 mr-2" /> Back to Results
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative h-64 md:h-80 w-full rounded-3xl md:rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#7F77DD] to-secondary opacity-90" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
              <div className="h-20 w-20 rounded-3xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-md border border-white/30">
                <GraduationCap className="h-10 w-10" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black">{college.name}</h1>
              <p className="text-xl opacity-90 mt-3 font-medium flex items-center gap-2">
                <MapPin className="h-5 w-5" /> {college.location}, {college.state}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" /> About this College
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg italic">
              "{college.why_fit}"
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl p-4 text-center bg-white/40 backdrop-blur-md border border-primary/5 shadow-sm">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">NIRF Rank</p>
                <p className="text-2xl font-black text-primary">#{college.nirf_rank}</p>
              </Card>
              <Card className="rounded-2xl p-4 text-center bg-white/40 backdrop-blur-md border border-primary/5 shadow-sm">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Avg Package</p>
                <p className="text-2xl font-black text-secondary">{college.avg_package_lpa}L</p>
              </Card>
              <Card className="rounded-2xl p-4 text-center bg-white/40 backdrop-blur-md border border-primary/5 shadow-sm">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Max Package</p>
                <p className="text-xl font-black text-primary/80">{college.max_package_lpa}L</p>
              </Card>
              <Card className="rounded-2xl p-4 text-center bg-white/40 backdrop-blur-md border border-primary/5 shadow-sm">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Seats</p>
                <p className="text-2xl font-black text-primary/80">{college.seats}</p>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" /> Primary Course
            </h2>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-primary/10 shadow-sm text-sm font-bold text-primary/80">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {college.course || college.courses?.[0]}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="rounded-3xl md:rounded-[3rem] border-primary/10 shadow-2xl overflow-hidden bg-white/60 backdrop-blur-xl">
            <CardHeader className="bg-primary/10 p-8">
              <CardTitle className="flex items-center gap-3 text-2xl font-black">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" /> AI Match Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                <p className="text-sm italic text-primary/70 leading-relaxed font-medium text-center">
                  "Our AI evaluated your academic profile and preferences. This college stands out for its excellence in your chosen stream and accessibility."
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Compatibility Score</span>
                  <span className={cn(
                    "text-3xl font-black",
                    college.match_score > 80 ? "text-green-500" : college.match_score > 60 ? "text-amber-500" : "text-red-500"
                  )}>
                    {college.match_score}%
                  </span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden border border-muted-foreground/10">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000 ease-out",
                      college.match_score > 80 ? "bg-green-500" : college.match_score > 60 ? "bg-amber-500" : "bg-red-500"
                    )}
                    style={{ width: `${college.match_score}%` }} 
                  />
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <a
                  href={college.website || `https://www.google.com/search?q=${encodeURIComponent(college.name + ' official website')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setVisitingId(college.id);
                    setTimeout(() => setVisitingId(null), 3000);
                  }}
                  className="w-full inline-flex items-center justify-center gap-3 h-16 text-xl font-bold rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all duration-200"
                >
                  {visitingId === college.id ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Opening...
                    </>
                  ) : college.website ? (
                    <>
                      <Globe className="h-5 w-5" /> Visit Official Website →
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      Search Online
                    </>
                  )}
                </a>
                <Link href="/contact" className="w-full">
                  <Button variant="outline" className="w-full rounded-2xl gap-3 h-14 text-lg font-bold border-primary/20 hover:bg-primary/5">
                    <Phone className="h-5 w-5 text-primary" /> Admission Enquiry
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs font-bold">
                <CheckCircle2 className="h-3 w-3 text-green-500" /> Verified College Data
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
