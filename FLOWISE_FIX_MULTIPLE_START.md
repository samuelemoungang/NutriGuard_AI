# 🔧 Fix: "Multiple starting nodes are not allowed"

## 🚨 Errore Identificato

```
Error: predictionsServices.buildChatflow - Multiple starting nodes are not allowed
```

**Causa**: Il tuo chatflow Flowise ha **più di un nodo "Start"**, ma Flowise permette solo **UN nodo Start** per chatflow.

---

## ✅ Soluzione: Rimuovere i Nodi Start Extra

### Passo 1: Apri il Chatflow in Flowise Cloud

1. Vai su https://cloud.flowiseai.com
2. Apri il chatflow "Quality Classification Agent" (o quello che stai usando)
3. Guarda il diagramma del flusso

### Passo 2: Identifica i Nodi Start

Cerca tutti i nodi verdi con l'icona di play (▶️). Dovresti vedere:
- **UN nodo Start** (corretto) - questo deve rimanere
- **Altri nodi Start** (da rimuovere) - questi devono essere eliminati

### Passo 3: Rimuovi i Nodi Start Extra

Per ogni nodo Start extra:

1. **Clicca sul nodo Start** che vuoi rimuovere
2. **Premi il tasto Canc** o clicca sull'icona del cestino (🗑️)
3. **Conferma l'eliminazione**

### Passo 4: Verifica la Struttura Corretta

Il tuo chatflow dovrebbe avere questa struttura:

```
Start (UN SOLO NODO) 
  ↓
Set Variables 
  ↓
Prompt Template 
  ↓
LLM 0 
  ↓
Direct Reply 0
```

**⚠️ IMPORTANTE**: 
- Solo **UN** nodo Start (verde con icona play)
- Tutti gli altri nodi devono essere collegati in sequenza
- Non ci devono essere nodi Start "orfani" o duplicati

---

## 🔍 Come Verificare

### Controllo Visivo:
1. Guarda il diagramma del chatflow
2. Conta i nodi verdi con icona play
3. Se ce ne sono più di uno, rimuovi quelli extra

### Test:
1. Salva il chatflow
2. Prova a eseguirlo (Test button)
3. Se funziona, l'errore è risolto

---

## 📋 Checklist

- [ ] Aperto il chatflow in Flowise Cloud
- [ ] Identificati tutti i nodi Start (verdi con icona play)
- [ ] Rimossi tutti i nodi Start tranne uno
- [ ] Verificato che la struttura sia: Start → Set Variables → Prompt Template → LLM → Direct Reply
- [ ] Salvato il chatflow
- [ ] Testato il chatflow
- [ ] Verificato che l'errore sia risolto

---

## 🎯 Struttura Corretta del Chatflow

```
┌─────────┐
│  Start  │ ← UN SOLO NODO START (verde)
└────┬────┘
     │
     ↓
┌──────────────┐
│ Set Variables│ ← Nodo blu
└──────┬───────┘
       │
       ↓
┌─────────────────┐
│ Prompt Template │ ← Nodo blu
└────────┬────────┘
         │
         ↓
┌─────────┐
│ LLM 0   │ ← Nodo blu con modello LLM
└────┬────┘
     │
     ↓
┌──────────────┐
│ Direct Reply │ ← Nodo verde (output)
└──────────────┘
```

---

## ⚠️ Errori Comuni

### ❌ ERRATO: Più nodi Start
```
Start 1 → Set Variables
Start 2 → Prompt Template  ← ERRORE! Due nodi Start
```

### ✅ CORRETTO: Un solo nodo Start
```
Start → Set Variables → Prompt Template → LLM → Direct Reply
```

---

## 🔄 Dopo la Correzione

1. **Salva il chatflow** in Flowise
2. **Riavvia il server Next.js** (se necessario)
3. **Testa di nuovo** l'applicazione
4. L'errore "Multiple starting nodes" dovrebbe essere risolto

---

## 💡 Perché Succede?

Questo errore può verificarsi se:
- Hai duplicato accidentalmente il nodo Start
- Hai importato un chatflow con più nodi Start
- Hai copiato/incollato nodi e hai creato duplicati
- Hai creato manualmente più nodi Start pensando che servissero

**Ricorda**: Un chatflow è un flusso lineare che parte da UN SOLO punto di ingresso (Start).

---

## 🆘 Se il Problema Persiste

1. **Elimina completamente il chatflow** e ricrealo da zero
2. **Segui la guida** `FLOWISE_VISUAL_SETUP.md` per la struttura corretta
3. **Assicurati** di avere solo un nodo Start
4. **Verifica** che tutti i nodi siano collegati in sequenza
