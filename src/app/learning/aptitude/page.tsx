'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

const DashboardBackground = dynamic(
  () => import('@/components/3D/DashboardBackground').catch(() => {
    return function Fallback() { return null; };
  }),
  { ssr: false }
);

const CATEGORIES = [
  { id:'quant',  label:'Quantitative Aptitude',
    icon:'🔢', topics:[
      'Number System','HCF & LCM','Percentages',
      'Ratio & Proportion','Profit & Loss',
      'Simple & Compound Interest','Time & Work',
      'Time Speed Distance','Averages','Mixtures',
      'Permutation & Combination','Probability',
      'Geometry & Mensuration','Data Interpretation',
    ]},
  { id:'logical', label:'Logical Reasoning',
    icon:'🧩', topics:[
      'Number Series','Letter Series','Coding-Decoding',
      'Blood Relations','Directions & Distance',
      'Seating Arrangements','Syllogism',
      'Statement & Conclusions','Analogies',
      'Classifications','Puzzles','Input-Output',
    ]},
  { id:'verbal', label:'Verbal Ability',
    icon:'📖', topics:[
      'Synonyms & Antonyms','Fill in the Blanks',
      'Sentence Correction','Reading Comprehension',
      'Para Jumbles','Idioms & Phrases',
      'Error Spotting','One Word Substitution',
      'Active-Passive Voice','Direct-Indirect Speech',
    ]},
  { id:'di', label:'Data Interpretation',
    icon:'📊', topics:[
      'Bar Charts','Line Graphs','Pie Charts',
      'Tables','Caselet DI','Mixed Charts',
    ]},
];

type Question = {
  question: string;
  options: { id: string; text: string }[];
  correct: string;
  explanation: string;
  shortcut?: string;
  difficulty: string;
  time_limit: number;
  category: string;
  topic: string;
};

export default function AptitudePage() {
  const { user } = useAuth();
  const [activeCat, setActiveCat] = useState(CATEGORIES[0]);
  const [activeTopic, setActiveTopic] = useState(CATEGORIES[0].topics[0]);
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAns, setSelectedAns] = useState<string | null>(null);
  const [detailedExp, setDetailedExp] = useState<string | null>(null);
  const [loadingExp, setLoadingExp] = useState(false);

  // Stats
  const [stats, setStats] = useState({ attempted: 0, correct: 0 });

  const fetchQuestion = async () => {
    setLoading(true);
    setSelectedAns(null);
    setDetailedExp(null);
    try {
      const res = await fetch('/api/aptitude-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: activeCat.label, topic: activeTopic, difficulty: 'Medium', previousQuestions: [] })
      });
      if (res.ok) {
        const data = await res.json();
        setQuestion(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestion();
  }, [activeTopic]);

  const handleSelect = (id: string) => {
    if (selectedAns) return;
    setSelectedAns(id);
    setStats(s => ({
      attempted: s.attempted + 1,
      correct: s.correct + (id === question?.correct ? 1 : 0)
    }));
  };

  const getDetailedExplanation = async () => {
    if (!question) return;
    setLoadingExp(true);
    try {
      const res = await fetch('/api/aptitude-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      if (res.ok) {
        const data = await res.json();
        setDetailedExp(data.explanation);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingExp(false);
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: '#05071a', color: 'white' }}>
      <DashboardBackground />
      
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', minHeight: '100vh', padding: '2rem', gap: '2rem', maxWidth: 1400, margin: '0 auto' }}>
        
        {/* Left Sidebar 25% */}
        <div style={{ flex: '0 0 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeUp 0.6s ease forwards' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>Categories</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCat(cat); setActiveTopic(cat.topics[0]); }}
                  style={{
                    padding: '0.75rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                    background: activeCat.id === cat.id ? 'rgba(127,119,221,0.2)' : 'rgba(255,255,255,0.02)',
                    color: activeCat.id === cat.id ? '#a89ef8' : 'rgba(255,255,255,0.7)',
                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                  }}
                >
                  <span style={{ fontSize: 24 }}>{cat.icon}</span>
                  <span style={{ fontSize: 11, textAlign: 'center', fontWeight: 600 }}>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
            <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>Topics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activeCat.topics.map(topic => (
                <button
                  key={topic}
                  onClick={() => setActiveTopic(topic)}
                  style={{
                    padding: '0.75rem 1rem', borderRadius: 8, border: 'none',
                    background: activeTopic === topic ? 'rgba(127,119,221,0.2)' : 'transparent',
                    color: activeTopic === topic ? 'white' : 'rgba(255,255,255,0.6)',
                    cursor: 'pointer', textAlign: 'left', fontSize: 13, transition: 'all 0.2s'
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>Session Stats</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Attempted</span>
              <span style={{ fontWeight: 'bold' }}>{stats.attempted}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Accuracy</span>
              <span style={{ fontWeight: 'bold', color: '#5DCAA5' }}>
                {stats.attempted ? Math.round((stats.correct / stats.attempted) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Main Area 75% */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', animation: 'fadeUp 0.6s ease forwards 0.2s', opacity: 0 }}>
          <div className="glass-panel" style={{ padding: '2.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div>
                <span style={{ color: '#a89ef8', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {activeCat.label}
                </span>
                <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: '0.5rem 0 0' }}>
                  {activeTopic}
                </h2>
              </div>
              {question && (
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: 20, fontSize: 13, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ⏱️ {question.time_limit}s
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 30, height: 30, border: '3px solid rgba(127,119,221,0.2)', borderTop: '3px solid #7F77DD', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : question ? (
              <>
                <p style={{ fontSize: 18, lineHeight: 1.6, marginBottom: '2rem' }}>
                  {question.question}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  {question.options.map(opt => {
                    let bg = 'rgba(255,255,255,0.05)';
                    let border = 'rgba(255,255,255,0.1)';
                    if (selectedAns) {
                      if (opt.id === question.correct) {
                        bg = 'rgba(29,158,117,0.2)'; border = '#1D9E75';
                      } else if (opt.id === selectedAns) {
                        bg = 'rgba(226,75,74,0.2)'; border = '#E24B4A';
                      }
                    }
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelect(opt.id)}
                        disabled={!!selectedAns}
                        style={{
                          padding: '1rem 1.5rem', borderRadius: 12, border: `1px solid ${border}`,
                          background: bg, color: 'white', fontSize: 15, textAlign: 'left',
                          cursor: selectedAns ? 'default' : 'pointer', transition: 'all 0.2s',
                          display: 'flex', alignItems: 'center', gap: '1rem'
                        }}
                      >
                        <span style={{ fontWeight: 'bold', color: 'rgba(255,255,255,0.5)' }}>{opt.id}</span>
                        {opt.text}
                      </button>
                    );
                  })}
                </div>

                {selectedAns && (
                  <div style={{ marginTop: 'auto', animation: 'fadeUp 0.4s ease forwards' }}>
                    <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
                      <h4 style={{ color: selectedAns === question.correct ? '#5DCAA5' : '#E24B4A', marginBottom: '0.5rem', fontSize: 16 }}>
                        {selectedAns === question.correct ? '✅ Correct!' : `❌ Incorrect. The correct answer is ${question.correct}.`}
                      </h4>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.6 }}>
                        {question.explanation}
                      </p>
                      {question.shortcut && (
                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(250,199,117,0.1)', borderLeft: '4px solid #FAC775', borderRadius: 4, color: '#FAC775', fontSize: 13 }}>
                          <strong>💡 Shortcut:</strong> {question.shortcut}
                        </div>
                      )}
                    </div>
                    
                    {detailedExp && (
                       <div style={{ padding: '1.5rem', background: 'rgba(127,119,221,0.1)', borderRadius: 12, border: '1px solid rgba(127,119,221,0.3)', marginBottom: '1rem', fontSize: 14, lineHeight: 1.6, animation: 'fadeUp 0.4s ease forwards' }}>
                         <h4 style={{ color: '#a89ef8', marginBottom: '0.5rem' }}>Detailed Explanation</h4>
                         <div dangerouslySetInnerHTML={{ __html: detailedExp.replace(/\n/g, '<br/>') }} />
                       </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        onClick={getDetailedExplanation}
                        disabled={loadingExp || !!detailedExp}
                        style={{
                          flex: 1, padding: '1rem', borderRadius: 12, border: '1px solid rgba(127,119,221,0.5)',
                          background: 'transparent', color: '#a89ef8', fontSize: 15, fontWeight: 600, cursor: detailedExp ? 'default' : 'pointer'
                        }}
                      >
                        {loadingExp ? 'Generating...' : 'Explain in detail'}
                      </button>
                      <button
                        onClick={fetchQuestion}
                        style={{
                          flex: 1, padding: '1rem', borderRadius: 12, border: 'none',
                          background: 'linear-gradient(135deg,#7F77DD,#534AB7)', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        Next Question →
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p>Failed to load question.</p>
            )}
          </div>
        </div>
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
