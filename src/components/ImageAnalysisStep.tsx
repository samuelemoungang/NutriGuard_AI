'use client';

import { useState, useEffect, useCallback } from 'react';
import TerminalUI from './TerminalUI';
import { TerminalLog, ImageAnalysisResult } from '@/types';
import RoboflowWorkflowService from '@/services/roboflowWorkflowService';
import GeminiQualityService, { QualityAnalysisResult } from '@/services/geminiQualityService';

interface ImageAnalysisStepProps {
  uploadedImage: string | null;
  onComplete: (result: ImageAnalysisResult) => void;
  isActive: boolean;
}

export default function ImageAnalysisStep({ uploadedImage, onComplete, isActive }: ImageAnalysisStepProps) {
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [qualityResult, setQualityResult] = useState<QualityAnalysisResult | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [roboflowService] = useState(() => new RoboflowWorkflowService());
  const [geminiService] = useState(() => new GeminiQualityService());

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

      addLog('processing', 'Loading YOLOv8 model...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Check Roboflow configuration
      if (!roboflowService.isConfigured()) {
        const status = roboflowService.getConfigStatus();
        addLog('error', 'Roboflow not configured!');
        addLog('info', '');
        addLog('info', 'Missing configuration:');
        if (!status.apiKey) addLog('warning', '- NEXT_PUBLIC_ROBOFLOW_API_KEY');
        if (!status.workflowUrl) addLog('warning', '- NEXT_PUBLIC_ROBOFLOW_WORKFLOW_URL');
        addLog('info', '');
        addLog('info', 'Add to .env.local:');
        addLog('info', '  NEXT_PUBLIC_ROBOFLOW_API_KEY=your-api-key');
        addLog('info', '  NEXT_PUBLIC_ROBOFLOW_WORKFLOW_URL=https://serverless.roboflow.com/...');
        addLog('info', '');
        addLog('info', 'Then restart the server: npm run dev');
        setIsProcessing(false);
        return;
      }

      addLog('success', 'Roboflow API configured');
      addLog('info', 'Using Roboflow YOLOv8 for food recognition...');
      await new Promise(resolve => setTimeout(resolve, 400));

      const imageBase64 = uploadedImage.includes(',')
        ? uploadedImage
        : `data:image/jpeg;base64,${uploadedImage}`;

      // Phase 2: Analyze with Roboflow
      addLog('processing', 'Sending image to Roboflow workflow...');
      addLog('info', 'Running YOLOv8 object detection...');
      
      const roboflowAnalysis = await roboflowService.analyzeImage(imageBase64);
      
      addLog('success', 'Analysis completed successfully!');
      await new Promise(resolve => setTimeout(resolve, 400));

      // Log results
      addLog('info', `Detected: ${roboflowAnalysis.foodName}`);
      addLog('info', `Category: ${roboflowAnalysis.category}`);
      addLog('info', `Freshness: ${roboflowAnalysis.freshness}`);
      addLog('info', `Confidence: ${(roboflowAnalysis.confidence * 100).toFixed(1)}%`);
      
      if (roboflowAnalysis.allPredictions.length > 1) {
        addLog('info', `Additional detections: ${roboflowAnalysis.allPredictions.length - 1}`);
      }

      const isSpoiled = roboflowAnalysis.freshness === 'spoiled';
      if (isSpoiled) {
        addLog('warning', 'Food appears spoiled - Safety concern!');
      } else {
        addLog('success', 'Food appears fresh');
      }

      // Phase 3: Convert to result format
      addLog('processing', 'Processing analysis results...');
      await new Promise(resolve => setTimeout(resolve, 500));

      const resultData = roboflowService.convertToImageAnalysisResult(roboflowAnalysis, imageBase64);

      addLog('info', `Shelf Life: ${resultData.foodType.shelfLife}`);
      addLog('info', `Storage: ${resultData.foodType.optimalStorage}`);

      // Phase 4: Gemini Quality Analysis
      let geminiQuality: QualityAnalysisResult | null = null;
      
      if (geminiService.isConfigured()) {
        addLog('processing', 'Starting Gemini Vision quality analysis...');
        addLog('info', 'Analyzing freshness, mold, discoloration...');
        
        try {
          geminiQuality = await geminiService.analyzeQuality(imageBase64, roboflowAnalysis.foodName);
          
          addLog('success', 'Gemini quality analysis complete!');
          addLog('info', `Quality: ${geminiQuality.overallQuality.toUpperCase()}`);
          addLog('info', `Freshness Score: ${geminiQuality.freshnessScore}%`);
          addLog('info', `Description: ${geminiQuality.description}`);
          
          if (geminiQuality.moldDetected) {
            addLog('error', '⚠️ MOLD DETECTED!');
          }
          if (geminiQuality.discoloration) {
            addLog('warning', '⚠️ Discoloration detected');
          }
          if (geminiQuality.issues.length > 0) {
            addLog('warning', `Issues: ${geminiQuality.issues.join(', ')}`);
          }
          if (!geminiQuality.safeToEat) {
            addLog('error', '🚫 NOT SAFE TO EAT');
          } else {
            addLog('success', '✅ Safe to consume');
          }
          
          setQualityResult(geminiQuality);
        } catch (geminiError) {
          addLog('warning', `Gemini analysis failed: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}`);
          addLog('info', 'Continuing with Roboflow results only...');
        }
      } else {
        addLog('info', 'Gemini not configured - skipping quality analysis');
        addLog('info', 'Add NEXT_PUBLIC_GEMINI_API_KEY to .env.local for quality analysis');
      }

      // Phase 5: Final Results
      addLog('processing', 'Generating final assessment...');
      await new Promise(resolve => setTimeout(resolve, 400));

      // Combine Roboflow + Gemini results
      const moldDetected = geminiQuality?.moldDetected || resultData.moldDetected;
      const freshnessScore = geminiQuality?.freshnessScore || (resultData.moldDetected ? 30 : 85);
      
      const finalResult: ImageAnalysisResult = {
        foodType: resultData.foodType,
        moldDetected: moldDetected,
        moldPercentage: moldDetected ? (geminiQuality ? 100 - geminiQuality.freshnessScore : 15) : 0,
        dominantColors: resultData.dominantColors,
        colorAnalysis: {
          healthy: geminiQuality ? geminiQuality.freshnessScore : resultData.colorAnalysis.healthy,
          warning: geminiQuality ? (geminiQuality.discoloration ? 30 : 10) : resultData.colorAnalysis.warning,
          danger: geminiQuality ? (geminiQuality.moldDetected ? 40 : 5) : resultData.colorAnalysis.danger,
        },
        confidence: resultData.confidence,
      };

      addLog('info', `Color Analysis - Healthy: ${finalResult.colorAnalysis.healthy.toFixed(1)}%, Warning: ${finalResult.colorAnalysis.warning.toFixed(1)}%, Danger: ${finalResult.colorAnalysis.danger.toFixed(1)}%`);
      addLog('info', `Overall Confidence: ${finalResult.confidence.toFixed(1)}%`);
      addLog(
        finalResult.moldDetected || (geminiQuality && !geminiQuality.safeToEat) ? 'warning' : 'success',
        finalResult.moldDetected || (geminiQuality && !geminiQuality.safeToEat)
          ? 'Potential issues detected. Proceeding to signal processing...'
          : 'Visual analysis looks healthy. Proceeding to signal processing...',
      );

      setResult(finalResult);
      setIsProcessing(false);
      onComplete(finalResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Analysis failed: ${errorMessage}`);
      
      addLog('info', '');
      addLog('warning', 'Troubleshooting:');
      
      if (errorMessage.includes('API key') || errorMessage.includes('401')) {
        addLog('info', '1. Check your API key in .env.local');
        addLog('info', '2. Get key from: https://app.roboflow.com/settings/api');
      } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        addLog('info', '1. Check the workflow URL is correct');
        addLog('info', '2. Verify the workflow exists in Roboflow');
      } else if (errorMessage.includes('workflow')) {
        addLog('info', '1. Check NEXT_PUBLIC_ROBOFLOW_WORKFLOW_URL');
        addLog('info', '2. URL should be like: https://serverless.roboflow.com/...');
      } else {
        addLog('info', '1. Check your internet connection');
        addLog('info', '2. Verify API key and workflow URL');
        addLog('info', '3. Try again in a few seconds');
      }
      
      setIsProcessing(false);
    }
  }, [uploadedImage, hasStarted, addLog, onComplete, roboflowService, geminiService]);

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

                {/* Gemini Quality Results */}
                {qualityResult && (
                  <div className={`rounded-lg p-4 border ${
                    qualityResult.safeToEat 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{qualityResult.safeToEat ? '✅' : '🚫'}</span>
                        <div>
                          <p className="text-white font-bold capitalize">{qualityResult.overallQuality} Quality</p>
                          <p className={`text-sm ${qualityResult.safeToEat ? 'text-green-400' : 'text-red-400'}`}>
                            {qualityResult.safeToEat ? 'Safe to eat' : 'Not safe to eat'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-cyan-400">{qualityResult.freshnessScore}%</p>
                        <p className="text-xs text-slate-500">freshness</p>
                      </div>
                    </div>
                    
                    <p className="text-slate-300 text-sm mb-3">{qualityResult.description}</p>
                    
                    {qualityResult.issues.length > 0 && (
                      <div className="mb-3">
                        <p className="text-slate-500 text-xs mb-1">Issues Detected:</p>
                        <div className="flex flex-wrap gap-1">
                          {qualityResult.issues.map((issue, i) => (
                            <span key={i} className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded">
                              {issue}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {qualityResult.recommendations.length > 0 && (
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Recommendations:</p>
                        <ul className="text-slate-400 text-xs space-y-1">
                          {qualityResult.recommendations.map((rec, i) => (
                            <li key={i}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      {qualityResult.moldDetected && (
                        <span className="bg-red-500/30 text-red-300 text-xs px-2 py-1 rounded flex items-center gap-1">
                          🦠 Mold
                        </span>
                      )}
                      {qualityResult.discoloration && (
                        <span className="bg-yellow-500/30 text-yellow-300 text-xs px-2 py-1 rounded flex items-center gap-1">
                          🎨 Discoloration
                        </span>
                      )}
                    </div>
                  </div>
                )}

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
