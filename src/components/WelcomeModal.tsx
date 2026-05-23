'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/GlassCard';

type WelcomeModalProps = {
  userName: string;
  onClose: () => void;
};

export default function WelcomeModal({ userName, onClose }: WelcomeModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleChoice = async (path: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { shownWelcome: true });
      onClose();
      router.push(path);
    } catch (error) {
      console.error('Error updating welcome status:', error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <GlassCard className="max-w-2xl w-full p-8 relative">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-4 border border-teal-500/30">
            <i className="ti-hand-stop text-40px text-teal-400"></i>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Welcome to CollegeMatch-AI, {userName || 'friend'}!
          </h2>
          <p className="text-gray-300">
            Before we find colleges, one quick question:
          </p>
          <p className="text-xl text-teal-300 font-medium mt-4">
            Do you know what you want to study after 12th?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => handleChoice('/interview')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all group disabled:opacity-50 text-left h-full"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <i className="ti-check text-2xl text-indigo-400"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Yes, I know my stream</h3>
            <p className="text-sm text-gray-400 text-center">I am ready to find the best colleges for my marks.</p>
          </button>

          <button
            onClick={() => handleChoice('/discover')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 hover:border-teal-400 transition-all group disabled:opacity-50 text-left h-full"
          >
            <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <i className="ti-help text-2xl text-teal-400"></i>
            </div>
            <div className="absolute -top-3 -right-3">
              <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold">Start here</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No, help me figure it out</h3>
            <p className="text-sm text-gray-400 text-center">Let AI suggest the right stream based on my interests.</p>
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
