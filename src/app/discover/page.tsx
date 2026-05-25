'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { discoveryQuestions } from '@/data/discoveryQuestions';
import GlassCard from '@/components/GlassCard';
import StreamResultCard from '@/components/StreamResultCard';
import DiscoveryLoadingScreen from '@/components/DiscoveryLoadingScreen';
import { DiscoveryResult, StreamRecommendation } from '@/types/discovery';

export default function DiscoverPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0); // 0 = welcome, 1-10 = questions, 11 = loading, 12 = results
  const [answers, setAnswers] = useState<Record<number, { optionId: string; streams: string[] }>>({});
  const [results, setResults] = useState<DiscoveryResult | null>(null);
  const [discoveryId, setDiscoveryId] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Protected route check
  useEffect(() => {
    if (user === null) {
      router.push('/login?redirect=/discover');
    }
  }, [user, router]);

  if (!user) return null; // or a simple loader

  const handleStart = () => setCurrentStep(1);

  const handleOptionSelect = (questionId: number, optionId: string, streams: string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { optionId, streams }
    }));
  };

  const handleNext = async () => {
    if (currentStep < 10) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 10) {
      // Submit
      setAiError(null);
      setCurrentStep(11); // Loading
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
          
          // Save to Firestore
          const newDocRef = doc(collection(db, `discoveries/${user.uid}/sessions`));
          await setDoc(newDocRef, {
            timestamp: serverTimestamp(),
            answers: answersArray,
            results: data.results,
            selectedStream: null
          });
          
          setDiscoveryId(newDocRef.id);
          setCurrentStep(12); // Results
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

  // Welcome Screen
  if (currentStep === 0) {
    return (
      <div className="container mx-auto px-4 py-12 md:py-20 flex justify-center items-center min-h-[80vh]">
        <GlassCard className="max-w-2xl w-full p-8 md:p-12 text-center animate-fadeUp relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto bg-teal-500/10 border border-teal-500/30 rounded-2xl flex items-center justify-center mb-6 transform rotate-3">
              <i className="ti-stars text-4xl text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]"></i>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Let's find your <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">perfect stream</span>
            </h1>
            
            <h2 className="text-xl md:text-2xl text-gray-300 font-medium mb-6">
              You just finished 12th. That's a big moment. Now the real question: what next?
            </h2>
            
            <p className="text-gray-400 mb-8 leading-relaxed text-lg max-w-lg mx-auto">
              Don't worry if you have no idea. Most students feel exactly the same way. 
              I'll ask you 10 simple questions about what you enjoy, what you're good at, 
              and what kind of life you want to build. No right or wrong answers. 
              Just be honest — and I'll suggest the best stream and career paths for you.
            </p>
            
            <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-xl inline-block">
              <p className="text-teal-300 font-medium">
                Ready, {user.displayName?.split(' ')[0] || 'there'}? Let's figure this out.
              </p>
            </div>
            
            <button
              onClick={handleStart}
              className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 mx-auto"
            >
              <span>Let's go</span>
              <i className="ti-arrow-right"></i>
            </button>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <i className="ti-clock"></i>
              <span>Takes about 3 minutes · Completely free</span>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Loading Screen
  if (currentStep === 11) {
    return <DiscoveryLoadingScreen />;
  }

  // Results Screen
  if (currentStep === 12 && results) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Personal Insight */}
        <GlassCard className="p-6 md:p-8 mb-8 border-t-4 border-t-teal-500">
          <h2 className="text-2xl font-bold text-white mb-4">
            Here's what we found about you, {user.displayName?.split(' ')[0] || ''}
          </h2>
          <p className="text-gray-400 italic mb-4">
            {results.overall_personality}
          </p>
          <p className="text-gray-300 mb-6">
            {results.strength_summary}
          </p>
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <p className="text-indigo-300 font-medium">
              {results.encouragement}
            </p>
          </div>
        </GlassCard>

        {/* Top 3 Streams */}
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <i className="ti-crown text-yellow-400"></i>
          Your Top Recommendations
        </h3>
        
        <div className="space-y-6">
          {results.streams.map((stream, idx) => (
            <StreamResultCard
              key={idx}
              stream={stream}
              onSelect={() => handleSelectStream(stream)}
              onExplore={() => handleExploreStream(stream)}
            />
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              setAnswers({});
              setCurrentStep(1);
            }}
            className="px-6 py-3 rounded-lg border border-white/10 hover:bg-white/5 text-gray-300 transition-colors"
          >
            Not sure? Retake the quiz
          </button>
          <button
            onClick={shareResult}
            className="px-6 py-3 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 transition-colors flex items-center gap-2"
          >
            <i className="ti-brand-whatsapp"></i>
            Share my result
          </button>
        </div>
      </div>
    );
  }

  // Quiz Screen (Steps 1-10)
  const currentQuestionIndex = currentStep - 1;
  const question = discoveryQuestions[currentQuestionIndex];
  const hasAnswered = !!answers[question.id];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl min-h-[80vh] flex flex-col">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-400">Question {currentStep} of 10</span>
          <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-1 rounded">
            {Math.round((currentStep / 10) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-400 to-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 10) * 100}%` }}
          ></div>
        </div>
      </div>

      {aiError && (
        <div style={{
          margin: '20px auto',
          maxWidth: '500px',
          background: 'rgba(226,75,74,0.12)',
          border: '1px solid rgba(226,75,74,0.35)',
          borderRadius: '14px',
          padding: '20px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#F09595', fontSize: '15px',
            fontWeight: 500, marginBottom: '8px' }}>
            Something went wrong
          </p>
          <p style={{ color: 'rgba(255,255,255,0.55)',
            fontSize: '13px', marginBottom: '14px' }}>
            {aiError}
          </p>
          <button onClick={() => { setAiError(null); }}
            style={{
              background: 'rgba(127,119,221,0.2)',
              border: '1px solid rgba(127,119,221,0.4)',
              borderRadius: '10px', color: '#a89ef8',
              padding: '8px 20px', cursor: 'pointer',
              fontSize: '13px',
            }}>
            Try again
          </button>
        </div>
      )}

      {/* Question Card */}
      <div className="flex-1">
        <GlassCard className="p-6 md:p-8 animate-fadeUp">
          <div className="mb-8 text-center">
            <span className="inline-block px-3 py-1 mb-4 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 uppercase tracking-wider">
              {question.category}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {question.question}
            </h2>
            <p className="text-gray-400">
              {question.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {question.options.map((option) => {
              const isSelected = answers[question.id]?.optionId === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(question.id, option.id, option.streams)}
                  className={`relative p-4 rounded-xl border text-left transition-all duration-200 group flex items-start gap-4 ${
                    isSelected 
                      ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/50 hover:scale-[1.01]'
                  }`}
                >
                  <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-indigo-500/20' : 'bg-white/5 group-hover:bg-indigo-500/10'
                  }`}>
                    <i className={`${option.icon} text-2xl ${isSelected ? 'text-indigo-400' : 'text-gray-400 group-hover:text-indigo-300'}`}></i>
                  </div>
                  <div>
                    <h4 className={`font-bold mb-1 ${isSelected ? 'text-indigo-300' : 'text-gray-200 group-hover:text-white'}`}>
                      {option.label}
                    </h4>
                    <p className={`text-xs ${isSelected ? 'text-indigo-200/70' : 'text-gray-500 group-hover:text-gray-400'}`}>
                      {option.sub}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                      <i className="ti-check text-white text-sm"></i>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={handleBack}
          className="px-6 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
        >
          <i className="ti-arrow-left"></i>
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!hasAnswered}
          className={`px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${
            hasAnswered
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
              : 'bg-white/5 text-gray-500 cursor-not-allowed'
          }`}
        >
          {currentStep === 10 ? 'See my stream' : 'Next'}
          <i className="ti-arrow-right"></i>
        </button>
      </div>
    </div>
  );
}
