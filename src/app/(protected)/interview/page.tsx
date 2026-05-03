"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Loader2, Sparkles, GraduationCap, DollarSign, MapPin, BookOpen, Trophy } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { College } from "@/types";

export default function Interview() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    marks10th: "",
    marks12th: "",
    stream: "",
    budget: "",
    statePreference: ""
  });

  const steps = [
    { id: 1, title: "10th Marks", icon: <Trophy className="h-6 w-6" />, question: "What was your percentage in 10th Standard?" },
    { id: 2, title: "12th Marks", icon: <GraduationCap className="h-6 w-6" />, question: "What is your percentage in 12th Standard?" },
    { id: 3, title: "Stream", icon: <BookOpen className="h-6 w-6" />, question: "Which stream did you choose in 12th?" },
    { id: 4, title: "Budget", icon: <DollarSign className="h-6 w-6" />, question: "What is your annual budget for college fees?" },
    { id: 5, title: "Preference", icon: <MapPin className="h-6 w-6" />, question: "Which state do you prefer for college?" }
  ];

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/groq-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.colleges) {
        // Save to Firestore
        const sessionRef = await addDoc(collection(db, "interviews", user!.uid, "sessions"), {
          userId: user!.uid,
          answers: formData,
          suggestions: data.colleges,
          timestamp: serverTimestamp(),
        });
        
        router.push(`/history/${sessionRef.id}`);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStepInfo = steps.find(s => s.id === step);

  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between mb-4">
          {steps.map((s) => (
            <div 
              key={s.id} 
              className={`flex flex-col items-center flex-1 relative ${s.id <= step ? 'text-primary' : 'text-gray-300'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 transition-all duration-300 ${s.id <= step ? 'bg-primary/5 border-primary' : 'bg-white border-gray-200'}`}>
                {s.id < step ? <Sparkles className="h-5 w-5" /> : s.id}
              </div>
              <span className="text-xs font-bold uppercase tracking-tighter hidden md:block">{s.title}</span>
              {s.id < 5 && (
                <div className={`absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-[2px] -z-10 ${s.id < step ? 'bg-primary' : 'bg-gray-100'}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 md:p-16 border border-gray-100 shadow-xl shadow-gray-200/50">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            {currentStepInfo?.icon}
          </div>
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Question {step} of 5</span>
            <h2 className="text-2xl font-bold text-gray-900">{currentStepInfo?.question}</h2>
          </div>
        </div>

        <div className="mb-12">
          {step === 1 && (
            <input 
              type="text" 
              placeholder="e.g. 85%" 
              className="w-full text-4xl font-bold py-4 border-b-4 border-gray-100 focus:border-primary outline-none transition-colors"
              value={formData.marks10th}
              onChange={(e) => setFormData({...formData, marks10th: e.target.value})}
              autoFocus
            />
          )}
          {step === 2 && (
            <input 
              type="text" 
              placeholder="e.g. 92%" 
              className="w-full text-4xl font-bold py-4 border-b-4 border-gray-100 focus:border-primary outline-none transition-colors"
              value={formData.marks12th}
              onChange={(e) => setFormData({...formData, marks12th: e.target.value})}
              autoFocus
            />
          )}
          {step === 3 && (
            <select 
              className="w-full text-3xl font-bold py-4 border-b-4 border-gray-100 focus:border-primary outline-none bg-white transition-colors cursor-pointer"
              value={formData.stream}
              onChange={(e) => setFormData({...formData, stream: e.target.value})}
            >
              <option value="">Select Stream</option>
              <option value="PCM (Engineering)">PCM (Engineering)</option>
              <option value="PCB (Medical)">PCB (Medical)</option>
              <option value="Commerce">Commerce</option>
              <option value="Arts/Humanities">Arts/Humanities</option>
              <option value="Other">Other</option>
            </select>
          )}
          {step === 4 && (
            <input 
              type="text" 
              placeholder="e.g. 2-5 Lakhs" 
              className="w-full text-4xl font-bold py-4 border-b-4 border-gray-100 focus:border-primary outline-none transition-colors"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
              autoFocus
            />
          )}
          {step === 5 && (
            <input 
              type="text" 
              placeholder="e.g. Tamil Nadu, Karnataka" 
              className="w-full text-4xl font-bold py-4 border-b-4 border-gray-100 focus:border-primary outline-none transition-colors"
              value={formData.statePreference}
              onChange={(e) => setFormData({...formData, statePreference: e.target.value})}
              autoFocus
            />
          )}
        </div>

        <div className="flex justify-between items-center">
          <button 
            onClick={handleBack}
            disabled={step === 1 || loading}
            className={`flex items-center font-bold px-6 py-3 rounded-2xl transition-all ${step === 1 ? 'opacity-0' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back
          </button>

          {step < 5 ? (
            <button 
              onClick={handleNext}
              disabled={!Object.values(formData)[step-1]}
              className="flex items-center bg-primary text-white font-bold px-10 py-4 rounded-2xl hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100"
            >
              Next <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={loading || !formData.statePreference}
              className="flex items-center bg-gray-900 text-white font-bold px-10 py-4 rounded-2xl hover:bg-primary transition-all shadow-lg shadow-black/10 disabled:opacity-50"
            >
              {loading ? (
                <>Analyzing <Loader2 className="ml-2 h-5 w-5 animate-spin" /></>
              ) : (
                <>Get AI Suggestions <Sparkles className="ml-2 h-5 w-5 text-yellow-400" /></>
              )}
            </button>
          )}
        </div>
      </div>
      
      <p className="text-center text-gray-400 mt-12 text-sm">
        Our AI takes a few seconds to process thousands of data points to find your match.
      </p>
    </div>
  );
}
