"use client";

import { useAuth } from "@/context/AuthContext";
import CounsellorChat from "./CounsellorChat";
import { usePathname } from "next/navigation";

export default function GlobalChatWrapper() {
  const { user, profile } = useAuth();
  const pathname = usePathname();

  if (!user || !pathname?.startsWith('/dashboard')) return null;

  return <CounsellorChat studentProfile={profile} uid={user.uid} />;
}
