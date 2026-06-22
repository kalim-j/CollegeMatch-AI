'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { discoveryQuestions } from '@/data/discoveryQuestions';
import StreamResultCard from '@/components/StreamResultCard';
import DiscoveryLoadingScreen from '@/components/DiscoveryLoadingScreen';
import { DiscoveryResult, StreamRecommendation } from '@/types/discovery';
import Logo from '@/components/Logo';
import { motion, AnimatePresence } from 'framer-motion';

export default function DiscoverPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0); // 0 = welcome, 1-10 = questions, 11 = loading, 12 = results
  const [answers, setAnswers] = useState<Record<number, { optionId: string; streams: string[] }>>({});
  const [results, setResults] = useState<DiscoveryResult | null>(null);
  const [discoveryId, setDiscoveryId] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  // Protected route check
  useEffect(() => {
    if (user === null) {
      router.push('/login?redirect=/discover');
    }
  }, [user, router]);

  if (!user) return null;

  const handleStart = () => {
    setDirection(1);
    setCurrentStep(1);
  };

  const handleOptionSelect = (questionId: number, optionId: string, streams: string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { optionId, streams }
    }));
  };

  const handleNext = async () => {
    if (currentStep < 10) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 10) {
      setAiError(null);
      setCurrentStep(11);
      try {
        const answersArray = Object.entries(answers).map(([qId, data]) => ({
          questionId: parseInt(qId),
          optionId: data.optionId,
          streams: data.streams
        }));

        const res = await fetch('/api/discover-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers: answersArray,
            studentName: user.displayName || 'Student'
          })
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.error || 'Failed to fetch results');
        }

        const data = await res.json();

        if (data.results) {
          setResults(data.results);
          const newDocRef = doc(collection(db, `discoveries/${user.uid}/sessions`));
          await setDoc(newDocRef, {
            timestamp: serverTimestamp(),
            answers: answersArray,
            results: data.results,
            selectedStream: null
          });
          setDiscoveryId(newDocRef.id);
          setCurrentStep(12);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('Discovery error:', msg);
        setAiError('AI is temporarily unavailable. Please try again.');
        setCurrentStep(10);
      }
    }
  };

  const handleBack = () => {
    setDirection(-1);
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      setCurrentStep(0);
    }
  };

  const handleSelectStream = async (stream: StreamRecommendation) => {
    if (!discoveryId) return;
    try {
      const docRef = doc(db, `discoveries/${user.uid}/sessions`, discoveryId);
      await setDoc(docRef, { selectedStream: stream.stream }, { merge: true });
      sessionStorage.setItem('selectedStream', stream.stream);
      router.push(`/interview?stream=${encodeURIComponent(stream.stream)}&fromDiscover=true`);
    } catch (error) {
      console.error('Error saving selection:', error);
    }
  };

  const handleExploreStream = (stream: StreamRecommendation) => {
    const slug = stream.stream.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    router.push(`/stream/${slug}`);
  };

  const shareResult = () => {
    if (!results) return;
    const topStream = results.streams[0].stream;
    const text = `I just used CollegeMatch-AI and found my perfect stream: ${topStream}! Find yours at ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // ── WELCOME SCREEN ──────────────────────────────────────────────────────────
  if (currentStep === 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0d24 0%, #0f0b2a 60%, #05071a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background ambient blobs */}
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(127,119,221,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(29,158,117,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            maxWidth: 600,
            width: '100%',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 28,
            padding: '56px 48px',
            textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Logo with float animation */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}
          >
            <Logo size="lg" showTagline={true} theme="dark" />
          </motion.div>

          <h1 style={{ fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 14 }}>
            Let&apos;s find your{' '}
            <span style={{ background: 'linear-gradient(90deg, #a89ef8, #5DCAA5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              perfect stream
            </span>
          </h1>

          <h2 style={{ fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginBottom: 20, lineHeight: 1.6 }}>
            You just finished 12th. That&apos;s a big moment. Now the real question: <strong style={{ color: 'rgba(255,255,255,0.85)' }}>what next?</strong>
          </h2>

          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 28, maxWidth: 440, margin: '0 auto 28px' }}>
            Don&apos;t worry if you have no idea. I&apos;ll ask you <strong style={{ color: 'rgba(255,255,255,0.7)' }}>10 simple questions</strong> about what you enjoy and what kind of life you want to build. No right or wrong answers. Just be honest.
          </p>

          <div style={{ marginBottom: 32, padding: '14px 20px', borderRadius: 14, background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.25)', display: 'inline-block' }}>
            <p style={{ color: '#5DCAA5', fontWeight: 700, margin: 0, fontSize: 14 }}>
              Ready, {user.displayName?.split(' ')[0] || 'there'}? Let&apos;s figure this out. 🎯
            </p>
          </div>

          <motion.button
            onClick={handleStart}
            whileHover={{ scale: 1.03, boxShadow: '0 12px 40px rgba(29,158,117,0.45)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%',
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
              border: 'none',
              borderRadius: 16,
              color: '#fff',
              fontSize: 17,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              letterSpacing: '-0.01em',
            }}
          >
            <span>Let&apos;s go</span>
            <i className="ti ti-arrow-right" />
          </motion.button>

          <p style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <i className="ti ti-clock" />
            Takes about 3 minutes · Completely free
          </p>
        </motion.div>
      </div>
    );
  }

  // ── LOADING SCREEN ──────────────────────────────────────────────────────────
  if (currentStep === 11) {
    return <DiscoveryLoadingScreen />;
  }

  // ── RESULTS SCREEN ──────────────────────────────────────────────────────────
  if (currentStep === 12 && results) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0d24 0%, #0f0b2a 60%, #05071a 100%)',
          padding: '48px 16px 80px',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
            <Logo size="md" theme="dark" showTagline={false} />
            <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 900, color: '#fff', marginTop: 20, marginBottom: 8 }}>
              Here&apos;s what we found about you,{' '}
              <span style={{ background: 'linear-gradient(90deg, #a89ef8, #5DCAA5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {user.displayName?.split(' ')[0] || 'you'}
              </span>
            </h1>
          </motion.div>

          {/* Personal Insight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderTop: '4px solid #5DCAA5',
              borderRadius: 20,
              padding: '28px 32px',
              marginBottom: 32,
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginBottom: 10, fontSize: 14 }}>{results.overall_personality}</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 16, lineHeight: 1.7 }}>{results.strength_summary}</p>
            <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <p style={{ color: '#a89ef8', fontWeight: 500, margin: 0 }}>{results.encouragement}</p>
            </div>
          </motion.div>

          {/* Top Streams */}
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-crown" style={{ color: '#FBBF24' }} />
            Your Top Recommendations
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {results.streams.map((stream, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                <StreamResultCard
                  stream={stream}
                  onSelect={() => handleSelectStream(stream)}
                  onExplore={() => handleExploreStream(stream)}
                />
              </motion.div>
            ))}
          </div>

          {/* Bottom Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ marginTop: 48, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12 }}
          >
            <button
              onClick={() => {
                setAnswers({});
                setDirection(1);
                setCurrentStep(1);
              }}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Not sure? Retake the quiz
            </button>
            <button
              onClick={shareResult}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                border: '1px solid rgba(34,197,94,0.3)',
                background: 'rgba(34,197,94,0.08)',
                color: '#4ade80',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <i className="ti ti-brand-whatsapp" />
              Share my result
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── QUIZ SCREEN (Steps 1–10) ─────────────────────────────────────────────────
  const currentQuestionIndex = currentStep - 1;
  const question = discoveryQuestions[currentQuestionIndex];
  const hasAnswered = !!answers[question.id];
  const progress = (currentStep / 10) * 100;

  // Category → gradient mapping for the icon bg
  const catColor: Record<string, { from: string; to: string; text: string }> = {
    interest:    { from: '#7F77DD', to: '#a89ef8', text: '#c4b5fd' },
    strength:    { from: '#1D9E75', to: '#5DCAA5', text: '#6ee7b7' },
    personality: { from: '#3b82f6', to: '#60a5fa', text: '#93c5fd' },
    values:      { from: '#f59e0b', to: '#fbbf24', text: '#fde68a' },
    lifestyle:   { from: '#ec4899', to: '#f472b6', text: '#fbcfe8' },
    goal:        { from: '#8b5cf6', to: '#a78bfa', text: '#ddd6fe' },
  };
  const cat = catColor[question.category] || catColor.interest;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0d24 0%, #0f0b2a 60%, #05071a 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 16px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient blobs */}
      <div style={{ position: 'fixed', top: '-20%', right: '-15%', width: '55%', height: '55%', background: `radial-gradient(circle, ${cat.from}18 0%, transparent 70%)`, pointerEvents: 'none', transition: 'background 0.5s ease' }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '45%', height: '45%', background: `radial-gradient(circle, ${cat.to}12 0%, transparent 70%)`, pointerEvents: 'none', transition: 'background 0.5s ease' }} />

      {/* Top bar */}
      <div style={{ maxWidth: 720, width: '100%', margin: '0 auto', paddingTop: 24, paddingBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Logo size="sm" theme="dark" showTagline={false} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Question {currentStep} of 10</span>
            <span style={{
              fontSize: 11, fontWeight: 800, color: cat.text,
              background: `${cat.from}25`, padding: '3px 10px',
              borderRadius: 20, border: `1px solid ${cat.from}40`,
              letterSpacing: '0.04em',
            }}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              height: '100%',
              borderRadius: 6,
              background: `linear-gradient(90deg, ${cat.from}, ${cat.to})`,
            }}
          />
        </div>
      </div>

      {/* Question card with AnimatePresence slide */}
      <div style={{ maxWidth: 720, width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

        {aiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginBottom: 20, background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14,
              padding: '16px 20px', textAlign: 'center',
            }}
          >
            <p style={{ color: '#fca5a5', fontWeight: 600, marginBottom: 6 }}>Something went wrong</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 12 }}>{aiError}</p>
            <button onClick={() => setAiError(null)} style={{ background: 'rgba(127,119,221,0.2)', border: '1px solid rgba(127,119,221,0.4)', borderRadius: 10, color: '#a89ef8', padding: '8px 20px', cursor: 'pointer' }}>
              Try again
            </button>
          </motion.div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60, rotateY: direction * 8 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: direction * -60, rotateY: direction * -8 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: '1200px' }}
          >
            {/* Main question card */}
            <div
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 24,
                padding: '36px 32px 32px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              {/* Category badge */}
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <span style={{
                  display: 'inline-block', padding: '5px 16px',
                  borderRadius: 20, fontSize: 10, fontWeight: 800,
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: cat.text,
                  background: `${cat.from}20`,
                  border: `1px solid ${cat.from}35`,
                }}>
                  {question.category}
                </span>

                <h2 style={{
                  fontSize: 'clamp(18px, 3.5vw, 28px)',
                  fontWeight: 900,
                  color: '#fff',
                  marginTop: 16,
                  marginBottom: 8,
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                }}>
                  {question.question}
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>
                  {question.subtitle}
                </p>
              </div>

              {/* Options grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                {question.options.map((option, oIdx) => {
                  const isSelected = answers[question.id]?.optionId === option.id;
                  return (
                    <motion.button
                      key={option.id}
                      onClick={() => handleOptionSelect(question.id, option.id, option.streams)}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: oIdx * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{
                        scale: 1.025,
                        y: -4,
                        boxShadow: isSelected
                          ? `0 12px 32px ${cat.from}40`
                          : '0 8px 24px rgba(0,0,0,0.3)',
                      }}
                      whileTap={{ scale: 0.975 }}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 14,
                        padding: '18px 16px',
                        borderRadius: 16,
                        border: `1.5px solid ${isSelected ? cat.from : 'rgba(255,255,255,0.1)'}`,
                        background: isSelected
                          ? `linear-gradient(135deg, ${cat.from}20, ${cat.to}12)`
                          : 'rgba(255,255,255,0.04)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'border-color 0.2s, background 0.2s',
                        position: 'relative',
                        boxShadow: isSelected ? `0 0 20px ${cat.from}25` : 'none',
                      }}
                    >
                      {/* Icon box */}
                      <div style={{
                        flexShrink: 0,
                        width: 46,
                        height: 46,
                        borderRadius: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isSelected
                          ? `linear-gradient(135deg, ${cat.from}, ${cat.to})`
                          : 'rgba(255,255,255,0.07)',
                        fontSize: 22,
                        transition: 'background 0.25s',
                        boxShadow: isSelected ? `0 4px 16px ${cat.from}50` : 'none',
                      }}>
                        <span
                          style={{ fontSize: 24, lineHeight: 1 }}
                          role="img"
                          aria-label={option.label}
                        >
                          {option.icon}
                        </span>
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: isSelected ? '#fff' : 'rgba(255,255,255,0.85)',
                          marginBottom: 4,
                          lineHeight: 1.3,
                        }}>
                          {option.label}
                        </h4>
                        <p style={{
                          fontSize: 12,
                          color: isSelected ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)',
                          lineHeight: 1.4,
                          margin: 0,
                        }}>
                          {option.sub}
                        </p>
                      </div>

                      {/* Selected checkmark */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${cat.from}, ${cat.to})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <i className="ti ti-check" style={{ color: '#fff', fontSize: 12 }} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div style={{ maxWidth: 720, width: '100%', margin: '20px auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <motion.button
          onClick={handleBack}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '12px 24px',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.55)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <i className="ti ti-arrow-left" />
          Back
        </motion.button>

        <motion.button
          onClick={handleNext}
          disabled={!hasAnswered}
          whileHover={hasAnswered ? { scale: 1.04, boxShadow: `0 8px 28px ${cat.from}50` } : {}}
          whileTap={hasAnswered ? { scale: 0.96 } : {}}
          style={{
            padding: '12px 32px',
            borderRadius: 14,
            border: 'none',
            background: hasAnswered
              ? `linear-gradient(135deg, ${cat.from}, ${cat.to})`
              : 'rgba(255,255,255,0.06)',
            color: hasAnswered ? '#fff' : 'rgba(255,255,255,0.25)',
            fontWeight: 800,
            cursor: hasAnswered ? 'pointer' : 'not-allowed',
            fontSize: 15,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: hasAnswered ? `0 4px 20px ${cat.from}35` : 'none',
            transition: 'background 0.3s, box-shadow 0.3s, color 0.3s',
          }}
        >
          {currentStep === 10 ? 'See my stream ✨' : 'Next'}
          <i className="ti ti-arrow-right" />
        </motion.button>
      </div>
    </div>
  );
}
