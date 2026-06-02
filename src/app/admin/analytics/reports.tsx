'use client';
import { supabase } from '@/lib/supabase';

export default function ReportsGenerator() {
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async (table: string) => {
    const { data, error } = await supabase.from(table).select('*');
    if (error || !data || data.length === 0) {
      alert('No data found to export');
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    downloadCSV(csvContent, `${table}_report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-purple-100 p-6 shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Export Customized Platform Reports</h2>
      <div className="flex flex-wrap gap-4">
        <button onClick={() => handleExport('profiles')}
          className="px-6 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition">
          Export Users (Profiles) CSV
        </button>
        <button onClick={() => handleExport('colleges')}
          className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition">
          Export Colleges CSV
        </button>
      </div>
    </div>
  );
}
