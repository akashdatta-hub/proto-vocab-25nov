/**
 * Script to generate all scene images for all word sets
 *
 * Usage:
 *   npx tsx scripts/generate-all-scenes.ts
 *
 * This will:
 * 1. Fetch all word sets from Supabase
 * 2. For each word set, generate 4 scene variations (16 total)
 * 3. Upload images to Supabase storage
 * 4. Update scene records with image URLs
 *
 * Estimated time: 10-15 minutes
 * Estimated cost: ~$0.64 (16 scenes × $0.04)
 */

import { supabaseAdmin } from '../lib/supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface WordSet {
  id: string;
  name: string;
  scene_word: string;
  order_index: number;
}

interface Word {
  id: string;
  word_set_id: string;
  text: string;
  order_index: number;
}

async function generateAllScenes() {
  console.log('🎨 Starting scene generation for all word sets...\n');

  try {
    // Fetch all word sets
    const { data: wordSets, error: wordSetsError } = await supabaseAdmin
      .from('word_sets')
      .select('*')
      .order('order_index');

    if (wordSetsError || !wordSets) {
      throw new Error(`Failed to fetch word sets: ${wordSetsError?.message}`);
    }

    console.log(`Found ${wordSets.length} word sets\n`);

    let successCount = 0;
    let failCount = 0;

    // Process each word set
    for (const wordSet of wordSets as WordSet[]) {
      console.log(`\n📚 Processing: ${wordSet.name} (${wordSet.scene_word})`);

      // Fetch words for this set
      const { data: words, error: wordsError } = await supabaseAdmin
        .from('words')
        .select('*')
        .eq('word_set_id', wordSet.id)
        .order('order_index');

      if (wordsError || !words || words.length === 0) {
        console.error(`  ❌ Failed to fetch words: ${wordsError?.message}`);
        failCount += 4;
        continue;
      }

      const wordTexts = (words as Word[]).map(w => w.text);
      console.log(`  Words: ${wordTexts.join(', ')}`);

      // Generate 4 scene variations
      for (let sceneIndex = 0; sceneIndex < 4; sceneIndex++) {
        console.log(`  🎨 Generating scene variation ${sceneIndex + 1}/4...`);

        try {
          const response = await fetch(`${API_BASE_URL}/api/generate-scene`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              wordSetId: wordSet.id,
              sceneWord: wordSet.scene_word,
              words: wordTexts,
              sceneIndex,
              stylePreset: `variation_${sceneIndex}`
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Scene generation failed');
          }

          const result = await response.json();
          console.log(`  ✅ Scene ${sceneIndex + 1} generated: ${result.sceneId}`);
          console.log(`     URL: ${result.imageUrl.substring(0, 60)}...`);
          successCount++;

          // Wait 2 seconds between requests to avoid rate limits
          if (sceneIndex < 3) {
            console.log(`  ⏳ Waiting 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

        } catch (error) {
          console.error(`  ❌ Failed to generate scene ${sceneIndex + 1}:`, error instanceof Error ? error.message : error);
          failCount++;

          // If rate limited, wait longer
          if (error instanceof Error && error.message.includes('rate limit')) {
            console.log(`  ⏳ Rate limited, waiting 60 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 60000));
          }
        }
      }

      // Wait 5 seconds between word sets
      if (wordSet.order_index < wordSets.length - 1) {
        console.log(`\n⏳ Waiting 5 seconds before next word set...\n`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Scene Generation Complete!');
    console.log('='.repeat(60));
    console.log(`✅ Successfully generated: ${successCount} scenes`);
    console.log(`❌ Failed: ${failCount} scenes`);
    console.log(`💰 Estimated cost: $${(successCount * 0.04).toFixed(2)}`);
    console.log('='.repeat(60) + '\n');

    // Verify final status
    const { count: generatedCount } = await supabaseAdmin
      .from('scenes')
      .select('*', { count: 'exact', head: true })
      .neq('image_url', '');

    console.log(`📈 Total scenes with images in database: ${generatedCount}`);

    if (failCount > 0) {
      console.log('\n⚠️  Some scenes failed to generate. You can re-run this script to retry failed scenes.');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
generateAllScenes()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
