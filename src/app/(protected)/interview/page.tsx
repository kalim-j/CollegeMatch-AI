"use client";

import { useState, useEffect } from "react";
import { generatePDFReport } from '@/lib/generateReport';
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, ChevronRight, ChevronLeft, GraduationCap, 
  Sparkles, MapPin, Award, BookOpen, 
  Wallet, Users, Loader2, Target,
  Zap, ArrowRight, FileDown, History
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { stateDistricts } from "@/data/stateDistricts";
import { College, StudentProfile } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

const UG_STREAMS = ["Engineering", "Medical", "Arts & Science", "Commerce", "Law", "Agriculture", "Architecture", "Pharmacy", "Nursing", "Education", "Hotel Management", "Design", "MBA (Integrated)", "Other"];
const PG_STREAMS = ["ME/MTech", "MD/MS", "MSc", "MA", "MBA", "MCA", "LLM", "MPharm", "MEd", "Other"];
const QUOTAS = ["General", "OBC", "MBC", "BC", "SC", "ST", "NRI", "Management"];
const RELIGIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Other"];
const BOARDS = ["State Board", "CBSE", "ICSE", "IGCSE", "Other"];

export default function InterviewPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 9;
  
  const [formData, setFormData] = useState<any>({
    courseLevel: "UG",
    stream: "",
    state: "Tamil Nadu",
    district: "",
    marks10thBoard: "State Board",
    marks10th: "",
    percentage10th: "",
    marks12thBoard: "State Board",
    marks12th: "",
    percentage12th: "",
    ugCgpa: "",
    cutoffMark: "",
    cutoffRange: "exact",
    budget: "Both",
    quota: "General",
    religion: "Hindu"
  });

  const [colleges, setColleges] = useState<College[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else handleFinish();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateForm = (data: Partial<StudentProfile>) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
  };

  const handleCollegeClick = async (college: College) => {
    try {
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeName: college.name,
          collegeLocation: college.location,
          matchScore: college.match_score,
          userEmail: user?.email,
        }),
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
    const collegeId = college.name.toLowerCase().replace(/ /g, "-");
    router.push(`/colleges/${collegeId}`);
  };

  const handleFinish = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/groq-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentProfile: formData }),
      });
      
      if (!res.ok) throw new Error("Groq API call failed");
      const collegesData = await res.json();

      if (user && Array.isArray(collegesData) && collegesData.length > 0) {
        await addDoc(collection(db, "interviews", user.uid, "sessions"), {
          timestamp: serverTimestamp(),
          createdAt: new Date().toISOString(),
          studentProfile: formData,
          results: collegesData,
          topCollege: collegesData[0]?.name ?? 'Unknown',
          totalResults: collegesData.length,
        });
      }

      sessionStorage.setItem('eduanalytics_results', JSON.stringify(collegesData));
      sessionStorage.setItem('eduanalytics_profile', JSON.stringify(formData));

      setColleges(collegesData);
      setStep(10); 
      toast.success("AI Analysis Complete!");
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading || !user) return (
    <div className="min-h-screen bg-[#05071a] flex items-center justify-center">
      <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                <GraduationCap size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Educational Level</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight">Your Academic Path</h2>
              <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">Step 1: Select your target degree level</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                { id: "UG", label: "Undergraduate", desc: "Bachelors / Degree Programs" },
                { id: "PG", label: "Postgraduate", desc: "Masters / Specialized Research" }
              ].map((level) => (
                <motion.div 
                  key={level.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "cursor-pointer transition-all border-2 rounded-[3rem] p-12 text-center relative overflow-hidden backdrop-blur-xl group",
                    formData.courseLevel === level.id 
                        ? "border-indigo-500 bg-indigo-500/10 shadow-2xl shadow-indigo-500/10" 
                        : "border-white/5 bg-white/[0.03] hover:border-white/20"
                  )}
                  onClick={() => { updateForm({ courseLevel: level.id as any }); handleNext(); }}
                >
                  <div className={cn(
                      "h-20 w-20 rounded-3xl mx-auto mb-8 flex items-center justify-center transition-all",
                      formData.courseLevel === level.id ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "bg-white/5 text-white/20 group-hover:bg-white/10"
                  )}>
                    <GraduationCap size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2">{level.label}</h3>
                  <p className="text-white/30 font-bold text-[10px] uppercase tracking-widest leading-relaxed">
                    {level.desc}
                  </p>
                  {formData.courseLevel === level.id && (
                    <div className="absolute top-6 right-6">
                      <div className="h-8 w-8 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                        <Check size={18} />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        );
      case 2:
        const streams = formData.courseLevel === "UG" ? UG_STREAMS : PG_STREAMS;
        return (
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 mb-4">
                <Target size={14} className="text-teal-400" />
                <span className="text-[10px] font-black text-teal-300 uppercase tracking-widest">Field of Interest</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">Choose Your Stream</h2>
              <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">Step 2: Define your specialization</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {streams.map((stream) => (
                <button
                  key={stream}
                  className={cn(
                    "h-20 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all px-6 border backdrop-blur-sm",
                    formData.stream === stream 
                        ? "bg-teal-500/20 text-teal-400 border-teal-500/40 shadow-lg shadow-teal-500/10" 
                        : "bg-white/[0.03] text-white/40 border-white/5 hover:border-white/20"
                  )}
                  onClick={() => { updateForm({ stream }); handleNext(); }}
                >
                  {stream}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-12 max-w-2xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                <MapPin size={14} className="text-amber-400" />
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest">Geographical Preference</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">Your Location</h2>
              <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">Step 3: Residency and target region</p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[3rem] p-12 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                  <MapPin size={240} className="text-amber-500" />
                </div>
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Current State</label>
                    <select 
                        className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white font-bold outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                        value={formData.state}
                        onChange={(e) => updateForm({ state: e.target.value, district: "" })}
                    >
                        {Object.keys(stateDistricts).map(s => <option key={s} value={s} className="bg-[#0a0d14]">{s}</option>)}
                    </select>
                </div>
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Home District</label>
                    <select 
                        className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white font-bold outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                        value={formData.district}
                        onChange={(e) => updateForm({ district: e.target.value })}
                    >
                        <option value="" className="bg-[#0a0d14]">Select District</option>
                        {(stateDistricts[formData.state!] || []).map(d => <option key={d} value={d} className="bg-[#0a0d14]">{d}</option>)}
                    </select>
                </div>
                <button 
                    className="btn-primary w-full h-16 text-lg mt-4 group flex items-center justify-center gap-3"
                    onClick={handleNext} 
                    disabled={!formData.district}
                >
                    Continue Journey <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
          </div>
        );
      case 4:
      case 5:
        const is12th = step === 5;
        const levelKey = is12th ? "12th" : "10th";
        return (
          <div className="space-y-12 max-w-2xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
                <BookOpen size={14} className="text-purple-400" />
                <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">{levelKey} Academic Records</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">{levelKey} Standards</h2>
              <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">Step {step}: Academic performance verification</p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[3rem] p-12 space-y-8 shadow-2xl">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Board of Education</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {BOARDS.map(b => (
                            <button
                                key={b}
                                className={cn(
                                    "h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                    formData[`marks${levelKey}Board`] === b 
                                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40" 
                                      : "bg-white/[0.05] text-white/30 border-white/5 hover:border-white/10"
                                )}
                                onClick={() => updateForm({ [`marks${levelKey}Board`]: b } as any)}
                            >
                                {b}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Total Marks</label>
                        <input 
                            type="number" 
                            className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white text-2xl font-black outline-none focus:border-purple-500/50"
                            value={formData[`marks${levelKey}`]}
                            onChange={(e) => updateForm({ [`marks${levelKey}`]: Number(e.target.value) } as any)}
                            placeholder={is12th ? "600" : "500"}
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Percentage (%)</label>
                        <input 
                            type="number" 
                            className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white text-2xl font-black outline-none focus:border-purple-500/50"
                            value={formData[`percentage${levelKey}`]}
                            onChange={(e) => updateForm({ [`percentage${levelKey}`]: Number(e.target.value) } as any)}
                            placeholder="95"
                        />
                    </div>
                </div>
                <button 
                    className="btn-primary w-full h-16 text-lg mt-4 flex items-center justify-center gap-3"
                    onClick={handleNext} 
                    disabled={!formData[`marks${levelKey}`] || !formData[`percentage${levelKey}`]}
                >
                    Continue <ChevronRight size={20} />
                </button>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-12 max-w-2xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Competitive Edge</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">Further Details</h2>
              <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">Step 6: Specialized scores</p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[3rem] p-12 space-y-8 shadow-2xl">
                {formData.courseLevel === "PG" ? (
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">UG CGPA (Out of 10)</label>
                        <input 
                            type="number" 
                            step="0.01"
                            className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white text-3xl font-black outline-none focus:border-indigo-500/50 text-center"
                            value={formData.ugCgpa}
                            onChange={(e) => updateForm({ ugCgpa: Number(e.target.value) })}
                            placeholder="8.5"
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Cutoff Mark (Entrance)</label>
                        <input 
                            type="number" 
                            step="0.01"
                            className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white text-3xl font-black outline-none focus:border-indigo-500/50 text-center"
                            value={formData.cutoffMark}
                            onChange={(e) => updateForm({ cutoffMark: Number(e.target.value) })}
                            placeholder="e.g. 185.5"
                        />
                    </div>
                )}
                
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Analysis Strategy</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { val: "-10", label: "Safety", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
                            { val: "exact", label: "Exact", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
                            { val: "+10", label: "Dream", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" }
                        ].map((r) => (
                            <button
                                key={r.val}
                                className={cn(
                                    "h-16 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all border",
                                    formData.cutoffRange === r.val 
                                      ? `${r.bg} ${r.color} ${r.border} shadow-lg` 
                                      : "bg-white/[0.03] text-white/30 border-white/5 hover:border-white/10"
                                )}
                                onClick={() => updateForm({ cutoffRange: r.val as any })}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    className="btn-primary w-full h-16 text-lg mt-4 flex items-center justify-center gap-3"
                    onClick={handleNext} 
                >
                    Continue <ChevronRight size={20} />
                </button>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-12 max-w-2xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
                <Users size={14} className="text-blue-400" />
                <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Demographics</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">Social Profile</h2>
              <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">Step 7: Category and background</p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[3rem] p-12 space-y-8 shadow-2xl">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Admission Category (Quota)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {QUOTAS.map(q => (
                            <button
                                key={q}
                                className={cn(
                                    "h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                    formData.quota === q 
                                      ? "bg-blue-500/20 text-blue-300 border-blue-500/40" 
                                      : "bg-white/[0.05] text-white/30 border-white/5 hover:border-white/10"
                                )}
                                onClick={() => updateForm({ quota: q })}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Religion</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {RELIGIONS.map(r => (
                            <button
                                key={r}
                                className={cn(
                                    "h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                    formData.religion === r 
                                      ? "bg-blue-500/20 text-blue-300 border-blue-500/40" 
                                      : "bg-white/[0.05] text-white/30 border-white/5 hover:border-white/10"
                                )}
                                onClick={() => updateForm({ religion: r })}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
                <button 
                    className="btn-primary w-full h-16 text-lg mt-4 flex items-center justify-center gap-3"
                    onClick={handleNext} 
                >
                    Continue <ChevronRight size={20} />
                </button>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-12 max-w-2xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                <Wallet size={14} className="text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Financial Alignment</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">Budget Policy</h2>
              <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">Step 8: Institutional type preference</p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[3rem] p-12 space-y-4 shadow-2xl">
                {["Government", "Private", "Both"].map((b) => (
                    <button
                      key={b}
                      className={cn(
                          "h-20 w-full rounded-[2rem] text-xl font-black uppercase tracking-widest transition-all border",
                          formData.budget === b 
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg" 
                            : "bg-white/[0.03] text-white/30 border-white/5 hover:border-white/10"
                      )}
                      onClick={() => { updateForm({ budget: b as any }); handleNext(); }}
                    >
                      {b}
                    </button>
                ))}
            </div>
          </div>
        );
      case 9:
        return (
          <div className="space-y-12 max-w-2xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">AI Synthesis</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">Ready for Analysis?</h2>
              <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">Step 9: Final predictive processing</p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[3.5rem] p-14 text-center space-y-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-teal-500" />
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />
                  <Sparkles className="h-24 w-24 text-indigo-400 mx-auto animate-pulse relative z-10" />
                </div>
                <div className="space-y-3">
                    <h3 className="text-3xl font-black text-white tracking-tight">AI Engine Primed</h3>
                    <p className="text-white/40 font-medium leading-relaxed max-w-xs mx-auto text-sm">
                        Our advanced matching engine is ready to process your academic profile against 2,500+ top institutions.
                    </p>
                </div>
                <button 
                    className="btn-primary w-full h-20 text-2xl group flex items-center justify-center gap-4" 
                    onClick={handleFinish}
                    disabled={analyzing}
                >
                    {analyzing ? (
                      <Loader2 className="animate-spin" size={32} />
                    ) : (
                      <Zap size={28} className="group-hover:rotate-12 transition-transform" />
                    )}
                    <span>{analyzing ? "AI is Analyzing Profile..." : "Execute AI Search"}</span>
                </button>
            </div>
          </div>
        );
      case 10:
        return (
          <div className="space-y-16">
            <div className="text-center space-y-6">
              <div className="h-24 w-24 bg-teal-500/10 rounded-[2.5rem] border border-teal-500/20 flex items-center justify-center text-teal-400 mx-auto shadow-2xl mb-8 relative">
                <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-full" />
                <Sparkles size={48} className="animate-pulse relative z-10" />
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase">AI Match Analysis</h2>
              <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-[11px] leading-relaxed max-w-xl mx-auto">
                Based on your <span className="text-teal-400">{formData.courseLevel} {formData.stream}</span> profile, we discovered <span className="text-indigo-400">{colleges.length} matches</span> tailored to your performance.
              </p>
              
              <div className="pt-8 flex flex-col md:flex-row justify-center gap-4">
                <button
                  onClick={() => generatePDFReport({
                    studentName: profile?.fullName || 'Student',
                    marks: formData.cutoffMark || formData.ugCgpa || 0,
                    category: formData.quota || 'General',
                    course: formData.stream || 'Any',
                    aiSummary: `Based on your academic profile with ${formData.cutoffMark || formData.ugCgpa} scores in ${formData.stream}, we have analyzed ${colleges.length} colleges that best match your preferences. Focus on high-match-score institutions for optimized admission probability.`,
                    safeColleges: colleges.filter(c => (c.match_score || 0) > 80),
                    moderateColleges: colleges.filter(c => (c.match_score || 0) > 60 && (c.match_score || 0) <= 80),
                    reachColleges: colleges.filter(c => (c.match_score || 0) <= 60),
                  })}
                  className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-white/[0.05] border border-white/10 text-teal-400 font-black text-[10px] uppercase tracking-widest hover:bg-white/[0.1] hover:-translate-y-1 transition-all shadow-xl shadow-teal-500/5"
                >
                  <FileDown size={18} />
                  Download Analysis Intelligence (PDF)
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[1400px] mx-auto">
              {colleges.map((college, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  onClick={() => handleCollegeClick(college)}
                  className="cursor-pointer group"
                >
                  <div className="h-full bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-[3rem] p-10 hover:border-indigo-500/30 transition-all relative overflow-hidden flex flex-col shadow-2xl">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12 pointer-events-none group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                        <GraduationCap size={200} className="text-indigo-500" />
                    </div>
                    
                    <div className="relative z-10 flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-6 mb-8">
                        <div className="space-y-2 flex-1">
                          <h3 className="text-3xl font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight line-clamp-2 leading-tight">{college.name}</h3>
                          <div className="flex items-center gap-2 text-white/30">
                             <MapPin size={14} className="text-indigo-500" />
                             <span className="text-[10px] font-black uppercase tracking-widest">{college.location}, {college.state}</span>
                          </div>
                        </div>
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-[1.5rem] p-4 text-center min-w-[90px] backdrop-blur-md">
                          <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">AI Match</div>
                          <div className={cn(
                            "text-2xl font-black",
                            college.match_score > 80 ? "text-teal-400" : college.match_score > 60 ? "text-amber-400" : "text-red-400"
                          )}>
                            {college.match_score}%
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-8">
                        {[college.type, college.level || "UG", `Rank #${college.nirf_rank || "N/A"}`].map((tag, i) => (
                          <span key={i} className="px-3 py-1 bg-white/[0.05] rounded-lg text-[9px] font-black text-white/40 border border-white/5 uppercase tracking-wider">{tag}</span>
                        ))}
                      </div>

                      <div className="p-8 rounded-[2rem] bg-indigo-500/[0.03] border border-indigo-500/10 mb-10 flex-1 relative overflow-hidden group/box">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/40" />
                        <p className="text-[9px] font-black text-indigo-400/50 uppercase tracking-widest mb-4">AI Reason for Selection</p>
                        <p className="text-white/60 font-medium italic text-base leading-relaxed">
                            "{college.why_fit}"
                        </p>
                      </div>
                      
                      <div className="mt-auto pt-8 border-t border-white/5">
                        <div className="flex gap-4">
                          <button 
                            className="flex-1 h-14 bg-white/[0.05] border border-white/10 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/[0.1] transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCollegeClick(college);
                            }}
                          >
                            Technical Breakdown
                          </button>
                          <Link href="/dashboard/contact" className="flex-1" onClick={(e) => e.stopPropagation()}>
                            <button className="w-full h-14 bg-indigo-600 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all">
                                Direct Admission
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center py-20">
              <button 
                className="inline-flex items-center gap-3 px-10 py-5 bg-white/[0.05] border border-white/10 rounded-2xl text-white/40 font-black text-[10px] uppercase tracking-widest hover:bg-white/[0.1] hover:text-white transition-all"
                onClick={() => router.push("/dashboard")}
              >
                <History size={16} />
                Return to Analysis Command Center
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#05071a] text-white relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-teal-500/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-6 py-16 max-w-5xl relative z-10">
      {step < 10 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-24"
        >
          <div className="flex justify-between items-center mb-10">
            <button 
                onClick={handleBack} 
                disabled={step === 1} 
                className="flex items-center gap-2 text-white/20 font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-all disabled:opacity-0"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <div className="flex flex-col items-center">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-1">Process Progress</span>
                <span className="text-white font-black text-xl tracking-tighter">{step} <span className="text-white/20 font-medium">/</span> {totalSteps}</span>
            </div>
            <button 
                onClick={handleNext} 
                disabled={step === totalSteps}
                className="flex items-center gap-2 text-white/20 font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-all disabled:opacity-0"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
      </div>
    </div>
  );
}
