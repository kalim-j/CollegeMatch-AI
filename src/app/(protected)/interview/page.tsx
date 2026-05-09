"use client";

import { useState, useEffect } from "react";
import { generatePDFReport } from '@/lib/generateReport';
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { stateDistricts } from "@/data/stateDistricts";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, GraduationCap, Sparkles, MapPin, Award, BookOpen, Wallet, Users, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { College, StudentProfile } from "@/types";
import { Progress } from "@/components/ui/progress";
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
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleCollegeClick = async (college: College) => {
    // Send notification (Email + SMS)
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

    // Navigate to college detail page
    // Using a slug-friendly version of the name or an ID if available
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
      console.error("EduAnalytics error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading || !user) return null;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-12">
            <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-6xl font-black text-white font-syne uppercase tracking-tighter">Academic Path</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Step 1: Your target educational level</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {["UG", "PG"].map((level) => (
                <motion.div 
                  key={level}
                  whileHover={{ scale: 1.02, translateY: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "cursor-pointer transition-all border-2 rounded-[3.5rem] p-12 text-center relative overflow-hidden group",
                    formData.courseLevel === level 
                        ? "border-purple-500 bg-purple-500/10 shadow-[0_20px_50px_rgba(124,92,252,0.2)]" 
                        : "border-white/5 bg-[#111520] hover:border-white/20"
                  )}
                  onClick={() => { updateForm({ courseLevel: level as any }); handleNext(); }}
                >
                  <div className={cn(
                      "h-20 w-20 rounded-3xl mx-auto mb-8 flex items-center justify-center transition-all",
                      formData.courseLevel === level ? "bg-purple-500 text-white" : "bg-white/5 text-slate-500 group-hover:bg-white/10"
                  )}>
                    <GraduationCap size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2">{level}</h3>
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">
                    {level === "UG" ? "Undergraduate / Degree" : "Postgraduate / Master"}
                  </p>
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
                <h2 className="text-4xl md:text-6xl font-black text-white font-syne uppercase tracking-tighter">Your Stream</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Step 2: Field of study</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {streams.map((stream) => (
                <button
                  key={stream}
                  className={cn(
                    "h-16 rounded-2xl text-xs font-black uppercase tracking-widest transition-all px-4",
                    formData.stream === stream 
                        ? "bg-purple-500 text-white shadow-xl shadow-purple-500/20" 
                        : "bg-white/5 text-slate-400 border border-white/5 hover:border-white/20"
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
                <h2 className="text-4xl md:text-6xl font-black text-white font-syne uppercase tracking-tighter">Location</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Step 3: Residency details</p>
            </div>
            <div className="bg-[#111520] border border-white/5 rounded-[3.5rem] p-10 md:p-16 space-y-8">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">State</label>
                    <select 
                        className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-white font-bold outline-none focus:border-purple-500 appearance-none cursor-pointer"
                        value={formData.state}
                        onChange={(e) => updateForm({ state: e.target.value, district: "" })}
                    >
                        {Object.keys(stateDistricts).map(s => <option key={s} value={s} className="bg-[#111520]">{s}</option>)}
                    </select>
                </div>
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">District</label>
                    <select 
                        className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-white font-bold outline-none focus:border-purple-500 appearance-none cursor-pointer"
                        value={formData.district}
                        onChange={(e) => updateForm({ district: e.target.value })}
                    >
                        <option value="" className="bg-[#111520]">Select District</option>
                        {(stateDistricts[formData.state!] || []).map(d => <option key={d} value={d} className="bg-[#111520]">{d}</option>)}
                    </select>
                </div>
                <button 
                    className="w-full h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white font-black text-lg shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2"
                    onClick={handleNext} 
                    disabled={!formData.district}
                >
                    Continue <ChevronRight size={20} />
                </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-12 max-w-2xl mx-auto">
            <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-6xl font-black text-white font-syne uppercase tracking-tighter">10th Standard</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Step 4: Primary education</p>
            </div>
            <div className="bg-[#111520] border border-white/5 rounded-[3.5rem] p-10 md:p-16 space-y-8">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Board of Education</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {BOARDS.map(b => (
                            <button
                                key={b}
                                className={cn(
                                    "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    formData.marks10thBoard === b ? "bg-purple-500 text-white" : "bg-white/5 text-slate-400 border border-white/5"
                                )}
                                onClick={() => updateForm({ marks10thBoard: b })}
                            >
                                {b}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Total Marks</label>
                        <input 
                            type="number" 
                            className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-white text-2xl font-black outline-none focus:border-purple-500"
                            value={formData.marks10th}
                            onChange={(e) => updateForm({ marks10th: Number(e.target.value) })}
                            placeholder="e.g. 480"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Percentage (%)</label>
                        <input 
                            type="number" 
                            className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-white text-2xl font-black outline-none focus:border-purple-500"
                            value={formData.percentage10th}
                            onChange={(e) => updateForm({ percentage10th: Number(e.target.value) })}
                            placeholder="96"
                        />
                    </div>
                </div>
                <button 
                    className="w-full h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white font-black text-lg shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2"
                    onClick={handleNext} 
                    disabled={!formData.marks10th || !formData.percentage10th}
                >
                    Continue <ChevronRight size={20} />
                </button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-12 max-w-2xl mx-auto">
            <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-6xl font-black text-white font-syne uppercase tracking-tighter">12th Standard</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Step 5: Higher secondary</p>
            </div>
            <div className="bg-[#111520] border border-white/5 rounded-[3.5rem] p-10 md:p-16 space-y-8">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Board of Education</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {BOARDS.map(b => (
                            <button
                                key={b}
                                className={cn(
                                    "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    formData.marks12thBoard === b ? "bg-purple-500 text-white" : "bg-white/5 text-slate-400 border border-white/5"
                                )}
                                onClick={() => updateForm({ marks12thBoard: b })}
                            >
                                {b}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Total Marks</label>
                        <input 
                            type="number" 
                            className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-white text-2xl font-black outline-none focus:border-purple-500"
                            value={formData.marks12th}
                            onChange={(e) => updateForm({ marks12th: Number(e.target.value) })}
                            placeholder="e.g. 580"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Percentage (%)</label>
                        <input 
                            type="number" 
                            className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-white text-2xl font-black outline-none focus:border-purple-500"
                            value={formData.percentage12th}
                            onChange={(e) => updateForm({ percentage12th: Number(e.target.value) })}
                            placeholder="97"
                        />
                    </div>
                </div>
                <button 
                    className="w-full h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white font-black text-lg shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2"
                    onClick={handleNext} 
                    disabled={!formData.marks12th || !formData.percentage12th}
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
                <h2 className="text-4xl md:text-6xl font-black text-white font-syne uppercase tracking-tighter">Further Details</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Step 6: Additional performance</p>
            </div>
            <div className="bg-[#111520] border border-white/5 rounded-[3.5rem] p-10 md:p-16 space-y-8">
                {formData.courseLevel === "PG" ? (
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">UG CGPA (Out of 10)</label>
                        <input 
                            type="number" 
                            step="0.01"
                            className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-white text-2xl font-black outline-none focus:border-purple-500"
                            value={formData.ugCgpa}
                            onChange={(e) => updateForm({ ugCgpa: Number(e.target.value) })}
                            placeholder="8.5"
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cutoff Mark (Entrance)</label>
                        <input 
                            type="number" 
                            step="0.01"
                            className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-white text-2xl font-black outline-none focus:border-purple-500"
                            value={formData.cutoffMark}
                            onChange={(e) => updateForm({ cutoffMark: Number(e.target.value) })}
                            placeholder="e.g. 185.5"
                        />
                    </div>
                )}
                
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cutoff Range Preference</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { val: "-10", label: "Safety", color: "bg-emerald-500" },
                            { val: "exact", label: "Exact", color: "bg-purple-500" },
                            { val: "+10", label: "Dream", color: "bg-amber-500" }
                        ].map((r) => (
                            <button
                                key={r.val}
                                className={cn(
                                    "h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    formData.cutoffRange === r.val ? `${r.color} text-white` : "bg-white/5 text-slate-400 border border-white/5"
                                )}
                                onClick={() => updateForm({ cutoffRange: r.val as any })}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    className="w-full h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white font-black text-lg shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2"
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
                <h2 className="text-4xl md:text-6xl font-black text-white font-syne uppercase tracking-tighter">Background</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Step 7: Social details</p>
            </div>
            <div className="bg-[#111520] border border-white/5 rounded-[3.5rem] p-10 md:p-16 space-y-8">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Caste / Category</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {QUOTAS.map(q => (
                            <button
                                key={q}
                                className={cn(
                                    "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    formData.quota === q ? "bg-purple-500 text-white" : "bg-white/5 text-slate-400 border border-white/5"
                                )}
                                onClick={() => updateForm({ quota: q })}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Religion</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {RELIGIONS.map(r => (
                            <button
                                key={r}
                                className={cn(
                                    "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    formData.religion === r ? "bg-purple-500 text-white" : "bg-white/5 text-slate-400 border border-white/5"
                                )}
                                onClick={() => updateForm({ religion: r })}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
                <button 
                    className="w-full h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white font-black text-lg shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2"
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
                <h2 className="text-4xl md:text-6xl font-black text-white font-syne uppercase tracking-tighter">Budget</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Step 8: Financial preference</p>
            </div>
            <div className="bg-[#111520] border border-white/5 rounded-[3.5rem] p-10 md:p-16 space-y-8">
                <div className="grid grid-cols-1 gap-4">
                    {["Government", "Private", "Both"].map((b) => (
                        <button
                        key={b}
                        className={cn(
                            "h-16 rounded-2xl text-xl font-black uppercase tracking-widest transition-all",
                            formData.budget === b ? "bg-purple-500 text-white" : "bg-white/5 text-slate-400 border border-white/5"
                        )}
                        onClick={() => { updateForm({ budget: b as any }); handleNext(); }}
                        >
                        {b}
                        </button>
                    ))}
                </div>
            </div>
          </div>
        );
      case 9:
        return (
          <div className="space-y-12 max-w-2xl mx-auto">
            <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-6xl font-black text-white font-syne uppercase tracking-tighter">Ready?</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Step 9: Final analysis</p>
            </div>
            <div className="bg-[#111520] border border-white/5 rounded-[3.5rem] p-10 md:p-16 text-center space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-emerald-500" />
                <Sparkles className="h-20 w-20 text-purple-500 mx-auto animate-pulse" />
                <div className="space-y-2">
                    <h3 className="text-3xl font-black text-white">Analysis Ready</h3>
                    <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-xs mx-auto">
                        Our CollegeMatch-AI is ready to process your academic profile and find your perfect matches.
                    </p>
                </div>
                <button 
                    className="w-full h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl text-white font-black text-2xl shadow-2xl shadow-purple-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3" 
                    onClick={handleFinish}
                    disabled={analyzing}
                >
                    {analyzing ? <Loader2 className="animate-spin" size={32} /> : <Sparkles size={32} />}
                    {analyzing ? "AI is Analyzing..." : "Find My Colleges"}
                </button>
            </div>
          </div>
        );
      case 10:
        return (
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <div className="h-20 w-20 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center text-emerald-400 mx-auto shadow-2xl border border-emerald-500/20 mb-6">
                <Sparkles size={40} className="animate-pulse" />
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white font-syne uppercase tracking-tighter">AI Match Analysis</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm leading-relaxed max-w-lg mx-auto">
                Based on your {formData.courseLevel} profile, we found <span className="text-purple-400">{colleges.length} matches</span> that best fit your criteria.
              </p>
              
              <div className="mt-8 flex flex-col md:flex-row justify-center gap-4">
                <button
                  onClick={() => generatePDFReport({
                    studentName: profile?.fullName || 'Student',
                    marks: formData.cutoffMark || formData.ugCgpa || 0,
                    category: formData.quota || 'General',
                    course: formData.stream || 'Any',
                    aiSummary: `Based on your academic profile with ${formData.cutoffMark || formData.ugCgpa} scores in ${formData.stream}, we have analyzed ${colleges.length} colleges that best match your preferences. We recommend focusing on colleges with higher match scores for better admission probability.`,
                    safeColleges: colleges.filter(c => (c.match_score || 0) > 80),
                    moderateColleges: colleges.filter(c => (c.match_score || 0) > 60 && (c.match_score || 0) <= 80),
                    reachColleges: colleges.filter(c => (c.match_score || 0) <= 60),
                  })}
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-emerald-400 font-black text-xs uppercase tracking-widest hover:bg-white/10 hover:-translate-y-1 transition-all"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download Analysis Report (PDF)
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
              {colleges.map((college, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleCollegeClick(college)}
                  className="cursor-pointer group"
                >
                  <div className="bg-[#111520] border border-white/5 rounded-[2.5rem] p-8 hover:border-purple-500/30 transition-all relative overflow-hidden h-full flex flex-col group shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none">
                        <GraduationCap size={160} className="text-purple-500" />
                    </div>
                    
                    <div className="relative z-10 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-black text-white group-hover:text-purple-400 transition-colors line-clamp-2">{college.name}</h3>
                          <div className="flex items-center gap-2 text-slate-500">
                             <MapPin size={14} className="text-purple-500" />
                             <span className="text-[10px] font-black uppercase tracking-widest">{college.location}, {college.state}</span>
                          </div>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-3 text-center min-w-[70px]">
                          <div className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-1">Match</div>
                          <div className={cn(
                            "text-xl font-black",
                            college.match_score > 80 ? "text-emerald-400" : college.match_score > 60 ? "text-amber-400" : "text-red-400"
                          )}>
                            {college.match_score}%
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-8">
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-slate-400 border border-white/5 uppercase">{college.type}</span>
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-slate-400 border border-white/5 uppercase">{college.level || "UG"}</span>
                        <span className="px-3 py-1 bg-emerald-500/10 rounded-lg text-[9px] font-black text-emerald-400 border border-emerald-500/10 uppercase">Rank #{college.nirf_rank || "N/A"}</span>
                      </div>

                      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 mb-8 flex-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">AI Recommendation</p>
                        <p className="text-slate-300 font-bold italic text-sm leading-relaxed">
                            "{college.why_fit}"
                        </p>
                      </div>
                      
                      <div className="mt-auto pt-6 border-t border-white/5">
                        <div className="flex gap-4">
                          <button 
                            className="flex-1 h-14 bg-white/5 border border-white/10 rounded-xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCollegeClick(college);
                            }}
                          >
                            Full Analysis
                          </button>
                          <Link href="/dashboard/contact" className="flex-1" onClick={(e) => e.stopPropagation()}>
                            <button className="w-full h-14 bg-purple-500 rounded-xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all">
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
            
            <div className="text-center py-12">
              <button 
                className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                onClick={() => router.push("/dashboard")}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {step < 10 && (
        <div className="mb-20">
          <div className="flex justify-between items-center mb-8">
            <button 
                onClick={handleBack} 
                disabled={step === 1} 
                className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all disabled:opacity-0"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em] mb-1">Process</span>
                <span className="text-white font-black text-sm">{step} / {totalSteps}</span>
            </div>
            <button 
                onClick={handleNext} 
                disabled={step === totalSteps}
                className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all disabled:opacity-0"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: "circOut" }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
