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
I completed the CollegeMatch-AI interview for ${profile.preferredCourse || 'Engineering'}. 
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
    <div className="min-h-screen bg-transparent text-gray-900 py-20 px-4 pt-28">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
        {/* Left Side - Contact Info */}
        <div className="space-y-12">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-sm font-bold uppercase tracking-widest shadow-sm"
            >
              <Phone size={16} />
              Contact Admission Support
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-950 tracking-tight leading-none">
              Let&apos;s Build Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-650 to-indigo-650 from-purple-600 to-indigo-600">Future Together</span>
            </h1>
            <p className="text-gray-500 font-bold text-sm max-w-lg">
              Have questions about your college match? Our experts are here to guide you through every step of the admission process.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-6 group">
              <div className="h-14 w-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Email Us</p>
                <p className="text-xl font-bold text-gray-950">support@collegematch-ai.com</p>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                <MessageCircle size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">WhatsApp Support</p>
                <p className="text-xl font-bold text-gray-950">+91 93635 54551</p>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Office Location</p>
                <p className="text-xl font-bold text-gray-950">Coimbatore, Tamil Nadu</p>
              </div>
            </div>
          </div>

          {/* WhatsApp Preview Box */}
          <div className="glass-card rounded-[2rem] p-8 space-y-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-950">Instant Admission Help</h3>
            {!user ? (
               <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                 <AlertCircle className="text-amber-700 flex-shrink-0" size={18} />
                 <p className="text-sm text-gray-655 text-gray-600 font-medium">Please login to send a personalized inquiry with your profile details.</p>
               </div>
            ) : (
               <div className="space-y-4">
                 <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Message Preview:</p>
                 <div className="p-4 bg-white border border-purple-100 rounded-xl text-sm text-gray-600 font-medium italic leading-relaxed shadow-inner">
                   &quot;Hi, I am {profile?.fullName || user.displayName} from {profile?.state || 'N/A'}. I completed the interview for {profile?.preferredCourse}...&quot;
                 </div>
               </div>
            )}
            <a 
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-750 text-white font-semibold text-xs tracking-widest uppercase rounded-xl flex items-center justify-center gap-3 transition-all shadow-md shadow-emerald-250/20"
            >
              <MessageCircle size={20} /> Chat with Counsellor
            </a>
          </div>
        </div>

        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[3rem] p-10 md:p-14 shadow-sm relative"
        >
          <AnimatePresence mode="wait">
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="John Doe"
                        className="w-full h-14 bg-white border border-purple-200 rounded-2xl pl-12 pr-4 text-gray-900 focus:ring-2 focus:ring-purple-255/20 focus:border-purple-400 outline-none transition-all placeholder:text-gray-400 font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="john@example.com"
                        className="w-full h-14 bg-white border border-purple-200 rounded-2xl pl-12 pr-4 text-gray-900 focus:ring-2 focus:ring-purple-255/20 focus:border-purple-400 outline-none transition-all placeholder:text-gray-400 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="98765 43210"
                      className="w-full h-14 bg-white border border-purple-200 rounded-2xl pl-12 pr-4 text-gray-900 focus:ring-2 focus:ring-purple-255/20 focus:border-purple-400 outline-none transition-all placeholder:text-gray-400 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">How can we help you?</label>
                  <textarea 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Tell us about your admission goals..."
                    className="w-full h-40 bg-white border border-purple-200 rounded-[2rem] p-6 text-gray-900 focus:ring-2 focus:ring-purple-255/20 focus:border-purple-400 outline-none transition-all resize-none placeholder:text-gray-400 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 bg-purple-600 hover:bg-purple-750 text-white font-semibold text-xs tracking-widest uppercase rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 shadow-md shadow-purple-200/20"
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
                <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100 shadow-sm animate-pulse">
                  <CheckCircle2 size={60} />
                </div>
                <h2 className="text-3xl font-bold text-gray-950 tracking-tight">Message Received!</h2>
                <p className="text-gray-500 font-bold text-sm max-w-xs mx-auto">
                  Our admission team has been notified. We will contact you on WhatsApp or Email shortly.
                </p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="px-8 py-3.5 bg-white border border-purple-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all shadow-sm"
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
