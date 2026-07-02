'use client';
import { useState } from 'react';
import { BookOpen, Calendar, Clock, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import SelectField from '@/components/SelectField';
import PageTransition from '@/components/3D/PageTransition';

export default function StudyPlannerPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState('');
  
  const [targetExam, setTargetExam] = useState('');
  const [currentPrep, setCurrentPrep] = useState('Intermediate');
  const [studyHours, setStudyHours] = useState('4');
  const [daysLeft, setDaysLeft] = useState('30');
  const [subjectsText, setSubjectsText] = useState('Physics, Chemistry, Math');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/generate-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetExam,
          currentPrep,
          studyHours: parseInt(studyHours, 10),
          daysLeft: parseInt(daysLeft, 10),
          subjects: subjectsText.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });
      
      if (!res.ok) throw new Error('Failed to generate plan');
      const data = await res.json();
      setPlan(data);
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
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
              AI Study Planner
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg max-w-2xl mx-auto`}>
              Generate a personalized, day-by-day study schedule optimized for your upcoming exams.
            </p>
          </div>

          {!plan ? (
            <div className={`p-8 rounded-3xl border shadow-xl ${
              isDark ? 'bg-slate-900/60 border-purple-900/20 backdrop-blur-xl' : 'bg-white border-purple-100'
            }`}>
              <form onSubmit={handleGenerate} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-sm font-semibold border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Target Exam</label>
                    <input 
                      type="text" 
                      value={targetExam}
                      onChange={e => setTargetExam(e.target.value)}
                      placeholder="e.g. TNEA, JEE Main, NEET"
                      required
                      className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                        isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <SelectField
                    label="Current Prep Level"
                    value={currentPrep}
                    onChange={setCurrentPrep}
                    options={[
                      { label: 'Beginner (Just starting)', value: 'Beginner' },
                      { label: 'Intermediate (Halfway)', value: 'Intermediate' },
                      { label: 'Advanced (Revision mode)', value: 'Advanced' },
                    ]}
                  />
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Daily Study Hours</label>
                    <input 
                      type="number" 
                      min="1" max="16"
                      value={studyHours}
                      onChange={e => setStudyHours(e.target.value)}
                      required
                      className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                        isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Days Until Exam</label>
                    <input 
                      type="number" 
                      min="1" max="365"
                      value={daysLeft}
                      onChange={e => setDaysLeft(e.target.value)}
                      required
                      className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                        isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Subjects / Topics to Cover</label>
                    <textarea 
                      rows={3}
                      value={subjectsText}
                      onChange={e => setSubjectsText(e.target.value)}
                      placeholder="e.g. Physics, Organic Chemistry, Calculus"
                      required
                      className={`w-full p-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                        isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !targetExam}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.01] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                  {loading ? 'Generating AI Plan...' : 'Generate My Study Plan'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <button 
                onClick={() => setPlan(null)}
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
              >
                ← Create Another Plan
              </button>

              <div className={`p-8 rounded-3xl border shadow-xl ${
                isDark ? 'bg-slate-900/60 border-purple-900/20 backdrop-blur-xl' : 'bg-white border-purple-100'
              }`}>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-green-500" />
                  Your Custom Strategy
                </h2>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-lg italic mb-8 border-l-4 border-purple-500 pl-4`}>
                  {plan.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Daily Schedule */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Clock className="text-purple-500" /> Daily Routine
                    </h3>
                    <div className="space-y-3">
                      {plan.daily_schedule?.map((item: any, i: number) => (
                        <div key={i} className={`p-4 rounded-xl border ${
                          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-1">{item.time}</div>
                          <div className={isDark ? 'text-gray-200' : 'text-gray-800'}>{item.task}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weekly Goals & Tips */}
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Calendar className="text-blue-500" /> Weekly Goals
                      </h3>
                      <ul className="space-y-3">
                        {plan.weekly_goals?.map((goal: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Sparkles className="text-amber-500" /> Pro Tips
                      </h3>
                      <div className={`p-6 rounded-2xl border ${
                        isDark ? 'bg-amber-900/10 border-amber-900/30' : 'bg-amber-50 border-amber-200'
                      }`}>
                        <ul className="space-y-3 text-sm">
                          {plan.tips?.map((tip: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-amber-500 font-black">→</span>
                              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
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
