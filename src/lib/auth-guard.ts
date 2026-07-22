'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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
  refreshProfile: ReturnType<typeof useAuth>['refreshProfile'];
} {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<AuthState>('loading');

  useEffect(() => {
    if (loading) { setState('loading'); return; }

    if (!user) {
      setState('unauthenticated');
      router.push('/login');
      return;
    }

    const check = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));

        if (!snap.exists()) {
          /* No Firestore doc = old user = treat as verified */
          setState('verified');
          return;
        }

        const data = snap.data();

        /* If emailVerified field does not exist at all (old users) = treat as verified */
        if (!('emailVerified' in data)) {
          await updateDoc(doc(db, 'users', user.uid), {
            emailVerified: true,
          });
          if (!data.mobileAdded && !user.providerData.some(p => p.providerId === 'google.com')) {
            setState('verified');
            router.push('/add-mobile');
            return;
          }
          setState('verified');
          return;
        }

        /* If user signed in with Google = always verified */
        if (user.providerData.some(p => p.providerId === 'google.com')) {
          if (!data.emailVerified) {
            await updateDoc(doc(db, 'users', user.uid), {
              emailVerified: true,
            });
          }
          setState('verified');
          return;
        }

        /* Email/password user — check flag */
        if (data.emailVerified === true) {
          /* Check if mobile number added */
          if (!data.mobileAdded && !user.providerData.some(p => p.providerId === 'google.com')) {
            setState('verified');
            router.push('/add-mobile');
            return;
          }
          setState('verified');
        } else {
          /* Check if OTP was already verified recently by looking at verifiedAt field */
          if (data.verifiedAt) {
            await updateDoc(doc(db, 'users', user.uid), {
              emailVerified: true,
            });
            if (!data.mobileAdded && !user.providerData.some(p => p.providerId === 'google.com')) {
              setState('verified');
              router.push('/add-mobile');
              return;
            }
            setState('verified');
            return;
          }
          setState('unverified');
          router.push(
            `/verify-otp?uid=${user.uid}` +
            `&email=${encodeURIComponent(user.email||'')}`
          );
        }
      } catch {
        /* Network error — let user through */
        setState('verified');
      }
    };

    check();
  }, [user, loading, router]);

  return { state, user, profile, refreshProfile };
}
