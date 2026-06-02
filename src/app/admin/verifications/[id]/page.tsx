'use client';
import AdminGuard from '@/components/AdminGuard';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';

type Verification = {
  id: string;
  user_id: string;
  full_name: string;
  mobile: string;
  marks_12th: number;
  category: string;
  state: string;
  document_url: string;
  status: string;
  notes: string;
  created_at: string;
};

export default function VerifyUserPage() {
  const params = useParams();
  const router = useRouter();
  const verificationId = params.id as string;

  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchVerification = async () => {
      const { data, error } = await supabase
        .from('verifications')
        .select('*')
        .eq('id', verificationId)
        .single();

      if (!error && data) {
        setVerification(data);
        setNotes(data.notes || '');
      }
      setLoading(false);
    };

    fetchVerification();
  }, [verificationId]);

  const handleAction = async (status: 'verified' | 'rejected') => {
    setUpdating(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();

    // Update verification record
    await supabase
      .from('verifications')
      .update({
        status,
        notes,
        verified_by: authUser?.id,
        verified_at: new Date().toISOString(),
      })
      .eq('id', verificationId);

    // Update user profile status if verified
    if (status === 'verified' && verification?.user_id) {
      await supabase
        .from('profiles')
        .update({ verified: true })
        .eq('id', verification.user_id);
    }

    setUpdating(false);
    alert(`Verification ${status} successfully!`);
    router.push('/admin/verifications');
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
        </div>
      </AdminGuard>
    );
  }

  if (!verification) {
    return (
      <AdminGuard>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Verification request not found</p>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-black text-gray-900 mb-8">Verify Submission</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Submission Details</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Applicant</p>
                  <p className="font-semibold text-gray-900">{verification.full_name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">12th Marks</p>
                  <p className="font-semibold text-gray-900">{verification.marks_12th}%</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Category</p>
                  <p className="font-semibold text-gray-900">{verification.category}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Mobile</p>
                  <p className="font-semibold text-gray-900">{verification.mobile || 'N/A'}</p>
                </div>
              </div>

              {verification.document_url && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Attached Document</p>
                  <a href={verification.document_url} target="_blank" rel="noreferrer"
                    className="inline-block px-4 py-2 bg-purple-100 text-purple-700 font-bold rounded-lg hover:bg-purple-200 transition">
                    📄 View Certificate / Document
                  </a>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-lg border border-orange-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Decision Panel</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write reason or remarks..."
                className="w-full h-24 px-4 py-3 rounded-xl border border-orange-200 bg-white placeholder:text-gray-400 focus:outline-none mb-4"
              />
              <div className="flex gap-2">
                <button onClick={() => handleAction('verified')} disabled={updating}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-55">
                  Verify
                </button>
                <button onClick={() => handleAction('rejected')} disabled={updating}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-55">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
