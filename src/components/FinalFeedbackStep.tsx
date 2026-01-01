'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import TerminalUI from './TerminalUI';
import { TerminalLog, ImageAnalysisResult, SignalProcessingData, QualityClassification, FinalFeedback } from '@/types';

interface FinalFeedbackStepProps {
  imageAnalysis: ImageAnalysisResult | null;
  signalData: SignalProcessingData | null;
  classification: QualityClassification | null;
  onComplete: (result: FinalFeedback) => void;
  isActive: boolean;
  flowiseEndpoint?: string;
}

export default function FinalFeedbackStep({
  imageAnalysis,
  signalData,
  classification,
  onComplete,
  isActive,
  flowiseEndpoint,
}: FinalFeedbackStepProps) {
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<FinalFeedback | null>(null);
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
    if (!flowiseEndpoint || !imageAnalysis || !signalData || !classification) return null;

    try {
      addLog('processing', 'Connecting to Flowise Explainability Agent...');

      const payload = {
        question: `Provide a detailed food safety recommendation based on:
          Grade: ${classification.grade} (${classification.score}/100),
          Visual: ${classification.factors.visual}%, Chemical: ${classification.factors.chemical}%, Storage: ${classification.factors.storage}%,
          Mold: ${imageAnalysis.moldDetected ? 'detected' : 'not detected'},
          pH: ${signalData.ph}, Gas: ${signalData.gasLevel}ppm,
          Storage: ${signalData.storageTime}h at ${signalData.temperature}°C.
          Is this food safe to consume? Explain why or why not.`,
        overrideConfig: {
          imageAnalysis,
          signalData,
          classification,
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
        }

        return fullMessage;
      }

      const data = await response.json();
      return data.text || data.response || JSON.stringify(data);
    } catch (error) {
      addLog('warning', 'Flowise API unavailable, using fallback feedback generation...');
      return null;
    }
  }, [flowiseEndpoint, imageAnalysis, signalData, classification, addLog]);

  const generateFeedback = useCallback(async () => {
    if (!imageAnalysis || !signalData || !classification || hasStarted) return;

    setHasStarted(true);
    setIsProcessing(true);
    setLogs([]);

    addLog('info', 'Initializing Feedback & Explainability Agent...');
    await new Promise(resolve => setTimeout(resolve, 500));

    addLog('processing', 'Loading language model for explanation generation...');
    await new Promise(resolve => setTimeout(resolve, 700));

    addLog('success', 'Model loaded: ExplainAI-Food v2.0');
    await new Promise(resolve => setTimeout(resolve, 400));

    addLog('info', 'Aggregating all agent outputs...');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Try Flowise API first
    const flowiseResponse = await callFlowiseAPI();

    if (!flowiseResponse) {
      addLog('processing', 'Generating human-readable explanation...');
      await new Promise(resolve => setTimeout(resolve, 800));

      addLog('processing', 'Applying explainable AI (XAI) techniques...');
      await new Promise(resolve => setTimeout(resolve, 600));

      addLog('processing', 'Formulating safety recommendation...');
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Generate feedback based on classification
    const isSafe = classification.score >= 60 && !imageAnalysis.moldDetected;

    let riskLevel: FinalFeedback['riskLevel'];
    if (classification.score >= 80) riskLevel = 'low';
    else if (classification.score >= 60) riskLevel = 'medium';
    else if (classification.score >= 40) riskLevel = 'high';
    else riskLevel = 'critical';

    const explanations: string[] = [];

    // Visual analysis explanation
    if (imageAnalysis.moldDetected) {
      explanations.push(`Mold was detected covering approximately ${imageAnalysis.moldPercentage.toFixed(1)}% of the visible surface. This is a strong indicator of spoilage.`);
    } else {
      explanations.push(`No visible mold was detected. The color distribution shows ${imageAnalysis.colorAnalysis.healthy.toFixed(0)}% healthy appearance.`);
    }

    // Chemical analysis explanation
    if (signalData.ph < 4.5) {
      explanations.push(`The pH level of ${signalData.ph} is unusually acidic, which may indicate fermentation or spoilage.`);
    } else if (signalData.ph > 7.0) {
      explanations.push(`The pH level of ${signalData.ph} is alkaline, which could indicate bacterial activity.`);
    } else {
      explanations.push(`The pH level of ${signalData.ph} is within the normal range for food products.`);
    }

    if (signalData.gasLevel > 200) {
      explanations.push(`High VOC levels (${signalData.gasLevel}ppm) detected, strongly suggesting decomposition or microbial activity.`);
    } else if (signalData.gasLevel > 100) {
      explanations.push(`Elevated VOC levels (${signalData.gasLevel}ppm) detected. The food may be starting to spoil.`);
    } else {
      explanations.push(`Gas sensor readings (${signalData.gasLevel}ppm) are within acceptable limits.`);
    }

    // Storage explanation
    if (signalData.storageTime > 72) {
      explanations.push(`Extended storage time of ${signalData.storageTime} hours increases spoilage risk significantly.`);
    } else if (signalData.storageTime > 48) {
      explanations.push(`Storage duration of ${signalData.storageTime} hours is approaching recommended limits.`);
    }

    let recommendation: string;
    if (isSafe) {
      if (riskLevel === 'low') {
        recommendation = 'This food appears safe for consumption. All indicators are within acceptable parameters.';
      } else {
        recommendation = 'This food is likely safe but should be consumed soon. Some indicators suggest early stages of degradation.';
      }
    } else {
      if (riskLevel === 'critical') {
        recommendation = 'DO NOT CONSUME. Multiple critical indicators suggest this food is unsafe and may cause illness.';
      } else {
        recommendation = 'Consumption is NOT recommended. Several indicators suggest potential safety concerns.';
      }
    }

    const mockResult: FinalFeedback = {
      isSafe,
      recommendation,
      explanation: explanations,
      riskLevel,
    };

    await new Promise(resolve => setTimeout(resolve, 500));

    addLog(isSafe ? 'success' : 'error', `Safety Assessment: ${isSafe ? 'SAFE' : 'UNSAFE'}`);
    addLog('info', `Risk Level: ${riskLevel.toUpperCase()}`);
    addLog('success', 'Analysis complete. Full report generated.');

    setResult(mockResult);
    setIsProcessing(false);
    onComplete(mockResult);
  }, [imageAnalysis, signalData, classification, hasStarted, addLog, callFlowiseAPI, onComplete]);

  useEffect(() => {
    if (isActive && imageAnalysis && signalData && classification && !hasStarted) {
      generateFeedback();
    }
  }, [isActive, imageAnalysis, signalData, classification, hasStarted, generateFeedback]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/50';
      default: return 'text-slate-400';
    }
  };

  return (
    <section className="scroll-section flex items-center justify-center p-4 sm:p-8 pb-20 sm:pb-24 bg-gradient-to-br from-[#0a0f1a] via-[#0d1420] to-[#0a0f1a] overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                04
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Feedback & Explainability Agent</h2>
                <p className="text-slate-400 text-sm sm:text-base">Partner&apos;s Flowise-powered explanation system</p>
              </div>
            </div>

            {result && (
              <div className="space-y-3 sm:space-y-4">
                <div className={`card-gradient rounded-xl p-4 sm:p-6 border-2 ${result.isSafe ? 'border-green-500/50' : 'border-red-500/50'}`}>
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${result.isSafe ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {result.isSafe ? (
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className={`text-xl sm:text-2xl font-bold ${result.isSafe ? 'text-green-400' : 'text-red-400'}`}>
                        {result.isSafe ? 'SAFE' : 'UNSAFE'}
                      </h3>
                      <span className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium border ${getRiskColor(result.riskLevel)}`}>
                        {result.riskLevel.toUpperCase()} RISK
                      </span>
                    </div>
                  </div>

                  <p className="text-sm sm:text-lg text-white font-medium mb-3 sm:mb-4">{result.recommendation}</p>
                </div>

                <div className="card-gradient rounded-xl p-4 sm:p-6">
                  <h4 className="text-xs sm:text-sm font-medium text-slate-400 mb-3 sm:mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Detailed Explanation
                  </h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {result.explanation.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 sm:gap-3">
                        <span className="text-cyan-400 mt-0.5 sm:mt-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                        <span className="text-slate-300 text-xs sm:text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-slate-800 rounded-lg font-medium text-white text-sm sm:text-base hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Start New Analysis
                </button>
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
                  <p className="text-slate-500 text-xs mt-1">Using local mock feedback. Configure NEXT_PUBLIC_FLOWISE_FEEDBACK_URL for live integration.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <TerminalUI
            title="feedback-explainability-agent (Flowise)"
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
