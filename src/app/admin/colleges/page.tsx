'use client';
import AdminGuard from '@/components/AdminGuard';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type College = {
  id: number;
  name: string;
  location: string;
  state: string;
  type: string;
  nirf_rank: number;
  avg_package_lpa: number;
  website: string;
  created_at: string;
};

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchColleges = async () => {
      let query = supabase.from('colleges').select('*');

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      if (search) {
        query = query.or(
          `name.ilike.%${search}%,location.ilike.%${search}%`
        );
      }

      const { data } = await query.order('nirf_rank', { ascending: true });
      setColleges(data || []);
      setLoading(false);
    };

    fetchColleges();
  }, [search, filter]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this college?')) return;
    const { error } = await supabase.from('colleges').delete().eq('id', id);
    if (!error) {
      setColleges(colleges.filter(col => col.id !== id));
      alert('College deleted successfully');
    } else {
      alert('Error deleting college');
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900">College Management</h1>
              <p className="text-gray-500">Total colleges: {colleges.length}</p>
            </div>
            <Link href="/admin/colleges/add"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600
                text-white font-bold hover:opacity-90 transition
                flex items-center gap-2">
              + Add College
            </Link>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search colleges..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-white/80 backdrop-blur
                border border-purple-200 text-gray-900
                placeholder:text-gray-400 focus:outline-none
                focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/80 backdrop-blur
                border border-purple-200 text-gray-900 focus:outline-none">
              <option value="all">All Types</option>
              <option value="Government">Government</option>
              <option value="Private">Private</option>
              <option value="Deemed">Deemed</option>
            </select>
          </div>

          {/* Colleges Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 rounded-full border-4 border-purple-200
                border-t-purple-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {colleges.map((college, i) => (
                <div key={college.id}
                  className="group block"
                  style={{
                    animationDelay: `${i * 50}ms`,
                  }}>
                  <div className="h-full bg-white/80 backdrop-blur-xl rounded-2xl
                    border border-purple-100 p-6 hover:shadow-xl
                    hover:-translate-y-2 transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 flex-1 group-hover:text-purple-600
                        transition line-clamp-2">
                        {college.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold
                        flex-shrink-0 ml-2
                        ${college.type === 'Government' ? 'bg-blue-100 text-blue-700' :
                          college.type === 'Private' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                        {college.type?.slice(0, 3).toUpperCase() || 'COL'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-3 font-medium">
                      📍 {college.location}, {college.state}
                    </p>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label: 'NIRF', value: `#${college.nirf_rank || 'N/A'}` },
                        { label: 'Package', value: `${college.avg_package_lpa || 0}L` },
                        { label: 'Type', value: college.type?.slice(0, 4) || 'N/A' },
                      ].map((stat, i) => (
                        <div key={i} className="p-2 rounded-lg bg-gradient-to-br
                          from-purple-50 to-blue-50 border border-purple-100 text-center">
                          <p className="text-xs text-gray-500">{stat.label}</p>
                          <p className="font-bold text-gray-900 text-sm">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/admin/colleges/${college.id}`} className="flex-1 text-center px-3 py-2 rounded-lg text-xs font-bold
                        bg-purple-100 text-purple-700 hover:bg-purple-200 transition">
                        Edit
                      </Link>
                      <button onClick={(e) => handleDelete(college.id, e)} className="flex-1 px-3 py-2 rounded-lg text-xs font-bold
                        bg-red-100 text-red-700 hover:bg-red-200 transition">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
