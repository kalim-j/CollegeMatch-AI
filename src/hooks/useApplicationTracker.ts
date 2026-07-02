import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface ApplicationItem {
  id: string; // usually college id
  name: string;
  status: 'Planning' | 'Applied' | 'Under Review' | 'Accepted' | 'Rejected';
  appliedDate?: string;
  notes?: string;
}

export function useApplicationTracker() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setApplications([]);
      setLoading(false);
      return;
    }

    const fetchApps = async () => {
      try {
        const docRef = doc(db, 'applications', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setApplications(docSnap.data().items || []);
        } else {
          await setDoc(docRef, { items: [] });
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [user]);

  const saveApplication = async (app: ApplicationItem) => {
    if (!user) return false;
    
    const docRef = doc(db, 'applications', user.uid);
    let newApps = [...applications];
    const index = newApps.findIndex(a => a.id === app.id);
    
    if (index >= 0) {
      newApps[index] = app;
    } else {
      newApps.push(app);
    }

    try {
      await updateDoc(docRef, { items: newApps });
      setApplications(newApps);
      return true;
    } catch (error) {
      console.error('Error saving application:', error);
      return false;
    }
  };

  const removeApplication = async (id: string) => {
    if (!user) return false;
    
    const docRef = doc(db, 'applications', user.uid);
    const newApps = applications.filter(a => a.id !== id);

    try {
      await updateDoc(docRef, { items: newApps });
      setApplications(newApps);
      return true;
    } catch (error) {
      console.error('Error removing application:', error);
      return false;
    }
  };

  return { applications, loading, saveApplication, removeApplication };
}
