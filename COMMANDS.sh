#!/bin/bash
# 🚀 Comandi Utili per RoboFlow Integration

## ==============================================================
## SETUP INIZIALE
## ==============================================================

# 1. Clona il progetto (se non già fatto)
git clone <your-repo>
cd NutriGuard_AI

# 2. Installa dipendenze
npm install

# 3. Crea il file .env.local
# (Sostituisci your_api_key con la chiave da RoboFlow)
echo "NEXT_PUBLIC_ROBOFLOW_API_KEY=your_api_key_here" > .env.local

# 4. Avvia il server di sviluppo
npm run dev
# Visita: http://localhost:3000

## ==============================================================
## SVILUPPO
## ==============================================================

# Avvia in modalità sviluppo con hot reload
npm run dev

# Build per produzione
npm run build

# Avvia server produzione
npm start

# Lint del codice
npm run lint

## ==============================================================
## TEST ROBOFLOW
## ==============================================================

# Test senza API Key (usa dati mock)
# 1. Assicurati che .env.local sia vuoto o non contiene ROBOFLOW_API_KEY
# 2. npm run dev
# 3. Carica un'immagine
# 4. Guarda i log nel componente - userà fallback mock

# Test con API Key (analisi reale)
# 1. Aggiungi NEXT_PUBLIC_ROBOFLOW_API_KEY a .env.local
# 2. npm run dev
# 3. Carica un'immagine di frutta/verdura
# 4. Guarda i log - dovresti vedere detections reali da RoboFlow

## ==============================================================
## VARIABILI D'AMBIENTE
## ==============================================================

# Mostra le variabili attuali (senza valori sensibili)
echo "Check .env.local:"
cat .env.local

# Sostituisci la API Key
sed -i 's/NEXT_PUBLIC_ROBOFLOW_API_KEY=.*/NEXT_PUBLIC_ROBOFLOW_API_KEY=your_new_key/' .env.local

# Resetta a template di esempio
cp .env.example .env.local
# Poi modifica manualmente .env.local

## ==============================================================
## GIT & VERSION CONTROL
## ==============================================================

# Controlla cosa è stato modificato
git status

# Vedi i file modificati
git diff

# Aggiungi i file modificati (escluso .env.local)
git add .
git reset .env.local  # Non commitare .env.local!

# Commit
git commit -m "feat: integrate RoboFlow for food freshness analysis"

# Push
git push origin main

## ==============================================================
## TROUBLESHOOTING
## ==============================================================

# Pulisci cache e dipendenze
rm -rf node_modules package-lock.json
npm install

# Cancella build cache
rm -rf .next

# Hard reset
git reset --hard
git clean -fd

## ==============================================================
## DOCUMENTAZIONE
## ==============================================================

# Apri la guida rapida
cat ROBOFLOW_QUICKSTART.md

# Apri la guida completa
cat ROBOFLOW_INTEGRATION.md

# Apri la struttura del progetto
cat PROJECT_STRUCTURE.md

# Apri i link alle risorse
cat RESOURCES.md

## ==============================================================
## VERIFICHE
## ==============================================================

# Verifica che i file siano stati creati
test -f src/services/roboflowService.ts && echo "✓ RoboFlow Service" || echo "✗ RoboFlow Service"
test -f src/hooks/useRoboFlow.ts && echo "✓ RoboFlow Hook" || echo "✗ RoboFlow Hook"
test -f src/components/RoboFlowVisualizer.tsx && echo "✓ RoboFlow Visualizer" || echo "✗ RoboFlow Visualizer"
test -f ROBOFLOW_INTEGRATION.md && echo "✓ Integration Guide" || echo "✗ Integration Guide"
test -f ROBOFLOW_QUICKSTART.md && echo "✓ Quick Start Guide" || echo "✗ Quick Start Guide"

# Verifica che .env.local esista
test -f .env.local && echo "✓ .env.local exists" || echo "✗ .env.local missing"

# Verifica che ROBOFLOW_API_KEY sia configurato
grep -q "NEXT_PUBLIC_ROBOFLOW_API_KEY" .env.local && echo "✓ API Key configured" || echo "✗ API Key not set"

## ==============================================================
## DEPLOYMENT
## ==============================================================

# Build per Vercel/Netlify
npm run build

# Test il build localmente
npm start

# Verifica che le variabili d'ambiente siano settate su Vercel
# Vai su: https://vercel.com/dashboard/[project]/settings/environment-variables
# Assicurati che NEXT_PUBLIC_ROBOFLOW_API_KEY sia configurata

## ==============================================================
## MONITORING & LOGS
## ==============================================================

# Vedi i log del browser (apri DevTools)
# F12 → Console tab

# Vedi i log del server
# Guarda la console dove hai eseguito 'npm run dev'

# Mostra i log del componente Terminal nel browser
# Sono visibili direttamente nell'app quando analizza un'immagine

## ==============================================================
## STATS & INFO
## ==============================================================

# Conta le linee di codice aggiunte
git diff --stat

# Mostra i files modificati
git status --short

# Mostra l'history dei commit
git log --oneline -10

# Info sul progetto
echo "Project: NutriGuard AI"
echo "RoboFlow Integration: v1.0"
echo "Last Updated: $(date)"

## ==============================================================
## NOTES
## ==============================================================

# 1. Non committare .env.local - è già in .gitignore
# 2. Per team: usa .env.example come template
# 3. Per produzione: configura variabili su Vercel/Netlify
# 4. Test sempre con immagini reali prima di deployare
# 5. Monitora il rate limit di RoboFlow API

## ==============================================================
## QUICK CHECKLIST
## ==============================================================

# [ ] Installa dipendenze: npm install
# [ ] Crea .env.local con NEXT_PUBLIC_ROBOFLOW_API_KEY
# [ ] Avvia dev server: npm run dev
# [ ] Carica un'immagine nel browser
# [ ] Verifica i log nel componente Terminal
# [ ] Leggi ROBOFLOW_QUICKSTART.md
# [ ] Personalizza il modello se necessario
# [ ] Fai push su Git (escludendo .env.local)
# [ ] Configure variabili su Vercel/Netlify
# [ ] Deploy!

## ==============================================================

# 🎉 Fatto!
echo "
✅ RoboFlow Integration Complete!

Prossimi step:
1. Configura API Key in .env.local
2. npm run dev
3. Carica un'immagine per testare
4. Leggi ROBOFLOW_QUICKSTART.md per dettagli

For help, see:
- ROBOFLOW_INTEGRATION.md (complete guide)
- RESOURCES.md (link utili)
- ROBOFLOW_EXAMPLES.ts (code examples)
"
