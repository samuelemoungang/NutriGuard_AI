'use client';

import { useState, useRef, useCallback } from 'react';

interface HeroSectionProps {
  onImageUpload: (file: File, preview: string) => void;
  uploadedImage: string | null;
  onStartAnalysis: () => void;
}

export default function HeroSection({ onImageUpload, uploadedImage, onStartAnalysis }: HeroSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="scroll-section flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-[#0a0f1a] via-[#0d1420] to-[#0a0f1a]">
      <div className="max-w-4xl mx-auto text-center mb-6 sm:mb-12">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold gradient-text">NutriGuard AI</h1>
        </div>
        <p className="text-lg sm:text-xl text-slate-400 mb-2">
          AI-Powered Food Safety Assessment
        </p>
        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto px-4">
          Upload an image of your food product and let our multi-agent AI system analyze
          its safety through image analysis, signal processing, and quality classification.
        </p>
      </div>

      <div className="w-full max-w-xl px-4 sm:px-0">
        <div
          className={`upload-zone rounded-2xl p-4 sm:p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging ? 'dragover glow-cyan' : ''
          } ${uploadedImage ? 'border-green-500' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploadedImage ? (
            <div className="space-y-4">
              <img
                src={uploadedImage}
                alt="Uploaded food"
                className="max-h-48 sm:max-h-64 mx-auto rounded-lg shadow-lg"
              />
              <p className="text-green-400 text-sm">Image uploaded successfully!</p>
              <p className="text-slate-500 text-xs">Click to change image</p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-slate-300 mb-2 text-sm sm:text-base">
                Drag and drop your food image here
              </p>
              <p className="text-slate-500 text-xs sm:text-sm">
                or click to browse files
              </p>
              <p className="text-slate-600 text-xs mt-4">
                Supported formats: JPG, PNG, WEBP
              </p>
            </>
          )}
        </div>

        {uploadedImage && (
          <button
            onClick={onStartAnalysis}
            className="mt-4 sm:mt-6 w-full py-3 sm:py-4 px-6 sm:px-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-3 glow-cyan text-sm sm:text-base"
          >
            Start Analysis
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        )}
      </div>

      {/* Step indicators - responsive grid on mobile */}
      <div className="mt-8 sm:mt-16 px-4">
        <div className="hidden sm:flex items-center gap-8 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <span className="text-cyan-400 font-mono">01</span>
            </div>
            <span>Image Analysis</span>
          </div>
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <span className="text-purple-400 font-mono">02</span>
            </div>
            <span>Signal Processing</span>
          </div>
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <span className="text-green-400 font-mono">03</span>
            </div>
            <span>Classification</span>
          </div>
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <span className="text-orange-400 font-mono">04</span>
            </div>
            <span>Feedback</span>
          </div>
        </div>

        {/* Mobile step indicators */}
        <div className="grid grid-cols-4 gap-2 sm:hidden text-xs text-slate-500">
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <span className="text-cyan-400 font-mono text-xs">01</span>
            </div>
            <span className="text-center">Analysis</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <span className="text-purple-400 font-mono text-xs">02</span>
            </div>
            <span className="text-center">Signals</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <span className="text-green-400 font-mono text-xs">03</span>
            </div>
            <span className="text-center">Grade</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <span className="text-orange-400 font-mono text-xs">04</span>
            </div>
            <span className="text-center">Result</span>
          </div>
        </div>
      </div>
    </section>
  );
}
