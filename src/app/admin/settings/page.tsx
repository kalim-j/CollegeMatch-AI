'use client';
import AdminGuard from '@/components/AdminGuard';
import { useState } from 'react';

export default function AdminSettingsPage() {
  const [matchThreshold, setMatchThreshold] = useState(85);
  const [autoVerify, setAutoVerify] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Settings updated successfully!');
    }, 800);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-purple-100 p-6 shadow-lg">
          <h1 className="text-3xl font-black text-gray-900 mb-6">Admin Settings</h1>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                College Match Percentage Threshold ({matchThreshold}%)
              </label>
              <input type="range" min="50" max="100" value={matchThreshold}
                onChange={(e) => setMatchThreshold(Number(e.target.value))}
                className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div>
                <p className="font-bold text-gray-900 text-sm">Auto-Verify Standard Board Marks</p>
                <p className="text-xs text-gray-500">Automatically mark students as verified if API verification matches.</p>
              </div>
              <input type="checkbox" checked={autoVerify} onChange={(e) => setAutoVerify(e.target.checked)}
                className="w-5 h-5 accent-purple-600 cursor-pointer" />
            </div>

            <button type="submit" disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition">
              {saving ? 'Updating...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>
    </AdminGuard>
  );
}
