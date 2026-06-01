import React from 'react';
import { GraduationCap, Sparkles } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-teal-500 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300">
          <GraduationCap className="text-white" size={26} />
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-teal-400 rounded-full border-2 border-[#05071a] flex items-center justify-center">
            <Sparkles size={8} className="text-[#05071a] fill-current" />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-black text-[var(--text-primary)] tracking-tighter leading-none group-hover:text-indigo-400 transition-colors">
          CollegeMatch<span className="text-indigo-500">.AI</span>
        </span>
        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1.5 leading-none">
          Institutional Intelligence
        </span>
      </div>
    </div>
  );
}
