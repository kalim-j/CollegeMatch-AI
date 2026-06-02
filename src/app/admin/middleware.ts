import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { isAdminEmail } from '@/lib/admin';

export async function adminAuthCheck() {
  const user = auth.currentUser;
  
  if (!user) {
    redirect('/login');
  }

  const docSnap = await getDoc(doc(db, 'users', user.uid));
  const profile = docSnap.data();

  if (profile?.role !== 'admin' && !isAdminEmail(user.email)) {
    redirect('/dashboard');
  }

  return user;
}


