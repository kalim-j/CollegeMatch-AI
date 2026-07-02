'use client';
import { useState } from 'react';
import { TrendingUp, Loader2, Sparkles, Building2, BookOpen } from 'lucide-react';
import { useTheme } from 'next-themes';
import PageTransition from '@/components/3D/PageTransition';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function CutoffTrendsPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [loading, setLoading] = useState(false);
  const [trendData, setTrendData] = useState<any>(null);
  const [error, setError] = useState('');
  
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/cutoff-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ college, branch }),
      });
      
      if (!res.ok) throw new Error('Failed to get cutoff data');
      const data = await res.json();
      
      // Transform data for recharts
      const formattedData = data.years.map((year: number, i: number) => ({
        name: year.toString(),
        cutoff: data.cutoffs[i]
      }));
      
      setTrendData({ ...data, chartData: formattedData });
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
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-rose-600">
              Cutoff Trends Explorer
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg max-w-2xl mx-auto`}>
              Analyze past admissions data to understand the competitiveness of your target colleges.
            </p>
          </div>

          {!trendData ? (
            <div className={`p-8 rounded-3xl border shadow-xl ${
              isDark ? 'bg-slate-900/60 border-orange-900/20 backdrop-blur-xl' : 'bg-white border-orange-100'
            }`}>
              <form onSubmit={handleGenerate} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-sm font-semibold border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Building2 size={16} /> Target College
                    </label>
                    <input 
                      type="text" 
                      value={college}
                      onChange={e => setCollege(e.target.value)}
                      placeholder="e.g. CEG, Anna University"
                      required
                      className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                        isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <BookOpen size={16} /> Course / Branch
                    </label>
                    <input 
                      type="text" 
                      value={branch}
                      onChange={e => setBranch(e.target.value)}
                      placeholder="e.g. Computer Science (CSE)"
                      required
                      className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                        isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !college || !branch}
                  className="w-full py-4 bg-gradient-to-r from-orange-600 to-rose-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.01] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                  {loading ? 'Analyzing Data...' : 'Show Cutoff Trends'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <button 
                onClick={() => setTrendData(null)}
                className="text-orange-600 dark:text-orange-400 font-bold hover:underline"
              >
                ← Check Another College
              </button>

              <div className={`p-8 rounded-3xl border shadow-xl ${
                isDark ? 'bg-slate-900/60 border-orange-900/20 backdrop-blur-xl' : 'bg-white border-orange-100'
              }`}>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                  <TrendingUp className="text-orange-500" /> Cutoff History
                </h2>
                <p className="text-gray-500 font-bold tracking-widest text-sm mb-8">{college} • {branch}</p>
                
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                      <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} />
                      <YAxis domain={['auto', 'auto']} stroke={isDark ? '#94a3b8' : '#64748b'} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? '#1e293b' : '#ffffff',
                          borderColor: isDark ? '#334155' : '#e2e8f0',
                          color: isDark ? '#f8fafc' : '#0f172a',
                          borderRadius: '0.75rem',
                          fontWeight: 'bold'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cutoff" 
                        stroke="#f97316" 
                        strokeWidth={4}
                        dot={{ r: 6, fill: '#f97316', strokeWidth: 2, stroke: isDark ? '#0f172a' : '#ffffff' }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={`p-8 rounded-3xl border shadow-xl ${
                isDark ? 'bg-slate-900/60 border-purple-900/20 backdrop-blur-xl' : 'bg-white border-purple-100'
              }`}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <Sparkles /> AI Trend Analysis
                </h3>
                <p className={`text-lg font-medium leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {trendData.trend_analysis}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
