'use client';

import { useState, useCallback } from 'react';
import TerminalUI from './TerminalUI';
import { TerminalLog, SignalProcessingData, ImageAnalysisResult } from '@/types';

interface SignalProcessingStepProps {
  imageAnalysis: ImageAnalysisResult | null;
  onComplete: (data: SignalProcessingData) => void;
  isActive: boolean;
}

export default function SignalProcessingStep({ imageAnalysis, onComplete, isActive }: SignalProcessingStepProps) {
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<SignalProcessingData>({
    ph: 6.5,
    gasLevel: 50,
    storageTime: 24,
    temperature: 4,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const addLog = useCallback((type: TerminalLog['type'], message: string) => {
    setLogs(prev => [...prev, {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: new Date(),
    }]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitted) return;

    setIsProcessing(true);
    setLogs([]);

    const messages: [TerminalLog['type'], string, number][] = [
      ['info', 'Initializing Signal Processing Agent...', 500],
      ['processing', 'Loading sensor data processing module...', 600],
      ['success', 'Module loaded: ChemSense v2.1', 400],
      ['info', `Received pH reading: ${formData.ph.toFixed(1)}`, 300],
      ['info', `Received gas sensor reading: ${formData.gasLevel} ppm`, 300],
      ['info', `Storage duration: ${formData.storageTime} hours at ${formData.temperature}°C`, 300],
      ['processing', 'Normalizing sensor values...', 700],
      ['processing', 'Applying Kalman filter for noise reduction...', 800],
      ['processing', 'Cross-referencing with image analysis results...', 600],
    ];

    for (const [type, message, delay] of messages) {
      await new Promise(resolve => setTimeout(resolve, delay));
      addLog(type, message);
    }

    // Add analysis based on form values
    await new Promise(resolve => setTimeout(resolve, 500));

    const phStatus = formData.ph >= 4.5 && formData.ph <= 7.0 ? 'normal' : 'abnormal';
    const gasStatus = formData.gasLevel < 100 ? 'normal' : formData.gasLevel < 200 ? 'elevated' : 'high';
    const storageStatus = formData.storageTime < 48 ? 'acceptable' : 'extended';

    addLog(phStatus === 'normal' ? 'success' : 'warning', `pH Analysis: ${phStatus.toUpperCase()} (optimal range: 4.5-7.0)`);
    addLog(gasStatus === 'normal' ? 'success' : gasStatus === 'elevated' ? 'warning' : 'error', `Gas Level: ${gasStatus.toUpperCase()} (threshold: 100 ppm)`);
    addLog(storageStatus === 'acceptable' ? 'success' : 'warning', `Storage Time: ${storageStatus.toUpperCase()} (recommended: <48h)`);

    await new Promise(resolve => setTimeout(resolve, 500));
    addLog('success', 'Signal processing complete. Data ready for classification agent.');

    setIsProcessing(false);
    setIsSubmitted(true);
    onComplete(formData);
  };

  const handleInputChange = (field: keyof SignalProcessingData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section className="scroll-section flex items-center justify-center p-4 sm:p-8 pb-20 sm:pb-24 bg-gradient-to-br from-[#0a0f1a] via-[#0d1420] to-[#0a0f1a] overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                02
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Signal Processing Agent</h2>
                <p className="text-slate-400 text-sm sm:text-base">Chemical and environmental sensor analysis</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="card-gradient rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                    pH Level
                    <span className="text-slate-500 font-normal ml-2">(0-14 scale)</span>
                  </label>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <input
                      type="range"
                      min="0"
                      max="14"
                      step="0.1"
                      value={formData.ph}
                      onChange={(e) => handleInputChange('ph', parseFloat(e.target.value))}
                      disabled={isSubmitted}
                      className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <span className="w-12 sm:w-16 text-right font-mono text-purple-400 text-sm sm:text-base">{formData.ph.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 mt-1">
                    <span>Acidic</span>
                    <span>Neutral</span>
                    <span>Alkaline</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                    Gas Level (VOC)
                    <span className="text-slate-500 font-normal ml-2">(ppm)</span>
                  </label>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <input
                      type="range"
                      min="0"
                      max="500"
                      step="5"
                      value={formData.gasLevel}
                      onChange={(e) => handleInputChange('gasLevel', parseInt(e.target.value))}
                      disabled={isSubmitted}
                      className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <span className="w-12 sm:w-16 text-right font-mono text-purple-400 text-sm sm:text-base">{formData.gasLevel}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 mt-1">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                    Storage Time
                    <span className="text-slate-500 font-normal ml-2">(hours)</span>
                  </label>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <input
                      type="range"
                      min="0"
                      max="168"
                      step="1"
                      value={formData.storageTime}
                      onChange={(e) => handleInputChange('storageTime', parseInt(e.target.value))}
                      disabled={isSubmitted}
                      className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <span className="w-12 sm:w-16 text-right font-mono text-purple-400 text-sm sm:text-base">{formData.storageTime}h</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 mt-1">
                    <span>Fresh</span>
                    <span>3 days</span>
                    <span>1 week</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                    Storage Temperature
                    <span className="text-slate-500 font-normal ml-2">(°C)</span>
                  </label>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <input
                      type="range"
                      min="-20"
                      max="30"
                      step="1"
                      value={formData.temperature}
                      onChange={(e) => handleInputChange('temperature', parseInt(e.target.value))}
                      disabled={isSubmitted}
                      className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <span className="w-12 sm:w-16 text-right font-mono text-purple-400 text-sm sm:text-base">{formData.temperature}°C</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 mt-1">
                    <span>Frozen</span>
                    <span>Refrigerated</span>
                    <span>Room Temp</span>
                  </div>
                </div>
              </div>

              {!isSubmitted && (
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg font-semibold text-white text-sm sm:text-base hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed glow-purple"
                >
                  {isProcessing ? 'Processing...' : 'Process Sensor Data'}
                </button>
              )}

              {isSubmitted && (
                <div className="flex items-center gap-2 text-green-400 justify-center text-sm sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Data submitted successfully</span>
                </div>
              )}
            </form>
          </div>

          <div className="flex flex-col justify-center">
            <TerminalUI
              title="signal-processing-agent.py"
              logs={logs}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
