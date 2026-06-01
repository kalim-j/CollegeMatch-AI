"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { 
  Camera, Save, User, MapPin, 
  Phone, Loader2,
  Sparkles, ShieldCheck, Mail, Briefcase,
  Target
} from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    state: "",
    district: "",
    stream: "",
    preferredCourse: "",
    courseLevel: "UG" as "UG" | "PG",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        bio: profile.bio || "",
        state: profile.state || "",
        district: profile.district || "",
        stream: profile.stream || "",
        preferredCourse: profile.preferredCourse || "",
        courseLevel: (profile.courseLevel as "UG" | "PG") || "UG",
        phone: profile.phone || "",
      });
    }
  }, [profile, user, loading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...formData,
        updatedAt: new Date(),
      });
      await refreshProfile();
      toast.success("Intelligence profile updated!");
    } catch (error: any) {
      toast.error("Failed to update profile data.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "eduanalytics_avatars");
    data.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "");

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: data,
      });
      const fileData = await res.json();
      const url = fileData.secure_url;

      await updateDoc(doc(db, "users", user.uid), {
        avatarUrl: url,
      });
      await refreshProfile();
      toast.success("Identity updated!");
    } catch (error) {
      toast.error("Avatar upload sequence failed.");
    } finally {
      setUploading(false);
    }
  };

  if (loading || !user) return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] flex items-center justify-center">
      <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] text-gray-900 relative overflow-hidden selection:bg-purple-250/20 pt-24">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-6xl relative z-10">
        <header className="mb-12 md:mb-16 space-y-3 md:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-purple-50 border border-purple-100 shadow-sm">
            <ShieldCheck size={12} className="text-purple-650" />
            <span className="text-[9px] md:text-[10px] font-black text-purple-700 uppercase tracking-widest">Identity Management</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-950 tracking-tight">Your Profile</h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] text-[9px] md:text-[10px]">Manage your personal and academic intelligence</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Identity Card */}
          <div className="lg:col-span-4 space-y-6 lg:space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl border border-purple-100 bg-white/70 backdrop-blur-xl overflow-hidden shadow-sm relative"
            >
              <div className="h-24 lg:h-32 bg-gradient-to-r from-purple-600/10 to-indigo-650/10 border-b border-purple-100" />
              <div className="px-6 lg:px-8 pb-8 lg:pb-10 -mt-12 lg:-mt-16 flex flex-col items-center text-center">
                <div className="relative group mb-4 lg:mb-6">
                  <Avatar className="h-32 w-32 lg:h-40 lg:w-40 border-4 lg:border-[6px] border-white shadow-md">
                    <AvatarImage src={profile?.avatarUrl} className="object-cover" />
                    <AvatarFallback className="text-4xl lg:text-5xl font-bold bg-purple-50 text-purple-700">
                      {profile?.fullName?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-1 right-1 lg:bottom-2 lg:right-2 h-10 w-10 lg:h-12 lg:w-12 rounded-xl lg:rounded-2xl bg-purple-650 bg-purple-600 text-white flex items-center justify-center cursor-pointer shadow-md hover:scale-110 transition-all border-2 lg:border-4 border-white">
                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                    <input type="file" className="hidden" onChange={handleAvatarUpload} disabled={uploading} accept="image/*" />
                  </label>
                </div>
                
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-950 tracking-tight leading-tight">{profile?.fullName}</h2>
                <p className="text-purple-600 font-bold text-xs uppercase tracking-widest mt-2">{profile?.courseLevel} Student</p>
                <div className="w-full h-px bg-purple-100 my-6 lg:my-8" />
                
                <div className="space-y-3 lg:space-y-4 w-full">
                  <div className="flex items-center gap-3 lg:gap-4 text-sm p-4 lg:p-5 rounded-2xl bg-white border border-purple-100 text-gray-500 shadow-sm">
                    <Mail size={16} className="text-purple-650 flex-shrink-0" />
                    <span className="font-bold truncate text-xs lg:text-sm">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 lg:gap-4 text-sm p-4 lg:p-5 rounded-2xl bg-white border border-purple-100 text-gray-500 shadow-sm">
                    <MapPin size={16} className="text-purple-650 flex-shrink-0" />
                    <span className="font-bold text-left text-xs lg:text-sm">{profile?.state ? `${profile.district}, ${profile.state}` : "Location not set"}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Update Intelligence Form */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-3xl border border-purple-100 bg-white/70 backdrop-blur-xl overflow-hidden shadow-sm"
            >
              <div className="p-6 md:p-10 lg:p-14">
                <form onSubmit={handleUpdateProfile} className="space-y-6 md:space-y-8 lg:space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <User size={12} className="text-purple-605 text-purple-600" /> Full Name
                      </label>
                      <input
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full h-14 md:h-16 bg-white border border-purple-200 rounded-xl md:rounded-2xl px-4 md:px-6 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 transition-all placeholder:text-gray-400"
                        required
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <Sparkles size={12} className="text-purple-605 text-purple-600" /> Personal Bio
                      </label>
                      <input
                        placeholder="My ambition is to..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full h-14 md:h-16 bg-white border border-purple-200 rounded-xl md:rounded-2xl px-4 md:px-6 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 transition-all placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <MapPin size={12} className="text-purple-650 text-purple-600" /> State
                      </label>
                      <input
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full h-14 md:h-16 bg-white border border-purple-200 rounded-xl md:rounded-2xl px-4 md:px-6 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 transition-all placeholder:text-gray-400"
                        placeholder="e.g. Tamil Nadu"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <MapPin size={12} className="text-purple-650 text-purple-600" /> District
                      </label>
                      <input
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full h-14 md:h-16 bg-white border border-purple-200 rounded-xl md:rounded-2xl px-4 md:px-6 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 transition-all placeholder:text-gray-400"
                        placeholder="e.g. Chennai"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <Briefcase size={12} className="text-purple-650 text-purple-600" /> Targeted Stream
                      </label>
                      <input
                        value={formData.stream}
                        onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                        className="w-full h-14 md:h-16 bg-white border border-purple-200 rounded-xl md:rounded-2xl px-4 md:px-6 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 transition-all placeholder:text-gray-400"
                        placeholder="e.g. Engineering"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <Target size={12} className="text-purple-650 text-purple-600" /> Preferred Course
                      </label>
                      <input
                        value={formData.preferredCourse}
                        onChange={(e) => setFormData({ ...formData, preferredCourse: e.target.value })}
                        className="w-full h-14 md:h-16 bg-white border border-purple-200 rounded-xl md:rounded-2xl px-4 md:px-6 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 transition-all placeholder:text-gray-400"
                        placeholder="e.g. Computer Science, Mechanical Engineering"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <Phone size={12} className="text-purple-650 text-purple-600" /> Secure Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-14 md:h-16 bg-white border border-purple-200 rounded-xl md:rounded-2xl px-4 md:px-6 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="pt-6 md:pt-8 border-t border-purple-100 flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                    <button 
                      type="submit" 
                      disabled={saving} 
                      className="h-16 px-12 text-xs font-semibold uppercase bg-purple-600 hover:bg-purple-750 text-white rounded-2xl transition-all shadow-md shadow-purple-200/20 flex items-center justify-center gap-3 w-full sm:w-auto animate-pulse"
                    >
                      {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                      {saving ? "Updating Profile..." : "Commit Changes"}
                    </button>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic text-center sm:text-left">
                      Identity data is used for personalized AI matching algorithms.
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
