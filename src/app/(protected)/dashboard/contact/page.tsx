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
import { cn } from "@/lib/utils";
import SelectField from "@/components/SelectField";
import { useAuthGuard } from '@/lib/auth-guard';

export default function ContactPage() {
  const { user, profile, state: authLoading } = useAuthGuard();
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
      toast.success("Message sent successfully!");
    } catch (error: any) {
      toast.error(error.message || "Transmission failure. Please retry.");
    } finally {
      setSending(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] flex items-center justify-center">
      <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] text-gray-900 relative overflow-hidden selection:bg-purple-200 flex items-center justify-center p-6 pt-24">
      <div className="max-w-4xl w-full relative z-10">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="contact-form"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-white/70 backdrop-blur-xl border border-purple-100 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-teal-500" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 shadow-sm">
                    <ShieldCheck size={14} className="text-purple-650" />
                    <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Support Protocol</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-gray-950 tracking-tight leading-tight">Get in Touch</h1>
                  <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">Direct line to admission intelligence & counseling experts</p>
                </div>
                <div className="h-16 w-16 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm">
                  <MessageSquare size={28} />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                          <Target size={12} className="text-purple-600" /> Your Identity
                        </label>
                        <input 
                            type="text" 
                            disabled 
                            value={profile?.fullName || user?.displayName || "Student User"}
                            className="w-full h-14 bg-gray-50 border border-purple-100 rounded-2xl px-6 text-gray-500 font-bold cursor-not-allowed"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                          <Mail size={12} className="text-purple-600" /> Secure Email
                        </label>
                        <input 
                            type="text" 
                            disabled 
                            value={profile?.email || user?.email || ""}
                            className="w-full h-14 bg-gray-50 border border-purple-100 rounded-2xl px-6 text-gray-500 font-bold cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <Zap size={12} className="text-purple-600" /> Intelligence Subject
                    </label>
                    <div className="relative">
                      <SelectField
                          value={formData.subject}
                          onChange={(v) => setFormData({...formData, subject: v})}
                          options={[
                            { value: "General Inquiry", label: "General Inquiry" },
                            { value: "Direct Admission Help", label: "Direct Admission Help" },
                            { value: "JEE/TNEA Counseling", label: "JEE/TNEA Counseling" },
                            { value: "Bug Report", label: "Bug Report" },
                            { value: "Other", label: "Other" }
                          ]}
                          placeholder="Select subject"
                      />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <MessageSquare size={12} className="text-purple-600" /> Transmission Message
                    </label>
                    <textarea 
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Define your requirements here…"
                        className="w-full bg-white border border-purple-200 rounded-2xl p-6 text-gray-900 outline-none focus:ring-2 focus:ring-purple-255/20 focus:border-purple-400 transition-all font-medium resize-none placeholder:text-gray-400"
                    />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full h-14 bg-purple-600 hover:bg-purple-750 text-white font-semibold text-xs tracking-widest uppercase rounded-2xl transition duration-300 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                >
                  {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  <span>{sending ? "Transmitting..." : "Send Request"}</span>
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="contact-success"
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              className="bg-white/70 backdrop-blur-xl border border-purple-100 rounded-3xl p-12 text-center space-y-8 shadow-sm relative overflow-hidden"
            >
                <div className="relative inline-block">
                  <div className="h-24 w-24 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto shadow-sm animate-bounce">
                    <CheckCircle2 size={48} className="animate-in zoom-in duration-500" />
                  </div>
                  <Sparkles className="absolute -top-4 -right-4 text-amber-500 animate-pulse" size={28} />
                </div>
                
                <div className="space-y-4 relative z-10">
                    <h2 className="text-3xl font-bold text-gray-950 tracking-tight">Inquiry Sent</h2>
                    <p className="text-gray-500 font-bold text-sm max-w-sm mx-auto leading-relaxed">
                        Data transmission complete. Our CollegeMatch-AI specialists will reach out via secure channel within <span className="text-purple-600">24 hours</span>.
                    </p>
                </div>

                <button 
                    onClick={() => setSuccess(false)}
                    className="inline-flex items-center gap-3 px-8 py-3 bg-white border border-purple-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all shadow-sm"
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
