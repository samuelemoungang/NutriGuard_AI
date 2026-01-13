/**
 * Roboflow Serverless Workflow Service
 * Utilizza YOLOv8 per il riconoscimento degli alimenti
 */

export interface RoboflowPrediction {
  class: string;
  confidence: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface RoboflowWorkflowResponse {
  predictions?: RoboflowPrediction[];
  outputs?: {
    predictions?: RoboflowPrediction[];
    [key: string]: unknown;
  }[];
  time?: number;
  image?: {
    width: number;
    height: number;
  };
}

export interface FoodAnalysisResult {
  foodName: string;
  confidence: number;
  category: string;
  freshness: string;
  allPredictions: RoboflowPrediction[];
}

class RoboflowWorkflowService {
  private apiKey: string;
  private workflowUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ROBOFLOW_API_KEY || '';
    this.workflowUrl = process.env.NEXT_PUBLIC_ROBOFLOW_WORKFLOW_URL || '';
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.workflowUrl);
  }

  getConfigStatus(): { apiKey: boolean; workflowUrl: boolean } {
    return {
      apiKey: !!this.apiKey,
      workflowUrl: !!this.workflowUrl,
    };
  }

  async analyzeImage(imageBase64: string): Promise<FoodAnalysisResult> {
    if (!this.isConfigured()) {
      const status = this.getConfigStatus();
      const missing = [];
      if (!status.apiKey) missing.push('NEXT_PUBLIC_ROBOFLOW_API_KEY');
      if (!status.workflowUrl) missing.push('NEXT_PUBLIC_ROBOFLOW_WORKFLOW_URL');
      throw new Error(`Roboflow not configured. Missing: ${missing.join(', ')}`);
    }

    // Remove data URL prefix if present
    const base64Data = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;

    console.log('[Roboflow] Starting image analysis...');
    console.log('[Roboflow] Image size:', Math.round(base64Data.length / 1024), 'KB');
    console.log('[Roboflow] Workflow URL:', this.workflowUrl);

    try {
      const startTime = Date.now();
      
      // Call our API route to avoid CORS issues
      const response = await fetch('/api/roboflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
          apiKey: this.apiKey,
          workflowUrl: this.workflowUrl,
        }),
      });

      const elapsedTime = Date.now() - startTime;
      console.log('[Roboflow] API call completed in', elapsedTime, 'ms');

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Roboflow] API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        
        // Provide more helpful error messages
        if (response.status === 401) {
          throw new Error('Unauthorized: Invalid API key. Check NEXT_PUBLIC_ROBOFLOW_API_KEY');
        } else if (response.status === 404) {
          throw new Error('Not Found: Invalid workflow URL. Check NEXT_PUBLIC_ROBOFLOW_WORKFLOW_URL');
        } else if (response.status === 400) {
          throw new Error(`Bad Request: ${errorText}`);
        } else {
          throw new Error(`Roboflow API error (${response.status}): ${errorText}`);
        }
      }

      const data: RoboflowWorkflowResponse = await response.json();
      console.log('[Roboflow] Full response received:', JSON.stringify(data, null, 2));

      const parsedResult = this.parseResponse(data);
      console.log('[Roboflow] Parsed result:', parsedResult);
      
      return parsedResult;
    } catch (error) {
      console.error('[Roboflow] Analysis failed:', error);
      
      // Re-throw with more context if it's not already an Error
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Unknown error during analysis: ${String(error)}`);
      }
    }
  }

  private parseResponse(data: RoboflowWorkflowResponse): FoodAnalysisResult {
    // Extract predictions from various response formats
    let predictions: RoboflowPrediction[] = [];

    console.log('[Roboflow] Parsing response:', JSON.stringify(data, null, 2));

    if (data.predictions && Array.isArray(data.predictions)) {
      predictions = data.predictions;
    } else if (data.outputs && Array.isArray(data.outputs)) {
      // Workflow format - check all possible structures
      for (const output of data.outputs) {
        console.log('[Roboflow] Checking output:', JSON.stringify(output, null, 2));
        
        // Check for predictions array
        if (output.predictions && Array.isArray(output.predictions)) {
          predictions = output.predictions;
          break;
        }
        
        // Check for nested predictions in various keys
        const outputAny = output as Record<string, unknown>;
        for (const key of Object.keys(outputAny)) {
          const value = outputAny[key];
          
          // Check if it's a predictions object with nested data
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            const valueObj = value as Record<string, unknown>;
            if (valueObj.predictions && Array.isArray(valueObj.predictions)) {
              predictions = valueObj.predictions as RoboflowPrediction[];
              console.log('[Roboflow] Found predictions in', key, ':', predictions);
              break;
            }
          }
          
          // Check if it's directly an array of predictions
          if (Array.isArray(value) && value.length > 0) {
            const firstItem = value[0];
            if (firstItem && (firstItem.class || firstItem.label || firstItem.name)) {
              predictions = value.map(item => ({
                class: item.class || item.label || item.name || 'unknown',
                confidence: item.confidence || item.score || 0,
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
              }));
              console.log('[Roboflow] Found predictions array in', key, ':', predictions);
              break;
            }
          }
        }
        
        if (predictions.length > 0) break;
      }
    }

    // Try to find predictions in any nested structure
    if (predictions.length === 0) {
      const findPredictions = (obj: unknown, depth = 0): RoboflowPrediction[] => {
        if (depth > 5 || !obj || typeof obj !== 'object') return [];
        
        if (Array.isArray(obj)) {
          if (obj.length > 0 && obj[0] && (obj[0].class || obj[0].label)) {
            return obj.map(item => ({
              class: item.class || item.label || 'unknown',
              confidence: item.confidence || item.score || 0,
            }));
          }
          for (const item of obj) {
            const found = findPredictions(item, depth + 1);
            if (found.length > 0) return found;
          }
        } else {
          for (const value of Object.values(obj)) {
            const found = findPredictions(value, depth + 1);
            if (found.length > 0) return found;
          }
        }
        return [];
      };
      
      predictions = findPredictions(data);
      if (predictions.length > 0) {
        console.log('[Roboflow] Found predictions via deep search:', predictions);
      }
    }

    if (predictions.length === 0) {
      console.warn('[Roboflow] No predictions found in response:', data);
      return {
        foodName: 'Unknown Food',
        confidence: 0,
        category: 'unknown',
        freshness: 'unknown',
        allPredictions: [],
      };
    }

    // Sort by confidence and get the best prediction
    const sortedPredictions = [...predictions].sort((a, b) => b.confidence - a.confidence);
    const bestPrediction = sortedPredictions[0];

    // Determine category based on class name
    const category = this.determineCategory(bestPrediction.class);
    
    // Determine freshness (if the model provides it, otherwise estimate)
    const freshness = this.determineFreshness(bestPrediction.class, predictions);

    return {
      foodName: this.formatFoodName(bestPrediction.class),
      confidence: bestPrediction.confidence,
      category,
      freshness,
      allPredictions: sortedPredictions,
    };
  }

  private formatFoodName(className: string): string {
    // Convert class name to readable format
    return className
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private determineCategory(className: string): string {
    const lowerClass = className.toLowerCase();
    
    const categories: Record<string, string[]> = {
      fruit: ['apple', 'banana', 'orange', 'grape', 'strawberry', 'mango', 'pear', 'peach', 'cherry', 'watermelon', 'melon', 'kiwi', 'pineapple', 'lemon', 'lime', 'fruit'],
      vegetable: ['carrot', 'tomato', 'potato', 'onion', 'lettuce', 'broccoli', 'cucumber', 'pepper', 'spinach', 'cabbage', 'celery', 'vegetable', 'zucchini', 'eggplant'],
      meat: ['beef', 'chicken', 'pork', 'lamb', 'steak', 'meat', 'ham', 'bacon', 'sausage'],
      seafood: ['fish', 'salmon', 'tuna', 'shrimp', 'lobster', 'crab', 'seafood', 'squid'],
      dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'dairy', 'egg'],
      grain: ['bread', 'rice', 'pasta', 'cereal', 'wheat', 'oat', 'grain', 'noodle'],
      processed: ['pizza', 'burger', 'sandwich', 'fries', 'chips', 'cake', 'cookie', 'candy', 'soda', 'processed'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerClass.includes(keyword))) {
        return category;
      }
    }

    return 'other';
  }

  private determineFreshness(className: string, predictions: RoboflowPrediction[]): string {
    const lowerClass = className.toLowerCase();
    
    // Check if the model explicitly detected freshness
    if (lowerClass.includes('fresh')) return 'fresh';
    if (lowerClass.includes('rotten') || lowerClass.includes('spoiled')) return 'spoiled';
    if (lowerClass.includes('stale') || lowerClass.includes('old')) return 'stale';
    
    // Check other predictions for freshness indicators
    for (const pred of predictions) {
      const predClass = pred.class.toLowerCase();
      if (predClass.includes('mold') || predClass.includes('rotten')) {
        return 'spoiled';
      }
    }

    // Default to fresh if no negative indicators
    return 'fresh';
  }

  convertToImageAnalysisResult(analysis: FoodAnalysisResult, imageBase64: string) {
    const shelfLifeMap: Record<string, string> = {
      fruit: '3-7 days',
      vegetable: '5-10 days',
      meat: '3-5 days (refrigerated)',
      seafood: '1-2 days (refrigerated)',
      dairy: '1-2 weeks',
      grain: '1-2 weeks',
      processed: 'Check packaging',
      other: 'Varies',
    };

    const storageMap: Record<string, string> = {
      fruit: 'Cool, dry place or refrigerator',
      vegetable: 'Refrigerator crisper drawer',
      meat: 'Refrigerator at 0-4°C',
      seafood: 'Refrigerator, use quickly',
      dairy: 'Refrigerator at 0-4°C',
      grain: 'Cool, dry place',
      processed: 'Check packaging',
      other: 'Check product guidelines',
    };

    const isSpoiled = analysis.freshness === 'spoiled' || analysis.freshness === 'stale';

    return {
      foodType: {
        name: analysis.foodName,
        category: analysis.category,
        confidence: Math.round(analysis.confidence * 100),
        shelfLife: shelfLifeMap[analysis.category] || 'Varies',
        optimalStorage: storageMap[analysis.category] || 'Check guidelines',
      },
      moldDetected: isSpoiled,
      moldPercentage: isSpoiled ? 15 : 0,
      dominantColors: ['#4CAF50', '#8BC34A', '#CDDC39'], // Placeholder
      colorAnalysis: {
        healthy: isSpoiled ? 60 : 85,
        warning: isSpoiled ? 25 : 10,
        danger: isSpoiled ? 15 : 5,
      },
      confidence: analysis.confidence * 100,
    };
  }
}

export default RoboflowWorkflowService;

