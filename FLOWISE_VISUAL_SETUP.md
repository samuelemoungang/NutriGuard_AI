# 🎨 Guida Visiva Setup Flowise - Basata sul Diagramma

## 📊 Interpretazione del Diagramma

Il diagramma mostra la struttura base di un chatflow Flowise:
```
Start → Agent 0 → Agent 1
```

Per NutriGuard AI, dobbiamo creare **2 chatflow separati** con questa struttura.

---

## 🔵 Chatflow 1: Quality Classification Agent

### Struttura del Flusso:
```
Start → Set Variables → Prompt Template → LLM Agent → Output
```

### Passo 1: Nodo Start
- **Tipo**: Start Node (verde con icona play)
- **Configurazione**: Nessuna configurazione necessaria, è automatico
- **Funzione**: Punto di ingresso del chatflow

### Passo 2: Set Variables Node
- **Tipo**: Set Variables
- **Colore**: Blu chiaro (come "Agent 0" nel diagramma)
- **Script da inserire**:
```javascript
// Extrait le body de la requête
const body = $input.body || {};
const overrideConfig = body.overrideConfig || {};
const imageAnalysis = overrideConfig.imageAnalysis || {};
const signalData = overrideConfig.signalData || {};

// Extrait foodType
const foodType = imageAnalysis.foodType || {};
const colorAnalysis = imageAnalysis.colorAnalysis || {};

// Définit toutes les variables nécessaires
$vars.foodName = foodType.name || "Unknown Food";
$vars.foodCategory = foodType.category || "other";
$vars.foodConfidence = imageAnalysis.confidence || 0;
$vars.moldDetected = imageAnalysis.moldDetected || false;
$vars.moldPercentage = imageAnalysis.moldPercentage || 0;
$vars.colorHealthy = colorAnalysis.healthy || 0;
$vars.colorWarning = colorAnalysis.warning || 0;
$vars.colorDanger = colorAnalysis.danger || 0;
$vars.ph = signalData.ph || 0;
$vars.gasLevel = signalData.gasLevel || 0;
$vars.storageTime = signalData.storageTime || 0;
$vars.temperature = signalData.temperature || 0;
$vars.shelfLife = foodType.shelfLife || "Unknown";
$vars.optimalStorage = foodType.optimalStorage || "Unknown";

// Calcule les indicateurs
$vars.phStatus = ($vars.ph >= 4.5 && $vars.ph <= 7.0) ? "normal" : "abnormal";
$vars.gasStatus = $vars.gasLevel < 100 ? "normal" : ($vars.gasLevel < 200 ? "elevated" : "high");
$vars.storageStatus = $vars.storageTime < 48 ? "acceptable" : "extended";

// Passe au nœud suivant
return $input;
```

### Passo 3: Prompt Template Node
- **Tipo**: Prompt Template
- **Colore**: Blu chiaro (come "Agent 1" nel diagramma)
- **Template da inserire**:
```
You are a food safety quality classification expert. Your task is to analyze food quality data and assign a grade from A to F.

=== VISUAL ANALYSIS DATA ===
Food Type: {{$vars.foodName}}
Category: {{$vars.foodCategory}}
Recognition Confidence: {{$vars.foodConfidence}}%

Mold Detection:
- Detected: {{$vars.moldDetected ? "YES" : "NO"}}
{{#if $vars.moldDetected}}
- Coverage: {{$vars.moldPercentage}}%
{{/if}}

Color Analysis:
- Healthy Appearance: {{$vars.colorHealthy}}%
- Warning Indicators: {{$vars.colorWarning}}%
- Danger Indicators: {{$vars.colorDanger}}%

=== CHEMICAL ANALYSIS DATA ===
pH Level: {{$vars.ph}}
- Status: {{$vars.phStatus}}

Gas Level (VOC): {{$vars.gasLevel}} ppm
- Status: {{$vars.gasStatus}}

=== STORAGE CONDITIONS ===
Storage Time: {{$vars.storageTime}} hours
- Status: {{$vars.storageStatus}}

Temperature: {{$vars.temperature}}°C

=== TASK ===
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

### Passo 4: LLM Agent Node
- **Tipo**: Chat Model (es. OpenAI, Anthropic, etc.)
- **Configurazione**: 
  - Seleziona il tuo modello LLM (GPT-4, Claude, etc.)
  - Temperature: 0.3 (per risposte più deterministiche)
  - Max Tokens: 500

### Passo 5: Output Node
- **Tipo**: Output
- **Funzione**: Restituisce la risposta JSON al frontend

---

## 🟢 Chatflow 2: Final Feedback Agent

### Struttura del Flusso:
```
Start → Set Variables → Prompt Template → LLM Agent → Output
```

### Passo 1: Nodo Start
- Stesso del Chatflow 1

### Passo 2: Set Variables Node
- **Script da inserire**:
```javascript
// Extrait le body de la requête
const body = $input.body || {};
const overrideConfig = body.overrideConfig || {};
const imageAnalysis = overrideConfig.imageAnalysis || {};
const signalData = overrideConfig.signalData || {};
const classification = overrideConfig.classification || {};
const question = body.question || "";

// Définit toutes les variables
$vars.imageAnalysis = imageAnalysis;
$vars.signalData = signalData;
$vars.classification = classification;
$vars.question = question;

// Extrait les valeurs spécifiques
$vars.grade = classification.grade || "C";
$vars.score = classification.score || 50;
$vars.visualFactor = classification.factors?.visual || 50;
$vars.chemicalFactor = classification.factors?.chemical || 50;
$vars.storageFactor = classification.factors?.storage || 50;
$vars.moldDetected = imageAnalysis.moldDetected || false;
$vars.ph = signalData.ph || 0;
$vars.gasLevel = signalData.gasLevel || 0;
$vars.storageTime = signalData.storageTime || 0;
$vars.temperature = signalData.temperature || 0;

return $input;
```

### Passo 3: Prompt Template Node
- **Template da inserire**:
```
You are a food safety expert providing detailed recommendations. Based on the following analysis, determine if the food is safe to consume and explain why.

QUALITY CLASSIFICATION:
- Grade: {{$vars.grade}}
- Overall Score: {{$vars.score}}/100
- Factor Breakdown:
  * Visual: {{$vars.visualFactor}}/100
  * Chemical: {{$vars.chemicalFactor}}/100
  * Storage: {{$vars.storageFactor}}/100

DETAILED DATA:
- Mold Detected: {{$vars.moldDetected ? "YES" : "NO"}}
- pH Level: {{$vars.ph}}
- Gas Level: {{$vars.gasLevel}} ppm
- Storage Time: {{$vars.storageTime}} hours
- Temperature: {{$vars.temperature}}°C

TASK:
Provide a comprehensive food safety recommendation that includes:
1. Safety verdict (Safe to consume / Not safe / Use caution)
2. Detailed explanation of the reasoning
3. Specific concerns or positive indicators
4. Recommendations for consumption or disposal

Format your response as a clear, professional recommendation suitable for end users.
```

### Passo 4: LLM Agent Node
- Stessa configurazione del Chatflow 1

### Passo 5: Output Node
- Stesso del Chatflow 1

---

## 🔗 Come Collegare i Nodi (Connessioni)

Nel diagramma vedi delle linee curve che collegano i nodi. In Flowise:

1. **Clicca sul nodo Start** → vedrai un punto di output (cerchio) sul lato destro
2. **Trascina** dal punto di output del Start al punto di input (barra verticale) del Set Variables
3. **Ripeti** per ogni connessione:
   - Start → Set Variables
   - Set Variables → Prompt Template
   - Prompt Template → LLM Agent
   - LLM Agent → Output

---

## 📝 Note Importanti

1. **Non serve il nodo HTTP Request** nel diagramma - Flowise gestisce automaticamente le richieste POST all'endpoint `/api/v1/prediction/{chatflowId}`

2. **Il nodo Start** è automatico e non richiede configurazione

3. **Gli Agent nel diagramma** corrispondono ai tuoi nodi di elaborazione (Set Variables, Prompt Template, LLM Agent)

4. **Colori nel diagramma**:
   - Verde = Start (automatico)
   - Blu chiaro = Nodi di elaborazione (Set Variables, Prompt Template)
   - Blu molto chiaro = Output finale

---

## ✅ Checklist Setup

- [ ] Creato Chatflow 1: "Quality Classification Agent"
- [ ] Aggiunto nodo Start
- [ ] Aggiunto nodo Set Variables con script corretto
- [ ] Aggiunto nodo Prompt Template con template corretto
- [ ] Aggiunto nodo LLM Agent (configurato modello)
- [ ] Aggiunto nodo Output
- [ ] Collegati tutti i nodi in sequenza
- [ ] Creato Chatflow 2: "Final Feedback Agent"
- [ ] Ripetuto setup per Chatflow 2
- [ ] Copiato gli ID dei chatflow per usarli nel frontend

---

## 🔑 Ottenere l'ID del Chatflow

1. In Flowise, apri il tuo chatflow
2. Guarda l'URL nella barra degli indirizzi
3. L'ID è l'ultima parte dell'URL: `.../chatflow/{chatflowId}`
4. Usa questo ID per costruire l'endpoint: `http://localhost:3000/api/v1/prediction/{chatflowId}`

---

## 🎯 Esempio di Struttura Finale

```
Quality Classification Chatflow:
Start (verde) 
  ↓
Set Variables (blu) 
  ↓
Prompt Template (blu) 
  ↓
LLM Agent (blu) 
  ↓
Output (blu chiaro)
```

Stessa struttura per Final Feedback Chatflow!
