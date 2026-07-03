'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ResumePreview from '@/components/ResumePreview';
import { Loader2 } from 'lucide-react';
import PageTransition from '@/components/3D/PageTransition';

export default function SharedResumeView() {
  const params = useParams();
  const shareId = params.shareId as string;
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResume = async () => {
      try {
        if (!shareId) return;
        const docRef = doc(db, 'shared_resumes', shareId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setHtmlContent(docSnap.data().htmlContent);
        } else {
          setError('Resume not found or link has expired.');
        }
      } catch (err) {
        console.error(err);
        setError('Error loading the resume.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResume();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 p-6 text-center">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Oops!</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="h-screen flex flex-col">
        <header className="py-4 px-6 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center shadow-sm z-10 shrink-0">
          <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-teal-500">
            CollegeMatch-AI
          </h1>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-sm hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors"
          >
            Print
          </button>
        </header>
        <div className="flex-1 bg-[#f8f8f8] dark:bg-slate-950 overflow-hidden relative">
          {/* We reuse ResumePreview component but force full view */}
          <ResumePreview htmlContent={htmlContent} />
        </div>
      </div>
    </PageTransition>
  );
}
