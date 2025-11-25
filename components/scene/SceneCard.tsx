'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { playSound } from '@/lib/sound-effects';
import { cn } from '@/lib/utils';

interface SceneCardProps {
  imageUrl: string;
  sceneWord: string;
  objectsFound?: number;
  totalObjects?: number;
  onClick?: () => void;
  className?: string;
}

/**
 * SceneCard - Displays a scene thumbnail with progress indicator
 *
 * Features:
 * - Scene image preview
 * - Progress indicator showing objects found
 * - Click to view full scene
 * - Hover animations
 */
export function SceneCard({
  imageUrl,
  sceneWord,
  objectsFound = 0,
  totalObjects = 4,
  onClick,
  className = ''
}: SceneCardProps) {
  const progress = totalObjects > 0 ? (objectsFound / totalObjects) * 100 : 0;
  const isComplete = objectsFound === totalObjects;

  const handleClick = () => {
    playSound('sceneSelect', 0.4);
    onClick?.();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={cn(
        'relative cursor-pointer rounded-xl overflow-hidden shadow-lg border-3',
        isComplete
          ? 'border-green-400 bg-green-50'
          : 'border-zinc-300 bg-white',
        'transition-all duration-300',
        className
      )}
    >
      {/* Scene image */}
      <div className="relative aspect-video w-full bg-zinc-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${sceneWord} scene`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
            <span className="text-4xl">🖼️</span>
          </div>
        )}

        {/* Completion badge */}
        {isComplete && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
            ✓ Complete
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-zinc-800 mb-2 capitalize">
          {sceneWord}
        </h3>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-zinc-600">
            <span>Objects found:</span>
            <span className="font-medium">
              {objectsFound}/{totalObjects}
            </span>
          </div>

          <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                isComplete
                  ? 'bg-gradient-to-r from-green-400 to-green-500'
                  : 'bg-gradient-to-r from-amber-400 to-orange-400'
              )}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * SceneGrid - Grid layout for multiple scene cards
 */
interface SceneGridProps {
  children: React.ReactNode;
  className?: string;
}

export function SceneGrid({ children, className = '' }: SceneGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 gap-6',
        className
      )}
    >
      {children}
    </div>
  );
}
