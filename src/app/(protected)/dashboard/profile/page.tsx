"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { User, Mail, Phone, MapPin, Award, BookOpen, Save, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({
    full_name: "",
    phone: "",
    state: "",
    city: "",
    jee_percentile: "",
    board_percentage: "",
    preferred_course: "Computer Science"
  });


  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setProfile({
            ...data,
            jee_percentile: data.jee_percentile || "",
            board_percentage: data.board_percentage || ""
          });
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          state: profile.state,
          city: profile.city,
          jee_percentile: profile.jee_percentile || null,
          board_percentage: profile.board_percentage || null,
          preferred_course: profile.preferred_course,
          last_active: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="h-32 w-32 rounded-[2.5rem] bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-purple-500/40"
            >
                {profile.full_name?.[0] || 'U'}
            </motion.div>
            <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black text-white font-syne">{profile.full_name || 'Your Name'}</h1>
                <p className="text-purple-400 font-bold flex items-center justify-center md:justify-start gap-2 mt-2">
                    <Mail size={18} /> {profile.email}
                </p>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-2">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
        </header>

        <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#111520] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            value={profile.full_name}
                            onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white outline-none focus:border-purple-500 transition-all font-bold"
                            placeholder="John Doe"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            value={profile.phone}
                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white outline-none focus:border-purple-500 transition-all font-bold"
                            placeholder="+91 00000 00000"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">State</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            value={profile.state}
                            onChange={(e) => setProfile({...profile, state: e.target.value})}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white outline-none focus:border-purple-500 transition-all font-bold"
                            placeholder="e.g. Tamil Nadu"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">City</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            value={profile.city}
                            onChange={(e) => setProfile({...profile, city: e.target.value})}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white outline-none focus:border-purple-500 transition-all font-bold"
                            placeholder="e.g. Chennai"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#111520] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">JEE Percentile</label>
                    <div className="relative">
                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="number" 
                            step="0.01"
                            value={profile.jee_percentile}
                            onChange={(e) => setProfile({...profile, jee_percentile: e.target.value})}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white outline-none focus:border-purple-500 transition-all font-bold"
                            placeholder="99.5"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Board Percentage (%)</label>
                    <div className="relative">
                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="number" 
                            step="0.1"
                            value={profile.board_percentage}
                            onChange={(e) => setProfile({...profile, board_percentage: e.target.value})}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white outline-none focus:border-purple-500 transition-all font-bold"
                            placeholder="95.2"
                        />
                    </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Preferred Course</label>
                    <div className="relative">
                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <select 
                            value={profile.preferred_course}
                            onChange={(e) => setProfile({...profile, preferred_course: e.target.value})}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white outline-none focus:border-purple-500 transition-all font-bold appearance-none cursor-pointer"
                        >
                            <option value="Computer Science">Computer Science (CSE)</option>
                            <option value="Information Technology">Information Technology (IT)</option>
                            <option value="Electronics & Communication">ECE</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Civil">Civil</option>
                            <option value="Electrical">Electrical (EEE)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    disabled={saving}
                    className="h-16 px-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white font-black text-lg shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-3"
                >
                    {saving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                    {saving ? "Saving Changes..." : "Update Profile"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
