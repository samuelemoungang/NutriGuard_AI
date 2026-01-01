'use client';

import { useState, useEffect, useCallback } from 'react';
import TerminalUI from './TerminalUI';
import { TerminalLog, ImageAnalysisResult, FoodType } from '@/types';

interface ImageAnalysisStepProps {
  uploadedImage: string | null;
  onComplete: (result: ImageAnalysisResult) => void;
  isActive: boolean;
}

// Food recognition database (mock)
const FOOD_DATABASE: FoodType[] = [
  { name: 'Apple', category: 'fruit', confidence: 0, shelfLife: '4-8 weeks refrigerated', optimalStorage: '0-4°C, high humidity' },
  { name: 'Banana', category: 'fruit', confidence: 0, shelfLife: '2-7 days at room temp', optimalStorage: '12-14°C, away from other fruits' },
  { name: 'Orange', category: 'fruit', confidence: 0, shelfLife: '2-3 weeks refrigerated', optimalStorage: '3-8°C' },
  { name: 'Strawberry', category: 'fruit', confidence: 0, shelfLife: '3-7 days refrigerated', optimalStorage: '0-2°C, do not wash until use' },
  { name: 'Tomato', category: 'vegetable', confidence: 0, shelfLife: '1-2 weeks', optimalStorage: 'Room temperature until ripe, then refrigerate' },
  { name: 'Lettuce', category: 'vegetable', confidence: 0, shelfLife: '7-10 days refrigerated', optimalStorage: '0-4°C, wrapped in damp paper towel' },
  { name: 'Carrot', category: 'vegetable', confidence: 0, shelfLife: '3-4 weeks refrigerated', optimalStorage: '0-4°C, high humidity' },
  { name: 'Broccoli', category: 'vegetable', confidence: 0, shelfLife: '3-5 days refrigerated', optimalStorage: '0-4°C, unwashed' },
  { name: 'Chicken Breast', category: 'meat', confidence: 0, shelfLife: '1-2 days raw, 3-4 days cooked', optimalStorage: '0-4°C raw, freeze for longer storage' },
  { name: 'Ground Beef', category: 'meat', confidence: 0, shelfLife: '1-2 days raw, 3-4 days cooked', optimalStorage: '0-4°C raw' },
  { name: 'Salmon Fillet', category: 'seafood', confidence: 0, shelfLife: '1-2 days refrigerated', optimalStorage: '0-2°C, on ice' },
  { name: 'Shrimp', category: 'seafood', confidence: 0, shelfLife: '1-2 days refrigerated', optimalStorage: '0-2°C, on ice' },
  { name: 'Milk', category: 'dairy', confidence: 0, shelfLife: '5-7 days after opening', optimalStorage: '0-4°C, away from door' },
  { name: 'Cheese', category: 'dairy', confidence: 0, shelfLife: '1-4 weeks depending on type', optimalStorage: '0-4°C, wrapped properly' },
  { name: 'Yogurt', category: 'dairy', confidence: 0, shelfLife: '1-2 weeks', optimalStorage: '0-4°C' },
  { name: 'Bread', category: 'grain', confidence: 0, shelfLife: '5-7 days at room temp', optimalStorage: 'Room temperature, freeze for longer storage' },
  { name: 'Rice', category: 'grain', confidence: 0, shelfLife: '4-6 days cooked', optimalStorage: 'Cooked: 0-4°C, Dry: room temperature' },
  { name: 'Pizza', category: 'processed', confidence: 0, shelfLife: '3-4 days refrigerated', optimalStorage: '0-4°C' },
  { name: 'Sandwich', category: 'processed', confidence: 0, shelfLife: '1-2 days refrigerated', optimalStorage: '0-4°C' },
];

export default function ImageAnalysisStep({ uploadedImage, onComplete, isActive }: ImageAnalysisStepProps) {
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const addLog = useCallback((type: TerminalLog['type'], message: string) => {
    setLogs(prev => [...prev, {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: new Date(),
    }]);
  }, []);

  const recognizeFood = useCallback((): FoodType => {
    // Mock food recognition - randomly select a food type
    const randomIndex = Math.floor(Math.random() * FOOD_DATABASE.length);
    const food = { ...FOOD_DATABASE[randomIndex] };
    food.confidence = 75 + Math.random() * 20; // 75-95% confidence
    return food;
  }, []);

  const simulateAnalysis = useCallback(async () => {
    if (!uploadedImage || hasStarted) return;

    setHasStarted(true);
    setIsProcessing(true);
    setLogs([]);

    // Phase 1: Initialization
    addLog('info', 'Initializing Image Analysis Agent...');
    await new Promise(resolve => setTimeout(resolve, 500));

    addLog('processing', 'Loading computer vision models...');
    await new Promise(resolve => setTimeout(resolve, 800));

    addLog('success', 'Model loaded: ResNet-50 with custom food safety weights');
    await new Promise(resolve => setTimeout(resolve, 400));

    addLog('success', 'Model loaded: FoodNet-v2 for food classification');
    await new Promise(resolve => setTimeout(resolve, 400));

    // Phase 2: Food Recognition
    addLog('processing', 'Running food classification neural network...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const detectedFood = recognizeFood();

    addLog('success', `Food identified: ${detectedFood.name} (${detectedFood.confidence.toFixed(1)}% confidence)`);
    await new Promise(resolve => setTimeout(resolve, 300));

    addLog('info', `Category: ${detectedFood.category.charAt(0).toUpperCase() + detectedFood.category.slice(1)}`);
    await new Promise(resolve => setTimeout(resolve, 200));

    addLog('info', `Expected shelf life: ${detectedFood.shelfLife}`);
    await new Promise(resolve => setTimeout(resolve, 200));

    addLog('info', `Optimal storage: ${detectedFood.optimalStorage}`);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Phase 3: Quality Analysis
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

    // Generate mock results based on food type
    const moldRisk = detectedFood.category === 'fruit' || detectedFood.category === 'vegetable' ? 0.3 : 0.2;
    const moldDetected = Math.random() < moldRisk;

    const mockResult: ImageAnalysisResult = {
      foodType: detectedFood,
      moldDetected,
      moldPercentage: moldDetected ? Math.random() * 15 : Math.random() * 2,
      dominantColors: ['#8B4513', '#228B22', '#FFD700'],
      colorAnalysis: {
        healthy: 65 + Math.random() * 20,
        warning: 10 + Math.random() * 15,
        danger: 5 + Math.random() * 10,
      },
      confidence: 85 + Math.random() * 10,
    };

    // Normalize percentages
    const total = mockResult.colorAnalysis.healthy + mockResult.colorAnalysis.warning + mockResult.colorAnalysis.danger;
    mockResult.colorAnalysis.healthy = (mockResult.colorAnalysis.healthy / total) * 100;
    mockResult.colorAnalysis.warning = (mockResult.colorAnalysis.warning / total) * 100;
    mockResult.colorAnalysis.danger = (mockResult.colorAnalysis.danger / total) * 100;

    addLog('info', `Mold Detection: ${mockResult.moldDetected ? 'POSITIVE' : 'NEGATIVE'} (${mockResult.moldPercentage.toFixed(1)}% coverage)`);
    addLog('info', `Color Analysis - Healthy: ${mockResult.colorAnalysis.healthy.toFixed(1)}%, Warning: ${mockResult.colorAnalysis.warning.toFixed(1)}%, Danger: ${mockResult.colorAnalysis.danger.toFixed(1)}%`);
    addLog('info', `Overall Confidence Score: ${mockResult.confidence.toFixed(1)}%`);
    addLog(mockResult.moldDetected ? 'warning' : 'success', mockResult.moldDetected ? 'Potential contamination detected. Proceeding to signal processing...' : 'Visual analysis looks healthy. Proceeding to signal processing...');

    setResult(mockResult);
    setIsProcessing(false);
    onComplete(mockResult);
  }, [uploadedImage, hasStarted, addLog, recognizeFood, onComplete]);

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
