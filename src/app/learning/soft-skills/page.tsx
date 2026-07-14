'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const PageCanvas3D = dynamic(
  () => import('@/components/3D/PageCanvas3D').catch(() => {
    return function Fallback() { return null; };
  }),
  { ssr: false }
);

const TOPICS = [
  "Introduce yourself for a job interview",
  "Why should we hire you?",
  "Your greatest strength",
  "Where do you see yourself in 5 years?",
  "Tell me about a challenge you overcame",
  "Your opinion on AI in education",
  "Why engineering/medicine/commerce?",
  "Group discussion: Social media benefits",
  "Group discussion: Online education vs offline",
];

const LESSONS = [
  {
    title: 'Body Language for Interviews',
    duration: '8 min',
    type: 'guide',
  },
  {
    title: 'How to write a professional email',
    duration: '5 min',
    type: 'practice',
  },
];

type Feedback = {
  overall_score: number;
  fluency_score: number;
  grammar_score: number;
  vocabulary_score: number;
  confidence_score: number;
  strengths: string[];
  improvements: string[];
  corrected_version: string;
  better_words: { original: string; better: string }[];
  next_tip: string;
};

export default function SoftSkillsPage() {
  const [activeTopic, setActiveTopic] = useState(TOPICS[0]);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [recognitionObj, setRecognitionObj] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        const recognition = new SpeechRec();
        recognition.lang = 'en-IN';
        recognition.interimResults = true;
        recognition.continuous = false;
        
        recognition.onresult = (event: any) => {
          const trans = Array.from(event.results)
            .map((r: any) => r[0].transcript)
            .join('');
          setTranscript(trans);
        };
        
        recognition.onend = () => {
          setRecording(false);
        };
        
        setRecognitionObj(recognition);
      }
    }
  }, []);

  useEffect(() => {
    if (!recording && transcript && !loading && !feedback) {
      evaluateSpeech(transcript);
    }
  }, [recording, transcript]);

  const startSpeaking = () => {
    if (!recognitionObj) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }
    setTranscript('');
    setFeedback(null);
    setRecording(true);
    recognitionObj.start();
  };

  const stopSpeaking = () => {
    if (recognitionObj && recording) {
      recognitionObj.stop();
    }
  };

  const evaluateSpeech = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/evaluate-speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, topic: activeTopic, type: 'interview' })
      });
      if (res.ok) {
        const data = await res.json();
        setFeedback(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const [lessonText, setLessonText] = useState('');
  const [loadingLesson, setLoadingLesson] = useState(false);

  const loadLesson = async (title: string) => {
    setLoadingLesson(true);
    setLessonText('');
    try {
      const res = await fetch('/api/soft-skill-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: title })
      });
      if (res.ok) {
        const data = await res.json();
        setLessonText(data.content);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingLesson(false);
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: '#05071a', color: 'white' }}>
      <PageCanvas3D intensity="medium" />
      
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem', animation: 'fadeUp 0.6s ease forwards' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 12 }}>Soft Skills & Communication</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Practice speaking, get real-time AI feedback, and improve your professional presence.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          
          {/* Main Practice Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <h3 style={{ color: '#a89ef8', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>Current Topic</h3>
              <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: '2rem' }}>{activeTopic}</h2>

              <div style={{ marginBottom: '2rem', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {recording ? (
                  <button onClick={stopSpeaking} style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(226,75,74,0.2)', border: '2px solid #E24B4A', color: '#E24B4A', cursor: 'pointer', fontSize: 24, animation: 'pulse 1.5s infinite' }}>
                    ⏹
                  </button>
                ) : (
                  <button onClick={startSpeaking} style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(29,158,117,0.2)', border: '2px solid #1D9E75', color: '#1D9E75', cursor: 'pointer', fontSize: 32, transition: 'all 0.2s' }} className="hover-lift">
                    🎙️
                  </button>
                )}
              </div>

              {transcript && (
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 12, marginBottom: '2rem', textAlign: 'left', fontStyle: 'italic', color: 'rgba(255,255,255,0.8)' }}>
                  "{transcript}"
                </div>
              )}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: '#a89ef8' }}>
                  <div style={{ width: 24, height: 24, border: '3px solid rgba(127,119,221,0.2)', borderTop: '3px solid #7F77DD', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Analyzing your speech...
                </div>
              )}

              {feedback && (
                <div style={{ textAlign: 'left', animation: 'fadeUp 0.4s ease forwards' }}>
                  <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 100, height: 100, borderRadius: '50%', border: \`6px solid \${feedback.overall_score >= 8 ? '#1D9E75' : feedback.overall_score >= 5 ? '#FAC775' : '#E24B4A'}\`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 'bold' }}>
                        {feedback.overall_score}
                      </div>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>Overall Score</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                      {[
                        { label: 'Fluency', score: feedback.fluency_score },
                        { label: 'Grammar', score: feedback.grammar_score },
                        { label: 'Vocabulary', score: feedback.vocabulary_score },
                        { label: 'Confidence', score: feedback.confidence_score },
                      ].map(stat => (
                        <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ width: 80, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{stat.label}</span>
                          <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: \`\${stat.score * 10}%\`, background: '#7F77DD' }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 'bold' }}>{stat.score}/10</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ color: '#5DCAA5', marginBottom: '0.5rem' }}>👍 Strengths</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {feedback.strengths.map(s => <span key={s} style={{ padding: '4px 10px', background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.3)', color: '#5DCAA5', borderRadius: 20, fontSize: 12 }}>{s}</span>)}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ color: '#FAC775', marginBottom: '0.5rem' }}>🎯 Areas for Improvement</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {feedback.improvements.map(s => <span key={s} style={{ padding: '4px 10px', background: 'rgba(250,199,117,0.1)', border: '1px solid rgba(250,199,117,0.3)', color: '#FAC775', borderRadius: 20, fontSize: 12 }}>{s}</span>)}
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem', background: 'rgba(127,119,221,0.1)', border: '1px solid rgba(127,119,221,0.3)', borderRadius: 12, marginBottom: '1.5rem' }}>
                    <h4 style={{ color: '#a89ef8', marginBottom: '0.5rem' }}>✨ Better Way to Say It</h4>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', lineHeight: 1.6 }}>"{feedback.corrected_version}"</p>
                  </div>

                  <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                    <strong>Next step:</strong> {feedback.next_tip}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '1rem' }}>Practice Topics</h3>
              <select 
                value={activeTopic}
                onChange={e => { setActiveTopic(e.target.value); setTranscript(''); setFeedback(null); }}
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8, outline: 'none' }}
              >
                {TOPICS.map(t => <option key={t} value={t} style={{ color: 'black' }}>{t}</option>)}
              </select>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '1rem' }}>Video Lessons (Guides)</h3>
              {LESSONS.map(l => (
                <div key={l.title} onClick={() => loadLesson(l.title)} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: '0.5rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>{l.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{l.duration} • {l.type}</div>
                </div>
              ))}
            </div>
            
            {/* Modal for Guide */}
            {(lessonText || loadingLesson) && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="glass-panel" style={{ width: '100%', maxWidth: 700, maxHeight: '80vh', padding: '2rem', overflowY: 'auto', position: 'relative' }}>
                  <button onClick={() => { setLessonText(''); setLoadingLesson(false); }} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', fontSize: 24, cursor: 'pointer' }}>×</button>
                  {loadingLesson ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Guide...</div>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: lessonText }} />
                  )}
                </div>
              </div>
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
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(226,75,74,0.4); }
          70% { box-shadow: 0 0 0 15px rgba(226,75,74,0); }
          100% { box-shadow: 0 0 0 0 rgba(226,75,74,0); }
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(29,158,117,0.3);
        }
      `}</style>
    </div>
  );
}
