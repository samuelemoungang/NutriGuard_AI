# 🧪 Guida Test YOLOv8

Questa guida ti aiuta a testare il funzionamento di YOLOv8 con Roboflow nel progetto NutriGuard AI.

## 🚀 Quick Start

### 1. Configurazione Ambiente

Crea o modifica il file `.env.local` nella root del progetto:

```env
NEXT_PUBLIC_ROBOFLOW_API_KEY=your-api-key-here
NEXT_PUBLIC_ROBOFLOW_WORKFLOW_URL=https://serverless.roboflow.com/your-workspace/your-workflow
```

**Come ottenere le credenziali:**
- **API Key**: Vai su https://app.roboflow.com/settings/api e copia la tua API key
- **Workflow URL**: Vai su https://app.roboflow.com, seleziona il tuo workspace e workflow, poi copia l'URL del serverless workflow

### 2. Avvia il Server

```bash
npm run dev
```

### 3. Apri la Pagina di Test

Vai su: **http://localhost:3000/test-yolov8**

## 📋 Come Usare la Pagina di Test

1. **Verifica Configurazione**: La pagina mostra automaticamente lo stato della configurazione
   - ✅ Verde = Configurato correttamente
   - ❌ Rosso = Mancante o errato

2. **Carica Immagine**: 
   - Clicca su "Seleziona Immagine"
   - Scegli un'immagine di cibo (frutta, verdura, ecc.)

3. **Esegui Test**:
   - Clicca su "🚀 Testa YOLOv8"
   - Attendi l'analisi (può richiedere alcuni secondi)

4. **Visualizza Risultati**:
   - **Predizione Principale**: Nome alimento, confidenza, categoria, freschezza
   - **Tutte le Predizioni**: Lista completa di tutte le rilevazioni
   - **JSON Raw**: Dati completi per debug

## 🔍 Debug e Troubleshooting

### Console del Browser

Apri la console del browser (F12) per vedere i log dettagliati:

```
[Roboflow] Starting image analysis...
[Roboflow] Image size: 245 KB
[Roboflow] Workflow URL: https://serverless.roboflow.com/...
[Roboflow] API call completed in 1234 ms
[Roboflow] Full response received: {...}
[Roboflow] Parsed result: {...}
```

### Errori Comuni

#### ❌ "Roboflow not configured"
- **Causa**: Variabili d'ambiente mancanti
- **Soluzione**: Verifica che `.env.local` contenga entrambe le variabili
- **Importante**: Riavvia il server dopo aver modificato `.env.local`

#### ❌ "401 Unauthorized"
- **Causa**: API key non valida
- **Soluzione**: 
  1. Verifica la key su https://app.roboflow.com/settings/api
  2. Assicurati di aver copiato la key completa
  3. Controlla che non ci siano spazi extra

#### ❌ "404 Not Found"
- **Causa**: Workflow URL non valido
- **Soluzione**:
  1. Verifica che il workflow esista su Roboflow
  2. Controlla che l'URL sia completo e corretto
  3. Assicurati che il workflow sia pubblicato

#### ❌ "No predictions found"
- **Causa**: Il modello non ha riconosciuto nulla nell'immagine
- **Soluzione**:
  - Prova con un'immagine più chiara
  - Assicurati che l'immagine contenga cibo
  - Verifica che il modello sia addestrato per quel tipo di alimento

### Log Dettagliati

La pagina di test mostra:
- ✅ Stato configurazione in tempo reale
- 📊 Risultati formattati e leggibili
- 🔍 JSON completo per analisi approfondita
- ⚠️ Messaggi di errore dettagliati

## 📊 Interpretazione Risultati

### Confidenza
- **> 80%**: Alta confidenza, rilevamento molto probabile
- **50-80%**: Confidenza media, rilevamento probabile
- **< 50%**: Bassa confidenza, rilevamento incerto

### Freschezza
- **fresh**: Alimento fresco, sicuro da consumare
- **spoiled**: Alimento marcio, non sicuro
- **stale**: Alimento non più fresco ma ancora commestibile

### Categoria
- **fruit**: Frutta
- **vegetable**: Verdura
- **meat**: Carne
- **dairy**: Latticini
- **seafood**: Pesce/frutti di mare
- **grain**: Cereali
- **processed**: Alimenti processati
- **other**: Altro

## 🎯 Test Consigliati

1. **Test Base**: Immagine chiara di una mela
2. **Test Multi-oggetto**: Immagine con più alimenti
3. **Test Freschezza**: Immagine di frutta fresca vs marcia
4. **Test Categorie Diverse**: Prova frutta, verdura, carne, ecc.

## 📝 Note

- Il primo test può richiedere più tempo (cold start)
- Le immagini grandi vengono automaticamente ottimizzate
- I risultati vengono salvati nella console per analisi successive
- La pagina di test è separata dall'app principale per facilitare il debug

## 🔗 Link Utili

- [Roboflow Dashboard](https://app.roboflow.com)
- [Roboflow Docs](https://docs.roboflow.com)
- [YOLOv8 Documentation](https://docs.ultralytics.com)

---

**Buon testing! 🚀**
