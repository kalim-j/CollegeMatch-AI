'use client';

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize, FileText } from 'lucide-react';

interface ResumePreviewProps {
  htmlContent: string | null;
  elementId?: string;
}

export default function ResumePreview({ htmlContent, elementId = 'resume-preview' }: ResumePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.4));
  const handleFit = () => setZoom(1);

  if (!htmlContent) {
    return (
      <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-center text-center p-8 text-gray-400">
        <FileText size={80} className="mb-6 opacity-20" />
        <h3 className="text-xl font-bold mb-2 text-gray-500">Your generated resume will appear here</h3>
        <p className="text-sm max-w-xs">Fill in your details and click Generate to see the preview</p>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-100 dark:bg-gray-900 p-8' : 'w-full h-full min-h-[800px]'}`}>
      
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-300" title="Zoom Out">
          <ZoomOut size={18} />
        </button>
        <button onClick={handleFit} className="px-3 py-1 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-300" title="Fit to Screen">
          {Math.round(zoom * 100)}%
        </button>
        <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-300" title="Zoom In">
          <ZoomIn size={18} />
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)} 
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-300"
          title="Toggle Fullscreen"
        >
          <Maximize size={18} />
        </button>
      </div>

      {/* Resume Container */}
      <div className="flex-1 overflow-auto bg-[#f8f8f8] dark:bg-slate-950 flex justify-center py-12 custom-scrollbar">
        <div 
          className="transition-transform duration-200 origin-top shadow-[0_4px_40px_rgba(0,0,0,0.15)] bg-white"
          style={{ transform: `scale(${zoom})`, width: '794px' }}
        >
          <div 
            id={elementId}
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
          />
        </div>
      </div>
    </div>
  );
}
