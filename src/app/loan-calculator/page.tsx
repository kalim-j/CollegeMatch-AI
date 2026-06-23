'use client';
import { useState } from 'react';
import Link from 'next/link';
import ScrollReveal3D from '@/components/ScrollReveal3D';

export default function LoanCalculatorPage() {
  const [amount, setAmount] = useState(800000);
  
  const calculateEMI = (principal: number, rate: number, years: number) => {
    const r = rate / 12 / 100;
    const n = years * 12;
    if (r === 0) return principal / n;
    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  const rates = [
    { label: 'Govt Bank (SBI/PNB)', rate: 8.5, color: 'text-emerald-400' },
    { label: 'Private Bank (HDFC/ICICI)', rate: 11.0, color: 'text-amber-400' },
    { label: 'NBFC (Avanse/Credila)', rate: 14.0, color: 'text-rose-400' },
  ];

  return (
    <div className="bg-[#05071a] min-h-screen text-white pt-24 pb-12 px-4 font-sans overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal3D direction="up">
          <Link href="/" className="text-[#a89ef8] text-sm font-bold hover:underline mb-8 inline-block">&larr; Back to Home</Link>
          <h1 className="text-4xl sm:text-5xl font-black mb-6 text-3d">Education Loan Calculator</h1>
          <p className="text-[rgba(255,255,255,0.7)] text-lg mb-12">Compare EMI options across Government banks, Private banks, and NBFCs.</p>
        </ScrollReveal3D>

        <ScrollReveal3D direction="scale">
          <div className="glass-3d p-8 mb-12">
            <label className="block text-sm font-bold text-white/60 mb-4">Total Loan Amount (₹)</label>
            <input 
              type="range" 
              min="100000" 
              max="3000000" 
              step="50000" 
              value={amount} 
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full accent-[#7F77DD] mb-4"
            />
            <div className="text-4xl font-black text-[#a89ef8]">₹{amount.toLocaleString('en-IN')}</div>
          </div>
        </ScrollReveal3D>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rates.map((r, i) => (
            <ScrollReveal3D key={i} direction="up" delay={i * 100}>
              <div className="glass-3d p-6 h-full border-t-2 border-t-white/10 hover:border-t-[#7F77DD] transition-colors">
                <h3 className="font-bold text-lg mb-2">{r.label}</h3>
                <div className={`text-3xl font-black ${r.color} mb-6`}>{r.rate}% <span className="text-sm font-normal text-white/50">p.a.</span></div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-white/60">5 Years</span>
                    <span className="font-bold">₹{calculateEMI(amount, r.rate, 5).toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-white/60">7 Years</span>
                    <span className="font-bold">₹{calculateEMI(amount, r.rate, 7).toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">10 Years</span>
                    <span className="font-bold">₹{calculateEMI(amount, r.rate, 10).toLocaleString('en-IN')}/mo</span>
                  </div>
                </div>
              </div>
            </ScrollReveal3D>
          ))}
        </div>
      </div>
    </div>
  );
}
