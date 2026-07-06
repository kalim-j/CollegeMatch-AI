'use client';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import AppBackground from './AppBackground';
import { ThemeProvider } from 'next-themes';

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={false} 
      disableTransitionOnChange={false}
      storageKey="collegematch-theme"
    >
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'transparent',
        position: 'relative',
      }}>
        <AuthProvider>
          {!isAuthPage && <AppBackground />}
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
      </div>
    </ThemeProvider>
  );
}
