'use client';
import AdminGuard from '@/components/AdminGuard';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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
  created_at: string;
};

export default function PendingVerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerifications = async () => {
      const { data, error } = await supabase
        .from('verifications')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (!error) {
        setVerifications(data || []);
      }
      setLoading(false);
    };

    fetchVerifications();
  }, []);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black text-gray-900 mb-8">Pending Verifications</h1>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-purple-100 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Marks</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Mobile</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <div className="w-8 h-8 rounded-full border-3 border-purple-200 border-t-purple-600 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : verifications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No pending verifications found
                      </td>
                    </tr>
                  ) : (
                    verifications.map((v) => (
                      <tr key={v.id} className="hover:bg-purple-50/50 transition">
                        <td className="px-6 py-4 font-bold text-gray-900">{v.full_name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm">{v.marks_12th}%</td>
                        <td className="px-6 py-4 text-sm">{v.category}</td>
                        <td className="px-6 py-4 text-sm">{v.mobile || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(v.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <Link href={`/admin/verifications/${v.id}`} className="text-purple-600 font-bold hover:underline">
                            Verify Details
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
