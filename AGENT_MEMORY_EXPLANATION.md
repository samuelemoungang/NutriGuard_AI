# Sistema di Memoria Condivisa tra Agent

## 📋 Panoramica

Ho implementato un **sistema di memoria condivisa** che permette a tutti gli agent di accedere agli output degli agent precedenti. Questo risolve il problema di dover passare i dati solo tramite props React.

## 🏗️ Architettura

### Pattern: Singleton Service

Il sistema usa un **servizio singleton** (`AgentMemoryService`) che funziona come una memoria centrale accessibile da tutti gli agent.

```
┌─────────────────────────────────────────┐
│     AgentMemoryService (Singleton)      │
│                                         │
│  - imageAnalysis: ImageAnalysisResult  │
│  - signalData: SignalProcessingData    │
│  - classification: QualityClassification│
│  - feedback: FinalFeedback             │
└─────────────────────────────────────────┘
         ▲              ▲              ▲
         │              │              │
    ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
    │ Agent 1 │    │ Agent 2 │    │ Agent 3 │
    │ (Image) │    │(Signal) │    │(Quality)│
    └─────────┘    └─────────┘    └─────────┘
```

## 🔄 Come Funziona

### 1. **Primo Agent (ImageAnalysisStep)**
```typescript
// Dopo aver completato l'analisi:
agentMemoryService.setImageAnalysis(finalResult);
```
- Salva il risultato nella memoria condivisa
- Tutti gli agent successivi possono accedervi

### 2. **Secondo Agent (SignalProcessingStep)**
```typescript
// Legge l'output del primo agent:
const imageAnalysis = agentMemoryService.getImageAnalysis();

// Dopo aver completato:
agentMemoryService.setSignalData(formData);
```
- Legge l'output del primo agent dalla memoria
- Salva il proprio output per gli agent successivi

### 3. **Terzo Agent (QualityClassificationStep)**
```typescript
// Legge gli output degli agent precedenti:
const imageAnalysis = agentMemoryService.getImageAnalysis();
const signalData = agentMemoryService.getSignalData();

// Dopo aver completato:
agentMemoryService.setClassification(result);
```
- Accede a tutti i dati degli agent precedenti
- Salva il proprio output

### 4. **Quarto Agent (FinalFeedbackStep)**
```typescript
// Legge tutti gli output:
const allMemory = agentMemoryService.getAllMemory();

// Dopo aver completato:
agentMemoryService.setFeedback(feedback);
```
- Ha accesso completo a tutti i dati precedenti
- Completa il ciclo

## 📝 API del Servizio

### Metodi Principali

```typescript
// Salvare output
agentMemoryService.setImageAnalysis(result);
agentMemoryService.setSignalData(data);
agentMemoryService.setClassification(classification);
agentMemoryService.setFeedback(feedback);

// Leggere output
const imageAnalysis = agentMemoryService.getImageAnalysis();
const signalData = agentMemoryService.getSignalData();
const classification = agentMemoryService.getClassification();
const feedback = agentMemoryService.getFeedback();

// Leggere tutto
const allMemory = agentMemoryService.getAllMemory();

// Verificare presenza
if (agentMemoryService.hasImageAnalysis()) { ... }

// Reset (nuova analisi)
agentMemoryService.reset();
agentMemoryService.startSession();
```

## ✅ Vantaggi

1. **Accesso Universale**: Qualsiasi agent può accedere ai dati di qualsiasi altro agent
2. **Disaccoppiamento**: Gli agent non devono conoscere la struttura dei componenti React
3. **Debugging**: Facile vedere tutti i dati in un unico posto
4. **Estendibilità**: Facile aggiungere nuovi agent che accedono ai dati esistenti
5. **Persistenza**: I dati rimangono disponibili anche se i componenti si smontano

## 🔍 Esempio Pratico

### Prima (senza memoria condivisa):
```typescript
// Ogni agent riceve solo le props passate dal componente padre
<SignalProcessingStep imageAnalysis={imageAnalysis} />
<QualityClassificationStep 
  imageAnalysis={imageAnalysis} 
  signalData={signalData} 
/>
```

### Dopo (con memoria condivisa):
```typescript
// Gli agent leggono direttamente dalla memoria
const imageAnalysis = agentMemoryService.getImageAnalysis();
const signalData = agentMemoryService.getSignalData();
// Non serve passare tutto tramite props!
```

## 🎯 Utilizzo nel Codice

### Nel primo agent:
```typescript
// Dopo aver completato l'analisi
agentMemoryService.setImageAnalysis(finalResult);
addLog('info', 'Output saved to shared memory for downstream agents');
```

### Negli agent successivi:
```typescript
// All'inizio del processing
const imageAnalysis = agentMemoryService.getImageAnalysis();
if (imageAnalysis) {
  addLog('info', `✓ Retrieved Image Analysis from shared memory`);
  addLog('info', `  - Food: ${imageAnalysis.foodType.name}`);
}
```

## 🔄 Reset Automatico

La memoria viene resettata automaticamente quando:
- L'utente carica una nuova immagine
- Si inizia una nuova analisi

```typescript
// In page.tsx
const handleImageUpload = useCallback((file: File, preview: string) => {
  agentMemoryService.reset();
  agentMemoryService.startSession();
  // ...
}, []);
```

## 📊 Logging

Il servizio include logging automatico:
- Quando i dati vengono salvati
- Quando i dati vengono letti
- Quando la memoria viene resettata

Puoi vedere questi log nella console del browser durante l'esecuzione.

## 🚀 Estensioni Future

Il sistema è progettato per essere facilmente estendibile:

1. **Persistenza**: Salvare la memoria in localStorage o sessionStorage
2. **History**: Mantenere uno storico delle analisi
3. **Validation**: Validare i dati prima di salvarli
4. **Events**: Eventi custom per reattività avanzata
5. **Multi-session**: Supporto per più sessioni simultanee

## 📚 File Modificati

- ✅ `src/services/agentMemoryService.ts` (NUOVO)
- ✅ `src/components/ImageAnalysisStep.tsx`
- ✅ `src/components/SignalProcessingStep.tsx`
- ✅ `src/components/QualityClassificationStep.tsx`
- ✅ `src/components/FinalFeedbackStep.tsx`
- ✅ `src/app/page.tsx`

## 🎓 Conclusione

Ora tutti gli agent condividono una memoria comune. L'output del primo agent è sempre disponibile per tutti gli agent successivi, rendendo il sistema più flessibile e facile da mantenere.
