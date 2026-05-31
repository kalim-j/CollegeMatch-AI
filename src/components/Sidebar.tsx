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
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06] mb-4">
        <div className="w-10 h-10 rounded-xl flex-shrink-0 bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <span className="text-white font-black text-sm">CM</span>
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm leading-tight">
            CollegeMatch
          </p>
          <p className="text-purple-400 text-xs font-medium">AI</p>
        </div>
      </div>
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
