'use client';

import { useState, useEffect } from 'react';
import { Quote, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';

const quotes = [
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Don't let what you cannot do interfere with what you can do.", author: "John Wooden" },
];

export default function DailyMotivation() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    // Pick a random quote daily (or just random on load for simplicity)
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []);

  return (
    <div className={`rounded-[2.5rem] p-7 border shadow-lg relative overflow-hidden group ${
      isDark ? 'bg-slate-900/60 border-purple-900/30' : 'bg-white border-purple-100'
    }`}>
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
        <Sparkles size={120} />
      </div>
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest">
          <Quote size={16} /> Daily Motivation
        </div>
        <p className={`text-lg font-medium italic leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          "{quote.text}"
        </p>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
          — {quote.author}
        </p>
      </div>
    </div>
  );
}
