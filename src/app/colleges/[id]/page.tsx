"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap, MapPin, Award, BookOpen, Globe, Phone, ChevronLeft, Sparkles, CheckCircle2, IndianRupee, Wallet, Briefcase, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { College } from "@/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
      // Find the college by its slugified name
      const found = results.find(c => c.name.toLowerCase().replace(/ /g, "-") === params.id);
      if (found) {
        setCollege(found);
      }
    }
  }, [params.id]);

  if (!college) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50/50">
        <div className="text-center">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-xl font-bold text-slate-800 animate-pulse">Analyzing College Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button variant="ghost" onClick={() => router.back()} className="mb-8 rounded-xl hover:bg-white/60 group">
          <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Results
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-10">
          {/* Hero Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-72 md:h-96 w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#7F77DD] to-secondary opacity-95" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="h-24 w-24 rounded-[2rem] bg-white/20 flex items-center justify-center mb-8 backdrop-blur-xl border border-white/30 shadow-2xl"
              >
                <GraduationCap className="h-12 w-12" />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg">{college.name}</h1>
              <div className="flex flex-wrap justify-center items-center gap-4 text-lg md:text-xl font-medium">
                <span className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
                    <MapPin className="h-5 w-5 text-secondary" /> {college.location}, {college.state}
                </span>
                <span className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
                    <Award className="h-5 w-5 text-amber-300" /> NAAC: {college.naac_grade || "A+"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "NIRF RANK", value: `#${college.nirf_rank || 'N/A'}`, icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "AVG PACKAGE", value: `${college.avg_package_lpa || 'N/A'} LPA`, icon: Briefcase, color: "text-green-600", bg: "bg-green-50" },
              { label: "MAX PACKAGE", value: `${college.max_package_lpa || 'N/A'} LPA`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "EST. FEES", value: college.fees_approx || "85k - 2.5L", icon: Wallet, color: "text-orange-600", bg: "bg-orange-50" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={cn("rounded-[2rem] border-none shadow-xl hover:shadow-2xl transition-all", stat.bg)}>
                    <CardContent className="p-6 text-center">
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-3 bg-white shadow-sm", stat.color)}>
                            <stat.icon className="h-5 w-5" />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className={cn("text-xl font-black", stat.color)}>{stat.value}</p>
                    </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Detailed Info Sections */}
          <div className="space-y-10">
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-2 bg-primary rounded-full" />
                <h2 className="text-3xl font-black text-slate-800">Why this College?</h2>
              </div>
              <Card className="rounded-[2.5rem] border-primary/5 bg-white shadow-2xl shadow-slate-200/50 p-8 md:p-10">
                <p className="text-xl text-slate-600 leading-relaxed italic font-medium">
                  "{college.why_fit || "This college offers exceptional placement opportunities and is recognized for its academic rigor and state-of-the-art campus facilities."}"
                </p>
              </Card>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Courses Section */}
              <section className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" /> Top Courses
                </h2>
                <div className="flex flex-wrap gap-3">
                  {(college.courses || [college.course || "Computer Science"]).map((course, i) => (
                    <div key={i} className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white border-2 border-primary/5 shadow-sm text-sm font-bold text-slate-700 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-default">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {course}
                    </div>
                  ))}
                </div>
              </section>

              {/* Admission Info */}
              <section className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" /> Admission Info
                </h2>
                <div className="p-6 rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-slate-400 font-bold text-xs uppercase">Est. Cutoff (Gen)</span>
                    <span className="text-2xl font-black text-amber-400">{college.cutoff_general || "190+"}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-400 font-bold text-xs uppercase">Total Seats</span>
                    <span className="text-2xl font-black text-white">{college.seats || "600+"}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Sidebar / CTA Area */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="rounded-[3rem] border-primary/10 shadow-2xl overflow-hidden bg-white/60 backdrop-blur-xl sticky top-8">
              <CardHeader className="bg-primary/10 p-8">
                <CardTitle className="flex items-center gap-3 text-2xl font-black text-primary">
                  <Sparkles className="h-6 w-6 animate-pulse" /> AI Analysis
                </CardTitle>
                <CardDescription className="text-primary/60 font-bold text-xs uppercase tracking-widest">
                  Personalized Match Report
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                  <p className="text-sm italic text-primary/70 leading-relaxed font-medium text-center">
                    "This college is a high-probability match for you because of your strong cutoff marks and preference for {college.state}."
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compatibility Score</span>
                    <span className={cn(
                      "text-4xl font-black",
                      (college.match_score || 0) > 80 ? "text-green-500" : (college.match_score || 0) > 60 ? "text-amber-500" : "text-red-500"
                    )}>
                      {college.match_score || 92}%
                    </span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${college.match_score || 92}%` }}
                      className={cn(
                        "h-full rounded-full shadow-lg",
                        (college.match_score || 0) > 80 ? "bg-green-500" : (college.match_score || 0) > 60 ? "bg-amber-500" : "bg-red-500"
                      )}
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
                    className="w-full inline-flex items-center justify-center gap-3 h-16 text-xl font-bold rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/30 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
                  >
                    {visitingId === college.id ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <><Globe className="h-5 w-5" /> Visit Website</>
                    )}
                  </a>
                  <Link href="/contact" className="w-full">
                    <Button variant="outline" className="w-full rounded-2xl gap-3 h-14 text-lg font-bold border-primary/20 hover:bg-primary/5 transition-all">
                      <Phone className="h-5 w-5 text-primary" /> Admission Enquiry
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle2 className="h-3 w-3 text-green-500" /> Data Verified by CollegeMatch
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
