'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

const DashboardBackground = dynamic(
  () => import('@/components/3D/DashboardBackground'),
  { ssr: false }
);

export default function AddMobilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (loading || !user || !mounted) return;
    /* Check if mobile already added */
    getDoc(doc(db,'users',user.uid)).then(snap => {
      if (snap.exists() && snap.data().mobileAdded) {
        router.push('/dashboard');
      }
    });
  }, [user, loading, mounted, router]);

  if (!mounted || loading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      setError('Enter a valid 10-digit number.'); return;
    }
    setBusy(true);
    try {
      await updateDoc(doc(db,'users',user!.uid), {
        mobile: '+91' + mobile,
        mobileAdded: true,
      });
      router.push('/dashboard');
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#05071a',
      position: 'relative',
      overflow: 'hidden',
      padding: '1rem',
    }}>
      <DashboardBackground />
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 400,
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(127,119,221,0.22)',
          borderRadius: 24,
          padding: 'clamp(2rem,5vw,2.8rem)',
          animation: 'fadeUp 0.4s ease forwards',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              📱
            </div>
            <h2 style={{
              fontSize: 22, fontWeight: 700,
              color: 'white', marginBottom: 8,
            }}>
              Add your mobile number
            </h2>
            <p style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.6,
            }}>
              We need your WhatsApp number to send
              college alerts and scholarship updates.
              Required to access CollegeMatch-AI.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ position: 'relative',
              marginBottom: 16 }}>
              <span style={{
                position: 'absolute', left: 14,
                top: '50%', transform: 'translateY(-50%)',
                fontSize: 14, color: '#a89ef8',
                fontWeight: 600,
              }}>+91</span>
              <input
                type="tel"
                value={mobile}
                onChange={e => {
                  setMobile(
                    e.target.value.replace(/\D/g,'').slice(0,10)
                  );
                  setError('');
                }}
                placeholder="10-digit mobile number"
                autoFocus
                style={{
                  width: '100%', padding: '13px 16px',
                  paddingLeft: 52,
                  borderRadius: 12,
                  border: '1px solid rgba(127,119,221,0.25)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white', fontSize: 15,
                  outline: 'none',
                  boxSizing: 'border-box',
                  letterSpacing: '0.08em',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            {error && (
              <p style={{
                fontSize: 13, color: '#F09595',
                marginBottom: 12, textAlign: 'center',
              }}>{error}</p>
            )}

            <button type="submit" disabled={busy}
              style={{
                width: '100%', padding: '13px',
                borderRadius: 12, border: 'none',
                background: mobile.length === 10
                  ? 'linear-gradient(135deg,#7F77DD,#534AB7)'
                  : 'rgba(127,119,221,0.25)',
                color: 'white', fontSize: 15,
                fontWeight: 600,
                cursor: mobile.length === 10
                  ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8,
              }}>
              {busy ? 'Saving...' : 'Continue →'}
            </button>
          </form>

          <p style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.25)',
            textAlign: 'center', marginTop: 16,
            lineHeight: 1.6,
          }}>
            🔒 Your number is private and never shared.
            Used only for college alerts.
          </p>
        </div>
      </div>
      <style>{`
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(14px)}
          to{opacity:1;transform:translateY(0)}
        }
      `}</style>
    </div>
  );
}
