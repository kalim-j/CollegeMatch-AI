'use client';
import Link from 'next/link';
import ScrollReveal3D from '@/components/ScrollReveal3D';

export default function FirstGenPage() {
  return (
    <div className="bg-[#05071a] min-h-screen text-white pt-24 pb-12 px-4 font-sans overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal3D direction="up">
          <Link href="/" className="text-[#a89ef8] text-sm font-bold hover:underline mb-8 inline-block">&larr; Back to Home</Link>
          <h1 className="text-4xl sm:text-5xl font-black mb-6 text-3d">First-Generation Student Guide</h1>
          <p className="text-[rgba(255,255,255,0.7)] text-lg mb-12">You're making history in your family. Let our AI be your guidance counselor.</p>
        </ScrollReveal3D>

        <div className="grid gap-6">
          <ScrollReveal3D direction="up" delay={100}>
            <div className="glass-3d p-8">
              <h2 className="text-2xl font-bold mb-2">Step 1: Understand the Admission Process</h2>
              <p className="text-white/60">We break down counseling processes like TNEA into simple, actionable steps. No jargon. No confusion. Just clear dates and document checklists.</p>
            </div>
          </ScrollReveal3D>

          <ScrollReveal3D direction="up" delay={200}>
            <div className="glass-3d p-8">
              <h2 className="text-2xl font-bold mb-2">Step 2: Free AI Counselling 24/7</h2>
              <p className="text-white/60">Have a question at 2 AM? Our AI counselor is trained on years of historical admission data to answer your questions accurately without any consulting fees.</p>
            </div>
          </ScrollReveal3D>

          <ScrollReveal3D direction="up" delay={300}>
            <div className="glass-3d p-8">
              <h2 className="text-2xl font-bold mb-2">Step 3: Secure Scholarships First</h2>
              <p className="text-white/60">Money shouldn't stop your education. We scan over 1000+ government and private scholarships to find the ones you qualify for instantly.</p>
            </div>
          </ScrollReveal3D>
        </div>
      </div>
    </div>
  );
}
