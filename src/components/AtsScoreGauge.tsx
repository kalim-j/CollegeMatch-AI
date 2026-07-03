'use client';

import React from 'react';

export default function AtsScoreGauge({ score, size = 120 }: { score: number, size?: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = '#ef4444'; // red for < 41
  let grade = 'F';
  if (score >= 41 && score <= 60) {
    color = '#f59e0b'; // amber
    grade = 'C';
  } else if (score >= 61 && score <= 80) {
    color = '#14b8a6'; // teal
    grade = 'B';
  } else if (score >= 81) {
    color = '#22c55e'; // green
    grade = 'A';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade {grade}</span>
        </div>
      </div>
      <div className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">
        ATS Compatible: {score}%
      </div>
    </div>
  );
}
