/**
 * Gemini Vision Service for Food Quality Analysis
 * Analyzes food freshness, mold, discoloration, and overall quality
 */

export interface QualityAnalysisResult {
  overallQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'unsafe';
  freshnessScore: number; // 0-100
  issues: string[];
  description: string;
  recommendations: string[];
  moldDetected: boolean;
  discoloration: boolean;
  safeToEat: boolean;
}

class GeminiQualityService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async analyzeQuality(imageBase64: string, foodName: string): Promise<QualityAnalysisResult> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured');
    }

    // Remove data URL prefix if present
    const base64Data = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;

    try {
      const response = await fetch('/api/gemini-quality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
          foodName: foodName,
          apiKey: this.apiKey,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[Gemini Quality] Error:', error);
      throw error;
    }
  }
}

export default GeminiQualityService;

