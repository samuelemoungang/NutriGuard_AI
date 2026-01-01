# 🔗 Link Importanti e Risorse RoboFlow

## 📚 Documentazione Interna

### Leggi Questi Files (In Ordine)

1. **[ROBOFLOW_QUICKSTART.md](./ROBOFLOW_QUICKSTART.md)** ← INIZIA QUI
   - Setup veloce in 3 step (5 minuti)
   - Chiara checklist
   - Troubleshooting base

2. **[ROBOFLOW_INTEGRATION.md](./ROBOFLOW_INTEGRATION.md)**
   - Guida completa e dettagliata
   - API reference
   - Best practices
   - Troubleshooting avanzato

3. **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**
   - Struttura del progetto
   - File new/modificati
   - Diagrammi del flusso

4. **[ROBOFLOW_EXAMPLES.ts](./ROBOFLOW_EXAMPLES.ts)**
   - 10 esempi di codice
   - Integrazione avanzata
   - Caching, retry, batch processing

## 🤖 RoboFlow Ufficiale

### Documentazione RoboFlow
- **Docs Principale**: https://docs.roboflow.com
- **API Reference**: https://docs.roboflow.com/api-reference/hosted-api
- **Python SDK**: https://docs.roboflow.com/python

### Account e Setup
- **Login/Registrazione**: https://app.roboflow.com
- **Ottieni API Key**: https://app.roboflow.com/settings/account/api
- **Gestisci Progetti**: https://app.roboflow.com/workspace

### Modello Utilizzato
- **Progetto**: https://universe.roboflow.com/college-74jj5/freshness-fruits-and-vegetables
- **Nome**: `freshness-fruits-and-vegetables`
- **Versione**: 1
- **Accuracy**: 99.6%

## 💻 File Principali del Progetto

### Servizi
- **[src/services/roboflowService.ts](./src/services/roboflowService.ts)**
  - Logica RoboFlow
  - Methods: analyzeImage(), analyzeDetections()
  - Types: RoboFlowDetection, RoboFlowPrediction

### Hooks
- **[src/hooks/useRoboFlow.ts](./src/hooks/useRoboFlow.ts)**
  - Hook React per RoboFlow
  - State management
  - Gestione errori

### Componenti
- **[src/components/ImageAnalysisStep.tsx](./src/components/ImageAnalysisStep.tsx)**
  - Componente analisi immagini
  - Integrato RoboFlow nel flusso
  - Mostra log nel terminale

- **[src/components/RoboFlowVisualizer.tsx](./src/components/RoboFlowVisualizer.tsx)**
  - Visualizzazione predizioni
  - Canvas con bounding box
  - Statistiche freschezza

### Configurazione
- **[.env.example](./.env.example)**
  - Template variabili d'ambiente
  - Copia a `.env.local` e personalizza

## 🎓 Tutorial e Guide

### Setup (Segui in Ordine)
1. Vai su https://app.roboflow.com
2. Crea account (gratuito)
3. Vai a Settings → Account → API
4. Copia la API Key
5. Crea `.env.local` nel progetto
6. Aggiungi: `NEXT_PUBLIC_ROBOFLOW_API_KEY=your_key`
7. Esegui: `npm run dev`
8. Testa caricando un'immagine

### Variabili d'Ambiente

```bash
# .env.local

# OBBLIGATORIO
NEXT_PUBLIC_ROBOFLOW_API_KEY=your_actual_key_here

# OPZIONALI (hanno valori default)
NEXT_PUBLIC_ROBOFLOW_API_URL=https://api.roboflow.com/api/
NEXT_PUBLIC_ROBOFLOW_PROJECT_ID=freshness-fruits-and-vegetables
NEXT_PUBLIC_ROBOFLOW_MODEL_VERSION=1
```

## 🐛 Troubleshooting Rapido

### Problema: "API Key not configured"
**Soluzione**: Aggiungi `NEXT_PUBLIC_ROBOFLOW_API_KEY` a `.env.local`

### Problema: "401 Unauthorized"
**Soluzione**: Verifica che l'API Key sia corretta su https://app.roboflow.com/settings/account/api

### Problema: Ottieni sempre dati mock
**Soluzione**: Controlla che il progetto RoboFlow sia pubblico

### Problema: "429 Too Many Requests"
**Soluzione**: Hai superato il rate limit. Implementa backoff exponential o aggiorna il piano

## 📞 Come Ottenere Aiuto

### Documentazione
- RoboFlow Docs: https://docs.roboflow.com
- Questo Progetto: Vedi [ROBOFLOW_INTEGRATION.md](./ROBOFLOW_INTEGRATION.md)

### Community
- RoboFlow Forum: https://discuss.roboflow.com
- RoboFlow GitHub: https://github.com/roboflow

## 🚀 Deployment

### Variabili di Produzione
Quando farai deploy, assicurati di:

```bash
# Su Vercel, Netlify, o altra piattaforma
# Aggiungi come variabile d'ambiente:
NEXT_PUBLIC_ROBOFLOW_API_KEY=your_production_key
```

### Sicurezza
- ✅ Non committare `.env.local`
- ✅ Usa `NEXT_PUBLIC_` solo per chiavi pubbliche
- ✅ Per chiavi private, usa un backend proxy

## 📊 Modelli RoboFlow Disponibili

Puoi usare altri modelli RoboFlow:

1. Vai su https://universe.roboflow.com
2. Cerca il modello che vuoi
3. Nota il `project_id` e la `version`
4. Aggiorna `.env.local`:
   ```
   NEXT_PUBLIC_ROBOFLOW_PROJECT_ID=your_project_id
   NEXT_PUBLIC_ROBOFLOW_MODEL_VERSION=your_version
   ```

### Modelli Suggeriti per Food
- **Freshness Detection** (quello usato): https://universe.roboflow.com/college-74jj5/freshness-fruits-and-vegetables
- **Food Detection**: Cerca su universe.roboflow.com
- **Mold Detection**: Cerca su universe.roboflow.com

## 🎯 Roadmap

### Completato ✓
- [x] Integrazione RoboFlow API
- [x] Hook React personalizzato
- [x] Componenti visualizzazione
- [x] Documentazione completa
- [x] Esempi di codice

### Prossimi Step (Opzionali)
- [ ] Caching del lato client
- [ ] WebWorker per heavy computation
- [ ] Modelli custom affinati
- [ ] Analytics e monitoring
- [ ] UI avanzata con feedback user

## 💡 Tips & Tricks

### Ottenere Migliori Risultati
- Usa immagini di buona qualità
- Buona illuminazione
- No blur o immagini sfocate
- Centrati sulla frutta/verdura

### Performance
- Implementa caching per stesse immagini
- Usa batch processing per multiple immagini
- Aggiungi loading indicators

### Testing
- Test offline con `.env.local` vuoto
- Test online con API Key valida
- Verifica i log nel componente Terminal

## 📈 Metriche e Monitoring

Per tracciare performance:

```typescript
// Monitorare API calls
const startTime = Date.now();
const prediction = await roboflow.analyzeImage(imageBase64);
const duration = Date.now() - startTime;
console.log(`API call: ${duration}ms`);
```

Vedi [ROBOFLOW_EXAMPLES.ts](./ROBOFLOW_EXAMPLES.ts) per un esempio completo di monitoring.

---

**Ultimo Aggiornamento**: Gennaio 2026
**Status**: ✅ Completo e Funzionante
