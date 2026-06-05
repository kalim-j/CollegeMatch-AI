'use client';
import AdminGuard from '@/components/AdminGuard';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getCountFromServer, collectionGroup } from 'firebase/firestore';
import { collegesDatabase } from '@/data/collegesDatabase';
import Link from 'next/link';
import AdminStats3D from '@/components/3D/AdminStats3D';

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
      let totalUsers = 0;
      let newUsers = 0;
      let predictions = 0;
      let verifications = 0;
      const colleges = collegesDatabase.length || 0;

      try {
        // Total users
        const totalUsersSnap = await getCountFromServer(collection(db, 'users'));
        totalUsers = totalUsersSnap.data().count || 0;
      } catch (error) {
        console.error("Error fetching total users:", error);
      }

      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        // New users today
        const newUsersQuery = query(collection(db, 'users'), where('createdAt', '>=', todayStart));
        const newUsersSnap = await getCountFromServer(newUsersQuery);
        newUsers = newUsersSnap.data().count || 0;
      } catch (error) {
        console.error("Error fetching new users:", error);
      }

      try {
        // Predictions count
        const predictionsSnap = await getCountFromServer(collectionGroup(db, 'sessions'));
        predictions = predictionsSnap.data().count || 0;
      } catch (error) {
        console.error("Error fetching predictions:", error);
      }

      try {
        // Pending verifications
        const verificationsQuery = query(collection(db, 'verifications'), where('status', '==', 'pending'));
        const verificationsSnap = await getCountFromServer(verificationsQuery);
        verifications = verificationsSnap.data().count || 0;
      } catch (error) {
        console.error("Error fetching verifications:", error);
      }

      setStats({
        totalUsers,
        newUsers,
        predictions,
        verifications,
        colleges,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statsFor3D = [
    { label: 'Total Users', value: stats.totalUsers, color: 'blue', hexColor: '#3b82f6', link: '/admin/users' },
    { label: 'New Users Today', value: stats.newUsers, color: 'green', hexColor: '#10b981' },
    { label: 'Predictions Made', value: stats.predictions, color: 'purple', hexColor: '#8b5cf6', link: '/admin/analytics' },
    { label: 'Pending Verifications', value: stats.verifications, color: 'amber', hexColor: '#f59e0b', link: '/admin/verifications' },
    { label: 'Colleges Listed', value: stats.colleges, color: 'pink', hexColor: '#ec4899', link: '/admin/colleges' },
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
            <div className="mb-12">
              <AdminStats3D stats={statsFor3D} />
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
