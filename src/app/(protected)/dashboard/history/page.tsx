"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectHistory() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/history");
  }, [router]);
  return null;
}
