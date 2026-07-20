'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import SelectField from '@/components/SelectField';
import { useAuthGuard } from '@/lib/auth-guard';

interface College {
  id: string;
  name: string;
  short?: string;
  state: string;
  city: string;
  type: string;
  level: string[];
  streams: string[];
  nirf_rank: number | null;
  naac_grade: string;
  established: number;
  avg_package: string;
  placement_pct: number;
  ug_cutoff: Record<string, number> | null;
  pg_cutoff: Record<string, number> | null;
  annual_fee_ug: string | null;
  annual_fee_pg: string | null;
  website: string;
  image_query: string;
  courses_ug?: string[];
  courses_pg?: string[];
  about: string;
  admissionChance?: { chance: string; color: string; pct: number };
  ai_insight?: string;
  best_course?: string;
  insider_tip?: string;
}

function FormField({ label, children }: { label: string, children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  return (
    <div className="mb-6">
      <label style={{ 
        display: 'block', 
        fontSize: '14px', 
        fontWeight: 'bold', 
        color: isDark ? '#a89ef8' : '#534AB7', 
        marginBottom: '8px', 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em' 
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function PredictorPage() {
  const { user, state: authLoading } = useAuthGuard();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [view, setView] = useState<'form' | 'results'>('form');
  const [results, setResults] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [level, setLevel] = useState<'UG' | 'PG'>('UG');
  const [percentage, setPercentage] = useState('');
  const [cutoffMark, setCutoffMark] = useState('');
  const [gateScore, setGateScore] = useState('');
  const [catPercentile, setCatPercentile] = useState('');
  const [state, setState] = useState('');
  const [category, setCategory] = useState('');
  const [stream, setStream] = useState('');
  const [budget, setBudget] = useState('');

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Browser back button support
  useEffect(() => {
    if (view === 'results') {
      window.history.pushState({ view: 'results' }, '');
    }
  }, [view]);

  useEffect(() => {
    const handlePop = () => {
      setView('form');
      setResults([]);
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  function calcAdmissionChance(
    college: College,
    studentCutoff: number,
    cat: string,
    lvl: string
  ): { chance: string; color: string; pct: number } {
    const cutoffs = lvl === 'UG' ? college.ug_cutoff : college.pg_cutoff;

    if (!cutoffs) return { chance: 'Check eligibility', color: '#6b6894', pct: 50 };

    const collegeCutoff = cutoffs[cat] || cutoffs['General'] || cutoffs['OBC'] || 150;
    const diff = studentCutoff - collegeCutoff;

    if (diff >= 10) return { chance: 'Very High', color: '#1D9E75', pct: 95 };
    if (diff >= 5) return { chance: 'High', color: '#2ECC71', pct: 85 };
    if (diff >= 0) return { chance: 'Good', color: '#5DCAA5', pct: 75 };
    if (diff >= -5) return { chance: 'Moderate', color: '#BA7517', pct: 55 };
    if (diff >= -10) return { chance: 'Low', color: '#E24B4A', pct: 30 };
    return { chance: 'Very Low', color: '#A32D2D', pct: 10 };
  }

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setView('results');

    try {
      // Load college database
      const dbRes = await fetch('/data/colleges-db.json');
      const allColleges = await dbRes.json();

      // Parse student score
      const studentCutoff = cutoffMark
        ? parseFloat(cutoffMark)
        : percentage
        ? (parseFloat(percentage) / 100) * 200
        : gateScore
        ? parseFloat(gateScore) / 5
        : catPercentile
        ? parseFloat(catPercentile) * 2
        : 150;

      // Filter colleges
      let filtered = allColleges.filter((c: College) => {
        const matchLevel = c.level.includes(level);
        const matchState = !state || c.state === state;
        const matchStream = !stream || c.streams.some((s: string) => s.toLowerCase().includes(stream.toLowerCase()));
        const matchBudget = !budget || (() => {
          const fee = level === 'UG'
            ? parseInt(c.annual_fee_ug?.replace(/[^\d]/g,'') || '0')
            : parseInt(c.annual_fee_pg?.replace(/[^\d]/g,'') || '0');
          if (budget === 'govt') return fee < 100000;
          if (budget === 'medium') return fee < 200000;
          if (budget === 'high') return fee < 500000;
          return true;
        })();

        return matchLevel && matchState && matchStream && matchBudget;
      });

      // Calculate admission chances
      filtered = filtered.map((c: College) => {
        const chance = calcAdmissionChance(c, studentCutoff, category || 'General', level);
        return { ...c, admissionChance: chance };
      });

      // Sort by admission chance
      filtered.sort((a: College & {admissionChance: {pct: number}},
        b: College & {admissionChance: {pct: number}}) =>
        b.admissionChance.pct - a.admissionChance.pct
      );

      const top8 = filtered.slice(0, 8);

      // Get AI insights for top 5
      if (top8.length > 0) {
        const aiRes = await fetch('/api/predict-smart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cutoff: studentCutoff,
            percentage,
            category: category || 'General',
            state,
            stream,
            level,
            topColleges: top8.slice(0, 5),
          }),
        });
        
        let aiInsights: any[] = [];
        if (aiRes.ok) {
           aiInsights = await aiRes.json();
        }

        // Merge AI insights into college data
        const withInsights = top8.map((c: College) => {
          const insight = aiInsights.find(
            (a: {name: string}) => c.name.toLowerCase().includes(a.name.toLowerCase().split(' ')[0])
          );
          return {
            ...c,
            ai_insight: insight?.recommendation,
            best_course: insight?.best_course,
            insider_tip: insight?.insider_tip,
          };
        });

        setResults(withInsights);
      } else {
        setResults(top8);
      }
    } catch (err) {
      console.error('Predict error:', err);
      setError('Something went wrong. Please try again.');
      setView('form');
    } finally {
      setIsLoading(false);
    }
  };

  if (state !== 'verified' || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? '#05071a' : '#f8f7ff',
      position: 'relative',
      padding: '24px 16px',
    }}>
      <div className="max-w-4xl mx-auto pt-8">
        
        {view === 'results' && (
          <button
            onClick={() => {
              setView('form');
              setResults([]);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: isDark ? '#a89ef8' : '#534AB7',
              fontSize: '14px',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: '8px 0',
              marginBottom: '24px',
              fontWeight: 500,
            }}>
            ← Back to search
          </button>
        )}

        <div className="text-center mb-12">
          {view === 'form' ? (
            <>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                color: isDark ? '#a89ef8' : '#534AB7',
                marginBottom: '12px'
              }}>
                Find Your Perfect College
              </h1>
              <p style={{
                fontSize: '1.125rem',
                color: isDark ? 'rgba(255,255,255,0.55)' : '#6b6894',
                fontWeight: 500
              }}>
                Let our AI analyze your profile and find your best match
              </p>
            </>
          ) : (
            <>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                color: isDark ? '#5DCAA5' : '#0F6E56',
                marginBottom: '12px'
              }}>
                Perfect Match Found!
              </h1>
              <p style={{
                fontSize: '1.125rem',
                color: isDark ? 'rgba(255,255,255,0.55)' : '#6b6894',
                fontWeight: 500
              }}>
                Here are your top colleges based on your profile
              </p>
            </>
          )}
        </div>

        {view === 'form' ? (
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(127,119,221,0.15)',
            borderRadius: '20px',
            backdropFilter: isDark ? 'blur(20px)' : 'none',
            padding: '32px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
          }}>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div style={{
              display: 'flex',
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(127,119,221,0.08)',
              borderRadius: '14px',
              padding: '4px',
              marginBottom: '24px',
              width: 'fit-content',
              margin: '0 auto 24px',
            }}>
              {(['UG', 'PG'] as const).map(l => (
                <button
                  key={l}
                  onClick={(e) => {
                    e.preventDefault();
                    setLevel(l);
                    setCutoffMark('');
                    setGateScore('');
                    setCatPercentile('');
                    setPercentage('');
                  }}
                  style={{
                    padding: '10px 32px',
                    borderRadius: '10px',
                    border: 'none',
                    background: level === l ? 'linear-gradient(135deg,#7F77DD,#534AB7)' : 'transparent',
                    color: level === l ? 'white' : isDark ? 'rgba(255,255,255,0.55)' : '#6b6894',
                    fontWeight: level === l ? 600 : 400,
                    fontSize: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: level === l ? '0 4px 15px rgba(127,119,221,0.35)' : 'none',
                  }}>
                  {l === 'UG' ? '🎓 UG' : '🎓 PG'}
                </button>
              ))}
            </div>

            <form onSubmit={handlePredict}>
              {level === 'UG' && (
                <>
                  <FormField label="YOUR 12TH PERCENTAGE (%)">
                    <input
                      type="number"
                      min="0" max="100" step="0.01"
                      value={percentage}
                      onChange={e => setPercentage(e.target.value)}
                      placeholder="e.g. 87.5"
                      className="glass-input"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.06)' : '#f0eeff',
                        color: isDark ? 'white' : '#1a1340',
                      }}
                    />
                  </FormField>

                  <FormField label="TAMIL NADU CUTOFF MARK (optional)">
                    <input
                      type="number"
                      min="0" max="200" step="0.01"
                      value={cutoffMark}
                      onChange={e => setCutoffMark(e.target.value)}
                      placeholder="e.g. 185 (Maths + Physics/2 + Chem/2)"
                      className="glass-input"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.06)' : '#f0eeff',
                        color: isDark ? 'white' : '#1a1340',
                      }}
                    />
                    <p style={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.35)' : '#7a7399', marginTop: '4px' }}>
                      💡 Don't know your cutoff?
                      <a href="/cutoff-calculator" style={{ color: isDark ? '#a89ef8' : '#534AB7', marginLeft: '4px', textDecoration: 'none' }}>
                        Calculate it →
                      </a>
                    </p>
                  </FormField>
                </>
              )}

              {level === 'PG' && (
                <>
                  <SelectField
                    label="STREAM / EXAM TYPE"
                    value={stream}
                    onChange={setStream}
                    placeholder="Select your PG stream..."
                    options={[
                      { value: '', label: 'Select your PG stream...', disabled: true },
                      { value: 'Engineering', label: 'Engineering (GATE/TANCET)' },
                      { value: 'Management', label: 'Management (CAT/MAT/XAT)' },
                      { value: 'Science', label: 'Science (JAM/CUET-PG)' },
                      { value: 'Medical', label: 'Medical (NEET-PG/MD)' },
                      { value: 'Computer', label: 'Computer (MCA/NIMCET)' },
                      { value: 'Law', label: 'Law (CLAT-PG/AILET-PG)' },
                    ]}
                  />

                  {stream === 'Engineering' && (
                    <FormField label="GATE / TANCET SCORE">
                      <input type="number"
                        value={gateScore}
                        onChange={e => setGateScore(e.target.value)}
                        placeholder="GATE score (out of 1000) or TANCET marks"
                        className="glass-input" 
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.06)' : '#f0eeff',
                          color: isDark ? 'white' : '#1a1340',
                        }}
                      />
                    </FormField>
                  )}

                  {stream === 'Management' && (
                    <FormField label="CAT PERCENTILE">
                      <input type="number" min="0" max="100" step="0.01"
                        value={catPercentile}
                        onChange={e => setCatPercentile(e.target.value)}
                        placeholder="e.g. 95.4"
                        className="glass-input" 
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.06)' : '#f0eeff',
                          color: isDark ? 'white' : '#1a1340',
                        }}
                      />
                    </FormField>
                  )}

                  {!stream && (
                    <FormField label="YOUR GRADUATION PERCENTAGE (%)">
                      <input type="number" min="0" max="100" step="0.01"
                        value={percentage}
                        onChange={e => setPercentage(e.target.value)}
                        placeholder="e.g. 78"
                        className="glass-input" 
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.06)' : '#f0eeff',
                          color: isDark ? 'white' : '#1a1340',
                        }}
                      />
                    </FormField>
                  )}
                </>
              )}

              {level === 'UG' && (
                <SelectField
                  label="STREAM (OPTIONAL)"
                  value={stream}
                  onChange={setStream}
                  placeholder="All streams"
                  options={[
                    { value: '', label: 'All streams' },
                    { value: 'Engineering', label: 'Engineering' },
                    { value: 'Medical', label: 'Medical / MBBS' },
                    { value: 'Arts', label: 'Arts & Science' },
                    { value: 'Commerce', label: 'Commerce / BBA' },
                    { value: 'Management', label: 'Management' },
                    { value: 'Law', label: 'Law' },
                    { value: 'Architecture', label: 'Architecture' },
                    { value: 'Pharmacy', label: 'Pharmacy' },
                    { value: 'Nursing', label: 'Nursing' },
                  ]}
                />
              )}

              <SelectField
                label="PREFERRED STATE"
                value={state}
                onChange={setState}
                placeholder="All India"
                options={[
                  { value: '', label: 'All India' },
                  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
                  { value: 'Karnataka', label: 'Karnataka' },
                  { value: 'Maharashtra', label: 'Maharashtra' },
                  { value: 'Delhi', label: 'Delhi' },
                  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
                  { value: 'Telangana', label: 'Telangana' },
                  { value: 'Kerala', label: 'Kerala' },
                  { value: 'Gujarat', label: 'Gujarat' },
                  { value: 'Rajasthan', label: 'Rajasthan' },
                  { value: 'West Bengal', label: 'West Bengal' },
                  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
                ]}
              />

              <SelectField
                label="CATEGORY / QUOTA"
                value={category}
                onChange={setCategory}
                placeholder="Select category..."
                options={[
                  { value: '', label: 'Select category...', disabled: true },
                  { value: 'General', label: 'General / OC' },
                  { value: 'OBC', label: 'OBC' },
                  { value: 'BC', label: 'BC (Tamil Nadu)' },
                  { value: 'MBC', label: 'MBC (Tamil Nadu)' },
                  { value: 'SC', label: 'SC' },
                  { value: 'ST', label: 'ST' },
                  { value: 'EWS', label: 'EWS' },
                  { value: 'NRI', label: 'NRI' },
                ]}
              />

              <SelectField
                label="BUDGET PREFERENCE"
                value={budget}
                onChange={setBudget}
                placeholder="Any budget"
                options={[
                  { value: '', label: 'Any budget' },
                  { value: 'govt', label: 'Government only (< ₹1L/year)' },
                  { value: 'medium', label: 'Medium (₹1L - ₹2L/year)' },
                  { value: 'high', label: 'Private (₹2L - ₹5L/year)' },
                  { value: 'premium', label: 'Premium (> ₹5L/year)' },
                ]}
              />

              <button
                type="submit"
                disabled={!category || (!percentage && !cutoffMark && !gateScore && !catPercentile)}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg,#7F77DD,#534AB7)',
                  color: 'white',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: (!category || (!percentage && !cutoffMark && !gateScore && !catPercentile)) ? 'not-allowed' : 'pointer',
                  marginTop: '8px',
                  boxShadow: '0 6px 24px rgba(127,119,221,0.35)',
                  opacity: (!category || (!percentage && !cutoffMark && !gateScore && !catPercentile)) ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}>
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : `⚡ Find My ${level} Colleges`}
              </button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                <p style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#6b6894' }}>AI is analyzing your profile...</p>
              </div>
            ) : results.length > 0 ? (
              results.map(college => (
                <div key={college.id} style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(127,119,221,0.15)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '180px',
                    borderRadius: '16px 16px 0 0',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #1a1060, #0d0835)',
                  }}>
                    <img
                      src={`https://source.unsplash.com/400x240/?${encodeURIComponent(college.image_query)}`}
                      alt={college.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.removeAttribute('hidden');
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />

                    <div hidden style={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(135deg, hsl(${college.nirf_rank ? (college.nirf_rank * 7) % 360 : 250}, 60%, 25%), hsl(${college.nirf_rank ? (college.nirf_rank * 7 + 60) % 360 : 165}, 60%, 20%))`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      <span style={{
                        fontSize: '42px',
                        fontWeight: 800,
                        color: 'rgba(255,255,255,0.9)',
                        letterSpacing: '-2px',
                      }}>
                        {college.short || college.name.substring(0, 3).toUpperCase()}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.5)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}>
                        Est. {college.established}
                      </span>
                    </div>

                    {college.nirf_rank && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '20px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#FAC775',
                        border: '1px solid rgba(250,199,117,0.3)',
                      }}>
                        NIRF #{college.nirf_rank}
                      </div>
                    )}

                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: college.type === 'Government' ? 'rgba(29,158,117,0.85)' : college.type === 'Deemed' ? 'rgba(127,119,221,0.85)' : 'rgba(186,117,23,0.85)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '20px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'white',
                    }}>
                      {college.type}
                    </div>
                  </div>

                  <div style={{ padding: '16px 18px' }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: isDark ? 'white' : '#1a1340',
                      marginBottom: '4px',
                      lineHeight: 1.3,
                    }}>
                      {college.name}
                    </h3>

                    <p style={{
                      fontSize: '12px',
                      color: isDark ? 'rgba(255,255,255,0.5)' : '#6b6894',
                      marginBottom: '10px',
                    }}>
                      📍 {college.city}, {college.state}
                    </p>

                    {college.admissionChance && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.5)' : '#6b6894' }}>
                            Admission Chance
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: college.admissionChance.color }}>
                            {college.admissionChance.chance}
                          </span>
                        </div>
                        <div style={{
                          height: '5px',
                          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(127,119,221,0.1)',
                          borderRadius: '20px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${college.admissionChance.pct}%`,
                            background: college.admissionChance.color,
                            borderRadius: '20px',
                            transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                          }} />
                        </div>
                      </div>
                    )}

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '8px',
                      marginBottom: '12px',
                    }}>
                      {[
                        ['NAAC', college.naac_grade],
                        ['Avg Pkg', college.avg_package],
                        ['Placed', `${college.placement_pct}%`],
                      ].map(([label, value]) => (
                        <div key={label} style={{
                          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(127,119,221,0.06)',
                          borderRadius: '8px',
                          padding: '6px 8px',
                          textAlign: 'center',
                        }}>
                          <p style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: isDark ? 'white' : '#1a1340',
                            margin: 0,
                          }}>{value}</p>
                          <p style={{
                            fontSize: '10px',
                            color: isDark ? 'rgba(255,255,255,0.4)' : '#7a7399',
                            margin: '2px 0 0',
                            letterSpacing: '0.03em',
                          }}>{label}</p>
                        </div>
                      ))}
                    </div>

                    {college.ai_insight && (
                      <p style={{
                        fontSize: '12px',
                        color: isDark ? 'rgba(255,255,255,0.6)' : '#4a4370',
                        fontStyle: 'italic',
                        lineHeight: 1.5,
                        marginBottom: '12px',
                        padding: '8px 10px',
                        background: isDark ? 'rgba(29,158,117,0.08)' : 'rgba(29,158,117,0.06)',
                        borderRadius: '8px',
                        borderLeft: '2px solid #1D9E75',
                      }}>
                        {college.ai_insight}
                      </p>
                    )}

                    <div style={{
                      display: 'flex',
                      gap: '5px',
                      flexWrap: 'wrap',
                      marginBottom: '14px',
                    }}>
                      {(level === 'UG' ? college.courses_ug : college.courses_pg)?.slice(0, 4).map(course => (
                        <span key={course} style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '20px',
                          background: isDark ? 'rgba(127,119,221,0.15)' : 'rgba(127,119,221,0.1)',
                          color: isDark ? '#a89ef8' : '#534AB7',
                          border: '1px solid rgba(127,119,221,0.2)',
                        }}>
                          {course}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={college.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          padding: '8px',
                          textAlign: 'center',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg,#7F77DD,#534AB7)',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}>
                        Visit Site →
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/compare?college=${college.id}`);
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: 'transparent',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(127,119,221,0.3)'}`,
                          color: isDark ? 'rgba(255,255,255,0.7)' : '#534AB7',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}>
                        Compare
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#6b6894' }}>
                  No matching colleges found. Try adjusting your criteria.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
