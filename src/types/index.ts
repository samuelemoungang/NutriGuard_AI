export interface TerminalLog {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'processing';
  message: string;
  timestamp: Date;
}

export interface FoodType {
  name: string;
  category: 'fruit' | 'vegetable' | 'meat' | 'dairy' | 'grain' | 'seafood' | 'processed' | 'other';
  confidence: number;
  shelfLife: string;
  optimalStorage: string;
}

export interface ImageAnalysisResult {
  foodType: FoodType;
  moldDetected: boolean;
  moldPercentage: number;
  dominantColors: string[];
  colorAnalysis: {
    healthy: number;
    warning: number;
    danger: number;
  };
  confidence: number;
}

export interface SignalProcessingData {
  ph: number;
  gasLevel: number;
  storageTime: number;
  temperature?: number;
}

export interface QualityClassification {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  factors: {
    visual: number;
    chemical: number;
    storage: number;
  };
}

export interface FinalFeedback {
  isSafe: boolean;
  recommendation: string;
  explanation: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface AppState {
  currentStep: number;
  uploadedImage: string | null;
  imageFile: File | null;
  imageAnalysis: ImageAnalysisResult | null;
  signalData: SignalProcessingData | null;
  classification: QualityClassification | null;
  feedback: FinalFeedback | null;
  isProcessing: boolean;
}

export type StepStatus = 'pending' | 'active' | 'completed';
