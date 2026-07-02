'use client';
import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FileEdit, Loader2, Sparkles, Download, CheckCircle2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import PageTransition from '@/components/3D/PageTransition';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function SOPGeneratorPage() {
  const { user, profile } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [loading, setLoading] = useState(false);
  const [sopData, setSopData] = useState<string>('');
  const [error, setError] = useState('');
  const sopRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    course: 'M.S. in Computer Science',
    university: 'Stanford University',
    background: 'B.Tech in Information Technology with 8.5 CGPA from XYZ University. Completed internships at TechCorp.',
    goals: 'Short term: Work as an AI researcher. Long term: Lead an AI research lab.',
    whyThisUniversity: 'The excellent AI curriculum and Professor Smith\'s research in deep learning align perfectly with my interests.'
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/generate-sop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) throw new Error('Failed to generate SOP');
      const data = await res.json();
      setSopData(data.markdown);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    const element = sopRef.current;
    if (!element) return;

    try {
      // Create canvas with a higher scale for better resolution
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${formData.fullName.replace(/\s+/g, '_')}_SOP.pdf`);
    } catch (err) {
      console.error('Error generating PDF', err);
    }
  };

  return (
    <PageTransition>
      <div className={`min-h-screen p-6 pb-24 ${isDark ? 'bg-[#05071a] text-white' : 'bg-[#f8f7ff] text-gray-900'}`}>
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-400 dark:to-red-400">
              AI SOP Generator
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg max-w-2xl mx-auto`}>
              Draft a compelling Statement of Purpose tailored to your dream university.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className={`p-8 rounded-3xl border shadow-xl h-fit ${
              isDark ? 'bg-slate-900/60 border-orange-900/20 backdrop-blur-xl' : 'bg-white border-orange-100'
            }`}>
              <form onSubmit={handleGenerate} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-sm font-semibold border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Full Name</label>
                    <input name="fullName" value={formData.fullName} onChange={handleChange} required className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'}`} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Target Course</label>
                      <input name="course" value={formData.course} onChange={handleChange} required className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'}`} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Target University</label>
                      <input name="university" value={formData.university} onChange={handleChange} required className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'}`} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Academic & Professional Background</label>
                    <textarea name="background" rows={3} value={formData.background} onChange={handleChange} required className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'}`} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Short & Long Term Goals</label>
                    <textarea name="goals" rows={3} value={formData.goals} onChange={handleChange} required className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'}`} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Why this university?</label>
                    <textarea name="whyThisUniversity" rows={3} value={formData.whyThisUniversity} onChange={handleChange} required className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'}`} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.01] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                  {loading ? 'Drafting SOP...' : 'Generate SOP'}
                </button>
              </form>
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              {sopData ? (
                <>
                  <div className="flex justify-between items-center bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="text-orange-700 dark:text-orange-400 font-bold flex items-center gap-2">
                      <CheckCircle2 size={18} /> SOP Generated
                    </div>
                    <button 
                      onClick={downloadPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
                    >
                      <Download size={16} /> Download PDF
                    </button>
                  </div>
                  
                  {/* Actual SOP Container */}
                  <div className="bg-slate-100 p-4 rounded-xl overflow-hidden border border-slate-300">
                    <div 
                      ref={sopRef} 
                      className="bg-white text-black p-10 md:p-14 shadow-sm font-serif"
                      style={{ width: '100%', minHeight: '800px', lineHeight: '1.8' }}
                    >
                      <div className="text-center mb-10">
                        <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">Statement of Purpose</h1>
                        <h2 className="text-lg text-gray-700">{formData.fullName}</h2>
                        <h3 className="text-md text-gray-500">{formData.course} - {formData.university}</h3>
                      </div>

                      <div className="space-y-6 text-gray-800 text-justify">
                        {sopData.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className="indent-8">
                            {paragraph.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '')}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className={`h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed ${
                  isDark ? 'border-orange-900/50 bg-slate-900/30 text-gray-500' : 'border-orange-200 bg-orange-50/50 text-gray-400'
                }`}>
                  <FileEdit size={64} className="mb-4 opacity-50" />
                  <p className="text-lg">Your generated SOP will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
