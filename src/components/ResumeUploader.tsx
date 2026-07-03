'use client';

import React, { useState, useCallback } from 'react';
import { UploadCloud, File, X, Loader2 } from 'lucide-react';
import { extractResumeText } from '@/lib/extractResumeText';

interface ResumeUploaderProps {
  onExtract: (text: string) => void;
}

export default function ResumeUploader({ onExtract }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc'].includes(ext || '')) {
      setError('Please upload a PDF or Word document');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    setLoading(true);

    try {
      const text = await extractResumeText(selectedFile);
      onExtract(text);
    } catch (err: any) {
      setError(err.message || 'Error extracting text from file');
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }, []);

  return (
    <div className="w-full">
      {!file ? (
        <div 
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer"
        >
          <input
            type="file"
            id="resume-upload"
            className="hidden"
            accept=".pdf,.docx,.doc"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
            }}
          />
          <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center w-full">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mb-4">
              <UploadCloud size={32} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Drop your resume here</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Supports PDF (.pdf) and Word (.docx) formats</p>
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              or click to browse
            </span>
            <p className="text-xs text-gray-400 mt-4">Max file size: 5MB</p>
          </label>
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <File size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white truncate max-w-[200px]">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
              <Loader2 size={16} className="animate-spin" /> Extracting...
            </div>
          ) : (
            <button 
              onClick={() => setFile(null)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
