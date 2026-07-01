'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Filter, GraduationCap, Sparkles, BookOpen, Briefcase, Scale, Leaf, Building2, X } from 'lucide-react';
import Link from 'next/link';
import DashboardBackground from '@/components/3D/DashboardBackground';

// Dynamically import the map — prevents SSR issues with Leaflet
const CollegeMapComponent = dynamic(
  () => import('@/components/CollegeMapComponent'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: 500, borderRadius: 16,
          background: 'linear-gradient(135deg, #1a1340 0%, #0f0b2a 100%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            width: 48, height: 48,
            border: '3px solid rgba(127,119,221,0.3)',
            borderTopColor: '#7F77DD',
            borderRadius: '50%',
            animation: 'spin 0.9s linear infinite',
          }}
        />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, margin: 0 }}>
          Preparing map…
        </p>
      </div>
    ),
  }
);

const STREAMS = [
  { id: 'all', label: 'All Streams', icon: Sparkles },
  { id: 'Engineering', label: 'Engineering', icon: GraduationCap },
  { id: 'Medical', label: 'Medical', icon: BookOpen },
  { id: 'MBA', label: 'MBA', icon: Briefcase },
  { id: 'Law', label: 'Law', icon: Scale },
  { id: 'Arts & Science', label: 'Arts & Science', icon: Building2 },
  { id: 'Agriculture', label: 'Agriculture', icon: Leaf },
];

const STATS = [
  { value: '37+', label: 'Colleges Mapped' },
  { value: '10+', label: 'States Covered' },
  { value: '6+', label: 'Streams' },
  { value: '100%', label: 'Free to Explore' },
];

export default function CollegeMapPage() {
  const [activeStream, setActiveStream] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-indigo-50 to-white dark:from-[#0a0d24] dark:to-[#0f0b2a]">
      <DashboardBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-24">

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors text-sm font-semibold"
          >
            ← Back to Dashboard
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 bg-purple-100 border border-purple-200 dark:bg-purple-900/20 dark:border-purple-500/30">
                <MapPin size={13} className="text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-widest">Interactive Map</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2">
                College Map{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
                  Explorer
                </span>
              </h1>
              <p className="text-gray-600 dark:text-slate-400 font-medium max-w-lg">
                Explore top colleges across India on an interactive map. Click any pin to see details.
              </p>
            </div>
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border ${
                showFilters 
                ? "bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-500/50 dark:text-purple-300"
                : "bg-white border-gray-200 text-gray-700 dark:bg-white/5 dark:border-white/10 dark:text-white/70 shadow-sm dark:shadow-none"
              }`}
            >
              {showFilters ? <X size={15} /> : <Filter size={15} />}
              {showFilters ? 'Hide' : 'Filter'} Streams
            </button>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-4 text-center bg-white border border-gray-200 dark:bg-white/5 dark:border-white/10 shadow-sm dark:shadow-none"
            >
              <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Stream filter pills */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-2">
              {STREAMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveStream(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                    activeStream === id
                      ? 'bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/40 dark:border-purple-500/60 dark:text-purple-300 scale-[1.03] shadow-md dark:shadow-none'
                      : 'bg-white border-gray-200 text-gray-600 dark:bg-white/5 dark:border-white/10 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/10 scale-100 shadow-sm dark:shadow-none'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl overflow-hidden shadow-xl dark:shadow-[0_24px_64px_rgba(0,0,0,0.5),0_0_0_1px_rgba(127,119,221,0.15)] border border-gray-200 dark:border-none"
        >
          <CollegeMapComponent />
        </motion.div>

        {/* Legend / tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { icon: '🟢', label: 'Government Colleges', desc: 'Fully funded, lower fees' },
            { icon: '🟣', label: 'Private / Autonomous', desc: 'Industry-driven curriculum' },
            { icon: '🟠', label: 'Deemed Universities', desc: 'Specialized excellence' },
          ].map(({ icon, label, desc }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl p-4 bg-white border border-gray-200 dark:bg-white/5 dark:border-white/10 shadow-sm dark:shadow-none"
            >
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-600 dark:text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 p-6 rounded-2xl text-center bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 dark:from-purple-900/20 dark:to-blue-900/15 dark:border-purple-500/30 shadow-sm dark:shadow-none"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to find your college?</h3>
          <p className="text-gray-600 dark:text-slate-400 text-sm mb-4">
            Let our AI analyze your marks, preferences, and budget to recommend the best colleges for you.
          </p>
          <Link
            href="/interview"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #7F77DD, #3b82f6)' }}
          >
            <Sparkles size={15} />
            Start AI College Matching
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
