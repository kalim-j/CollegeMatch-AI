'use client';
import AdminGuard from '@/components/AdminGuard';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';

export default function EditCollegePage() {
  const params = useParams();
  const router = useRouter();
  const collegeId = params.id as string;

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('');
  const [type, setType] = useState('Government');
  const [nirfRank, setNirfRank] = useState(0);
  const [avgPackage, setAvgPackage] = useState(0);
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCollege = async () => {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .eq('id', collegeId)
        .single();

      if (!error && data) {
        setName(data.name || '');
        setLocation(data.location || '');
        setState(data.state || '');
        setType(data.type || 'Government');
        setNirfRank(data.nirf_rank || 0);
        setAvgPackage(data.avg_package_lpa || 0);
        setWebsite(data.website || '');
      }
      setLoading(false);
    };

    fetchCollege();
  }, [collegeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('colleges')
      .update({
        name,
        location,
        state,
        type,
        nirf_rank: Number(nirfRank),
        avg_package_lpa: Number(avgPackage),
        website,
      })
      .eq('id', collegeId);

    setSaving(false);
    if (!error) {
      alert('College updated successfully!');
      router.push('/admin/colleges');
    } else {
      alert('Error updating college details');
    }
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

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-purple-100 p-6 shadow-lg">
          <h1 className="text-3xl font-black text-gray-900 mb-6">Edit College</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">College Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required
                  className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">State</label>
                <input type="text" value={state} onChange={(e) => setState(e.target.value)} required
                  className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none">
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                  <option value="Deemed">Deemed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">NIRF Rank</label>
                <input type="number" value={nirfRank} onChange={(e) => setNirfRank(Number(e.target.value))} required
                  className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Avg Package (LPA)</label>
                <input type="number" step="0.1" value={avgPackage} onChange={(e) => setAvgPackage(Number(e.target.value))} required
                  className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Website URL</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:outline-none" />
            </div>

            <button type="submit" disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </AdminGuard>
  );
}
