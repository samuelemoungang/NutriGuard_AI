'use client';

import React from 'react';
import { RoboFlowPrediction, RoboFlowDetection } from '@/services/roboflowService';

interface RoboFlowVisualizerProps {
  image: string | null;
  prediction: RoboFlowPrediction | null;
  className?: string;
}

/**
 * Componente per visualizzare le predizioni di RoboFlow su un'immagine
 * Disegna rettangoli intorno alle detection rilevate
 */
export function RoboFlowVisualizer({
  image,
  prediction,
  className = '',
}: RoboFlowVisualizerProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (!image || !prediction || !canvasRef.current) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Disegna l'immagine
      ctx.drawImage(img, 0, 0);

      // Disegna i bounding box per ogni detection
      prediction.detections.forEach((detection) => {
        drawDetection(ctx, detection, prediction.image);
      });
    };

    img.src = image;
  }, [image, prediction]);

  const drawDetection = (
    ctx: CanvasRenderingContext2D,
    detection: RoboFlowDetection,
    imageSize: { width: number; height: number }
  ) => {
    // Calcola le coordinate del rettangolo
    const scaleX = canvasRef.current?.width || imageSize.width / imageSize.width;
    const scaleY = canvasRef.current?.height || imageSize.height / imageSize.height;

    const left = (detection.x - detection.width / 2) * scaleX;
    const top = (detection.y - detection.height / 2) * scaleY;
    const width = detection.width * scaleX;
    const height = detection.height * scaleY;

    // Colore in base alla classe
    const color = getColorForClass(detection.class);

    // Disegna il rettangolo
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(left, top, width, height);

    // Disegna lo sfondo del testo
    const label = `${detection.class} ${(detection.confidence * 100).toFixed(1)}%`;
    const textWidth = ctx.measureText(label).width + 10;

    ctx.fillStyle = color;
    ctx.fillRect(left, top - 25, textWidth, 25);

    // Disegna il testo
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(label, left + 5, top - 8);
  };

  const getColorForClass = (className: string): string => {
    const lower = className.toLowerCase();
    if (lower.includes('rotten') || lower.includes('mold')) return '#FF4444';
    if (lower.includes('ripening') || lower.includes('overripe')) return '#FFAA00';
    if (lower.includes('fresh')) return '#44DD44';
    return '#4488FF';
  };

  if (!image || !prediction) {
    return null;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto border border-cyan-500/30 rounded-lg"
        style={{ maxHeight: '500px' }}
      />
      {prediction.detections.length > 0 && (
        <div className="mt-4 bg-slate-800/50 rounded-lg p-3 text-sm">
          <h4 className="text-cyan-400 font-semibold mb-2">
            RoboFlow Detections ({prediction.detections.length})
          </h4>
          <div className="space-y-1">
            {prediction.detections.map((detection, idx) => (
              <div key={idx} className="flex justify-between text-slate-300">
                <span>{detection.class}</span>
                <span className="text-cyan-400">
                  {(detection.confidence * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Componente per mostrare le statistiche di freschezza
 */
interface FreshnessStatsProps {
  freshness: 'fresh' | 'ripening' | 'rotten';
  moldPercentage: number;
  moldDetected: boolean;
}

export function FreshnessStats({
  freshness,
  moldPercentage,
  moldDetected,
}: FreshnessStatsProps) {
  const getFreshnessColor = () => {
    switch (freshness) {
      case 'fresh':
        return 'text-green-400 bg-green-500/10';
      case 'ripening':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'rotten':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-slate-400 bg-slate-500/10';
    }
  };

  const getFreshnessLabel = () => {
    switch (freshness) {
      case 'fresh':
        return '✓ Fresco';
      case 'ripening':
        return '⚠ In Maturazione';
      case 'rotten':
        return '✗ Marcio';
      default:
        return 'Sconosciuto';
    }
  };

  return (
    <div className="card-gradient rounded-xl p-4 space-y-3">
      <div className={`flex items-center gap-2 p-3 rounded-lg ${getFreshnessColor()}`}>
        <span className="text-2xl">{freshness === 'fresh' ? '🍃' : freshness === 'ripening' ? '🟡' : '🔴'}</span>
        <span className="font-semibold">{getFreshnessLabel()}</span>
      </div>

      {moldDetected && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Muffa Rilevata</span>
            <span className="text-red-400 font-semibold">{moldPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-red-500 h-full transition-all"
              style={{ width: `${moldPercentage}%` }}
            />
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Analisi RoboFlow: rilevamento della freschezza con alta precisione
      </p>
    </div>
  );
}

export default RoboFlowVisualizer;
