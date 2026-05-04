'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  orderBy,
  query
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface CollegeResult {
  name: string;
  location: string;
  type: string;
  level: string;
  courses: string[];
  cutoff_mark: number;
  match_score: number;
  why_fit: string;
  naac_grade: string;
  ranking: string;
}

interface Session {
  id: string;
  createdAt: string;
  topCollege: string;
  totalResults: number;
  studentProfile: {
    level: string;
    stream: string;
    state: string;
    district: string;
    cutoffMark: number;
    cutoffRange: string;
    budget: string;
    quota: string;
  };
  results: CollegeResult[];
}

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [fetching, setFetching] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, 'interviews', user.uid, 'sessions'),
          orderBy('timestamp', 'desc')
        );
        const snap = await getDocs(q);
        const data: Session[] = snap.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Session, 'id'>),
        }));
        setSessions(data);
      } catch (err) {
        console.error('History fetch error:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (loading || fetching) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p>Loading your history...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>No past sessions yet</h2>
        <p>Complete an interview to see your college matches here.</p>
        <button 
          onClick={() => router.push('/interview')}
          style={{
            marginTop: '1rem',
            padding: '10px 20px',
            borderRadius: '8px',
            background: '#534AB7',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Start Interview
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Your Interview History</h1>

      {sessions.map((session) => (
        <div
          key={session.id}
          style={{
            border: '0.5px solid #E5E7EB',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1rem',
            background: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          {/* Session Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px', color: '#534AB7' }}>
                {session.topCollege}
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                {session.studentProfile?.level} · {session.studentProfile?.stream} ·{' '}
                {session.studentProfile?.state}
                {session.studentProfile?.district
                  ? `, ${session.studentProfile.district}`
                  : ''}
              </p>
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
                Cutoff: {session.studentProfile?.cutoffMark} ({session.studentProfile?.cutoffRange}) ·{' '}
                {session.studentProfile?.budget} · Quota: {session.studentProfile?.quota}
              </p>
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                {session.createdAt
                  ? new Date(session.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })
                  : 'Date unknown'}
                {' · '}{session.totalResults} colleges matched
              </p>
            </div>
            <button
              onClick={() =>
                setExpandedId(expandedId === session.id ? null : session.id)
              }
              style={{ 
                fontSize: '13px', 
                padding: '6px 14px', 
                borderRadius: '8px', 
                cursor: 'pointer',
                border: '1px solid #E5E7EB',
                background: 'white'
              }}
            >
              {expandedId === session.id ? 'Close' : 'View Results'}
            </button>
          </div>

          {/* Expanded College Results */}
          {expandedId === session.id && session.results && (
            <div style={{ marginTop: '1rem', borderTop: '0.5px solid #E5E7EB', paddingTop: '1rem' }}>
              {session.results.map((college, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    background: '#F9FAFB',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <p style={{ fontWeight: 600, fontSize: '14px' }}>
                      {idx + 1}. {college.name}
                    </p>
                    <span style={{
                      fontSize: '12px', fontWeight: 600,
                      background: college.match_score >= 80 ? '#E1F5EE' : college.match_score >= 60 ? '#FAEEDA' : '#FCEBEB',
                      color: college.match_score >= 80 ? '#0F6E56' : college.match_score >= 60 ? '#633806' : '#791F1F',
                      padding: '2px 10px', borderRadius: '20px',
                    }}>
                      {Math.round(college.match_score)}% match
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                    {college.location} · {college.type} · NAAC: {college.naac_grade}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                    Cutoff: {college.cutoff_mark} · Rank: {college.ranking}
                  </p>
                  <p style={{ fontSize: '12px', fontStyle: 'italic', color: '#6B7280', marginBottom: '6px' }}>
                    "{college.why_fit}"
                  </p>
                  {college.courses && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {college.courses.map((course, i) => (
                        <span key={i} style={{
                          fontSize: '11px', padding: '2px 8px',
                          borderRadius: '12px',
                          background: '#EEEDFE', color: '#3C3489',
                        }}>
                          {course}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
