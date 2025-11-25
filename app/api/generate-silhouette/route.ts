import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * API Route: Generate Silhouette Mask for Scene Object
 *
 * Takes a scene image and object details, generates a silhouette mask
 * using DALL-E image editing capabilities.
 *
 * Request body:
 * {
 *   sceneImageUrl: string,
 *   objectName: string,
 *   objectPosition: { x: number, y: number }
 * }
 *
 * Response:
 * {
 *   silhouetteUrl: string,
 *   success: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sceneImageUrl, objectName, objectPosition } = body;

    if (!sceneImageUrl || !objectName) {
      return NextResponse.json(
        { error: 'Missing required fields: sceneImageUrl, objectName' },
        { status: 400 }
      );
    }

    // Download the scene image
    const imageResponse = await fetch(sceneImageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
    const imageFile = new File([imageBlob], 'scene.png', { type: 'image/png' });

    // Create a prompt for generating a silhouette mask
    // We'll use DALL-E's edit feature to create a black silhouette overlay
    const maskPrompt = `Create a black silhouette mask overlay for the ${objectName} in this image. The silhouette should be a solid black shape that covers only the ${objectName} object, with transparent background everywhere else. The mask should match the exact shape and position of the ${objectName}.`;

    // Generate silhouette using DALL-E image editing
    const response = await openai.images.edit({
      image: imageFile,
      prompt: maskPrompt,
      n: 1,
      size: '1024x1024',
      response_format: 'url'
    });

    const silhouetteUrl = response.data[0]?.url;

    if (!silhouetteUrl) {
      throw new Error('Failed to generate silhouette');
    }

    return NextResponse.json({
      silhouetteUrl,
      success: true
    });

  } catch (error) {
    console.error('Error generating silhouette:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate silhouette',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
