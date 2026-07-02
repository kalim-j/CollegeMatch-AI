'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mic, MicOff, Send, UserCircle, Bot, Loader2, Sparkles, CheckCircle2, PlayCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import PageTransition from '@/components/3D/PageTransition';

interface Message {
  role: 'system' | 'user' | 'interviewer';
  content: string;
  feedback?: string;
  score?: number;
}

export default function MockInterviewPage() {
  const { user, profile } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [sessionActive, setSessionActive] = useState(false);
  const [course, setCourse] = useState('Computer Science');
  const [university, setUniversity] = useState('Stanford University');
  const [round, setRound] = useState(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startSession = async () => {
    setSessionActive(true);
    setRound(1);
    setMessages([{ role: 'system', content: `Starting Mock Interview for ${course} at ${university}...` }]);
    await askNextQuestion(1);
  };

  const askNextQuestion = async (r: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/interview-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course, university, round: r }),
      });
      if (!res.ok) throw new Error('Failed to get question');
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'interviewer', content: data.question }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || loading) return;

    const answer = currentInput;
    setCurrentInput('');
    setMessages(prev => [...prev, { role: 'user', content: answer }]);
    
    // Find last question
    const lastQuestion = [...messages].reverse().find(m => m.role === 'interviewer')?.content || '';
    
    setLoading(true);
    try {
      const res = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: lastQuestion, answer }),
      });
      if (!res.ok) throw new Error('Failed to evaluate');
      const evalData = await res.json();
      
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastUserIdx = newMsgs.length - 1;
        newMsgs[lastUserIdx].feedback = evalData.feedback;
        newMsgs[lastUserIdx].score = evalData.score;
        return newMsgs;
      });

      if (round < 5) {
        const nextRound = round + 1;
        setRound(nextRound);
        await askNextQuestion(nextRound);
      } else {
        setMessages(prev => [...prev, { role: 'system', content: 'Interview completed! Great job.' }]);
        setSessionActive(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className={`min-h-screen p-6 pb-24 ${isDark ? 'bg-[#05071a] text-white' : 'bg-[#f8f7ff] text-gray-900'}`}>
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500">
              Mock Interview AI
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg max-w-2xl mx-auto`}>
              Practice for your college admissions interviews with real-time AI feedback.
            </p>
          </div>

          {!sessionActive && messages.length === 0 ? (
            <div className={`p-8 rounded-3xl border shadow-xl ${
              isDark ? 'bg-slate-900/60 border-indigo-900/20 backdrop-blur-xl' : 'bg-white border-indigo-100'
            }`}>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Target Course / Major</label>
                  <input value={course} onChange={e => setCourse(e.target.value)} required className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'}`} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Target University</label>
                  <input value={university} onChange={e => setUniversity(e.target.value)} required className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'}`} />
                </div>
                <button
                  onClick={startSession}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                >
                  <PlayCircle size={20} /> Start Mock Interview
                </button>
              </div>
            </div>
          ) : (
            <div className={`rounded-3xl border shadow-xl flex flex-col h-[600px] overflow-hidden ${
              isDark ? 'bg-slate-900/80 border-indigo-900/20' : 'bg-white border-indigo-100'
            }`}>
              {/* Header */}
              <div className="p-4 border-b bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800 flex justify-between items-center">
                <div className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                  <Bot size={20} /> Admissions Interviewer
                </div>
                <div className="text-sm font-bold text-gray-500">
                  Round {Math.min(round, 5)}/5
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-sm' 
                        : msg.role === 'system'
                          ? 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 w-full text-center text-sm font-bold mx-auto'
                          : 'bg-slate-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                    }`}>
                      {msg.role !== 'system' && (
                        <div className="flex items-center gap-2 mb-2 opacity-70 text-xs font-bold uppercase tracking-wider">
                          {msg.role === 'user' ? <><UserCircle size={14} /> You</> : <><Bot size={14} /> Interviewer</>}
                        </div>
                      )}
                      <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                      
                      {msg.feedback && (
                        <div className="mt-4 pt-4 border-t border-white/20">
                          <div className="text-xs font-bold uppercase tracking-widest text-emerald-300 flex items-center gap-1 mb-2">
                            <Sparkles size={12} /> AI Feedback (Score: {msg.score}/10)
                          </div>
                          <div className="text-sm opacity-90 italic">
                            {msg.feedback}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 rounded-bl-sm">
                      <Loader2 className="animate-spin text-indigo-500" size={20} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              {sessionActive && (
                <div className="p-4 border-t dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur">
                  <form onSubmit={submitAnswer} className="flex gap-3">
                    <input
                      type="text"
                      value={currentInput}
                      onChange={e => setCurrentInput(e.target.value)}
                      placeholder="Type your response..."
                      disabled={loading}
                      className={`flex-1 p-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={loading || !currentInput.trim()}
                      className="p-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      <Send size={24} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
