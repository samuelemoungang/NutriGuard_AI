// RoboFlow Service - Integrazione singolo workflow YOLOv8
// Workflow: nutriguard/yolov8 (serverless endpoint)

export interface RoboFlowDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
  class_id?: number;
}

export interface RoboFlowPrediction {
  predictions?: RoboFlowDetection[]; // Workflow API usa 'predictions'
  detections?: RoboFlowDetection[];  // Fallback per compatibilità
  output_image?: string;              // URL immagine processata
  count_objects?: number;             // Numero oggetti rilevati
  image?: {
    width: number;
    height: number;
  };
  success: boolean;
  error?: string;
}

export class RoboFlowService {
  private apiKey: string;
  private workspace: string;
  private workflow: string;
  private apiUrl: string;

  constructor(apiKey?: string) {
    // Configurazione da variabili d'ambiente
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_ROBOFLOW_API_KEY || '';
    this.workspace = process.env.NEXT_PUBLIC_ROBOFLOW_WORKSPACE || 'nutriguard';
    this.workflow = process.env.NEXT_PUBLIC_ROBOFLOW_WORKFLOW || 'yolov8';
    this.apiUrl = process.env.NEXT_PUBLIC_ROBOFLOW_API_URL || 'https://serverless.roboflow.com';
  }

  /**
   * Metodo legacy - Invia un'immagine al workflow YOLOv8
   */
  async analyzeImage(imageBase64: string): Promise<RoboFlowPrediction> {
    try {
      if (!this.apiKey) {
        console.warn('RoboFlow API Key non configurata');
        return this.getMockPrediction();
      }

      // Costruisci l'URL del workflow
      const workflowUrl = `${this.apiUrl}/${this.workspace}/${this.workflow}?api_key=${this.apiKey}`;
      
      console.log('[RoboFlow] Calling workflow:', workflowUrl);

      const formData = new FormData();
      
      // Converti base64 a blob
      const imageBlob = this.base64ToBlob(imageBase64);
      formData.append('image', imageBlob, 'upload.jpg');

      const response = await fetch(workflowUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`RoboFlow API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[RoboFlow] Response:', data);

      // Normalizza la risposta del workflow
      const prediction: RoboFlowPrediction = {
        predictions: data.predictions || [],
        detections: data.predictions || [], // Compatibilità
        output_image: data.output_image,
        count_objects: data.count_objects || (data.predictions?.length || 0),
        image: data.image || { width: 640, height: 480 },
        success: true,
      };

      return prediction;
    } catch (error) {
      console.error('Errore nella comunicazione con RoboFlow:', error);
      // Ritorna una predizione mock per lo sviluppo
      return this.getMockPrediction();
    }
  }

  /**
   * Analizza i risultati di RoboFlow per determinare la freschezza
   */
  analyzeDetections(prediction: RoboFlowPrediction): {
    moldDetected: boolean;
    moldPercentage: number;
    freshness: 'fresh' | 'ripening' | 'rotten';
    confidence: number;
  } {
    // Usa predictions o detections (compatibilità)
    const detections = prediction.predictions || prediction.detections || [];
    
    if (!prediction.success || detections.length === 0) {
      return {
        moldDetected: false,
        moldPercentage: 0,
        freshness: 'fresh',
        confidence: 0,
      };
    }

    // Filtra le detection per problemi di muffa/deterioramento
    const moldDetections = detections.filter(
      d => d.class.toLowerCase().includes('mold') ||
           d.class.toLowerCase().includes('rotten') ||
           d.class.toLowerCase().includes('damaged') ||
           d.class.toLowerCase().includes('spoiled')
    );

    const imageWidth = prediction.image?.width || 640;
    const imageHeight = prediction.image?.height || 480;
    const totalArea = imageWidth * imageHeight;
    const moldArea = moldDetections.reduce((sum, d) => sum + (d.width * d.height), 0);
    const moldPercentage = (moldArea / totalArea) * 100;

    // Determina lo stato di freschezza
    let freshness: 'fresh' | 'ripening' | 'rotten' = 'fresh';
    if (moldPercentage > 30) {
      freshness = 'rotten';
    } else if (moldPercentage > 10) {
      freshness = 'ripening';
    }

    const avgConfidence = moldDetections.length > 0
      ? moldDetections.reduce((sum, d) => sum + d.confidence, 0) / moldDetections.length
      : 0;

    return {
      moldDetected: moldDetections.length > 0,
      moldPercentage: Math.min(moldPercentage, 100),
      freshness,
      confidence: avgConfidence,
    };
  }

  /**
   * Ritorna una predizione mock per lo sviluppo senza API key
   */
  private getMockPrediction(): RoboFlowPrediction {
    return {
      predictions: [
        {
          x: 150,
          y: 150,
          width: 100,
          height: 100,
          confidence: 0.85,
          class: 'fresh',
          class_id: 0,
        },
      ],
      detections: [
        {
          x: 150,
          y: 150,
          width: 100,
          height: 100,
          confidence: 0.85,
          class: 'fresh',
          class_id: 0,
        },
      ],
      count_objects: 1,
      image: {
        width: 640,
        height: 480,
      },
      success: true,
    };
  }

  /**
   * Converte base64 a Blob
   */
  private base64ToBlob(base64: string): Blob {
    const byteCharacters = atob(base64.split(',')[1] || base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/jpeg' });
  }

  /**
   * Ricava le informazioni sulla freschezza per il tipo di cibo
   */
  getFreshnessCategoryInfo(freshness: string): {
    shelfLife: string;
    optimalStorage: string;
    recommendation: string;
  } {
    const categories = {
      fresh: {
        shelfLife: '7-14 giorni',
        optimalStorage: 'Frigorifero (4-8°C)',
        recommendation: 'Consumare entro pochi giorni',
      },
      ripening: {
        shelfLife: '3-5 giorni',
        optimalStorage: 'Frigorifero (2-4°C)',
        recommendation: 'Consumare al più presto',
      },
      rotten: {
        shelfLife: '< 1 giorno',
        optimalStorage: 'Smaltire',
        recommendation: 'Non consumare',
      },
    };

    return categories[freshness as keyof typeof categories] || categories.fresh;
  }
}

export default RoboFlowService;
