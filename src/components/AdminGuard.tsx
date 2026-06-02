'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isAdminEmail } from '@/lib/admin';

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        const hasAdminAccess = profile?.role === 'admin' || isAdminEmail(user.email);
        if (!hasAdminAccess) {
          router.push('/dashboard');
        }
      }
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
        <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
      </div>
    );
  }

  const hasAdminAccess = user && (profile?.role === 'admin' || isAdminEmail(user.email));

  return hasAdminAccess ? <>{children}</> : null;
}

