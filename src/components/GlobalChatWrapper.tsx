"use client";

import { useAuth } from "@/context/AuthContext";
import CounsellorChat from "./CounsellorChat";

export default function GlobalChatWrapper() {
  const { user, profile } = useAuth();

  if (!user) return null;

  return <CounsellorChat studentProfile={profile} uid={user.uid} />;
}
