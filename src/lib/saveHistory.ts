import {
  doc, setDoc, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function saveHistory(
  uid: string,
  type: string,
  title: string,
  summary: string,
  data: Record<string,unknown>
) {
  if (!uid) return;
  try {
    const id = `${type}-${Date.now()}`;
    const expiresAt = new Date(
      Date.now() + 15 * 24 * 60 * 60 * 1000
    ); /* 15 days */

    await setDoc(
      doc(db,'history',uid,'items',id),
      {
        type, title, summary, data,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
      }
    );
  } catch (e) {
    console.error('Failed to save history item:', e);
  }
}
