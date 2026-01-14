# Flowise Setup Guide - NutriGuard AI Multi-Agent System

## 📋 Panoramica

Questa guida spiega come configurare Flowise per far sì che gli ultimi due agent (Quality Classification e Final Feedback) ricevano e processino correttamente i dati dai primi due agent (Image Analysis e Signal Processing).

## 🔄 Flusso dei Dati

```
Agent 1 (Image Analysis) 
    ↓ [Salva in memoria condivisa]
Agent 2 (Signal Processing)
    ↓ [Salva in memoria condivisa]
Agent 3 (Quality Classification) → Flowise API
    ↓ [Salva in memoria condivisa]
Agent 4 (Final Feedback) → Flowise API
```

## 📦 Struttura Dati Inviata a Flowise

### Agent 3: Quality Classification

**Payload inviato:**
```json
{
  "question": "Analyze food safety based on: Visual Analysis: Mold detected/not detected (X%), Color health score: X%, pH: X, Gas: Xppm, Storage: Xh at X°C. Provide a quality grade (A-F) and classification.",
  "overrideConfig": {
    "imageAnalysis": {
      "foodType": {
        "name": "Donut",
        "category": "other",
        "confidence": 95,
        "shelfLife": "Varies",
        "optimalStorage": "Check product guidelines"
      },
      "moldDetected": false,
      "moldPercentage": 0,
      "dominantColors": ["#4CAF50", "#8BC34A", "#CDDC39"],
      "colorAnalysis": {
        "healthy": 85.0,
        "warning": 10.0,
        "danger": 5.0
      },
      "confidence": 94.5
    },
    "signalData": {
      "ph": 6.5,
      "gasLevel": 50,
      "storageTime": 24,
      "temperature": 4
    }
  }
}
```

### Agent 4: Final Feedback

**Payload inviato:**
```json
{
  "question": "Provide a detailed food safety recommendation based on: Grade: A (95/100), Visual: 90%, Chemical: 85%, Storage: 80%, Mold: not detected, pH: 6.5, Gas: 50ppm, Storage: 24h at 4°C. Is this food safe to consume? Explain why or why not.",
  "overrideConfig": {
    "imageAnalysis": { /* stesso formato di sopra */ },
    "signalData": { /* stesso formato di sopra */ },
    "classification": {
      "grade": "A",
      "score": 95,
      "factors": {
        "visual": 90,
        "chemical": 85,
        "storage": 80
      }
    }
  }
}
```

## 🛠️ Configurazione Flowise

### Step 1: Creare il Chatflow per Quality Classification

1. **Apri Flowise** e crea un nuovo Chatflow
2. **Nome**: `Quality Classification Agent`

#### Configurazione dei Nodi:

**1. HTTP Request Node (Input)**
- **Type**: POST
- **URL**: `/api/v1/prediction/{chatflowId}`
- **Headers**: `Content-Type: application/json`
- Questo nodo riceverà il payload dal frontend

**2. Set Variables Node**
Estrae i dati da `overrideConfig`:

```javascript
// Variabili da estrarre:
const imageAnalysis = $input.body.overrideConfig?.imageAnalysis || {};
const signalData = $input.body.overrideConfig?.signalData || {};
const question = $input.body.question || "";

// Salva nelle variabili del flow:
$vars.imageAnalysis = imageAnalysis;
$vars.signalData = signalData;
$vars.question = question;
$vars.foodName = imageAnalysis.foodType?.name || "Unknown";
$vars.moldDetected = imageAnalysis.moldDetected || false;
$vars.moldPercentage = imageAnalysis.moldPercentage || 0;
$vars.colorHealthy = imageAnalysis.colorAnalysis?.healthy || 0;
$vars.ph = signalData.ph || 0;
$vars.gasLevel = signalData.gasLevel || 0;
$vars.storageTime = signalData.storageTime || 0;
$vars.temperature = signalData.temperature || 0;
```

**3. Prompt Template Node**
Crea un prompt strutturato per l'LLM:

```
You are a food safety quality classification expert. Analyze the following data and provide a quality grade (A-F) and score (0-100).

VISUAL ANALYSIS:
- Food Type: {{$vars.foodName}}
- Mold Detected: {{$vars.moldDetected ? "Yes" : "No"}}
- Mold Coverage: {{$vars.moldPercentage}}%
- Color Analysis:
  * Healthy: {{$vars.colorHealthy}}%
  * Warning: {{100 - $vars.colorHealthy}}%
  * Danger: {{$vars.moldPercentage}}%

CHEMICAL ANALYSIS:
- pH Level: {{$vars.ph}}
- Gas Level (VOC): {{$vars.gasLevel}} ppm

STORAGE CONDITIONS:
- Storage Time: {{$vars.storageTime}} hours
- Temperature: {{$vars.temperature}}°C

TASK:
Based on the above data, provide:
1. A quality grade (A, B, C, D, or F)
2. A quality score (0-100)
3. Factor breakdown:
   - Visual factor score (0-100)
   - Chemical factor score (0-100)
   - Storage factor score (0-100)

Return your response in JSON format:
{
  "grade": "A|B|C|D|F",
  "score": 0-100,
  "factors": {
    "visual": 0-100,
    "chemical": 0-100,
    "storage": 0-100
  },
  "reasoning": "Brief explanation of the classification"
}
```

**4. LLM Chain Node**
- **Model**: Scegli il tuo modello LLM (OpenAI, Anthropic, etc.)
- **Temperature**: 0.3 (per risposte più consistenti)
- **Max Tokens**: 500

**5. Output Parser Node**
Estrae il JSON dalla risposta:

```javascript
// Prova a parsare la risposta JSON
let result;
try {
  // Rimuovi markdown code blocks se presenti
  let response = $input.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  result = JSON.parse(response);
} catch (e) {
  // Fallback se non è JSON valido
  result = {
    grade: "C",
    score: 50,
    factors: {
      visual: 50,
      chemical: 50,
      storage: 50
    },
    reasoning: "Unable to parse response"
  };
}

return result;
```

**6. HTTP Response Node**
Ritorna la risposta al frontend:

```json
{
  "grade": "{{$input.grade}}",
  "score": {{$input.score}},
  "factors": {
    "visual": {{$input.factors.visual}},
    "chemical": {{$input.factors.chemical}},
    "storage": {{$input.factors.storage}}
  }
}
```

### Step 2: Creare il Chatflow per Final Feedback

1. **Crea un nuovo Chatflow**
2. **Nome**: `Final Feedback Agent`

#### Configurazione dei Nodi:

**1. HTTP Request Node (Input)**
- Stesso setup del Quality Classification

**2. Set Variables Node**
Estrae tutti i dati:

```javascript
const imageAnalysis = $input.body.overrideConfig?.imageAnalysis || {};
const signalData = $input.body.overrideConfig?.signalData || {};
const classification = $input.body.overrideConfig?.classification || {};
const question = $input.body.question || "";

$vars.imageAnalysis = imageAnalysis;
$vars.signalData = signalData;
$vars.classification = classification;
$vars.question = question;

// Estrai valori specifici
$vars.grade = classification.grade || "C";
$vars.score = classification.score || 50;
$vars.visualFactor = classification.factors?.visual || 50;
$vars.chemicalFactor = classification.factors?.chemical || 50;
$vars.storageFactor = classification.factors?.storage || 50;
$vars.moldDetected = imageAnalysis.moldDetected || false;
$vars.ph = signalData.ph || 0;
$vars.gasLevel = signalData.gasLevel || 0;
```

**3. Prompt Template Node**
Crea un prompt per la spiegazione:

```
You are a food safety expert providing detailed recommendations. Based on the following analysis, determine if the food is safe to consume and explain why.

QUALITY CLASSIFICATION:
- Grade: {{$vars.grade}}
- Overall Score: {{$vars.score}}/100
- Factor Breakdown:
  * Visual Analysis: {{$vars.visualFactor}}%
  * Chemical Analysis: {{$vars.chemicalFactor}}%
  * Storage Conditions: {{$vars.storageFactor}}%

DETAILED DATA:
- Mold Detected: {{$vars.moldDetected ? "Yes" : "No"}}
- pH Level: {{$vars.ph}}
- Gas Level (VOC): {{$vars.gasLevel}} ppm

TASK:
1. Determine if the food is SAFE or UNSAFE to consume
2. Assess the risk level: LOW, MEDIUM, HIGH, or CRITICAL
3. Provide a clear recommendation
4. Explain each factor that influenced your decision

Return your response in JSON format:
{
  "isSafe": true|false,
  "riskLevel": "low|medium|high|critical",
  "recommendation": "Clear recommendation text",
  "explanation": [
    "First explanation point",
    "Second explanation point",
    "Third explanation point"
  ]
}
```

**4. LLM Chain Node**
- **Model**: Stesso modello del Quality Classification
- **Temperature**: 0.4 (leggermente più creativo per spiegazioni)
- **Max Tokens**: 800

**5. Output Parser Node**
```javascript
let result;
try {
  let response = $input.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  result = JSON.parse(response);
} catch (e) {
  result = {
    isSafe: false,
    riskLevel: "medium",
    recommendation: "Unable to determine safety. Please consult a food safety expert.",
    explanation: ["Analysis could not be completed"]
  };
}

return result;
```

**6. HTTP Response Node**
```json
{
  "isSafe": {{$input.isSafe}},
  "riskLevel": "{{$input.riskLevel}}",
  "recommendation": "{{$input.recommendation}}",
  "explanation": {{JSON.stringify($input.explanation)}}
}
```

## 🔌 Configurazione API Endpoints

### Nel file `.env.local` del frontend:

```env
NEXT_PUBLIC_FLOWISE_CLASSIFY_URL=http://localhost:3000/api/v1/prediction/{chatflowId-classify}
NEXT_PUBLIC_FLOWISE_FEEDBACK_URL=http://localhost:3000/api/v1/prediction/{chatflowId-feedback}
```

**Nota**: Sostituisci `{chatflowId-classify}` e `{chatflowId-feedback}` con gli ID reali dei tuoi chatflow.

### Come ottenere il Chatflow ID:

1. In Flowise, apri il chatflow
2. L'URL sarà simile a: `http://localhost:3000/chatflow/{chatflowId}`
3. Copia l'ID dal URL

## 📝 Esempio di Prompt Template Avanzato

### Per Quality Classification (più dettagliato):

```
You are an expert food safety quality classifier. Analyze the provided data and assign a quality grade.

INPUT DATA:
{{#if $vars.imageAnalysis}}
VISUAL ANALYSIS:
- Food: {{$vars.imageAnalysis.foodType.name}} ({{$vars.imageAnalysis.foodType.category}})
- Confidence: {{$vars.imageAnalysis.confidence}}%
- Mold: {{#if $vars.imageAnalysis.moldDetected}}DETECTED ({{$vars.imageAnalysis.moldPercentage}}%){{else}}NOT DETECTED{{/if}}
- Color Health: {{$vars.imageAnalysis.colorAnalysis.healthy}}% healthy
{{/if}}

{{#if $vars.signalData}}
CHEMICAL & STORAGE:
- pH: {{$vars.signalData.ph}} (optimal: 4.5-7.0)
- Gas (VOC): {{$vars.signalData.gasLevel}} ppm (threshold: 100 ppm)
- Storage: {{$vars.signalData.storageTime}}h at {{$vars.signalData.temperature}}°C
{{/if}}

GRADING CRITERIA:
- Grade A (90-100): Excellent quality, all indicators optimal
- Grade B (75-89): Good quality, minor concerns
- Grade C (60-74): Acceptable quality, some concerns
- Grade D (40-59): Poor quality, significant concerns
- Grade F (0-39): Unsafe, do not consume

Provide JSON response with grade, score, and factor breakdown.
```

## 🧪 Testing

### Test Quality Classification:

```bash
curl -X POST http://localhost:3000/api/v1/prediction/{chatflowId-classify} \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Analyze food safety...",
    "overrideConfig": {
      "imageAnalysis": {
        "foodType": {"name": "Apple", "category": "fruit", "confidence": 95},
        "moldDetected": false,
        "moldPercentage": 0,
        "colorAnalysis": {"healthy": 90, "warning": 8, "danger": 2},
        "confidence": 95
      },
      "signalData": {
        "ph": 6.5,
        "gasLevel": 50,
        "storageTime": 24,
        "temperature": 4
      }
    }
  }'
```

### Test Final Feedback:

```bash
curl -X POST http://localhost:3000/api/v1/prediction/{chatflowId-feedback} \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Provide recommendation...",
    "overrideConfig": {
      "imageAnalysis": { /* ... */ },
      "signalData": { /* ... */ },
      "classification": {
        "grade": "A",
        "score": 95,
        "factors": {"visual": 90, "chemical": 95, "storage": 100}
      }
    }
  }'
```

## 🔍 Debugging

### Verifica che i dati arrivino correttamente:

1. **Aggiungi un Debug Node** in Flowise prima del Set Variables
2. **Log il payload** completo: `console.log($input.body)`
3. **Verifica** che `overrideConfig` contenga tutti i dati

### Problemi comuni:

1. **Dati mancanti**: Verifica che il frontend invii `overrideConfig`
2. **Parsing errors**: Assicurati che l'Output Parser gestisca errori
3. **JSON malformato**: Usa try-catch nel parser
4. **CORS errors**: Configura CORS in Flowise se necessario

## 📚 Risorse Aggiuntive

- [Flowise Documentation](https://docs.flowiseai.com/)
- [Flowise GitHub](https://github.com/FlowiseAI/Flowise)
- [API Reference](https://docs.flowiseai.com/api)

## ✅ Checklist Finale

- [ ] Chatflow Quality Classification creato
- [ ] Chatflow Final Feedback creato
- [ ] Variabili estratte correttamente da `overrideConfig`
- [ ] Prompt templates configurati
- [ ] Output parsers gestiscono errori
- [ ] API endpoints configurati in `.env.local`
- [ ] Chatflow IDs aggiunti alle variabili d'ambiente
- [ ] Test eseguiti con curl o Postman
- [ ] Frontend si connette correttamente a Flowise
