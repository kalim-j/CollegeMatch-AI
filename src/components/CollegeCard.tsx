'use client';
import { motion } from 'framer-motion';

interface CollegeCardProps {
  college: {
    id: number;
    name: string;
    location: string;
    state: string;
    type: string;
    cutoff_general?: number;
    avg_package_lpa?: number;
    nirf_rank?: number;
    website?: string;
  };
}

export default function CollegeCard({ college }: CollegeCardProps) {
  return (
    <motion.div
      className="p-6 rounded-2xl bg-white/70 backdrop-blur-xl border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300"
      whileHover={{ y: -5 }}
    >
      <h3 className="font-bold text-gray-900 text-lg mb-2">{college.name}</h3>
      <p className="text-gray-550 text-sm mb-4">📍 {college.location}, {college.state}</p>
      <div className="flex justify-between items-center mt-4 border-t border-purple-100 pt-4">
        {college.nirf_rank ? (
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
            NIRF #{college.nirf_rank}
          </span>
        ) : (
          <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
            NIRF N/A
          </span>
        )}
        <a
          href={college.website || 'https://google.com/search?q=' + encodeURIComponent(college.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition shadow-sm"
        >
          Visit Website
        </a>
      </div>
    </motion.div>
  );
}
