import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export interface WishlistItem {
  id: string;
  name: string;
  city: string;
  state: string;
  image_query: string;
  addedAt: string;
}

export function useWishlist() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const docRef = doc(db, 'wishlists', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setWishlist(docSnap.data().items || []);
        } else {
          await setDoc(docRef, { items: [] });
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (college: WishlistItem) => {
    if (!user) return false;
    
    const docRef = doc(db, 'wishlists', user.uid);
    const isWished = wishlist.some(item => item.id === college.id);

    try {
      if (isWished) {
        const itemToRemove = wishlist.find(item => item.id === college.id);
        await updateDoc(docRef, {
          items: arrayRemove(itemToRemove)
        });
        setWishlist(prev => prev.filter(item => item.id !== college.id));
      } else {
        const newItem = { ...college, addedAt: new Date().toISOString() };
        await updateDoc(docRef, {
          items: arrayUnion(newItem)
        });
        setWishlist(prev => [...prev, newItem]);
      }
      return true;
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      return false;
    }
  };

  const isWished = (collegeId: string) => {
    return wishlist.some(item => item.id === collegeId);
  };

  return { wishlist, loading, toggleWishlist, isWished };
}
