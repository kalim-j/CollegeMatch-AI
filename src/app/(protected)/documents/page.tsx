'use client';
import { useState } from 'react';
import { FileCheck, Loader2, Sparkles, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import PageTransition from '@/components/3D/PageTransition';
import SelectField from '@/components/SelectField';

export default function DocumentsPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState<any>(null);
  const [error, setError] = useState('');
  
  const [course, setCourse] = useState('B.Tech Engineering');
  const [state, setState] = useState('Tamil Nadu');
  const [category, setCategory] = useState('GENERAL');
  
  // Local state to track checked items
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/generate-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course, state, category }),
      });
      
      if (!res.ok) throw new Error('Failed to generate checklist');
      const data = await res.json();
      setChecklist(data);
      setCheckedItems({});
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
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-green-600">
              Document Checklist
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg max-w-2xl mx-auto`}>
              Generate a personalized list of documents required for your college counseling and admission.
            </p>
          </div>

          {!checklist ? (
            <div className={`p-8 rounded-3xl border shadow-xl ${
              isDark ? 'bg-slate-900/60 border-emerald-900/20 backdrop-blur-xl' : 'bg-white border-emerald-100'
            }`}>
              <form onSubmit={handleGenerate} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-sm font-semibold border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Target Course</label>
                    <input 
                      type="text" 
                      value={course}
                      onChange={e => setCourse(e.target.value)}
                      placeholder="e.g. B.Tech Engineering, MBBS"
                      required
                      className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                        isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">College State</label>
                    <input 
                      type="text" 
                      value={state}
                      onChange={e => setState(e.target.value)}
                      placeholder="e.g. Tamil Nadu, Maharashtra"
                      required
                      className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                        isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <SelectField
                      label="Category / Quota"
                      value={category}
                      onChange={setCategory}
                      options={[
                        { label: 'General / Open', value: 'GENERAL' },
                        { label: 'OBC / BC / MBC', value: 'OBC/BC/MBC' },
                        { label: 'SC / ST', value: 'SC/ST' },
                        { label: 'EWS', value: 'EWS' },
                        { label: 'NRI / Management Quota', value: 'NRI/Management' },
                        { label: 'Special Quota (Sports, Ex-Servicemen, etc.)', value: 'Special' },
                      ]}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.01] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                  {loading ? 'Generating Checklist...' : 'Generate My Checklist'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <button 
                onClick={() => setChecklist(null)}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                ← Create Another Checklist
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Mandatory Documents */}
                <div className={`p-8 rounded-3xl border shadow-xl ${
                  isDark ? 'bg-slate-900/60 border-red-900/20 backdrop-blur-xl' : 'bg-white border-red-100'
                }`}>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle /> Mandatory Documents
                  </h3>
                  <div className="space-y-4">
                    {checklist.mandatory?.map((doc: any, i: number) => {
                      const id = `mandatory-${i}`;
                      return (
                        <div key={id} className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                          checkedItems[id] 
                            ? (isDark ? 'bg-emerald-900/20 border-emerald-900/30 opacity-60' : 'bg-emerald-50 border-emerald-200 opacity-70')
                            : (isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200')
                        }`} onClick={() => toggleCheck(id)}>
                          <div className={`mt-1 rounded-full shrink-0 ${checkedItems[id] ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`}>
                            <CheckCircle2 size={24} />
                          </div>
                          <div>
                            <div className={`font-bold ${checkedItems[id] ? 'line-through text-gray-500' : ''}`}>{doc.name}</div>
                            <div className="text-sm text-gray-500 mt-1">{doc.description}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Category Specific */}
                  {checklist.category_specific && checklist.category_specific.length > 0 && (
                    <div className={`p-8 rounded-3xl border shadow-xl ${
                      isDark ? 'bg-slate-900/60 border-amber-900/20 backdrop-blur-xl' : 'bg-white border-amber-100'
                    }`}>
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <FileCheck /> Category Specific ({category})
                      </h3>
                      <div className="space-y-4">
                        {checklist.category_specific.map((doc: any, i: number) => {
                          const id = `cat-${i}`;
                          return (
                            <div key={id} className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                              checkedItems[id] 
                                ? (isDark ? 'bg-emerald-900/20 border-emerald-900/30 opacity-60' : 'bg-emerald-50 border-emerald-200 opacity-70')
                                : (isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200')
                            }`} onClick={() => toggleCheck(id)}>
                              <div className={`mt-1 rounded-full shrink-0 ${checkedItems[id] ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`}>
                                <CheckCircle2 size={24} />
                              </div>
                              <div>
                                <div className={`font-bold ${checkedItems[id] ? 'line-through text-gray-500' : ''}`}>{doc.name}</div>
                                <div className="text-sm text-gray-500 mt-1">{doc.description}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Optional but Recommended */}
                  {checklist.optional_but_recommended && checklist.optional_but_recommended.length > 0 && (
                    <div className={`p-8 rounded-3xl border shadow-xl ${
                      isDark ? 'bg-slate-900/60 border-blue-900/20 backdrop-blur-xl' : 'bg-white border-blue-100'
                    }`}>
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <Sparkles /> Optional but Recommended
                      </h3>
                      <div className="space-y-4">
                        {checklist.optional_but_recommended.map((doc: any, i: number) => {
                          const id = `opt-${i}`;
                          return (
                            <div key={id} className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                              checkedItems[id] 
                                ? (isDark ? 'bg-emerald-900/20 border-emerald-900/30 opacity-60' : 'bg-emerald-50 border-emerald-200 opacity-70')
                                : (isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200')
                            }`} onClick={() => toggleCheck(id)}>
                              <div className={`mt-1 rounded-full shrink-0 ${checkedItems[id] ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`}>
                                <CheckCircle2 size={24} />
                              </div>
                              <div>
                                <div className={`font-bold ${checkedItems[id] ? 'line-through text-gray-500' : ''}`}>{doc.name}</div>
                                <div className="text-sm text-gray-500 mt-1">{doc.description}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
