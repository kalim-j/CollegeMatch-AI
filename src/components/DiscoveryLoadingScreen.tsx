'use client';

import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "Analysing your interests...",
  "Finding your strengths...",
  "Mapping your personality...",
  "Calculating your best streams...",
  "Almost there..."
];

export default function DiscoveryLoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cycle messages every 2 seconds
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % MESSAGES.length);
    }, 2000);

    // Fill progress bar over ~8 seconds (100% in 8000ms => 1% per 80ms)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) {
          clearInterval(progressInterval);
          return 98; // Hold at 98% until actual completion
        }
        return prev + 1;
      });
    }, 80);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[60vh]">
      <div className="relative mb-12">
        {/* Pulsing rings */}
        <div className="absolute inset-0 rounded-full bg-teal-500/20 animate-ping" style={{ animationDuration: '2s' }}></div>
        <div className="absolute inset-[-10px] rounded-full bg-indigo-500/10 animate-ping" style={{ animationDuration: '2.5s' }}></div>
        
        {/* Core circle */}
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-teal-500/20 to-indigo-500/20 border border-teal-500/30 flex items-center justify-center backdrop-blur-md">
          <i className="ti-brain text-4xl text-teal-400"></i>
        </div>
      </div>
      
      <div className="h-8 mb-6 relative w-full max-w-sm flex items-center justify-center overflow-hidden">
        {MESSAGES.map((msg, idx) => (
          <p
            key={idx}
            className={`absolute text-lg font-medium text-white transition-all duration-500 ${
              idx === messageIndex 
                ? 'opacity-100 transform-none' 
                : idx < messageIndex 
                  ? 'opacity-0 -translate-y-4' 
                  : 'opacity-0 translate-y-4'
            }`}
          >
            {msg}
          </p>
        ))}
      </div>

      <div className="w-full max-w-sm bg-white/5 rounded-full h-1.5 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-teal-400 to-indigo-500 h-full transition-all duration-150 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
