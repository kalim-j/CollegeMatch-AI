'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';

const NAV_LINKS = [
  { label:'Dashboard', href:'/dashboard', icon:'🏠', auth:true },
  { label:'Learning', href:'/learning', icon:'📚', auth:true },
  { label:'Colleges', href:'/interview', icon:'🏫', auth:true },
  { label:'Compare', href:'/dashboard/compare', icon:'⚖️', auth:true },
  { label:'Predictor', href:'/dashboard/predictor', icon:'🎯', auth:true },
  { label:'Community', href:'/community', icon:'👥', auth:true },
  { label:'Contact', href:'/contact', icon:'📞', auth:false },
];

const PUBLIC_LINKS = [
  { label:'How it works', href:'/#how-it-works' },
  { label:'Features', href:'/#features' },
  { label:'Contact', href:'/contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isVerified } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  /* Navbar shrinks on scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* Hide on auth pages */
  const authPages = ['/login','/register','/verify-otp'];
  if (authPages.includes(pathname)) return null;

  const isLoggedIn = !!user && isVerified;
  const links = isLoggedIn ? NAV_LINKS : PUBLIC_LINKS;

  const logout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const navBg = isDark
    ? scrolled
      ? 'rgba(5,7,26,0.98)'
      : 'rgba(5,7,26,0.85)'
    : scrolled
      ? 'rgba(255,255,255,0.98)'
      : 'rgba(255,255,255,0.85)';

  return (
    <>
      {/* ── Main navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: scrolled ? '56px' : '64px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(1rem,3vw,2rem)',
        background: navBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: isDark
          ? '1px solid rgba(255,255,255,0.07)'
          : '1px solid rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box',
        width: '100%',
      }}>

        {/* Left — logo */}
        <div
          onClick={() => router.push(
            isLoggedIn ? '/dashboard' : '/'
          )}
          style={{
            display: 'flex', alignItems: 'center',
            gap: 10, cursor: 'pointer', flexShrink: 0,
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background:
              'linear-gradient(135deg,#7F77DD,#1D9E75)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18,
            flexShrink: 0,
            boxShadow: '0 0 16px rgba(127,119,221,0.35)',
          }}>🎓</div>
          <div className="navbar-logo-text">
            <p style={{
              fontSize: 'clamp(13px,2vw,16px)',
              fontWeight: 700, margin: 0,
              background:
                'linear-gradient(90deg,#a89ef8,#5DCAA5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', color: '#a89ef8',
              whiteSpace: 'nowrap',
            }}>CollegeMatch-AI</p>
            <p
              className="navbar-logo-tagline"
              style={{
                fontSize: 10, margin: '1px 0 0',
                color: isDark
                  ? 'rgba(255,255,255,0.4)'
                  : '#7a7399',
                whiteSpace: 'nowrap',
              }}>
              India's smartest college advisor
            </p>
          </div>
        </div>

        {/* Center — desktop nav links */}
        <div className="nav-links">
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontSize: 'clamp(11px,1.3vw,14px)',
                fontWeight: pathname === link.href ? 600 : 400,
                color: pathname === link.href
                  ? '#a89ef8'
                  : isDark
                    ? 'rgba(255,255,255,0.65)'
                    : '#4a4370',
                textDecoration: 'none',
                padding: '5px 8px',
                borderRadius: 8,
                whiteSpace: 'nowrap',
                borderBottom: pathname === link.href
                  ? '2px solid #7F77DD'
                  : '2px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right — actions */}
        <div
          className="nav-actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(6px,1vw,14px)',
            flexShrink: 0,
          }}
        >
          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(
                isDark ? 'light' : 'dark'
              )}
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 18,
                color: isDark
                  ? 'rgba(255,255,255,0.6)'
                  : '#4a4370',
                padding: 6, borderRadius: 8,
              }}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          )}

          {isLoggedIn ? (
            <>
              {/* Admin badge */}
              {user?.email === 'kalim.apoffi@gmail.com' && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  padding: '3px 8px', borderRadius: 20,
                  background: 'rgba(226,75,74,0.15)',
                  color: '#E24B4A',
                  border: '1px solid rgba(226,75,74,0.3)',
                  display: 'none',
                }} className="admin-badge">
                  ADMIN
                </span>
              )}

              {/* Avatar */}
              <div style={{
                width: 32, height: 32,
                borderRadius: '50%',
                background:
                  'linear-gradient(135deg,#7F77DD,#1D9E75)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14, fontWeight: 700,
                color: 'white', cursor: 'pointer',
                border: '2px solid rgba(127,119,221,0.4)',
                flexShrink: 0,
              }}
                onClick={() => router.push('/profile')}
              >
                {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>

              {/* Logout — desktop only */}
              <button
                onClick={logout}
                className="logout-btn"
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8,
                  padding: '5px 10px',
                  color: isDark
                    ? 'rgba(255,255,255,0.55)'
                    : '#4a4370',
                  fontSize: 12,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" style={{
                fontSize: 'clamp(12px,1.3vw,14px)',
                color: isDark
                  ? 'rgba(255,255,255,0.75)'
                  : '#534AB7',
                textDecoration: 'none',
                fontWeight: 500,
                padding: '6px 10px',
              }}>
                Login
              </a>
              <a href="/register" style={{
                fontSize: 'clamp(12px,1.3vw,14px)',
                fontWeight: 600,
                padding: 'clamp(7px,1vw,9px) clamp(12px,2vw,18px)',
                borderRadius: 10,
                background:
                  'linear-gradient(135deg,#7F77DD,#534AB7)',
                color: 'white',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                boxShadow:
                  '0 4px 14px rgba(127,119,221,0.35)',
              }}>
                Sign Up
              </a>
            </>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="hamburger"
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 22,
              color: isDark ? 'white' : '#1a1340',
              padding: 4, display: 'none',
            }}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 998,
          }}
        />
      )}

      {/* ── Mobile drawer ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0,
        width: 'min(320px,85vw)', height: '100vh',
        background: 'rgba(5,7,26,0.98)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        zIndex: 999,
        padding: '2rem 1.5rem',
        transform: drawerOpen
          ? 'translateX(0)' : 'translateX(-100%)',
        transition:
          'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
        borderRight:
          '1px solid rgba(127,119,221,0.15)',
        overflowY: 'auto',
      }}>
        {/* Drawer header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 32,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background:
                'linear-gradient(135deg,#7F77DD,#1D9E75)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 18,
            }}>🎓</div>
            <span style={{
              fontSize: 15, fontWeight: 700,
              background:
                'linear-gradient(90deg,#a89ef8,#5DCAA5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', color: '#a89ef8',
            }}>CollegeMatch-AI</span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 22, cursor: 'pointer', padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {/* Drawer links */}
        {links.map(link => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setDrawerOpen(false)}
            style={{
              display: 'flex', alignItems: 'center',
              gap: 12, padding: '14px 0',
              borderBottom:
                '1px solid rgba(255,255,255,0.06)',
              color: pathname === link.href
                ? '#a89ef8'
                : 'rgba(255,255,255,0.75)',
              textDecoration: 'none',
              fontSize: 16, fontWeight: 500,
            }}
          >
            <span style={{ fontSize: 20 }}>
              {'icon' in link ? (link as any).icon : '→'}
            </span>
            {link.label}
          </a>
        ))}

        {/* Auth buttons in drawer */}
        <div style={{ marginTop: 24 }}>
          {isLoggedIn ? (
            <button onClick={() => { logout(); setDrawerOpen(false); }}
              style={{
                width: '100%', padding: '13px',
                borderRadius: 12, border: 'none',
                background: 'rgba(226,75,74,0.12)',
                color: '#F09595', fontSize: 14,
                fontWeight: 600, cursor: 'pointer',
              }}>
              Logout
            </button>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column',
              gap: 10,
            }}>
              <a href="/login" style={{
                display: 'block', textAlign: 'center',
                padding: '12px', borderRadius: 12,
                border: '1px solid rgba(127,119,221,0.3)',
                color: '#a89ef8', fontSize: 14,
                fontWeight: 500, textDecoration: 'none',
              }}>Login</a>
              <a href="/register" style={{
                display: 'block', textAlign: 'center',
                padding: '12px', borderRadius: 12,
                background:
                  'linear-gradient(135deg,#7F77DD,#534AB7)',
                color: 'white', fontSize: 14,
                fontWeight: 600, textDecoration: 'none',
              }}>Sign Up Free</a>
            </div>
          )}
        </div>
      </div>

      {/* ── Responsive CSS ── */}
      <style>{`
        @media (max-width: 900px) {
          .nav-links { display: none !important; }
          .logout-btn { display: none !important; }
          .admin-badge { display: none !important; }
          .hamburger { display: block !important; }
        }
        @media (max-width: 640px) {
          .navbar-logo-tagline { display:none !important; }
        }
        @media (min-width: 901px) {
          .hamburger { display: none !important; }
        }
      `}</style>
    </>
  );
}
