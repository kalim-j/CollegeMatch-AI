'use client';
import { useState, useEffect } from 'react';
import {
  collection, query, where, orderBy,
  getDocs, deleteDoc, doc, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthGuard } from '@/lib/auth-guard';
import PageLoader from '@/components/PageLoader';
import dynamic from 'next/dynamic';

const PageCanvas3D = dynamic(
  () => import('@/components/PageCanvas3D'),
  { ssr: false }
);

interface HistoryItem {
  id: string;
  type: 'college-match' | 'scholarship' |
        'aptitude' | 'mock-interview' |
        'study-plan' | 'resume' | 'sop' |
        'doubt' | 'stream-discovery';
  title: string;
  summary: string;
  data: Record<string, unknown>;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

export default function HistoryPage() {
  const { state, user } = useAuthGuard();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (state !== 'verified' || !user || !mounted) return;

    const load = async () => {
      setLoading(true);
      try {
        /* Auto-delete expired items first */
        const expiredQ = query(
          collection(db,'history',user.uid,'items'),
          where('expiresAt','<',Timestamp.now())
        );
        const expiredSnap = await getDocs(expiredQ);
        await Promise.all(
          expiredSnap.docs.map(d =>
            deleteDoc(d.ref)
          )
        );

        /* Load remaining history */
        const q = query(
          collection(db,'history',user.uid,'items'),
          orderBy('createdAt','desc')
        );
        const snap = await getDocs(q);
        setItems(snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        } as HistoryItem)));
      } catch(e) {
        console.error('History load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [state, user, mounted]);

  if (state === 'loading' || !mounted) return <PageLoader />;
  if (state !== 'verified') return null;

  const TYPES = [
    { id:'all',            label:'All',           icon:'📋' },
    { id:'college-match',    label:'College Match', icon:'🏫' },
    { id:'scholarship',      label:'Scholarships',  icon:'💰' },
    { id:'aptitude',         label:'Aptitude',      icon:'🧮' },
    { id:'mock-interview',   label:'Interviews',    icon:'🎯' },
    { id:'study-plan',       label:'Study Plans',   icon:'📅' },
    { id:'resume',           label:'Resumes',       icon:'📄' },
    { id:'doubt',            label:'Doubts',        icon:'💡' },
  ];

  const filtered = filter === 'all'
    ? items
    : items.filter(i => i.type === filter);

  const daysLeft = (expires: Timestamp) => {
    if (!expires || !expires.toDate) return 15;
    const diff = expires.toDate().getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  };

  const typeIcon: Record<string,string> = {
    'college-match': '🏫',
    'scholarship': '💰',
    'aptitude': '🧮',
    'mock-interview': '🎯',
    'study-plan': '📅',
    'resume': '📄',
    'sop': '✍️',
    'doubt': '💡',
    'stream-discovery': '🧭',
  };

  const downloadHistory = () => {
    const data = JSON.stringify(filtered.map(i => ({
      type: i.type,
      title: i.title,
      summary: i.summary,
      date: i.createdAt && i.createdAt.toDate ? i.createdAt.toDate().toLocaleDateString('en-IN') : '',
      data: i.data,
    })), null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collegematch-history-${
      new Date().toISOString().slice(0,10)
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
    }}>
      <PageCanvas3D intensity="low" />
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 900, margin: '0 auto',
        padding: 'clamp(1.5rem,4vw,3rem)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap', gap: 12,
          marginBottom: 24,
          animation: 'fadeUp 0.5s ease forwards',
        }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(22px,3.5vw,36px)',
              fontWeight: 800, color: 'white',
              margin: '0 0 6px',
            }}>
              📋 Your History
            </h1>
            <p style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.50)',
            }}>
              Activity from the last 15 days.
              Download before it expires.
            </p>
          </div>
          <button
            onClick={downloadHistory}
            style={{
              padding: '10px 18px', borderRadius: 10,
              border: '1px solid rgba(127,119,221,0.3)',
              background: 'rgba(127,119,221,0.10)',
              color: '#a89ef8', fontSize: 13,
              fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              gap: 6,
            }}>
            ⬇ Download History
          </button>
        </div>

        {/* Filter tabs — horizontal scroll on mobile */}
        <div style={{
          display: 'flex', gap: 8,
          overflowX: 'auto', paddingBottom: 4,
          marginBottom: 20,
          scrollbarWidth: 'none',
        }}>
          {TYPES.map(t => (
            <button key={t.id}
              onClick={() => setFilter(t.id)}
              style={{
                padding: '7px 14px',
                borderRadius: 20,
                border: filter === t.id
                  ? '1px solid rgba(127,119,221,0.7)'
                  : '1px solid rgba(255,255,255,0.10)',
                background: filter === t.id
                  ? 'rgba(127,119,221,0.18)'
                  : 'transparent',
                color: filter === t.id
                  ? '#a89ef8'
                  : 'rgba(255,255,255,0.55)',
                fontSize: 12, fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* 15-day warning banner */}
        <div style={{
          background: 'rgba(186,117,23,0.10)',
          border: '1px solid rgba(186,117,23,0.25)',
          borderRadius: 12, padding: '10px 14px',
          marginBottom: 20,
          fontSize: 12,
          color: '#FAC775',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          ⏰ History is automatically deleted after 15 days.
          Download your data to keep it permanently.
        </div>

        {/* Loading state */}
        {loading ? (
          <div style={{
            display: 'flex', justifyContent: 'center',
            alignItems: 'center', minHeight: 200, gap: 12,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              border: '2px solid rgba(127,119,221,0.2)',
              borderTop: '2px solid #7F77DD',
              animation: 'spin 0.8s linear infinite',
            }}/>
            <span style={{
              color: 'rgba(255,255,255,0.5)', fontSize: 14,
            }}>
              Loading history...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div style={{
            textAlign: 'center', padding: '4rem 1rem',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              📭
            </div>
            <h3 style={{
              fontSize: 18, color: 'white',
              marginBottom: 8,
            }}>
              No history yet
            </h3>
            <p style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.45)',
            }}>
              Your activity will appear here
            </p>
          </div>
        ) : (
          /* History list */
          <div style={{
            display: 'flex', flexDirection: 'column',
            gap: 10,
          }}>
            {filtered.map((item, i) => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  animation: 'fadeUp 0.5s ease forwards',
                  animationDelay: `${i*0.04}s`,
                  opacity: 0,
                  transition: 'border-color 0.2s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement)
                    .style.borderColor =
                    'rgba(127,119,221,0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement)
                    .style.borderColor =
                    'rgba(255,255,255,0.08)';
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: 'rgba(127,119,221,0.12)',
                  border: '1px solid rgba(127,119,221,0.20)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  {typeIcon[item.type] || '📋'}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap', gap: 6,
                    marginBottom: 4,
                  }}>
                    <h3 style={{
                      fontSize: 14, fontWeight: 600,
                      color: 'white', margin: 0,
                    }}>
                      {item.title}
                    </h3>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      padding: '2px 8px', borderRadius: 20,
                      background: daysLeft(item.expiresAt) <= 3
                        ? 'rgba(226,75,74,0.15)'
                        : 'rgba(127,119,221,0.12)',
                      color: daysLeft(item.expiresAt) <= 3
                        ? '#F09595' : '#a89ef8',
                      whiteSpace: 'nowrap',
                    }}>
                      {daysLeft(item.expiresAt) === 0
                        ? 'Expires today'
                        : `${daysLeft(item.expiresAt)}d left`}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.50)',
                    margin: '0 0 6px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.summary}
                  </p>
                  <p style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.28)',
                    margin: 0,
                  }}>
                    {item.createdAt && item.createdAt.toDate ? item.createdAt.toDate()
                      .toLocaleDateString('en-IN', {
                        day:'numeric', month:'short',
                        year:'numeric', hour:'2-digit',
                        minute:'2-digit',
                      }) : 'Recent'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp{
          from{opacity:0;transform:translateY(12px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes spin{
          from{transform:rotate(0)}
          to{transform:rotate(360deg)}
        }
      `}</style>
    </div>
  );
}
