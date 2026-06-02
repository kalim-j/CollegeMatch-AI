'use client';
import AdminGuard from '@/components/AdminGuard';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      // Fetch 30-day trend data
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });

      const trendData = await Promise.all(
        last30Days.map(async (date) => {
          const { count: users } = await supabase
            .from('profiles')
            .select('id', { count: 'exact' })
            .lte('created_at', `${date}T23:59:59`);

          const { count: preds } = await supabase
            .from('predictions')
            .select('id', { count: 'exact' })
            .gte('created_at', `${date}T00:00:00`)
            .lte('created_at', `${date}T23:59:59`);

          return {
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            users: users || 0,
            predictions: preds || 0,
          };
        })
      );

      setTrends(trendData);
      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          
          <h1 className="text-3xl font-black text-gray-900 mb-8">Analytics & Reports</h1>

          {/* Charts */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 rounded-full border-4 border-purple-200
                border-t-purple-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              
              {/* User Growth Chart */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-purple-100
                p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4">User Growth (30 Days)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{
                        background: 'rgba(255,255,255,0.9)',
                        border: '1px solid rgba(139,92,246,0.2)',
                        borderRadius: '12px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#7c3aed"
                      strokeWidth={3}
                      dot={false}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Predictions Chart */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-purple-100
                p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Predictions</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(255,255,255,0.9)',
                        border: '1px solid rgba(139,92,246,0.2)',
                        borderRadius: '12px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="predictions" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Export Options */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-purple-100
            p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Export Reports</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { title: 'User Report', icon: '📊' },
                { title: 'Predictions Report', icon: '⚡' },
                { title: 'College Analytics', icon: '🏫' },
                { title: 'Verification Stats', icon: '✅' },
              ].map((item, i) => (
                <button key={i}
                  className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50
                    border border-purple-100 hover:shadow-lg hover:-translate-y-1
                    transition-all duration-300 text-center">
                  <p className="text-2xl mb-2">{item.icon}</p>
                  <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">Download CSV</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
