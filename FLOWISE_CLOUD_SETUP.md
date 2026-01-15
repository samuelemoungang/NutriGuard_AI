# ☁️ Configurazione Flowise Cloud per NutriGuard AI

## 📋 Informazioni Importanti

Stai usando **Flowise Cloud** (`https://cloud.flowiseai.com`), quindi gli URL degli endpoint sono diversi da quelli locali.

---

## 🔑 Come Ottenere gli ID dei Chatflow

### Metodo 1: Dall'URL del Chatflow
1. Apri il tuo chatflow in Flowise Cloud
2. Guarda l'URL nella barra degli indirizzi
3. L'ID è l'ultima parte dell'URL dopo `/chatflow/`

**Esempio:**
```
https://cloud.flowiseai.com/chatflow/49a7a994-3c68-4589-bfcc-8e90d122759a
                                                      ↑
                                              Questo è l'ID
```

### Metodo 2: Dal Codice Embed
Se hai già il codice embed (come nell'immagine che hai mostrato), l'ID è nel campo `chatflowid`:
```javascript
Chatbot.init({
  chatflowid: "49a7a994-3c68-4589-bfcc-8e90d122759a", // ← Questo è l'ID
  apiHost: "https://cloud.flowiseai.com"
})
```

---

## 🔗 Costruire gli URL degli Endpoint

Per Flowise Cloud, gli URL degli endpoint API hanno questo formato:

```
https://cloud.flowiseai.com/api/v1/prediction/{chatflowId}
```

### Esempio:
Se il tuo chatflow ID è `49a7a994-3c68-4589-bfcc-8e90d122759a`, l'URL sarà:
```
https://cloud.flowiseai.com/api/v1/prediction/49a7a994-3c68-4589-bfcc-8e90d122759a
```

---

## 📝 Configurazione File `.env.local`

Crea o modifica il file `.env.local` nella **root del progetto** con questa configurazione:

```env
# ============================================
# FLOWISE CLOUD CONFIGURATION
# ============================================
# 
# IMPORTANTE: Devi avere 2 chatflow separati:
# 1. Quality Classification Agent
# 2. Final Feedback Agent
#
# Sostituisci {ID-CLASSIFICATION} e {ID-FEEDBACK} 
# con i tuoi ID reali dei chatflow
# ============================================

# Flowise Quality Classification Endpoint
NEXT_PUBLIC_FLOWISE_CLASSIFY_URL=https://cloud.flowiseai.com/api/v1/prediction/{ID-CLASSIFICATION}

# Flowise Final Feedback Endpoint
NEXT_PUBLIC_FLOWISE_FEEDBACK_URL=https://cloud.flowiseai.com/api/v1/prediction/{ID-FEEDBACK}

# ============================================
# ROBOFLOW CONFIGURATION (se già configurato)
# ============================================
NEXT_PUBLIC_ROBOFLOW_API_KEY=your-roboflow-api-key
NEXT_PUBLIC_ROBOFLOW_WORKFLOW_URL=https://serverless.roboflow.com/nutriguard/workflows/yolov8
```

---

## ✅ Esempio Completo

Supponiamo che tu abbia:
- **Chatflow Classification ID**: `49a7a994-3c68-4589-bfcc-8e90d122759a`
- **Chatflow Feedback ID**: `7b8c9d0e-1f2a-3b4c-5d6e-7f8a9b0c1d2e`

Il tuo `.env.local` sarà:

```env
# Flowise Cloud Configuration
NEXT_PUBLIC_FLOWISE_CLASSIFY_URL=https://cloud.flowiseai.com/api/v1/prediction/49a7a994-3c68-4589-bfcc-8e90d122759a
NEXT_PUBLIC_FLOWISE_FEEDBACK_URL=https://cloud.flowiseai.com/api/v1/prediction/7b8c9d0e-1f2a-3b4c-5d6e-7f8a9b0c1d2e

# Roboflow Configuration
NEXT_PUBLIC_ROBOFLOW_API_KEY=your-roboflow-api-key
NEXT_PUBLIC_ROBOFLOW_WORKFLOW_URL=https://serverless.roboflow.com/nutriguard/workflows/yolov8
```

---

## 🚀 Passi da Seguire

1. **Ottieni i 2 ID dei chatflow:**
   - Apri il chatflow "Quality Classification Agent" in Flowise Cloud
   - Copia l'ID dall'URL
   - Apri il chatflow "Final Feedback Agent" in Flowise Cloud
   - Copia l'ID dall'URL

2. **Crea/modifica `.env.local`:**
   - Nella root del progetto, crea o modifica `.env.local`
   - Inserisci gli URL come mostrato sopra
   - **Sostituisci** `{ID-CLASSIFICATION}` e `{ID-FEEDBACK}` con i tuoi ID reali

3. **Riavvia il server Next.js:**
   ```bash
   npm run dev
   ```

4. **Testa l'integrazione:**
   - Apri http://localhost:3000
   - Carica un'immagine e completa l'analisi
   - Verifica che gli agent Flowise funzionino correttamente

---

## ⚠️ Note Importanti

1. **Due Chatflow Separati:**
   - Devi creare **2 chatflow diversi** in Flowise Cloud
   - Uno per "Quality Classification"
   - Uno per "Final Feedback"
   - Ognuno avrà un ID diverso

2. **URL Completi:**
   - Non usare `localhost` se stai usando Flowise Cloud
   - Usa sempre `https://cloud.flowiseai.com` come base URL

3. **Sicurezza:**
   - Il file `.env.local` è già nel `.gitignore` (non viene committato)
   - Non condividere mai i tuoi ID pubblicamente

4. **Verifica:**
   - Dopo aver configurato, verifica che gli URL siano corretti
   - Puoi testare gli endpoint direttamente con un tool come Postman o curl

---

## 🧪 Test degli Endpoint

Puoi testare se gli endpoint funzionano con questo comando (sostituisci con i tuoi ID):

```bash
curl -X POST https://cloud.flowiseai.com/api/v1/prediction/{chatflowId} \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Test",
    "overrideConfig": {
      "imageAnalysis": {},
      "signalData": {}
    }
  }'
```

Se ricevi una risposta, l'endpoint è configurato correttamente!

---

## 📞 Supporto

Se hai problemi:
1. Verifica che gli ID dei chatflow siano corretti
2. Verifica che i chatflow siano pubblicati/attivi in Flowise Cloud
3. Controlla la console del browser per eventuali errori CORS
4. Verifica che il file `.env.local` sia nella root del progetto
