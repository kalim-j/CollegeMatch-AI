"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user && profile && profile.emailVerified === false) {
      router.push("/verify-otp");
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05071a]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            </div>
          </div>
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
            Verifying your session…
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // NOTE: Optional feature block if we want to enforce verification globally:
  // We don't want to break it if `profile` hasn't loaded yet.
  // Wait until profile is loaded or just rely on Firebase's emailVerified for Google sign-in.
  // Actually, we'll check `profile` in `Dashboard` itself if needed, or we can check here.

  return (
    <>
      {children}
    </>
  );
}
