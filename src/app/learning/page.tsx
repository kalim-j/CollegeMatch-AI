'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

const DashboardBackground = dynamic(
  () => import('@/components/3D/DashboardBackground').catch(() => {
    // Fallback if DashboardBackground doesn't exist
    return function Fallback() { return null; };
  }),
  { ssr: false }
);

function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#05071a'
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid rgba(127,119,221,0.2)',
        borderTop: '3px solid #7F77DD',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function LearningHubPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);


  if (!mounted || loading) return <PageLoader />;

  const modules = [
    {
      id: 'aptitude',
      icon: '🧮',
      title: 'Aptitude Training',
      sub: 'Quantitative, Logical, Verbal reasoning',
      desc: 'AI-generated MCQs with explanations. Mock tests. Track your score daily.',
      color: '#7F77DD',
      bg: 'rgba(127,119,221,0.12)',
      border: 'rgba(127,119,221,0.30)',
      href: '/learning/aptitude',
      badge: 'Most Popular',
      stats: '500+ questions',
    },
    {
      id: 'softskills',
      icon: '🗣️',
      title: 'Soft Skills & Communication',
      sub: 'Spoken English, Body language, Interview etiquette',
      desc: 'AI speaking practice. Real-time feedback on your responses.',
      color: '#1D9E75',
      bg: 'rgba(29,158,117,0.12)',
      border: 'rgba(29,158,117,0.30)',
      href: '/learning/soft-skills',
      badge: 'AI Powered',
      stats: 'Live AI feedback',
    },
    {
      id: 'govt-exams',
      icon: '🏛️',
      title: 'Government Exam Prep',
      sub: 'RRB, TNPSC, UPSC, SSC, Banking',
      desc: 'Exam-specific syllabus, daily practice, previous year papers.',
      color: '#BA7517',
      bg: 'rgba(186,117,23,0.12)',
      border: 'rgba(186,117,23,0.30)',
      href: '/learning/govt-exams',
      badge: 'TNPSC + RRB',
      stats: '10+ exams covered',
    },
    {
      id: 'mock-test',
      icon: '📝',
      title: 'Full Mock Tests',
      sub: 'Timed tests like real exams',
      desc: 'Complete mock tests with analysis, rank prediction, and weak area detection.',
      color: '#E24B4A',
      bg: 'rgba(226,75,74,0.12)',
      border: 'rgba(226,75,74,0.30)',
      href: '/learning/mock-test',
      badge: 'Timed',
      stats: 'Exam simulation',
    },
    {
      id: 'study-plan',
      icon: '📅',
      title: 'AI Study Planner',
      sub: 'Day-wise schedule with time allocation',
      desc: 'Tell AI your exam date. Get a personalised daily plan with hours per topic.',
      color: '#378ADD',
      bg: 'rgba(55,138,221,0.12)',
      border: 'rgba(55,138,221,0.30)',
      href: '/learning/study-plan',
      badge: 'Personalised',
      stats: 'Day-by-day plan',
    },
    {
      id: 'interview-prep',
      icon: '🎯',
      title: 'Interview Preparation',
      sub: 'HR + Technical + Group Discussion',
      desc: 'AI interviews you, scores your answers, gives improvement tips in real time.',
      color: '#D85A30',
      bg: 'rgba(216,90,48,0.12)',
      border: 'rgba(216,90,48,0.30)',
      href: '/mock-interview',
      badge: 'Live AI',
      stats: 'Score + feedback',
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      background: '#05071a', // Fallback background
    }}>
      <DashboardBackground />
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 1100,
        margin: '0 auto',
        padding: 'clamp(1.5rem,4vw,3rem) clamp(1rem,3vw,2rem)',
      }}>

        {/* Page header */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'clamp(2rem,4vw,3rem)',
          animation: 'fadeUp 0.6s ease forwards',
        }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(127,119,221,0.15)',
            border: '1px solid rgba(127,119,221,0.3)',
            borderRadius: 20,
            padding: '4px 14px',
            fontSize: 12,
            color: '#a89ef8',
            marginBottom: 16,
            letterSpacing: '0.05em',
          }}>
            🎓 CollegeMatch Learning Hub
          </span>
          <h1 style={{
            fontSize: 'clamp(28px,4vw,48px)',
            fontWeight: 800,
            color: 'white',
            marginBottom: 12,
            lineHeight: 1.2,
          }}>
            Learn. Practice.{' '}
            <span style={{
              background: 'linear-gradient(90deg,#a89ef8,#5DCAA5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: '#a89ef8',
            }}>
              Succeed.
            </span>
          </h1>
          <p style={{
            fontSize: 'clamp(14px,1.5vw,17px)',
            color: 'rgba(255,255,255,0.55)',
            maxWidth: 560,
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            AI-powered learning for aptitude, soft skills,
            government exams, and interview preparation.
            All in one place. All free.
          </p>
        </div>

        {/* Module cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {modules.map((mod, i) => (
            <div
              key={mod.id}
              onClick={() => router.push(mod.href)}
              className="card-3d hover-lift"
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: `1px solid ${mod.border}`,
                borderRadius: 20,
                padding: '24px',
                cursor: 'pointer',
                animation: 'fadeUp 0.5s ease forwards',
                animationDelay: `${i * 0.08}s`,
                opacity: 0,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              {/* Icon + badge row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 16,
              }}>
                <div style={{
                  width: 52, height: 52,
                  borderRadius: 14,
                  background: mod.bg,
                  border: `1px solid ${mod.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                }}>
                  {mod.icon}
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: mod.bg,
                  color: mod.color,
                  border: `1px solid ${mod.border}`,
                  whiteSpace: 'nowrap',
                }}>
                  {mod.badge}
                </span>
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                color: 'white',
                marginBottom: 4,
              }}>
                {mod.title}
              </h3>
              <p style={{
                fontSize: 12,
                color: mod.color,
                marginBottom: 8,
                fontWeight: 500,
              }}>
                {mod.sub}
              </p>
              <p style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.6,
                marginBottom: 16,
              }}>
                {mod.desc}
              </p>

              {/* Footer row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.35)',
                }}>
                  {mod.stats}
                </span>
                <span style={{
                  fontSize: 13,
                  color: mod.color,
                  fontWeight: 500,
                }}>
                  Start →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Daily streak widget */}
        <div style={{
          marginTop: 32,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(127,119,221,0.20)',
          borderRadius: 20,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          animation: 'fadeUp 0.6s ease 0.5s forwards',
          opacity: 0,
        }}>
          <div>
            <p style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.5)',
              marginBottom: 4,
            }}>
              🔥 Your daily streak
            </p>
            <p style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#FAC775',
              margin: 0,
            }}>
              1 day
            </p>
          </div>
          <button
            onClick={() => router.push('/learning/aptitude')}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              border: 'none',
              background:
                'linear-gradient(135deg,#7F77DD,#534AB7)',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow:
                '0 4px 20px rgba(127,119,221,0.35)',
            }}>
            Practice today →
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
