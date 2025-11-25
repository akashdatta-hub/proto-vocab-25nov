// Database Types
export interface WordSet {
  id: string;
  name: string;
  scene_word: string;
  order_index: number;
  created_at: string;
}

export interface Word {
  id: string;
  word_set_id: string;
  text: string;
  definition?: string;
  hint_text?: string;
  hint_image_url?: string;
  order_index: number;
  created_at: string;
}

export interface Scene {
  id: string;
  word_set_id: string;
  image_url: string;
  scene_index: number; // 0-3 for 4 variations
  style_preset?: string;
  created_at: string;
}

export interface SceneObject {
  id: string;
  scene_id: string;
  word_id: string;
  object_name: string;
  position_data?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  created_at: string;
}

export interface Student {
  id: string;
  name: string;
  created_at: string;
}

export interface WordAttempt {
  id: string;
  student_id: string;
  word_id: string;
  is_correct: boolean;
  confidence?: number;
  used_hint: boolean;
  drawing_data?: string; // base64 image
  created_at: string;
}

export interface SceneAttempt {
  id: string;
  student_id: string;
  scene_id: string;
  object_name: string;
  is_correct: boolean;
  attempts_count: number;
  created_at: string;
}

// API Types
export interface TTSRequest {
  text: string;
  context: 'draw_word' | 'recognised_word' | 'not_recognised' | 'see_hint' | 'scene_intro' | 'scene_object_prompt' | 'scene_word_prompt' | 'collection_page';
}

export interface TTSResponse {
  audioUrl: string;
}

export interface DrawingRecognitionRequest {
  imageBase64: string;
  targetWord: string;
}

export interface DrawingRecognitionResponse {
  label: string;
  confidence: number;
  isMatch: boolean;
}

export interface SceneGenerationRequest {
  sceneWord: string;
  objects: string[];
  variationIndex: number; // 0-3
}

export interface SceneGenerationResponse {
  imageUrl: string;
}

// TSV Parsing Types
export interface WordSetData {
  slNo: number;
  sceneName: string;
  word1: string;
  word2: string;
  word3: string;
  word4: string;
}

// Sound Effect Types
export type SoundEffectKey =
  | 'click'
  | 'select'
  | 'pageTurn'
  | 'cardDraw'
  | 'submit'
  | 'success'
  | 'error'
  | 'hint'
  | 'letterSelect'
  | 'letterPlace'
  | 'wordComplete'
  | 'objectReveal'
  | 'sceneSelect'
  | 'collectionBadge'
  | 'nextSetUnlock'
  | 'teacherNav';

// Journey State Types
export interface StudentProgress {
  currentSetId: string;
  currentWordIndex: number;
  completedSets: string[];
  collectedWords: string[];
  wordsNeedingPractice: string[];
}

// Component Props Types
export interface NotebookLayoutProps {
  children: React.ReactNode;
}

export interface PageTurnWrapperProps {
  children: React.ReactNode;
  direction?: 'forward' | 'backward';
  onComplete?: () => void;
}

export interface DrawingCanvasProps {
  onSubmit: (imageData: string) => void;
  targetWord: string;
}

export interface LetterBankProps {
  targetWord: string;
  onComplete: (isCorrect: boolean) => void;
}

export interface SceneCardProps {
  imageUrl: string;
  sceneWord: string;
  isSelected: boolean;
  onClick: () => void;
}
