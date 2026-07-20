"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { User, Mail, Phone, MapPin, Award, BookOpen, Save, Loader2 } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthGuard } from '@/lib/auth-guard';

export default function ProfilePage() {
  const { user, profile: authProfile, state: authLoading, refreshProfile } = useAuthGuard();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({
    fullName: "",
    phone: "",
    state: "",
    city: "",
    jeePercentile: "",
    boardPercentage: "",
    preferredCourse: "Computer Science"
  });


  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Try Firebase first
        if (authProfile) {
          setProfile({
            ...authProfile,
            fullName: authProfile.fullName || "",
            phone: authProfile.phone || "",
            state: authProfile.state || "",
            city: authProfile.city || "",
            jeePercentile: authProfile.jeePercentile || "",
            boardPercentage: authProfile.boardPercentage || "",
            preferredCourse: authProfile.preferredCourse || "Computer Science"
          });
          setLoading(false);
          return;
        }

        // Fallback: Try Supabase
        const { supabase } = await import('@/lib/supabase');
        const { data: { user: sUser } } = await supabase.auth.getUser();
        if (sUser) {
          const { data, error: sErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sUser.id)
            .single();

          if (sErr) throw sErr;
          if (data) {
            setProfile({
              fullName: data.full_name || "",
              phone: data.phone || "",
              state: data.state || "",
              city: data.city || "",
              jeePercentile: data.jee_percentile || "",
              boardPercentage: data.board_percentage || "",
              preferredCourse: data.preferred_course || "Computer Science"
            });
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Profile load error:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [authProfile, authLoading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        ...profile,
        updatedAt: new Date()
      });

      await refreshProfile();
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading === 'loading' || loading) {
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
                {profile.fullName?.[0] || 'U'}
            </motion.div>
            <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black text-white font-syne">{profile.fullName || 'Your Name'}</h1>
                <p className="text-purple-400 font-bold flex items-center justify-center md:justify-start gap-2 mt-2">
                    <Mail size={18} /> {profile.email}
                </p>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-2">Member since {profile.createdAt ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}</p>
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
                            value={profile.fullName}
                            onChange={(e) => setProfile({...profile, fullName: e.target.value})}
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
                            value={profile.jeePercentile}
                            onChange={(e) => setProfile({...profile, jeePercentile: e.target.value})}
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
                            value={profile.boardPercentage}
                            onChange={(e) => setProfile({...profile, boardPercentage: e.target.value})}
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
                            value={profile.preferredCourse}
                            onChange={(e) => setProfile({...profile, preferredCourse: e.target.value})}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white outline-none focus:border-purple-500 transition-all font-bold appearance-none cursor-pointer"
                        >
                            <option value="Computer Science" className="bg-[#0a0d14] text-white">Computer Science (CSE)</option>
                            <option value="Information Technology" className="bg-[#0a0d14] text-white">Information Technology (IT)</option>
                            <option value="Electronics & Communication" className="bg-[#0a0d14] text-white">ECE</option>
                            <option value="Mechanical" className="bg-[#0a0d14] text-white">Mechanical</option>
                            <option value="Civil" className="bg-[#0a0d14] text-white">Civil</option>
                            <option value="Electrical" className="bg-[#0a0d14] text-white">Electrical (EEE)</option>
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
