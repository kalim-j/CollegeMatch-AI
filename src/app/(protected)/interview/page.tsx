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
  Zap, ArrowRight, FileDown, History, GitCompareArrows
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, setDoc, increment, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { stateDistricts } from "@/data/stateDistricts";
import { College, StudentProfile } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ShareCard from "@/components/ShareCard";

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
    marks10thOutOf: 500,
    marks10th: "",
    percentage10th: 0,
    marks10thGrade: "A",
    useCgpa10: false,
    cgpa10: "",
    marks12thBoard: "State Board",
    marks12thOutOf: 600,
    marks12th: "",
    percentage12th: 0,
    marks12thGrade: "A",
    useCgpa12: false,
    cgpa12: "",
    marks12SubjectWise: false,
    marks12Subjects: { subject1: 0, subject2: 0, subject3: 0, subject4: 0, subject5: 0, subject6: 0 },
    ugCgpa: "",
    cutoffMark: "",
    physicsMark: "",
    chemistryMark: "",
    mathsMark: "",
    manualCutoffMode: false,
    cutoffRange: "exact",
    budget: "Both",
    quota: "General",
    religion: "Hindu"
  });

  const [colleges, setColleges] = useState<College[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [noCollegesInDistrict, setNoCollegesInDistrict] = useState(false);
  const [searchScope, setSearchScope] = useState<string>("");
  const [compareList, setCompareList] = useState<College[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentRating, setCurrentRating] = useState<string | null>(null);

  const handleRating = async (rating: "happy" | "bad") => {
    if (!user || !currentSessionId) return;
    try {
      await updateDoc(doc(db, "interviews", user.uid, "sessions", currentSessionId), {
        rating,
        ratingTimestamp: serverTimestamp()
      });

      const statsRef = doc(db, "publicStats", "ratings");
      await updateDoc(statsRef, {
        happyCount: rating === "happy" ? increment(1) : increment(0),
        badCount: rating === "bad" ? increment(1) : increment(0),
        totalCount: increment(1)
      }).catch(async (err) => {
        if (err.code === 'not-found') {
          await setDoc(statsRef, {
            happyCount: rating === "happy" ? 1 : 0,
            badCount: rating === "bad" ? 1 : 0,
            totalCount: 1
          });
        }
      });

      setCurrentRating(rating);
      toast.success("Thank you for your feedback!");
    } catch (error) {
      console.error("Failed to save feedback:", error);
      toast.error("Failed to save feedback");
    }
  };

  // 10th Marks Calculation
  useEffect(() => {
    let p = 0;
    if (formData.marks10thBoard === 'IGCSE') {
      const gradeMap: any = { 'A*': 95, 'A': 85, 'B': 75, 'C': 65, 'D': 55 };
      p = gradeMap[formData.marks10thGrade] || 0;
    } else if (formData.useCgpa10 && formData.marks10thBoard === 'CBSE') {
      p = (Number(formData.cgpa10) || 0) * 9.5;
    } else {
      const outOf = formData.marks10thOutOf || 500;
      p = Math.round(((Number(formData.marks10th) || 0) / outOf) * 100 * 10) / 10;
    }
    if (formData.percentage10th !== p) updateForm({ percentage10th: p });
  }, [formData.marks10thBoard, formData.marks10th, formData.marks10thOutOf, formData.marks10thGrade, formData.useCgpa10, formData.cgpa10]);

  // 12th Marks Calculation
  useEffect(() => {
    let p = 0;
    if (formData.marks12thBoard === 'IGCSE') {
      const gradeMap: any = { 'A*': 95, 'A': 85, 'B': 75, 'C': 65, 'D': 55 };
      p = gradeMap[formData.marks12thGrade] || 0;
    } else if (formData.useCgpa12 && formData.marks12thBoard === 'CBSE') {
      p = (Number(formData.cgpa12) || 0) * 9.5;
    } else {
      const outOf = formData.marks12thOutOf || 600;
      p = Math.round(((Number(formData.marks12th) || 0) / outOf) * 100 * 10) / 10;
    }
    if (formData.percentage12th !== p) updateForm({ percentage12th: p });
  }, [formData.marks12thBoard, formData.marks12th, formData.marks12thOutOf, formData.marks12thGrade, formData.useCgpa12, formData.cgpa12]);

  // Subject-wise sum for 12th
  useEffect(() => {
    if (formData.marks12SubjectWise) {
      const s = formData.marks12Subjects;
      const total = (Number(s.subject1)||0) + (Number(s.subject2)||0) + (Number(s.subject3)||0) + (Number(s.subject4)||0) + (Number(s.subject5)||0) + (Number(s.subject6)||0);
      if (formData.marks12th !== total) updateForm({ marks12th: total });
    }
  }, [formData.marks12Subjects, formData.marks12SubjectWise]);

  // Cutoff calculation
  useEffect(() => {
    if (!formData.manualCutoffMode) {
      const m = Number(formData.mathsMark) || 0;
      const p = Number(formData.physicsMark) || 0;
      const c = Number(formData.chemistryMark) || 0;
      if (m > 0 || p > 0 || c > 0) {
        const cutoff = m + (p / 2) + (c / 2);
        const rounded = Math.round(cutoff * 10) / 10;
        if (formData.cutoffMark !== rounded) updateForm({ cutoffMark: rounded });
      }
    }
  }, [formData.mathsMark, formData.physicsMark, formData.chemistryMark, formData.manualCutoffMode]);


  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const streamParam = urlParams.get('stream');
      const sessionStream = sessionStorage.getItem('selectedStream');
      const fromDiscover = urlParams.get('fromDiscover');
      
      const prefilledStream = streamParam || sessionStream;
      if (prefilledStream) {
        setFormData((prev: any) => ({ ...prev, stream: prefilledStream }));
        if (fromDiscover === 'true' || streamParam) {
          setStep(3); // Skip straight to location step since stream is known
        }
      }
    }
  }, []);

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

  const handleToggleCompare = (e: React.MouseEvent, college: College) => {
    e.stopPropagation();
    setCompareList((prev) => {
      const isSelected = prev.some((c) => c.name === college.name);
      if (isSelected) {
        return prev.filter((c) => c.name !== college.name);
      }
      if (prev.length >= 3) return prev;
      return [...prev, college];
    });
  };

  const handleCompareNow = () => {
    sessionStorage.setItem("compareColleges", JSON.stringify(compareList));
    router.push("/dashboard/compare");
  };

  const handleFinish = async (searchOtherStates = false) => {
    setAnalyzing(true);
    setNoCollegesInDistrict(false);
    try {
      const res = await fetch("/api/groq-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          studentProfile: formData,
          searchOtherStates 
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "College matching failed");
      }
      const data = await res.json();

      // Check if no colleges found in district
      if (data.noCollegesInDistrict) {
        setNoCollegesInDistrict(true);
        setAnalyzing(false);
        toast.error(`No colleges found in ${formData.district} district`);
        return;
      }

      const collegesData = data.colleges || [];
      setSearchScope(data.searchScope || "district");

      if (user && Array.isArray(collegesData) && collegesData.length > 0) {
        const docRef = await addDoc(collection(db, "interviews", user.uid, "sessions"), {
          timestamp: serverTimestamp(),
          createdAt: new Date().toISOString(),
          studentProfile: formData,
          results: collegesData,
          topCollege: collegesData[0]?.name ?? 'Unknown',
          totalResults: collegesData.length,
          searchScope: data.searchScope
        });
        setCurrentSessionId(docRef.id);
        setCurrentRating(null);
      }

      sessionStorage.setItem('eduanalytics_results', JSON.stringify(collegesData));
      sessionStorage.setItem('eduanalytics_profile', JSON.stringify(formData));

      setColleges(collegesData);
      setStep(10); 
      toast.success(`Found ${collegesData.length} matching colleges!`);
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading || !user) return (
    <div className="min-h-screen bg-[#05071a] flex items-center justify-center">
      <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
    </div>
  );

  
  const getPercentageColor = (p: number) => {
    if (p >= 90) return { color: "text-emerald-400", label: "Excellent", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (p >= 75) return { color: "text-teal-400", label: "Good", bg: "bg-teal-500/10", border: "border-teal-500/20" };
    if (p >= 60) return { color: "text-amber-400", label: "Average", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    return { color: "text-white/40", label: "Keep trying", bg: "bg-white/5", border: "border-white/10" };
  };

  const getCutoffColor = (c: number) => {
    if (c >= 190) return { color: "text-emerald-400", label: "Outstanding", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (c >= 175) return { color: "text-teal-400", label: "Excellent", bg: "bg-teal-500/10", border: "border-teal-500/20" };
    if (c >= 160) return { color: "text-blue-400", label: "Good", bg: "bg-blue-500/10", border: "border-blue-500/20" };
    if (c >= 145) return { color: "text-amber-400", label: "Average", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    return { color: "text-white/40", label: "Needs improvement", bg: "bg-white/5", border: "border-white/10" };
  };

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
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-tight">Your Academic Path</h2>
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter">Choose Your Stream</h2>
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
                  onClick={() => { updateForm({ stream }); }}
                >
                  {stream}
                </button>
              ))}
            </div>
            <div className="flex gap-4 max-w-4xl mx-auto pt-8">
              <button onClick={handleBack} className="btn-ghost flex-1 h-16 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-2">
                <ChevronLeft size={20} /> Back
              </button>
              <button 
                onClick={handleNext} 
                disabled={!formData.stream}
                className="btn-primary flex-[2] h-16 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                Continue <ChevronRight size={20} />
              </button>
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter">Your Location</h2>
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
                <div className="flex gap-4 mt-4">
                  <button onClick={handleBack} className="btn-ghost flex-1 h-16 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <ChevronLeft size={20} /> Back
                  </button>
                  <button 
                      className="btn-primary flex-[2] h-16 text-lg group flex items-center justify-center gap-3 font-black uppercase tracking-widest"
                      onClick={handleNext} 
                      disabled={!formData.district}
                  >
                      Continue <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
            </div>
          </div>
        );
      case 4:
      case 5:
        const is12th = step === 5;
        const levelKey = is12th ? "12th" : "10th";
        const pColor = getPercentageColor(formData[`percentage${levelKey}`] || 0);
        return (
          <div className="space-y-12 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
                <BookOpen size={14} className="text-purple-400" />
                <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">{levelKey} Academic Records</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter">{levelKey} Standards</h2>
              <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">Step {step}: Academic performance verification</p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[3rem] p-12 space-y-8 shadow-2xl">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Board of Education</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {BOARDS.map(b => (
                            <button
                                key={b}
                                className={cn(
                                    "h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                    formData[`marks${levelKey}Board`] === b 
                                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40" 
                                      : "bg-white/[0.05] text-white/30 border-white/5 hover:border-white/10"
                                )}
                                onClick={() => {
                                  let outOf = is12th ? 600 : 500;
                                  if (b === 'ICSE') outOf = 500;
                                  updateForm({ [`marks${levelKey}Board`]: b, [`marks${levelKey}OutOf`]: outOf } as any);
                                }}
                            >
                                {b}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-6">
                        {formData[`marks${levelKey}Board`] === "IGCSE" ? (
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Overall Grade</label>
                              <div className="grid grid-cols-5 gap-2">
                                {['A*', 'A', 'B', 'C', 'D'].map(g => (
                                  <button
                                    key={g}
                                    className={cn("h-14 rounded-xl font-black transition-all border", formData[`marks${levelKey}Grade`] === g ? "bg-purple-500/20 text-purple-300 border-purple-500/40" : "bg-white/5 text-white/30 border-white/5")}
                                    onClick={() => updateForm({ [`marks${levelKey}Grade`]: g } as any)}
                                  >{g}</button>
                                ))}
                              </div>
                           </div>
                        ) : formData[`useCgpa${levelKey}`] && formData[`marks${levelKey}Board`] === "CBSE" ? (
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">CGPA (Out of 10)</label>
                              <input 
                                  type="number" min="0" max="10" step="0.1"
                                  className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white text-2xl font-black outline-none focus:border-purple-500/50"
                                  value={formData[`cgpa${levelKey}`]}
                                  onChange={(e) => updateForm({ [`cgpa${levelKey}`]: e.target.value } as any)}
                                  placeholder="e.g. 9.2"
                              />
                           </div>
                        ) : (
                           <div className="space-y-4">
                              <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Total Marks</label>
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Out of {formData[`marks${levelKey}OutOf`]}</span>
                              </div>
                              <input 
                                  type="number" min="0" max={formData[`marks${levelKey}OutOf`]}
                                  disabled={is12th && formData.marks12SubjectWise}
                                  className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white text-2xl font-black outline-none focus:border-purple-500/50 disabled:opacity-50"
                                  value={formData[`marks${levelKey}`]}
                                  onChange={(e) => updateForm({ [`marks${levelKey}`]: Number(e.target.value) } as any)}
                                  placeholder={`Total out of ${formData[`marks${levelKey}OutOf`]}`}
                              />
                           </div>
                        )}

                        {formData[`marks${levelKey}Board`] === "CBSE" && (
                          <button onClick={() => updateForm({ [`useCgpa${levelKey}`]: !formData[`useCgpa${levelKey}`] } as any)} className="text-[11px] font-bold text-purple-400 hover:text-purple-300">
                            {formData[`useCgpa${levelKey}`] ? "Enter marks instead" : "Enter CGPA instead"}
                          </button>
                        )}

                        {is12th && formData.marks12thBoard !== "IGCSE" && !formData.useCgpa12 && (
                          <button onClick={() => updateForm({ marks12SubjectWise: !formData.marks12SubjectWise } as any)} className="text-[11px] font-bold text-purple-400 hover:text-purple-300 block">
                            {formData.marks12SubjectWise ? "Enter total directly" : "Calculate from subject marks"}
                          </button>
                        )}
                        
                        {is12th && formData.marks12SubjectWise && (
                          <div className="grid grid-cols-2 gap-4 mt-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                            {['Language', 'English', 'Maths/Bio', 'Physics', 'Chemistry', 'Optional'].map((sub, i) => (
                              <div key={i}>
                                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">{sub}</label>
                                <input type="number" min="0" max="100" className="w-full h-10 bg-white/5 rounded-lg px-3 text-white text-sm font-bold outline-none focus:border-purple-500/50 border border-transparent"
                                  value={(formData.marks12Subjects as any)[`subject${i+1}`]}
                                  onChange={e => updateForm({ marks12Subjects: { ...formData.marks12Subjects, [`subject${i+1}`]: Number(e.target.value) } })}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Live Percentage</label>
                        <div className={cn("h-40 rounded-3xl border flex flex-col items-center justify-center p-6 text-center transition-all", pColor.bg, pColor.border)}>
                          <span className={cn("text-5xl font-black tabular-nums tracking-tighter", pColor.color)}>
                            {formData[`percentage${levelKey}`]}%
                          </span>
                          <span className={cn("text-[11px] font-black uppercase tracking-widest mt-2", pColor.color)}>
                            {pColor.label}
                          </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <button onClick={handleBack} className="btn-ghost flex-1 h-16 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <ChevronLeft size={20} /> Back
                  </button>
                  <button 
                      className="btn-primary flex-[2] h-16 text-lg flex items-center justify-center gap-3 font-black uppercase tracking-widest"
                      onClick={() => {
                        if (!formData[`percentage${levelKey}`] || formData[`percentage${levelKey}`] === 0) {
                          toast.error("Please enter your marks");
                          return;
                        }
                        handleNext();
                      }}
                  >
                      Continue <ChevronRight size={20} />
                  </button>
                </div>
            </div>
          </div>
        );
      case 6:
        const cColor = getCutoffColor(formData.cutoffMark || 0);
        return (
          <div className="space-y-12 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Competitive Edge</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter">Your Subject Marks</h2>
              <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">Step 6: We'll calculate your cutoff automatically</p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[3rem] p-12 space-y-8 shadow-2xl">
                
                {formData.courseLevel === "PG" ? (
                    <div className="space-y-4 max-w-xl mx-auto">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">UG CGPA (Out of 10)</label>
                        <input 
                            type="number" step="0.01"
                            className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white text-3xl font-black outline-none focus:border-indigo-500/50 text-center"
                            value={formData.ugCgpa}
                            onChange={(e) => updateForm({ ugCgpa: Number(e.target.value) })}
                            placeholder="8.5"
                        />
                    </div>
                ) : formData.manualCutoffMode ? (
                    <div className="space-y-4 max-w-xl mx-auto text-center">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Manual Cutoff Mark</label>
                        <input 
                            type="number" step="0.01"
                            className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white text-3xl font-black outline-none focus:border-indigo-500/50 text-center"
                            value={formData.cutoffMark}
                            onChange={(e) => updateForm({ cutoffMark: Number(e.target.value) })}
                            placeholder="e.g. 185.5"
                        />
                        <button onClick={() => updateForm({ manualCutoffMode: false })} className="text-[11px] font-bold text-indigo-400 mt-2">Calculate from subject marks instead</button>
                    </div>
                ) : (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-3xl bg-white/5 border border-white/5 p-6 space-y-3">
                          <div>
                            <h4 className="font-black text-white text-lg">Mathematics</h4>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Out of 100</p>
                          </div>
                          <input type="number" min="0" max="100" className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-black text-xl outline-none focus:border-indigo-500/50" value={formData.mathsMark} onChange={e => updateForm({ mathsMark: Number(e.target.value) })} />
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-white/40">× 1 (full)</span>
                            <span className="text-indigo-400">{formData.mathsMark || 0} marks</span>
                          </div>
                        </div>
                        <div className="rounded-3xl bg-white/5 border border-white/5 p-6 space-y-3">
                          <div>
                            <h4 className="font-black text-white text-lg">Physics</h4>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Out of 100</p>
                          </div>
                          <input type="number" min="0" max="100" className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-black text-xl outline-none focus:border-indigo-500/50" value={formData.physicsMark} onChange={e => updateForm({ physicsMark: Number(e.target.value) })} />
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-white/40">÷ 2 (half)</span>
                            <span className="text-indigo-400">{((Number(formData.physicsMark)||0)/2).toFixed(1)} marks</span>
                          </div>
                        </div>
                        <div className="rounded-3xl bg-white/5 border border-white/5 p-6 space-y-3">
                          <div>
                            <h4 className="font-black text-white text-lg">Chemistry</h4>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Out of 100</p>
                          </div>
                          <input type="number" min="0" max="100" className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-black text-xl outline-none focus:border-indigo-500/50" value={formData.chemistryMark} onChange={e => updateForm({ chemistryMark: Number(e.target.value) })} />
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-white/40">÷ 2 (half)</span>
                            <span className="text-indigo-400">{((Number(formData.chemistryMark)||0)/2).toFixed(1)} marks</span>
                          </div>
                        </div>
                      </div>

                      <div className={cn("rounded-3xl border flex flex-col md:flex-row items-center justify-between p-8 transition-all", cColor.bg, cColor.border)}>
                        <div className="text-center md:text-left mb-4 md:mb-0">
                          <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", cColor.color)}>Calculated TNEA Cutoff</p>
                          <p className="text-white/50 text-xs font-mono font-bold tracking-tight">
                            {formData.mathsMark||0} + {((Number(formData.physicsMark)||0)/2).toFixed(1)} + {((Number(formData.chemistryMark)||0)/2).toFixed(1)} = 
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={cn("text-5xl md:text-6xl font-black tabular-nums tracking-tighter leading-none", cColor.color)}>
                            {formData.cutoffMark || 0}
                          </span>
                          <span className={cn("px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest mt-3", cColor.color, cColor.border, cColor.bg)}>
                            {cColor.label}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <button onClick={() => updateForm({ manualCutoffMode: true })} className="text-[11px] font-bold text-white/40 hover:text-white/80 transition-colors">
                          I know my cutoff directly &rarr;
                        </button>
                      </div>
                    </div>
                )}
                
                <div className="space-y-4 pt-8 border-t border-white/5">
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

                <div className="flex gap-4 mt-4">
                  <button onClick={handleBack} className="btn-ghost flex-1 h-16 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <ChevronLeft size={20} /> Back
                  </button>
                  <button 
                      className="btn-primary flex-[2] h-16 text-lg flex items-center justify-center gap-3 font-black uppercase tracking-widest"
                      onClick={() => {
                        if (!formData.cutoffMark && formData.courseLevel !== "PG") {
                          toast.error("Please enter or calculate your cutoff");
                          return;
                        }
                        handleNext();
                      }} 
                  >
                      Continue <ChevronRight size={20} />
                  </button>
                </div>
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter">Social Profile</h2>
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
                <div className="flex gap-4 mt-4">
                  <button onClick={handleBack} className="btn-ghost flex-1 h-16 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <ChevronLeft size={20} /> Back
                  </button>
                  <button 
                      className="btn-primary flex-[2] h-16 text-lg flex items-center justify-center gap-3 font-black uppercase tracking-widest"
                      onClick={handleNext} 
                  >
                      Continue <ChevronRight size={20} />
                  </button>
                </div>
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter">Budget Policy</h2>
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
                      onClick={() => { updateForm({ budget: b as any }); }}
                    >
                      {b}
                    </button>
                ))}
                <div className="flex gap-4 pt-4">
                  <button onClick={handleBack} className="btn-ghost flex-1 h-16 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <ChevronLeft size={20} /> Back
                  </button>
                  <button 
                    onClick={handleNext} 
                    disabled={!formData.budget}
                    className="btn-primary flex-[2] h-16 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    Continue <ChevronRight size={20} />
                  </button>
                </div>
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter">Ready for Analysis?</h2>
              <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">Step 9: Final predictive processing</p>
            </div>
            
            {noCollegesInDistrict ? (
              <div className="bg-amber-500/10 backdrop-blur-2xl border border-amber-500/20 rounded-[3.5rem] p-14 text-center space-y-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500/20 blur-[60px] rounded-full pointer-events-none" />
                  <MapPin className="h-24 w-24 text-amber-400 mx-auto relative z-10" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-white tracking-tight">No Colleges Found in {formData.district}</h3>
                  <p className="text-white/60 font-medium leading-relaxed max-w-md mx-auto text-base">
                    We couldn't find any colleges matching your criteria in <span className="text-amber-400 font-bold">{formData.district} district</span>. 
                    Would you like to explore colleges from other states?
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <button 
                    className="btn-primary h-20 text-xl group flex items-center justify-center gap-4" 
                    onClick={() => handleFinish(true)}
                    disabled={analyzing}
                  >
                    {analyzing ? (
                      <Loader2 className="animate-spin" size={28} />
                    ) : (
                      <Target size={28} className="group-hover:scale-110 transition-transform" />
                    )}
                    <span>{analyzing ? "Searching All States..." : "Search Colleges from Other States"}</span>
                  </button>
                  <button 
                    onClick={handleBack} 
                    className="btn-ghost h-16 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={24} /> Change District
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[3.5rem] p-14 text-center space-y-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-teal-500" />
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />
                  <Sparkles className="h-24 w-24 text-indigo-400 mx-auto animate-pulse relative z-10" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-white tracking-tight">AI Engine Primed</h3>
                  <p className="text-white/40 font-medium leading-relaxed max-w-xs mx-auto text-sm">
                    Our advanced matching engine is ready to process your academic profile against real colleges with verified fee structures.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button onClick={handleBack} className="btn-ghost flex-1 h-20 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <ChevronLeft size={24} /> Back
                  </button>
                  <button 
                    className="btn-primary flex-[3] h-20 text-2xl group flex items-center justify-center gap-4" 
                    onClick={() => handleFinish(false)}
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
            )}
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase">AI Match Analysis</h2>
              <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-[11px] leading-relaxed max-w-xl mx-auto">
                Based on your <span className="text-teal-400">{formData.courseLevel} {formData.stream}</span> profile, we discovered <span className="text-indigo-400">{colleges.length} matches</span> tailored to your performance.
              </p>
              
              {searchScope && (
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <MapPin size={16} className="text-amber-400" />
                  <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest">
                    {searchScope === "district" && `Showing colleges in ${formData.district} district`}
                    {searchScope === "state" && `Showing colleges in ${formData.state} state`}
                    {searchScope === "all_states" && "Showing colleges from all states"}
                  </span>
                </div>
              )}
              
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
              {colleges.map((college, idx) => {
                const isSelected = compareList.some((c) => c.name === college.name);
                const isDisabled = !isSelected && compareList.length >= 3;
                return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  onClick={() => handleCollegeClick(college)}
                  className="cursor-pointer group relative"
                >
                  {/* Compare checkbox overlay */}
                  <button
                    onClick={(e) => handleToggleCompare(e, college)}
                    disabled={isDisabled}
                    title={isDisabled ? "Max 3 colleges can be compared" : isSelected ? "Remove from comparison" : "Add to comparison"}
                    className={cn(
                      "absolute top-4 right-4 z-20 h-8 w-8 rounded-xl border-2 flex items-center justify-center transition-all shadow-lg",
                      isSelected
                        ? "bg-indigo-500 border-indigo-400 text-white shadow-indigo-500/30"
                        : isDisabled
                        ? "bg-white/[0.03] border-white/10 text-white/20 cursor-not-allowed"
                        : "bg-white/[0.05] border-white/20 text-white/40 hover:border-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300"
                    )}
                  >
                    {isSelected && <Check size={14} />}
                  </button>

                  <div className={cn(
                    "h-full bg-white/[0.02] backdrop-blur-2xl border rounded-[3rem] p-10 transition-all relative overflow-hidden flex flex-col shadow-2xl",
                    isSelected
                      ? "border-indigo-500/50 shadow-indigo-500/10"
                      : "border-white/5 hover:border-indigo-500/30"
                  )}>
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12 pointer-events-none group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                        <GraduationCap size={200} className="text-indigo-500" />
                    </div>
                    
                    <div className="relative z-10 flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-6 mb-8">
                        <div className="space-y-2 flex-1 pr-8">
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight line-clamp-2 leading-tight">{college.name}</h3>
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

                      <div className="flex flex-wrap gap-2 mb-6">
                        {[college.type, college.level || "UG", `Rank #${college.nirf_rank || "N/A"}`].map((tag, i) => (
                          <span key={i} className="px-3 py-1 bg-white/[0.05] rounded-lg text-[9px] font-black text-white/40 border border-white/5 uppercase tracking-wider">{tag}</span>
                        ))}
                      </div>

                      {/* Fee Structure Display */}
                      <div className="mb-6 p-6 rounded-[2rem] bg-emerald-500/[0.05] border border-emerald-500/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[9px] font-black text-emerald-400/50 uppercase tracking-widest mb-1">Total Fees</p>
                            <p className="text-2xl font-black text-emerald-400">{college.fees_approx || "Contact College"}</p>
                          </div>
                          <Wallet size={32} className="text-emerald-500/20" />
                        </div>
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
                );
              })}
            </div>
            
            {/* Rating Section */}
            {colleges.length > 0 && currentSessionId && (
              <div className="max-w-2xl mx-auto mb-8">
                <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-[3rem] p-10 text-center space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white tracking-tight">Are you happy with these results?</h3>
                    <p className="text-white/30 font-bold text-[10px] uppercase tracking-widest">
                      Your feedback helps improve our matching accuracy
                    </p>
                  </div>
                  {currentRating ? (
                    <div className="flex flex-col items-center justify-center py-4 space-y-2">
                      <span className="text-4xl">{currentRating === "happy" ? "😊" : "😢"}</span>
                      <p className="text-sm font-bold text-teal-400">
                        {currentRating === "happy" 
                          ? "Awesome! We're glad you liked the matches." 
                          : "Thanks for letting us know. We will continuously work to improve our database."}
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-4 justify-center pt-2">
                      <button
                        onClick={() => handleRating("happy")}
                        className="flex items-center gap-3 px-8 py-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl text-teal-400 font-black text-xs uppercase tracking-widest hover:bg-teal-500 hover:text-white transition-all duration-300 group"
                      >
                        <span className="text-lg group-hover:scale-125 transition-transform duration-300">😊</span> Happy
                      </button>
                      <button
                        onClick={() => handleRating("bad")}
                        className="flex items-center gap-3 px-8 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-300 group"
                      >
                        <span className="text-lg group-hover:scale-125 transition-transform duration-300">😢</span> Bad
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Share Card Section */}
            {colleges.length > 0 && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-[3rem] p-10 space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-black text-white tracking-tight">Share Your Results</h3>
                    <p className="text-white/30 font-bold text-[10px] uppercase tracking-widest">
                      Download your match card or share with friends
                    </p>
                  </div>
                  <ShareCard
                    colleges={colleges}
                    studentName={profile?.fullName}
                    stream={formData.stream}
                    state={formData.state}
                  />
                </div>
              </div>
            )}

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

      {/* Floating Compare Bar */}
      <AnimatePresence>
        {compareList.length >= 2 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
          >
            <div className="flex items-center justify-between gap-4 px-6 py-4 rounded-[2rem] bg-indigo-600/90 backdrop-blur-xl border border-indigo-400/30 shadow-2xl shadow-indigo-500/30">
              <div className="flex items-center gap-3">
                <GitCompareArrows size={20} className="text-indigo-200 shrink-0" />
                <span className="text-white font-black text-sm uppercase tracking-widest">
                  Comparing {compareList.length} college{compareList.length > 1 ? "s" : ""}
                </span>
              </div>
              <button
                onClick={handleCompareNow}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg shrink-0"
              >
                Compare now <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
