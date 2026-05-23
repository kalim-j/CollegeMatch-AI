'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/GlassCard';
import { StreamDetails } from '@/types/discovery';
import DiscoveryLoadingScreen from '@/components/DiscoveryLoadingScreen';

export default function StreamDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [details, setDetails] = useState<StreamDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const streamName = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  useEffect(() => {
    if (user === null) {
      router.push('/login');
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await fetch('/api/stream-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stream: streamName })
        });
        
        if (!res.ok) throw new Error('Failed to load stream details');
        
        const data = await res.json();
        setDetails(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDetails();
    }
  }, [user, streamName, router]);

  if (loading) return <DiscoveryLoadingScreen />;

  if (error || !details) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Oops!</h1>
        <p className="text-gray-300">{error || 'Failed to load data.'}</p>
        <button onClick={() => router.back()} className="mt-6 px-6 py-2 bg-white/10 rounded-lg text-white">Go Back</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Hero */}
      <GlassCard className="p-8 md:p-12 mb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -z-10"></div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-300 to-indigo-300 bg-clip-text text-transparent mb-4">
          {details.stream}
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 italic mb-8">"{details.tagline}"</p>
        
        <button 
          onClick={() => router.push(`/interview?stream=${encodeURIComponent(details.stream)}`)}
          className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 mx-auto"
        >
          <span>Find colleges for {details.stream}</span>
          <i className="ti-arrow-right"></i>
        </button>
      </GlassCard>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2 space-y-8">
          {/* What is it */}
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <i className="ti-info-circle text-teal-400"></i>
              What is this stream?
            </h2>
            <p className="text-gray-300 leading-relaxed text-lg">{details.what_is_it}</p>
          </GlassCard>

          {/* Year by Year */}
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <i className="ti-calendar-event text-indigo-400"></i>
              What will you actually study?
            </h2>
            <div className="space-y-6">
              {details.year_by_year.map((year, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-indigo-500/30 pb-2">
                  <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1.5 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                  <h3 className="text-lg font-bold text-indigo-300 mb-1">{year.year}: <span className="text-white">{year.focus}</span></h3>
                  <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                    {year.highlights.map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Day in life */}
          <GlassCard className="p-6 border-l-4 border-l-yellow-500">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <i className="ti-sun text-yellow-400"></i>
              A Day in the Life
            </h2>
            <p className="text-gray-300 italic leading-relaxed">"{details.day_in_life}"</p>
          </GlassCard>
        </div>

        <div className="space-y-8">
          {/* Is this right for you */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Is this right for you?</h2>
            
            <div className="mb-6 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
              <h3 className="text-green-400 font-bold flex items-center gap-2 mb-3">
                <i className="ti-check"></i> YES if:
              </h3>
              <ul className="space-y-2">
                {details.is_right_for_you.yes_if.map((item, idx) => (
                  <li key={idx} className="text-gray-300 text-sm flex gap-2">
                    <span className="text-green-500 mt-0.5">•</span> <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
              <h3 className="text-red-400 font-bold flex items-center gap-2 mb-3">
                <i className="ti-x"></i> NO if:
              </h3>
              <ul className="space-y-2">
                {details.is_right_for_you.no_if.map((item, idx) => (
                  <li key={idx} className="text-gray-300 text-sm flex gap-2">
                    <span className="text-red-500 mt-0.5">•</span> <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>

          {/* Pros & Cons */}
          <GlassCard className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                <i className="ti-thumb-up"></i> Top Advantages
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                {details.pros.map((pro, i) => <li key={i}>✓ {pro}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2">
                <i className="ti-thumb-down"></i> Challenges
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                {details.cons.map((con, i) => <li key={i}>⚠ {con}</li>)}
              </ul>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Career Paths */}
      <GlassCard className="p-6 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <i className="ti-briefcase text-teal-400"></i>
          Career Options & Salary
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {details.career_paths.map((career, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white text-lg">{career.title}</h3>
                <span className={`text-xs px-2 py-1 rounded font-bold ${
                  career.growth === 'High' ? 'bg-green-500/20 text-green-400' :
                  career.growth === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>{career.growth} Growth</span>
              </div>
              <p className="text-sm text-gray-400 mb-3">{career.description}</p>
              <div className="text-teal-300 font-medium text-sm">
                <i className="ti-currency-rupee mr-1"></i>{career.salary}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Top Colleges */}
      <GlassCard className="p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to find colleges?</h2>
        <p className="text-gray-300 mb-6">Explore the best institutions for {details.stream} across India.</p>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {details.top_colleges_india.map((college, i) => (
            <span key={i} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-sm rounded-full">
              {college}
            </span>
          ))}
        </div>
        <button 
          onClick={() => router.push(`/interview?stream=${encodeURIComponent(details.stream)}`)}
          className="px-8 py-3 bg-white text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 transition-colors"
        >
          Start College Search
        </button>
      </GlassCard>

    </div>
  );
}
