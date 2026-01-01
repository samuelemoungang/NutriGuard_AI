import { useState, useCallback } from 'react';
import RoboFlowService, { RoboFlowPrediction } from '@/services/roboflowService';

export interface UseRoboFlowReturn {
  isAnalyzing: boolean;
  error: string | null;
  prediction: RoboFlowPrediction | null;
  analyzeImage: (imageBase64: string) => Promise<RoboFlowPrediction | null>;
  reset: () => void;
}

/**
 * Hook per gestire l'analisi con RoboFlow
 * Fornisce uno stato semplice per l'utilizzo in componenti React
 */
export function useRoboFlow(): UseRoboFlowReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<RoboFlowPrediction | null>(null);

  const roboflowService = new RoboFlowService();

  const analyzeImage = useCallback(
    async (imageBase64: string): Promise<RoboFlowPrediction | null> => {
      setIsAnalyzing(true);
      setError(null);

      try {
        const result = await roboflowService.analyzeImage(imageBase64);
        setPrediction(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsAnalyzing(false);
    setError(null);
    setPrediction(null);
  }, []);

  return {
    isAnalyzing,
    error,
    prediction,
    analyzeImage,
    reset,
  };
}

export default useRoboFlow;
