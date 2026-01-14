# Configuration des Nœuds Flowise - Détails Techniques

## 🎯 Vue d'ensemble

Ce document fournit les configurations exactes pour chaque nœud Flowise nécessaire pour faire fonctionner les agents Quality Classification et Final Feedback.

## 📊 Agent 3: Quality Classification - Configuration Détaillée

### Nœud 1: HTTP Request (Input)

**Type**: HTTP Request  
**Method**: POST  
**URL Path**: `/api/v1/prediction/{chatflowId}`

**Configuration Headers**:
```
Content-Type: application/json
```

**Structure du Body** (reçu du frontend):
```json
{
  "question": "string",
  "overrideConfig": {
    "imageAnalysis": {...},
    "signalData": {...}
  }
}
```

---

### Nœud 2: Set Variables

**Type**: Set Variables  
**Script**:

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

---

### Nœud 3: Prompt Template

**Type**: Prompt Template  
**Template**:

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
Status: {{$vars.phStatus}}
(Optimal range: 4.5-7.0)

Gas Level (VOC): {{$vars.gasLevel}} ppm
Status: {{$vars.gasStatus}}
(Threshold: 100 ppm for normal, 200 ppm for high)

=== STORAGE CONDITIONS ===
Storage Duration: {{$vars.storageTime}} hours
Status: {{$vars.storageStatus}}
(Recommended: <48 hours)

Storage Temperature: {{$vars.temperature}}°C
(Optimal: ≤4°C for refrigeration)

Shelf Life: {{$vars.shelfLife}}
Optimal Storage: {{$vars.optimalStorage}}

=== CLASSIFICATION TASK ===

Based on the above data, provide a quality classification:

1. **Quality Grade**: Assign one of the following:
   - Grade A (90-100): Excellent quality, all indicators optimal, safe to consume
   - Grade B (75-89): Good quality, minor concerns, generally safe
   - Grade C (60-74): Acceptable quality, some concerns, consume soon
   - Grade D (40-59): Poor quality, significant concerns, use caution
   - Grade F (0-39): Unsafe quality, do not consume

2. **Quality Score**: Provide a numerical score from 0-100

3. **Factor Breakdown**: Provide scores for each factor (0-100):
   - Visual Factor: Based on mold detection, color analysis, and visual appearance
   - Chemical Factor: Based on pH and gas level (VOC) readings
   - Storage Factor: Based on storage time and temperature conditions

=== OUTPUT FORMAT ===

Return your response as a valid JSON object (no markdown, no code blocks):

{
  "grade": "A|B|C|D|F",
  "score": <number 0-100>,
  "factors": {
    "visual": <number 0-100>,
    "chemical": <number 0-100>,
    "storage": <number 0-100>
  },
  "reasoning": "<brief explanation of the classification>"
}

IMPORTANT: Return ONLY the JSON object, nothing else.
```

---

### Nœud 4: LLM Chain

**Type**: LLM Chain  
**Configuration du Modèle**:

- **Provider**: OpenAI / Anthropic / etc.
- **Model**: `gpt-4` ou `gpt-3.5-turbo` (pour OpenAI)
- **Temperature**: `0.3` (faible pour la cohérence)
- **Max Tokens**: `500`
- **Top P**: `1`
- **Frequency Penalty**: `0`
- **Presence Penalty**: `0`

**System Message** (optionnel):
```
You are a food safety expert specializing in quality classification. Always respond with valid JSON only.
```

---

### Nœud 5: Output Parser

**Type**: Code  
**Script**:

```javascript
// Obtient la réponse du LLM
const llmResponse = $input.text || $input || "";

// Fonction pour extraire JSON d'une chaîne
function extractJSON(text) {
  // Supprime les blocs de code markdown
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  
  // Essaie de trouver un objet JSON dans la chaîne
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
}

// Essaie de parser la réponse
let result = extractJSON(llmResponse);

// Fallback si le parsing échoue
if (!result || typeof result !== 'object') {
  console.warn('Failed to parse LLM response, using fallback');
  
  // Calcule un fallback basé sur les données
  const moldPenalty = $vars.moldDetected ? 30 : 0;
  const moldPercentPenalty = $vars.moldPercentage * 2;
  const colorPenalty = (100 - $vars.colorHealthy) * 0.3;
  const phPenalty = ($vars.phStatus === 'abnormal') ? 15 : 0;
  const gasPenalty = ($vars.gasStatus === 'high') ? 25 : ($vars.gasStatus === 'elevated' ? 10 : 0);
  const storagePenalty = ($vars.storageStatus === 'extended') ? 20 : 0;
  
  const baseScore = 100 - moldPenalty - moldPercentPenalty - colorPenalty - phPenalty - gasPenalty - storagePenalty;
  const finalScore = Math.max(0, Math.min(100, baseScore));
  
  let grade;
  if (finalScore >= 90) grade = 'A';
  else if (finalScore >= 75) grade = 'B';
  else if (finalScore >= 60) grade = 'C';
  else if (finalScore >= 40) grade = 'D';
  else grade = 'F';
  
  result = {
    grade: grade,
    score: Math.round(finalScore),
    factors: {
      visual: Math.max(0, 100 - moldPenalty - moldPercentPenalty - colorPenalty),
      chemical: Math.max(0, 100 - phPenalty - gasPenalty),
      storage: Math.max(0, 100 - storagePenalty)
    },
    reasoning: "Classification based on automated analysis"
  };
}

// Valide et normalise le résultat
const validatedResult = {
  grade: ['A', 'B', 'C', 'D', 'F'].includes(result.grade) ? result.grade : 'C',
  score: Math.max(0, Math.min(100, Math.round(result.score || 50))),
  factors: {
    visual: Math.max(0, Math.min(100, Math.round(result.factors?.visual || 50))),
    chemical: Math.max(0, Math.min(100, Math.round(result.factors?.chemical || 50))),
    storage: Math.max(0, Math.min(100, Math.round(result.factors?.storage || 50)))
  },
  reasoning: result.reasoning || "Quality classification completed"
};

return validatedResult;
```

---

### Nœud 6: HTTP Response

**Type**: HTTP Response  
**Response Body**:

```json
{
  "grade": "{{$input.grade}}",
  "score": {{$input.score}},
  "factors": {
    "visual": {{$input.factors.visual}},
    "chemical": {{$input.factors.chemical}},
    "storage": {{$input.factors.storage}}
  },
  "reasoning": "{{$input.reasoning}}"
}
```

**Status Code**: `200`

---

## 📊 Agent 4: Final Feedback - Configuration Détaillée

### Nœud 1: HTTP Request (Input)

Identique à Quality Classification.

---

### Nœud 2: Set Variables

**Script**:

```javascript
const body = $input.body || {};
const overrideConfig = body.overrideConfig || {};
const imageAnalysis = overrideConfig.imageAnalysis || {};
const signalData = overrideConfig.signalData || {};
const classification = overrideConfig.classification || {};

// Image Analysis
const foodType = imageAnalysis.foodType || {};
const colorAnalysis = imageAnalysis.colorAnalysis || {};

$vars.foodName = foodType.name || "Unknown";
$vars.foodCategory = foodType.category || "other";
$vars.moldDetected = imageAnalysis.moldDetected || false;
$vars.moldPercentage = imageAnalysis.moldPercentage || 0;
$vars.colorHealthy = colorAnalysis.healthy || 0;
$vars.colorWarning = colorAnalysis.warning || 0;
$vars.colorDanger = colorAnalysis.danger || 0;

// Signal Data
$vars.ph = signalData.ph || 0;
$vars.gasLevel = signalData.gasLevel || 0;
$vars.storageTime = signalData.storageTime || 0;
$vars.temperature = signalData.temperature || 0;

// Classification
$vars.grade = classification.grade || "C";
$vars.score = classification.score || 50;
$vars.visualFactor = classification.factors?.visual || 50;
$vars.chemicalFactor = classification.factors?.chemical || 50;
$vars.storageFactor = classification.factors?.storage || 50;

// Calcule les indicateurs
$vars.phStatus = ($vars.ph >= 4.5 && $vars.ph <= 7.0) ? "normal" : "abnormal";
$vars.gasStatus = $vars.gasLevel < 100 ? "normal" : ($vars.gasLevel < 200 ? "elevated" : "high");

// Détermine si c'est sûr (préliminaire)
$vars.isLikelySafe = $vars.score >= 60 && !$vars.moldDetected;

return $input;
```

---

### Nœud 3: Prompt Template

**Template**:

```
You are a food safety expert providing detailed safety recommendations. Analyze the complete assessment and provide a clear, actionable recommendation.

=== QUALITY CLASSIFICATION SUMMARY ===
Overall Grade: {{$vars.grade}}
Quality Score: {{$vars.score}}/100

Factor Breakdown:
- Visual Analysis: {{$vars.visualFactor}}%
- Chemical Analysis: {{$vars.chemicalFactor}}%
- Storage Conditions: {{$vars.storageFactor}}%

=== DETAILED ANALYSIS ===

VISUAL INDICATORS:
- Food Type: {{$vars.foodName}} ({{$vars.foodCategory}})
- Mold Detection: {{$vars.moldDetected ? "DETECTED" : "NOT DETECTED"}}
{{#if $vars.moldDetected}}
- Mold Coverage: {{$vars.moldPercentage}}%
{{/if}}
- Color Health: {{$vars.colorHealthy}}% healthy, {{$vars.colorWarning}}% warning, {{$vars.colorDanger}}% danger

CHEMICAL INDICATORS:
- pH Level: {{$vars.ph}} (Status: {{$vars.phStatus}})
  Optimal range: 4.5-7.0
- Gas Level (VOC): {{$vars.gasLevel}} ppm (Status: {{$vars.gasStatus}})
  Thresholds: <100 ppm (normal), 100-200 ppm (elevated), >200 ppm (high)

STORAGE CONDITIONS:
- Duration: {{$vars.storageTime}} hours
- Temperature: {{$vars.temperature}}°C
- Recommended: <48 hours at ≤4°C

=== TASK ===

Based on the comprehensive analysis above, provide:

1. **Safety Assessment**: Is this food SAFE or UNSAFE to consume?
   - Consider: mold presence, chemical indicators, storage conditions, overall quality score

2. **Risk Level**: Assign one of:
   - LOW: Excellent quality, all indicators optimal
   - MEDIUM: Good quality with minor concerns
   - HIGH: Significant concerns, use caution
   - CRITICAL: Unsafe, do not consume

3. **Recommendation**: Provide a clear, actionable recommendation (2-3 sentences)

4. **Detailed Explanation**: Provide 3-5 explanation points covering:
   - Visual analysis findings
   - Chemical analysis findings
   - Storage condition impact
   - Overall safety assessment

=== OUTPUT FORMAT ===

Return ONLY a valid JSON object:

{
  "isSafe": true|false,
  "riskLevel": "low|medium|high|critical",
  "recommendation": "<clear recommendation text, 2-3 sentences>",
  "explanation": [
    "<first explanation point>",
    "<second explanation point>",
    "<third explanation point>",
    "<fourth explanation point>"
  ]
}

IMPORTANT: Return ONLY the JSON object, no markdown, no code blocks.
```

---

### Nœud 4: LLM Chain

**Configuration**:
- **Model**: `gpt-4` ou équivalent
- **Temperature**: `0.4` (légèrement plus élevé pour les explications)
- **Max Tokens**: `800`
- **Top P**: `1`

---

### Nœud 5: Output Parser

**Script**:

```javascript
const llmResponse = $input.text || $input || "";

function extractJSON(text) {
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
}

let result = extractJSON(llmResponse);

// Fallback
if (!result || typeof result !== 'object') {
  const score = $vars.score || 50;
  const hasMold = $vars.moldDetected || false;
  
  result = {
    isSafe: score >= 60 && !hasMold,
    riskLevel: score >= 80 ? "low" : (score >= 60 ? "medium" : (score >= 40 ? "high" : "critical")),
    recommendation: score >= 60 && !hasMold 
      ? "This food appears safe for consumption based on the analysis."
      : "This food may not be safe for consumption. Please exercise caution or consult a food safety expert.",
    explanation: [
      hasMold ? `Mold was detected (${$vars.moldPercentage}% coverage), indicating potential spoilage.` : "No mold was detected in the visual analysis.",
      `The pH level of ${$vars.ph} is ${$vars.phStatus === 'normal' ? 'within normal range' : 'outside optimal range'}.`,
      `Gas level (VOC) of ${$vars.gasLevel} ppm indicates ${$vars.gasStatus} conditions.`,
      `Storage conditions: ${$vars.storageTime} hours at ${$vars.temperature}°C.`,
      `Overall quality score: ${score}/100 (Grade ${$vars.grade}).`
    ]
  };
}

// Valide et normalise
const validatedResult = {
  isSafe: Boolean(result.isSafe),
  riskLevel: ['low', 'medium', 'high', 'critical'].includes(result.riskLevel) 
    ? result.riskLevel 
    : 'medium',
  recommendation: result.recommendation || "Unable to determine safety. Please consult a food safety expert.",
  explanation: Array.isArray(result.explanation) && result.explanation.length > 0
    ? result.explanation
    : ["Analysis completed but detailed explanation unavailable."]
};

return validatedResult;
```

---

### Nœud 6: HTTP Response

**Response Body**:

```json
{
  "isSafe": {{$input.isSafe}},
  "riskLevel": "{{$input.riskLevel}}",
  "recommendation": "{{$input.recommendation}}",
  "explanation": {{JSON.stringify($input.explanation)}}
}
```

---

## 🔗 Connexion des Nœuds

### Quality Classification Flow:
```
HTTP Request → Set Variables → Prompt Template → LLM Chain → Output Parser → HTTP Response
```

### Final Feedback Flow:
```
HTTP Request → Set Variables → Prompt Template → LLM Chain → Output Parser → HTTP Response
```

## ✅ Checklist de Tests

Pour chaque chatflow:

1. [ ] HTTP Request reçoit correctement le payload
2. [ ] Set Variables extrait toutes les données de `overrideConfig`
3. [ ] Prompt Template génère un prompt valide
4. [ ] LLM Chain retourne une réponse
5. [ ] Output Parser extrait le JSON correctement
6. [ ] HTTP Response formate correctement la réponse
7. [ ] Frontend reçoit la réponse dans le format attendu

## 🐛 Dépannage

### Problème: Variables non définies
**Solution**: Vérifiez que Set Variables extrait correctement de `overrideConfig`

### Problème: Erreurs de parsing JSON
**Solution**: Ajoutez un fallback dans l'Output Parser

### Problème: LLM ne retourne pas de JSON
**Solution**: Ajoutez des instructions explicites dans le prompt et utilisez une température plus basse

### Problème: Réponse non formatée correctement
**Solution**: Vérifiez le nœud HTTP Response et assurez-vous qu'il utilise `$input` correctement
