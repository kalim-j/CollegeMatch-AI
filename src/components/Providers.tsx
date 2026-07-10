'use client';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

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

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register';

  const isLandingPage = pathname === '/';

  const intensity =
    pathname === '/interview' ||
    pathname === '/discover' ||
    pathname === '/predict'
      ? 'medium'
      : 'low';

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
      storageKey="collegematch-theme"
    >
      <AuthProvider>
        {/* Show PageCanvas3D on all pages EXCEPT
            landing (has HeroCanvas3D) and auth pages
            (have LoginBackground) */}
        {!isAuthPage && !isLandingPage && (
          <PageCanvas3D intensity={intensity} />
        )}

        {/* All page content sits above canvas */}
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
