'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const CollegeMap = dynamic(
  () => import('@/components/CollegeMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px]
        rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2
            border-purple-500 border-t-transparent
            animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading Map...</p>
        </div>
      </div>
    ),
  }
);

type College = {
  id: number;
  name: string;
  location: string;
  state: string;
  type: string;
  cutoff_general: number;
  avg_package_lpa: number;
  nirf_rank: number;
  website: string;
  latitude: number;
  longitude: number;
};

export default function MapPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase
      .from('colleges')
      .select('*')
      .not('latitude', 'is', null)
      .then(({ data }) => {
        setColleges(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = colleges.filter(c => {
    const matchFilter = filter === 'All' || c.type === filter;
    const matchSearch = search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const states = [...new Set(colleges.map(c => c.state))].length;

  return (
    <div className="min-h-screen bg-[#07091a] p-4 sm:p-6 pb-24 sm:pb-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            College Map
          </h1>
          <p className="text-gray-400 text-sm">
            Explore {colleges.length}+ colleges across India
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total', value: colleges.length, icon: '🏫' },
            { label: 'Govt', value: colleges.filter(c => c.type === 'Government').length, icon: '🏛️' },
            { label: 'Private', value: colleges.filter(c => c.type === 'Private').length, icon: '🏢' },
            { label: 'States', value: states, icon: '🗺️' },
          ].map(s => (
            <div key={s.label}
              className="bg-white/[0.04] border border-white/10
                rounded-xl p-3 text-center">
              <p className="text-lg mb-0.5">{s.icon}</p>
              <p className="text-white font-bold text-lg">{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="text"
            placeholder="Search college or state..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm
              bg-white/[0.06] border border-white/10 text-white
              placeholder:text-gray-500 focus:outline-none
              focus:border-purple-500 transition"
          />
          <div className="flex gap-2 flex-wrap">
            {['All', 'Government', 'Private', 'Deemed'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-xl text-xs font-medium
                  transition border flex-shrink-0
                  ${filter === f
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-white/[0.04] text-gray-400 border-white/10'
                  }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        {loading ? (
          <div className="flex items-center justify-center h-[400px]
            rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="w-10 h-10 rounded-full border-2
              border-purple-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <CollegeMap colleges={filtered} />
        )}
      </div>
    </div>
  );
}
