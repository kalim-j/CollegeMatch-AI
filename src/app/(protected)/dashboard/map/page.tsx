'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { collegesDatabase } from '@/data/collegesDatabase';

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
  district: string;
};

export default function MapPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchTrigger, setSearchTrigger] = useState('');

  useEffect(() => {
    const fetchColleges = async () => {
      setLoading(true);

      const stateCoords: Record<string, [number, number]> = {
        'Tamil Nadu': [11.1271, 78.6569],
        'Maharashtra': [19.7515, 75.7139],
        'Karnataka': [15.3173, 75.7139],
        'Kerala': [10.8505, 76.2711],
        'Delhi': [28.7041, 77.1025],
        'Gujarat': [22.2587, 71.1924],
        'West Bengal': [22.9868, 87.8550],
        'Uttar Pradesh': [26.8467, 80.9462],
        'Andhra Pradesh': [15.9129, 79.7400],
        'Telangana': [18.1124, 79.0193],
      };

      const processed = (collegesDatabase || []).map((c: any) => {
        let lat = c.latitude;
        let lng = c.longitude;

        if (!lat || !lng) {
          const base = stateCoords[c.state] || [20.5937, 78.9629];
          const offsetLat = (Math.random() - 0.5) * 0.25;
          const offsetLng = (Math.random() - 0.5) * 0.25;
          lat = base[0] + offsetLat;
          lng = base[1] + offsetLng;
        }

        return {
          id: c.id,
          name: c.name,
          location: c.location,
          state: c.state,
          type: c.type,
          cutoff_general: c.cutoff_general,
          avg_package_lpa: c.avg_package_lpa,
          nirf_rank: c.nirf_rank,
          website: c.website,
          latitude: lat,
          longitude: lng,
          district: c.district || '',
        };
      });

      setColleges(processed);
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
    const matchSearch = searchTrigger === '' ||
      c.name.toLowerCase().includes(searchTrigger.toLowerCase()) ||
      c.state.toLowerCase().includes(searchTrigger.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTrigger.toLowerCase()) ||
      c.district.toLowerCase().includes(searchTrigger.toLowerCase());
    return matchFilter && matchSearch;
  });

  const states = [...new Set(filtered.map(c => c.state))].length;

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
            Explore {filtered.length}+ colleges across India
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5" data-animate style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
          {[
            { label: 'Total', value: filtered.length, icon: '🏫' },
            { label: 'Govt', value: filtered.filter(c => c.type === 'Government' || c.type === 'Autonomous').length, icon: '🏛️' },
            { label: 'Private', value: filtered.filter(c => c.type === 'Private' || c.type === 'Deemed').length, icon: '🏢' },
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
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Search college, city, or state..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setSearchTrigger(search);
                }
              }}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm
                bg-white/60 border border-purple-200 text-gray-800
                placeholder:text-gray-400 focus:outline-none
                focus:ring-2 focus:ring-purple-200 transition-all duration-300"
            />
            <button
              onClick={() => setSearchTrigger(search)}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200 transition-all duration-300"
            >
              Search
            </button>
          </div>
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
