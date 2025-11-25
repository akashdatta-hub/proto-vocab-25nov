import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { RECOGNITION_THRESHOLD } from '@/lib/constants';

/**
 * Drawing Recognition API endpoint
 * POST /api/recognise-drawing
 *
 * Uses OpenAI GPT-4 Vision to recognize student drawings and validate against target word
 *
 * Request body:
 * {
 *   imageBase64: string - Base64 encoded PNG image (without data:image/png;base64, prefix)
 *   targetWord: string - The word the student should have drawn
 * }
 *
 * Response:
 * {
 *   isCorrect: boolean - Whether the drawing matches the target word
 *   confidence: number - Confidence score (0-1)
 *   recognizedObject: string - What GPT-4 Vision recognized in the drawing
 *   feedback: string - Encouraging feedback for the student
 * }
 */

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Recognition prompt template
const RECOGNITION_PROMPT = `You are an art teacher evaluating a child's drawing. The child was asked to draw a "{TARGET_WORD}".

Analyze the image and respond in this exact JSON format (no other text):
{
  "recognizedObject": "what you see in the drawing (be generous and encouraging)",
  "confidence": 0.85,
  "reasoning": "brief explanation of why you think this matches or doesn't match the target"
}

Guidelines:
- Be encouraging and generous with children's drawings
- Look for basic shapes, colors, and general representation
- A simple attempt that captures the essence of the object should get high confidence
- Even abstract or simple drawings can be correct if they show effort and basic features
- Confidence should be 0.0-1.0 (0.7+ means it's a reasonable attempt)
- For very unclear/blank drawings, use low confidence (< 0.5)`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, targetWord } = body;

    // Validate input
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: imageBase64 is required and must be a string' },
        { status: 400 }
      );
    }

    if (!targetWord || typeof targetWord !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: targetWord is required and must be a string' },
        { status: 400 }
      );
    }

    console.log(`[Recognition] Analyzing drawing for target word: "${targetWord}"`);

    // Prepare the image for GPT-4 Vision
    const imageDataUrl = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:image/png;base64,${imageBase64}`;

    // Create the recognition prompt
    const prompt = RECOGNITION_PROMPT.replace('{TARGET_WORD}', targetWord);

    // Call GPT-4 Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // gpt-4o has vision capabilities
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: imageDataUrl,
                detail: 'low' // Use low detail for faster processing and lower cost
              }
            }
          ]
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    // Parse GPT-4 Vision response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from GPT-4 Vision');
    }

    const analysis = JSON.parse(content);
    const { recognizedObject, confidence, reasoning } = analysis;

    console.log(`[Recognition] Recognized: "${recognizedObject}" with confidence ${confidence}`);
    console.log(`[Recognition] Reasoning: ${reasoning}`);

    // Determine if the drawing is correct based on threshold
    const isCorrect = confidence >= RECOGNITION_THRESHOLD;

    // Generate encouraging feedback
    let feedback: string;
    if (isCorrect) {
      feedback = confidence > 0.9
        ? `Excellent drawing! You captured the ${targetWord} perfectly! 🎨`
        : `Great job! I can see you drew a ${targetWord}! Keep it up! 👍`;
    } else if (confidence > 0.5) {
      feedback = `Good effort! I can see some features of a ${targetWord}. Try adding more details next time! 💪`;
    } else {
      feedback = `Nice try! Remember, you're drawing a ${targetWord}. Think about its shape and features! 🌟`;
    }

    return NextResponse.json({
      isCorrect,
      confidence: Math.round(confidence * 100) / 100, // Round to 2 decimal places
      recognizedObject,
      feedback,
      reasoning // Include for debugging/teacher dashboard
    });

  } catch (error) {
    console.error('[Recognition] Error analyzing drawing:', error);

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          {
            error: 'Recognition service configuration error',
            details: 'OpenAI API key not properly configured'
          },
          { status: 500 }
        );
      }

      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          {
            error: 'Recognition service rate limit exceeded',
            details: 'Please try again in a moment'
          },
          { status: 429 }
        );
      }

      if (error.message.includes('quota')) {
        return NextResponse.json(
          {
            error: 'Recognition service quota exceeded',
            details: 'Please contact administrator'
          },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to recognize drawing',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/recognise-drawing - Health check
 */
export async function GET() {
  try {
    // Test OpenAI API connection
    const hasApiKey = !!process.env.OPENAI_API_KEY;

    if (!hasApiKey) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'OpenAI API key not configured'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'operational',
      model: 'gpt-4o',
      recognitionThreshold: RECOGNITION_THRESHOLD,
      description: 'Drawing recognition using GPT-4 Vision'
    });

  } catch (error) {
    console.error('[Recognition] Health check error:', error);

    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to connect to recognition service',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
