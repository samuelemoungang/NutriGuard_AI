// File legacy tenuto solo per compatibilità con vecchie referenze.
// Gli esempi reali sono ora in ROBOFLOW_EXAMPLES.tsx (con JSX valido).
// Questo file viene escluso dalla compilazione e non contiene più logica.

export {};

// ============================================
// ESEMPIO 4: Batch Analysis (Più Immagini)
// ============================================
export async function BatchAnalysisExample(
  imageBase64Array: string[]
): Promise<RoboFlowPrediction[]> {
  const roboflow = new RoboFlowService();
  const results: RoboFlowPrediction[] = [];

  for (const imageBase64 of imageBase64Array) {
    try {
      const prediction = await roboflow.analyzeImage(imageBase64);
      results.push(prediction);
      
      // Aggiungi delay per non fare rate limiting
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

// ============================================
// ESEMPIO 5: Caching dei Risultati
// ============================================
class RoboFlowCache {
  private cache = new Map<string, RoboFlowPrediction>();
  private maxAge = 1000 * 60 * 5; // 5 minuti
  private timestamps = new Map<string, number>();

  async analyzeWithCache(
    imageBase64: string
  ): Promise<RoboFlowPrediction> {
    // Genera una chiave hash dall'immagine
    const key = this.hashString(imageBase64);

    // Controlla cache
    if (this.cache.has(key)) {
      const timestamp = this.timestamps.get(key);
      if (timestamp && Date.now() - timestamp < this.maxAge) {
        console.log('Cache hit!');
        return this.cache.get(key)!;
      } else {
        // Cache scaduto
        this.cache.delete(key);
        this.timestamps.delete(key);
      }
    }

    // Chiama API
    const roboflow = new RoboFlowService();
    const prediction = await roboflow.analyzeImage(imageBase64);

    // Salva in cache
    this.cache.set(key, prediction);
    this.timestamps.set(key, Date.now());

    return prediction;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }
}

// Uso del cache
export async function CacheExample(imageBase64: string) {
  const cache = new RoboFlowCache();
  
  // Prima chiamata - chiama API
  const result1 = await cache.analyzeWithCache(imageBase64);
  
  // Seconda chiamata - da cache
  const result2 = await cache.analyzeWithCache(imageBase64);
  
  return { result1, result2 };
}

// ============================================
// ESEMPIO 6: Retry Logic con Backoff
// ============================================
export async function analyzeWithRetry(
  imageBase64: string,
  maxRetries = 3
): Promise<RoboFlowPrediction | null> {
  const roboflow = new RoboFlowService();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const prediction = await roboflow.analyzeImage(imageBase64);
      if (prediction.success) {
        return prediction;
      }
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 2^attempt secondi
        const delayMs = Math.pow(2, attempt) * 1000;
        console.log(`Retry ${attempt + 1}/${maxRetries} dopo ${delayMs}ms`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  console.error('Tutti i retry falliti:', lastError);
  return null;
}

// ============================================
// ESEMPIO 7: Integrazione con TypeScript Strict
// ============================================
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

export async function analyzeFood(
  imageBase64: string
): Promise<FoodAnalysisResult | null> {
  const roboflow = new RoboFlowService();
  const prediction = await roboflow.analyzeImage(imageBase64);

  if (!prediction.success) {
    return null;
  }

  const freshnessAnalysis = roboflow.analyzeDetections(prediction);

  const result: FoodAnalysisResult = {
    foodType: 'Frutta/Verdura',
    freshness: freshnessAnalysis.freshness,
    safeToEat: !freshnessAnalysis.moldDetected && 
               freshnessAnalysis.freshness !== 'rotten',
    confidence: freshnessAnalysis.confidence,
    detections: prediction.detections.map(d => ({
      class: d.class,
      confidence: d.confidence,
    })),
  };

  return result;
}

// ============================================
// ESEMPIO 8: Monitoring e Logging
// ============================================
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
      this.log('success', 
        `Analisi completata in ${duration}ms (${prediction.detections.length} detections)`
      );

      return prediction;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.log('error', 
        `Errore dopo ${duration}ms: ${String(error)}`
      );
      throw error;
    }
  }

  private log(status: 'success' | 'error', message: string) {
    this.logs.push({
      timestamp: new Date(),
      status,
      message,
    });
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
      successRate: (successes / total) * 100,
      logs: this.logs,
    };
  }
}

// ============================================
// ESEMPIO 9: Error Handling Avanzato
// ============================================
export class RoboFlowErrorHandler {
  static handleError(error: unknown): string {
    if (error instanceof TypeError) {
      if (error.message.includes('fetch')) {
        return 'Errore di rete: verifica la connessione internet';
      }
    }

    if (error instanceof Error) {
      if (error.message.includes('401')) {
        return 'Errore di autenticazione: verifica la tua API Key';
      }
      if (error.message.includes('429')) {
        return 'Troppe richieste: aspetta un momento prima di riprovare';
      }
      if (error.message.includes('404')) {
        return 'Progetto non trovato: verifica il Project ID';
      }
    }

    return 'Errore sconosciuto durante l\'analisi';
  }
}

// ============================================
// ESEMPIO 10: Advanced Image Processing
// ============================================
export async function enhanceImageBeforeAnalysis(
  imageSrc: string
): Promise<string> {
  return new Promise((resolve) => {
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

      // Disegna immagine originale
      ctx.drawImage(img, 0, 0);

      // Applica filtri (opzionale)
      // - Aumenta contrasto
      // - Normalizza luminosità
      // - Ridimensiona se necessario

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
