"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, BookOpen, GraduationCap, LayoutDashboard } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/scholarships', label: 'Scholarships', icon: GraduationCap },
    { href: '/dashboard/streams', label: 'Streams', icon: BookOpen },
  ];

  return (
    <aside className="hidden sm:flex flex-col w-64 bg-white/80 backdrop-blur-2xl border-r border-purple-100 shadow-xl shadow-purple-50/50 h-screen sticky top-0 p-6 gap-2">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-purple-100 mb-4">
        <div className="w-10 h-10 rounded-xl flex-shrink-0 bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <span className="text-white font-black text-sm">CM</span>
        </div>
        <div className="min-w-0">
          <p className="text-gray-900 font-bold text-sm leading-tight">
            CollegeMatch
          </p>
          <p className="text-purple-600 text-xs font-semibold">AI</p>
        </div>
      </div>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? "bg-purple-50 text-purple-700 border border-purple-200 font-semibold"
                : "text-gray-500 hover:bg-purple-50/50 hover:text-purple-600 transition-all"
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
