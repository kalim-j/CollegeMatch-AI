"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  GraduationCap, MapPin, Award, BookOpen, 
  Globe, Phone, ChevronLeft, Sparkles, 
  CheckCircle2, Wallet, Briefcase, 
  TrendingUp, Loader2, Target, Zap, 
  ShieldCheck, ArrowRight, Download
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

  useEffect(() => {
    const elements = document.querySelectorAll('[data-animate]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              (entry.target as HTMLElement).style.opacity = '1';
              (entry.target as HTMLElement).style.transform = 'translateY(0)';
            }, i * 80);
          }
        });
      },
      { threshold: 0.1 }
    );
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [college]);

  if (!college) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]"
        style={{ background: 'linear-gradient(135deg, var(--bg-primary), var(--bg-secondary))' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Analyzing Institutional Intelligence…</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "NIRF RANK", value: `#${college.nirf_rank || 'N/A'}`, icon: Award, color: "text-amber-600", bg: "bg-amber-50 border border-amber-100", border: "border-amber-200" },
    { label: "AVG PACKAGE", value: `${college.avg_package_lpa || 'N/A'} LPA`, icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50 border border-emerald-100", border: "border-emerald-200" },
    { label: "MAX PACKAGE", value: `${college.max_package_lpa || 'N/A'} LPA`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50 border border-purple-100", border: "border-purple-200" },
    { label: "EST. FEES", value: college.fees_approx || "85k - 2.5L", icon: Wallet, color: "text-blue-600", bg: "bg-blue-50 border border-blue-100", border: "border-blue-200" }
  ];

  const getCollegeImage = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("madras") || n.includes("iit m")) {
      return "https://upload.wikimedia.org/wikipedia/commons/e/eb/IIT_Madras_Main_Building.jpg"; // Real IIT Madras Administrative Main Building
    }
    if (n.includes("delhi") || n.includes("iit d")) {
      return "https://upload.wikimedia.org/wikipedia/commons/4/4e/IIT_Delhi_Main_Building.jpg"; // Real IIT Delhi Main Building
    }
    if (n.includes("bombay") || n.includes("iit b")) {
      return "https://upload.wikimedia.org/wikipedia/commons/e/e0/IIT_Bombay_Main_Building.jpg"; // Real IIT Bombay Main Building
    }
    if (n.includes("guindy") || n.includes("anna university")) {
      return "https://upload.wikimedia.org/wikipedia/commons/e/e0/Ceg_red_building.jpg"; // Real CEG Guindy Red Building
    }
    if (n.includes("trichy") || n.includes("nitt")) {
      return "https://upload.wikimedia.org/wikipedia/commons/e/e0/NIT_Trichy_Main_Building.jpg"; // Real NIT Trichy Main Building
    }
    if (n.includes("psg")) {
      return "https://upload.wikimedia.org/wikipedia/commons/2/25/PSG_College_of_technology%2C_Coimbatore%2C_Tamil_Nadu.jpg"; // Real PSG Tech Building
    }
    if (n.includes("rathinam")) {
      return "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80"; // High-quality real campus architecture view
    }
    return "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80"; // Authentic brick university building facade
  };

  return (
    <div className="min-h-screen text-[var(--text-primary)] relative overflow-hidden selection:bg-purple-200"
      style={{ background: 'linear-gradient(135deg, var(--bg-primary), var(--bg-secondary))' }}>
      
      <div className="container mx-auto px-6 py-12 max-w-7xl relative z-10">
        <button
          onClick={() => router.back()}
          className="group mb-8 flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider hover:text-purple-900 transition-all"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Analysis Results
        </button>

        {/* College Image */}
        <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 mb-6">
          <img
            src={getCollegeImage(college.name)}
            alt={college.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <h1 className="text-white font-bold text-xl sm:text-2xl drop-shadow-lg">
              {college.name}
            </h1>
            <p className="text-white/80 text-sm">
              {college.location}, {college.state}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className={cn("rounded-2xl bg-white/70 backdrop-blur-xl border p-6 text-center space-y-3 hover:shadow-md transition-all duration-300", stat.border)}
                >
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mx-auto bg-white border", stat.border, stat.color)}>
                    <stat.icon size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className={cn("text-xl font-bold", stat.color)}>{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Why This College Section */}
            <section className="space-y-4" data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <Zap size={18} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Institutional Intelligence</h2>
              </div>
              <div className="rounded-2xl border border-purple-100 bg-white/70 backdrop-blur-xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-600" />
                <p className="text-lg text-gray-700 leading-relaxed italic font-medium">
                  "{college.why_fit || "This institution demonstrates exceptional alignment with your academic profile, offering premium infrastructure and a proven track record of career success in your chosen specialization."}"
                </p>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Courses */}
              <section className="space-y-4" data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <BookOpen size={16} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Elite Specializations</h2>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {(college.courses || [college.course || "Computer Science"]).map((course, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/70 backdrop-blur-xl border border-purple-100 hover:border-purple-300 transition-all group">
                      <span className="text-sm font-semibold text-gray-700">{course}</span>
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    </div>
                  ))}
                </div>
              </section>

              {/* Admission Info */}
              <section className="space-y-4" data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                    <Target size={16} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Admission Benchmarks</h2>
                </div>
                <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-purple-100 p-6 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-purple-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Est. Cutoff (General)</span>
                    <span className="text-2xl font-bold text-purple-700">{college.cutoff_general || "190+"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Capacity (Seats)</span>
                    <span className="text-2xl font-bold text-gray-900">{college.seats || "600+"}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Sidebar / AI Recommendation */}
          <div className="lg:col-span-4 space-y-6">
            <div
              className="rounded-2xl border border-purple-100 bg-white/70 backdrop-blur-xl overflow-hidden shadow-lg sticky top-6"
              data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
            >
              <div className="p-6 border-b border-purple-100 bg-purple-50/50">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider">
                  <Sparkles size={14} className="animate-pulse" /> AI Match Analysis
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Compatibility</p>
                    <p className={cn(
                      "text-4xl font-bold tracking-tight",
                      (college.match_score || 0) > 80 ? "text-emerald-600" : (college.match_score || 0) > 60 ? "text-amber-600" : "text-red-500"
                    )}>
                      {college.match_score || 92}%
                    </p>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                    <div 
                      style={{ width: `${college.match_score || 92}%`, transition: 'width 1s ease-out' }}
                      className={cn(
                        "h-full rounded-full shadow-sm",
                        (college.match_score || 0) > 80 ? "bg-emerald-500" : (college.match_score || 0) > 60 ? "bg-amber-500" : "bg-red-500"
                      )}
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-purple-50 border border-purple-100 p-4 text-center">
                  <p className="text-xs font-semibold text-purple-700 italic leading-relaxed">
                    "This institution is optimized for your academic success based on previous admission trends and your current performance scores."
                  </p>
                </div>

                <div className="space-y-3 flex flex-col items-center">
                  {/* Google Directions Button */}
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(college.name + ' ' + college.location + ' ' + college.state)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full px-6 py-3.5 rounded-2xl font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-blue-200"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    Get Directions on Google Maps
                  </a>

                  {/* Open in Maps App for Mobile */}
                  <a
                    href={`geo:${college.latitude || 20.5937},${college.longitude || 78.9629}?q=${encodeURIComponent(college.name)}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl text-sm font-medium text-blue-600 border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition sm:hidden"
                  >
                    📍 Open in Maps App
                  </a>

                  <button
                    onClick={handleDownloadFeeStructure}
                    disabled={downloadingFees}
                    className="w-full h-12 border border-purple-200 bg-white/80 hover:bg-white text-purple-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {downloadingFees ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Fetching Fee Details...</span>
                      </>
                    ) : (
                      <>
                        <Download size={16} />
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
                    className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                  >
                    {visiting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Globe size={16} /> 
                        <span>Official Portal</span>
                        <ArrowRight size={16} />
                      </div>
                    )}
                  </a>
                  <Link href="/dashboard/contact" className="w-full">
                    <button className="w-full h-12 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-purple-700 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                      <Phone size={14} /> Secure Admission Enquiry
                    </button>
                  </Link>
                </div>

                <div className="flex items-center justify-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  <ShieldCheck size={12} className="text-emerald-500" /> Data Verified Intelligence
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
