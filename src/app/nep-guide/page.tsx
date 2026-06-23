'use client';
import Link from 'next/link';
import ScrollReveal3D from '@/components/ScrollReveal3D';

export default function NEPGuidePage() {
  return (
    <div className="bg-[#05071a] min-h-screen text-white pt-24 pb-12 px-4 font-sans overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal3D direction="up">
          <Link href="/" className="text-[#a89ef8] text-sm font-bold hover:underline mb-8 inline-block">&larr; Back to Home</Link>
          <h1 className="text-4xl sm:text-5xl font-black mb-6 text-3d">NEP 2026: Student Guide</h1>
          <p className="text-[rgba(255,255,255,0.7)] text-lg mb-12">How the National Education Policy affects your college admission and studies in 2026.</p>
        </ScrollReveal3D>

        <div className="space-y-6">
          <ScrollReveal3D direction="up" delay={100}>
            <div className="glass-3d p-8">
              <h2 className="text-2xl font-bold mb-4">1. Multiple Entry and Exit Options</h2>
              <p className="text-white/60 leading-relaxed">Students can now exit their degree after 1 year with a certificate, 2 years with a diploma, or complete 4 years for a full honors degree. This offers unprecedented flexibility if you need to pause your studies.</p>
            </div>
          </ScrollReveal3D>

          <ScrollReveal3D direction="up" delay={200}>
            <div className="glass-3d p-8">
              <h2 className="text-2xl font-bold mb-4">2. Academic Bank of Credits (ABC)</h2>
              <p className="text-white/60 leading-relaxed">Your credits are now stored digitally. If you transfer colleges or take a break, your earned credits remain valid, allowing you to resume your education seamlessly.</p>
            </div>
          </ScrollReveal3D>

          <ScrollReveal3D direction="up" delay={300}>
            <div className="glass-3d p-8">
              <h2 className="text-2xl font-bold mb-4">3. Multidisciplinary Choices</h2>
              <p className="text-white/60 leading-relaxed">Engineering students can now minor in Music, Economics, or History. Colleges are removing rigid stream boundaries, giving you the freedom to build a unique skill set.</p>
            </div>
          </ScrollReveal3D>
        </div>
      </div>
    </div>
  );
}
