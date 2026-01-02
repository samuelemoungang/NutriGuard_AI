# 🚀 Setup OpenAI Vision per NutriGuard AI

## Perché OpenAI invece di RoboFlow?

✅ **Più semplice**: Non serve configurare project ID, version, ecc.  
✅ **Più affidabile**: Riconosce molti più tipi di alimenti  
✅ **Meno problemi**: API più stabile e ben documentata  
✅ **Migliore per alimenti generici**: Funziona bene con qualsiasi tipo di cibo  

## Setup Rapido (2 minuti)

### Step 1: Ottieni API Key OpenAI

1. Vai su https://platform.openai.com/api-keys
2. Crea un account (se non ce l'hai) o accedi
3. Clicca su "Create new secret key"
4. Copia la chiave (inizia con `sk-`)
5. ⚠️ **Salvala subito** - non la vedrai più!

### Step 2: Configura il Progetto

Crea o modifica il file `.env.local` nella root del progetto:

```bash
NEXT_PUBLIC_OPENAI_API_KEY=sk-la-tua-chiave-qui
```

### Step 3: Riavvia il Server

```bash
# Ferma il server (Ctrl+C)
npm run dev
```

### Step 4: Testa!

1. Carica un'immagine di cibo
2. Il sistema userà GPT-4 Vision per riconoscerla
3. Vedrai risultati molto più accurati!

## Costi

- **GPT-4o**: ~$0.01-0.03 per immagine (molto economico)
- **Piano gratuito**: $5 di credito iniziale (circa 150-500 analisi)
- **Piano a consumo**: Paga solo quello che usi

## Confronto: OpenAI vs RoboFlow

| Caratteristica | OpenAI Vision | RoboFlow |
|---------------|---------------|----------|
| Setup | ✅ 1 variabile | ❌ 3+ variabili |
| Riconoscimento | ✅ Molto ampio | ⚠️ Limitato a frutta/verdura |
| Affidabilità | ✅ Alta | ⚠️ Dipende dal modello |
| Costo | ⚠️ ~$0.01/img | ✅ Gratuito (con limiti) |
| Velocità | ✅ Veloce | ✅ Veloce |

## Troubleshooting

### "OpenAI API Key not configured"
- Verifica che `.env.local` esista nella root
- Verifica che la chiave inizi con `sk-`
- Riavvia il server dopo aver aggiunto la chiave

### "Insufficient quota"
- Controlla il tuo credito su https://platform.openai.com/account/billing
- Aggiungi un metodo di pagamento se necessario

### "Invalid API key"
- Verifica che la chiave sia completa (non tagliata)
- Genera una nuova chiave se necessario

## Esempio di Risposta

Con OpenAI Vision, otterrai risposte come:

```json
{
  "foodName": "Banana",
  "category": "fruit",
  "freshness": "fresh",
  "moldDetected": false,
  "confidence": 0.95,
  "description": "Yellow banana with some brown spots, appears fresh",
  "shelfLife": "3-5 days",
  "optimalStorage": "Room temperature",
  "safetyAssessment": "Safe to consume"
}
```

Molto più dettagliato e accurato di RoboFlow!

---

**Raccomandazione**: Usa OpenAI Vision per il riconoscimento alimenti. È più semplice, più affidabile e funziona meglio.

