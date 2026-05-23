'use client';

import React from 'react';
import GlassCard from './GlassCard';
import { StreamRecommendation } from '@/types/discovery';

type StreamResultCardProps = {
  stream: StreamRecommendation;
  onSelect: () => void;
  onExplore: () => void;
};

export default function StreamResultCard({ stream, onSelect, onExplore }: StreamResultCardProps) {
  // Determine color based on match score
  let scoreColor = 'text-amber-400';
  let glowClass = '';
  if (stream.match_score >= 90) {
    scoreColor = 'text-teal-400';
    glowClass = 'shadow-[0_0_15px_rgba(45,212,191,0.2)]';
  } else if (stream.match_score >= 75) {
    scoreColor = 'text-indigo-400';
    glowClass = 'shadow-[0_0_15px_rgba(129,140,248,0.2)]';
  }

  // Rank badge styles
  const rankStyles = {
    1: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    2: 'bg-slate-300/20 text-slate-300 border-slate-300/50',
    3: 'bg-amber-700/20 text-amber-600 border-amber-700/50',
  }[stream.rank] || 'bg-white/10 text-white';

  return (
    <GlassCard className={`p-6 mb-6 ${glowClass}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full border font-bold text-sm ${rankStyles}`}>
            #{stream.rank}
          </span>
          <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-teal-300 to-indigo-300 bg-clip-text text-transparent">
            {stream.stream}
          </h3>
        </div>
        <div className="flex flex-col items-end">
          <div className={`text-3xl font-bold ${scoreColor}`}>
            {stream.match_score}%
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Match Score</div>
        </div>
      </div>

      {/* Match Score Bar */}
      <div className="w-full bg-white/5 h-2 rounded-full mb-6 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-teal-400 to-indigo-500 transition-all duration-1000 ease-out"
          style={{ width: `${stream.match_score}%` }}
        ></div>
      </div>

      {/* Why it fits */}
      <div className="pl-4 border-l-2 border-teal-500 mb-6 bg-teal-500/5 py-3 pr-3 rounded-r-lg">
        <div className="flex gap-2">
          <i className="ti-quote text-teal-400 mt-1"></i>
          <p className="text-sm italic text-gray-200 leading-relaxed">
            {stream.why_fits}
          </p>
        </div>
      </div>

      {/* Career Paths */}
      <div className="mb-6">
        <h4 className="text-sm text-gray-400 mb-3">You could become:</h4>
        <div className="flex flex-wrap gap-2">
          {stream.career_paths.map((career, i) => (
            <span key={i} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-sm">
              {career}
            </span>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
          <div className="text-xs text-gray-400 mb-1">Avg Salary</div>
          <div className="text-sm font-semibold text-white">{stream.average_salary}</div>
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
          <div className="text-xs text-gray-400 mb-1">Duration</div>
          <div className="text-sm font-semibold text-white">{stream.course_duration}</div>
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
          <div className="text-xs text-gray-400 mb-1">Difficulty</div>
          <div className="text-sm font-semibold text-white">{stream.difficulty_level}</div>
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
          <div className="text-xs text-gray-400 mb-1">Top Exam</div>
          <div className="text-sm font-semibold text-white truncate" title={stream.entrance_exams[0]}>
            {stream.entrance_exams[0] || 'N/A'}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Top Companies */}
        <div>
          <h4 className="text-sm text-gray-400 mb-3">Companies that hire:</h4>
          <div className="flex flex-wrap gap-2">
            {stream.top_companies.map((company, i) => (
              <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-gray-300 text-xs">
                {company}
              </span>
            ))}
          </div>
        </div>

        {/* Famous People */}
        <div>
          <h4 className="text-sm text-gray-400 mb-3">Indians who chose this path:</h4>
          <div className="flex flex-col gap-2">
            {stream.famous_people.map((person, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                <i className="ti-user text-gray-500"></i>
                <span>{person}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inspirational Quote */}
      <div className="pl-4 border-l-2 border-amber-500 mb-6 bg-amber-500/5 py-3 pr-3 rounded-r-lg">
        <p className="text-sm italic text-amber-200">"{stream.inspirational_quote}"</p>
      </div>

      {/* Next Step */}
      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex gap-3 mb-6">
        <i className="ti-arrow-right text-green-400 mt-1"></i>
        <div>
          <h4 className="text-sm font-bold text-green-400 mb-1">Your next step this week:</h4>
          <p className="text-sm text-gray-200">{stream.next_step}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-3">
        <button
          onClick={onSelect}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
        >
          <span>Find colleges for {stream.short_name}</span>
          <i className="ti-arrow-right"></i>
        </button>
        <button
          onClick={onExplore}
          className="py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-all"
        >
          Explore this stream
        </button>
      </div>
    </GlassCard>
  );
}
