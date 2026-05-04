"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { stateDistricts } from "@/data/stateDistricts";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, GraduationCap, Sparkles, MapPin, Award, BookOpen, Wallet, Users } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { College, StudentProfile } from "@/types";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";

const UG_STREAMS = ["Engineering", "Medical", "Arts & Science", "Commerce", "Law", "Agriculture", "Architecture", "Pharmacy", "Nursing", "Education", "Hotel Management", "Design", "MBA (Integrated)", "Other"];
const PG_STREAMS = ["ME/MTech", "MD/MS", "MSc", "MA", "MBA", "MCA", "LLM", "MPharm", "MEd", "Other"];
const QUOTAS = ["BC", "MBC", "OC", "SC/ST", "NRI", "Management", "Sports", "None"];

export default function InterviewPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 9;
  
  const [formData, setFormData] = useState<Partial<StudentProfile>>({
    courseLevel: "UG",
    stream: "",
    state: "Tamil Nadu",
    district: "",
    marks10th: 0,
    percentage10th: 0,
    marks12th: 0,
    percentage12th: 0,
    cutoffMark: 0,
    cutoffRange: "exact",
    budget: "Both",
    quota: "None",
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

  const handleFinish = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch("/api/groq-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentProfile: formData }),
      });
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      setColleges(data);
      
      // Save to Firestore
      if (user) {
        await addDoc(collection(db, "interviews"), {
          uid: user.uid,
          timestamp: serverTimestamp(),
          studentProfile: formData,
          results: data,
        });
      }
      
      setStep(10); // Show results step
      toast.success("AI Analysis Complete!");
    } catch (error: any) {
      toast.error("Analysis failed: " + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading || !user) return null;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">Select your Course Level</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["UG", "PG"].map((level) => (
                <Card 
                  key={level}
                  className={cn(
                    "cursor-pointer transition-all border-2 rounded-3xl p-8 text-center hover:shadow-xl",
                    formData.courseLevel === level ? "border-primary bg-primary/5 shadow-lg" : "border-transparent"
                  )}
                  onClick={() => { updateForm({ courseLevel: level as any }); handleNext(); }}
                >
                  <GraduationCap className={cn("h-12 w-12 mx-auto mb-4", formData.courseLevel === level ? "text-primary" : "text-muted-foreground")} />
                  <h3 className="text-2xl font-bold">{level}</h3>
                  <p className="text-muted-foreground">{level === "UG" ? "Undergraduate (After 12th)" : "Postgraduate (After Degree)"}</p>
                </Card>
              ))}
            </div>
          </div>
        );
      case 2:
        const streams = formData.courseLevel === "UG" ? UG_STREAMS : PG_STREAMS;
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">Select your Stream</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {streams.map((stream) => (
                <Button
                  key={stream}
                  variant={formData.stream === stream ? "default" : "outline"}
                  className="h-auto py-4 rounded-2xl text-sm whitespace-normal"
                  onClick={() => { updateForm({ stream }); handleNext(); }}
                >
                  {stream}
                </Button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center mb-4">Which State are you from?</h2>
            <select 
              className="w-full p-4 rounded-2xl border bg-white shadow-sm focus:ring-2 focus:ring-primary outline-none"
              value={formData.state}
              onChange={(e) => updateForm({ state: e.target.value, district: "" })}
            >
              {Object.keys(stateDistricts).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <Button className="w-full rounded-xl h-12" onClick={handleNext} disabled={!formData.state}>Next</Button>
          </div>
        );
      case 4:
        const districts = stateDistricts[formData.state!] || [];
        return (
          <div className="space-y-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center mb-4">Select your District</h2>
            <select 
              className="w-full p-4 rounded-2xl border bg-white shadow-sm focus:ring-2 focus:ring-primary outline-none"
              value={formData.district}
              onChange={(e) => updateForm({ district: e.target.value })}
            >
              <option value="">Select District</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <Button className="w-full rounded-xl h-12" onClick={handleNext} disabled={!formData.district}>Next</Button>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center mb-4">10th Standard Marks</h2>
            <div className="space-y-4">
              <label className="text-sm font-bold text-muted-foreground uppercase">Total Marks (Out of 500)</label>
              <Input 
                type="number" 
                className="h-14 rounded-2xl text-xl" 
                value={formData.marks10th || ""} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateForm({ marks10th: val, percentage10th: (val / 500) * 100 });
                }} 
              />
              <p className="text-center font-bold text-primary">Percentage: {formData.percentage10th?.toFixed(2)}%</p>
            </div>
            <Button className="w-full rounded-xl h-12" onClick={handleNext} disabled={!formData.marks10th}>Next</Button>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center mb-4">12th / HSC Marks</h2>
            <div className="space-y-4">
              <label className="text-sm font-bold text-muted-foreground uppercase">Overall Percentage (%)</label>
              <Input 
                type="number" 
                className="h-14 rounded-2xl text-xl" 
                value={formData.percentage12th || ""} 
                onChange={(e) => updateForm({ percentage12th: Number(e.target.value) })} 
              />
            </div>
            <Button className="w-full rounded-xl h-12" onClick={handleNext} disabled={!formData.percentage12th}>Next</Button>
          </div>
        );
      case 7:
        return (
          <div className="space-y-8 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-center">Entrance Cutoff Mark</h2>
            <div className="space-y-4">
              <Input 
                type="number" 
                placeholder="e.g. 185.5"
                className="h-14 rounded-2xl text-2xl text-center font-bold" 
                value={formData.cutoffMark || ""} 
                onChange={(e) => updateForm({ cutoffMark: Number(e.target.value) })} 
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: "-10", label: "-10 (Safety)", color: "bg-green-500", tip: "Comfortably above cutoff" },
                { val: "exact", label: "Exact Match", color: "bg-[#534AB7]", tip: "Matching current marks" },
                { val: "+10", label: "+10 (Dream)", color: "bg-amber-500", tip: "Aspirational colleges" }
              ].map((r) => (
                <button
                  key={r.val}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-1",
                    formData.cutoffRange === r.val ? `border-transparent ${r.color} text-white shadow-lg` : "border-muted bg-white text-muted-foreground"
                  )}
                  onClick={() => updateForm({ cutoffRange: r.val as any })}
                >
                  <span className="font-bold text-xs">{r.label}</span>
                  <span className="text-[10px] opacity-80 leading-tight">{r.tip}</span>
                </button>
              ))}
            </div>
            <Button className="w-full rounded-xl h-12" onClick={handleNext} disabled={!formData.cutoffMark}>Next</Button>
          </div>
        );
      case 8:
        return (
          <div className="space-y-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Budget Preference</h2>
            <div className="grid grid-cols-1 gap-4">
              {["Government", "Private", "Both"].map((b) => (
                <Button
                  key={b}
                  variant={formData.budget === b ? "default" : "outline"}
                  className="h-14 rounded-2xl text-lg font-bold"
                  onClick={() => { updateForm({ budget: b as any }); handleNext(); }}
                >
                  {b}
                </Button>
              ))}
            </div>
          </div>
        );
      case 9:
        return (
          <div className="space-y-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Special Quota</h2>
            <div className="grid grid-cols-2 gap-3">
              {QUOTAS.map((q) => (
                <Button
                  key={q}
                  variant={formData.quota === q ? "default" : "outline"}
                  className="h-12 rounded-xl"
                  onClick={() => updateForm({ quota: q })}
                >
                  {q}
                </Button>
              ))}
            </div>
            <Button 
              className="w-full mt-8 rounded-2xl h-16 text-xl font-bold bg-[#1D9E75] hover:bg-[#1D9E75]/90 shadow-xl" 
              onClick={handleFinish}
              disabled={analyzing}
            >
              {analyzing ? "AI is Analyzing..." : "Find My Colleges"}
            </Button>
          </div>
        );
      case 10:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold">Great Choice!</h2>
              <p className="text-muted-foreground mt-2">Here are colleges that believe in students like you.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {colleges.map((college, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="college-card-glow rounded-3xl border-primary/10 shadow-lg hover:shadow-xl transition-all h-full overflow-hidden flex flex-col">
                    <CardContent className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-primary">{college.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-bold text-secondary">
                              <MapPin className="h-3 w-3 mr-1" /> {college.location}, {college.state}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Match</div>
                          <div className={cn(
                            "text-xl font-black",
                            college.match_score > 80 ? "text-green-500" : college.match_score > 60 ? "text-amber-500" : "text-red-500"
                          )}>
                            {college.match_score}%
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-2 py-1 rounded-md bg-muted text-[10px] font-bold uppercase">{college.type}</span>
                        <span className="px-2 py-1 rounded-md bg-muted text-[10px] font-bold uppercase">{college.level}</span>
                        <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase">NAAC: {college.naac_grade}</span>
                        <span className="px-2 py-1 rounded-md bg-secondary/10 text-secondary text-[10px] font-bold uppercase">Rank: {college.ranking}</span>
                      </div>

                      <div className="mb-6">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Available Courses</p>
                        <div className="flex flex-wrap gap-1.5">
                          {college.courses.slice(0, 4).map(c => (
                            <span key={c} className="px-2 py-1 rounded-lg bg-muted/50 text-[10px]">{c}</span>
                          ))}
                          {college.courses.length > 4 && <span className="text-[10px] text-muted-foreground">+{college.courses.length - 4} more</span>}
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-6 italic text-sm text-primary/80">
                        "{college.why_fit}"
                      </div>
                      
                      <div className="mt-auto space-y-3">
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${college.match_score}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className={cn(
                              "h-full",
                              college.match_score > 80 ? "bg-green-500" : college.match_score > 60 ? "bg-amber-500" : "bg-red-500"
                            )}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Link href={college.contact_url} target="_blank" className="flex-1">
                            <Button variant="outline" size="sm" className="w-full rounded-xl">View Details</Button>
                          </Link>
                          <Link href="/contact" className="flex-1">
                            <Button size="sm" className="w-full rounded-xl">Contact Admission</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center py-12">
              <Button size="lg" className="rounded-2xl px-12" onClick={() => router.push("/dashboard")}>
                Return to Dashboard
              </Button>
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
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <Button variant="ghost" size="sm" onClick={handleBack} disabled={step === 1} className="rounded-xl">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <span className="text-sm font-bold text-muted-foreground">Step {step} of {totalSteps}</span>
            <Button variant="ghost" size="sm" onClick={handleNext} className="rounded-xl" disabled={step === totalSteps}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
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
