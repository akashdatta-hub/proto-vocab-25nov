import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getPrototypeWordSets, getWordsArray } from '@/lib/tsv-parser';
import { WORD_HINTS } from '@/lib/constants';

/**
 * Initialize Supabase database with word sets from TSV
 * POST /api/supabase-init
 *
 * This endpoint:
 * 1. Reads word sets from words and scenes.tsv
 * 2. Inserts word sets and words into database
 * 3. Creates placeholder scene records (images to be generated later)
 *
 * Note: Scene images should be generated separately via /api/generate-scene
 */
export async function POST() {
  try {
    // Get the 4 selected word sets from TSV
    const wordSets = getPrototypeWordSets();

    console.log('Initializing database with word sets:', wordSets.map(ws => ws.sceneName));

    // Insert word sets and words
    for (const [index, wordSetData] of wordSets.entries()) {
      // Insert word set
      const { data: wordSet, error: wordSetError } = await supabaseAdmin
        .from('word_sets')
        .insert({
          name: wordSetData.sceneName,
          scene_word: wordSetData.sceneName.toLowerCase(),
          order_index: index
        })
        .select()
        .single();

      if (wordSetError) {
        console.error('Error inserting word set:', wordSetError);
        return NextResponse.json(
          { error: `Failed to insert word set: ${wordSetError.message}` },
          { status: 500 }
        );
      }

      console.log(`✓ Inserted word set: ${wordSet.name}`);

      // Get words for this set
      const wordsArray = getWordsArray(wordSetData);

      // Insert words
      for (const [wordIndex, wordText] of wordsArray.entries()) {
        const { error: wordError } = await supabaseAdmin
          .from('words')
          .insert({
            word_set_id: wordSet.id,
            text: wordText.toLowerCase(),
            hint_text: WORD_HINTS[wordText.toLowerCase()] || `A ${wordText}`,
            order_index: wordIndex
          });

        if (wordError) {
          console.error('Error inserting word:', wordError);
          return NextResponse.json(
            { error: `Failed to insert word: ${wordError.message}` },
            { status: 500 }
          );
        }

        console.log(`  ✓ Inserted word: ${wordText}`);
      }

      // Create placeholder scene records (4 variations per set)
      // Images will be generated via /api/generate-scene
      for (let sceneIndex = 0; sceneIndex < 4; sceneIndex++) {
        const { error: sceneError } = await supabaseAdmin
          .from('scenes')
          .insert({
            word_set_id: wordSet.id,
            image_url: '', // Will be updated when scene is generated
            scene_index: sceneIndex,
            style_preset: `variation_${sceneIndex}`
          });

        if (sceneError) {
          console.error('Error inserting scene:', sceneError);
          return NextResponse.json(
            { error: `Failed to insert scene: ${sceneError.message}` },
            { status: 500 }
          );
        }
      }

      console.log(`  ✓ Created 4 scene placeholders`);
    }

    // Get summary of inserted data
    const { count: wordSetsCount } = await supabaseAdmin
      .from('word_sets')
      .select('*', { count: 'exact', head: true });

    const { count: wordsCount } = await supabaseAdmin
      .from('words')
      .select('*', { count: 'exact', head: true });

    const { count: scenesCount } = await supabaseAdmin
      .from('scenes')
      .select('*', { count: 'exact', head: true });

    const { count: studentsCount } = await supabaseAdmin
      .from('students')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      summary: {
        word_sets: wordSetsCount,
        words: wordsCount,
        scenes: scenesCount,
        students: studentsCount
      },
      next_steps: [
        'Generate scene images via POST /api/generate-scene',
        'Create storage buckets in Supabase (scene-images, hint-images, student-drawings)',
        'Set bucket policies to public read access'
      ]
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get database initialization status
 * GET /api/supabase-init
 */
export async function GET() {
  try {
    const { count: wordSetsCount } = await supabaseAdmin
      .from('word_sets')
      .select('*', { count: 'exact', head: true });

    const { count: wordsCount } = await supabaseAdmin
      .from('words')
      .select('*', { count: 'exact', head: true });

    const { count: scenesCount } = await supabaseAdmin
      .from('scenes')
      .select('*', { count: 'exact', head: true });

    const { data: scenesWithImages } = await supabaseAdmin
      .from('scenes')
      .select('image_url')
      .neq('image_url', '');

    const { count: studentsCount } = await supabaseAdmin
      .from('students')
      .select('*', { count: 'exact', head: true });

    const initialized = (wordSetsCount ?? 0) > 0 && (wordsCount ?? 0) > 0;

    return NextResponse.json({
      initialized,
      summary: {
        word_sets: wordSetsCount ?? 0,
        words: wordsCount ?? 0,
        scenes: scenesCount ?? 0,
        scenes_with_images: scenesWithImages?.length ?? 0,
        students: studentsCount ?? 0
      },
      status: initialized ? 'ready' : 'needs_initialization'
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
