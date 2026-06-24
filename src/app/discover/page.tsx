'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import StreamResultCard from '@/components/StreamResultCard';
import DiscoveryLoadingScreen from '@/components/DiscoveryLoadingScreen';
import { DiscoveryResult, StreamRecommendation } from '@/types/discovery';
import Logo from '@/components/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { discoveryQuestions } from '@/data/discoveryQuestions';

// Category colour palette — used for accents on both themes
const catColor: Record<string, { from: string; to: string; shadow: string }> = {
  interest:    { from: '#7F77DD', to: '#a89ef8', shadow: 'rgba(127,119,221,0.35)' },
  strength:    { from: '#1D9E75', to: '#5DCAA5', shadow: 'rgba(29,158,117,0.35)' },
  personality: { from: '#3b82f6', to: '#60a5fa', shadow: 'rgba(59,130,246,0.35)' },
  values:      { from: '#f59e0b', to: '#fbbf24', shadow: 'rgba(245,158,11,0.35)' },
  lifestyle:   { from: '#ec4899', to: '#f472b6', shadow: 'rgba(236,72,153,0.35)' },
  goal:        { from: '#8b5cf6', to: '#a78bfa', shadow: 'rgba(139,92,246,0.35)' },
};

export default function DiscoverPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [otherText, setOtherText] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [results, setResults] = useState<DiscoveryResult | null>(null);
  const [discoveryId, setDiscoveryId] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (user === null) router.push('/login?redirect=/discover');
  }, [user, router]);

  if (!user) return null;

  const handleStart = () => {
    setDirection(1); 
    setCurrentStep(1);
    const q = discoveryQuestions[0];
    setCurrentQuestion({
      ...q,
      options: [...q.options, { id: 'other', label: 'Other', icon: '✍️', streams: [] }]
    });
  };

  const handleOptionSelect = async (optionId: string, label: string) => {
    setSelectedOption(optionId);
    
    if (optionId === 'other') {
      setShowOtherInput(true);
      return; // wait for text input
    }
    
    const selectedOpt = currentQuestion.options.find((o:any) => o.id === optionId);
    await submitAnswer(label, selectedOpt?.streams || []);
  };

  const handleOtherSubmit = async (e: React.KeyboardEvent | React.FocusEvent) => {
    // Only proceed on Enter key if it's a keyboard event
    if ('key' in e && e.key !== 'Enter') return;
    
    if (otherText.trim().length > 0) {
      await submitAnswer(otherText.trim(), []);
    }
  };

  const submitAnswer = async (answerText: string, streams: string[] = []) => {
    const newAnswers = [...answers, { q: currentQuestion.question, a: answerText, streams }];
    setAnswers(newAnswers);
    
    // Auto-advance logic
    if (currentStep < 10) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
      setShowOtherInput(false);
      setOtherText('');
      setSelectedOption(null);
      
      const nextQ = discoveryQuestions[currentStep];
      setCurrentQuestion({
        ...nextQ,
        options: [...nextQ.options, { id: 'other', label: 'Other', icon: '✍️', streams: [] }]
      });
    } else {
      // Final step -> generate result
      setDirection(1);
      setCurrentStep(11); // Loading
      try {
        const res = await fetch('/api/discover-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: newAnswers, studentName: user.displayName || 'Student' }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || 'Failed');
        const data = await res.json();
        if (data.results) {
          setResults(data.results);
          const newDocRef = doc(collection(db, `discoveries/${user.uid}/sessions`));
          await setDoc(newDocRef, { timestamp: serverTimestamp(), answers: newAnswers, results: data.results, selectedStream: null });
          setDiscoveryId(newDocRef.id);
          setCurrentStep(12);
        }
      } catch (err: any) {
        setAiError(err.message || 'AI is temporarily unavailable.');
        setCurrentStep(10);
      }
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep(prev => (prev > 1 ? prev - 1 : 0));
  };

  const handleSelectStream = async (stream: StreamRecommendation) => {
    if (!discoveryId) return;
    await setDoc(doc(db, `discoveries/${user.uid}/sessions`, discoveryId), { selectedStream: stream.stream }, { merge: true });
    sessionStorage.setItem('selectedStream', stream.stream);
    router.push(`/interview?stream=${encodeURIComponent(stream.stream)}&fromDiscover=true`);
  };

  const handleExploreStream = (stream: StreamRecommendation) => {
    router.push(`/stream/${stream.stream.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  };

  const shareResult = () => {
    if (!results) return;
    const text = `I just used CollegeMatch-AI and found my perfect stream: ${results.streams[0].stream}! Find yours at ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // ── CSS variable shorthands ──────────────────────────────────────────────────
  const bgPage    = 'var(--bg-primary)';
  const bgCard    = 'var(--bg-card)';
  const bgCardH   = 'var(--bg-card-hover)';
  const border    = 'var(--border-color)';
  const borderH   = 'var(--border-hover)';
  const txtPri    = 'var(--text-primary)';
  const txtMuted  = 'var(--text-muted)';
  const txtSec    = 'var(--text-secondary)';

  // ── WELCOME SCREEN ──────────────────────────────────────────────────────────
  if (currentStep === 0) {
    return (
      <div style={{ minHeight: '100vh', background: bgPage, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(127,119,221,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(29,158,117,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 580, width: '100%', background: bgCard, backdropFilter: 'blur(24px)', border: `1px solid ${border}`, borderRadius: 28, padding: '52px 44px', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.08)', position: 'relative', zIndex: 10 }}
        >
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}>
            <Logo size="lg" showTagline={true} />
          </motion.div>

          <h1 style={{ fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: 900, color: txtPri, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 12 }}>
            Let&apos;s find your{' '}
            <span style={{ background: 'linear-gradient(90deg, #7F77DD, #5DCAA5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              perfect stream
            </span>
          </h1>

          <p style={{ fontSize: 16, color: txtMuted, marginBottom: 16, lineHeight: 1.7, maxWidth: 420, margin: '0 auto 16px' }}>
            You just finished 12th. I&apos;ll ask <strong style={{ color: txtPri }}>10 simple questions</strong> to find the right path for you. No right or wrong — just be honest.
          </p>

          <div style={{ marginBottom: 28, padding: '12px 20px', borderRadius: 14, background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)', display: 'inline-block' }}>
            <p style={{ color: '#1D9E75', fontWeight: 700, margin: 0, fontSize: 14 }}>
              Ready, {user.displayName?.split(' ')[0] || 'there'}? Let&apos;s figure this out 🎯
            </p>
          </div>

          <motion.button
            onClick={handleStart}
            whileHover={{ scale: 1.03, boxShadow: '0 12px 36px rgba(29,158,117,0.3)' }}
            whileTap={{ scale: 0.97 }}
            style={{ width: '100%', padding: '15px 32px', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', border: 'none', borderRadius: 16, color: '#fff', fontSize: 17, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            Let&apos;s go <i className="ti ti-arrow-right" />
          </motion.button>

          <p style={{ marginTop: 14, fontSize: 12, color: txtMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <i className="ti ti-clock" /> Takes about 3 minutes · Completely free
          </p>
        </motion.div>
      </div>
    );
  }

  // ── LOADING ──────────────────────────────────────────────────────────────────
  if (currentStep === 11) return <DiscoveryLoadingScreen />;

  // ── RESULTS ──────────────────────────────────────────────────────────────────
  if (currentStep === 12 && results) {
    return (
      <div style={{ minHeight: '100vh', background: bgPage, padding: '48px 16px 80px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
            <Logo size="md" showTagline={false} />
            <h1 style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 900, color: txtPri, marginTop: 20, marginBottom: 8 }}>
              Here&apos;s what we found about you,{' '}
              <span style={{ background: 'linear-gradient(90deg, #7F77DD, #5DCAA5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {user.displayName?.split(' ')[0] || 'you'}
              </span>
            </h1>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ background: bgCard, backdropFilter: 'blur(20px)', border: `1px solid ${border}`, borderTop: '4px solid #5DCAA5', borderRadius: 20, padding: '28px 32px', marginBottom: 32 }}
          >
            <p style={{ color: txtMuted, fontStyle: 'italic', marginBottom: 10, fontSize: 14 }}>{results.overall_personality}</p>
            <p style={{ color: txtPri, marginBottom: 16, lineHeight: 1.7 }}>{results.strength_summary}</p>
            <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(127,119,221,0.08)', border: '1px solid rgba(127,119,221,0.2)' }}>
              <p style={{ color: txtSec, fontWeight: 500, margin: 0 }}>{results.encouragement}</p>
            </div>
          </motion.div>

          <h3 style={{ fontSize: 20, fontWeight: 800, color: txtPri, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-crown" style={{ color: '#FBBF24' }} /> Your Top Recommendations
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {results.streams && results.streams.length > 0 ? (
              results.streams.map((stream, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + idx * 0.1 }}>
                  <StreamResultCard stream={stream} onSelect={() => handleSelectStream(stream)} onExplore={() => handleExploreStream(stream)} />
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                style={{ padding: '32px 24px', textAlign: 'center', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16 }}>
                <i className="ti ti-alert-circle" style={{ fontSize: 32, color: '#ef4444', marginBottom: 12, display: 'inline-block' }} />
                <h4 style={{ color: txtPri, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No perfect stream match found</h4>
                <p style={{ color: txtMuted, fontSize: 14, lineHeight: 1.6, maxWidth: 400, margin: '0 auto' }}>
                  Based on your unique answers, we couldn't confidently recommend a traditional stream. You might have very diverse interests, or some of your answers were contradictory!
                </p>
                <button
                  onClick={() => { setAnswers([]); setDirection(1); setCurrentStep(1); }}
                  style={{ marginTop: 20, padding: '10px 20px', borderRadius: 10, background: '#ef4444', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                  Retake the Quiz
                </button>
              </motion.div>
            )}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            style={{ marginTop: 48, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12 }}
          >
            <button
              onClick={() => { setAnswers([]); setDirection(1); setCurrentStep(1); }}
              style={{ padding: '12px 24px', borderRadius: 12, border: `1px solid ${border}`, background: bgCard, color: txtMuted, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
            >
              Not sure? Retake the quiz
            </button>
            <button
              onClick={shareResult}
              style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.06)', color: '#16a34a', fontWeight: 600, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <i className="ti ti-brand-whatsapp" /> Share my result
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── QUIZ SCREEN (Steps 1–10) ─────────────────────────────────────────────────
  const progress = (currentStep / 10) * 100;
  const cat = { from: '#7F77DD', to: '#a89ef8', shadow: 'rgba(127,119,221,0.35)' };

  return (
    <div style={{ minHeight: '100vh', background: bgPage, display: 'flex', flexDirection: 'column', padding: '0 16px 80px', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient blobs */}
      <div style={{ position: 'fixed', top: '-20%', right: '-15%', width: '55%', height: '55%', background: `radial-gradient(circle, ${cat.from}12 0%, transparent 70%)`, pointerEvents: 'none', transition: 'background 0.5s' }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '45%', height: '45%', background: `radial-gradient(circle, ${cat.to}0e 0%, transparent 70%)`, pointerEvents: 'none', transition: 'background 0.5s' }} />

      {/* Top bar */}
      <div style={{ maxWidth: 720, width: '100%', margin: '0 auto', paddingTop: 24, paddingBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Logo size="sm" showTagline={false} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: txtMuted, fontWeight: 600 }}>Question {currentStep} of 10</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: cat.from, background: `${cat.from}15`, padding: '3px 10px', borderRadius: 20, border: `1px solid ${cat.from}30`, letterSpacing: '0.04em' }}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: 6, background: border, borderRadius: 6, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 6, background: `linear-gradient(90deg, ${cat.from}, ${cat.to})` }}
          />
        </div>
      </div>

      {/* Quiz card */}
      <div style={{ maxWidth: 720, width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

        {aiError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 20, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 14, padding: '16px 20px', textAlign: 'center' }}
          >
            <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: 6 }}>Something went wrong</p>
            <p style={{ color: txtMuted, fontSize: 13, marginBottom: 12 }}>{aiError}</p>
            <button onClick={() => setAiError(null)} style={{ background: `${cat.from}18`, border: `1px solid ${cat.from}40`, borderRadius: 10, color: cat.from, padding: '8px 20px', cursor: 'pointer' }}>Try again</button>
          </motion.div>
        )}

        {loadingQuestion ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-t-[#7F77DD] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#4a4370] dark:text-gray-400 font-medium">AI is thinking of the next question...</p>
          </div>
        ) : (
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            className="step-enter"
            initial={{ opacity: 0, x: direction * 60, rotateY: direction * 6 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: direction * -60, rotateY: direction * -6 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: '1200px' }}
          >
            <div className={selectedOption ? 'card-selected' : ''} style={{ background: bgCard, backdropFilter: 'blur(24px)', border: `1px solid ${border}`, borderRadius: 24, padding: '36px 32px 32px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>

              {/* Category badge + question */}
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: cat.from, background: `${cat.from}12`, border: `1px solid ${cat.from}28` }}>
                  Question {currentStep}
                </span>
                <h2 style={{ fontSize: 'clamp(18px, 3.5vw, 26px)', fontWeight: 900, color: txtPri, marginTop: 14, marginBottom: 8, lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                  {currentQuestion?.question}
                </h2>
              </div>

              {/* Options grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14 }}>
                {currentQuestion?.options?.map((option: any, oIdx: number) => {
                  const isSelected = selectedOption === option.id;
                  return (
                    <div key={option.id}>
                    <motion.button
                      onClick={() => handleOptionSelect(option.id, option.label)}
                      initial={{ opacity: 0, y: 18, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: oIdx * 0.06, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ scale: 1.025, y: -3, boxShadow: isSelected ? `0 12px 32px ${cat.shadow}` : '0 6px 20px rgba(0,0,0,0.08)' }}
                      whileTap={{ scale: 0.975 }}
                      style={{
                        width: '100%',
                        display: 'flex', alignItems: 'flex-start', gap: 14, padding: '18px 16px',
                        borderRadius: 16,
                        border: `1.5px solid ${isSelected ? cat.from : border}`,
                        background: isSelected ? `linear-gradient(135deg, ${cat.from}16, ${cat.to}0c)` : bgCard,
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'border-color 0.2s, background 0.2s',
                        position: 'relative',
                        boxShadow: isSelected ? `0 0 0 1px ${cat.from}30, 0 4px 20px ${cat.shadow}` : 'none',
                      }}
                    >
                      {/* Emoji icon box */}
                      <div style={{
                        flexShrink: 0, width: 48, height: 48, borderRadius: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                        background: isSelected ? `linear-gradient(135deg, ${cat.from}, ${cat.to})` : `${cat.from}12`,
                        boxShadow: isSelected ? `0 4px 16px ${cat.shadow}` : 'none',
                        transition: 'background 0.25s',
                      }}>
                        <span role="img" aria-label={option.label}>{option.icon}</span>
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', height: 48 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: isSelected ? cat.from : txtPri, lineHeight: 1.3, margin: 0 }}>
                          {option.label}
                        </h4>
                      </div>

                      {/* Checkmark */}
                      {isSelected && option.id !== 'other' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          style={{ position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderRadius: '50%', background: `linear-gradient(135deg, ${cat.from}, ${cat.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <i className="ti ti-check" style={{ color: '#fff', fontSize: 12 }} />
                        </motion.div>
                      )}
                    </motion.button>
                    
                    {/* Other Text Input Field */}
                    {option.id === 'other' && showOtherInput && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                        className="w-full"
                      >
                        <input
                          type="text"
                          value={otherText}
                          onChange={(e) => setOtherText(e.target.value)}
                          onKeyDown={handleOtherSubmit}
                          placeholder="Type your answer and press Enter..."
                          autoFocus
                          style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '12px',
                            border: `2px solid ${cat.from}`,
                            background: bgCardH,
                            color: txtPri,
                            fontSize: '15px',
                            outline: 'none',
                            boxShadow: `0 4px 20px ${cat.shadow}`
                          }}
                        />
                      </motion.div>
                    )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        )}
      </div>

      {/* Navigation */}
      <div style={{ maxWidth: 720, width: '100%', margin: '20px auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <motion.button
          onClick={handleBack}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
          style={{ padding: '12px 24px', borderRadius: 14, border: `1px solid ${border}`, background: bgCard, color: txtMuted, fontWeight: 600, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <i className="ti ti-arrow-left" /> Back
        </motion.button>

        {/* Removed 'Next' button entirely - handled by auto-advance in OptionSelect/OtherSubmit */}
      </div>
    </div>
  );
}
