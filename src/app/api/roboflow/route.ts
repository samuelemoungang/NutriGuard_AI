import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image, apiKey, workflowUrl } = await request.json();

    if (!image || !apiKey || !workflowUrl) {
      const missing = [];
      if (!image) missing.push('image');
      if (!apiKey) missing.push('apiKey');
      if (!workflowUrl) missing.push('workflowUrl');
      
      console.error('[Roboflow API Route] Missing fields:', missing);
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    console.log('[Roboflow API Route] ==========================================');
    console.log('[Roboflow API Route] Starting YOLOv8 analysis');
    console.log('[Roboflow API Route] Workflow URL:', workflowUrl);
    console.log('[Roboflow API Route] Image size:', Math.round(image.length / 1024), 'KB');
    console.log('[Roboflow API Route] API Key present:', !!apiKey);

    const startTime = Date.now();

    // Roboflow Serverless Workflow API call
    const requestBody = {
      api_key: apiKey,
      inputs: {
        image: {
          type: 'base64',
          value: image,
        },
      },
    };

    console.log('[Roboflow API Route] Sending request to Roboflow...');
    const response = await fetch(`${workflowUrl}?api_key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const elapsedTime = Date.now() - startTime;
    console.log('[Roboflow API Route] Response received in', elapsedTime, 'ms');
    console.log('[Roboflow API Route] Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Roboflow API Route] Error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      
      // Provide more specific error messages
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid API key. Please check your NEXT_PUBLIC_ROBOFLOW_API_KEY' },
          { status: 401 }
        );
      } else if (response.status === 404) {
        return NextResponse.json(
          { error: 'Not Found: Invalid workflow URL. Please check your NEXT_PUBLIC_ROBOFLOW_WORKFLOW_URL' },
          { status: 404 }
        );
      } else if (response.status === 400) {
        return NextResponse.json(
          { error: `Bad Request: ${errorText}` },
          { status: 400 }
        );
      }
      
      // Try alternative format as fallback
      console.log('[Roboflow API Route] Trying alternative request format...');
      try {
        const altResponse = await fetch(`${workflowUrl}?api_key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: image,
        });

        if (!altResponse.ok) {
          const altErrorText = await altResponse.text();
          console.error('[Roboflow API Route] Alternative format also failed:', altResponse.status, altErrorText);
          return NextResponse.json(
            { error: `Roboflow API error: ${response.status} - ${errorText}` },
            { status: response.status }
          );
        }

        const altData = await altResponse.json();
        console.log('[Roboflow API Route] Alternative format succeeded');
        return NextResponse.json(altData);
      } catch (altError) {
        console.error('[Roboflow API Route] Alternative format error:', altError);
        return NextResponse.json(
          { error: `Roboflow API error: ${response.status} - ${errorText}` },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    console.log('[Roboflow API Route] ==========================================');
    console.log('[Roboflow API Route] Success! Response structure:');
    console.log('[Roboflow API Route] - Has predictions:', !!data.predictions);
    console.log('[Roboflow API Route] - Has outputs:', !!data.outputs);
    console.log('[Roboflow API Route] - Response keys:', Object.keys(data));
    
    if (data.predictions) {
      console.log('[Roboflow API Route] - Predictions count:', Array.isArray(data.predictions) ? data.predictions.length : 'N/A');
    }
    
    if (data.outputs) {
      console.log('[Roboflow API Route] - Outputs count:', Array.isArray(data.outputs) ? data.outputs.length : 'N/A');
      if (Array.isArray(data.outputs) && data.outputs.length > 0) {
        console.log('[Roboflow API Route] - First output keys:', Object.keys(data.outputs[0]));
      }
    }
    
    console.log('[Roboflow API Route] Full response:', JSON.stringify(data, null, 2));
    console.log('[Roboflow API Route] ==========================================');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Roboflow API Route] ==========================================');
    console.error('[Roboflow API Route] Exception occurred:', error);
    if (error instanceof Error) {
      console.error('[Roboflow API Route] Error message:', error.message);
      console.error('[Roboflow API Route] Error stack:', error.stack);
    }
    console.error('[Roboflow API Route] ==========================================');
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

