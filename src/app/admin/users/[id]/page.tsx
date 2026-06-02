'use client';
import AdminGuard from '@/components/AdminGuard';
import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, orderBy, setDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';

type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  category: string;
  state: string;
  district: string;
  stream: string;
  marks_12th: number;
  institution: string;
  verified: boolean;
  created_at: string;
};

type PredictionHistory = {
  id: string;
  marks: number;
  colleges: any[];
  created_at: string;
};

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [predictions, setPredictions] = useState<PredictionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUser({
            id: docSnap.id,
            full_name: data.fullName || '',
            email: data.email || '',
            phone: data.phone || '',
            category: data.category || '',
            state: data.state || '',
            district: data.district || '',
            stream: data.stream || '',
            marks_12th: data.marks12th || 0,
            institution: data.institution || '',
            verified: data.verified || false,
            created_at: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          });
        }

        const predRef = collection(db, 'interviews', userId, 'sessions');
        const predSnap = await getDocs(query(predRef, orderBy('timestamp', 'desc')));
        const predHistory = predSnap.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            marks: d.studentProfile?.marks12th || d.studentProfile?.marks12thBoard || 0,
            colleges: d.results || d.collegeMatches || [],
            created_at: d.timestamp?.toDate ? d.timestamp.toDate().toISOString() : d.timestamp || new Date().toISOString(),
          };
        });
        setPredictions(predHistory);
      } catch (error) {
        console.error("Error loading user profile details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleVerify = async (status: 'verified' | 'rejected') => {
    setVerifying(true);
    try {
      const authUser = auth.currentUser;

      const verificationRef = doc(collection(db, 'verifications'));
      await setDoc(verificationRef, {
        userId,
        fullName: user?.full_name || '',
        status,
        notes,
        verifiedBy: authUser?.uid || '',
        verifiedAt: new Date(),
      });

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        verified: status === 'verified',
      });

      setUser(prev => prev ? { ...prev, verified: status === 'verified' } : null);
      alert(`User ${status} successfully!`);
    } catch (error: any) {
      console.error("Error performing user verification:", error);
      alert(`Error performing verification: ${error.message || error}`);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 rounded-full border-4 border-purple-200
            border-t-purple-600 animate-spin" />
        </div>
      </AdminGuard>
    );
  }

  if (!user) {
    return (
      <AdminGuard>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500 text-lg">User not found</p>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          
          {/* User Header */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-purple-100
            p-6 sm:p-8 mb-6 shadow-lg animate-in fade-in duration-500">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">
                  {user.full_name}
                </h1>
                <p className="text-gray-500 mb-4">{user.email}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold
                    bg-blue-100 text-blue-700">
                    {user.category || 'General'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold
                    bg-green-100 text-green-700">
                    {user.state || 'N/A'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold
                    ${user.verified
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                    }`}>
                    {user.verified ? '✓ Verified' : '⏳ Pending Verification'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-transparent bg-clip-text
                  bg-gradient-to-r from-purple-600 to-blue-600">
                  {user.marks_12th || 0}%
                </p>
                <p className="text-gray-500 text-sm">12th Marks</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* User Details */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl
              border border-purple-100 p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Phone', value: user.phone || 'N/A' },
                  { label: 'Stream', value: user.stream || 'N/A' },
                  { label: 'District', value: user.district || 'N/A' },
                  { label: 'Institution', value: user.institution || 'N/A' },
                  { label: 'Joined', value: new Date(user.created_at).toLocaleDateString() },
                  { label: 'Account Age', value: `${Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))} days` },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      {item.label}
                    </p>
                    <p className="text-gray-900 font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl
              border border-orange-200 p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Verification</h2>
              
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes for verification..."
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-orange-200
                  text-gray-900 placeholder:text-gray-400
                  focus:outline-none focus:border-orange-500 mb-4
                  resize-none h-24" />
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleVerify('verified')}
                  disabled={verifying}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r
                    from-green-500 to-emerald-600 text-white font-bold
                    hover:opacity-90 disabled:opacity-50 transition">
                  ✓ Verify
                </button>
                <button
                  onClick={() => handleVerify('rejected')}
                  disabled={verifying}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r
                    from-red-500 to-pink-600 text-white font-bold
                    hover:opacity-90 disabled:opacity-50 transition">
                  ✕ Reject
                </button>
              </div>
            </div>
          </div>

          {/* Predictions History */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-purple-100
            p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Prediction History</h2>
            {predictions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No predictions yet</p>
            ) : (
              <div className="space-y-3">
                {predictions.map((pred, i) => (
                  <div key={pred.id}
                    className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50
                      border border-purple-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">{pred.marks}% Marks</p>
                      <p className="text-sm text-gray-500">
                        {new Date(pred.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-purple-200 text-purple-700
                      font-bold text-sm">
                      {pred.colleges?.length || 0} colleges
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
