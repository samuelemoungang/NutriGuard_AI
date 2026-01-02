import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image, apiKey, workflowUrl } = await request.json();

    if (!image || !apiKey || !workflowUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: image, apiKey, workflowUrl' },
        { status: 400 }
      );
    }

    console.log('[Roboflow API Route] Calling workflow:', workflowUrl);

    // Roboflow Serverless Workflow API call
    const response = await fetch(`${workflowUrl}?api_key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        inputs: {
          image: {
            type: 'base64',
            value: image,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Roboflow API Route] Error:', response.status, errorText);
      
      // Try alternative format
      console.log('[Roboflow API Route] Trying alternative format...');
      const altResponse = await fetch(`${workflowUrl}?api_key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: image,
      });

      if (!altResponse.ok) {
        const altErrorText = await altResponse.text();
        console.error('[Roboflow API Route] Alternative also failed:', altResponse.status, altErrorText);
        return NextResponse.json(
          { error: `Roboflow API error: ${response.status} - ${errorText}` },
          { status: response.status }
        );
      }

      const altData = await altResponse.json();
      console.log('[Roboflow API Route] Alternative success:', altData);
      return NextResponse.json(altData);
    }

    const data = await response.json();
    console.log('[Roboflow API Route] Full response:', JSON.stringify(data, null, 2));
    
    // Log the structure to debug
    if (data.outputs) {
      console.log('[Roboflow API Route] Outputs found:', JSON.stringify(data.outputs, null, 2));
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Roboflow API Route] Exception:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

