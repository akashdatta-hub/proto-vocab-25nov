'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '@/lib/sound-effects';
import { cn } from '@/lib/utils';

interface LetterBankProps {
  targetWord: string;
  onComplete?: (isCorrect: boolean) => void;
  className?: string;
}

/**
 * LetterBank - Interactive word spelling game
 *
 * Features:
 * - Drag-and-drop letter tiles
 * - Shuffled letter bank
 * - Visual feedback for correct/incorrect spelling
 * - Touch and mouse support
 * - Automatic validation on completion
 */
export function LetterBank({
  targetWord,
  onComplete,
  className = ''
}: LetterBankProps) {
  const [placedLetters, setPlacedLetters] = React.useState<(string | null)[]>(
    Array(targetWord.length).fill(null)
  );
  const [availableLetters, setAvailableLetters] = React.useState<string[]>([]);
  const [isComplete, setIsComplete] = React.useState(false);
  const [isCorrect, setIsCorrect] = React.useState(false);

  // Initialize shuffled letters on mount
  React.useEffect(() => {
    const letters = targetWord.split('');
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setAvailableLetters(shuffled);
    setPlacedLetters(Array(targetWord.length).fill(null));
    setIsComplete(false);
    setIsCorrect(false);
  }, [targetWord]);

  // Check if word is complete and correct
  React.useEffect(() => {
    const hasAllLetters = placedLetters.every((letter) => letter !== null);

    if (hasAllLetters) {
      const spelledWord = placedLetters.join('');
      const correct = spelledWord.toLowerCase() === targetWord.toLowerCase();

      setIsComplete(true);
      setIsCorrect(correct);

      if (correct) {
        playSound('success', 0.6);
      } else {
        playSound('error', 0.4);
      }

      onComplete?.(correct);
    } else {
      setIsComplete(false);
      setIsCorrect(false);
    }
  }, [placedLetters, targetWord, onComplete]);

  const handleLetterClick = (letter: string, fromBank: boolean, index: number) => {
    playSound('letterPlace', 0.4);

    if (fromBank) {
      // Place letter from bank into first empty slot
      const emptyIndex = placedLetters.findIndex((l) => l === null);
      if (emptyIndex !== -1) {
        const newPlaced = [...placedLetters];
        newPlaced[emptyIndex] = letter;
        setPlacedLetters(newPlaced);

        const newAvailable = [...availableLetters];
        newAvailable.splice(index, 1);
        setAvailableLetters(newAvailable);
      }
    } else {
      // Return letter from slot to bank
      const newPlaced = [...placedLetters];
      newPlaced[index] = null;
      setPlacedLetters(newPlaced);

      setAvailableLetters([...availableLetters, letter]);
    }
  };

  const handleReset = () => {
    const letters = targetWord.split('');
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setAvailableLetters(shuffled);
    setPlacedLetters(Array(targetWord.length).fill(null));
    setIsComplete(false);
    setIsCorrect(false);
    playSound('click', 0.3);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Word slots */}
      <div className="flex flex-wrap justify-center gap-2">
        {placedLetters.map((letter, index) => (
          <motion.div
            key={`slot-${index}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'w-12 h-14 md:w-16 md:h-20 flex items-center justify-center',
              'border-3 rounded-lg text-2xl md:text-3xl font-bold',
              'transition-all duration-300 cursor-pointer',
              letter
                ? isComplete
                  ? isCorrect
                    ? 'bg-green-100 border-green-400 text-green-700'
                    : 'bg-red-100 border-red-400 text-red-700'
                  : 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                : 'bg-zinc-50 border-zinc-300 border-dashed'
            )}
            onClick={() => letter && handleLetterClick(letter, false, index)}
            whileHover={letter ? { scale: 1.05 } : {}}
            whileTap={letter ? { scale: 0.95 } : {}}
          >
            {letter || ' '}
          </motion.div>
        ))}
      </div>

      {/* Feedback message */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'text-center py-3 px-6 rounded-lg font-medium text-lg',
              isCorrect
                ? 'bg-green-100 text-green-700 border-2 border-green-400'
                : 'bg-red-100 text-red-700 border-2 border-red-400'
            )}
          >
            {isCorrect ? (
              <span>🎉 Perfect! You spelled it correctly!</span>
            ) : (
              <span>❌ Not quite right. Try again!</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letter bank */}
      <div>
        <p className="text-center text-sm text-zinc-600 mb-3 font-medium">
          Tap letters to spell the word:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <AnimatePresence>
            {availableLetters.map((letter, index) => (
              <motion.button
                key={`bank-${index}-${letter}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleLetterClick(letter, true, index)}
                className="w-12 h-14 md:w-16 md:h-20 flex items-center justify-center bg-gradient-to-br from-amber-200 to-orange-300 hover:from-amber-300 hover:to-orange-400 border-2 border-amber-400 rounded-lg text-2xl md:text-3xl font-bold text-zinc-800 shadow-md transition-all duration-200"
              >
                {letter}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Reset button */}
      {isComplete && !isCorrect && (
        <div className="text-center">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="px-6 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg font-medium transition-colors duration-200"
          >
            Reset and Try Again
          </motion.button>
        </div>
      )}
    </div>
  );
}

/**
 * LetterBankInstructions - Instruction text for letter bank
 */
export function LetterBankInstructions({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'text-center p-4 bg-blue-50 border-2 border-blue-200 rounded-lg',
        className
      )}
    >
      <p className="text-blue-800 font-medium">
        📝 Tap the letters below to spell the word correctly!
      </p>
    </motion.div>
  );
}
