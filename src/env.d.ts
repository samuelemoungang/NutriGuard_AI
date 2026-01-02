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
   * OpenAI API Key (Opzionale - a pagamento)
   * Ottenibile da: https://platform.openai.com/api-keys
   * Formato: stringa che inizia con "sk-"
   * Esempio: "sk-proj-abc123xyz789"
   */
  NEXT_PUBLIC_OPENAI_API_KEY?: string;

  /**
   * Hugging Face API Key (Opzionale - per uso illimitato)
   * Funziona anche senza API key (con limiti)
   * Ottenibile da: https://huggingface.co/settings/tokens
   * Formato: stringa che inizia con "hf_"
   * Esempio: "hf_abc123xyz789"
   */
  NEXT_PUBLIC_HUGGINGFACE_API_KEY?: string;
}

declare namespace NodeJS {
  interface ProcessEnv extends ProcessEnv {}
}
