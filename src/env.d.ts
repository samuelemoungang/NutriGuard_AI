/**
 * Type Declarations for RoboFlow Environment Variables
 * Questo file fornisce autocompletion per le variabili d'ambiente RoboFlow
 */

interface ProcessEnv {
  /**
   * RoboFlow API Key (Obbligatorio)
   * Ottenibile da: https://app.roboflow.com/settings/account/api
   * Formato: stringa alfanumerica
   * Esempio: "rf_abc123xyz789"
   */
  NEXT_PUBLIC_ROBOFLOW_API_KEY?: string;

  /**
   * RoboFlow API URL (Opzionale)
   * Default: https://api.roboflow.com/api/
   * Cambia solo se usi un'istanza self-hosted
   */
  NEXT_PUBLIC_ROBOFLOW_API_URL?: string;

  /**
   * RoboFlow Project ID (Opzionale)
   * Default: freshness-fruits-and-vegetables
   * Esempio: "freshness-fruits-and-vegetables"
   * Vedi: https://universe.roboflow.com
   */
  NEXT_PUBLIC_ROBOFLOW_PROJECT_ID?: string;

  /**
   * RoboFlow Model Version (Opzionale)
   * Default: 1
   * Numero versione del modello sul workspace RoboFlow
   */
  NEXT_PUBLIC_ROBOFLOW_MODEL_VERSION?: string;

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
}

declare namespace NodeJS {
  interface ProcessEnv extends ProcessEnv {}
}

/**
 * Helper per accedere alle variabili RoboFlow con type safety
 */
export const RoboFlowConfig = {
  apiKey: process.env.NEXT_PUBLIC_ROBOFLOW_API_KEY,
  apiUrl: process.env.NEXT_PUBLIC_ROBOFLOW_API_URL || 'https://api.roboflow.com/api/',
  projectId: process.env.NEXT_PUBLIC_ROBOFLOW_PROJECT_ID || 'freshness-fruits-and-vegetables',
  modelVersion: process.env.NEXT_PUBLIC_ROBOFLOW_MODEL_VERSION || '1',

  /**
   * Verifica se la configurazione è valida
   */
  isValid(): boolean {
    return !!this.apiKey;
  },

  /**
   * Ottieni il messaggio di errore se configurazione incompleta
   */
  getErrorMessage(): string | null {
    if (!this.apiKey) {
      return 'NEXT_PUBLIC_ROBOFLOW_API_KEY non è configurato. Aggiungi la tua API Key a .env.local';
    }
    return null;
  },

  /**
   * Ottieni informazioni di debug
   */
  getDebugInfo() {
    return {
      apiKey: this.apiKey ? '***' + this.apiKey.slice(-4) : 'NOT SET',
      apiUrl: this.apiUrl,
      projectId: this.projectId,
      modelVersion: this.modelVersion,
      isValid: this.isValid(),
    };
  },
} as const;

export type RoboFlowConfig = typeof RoboFlowConfig;
