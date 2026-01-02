'use client';

import { useState, useEffect, useCallback } from 'react';
import TerminalUI from './TerminalUI';
import { TerminalLog, ImageAnalysisResult, FoodType } from '@/types';
import HuggingFaceService from '@/services/huggingFaceService';

interface ImageAnalysisStepProps {
  uploadedImage: string | null;
  onComplete: (result: ImageAnalysisResult) => void;
  isActive: boolean;
}

export default function ImageAnalysisStep({ uploadedImage, onComplete, isActive }: ImageAnalysisStepProps) {
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [huggingFaceService] = useState(() => new HuggingFaceService());

  const addLog = useCallback((type: TerminalLog['type'], message: string) => {
    setLogs(prev => [...prev, {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: new Date(),
    }]);
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!uploadedImage || hasStarted) return;

    setHasStarted(true);
    setIsProcessing(true);
    setLogs([]);

    try {
      // Phase 1: Initialization
      addLog('info', 'Initializing Image Analysis Agent...');
      await new Promise(resolve => setTimeout(resolve, 500));

      addLog('processing', 'Loading AI vision model...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Check configuration (Hugging Face funziona anche senza API key)
      if (!huggingFaceService.isConfigured()) {
        addLog('error', 'Hugging Face service not available');
        setIsProcessing(false);
        return;
      }

      addLog('success', 'Model loaded: Hugging Face (Free & Open Source)');
      addLog('info', 'Using free tier - no API key required');
      addLog('info', 'Note: Free models may have lower accuracy. For better results, consider using OpenAI Vision.');
      await new Promise(resolve => setTimeout(resolve, 400));

      // Phase 2: Image Analysis
      addLog('processing', 'Analyzing image with Hugging Face AI...');
      await new Promise(resolve => setTimeout(resolve, 600));

      const imageBase64 = uploadedImage.includes(',')
        ? uploadedImage
        : `data:image/jpeg;base64,${uploadedImage}`;

      addLog('info', 'Sending image to Hugging Face API (free)...');
      const analysis = await huggingFaceService.analyzeImage(imageBase64);

      addLog('success', 'Analysis completed!');
      await new Promise(resolve => setTimeout(resolve, 400));

      // Log results
      addLog('info', `Detected: ${analysis.foodName}`);
      addLog('info', `Category: ${analysis.category}`);
      addLog('info', `Freshness: ${analysis.freshness}`);
      addLog('info', `Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
      addLog('info', `Mold Detected: ${analysis.moldDetected ? 'YES' : 'NO'}`);
      
      if (analysis.moldDetected) {
        addLog('warning', `Mold detected - Safety concern!`);
      }

      // Phase 3: Convert to result format
      addLog('processing', 'Processing analysis results...');
      await new Promise(resolve => setTimeout(resolve, 500));

      const resultData = huggingFaceService.convertToImageAnalysisResult(analysis, imageBase64);

      addLog('info', `Shelf Life: ${resultData.foodType.shelfLife}`);
      addLog('info', `Optimal Storage: ${resultData.foodType.optimalStorage}`);
      addLog('info', `Safety: ${analysis.safetyAssessment}`);

      // Phase 4: Quality Analysis Summary
      addLog('processing', 'Generating quality assessment...');
      await new Promise(resolve => setTimeout(resolve, 400));

      const finalResult: ImageAnalysisResult = {
        foodType: resultData.foodType,
        moldDetected: resultData.moldDetected,
        moldPercentage: resultData.moldPercentage,
        dominantColors: resultData.dominantColors,
        colorAnalysis: resultData.colorAnalysis,
        confidence: resultData.confidence,
      };

      addLog('info', `Color Analysis - Healthy: ${finalResult.colorAnalysis.healthy.toFixed(1)}%, Warning: ${finalResult.colorAnalysis.warning.toFixed(1)}%, Danger: ${finalResult.colorAnalysis.danger.toFixed(1)}%`);
      addLog('info', `Overall Confidence: ${finalResult.confidence.toFixed(1)}%`);
      addLog(
        finalResult.moldDetected ? 'warning' : 'success',
        finalResult.moldDetected
          ? 'Potential contamination detected. Proceeding to signal processing...'
          : 'Visual analysis looks healthy. Proceeding to signal processing...',
      );

      setResult(finalResult);
      setIsProcessing(false);
      onComplete(finalResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Analysis failed: ${errorMessage}`);
      
      if (errorMessage.includes('All models failed')) {
        addLog('warning', 'Hugging Face API models are currently unavailable');
        addLog('info', 'Possible reasons:');
        addLog('info', '  - Models are loading (first time use)');
        addLog('info', '  - Rate limit exceeded (free tier)');
        addLog('info', '  - Network connectivity issues');
        addLog('info', '');
        addLog('info', 'Solutions:');
        addLog('info', '  1. Wait 10-20 seconds and try again');
        addLog('info', '  2. Get free API key from https://huggingface.co/settings/tokens');
        addLog('info', '  3. Consider using OpenAI Vision for more reliable results');
      } else {
        addLog('warning', 'Hugging Face service error');
        addLog('info', 'Please try again or check your internet connection');
      }
      
      setIsProcessing(false);
    }
  }, [uploadedImage, hasStarted, addLog, onComplete, huggingFaceService]);

  useEffect(() => {
    if (isActive && uploadedImage && !hasStarted) {
      analyzeImage();
    }
  }, [isActive, uploadedImage, hasStarted, analyzeImage]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fruit': return '🍎';
      case 'vegetable': return '🥬';
      case 'meat': return '🥩';
      case 'dairy': return '🧀';
      case 'grain': return '🍞';
      case 'seafood': return '🐟';
      case 'processed': return '🍕';
      default: return '🍽️';
    }
  };

  return (
    <section className="scroll-section flex items-center justify-center p-4 sm:p-8 pb-20 sm:pb-24 bg-gradient-to-br from-[#0a0f1a] via-[#0d1420] to-[#0a0f1a] overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                01
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Image Analysis Agent</h2>
                <p className="text-slate-400 text-sm sm:text-base">AI-powered food recognition & safety analysis</p>
              </div>
            </div>

            {uploadedImage && (
              <div className="card-gradient rounded-xl p-3 sm:p-4">
                <img
                  src={uploadedImage}
                  alt="Food sample"
                  className="w-full max-h-48 sm:max-h-64 object-contain rounded-lg"
                />
              </div>
            )}

            {result && (
              <div className="card-gradient rounded-xl p-4 sm:p-6 space-y-4">
                {/* Food Type Recognition */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg p-4 border border-cyan-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{getCategoryIcon(result.foodType.category)}</span>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">{result.foodType.name}</h3>
                      <p className="text-cyan-400 text-sm capitalize">{result.foodType.category}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-2xl font-bold text-cyan-400">{result.foodType.confidence}%</p>
                      <p className="text-xs text-slate-500">confidence</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="bg-slate-800/50 rounded p-2">
                      <p className="text-slate-500 text-xs">Shelf Life</p>
                      <p className="text-slate-300">{result.foodType.shelfLife}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded p-2">
                      <p className="text-slate-500 text-xs">Optimal Storage</p>
                      <p className="text-slate-300">{result.foodType.optimalStorage}</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-white">Quality Analysis</h3>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-3 sm:p-4">
                    <p className="text-slate-400 text-xs sm:text-sm">Mold Detection</p>
                    <p className={`text-lg sm:text-xl font-bold ${result.moldDetected ? 'text-red-400' : 'text-green-400'}`}>
                      {result.moldDetected ? 'Detected' : 'Not Detected'}
                    </p>
                    {result.moldDetected && (
                      <p className="text-xs text-slate-500">{result.moldPercentage.toFixed(1)}% coverage</p>
                    )}
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 sm:p-4">
                    <p className="text-slate-400 text-xs sm:text-sm">Confidence</p>
                    <p className="text-lg sm:text-xl font-bold text-cyan-400">{result.confidence.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-slate-400 text-xs sm:text-sm">Color Distribution</p>
                  <div className="flex gap-1 h-3 sm:h-4 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 transition-all"
                      style={{ width: `${result.colorAnalysis.healthy}%` }}
                    />
                    <div
                      className="bg-yellow-500 transition-all"
                      style={{ width: `${result.colorAnalysis.warning}%` }}
                    />
                    <div
                      className="bg-red-500 transition-all"
                      style={{ width: `${result.colorAnalysis.danger}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Healthy: {result.colorAnalysis.healthy.toFixed(1)}%</span>
                    <span>Warning: {result.colorAnalysis.warning.toFixed(1)}%</span>
                    <span>Danger: {result.colorAnalysis.danger.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <TerminalUI
              title="image-analysis-agent.py"
              logs={logs}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
