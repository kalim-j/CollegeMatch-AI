'use client';
import { useAuthGuard } from '@/lib/auth-guard';
import Link from 'next/link';
import ScrollReveal3D from '@/components/ScrollReveal3D';
import ScrollReveal from '@/components/ScrollReveal';

const SalaryChart = () => (
  <div className="w-full h-64 bg-[#f0eeff] dark:bg-white/5 border border-[rgba(127,119,221,0.2)] rounded-3xl p-6 flex items-end justify-between relative overflow-hidden group mb-12 shadow-xl">
    {/* Background Grid */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(127,119,221,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(127,119,221,0.1)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:linear-gradient(to_bottom,transparent,black)] opacity-20"></div>

    {/* Y-axis Labels */}
    <div className="absolute left-6 top-6 bottom-12 flex flex-col justify-between text-[10px] font-bold text-[#7a7399] dark:text-white/30 z-10">
      <span>₹24L+</span>
      <span>₹12L</span>
      <span>₹4L</span>
    </div>

    {/* Bars */}
    <div className="w-full ml-12 h-full flex items-end justify-between gap-2 z-10">
      {[40, 55, 45, 70, 65, 85, 100].map((h, i) => (
        <div key={i} className="w-full bg-[rgba(127,119,221,0.1)] dark:bg-white/5 rounded-t-lg relative group-hover:bg-[rgba(127,119,221,0.2)] dark:group-hover:bg-white/10 transition-colors duration-500 flex items-end">
          <div
            className="w-full bg-gradient-to-t from-[#534AB7] to-[#a89ef8] rounded-t-lg shadow-[0_0_20px_rgba(127,119,221,0.4)]"
            style={{ height: `${h}%` }}
          ></div>
        </div>
      ))}
    </div>
  </div>
);

export default function PlacementsPage() {
  const { state } = useAuthGuard();
  if (state !== 'verified') return null;

  return (
    
    <ScrollReveal direction="up">
<div className="bg-white dark:bg-[#05071a] min-h-screen text-[#1a1340] dark:text-white pt-24 pb-12 px-4 font-sans overflow-hidden transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal3D direction="up">
          <Link href="/" className="text-[#534AB7] dark:text-[#a89ef8] text-sm font-bold hover:underline mb-8 inline-block">&larr; Back to Home</Link>
          <h1 className="text-4xl sm:text-5xl font-black mb-6 text-[#1a1340] dark:text-white">Placements Explorer 2026</h1>
          <p className="text-[#5a5380] dark:text-[rgba(255,255,255,0.7)] text-lg mb-12">Analyze average salary, top companies, and placement percentages across colleges and streams.</p>
        </ScrollReveal3D>

        <ScrollReveal3D direction="up" delay={100}>
          <SalaryChart />
        </ScrollReveal3D>

        <ScrollReveal3D direction="up" delay={200}>
          <div className="bg-[#f0eeff] dark:bg-[rgba(255,255,255,0.03)] border border-[rgba(127,119,221,0.2)] dark:border-[rgba(255,255,255,0.1)] backdrop-blur-xl rounded-3xl p-12 text-center shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-[#1a1340] dark:text-white">Select a College to Analyze</h2>
            <p className="text-[#5a5380] dark:text-white/60 mb-8">AI-driven placement data is available exclusively for registered students to maintain data accuracy and prevent scraping.</p>
            <Link href="/register" className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:opacity-90 transition-opacity shadow-lg">
              Register Free to View Data
            </Link>
          </div>
        </ScrollReveal3D>
      </div>
    </div>
    </ScrollReveal>
  );
}
