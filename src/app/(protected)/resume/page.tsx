'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import PageTransition from '@/components/3D/PageTransition';
import { 
  FileText, Sparkles, Download, ArrowRight, ArrowLeft, 
  Upload, Briefcase, Plus, Trash2, X, Check, FileCheck, Search, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

import { ResumeData, modernTemplate, classicTemplate, minimalTemplate } from '@/lib/resumeTemplates';
import { downloadAsPDF, downloadAsWord } from '@/lib/downloadResume';
import ResumePreview from '@/components/ResumePreview';
import ResumeUploader from '@/components/ResumeUploader';
import AtsScoreGauge from '@/components/AtsScoreGauge';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const emptyResumeData: ResumeData = {
  personal: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    photo: null,
  },
  objective: '',
  education: [{ institution: '', degree: '', field: '', year: '', cgpa: '', achievements: '' }],
  experience: [{ company: '', role: '', duration: '', description: '', achievements: '' }],
  projects: [{ name: '', tech: '', description: '', link: '' }],
  skills: { technical: [], soft: [], languages: [], tools: [] },
  certifications: [{ name: '', issuer: '', year: '' }],
  achievements: '',
  extra_curricular: '',
};

export default function ResumeBuilderPage() {
  const { user, profile } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [mode, setMode] = useState<'build' | 'upload' | 'optimize'>('build');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit'); // For mobile
  
  // Build Mode State
  const [step, setStep] = useState(1);
  const [resumeData, setResumeData] = useState<ResumeData>(emptyResumeData);
  const [template, setTemplate] = useState<'modern' | 'classic' | 'minimal'>('modern');
  const [resumeGenerated, setResumeGenerated] = useState(false);
  const [downloading, setDownloading] = useState<'pdf' | 'word' | null>(null);

  // Upload Mode State
  const [uploadText, setUploadText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Optimize Mode State
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeSource, setResumeSource] = useState<'built' | 'upload' | 'paste'>('built');
  const [pastedResume, setPastedResume] = useState('');
  const [tailorResult, setTailorResult] = useState<any>(null);
  const [isTailoring, setIsTailoring] = useState(false);

  // Load from Firebase on mount
  useEffect(() => {
    const loadDraft = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'resumes', user.uid, 'drafts', 'current');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.resumeData) {
            setResumeData(data.resumeData);
            if (data.template) setTemplate(data.template);
            toast.success('Restored previous draft');
          }
        } else if (profile) {
          // Pre-fill from profile
          setResumeData(prev => ({
            ...prev,
            personal: { ...prev.personal, fullName: profile.fullName || '', email: user.email || '' }
          }));
        }
      } catch (err) {
        console.error('Error loading draft', err);
      }
    };
    loadDraft();
  }, [user, profile]);

  // Auto-save to Firebase
  const debouncedData = useDebounce(resumeData, 30000);
  useEffect(() => {
    const saveDraft = async () => {
      if (!user || !debouncedData.personal.fullName) return;
      try {
        await setDoc(doc(db, 'resumes', user.uid, 'drafts', 'current'), {
          resumeData: debouncedData,
          template,
          updatedAt: serverTimestamp(),
        });
        toast('Draft saved automatically');
      } catch (err) {
        console.error('Error saving draft', err);
      }
    };
    saveDraft();
  }, [debouncedData, template, user]);

  // Real-time preview update
  const fastDebouncedData = useDebounce(resumeData, 500);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'build' && (fastDebouncedData.personal.fullName || resumeGenerated)) {
      updatePreview(fastDebouncedData, template);
    }
  }, [fastDebouncedData, template, mode, resumeGenerated]);

  const updatePreview = (data: ResumeData, tpl: string) => {
    let html = '';
    if (tpl === 'modern') html = modernTemplate(data);
    else if (tpl === 'classic') html = classicTemplate(data);
    else if (tpl === 'minimal') html = minimalTemplate(data);
    setPreviewHtml(html);
  };

  const handleGenerate = () => {
    setResumeGenerated(true);
    updatePreview(resumeData, template);
    setActiveTab('preview');
    toast.success('Resume generated successfully');
  };

  const handleDownloadPDF = async () => {
    setDownloading('pdf');
    try {
      await downloadAsPDF('resume-preview', resumeData.personal.fullName || 'resume');
    } catch (err) {
      toast.error('Failed to download PDF');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadWord = async () => {
    setDownloading('word');
    try {
      await downloadAsWord(resumeData, resumeData.personal.fullName || 'resume');
    } catch (err) {
      toast.error('Failed to download Word file');
    } finally {
      setDownloading(null);
    }
  };

  const handleAnalyzeResume = async (text: string) => {
    setUploadText(text);
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || 'Analysis failed with status ' + res.status);
      }
      const data = await res.json();
      setAnalysisResult(data);
      // We can preview the improved text if it's basic HTML, but the API returns text.
      // For now, we'll format it basically in the preview.
      const formatted = `<div style="font-family:Arial,sans-serif;padding:40px;line-height:1.6;white-space:pre-wrap;">${data.improved_resume}</div>`;
      setPreviewHtml(formatted);
      toast.success('Analysis complete');
    } catch (err: any) {
      toast.error(err.message || 'Failed to analyze resume');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTailorResume = async () => {
    if (!jobDescription || jobDescription.length < 50) {
      toast.error('Please provide a detailed job description');
      return;
    }
    
    let sourceText = '';
    if (resumeSource === 'built') {
      sourceText = JSON.stringify(resumeData);
    } else if (resumeSource === 'paste') {
      sourceText = pastedResume;
    } else if (resumeSource === 'upload') {
      sourceText = uploadText;
    }

    if (!sourceText) {
      toast.error('Please provide your resume source');
      return;
    }

    setIsTailoring(true);
    try {
      const res = await fetch('/api/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: sourceText, jobDescription, jobTitle, company }),
      });
      if (!res.ok) throw new Error('Tailoring failed');
      const data = await res.json();
      setTailorResult(data);
      const formatted = `<div style="font-family:Arial,sans-serif;padding:40px;line-height:1.6;white-space:pre-wrap;">${data.tailored_resume}</div>`;
      setPreviewHtml(formatted);
      toast.success('Resume tailored successfully');
    } catch (err) {
      toast.error('Failed to tailor resume');
    } finally {
      setIsTailoring(false);
    }
  };

  // Build Mode Form Handlers
  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeData({ ...resumeData, personal: { ...resumeData.personal, [e.target.name]: e.target.value } });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResumeData({ ...resumeData, personal: { ...resumeData.personal, photo: reader.result as string } });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateArrayField = (section: 'education' | 'experience' | 'projects' | 'certifications', index: number, field: string, value: string) => {
    const newArr = [...resumeData[section]] as any[];
    newArr[index] = { ...newArr[index], [field]: value };
    setResumeData({ ...resumeData, [section]: newArr });
  };

  const addArrayItem = (section: 'education' | 'experience' | 'projects' | 'certifications', emptyObj: any) => {
    setResumeData({ ...resumeData, [section]: [...resumeData[section], emptyObj] });
  };

  const removeArrayItem = (section: 'education' | 'experience' | 'projects' | 'certifications', index: number) => {
    const newArr = [...resumeData[section]];
    newArr.splice(index, 1);
    setResumeData({ ...resumeData, [section]: newArr });
  };

  const handleSkillAdd = (category: keyof typeof resumeData.skills, value: string) => {
    if (!value.trim()) return;
    setResumeData({
      ...resumeData,
      skills: { ...resumeData.skills, [category]: [...resumeData.skills[category], value.trim()] }
    });
  };

  const handleSkillRemove = (category: keyof typeof resumeData.skills, index: number) => {
    const newArr = [...resumeData.skills[category]];
    newArr.splice(index, 1);
    setResumeData({
      ...resumeData,
      skills: { ...resumeData.skills, [category]: newArr }
    });
  };

  const renderBuildStep = () => {
    switch (step) {
      case 1: return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-xl font-bold border-b pb-2 mb-4 dark:border-slate-700">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name*</label>
              <input name="fullName" value={resumeData.personal.fullName} onChange={handlePersonalChange} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address*</label>
              <input name="email" value={resumeData.personal.email} onChange={handlePersonalChange} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
              <input name="phone" value={resumeData.personal.phone} onChange={handlePersonalChange} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="+1 234 567 890" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City / Location</label>
              <input name="location" value={resumeData.personal.location} onChange={handlePersonalChange} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="San Francisco, CA" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">LinkedIn URL</label>
              <input name="linkedin" value={resumeData.personal.linkedin} onChange={handlePersonalChange} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="linkedin.com/in/johndoe" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">GitHub / Portfolio</label>
              <input name="github" value={resumeData.personal.github} onChange={handlePersonalChange} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="github.com/johndoe" />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Objective / Summary</label>
            <textarea value={resumeData.objective} onChange={e => setResumeData({...resumeData, objective: e.target.value})} rows={3} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="Brief summary of your professional goals and background..." />
          </div>

          <div className="mt-4">
             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Profile Photo (Optional)</label>
             <div className="flex items-center gap-4">
               {resumeData.personal.photo ? (
                 <div className="relative">
                   <img src={resumeData.personal.photo} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500" />
                   <button onClick={() => setResumeData({...resumeData, personal: {...resumeData.personal, photo: null}})} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
                 </div>
               ) : (
                 <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center border-2 border-dashed border-gray-400">
                   <Upload size={20} className="text-gray-400"/>
                 </div>
               )}
               <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-sm" />
             </div>
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-xl font-bold border-b pb-2 mb-4 dark:border-slate-700">Education</h2>
          {resumeData.education.map((edu, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 relative">
              {idx > 0 && (
                <button onClick={() => removeArrayItem('education', idx)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Institution Name*</label>
                  <input value={edu.institution} onChange={(e) => updateArrayField('education', idx, 'institution', e.target.value)} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} placeholder="University of Technology" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Degree*</label>
                  <input value={edu.degree} onChange={(e) => updateArrayField('education', idx, 'degree', e.target.value)} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} placeholder="B.Tech" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Field of Study*</label>
                  <input value={edu.field} onChange={(e) => updateArrayField('education', idx, 'field', e.target.value)} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} placeholder="Computer Science" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Year of Passing*</label>
                  <input value={edu.year} onChange={(e) => updateArrayField('education', idx, 'year', e.target.value)} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} placeholder="2024" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CGPA / Percentage</label>
                  <input value={edu.cgpa} onChange={(e) => updateArrayField('education', idx, 'cgpa', e.target.value)} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} placeholder="8.5 or 85%" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Key Achievement (Optional)</label>
                  <input value={edu.achievements} onChange={(e) => updateArrayField('education', idx, 'achievements', e.target.value)} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} placeholder="Dean's List" />
                </div>
              </div>
            </div>
          ))}
          <button 
            onClick={() => addArrayItem('education', { institution: '', degree: '', field: '', year: '', cgpa: '', achievements: '' })}
            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            <Plus size={16} /> Add another education
          </button>
        </div>
      );
      case 3: return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
          
          <div>
            <h2 className="text-xl font-bold border-b pb-2 mb-4 dark:border-slate-700">Work Experience</h2>
            <p className="text-sm text-gray-500 mb-4">No experience? Add internships, part-time, or freelance work.</p>
            {resumeData.experience.map((exp, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 relative mb-4">
                <button onClick={() => removeArrayItem('experience', idx)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Name</label>
                    <input value={exp.company} onChange={(e) => updateArrayField('experience', idx, 'company', e.target.value)} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} placeholder="Google" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Job Title / Role</label>
                    <input value={exp.role} onChange={(e) => updateArrayField('experience', idx, 'role', e.target.value)} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} placeholder="Software Engineer" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration</label>
                    <input value={exp.duration} onChange={(e) => updateArrayField('experience', idx, 'duration', e.target.value)} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} placeholder="June 2023 - Present" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                    <textarea value={exp.description} onChange={(e) => updateArrayField('experience', idx, 'description', e.target.value)} rows={3} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} placeholder="Developed and maintained..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Key Achievement (Quantified)</label>
                    <input value={exp.achievements} onChange={(e) => updateArrayField('experience', idx, 'achievements', e.target.value)} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} placeholder="Increased performance by 30%" />
                  </div>
                </div>
              </div>
            ))}
            <button 
              onClick={() => addArrayItem('experience', { company: '', role: '', duration: '', description: '', achievements: '' })}
              className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Plus size={16} /> Add Experience
            </button>
          </div>

          <div>
            <h2 className="text-xl font-bold border-b pb-2 mb-4 dark:border-slate-700">Projects</h2>
            <p className="text-sm text-gray-500 mb-4">Highlight your best 2-3 projects.</p>
            {resumeData.projects.map((proj, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 relative mb-4">
                <button onClick={() => removeArrayItem('projects', idx)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project Name</label>
                    <input value={proj.name} onChange={(e) => updateArrayField('projects', idx, 'name', e.target.value)} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} placeholder="E-commerce Store" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Technologies Used</label>
                    <input value={proj.tech} onChange={(e) => updateArrayField('projects', idx, 'tech', e.target.value)} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} placeholder="React, Node.js, MongoDB" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">GitHub / Demo Link</label>
                    <input value={proj.link} onChange={(e) => updateArrayField('projects', idx, 'link', e.target.value)} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} placeholder="https://github.com/..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                    <textarea value={proj.description} onChange={(e) => updateArrayField('projects', idx, 'description', e.target.value)} rows={2} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} placeholder="Built a full-stack e-commerce app..." />
                  </div>
                </div>
              </div>
            ))}
            <button 
              onClick={() => addArrayItem('projects', { name: '', tech: '', description: '', link: '' })}
              className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Plus size={16} /> Add Project
            </button>
          </div>
        </div>
      );
      case 4: 
        const renderSkillInput = (title: string, category: keyof typeof resumeData.skills, suggestions: string[]) => (
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {resumeData.skills[category].map((skill, idx) => (
                <span key={idx} className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  {skill}
                  <button onClick={() => handleSkillRemove(category, idx)} className="hover:text-red-500"><X size={14}/></button>
                </span>
              ))}
            </div>
            <input 
              type="text" 
              placeholder={`Type a skill and press Enter...`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSkillAdd(category, e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`}
            />
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-gray-500 mt-1">Suggestions:</span>
              {suggestions.filter(s => !resumeData.skills[category].includes(s)).map((s, i) => (
                <button key={i} onClick={() => handleSkillAdd(category, s)} className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-gray-600 dark:text-gray-300 transition-colors">
                  + {s}
                </button>
              ))}
            </div>
          </div>
        );

        return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-xl font-bold border-b pb-2 mb-4 dark:border-slate-700">Skills & Extras</h2>
          
          {renderSkillInput('Technical Skills', 'technical', ['Python', 'JavaScript', 'React', 'Java', 'SQL', 'C++', 'Machine Learning', 'Data Analysis'])}
          {renderSkillInput('Soft Skills', 'soft', ['Leadership', 'Teamwork', 'Communication', 'Problem Solving', 'Time Management'])}
          {renderSkillInput('Languages', 'languages', ['English', 'Spanish', 'French', 'Hindi', 'Tamil'])}
          {renderSkillInput('Tools & Software', 'tools', ['VS Code', 'Git', 'Figma', 'Excel', 'Photoshop'])}

          <div className="mt-8">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4">Certifications</h3>
            {resumeData.certifications.map((cert, idx) => (
              <div key={idx} className="flex gap-2 mb-2 relative">
                <input value={cert.name} onChange={e => updateArrayField('certifications', idx, 'name', e.target.value)} placeholder="Certification Name" className={`flex-1 p-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} />
                <input value={cert.issuer} onChange={e => updateArrayField('certifications', idx, 'issuer', e.target.value)} placeholder="Issuer (e.g. Coursera)" className={`w-32 p-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} />
                <input value={cert.year} onChange={e => updateArrayField('certifications', idx, 'year', e.target.value)} placeholder="Year" className={`w-20 p-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} />
                <button onClick={() => removeArrayItem('certifications', idx)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
              </div>
            ))}
            <button onClick={() => addArrayItem('certifications', {name:'', issuer:'', year:''})} className="text-sm font-bold text-indigo-600 mt-2">+ Add Certification</button>
          </div>

          <div className="mt-8">
            <h3 className="font-bold text-gray-800 dark:text-white mb-2">Extra Curricular / Other Achievements</h3>
            <textarea value={resumeData.achievements} onChange={e => setResumeData({...resumeData, achievements: e.target.value})} rows={3} className={`w-full p-2.5 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} placeholder="Won 1st prize in hackathon..." />
          </div>

        </div>
      );
      case 5: return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center flex flex-col items-center">
          <Check className="w-16 h-16 text-emerald-500 mb-2" />
          <h2 className="text-2xl font-bold dark:text-white">Review & Generate</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            You've completed all the steps. Choose a template style below and generate your professional resume.
          </p>
          
          <div className="grid grid-cols-3 gap-4 w-full mt-6">
            {(['modern', 'classic', 'minimal'] as const).map(tpl => (
              <button 
                key={tpl}
                onClick={() => setTemplate(tpl)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${template === tpl ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-slate-700 hover:border-indigo-300'}`}
              >
                <div className={`w-16 h-20 bg-white border shadow-sm rounded flex flex-col p-1 ${tpl === 'modern' ? 'flex-row' : ''}`}>
                  {tpl === 'modern' && (
                    <>
                      <div className="w-1/3 bg-indigo-500 h-full"></div>
                      <div className="w-2/3 h-full px-1 py-2 flex flex-col gap-1">
                         <div className="h-1 bg-gray-300 w-3/4"></div>
                         <div className="h-1 bg-gray-200 w-full mt-2"></div>
                      </div>
                    </>
                  )}
                  {tpl === 'classic' && (
                     <div className="w-full h-full py-2 flex flex-col items-center gap-1">
                        <div className="h-1 bg-gray-800 w-1/2"></div>
                        <div className="h-px bg-gray-400 w-full mt-1"></div>
                        <div className="h-1 bg-gray-200 w-full mt-1"></div>
                     </div>
                  )}
                  {tpl === 'minimal' && (
                     <div className="w-full h-full py-1 px-1 flex flex-col gap-1">
                        <div className="h-2 bg-gray-800 w-1/2"></div>
                        <div className="h-1 bg-gray-300 w-1/3 mb-1"></div>
                        <div className="h-1 bg-gray-200 w-full"></div>
                        <div className="h-1 bg-gray-200 w-full"></div>
                     </div>
                  )}
                </div>
                <span className="font-bold capitalize text-sm">{tpl}</span>
              </button>
            ))}
          </div>

          <button 
            onClick={handleGenerate}
            className="w-full mt-8 py-4 bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 hover:scale-[1.02] transition-transform text-lg flex items-center justify-center gap-2"
          >
            <Sparkles size={24} /> Generate AI Resume
          </button>
        </div>
      );
    }
  };

  return (
    <PageTransition>
      <div className={`h-screen flex flex-col overflow-hidden bg-transparent ${isDark ? 'text-white' : 'text-gray-900'}`}>
        
        {/* Header */}
        <header className={`shrink-0 flex items-center justify-between px-6 py-4 border-b bg-transparent ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
          <div>
            <h1 className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-teal-500">
              AI Resume Builder
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Build, upload, analyze and optimize your resume with AI</p>
          </div>
          
          <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
            <button onClick={() => {setMode('build'); setActiveTab('edit')}} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors ${mode === 'build' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Build from scratch</button>
            <button onClick={() => {setMode('upload'); setActiveTab('edit')}} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors ${mode === 'upload' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Upload & improve</button>
            <button onClick={() => {setMode('optimize'); setActiveTab('edit')}} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors ${mode === 'optimize' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Optimize for job</button>
          </div>
        </header>

        {/* Mobile Tab Switcher */}
        <div className="md:hidden flex bg-transparent border-b border-gray-200 dark:border-slate-800 px-4">
          <button onClick={() => setActiveTab('edit')} className={`flex-1 py-3 text-sm font-bold border-b-2 ${activeTab === 'edit' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'}`}>Edit</button>
          <button onClick={() => setActiveTab('preview')} className={`flex-1 py-3 text-sm font-bold border-b-2 ${activeTab === 'preview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'}`}>Preview</button>
        </div>

        {/* Split Panel Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Panel */}
          <div className={`${activeTab === 'edit' ? 'flex' : 'hidden'} md:flex w-full md:w-[40%] flex-col border-r bg-transparent ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
            
            {/* Panel Header */}
            <div className={`p-6 border-b shrink-0 ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                {mode === 'build' && 'Your details'}
                {mode === 'upload' && 'Upload your resume'}
                {mode === 'optimize' && 'Job description'}
              </h2>
              
              {mode === 'build' && (
                <div className="flex items-center justify-between mt-4">
                  {[1, 2, 3, 4, 5].map(s => (
                    <div key={s} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === s ? 'bg-indigo-600 text-white' : step > s ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
                        {step > s ? <Check size={14}/> : s}
                      </div>
                      {s < 5 && <div className={`w-4 sm:w-8 h-1 rounded ${step > s ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-gray-100 dark:bg-slate-800'}`}></div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {mode === 'build' && renderBuildStep()}
              
              {mode === 'upload' && (
                <div className="space-y-6">
                  <ResumeUploader onExtract={handleAnalyzeResume} />
                  
                  {isAnalyzing && (
                    <div className="flex flex-col items-center justify-center py-12 text-indigo-500">
                      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                      <p className="font-semibold">AI is analyzing your resume...</p>
                    </div>
                  )}

                  {analysisResult && !isAnalyzing && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                       <div className="flex justify-center mb-6">
                          <AtsScoreGauge score={analysisResult.ats_score} />
                       </div>
                       
                       <p className="text-gray-700 dark:text-gray-300 text-center mb-8 text-sm italic">"{analysisResult.summary}"</p>

                       <div className="space-y-6">
                         <div>
                           <h3 className="font-bold text-gray-900 dark:text-white border-b pb-2 mb-3">Key Issues Found</h3>
                           {analysisResult.issues?.map((issue: any, i: number) => (
                             <div key={i} className="mb-3 p-3 rounded-lg border border-red-100 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10">
                               <div className="flex justify-between items-start mb-1">
                                 <span className="text-xs font-bold uppercase text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">{issue.category}</span>
                               </div>
                               <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{issue.issue}</p>
                               <p className="text-sm text-gray-600 dark:text-gray-400 mt-1"><span className="font-semibold">Fix:</span> {issue.fix}</p>
                             </div>
                           ))}
                         </div>
                         
                         <button onClick={() => setActiveTab('preview')} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
                           View improved resume <ArrowRight size={18} />
                         </button>
                       </div>
                    </div>
                  )}
                </div>
              )}

              {mode === 'optimize' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white mb-2">Job Details</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Job Title (e.g. Frontend Engineer)" className={`p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'}`} />
                      <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company Name" className={`p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'}`} />
                    </div>
                    <textarea 
                      value={jobDescription} 
                      onChange={e => setJobDescription(e.target.value)} 
                      rows={6} 
                      placeholder="Paste the full job description here..."
                      className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'}`}
                    />
                    <p className="text-xs text-gray-500 text-right mt-1">{jobDescription.length} characters</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white mb-2">Resume Source</h3>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="source" checked={resumeSource === 'built'} onChange={() => setResumeSource('built')} className="text-indigo-600" />
                        <span className="text-sm">Built resume</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="source" checked={resumeSource === 'upload'} onChange={() => setResumeSource('upload')} className="text-indigo-600" />
                        <span className="text-sm">Upload</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="source" checked={resumeSource === 'paste'} onChange={() => setResumeSource('paste')} className="text-indigo-600" />
                        <span className="text-sm">Paste text</span>
                      </label>
                    </div>
                  </div>

                  {resumeSource === 'upload' && <ResumeUploader onExtract={(t) => setUploadText(t)} />}
                  {resumeSource === 'paste' && (
                    <textarea 
                      value={pastedResume} 
                      onChange={e => setPastedResume(e.target.value)} 
                      rows={4} 
                      placeholder="Paste your current resume text here..."
                      className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'}`}
                    />
                  )}

                  <button 
                    onClick={handleTailorResume}
                    disabled={isTailoring}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {isTailoring ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Sparkles size={20}/>}
                    {isTailoring ? 'Tailoring...' : 'Tailor my resume →'}
                  </button>

                  {tailorResult && !isTailoring && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 mt-8 space-y-6">
                      <div className="flex items-center justify-center gap-8">
                        <div className="text-center">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Before</p>
                          <div className="text-2xl font-black text-amber-500">{tailorResult.match_score_before}%</div>
                        </div>
                        <ArrowRight className="text-gray-400" />
                        <div className="text-center">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">After</p>
                          <div className="text-3xl font-black text-emerald-500">{tailorResult.match_score_after}%</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm mb-2">Keywords Added</h4>
                        <div className="flex flex-wrap gap-2">
                          {tailorResult.keywords_added?.map((kw: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs font-semibold">+{kw}</span>
                          ))}
                        </div>
                      </div>

                      <button onClick={() => setActiveTab('preview')} className="w-full py-3 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                        View tailored resume
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Panel Footer (Sticky) */}
            <div className={`p-4 border-t shrink-0 flex items-center justify-between gap-3 bg-transparent backdrop-blur-md ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
              {mode === 'build' && (
                <>
                  <button 
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                    className="p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl disabled:opacity-30 transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="flex gap-2 flex-1 justify-center">
                    <button
                      onClick={handleDownloadPDF}
                      disabled={!resumeGenerated || downloading === 'pdf'}
                      className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform text-sm max-w-[160px] flex items-center justify-center gap-2"
                    >
                      {downloading === 'pdf' ? <Loader2 size={16} className="animate-spin"/> : <Download size={16} />} 
                      PDF
                    </button>
                    <button
                      onClick={handleDownloadWord}
                      disabled={!resumeGenerated || downloading === 'word'}
                      className="flex-1 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-sm max-w-[160px] flex items-center justify-center gap-2"
                    >
                      {downloading === 'word' ? <Loader2 size={16} className="animate-spin"/> : <Download size={16} />}
                      Word
                    </button>
                  </div>
                  <button 
                    onClick={() => setStep(Math.min(5, step + 1))}
                    disabled={step === 5}
                    className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-30 transition-colors shadow-md"
                  >
                    <ArrowRight size={20} />
                  </button>
                </>
              )}
              {mode !== 'build' && (
                <div className="w-full flex gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={(!analysisResult && !tailorResult) || downloading === 'pdf'}
                    className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 hover:scale-[1.02] transition-transform text-sm flex items-center justify-center gap-2"
                  >
                    <Download size={16} /> Download PDF
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className={`${activeTab === 'preview' ? 'flex' : 'hidden'} md:flex w-full md:w-[60%] bg-transparent flex-col`}>
             <ResumePreview htmlContent={previewHtml} />
          </div>
        </div>
        
      </div>
    </PageTransition>
  );
}
