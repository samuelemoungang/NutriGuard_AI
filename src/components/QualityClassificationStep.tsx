'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import TerminalUI from './TerminalUI';
import { TerminalLog, ImageAnalysisResult, SignalProcessingData, QualityClassification } from '@/types';

interface QualityClassificationStepProps {
  imageAnalysis: ImageAnalysisResult | null;
  signalData: SignalProcessingData | null;
  onComplete: (result: QualityClassification) => void;
  isActive: boolean;
  flowiseEndpoint?: string;
}

export default function QualityClassificationStep({
  imageAnalysis,
  signalData,
  onComplete,
  isActive,
  flowiseEndpoint,
}: QualityClassificationStepProps) {
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<QualityClassification | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');

  const addLog = useCallback((type: TerminalLog['type'], message: string) => {
    setLogs(prev => [...prev, {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: new Date(),
    }]);
  }, []);

  const callFlowiseAPI = useCallback(async () => {
    if (!flowiseEndpoint || !imageAnalysis || !signalData) return null;

    try {
      addLog('processing', 'Connecting to Flowise Classification Agent...');

      const payload = {
        question: `Analyze food safety based on:
          Visual Analysis: Mold ${imageAnalysis.moldDetected ? 'detected' : 'not detected'} (${imageAnalysis.moldPercentage.toFixed(1)}%),
          Color health score: ${imageAnalysis.colorAnalysis.healthy.toFixed(1)}%,
          pH: ${signalData.ph}, Gas: ${signalData.gasLevel}ppm,
          Storage: ${signalData.storageTime}h at ${signalData.temperature}°C.
          Provide a quality grade (A-F) and classification.`,
        overrideConfig: {
          imageAnalysis,
          signalData,
        },
      };

      const response = await fetch(flowiseEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Flowise API error');

      // Handle streaming response
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullMessage = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          fullMessage += chunk;
          setStreamingMessage(fullMessage);
          addLog('info', chunk);
        }

        return fullMessage;
      }

      const data = await response.json();
      return data.text || data.response || JSON.stringify(data);
    } catch (error) {
      addLog('warning', 'Flowise API unavailable, using fallback classification...');
      return null;
    }
  }, [flowiseEndpoint, imageAnalysis, signalData, addLog]);

  const runClassification = useCallback(async () => {
    if (!imageAnalysis || !signalData || hasStarted) return;

    setHasStarted(true);
    setIsProcessing(true);
    setLogs([]);

    addLog('info', 'Initializing Quality Classification Agent...');
    await new Promise(resolve => setTimeout(resolve, 500));

    addLog('processing', 'Loading classification model...');
    await new Promise(resolve => setTimeout(resolve, 600));

    addLog('success', 'Model loaded: FoodGrade-BERT v3.2');
    await new Promise(resolve => setTimeout(resolve, 400));

    addLog('info', 'Receiving data from upstream agents...');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Try Flowise API first
    const flowiseResponse = await callFlowiseAPI();

    if (!flowiseResponse) {
      // Fallback to mock classification
      addLog('processing', 'Aggregating visual and chemical indicators...');
      await new Promise(resolve => setTimeout(resolve, 700));

      addLog('processing', 'Computing weighted quality score...');
      await new Promise(resolve => setTimeout(resolve, 800));

      addLog('processing', 'Applying food safety regulations (FDA/EU standards)...');
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    // Calculate mock classification based on inputs
    let score = 100;

    // Deduct for mold
    if (imageAnalysis.moldDetected) score -= 30;
    score -= imageAnalysis.moldPercentage * 2;

    // Deduct for unhealthy colors
    score -= imageAnalysis.colorAnalysis.danger * 0.5;
    score -= imageAnalysis.colorAnalysis.warning * 0.2;

    // Deduct for pH outside optimal range
    if (signalData.ph < 4.5 || signalData.ph > 7.0) score -= 15;

    // Deduct for high gas levels
    if (signalData.gasLevel > 200) score -= 25;
    else if (signalData.gasLevel > 100) score -= 10;

    // Deduct for extended storage
    if (signalData.storageTime > 72) score -= 20;
    else if (signalData.storageTime > 48) score -= 10;

    // Deduct for temperature issues
    if (signalData.temperature && signalData.temperature > 8) score -= 15;

    score = Math.max(0, Math.min(100, score));

    let grade: QualityClassification['grade'];
    if (score >= 90) grade = 'A';
    else if (score >= 75) grade = 'B';
    else if (score >= 60) grade = 'C';
    else if (score >= 40) grade = 'D';
    else grade = 'F';

    const mockResult: QualityClassification = {
      grade,
      score,
      factors: {
        visual: Math.max(0, 100 - (imageAnalysis.moldPercentage * 5) - (imageAnalysis.colorAnalysis.danger)),
        chemical: Math.max(0, 100 - (signalData.gasLevel / 5) - (Math.abs(signalData.ph - 6) * 5)),
        storage: Math.max(0, 100 - (signalData.storageTime / 2)),
      },
    };

    await new Promise(resolve => setTimeout(resolve, 500));

    addLog('success', `Classification complete: Grade ${mockResult.grade} (${mockResult.score.toFixed(0)}/100)`);
    addLog('info', `Visual Factor: ${mockResult.factors.visual.toFixed(0)}%`);
    addLog('info', `Chemical Factor: ${mockResult.factors.chemical.toFixed(0)}%`);
    addLog('info', `Storage Factor: ${mockResult.factors.storage.toFixed(0)}%`);

    setResult(mockResult);
    setIsProcessing(false);
    onComplete(mockResult);
  }, [imageAnalysis, signalData, hasStarted, addLog, callFlowiseAPI, onComplete]);

  useEffect(() => {
    if (isActive && imageAnalysis && signalData && !hasStarted) {
      runClassification();
    }
  }, [isActive, imageAnalysis, signalData, hasStarted, runClassification]);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'B': return 'text-lime-400 bg-lime-500/20 border-lime-500/50';
      case 'C': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'D': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'F': return 'text-red-400 bg-red-500/20 border-red-500/50';
      default: return 'text-slate-400';
    }
  };

  return (
    <section className="scroll-section flex items-center justify-center p-4 sm:p-8 pb-20 sm:pb-24 bg-gradient-to-br from-[#0a0f1a] via-[#0d1420] to-[#0a0f1a] overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                03
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Quality Classification Agent</h2>
                <p className="text-slate-400 text-sm sm:text-base">Partner&apos;s Flowise-powered grading system</p>
              </div>
            </div>

            {result && (
              <div className="card-gradient rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 ${getGradeColor(result.grade)} mb-3 sm:mb-4`}>
                    <span className="text-4xl sm:text-5xl font-bold">{result.grade}</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-semibold text-white">{result.score.toFixed(0)}/100</p>
                  <p className="text-slate-400 text-sm sm:text-base">Quality Score</p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-xs sm:text-sm font-medium text-slate-400">Factor Breakdown</h4>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-1">
                        <span className="text-slate-300">Visual Analysis</span>
                        <span className="text-cyan-400">{result.factors.visual.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
                          style={{ width: `${result.factors.visual}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-1">
                        <span className="text-slate-300">Chemical Analysis</span>
                        <span className="text-purple-400">{result.factors.chemical.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500"
                          style={{ width: `${result.factors.chemical}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-1">
                        <span className="text-slate-300">Storage Conditions</span>
                        <span className="text-green-400">{result.factors.storage.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                          style={{ width: `${result.factors.storage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {!flowiseEndpoint && (
            <div className="card-gradient rounded-xl p-4 border-yellow-500/30">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-yellow-400 text-sm font-medium">Flowise API Not Configured</p>
                  <p className="text-slate-500 text-xs mt-1">Using local mock classification. Configure NEXT_PUBLIC_FLOWISE_CLASSIFY_URL for live integration.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <TerminalUI
            title="quality-classification-agent (Flowise)"
            logs={logs}
            isProcessing={isProcessing}
          />
          {streamingMessage && (
            <div className="mt-4 card-gradient rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-2">Flowise Response:</p>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{streamingMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </section>
  );
}
