'use client';
import { useState } from 'react';
import axios from 'axios';

type Scholarship = {
  id: number;
  name: string;
  provider: string;
  amount_per_year: number;
  stream: string;
  category: string;
  level: string;
  state: string;
  deadline: string;
  eligibility: string;
  description: string;
  apply_link: string;
  status: string;
  tags: string[];
};

const STREAMS = ['All','Engineering','Medical','Management','Law',
  'Science','Commerce','Arts','Agriculture','Pharmacy',
  'Computer Applications','Architecture'];

const CATEGORIES = ['All','General','OBC','SC','ST','Minority','EWS'];

const LEVELS = ['All','12th Pass','Undergraduate','Postgraduate','PhD'];

const STATES = ['All India','Andhra Pradesh','Assam','Bihar','Chhattisgarh',
  'Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand',
  'Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal'];

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [search, setSearch] = useState('');
  const [stream, setStream] = useState('All');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [state, setState] = useState('All India');
  const [error, setError] = useState('');
  const [generatedAt, setGeneratedAt] = useState('');

  const fetchScholarships = async () => {
    setLoading(true);
    setError('');
    setScholarships([]);

    try {
      const res = await axios.post('/api/scholarships', {
        stream,
        category,
        level,
        state,
        search,
      });

      if (res.data.success) {
        setScholarships(res.data.scholarships);
        setGeneratedAt(res.data.generated_at);
        setSearched(true);
      }
    } catch (err) {
      setError('Failed to fetch scholarships. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-emerald-50 text-emerald-700 border-emerald-250';
      case 'Closing Soon': return 'bg-amber-50 text-amber-700 border-amber-250';
      default: return 'bg-gray-50 text-gray-700 border-gray-250';
    }
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      'OBC': 'bg-blue-50 text-blue-700 border-blue-100',
      'SC': 'bg-purple-50 text-purple-700 border-purple-100',
      'ST': 'bg-emerald-50 text-emerald-700 border-emerald-100',
      'Minority': 'bg-amber-50 text-amber-700 border-amber-100',
      'EWS': 'bg-rose-50 text-rose-700 border-rose-100',
      'General': 'bg-gray-50 text-gray-700 border-gray-100',
      'All': 'bg-indigo-50 text-indigo-700 border-indigo-100',
    };
    return colors[cat] || 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] text-gray-900 p-6 pt-24">
      <div className="max-w-7xl mx-auto">

        {/* HERO HEADER */}
        <div className="relative rounded-3xl overflow-hidden mb-8 p-8
          bg-white/70 backdrop-blur-xl border border-purple-100 shadow-sm">

          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5
              rounded-full bg-purple-50 border border-purple-100
              text-purple-750 text-xs font-semibold mb-4">
              ✦ AI-POWERED • REAL DATA • UPDATED LIVE
            </div>
            <h1 className="text-4xl font-bold text-gray-950 mb-3">
              Find Scholarships
            </h1>
            <p className="text-gray-500 font-bold text-sm mb-6 max-w-2xl mx-auto">
              Our AI finds real, active scholarships from government portals,
              PSUs, and private organizations — updated every search
            </p>

            {/* Search bar */}
            <div className="flex gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2
                  w-4 h-4 text-gray-400" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search scholarship name or keyword..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchScholarships()}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl
                    bg-white border border-purple-200 text-gray-900
                    placeholder:text-gray-400 focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 focus:outline-none transition text-sm"
                />
              </div>
              <button
                onClick={fetchScholarships}
                disabled={loading}
                className="px-6 py-3.5 rounded-xl font-semibold text-white
                  bg-purple-600 hover:bg-purple-700
                  hover:opacity-90 transition disabled:opacity-50
                  flex items-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"
                      fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Finding...
                  </>
                ) : (
                  <>🔍 Find Scholarships</>
                )}
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 mt-6">
              {[
                { label: 'Real Scholarships', icon: '🎓' },
                { label: 'Multiple Streams', icon: '📚' },
                { label: 'AI Updated', icon: '🤖' },
                { label: 'Govt + Private', icon: '🏛️' },
              ].map(s => (
                <div key={s.label}
                  className="flex items-center gap-1.5 text-gray-400 text-xs">
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white/70 backdrop-blur-xl border border-purple-100 rounded-3xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" className="w-4 h-4 text-purple-600">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            <span className="text-gray-900 font-bold text-sm">Filters</span>
            <span className="text-gray-400 text-xs ml-auto">
              Refine your scholarship search
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Stream */}
            <div>
              <label className="text-xs text-gray-400 uppercase 
                tracking-wider mb-2 block">Stream</label>
              <select
                value={stream}
                onChange={e => setStream(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm
                  bg-white border border-purple-200 text-gray-900
                  focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 focus:outline-none transition"
              >
                {STREAMS.map(s => (
                  <option key={s} value={s}
                    className="bg-white text-gray-800">{s}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs text-gray-400 uppercase
                tracking-wider mb-2 block">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm
                  bg-white border border-purple-200 text-gray-900
                  focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 focus:outline-none transition"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}
                    className="bg-white text-gray-800">{c}</option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div>
              <label className="text-xs text-gray-400 uppercase
                tracking-wider mb-2 block">Level</label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm
                  bg-white border border-purple-200 text-gray-900
                  focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 focus:outline-none transition"
              >
                {LEVELS.map(l => (
                  <option key={l} value={l}
                    className="bg-white text-gray-800">{l}</option>
                ))}
              </select>
            </div>

            {/* State */}
            <div>
              <label className="text-xs text-gray-400 uppercase
                tracking-wider mb-2 block">State</label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm
                  bg-white border border-purple-200 text-gray-900
                  focus:ring-2 focus:ring-purple-250/20 focus:border-purple-400 focus:outline-none transition"
              >
                {STATES.map(s => (
                  <option key={s} value={s}
                    className="bg-white text-gray-800">{s}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={fetchScholarships}
            disabled={loading}
            className="mt-4 w-full py-3.5 rounded-xl font-semibold text-white
              bg-purple-600 hover:bg-purple-750 transition disabled:opacity-50
              flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"
                  fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                AI is finding real scholarships...
              </>
            ) : (
              '🤖 Find Real Scholarships with AI'
            )}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200
            bg-red-50 text-red-750 text-sm shadow-sm">
            ⚠️ {error}
          </div>
        )}

        {/* LOADING ANIMATION */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2
                  border-purple-600/30 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2
                  border-purple-600 border-t-transparent animate-spin" />
              </div>
              <div>
                <p className="text-gray-950 font-bold text-lg">
                  AI is searching real scholarships...
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Checking NSP, AICTE, UGC, State portals & more
                </p>
              </div>
              <div className="flex gap-2 mt-2">
                {['NSP Portal', 'AICTE', 'UGC', 'State Govts', 'PSUs'].map((s, i) => (
                  <span key={s}
                    className="px-3 py-1 rounded-full text-xs border
                      border-purple-200 bg-white text-purple-700
                      animate-pulse"
                    style={{ animationDelay: `${i * 200}ms` }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {!loading && scholarships.length > 0 && (
          <>
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-gray-950 font-bold text-xl">
                  {scholarships.length} Scholarships Found
                </h2>
                <p className="text-gray-500 text-xs mt-1">
                  🤖 AI-generated real data •
                  Updated {new Date(generatedAt).toLocaleTimeString('en-IN')}
                </p>
              </div>
              <button
                onClick={fetchScholarships}
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                  text-sm text-purple-700 border border-purple-200 bg-white
                  hover:bg-purple-50 transition shadow-sm"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" className="w-4 h-4">
                  <path d="M23 4v6h-6M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                </svg>
                Refresh
              </button>
            </div>

            {/* Scholarship Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {scholarships.map((s, i) => (
                <div
                  key={s.id}
                  className="group bg-white/70 backdrop-blur-xl border border-purple-100
                    rounded-3xl p-6 hover:border-purple-300
                    hover:shadow-md hover:-translate-y-1
                    transition-all duration-300 shadow-sm"
                >
                  {/* Tags row */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px]
                      font-bold border ${getStatusColor(s.status)}`}>
                      ● {s.status}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px]
                      font-bold border ${getCategoryColor(s.category)}`}>
                      {s.category}
                    </span>
                    {s.stream !== 'All' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px]
                        font-bold bg-indigo-50 border border-indigo-100 text-indigo-700">
                        {s.stream}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-gray-950 font-bold text-base mb-1
                    leading-snug line-clamp-2 group-hover:text-purple-700
                    transition-colors">
                    {s.name}
                  </h3>

                  {/* Provider */}
                  <p className="text-gray-400 font-bold text-xs mb-3 flex items-center gap-1">
                    🏛️ {s.provider}
                  </p>

                  {/* Amount */}
                  <div className="inline-flex items-baseline gap-1 
                    px-3 py-1.5 rounded-xl
                    bg-emerald-550 bg-emerald-50 border border-emerald-200 mb-3">
                    <span className="text-emerald-700 text-xl font-bold">
                      {formatAmount(s.amount_per_year)}
                    </span>
                    <span className="text-emerald-600 text-xs">/yr</span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-500 text-xs leading-relaxed mb-3
                    line-clamp-2">
                    {s.description}
                  </p>

                  {/* Eligibility */}
                  <div className="bg-purple-50/50 border border-purple-100/50 rounded-2xl p-3 mb-4">
                    <p className="text-gray-400 text-[10px] font-black uppercase 
                      tracking-wider mb-1">Eligibility</p>
                    <p className="text-gray-600 text-xs leading-relaxed
                      line-clamp-2">
                      {s.eligibility}
                    </p>
                  </div>

                  {/* Deadline & Level */}
                  <div className="flex items-center gap-3 mb-4 text-xs">
                    <span className="flex items-center gap-1 text-gray-400 font-semibold">
                      📅 {s.deadline}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1 text-gray-400 font-semibold">
                      🎓 {s.level}
                    </span>
                  </div>

                  {/* Tags */}
                  {s.tags && s.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {s.tags.map(tag => (
                        <span key={tag}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold
                            bg-white text-gray-400 
                            border border-purple-100">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <a
                      href={s.apply_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 rounded-xl text-center
                        text-xs font-semibold text-white
                        bg-purple-600 hover:bg-purple-750 transition"
                    >
                      Apply Now →
                    </a>
                    <a
                      href={s.apply_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl text-xs
                        font-semibold text-gray-500 bg-white
                        border border-purple-200 hover:bg-gray-50 transition"
                    >
                      Details
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="mt-8 p-4 rounded-xl border border-amber-200
              bg-amber-50 text-center">
              <p className="text-amber-800 text-xs">
                ⚠️ Scholarship data is AI-generated based on real Indian 
                scholarships. Always verify details on official websites 
                before applying. Visit{' '}
                <a href="https://scholarships.gov.in" target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-900">
                  scholarships.gov.in
                </a>
                {' '}for the official NSP portal.
              </p>
            </div>
          </>
        )}

        {/* EMPTY STATE */}
        {!loading && !searched && (
          <div className="text-center py-20 rounded-3xl border 
            border-purple-100 bg-white/70 backdrop-blur-xl shadow-sm">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-gray-950 font-bold text-xl mb-2">
              Discover Real Scholarships
            </h2>
            <p className="text-gray-500 font-bold text-sm max-w-md mx-auto mb-6">
              Our AI searches through NSP, AICTE, UGC, state government 
              portals and private organizations to find scholarships 
              matching your profile
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 
              max-w-2xl mx-auto mb-8 px-4">
              {[
                { icon: '🏛️', label: 'Central Govt', sub: 'NSP, AICTE, UGC' },
                { icon: '🗺️', label: 'State Govt', sub: '28 States' },
                { icon: '🏢', label: 'PSUs & Private', sub: 'IOCL, Tata, etc' },
                { icon: '🌍', label: 'International', sub: 'Study Abroad' },
              ].map(item => (
                <div key={item.label}
                  className="bg-white/80 border border-purple-100
                    rounded-2xl p-4 text-center shadow-sm">
                  <p className="text-2xl mb-1">{item.icon}</p>
                  <p className="text-gray-900 text-sm font-bold">
                    {item.label}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>
            <button
              onClick={fetchScholarships}
              className="px-8 py-3.5 rounded-xl font-semibold text-white
                bg-purple-600 hover:bg-purple-750 transition text-sm shadow-md"
            >
              🤖 Find My Scholarships
            </button>
          </div>
        )}

        {/* NO RESULTS */}
        {!loading && searched && scholarships.length === 0 && (
          <div className="text-center py-20 rounded-3xl border
            border-purple-100 bg-white/70 backdrop-blur-xl shadow-sm">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-gray-950 font-bold text-lg mb-2">
              No scholarships found
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Try changing filters or search terms
            </p>
            <button
              onClick={() => {
                setStream('All');
                setCategory('All');
                setLevel('All');
                setState('All India');
                setSearch('');
              }}
              className="px-6 py-2.5 rounded-xl text-sm text-purple-700
                border border-purple-200 bg-white hover:bg-gray-50 transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
