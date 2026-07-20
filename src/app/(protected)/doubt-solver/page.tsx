'use client';
import { useAuthGuard } from '@/lib/auth-guard';
import ScrollReveal from '@/components/ScrollReveal';
import { useState, useRef, useEffect } from 'react';
import { Lightbulb, Send, User, Bot, Loader2, BookOpen } from 'lucide-react';
import { useTheme } from 'next-themes';
import PageTransition from '@/components/3D/PageTransition';
import SelectField from '@/components/SelectField';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export default function DoubtSolverPage() {
  const { state } = useAuthGuard();
  if (state !== 'verified') return null;

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [subject, setSubject] = useState('Physics');
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

  const submitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || loading) return;

    const question = currentInput;
    setCurrentInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    
    setLoading(true);
    try {
      const res = await fetch('/api/solve-doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, subject }),
      });
      if (!res.ok) throw new Error('Failed to get answer');
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'bot', content: data.markdown }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I encountered an error. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
    <ScrollReveal direction="up">

      <div className={`min-h-screen p-6 pb-24 ${isDark ? 'bg-[#05071a] text-white' : 'bg-[#f8f7ff] text-gray-900'}`}>
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-600">
              AI Doubt Solver
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg max-w-2xl mx-auto`}>
              Stuck on a concept? Ask our AI tutor for clear, step-by-step explanations.
            </p>
          </div>

          <div className={`rounded-3xl border shadow-xl flex flex-col h-[700px] overflow-hidden ${
            isDark ? 'bg-slate-900/80 border-amber-900/20' : 'bg-white border-amber-100'
          }`}>
            {/* Header */}
            <div className="p-4 border-b bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 flex justify-between items-center">
              <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Lightbulb size={20} /> AI Tutor
              </div>
              <div className="w-48">
                <SelectField
                  value={subject}
                  onChange={setSubject}
                  options={[
                    { label: 'Physics', value: 'Physics' },
                    { label: 'Chemistry', value: 'Chemistry' },
                    { label: 'Mathematics', value: 'Mathematics' },
                    { label: 'Biology', value: 'Biology' },
                    { label: 'Computer Science', value: 'Computer Science' },
                  ]}
                />
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-50 text-center">
                  <BookOpen size={64} className="mb-4 text-amber-500" />
                  <p>Ask a question about {subject} to get started!</p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-5 ${
                    msg.role === 'user' 
                      ? 'bg-amber-600 text-white rounded-br-sm' 
                      : 'bg-slate-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                  }`}>
                    <div className="flex items-center gap-2 mb-2 opacity-70 text-xs font-bold uppercase tracking-wider">
                      {msg.role === 'user' ? <><User size={14} /> You</> : <><Bot size={14} /> AI Tutor</>}
                    </div>
                    {/* Render basic markdown formatting naively for now (handling newlines) */}
                    <div className="space-y-3 leading-relaxed">
                      {msg.content.split('\n\n').map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 rounded-bl-sm">
                    <Loader2 className="animate-spin text-amber-500" size={20} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur">
              <form onSubmit={submitQuestion} className="flex gap-3">
                <input
                  type="text"
                  value={currentInput}
                  onChange={e => setCurrentInput(e.target.value)}
                  placeholder="E.g. Can you explain Newton's third law with an example?"
                  disabled={loading}
                  className={`flex-1 p-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
                <button
                  type="submit"
                  disabled={loading || !currentInput.trim()}
                  className="p-4 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50"
                >
                  <Send size={24} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      </ScrollReveal>
    </PageTransition>
  );
}
