'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { StudentProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  loading: boolean;
  isVerified: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isVerified: false,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  const fetchProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data as StudentProfile);
        const isGoogle = auth.currentUser?.providerData.some(p => p.providerId === 'google.com');
        const hasNoEmailVerifiedKey = !('emailVerified' in data);
        const hasVerifiedAt = !!data.verifiedAt;
        const verifiedVal = !!isGoogle || hasNoEmailVerifiedKey || hasVerifiedAt || !!data.emailVerified;
        setIsVerified(verifiedVal);
        
        // Update online status
        await updateDoc(docRef, {
          isOnline: true,
          lastActive: serverTimestamp()
        });
      } else {
        // Create initial profile if it doesn't exist
        const initialProfile: any = {
          uid,
          fullName: auth.currentUser?.displayName || '',
          email: auth.currentUser?.email || '',
          createdAt: serverTimestamp(),
          isOnline: true,
          lastActive: serverTimestamp(),
          emailVerified: true // Treat Google/new users as verified by default
        };
        await setDoc(docRef, initialProfile);
        setProfile(initialProfile);
        setIsVerified(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setIsVerified(true); // Fallback
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  useEffect(() => {
    setPersistence(auth, browserSessionPersistence).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid);
      } else {
        setProfile(null);
        setIsVerified(false);
      }
      setLoading(false);
    });

    const handleVisibilityChange = () => {
      if (auth.currentUser) {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        if (document.visibilityState === 'hidden') {
          updateDoc(docRef, { isOnline: false, lastActive: serverTimestamp() }).catch(console.error);
        } else {
          updateDoc(docRef, { isOnline: true, lastActive: serverTimestamp() }).catch(console.error);
        }
      }
    };

    window.addEventListener('beforeunload', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleVisibilityChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isVerified, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
