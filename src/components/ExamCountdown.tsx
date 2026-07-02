'use client';
import { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { useTheme } from 'next-themes';

const DEFAULT_EXAMS = [
  { id: '1', name: 'TNEA Counselling', date: '2026-07-25' },
  { id: '2', name: 'JEE Main (Session 2)', date: '2026-04-01' },
  { id: '3', name: 'NEET UG', date: '2026-05-05' },
  { id: '4', name: 'TANCET', date: '2026-03-22' },
];

export default function ExamCountdown() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [exams, setExams] = useState(DEFAULT_EXAMS);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000 * 60 * 60); // update every hour
    return () => clearInterval(interval);
  }, []);

  const getDaysRemaining = (dateString: string) => {
    const diff = new Date(dateString).getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const sortedExams = [...exams].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  ).filter(e => getDaysRemaining(e.date) >= 0);

  if (sortedExams.length === 0) return null;

  return (
    <div className={`p-6 rounded-2xl border transition-all ${
      isDark 
        ? 'bg-slate-900/60 border-purple-900/20 backdrop-blur-xl text-white' 
        : 'bg-white/70 border-purple-100 backdrop-blur-xl text-gray-900'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center border border-amber-200 dark:border-amber-700/50">
          <Calendar className="text-amber-600 dark:text-amber-400" size={16} />
        </div>
        <h3 className="font-bold text-lg">Upcoming Exams</h3>
      </div>
      
      <div className="space-y-4">
        {sortedExams.slice(0, 3).map((exam) => {
          const days = getDaysRemaining(exam.date);
          const isUrgent = days <= 30;
          return (
            <div key={exam.id} className={`flex items-center justify-between p-3 rounded-xl border ${
              isDark 
                ? 'bg-slate-800/50 border-slate-700/50' 
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <p className="font-semibold text-sm">{exam.name}</p>
                <p className={`text-xs flex items-center gap-1 mt-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <Clock size={12} />
                  {new Date(exam.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                isUrgent 
                  ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                  : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
              }`}>
                {isUrgent && <AlertCircle size={12} />}
                {days} {days === 1 ? 'day' : 'days'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
