'use client';
import AdminGuard from '@/components/AdminGuard';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    predictions: 0,
    verifications: 0,
    colleges: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date().toISOString().split('T')[0];

      // Total users
      const { count: totalCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      // New users today
      const { count: newCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('created_at', today);

      // Predictions count
      const { count: predCount } = await supabase
        .from('predictions')
        .select('id', { count: 'exact' });

      // Pending verifications
      const { count: verCount } = await supabase
        .from('verifications')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');

      // Colleges count
      const { count: colCount } = await supabase
        .from('colleges')
        .select('id', { count: 'exact' });

      setStats({
        totalUsers: totalCount || 0,
        newUsers: newCount || 0,
        predictions: predCount || 0,
        verifications: verCount || 0,
        colleges: colCount || 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      color: 'from-blue-400 to-blue-600',
      link: '/admin/users',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'New Users (Today)',
      value: stats.newUsers,
      icon: '🆕',
      color: 'from-green-400 to-green-600',
      bgLight: 'bg-green-50',
    },
    {
      title: 'Predictions Made',
      value: stats.predictions,
      icon: '⚡',
      color: 'from-purple-400 to-purple-600',
      link: '/admin/analytics',
      bgLight: 'bg-purple-50',
    },
    {
      title: 'Pending Verifications',
      value: stats.verifications,
      icon: '✅',
      color: 'from-amber-400 to-amber-600',
      link: '/admin/verifications',
      bgLight: 'bg-amber-50',
    },
    {
      title: 'Colleges Listed',
      value: stats.colleges,
      icon: '🏫',
      color: 'from-pink-400 to-pink-600',
      link: '/admin/colleges',
      bgLight: 'bg-pink-50',
    },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 animate-in fade-in duration-500">
            <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text
              bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-500">Manage users, colleges, and platform analytics</p>
          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {cards.map((card, i) => (
                <Link key={i} href={card.link || '#'}
                  className="group cursor-pointer block"
                  style={{
                    animationDelay: `${i * 80}ms`,
                  }}>
                  <div className={`${card.bgLight} backdrop-blur-xl
                    border border-opacity-20 rounded-2xl p-5
                    hover:shadow-xl transition-all duration-300
                    hover:-translate-y-2 hover:scale-[1.02]`}
                    style={{
                      background: `linear-gradient(135deg, ${card.bgLight}, rgba(255,255,255,0.7))`,
                      boxShadow: '0 8px 32px rgba(139,92,246,0.06)',
                      border: '1px solid rgba(139,92,246,0.2)',
                    }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`text-3xl p-3 rounded-xl
                        bg-gradient-to-br ${card.color} text-white
                        shadow-lg group-hover:scale-110 transition-transform`}>
                        {card.icon}
                      </div>
                      <span className="text-xs font-semibold text-purple-600
                        bg-purple-100 px-2.5 py-1 rounded-full">
                        Today
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-1">{card.title}</p>
                    <h3 className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${card.color}`}>
                      {card.value.toLocaleString()}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-700">
            {[
              { title: 'Manage Users', desc: 'View and manage all user accounts', link: '/admin/users', icon: '👥' },
              { title: 'Verify Profiles', desc: 'Check pending user verifications', link: '/admin/verifications', icon: '✅' },
              { title: 'Manage Colleges', desc: 'Add, edit, or remove colleges', link: '/admin/colleges', icon: '🏫' },
              { title: 'Analytics & Trends', desc: 'View platform usage analytics', link: '/admin/analytics', icon: '📊' },
              { title: 'Generate Reports', desc: 'Create custom reports', link: '/admin/analytics/reports', icon: '📋' },
              { title: 'Settings', desc: 'Configure platform settings', link: '/admin/settings', icon: '⚙️' },
            ].map((action, i) => (
              <Link key={i} href={action.link}
                className="group p-5 rounded-2xl
                  bg-white/70 backdrop-blur-xl
                  border border-purple-100
                  hover:shadow-xl hover:-translate-y-1
                  transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{action.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-purple-600
                      transition">{action.title}</h3>
                    <p className="text-sm text-gray-500">{action.desc}</p>
                  </div>
                  <svg className="w-5 h-5 text-purple-400 group-hover:translate-x-1
                    transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
