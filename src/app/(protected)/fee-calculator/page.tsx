'use client';
import { useState, useMemo } from 'react';
import { Calculator, DollarSign, Percent, Calendar, IndianRupee, PieChart as PieChartIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import PageTransition from '@/components/3D/PageTransition';

export default function FeeCalculatorPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(5);

  const { emi, totalInterest, totalAmount } = useMemo(() => {
    const p = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenureYears * 12;
    
    if (p === 0 || r === 0 || n === 0) return { emi: 0, totalInterest: 0, totalAmount: 0 };
    
    const emiCalc = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmt = emiCalc * n;
    const totalInt = totalAmt - p;
    
    return {
      emi: Math.round(emiCalc),
      totalInterest: Math.round(totalInt),
      totalAmount: Math.round(totalAmt)
    };
  }, [loanAmount, interestRate, tenureYears]);

  return (
    <PageTransition>
      <div className={`min-h-screen p-6 pb-24 ${isDark ? 'bg-[#05071a] text-white' : 'bg-[#f8f7ff] text-gray-900'}`}>
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
              Fee EMI Calculator
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg max-w-2xl mx-auto`}>
              Plan your educational finances. Calculate your monthly EMI and total interest for education loans.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`p-8 rounded-3xl border shadow-xl h-fit ${
              isDark ? 'bg-slate-900/60 border-blue-900/20 backdrop-blur-xl' : 'bg-white border-blue-100'
            }`}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calculator className="text-blue-500" /> Loan Details
              </h2>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <IndianRupee size={16} /> Total Loan Amount
                    </label>
                    <div className="font-bold text-xl bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-lg">
                      ₹ {loanAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <input 
                    type="range" min="100000" max="5000000" step="50000"
                    value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))}
                    className="w-full accent-blue-500 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>₹1 Lakh</span>
                    <span>₹50 Lakhs</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Percent size={16} /> Interest Rate (p.a)
                    </label>
                    <div className="font-bold text-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-3 py-1 rounded-lg">
                      {interestRate}%
                    </div>
                  </div>
                  <input 
                    type="range" min="5" max="15" step="0.1"
                    value={interestRate} onChange={e => setInterestRate(Number(e.target.value))}
                    className="w-full accent-indigo-500 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>5%</span>
                    <span>15%</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={16} /> Loan Tenure
                    </label>
                    <div className="font-bold text-xl bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-3 py-1 rounded-lg">
                      {tenureYears} Years
                    </div>
                  </div>
                  <input 
                    type="range" min="1" max="15" step="1"
                    value={tenureYears} onChange={e => setTenureYears(Number(e.target.value))}
                    className="w-full accent-purple-500 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>1 Year</span>
                    <span>15 Years</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-8 rounded-3xl border shadow-xl flex flex-col justify-center ${
              isDark ? 'bg-slate-900/60 border-indigo-900/20 backdrop-blur-xl' : 'bg-white border-indigo-100'
            }`}>
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 justify-center">
                <PieChartIcon className="text-indigo-500" /> Repayment Summary
              </h2>
              
              <div className="space-y-6">
                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                  <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Monthly EMI</p>
                  <div className="text-5xl font-black tabular-nums">
                    ₹ {emi.toLocaleString('en-IN')}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 text-center rounded-2xl border ${
                    isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Principal</p>
                    <div className="text-xl font-bold text-blue-500 dark:text-blue-400">
                      ₹ {loanAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  
                  <div className={`p-4 text-center rounded-2xl border ${
                    isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Interest</p>
                    <div className="text-xl font-bold text-purple-500 dark:text-purple-400">
                      ₹ {totalInterest.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className={`p-4 text-center rounded-2xl border flex flex-col items-center ${
                  isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount Payable</p>
                  <div className="text-2xl font-black text-gray-900 dark:text-white">
                    ₹ {totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
