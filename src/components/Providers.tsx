'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

/* ── Dynamic imports — NO SSR — prevents hydration crash ── */
const PageCanvas3D = dynamic(
  () => import('./PageCanvas3D'),
  { ssr: false }
);

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add('no-transition');
    const t = setTimeout(() => {
      document.documentElement.classList.remove('no-transition');
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const isAuthPage =
    pathname === '/login' || pathname === '/register';

  const isLandingPage = pathname === '/';

  const intensity =
    pathname === '/interview' ||
    pathname === '/discover' ||
    pathname === '/predict' ||
    pathname === '/mock-interview'
      ? 'medium'
      : 'low';

  return (
    /* ThemeProvider MUST be outermost */
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="collegematch-theme"
    >
      {/* AuthProvider inside ThemeProvider */}
      <AuthProvider>
        {/* Canvas only on inner pages */}
        {!isAuthPage && !isLandingPage && (
          <PageCanvas3D intensity={intensity} />
        )}

        {/* Content wrapper — transparent, above canvas */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            minHeight: '100vh',
            backgroundColor: 'transparent',
          }}
        >
          {children}
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
