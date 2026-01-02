# 🍕 NutriGuard AI - Setup Guide

## Sistema Ibrido: Roboflow + Gemini Vision

Il progetto usa un sistema ibrido per l'analisi degli alimenti:
- **Roboflow YOLOv8** → Riconoscimento del tipo di cibo
- **Gemini Vision** → Analisi qualità e freschezza

---

## 📋 Configurazione Necessaria

### 1. File `.env.local`

Crea o modifica il file `.env.local` nella root del progetto con queste variabili:

```env
# Roboflow Configuration (Food Recognition)
NEXT_PUBLIC_ROBOFLOW_API_KEY=GnGYmsQUXeSX9tNz0DAS
NEXT_PUBLIC_ROBOFLOW_WORKFLOW_URL=https://serverless.roboflow.com/nutriguard/workflows/yolov8

# Gemini Configuration (Quality Analysis)
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key-here
```

### 2. Ottenere Gemini API Key

1. Vai su **https://aistudio.google.com/app/apikey**
2. Accedi con il tuo account Google
3. Clicca **"Create API key"**
4. Copia la chiave (inizia con `AIzaSy...`)
5. Incollala nel file `.env.local`

### 2. Riavvia il Server

Dopo aver salvato il file `.env.local`, riavvia il server:

```bash
# Ferma il server corrente (Ctrl+C)
npm run dev
```

---

## 🧪 Test

1. Apri http://localhost:3000
2. Carica un'immagine di cibo
3. Clicca "Riconosci Alimento"
4. Il modello YOLOv8 analizzerà l'immagine

---

## 📁 File Modificati

- `src/services/roboflowWorkflowService.ts` - Servizio Roboflow
- `src/app/api/roboflow/route.ts` - API Route (evita CORS)
- `src/components/ImageAnalysisStep.tsx` - Componente aggiornato
- `src/env.d.ts` - Type declarations

---

## 🔧 Come Funziona

1. L'immagine viene convertita in base64
2. Viene inviata all'API route `/api/roboflow`
3. L'API route chiama il workflow Roboflow serverless
4. YOLOv8 analizza l'immagine e restituisce le predizioni
5. Il risultato viene mostrato nell'interfaccia

---

## ❓ Troubleshooting

### Errore "Roboflow not configured"
- Verifica che `.env.local` contenga le variabili corrette
- Riavvia il server dopo aver modificato `.env.local`

### Errore 401 (Unauthorized)
- L'API key non è valida
- Verifica la key su https://app.roboflow.com/settings/api

### Errore 404 (Not Found)
- Il workflow URL non è corretto
- Verifica il workflow su Roboflow

### Nessun rilevamento
- Il modello potrebbe non riconoscere quel tipo di cibo
- Prova con un'immagine più chiara

