# 🔧 Troubleshooting Flowise - "API unavailable"

## 🚨 Problema: "Flowise API unavailable, using fallback classification..."

Questo errore indica che il frontend non riesce a connettersi a Flowise. Ecco come risolverlo:

---

## ✅ Checklist di Verifica

### 1. Verifica che il file `.env.local` esista e sia configurato

**Posizione**: Root del progetto (stessa cartella di `package.json`)

**Contenuto minimo richiesto**:
```env
NEXT_PUBLIC_FLOWISE_CLASSIFY_URL=https://cloud.flowiseai.com/api/v1/prediction/{chatflowId}
NEXT_PUBLIC_FLOWISE_FEEDBACK_URL=https://cloud.flowiseai.com/api/v1/prediction/{chatflowId}
```

**⚠️ IMPORTANTE**: 
- Sostituisci `{chatflowId}` con i tuoi ID reali
- Non lasciare spazi intorno al `=`
- Non usare virgolette intorno ai valori

---

### 2. Verifica il formato dell'URL

**Formato corretto per Flowise Cloud**:
```
https://cloud.flowiseai.com/api/v1/prediction/{chatflowId}
```

**Esempi corretti**:
```
✅ https://cloud.flowiseai.com/api/v1/prediction/49a7a994-3c68-4589-bfcc-8e90d122759a
✅ https://cloud.flowiseai.com/api/v1/prediction/abc123-def456-ghi789
```

**Esempi ERRATI**:
```
❌ http://localhost:3000/api/v1/prediction/... (se usi Flowise Cloud)
❌ https://cloud.flowiseai.com/chatflow/... (URL sbagliato, manca /api/v1/prediction/)
❌ https://cloud.flowiseai.com/api/v1/prediction (manca l'ID)
```

---

### 3. Verifica che il server Next.js sia stato riavviato

**Dopo aver modificato `.env.local`, DEVI riavviare il server**:

```bash
# Ferma il server (Ctrl+C)
# Poi riavvia:
npm run dev
```

Le variabili d'ambiente vengono caricate solo all'avvio del server!

---

### 4. Verifica che i chatflow siano pubblicati/attivi

In Flowise Cloud:
1. Apri il tuo chatflow
2. Verifica che sia **pubblicato** (non in draft)
3. Controlla che non ci siano errori nella configurazione dei nodi

---

### 5. Verifica CORS (Cross-Origin Resource Sharing)

**Problema comune con Flowise Cloud**: Le richieste dal browser potrebbero essere bloccate da CORS.

**Soluzioni**:

#### Opzione A: Usa un API Route Next.js (Consigliato)

Crea un file `src/app/api/flowise/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { chatflowId, payload } = await request.json();
    
    const flowiseUrl = `https://cloud.flowiseai.com/api/v1/prediction/${chatflowId}`;
    
    const response = await fetch(flowiseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Flowise API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    // Handle streaming
    if (response.body) {
      return new NextResponse(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

Poi modifica `QualityClassificationStep.tsx` per usare questo endpoint:
```typescript
const response = await fetch('/api/flowise', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatflowId: 'your-chatflow-id',
    payload: payload
  }),
});
```

#### Opzione B: Configura CORS in Flowise (se possibile)

Alcune versioni di Flowise Cloud permettono di configurare CORS. Controlla le impostazioni del tuo account.

---

### 6. Verifica la Console del Browser

Apri la **Console del Browser** (F12 → Console) e cerca errori:

**Errori comuni**:
- `Failed to fetch` → Problema di connessione o CORS
- `404 Not Found` → URL o chatflow ID errato
- `401 Unauthorized` → Problema di autenticazione
- `CORS policy` → Problema CORS

---

### 7. Test Manuale dell'Endpoint

Puoi testare l'endpoint direttamente con `curl` o Postman:

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

Se questo funziona ma il frontend no, è probabilmente un problema CORS.

---

## 🔍 Debug Avanzato

### Aggiungi logging nel codice

Ho già migliorato il logging in `QualityClassificationStep.tsx`. Ora vedrai:
- L'endpoint che sta cercando di chiamare
- L'errore specifico (status code, messaggio)
- Suggerimenti per risolvere il problema

### Verifica le variabili d'ambiente

Aggiungi temporaneamente questo nel componente per vedere se le variabili sono caricate:

```typescript
console.log('Flowise Endpoint:', process.env.NEXT_PUBLIC_FLOWISE_CLASSIFY_URL);
```

**⚠️ ATTENZIONE**: Non committare questo codice, rimuovilo dopo il debug!

---

## 📋 Checklist Rapida

- [ ] File `.env.local` esiste nella root del progetto
- [ ] URL formato corretto: `https://cloud.flowiseai.com/api/v1/prediction/{id}`
- [ ] ID chatflow corretti (2 ID diversi per Classification e Feedback)
- [ ] Server Next.js riavviato dopo modifiche a `.env.local`
- [ ] Chatflow pubblicati/attivi in Flowise Cloud
- [ ] Console browser controllata per errori specifici
- [ ] Test manuale endpoint con curl/Postman

---

## 🆘 Se Niente Funziona

1. **Verifica la connessione internet**
2. **Prova a testare l'endpoint direttamente** (curl/Postman)
3. **Controlla se Flowise Cloud è online**: https://cloud.flowiseai.com
4. **Verifica che i chatflow non siano stati eliminati o modificati**
5. **Controlla i log di Flowise Cloud** (se disponibili)

---

## 💡 Soluzione Temporanea

Se Flowise non funziona, l'applicazione usa automaticamente una **classificazione di fallback** (come vedi nel log). Funziona, ma non usa l'AI di Flowise.

Per usare Flowise, devi risolvere i problemi sopra.
