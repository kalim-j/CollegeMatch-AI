'use client';
import Link from 'next/link';
import ScrollReveal3D from '@/components/ScrollReveal3D';

export default function ParentGuidePage() {
  return (
    <div className="bg-[#05071a] min-h-screen text-white pt-24 pb-12 px-4 font-sans overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal3D direction="up">
          <Link href="/" className="text-[#a89ef8] text-sm font-bold hover:underline mb-8 inline-block">&larr; Back to Home</Link>
          <h1 className="text-4xl sm:text-5xl font-black mb-6 text-3d">For Parents: Data Over Promises</h1>
          <p className="text-[rgba(255,255,255,0.7)] text-lg mb-12">We know you're worried about fees, safety, and jobs. We have verified answers.</p>
        </ScrollReveal3D>

        <div className="space-y-6">
          <ScrollReveal3D direction="up" delay={100}>
            <div className="glass-3d p-8">
              <h2 className="text-2xl font-bold mb-4 text-[#a89ef8]">Are the placements real?</h2>
              <p className="text-white/70 leading-relaxed">Colleges often advertise highest packages that apply to only 1-2 students. Our platform shows you the median salary and the percentage of students actually placed, pulled from verified NIRF data.</p>
            </div>
          </ScrollReveal3D>

          <ScrollReveal3D direction="up" delay={200}>
            <div className="glass-3d p-8">
              <h2 className="text-2xl font-bold mb-4 text-[#5DCAA5]">What are the true fees?</h2>
              <p className="text-white/70 leading-relaxed">Tuition is just the start. We help you calculate hostel fees, mess fees, and hidden charges to give you the exact 4-year cost before you commit.</p>
            </div>
          </ScrollReveal3D>

          <ScrollReveal3D direction="up" delay={300}>
            <div className="glass-3d p-8">
              <h2 className="text-2xl font-bold mb-4 text-amber-400">Which streams have jobs?</h2>
              <p className="text-white/70 leading-relaxed">We analyze current hiring trends. While AI is growing, core branches like Mechanical and Civil still offer steady government opportunities. We break down the 10-year outlook for each stream.</p>
            </div>
          </ScrollReveal3D>
        </div>
      </div>
    </div>
  );
}
