"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, Sparkles, Zap, Loader2,
  BrainCircuit, TrendingUp, History, ArrowRight,
  BookOpen, Target, Award, Lightbulb, CheckCircle2,
  School
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, doc, getDoc, getCountFromServer } from "firebase/firestore";
import WelcomeModal from "@/components/WelcomeModal";

export default function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [latestDiscovery, setLatestDiscovery] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [analysesCount, setAnalysesCount] = useState(0);
  const [collegesCount, setCollegesCount] = useState(0);
  const [scholarshipsCount, setScholarshipsCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      const fetchData = async () => {
        try {
          // Check welcome modal
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (!data.shownWelcome) {
              setShowWelcomeModal(true);
            }
          }

          // Fetch latest discovery
          const q = query(
            collection(db, `discoveries/${user.uid}/sessions`),
            orderBy("timestamp", "desc"),
            limit(1)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setLatestDiscovery(querySnapshot.docs[0].data());
          }

          const scholarshipsSnapshot = await getCountFromServer(collection(db, `scholarships/${user.uid}/searches`));
          setScholarshipsCount(scholarshipsSnapshot.data().count);

          let matched = 0;
          const interviewsQuery = await getDocs(collection(db, `interviews/${user.uid}/sessions`));
          interviewsQuery.forEach(doc => {
            const data = doc.data();
            if (data.results && Array.isArray(data.results)) {
               matched += data.results.length;
            } else if (data.collegeMatches && Array.isArray(data.collegeMatches)) {
               matched += data.collegeMatches.length;
            }
          });
          setAnalysesCount(interviewsQuery.size);
          setCollegesCount(matched);
        } catch (error) {
          console.error("Dashboard fetch error:", error);
        } finally {
          setDataLoading(false);
        }
      };
      
      fetchData();
    }
  }, [user, authLoading, router]);

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
  }, [dataLoading]);

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]"
        style={{ background: 'linear-gradient(135deg, var(--bg-primary), var(--bg-secondary))' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Loading your profile…</p>
        </div>
      </div>
    );
  }

  const discoveredStreamName = latestDiscovery ? latestDiscovery.results.streams[0].short_name : "Not yet";

  const stats = [
    { label: "Stream Discovered", value: discoveredStreamName, icon: Lightbulb, color: "text-teal-600", bg: "bg-teal-50 border border-teal-200", border: "border-purple-100", href: "/history?tab=streams" },
    { label: "AI Analyses Run", value: analysesCount.toString(), icon: BrainCircuit, color: "text-purple-600", bg: "bg-purple-550 border border-purple-200", border: "border-purple-100", href: "/history?tab=colleges" },
    { label: "Colleges Matched", value: collegesCount.toString(), icon: Target, color: "text-purple-600", bg: "bg-purple-50 border border-purple-200", border: "border-purple-100", href: "/history?tab=colleges" },
    { label: "Scholarship Alerts", value: scholarshipsCount.toString(), icon: Award, color: "text-amber-600", bg: "bg-amber-50 border border-amber-200", border: "border-purple-100", href: "/dashboard/scholarships" },
  ];

  const navCards = [
    { href: "/history", label: "Analysis History", desc: "Review all past AI college analyses and their recommendations.", icon: History, color: "text-purple-600", bg: "bg-purple-50 border border-purple-250", hover: "hover:border-purple-300", cta: "View History" },
    { href: "/dashboard/scholarships", label: "Scholarship Finder", desc: "Discover scholarships and financial aid tailored to your profile.", icon: Award, color: "text-teal-600", bg: "bg-teal-50 border border-teal-250", hover: "hover:border-teal-300", cta: "Find Scholarships" },
    { href: "/exams", label: "Entrance Exams", desc: "Track important entrance exam dates, results and cutoffs.", icon: BookOpen, color: "text-amber-600", bg: "bg-amber-50 border border-amber-250", hover: "hover:border-amber-300", cta: "Track Exams" },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 pb-24 sm:pb-6 text-[var(--text-primary)]"
      style={{ background: 'linear-gradient(135deg, var(--bg-primary), var(--bg-secondary))' }}>
      {showWelcomeModal && user && (
        <WelcomeModal 
          userName={profile?.fullName?.split(" ")[0] || "Student"}
          onClose={() => setShowWelcomeModal(false)}
        />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-12 pb-24">
        
        {/* Header */}
        <div
          data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div className="space-y-2">
            <p className="text-[10px] font-black text-purple-700 uppercase tracking-[0.3em]">Welcome back</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-none">
              Hello,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                {profile?.fullName?.split(" ")[0] || "Student"}
              </span>
            </h1>
            <p className="text-gray-500 font-bold text-sm">Welcome to CollegeMatch AI</p>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Preferred Course</p>
              <p className="text-xs md:text-sm font-bold text-gray-900 truncate max-w-[120px] md:max-w-none">
                {profile?.preferredCourse || "Not Set"}
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center font-black text-purple-700 text-lg flex-shrink-0">
              {profile?.fullName?.[0] ?? "S"}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              onClick={() => router.push(stat.href)}
              className="bg-white/70 backdrop-blur-xl border border-purple-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 space-y-3 cursor-pointer"
            >
              <div className={`h-10 w-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center`}>
                <stat.icon className={`${stat.color}`} size={20} />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-black text-gray-900 truncate">{stat.value}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main CTA Section depending on discovery status */}
        {latestDiscovery ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
            <div
              className="relative rounded-[2.5rem] overflow-hidden border border-purple-200 bg-white/70 backdrop-blur-xl p-8 md:p-10"
            >
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200">
                  <CheckCircle2 size={14} className="text-purple-600" />
                  <span className="text-[11px] font-bold text-purple-700 uppercase tracking-widest">Recommended Stream</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 truncate">
                  {latestDiscovery.results.streams[0].stream}
                </h2>
                <p className="text-gray-500 italic text-sm line-clamp-2 mb-4">
                  "{latestDiscovery.results.streams[0].why_fits}"
                </p>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      sessionStorage.setItem('selectedStream', latestDiscovery.results.streams[0].stream);
                      router.push(`/interview?stream=${encodeURIComponent(latestDiscovery.results.streams[0].stream)}&fromDiscover=true`);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Find colleges for this stream</span>
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => router.push('/discover')}
                    className="px-6 py-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-medium rounded-xl transition-all"
                  >
                    Retake discovery
                  </button>
                </div>
              </div>
            </div>
            
            <div
              className="relative rounded-[2.5rem] overflow-hidden border border-purple-200 bg-white/70 backdrop-blur-xl p-8 md:p-10 flex flex-col justify-center"
            >
              <div className="relative z-10 space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Know another stream?</h2>
                <p className="text-gray-500 text-sm">
                  You can also run a direct college match analysis for any stream you already have in mind.
                </p>
                <button
                  onClick={() => router.push("/interview")}
                  className="mt-2 w-full py-3 bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>Custom College Search</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
            <div
              className="relative rounded-[2.5rem] overflow-hidden border border-purple-200 bg-white/70 backdrop-blur-xl p-8 md:p-10 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => router.push('/discover')}
            >
              <div className="relative z-10 space-y-4">
                <div className="absolute -top-4 -right-4 bg-purple-50 text-purple-700 border border-purple-200 px-4 py-1.5 rounded-full text-xs font-bold flex items-center">
                  <CheckCircle2 size={12} className="mr-1" /> Start here
                </div>
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 border border-purple-200">
                  <Lightbulb size={32} className="text-purple-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">I don't know what to study</h2>
                <p className="text-gray-500 text-base max-w-md">
                  Let AI ask you questions and suggest the right stream and career paths for you based on your interests.
                </p>
                <div className="mt-6 flex items-center gap-2 text-purple-600 font-bold hover:gap-4 transition-all">
                  <span>Discover my stream</span>
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>

            <div
              className="relative rounded-[2.5rem] overflow-hidden border border-purple-200 bg-white/70 backdrop-blur-xl p-8 md:p-10 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => router.push('/interview')}
            >
              <div className="relative z-10 space-y-4">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 border border-purple-200">
                  <School size={32} className="text-purple-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">I know my stream</h2>
                <p className="text-gray-500 text-base max-w-md">
                  Skip the discovery and jump straight into finding the best colleges for your marks and preferences.
                </p>
                <div className="mt-6 flex items-center gap-2 text-purple-600 font-bold hover:gap-4 transition-all">
                  <span>Find colleges</span>
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-4" data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
          {/* Nav Cards — 2/3 width */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {navCards.map((card, i) => (
              <Link key={card.label} href={card.href} className="group block h-full">
                <div className="bg-white/70 backdrop-blur-xl border border-purple-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-7 space-y-5 h-full">
                  <div className="h-12 w-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <card.icon className={card.color} size={22} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">{card.label}</h3>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{card.desc}</p>
                  </div>
                  <div className={`flex items-center justify-start gap-2 ${card.color} font-bold text-[10px] uppercase tracking-widest`}>
                    <span>{card.cta}</span> <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Sidebar — 1/3 width */}
          <div className="space-y-5 md:space-y-6">
            {/* Counseling CTA */}
            <div>
              <div className="rounded-[2.5rem] p-7 bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <GraduationCap size={180} />
                </div>
                <div className="relative z-10 space-y-5">
                  <h4 className="text-xl font-bold">Premium Support</h4>
                  <p className="text-white/70 text-sm font-medium leading-relaxed">
                    Need expert help for direct admission or counseling support?
                  </p>
                  <Link href="/contact">
                    <button className="w-full h-12 bg-white text-purple-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/90 transition-colors shadow-lg">
                      Get Expert Help
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
