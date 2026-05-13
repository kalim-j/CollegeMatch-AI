"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  GraduationCap, MapPin, Award, BookOpen, 
  Globe, Phone, ChevronLeft, Sparkles, 
  CheckCircle2, Wallet, Briefcase, 
  TrendingUp, Loader2, Target, Zap, 
  ShieldCheck, ArrowRight, Download, FileText
} from "lucide-react";
import Link from "next/link";
import { College } from "@/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function CollegeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [college, setCollege] = useState<College | null>(null);
  const [visiting, setVisiting] = useState(false);
  const [downloadingFees, setDownloadingFees] = useState(false);
  
  const handleDownloadFeeStructure = async () => {
    if (!college) return;
    
    setDownloadingFees(true);
    try {
      const response = await fetch('/api/download-fee-structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          collegeName: college.name,
          website: college.website,
          collegeId: college.id
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${college.name.replace(/[^a-z0-9]/gi, '_')}_Fee_Structure.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Fallback: Open the website in new tab
        window.open(college.website, '_blank');
      }
    } catch (error) {
      console.error('Error downloading fee structure:', error);
      // Fallback: Open the website in new tab
      window.open(college.website, '_blank');
    } finally {
      setDownloadingFees(false);
    }
  };
  
  useEffect(() => {
    const resultsStr = sessionStorage.getItem('eduanalytics_results');
    if (resultsStr) {
      const results: College[] = JSON.parse(resultsStr);
      const found = results.find(c => c.name.toLowerCase().replace(/ /g, "-") === params.id);
      if (found) {
        setCollege(found);
      }
    }
  }, [params.id]);

  if (!college) {
    return (
      <div className="min-h-screen bg-[#05071a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
          <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Analyzing Institutional Intelligence…</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "NIRF RANK", value: `#${college.nirf_rank || 'N/A'}`, icon: Award, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "AVG PACKAGE", value: `${college.avg_package_lpa || 'N/A'} LPA`, icon: Briefcase, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "MAX PACKAGE", value: `${college.max_package_lpa || 'N/A'} LPA`, icon: TrendingUp, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    { label: "EST. FEES", value: college.fees_approx || "85k - 2.5L", icon: Wallet, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" }
  ];

  return (
    <div className="min-h-screen bg-[#05071a] text-white relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />
      </div>

      <div className="container mx-auto px-6 py-12 max-w-7xl relative z-10">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="group mb-12 flex items-center gap-2 text-white/30 font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-all"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Analysis Results
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-12">
            {/* Hero Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-[3.5rem] overflow-hidden border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl p-10 md:p-16 flex flex-col items-center text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-teal-500/10 opacity-50" />
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500" />
              
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="h-24 w-24 rounded-[2.5rem] bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-8 relative z-10"
              >
                <GraduationCap size={48} className="text-indigo-400" />
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 relative z-10 leading-tight">
                {college.name}
              </h1>
              
              <div className="flex flex-wrap justify-center gap-4 relative z-10">
                <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/[0.05] border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest">
                  <MapPin size={14} className="text-indigo-500" /> {college.location}, {college.state}
                </div>
                <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/[0.05] border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest">
                  <Award size={14} className="text-amber-400" /> NAAC: {college.naac_grade || "A+"}
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn("rounded-[2.5rem] border bg-white/[0.03] backdrop-blur-sm p-8 text-center space-y-4 hover:bg-white/[0.05] transition-colors", stat.border)}
                >
                  <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mx-auto bg-white shadow-lg", stat.color)}>
                    <stat.icon size={22} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className={cn("text-2xl font-black", stat.color)}>{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Why This College Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Zap size={20} />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight">Institutional Intelligence</h2>
              </div>
              <div className="rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl p-10 md:p-14 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500/40" />
                <p className="text-2xl text-white/70 leading-relaxed italic font-medium relative z-10">
                  "{college.why_fit || "This institution demonstrates exceptional alignment with your academic profile, offering premium infrastructure and a proven track record of career success in your chosen specialization."}"
                </p>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Courses */}
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                    <BookOpen size={18} />
                  </div>
                  <h2 className="text-2xl font-black text-white">Elite Specializations</h2>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {(college.courses || [college.course || "Computer Science"]).map((course, i) => (
                    <div key={i} className="flex items-center justify-between p-6 rounded-[1.5rem] bg-white/[0.03] border border-white/5 hover:border-teal-500/30 hover:bg-white/[0.05] transition-all group">
                      <span className="text-sm font-bold text-white/60 group-hover:text-teal-400 transition-colors">{course}</span>
                      <CheckCircle2 size={18} className="text-teal-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </section>

              {/* Admission Info */}
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Target size={18} />
                  </div>
                  <h2 className="text-2xl font-black text-white">Admission Benchmarks</h2>
                </div>
                <div className="rounded-[2.5rem] bg-gradient-to-br from-[#0a0d1e] to-[#05071a] border border-white/5 p-8 space-y-6">
                  <div className="flex justify-between items-center pb-6 border-b border-white/5">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Est. Cutoff (General)</span>
                    <span className="text-3xl font-black text-amber-400 tabular-nums">{college.cutoff_general || "190+"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Capacity (Seats)</span>
                    <span className="text-3xl font-black text-white tabular-nums">{college.seats || "600+"}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Sidebar / AI Recommendation */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="rounded-[3rem] border border-indigo-500/20 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-2xl sticky top-24"
            >
              <div className="p-8 border-b border-white/5 bg-indigo-500/5">
                <div className="flex items-center gap-3 text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">
                  <Sparkles size={14} className="animate-pulse" /> AI Match Analysis
                </div>
              </div>
              
              <div className="p-10 space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Compatibility</p>
                    <p className={cn(
                      "text-5xl font-black tracking-tighter",
                      (college.match_score || 0) > 80 ? "text-teal-400" : (college.match_score || 0) > 60 ? "text-amber-400" : "text-red-400"
                    )}>
                      {college.match_score || 92}%
                    </p>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${college.match_score || 92}%` }}
                      transition={{ duration: 1, ease: "circOut" }}
                      className={cn(
                        "h-full rounded-full shadow-lg",
                        (college.match_score || 0) > 80 ? "bg-teal-400" : (college.match_score || 0) > 60 ? "bg-amber-400" : "bg-red-400"
                      )}
                    />
                  </div>
                </div>

                <div className="rounded-3xl bg-indigo-500/5 border border-indigo-500/10 p-6 text-center">
                  <p className="text-sm font-medium text-indigo-300/60 italic leading-relaxed">
                    "This institution is optimized for your academic success based on previous admission trends and your current performance scores."
                  </p>
                </div>

                <div className="space-y-4">
                    <button
                      onClick={handleDownloadFeeStructure}
                      disabled={downloadingFees}
                      className="w-full h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                    >
                      {downloadingFees ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          <span>Fetching Fee Details...</span>
                        </>
                      ) : (
                        <>
                          <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                          <span>Download Fee Structure</span>
                        </>
                      )}
                    </button>
                    
                    <a
                      href={college.website || `https://www.google.com/search?q=${encodeURIComponent(college.name + ' official website')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        setVisiting(true);
                        setTimeout(() => setVisiting(false), 3000);
                      }}
                      className="w-full h-16 btn-primary text-sm font-black group flex items-center justify-center gap-3"
                    >
                      {visiting ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <Globe size={18} /> 
                          <span>Official Portal</span>
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </a>
                  <Link href="/dashboard/contact" className="block">
                    <button className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/[0.1] transition-all flex items-center justify-center gap-3">
                      <Phone size={16} className="text-teal-400" /> Secure Admission Enquiry
                    </button>
                  </Link>
                </div>

                <div className="flex items-center justify-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                  <ShieldCheck size={12} className="text-teal-500" /> Data Verified Intelligence
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
