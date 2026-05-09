"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MessageSquare, Send, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";

export default function ContactPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    subject: "General Inquiry",
    message: ""
  });

  useEffect(() => {
    setMounted(true);
  }, []);




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSending(true);

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          name: profile?.fullName || "Anonymous",
          email: profile?.email || user?.email,
          subject: formData.subject,
          message: formData.message
        });

      if (error) throw error;
      setSuccess(true);
      toast.success("Message sent successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="contact-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111520] border border-white/10 rounded-[3.5rem] p-10 md:p-16 shadow-[0_48px_120px_rgba(0,0,0,0.6)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl font-black text-white font-syne">Get in Touch</h1>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-1">Direct support for admission & counseling</p>
                </div>
                <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center text-purple-400">
                  <MessageSquare size={32} />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Your Name</label>
                        <input 
                            type="text" 
                            disabled 
                            value={profile?.fullName || ""}
                            className="w-full h-14 bg-white/[0.03] border border-white/5 rounded-xl px-6 text-slate-400 font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                        <input 
                            type="text" 
                            disabled 
                            value={profile?.email || ""}
                            className="w-full h-14 bg-white/[0.03] border border-white/5 rounded-xl px-6 text-slate-400 font-bold"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subject</label>
                    <select 
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white font-bold outline-none focus:border-purple-500 appearance-none cursor-pointer"
                    >
                        <option>General Inquiry</option>
                        <option>Direct Admission Help</option>
                        <option>JEE/TNEA Counseling</option>
                        <option>Bug Report</option>
                        <option>Other</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Message</label>
                    <textarea 
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="How can we help you today?"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-purple-500 transition-all font-medium resize-none"
                    />
                </div>

                <button 
                    disabled={sending}
                    className="w-full h-16 bg-gradient-to-br from-[#7c5cfc] to-[#6d28d9] rounded-2xl text-white font-black text-lg shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3"
                >
                    {sending ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                    {sending ? "Sending Message..." : "Submit Inquiry"}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="contact-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#111520] border border-white/10 rounded-[3.5rem] p-20 text-center space-y-8 shadow-[0_48px_120px_rgba(0,0,0,0.6)] relative overflow-hidden"
            >
                <div className="absolute inset-0 pointer-events-none">
                    {mounted && [...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute h-2 w-2 rounded-full bg-purple-500"
                            initial={{ top: '50%', left: '50%' }}
                            animate={{ 
                                top: `${Math.random() * 100}%`, 
                                left: `${Math.random() * 100}%`,
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0]
                            }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                        />
                    ))}
                </div>

                <div className="h-32 w-32 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center text-emerald-400 mx-auto shadow-2xl border border-emerald-500/20 relative">
                    <CheckCircle2 size={64} className="relative z-10" />
                    <Sparkles className="absolute -top-4 -right-4 text-amber-400 animate-pulse" size={32} />
                </div>
                
                <div className="space-y-4">
                    <h2 className="text-5xl font-black text-white font-syne">Inquiry Sent!</h2>
                    <p className="text-slate-500 font-bold text-lg max-w-sm mx-auto leading-relaxed">
                        Thank you for reaching out. Our CollegeMatch-AI expert will contact you within <span className="text-purple-400">24 hours</span>.
                    </p>
                </div>

                <button 
                    onClick={() => setSuccess(false)}
                    className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                    Send another message
                </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
