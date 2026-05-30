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
      case 'Open': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Closing Soon': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      'OBC': 'bg-blue-500/20 text-blue-400',
      'SC': 'bg-purple-500/20 text-purple-400',
      'ST': 'bg-green-500/20 text-green-400',
      'Minority': 'bg-orange-500/20 text-orange-400',
      'EWS': 'bg-pink-500/20 text-pink-400',
      'General': 'bg-gray-500/20 text-gray-400',
      'All': 'bg-indigo-500/20 text-indigo-400',
    };
    return colors[cat] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="min-h-screen bg-[#07091a] p-6 pt-24">
      <div className="max-w-7xl mx-auto">

        {/* HERO HEADER */}
        <div className="relative rounded-3xl overflow-hidden mb-8 p-8
          bg-gradient-to-br from-purple-900/40 via-violet-900/20 to-pink-900/20
          border border-purple-500/20">

          {/* Animated background orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -left-20 w-64 h-64 
              bg-purple-600/20 rounded-full blur-3xl 
              animate-[float_8s_ease-in-out_infinite]" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64
              bg-pink-600/15 rounded-full blur-3xl
              animate-[float_10s_ease-in-out_infinite_2s]" />
          </div>

          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5
              rounded-full bg-purple-500/20 border border-purple-500/30
              text-purple-300 text-xs font-medium mb-4">
              ✦ AI-POWERED • REAL DATA • UPDATED LIVE
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Find Scholarships
            </h1>
            <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
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
                    bg-white/10 border border-white/20 text-white
                    placeholder:text-gray-400 focus:outline-none
                    focus:border-purple-400 transition text-sm"
                />
              </div>
              <button
                onClick={fetchScholarships}
                disabled={loading}
                className="px-6 py-3.5 rounded-xl font-semibold text-white
                  bg-gradient-to-r from-purple-600 to-pink-600
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
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl 
          p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" className="w-4 h-4 text-purple-400">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            <span className="text-white font-medium text-sm">Filters</span>
            <span className="text-gray-500 text-xs ml-auto">
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
                  bg-white/[0.06] border border-white/10 text-white
                  focus:outline-none focus:border-purple-500 transition"
              >
                {STREAMS.map(s => (
                  <option key={s} value={s}
                    className="bg-[#0d1024] text-white">{s}</option>
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
                  bg-white/[0.06] border border-white/10 text-white
                  focus:outline-none focus:border-purple-500 transition"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}
                    className="bg-[#0d1024] text-white">{c}</option>
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
                  bg-white/[0.06] border border-white/10 text-white
                  focus:outline-none focus:border-purple-500 transition"
              >
                {LEVELS.map(l => (
                  <option key={l} value={l}
                    className="bg-[#0d1024] text-white">{l}</option>
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
                  bg-white/[0.06] border border-white/10 text-white
                  focus:outline-none focus:border-purple-500 transition"
              >
                {STATES.map(s => (
                  <option key={s} value={s}
                    className="bg-[#0d1024] text-white">{s}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={fetchScholarships}
            disabled={loading}
            className="mt-4 w-full py-3 rounded-xl font-semibold text-white
              bg-gradient-to-r from-purple-600 to-pink-600
              hover:opacity-90 transition disabled:opacity-50
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
          <div className="mb-6 p-4 rounded-xl border border-red-500/30
            bg-red-500/10 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* LOADING ANIMATION */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2
                  border-purple-500/30 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2
                  border-purple-500 border-t-transparent animate-spin" />
                <div className="absolute inset-4 rounded-full
                  bg-purple-500/20 animate-pulse" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">
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
                      border-purple-500/30 text-purple-400
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
                <h2 className="text-white font-bold text-xl">
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
                  text-sm text-purple-400 border border-purple-500/30
                  hover:bg-purple-500/10 transition"
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
                  className="group bg-white/[0.04] border border-white/10
                    rounded-2xl p-6 hover:border-purple-500/40
                    hover:bg-purple-500/[0.05] hover:-translate-y-1
                    hover:shadow-xl hover:shadow-purple-900/20
                    transition-all duration-300"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    animation: 'fadeSlideUp 0.4s ease forwards',
                    opacity: 0,
                  }}
                >
                  {/* Tags row */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs
                      font-medium border ${getStatusColor(s.status)}`}>
                      ● {s.status}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs
                      font-medium ${getCategoryColor(s.category)}`}>
                      {s.category}
                    </span>
                    {s.stream !== 'All' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs
                        font-medium bg-indigo-500/20 text-indigo-400">
                        {s.stream}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-white font-bold text-base mb-1
                    leading-snug line-clamp-2 group-hover:text-purple-200
                    transition-colors">
                    {s.name}
                  </h3>

                  {/* Provider */}
                  <p className="text-gray-500 text-xs mb-3 flex items-center gap-1">
                    🏛️ {s.provider}
                  </p>

                  {/* Amount */}
                  <div className="inline-flex items-baseline gap-1 
                    px-3 py-1.5 rounded-xl
                    bg-green-500/15 border border-green-500/20 mb-3">
                    <span className="text-green-400 text-xl font-bold">
                      {formatAmount(s.amount_per_year)}
                    </span>
                    <span className="text-green-600 text-xs">/yr</span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-xs leading-relaxed mb-3
                    line-clamp-2">
                    {s.description}
                  </p>

                  {/* Eligibility */}
                  <div className="bg-white/[0.04] rounded-xl p-3 mb-4">
                    <p className="text-gray-500 text-xs uppercase 
                      tracking-wider mb-1">Eligibility</p>
                    <p className="text-gray-300 text-xs leading-relaxed
                      line-clamp-2">
                      {s.eligibility}
                    </p>
                  </div>

                  {/* Deadline & Level */}
                  <div className="flex items-center gap-3 mb-4 text-xs">
                    <span className="flex items-center gap-1 text-gray-400">
                      📅 {s.deadline}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="flex items-center gap-1 text-gray-400">
                      🎓 {s.level}
                    </span>
                  </div>

                  {/* Tags */}
                  {s.tags && s.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {s.tags.map(tag => (
                        <span key={tag}
                          className="px-2 py-0.5 rounded-md text-xs
                            bg-white/[0.04] text-gray-500 
                            border border-white/[0.06]">
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
                        bg-gradient-to-r from-purple-600 to-pink-600
                        hover:opacity-90 transition"
                    >
                      Apply Now →
                    </a>
                    <a
                      href={s.apply_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl text-xs
                        font-medium text-gray-400
                        border border-white/10 hover:border-white/20
                        hover:text-white transition"
                    >
                      Details
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="mt-8 p-4 rounded-xl border border-yellow-500/20
              bg-yellow-500/5 text-center">
              <p className="text-yellow-400/80 text-xs">
                ⚠️ Scholarship data is AI-generated based on real Indian 
                scholarships. Always verify details on official websites 
                before applying. Visit{' '}
                <a href="https://scholarships.gov.in" target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-yellow-300">
                  scholarships.gov.in
                </a>
                {' '}for the official NSP portal.
              </p>
            </div>
          </>
        )}

        {/* EMPTY STATE */}
        {!loading && !searched && (
          <div className="text-center py-20 rounded-2xl border 
            border-white/10 bg-white/[0.02]">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-white font-bold text-xl mb-2">
              Discover Real Scholarships
            </h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
              Our AI searches through NSP, AICTE, UGC, state government 
              portals and private organizations to find scholarships 
              matching your profile
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 
              max-w-2xl mx-auto mb-8">
              {[
                { icon: '🏛️', label: 'Central Govt', sub: 'NSP, AICTE, UGC' },
                { icon: '🗺️', label: 'State Govt', sub: '28 States' },
                { icon: '🏢', label: 'PSUs & Private', sub: 'IOCL, Tata, etc' },
                { icon: '🌍', label: 'International', sub: 'Study Abroad' },
              ].map(item => (
                <div key={item.label}
                  className="bg-white/[0.04] border border-white/10
                    rounded-xl p-4 text-center">
                  <p className="text-2xl mb-1">{item.icon}</p>
                  <p className="text-white text-sm font-medium">
                    {item.label}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>
            <button
              onClick={fetchScholarships}
              className="px-8 py-3 rounded-xl font-semibold text-white
                bg-gradient-to-r from-purple-600 to-pink-600
                hover:opacity-90 transition text-sm"
            >
              🤖 Find My Scholarships
            </button>
          </div>
        )}

        {/* NO RESULTS */}
        {!loading && searched && scholarships.length === 0 && (
          <div className="text-center py-20 rounded-2xl border
            border-white/10 bg-white/[0.02]">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-white font-semibold text-lg mb-2">
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
              className="px-6 py-2.5 rounded-xl text-sm text-purple-400
                border border-purple-500/30 hover:bg-purple-500/10 transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
