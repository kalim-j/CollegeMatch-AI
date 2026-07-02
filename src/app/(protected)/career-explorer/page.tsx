'use client';
import { useState } from 'react';
import { Briefcase, Loader2, Sparkles, TrendingUp, IndianRupee, Building, Target, Award } from 'lucide-react';
import { useTheme } from 'next-themes';
import PageTransition from '@/components/3D/PageTransition';
import SelectField from '@/components/SelectField';

export default function CareerExplorerPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [loading, setLoading] = useState(false);
  const [careerData, setCareerData] = useState<any>(null);
  const [error, setError] = useState('');
  
  const [career, setCareer] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Entry Level (0-2 years)');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/career-salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ career, experienceLevel }),
      });
      
      if (!res.ok) throw new Error('Failed to get career data');
      const data = await res.json();
      setCareerData(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className={`min-h-screen p-6 pb-24 ${isDark ? 'bg-[#05071a] text-white' : 'bg-[#f8f7ff] text-gray-900'}`}>
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-500">
              Career & Salary Explorer
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg max-w-2xl mx-auto`}>
              Discover realistic salary expectations, top recruiters, and required skills for your dream job.
            </p>
          </div>

          {!careerData ? (
            <div className={`p-8 rounded-3xl border shadow-xl ${
              isDark ? 'bg-slate-900/60 border-teal-900/20 backdrop-blur-xl' : 'bg-white border-teal-100'
            }`}>
              <form onSubmit={handleGenerate} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-sm font-semibold border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Target Career / Job Role</label>
                    <input 
                      type="text" 
                      value={career}
                      onChange={e => setCareer(e.target.value)}
                      placeholder="e.g. Data Scientist, Software Engineer, HR Manager"
                      required
                      className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                        isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <SelectField
                    label="Experience Level"
                    value={experienceLevel}
                    onChange={setExperienceLevel}
                    options={[
                      { label: 'Entry Level (0-2 years)', value: 'Entry Level (0-2 years)' },
                      { label: 'Mid Level (3-5 years)', value: 'Mid Level (3-5 years)' },
                      { label: 'Senior Level (5-10 years)', value: 'Senior Level (5-10 years)' },
                      { label: 'Lead / Director (10+ years)', value: 'Lead / Director (10+ years)' },
                    ]}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !career}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:scale-[1.01] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                  {loading ? 'Analyzing Market Data...' : 'Explore Career Info'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <button 
                onClick={() => setCareerData(null)}
                className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
              >
                ← Check Another Career
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Main Salary Card */}
                <div className={`col-span-1 md:col-span-2 p-8 rounded-3xl border shadow-xl flex flex-col items-center justify-center text-center ${
                  isDark ? 'bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-teal-900/30' : 'bg-gradient-to-br from-white to-blue-50 border-teal-100'
                }`}>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Briefcase className="text-teal-500" /> {career}
                  </h2>
                  <p className="text-gray-500 font-bold tracking-widest uppercase text-sm mb-8">{experienceLevel}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
                    <div className={`p-6 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-white shadow-sm'}`}>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                        <IndianRupee size={16} /> Average Salary
                      </p>
                      <div className="text-4xl font-black text-teal-600 dark:text-teal-400">
                        {careerData.average_salary}
                      </div>
                    </div>
                    <div className={`p-6 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-white shadow-sm'}`}>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                        <TrendingUp size={16} /> Typical Range
                      </p>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                        {careerData.salary_range}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Left Column */}
                <div className="space-y-8">
                  <div className={`p-8 rounded-3xl border shadow-xl ${
                    isDark ? 'bg-slate-900/60 border-blue-900/20' : 'bg-white border-blue-100'
                  }`}>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <Target /> Required Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {careerData.skills_required?.map((skill: string, i: number) => (
                        <span key={i} className={`px-4 py-2 rounded-xl text-sm font-bold ${
                          isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={`p-8 rounded-3xl border shadow-xl ${
                    isDark ? 'bg-slate-900/60 border-emerald-900/20' : 'bg-white border-emerald-100'
                  }`}>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <TrendingUp /> Market Demand
                    </h3>
                    <p className={`text-lg font-medium leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {careerData.market_demand}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  <div className={`p-8 rounded-3xl border shadow-xl ${
                    isDark ? 'bg-slate-900/60 border-purple-900/20' : 'bg-white border-purple-100'
                  }`}>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <Building /> Top Companies Hiring
                    </h3>
                    <ul className="space-y-3">
                      {careerData.top_companies?.map((company: string, i: number) => (
                        <li key={i} className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                            <Building size={14} className="text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className={`font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{company}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`p-8 rounded-3xl border shadow-xl ${
                    isDark ? 'bg-slate-900/60 border-amber-900/20' : 'bg-white border-amber-100'
                  }`}>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <Award /> Typical Career Path
                    </h3>
                    <div className="space-y-4">
                      {careerData.career_path?.map((step: string, i: number) => (
                        <div key={i} className="flex flex-col gap-2 relative">
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-xs shrink-0">
                              {i + 1}
                            </div>
                            <span className={`font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{step}</span>
                          </div>
                          {i < careerData.career_path.length - 1 && (
                            <div className="absolute left-3 top-6 w-0.5 h-6 bg-amber-100 dark:bg-amber-900/20" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
