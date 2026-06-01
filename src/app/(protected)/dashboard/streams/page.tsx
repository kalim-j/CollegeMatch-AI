'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const STREAMS = [
  {
    name: 'Engineering',
    count: '200+',
    color: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-200',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" className="w-7 h-7">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    courses: ['Computer Science','Mechanical','Civil','Electronics','Chemical'],
    desc: 'Top engineering colleges across India',
  },
  {
    name: 'Medical',
    count: '150+',
    color: 'from-red-400 to-pink-500',
    bgLight: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" className="w-7 h-7">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    courses: ['MBBS','BDS','BAMS','BHMS','Pharmacy'],
    desc: 'NEET qualified medical institutions',
  },
  {
    name: 'Management',
    count: '180+',
    color: 'from-blue-500 to-cyan-500',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" className="w-7 h-7">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
        <line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
    courses: ['MBA','BBA','PGDM','Finance','Marketing'],
    desc: 'Top B-schools and management institutes',
  },
  {
    name: 'Law',
    count: '80+',
    color: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" className="w-7 h-7">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    courses: ['LLB','BA LLB','BBA LLB','LLM'],
    desc: 'Top law schools and NLUs',
  },
  {
    name: 'Science',
    count: '120+',
    color: 'from-emerald-500 to-teal-500',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" className="w-7 h-7">
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
      </svg>
    ),
    courses: ['BSc Physics','BSc Chemistry','BSc Maths','BSc Biology'],
    desc: 'Pure science and research institutes',
  },
  {
    name: 'Commerce',
    count: '100+',
    color: 'from-teal-500 to-cyan-600',
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" className="w-7 h-7">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
    courses: ['BCom','CA','CMA','CS','Economics'],
    desc: 'Top commerce and finance colleges',
  },
  {
    name: 'Arts',
    count: '90+',
    color: 'from-pink-500 to-rose-500',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-200',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" className="w-7 h-7">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>
      </svg>
    ),
    courses: ['BA','Mass Comm','Journalism','Psychology'],
    desc: 'Liberal arts and humanities colleges',
  },
  {
    name: 'Agriculture',
    count: '60+',
    color: 'from-lime-500 to-green-600',
    bgLight: 'bg-lime-50',
    textColor: 'text-lime-700',
    borderColor: 'border-lime-200',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" className="w-7 h-7">
        <path d="M12 2a10 10 0 01-7.743 9.715C3.54 13.252 3 14.556 3 16c0 2.21 4.03 4 9 4s9-1.79 9-4c0-1.444-.54-2.748-1.257-4.285A10 10 0 0112 2z"/>
        <path d="M12 12V2"/>
      </svg>
    ),
    courses: ['BSc Agriculture','Horticulture','Forestry','Veterinary'],
    desc: 'Agricultural universities across India',
  },
  {
    name: 'Design',
    count: '50+',
    color: 'from-violet-400 to-fuchsia-500',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-200',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" className="w-7 h-7">
        <path d="M12 19l7-7 3 3-7 7-3-3z"/>
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
        <path d="M2 2l7.586 7.586"/>
        <circle cx="11" cy="11" r="2"/>
      </svg>
    ),
    courses: ['B.Arch','B.Des','Interior Design','Fashion Design'],
    desc: 'NID, NIFT and top design institutes',
  },
  {
    name: 'Computer Applications',
    count: '140+',
    color: 'from-indigo-500 to-blue-600',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" className="w-7 h-7">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
        <path d="M7 8l3 3-3 3M13 14h4"/>
      </svg>
    ),
    courses: ['BCA','MCA','BSc IT','BSc CS'],
    desc: 'Computer application and IT colleges',
  },
  {
    name: 'Pharmacy',
    count: '70+',
    color: 'from-sky-500 to-blue-500',
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-700',
    borderColor: 'border-sky-200',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" className="w-7 h-7">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"/>
        <path d="M3 21h18M9 8h6M12 8v8"/>
      </svg>
    ),
    courses: ['B.Pharm','M.Pharm','PharmD','D.Pharm'],
    desc: 'Top pharmacy colleges in India',
  },
  {
    name: 'Hotel Management',
    count: '40+',
    color: 'from-orange-400 to-red-500',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" className="w-7 h-7">
        <path d="M3 22V12M3 12V8l9-6 9 6v4M3 12h18M21 22V12M9 22v-4h6v4"/>
      </svg>
    ),
    courses: ['BHM','BSc Hospitality','Culinary Arts'],
    desc: 'IHMs and top hospitality colleges',
  },
];

export default function StreamsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const elements = document.querySelectorAll('[data-animate]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              (entry.target as HTMLElement).style.opacity = '1';
              (entry.target as HTMLElement).style.transform = 'translateY(0)';
            }, i * 80);
          }
        });
      },
      { threshold: 0.1 }
    );
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="min-h-screen p-4 sm:p-6 pb-24 sm:pb-6"
      style={{ background: 'linear-gradient(135deg, #f0f4ff, #faf5ff, #f0f9ff)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Explore Educational Streams</h1>
          <p className="text-gray-500">Discover key fields, courses, and match criteria to find your ideal discipline.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STREAMS.map((stream, i) => (
            <div
              key={stream.name}
              onClick={() => {
                setSelected(selected === stream.name ? null : stream.name);
                if (selected !== stream.name) {
                  router.push(`/stream/${stream.name.toLowerCase().replace(/\s+/g, '-')}`);
                }
              }}
              className={`group cursor-pointer rounded-2xl p-6
                bg-white/70 backdrop-blur-xl
                border transition-all duration-300
                hover:-translate-y-2 hover:scale-[1.02]
                ${stream.borderColor}
                ${selected === stream.name
                  ? `shadow-xl border-2 ${stream.borderColor}`
                  : 'hover:shadow-xl border'
                }`}
              style={{
                animationDelay: `${i * 60}ms`,
                animation: 'fadeSlideUp 0.5s ease forwards',
                opacity: 0,
                boxShadow: selected === stream.name
                  ? '0 20px 40px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.9)'
                  : undefined,
              }}
            >
              {/* Glassy icon container */}
              <div className={`w-14 h-14 rounded-2xl mb-4
                bg-gradient-to-br ${stream.color}
                flex items-center justify-center text-white
                shadow-lg transition-all duration-300
                group-hover:scale-110 group-hover:rotate-3`}
                style={{
                  boxShadow: `0 8px 20px rgba(124,58,237,0.3)`,
                  background: `linear-gradient(135deg, ${stream.color})`,
                }}>
                {stream.svgIcon}
              </div>

              <h3 className={`font-bold text-lg mb-1 ${stream.textColor}`}>
                {stream.name}
              </h3>
              <p className="text-purple-500 text-sm font-semibold mb-2">
                {stream.count} colleges
              </p>
              <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                {stream.desc}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {stream.courses.slice(0, 3).map(c => (
                  <span key={c}
                    className={`px-2 py-0.5 rounded-md text-xs
                      ${stream.bgLight} ${stream.textColor}
                      border ${stream.borderColor} font-medium`}>
                    {c}
                  </span>
                ))}
              </div>

              <div className={`flex items-center gap-1 text-sm font-semibold
                ${stream.textColor} group-hover:gap-2 transition-all`}>
                Explore
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" className="w-4 h-4
                    group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
