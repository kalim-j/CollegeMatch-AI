'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

type WelcomeModalProps = {
  userName: string;
  onClose: () => void;
};

export default function WelcomeModal({ userName, onClose }: WelcomeModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleChoice = async (path: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { shownWelcome: true });
      onClose();
      router.push(path);
    } catch (error) {
      console.error('Error updating welcome status:', error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Animated background glow behind the card */}
      <div style={{
        position: 'absolute',
        width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(127,119,221,0.15),transparent)',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(127,119,221,0.20)',
        borderRadius: 28,
        padding: 'clamp(2rem,4vw,3rem)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(127,119,221,0.08)',
        maxWidth: 800,
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
        width: '100%',
      }}>
        
        <div className="text-center mb-8">
          <div style={{
            width: 80, height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,rgba(29,158,117,0.2),rgba(127,119,221,0.2))',
            border: '1px solid rgba(29,158,117,0.30)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            margin: '0 auto 24px',
            animation: 'float3d 3s ease-in-out infinite',
            boxShadow: '0 0 30px rgba(29,158,117,0.20)',
          }}>
            🎓
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Welcome to CollegeMatch-AI, {userName || 'friend'}!
          </h2>
          <p className="text-gray-300">
            Before we find colleges, one quick question:
          </p>
          <p className="text-xl text-teal-300 font-medium mt-4">
            Do you know what you want to study after 12th?
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* LEFT CARD */}
          <div style={{
            background: 'rgba(127,119,221,0.08)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(127,119,221,0.25)',
            borderRadius: 20,
            padding: '28px 24px',
            cursor: loading ? 'not-allowed' : 'pointer',
            flex: 1,
            textAlign: 'center',
            transition: 'all 0.3s ease',
            opacity: loading ? 0.5 : 1,
          }}
          onClick={() => !loading && handleChoice('/interview')}
          onMouseEnter={e => {
            if (loading) return;
            (e.currentTarget as HTMLDivElement).style.background = 'rgba(127,119,221,0.15)';
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(127,119,221,0.6)';
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px) scale(1.02)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(127,119,221,0.25)';
          }}
          onMouseLeave={e => {
            if (loading) return;
            (e.currentTarget as HTMLDivElement).style.background = 'rgba(127,119,221,0.08)';
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(127,119,221,0.25)';
            (e.currentTarget as HTMLDivElement).style.transform = 'none';
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
          }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(127,119,221,0.15)',
              border: '1px solid rgba(127,119,221,0.30)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 32,
              margin: '0 auto 16px',
            }}>🏫</div>

            <h3 style={{
              fontSize: 17, fontWeight: 700,
              color: 'white', marginBottom: 8,
            }}>
              Yes, I know my stream
            </h3>
            <p style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.6,
              marginBottom: 16,
            }}>
              I am ready to find the best colleges
              for my marks and cutoff.
            </p>

            <div style={{
              display: 'flex', gap: 6,
              flexWrap: 'wrap', justifyContent: 'center',
            }}>
              {['8 matched colleges','Cutoff analysis',
                'NAAC grades'].map(t => (
                <span key={t} style={{
                  fontSize: 11, padding: '3px 8px',
                  borderRadius: 20,
                  background: 'rgba(127,119,221,0.15)',
                  color: '#a89ef8',
                  border: '1px solid rgba(127,119,221,0.20)',
                }}>{t}</span>
              ))}
            </div>

            <div style={{
              marginTop: 16, fontSize: 13,
              color: '#a89ef8', fontWeight: 500,
            }}>
              Find colleges →
            </div>
          </div>

          {/* RIGHT CARD */}
          <div style={{
            background: 'rgba(29,158,117,0.08)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(29,158,117,0.25)',
            borderRadius: 20,
            padding: '28px 24px',
            cursor: loading ? 'not-allowed' : 'pointer',
            flex: 1,
            textAlign: 'center',
            transition: 'all 0.3s ease',
            position: 'relative',
            opacity: loading ? 0.5 : 1,
          }}
          onClick={() => !loading && handleChoice('/discover')}
          onMouseEnter={e => {
            if (loading) return;
            (e.currentTarget as HTMLDivElement).style.background = 'rgba(29,158,117,0.15)';
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(29,158,117,0.6)';
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px) scale(1.02)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(29,158,117,0.25)';
          }}
          onMouseLeave={e => {
            if (loading) return;
            (e.currentTarget as HTMLDivElement).style.background = 'rgba(29,158,117,0.08)';
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(29,158,117,0.25)';
            (e.currentTarget as HTMLDivElement).style.transform = 'none';
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
          }}
          >
            <div style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(29,158,117,0.12)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(29,158,117,0.35)',
              borderRadius: 30,
              padding: '6px 16px 6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 0 20px rgba(29,158,117,0.20)',
              animation: 'pulse-ring 2s ease infinite',
            }}>
              <div style={{
                width: 8, height: 8,
                borderRadius: '50%',
                background: '#1D9E75',
                animation: 'blink 1.5s ease infinite',
              }} />
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#5DCAA5',
                letterSpacing: '0.04em',
              }}>
                Start here
              </span>
            </div>

            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(29,158,117,0.15)',
              border: '1px solid rgba(29,158,117,0.30)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 32,
              margin: '0 auto 16px',
            }}>🧭</div>

            <h3 style={{
              fontSize: 17, fontWeight: 700,
              color: 'white', marginBottom: 8,
            }}>
              No, help me figure it out
            </h3>
            <p style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.6,
              marginBottom: 16,
            }}>
              Let AI ask about your interests, strengths
              and suggest the perfect stream for you.
            </p>

            <div style={{
              display: 'flex', gap: 6,
              flexWrap: 'wrap', justifyContent: 'center',
            }}>
              {['10 questions', 'Career paths', 'Stream guide'].map(t => (
                <span key={t} style={{
                  fontSize: 11, padding: '3px 8px',
                  borderRadius: 20,
                  background: 'rgba(29,158,117,0.15)',
                  color: '#5DCAA5',
                  border: '1px solid rgba(29,158,117,0.20)',
                }}>{t}</span>
              ))}
            </div>

            <div style={{
              marginTop: 16, fontSize: 13,
              color: '#5DCAA5', fontWeight: 500,
            }}>
              Discover my stream →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
