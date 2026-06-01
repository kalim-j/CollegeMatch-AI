"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  Star, Send, Loader2, Building, BookOpen, 
  Calendar, MapPin, MessageSquare, Quote,
  Sparkles, ShieldCheck, Heart, User,
  ArrowRight, Award, ChevronDown
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function SubmitTestimonial() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);

  const [formData, setFormData] = useState({
    college: "",
    stream: "",
    year: "2024",
    review: "",
    location: ""
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.college || !formData.review) {
      toast.error("Required fields missing.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "testimonials"), {
        name: user?.displayName || user?.email?.split('@')[0] || "Anonymous Student",
        avatar: user?.photoURL || null,
        college: formData.college,
        stream: formData.stream,
        year: formData.year,
        review: formData.review,
        rating: rating,
        location: formData.location,
        uid: user?.uid,
        approved: false,
        createdAt: serverTimestamp()
      });

      toast.success("Intelligence shared! Awaiting validation.");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error("Submission failure: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] flex items-center justify-center">
      <Loader2 className="h-10 w-10 text-purple-650 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] text-gray-900 relative overflow-hidden selection:bg-purple-250/20 py-24 px-6 pt-28">
      <div className="max-w-4xl mx-auto space-y-16 relative z-10">
        <header className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-sm"
          >
            <Quote size={14} />
            Community Intelligence
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-955 tracking-tight leading-tight">
            Share Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-650 via-indigo-650 to-purple-600">Success Story</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] max-w-lg mx-auto">
            Your admission journey inspires the next generation of scholars. Help them find their perfect match.
          </p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/70 backdrop-blur-xl border border-purple-100 rounded-[3rem] p-8 md:p-12 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-teal-500" />

          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Building size={12} className="text-purple-605" /> Institution Admitted To
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NIT Trichy"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full h-16 bg-white border border-purple-200 rounded-2xl px-6 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 transition-all placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <BookOpen size={12} className="text-purple-605" /> Specialization / Stream
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Engineering"
                  value={formData.stream}
                  onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                  className="w-full h-16 bg-white border border-purple-200 rounded-2xl px-6 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 transition-all placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Calendar size={12} className="text-purple-650" /> Admission Cycle
                </label>
                <div className="relative">
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full h-16 bg-white border border-purple-200 rounded-2xl px-6 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 appearance-none cursor-pointer transition-all"
                  >
                    <option value="2023" className="bg-white text-gray-800">2023</option>
                    <option value="2024" className="bg-white text-gray-800">2024</option>
                    <option value="2025" className="bg-white text-gray-800">2025</option>
                    <option value="2026" className="bg-white text-gray-800">2026</option>
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-450 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <MapPin size={12} className="text-purple-650" /> Current Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full h-16 bg-white border border-purple-200 rounded-2xl px-6 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <Award size={14} className="text-purple-650" /> Experience Rating
              </label>
              <div className="flex gap-4 p-6 rounded-[2rem] bg-purple-50 border border-purple-100 w-fit">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-all transform hover:scale-125 active:scale-95"
                  >
                    <Star
                      size={42}
                      className={cn(
                        "transition-all duration-300",
                        (hoveredRating || rating) >= star
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                          : "text-purple-200"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <MessageSquare size={12} className="text-purple-650" /> Experience Intelligence (Max 200)
                </label>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{formData.review.length} / 200</span>
              </div>
              <textarea
                required
                maxLength={200}
                placeholder="How did CollegeMatch-AI refine your decision making process…"
                value={formData.review}
                onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                className="w-full h-44 bg-white border border-purple-200 rounded-[2.5rem] p-6 text-gray-900 outline-none focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 transition-all font-medium resize-none placeholder:text-gray-400 leading-relaxed"
              />
            </div>

            <div className="pt-8 border-t border-purple-100 flex flex-col md:flex-row items-center gap-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto h-16 px-12 text-xs font-semibold uppercase bg-purple-600 hover:bg-purple-750 text-white rounded-2xl transition-all shadow-lg shadow-purple-200/20 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                <span>{loading ? "Transmitting..." : "Broadcast Success Story"}</span>
              </button>
              <div className="flex items-center gap-3 opacity-30">
                <ShieldCheck size={16} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Verified Submission Protocol</span>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
