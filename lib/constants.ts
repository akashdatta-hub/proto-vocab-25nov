/**
 * Constants for the Draw & Learn Notebook prototype
 * Based on selected word sets from words and scenes.tsv
 */

export const WORD_SETS = [
  {
    id: 1,
    name: 'The Garden',
    sceneWord: 'garden',
    orderIndex: 0,
    words: [
      { text: 'watering can', orderIndex: 0 },
      { text: 'tree', orderIndex: 1 },
      { text: 'bee', orderIndex: 2 },
      { text: 'grass', orderIndex: 3 }
    ]
  },
  {
    id: 2,
    name: 'Kitchen',
    sceneWord: 'kitchen',
    orderIndex: 1,
    words: [
      { text: 'plate', orderIndex: 0 },
      { text: 'stove', orderIndex: 1 },
      { text: 'spoon', orderIndex: 2 },
      { text: 'knife', orderIndex: 3 }
    ]
  },
  {
    id: 3,
    name: 'Beach',
    sceneWord: 'beach',
    orderIndex: 2,
    words: [
      { text: 'sand', orderIndex: 0 },
      { text: 'shells', orderIndex: 1 },
      { text: 'boat', orderIndex: 2 },
      { text: 'fishes', orderIndex: 3 }
    ]
  },
  {
    id: 4,
    name: 'Birthday',
    sceneWord: 'birthday',
    orderIndex: 3,
    words: [
      { text: 'cake', orderIndex: 0 },
      { text: 'candles', orderIndex: 1 },
      { text: 'balloons', orderIndex: 2 },
      { text: 'gift', orderIndex: 3 }
    ]
  }
] as const;

// TTS narration templates
export const TTS_TEMPLATES = {
  draw_word: (word: string) => `Draw a ${word}`,
  recognised_word: (word: string) => `This is a ${word}`,
  not_recognised: () => `I don't recognise this`,
  see_hint: () => `Would you like to see a hint?`,
  scene_intro: () => `Choose a scene`,
  scene_object_prompt: (object: string) => `Tap the ${object}`,
  scene_word_prompt: (word: string) => `Spell the word: ${word}`,
  collection_page: () => `Words you collected`
} as const;

// Hint texts for words (can be customized per word)
export const WORD_HINTS: Record<string, string> = {
  'watering can': 'A container used to water plants in the garden',
  'tree': 'A tall plant with a trunk, branches, and leaves',
  'bee': 'An insect that makes honey and buzzes',
  'grass': 'Green plants that cover the ground',
  'plate': 'A flat dish used to serve food',
  'stove': 'An appliance used for cooking',
  'spoon': 'A utensil used for eating soup or stirring',
  'knife': 'A tool with a sharp edge used for cutting',
  'sand': 'Tiny grains found on beaches',
  'shells': 'Hard coverings of sea creatures',
  'boat': 'A vehicle that floats on water',
  'fishes': 'Animals that live in water and have fins',
  'cake': 'A sweet baked dessert',
  'candles': 'Wax sticks with wicks that give light',
  'balloons': 'Colorful inflated decorations',
  'gift': 'A present wrapped for someone special'
};

// Student profile options (for prototype - no auth)
export const DEFAULT_STUDENTS = [
  { id: '1', name: 'Student 1' },
  { id: '2', name: 'Student 2' },
  { id: '3', name: 'Student 3' }
] as const;

// Drawing recognition confidence threshold
export const RECOGNITION_THRESHOLD = 0.8;

// Number of scene variations to generate
export const SCENE_VARIATIONS_COUNT = 4;

// Colors for drawing canvas
export const DRAWING_COLORS = {
  black: '#000000',
  blue: '#0066CC',
  red: '#CC0000'
} as const;

// Notebook styling constants
export const NOTEBOOK_STYLES = {
  pageWidth: 800,
  pageHeight: 600,
  pageTurnDuration: 0.6,
  paperColor: '#FFFEF0'
} as const;
