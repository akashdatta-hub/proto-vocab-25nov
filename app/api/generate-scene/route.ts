import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Scene Generation API endpoint
 * POST /api/generate-scene
 *
 * Generates scene images using DALL-E 3 and uploads to Supabase storage
 *
 * Request body:
 * {
 *   wordSetId: string - UUID of the word set
 *   sceneWord: string - The scene context (e.g., "garden", "kitchen")
 *   words: string[] - Array of words to include in the scene
 *   sceneIndex: number - Scene variation index (0-3)
 *   stylePreset?: string - Optional style variation
 * }
 *
 * Response:
 * {
 *   success: boolean
 *   imageUrl: string - Supabase storage URL of generated image
 *   sceneId: string - UUID of the scene record
 *   promptUsed: string - The DALL-E prompt that was used
 * }
 */

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Scene generation prompt template based on scene_generation_prompt.md
const SCENE_PROMPT_TEMPLATE = `Create a simple, child-friendly line drawing of a {SCENE_WORD}.

Include the following objects clearly and recognisably in the scene:
{OBJECT_LIST}

Composition notes:
- Arrange the objects in positions that make sense inside a {SCENE_WORD}.
- Ensure each object is clear, distinct, and easy for a child to identify.
- Keep the scene calm and uncluttered.
- Vary the placement slightly for different variations.

Style requirements:
- Clean digital sketch using **one medium-blue line colour**
- **Very light blue‑white background**
- Consistent line weight
- No shading, no gradients, no textures, no realistic rendering
- No text, no labels, no humans or animals
- Use faint background structure lines (e.g., shelves, walls, counters) only if they help context

Overall tone:
- Friendly, simple, educational illustration for children.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      wordSetId,
      sceneWord,
      words,
      sceneIndex = 0,
      stylePreset
    } = body;

    // Validate input
    if (!wordSetId || !sceneWord || !words || !Array.isArray(words)) {
      return NextResponse.json(
        { error: 'Invalid request: wordSetId, sceneWord, and words array are required' },
        { status: 400 }
      );
    }

    console.log(`[Scene Gen] Generating scene ${sceneIndex} for "${sceneWord}" with words:`, words);

    // Create object list for the prompt
    const objectList = words.map((word, index) => `- ${word}`).join('\n');

    // Generate the DALL-E prompt
    const prompt = SCENE_PROMPT_TEMPLATE
      .replace(/{SCENE_WORD}/g, sceneWord)
      .replace(/{OBJECT_LIST}/g, objectList);

    // Add variation note based on sceneIndex
    const variationNotes = [
      'Arrange objects from left to right.',
      'Place larger objects in the background, smaller ones in front.',
      'Arrange objects in a circular composition.',
      'Create depth with objects at different distances.'
    ];
    const finalPrompt = `${prompt}\n\nVariation ${sceneIndex + 1}: ${variationNotes[sceneIndex] || variationNotes[0]}`;

    console.log(`[Scene Gen] Using prompt (truncated):`, finalPrompt.substring(0, 200) + '...');

    // Generate image with DALL-E 3
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: finalPrompt,
      size: '1792x1024', // 16:9 aspect ratio (closest to 16:9 in DALL-E 3)
      quality: 'standard', // Use 'hd' for higher quality if needed
      n: 1,
      response_format: 'url'
    });

    const imageUrl = imageResponse.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL received from DALL-E');
    }

    console.log(`[Scene Gen] Image generated successfully, downloading...`);

    // Download the image
    const imageDownload = await fetch(imageUrl);
    if (!imageDownload.ok) {
      throw new Error('Failed to download generated image');
    }

    const imageBuffer = await imageDownload.arrayBuffer();
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });

    // Upload to Supabase storage
    const fileName = `${sceneWord}-${sceneIndex}-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('scene-images')
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('[Scene Gen] Upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('scene-images')
      .getPublicUrl(fileName);

    console.log(`[Scene Gen] Image uploaded to: ${publicUrl}`);

    // Find or create the scene record
    const { data: existingScenes } = await supabaseAdmin
      .from('scenes')
      .select('id')
      .eq('word_set_id', wordSetId)
      .eq('scene_index', sceneIndex)
      .single();

    let sceneId: string;

    if (existingScenes) {
      // Update existing scene
      const { error: updateError } = await supabaseAdmin
        .from('scenes')
        .update({
          image_url: publicUrl,
          style_preset: stylePreset || `variation_${sceneIndex}`
        })
        .eq('id', existingScenes.id);

      if (updateError) {
        throw new Error(`Failed to update scene: ${updateError.message}`);
      }

      sceneId = existingScenes.id;
      console.log(`[Scene Gen] Updated scene record: ${sceneId}`);
    } else {
      // Create new scene (shouldn't happen if DB was initialized properly)
      const { data: newScene, error: createError } = await supabaseAdmin
        .from('scenes')
        .insert({
          word_set_id: wordSetId,
          image_url: publicUrl,
          scene_index: sceneIndex,
          style_preset: stylePreset || `variation_${sceneIndex}`
        })
        .select()
        .single();

      if (createError || !newScene) {
        throw new Error(`Failed to create scene: ${createError?.message}`);
      }

      sceneId = newScene.id;
      console.log(`[Scene Gen] Created scene record: ${sceneId}`);
    }

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      sceneId,
      promptUsed: finalPrompt
    });

  } catch (error) {
    console.error('[Scene Gen] Error generating scene:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          {
            error: 'Scene generation service configuration error',
            details: 'OpenAI API key not properly configured'
          },
          { status: 500 }
        );
      }

      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          {
            error: 'Scene generation rate limit exceeded',
            details: 'Please try again in a moment'
          },
          { status: 429 }
        );
      }

      if (error.message.includes('quota')) {
        return NextResponse.json(
          {
            error: 'Scene generation quota exceeded',
            details: 'Please contact administrator'
          },
          { status: 429 }
        );
      }

      if (error.message.includes('content policy')) {
        return NextResponse.json(
          {
            error: 'Scene generation blocked by content policy',
            details: 'The prompt may have triggered safety filters. Please try again.'
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to generate scene',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate-scene - Health check and scene generation status
 */
export async function GET() {
  try {
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

    // Check how many scenes have been generated
    const { count: totalScenes } = await supabaseAdmin
      .from('scenes')
      .select('*', { count: 'exact', head: true });

    const { count: generatedScenes } = await supabaseAdmin
      .from('scenes')
      .select('*', { count: 'exact', head: true })
      .neq('image_url', '');

    return NextResponse.json({
      status: 'operational',
      model: 'dall-e-3',
      imageSize: '1792x1024 (16:9)',
      quality: 'standard',
      scenesGenerated: generatedScenes || 0,
      totalScenes: totalScenes || 0,
      estimatedCost: `$${((generatedScenes || 0) * 0.04).toFixed(2)}`,
      description: 'Scene generation using DALL-E 3'
    });

  } catch (error) {
    console.error('[Scene Gen] Health check error:', error);

    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to check scene generation status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
