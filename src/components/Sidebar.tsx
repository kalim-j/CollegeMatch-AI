"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, BookOpen, GraduationCap, LayoutDashboard } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { href: '/dashboard/scholarships', label: 'Scholarships', icon: GraduationCap },
    { href: '/dashboard/streams', label: 'Streams', icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-[#05071a]/60 border-r border-white/10 p-6 flex flex-col gap-2">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              isActive
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
