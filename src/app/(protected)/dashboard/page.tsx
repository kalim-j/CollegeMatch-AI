"use client";

import { useAuth } from "@/context/AuthContext";
import { GraduationCap, History, User, ChevronRight, BarChart, BookOpen, Star } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Welcome back, <span className="text-primary">{profile?.displayName?.split(' ')[0] || 'Student'}</span>!
        </h1>
        <p className="text-gray-600 mt-2">Here's an overview of your admission journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Profile Quick View */}
        <div className="md:col-span-2 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="h-32 w-32 rounded-3xl bg-primary/5 flex items-center justify-center overflow-hidden border-2 border-primary/10">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <User className="h-16 w-16 text-primary/40" />
            )}
          </div>
          <div className="flex-grow text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile?.displayName}</h2>
            <p className="text-gray-500 mb-4">{profile?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600 uppercase tracking-wider">{profile?.preferredStream || 'No Stream Set'}</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600 uppercase tracking-wider">{profile?.city || 'City Not Set'}</span>
            </div>
          </div>
          <Link href="/profile" className="p-4 bg-gray-50 rounded-2xl hover:bg-primary/5 transition-colors group">
            <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors" />
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="bg-primary rounded-[2rem] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <BarChart className="h-24 w-24" />
          </div>
          <h3 className="text-xl font-bold mb-6">Quick Stats</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-primary-foreground/70 font-medium">Interviews</span>
              <span className="text-2xl font-bold">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-primary-foreground/70 font-medium">Matches</span>
              <span className="text-2xl font-bold">0</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <Link href="/interview" className="block text-center py-3 bg-white text-primary font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-black/10">
                Start New Interview
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Link href="/interview" className="group">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all h-full">
            <div className="bg-green-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <GraduationCap className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">AI College Interview</h3>
            <p className="text-gray-500 leading-relaxed">Answer a few questions and let our AI suggest the best colleges for you based on current trends.</p>
          </div>
        </Link>

        <Link href="/history" className="group">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all h-full">
            <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <History className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">History</h3>
            <p className="text-gray-500 leading-relaxed">View your past interview sessions and track how your suggestions evolve with updated data.</p>
          </div>
        </Link>

        <div className="bg-gray-900 p-8 rounded-[2rem] border border-gray-800 shadow-sm relative overflow-hidden h-full flex flex-col justify-between">
          <div className="relative z-10">
            <div className="bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <Star className="h-7 w-7 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Expert Counseling</h3>
            <p className="text-gray-400 leading-relaxed">Need human touch? Connect with our experts for a personalized 1-on-1 session.</p>
          </div>
          <Link href="/contact" className="mt-8 text-primary font-bold flex items-center relative z-10 group">
            Get Expert Help <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <div className="absolute bottom-0 right-0 p-4 opacity-5">
            <BookOpen className="h-32 w-32 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
