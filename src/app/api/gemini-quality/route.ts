import { NextRequest, NextResponse } from 'next/server';

const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash-exp',
];

export async function POST(request: NextRequest) {
  try {
    const { image, foodName, apiKey } = await request.json();

    if (!image || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const prompt = `Analyze this food image of "${foodName || 'food'}" for quality and freshness.

IMPORTANT: Respond ONLY with a valid JSON object, no other text.

Evaluate:
1. Overall visual quality
2. Signs of mold or fungal growth
3. Discoloration or unusual colors
4. Texture abnormalities
5. Signs of spoilage or decay
6. Whether it's safe to eat

Respond in this exact JSON format:
{
  "overallQuality": "excellent|good|fair|poor|unsafe",
  "freshnessScore": <number 0-100>,
  "issues": ["issue1", "issue2"],
  "description": "Brief description of the food's condition",
  "recommendations": ["recommendation1", "recommendation2"],
  "moldDetected": true|false,
  "discoloration": true|false,
  "safeToEat": true|false
}`;

    let lastError: Error | null = null;

    for (const model of GEMINI_MODELS) {
      try {
        console.log(`[Gemini Quality] Trying model: ${model}`);
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: 'image/jpeg',
                      data: image,
                    },
                  },
                ],
              }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 1024,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[Gemini Quality] Model ${model} failed:`, response.status, errorText);
          lastError = new Error(`${model}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        console.log(`[Gemini Quality] Model ${model} success`);

        // Extract text from response
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log('[Gemini Quality] Raw response:', text);

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('[Gemini Quality] No JSON found in response');
          lastError = new Error('Invalid response format');
          continue;
        }

        const result = JSON.parse(jsonMatch[0]);
        
        // Validate and normalize result
        return NextResponse.json({
          overallQuality: result.overallQuality || 'fair',
          freshnessScore: Math.min(100, Math.max(0, result.freshnessScore || 50)),
          issues: Array.isArray(result.issues) ? result.issues : [],
          description: result.description || 'Unable to determine condition',
          recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
          moldDetected: Boolean(result.moldDetected),
          discoloration: Boolean(result.discoloration),
          safeToEat: result.safeToEat !== false,
        });

      } catch (modelError) {
        console.error(`[Gemini Quality] Model ${model} exception:`, modelError);
        lastError = modelError instanceof Error ? modelError : new Error(String(modelError));
        continue;
      }
    }

    // All models failed
    console.error('[Gemini Quality] All models failed');
    return NextResponse.json(
      { error: lastError?.message || 'All Gemini models failed' },
      { status: 500 }
    );

  } catch (error) {
    console.error('[Gemini Quality] Exception:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

