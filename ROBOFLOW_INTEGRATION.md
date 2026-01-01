# 🤖 RoboFlow Integration Guide - NutriGuard AI

## Panoramica

Il progetto NutriGuard AI ora supporta l'integrazione con **RoboFlow**, un modello specializzato per il rilevamento della freschezza di frutta e verdura. Questo guide ti aiuterà a configurare e utilizzare il servizio RoboFlow nel tuo progetto.

## Che cos'è RoboFlow?

RoboFlow è una piattaforma AI che offre modelli pre-allenati per il rilevamento degli oggetti in immagini. Nel nostro caso, utilizziamo il modello:

- **Progetto**: `freshness-fruits-and-vegetables`
- **URL**: https://universe.roboflow.com/college-74jj5/freshness-fruits-and-vegetables
- **Accuratezza**: 99.6%
- **Modello**: YOLOv8 customizzato

## Configurazione

### 1. Ottenere l'API Key di RoboFlow

1. Accedi a https://app.roboflow.com
2. Vai in **Settings** → **Account** → **API**
3. Copia il tuo **API Key privato**
4. Salva la chiave in un luogo sicuro

### 2. Configurare le Variabili d'Ambiente

Crea un file `.env.local` nella root del progetto:

```bash
# .env.local
NEXT_PUBLIC_ROBOFLOW_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_ROBOFLOW_PROJECT_ID=freshness-fruits-and-vegetables
NEXT_PUBLIC_ROBOFLOW_MODEL_VERSION=1
```

**Nota**: Non committare `.env.local` su Git! È già incluso in `.gitignore`.

### 3. Installare le Dipendenze Necessarie

Il progetto utilizza le API native del browser per gestire le immagini. Non sono necessarie dipendenze aggiuntive, ma assicurati di avere:

- Next.js 16+
- React 19+
- TypeScript 5+

## Utilizzo nel Progetto

### File Principali

#### 1. **Servizio RoboFlow** (`src/services/roboflowService.ts`)

```typescript
import RoboFlowService from '@/services/roboflowService';

// Crea un'istanza del servizio
const roboflowService = new RoboFlowService();

// Analizza un'immagine (base64 o URL)
const prediction = await roboflowService.analyzeImage(imageBase64);

// Analizza i risultati
const analysis = roboflowService.analyzeDetections(prediction);
console.log(analysis);
// Output: {
//   moldDetected: boolean,
//   moldPercentage: number,
//   freshness: 'fresh' | 'ripening' | 'rotten',
//   confidence: number
// }
```

#### 2. **Componente ImageAnalysisStep** (`src/components/ImageAnalysisStep.tsx`)

Il componente è già integrato con RoboFlow. Durante l'analisi:

1. Carica il modello RoboFlow
2. Invia l'immagine al servizio RoboFlow
3. Riceve i rilevamenti (detections)
4. Analizza la freschezza
5. Mostra i risultati nell'interfaccia

### API Response Structure

Quando RoboFlow processa un'immagine, ritorna:

```typescript
{
  predictions: [
    {
      x: number,        // Coordinata X del centro
      y: number,        // Coordinata Y del centro
      width: number,    // Larghezza del bounding box
      height: number,   // Altezza del bounding box
      confidence: number, // Confidence score (0-1)
      class: string,    // Nome della classe rilevata
      class_id: number  // ID numerico della classe
    }
  ],
  image: {
    width: number,
    height: number
  },
  success: boolean,
  error?: string
}
```

## Classi Disponibili nel Modello

Il modello RoboFlow per "freshness-fruits-and-vegetables" rileva:

- **Fresh** - Frutto/verdura fresco
- **Rotten** - Frutto/verdura marcio
- **Mold** - Presenza di muffa
- **Overripe** - Troppo maturo
- **Unripe** - Non ancora maturo

## Integrazione nel Flusso di Analisi

### Step 1: Image Analysis (con RoboFlow)
```
User Upload Image
    ↓
RoboFlow detects freshness status
    ↓
Extract color analysis & mold detection
    ↓
Pass to Signal Processing
```

### Step 2-4: Elaborazione Ulteriore
- **Signal Processing**: Analizza dati chimici (pH, gas)
- **Quality Classification**: Assegna voto (A-F)
- **Final Feedback**: Fornisce raccomandazioni

## Fallback & Error Handling

Se l'API Key non è configurata o RoboFlow non è disponibile:

1. Il servizio ritorna una predizione mock
2. L'analisi continua con i dati locali
3. Un warning viene mostrato nel terminal

```typescript
addLog('warning', 'RoboFlow API call failed, using fallback analysis');
```

## Best Practices

### 1. Immagini di Input
- **Formato**: JPEG, PNG
- **Dimensione**: 640x480 minimo
- **Qualità**: Buona illuminazione, no blur

### 2. Gestione dell'API
- Cache i risultati quando possibile
- Implementa retry logic per errori transitori
- Monitora l'utilizzo delle quote API

### 3. Sicurezza
- **Non** committare `.env.local`
- Usa `NEXT_PUBLIC_` solo per chiavi pubbliche sicure
- Considera un backend proxy per chiavi private

## Troubleshooting

### "API Key non configurata"
```
Soluzione: Aggiungi NEXT_PUBLIC_ROBOFLOW_API_KEY a .env.local
```

### "Errore 401 Unauthorized"
```
Soluzione: Verifica che l'API Key sia corretta e non scaduta
```

### "Rate limit exceeded"
```
Soluzione: Implementa backoff/retry o aggiorna il piano RoboFlow
```

### Le predizioni sono sempre mock
```
Soluzione: Verifica che il progetto sia pubblico su RoboFlow
Vedi: https://docs.roboflow.com/api-reference/hosted-api
```

## Documentazione Esterna

- **RoboFlow Docs**: https://docs.roboflow.com
- **API Reference**: https://docs.roboflow.com/api-reference/hosted-api
- **Modello Project**: https://universe.roboflow.com/college-74jj5/freshness-fruits-and-vegetables
- **Python SDK**: https://docs.roboflow.com/python

## Prossimi Passi

### 1. Ottenere l'API Key
- [ ] Registrati su RoboFlow
- [ ] Copia l'API Key
- [ ] Aggiungi a `.env.local`

### 2. Testare l'Integrazione
```bash
npm run dev
# Visita http://localhost:3000
# Carica un'immagine di frutta/verdura
# Verifica i log del RoboFlow
```

### 3. (Opzionale) Affinare il Modello
Se le predizioni non sono accurate:
- Raccogli dati di training
- Riallena il modello su RoboFlow
- Deploya una nuova versione

## Support

Per aiuto:
1. Controlla la documentazione di RoboFlow
2. Vedi il log del terminal nel componente
3. Verifica la console del browser (DevTools)
4. Apri un issue su GitHub

---

**Versione**: 1.0
**Ultimo Aggiornamento**: Gennaio 2026
