"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  Send, Phone, Mail, MapPin, MessageCircle, 
  Loader2, CheckCircle2, User, Info, AlertCircle 
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import emailjs from '@emailjs/browser';

export default function ContactPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  useEffect(() => {
    if (user && profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.fullName || user.displayName || "",
        email: profile.email || user.email || ""
      }));
    }
  }, [user, profile]);

  const generateWhatsAppUrl = () => {
    if (!user || !profile) {
      return `https://wa.me/919363554551?text=${encodeURIComponent("Hi, I want to enquire about college admissions.")}`;
    }

    const message = `Hi, I am ${profile.fullName || user.displayName} from ${profile.state || 'N/A'}. 
I completed the EduAnalytics-AI interview for ${profile.preferredCourse || 'Engineering'}. 
I need help with college admission. Please guide me.`;

    return `https://wa.me/919363554551?text=${encodeURIComponent(message)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone) {
      toast.error("Phone number is required");
      return;
    }

    setLoading(true);
    try {
      // 1. Save to Firestore
      await addDoc(collection(db, "contacts"), {
        uid: user?.uid || null,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        stream: profile?.preferredCourse || "Not specified",
        state: profile?.state || "Not specified",
        level: "UG", // Default or from profile if exists
        status: "new",
        createdAt: serverTimestamp()
      });

      // 2. Send Email Notification via EmailJS
      try {
        await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
          {
            from_name: formData.name,
            from_email: formData.email,
            phone: formData.phone,
            stream: profile?.preferredCourse || "Not specified",
            state: profile?.state || "Not specified",
            level: "UG",
            message: formData.message,
            cutoff: "N/A" // Add if exists in profile
          },
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
        );
        toast.success("Message sent! Kalim will contact you soon.");
      } catch (err) {
        console.error("EmailJS Error:", err);
        toast.info("Form saved. We will contact you.");
      }

      setSuccess(true);
      setFormData({ ...formData, message: "" });
    } catch (error: any) {
      toast.error("Failed to send message: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] py-20 px-4">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
        {/* Left Side - Contact Info */}
        <div className="space-y-12">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold uppercase tracking-widest"
            >
              <Phone size={16} />
              Contact Admission Support
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black text-white font-syne tracking-tighter leading-none">
              Let&apos;s Build Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Future Together</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-lg">
              Have questions about your college match? Our experts are here to guide you through every step of the admission process.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-6 group">
              <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Email Us</p>
                <p className="text-xl font-bold text-white">support@eduanalytics.ai</p>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <MessageCircle size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">WhatsApp Support</p>
                <p className="text-xl font-bold text-white">+91 93635 54551</p>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Office Location</p>
                <p className="text-xl font-bold text-white">Coimbatore, Tamil Nadu</p>
              </div>
            </div>
          </div>

          {/* WhatsApp Preview Box */}
          <div className="bg-[#111520] border border-white/5 rounded-[2rem] p-8 space-y-6">
            <h3 className="text-xl font-black text-white font-syne">Instant Admission Help</h3>
            {!user ? (
               <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                 <AlertCircle className="text-amber-500 flex-shrink-0" size={18} />
                 <p className="text-sm text-slate-400 font-medium">Please login to send a personalized inquiry with your profile details.</p>
               </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Message Preview:</p>
                <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl text-sm text-slate-400 font-medium italic leading-relaxed">
                  &quot;Hi, I am {profile?.fullName || user.displayName} from {profile?.state || 'N/A'}. I completed the interview for {profile?.preferredCourse}...&quot;
                </div>
              </div>
            )}
            <a 
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/20"
            >
              <MessageCircle size={20} /> Chat with Counsellor
            </a>
          </div>
        </div>

        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111520] border border-white/5 rounded-[3rem] p-10 md:p-14 shadow-2xl relative"
        >
          <AnimatePresence mode="wait">
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="John Doe"
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="john@example.com"
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="98765 43210"
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">How can we help you?</label>
                  <textarea 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Tell us about your admission goals..."
                    className="w-full h-40 bg-white/5 border border-white/10 rounded-[2rem] p-6 text-white focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-700 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Send size={24} />}
                  {loading ? "Sending Message..." : "Submit Inquiry"}
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 space-y-6"
              >
                <div className="h-24 w-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                  <CheckCircle2 size={60} />
                </div>
                <h2 className="text-3xl font-black text-white font-syne tracking-tight">Message Received!</h2>
                <p className="text-slate-400 font-medium max-w-xs mx-auto">
                  Our admission team has been notified. We will contact you on WhatsApp or Email shortly.
                </p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-all"
                >
                  Send another message
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
