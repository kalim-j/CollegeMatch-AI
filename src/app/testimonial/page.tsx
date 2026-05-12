"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  Star, Send, Loader2, Building, BookOpen, 
  Calendar, MapPin, MessageSquare, Quote
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
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "testimonials"), {
        name: user?.displayName || user?.email?.split('@')[0] || "Anonymous",
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

      toast.success("Thank you! Your review will appear after approval.");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error("Failed to submit testimonial: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0d14]"><Loader2 className="animate-spin text-purple-500" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0d14] py-20 px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-3xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold uppercase tracking-widest"
          >
            <Quote size={16} />
            Share Your Success
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white font-syne tracking-tighter">
            Inspire Others with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Your Story</span>
          </h1>
          <p className="text-slate-400 font-medium">
            Tell us about your admission success. Your experience helps future students find their path.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111520] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Building size={14} /> College Admitted To *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IIT Madras"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen size={14} /> Stream / Course *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech CSE"
                  value={formData.stream}
                  onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} /> Year of Admission
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white focus:border-emerald-500 outline-none transition-all appearance-none"
                >
                  <option value="2023" className="bg-[#111520]">2023</option>
                  <option value="2024" className="bg-[#111520]">2024</option>
                  <option value="2025" className="bg-[#111520]">2025</option>
                  <option value="2026" className="bg-[#111520]">2026</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={14} /> City / District (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chennai"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Star size={14} /> Your Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-all transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      size={36}
                      className={cn(
                        "transition-all",
                        (hoveredRating || rating) >= star
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                          : "text-slate-700"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={14} /> Your Experience (Max 200 chars) *
              </label>
              <textarea
                required
                maxLength={200}
                placeholder="Share how EduAnalytics-AI helped you..."
                value={formData.review}
                onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                className="w-full h-40 bg-white/5 border border-white/10 rounded-[2rem] p-6 text-white focus:border-emerald-500 outline-none transition-all resize-none placeholder:text-slate-600"
              />
              <div className="text-right text-[10px] font-black text-slate-600 uppercase tracking-widest">
                {formData.review.length} / 200
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Send size={24} />}
              {loading ? "Submitting..." : "Submit My Success Story"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
