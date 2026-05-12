"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, MessageSquare, Send, CheckCircle2, 
  Loader2, Sparkles, ShieldCheck, Zap,
  ArrowRight, Phone, Target, ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

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
    if (!profile && !user) return;
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
      toast.success("Intelligence transmission successful!");
    } catch (error: any) {
      toast.error(error.message || "Transmission failure. Please retry.");
    } finally {
      setSending(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-[#05071a] flex items-center justify-center">
      <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05071a] text-white relative overflow-hidden selection:bg-indigo-500/30 flex items-center justify-center p-6">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="contact-form"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-10 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-3xl"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    <ShieldCheck size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Support Protocol</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">Get in Touch</h1>
                  <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">Direct line to admission intelligence & counseling experts</p>
                </div>
                <div className="h-20 w-20 bg-white/[0.05] border border-white/10 rounded-[2rem] flex items-center justify-center text-indigo-400 shadow-2xl">
                  <MessageSquare size={36} />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                          <Target size={12} className="text-indigo-500" /> Your Identity
                        </label>
                        <input 
                            type="text" 
                            disabled 
                            value={profile?.fullName || user?.displayName || "Student User"}
                            className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white/40 font-bold cursor-not-allowed"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                          <Mail size={12} className="text-indigo-500" /> Secure Email
                        </label>
                        <input 
                            type="text" 
                            disabled 
                            value={profile?.email || user?.email || ""}
                            className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white/40 font-bold cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <Zap size={12} className="text-indigo-500" /> Intelligence Subject
                    </label>
                    <div className="relative">
                      <select 
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 text-white font-bold outline-none focus:border-indigo-500/50 appearance-none cursor-pointer transition-all"
                      >
                          <option className="bg-[#05071a] text-white">General Inquiry</option>
                          <option className="bg-[#05071a] text-white">Direct Admission Help</option>
                          <option className="bg-[#05071a] text-white">JEE/TNEA Counseling</option>
                          <option className="bg-[#05071a] text-white">Bug Report</option>
                          <option className="bg-[#05071a] text-white">Other</option>
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={18} />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <MessageSquare size={12} className="text-indigo-500" /> Transmission Message
                    </label>
                    <textarea 
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Define your requirements here…"
                        className="w-full bg-white/[0.05] border border-white/10 rounded-[2rem] p-8 text-white outline-none focus:border-indigo-500/30 transition-all font-medium resize-none placeholder:text-white/10"
                    />
                </div>

                <button 
                    disabled={sending}
                    className="btn-primary w-full h-20 text-xl font-black group"
                >
                    {sending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                    {sending ? "Transmitting Intelligence…" : "Execute Submission"}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="contact-success"
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-16 md:p-24 text-center space-y-10 shadow-[0_50px_150px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-3xl"
            >
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {mounted && [...Array(30)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute h-1.5 w-1.5 rounded-full bg-indigo-500/40"
                            initial={{ top: '50%', left: '50%' }}
                            animate={{ 
                                top: `${Math.random() * 100}%`, 
                                left: `${Math.random() * 100}%`,
                                opacity: [0, 1, 0],
                                scale: [0, 2, 0]
                            }}
                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.1, ease: "circOut" }}
                        />
                    ))}
                </div>

                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-teal-500/20 blur-[60px] rounded-full pointer-events-none" />
                  <div className="h-32 w-32 bg-teal-500/10 rounded-[3rem] border border-teal-500/20 flex items-center justify-center text-teal-400 mx-auto shadow-2xl relative z-10">
                    <CheckCircle2 size={64} className="animate-in zoom-in duration-500" />
                  </div>
                  <Sparkles className="absolute -top-6 -right-6 text-amber-400 animate-pulse" size={40} />
                </div>
                
                <div className="space-y-4 relative z-10">
                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">Inquiry Sent</h2>
                    <p className="text-white/40 font-bold text-lg max-w-sm mx-auto leading-relaxed">
                        Data transmission complete. Our CollegeMatch-AI specialists will reach out via secure channel within <span className="text-indigo-400">24 hours</span>.
                    </p>
                </div>

                <button 
                    onClick={() => setSuccess(false)}
                    className="inline-flex items-center gap-3 px-12 py-5 bg-white/[0.05] border border-white/10 rounded-2xl text-white/30 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/[0.1] hover:text-white transition-all relative z-10"
                >
                    Initialize New Transmission
                </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
