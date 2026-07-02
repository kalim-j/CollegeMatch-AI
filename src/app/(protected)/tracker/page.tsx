'use client';
import { useState } from 'react';
import { useApplicationTracker, ApplicationItem } from '@/hooks/useApplicationTracker';
import { ClipboardList, Plus, Search, CheckCircle2, Clock, XCircle, AlertCircle, Trash2, Edit2, Loader2, Calendar } from 'lucide-react';
import { useTheme } from 'next-themes';
import PageTransition from '@/components/3D/PageTransition';
import SelectField from '@/components/SelectField';

export default function TrackerPage() {
  const { applications, loading, saveApplication, removeApplication } = useApplicationTracker();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<ApplicationItem | null>(null);

  const STATUS_COLORS = {
    'Planning': 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    'Applied': 'text-blue-500 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'Under Review': 'text-amber-500 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    'Accepted': 'text-green-500 bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    'Rejected': 'text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted': return <CheckCircle2 size={16} />;
      case 'Under Review': return <Clock size={16} />;
      case 'Rejected': return <XCircle size={16} />;
      case 'Planning': return <AlertCircle size={16} />;
      default: return <CheckCircle2 size={16} />;
    }
  };

  const openModal = (app?: ApplicationItem) => {
    if (app) {
      setEditingApp(app);
    } else {
      setEditingApp({
        id: Date.now().toString(),
        name: '',
        status: 'Planning',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp || !editingApp.name.trim()) return;
    
    await saveApplication({
      ...editingApp,
      appliedDate: editingApp.status !== 'Planning' && !editingApp.appliedDate 
        ? new Date().toISOString().split('T')[0] 
        : editingApp.appliedDate
    });
    
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#05071a]' : 'bg-[#f8f7ff]'}`}>
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className={`min-h-screen p-6 pb-24 relative ${isDark ? 'bg-[#05071a] text-white' : 'bg-[#f8f7ff] text-gray-900'}`}>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-black flex items-center justify-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              <ClipboardList className="text-blue-500" size={40} /> Application Tracker
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg max-w-2xl mx-auto`}>
              Keep track of where you've applied, their current status, and important deadlines.
            </p>
          </div>

          <div className="flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur border border-purple-100 dark:border-purple-900/20 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Total Applications: {applications.length}
            </div>
            <button 
              onClick={() => openModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              <Plus size={18} /> Add New
            </button>
          </div>

          {applications.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl border shadow-xl ${
              isDark ? 'bg-slate-900/60 border-purple-900/20 backdrop-blur-xl' : 'bg-white border-purple-100'
            }`}>
              <div className="w-24 h-24 mx-auto mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                <Search className="w-10 h-10 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold mb-3">No applications tracked yet</h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                Start by adding your first college application to track its status.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((app) => (
                <div key={app.id} className={`p-6 rounded-3xl border shadow-xl transition-all hover:scale-[1.02] ${
                  isDark ? 'bg-slate-900/60 border-purple-900/20 backdrop-blur-xl' : 'bg-white border-purple-100'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold line-clamp-2 pr-4">{app.name}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => openModal(app)} className="text-gray-400 hover:text-blue-500 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => removeApplication(app.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[app.status]}`}>
                    {getStatusIcon(app.status)} {app.status}
                  </div>

                  <div className="mt-6 space-y-3">
                    {app.appliedDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar size={14} /> Applied: {new Date(app.appliedDate).toLocaleDateString()}
                      </div>
                    )}
                    {app.notes && (
                      <div className={`p-3 rounded-xl text-sm ${isDark ? 'bg-slate-800/50 text-gray-300' : 'bg-slate-50 text-gray-600'}`}>
                        {app.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isModalOpen && editingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl ${
              isDark ? 'bg-slate-900 border-purple-900/30 text-white' : 'bg-white border-purple-100 text-gray-900'
            }`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Track Application</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <XCircle size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">College Name</label>
                  <input 
                    type="text" 
                    value={editingApp.name}
                    onChange={e => setEditingApp({...editingApp, name: e.target.value})}
                    placeholder="e.g. Anna University"
                    required
                    className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'
                    }`}
                  />
                </div>

                <SelectField
                  label="Status"
                  value={editingApp.status}
                  onChange={(val: any) => setEditingApp({...editingApp, status: val})}
                  options={[
                    { label: 'Planning', value: 'Planning' },
                    { label: 'Applied', value: 'Applied' },
                    { label: 'Under Review', value: 'Under Review' },
                    { label: 'Accepted', value: 'Accepted' },
                    { label: 'Rejected', value: 'Rejected' },
                  ]}
                />

                {editingApp.status !== 'Planning' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Applied Date</label>
                    <input 
                      type="date" 
                      value={editingApp.appliedDate || ''}
                      onChange={e => setEditingApp({...editingApp, appliedDate: e.target.value})}
                      className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        isDark ? 'bg-slate-800/50 border-slate-700 text-white dark:[color-scheme:dark]' : 'bg-slate-50 border-slate-200 text-gray-900'
                      }`}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</label>
                  <textarea 
                    value={editingApp.notes || ''}
                    onChange={e => setEditingApp({...editingApp, notes: e.target.value})}
                    placeholder="e.g. Need to submit transcripts..."
                    rows={3}
                    className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!editingApp.name.trim()}
                  className="w-full mt-4 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50"
                >
                  Save Application
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
