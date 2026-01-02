// API Route per Hugging Face - Proxy per evitare problemi CORS
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, imageBase64 } = body;

    if (!model || !imageBase64) {
      return NextResponse.json(
        { error: 'Missing model or imageBase64' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || null;
    const apiUrl = `https://api-inference.huggingface.co/models/${model}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    // Hugging Face accetta base64 con prefisso data URI
    const base64Data = imageBase64.includes(',')
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: base64Data,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { 
          error: `Hugging Face API error: ${response.status}`,
          details: errorText.substring(0, 500),
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Hugging Face proxy error:', errorMessage);
    return NextResponse.json(
      { error: `Proxy error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

