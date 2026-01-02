// OpenAI Vision Service - Semplice e affidabile per riconoscimento alimenti
// Usa GPT-4 Vision API per analizzare immagini di alimenti

export interface OpenAIVisionAnalysis {
  foodName: string;
  category: 'fruit' | 'vegetable' | 'meat' | 'dairy' | 'grain' | 'seafood' | 'processed' | 'other';
  freshness: 'fresh' | 'ripening' | 'rotten';
  moldDetected: boolean;
  confidence: number;
  description: string;
  shelfLife: string;
  optimalStorage: string;
  safetyAssessment: string;
}

export class OpenAIVisionService {
  private apiKey: string;
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
    
    if (typeof window !== 'undefined') {
      console.log('[OpenAI Vision] Service initialized:', {
        hasApiKey: !!this.apiKey,
        apiKeyPrefix: this.apiKey ? this.apiKey.substring(0, 8) + '...' : 'NOT SET',
      });
    }
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey.trim() !== '');
  }

  /**
   * Analizza un'immagine di cibo usando GPT-4 Vision
   */
  async analyzeImage(imageBase64: string): Promise<OpenAIVisionAnalysis> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API Key not configured. Add NEXT_PUBLIC_OPENAI_API_KEY to .env.local');
    }

    // Rimuovi il prefisso data URI se presente
    const base64Data = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;

    console.log('[OpenAI Vision] Analyzing image...');

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o', // Usa 'gpt-4-turbo' o 'gpt-4-vision-preview' se gpt-4o non è disponibile
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analizza questa immagine di cibo e rispondi SOLO con un JSON valido nel seguente formato:
{
  "foodName": "nome dell'alimento (es: Banana, Mela, Pomodoro)",
  "category": "fruit|vegetable|meat|dairy|grain|seafood|processed|other",
  "freshness": "fresh|ripening|rotten",
  "moldDetected": true|false,
  "confidence": 0.0-1.0,
  "description": "breve descrizione visiva",
  "shelfLife": "es: 7-14 days",
  "optimalStorage": "es: Refrigerator (4-8°C)",
  "safetyAssessment": "breve valutazione sicurezza"
}

Rispondi SOLO con il JSON, senza altro testo.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Data}`
                  }
                }
              ]
            }
          ],
          max_tokens: 500,
          temperature: 0.3, // Più deterministico per analisi
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No response from OpenAI API');
      }

      // Estrai JSON dalla risposta (potrebbe avere markdown code blocks)
      let jsonText = content.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const analysis = JSON.parse(jsonText) as OpenAIVisionAnalysis;

      console.log('[OpenAI Vision] Analysis completed:', {
        foodName: analysis.foodName,
        category: analysis.category,
        freshness: analysis.freshness,
        confidence: analysis.confidence,
      });

      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[OpenAI Vision] Error:', errorMessage);
      throw error;
    }
  }

  /**
   * Converte l'analisi OpenAI nel formato ImageAnalysisResult
   */
  convertToImageAnalysisResult(analysis: OpenAIVisionAnalysis, imageBase64: string): {
    foodType: {
      name: string;
      category: 'fruit' | 'vegetable' | 'meat' | 'dairy' | 'grain' | 'seafood' | 'processed' | 'other';
      confidence: number;
      shelfLife: string;
      optimalStorage: string;
    };
    moldDetected: boolean;
    moldPercentage: number;
    dominantColors: string[];
    colorAnalysis: {
      healthy: number;
      warning: number;
      danger: number;
    };
    confidence: number;
  } {
    // Calcola percentuale muffa basata sulla freschezza
    let moldPercentage = 0;
    if (analysis.moldDetected) {
      moldPercentage = analysis.freshness === 'rotten' ? 50 : analysis.freshness === 'ripening' ? 15 : 5;
    }

    // Calcola distribuzione colori basata sulla freschezza
    let healthy = 70;
    let warning = 20;
    let danger = 10;

    if (analysis.freshness === 'ripening') {
      healthy = 50;
      warning = 30;
      danger = 20;
    } else if (analysis.freshness === 'rotten') {
      healthy = 10;
      warning = 20;
      danger = 70;
    }

    return {
      foodType: {
        name: analysis.foodName,
        category: analysis.category,
        confidence: Math.round(analysis.confidence * 100),
        shelfLife: analysis.shelfLife,
        optimalStorage: analysis.optimalStorage,
      },
      moldDetected: analysis.moldDetected,
      moldPercentage,
      dominantColors: ['#8B4513', '#228B22', '#FFD700'], // Colori di default, potrebbero essere calcolati
      colorAnalysis: {
        healthy,
        warning,
        danger,
      },
      confidence: Math.round(analysis.confidence * 100),
    };
  }
}

export default OpenAIVisionService;

