"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#05071a] flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        {/* Glass card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-10 shadow-xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-indigo-500/10 border border-indigo-500/20 p-5">
              <WifiOff className="w-10 h-10 text-indigo-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-3 font-syne">
            You&apos;re Offline
          </h1>

          {/* Subtitle */}
          <p className="text-white/60 text-base mb-8 leading-relaxed">
            Please check your connection and try again.
          </p>

          {/* Try Again button */}
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold px-8 py-3 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#05071a]"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
