'use client';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import AppBackground from './AppBackground';
import { ThemeProvider } from 'next-themes';

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true} disableTransitionOnChange={false}>
      <AuthProvider>
        {!isAuthPage && <AppBackground />}
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
