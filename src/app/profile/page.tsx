"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Camera, Save, User, MapPin, Award, BookOpen } from "lucide-react";
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
    courseLevel: "UG" as "UG" | "PG",
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
        courseLevel: (profile.courseLevel as "UG" | "PG") || "UG",
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
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error("Failed to update profile.");
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
      toast.success("Avatar updated!");
    } catch (error) {
      toast.error("Avatar upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (loading || !user) return <div className="flex items-center justify-center h-[80vh]">Loading profile...</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2">Your Profile</h1>
        <p className="text-muted-foreground">Manage your personal and academic information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Left Column: Avatar & Quick Info */}
        <div className="md:col-span-4 space-y-8">
          <Card className="rounded-[2rem] border-primary/10 shadow-lg overflow-hidden text-center">
            <CardContent className="pt-8 pb-8">
              <div className="relative inline-block group mb-6">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                  <AvatarImage src={profile?.avatarUrl} />
                  <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                    {profile?.fullName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-all">
                  <Camera className="h-5 w-5" />
                  <input type="file" className="hidden" onChange={handleAvatarUpload} disabled={uploading} accept="image/*" />
                </label>
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                    <div className="h-8 w-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold">{profile?.fullName}</h2>
              <p className="text-sm text-muted-foreground mb-6 italic">"{profile?.bio || "No bio set yet"}"</p>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm p-3 rounded-2xl bg-muted/50 border border-primary/5">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">{profile?.state ? `${profile.district}, ${profile.state}` : "Location not set"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm p-3 rounded-2xl bg-muted/50 border border-primary/5">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="font-medium">{profile?.courseLevel} - {profile?.stream || "Stream not set"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Form */}
        <div className="md:col-span-8">
          <Card className="rounded-[2rem] border-primary/10 shadow-xl overflow-hidden bg-white">
            <CardHeader className="bg-primary/5 p-8">
              <CardTitle>Edit Details</CardTitle>
              <CardDescription>Keep your profile updated for better AI matches</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <User className="h-4 w-4" /> Full Name
                    </label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="h-12 rounded-xl bg-muted/30 border-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Bio / Motto
                    </label>
                    <Input
                      placeholder="My ambition is to..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="h-12 rounded-xl bg-muted/30 border-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> State
                    </label>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="h-12 rounded-xl bg-muted/30 border-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> District
                    </label>
                    <Input
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="h-12 rounded-xl bg-muted/30 border-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-muted">
                  <Button disabled={saving} className="w-full h-14 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg font-bold gap-2">
                    {saving ? "Saving..." : "Save Profile"} <Save className="h-5 w-5" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
