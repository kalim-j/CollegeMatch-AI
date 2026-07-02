'use client';
import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FileText, Loader2, Sparkles, Download, CheckCircle2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import PageTransition from '@/components/3D/PageTransition';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ResumeBuilderPage() {
  const { user, profile } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [error, setError] = useState('');
  const resumeRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    email: user?.email || '',
    phone: '',
    objective: 'Looking for an entry-level Software Engineering role...',
    education: 'B.Tech in Computer Science, 8.5 CGPA, 2026',
    experience: 'Intern at TechCorp - Built a React dashboard...',
    skills: 'JavaScript, React, Node.js, Python',
    projects: 'E-commerce App (MERN Stack) - Built a scalable backend...'
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) throw new Error('Failed to generate resume');
      const data = await res.json();
      setResumeData(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    const element = resumeRef.current;
    if (!element) return;

    try {
      // Create canvas with a higher scale for better resolution
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${formData.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
    } catch (err) {
      console.error('Error generating PDF', err);
    }
  };

  return (
    <PageTransition>
      <div className={`min-h-screen p-6 pb-24 ${isDark ? 'bg-[#05071a] text-white' : 'bg-[#f8f7ff] text-gray-900'}`}>
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
              AI Resume Builder
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg max-w-2xl mx-auto`}>
              Generate an ATS-friendly, professional resume in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className={`p-8 rounded-3xl border shadow-xl h-fit ${
              isDark ? 'bg-slate-900/60 border-emerald-900/20 backdrop-blur-xl' : 'bg-white border-emerald-100'
            }`}>
              <form onSubmit={handleGenerate} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-sm font-semibold border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Full Name</label>
                    <input name="fullName" value={formData.fullName} onChange={handleChange} required className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email</label>
                    <input name="email" value={formData.email} onChange={handleChange} required className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'}`} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Phone</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} required className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'}`} />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Objective / Summary</label>
                    <textarea name="objective" rows={2} value={formData.objective} onChange={handleChange} required className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'}`} />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Education</label>
                    <textarea name="education" rows={2} value={formData.education} onChange={handleChange} required className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'}`} />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Experience</label>
                    <textarea name="experience" rows={2} value={formData.experience} onChange={handleChange} required className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'}`} />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Projects</label>
                    <textarea name="projects" rows={2} value={formData.projects} onChange={handleChange} required className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'}`} />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Skills</label>
                    <textarea name="skills" rows={2} value={formData.skills} onChange={handleChange} required className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-gray-900'}`} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.01] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                  {loading ? 'Generating Resume...' : 'Generate Resume'}
                </button>
              </form>
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              {resumeData ? (
                <>
                  <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-2">
                      <CheckCircle2 size={18} /> Resume Generated
                    </div>
                    <button 
                      onClick={downloadPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
                    >
                      <Download size={16} /> Download PDF
                    </button>
                  </div>
                  
                  {/* Actual Resume Container - always white background for standard resume look */}
                  <div className="bg-slate-100 p-4 rounded-xl overflow-hidden border border-slate-300">
                    <div 
                      ref={resumeRef} 
                      className="bg-white text-black p-8 md:p-12 shadow-sm font-sans"
                      style={{ width: '100%', minHeight: '800px' }}
                    >
                      {/* Header */}
                      <div className="text-center mb-8 border-b-2 border-gray-800 pb-6">
                        <h1 className="text-3xl font-serif font-bold uppercase tracking-wider mb-2">{resumeData.personal_info?.name}</h1>
                        <div className="text-sm text-gray-600 flex justify-center gap-4 flex-wrap">
                          <span>{resumeData.personal_info?.email}</span>
                          <span>•</span>
                          <span>{resumeData.personal_info?.phone}</span>
                        </div>
                      </div>

                      {/* Objective */}
                      {resumeData.objective && (
                        <div className="mb-6">
                          <p className="text-gray-800 leading-relaxed text-sm">{resumeData.objective}</p>
                        </div>
                      )}

                      {/* Education */}
                      {resumeData.education && resumeData.education.length > 0 && (
                        <div className="mb-6">
                          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 mb-3 pb-1">Education</h2>
                          <div className="space-y-4">
                            {resumeData.education.map((edu: any, i: number) => (
                              <div key={i}>
                                <div className="flex justify-between font-bold text-gray-900 text-sm">
                                  <span>{edu.institution}</span>
                                  <span>{edu.duration}</span>
                                </div>
                                <div className="text-gray-700 text-sm italic mb-1">{edu.degree}</div>
                                {edu.details && <div className="text-gray-600 text-sm">{edu.details}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Experience */}
                      {resumeData.experience && resumeData.experience.length > 0 && (
                        <div className="mb-6">
                          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 mb-3 pb-1">Experience</h2>
                          <div className="space-y-5">
                            {resumeData.experience.map((exp: any, i: number) => (
                              <div key={i}>
                                <div className="flex justify-between font-bold text-gray-900 text-sm">
                                  <span>{exp.company}</span>
                                  <span>{exp.duration}</span>
                                </div>
                                <div className="text-gray-800 text-sm font-medium mb-2">{exp.role}</div>
                                <ul className="list-disc list-outside ml-4 text-gray-700 text-sm space-y-1">
                                  {exp.description?.map((desc: string, j: number) => (
                                    <li key={j}>{desc}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Projects */}
                      {resumeData.projects && resumeData.projects.length > 0 && (
                        <div className="mb-6">
                          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 mb-3 pb-1">Projects</h2>
                          <div className="space-y-4">
                            {resumeData.projects.map((proj: any, i: number) => (
                              <div key={i}>
                                <div className="font-bold text-gray-900 text-sm mb-1">{proj.name}</div>
                                <ul className="list-disc list-outside ml-4 text-gray-700 text-sm space-y-1">
                                  {proj.description?.map((desc: string, j: number) => (
                                    <li key={j}>{desc}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      {resumeData.skills && resumeData.skills.length > 0 && (
                        <div className="mb-6">
                          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 mb-3 pb-1">Skills</h2>
                          <p className="text-gray-700 text-sm">
                            {resumeData.skills.join(' • ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className={`h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed ${
                  isDark ? 'border-emerald-900/50 bg-slate-900/30 text-gray-500' : 'border-emerald-200 bg-emerald-50/50 text-gray-400'
                }`}>
                  <FileText size={64} className="mb-4 opacity-50" />
                  <p className="text-lg">Your generated resume will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
