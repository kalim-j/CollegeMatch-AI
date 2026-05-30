"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  GraduationCap, Sparkles, Zap, Loader2,
  BrainCircuit, TrendingUp, History, Settings, ArrowRight,
  BookOpen, Target, Award, Lightbulb, CheckCircle2,
  School
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, doc, getDoc, getCountFromServer } from "firebase/firestore";
import WelcomeModal from "@/components/WelcomeModal";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  })
};

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

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-[#05071a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
          <p className="text-white/30 text-sm font-bold uppercase tracking-widest">Loading your profile…</p>
        </div>
      </div>
    );
  }

  const discoveredStreamName = latestDiscovery ? latestDiscovery.results.streams[0].short_name : "Not yet";

  const stats = [
    { label: "Stream Discovered", value: discoveredStreamName, icon: Lightbulb, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20", href: "/history?tab=streams" },
    { label: "AI Analyses Run", value: analysesCount.toString(), icon: BrainCircuit, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", href: "/history?tab=colleges" },
    { label: "Colleges Matched", value: collegesCount.toString(), icon: Target, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", href: "/history?tab=colleges" },
    { label: "Scholarship Alerts", value: scholarshipsCount.toString(), icon: Award, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", href: "/dashboard/scholarships" },
  ];

  const navCards = [
    { href: "/history", label: "Analysis History", desc: "Review all past AI college analyses and their recommendations.", icon: History, color: "text-purple-400", bg: "bg-purple-500/10", hover: "hover:border-purple-500/40", cta: "View History" },
    { href: "/dashboard/scholarships", label: "Scholarship Finder", desc: "Discover scholarships and financial aid tailored to your profile.", icon: Award, color: "text-teal-400", bg: "bg-teal-500/10", hover: "hover:border-teal-500/40", cta: "Find Scholarships" },
    { href: "/exams", label: "Entrance Exams", desc: "Track important entrance exam dates, results and cutoffs.", icon: BookOpen, color: "text-amber-400", bg: "bg-amber-500/10", hover: "hover:border-amber-500/40", cta: "Track Exams" },
  ];

  return (
    <div className="min-h-screen bg-[#05071a] relative overflow-hidden">
      {showWelcomeModal && user && (
        <WelcomeModal 
          userName={profile?.fullName?.split(" ")[0] || "Student"}
          onClose={() => setShowWelcomeModal(false)}
        />
      )}

      {/* Ambient background glows */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-12 pb-24">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div className="space-y-2">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Welcome back</p>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
              Hello,{" "}
              <span className="text-gradient">
                {profile?.fullName?.split(" ")[0] || "Student"}
              </span>
            </h1>
            <p className="text-white/30 font-bold text-sm">Your CollegeMatch-AI Command Center</p>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="text-right">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Preferred Course</p>
              <p className="text-xs md:text-sm font-bold text-white truncate max-w-[120px] md:max-w-none">
                {profile?.preferredCourse || "Not Set"}
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-300 text-lg flex-shrink-0">
              {profile?.fullName?.[0] ?? "S"}
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              onClick={() => router.push(stat.href)}
              className={`rounded-2xl p-6 border ${stat.border} bg-white/[0.03] backdrop-blur-sm space-y-3 group hover:bg-white/[0.05] transition-colors cursor-pointer`}
            >
              <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`${stat.color}`} size={20} />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-black text-white truncate">{stat.value}</p>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest truncate">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main CTA Section depending on discovery status */}
        {latestDiscovery ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative rounded-[2.5rem] overflow-hidden border border-teal-500/30 bg-teal-500/10 p-8 md:p-10"
            >
              <div className="absolute inset-0 bg-[#05071a]/40 backdrop-blur-md" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30">
                  <CheckCircle2 size={14} className="text-teal-400" />
                  <span className="text-[11px] font-bold text-teal-300 uppercase tracking-widest">Recommended Stream</span>
                </div>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-300 truncate">
                  {latestDiscovery.results.streams[0].stream}
                </h2>
                <p className="text-gray-300 italic text-sm line-clamp-2 mb-4">
                  "{latestDiscovery.results.streams[0].why_fits}"
                </p>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      sessionStorage.setItem('selectedStream', latestDiscovery.results.streams[0].stream);
                      router.push(`/interview?stream=${encodeURIComponent(latestDiscovery.results.streams[0].stream)}&fromDiscover=true`);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                  >
                    <span>Find colleges for this stream</span>
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => router.push('/discover')}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all"
                  >
                    Retake discovery
                  </button>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="relative rounded-[2.5rem] overflow-hidden border border-indigo-500/20 bg-indigo-500/5 p-8 md:p-10 flex flex-col justify-center"
            >
              <div className="absolute inset-0 bg-[#05071a]/40 backdrop-blur-md" />
              <div className="relative z-10 space-y-4">
                <h2 className="text-2xl font-black text-white">Know another stream?</h2>
                <p className="text-gray-400 text-sm">
                  You can also run a direct college match analysis for any stream you already have in mind.
                </p>
                <button
                  onClick={() => router.push("/interview")}
                  className="mt-2 w-full py-3 bg-white/5 border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>Custom College Search</span>
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative rounded-[2.5rem] overflow-hidden border border-teal-500/50 bg-teal-500/10 p-8 md:p-10 shadow-[0_0_30px_rgba(45,212,191,0.15)] group hover:shadow-[0_0_40px_rgba(45,212,191,0.25)] transition-all cursor-pointer"
              onClick={() => router.push('/discover')}
            >
              <div className="absolute inset-0 bg-[#05071a]/40 backdrop-blur-md" />
              <div className="absolute top-0 right-0 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                <Lightbulb size={240} className="text-teal-500" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="absolute -top-4 -right-4 bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-1.5 rounded-full text-xs font-bold flex items-center">
                  <CheckCircle2 size={12} className="mr-1" /> Start here
                </div>
                <div className="w-14 h-14 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-4 border border-teal-500/30">
                  <Lightbulb size={32} className="text-teal-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white">I don't know what to study</h2>
                <p className="text-teal-100/70 text-lg max-w-md">
                  Let AI ask you questions and suggest the right stream and career paths for you based on your interests.
                </p>
                <div className="mt-6 flex items-center gap-2 text-teal-400 font-bold group-hover:gap-4 transition-all">
                  <span>Discover my stream</span>
                  <ArrowRight size={20} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="relative rounded-[2.5rem] overflow-hidden border border-indigo-500/30 bg-indigo-500/10 p-8 md:p-10 shadow-[0_0_20px_rgba(99,102,241,0.1)] group hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-all cursor-pointer"
              onClick={() => router.push('/interview')}
            >
              <div className="absolute inset-0 bg-[#05071a]/40 backdrop-blur-md" />
              <div className="absolute top-0 right-0 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                <School size={240} className="text-indigo-500" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/30">
                  <School size={32} className="text-indigo-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white">I know my stream</h2>
                <p className="text-indigo-100/70 text-lg max-w-md">
                  Skip the discovery and jump straight into finding the best colleges for your marks and preferences.
                </p>
                <div className="mt-6 flex items-center gap-2 text-indigo-400 font-bold group-hover:gap-4 transition-all">
                  <span>Find colleges</span>
                  <ArrowRight size={20} />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-4">
          {/* Nav Cards — 2/3 width */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {navCards.map((card, i) => (
              <motion.div
                key={card.label}
                custom={i + 4}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <Link href={card.href} className="group block h-full">
                  <div className={`h-full rounded-[2rem] p-7 border border-white/5 bg-white/[0.03] ${card.hover} transition-all backdrop-blur-sm space-y-5`}>
                    <div className={`h-12 w-12 rounded-xl ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <card.icon className={card.color} size={22} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-white">{card.label}</h3>
                      <p className="text-white/40 text-sm font-medium leading-relaxed">{card.desc}</p>
                    </div>
                    <div className={`flex items-center justify-start gap-2 ${card.color} font-black text-[10px] uppercase tracking-widest`}>
                      <span>{card.cta}</span> <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Sidebar — 1/3 width */}
          <div className="space-y-5 md:space-y-6">
            {/* Counseling CTA */}
            <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible">
              <div className="rounded-[2rem] p-7 bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <GraduationCap size={180} />
                </div>
                <div className="relative z-10 space-y-5">
                  <h4 className="text-xl font-black">Premium Support</h4>
                  <p className="text-white/70 text-sm font-medium leading-relaxed">
                    Need expert help for direct admission or counseling support?
                  </p>
                  <Link href="/contact">
                    <button className="w-full h-12 bg-white text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/90 transition-colors shadow-lg">
                      Get Expert Help
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
