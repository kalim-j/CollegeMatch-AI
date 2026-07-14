'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

const PageCanvas3D = dynamic(
  () => import('@/components/3D/PageCanvas3D').catch(() => {
    return function Fallback() { return null; };
  }),
  { ssr: false }
);

const EXAMS = [
  {
    id:'tnpsc', name:'TNPSC Group 1/2/4',
    state:'Tamil Nadu', icon:'🏛️',
    subjects:['Tamil','General Knowledge',
      'Indian Polity','History','Geography',
      'Science & Technology','Current Affairs'],
    syllabus_url:'https://www.tnpsc.gov.in',
  },
  {
    id:'rrb', name:'RRB NTPC / Group D',
    state:'National', icon:'🚂',
    subjects:['Mathematics','General Intelligence',
      'General Awareness','General Science'],
    syllabus_url:'https://www.rrbchennai.gov.in',
  },
  {
    id:'ssc', name:'SSC CGL / CHSL / MTS',
    state:'National', icon:'📋',
    subjects:['Quantitative Aptitude',
      'English Language','General Awareness',
      'Reasoning'],
    syllabus_url:'https://ssc.nic.in',
  },
  {
    id:'upsc', name:'UPSC CSE Prelims',
    state:'National', icon:'🇮🇳',
    subjects:['History','Geography','Polity',
      'Economy','Environment','Science',
      'Current Affairs'],
    syllabus_url:'https://upsc.gov.in',
  },
  {
    id:'bank', name:'IBPS / SBI PO & Clerk',
    state:'National', icon:'🏦',
    subjects:['Reasoning','Quantitative Aptitude',
      'English Language','General Awareness',
      'Computer Knowledge'],
    syllabus_url:'https://www.ibps.in',
  },
  {
    id:'tnusrb', name:'TNUSRB Police',
    state:'Tamil Nadu', icon:'👮',
    subjects:['Tamil','General Knowledge',
      'Aptitude','General English'],
    syllabus_url:'https://www.tnusrbonline.org',
  },
];

type Question = {
  question: string;
  options: { id: string; text: string }[];
  correct: string;
  explanation: string;
  difficulty: string;
  time_limit: number;
};

export default function GovtExamsPage() {
  const [activeExam, setActiveExam] = useState(EXAMS[0]);
  const [activeSubject, setActiveSubject] = useState(EXAMS[0].subjects[0]);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAns, setSelectedAns] = useState<string | null>(null);

  const fetchQuestion = async () => {
    setLoading(true);
    setSelectedAns(null);
    try {
      const res = await fetch('/api/govt-exam-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam: activeExam.name, subject: activeSubject, difficulty: 'Medium' })
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
  }, [activeSubject]);

  const handleSelect = (id: string) => {
    if (selectedAns) return;
    setSelectedAns(id);
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: '#05071a', color: 'white' }}>
      <PageCanvas3D intensity="medium" />
      
      <div style={{ position: 'relative', zIndex: 1, padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem', animation: 'fadeUp 0.6s ease forwards' }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Government Exam Prep</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Practice for top government exams with AI-generated questions based on official syllabus.</p>
        </div>

        {/* Exam Selector Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {EXAMS.map((exam, i) => (
            <div 
              key={exam.id} 
              onClick={() => { setActiveExam(exam); setActiveSubject(exam.subjects[0]); }}
              className="glass-panel hover-lift"
              style={{ 
                padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s',
                background: activeExam.id === exam.id ? 'rgba(127,119,221,0.15)' : 'rgba(255,255,255,0.04)',
                border: activeExam.id === exam.id ? '1px solid #7F77DD' : '1px solid rgba(255,255,255,0.1)',
                animation: 'fadeUp 0.6s ease forwards',
                animationDelay: \`\${i * 0.05}s\`,
                opacity: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: 32 }}>{exam.icon}</span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 'bold' }}>{exam.name}</h3>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{exam.state}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Practice Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
          
          {/* Subject Tabs */}
          <div className="glass-panel" style={{ padding: '1rem', animation: 'fadeUp 0.6s ease forwards', height: 'fit-content' }}>
            <h3 style={{ fontSize: 14, fontWeight: 'bold', color: '#a89ef8', marginBottom: '1rem', textTransform: 'uppercase' }}>Subjects</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activeExam.subjects.map(sub => (
                <button
                  key={sub}
                  onClick={() => setActiveSubject(sub)}
                  style={{
                    padding: '0.75rem 1rem', borderRadius: 8, border: 'none', textAlign: 'left',
                    background: activeSubject === sub ? 'rgba(127,119,221,0.2)' : 'transparent',
                    color: activeSubject === sub ? 'white' : 'rgba(255,255,255,0.6)',
                    cursor: 'pointer', fontSize: 14, transition: 'all 0.2s'
                  }}
                >
                  {sub}
                </button>
              ))}
            </div>
            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
               <a href={activeExam.syllabus_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#a89ef8', textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                 Download Previous Papers →
               </a>
            </div>
          </div>

          {/* Question Area */}
          <div className="glass-panel" style={{ padding: '2.5rem', animation: 'fadeUp 0.6s ease forwards 0.2s', opacity: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: 24, fontWeight: 'bold' }}>{activeSubject} Practice</h2>
              {question && (
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: 20, fontSize: 13, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ⏱️ {question.time_limit}s
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
                <div style={{ width: 40, height: 40, border: '3px solid rgba(127,119,221,0.2)', borderTop: '3px solid #7F77DD', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
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
                          padding: '1rem 1.5rem', borderRadius: 12, border: \`1px solid \${border}\`,
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
                        {selectedAns === question.correct ? '✅ Correct!' : \`❌ Incorrect. The correct answer is \${question.correct}.\`}
                      </h4>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.6 }}>
                        {question.explanation}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={fetchQuestion}
                        style={{
                          padding: '1rem 2rem', borderRadius: 12, border: 'none',
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
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(127,119,221,0.2);
        }
      `}</style>
    </div>
  );
}
