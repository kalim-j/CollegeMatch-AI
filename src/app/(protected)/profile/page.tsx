"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Camera, Save, User, MapPin, BookOpen, Loader2, CheckCircle } from "lucide-react";

export default function Profile() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || "",
    bio: profile?.bio || "",
    city: profile?.city || "",
    preferredStream: profile?.preferredStream || "",
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.url) {
        await updateDoc(doc(db, "users", user!.uid), {
          photoURL: data.url,
        });
        window.location.reload(); // Refresh to update context
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user!.uid), {
        ...formData,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-start gap-12">
        {/* Left: Avatar Upload */}
        <div className="w-full md:w-1/3 flex flex-col items-center bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="relative group">
            <div className="h-40 w-40 rounded-[2.5rem] bg-gray-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-20 w-20 text-gray-200" />
              )}
            </div>
            <label className="absolute bottom-2 right-2 p-3 bg-primary text-white rounded-2xl cursor-pointer hover:scale-110 transition-transform shadow-lg shadow-primary/30">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
              <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
            </label>
          </div>
          <h2 className="text-2xl font-bold mt-8 text-gray-900">{profile?.displayName}</h2>
          <p className="text-gray-500 text-sm mt-1">{profile?.email}</p>
        </div>

        {/* Right: Form */}
        <div className="flex-grow w-full">
          <div className="bg-white p-10 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              Personal Information
              {success && <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center gap-1 animate-in fade-in slide-in-from-right-4"><CheckCircle className="h-3 w-3" /> Saved</span>}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      type="text" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all font-medium"
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block ml-1">Current City</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      type="text" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all font-medium"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block ml-1">Preferred Stream</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all font-medium appearance-none cursor-pointer"
                    value={formData.preferredStream}
                    onChange={(e) => setFormData({...formData, preferredStream: e.target.value})}
                  >
                    <option value="">Select a stream</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Medical">Medical</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block ml-1">Short Bio</label>
                <textarea 
                  rows={4}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all font-medium"
                  placeholder="Tell us about your career goals..."
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-primary text-white font-bold px-10 py-4 rounded-2xl hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Save Changes</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
