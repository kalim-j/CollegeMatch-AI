'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function UserAnalytics() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: profiles } = await supabase.from('profiles').select('state, category');
      
      const counts: Record<string, number> = {};
      profiles?.forEach((p) => {
        const state = p.state || 'Unknown';
        counts[state] = (counts[state] || 0) + 1;
      });

      const formatted = Object.keys(counts).map((state) => ({
        name: state,
        users: counts[state],
      }));

      setData(formatted);
      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="h-64 flex items-center justify-center">Loading user analytics...</div>;
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-purple-100 p-6 shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Users by State</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip />
          <Bar dataKey="users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
