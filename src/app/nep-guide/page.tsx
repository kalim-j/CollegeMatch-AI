'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, GraduationCap, Clock, Award } from 'lucide-react';
import Logo from '@/components/Logo';

export default function NEPGuidePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Navbar Minimal */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-card)] backdrop-blur-2xl border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo size="sm" showTagline={false} />
          </Link>
          <Link href="/cutoff-calculator" className="text-sm font-bold text-white bg-[#534AB7] px-5 py-2.5 rounded-full hover:bg-[#433B9B] transition-colors shadow-lg shadow-[#534AB7]/30">
            Check Cutoff Instead
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[#534AB7] mb-8 font-medium transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <span className="text-xs font-black text-blue-500 uppercase tracking-widest">Official Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-6">
              NEP 2026: The Complete Guide for Indian Students
            </h1>
            <p className="text-xl text-[var(--text-muted)] leading-relaxed">
              The National Education Policy (NEP) is completely changing how college admissions and degrees work in India starting 2026. Here's everything you need to know without the confusing jargon.
            </p>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid sm:grid-cols-2 gap-6 mb-16">
            {[
              { icon: BookOpen, title: "4-Year Degrees", desc: "UG programs are now 4 years, with research built-in." },
              { icon: Clock, title: "Multiple Entry/Exit", desc: "Leave after 1, 2, or 3 years with a valid certificate." },
              { icon: GraduationCap, title: "CUET Integration", desc: "Centralized testing becomes the main admission path." },
              { icon: Award, title: "Academic Bank of Credits", desc: "Store credits digitally and transfer between colleges." }
            ].map((feature, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl"
              >
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 text-purple-500">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{feature.title}</h3>
                <p className="text-[var(--text-muted)] text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Deep Dive Content */}
          <div className="space-y-12 text-[var(--text-primary)] prose prose-lg dark:prose-invert max-w-none">
            <section>
              <h2 className="text-3xl font-bold mb-4">1. The 4-Year Undergraduate Program (FYUP)</h2>
              <p className="text-[var(--text-muted)] leading-relaxed mb-4">
                The biggest change is the shift from 3-year to 4-year undergraduate degrees. You can still exit after 3 years, but staying for the 4th year allows you to do intense research and get a "Degree with Honours/Research".
              </p>
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-xl">
                <ul className="space-y-3 m-0 list-none p-0">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 font-bold">Year 1 Exit:</span>
                    <span>Get an <strong>Undergraduate Certificate</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 font-bold">Year 2 Exit:</span>
                    <span>Get an <strong>Undergraduate Diploma</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 font-bold">Year 3 Exit:</span>
                    <span>Get a <strong>Bachelor's Degree</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 font-bold">Year 4 Exit:</span>
                    <span>Get a <strong>Bachelor's Degree (Honours/Research)</strong></span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">2. Academic Bank of Credits (ABC)</h2>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Think of this as a digital bank account, but for your college credits. If you drop out of college A after 2 years, your credits are saved in the ABC. You can join college B three years later and resume from year 3 using your saved credits.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">3. Multidisciplinary Choices</h2>
              <p className="text-[var(--text-muted)] leading-relaxed">
                The strict walls between Arts, Science, and Commerce are gone. Want to study Physics with a minor in History? Or Computer Science with Music? Under NEP 2026, colleges must allow students to pick subjects across disciplines.
              </p>
            </section>
          </div>

          {/* CTA */}
          <div className="mt-16 bg-gradient-to-br from-[#7F77DD] to-[#5DCAA5] rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-4">Ready to start your college journey?</h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Our AI considers NEP guidelines, your marks, and your personality to find your perfect college match.
              </p>
              <Link href="/discover" className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#1a1340] font-bold rounded-xl hover:scale-105 transition-transform">
                Find My Path Now
              </Link>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          </div>
        </div>
      </main>
    </div>
  );
}
