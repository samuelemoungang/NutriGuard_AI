'use client';

import { useState, useCallback, useEffect } from 'react';
import TerminalUI from './TerminalUI';
import { TerminalLog, SignalProcessingData, ImageAnalysisResult } from '@/types';
import agentMemoryService from '@/services/agentMemoryService';

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
    if (isSubmitted || isProcessing) return;

    setIsProcessing(true);
    setLogs([]);

    try {
      // Step 1: Inizializzazione
      addLog('info', 'Initializing Signal Processing Agent...');
      await new Promise(resolve => setTimeout(resolve, 500));

      addLog('processing', 'Loading sensor data processing module...');
      await new Promise(resolve => setTimeout(resolve, 600));

      addLog('success', 'Module loaded: ChemSense v2.1');
      await new Promise(resolve => setTimeout(resolve, 400));

      // Step 2: Legge l'output del primo agent dalla memoria condivisa
      addLog('info', '');
      addLog('info', '═══════════════════════════════════════');
      addLog('info', '📥 RETRIEVING DATA FROM UPSTREAM AGENT');
      addLog('info', '═══════════════════════════════════════');
      await new Promise(resolve => setTimeout(resolve, 500));

      const imageAnalysisFromMemory = agentMemoryService.getImageAnalysis();
      
      if (imageAnalysisFromMemory) {
        addLog('success', '✓ Image Analysis data retrieved from shared memory');
        addLog('info', '');
        addLog('info', '📊 IMAGE ANALYSIS RESULTS:');
        addLog('info', `   Food Type: ${imageAnalysisFromMemory.foodType.name}`);
        addLog('info', `   Category: ${imageAnalysisFromMemory.foodType.category}`);
        addLog('info', `   Confidence: ${imageAnalysisFromMemory.confidence.toFixed(1)}%`);
        addLog('info', `   Mold Detected: ${imageAnalysisFromMemory.moldDetected ? 'YES' : 'NO'}`);
        if (imageAnalysisFromMemory.moldDetected) {
          addLog('warning', `   Mold Coverage: ${imageAnalysisFromMemory.moldPercentage.toFixed(1)}%`);
        }
        addLog('info', `   Color Analysis:`);
        addLog('info', `     - Healthy: ${imageAnalysisFromMemory.colorAnalysis.healthy.toFixed(1)}%`);
        addLog('info', `     - Warning: ${imageAnalysisFromMemory.colorAnalysis.warning.toFixed(1)}%`);
        addLog('info', `     - Danger: ${imageAnalysisFromMemory.colorAnalysis.danger.toFixed(1)}%`);
        addLog('info', `   Shelf Life: ${imageAnalysisFromMemory.foodType.shelfLife}`);
        addLog('info', `   Storage: ${imageAnalysisFromMemory.foodType.optimalStorage}`);
      } else {
        addLog('warning', '⚠ Image Analysis not found in shared memory');
        addLog('warning', '   Proceeding with sensor data only...');
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Mostra i parametri inseriti dall'utente
      addLog('info', '');
      addLog('info', '═══════════════════════════════════════');
      addLog('info', '📡 SENSOR DATA INPUT');
      addLog('info', '═══════════════════════════════════════');
      await new Promise(resolve => setTimeout(resolve, 400));

      addLog('info', `   pH Level: ${formData.ph.toFixed(1)}`);
      addLog('info', `   Gas Level (VOC): ${formData.gasLevel} ppm`);
      addLog('info', `   Storage Time: ${formData.storageTime} hours`);
      addLog('info', `   Temperature: ${formData.temperature}°C`);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 4: Analisi combinata
      addLog('info', '');
      addLog('info', '═══════════════════════════════════════');
      addLog('info', '🔍 COMBINED ANALYSIS SUMMARY');
      addLog('info', '═══════════════════════════════════════');
      await new Promise(resolve => setTimeout(resolve, 600));

      // Analisi pH
      const phStatus = formData.ph >= 4.5 && formData.ph <= 7.0 ? 'normal' : 'abnormal';
      const phIcon = phStatus === 'normal' ? '✓' : '⚠';
      addLog(phStatus === 'normal' ? 'success' : 'warning', `${phIcon} pH: ${formData.ph.toFixed(1)} (${phStatus.toUpperCase()}) - Optimal: 4.5-7.0`);

      // Analisi Gas
      const gasStatus = formData.gasLevel < 100 ? 'normal' : formData.gasLevel < 200 ? 'elevated' : 'high';
      const gasIcon = gasStatus === 'normal' ? '✓' : gasStatus === 'elevated' ? '⚠' : '✗';
      const gasLogType = gasStatus === 'normal' ? 'success' : gasStatus === 'elevated' ? 'warning' : 'error';
      addLog(gasLogType, `${gasIcon} Gas Level: ${formData.gasLevel} ppm (${gasStatus.toUpperCase()}) - Threshold: 100 ppm`);

      // Analisi Storage Time
      const storageStatus = formData.storageTime < 48 ? 'acceptable' : 'extended';
      const storageIcon = storageStatus === 'acceptable' ? '✓' : '⚠';
      addLog(storageStatus === 'acceptable' ? 'success' : 'warning', `${storageIcon} Storage Time: ${formData.storageTime}h (${storageStatus.toUpperCase()}) - Recommended: <48h`);

      // Analisi Temperature
      const tempStatus = formData.temperature && formData.temperature <= 4 ? 'optimal' : formData.temperature && formData.temperature <= 8 ? 'acceptable' : 'warning';
      const tempIcon = tempStatus === 'optimal' ? '✓' : tempStatus === 'acceptable' ? '⚠' : '✗';
      const tempLogType = tempStatus === 'optimal' ? 'success' : tempStatus === 'acceptable' ? 'warning' : 'error';
      addLog(tempLogType, `${tempIcon} Temperature: ${formData.temperature}°C (${tempStatus.toUpperCase()}) - Optimal: ≤4°C`);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 5: Riepilogo finale combinato
      addLog('info', '');
      addLog('info', '═══════════════════════════════════════');
      addLog('info', '📋 DATA AGGREGATION COMPLETE');
      addLog('info', '═══════════════════════════════════════');
      await new Promise(resolve => setTimeout(resolve, 400));

      if (imageAnalysisFromMemory) {
        addLog('info', 'Combined Dataset:');
        addLog('info', `  • Visual: ${imageAnalysisFromMemory.foodType.name} (${imageAnalysisFromMemory.confidence.toFixed(0)}% confidence)`);
        addLog('info', `  • Mold: ${imageAnalysisFromMemory.moldDetected ? 'Detected' : 'Not detected'}`);
        addLog('info', `  • Chemical: pH ${formData.ph.toFixed(1)}, Gas ${formData.gasLevel}ppm`);
        addLog('info', `  • Storage: ${formData.storageTime}h @ ${formData.temperature}°C`);
      } else {
        addLog('info', 'Dataset:');
        addLog('info', `  • Chemical: pH ${formData.ph.toFixed(1)}, Gas ${formData.gasLevel}ppm`);
        addLog('info', `  • Storage: ${formData.storageTime}h @ ${formData.temperature}°C`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 6: Salvataggio nella memoria condivisa
      addLog('processing', 'Saving aggregated data to shared memory...');
      agentMemoryService.setSignalData(formData);
      await new Promise(resolve => setTimeout(resolve, 400));

      addLog('success', '✓ Data saved to shared memory for downstream agents');
      await new Promise(resolve => setTimeout(resolve, 300));

      addLog('success', '');
      addLog('success', '✅ Signal processing complete. Ready for classification agent.');
      addLog('info', '');

      setIsProcessing(false);
      setIsSubmitted(true);
      onComplete(formData);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Processing failed: ${errorMessage}`);
      setIsProcessing(false);
    }
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
                    <span className="flex items-center gap-2">
                      Gas Level (VOC)
                      <span className="text-slate-500 font-normal">(ppm)</span>
                      <div className="relative group">
                        <button
                          type="button"
                          className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-600 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-colors cursor-help"
                          aria-label="Gas Level (VOC) information"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 sm:w-72 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                          <div className="text-xs sm:text-sm text-slate-300 space-y-1.5">
                            <p className="font-semibold text-cyan-400 mb-2">Gas Level (VOC) Reference Values:</p>
                            <div className="space-y-1">
                              <p className="flex items-start gap-2">
                                <span className="text-green-400 font-semibold">Low (&lt; 100 ppm):</span>
                                <span className="text-slate-300">Fresh food</span>
                              </p>
                              <p className="flex items-start gap-2">
                                <span className="text-yellow-400 font-semibold">Medium (100-200 ppm):</span>
                                <span className="text-slate-300">Possible deterioration onset</span>
                              </p>
                              <p className="flex items-start gap-2">
                                <span className="text-red-400 font-semibold">High (&gt; 200 ppm):</span>
                                <span className="text-slate-300">Advanced deterioration, safety risk</span>
                              </p>
                            </div>
                          </div>
                          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                        </div>
                      </div>
                    </span>
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
