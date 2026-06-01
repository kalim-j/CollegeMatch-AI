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
        rounded-2xl border border-purple-100 bg-white/70 backdrop-blur-xl">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2
            border-purple-600 border-t-transparent
            animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading Map...</p>
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
    const fetchColleges = async () => {
      setLoading(true);
      
      // First try with latitude filter
      let { data, error } = await supabase
        .from('colleges')
        .select('*')
        .order('nirf_rank', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        setLoading(false);
        return;
      }

      // Filter valid coordinates client-side
      const withCoords = (data || []).filter(
        c => c.latitude && c.longitude &&
             !isNaN(c.latitude) && !isNaN(c.longitude)
      );

      // If no coordinates, use default India coordinates
      const processed = (data || []).map(c => ({
        ...c,
        latitude: c.latitude || 20.5937,
        longitude: c.longitude || 78.9629,
      }));

      setColleges(withCoords.length > 0 ? withCoords : processed);
      setLoading(false);
    };

    fetchColleges();
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll('[data-animate]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              (entry.target as HTMLElement).style.opacity = '1';
              (entry.target as HTMLElement).style.transform = 'translateY(0)';
            }, i * 80);
          }
        });
      },
      { threshold: 0.1 }
    );
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  const filtered = colleges.filter(c => {
    const matchFilter = filter === 'All' || c.type === filter;
    const matchSearch = search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const states = [...new Set(colleges.map(c => c.state))].length;

  return (
    <div className="min-h-screen p-4 sm:p-6 pb-24 sm:pb-6"
      style={{ background: 'linear-gradient(135deg, #f0f4ff, #faf5ff)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-5" data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            College Map
          </h1>
          <p className="text-gray-500 text-sm">
            Explore {colleges.length}+ colleges across India
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5" data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
          {[
            { label: 'Total', value: colleges.length, icon: '🏫' },
            { label: 'Govt', value: colleges.filter(c => c.type === 'Government').length, icon: '🏛️' },
            { label: 'Private', value: colleges.filter(c => c.type === 'Private').length, icon: '🏢' },
            { label: 'States', value: states, icon: '🗺️' },
          ].map(s => (
            <div key={s.label}
              className="bg-white/70 backdrop-blur-xl border border-purple-100
                rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-3 text-center">
              <p className="text-lg mb-0.5">{s.icon}</p>
              <p className="text-gray-900 font-bold text-lg">{s.value}</p>
              <p className="text-gray-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5" data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
          <input
            type="text"
            placeholder="Search college or state..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm
              bg-white/60 border border-purple-200 text-gray-800
              placeholder:text-gray-400 focus:outline-none
              focus:ring-2 focus:ring-purple-200 transition-all duration-300"
          />
          <div className="flex gap-2 flex-wrap">
            {['All', 'Government', 'Private', 'Deemed'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold
                  transition-all duration-300 border flex-shrink-0
                  ${filter === f
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-200'
                    : 'bg-white/70 text-gray-500 border-purple-100 hover:bg-white'
                  }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <div data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
          {loading ? (
            <div className="flex items-center justify-center h-[400px]
              rounded-2xl border border-purple-100 bg-white/70 backdrop-blur-xl">
              <div className="w-10 h-10 rounded-full border-2
                border-purple-600 border-t-transparent animate-spin" />
            </div>
          ) : (
            <CollegeMap colleges={filtered} />
          )}
        </div>
      </div>
    </div>
  );
}
