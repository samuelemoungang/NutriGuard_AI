/**
 * Type Declarations for Environment Variables
 * Questo file fornisce autocompletion per le variabili d'ambiente
 */

interface ProcessEnv {
  /**
   * Flowise Quality Classification Endpoint (Opzionale)
   * URL dell'agente Flowise per la classificazione qualità
   * Esempio: http://localhost:3000/api/v1/prediction/flow-id
   */
  NEXT_PUBLIC_FLOWISE_CLASSIFY_URL?: string;

  /**
   * Flowise Feedback Endpoint (Opzionale)
   * URL dell'agente Flowise per il feedback finale
   */
  NEXT_PUBLIC_FLOWISE_FEEDBACK_URL?: string;

  /**
   * Roboflow API Key (RICHIESTO)
   * Ottenibile da: https://app.roboflow.com/settings/api
   */
  NEXT_PUBLIC_ROBOFLOW_API_KEY?: string;

  /**
   * Roboflow Workflow URL (RICHIESTO)
   * URL del workflow serverless
   * Esempio: https://serverless.roboflow.com/nutriguard/workflows/yolov8
   */
  NEXT_PUBLIC_ROBOFLOW_WORKFLOW_URL?: string;
}

declare namespace NodeJS {
  interface ProcessEnv extends ProcessEnv {}
}
