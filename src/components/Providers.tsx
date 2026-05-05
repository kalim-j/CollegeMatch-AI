'use client';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import AppBackground from './AppBackground';

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <AuthProvider>
      {!isAuthPage && <AppBackground />}
      {children}
    </AuthProvider>
  );
}
