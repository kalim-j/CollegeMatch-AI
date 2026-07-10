'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  PlayCircle, CheckCircle2, ChevronRight, Share2, Award, 
  BookOpen, Star, RefreshCw, Send, Loader2, Search, ArrowRight,
  TrendingUp, Sparkles, BrainCircuit, HeartHandshake, Mic, MicOff
} from 'lucide-react';
import { useTheme } from 'next-themes';
import PageTransition from '@/components/3D/PageTransition';
import SelectField from '@/components/SelectField';
import { toast } from 'sonner';

interface Option {
  id: string;
  text: string;
}

interface Question {
  question: string;
  type: 'mcq' | 'open';
  category: string;
  difficulty: string;
  options?: Option[];
  what_good_answer_covers?: string[];
}

interface Message {
  role: 'system' | 'user' | 'interviewer';
  content: string;
  isCorrect?: boolean;
  score?: number;
  feedback?: string;
  questionData?: Question;
}

const steps = ['Setup', 'Interview', 'Feedback', 'Report'];

export default function MockInterviewPage() {
  const { user, profile } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Setup State
  const [currentPhase, setCurrentPhase] = useState(0); // 0=Setup, 1=Interview, 2=Feedback, 3=Report
  const [level, setLevel] = useState<'UG'|'PG'>('UG');
  const [stream, setStream] = useState('');
  const [interviewType, setInterviewType] = useState('Mixed');
  const [difficulty, setDifficulty] = useState('Medium');
  const [totalQ, setTotalQ] = useState(5);

  // Interview State
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  
  // MCQ State
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerValidated, setAnswerValidated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [correctOption, setCorrectOption] = useState<string | null>(null);

  // Open Text State
  const [currentInput, setCurrentInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Refs
  const interviewRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentPhase === 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPhase]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, answerValidated]);

  const startInterview = () => {
    if (!stream) {
      toast.error('Please select your stream first');
      return;
    }
    setCurrentPhase(1);
    
    // Wait for DOM to update with interview UI, then scroll
    setTimeout(() => {
      if (interviewRef.current) {
        const offset = 80;
        const top = interviewRef.current.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      fetchNextQuestion(1);
    }, 150);
  };

  const fetchNextQuestion = async (round: number) => {
    setLoading(true);
    setAnswerValidated(false);
    setSelectedOption(null);
    setCurrentInput('');
    setExplanation('');
    
    try {
      const res = await fetch('/api/interview-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stream, type: interviewType, difficulty, round, totalQ }),
      });
      if (!res.ok) throw new Error('Failed to get question');
      const data = await res.json();
      
      setCurrentQuestion(data);
      setMessages(prev => [...prev, { 
        role: 'interviewer', 
        content: data.question,
        questionData: data
      }]);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to connect to AI');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = async (optionId: string) => {
    if (answerValidated || !currentQuestion) return;
    setSelectedOption(optionId);
    setLoading(true);

    try {
      const res = await fetch('/api/validate-mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question,
          options: currentQuestion.options,
          selectedOption: optionId,
          subject: stream,
        }),
      });
      const data = await res.json();
      setIsCorrect(data.is_correct);
      setCorrectOption(data.correct_option);
      setExplanation(data.explanation);
      setAnswerValidated(true);

      if (data.is_correct) setScore(s => s + 10);
      setCurrentPhase(2); // Move step indicator to Feedback
      
    } catch (err) {
      toast.error("Failed to validate answer");
      setSelectedOption(null);
    } finally {
      setLoading(false);
    }
  };

  const submitOpenAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || loading || !currentQuestion) return;

    const answer = currentInput;
    setCurrentInput('');
    setMessages(prev => [...prev, { role: 'user', content: answer }]);
    setLoading(true);

    try {
      const res = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion.question, answer }),
      });
      const data = await res.json();
      
      setIsCorrect(data.score >= 7);
      setExplanation(data.feedback);
      setAnswerValidated(true);
      
      if (data.score) {
        setScore(s => s + data.score);
      }
      setCurrentPhase(2);
      
    } catch (err) {
      toast.error("Failed to evaluate answer");
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQ + 1 < totalQ) {
      setCurrentPhase(1);
      setCurrentQ(prev => prev + 1);
      fetchNextQuestion(currentQ + 2);
    } else {
      setCurrentPhase(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Browser doesn't support speech recognition.");
      return;
    }
    if (isRecording) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (e: any) => {
      let finalTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript;
      }
      if (finalTranscript) setCurrentInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const getOptionStyle = (optId: string) => {
    if (!answerValidated) {
      return {
        background: selectedOption === optId ? (isDark ? 'rgba(127,119,221,0.15)' : '#f0eeff') : (isDark ? 'rgba(255,255,255,0.04)' : '#ffffff'),
        border: selectedOption === optId ? '1px solid rgba(127,119,221,0.8)' : (isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid #e2e8f0'),
        color: isDark ? 'rgba(255,255,255,0.9)' : '#1e293b',
        transform: selectedOption === optId ? 'scale(1.01)' : 'scale(1)',
        cursor: loading ? 'wait' : 'pointer',
      };
    }
    if (optId === correctOption) {
      return {
        background: isDark ? 'rgba(29,158,117,0.18)' : '#ecfdf5',
        border: '2px solid #1D9E75',
        color: isDark ? '#5DCAA5' : '#047857',
        cursor: 'default',
      };
    }
    if (optId === selectedOption && !isCorrect) {
      return {
        background: isDark ? 'rgba(226,75,74,0.18)' : '#fef2f2',
        border: '2px solid #E24B4A',
        color: isDark ? '#F09595' : '#b91c1c',
        cursor: 'default',
      };
    }
    return {
      background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
      border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9',
      color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8',
      cursor: 'default',
    };
  };

  const isMCQ = currentQuestion?.type === 'mcq' && currentQuestion.options && currentQuestion.options.length > 0;

  return (
    <PageTransition>
      <div className={`min-h-screen pb-24 bg-transparent`} style={{ boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(1rem, 4vw, 2rem)', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Step Indicator */}
          <div className="pt-24 md:pt-32">
            <div style={{ display:'flex', alignItems:'center', marginBottom:'32px', gap:0 }}>
              {steps.map((step, i) => (
                <React.Fragment key={step}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
                    <div className={currentPhase === i ? 'step-active' : ''} style={{
                      width:'36px', height:'36px', borderRadius:'50%',
                      background: currentPhase > i ? '#1D9E75' : currentPhase === i ? '#7F77DD' : (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'),
                      border: currentPhase === i ? '2px solid #a89ef8' : 'none',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'14px', fontWeight:600,
                      color: currentPhase >= i ? 'white' : (isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8'),
                      transition:'all 0.3s ease',
                    }}>
                      {currentPhase > i ? '✓' : i + 1}
                    </div>
                    <span style={{
                      fontSize:'11px',
                      color: currentPhase >= i ? (isDark ? 'rgba(255,255,255,0.8)' : '#475569') : (isDark ? 'rgba(255,255,255,0.3)' : '#cbd5e1'),
                      fontWeight: currentPhase === i ? 600 : 400,
                      whiteSpace:'nowrap',
                    }}>
                      {step}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{
                      flex:1, height:'2px', margin:'0 4px', marginBottom:'20px',
                      background: currentPhase > i ? '#1D9E75' : (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'),
                      transition:'background 0.5s ease',
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {currentPhase === 0 && (
            <div id="setup-section" className="glass-card p-6 md:p-8 shadow-xl question-enter">
              <h2 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Set up your interview</h2>
              <p className={`text-sm font-medium mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Choose your stream and interview type</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your stream</label>
                  <SelectField
                    value={stream}
                    onChange={setStream}
                    placeholder="Select your target stream"
                    options={[
                      { label: 'Engineering', value: 'Engineering' },
                      { label: 'Medical', value: 'Medical' },
                      { label: 'Commerce', value: 'Commerce' },
                      { label: 'Arts', value: 'Arts' },
                      { label: 'Law', value: 'Law' },
                      { label: 'Management', value: 'Management' },
                      { label: 'Other', value: 'Other' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Interview type</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { id: 'Technical', icon: BrainCircuit, desc: 'Subject concepts' },
                      { id: 'HR', icon: HeartHandshake, desc: 'Soft skills & goals' },
                      { id: 'Mixed', icon: Sparkles, desc: 'Both combined' }
                    ].map(type => (
                      <div 
                        key={type.id}
                        onClick={() => setInterviewType(type.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          interviewType === type.id 
                            ? 'border-indigo-500 bg-indigo-500/10 shadow-md shadow-indigo-500/10' 
                            : isDark ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-800' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`flex items-center gap-2 font-bold mb-1 ${interviewType === type.id ? 'text-indigo-500' : isDark ? 'text-gray-200' : 'text-slate-700'}`}>
                          <type.icon size={16} /> {type.id}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{type.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Difficulty</label>
                    <div className="flex gap-2 bg-slate-800/20 p-1 rounded-xl">
                      {['Easy', 'Medium', 'Hard'].map(diff => (
                        <button
                          key={diff}
                          onClick={() => setDifficulty(diff)}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                            difficulty === diff 
                              ? 'bg-indigo-600 text-white shadow-sm' 
                              : isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5' : 'text-gray-600 hover:bg-black/5'
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Questions</label>
                    <div className="flex gap-2 bg-slate-800/20 p-1 rounded-xl">
                      {[5, 10, 15].map(num => (
                        <button
                          key={num}
                          onClick={() => setTotalQ(num)}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                            totalQ === num 
                              ? 'bg-emerald-600 text-white shadow-sm' 
                              : isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5' : 'text-gray-600 hover:bg-black/5'
                          }`}
                        >
                          {num} Qs
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={startInterview}
                    disabled={!stream}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    Start Interview <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentPhase === 1 || currentPhase === 2 ? (
            <div ref={interviewRef} id="interview-section" style={{ scrollMarginTop: '80px' }} className="space-y-6">
              
              {/* Sticky Progress Header */}
              <div className="glass-card sticky top-20 z-50 p-4 shadow-sm flex items-center justify-between">
                <div className="font-bold text-sm text-indigo-500">Question {currentQ + 1} <span className="text-gray-400 font-medium">of {totalQ}</span></div>
                <div className="flex-1 max-w-[200px] mx-4 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                  <div className="h-full bg-indigo-500 progress-fill rounded-full" style={{ width: `${((currentQ) / totalQ) * 100}%` }} />
                </div>
                <div className="font-bold text-sm text-emerald-500 score-update">Score: {score}/{totalQ * 10}</div>
              </div>

              {/* Question Card */}
              <div className="mock-interview-card glass-card p-6 md:p-8 shadow-xl question-enter overflow-x-hidden box-border w-full">
                {currentQuestion ? (
                  <>
                    <div className="mock-header flex items-center justify-between flex-wrap gap-2 mb-6">
                      <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-500">{currentQuestion.category}</span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 flex items-center gap-1">
                          <Star size={10} className="fill-amber-500" /> {currentQuestion.difficulty}
                        </span>
                      </div>
                    </div>

                    <h3 className={`text-lg md:text-xl font-medium leading-relaxed mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {currentQuestion.question}
                    </h3>

                    {isMCQ && currentQuestion.options ? (
                      <div className="space-y-3">
                        {currentQuestion.options.map((opt) => {
                          const icon = answerValidated ? (opt.id === correctOption ? <span style={{ color:'#1D9E75', fontSize:'16px', fontWeight:700 }}>✓</span> : (opt.id === selectedOption && !isCorrect ? <span style={{ color:'#E24B4A', fontSize:'16px', fontWeight:700 }}>✗</span> : null)) : null;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => handleOptionSelect(opt.id)}
                              disabled={answerValidated || loading}
                              className={`mock-option-btn w-full p-4 rounded-xl text-left flex items-center justify-between gap-2 min-h-[52px] transition-all ${
                                answerValidated && opt.id === correctOption ? 'correct-answer' : answerValidated && opt.id === selectedOption && !isCorrect ? 'wrong-answer' : ''
                              }`}
                              style={getOptionStyle(opt.id)}
                            >
                              <div className="flex-1 text-[14px] md:text-[15px] leading-relaxed break-words pr-2">
                                <span className="font-black mr-3 opacity-50">{opt.id}</span>
                                {opt.text}
                              </div>
                              {icon}
                            </button>
                          );
                        })}

                        {loading && !answerValidated && (
                          <div className="flex justify-center p-4"><Loader2 className="animate-spin text-indigo-500" /></div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {!answerValidated && (
                          <>
                            <textarea
                              value={currentInput}
                              onChange={e => setCurrentInput(e.target.value)}
                              placeholder="Type your detailed answer here..."
                              className={`w-full h-40 p-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
                                isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={toggleRecording}
                                className={`p-4 rounded-xl flex items-center justify-center transition-colors ${
                                  isRecording ? 'bg-red-500 text-white animate-pulse' : isDark ? 'bg-slate-800 text-gray-300' : 'bg-slate-200 text-gray-600'
                                }`}
                              >
                                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                              </button>
                              <button
                                onClick={submitOpenAnswer}
                                disabled={loading || !currentInput.trim()}
                                className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Submit Answer</>}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Explanation Card */}
                    {answerValidated && (
                      <div className="mock-explanation explanation-enter mt-6 rounded-2xl p-5" style={{
                        background: isCorrect ? (isDark ? 'rgba(29,158,117,0.10)' : '#ecfdf5') : (isDark ? 'rgba(226,75,74,0.10)' : '#fef2f2'),
                        border: `1px solid ${isCorrect ? (isDark ? 'rgba(29,158,117,0.3)' : '#a7f3d0') : (isDark ? 'rgba(226,75,74,0.3)' : '#fecaca')}`,
                      }}>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">{isCorrect ? '🎉' : '💡'}</span>
                          <div>
                            <p className="font-bold text-sm m-0" style={{ color: isCorrect ? '#5DCAA5' : '#F09595' }}>
                              {isCorrect ? 'Correct answer!' : 'Not quite right'}
                            </p>
                            {!isCorrect && isMCQ && (
                              <p className="text-xs opacity-70 mt-1 mb-0" style={{ color: isDark ? 'white' : 'black' }}>
                                Correct answer: Option {correctOption}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="rounded-xl p-4" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
                          <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-50" style={{ color: isDark ? 'white' : 'black' }}>Explanation</p>
                          <p className="text-sm leading-relaxed m-0" style={{ color: isDark ? 'rgba(255,255,255,0.85)' : '#334155' }}>
                            {explanation}
                          </p>
                        </div>

                        {isCorrect && (
                          <p className="text-xs font-bold text-emerald-500 mt-4 flex items-center gap-1">
                            +10 points added to your score ⭐
                          </p>
                        )}
                      </div>
                    )}

                    {/* Next Button */}
                    {answerValidated && (
                      <button
                        onClick={handleNextQuestion}
                        className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                      >
                        {currentQ + 1 < totalQ ? 'Next question →' : 'See my results →'}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center opacity-50">
                    <Loader2 className="animate-spin mb-4" size={32} />
                    <p className="text-sm font-bold uppercase tracking-widest">Preparing question...</p>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>
          ) : currentPhase === 3 ? (
            <div className="glass-card p-8 md:p-12 shadow-xl question-enter text-center">
              <Award size={64} className="mx-auto mb-6 text-emerald-500" />
              <h2 className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Interview Complete</h2>
              
              <div className="my-8 inline-block p-8 rounded-full border-8 border-emerald-500/20 relative">
                <div className="absolute inset-0 border-8 border-emerald-500 rounded-full" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }} />
                <div className="text-5xl font-black text-emerald-500">{score}</div>
                <div className={`text-sm font-bold uppercase tracking-widest mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Out of {totalQ * 10}</div>
              </div>

              <h3 className={`text-xl font-bold mb-8 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {score / (totalQ * 10) >= 0.8 ? "Outstanding 🏆 You're ready to ace any interview!" : 
                 score / (totalQ * 10) >= 0.6 ? "Excellent 🎉 Strong performance. A little more prep!" :
                 "Good effort 👍 Let's identify and fix your weak spots."}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                <button
                  onClick={() => {
                    setCurrentPhase(0);
                    setScore(0);
                    setCurrentQ(0);
                    setMessages([]);
                  }}
                  className="py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} /> Practice again
                </button>
                <button
                  className="py-4 bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 size={18} /> Share my score
                </button>
              </div>
            </div>
          ) : null}

        </div>
      </div>
    </PageTransition>
  );
}
