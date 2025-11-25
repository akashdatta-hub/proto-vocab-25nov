'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { playSound } from '@/lib/sound-effects';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SceneObject {
  id: string;
  wordId: string;
  objectName: string;
  position: { x: number; y: number };
  found: boolean;
}

interface SceneSilhouetteProps {
  imageUrl: string;
  sceneWord: string;
  objects: SceneObject[];
  currentObjectIndex: number;
  onObjectClick?: (objectId: string) => void;
  onNextObject?: () => void;
  className?: string;
}

/**
 * SceneSilhouette - Interactive scene with clickable objects
 *
 * Features:
 * - Full scene display with overlay
 * - Highlighted clickable regions for objects
 * - Progress through objects one at a time
 * - Visual feedback for correct/incorrect clicks
 * - Completion celebration
 */
export function SceneSilhouette({
  imageUrl,
  sceneWord,
  objects,
  currentObjectIndex,
  onObjectClick,
  onNextObject,
  className = ''
}: SceneSilhouetteProps) {
  const [clickFeedback, setClickFeedback] = React.useState<{
    x: number;
    y: number;
    isCorrect: boolean;
  } | null>(null);

  const currentObject = objects[currentObjectIndex];
  const allFound = objects.every((obj) => obj.found);

  const handleSceneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentObject || currentObject.found) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if click is near the current object (within 15% tolerance)
    const distance = Math.sqrt(
      Math.pow(x - currentObject.position.x, 2) +
      Math.pow(y - currentObject.position.y, 2)
    );

    const isCorrect = distance < 15;

    setClickFeedback({ x, y, isCorrect });

    if (isCorrect) {
      playSound('success', 0.5);
      onObjectClick?.(currentObject.id);

      // Clear feedback and move to next after delay
      setTimeout(() => {
        setClickFeedback(null);
        onNextObject?.();
      }, 1500);
    } else {
      playSound('error', 0.3);
      setTimeout(() => setClickFeedback(null), 1000);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Current object prompt */}
      {!allFound && currentObject && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg"
        >
          <p className="text-lg text-zinc-600 mb-2">Find this object:</p>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-800 capitalize">
            {currentObject.objectName}
          </h2>
        </motion.div>
      )}

      {/* Scene image with clickable areas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-xl overflow-hidden border-4 border-zinc-300 shadow-2xl cursor-crosshair"
        onClick={handleSceneClick}
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
              <span className="text-6xl">🖼️</span>
            </div>
          )}

          {/* Current object hint (pulsing silhouette circle) */}
          {!allFound && currentObject && !currentObject.found && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute w-24 h-24 rounded-full border-4 border-amber-400 bg-amber-400/10 pointer-events-none"
              style={{
                left: `${currentObject.position.x}%`,
                top: `${currentObject.position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )}

          {/* Object markers (for found objects) */}
          {objects.map((obj) =>
            obj.found ? (
              <motion.div
                key={obj.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute w-8 h-8 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white font-bold"
                style={{
                  left: `${obj.position.x}%`,
                  top: `${obj.position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                ✓
              </motion.div>
            ) : null
          )}

          {/* Click feedback */}
          <AnimatePresence>
            {clickFeedback && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className={cn(
                  'absolute w-16 h-16 rounded-full border-4',
                  clickFeedback.isCorrect
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-red-500 bg-red-500/20'
                )}
                style={{
                  left: `${clickFeedback.x}%`,
                  top: `${clickFeedback.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Progress indicators */}
      <div className="flex justify-center gap-2">
        {objects.map((obj, index) => (
          <div
            key={obj.id}
            className={cn(
              'w-3 h-3 rounded-full transition-all duration-300',
              obj.found
                ? 'bg-green-500 scale-110'
                : index === currentObjectIndex
                ? 'bg-amber-400 scale-125 animate-pulse'
                : 'bg-zinc-300'
            )}
          />
        ))}
      </div>

      {/* Completion message */}
      {allFound && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-3 border-green-400 rounded-xl"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-green-700 mb-2">
            Scene Complete!
          </h2>
          <p className="text-lg text-green-600">
            You found all {objects.length} objects in the {sceneWord} scene!
          </p>
        </motion.div>
      )}
    </div>
  );
}

/**
 * SceneObjectsList - Shows list of objects to find
 */
interface SceneObjectsListProps {
  objects: SceneObject[];
  currentObjectIndex: number;
  className?: string;
}

export function SceneObjectsList({
  objects,
  currentObjectIndex,
  className = ''
}: SceneObjectsListProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm font-medium text-zinc-600 mb-3">Objects to find:</p>
      <div className="space-y-2">
        {objects.map((obj, index) => (
          <motion.div
            key={obj.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg transition-all',
              obj.found
                ? 'bg-green-100 text-green-700'
                : index === currentObjectIndex
                ? 'bg-amber-100 text-amber-700 font-medium'
                : 'bg-zinc-50 text-zinc-600'
            )}
          >
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold',
                obj.found
                  ? 'bg-green-500 text-white'
                  : index === currentObjectIndex
                  ? 'bg-amber-500 text-white'
                  : 'bg-zinc-300 text-zinc-600'
              )}
            >
              {obj.found ? '✓' : index + 1}
            </div>
            <span className="capitalize">{obj.objectName}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
