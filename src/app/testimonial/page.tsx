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
  ArrowRight, Award
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
      toast.error("Required fields missing from transmission.");
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
      toast.error("Transmission failure: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-[#05071a] flex items-center justify-center">
      <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05071a] text-white relative overflow-hidden selection:bg-teal-500/30 py-24 px-6">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      </div>

      <div className="max-w-4xl mx-auto space-y-16 relative z-10">
        <header className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4"
          >
            <Quote size={14} />
            Community Intelligence
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">
            Share Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-400">Success Story</span>
          </h1>
          <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px] max-w-lg mx-auto">
            Your admission journey inspires the next generation of scholars. help them find their perfect match.
          </p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-10 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-3xl group"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-500" />
          <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-700">
             <Sparkles size={250} className="text-teal-500" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Building size={12} className="text-teal-400" /> Institution Admitted To
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NIT Trichy"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white font-bold outline-none focus:border-teal-500/50 transition-all placeholder:text-white/10"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <BookOpen size={12} className="text-teal-400" /> Specialization / Stream
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Engineering"
                  value={formData.stream}
                  onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                  className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white font-bold outline-none focus:border-teal-500/50 transition-all placeholder:text-white/10"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Calendar size={12} className="text-teal-400" /> Admission Cycle
                </label>
                <div className="relative">
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white font-bold outline-none focus:border-teal-500/50 appearance-none cursor-pointer transition-all"
                  >
                    <option value="2023" className="bg-[#05071a]">2023</option>
                    <option value="2024" className="bg-[#05071a]">2024</option>
                    <option value="2025" className="bg-[#05071a]">2025</option>
                    <option value="2026" className="bg-[#05071a]">2026</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <MapPin size={12} className="text-teal-400" /> Current Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white font-bold outline-none focus:border-teal-500/50 transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <Award size={14} className="text-teal-400" /> Platform Experience Rating
              </label>
              <div className="flex gap-4 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 w-fit">
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
                      size={48}
                      className={cn(
                        "transition-all duration-300",
                        (hoveredRating || rating) >= star
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                          : "text-white/5"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                  <MessageSquare size={12} className="text-teal-400" /> Experience Intelligence (Max 200)
                </label>
                <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">{formData.review.length} / 200</span>
              </div>
              <textarea
                required
                maxLength={200}
                placeholder="How did CollegeMatch-AI refine your decision making process…"
                value={formData.review}
                onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                className="w-full h-44 bg-white/[0.05] border border-white/10 rounded-[2.5rem] p-8 text-white outline-none focus:border-teal-500/30 transition-all font-medium resize-none placeholder:text-white/10 leading-relaxed"
              />
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center gap-8">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full md:w-auto h-20 px-12 text-lg font-black group shadow-[0_20px_50px_rgba(20,184,166,0.2)] flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                <span>{loading ? "Transmitting..." : "Broadcast Success Story"}</span>
              </button>
              <div className="flex items-center gap-3 opacity-20">
                <ShieldCheck size={16} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Verified Community Submission Protocol</span>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
