'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import ScrollReveal3D from '@/components/ScrollReveal3D';
import { useMouseParallax } from '@/hooks/useMouseParallax';

const HeroCanvas3D = dynamic(
  () => import('@/components/HeroCanvas3D'),
  { ssr: false }
);

const SUBTITLES = [
  "Analysing your marks in real time...",
  "Matching 500+ colleges across India...",
  "Finding scholarships worth ₹2.5 crore...",
  "Your dream college is 9 questions away..."
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [subtitleIdx, setSubtitleIdx] = useState(0);
  const [subtitleText, setSubtitleText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [carouselIdx, setCarouselIdx] = useState(0);

  // Live Calculator State
  const [maths, setMaths] = useState(95);
  const [physics, setPhysics] = useState(90);
  const [chemistry, setChemistry] = useState(85);
  const cutoff = (maths + physics / 2 + chemistry / 2).toFixed(1);

  const heroParallax = useMouseParallax(0.01);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const q = query(
          collection(db, 'testimonials'),
          where('approved', '==', true),
          limit(5)
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        if (fetched.length > 0) {
          setTestimonials(fetched);
        } else {
          setTestimonials([
            { id: '1', name: 'Arjun K.', college: 'CEG Anna University', review: 'Found exactly the right branch for my cutoff. Saved me so much stress during TNEA.', stream: 'B.E. CSE', year: '2025' },
            { id: '2', name: 'Priya R.', college: 'SSN College of Engineering', review: 'The AI matched me perfectly. Also found a 50K scholarship I didn\'t know about!', stream: 'B.Tech IT', year: '2024' },
            { id: '3', name: 'Vikram S.', college: 'PSG College of Technology', review: 'First in my family to go to an engineering college. The guidance was invaluable.', stream: 'B.E. ECE', year: '2025' },
          ]);
        }
      } catch (error) {
        console.error('Testimonials fetch error:', error);
        setTestimonials([
          { id: '1', name: 'Arjun K.', college: 'CEG Anna University', review: 'Found exactly the right branch for my cutoff. Saved me so much stress during TNEA.', stream: 'B.E. CSE', year: '2025' },
          { id: '2', name: 'Priya R.', college: 'SSN College of Engineering', review: 'The AI matched me perfectly. Also found a 50K scholarship I didn\'t know about!', stream: 'B.Tech IT', year: '2024' },
          { id: '3', name: 'Vikram S.', college: 'PSG College of Technology', review: 'First in my family to go to an engineering college. The guidance was invaluable.', stream: 'B.E. ECE', year: '2025' },
        ]);
      }
    };
    fetchTestimonials();
  }, []);

  // Typewriter effect
  useEffect(() => {
    const currentFullText = SUBTITLES[subtitleIdx];
    let typingSpeed = 50;
    
    if (isDeleting) {
      typingSpeed = 30;
    }

    const timer = setTimeout(() => {
      if (!isDeleting && subtitleText === currentFullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && subtitleText === '') {
        setIsDeleting(false);
        setSubtitleIdx((prev) => (prev + 1) % SUBTITLES.length);
      } else {
        setSubtitleText((prev) => 
          isDeleting ? currentFullText.substring(0, prev.length - 1) : currentFullText.substring(0, prev.length + 1)
        );
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [subtitleText, subtitleIdx, isDeleting]);

  // Carousel autorotate
  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(() => {
      setCarouselIdx((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials]);

  // Counters
  const [statsObj, setStatsObj] = useState({ accuracy: 0, students: 0, colleges: 0, scholarships: 0 });
  const [hasStartedCounters, setHasStartedCounters] = useState(false);
  const countersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasStartedCounters) {
        setHasStartedCounters(true);
        let current = 0;
        const interval = setInterval(() => {
          current += 1;
          setStatsObj({
            accuracy: Math.min(98.4, current * 1.5),
            students: Math.min(14, current * 0.3), // 14 Lakhs
            colleges: Math.min(500, current * 8),
            scholarships: Math.min(2.5, current * 0.05) // 2.5 Cr
          });
          if (current >= 100) clearInterval(interval);
        }, 20);
      }
    }, { threshold: 0.5 });
    
    if (countersRef.current) observer.observe(countersRef.current);
    return () => observer.disconnect();
  }, [hasStartedCounters]);

  const getCutoffColor = (val: number) => {
    if (val >= 190) return 'text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]';
    if (val >= 175) return 'text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]';
    if (val >= 160) return 'text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]';
    return 'text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]';
  };
  const getCutoffLabel = (val: number) => {
    if (val >= 190) return 'Top tier colleges';
    if (val >= 175) return 'Excellent range';
    if (val >= 160) return 'Good range';
    return 'Private colleges';
  };

  return (
    <div className="bg-[#05071a] min-h-screen text-white overflow-x-hidden font-sans">
      
      {/* SECTION 1 - HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-12 z-10 parallax-section overflow-hidden page-entrance">
        <HeroCanvas3D />
        
        <div ref={heroParallax} className="relative z-10 flex flex-col items-center text-center max-w-5xl px-4 w-full">
          
          <div className="inline-block mb-6 px-5 py-2 rounded-full text-sm font-bold glass-3d border-[#7F77DD]/30 text-[#a89ef8] shadow-[0_0_20px_rgba(127,119,221,0.2)]">
            ✨ India's #1 AI College Advisor · 2026
          </div>

          <h1 className="text-5xl sm:text-7xl font-black mb-4 leading-tight tracking-tight flex flex-col items-center">
            <span className="text-white text-3d opacity-0 animate-[fadeUpAnim_0.8s_0.1s_forwards]">Find Your</span>
            <span className="shimmer-text text-6xl sm:text-8xl py-2 opacity-0 animate-[fadeUpAnim_0.8s_0.2s_forwards]">Dream College</span>
            <span className="text-white text-3d opacity-0 animate-[fadeUpAnim_0.8s_0.3s_forwards]">with AI</span>
          </h1>

          <p className="text-xl sm:text-2xl text-[rgba(255,255,255,0.72)] mb-10 h-8 font-medium">
            <span className="typing-cursor">{subtitleText}</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-5 mb-16 opacity-0 animate-[fadeUpAnim_0.8s_0.5s_forwards]">
            <Link href="/register" className="btn-3d px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2">
              Get Started &rarr;
            </Link>
            <Link href="/dashboard/scholarships" className="btn-3d px-10 py-4 rounded-xl glass-3d text-white font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center">
              Find Scholarships
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full max-w-2xl opacity-0 animate-[fadeUpAnim_0.8s_0.7s_forwards]">
            {[
              { label: '98.4%', desc: 'Match Accuracy' },
              { label: '14L+', desc: 'Students 2026' },
              { label: '500+', desc: 'Colleges' }
            ].map((stat, i) => (
              <div key={i} className="glass-3d p-4 float-3d" style={{ animationDelay: `${i * 0.5}s` }}>
                <p className="text-2xl sm:text-3xl font-black text-white">{stat.label}</p>
                <p className="text-xs sm:text-sm text-[rgba(255,255,255,0.6)] font-semibold">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-50 animate-bounce cursor-pointer">
          <span className="text-xs tracking-widest uppercase font-bold mb-2">Scroll to explore</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      {/* SECTION 2 - LIVE STATS TICKER */}
      <section className="relative z-20 bg-[rgba(10,13,36,0.8)] border-y border-white/10 backdrop-blur-xl py-3 overflow-hidden">
        <div className="flex whitespace-nowrap" style={{ animation: 'ticker 25s linear infinite' }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-12 px-6 items-center">
              <span className="text-[#a89ef8] font-semibold text-sm">🎓 TNEA 2026 Counselling Starts July 2026</span>
              <span className="text-white/40">•</span>
              <span className="text-[#5DCAA5] font-semibold text-sm">📚 JEE Advanced Results Expected June 2026</span>
              <span className="text-white/40">•</span>
              <span className="text-[#7289da] font-semibold text-sm">💰 NSP Scholarship Portal Open Now</span>
              <span className="text-white/40">•</span>
              <span className="text-[#fca5a5] font-semibold text-sm">🏥 NEET UG 2026 — Results Awaited</span>
              <span className="text-white/40">•</span>
              <span className="text-[#fcd34d] font-semibold text-sm">✨ NEP 2026 — New Semester System Starting</span>
              <span className="text-white/40">•</span>
              <span className="text-[#67e8f9] font-semibold text-sm">📊 AI & Data Science: 300% Seats Increased</span>
              <span className="text-white/40">•</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 - HOW IT WORKS */}
      <section className="relative z-20 py-24 px-4 max-w-6xl mx-auto">
        <ScrollReveal3D direction="up">
          <h2 className="text-4xl font-black text-center mb-16 text-3d">How It Works</h2>
        </ScrollReveal3D>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-[#7F77DD]/30 -translate-y-1/2 -z-10" />
          
          <ScrollReveal3D direction="up" delay={0}>
            <div className="glass-3d card-3d p-8 text-center h-full flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-[#7F77DD]/20 flex items-center justify-center mb-6 text-4xl shadow-[0_0_30px_rgba(127,119,221,0.2)]">📋</div>
              <h3 className="text-xl font-bold mb-3 text-white">Answer 9 Questions</h3>
              <p className="text-[rgba(255,255,255,0.6)]">Tell us your marks, preferences, and goals. It takes less than 2 minutes.</p>
            </div>
          </ScrollReveal3D>

          <ScrollReveal3D direction="up" delay={150}>
            <div className="glass-3d card-3d p-8 text-center h-full flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-[#5DCAA5]/20 flex items-center justify-center mb-6 text-4xl shadow-[0_0_30px_rgba(93,202,165,0.2)] relative">
                <span className="absolute w-full h-full border-2 border-[#5DCAA5]/50 rounded-full animate-[spin_4s_linear_infinite]" style={{ borderTopColor: 'transparent' }} />
                🧠
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">AI Analyses 500+ Colleges</h3>
              <p className="text-[rgba(255,255,255,0.6)]">Our neural network scans historical data and 2026 trends instantly.</p>
            </div>
          </ScrollReveal3D>

          <ScrollReveal3D direction="up" delay={300}>
            <div className="glass-3d card-3d p-8 text-center h-full flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6 text-4xl shadow-[0_0_30px_rgba(245,158,11,0.2)]">🏆</div>
              <h3 className="text-xl font-bold mb-3 text-white">Get Your Match</h3>
              <p className="text-[rgba(255,255,255,0.6)]">Receive a personalized list of 8 colleges where you have the highest chances.</p>
            </div>
          </ScrollReveal3D>
        </div>
      </section>

      {/* SECTION 4 - FEATURES GRID */}
      <section className="relative z-20 py-24 px-4 bg-[rgba(5,7,26,0.5)] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal3D direction="up">
            <h2 className="text-4xl font-black text-center mb-4 text-3d">Everything a 2026 student needs</h2>
            <p className="text-center text-[rgba(255,255,255,0.6)] mb-16 max-w-2xl mx-auto">The admissions landscape is more complex than ever. We've built tools to give you an unfair advantage.</p>
          </ScrollReveal3D>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🎯', title: 'AI College Matcher', desc: '9 questions → 8 perfectly matched colleges', badge: 'Most Popular', color: 'bg-purple-500/20 text-purple-300' },
              { icon: '🧭', title: "Don't know what to study?", desc: '10 questions reveal your perfect stream', badge: 'New 2026', color: 'bg-blue-500/20 text-blue-300' },
              { icon: '🧮', title: 'TN Cutoff Calculator', desc: 'Enter PCM marks → instant cutoff', badge: 'Free tool', color: 'bg-emerald-500/20 text-emerald-300' },
              { icon: '💰', title: '₹2.5 Cr in Scholarships', desc: 'NSP, State, Private — all in one place', badge: '1000+ Listed', color: 'bg-amber-500/20 text-amber-300' },
              { icon: '📝', title: '2026 Exam Calendar', desc: 'JEE, NEET, TNEA dates and tips', badge: 'Updated', color: 'bg-rose-500/20 text-rose-300' },
              { icon: '💬', title: '24/7 AI Counsellor', desc: 'Ask anything — instant expert answer', badge: 'AI Powered', color: 'bg-indigo-500/20 text-indigo-300' },
              { icon: '⚖️', title: 'Compare Colleges', desc: 'Side-by-side AI analysis of any 2 colleges', badge: 'Smart', color: 'bg-cyan-500/20 text-cyan-300' },
              { icon: '📋', title: 'Track Applications', desc: 'Never miss a deadline — Kanban board', badge: 'Organised', color: 'bg-fuchsia-500/20 text-fuchsia-300' },
            ].map((feat, i) => (
              <ScrollReveal3D key={i} direction="scale" delay={i * 50}>
                <div className="glass-3d card-3d p-6 h-full relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold rounded-bl-xl ${feat.color}`}>{feat.badge}</div>
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">{feat.icon}</div>
                  <h3 className="font-bold text-white mb-2 text-lg">{feat.title}</h3>
                  <p className="text-[rgba(255,255,255,0.6)] text-sm">{feat.desc}</p>
                </div>
              </ScrollReveal3D>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 - 2026 EDUCATION TRENDS */}
      <section className="relative z-20 py-24 px-4 max-w-6xl mx-auto">
        <ScrollReveal3D direction="up">
          <h2 className="text-4xl font-black text-center mb-4 text-3d">What changed in 2026 — stay ahead</h2>
          <p className="text-center text-[rgba(255,255,255,0.6)] mb-16 max-w-2xl mx-auto">The Indian education landscape is evolving fast. Here's what every student must know this year.</p>
        </ScrollReveal3D>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: '📜', title: 'NEP 2026: New rules, new opportunities', desc: 'Semester system, multiple entry-exit, academic bank of credits — understand how it affects your college choice.', link: '/nep-guide', cta: 'How NEP affects you →', glow: 'rgba(245,158,11,0.2)' },
            { icon: '🤖', title: 'AI seats up 300% — Is it right for you?', desc: 'Every college added AI, Data Science, and Cyber Security. But not all are equal. Our AI tells you which ones have real placements.', link: '/placements', cta: 'Find AI colleges →', glow: 'rgba(99,102,241,0.2)' },
            { icon: '💸', title: '₹5000 crore unclaimed every year', desc: 'Most Indian students miss scholarships they qualify for. NSP portal, state schemes, and private scholarships — find yours in 2 minutes.', link: '/dashboard/scholarships', cta: 'Find my scholarships →', glow: 'rgba(45,212,191,0.2)' },
            { icon: '🌱', title: 'First in family to go to college?', desc: 'CollegeMatch-AI was built for you. No senior to ask. No guidance counsellor. Just AI that knows everything.', link: '/first-gen', cta: 'Start for free →', glow: 'rgba(34,197,94,0.2)' }
          ].map((trend, i) => (
            <ScrollReveal3D key={i} direction={i % 2 === 0 ? 'left' : 'right'}>
              <div className="glass-3d card-3d p-8 flex gap-6" style={{ boxShadow: `0 8px 32px ${trend.glow}` }}>
                <div className="text-5xl shrink-0">{trend.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{trend.title}</h3>
                  <p className="text-[rgba(255,255,255,0.6)] mb-4 text-sm leading-relaxed">{trend.desc}</p>
                  <Link href={trend.link} className="text-[#a89ef8] font-bold text-sm hover:underline flex items-center gap-1">
                    {trend.cta}
                  </Link>
                </div>
              </div>
            </ScrollReveal3D>
          ))}
        </div>
      </section>

      {/* SECTION 6 - LIVE CUTOFF CALCULATOR PREVIEW */}
      <section className="relative z-20 py-24 px-4 bg-gradient-to-b from-transparent to-[#0a0d24]">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal3D direction="up">
            <h2 className="text-4xl font-black mb-4 text-3d">Try it right now — no login needed</h2>
            <p className="text-[rgba(255,255,255,0.6)] mb-12">Calculate your Tamil Nadu engineering cutoff mark instantly</p>
          </ScrollReveal3D>

          <ScrollReveal3D direction="scale">
            <div className="glass-3d p-8 sm:p-12 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#7F77DD]/10 via-transparent to-transparent pointer-events-none" />
              
              <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
                <div>
                  <label className="block text-sm font-bold text-white/60 mb-2">Maths (100)</label>
                  <input type="number" min="0" max="100" value={maths} onChange={e => setMaths(Number(e.target.value) || 0)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-xl font-bold text-white focus:outline-none focus:border-[#7F77DD] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/60 mb-2">Physics (100)</label>
                  <input type="number" min="0" max="100" value={physics} onChange={e => setPhysics(Number(e.target.value) || 0)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-xl font-bold text-white focus:outline-none focus:border-[#7F77DD] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/60 mb-2">Chemistry (100)</label>
                  <input type="number" min="0" max="100" value={chemistry} onChange={e => setChemistry(Number(e.target.value) || 0)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-xl font-bold text-white focus:outline-none focus:border-[#7F77DD] transition-colors" />
                </div>
              </div>

              <div className="bg-black/20 rounded-2xl p-6 mb-8 border border-white/5">
                <div className="text-white/40 text-sm mb-2 font-mono">Cutoff = {maths} + ({physics}/2) + ({chemistry}/2)</div>
                <div className={`text-6xl sm:text-7xl font-black transition-colors duration-500 ${getCutoffColor(Number(cutoff))}`}>
                  {cutoff}
                </div>
                <div className="text-white/60 mt-2 font-bold uppercase tracking-wider text-sm">{getCutoffLabel(Number(cutoff))}</div>
              </div>

              <Link href="/register" className="btn-3d inline-block px-8 py-4 rounded-xl bg-white text-[#1a1340] font-black hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                See which colleges you qualify for &rarr;
              </Link>
              <p className="text-xs text-white/40 mt-4">Full AI matching available after free signup</p>
            </div>
          </ScrollReveal3D>
        </div>
      </section>

      {/* SECTION 7 - TESTIMONIALS */}
      <section className="relative z-20 py-24 px-4 max-w-6xl mx-auto overflow-hidden">
        <ScrollReveal3D direction="up">
          <h2 className="text-4xl font-black text-center mb-16 text-3d">Students who found their dream college</h2>
        </ScrollReveal3D>

        <div className="relative h-80 flex items-center justify-center perspective">
          {testimonials.map((t, idx) => {
            const isCenter = idx === carouselIdx;
            const isLeft = idx === (carouselIdx - 1 + testimonials.length) % testimonials.length;
            const isRight = idx === (carouselIdx + 1) % testimonials.length;
            
            let transform = 'translateX(0) scale(0) opacity-0 translateZ(-200px)';
            let zIndex = 0;
            
            if (isCenter) {
              transform = 'translateX(0) scale(1) opacity-100 translateZ(0)';
              zIndex = 10;
            } else if (isLeft) {
              transform = 'translateX(-60%) scale(0.85) opacity-40 translateZ(-100px) rotateY(10deg)';
              zIndex = 5;
            } else if (isRight) {
              transform = 'translateX(60%) scale(0.85) opacity-40 translateZ(-100px) rotateY(-10deg)';
              zIndex = 5;
            }

            return (
              <div key={idx} className="absolute glass-3d p-8 w-full max-w-md transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ transform, zIndex }}>
                <div className="flex gap-4 items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7F77DD] to-indigo-600 flex items-center justify-center font-bold text-lg shadow-lg">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{t.name}</h3>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-white/10 px-2 py-0.5 rounded text-[#a89ef8]">{t.stream}</span>
                      <span className="bg-white/10 px-2 py-0.5 rounded text-white/60">{t.year}</span>
                    </div>
                  </div>
                </div>
                <div className="flex text-amber-400 text-sm mb-3">★★★★★</div>
                <p className="text-[rgba(255,255,255,0.7)] italic mb-4 leading-relaxed">"{t.review}"</p>
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-2 rounded-lg font-semibold inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Admitted to {t.college}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, idx) => (
            <button key={idx} onClick={() => setCarouselIdx(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === carouselIdx ? 'bg-[#a89ef8] w-6' : 'bg-white/20'}`} />
          ))}
        </div>
      </section>

      {/* SECTION 8 - STATS COUNTER */}
      <section ref={countersRef} className="relative z-20 py-20 border-y border-white/10 bg-[rgba(10,13,36,0.5)] backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-black text-white mb-2">{statsObj.students.toFixed(1)}L+</div>
            <div className="text-[rgba(255,255,255,0.5)] font-bold text-sm uppercase tracking-widest">Students Guided</div>
            <div className="w-12 h-1 bg-[#7F77DD] mx-auto mt-4 rounded" />
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-black text-white mb-2">{statsObj.accuracy.toFixed(1)}%</div>
            <div className="text-[rgba(255,255,255,0.5)] font-bold text-sm uppercase tracking-widest">Match Accuracy</div>
            <div className="w-12 h-1 bg-[#5DCAA5] mx-auto mt-4 rounded" />
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-black text-white mb-2">₹{statsObj.scholarships.toFixed(1)} Cr</div>
            <div className="text-[rgba(255,255,255,0.5)] font-bold text-sm uppercase tracking-widest">Scholarships Found</div>
            <div className="w-12 h-1 bg-amber-400 mx-auto mt-4 rounded" />
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-black text-white mb-2">9</div>
            <div className="text-[rgba(255,255,255,0.5)] font-bold text-sm uppercase tracking-widest">Questions to Ask</div>
            <div className="w-12 h-1 bg-rose-400 mx-auto mt-4 rounded" />
          </div>
        </div>
      </section>

      {/* SECTION 9 - PARENT SECTION */}
      <section className="relative z-20 py-24 px-4 max-w-6xl mx-auto">
        <ScrollReveal3D direction="up">
          <h2 className="text-4xl font-black text-center mb-4 text-3d">For parents — because this is your decision too</h2>
          <p className="text-center text-[rgba(255,255,255,0.6)] mb-16 max-w-2xl mx-auto">We know you're worried about their future. We have the data-backed answers you need.</p>
        </ScrollReveal3D>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScrollReveal3D direction="up" delay={0}>
            <div className="glass-3d p-8 h-full border-t-4 border-t-[#7F77DD]">
              <h3 className="text-xl font-bold text-white mb-4">"Is this college really good?"</h3>
              <p className="text-[rgba(255,255,255,0.6)] text-sm leading-relaxed mb-6">We don't rely on brochures. We show you the NAAC grade, NIRF rank, actual placement percentages, and average salary offered by companies — all verified and in one place.</p>
              <Link href="/placements" className="text-[#a89ef8] text-sm font-bold hover:underline">Check placement records &rarr;</Link>
            </div>
          </ScrollReveal3D>
          <ScrollReveal3D direction="up" delay={150}>
            <div className="glass-3d p-8 h-full border-t-4 border-t-[#5DCAA5]">
              <h3 className="text-xl font-bold text-white mb-4">"Can we afford the fees?"</h3>
              <p className="text-[rgba(255,255,255,0.6)] text-sm leading-relaxed mb-6">No hidden costs. Our fee calculator shows the total 4-year cost (including hostel). We also provide instant EMI options for education loans from both government and private banks.</p>
              <Link href="/loan-calculator" className="text-[#5DCAA5] text-sm font-bold hover:underline">Calculate loan EMI &rarr;</Link>
            </div>
          </ScrollReveal3D>
          <ScrollReveal3D direction="up" delay={300}>
            <div className="glass-3d p-8 h-full border-t-4 border-t-amber-400">
              <h3 className="text-xl font-bold text-white mb-4">"Which stream has job security?"</h3>
              <p className="text-[rgba(255,255,255,0.6)] text-sm leading-relaxed mb-6">Don't follow the herd. Our career salary explorer shows the 10-year earning trajectory for every stream, helping you choose a future-proof path for your child.</p>
              <Link href="/parent-guide" className="text-amber-400 text-sm font-bold hover:underline">Read the Parent Guide &rarr;</Link>
            </div>
          </ScrollReveal3D>
        </div>
      </section>

      {/* SECTION 10 - FINAL CTA */}
      <section className="relative z-20 min-h-[60vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Ambient glow behind CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl aspect-square bg-[#7F77DD]/20 blur-[100px] rounded-full -z-10 pointer-events-none" />
        
        <ScrollReveal3D direction="scale">
          <h2 className="text-5xl sm:text-7xl font-black mb-6">
            <span className="text-white block">Your dream college</span>
            <span className="shimmer-text block mt-2">is one AI away.</span>
          </h2>
          <p className="text-xl text-[rgba(255,255,255,0.6)] mb-12 max-w-2xl mx-auto">
            Join 10,000+ students who found their college with CollegeMatch-AI. Free. Forever.
          </p>
          <Link href="/register" className="btn-3d inline-flex items-center justify-center w-full sm:w-[320px] h-[60px] rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xl shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_50px_rgba(124,58,237,0.6)]">
            Start your college match &rarr;
          </Link>
        </ScrollReveal3D>
      </section>

      <style jsx global>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
