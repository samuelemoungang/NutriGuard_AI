// NOTE: Questo file contiene solo esempi e non viene usato direttamente dall'app.
// È stato convertito in .tsx per permettere l'uso di JSX senza rompere la compilazione TypeScript.

import RoboFlowService, { RoboFlowPrediction } from '@/services/roboflowService';
import { useRoboFlow } from '@/hooks/useRoboFlow';

// ============================================
// ESEMPIO 1: Uso Base del Servizio
// ============================================
export function BasicExample() {
  const analyzeImage = async (imageBase64: string) => {
    const roboflow = new RoboFlowService();
    try {
      const prediction = await roboflow.analyzeImage(imageBase64);
      if (prediction.success) {
        console.log('Detections:', (prediction.detections || []).length);
        (prediction.detections || []).forEach(d => {
          console.log(`- ${d.class}: ${(d.confidence * 100).toFixed(1)}%`);
        });
      }
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  void analyzeImage; // evita warning di variabile inutilizzata
  return null;
}

// ============================================
// ESEMPIO 2: Uso Hook in Componente React
// ============================================
export function HookExample() {
  const { isAnalyzing, error, prediction, analyzeImage } = useRoboFlow();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      await analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={isAnalyzing}
      />

      {isAnalyzing && <p>Analizzando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {prediction && prediction.detections && (
        <div>
          <h3>Risultati: {prediction.detections.length} oggetti rilevati</h3>
          <ul>
            {prediction.detections.map((d, idx) => (
              <li key={idx}>
                {d.class}: {(d.confidence * 100).toFixed(1)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================
// ESEMPIO 3: Analisi Personalizzata dei Risultati
// ============================================
export function CustomAnalysisExample() {
  const { prediction } = useRoboFlow();
  const roboflow = new RoboFlowService();

  if (!prediction) return null;

  const freshnessAnalysis = roboflow.analyzeDetections(prediction);
  const isSafe = !freshnessAnalysis.moldDetected && freshnessAnalysis.freshness !== 'rotten';
  const storageInfo = roboflow.getFreshnessCategoryInfo(freshnessAnalysis.freshness);

  return (
    <div className="bg-slate-800 p-4 rounded-lg space-y-3">
      <h3 className="font-bold">Analisi Freschezza</h3>
      <div className={`p-2 rounded ${isSafe ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
        <p className="font-semibold">Status: {isSafe ? '✅ Sicuro' : '❌ Non sicuro'}</p>
        <p>Freschezza: {freshnessAnalysis.freshness}</p>
        {freshnessAnalysis.moldDetected && (
          <p className="text-red-400">
            ⚠️ Muffa rilevata ({freshnessAnalysis.moldPercentage.toFixed(1)}%)
          </p>
        )}
      </div>
      <div className="bg-slate-700 p-2 rounded text-sm">
        <p className="font-semibold">Conservazione Consigliata:</p>
        <p>Shelf Life: {storageInfo.shelfLife}</p>
        <p>Temperatura: {storageInfo.optimalStorage}</p>
        <p className="text-cyan-400 mt-2">{storageInfo.recommendation}</p>
      </div>
    </div>
  );
}

// Gli esempi rimanenti non usano JSX, quindi possono essere copiati direttamente dall'originale

export async function BatchAnalysisExample(
  imageBase64Array: string[],
): Promise<RoboFlowPrediction[]> {
  const roboflow = new RoboFlowService();
  const results: RoboFlowPrediction[] = [];

  for (const imageBase64 of imageBase64Array) {
    try {
      const prediction = await roboflow.analyzeImage(imageBase64);
      results.push(prediction);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Errore in batch analysis:', error);
      results.push({
        detections: [],
        image: { width: 0, height: 0 },
        success: false,
        error: String(error),
      });
    }
  }

  return results;
}

class RoboFlowCache {
  private cache = new Map<string, RoboFlowPrediction>();
  private maxAge = 1000 * 60 * 5;
  private timestamps = new Map<string, number>();

  async analyzeWithCache(imageBase64: string): Promise<RoboFlowPrediction> {
    const key = this.hashString(imageBase64);
    if (this.cache.has(key)) {
      const timestamp = this.timestamps.get(key);
      if (timestamp && Date.now() - timestamp < this.maxAge) {
        console.log('Cache hit!');
        return this.cache.get(key)!;
      }
      this.cache.delete(key);
      this.timestamps.delete(key);
    }

    const roboflow = new RoboFlowService();
    const prediction = await roboflow.analyzeImage(imageBase64);
    this.cache.set(key, prediction);
    this.timestamps.set(key, Date.now());
    return prediction;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }
}

export async function CacheExample(imageBase64: string) {
  const cache = new RoboFlowCache();
  const result1 = await cache.analyzeWithCache(imageBase64);
  const result2 = await cache.analyzeWithCache(imageBase64);
  return { result1, result2 };
}

export async function analyzeWithRetry(
  imageBase64: string,
  maxRetries = 3,
): Promise<RoboFlowPrediction | null> {
  const roboflow = new RoboFlowService();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const prediction = await roboflow.analyzeImage(imageBase64);
      if (prediction.success) return prediction;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delayMs = Math.pow(2, attempt) * 1000;
        console.log(`Retry ${attempt + 1}/${maxRetries} dopo ${delayMs}ms`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  console.error('Tutti i retry falliti:', lastError);
  return null;
}

interface FoodAnalysisResult {
  foodType: string;
  freshness: 'fresh' | 'ripening' | 'rotten';
  safeToEat: boolean;
  confidence: number;
  detections: {
    class: string;
    confidence: number;
  }[];
}

export async function analyzeFood(imageBase64: string): Promise<FoodAnalysisResult | null> {
  const roboflow = new RoboFlowService();
  const prediction = await roboflow.analyzeImage(imageBase64);
  if (!prediction.success) return null;

  const freshnessAnalysis = roboflow.analyzeDetections(prediction);
  return {
    foodType: 'Frutta/Verdura',
    freshness: freshnessAnalysis.freshness,
    safeToEat:
      !freshnessAnalysis.moldDetected && freshnessAnalysis.freshness !== 'rotten',
    confidence: freshnessAnalysis.confidence,
    detections: (prediction.detections || []).map(d => ({
      class: d.class,
      confidence: d.confidence,
    })),
  };
}

class RoboFlowMonitor {
  private logs: {
    timestamp: Date;
    status: 'success' | 'error';
    message: string;
  }[] = [];

  async analyzeWithMonitoring(imageBase64: string) {
    const startTime = Date.now();
    try {
      const roboflow = new RoboFlowService();
      const prediction = await roboflow.analyzeImage(imageBase64);
      const duration = Date.now() - startTime;
      this.log('success', `Analisi completata in ${duration}ms`);
      return prediction;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.log('error', `Errore dopo ${duration}ms: ${String(error)}`);
      throw error;
    }
  }

  private log(status: 'success' | 'error', message: string) {
    this.logs.push({ timestamp: new Date(), status, message });
    console.log(`[${status.toUpperCase()}] ${message}`);
  }

  getMetrics() {
    const total = this.logs.length;
    const successes = this.logs.filter(l => l.status === 'success').length;
    const errors = this.logs.filter(l => l.status === 'error').length;
    return {
      total,
      successes,
      errors,
      successRate: total ? (successes / total) * 100 : 0,
      logs: this.logs,
    };
  }
}

export class RoboFlowErrorHandler {
  static handleError(error: unknown): string {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return 'Errore di rete: verifica la connessione internet';
    }
    if (error instanceof Error) {
      if (error.message.includes('401')) return 'Errore di autenticazione: verifica la tua API Key';
      if (error.message.includes('429')) return 'Troppe richieste: aspetta un momento prima di riprovare';
      if (error.message.includes('404')) return 'Progetto non trovato: verifica il Project ID';
    }
    return "Errore sconosciuto durante l'analisi";
  }
}

export async function enhanceImageBeforeAnalysis(imageSrc: string): Promise<string> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageSrc);
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const enhancedBase64 = canvas.toDataURL('image/jpeg', 0.95);
      resolve(enhancedBase64);
    };
    img.src = imageSrc;
  });
}

export default {
  BasicExample,
  HookExample,
  CustomAnalysisExample,
  BatchAnalysisExample,
  CacheExample,
  analyzeWithRetry,
  analyzeFood,
  RoboFlowMonitor,
  RoboFlowErrorHandler,
  enhanceImageBeforeAnalysis,
};
