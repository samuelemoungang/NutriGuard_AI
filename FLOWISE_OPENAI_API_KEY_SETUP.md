# 🔑 Configurazione OpenAI API Key in Flowise Cloud

## 🚨 Errore Identificato

```
Error: The OPENAI_API_KEY environment variable is missing or empty
```

**Causa**: Il nodo LLM nel tuo chatflow Flowise non ha la chiave API di OpenAI configurata.

---

## ✅ Soluzione: Configurare OpenAI API Key in Flowise

### Metodo 1: Configurazione nel Nodo LLM (Consigliato)

#### Passo 1: Apri il Nodo LLM nel Chatflow

1. Vai su https://cloud.flowiseai.com
2. Apri il tuo chatflow "Quality Classification Agent"
3. **Clicca sul nodo "LLM 0"** (quello blu con l'icona delle stelle ✨)

#### Passo 2: Configura la Chiave API

Nel pannello di configurazione del nodo LLM:

1. **Trova il campo "API Key"** o "OpenAI API Key"
2. **Incolla la tua chiave API di OpenAI**:
   - Se non ce l'hai, ottienila da: https://platform.openai.com/api-keys
   - La chiave inizia con `sk-...`

3. **Salva le modifiche**

#### Passo 3: Verifica il Modello

Assicurati che:
- **Model**: `gpt-4o-mini` (o il modello che preferisci)
- **Temperature**: `0.3` (consigliato per risposte deterministiche)
- **Max Tokens**: `500` (o più se necessario)

---

### Metodo 2: Variabili d'Ambiente in Flowise Cloud

Se Flowise Cloud supporta variabili d'ambiente globali:

1. **Vai alle Impostazioni** di Flowise Cloud
2. **Cerca "Environment Variables"** o "API Keys"
3. **Aggiungi**:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `sk-tua-chiave-api-qui`
4. **Salva**

**Nota**: Questo metodo dipende da come Flowise Cloud gestisce le variabili d'ambiente. Potrebbe non essere disponibile nella versione gratuita.

---

## 🔑 Come Ottenere la Chiave API di OpenAI

### Passo 1: Crea un Account OpenAI

1. Vai su https://platform.openai.com
2. Crea un account o accedi
3. Completa la verifica (se richiesta)

### Passo 2: Genera una Chiave API

1. Vai su https://platform.openai.com/api-keys
2. Clicca su **"Create new secret key"**
3. **Dai un nome** alla chiave (es. "Flowise NutriGuard")
4. **Copia la chiave** immediatamente (non potrai vederla di nuovo!)
   - La chiave inizia con `sk-...`
   - Esempio: `sk-proj-abc123def456...`

### Passo 3: Usa la Chiave

- **Incolla la chiave** nel nodo LLM di Flowise
- **Non condividere mai** la chiave pubblicamente
- **Non committare** la chiave nel codice

---

## 💰 Costi OpenAI

**⚠️ IMPORTANTE**: L'uso di OpenAI API ha un costo:

- **gpt-4o-mini**: ~$0.15 per 1M token input, ~$0.60 per 1M token output
- **gpt-4**: Molto più costoso
- **gpt-3.5-turbo**: Più economico

**Consiglio**: Inizia con `gpt-4o-mini` per testare, è economico e performante.

---

## 📋 Checklist Configurazione

- [ ] Account OpenAI creato/verificato
- [ ] Chiave API generata su https://platform.openai.com/api-keys
- [ ] Chiave API copiata (inizia con `sk-...`)
- [ ] Nodo LLM aperto nel chatflow Flowise
- [ ] Chiave API inserita nel campo "API Key" del nodo LLM
- [ ] Modello selezionato (gpt-4o-mini consigliato)
- [ ] Temperature impostata (0.3 consigliato)
- [ ] Modifiche salvate nel chatflow
- [ ] Chatflow testato

---

## 🧪 Test della Configurazione

Dopo aver configurato la chiave API:

1. **Salva il chatflow** in Flowise
2. **Testa il chatflow** direttamente in Flowise (bottone "Test")
3. Se funziona, **prova di nuovo** dall'applicazione Next.js
4. L'errore "OPENAI_API_KEY missing" dovrebbe essere risolto

---

## 🔍 Verifica che Funzioni

### Test in Flowise:

1. Apri il chatflow
2. Clicca su "Test" o "Chat"
3. Invia un messaggio di test
4. Se ricevi una risposta dall'LLM, la configurazione è corretta

### Test dall'Applicazione:

1. Riavvia il server Next.js (se necessario)
2. Carica un'immagine e completa l'analisi
3. Arriva allo step "Quality Classification"
4. Dovresti vedere la risposta da Flowise invece del fallback

---

## ⚠️ Errori Comuni

### ❌ "Invalid API Key"
- **Causa**: Chiave API errata o scaduta
- **Soluzione**: Genera una nuova chiave e aggiorna il nodo LLM

### ❌ "Insufficient Quota"
- **Causa**: Credito insufficiente nell'account OpenAI
- **Soluzione**: Aggiungi credito su https://platform.openai.com/account/billing

### ❌ "Rate Limit Exceeded"
- **Causa**: Troppe richieste in poco tempo
- **Soluzione**: Aspetta qualche minuto o passa a un piano a pagamento

---

## 🔐 Sicurezza

**⚠️ IMPORTANTE**:
- **Non condividere** mai la tua chiave API pubblicamente
- **Non committare** la chiave nel codice (non va in `.env.local` del frontend)
- La chiave va configurata **solo in Flowise Cloud** (nel nodo LLM)
- Se compromessa, **revoca immediatamente** la chiave e generane una nuova

---

## 🆘 Se il Problema Persiste

1. **Verifica** che la chiave API sia valida (testala su https://platform.openai.com)
2. **Controlla** che ci sia credito sufficiente nell'account OpenAI
3. **Verifica** che il modello selezionato sia disponibile (gpt-4o-mini è sempre disponibile)
4. **Prova** a creare un nuovo chatflow da zero con la chiave configurata
5. **Contatta** il supporto Flowise se il problema persiste

---

## 📝 Note Aggiuntive

- La chiave API di OpenAI è **diversa** dalle variabili d'ambiente del frontend
- Non va nel file `.env.local` del progetto Next.js
- Va configurata **direttamente in Flowise Cloud** nel nodo LLM
- Ogni chatflow può avere una chiave API diversa (utile per test)
