import { SoundEffectKey } from '@/types';

// Sound effect file mappings
export const SOUND_EFFECTS: Record<SoundEffectKey, string> = {
  click: '/sounds/click_double_on.wav',
  select: '/sounds/select_1.wav',
  pageTurn: '/sounds/card_draw_1.wav',
  cardDraw: '/sounds/card_draw_2.wav',
  submit: '/sounds/pop_2.wav',
  success: '/sounds/match_xylophone_5.wav',
  error: '/sounds/sci_fi_error.wav',
  hint: '/sounds/sci_fi_select.wav',
  letterSelect: '/sounds/pop_1.wav',
  letterPlace: '/sounds/match_synth_2.wav',
  wordComplete: '/sounds/match_xylophone_7.wav',
  objectReveal: '/sounds/match_synth_4.wav',
  sceneSelect: '/sounds/card_draw_2.wav',
  collectionBadge: '/sounds/match_xylophone_10_MAX.wav',
  nextSetUnlock: '/sounds/match_synth_8.wav',
  teacherNav: '/sounds/click_double_off.wav'
};

// Check if user has reduced motion preference
function shouldPlaySound(): boolean {
  if (typeof window === 'undefined') return false;

  // Check localStorage preference
  const soundsDisabled = localStorage.getItem('sounds-disabled') === 'true';
  if (soundsDisabled) return false;

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return !prefersReducedMotion;
}

// Play a sound effect
export function playSound(soundKey: SoundEffectKey, volume: number = 0.4): void {
  if (!shouldPlaySound()) return;

  try {
    const audio = new Audio(SOUND_EFFECTS[soundKey]);
    audio.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    audio.play().catch((error) => {
      // Handle autoplay restrictions silently
      console.warn(`Could not play sound ${soundKey}:`, error);
    });
  } catch (error) {
    console.error(`Error playing sound ${soundKey}:`, error);
  }
}

// Preload commonly used sounds
export function preloadSounds(soundKeys: SoundEffectKey[]): void {
  if (typeof window === 'undefined') return;

  soundKeys.forEach((key) => {
    const audio = new Audio(SOUND_EFFECTS[key]);
    audio.preload = 'auto';
  });
}

// Toggle sound effects on/off
export function toggleSounds(): boolean {
  if (typeof window === 'undefined') return false;

  const currentState = localStorage.getItem('sounds-disabled') === 'true';
  const newState = !currentState;
  localStorage.setItem('sounds-disabled', String(newState));
  return !newState; // Return true if sounds are now enabled
}

// Check if sounds are enabled
export function areSoundsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('sounds-disabled') !== 'true';
}

// React Hook for sound effects
export function useSoundEffect(soundKey: SoundEffectKey, volume?: number) {
  return () => playSound(soundKey, volume);
}
