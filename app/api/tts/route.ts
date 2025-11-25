import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

/**
 * Text-to-Speech API endpoint
 * POST /api/tts
 *
 * Generates audio narration using Google Cloud Text-to-Speech
 * with Indian female voice (en-IN-Wavenet-A)
 *
 * Request body:
 * {
 *   text: string - The text to convert to speech
 *   languageCode?: string - Default: 'en-IN'
 *   voiceName?: string - Default: 'en-IN-Wavenet-A'
 * }
 *
 * Response:
 * {
 *   audioContent: string - Base64 encoded MP3 audio
 *   text: string - The original text
 * }
 */

// Initialize Google Cloud TTS client
let ttsClient: TextToSpeechClient | null = null;

function getTTSClient(): TextToSpeechClient {
  if (!ttsClient) {
    // Google Cloud credentials can be loaded from either:
    // 1. GOOGLE_APPLICATION_CREDENTIALS_JSON env var (for Vercel deployment)
    // 2. GOOGLE_APPLICATION_CREDENTIALS file path (for local development)
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

    if (credentialsJson) {
      // Parse JSON credentials from environment variable (Vercel)
      const credentials = JSON.parse(credentialsJson);
      ttsClient = new TextToSpeechClient({ credentials });
    } else {
      // Use file path from GOOGLE_APPLICATION_CREDENTIALS (local)
      ttsClient = new TextToSpeechClient();
    }
  }
  return ttsClient;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      languageCode = 'en-IN',
      voiceName = 'en-IN-Wavenet-A'
    } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text too long: maximum 5000 characters' },
        { status: 400 }
      );
    }

    console.log(`[TTS] Generating speech for text: "${text.substring(0, 50)}..."`);

    // Prepare the TTS request
    const client = getTTSClient();
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode,
        name: voiceName,
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.95, // Slightly slower for clarity
        pitch: 0.0,
        volumeGainDb: 0.0
      }
    });

    // Convert audio content to base64
    const audioContent = response.audioContent;
    if (!audioContent) {
      throw new Error('No audio content received from TTS service');
    }

    const base64Audio = Buffer.from(audioContent).toString('base64');

    console.log(`[TTS] Successfully generated ${base64Audio.length} bytes of audio`);

    return NextResponse.json({
      audioContent: base64Audio,
      text
    });

  } catch (error) {
    console.error('[TTS] Error generating speech:', error);

    // Handle specific Google Cloud errors
    if (error instanceof Error) {
      if (error.message.includes('credentials')) {
        return NextResponse.json(
          {
            error: 'TTS service configuration error',
            details: 'Google Cloud credentials not properly configured'
          },
          { status: 500 }
        );
      }

      if (error.message.includes('quota')) {
        return NextResponse.json(
          {
            error: 'TTS service quota exceeded',
            details: 'Please try again later'
          },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to generate speech',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tts - Health check and available voices
 */
export async function GET() {
  try {
    const client = getTTSClient();

    // List available voices for en-IN
    const [result] = await client.listVoices({ languageCode: 'en-IN' });

    const voices = result.voices?.map(voice => ({
      name: voice.name,
      gender: voice.ssmlGender,
      languageCodes: voice.languageCodes
    })) || [];

    return NextResponse.json({
      status: 'operational',
      availableVoices: voices,
      defaultVoice: 'en-IN-Wavenet-A',
      defaultLanguage: 'en-IN'
    });

  } catch (error) {
    console.error('[TTS] Health check error:', error);

    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to connect to TTS service',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
