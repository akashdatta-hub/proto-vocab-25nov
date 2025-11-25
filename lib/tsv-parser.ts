import { WordSetData } from '@/types';
import fs from 'fs';
import path from 'path';

/**
 * Parse the words and scenes.tsv file
 * @param filePath - Path to the TSV file (relative to project root)
 * @returns Array of parsed word set data
 */
export function parseTSV(filePath: string = 'words and scenes.tsv'): WordSetData[] {
  const fullPath = path.join(process.cwd(), filePath);
  const fileContent = fs.readFileSync(fullPath, 'utf-8');

  const lines = fileContent.split('\n').filter(line => line.trim() !== '');

  // Skip header row
  const dataLines = lines.slice(1);

  return dataLines.map((line) => {
    const columns = line.split('\t');

    return {
      slNo: parseInt(columns[0], 10),
      sceneName: columns[1]?.trim() || '',
      word1: columns[2]?.trim() || '',
      word2: columns[3]?.trim() || '',
      word3: columns[4]?.trim() || '',
      word4: columns[5]?.trim() || ''
    };
  });
}

/**
 * Get selected word sets for the prototype (4 sets)
 * Based on BUILD_PLAN.md:
 * - Set 1: The Garden (Row 1)
 * - Set 2: Kitchen (Row 6)
 * - Set 3: Beach (Row 8)
 * - Set 4: Birthday (Row 27)
 */
export function getPrototypeWordSets(): WordSetData[] {
  const allSets = parseTSV();

  // Row indices (0-based): 0, 5, 7, 26
  const selectedIndices = [0, 5, 7, 26];

  return selectedIndices.map(index => allSets[index]);
}

/**
 * Get a specific word set by scene name
 */
export function getWordSetByName(sceneName: string): WordSetData | undefined {
  const allSets = parseTSV();
  return allSets.find(set =>
    set.sceneName.toLowerCase() === sceneName.toLowerCase()
  );
}

/**
 * Get all words for a specific set as an array
 */
export function getWordsArray(wordSet: WordSetData): string[] {
  return [
    wordSet.word1,
    wordSet.word2,
    wordSet.word3,
    wordSet.word4
  ].filter(word => word !== '');
}
