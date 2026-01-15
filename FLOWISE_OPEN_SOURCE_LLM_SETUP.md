# 🆓 Modelli LLM Open Source in Flowise

## ✅ Sì! Flowise Supporta Modelli Open Source

Flowise supporta molti modelli LLM open source gratuiti. Ecco le opzioni disponibili:

---

## 🎯 Modelli Open Source Supportati

### 1. **Ollama** (Consigliato per uso locale/gratuito)

**Vantaggi**:
- ✅ Completamente gratuito
- ✅ Funziona offline (locale)
- ✅ Nessun costo API
- ✅ Facile da configurare

**Modelli disponibili**:
- `llama2` - Meta's Llama 2
- `llama3` - Meta's Llama 3 (più recente)
- `mistral` - Mistral AI
- `codellama` - Per codice
- `phi` - Microsoft Phi
- `neural-chat` - Intel Neural Chat
- E molti altri...

**Come configurare**:
1. Installa Ollama: https://ollama.ai
2. Scarica un modello: `ollama pull llama3`
3. In Flowise, seleziona "Ollama" come provider LLM
4. Configura l'URL: `http://localhost:11434` (default)
5. Seleziona il modello (es. `llama3`)

---

### 2. **Hugging Face Inference API**

**Vantaggi**:
- ✅ Gratuito (con limiti)
- ✅ Molti modelli disponibili
- ✅ Non richiede installazione locale

**Modelli popolari**:
- `meta-llama/Llama-2-7b-chat-hf`
- `mistralai/Mistral-7B-Instruct-v0.1`
- `google/flan-t5-large`
- `microsoft/DialoGPT-large`

**Come configurare**:
1. Ottieni API key gratuita: https://huggingface.co/settings/tokens
2. In Flowise, seleziona "Hugging Face" come provider
3. Inserisci la tua API key
4. Seleziona il modello desiderato

---

### 3. **Anthropic Claude** (Non open source, ma alternativa a OpenAI)

**Vantaggi**:
- ✅ Buone performance
- ✅ Generoso free tier
- ✅ API stabile

**Come configurare**:
1. Ottieni API key: https://console.anthropic.com/
2. In Flowise, seleziona "Anthropic" come provider
3. Inserisci la chiave API
4. Seleziona il modello (Claude 3 Haiku, Sonnet, Opus)

---

### 4. **Google Gemini** (Gratuito con limiti)

**Vantaggi**:
- ✅ Gratuito per uso moderato
- ✅ Buone performance
- ✅ Facile da configurare

**Come configurare**:
1. Ottieni API key: https://makersuite.google.com/app/apikey
2. In Flowise, seleziona "Google Gemini" come provider
3. Inserisci la chiave API
4. Seleziona il modello (gemini-pro, gemini-pro-vision)

---

### 5. **Local LLM (LM Studio, GPT4All, etc.)**

**Vantaggi**:
- ✅ Completamente gratuito
- ✅ Offline
- ✅ Privacy totale

**Come configurare**:
1. Installa LM Studio o GPT4All
2. Scarica un modello locale
3. Configura l'API locale
4. In Flowise, usa "Custom LLM" o "OpenAI Compatible" con URL locale

---

## 🚀 Configurazione Rapida: Ollama (Consigliato)

### Passo 1: Installa Ollama

**Windows/Mac/Linux**:
1. Vai su https://ollama.ai
2. Scarica e installa Ollama
3. Verifica: `ollama --version`

### Passo 2: Scarica un Modello

Apri il terminale e esegui:

```bash
# Modello consigliato per iniziare (7B, veloce)
ollama pull llama3

# O per un modello più piccolo (più veloce)
ollama pull phi

# O per un modello più potente (più lento)
ollama pull llama3:70b
```

### Passo 3: Configura in Flowise

1. **Apri il nodo LLM** nel tuo chatflow
2. **Cambia il provider** da "ChatOpenAI" a **"Ollama"**
3. **Configura**:
   - **Base URL**: `http://localhost:11434` (default Ollama)
   - **Model**: `llama3` (o il modello che hai scaricato)
   - **Temperature**: `0.3` (consigliato)

4. **Salva** il chatflow

### Passo 4: Test

1. **Avvia Ollama** (se non è già in esecuzione)
2. **Testa il chatflow** direttamente in Flowise
3. Se funziona, prova dall'applicazione Next.js

---

## 📊 Confronto Modelli

| Modello | Costo | Velocità | Qualità | Privacy |
|---------|-------|----------|---------|---------|
| **Ollama (Llama 3)** | Gratuito | Media | Alta | Totale |
| **Hugging Face** | Gratuito* | Media | Alta | Buona |
| **Claude** | A pagamento | Alta | Molto Alta | Buona |
| **Gemini** | Gratuito* | Alta | Alta | Buona |
| **OpenAI** | A pagamento | Alta | Molto Alta | Buona |

*Con limiti di utilizzo

---

## 🎯 Raccomandazione per NutriGuard AI

### Per Sviluppo/Test:
- **Ollama + Llama 3** (7B)
  - Gratuito
  - Funziona offline
  - Buone performance per classificazione

### Per Produzione:
- **Ollama + Llama 3** (70B) se hai hardware potente
- **Hugging Face** se preferisci cloud
- **Claude/Gemini** se vuoi massime performance

---

## ⚙️ Configurazione Dettagliata: Ollama in Flowise

### Nel Nodo LLM:

1. **Provider**: Seleziona "Ollama"
2. **Base URL**: `http://localhost:11434`
3. **Model Name**: 
   - `llama3` (7B, consigliato)
   - `llama3:8b` (8B)
   - `llama3:70b` (70B, richiede 40GB+ RAM)
   - `phi` (più piccolo, più veloce)
   - `mistral` (alternativa)
4. **Temperature**: `0.3` (per risposte deterministiche)
5. **Max Tokens**: `500` (o più se necessario)

### Avviare Ollama:

**Windows**:
- Ollama si avvia automaticamente dopo l'installazione
- Verifica: apri http://localhost:11434 nel browser

**Mac/Linux**:
```bash
# Avvia Ollama
ollama serve
```

---

## 🔧 Troubleshooting Ollama

### Errore: "Connection refused"
- **Causa**: Ollama non è in esecuzione
- **Soluzione**: Avvia Ollama (`ollama serve` o riavvia l'app)

### Errore: "Model not found"
- **Causa**: Il modello non è stato scaricato
- **Soluzione**: `ollama pull llama3` (o il modello che usi)

### Lento o non risponde
- **Causa**: Modello troppo grande per il tuo hardware
- **Soluzione**: Usa un modello più piccolo (`phi` o `llama3:7b`)

---

## 📝 Esempio Configurazione Completa

### Chatflow con Ollama:

```
Start 
  ↓
Set Variables 
  ↓
Prompt Template 
  ↓
Ollama LLM (llama3) ← Cambiato da OpenAI
  ↓
Direct Reply
```

### Configurazione Nodo Ollama:
- **Type**: Ollama
- **Base URL**: `http://localhost:11434`
- **Model**: `llama3`
- **Temperature**: `0.3`
- **Max Tokens**: `500`

---

## 🆓 Alternative Gratuite Complete

### Opzione 1: Ollama (Locale)
- ✅ Gratuito
- ✅ Offline
- ✅ Nessun limite
- ❌ Richiede hardware locale

### Opzione 2: Hugging Face (Cloud)
- ✅ Gratuito (con limiti)
- ✅ Non richiede installazione
- ✅ Molti modelli
- ❌ Richiede connessione internet
- ❌ Limiti di rate

### Opzione 3: Google Gemini (Cloud)
- ✅ Gratuito (generoso)
- ✅ Buone performance
- ✅ Facile da configurare
- ❌ Richiede connessione internet
- ❌ Limiti di utilizzo

---

## 💡 Consiglio Finale

Per **NutriGuard AI**, consiglio:

1. **Sviluppo/Test**: **Ollama + Llama 3 (7B)**
   - Gratuito, veloce, funziona offline

2. **Produzione**: 
   - Se hai server potente: **Ollama + Llama 3 (70B)**
   - Se preferisci cloud: **Hugging Face** o **Gemini**

Vuoi che ti aiuti a configurare uno di questi modelli nel tuo chatflow?
