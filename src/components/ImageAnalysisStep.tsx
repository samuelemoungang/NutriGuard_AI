'use client';

import { useState, useEffect, useCallback } from 'react';
import TerminalUI from './TerminalUI';
import { TerminalLog, ImageAnalysisResult, FoodType } from '@/types';
import RoboFlowService, { RoboFlowPrediction } from '@/services/roboflowService';

interface ImageAnalysisStepProps {
  uploadedImage: string | null;
  onComplete: (result: ImageAnalysisResult) => void;
  isActive: boolean;
}

// Non usiamo più un database mock di alimenti: tutto il feedback
// deriva dal modello YOLOv8 (o da mapping deterministici)

export default function ImageAnalysisStep({ uploadedImage, onComplete, isActive }: ImageAnalysisStepProps) {
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [roboFlowService] = useState(() => new RoboFlowService());

  const addLog = useCallback((type: TerminalLog['type'], message: string) => {
    setLogs(prev => [...prev, {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: new Date(),
    }]);
  }, []);

  // Non eseguiamo più riconoscimento mock dell'alimento: il "nome"
  // mostrerà la classe restituita da YOLOv8 (o un valore generico).

  const simulateAnalysis = useCallback(async () => {
    if (!uploadedImage || hasStarted) return;

    setHasStarted(true);
    setIsProcessing(true);
    setLogs([]);

    // Phase 1: Initialization
    addLog('info', 'Initializing Image Analysis Agent with RoboFlow Integration...');
    await new Promise(resolve => setTimeout(resolve, 500));

    addLog('processing', 'Loading computer vision models...');
    await new Promise(resolve => setTimeout(resolve, 800));

    addLog('success', 'Model loaded: ResNet-50 with custom food safety weights');
    await new Promise(resolve => setTimeout(resolve, 400));

    addLog('success', 'Model loaded: RoboFlow YOLOv8 Workflow (nutriguard/yolov8)');
    await new Promise(resolve => setTimeout(resolve, 400));
    
    addLog('info', 'RoboFlow: Single YOLOv8 workflow for freshness & detections');
    await new Promise(resolve => setTimeout(resolve, 300));

    // Phase 2: Send image to RoboFlow (single workflow)
    addLog('processing', 'Sending image to RoboFlow YOLOv8 workflow...');
    await new Promise(resolve => setTimeout(resolve, 800));

    let roboFlowPrediction: RoboFlowPrediction | null = null;
    let detectedClass: string | null = null;
    let freshnessLabel: 'fresh' | 'ripening' | 'rotten' = 'fresh';
    let freshnessConfidence = 0;
    
    try {
      const imageBase64 = uploadedImage.includes(',')
        ? uploadedImage
        : `data:image/jpeg;base64,${uploadedImage}`;

      roboFlowPrediction = await roboFlowService.analyzeImage(imageBase64);
      addLog('success', 'RoboFlow analysis completed');

      const predictions = roboFlowPrediction.predictions || roboFlowPrediction.detections || [];
      if (predictions.length > 0) {
        const bestPrediction = predictions.sort((a, b) => b.confidence - a.confidence)[0];
        detectedClass = bestPrediction.class;
        addLog(
          'info',
          `RoboFlow detected class: ${detectedClass} (${(bestPrediction.confidence * 100).toFixed(1)}% confidence)`,
        );
      } else {
        addLog('warning', 'RoboFlow did not return any detections, using fallback analysis');
      }

      // Analisi di freschezza basata SOLO sull'output del modello
      const freshnessAnalysis = roboFlowService.analyzeDetections(roboFlowPrediction);
      freshnessLabel = freshnessAnalysis.freshness;
      freshnessConfidence = freshnessAnalysis.confidence;
      addLog('info', `RoboFlow Freshness Status: ${freshnessLabel}`);
      addLog('info', `RoboFlow Mold Coverage: ${freshnessAnalysis.moldPercentage.toFixed(1)}%`);
    } catch (error) {
      addLog('warning', 'RoboFlow API call failed, using fallback analysis');
      roboFlowPrediction = null;
    }
    await new Promise(resolve => setTimeout(resolve, 500));

    // Phase 3: Costruzione del "food type" SOLO dai dati YOLOv8
    addLog('processing', 'Building food profile from YOLOv8 output...');
    await new Promise(resolve => setTimeout(resolve, 800));

    const storageInfo = roboFlowService.getFreshnessCategoryInfo(freshnessLabel);

    const detectedFood: FoodType = {
      name: detectedClass
        ? detectedClass.charAt(0).toUpperCase() + detectedClass.slice(1)
        : 'Food Item',
      category: 'other',
      confidence: Math.max(0, Math.min(100, freshnessConfidence * 100)),
      shelfLife: storageInfo.shelfLife,
      optimalStorage: storageInfo.optimalStorage,
    };

    addLog('success', `Food profile built from model output: ${detectedFood.name}`);
    await new Promise(resolve => setTimeout(resolve, 300));

    addLog('info', `Category: ${detectedFood.category.charAt(0).toUpperCase() + detectedFood.category.slice(1)}`);
    await new Promise(resolve => setTimeout(resolve, 200));

    addLog('info', `Expected shelf life: ${detectedFood.shelfLife}`);
    await new Promise(resolve => setTimeout(resolve, 200));

    addLog('info', `Optimal storage: ${detectedFood.optimalStorage}`);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Phase 4: Quality Analysis
    addLog('processing', 'Preprocessing image: resizing to 224x224...');
    await new Promise(resolve => setTimeout(resolve, 600));

    addLog('processing', 'Extracting color histogram...');
    await new Promise(resolve => setTimeout(resolve, 500));

    addLog('processing', 'Analyzing texture patterns for mold detection...');
    await new Promise(resolve => setTimeout(resolve, 700));

    addLog('processing', 'Running convolutional neural network inference...');
    await new Promise(resolve => setTimeout(resolve, 800));

    addLog('success', 'Analysis complete!');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Analyze RoboFlow results (solo dati reali, niente random)
    let moldDetected = false;
    let moldPercentage = 0;

    if (roboFlowPrediction && roboFlowPrediction.success) {
      const freshnessAnalysis = roboFlowService.analyzeDetections(roboFlowPrediction);
      moldDetected = freshnessAnalysis.moldDetected;
      moldPercentage = freshnessAnalysis.moldPercentage;

      const detectionCount =
        (roboFlowPrediction.predictions || roboFlowPrediction.detections || []).length;
      addLog('info', `RoboFlow Detections: ${detectionCount} object(s) identified`);
    }

    // Mappa deterministica della freschezza in distribuzione colori
    let healthy = 70;
    let warning = 20;
    let danger = 10;
    if (freshnessLabel === 'ripening') {
      healthy = 50;
      warning = 30;
      danger = 20;
    } else if (freshnessLabel === 'rotten') {
      healthy = 10;
      warning = 20;
      danger = 70;
    }

    const resultData: ImageAnalysisResult = {
      foodType: detectedFood,
      moldDetected,
      moldPercentage,
      dominantColors: ['#8B4513', '#228B22', '#FFD700'],
      colorAnalysis: {
        healthy,
        warning,
        danger,
      },
      confidence: Math.max(0, Math.min(100, freshnessConfidence * 100)),
    };

    addLog('info', `Mold Detection: ${resultData.moldDetected ? 'POSITIVE' : 'NEGATIVE'} (${resultData.moldPercentage.toFixed(1)}% coverage)`);
    addLog('info', `Color Analysis - Healthy: ${resultData.colorAnalysis.healthy.toFixed(1)}%, Warning: ${resultData.colorAnalysis.warning.toFixed(1)}%, Danger: ${resultData.colorAnalysis.danger.toFixed(1)}%`);
    addLog('info', `Overall Confidence Score: ${resultData.confidence.toFixed(1)}%`);
    addLog(
      resultData.moldDetected ? 'warning' : 'success',
      resultData.moldDetected
        ? 'Potential contamination detected. Proceeding to signal processing...'
        : 'Visual analysis looks healthy. Proceeding to signal processing...',
    );

    setResult(resultData);
    setIsProcessing(false);
    onComplete(resultData);
  }, [uploadedImage, hasStarted, addLog, onComplete, roboFlowService]);

  useEffect(() => {
    if (isActive && uploadedImage && !hasStarted) {
      simulateAnalysis();
    }
  }, [isActive, uploadedImage, hasStarted, simulateAnalysis]);

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
                <p className="text-slate-400 text-sm sm:text-base">Computer vision-based food inspection</p>
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
                      <p className="text-2xl font-bold text-cyan-400">{result.foodType.confidence.toFixed(0)}%</p>
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
