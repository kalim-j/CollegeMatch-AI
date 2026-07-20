'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

type AuthState =
  | 'loading'
  | 'unauthenticated'
  | 'unverified'
  | 'verified';

export function useAuthGuard(): {
  state: AuthState;
  user: ReturnType<typeof useAuth>['user'];
  profile: ReturnType<typeof useAuth>['profile'];
} {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<AuthState>('loading');

  useEffect(() => {
    if (loading) { setState('loading'); return; }

    if (!user) {
      setState('unauthenticated');
      router.push('/login');
      return;
    }

    /* Check Firestore emailVerified flag */
    const check = async () => {
      try {
        const snap = await getDoc(
          doc(db, 'users', user.uid)
        );
        if (snap.exists()) {
          const data = snap.data();
          if (data.emailVerified === true) {
            setState('verified');
          } else {
            setState('unverified');
            router.push(
              `/verify-otp?uid=${user.uid}` +
              `&email=${encodeURIComponent(user.email||'')}`
            );
          }
        } else {
          /* No Firestore doc — treat as verified
             (e.g. old users or Google users) */
          setState('verified');
        }
      } catch {
        /* Firestore error — let user through
           to avoid blocking legitimate users */
        setState('verified');
      }
    };

    check();
  }, [user, loading, router]);

  return { state, user, profile };
}
