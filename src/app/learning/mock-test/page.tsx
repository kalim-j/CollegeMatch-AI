'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const PageCanvas3D = dynamic(
  () => import('@/components/3D/PageCanvas3D').catch(() => {
    return function Fallback() { return null; };
  }),
  { ssr: false }
);

const EXAMS = [
  'Placement Aptitude (TCS, Infosys, Wipro)',
  'TNPSC Group 4',
  'RRB NTPC',
  'SSC CGL Tier 1',
  'Bank PO Prelims'
];

type Question = {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correct: string;
  explanation: string;
};

export default function MockTestPage() {
  const [activeExam, setActiveExam] = useState(EXAMS[0]);
  const [testActive, setTestActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const startTest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-mock-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam: activeExam, num_questions: 10 })
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
        setAnswers({});
        setCurrentIndex(0);
        setTimeLeft(data.questions.length * 60); // 1 minute per question
        setShowResults(false);
        setTestActive(true);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (testActive && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && testActive && !showResults) {
      setShowResults(true);
    }
  }, [timeLeft, testActive, showResults]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return \`\${m.toString().padStart(2, '0')}:\${s.toString().padStart(2, '0')}\`;
  };

  const handleSelect = (qId: string, optId: string) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qId]: optId }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct) correct++;
    });
    return correct;
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: '#05071a', color: 'white' }}>
      <PageCanvas3D intensity="medium" />
      
      <div style={{ position: 'relative', zIndex: 1, padding: '3rem 2rem', maxWidth: 1000, margin: '0 auto', animation: 'fadeUp 0.6s ease forwards' }}>
        
        {!testActive ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: '1rem' }}>Full Mock Tests</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>Experience real exam pressure with AI-generated timed mock tests.</p>
            
            <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: 14, fontWeight: 'bold', color: '#a89ef8' }}>Select Exam</label>
              <select
                value={activeExam}
                onChange={e => setActiveExam(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 16, outline: 'none' }}
              >
                {EXAMS.map(ex => <option key={ex} value={ex} style={{ color: 'black' }}>{ex}</option>)}
              </select>
            </div>

            <button
              onClick={startTest}
              disabled={loading}
              style={{
                width: '100%', padding: '1rem', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg,#7F77DD,#534AB7)', color: 'white', fontSize: 16, fontWeight: 'bold', cursor: 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center'
              }}
            >
              {loading ? (
                <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : 'Start Test Now'}
            </button>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 'bold' }}>{activeExam} Mock Test</h2>
                {!showResults && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Question {currentIndex + 1} of {questions.length}</p>}
              </div>
              <div style={{ padding: '0.5rem 1rem', borderRadius: 8, background: timeLeft < 60 && !showResults ? 'rgba(226,75,74,0.2)' : 'rgba(255,255,255,0.1)', color: timeLeft < 60 && !showResults ? '#E24B4A' : 'white', fontWeight: 'bold', fontSize: 18 }}>
                ⏱️ {formatTime(timeLeft)}
              </div>
            </div>

            {showResults ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(127,119,221,0.1)', border: '4px solid #7F77DD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 'bold', margin: '0 auto 1.5rem', color: '#a89ef8' }}>
                  {calculateScore()} / {questions.length}
                </div>
                <h2 style={{ fontSize: 24, marginBottom: '2rem' }}>Test Completed</h2>

                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {questions.map((q, i) => (
                    <div key={q.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: 16, marginBottom: '1rem' }}><strong>Q{i + 1}.</strong> {q.question}</p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                        {q.options.map(opt => {
                          const isSelected = answers[q.id] === opt.id;
                          const isCorrect = opt.id === q.correct;
                          let color = 'rgba(255,255,255,0.6)';
                          let bg = 'transparent';
                          if (isCorrect) { color = '#5DCAA5'; bg = 'rgba(29,158,117,0.1)'; }
                          else if (isSelected && !isCorrect) { color = '#E24B4A'; bg = 'rgba(226,75,74,0.1)'; }

                          return (
                            <div key={opt.id} style={{ padding: '0.75rem', borderRadius: 8, background: bg, color }}>
                              <strong>{opt.id}.</strong> {opt.text}
                              {isSelected && !isCorrect && ' ❌ (Your Answer)'}
                              {isCorrect && ' ✅ (Correct Answer)'}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div style={{ padding: '1rem', background: 'rgba(127,119,221,0.1)', borderRadius: 8, color: '#a89ef8', fontSize: 14 }}>
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => setTestActive(false)}
                  style={{ marginTop: '3rem', padding: '1rem 2rem', borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Take Another Test
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 18, lineHeight: 1.6, marginBottom: '2rem' }}>
                  {questions[currentIndex].question}
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  {questions[currentIndex].options.map(opt => {
                    const isSelected = answers[questions[currentIndex].id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelect(questions[currentIndex].id, opt.id)}
                        style={{
                          padding: '1rem 1.5rem', borderRadius: 12, textAlign: 'left',
                          background: isSelected ? 'rgba(127,119,221,0.2)' : 'rgba(255,255,255,0.05)',
                          border: isSelected ? '1px solid #7F77DD' : '1px solid rgba(255,255,255,0.1)',
                          color: isSelected ? 'white' : 'rgba(255,255,255,0.8)',
                          fontSize: 15, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ fontWeight: 'bold', marginRight: '1rem', color: isSelected ? '#a89ef8' : 'rgba(255,255,255,0.5)' }}>{opt.id}</span>
                        {opt.text}
                      </button>
                    )
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                    disabled={currentIndex === 0}
                    style={{ padding: '1rem 2rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', cursor: currentIndex === 0 ? 'default' : 'pointer', opacity: currentIndex === 0 ? 0.3 : 1 }}
                  >
                    ← Previous
                  </button>
                  
                  {currentIndex === questions.length - 1 ? (
                    <button
                      onClick={() => setShowResults(true)}
                      style={{ padding: '1rem 2rem', borderRadius: 12, border: 'none', background: '#E24B4A', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Submit Test
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
                      style={{ padding: '1rem 2rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#7F77DD,#534AB7)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Next →
                    </button>
                  )}
                </div>

                {/* Navigation Dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                  {questions.map((q, i) => (
                    <div 
                      key={q.id}
                      onClick={() => setCurrentIndex(i)}
                      style={{ 
                        width: 10, height: 10, borderRadius: '50%', cursor: 'pointer',
                        background: currentIndex === i ? '#7F77DD' : answers[q.id] ? '#5DCAA5' : 'rgba(255,255,255,0.2)' 
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .glass-panel {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 20px;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
