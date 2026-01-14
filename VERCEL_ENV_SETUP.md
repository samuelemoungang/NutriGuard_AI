# Configurazione Variabili d'Ambiente su Vercel

## 🔴 Problema

Il programma funziona in locale ma non su Vercel perché le variabili d'ambiente non sono configurate nella piattaforma Vercel.

## ✅ Soluzione: Configurare le Variabili d'Ambiente su Vercel

### Step 1: Accedi al Dashboard Vercel

1. Vai su [vercel.com](https://vercel.com) e accedi al tuo account
2. Seleziona il tuo progetto **NutriGuard_AI**

### Step 2: Vai alle Impostazioni del Progetto

1. Clicca sul tuo progetto
2. Vai alla tab **Settings** (Impostazioni)
3. Nel menu laterale, clicca su **Environment Variables** (Variabili d'Ambiente)

### Step 3: Aggiungi le Variabili d'Ambiente

Aggiungi le seguenti variabili d'ambiente una per una:

#### 1. Roboflow API Key
- **Name**: `NEXT_PUBLIC_ROBOFLOW_API_KEY`
- **Value**: La tua API key di Roboflow (la stessa che usi in `.env.local`)
- **Environment**: Seleziona tutte le opzioni:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

#### 2. Roboflow Workflow URL
- **Name**: `NEXT_PUBLIC_ROBOFLOW_WORKFLOW_URL`
- **Value**: Il tuo workflow URL di Roboflow (es: `https://serverless.roboflow.com/...`)
- **Environment**: Seleziona tutte le opzioni:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

#### 3. Flowise Classification URL (Opzionale)
- **Name**: `NEXT_PUBLIC_FLOWISE_CLASSIFY_URL`
- **Value**: L'URL del tuo chatflow Flowise per la classificazione
- **Environment**: Seleziona tutte le opzioni

#### 4. Flowise Feedback URL (Opzionale)
- **Name**: `NEXT_PUBLIC_FLOWISE_FEEDBACK_URL`
- **Value**: L'URL del tuo chatflow Flowise per il feedback
- **Environment**: Seleziona tutte le opzioni

### Step 4: Salva e Riavvia il Deployment

1. Dopo aver aggiunto tutte le variabili, clicca su **Save**
2. Vai alla tab **Deployments**
3. Trova l'ultimo deployment e clicca sui **3 puntini** (menu)
4. Seleziona **Redeploy**
5. Oppure fai un nuovo commit e push per triggerare un nuovo deployment

## 📋 Checklist Variabili d'Ambiente

Assicurati di avere configurate queste variabili su Vercel:

- [ ] `NEXT_PUBLIC_ROBOFLOW_API_KEY` - **OBBLIGATORIA**
- [ ] `NEXT_PUBLIC_ROBOFLOW_WORKFLOW_URL` - **OBBLIGATORIA**
- [ ] `NEXT_PUBLIC_FLOWISE_CLASSIFY_URL` - Opzionale (se usi Flowise)
- [ ] `NEXT_PUBLIC_FLOWISE_FEEDBACK_URL` - Opzionale (se usi Flowise)

## 🔍 Come Verificare

Dopo il redeploy, verifica che le variabili siano disponibili:

1. Vai al tuo sito su Vercel
2. Apri la console del browser (F12)
3. Dovresti vedere che l'Image Analysis Agent funziona correttamente
4. Se vedi ancora l'errore "Roboflow not configured", verifica:
   - Che le variabili siano state salvate correttamente
   - Che il deployment sia stato completato
   - Che le variabili abbiano il prefisso `NEXT_PUBLIC_` (importante per Next.js)

## ⚠️ Note Importanti

### Prefisso `NEXT_PUBLIC_`

Le variabili che iniziano con `NEXT_PUBLIC_` sono esposte al browser. Questo è necessario perché vengono usate nel codice client-side.

### Sicurezza

- **NON** committare mai il file `.env.local` nel repository
- Le variabili su Vercel sono criptate e sicure
- L'API key di Roboflow è pubblica nel browser (è normale per `NEXT_PUBLIC_`)

### Ambiente

Quando aggiungi le variabili, assicurati di selezionare tutti gli ambienti (Production, Preview, Development) per avere le stesse configurazioni ovunque.

## 🐛 Troubleshooting

### Problema: Le variabili non funzionano dopo il deploy

**Soluzione**:
1. Verifica che le variabili siano state salvate correttamente
2. Fai un **Redeploy** completo (non solo un nuovo commit)
3. Controlla che i nomi delle variabili siano esatti (case-sensitive)

### Problema: Funziona in locale ma non su Vercel

**Soluzione**:
1. Verifica che le variabili su Vercel abbiano gli stessi valori di `.env.local`
2. Assicurati di aver fatto un redeploy dopo aver aggiunto le variabili
3. Controlla i log di Vercel per errori

### Problema: Errore "Unauthorized" o "Invalid API key"

**Soluzione**:
1. Verifica che l'API key sia corretta
2. Controlla che non ci siano spazi extra nel valore
3. Assicurati che l'API key non sia scaduta

## 📚 Risorse

- [Documentazione Vercel - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js - Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
