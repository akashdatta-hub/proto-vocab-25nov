'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { playSound } from '@/lib/sound-effects';
import { X, Volume2 } from 'lucide-react';

interface SpellingInterfaceProps {
  word: string;
  onCorrect: () => void;
  onClose: () => void;
  onPlayAudio?: () => void;
}

/**
 * SpellingInterface - Letter tile spelling game for scene objects
 *
 * Features:
 * - Scrambled letter tiles
 * - Drag or click to spell
 * - Audio playback of word
 * - Success/error feedback
 */
export function SpellingInterface({
  word,
  onCorrect,
  onClose,
  onPlayAudio
}: SpellingInterfaceProps) {
  const [selectedLetters, setSelectedLetters] = React.useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = React.useState<string[]>([]);
  const [feedback, setFeedback] = React.useState<'correct' | 'incorrect' | null>(null);

  React.useEffect(() => {
    // Scramble letters
    const letters = word.toLowerCase().split('');
    const scrambled = [...letters].sort(() => Math.random() - 0.5);
    setAvailableLetters(scrambled);
    setSelectedLetters([]);
    setFeedback(null);
  }, [word]);

  const handleLetterClick = (letter: string, index: number) => {
    playSound('tilePlace', 0.3);
    setSelectedLetters([...selectedLetters, letter]);
    setAvailableLetters(availableLetters.filter((_, i) => i !== index));
  };

  const handleRemoveLetter = (index: number) => {
    playSound('tileRemove', 0.3);
    const letter = selectedLetters[index];
    setSelectedLetters(selectedLetters.filter((_, i) => i !== index));
    setAvailableLetters([...availableLetters, letter]);
  };

  const handleCheck = () => {
    const attempt = selectedLetters.join('');
    const correct = attempt.toLowerCase() === word.toLowerCase();

    if (correct) {
      setFeedback('correct');
      playSound('success', 0.7);
      setTimeout(() => {
        onCorrect();
      }, 1500);
    } else {
      setFeedback('incorrect');
      playSound('error', 0.5);
      setTimeout(() => {
        setFeedback(null);
      }, 1000);
    }
  };

  const handleReset = () => {
    playSound('click', 0.3);
    const letters = word.toLowerCase().split('');
    const scrambled = [...letters].sort(() => Math.random() - 0.5);
    setAvailableLetters(scrambled);
    setSelectedLetters([]);
    setFeedback(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-800">Spell the word!</h2>
          <div className="flex gap-2">
            {onPlayAudio && (
              <Button
                variant="outline"
                size="icon"
                onClick={onPlayAudio}
                className="h-10 w-10"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="h-10 w-10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Selected letters area */}
        <div className="mb-8">
          <p className="text-sm text-zinc-600 mb-3">Your spelling:</p>
          <div className="flex justify-center gap-2 min-h-[80px] p-4 bg-zinc-50 rounded-lg border-2 border-zinc-200">
            <AnimatePresence>
              {selectedLetters.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center text-zinc-400 text-lg"
                >
                  Tap letters below to spell...
                </motion.div>
              ) : (
                selectedLetters.map((letter, index) => (
                  <motion.button
                    key={`selected-${index}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={() => handleRemoveLetter(index)}
                    className="w-16 h-16 bg-amber-500 text-white text-2xl font-bold rounded-lg shadow-lg hover:bg-amber-600 transition-colors"
                  >
                    {letter.toUpperCase()}
                  </motion.button>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Available letters */}
        <div className="mb-6">
          <p className="text-sm text-zinc-600 mb-3">Available letters:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <AnimatePresence>
              {availableLetters.map((letter, index) => (
                <motion.button
                  key={`available-${index}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={() => handleLetterClick(letter, index)}
                  className="w-16 h-16 bg-blue-500 text-white text-2xl font-bold rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
                >
                  {letter.toUpperCase()}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1"
            disabled={feedback === 'correct'}
          >
            Reset
          </Button>
          <Button
            onClick={handleCheck}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={selectedLetters.length !== word.length || feedback === 'correct'}
          >
            Check
          </Button>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-4 p-4 rounded-lg text-center font-bold ${
                feedback === 'correct'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {feedback === 'correct' ? '🎉 Correct! Great job!' : '❌ Try again!'}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
