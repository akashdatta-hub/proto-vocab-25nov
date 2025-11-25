'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Lightbulb, X } from 'lucide-react';
import { playSound } from '@/lib/sound-effects';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface HintCardProps {
  hintText?: string;
  hintImageUrl?: string;
  onUseHint?: () => void;
  className?: string;
}

/**
 * HintCard - Collapsible hint card with text and optional image
 *
 * Features:
 * - Toggleable hint display
 * - Text and image support
 * - Tracks hint usage
 * - Smooth animations
 */
export function HintCard({
  hintText,
  hintImageUrl,
  onUseHint,
  className = ''
}: HintCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hasUsedHint, setHasUsedHint] = React.useState(false);

  const toggleHint = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (newIsOpen && !hasUsedHint) {
      setHasUsedHint(true);
      onUseHint?.();
      playSound('hint', 0.4);
    } else {
      playSound('click', 0.3);
    }
  };

  if (!hintText && !hintImageUrl) {
    return null;
  }

  return (
    <div className={cn('', className)}>
      {/* Toggle button */}
      <Button
        variant={isOpen ? 'default' : 'outline'}
        onClick={toggleHint}
        className={cn(
          'flex items-center gap-2',
          isOpen
            ? 'bg-amber-500 hover:bg-amber-600 text-white'
            : 'text-amber-600 hover:text-amber-700 border-amber-300'
        )}
      >
        {isOpen ? (
          <>
            <X className="w-4 h-4" />
            Hide Hint
          </>
        ) : (
          <>
            <Lightbulb className="w-4 h-4" />
            Show Hint
          </>
        )}
      </Button>

      {/* Hint content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg space-y-4">
              {/* Hint icon and title */}
              <div className="flex items-center gap-2 text-amber-700">
                <Lightbulb className="w-5 h-5" />
                <span className="font-bold text-lg">Hint</span>
              </div>

              {/* Hint text */}
              {hintText && (
                <p className="text-zinc-700 leading-relaxed">
                  {hintText}
                </p>
              )}

              {/* Hint image */}
              {hintImageUrl && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-amber-200">
                  <Image
                    src={hintImageUrl}
                    alt="Hint image"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Hint usage note */}
              {hasUsedHint && (
                <p className="text-xs text-amber-600 italic">
                  💡 Hint used - this will be recorded in your progress
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * InlineHint - Small inline hint display
 */
interface InlineHintProps {
  text: string;
  className?: string;
}

export function InlineHint({ text, className = '' }: InlineHintProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-start gap-2 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r text-sm text-blue-800',
        className
      )}
    >
      <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <p>{text}</p>
    </motion.div>
  );
}

/**
 * DefinitionCard - Displays word definition in a card
 */
interface DefinitionCardProps {
  word: string;
  definition: string;
  className?: string;
}

export function DefinitionCard({
  word,
  definition,
  className = ''
}: DefinitionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'p-6 bg-white border-2 border-zinc-200 rounded-xl shadow-md',
        className
      )}
    >
      <div className="space-y-3">
        <div>
          <span className="text-sm text-zinc-500 font-medium uppercase tracking-wide">
            Word
          </span>
          <h3 className="text-2xl font-bold text-zinc-800 capitalize">
            {word}
          </h3>
        </div>

        <div className="pt-3 border-t border-zinc-200">
          <span className="text-sm text-zinc-500 font-medium uppercase tracking-wide">
            Definition
          </span>
          <p className="text-zinc-700 leading-relaxed mt-1">
            {definition}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
