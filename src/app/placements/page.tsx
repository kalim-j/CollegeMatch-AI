'use client';
import Link from 'next/link';
import ScrollReveal3D from '@/components/ScrollReveal3D';

export default function PlacementsPage() {
  return (
    <div className="bg-[#05071a] min-h-screen text-white pt-24 pb-12 px-4 font-sans overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal3D direction="up">
          <Link href="/" className="text-[#a89ef8] text-sm font-bold hover:underline mb-8 inline-block">&larr; Back to Home</Link>
          <h1 className="text-4xl sm:text-5xl font-black mb-6 text-3d">Placements Explorer 2026</h1>
          <p className="text-[rgba(255,255,255,0.7)] text-lg mb-12">Analyze average salary, top companies, and placement percentages across colleges and streams.</p>
        </ScrollReveal3D>

        <ScrollReveal3D direction="up" delay={100}>
          <div className="glass-3d p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Select a College to Analyze</h2>
            <p className="text-white/60 mb-8">AI-driven placement data is available exclusively for registered students to maintain data accuracy and prevent scraping.</p>
            <Link href="/register" className="btn-3d px-8 py-3 rounded-xl bg-gradient-to-r from-[#7F77DD] to-indigo-600 font-bold inline-block">
              Register Free to View Data
            </Link>
          </div>
        </ScrollReveal3D>
      </div>
    </div>
  );
}
