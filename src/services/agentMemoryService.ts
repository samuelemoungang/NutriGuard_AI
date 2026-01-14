/**
 * Agent Memory Service
 * Servizio centralizzato per memorizzare e condividere gli output tra tutti gli agent
 * 
 * Questo servizio implementa un pattern di memoria condivisa (shared memory pattern)
 * che permette a tutti gli agent di accedere ai risultati degli agent precedenti.
 */

import {
  ImageAnalysisResult,
  SignalProcessingData,
  QualityClassification,
  FinalFeedback,
} from '@/types';

interface AgentMemory {
  // Output del primo agent (Image Analysis)
  imageAnalysis: ImageAnalysisResult | null;
  
  // Output del secondo agent (Signal Processing)
  signalData: SignalProcessingData | null;
  
  // Output del terzo agent (Quality Classification)
  classification: QualityClassification | null;
  
  // Output del quarto agent (Final Feedback)
  feedback: FinalFeedback | null;
  
  // Metadata
  timestamp: Date | null;
  sessionId: string | null;
}

class AgentMemoryService {
  private memory: AgentMemory;
  private listeners: Set<(memory: AgentMemory) => void>;

  constructor() {
    this.memory = {
      imageAnalysis: null,
      signalData: null,
      classification: null,
      feedback: null,
      timestamp: null,
      sessionId: null,
    };
    this.listeners = new Set();
  }

  /**
   * Salva l'output del primo agent (Image Analysis)
   * Questo è il dato principale che tutti gli altri agent devono poter accedere
   */
  setImageAnalysis(result: ImageAnalysisResult): void {
    this.memory.imageAnalysis = result;
    this.memory.timestamp = new Date();
    this.notifyListeners();
    console.log('[AgentMemory] Image Analysis saved:', result);
  }

  /**
   * Salva l'output del secondo agent (Signal Processing)
   */
  setSignalData(data: SignalProcessingData): void {
    this.memory.signalData = data;
    this.notifyListeners();
    console.log('[AgentMemory] Signal Data saved:', data);
  }

  /**
   * Salva l'output del terzo agent (Quality Classification)
   */
  setClassification(classification: QualityClassification): void {
    this.memory.classification = classification;
    this.notifyListeners();
    console.log('[AgentMemory] Classification saved:', classification);
  }

  /**
   * Salva l'output del quarto agent (Final Feedback)
   */
  setFeedback(feedback: FinalFeedback): void {
    this.memory.feedback = feedback;
    this.notifyListeners();
    console.log('[AgentMemory] Feedback saved:', feedback);
  }

  /**
   * Ottiene l'output del primo agent (Image Analysis)
   * Questo è il metodo principale che gli altri agent useranno
   */
  getImageAnalysis(): ImageAnalysisResult | null {
    return this.memory.imageAnalysis;
  }

  /**
   * Ottiene l'output del secondo agent (Signal Processing)
   */
  getSignalData(): SignalProcessingData | null {
    return this.memory.signalData;
  }

  /**
   * Ottiene l'output del terzo agent (Quality Classification)
   */
  getClassification(): QualityClassification | null {
    return this.memory.classification;
  }

  /**
   * Ottiene l'output del quarto agent (Final Feedback)
   */
  getFeedback(): FinalFeedback | null {
    return this.memory.feedback;
  }

  /**
   * Ottiene tutta la memoria (utile per debug o per agent che hanno bisogno di tutto il contesto)
   */
  getAllMemory(): AgentMemory {
    return { ...this.memory };
  }

  /**
   * Verifica se il primo agent ha completato il suo lavoro
   */
  hasImageAnalysis(): boolean {
    return this.memory.imageAnalysis !== null;
  }

  /**
   * Verifica se il secondo agent ha completato il suo lavoro
   */
  hasSignalData(): boolean {
    return this.memory.signalData !== null;
  }

  /**
   * Verifica se il terzo agent ha completato il suo lavoro
   */
  hasClassification(): boolean {
    return this.memory.classification !== null;
  }

  /**
   * Verifica se il quarto agent ha completato il suo lavoro
   */
  hasFeedback(): boolean {
    return this.memory.feedback !== null;
  }

  /**
   * Resetta tutta la memoria (utile per iniziare una nuova analisi)
   */
  reset(): void {
    this.memory = {
      imageAnalysis: null,
      signalData: null,
      classification: null,
      feedback: null,
      timestamp: null,
      sessionId: null,
    };
    this.notifyListeners();
    console.log('[AgentMemory] Memory reset');
  }

  /**
   * Inizia una nuova sessione
   */
  startSession(sessionId?: string): void {
    this.memory.sessionId = sessionId || `session-${Date.now()}`;
    console.log('[AgentMemory] Session started:', this.memory.sessionId);
  }

  /**
   * Ottiene l'ID della sessione corrente
   */
  getSessionId(): string | null {
    return this.memory.sessionId;
  }

  /**
   * Aggiunge un listener per essere notificato quando la memoria cambia
   * Utile per componenti React che vogliono reagire ai cambiamenti
   */
  subscribe(listener: (memory: AgentMemory) => void): () => void {
    this.listeners.add(listener);
    // Restituisce una funzione per rimuovere il listener
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifica tutti i listener quando la memoria cambia
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getAllMemory());
      } catch (error) {
        console.error('[AgentMemory] Error in listener:', error);
      }
    });
  }

  /**
   * Ottiene un riepilogo della memoria (utile per logging)
   */
  getSummary(): string {
    return JSON.stringify({
      hasImageAnalysis: this.hasImageAnalysis(),
      hasSignalData: this.hasSignalData(),
      hasClassification: this.hasClassification(),
      hasFeedback: this.hasFeedback(),
      sessionId: this.memory.sessionId,
      timestamp: this.memory.timestamp,
    }, null, 2);
  }
}

// Esporta un'istanza singleton del servizio
// Questo garantisce che tutti gli agent condividano la stessa memoria
const agentMemoryService = new AgentMemoryService();

export default agentMemoryService;
