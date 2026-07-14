'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const PageCanvas3D = dynamic(
  () => import('@/components/3D/PageCanvas3D').catch(() => {
    return function Fallback() { return null; };
  }),
  { ssr: false }
);

type PlanStep = {
  day: string;
  focus: string;
  tasks: string[];
  tips: string;
};

export default function StudyPlanPage() {
  const [exam, setExam] = useState('');
  const [days, setDays] = useState('30');
  const [hours, setHours] = useState('4');
  
  const [plan, setPlan] = useState<PlanStep[]>([]);
  const [loading, setLoading] = useState(false);

  const generatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam.trim()) return;
    
    setLoading(true);
    setPlan([]);
    try {
      const res = await fetch('/api/generate-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam, days: parseInt(days), hoursPerDay: parseInt(hours) })
      });
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: '#05071a', color: 'white' }}>
      <PageCanvas3D intensity="medium" />
      
      <div style={{ position: 'relative', zIndex: 1, padding: '3rem 2rem', maxWidth: 1000, margin: '0 auto', animation: 'fadeUp 0.6s ease forwards' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: '1rem' }}>AI Study Planner</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Tell us your exam and time constraints. Get a personalized day-by-day study schedule.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
            <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: '1.5rem' }}>Your Constraints</h3>
            <form onSubmit={generatePlan} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Which exam are you preparing for?</label>
                <input 
                  type="text" 
                  value={exam} 
                  onChange={e => setExam(e.target.value)} 
                  placeholder="e.g. TNPSC Group 4, TCS NQT" 
                  required 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Days until exam</label>
                <input 
                  type="number" 
                  value={days} 
                  onChange={e => setDays(e.target.value)} 
                  min="1" max="180" 
                  required 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Study hours per day</label>
                <input 
                  type="number" 
                  value={hours} 
                  onChange={e => setHours(e.target.value)} 
                  min="1" max="16" 
                  required 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }} 
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '1rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#7F77DD,#534AB7)', color: 'white', fontSize: 15, fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center'
                }}
              >
                {loading ? <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : 'Generate Plan ✨'}
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!loading && plan.length === 0 && (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <span style={{ fontSize: 48, marginBottom: '1rem' }}>📅</span>
                <p>Fill out your details to generate an AI-powered study schedule.</p>
              </div>
            )}

            {loading && (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#a89ef8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div style={{ width: 40, height: 40, border: '3px solid rgba(127,119,221,0.2)', borderTop: '3px solid #7F77DD', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                <p>AI is analyzing the syllabus and calculating optimal time distribution...</p>
              </div>
            )}

            {!loading && plan.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeUp 0.6s ease forwards' }}>
                <div style={{ padding: '1rem', background: 'rgba(127,119,221,0.1)', border: '1px solid rgba(127,119,221,0.3)', borderRadius: 12, color: '#a89ef8', fontSize: 14 }}>
                  <strong>Note:</strong> This plan is customized for {exam}, assuming {days} days of prep at {hours} hours/day.
                </div>
                
                {plan.map((step, i) => (
                  <div key={i} className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: '#7F77DD' }} />
                    <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(255,255,255,0.1)', borderRadius: 20, fontSize: 11, fontWeight: 'bold', marginBottom: '1rem' }}>{step.day}</span>
                    <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: '1rem' }}>{step.focus}</h3>
                    
                    <ul style={{ paddingLeft: '1.2rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.8)', fontSize: 14, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {step.tasks.map((task, j) => (
                        <li key={j}>{task}</li>
                      ))}
                    </ul>

                    <div style={{ padding: '0.75rem', background: 'rgba(29,158,117,0.1)', borderRadius: 8, color: '#5DCAA5', fontSize: 13 }}>
                      <strong>💡 Tip:</strong> {step.tips}
                    </div>
                  </div>
                ))}
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
      `}</style>
    </div>
  );
}
