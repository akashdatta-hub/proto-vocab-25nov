'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { playSound } from '@/lib/sound-effects';
import { cn } from '@/lib/utils';
import { SpellingInterface } from './SpellingInterface';

interface SceneObject {
  id: string;
  wordId: string;
  objectName: string;
  position: { x: number; y: number };
  boundingBox?: { x: number; y: number; width: number; height: number };
  silhouetteUrl?: string;
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
 * SceneSilhouette - Interactive scene with silhouette masks and spelling
 *
 * Features:
 * - Clickable silhouette overlays for each unfound object
 * - Spelling interface appears on click
 * - Silhouette reveals actual object on correct spelling
 * - Progress tracking for all objects
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
  const [spellingObject, setSpellingObject] = React.useState<SceneObject | null>(null);

  const allFound = objects.every((obj) => obj.found);

  const handleSilhouetteClick = (obj: SceneObject) => {
    if (obj.found) return;
    playSound('click', 0.4);
    setSpellingObject(obj);
  };

  const handleSpellingCorrect = () => {
    if (!spellingObject) return;

    // Mark object as found
    onObjectClick?.(spellingObject.id);

    // Close spelling interface
    setTimeout(() => {
      setSpellingObject(null);
      onNextObject?.();
    }, 500);
  };

  const handleSpellingClose = () => {
    playSound('click', 0.3);
    setSpellingObject(null);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Instructions */}
      {!allFound && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg"
        >
          <p className="text-lg text-zinc-700 mb-2">
            Click on the <span className="font-bold text-amber-600">silhouette objects</span> to spell their names!
          </p>
          <p className="text-sm text-zinc-600">
            Spell correctly to reveal the actual object underneath
          </p>
        </motion.div>
      )}

      {/* Scene with silhouette overlays */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-xl overflow-hidden border-4 border-zinc-300 shadow-2xl"
      >
        {/* Base scene image */}
        <div className="relative aspect-video w-full bg-zinc-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${sceneWord} scene`}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
              <span className="text-6xl">🖼️</span>
            </div>
          )}

          {/* Silhouette overlays for unfound objects */}
          {objects.map((obj) => {
            if (obj.found) return null;

            // Use bounding box if available, otherwise fallback to centered position
            const bbox = obj.boundingBox || {
              x: obj.position.x - 12,
              y: obj.position.y - 12,
              width: 24,
              height: 24
            };

            return (
              <motion.div
                key={obj.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute cursor-pointer group"
                style={{
                  left: `${bbox.x}%`,
                  top: `${bbox.y}%`,
                  width: `${bbox.width}%`,
                  height: `${bbox.height}%`
                }}
                onClick={() => handleSilhouetteClick(obj)}
              >
                {obj.silhouetteUrl ? (
                  // If we have a silhouette mask, use it
                  <Image
                    src={obj.silhouetteUrl}
                    alt={`${obj.objectName} silhouette`}
                    fill
                    className="object-contain pointer-events-none"
                  />
                ) : (
                  // Fallback: Dark semi-transparent overlay with question mark
                  <div className="w-full h-full relative">
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/70 rounded-2xl backdrop-blur-[2px] group-hover:bg-black/80 transition-colors" />

                    {/* Pulsing border */}
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 border-4 border-amber-400 rounded-2xl pointer-events-none"
                    />

                    {/* Question mark icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{
                          y: [0, -5, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="text-white text-4xl md:text-6xl font-bold opacity-80"
                      >
                        ?
                      </motion.div>
                    </div>

                    {/* Hover label */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Click to spell!
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Green checkmarks for found objects */}
          <AnimatePresence>
            {objects.map((obj) =>
              obj.found ? (
                <motion.div
                  key={`found-${obj.id}`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  className="absolute w-12 h-12 bg-green-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white font-bold text-2xl z-10"
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

      {/* Spelling Interface Modal */}
      <AnimatePresence>
        {spellingObject && (
          <SpellingInterface
            word={spellingObject.objectName}
            onCorrect={handleSpellingCorrect}
            onClose={handleSpellingClose}
          />
        )}
      </AnimatePresence>
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
                : 'bg-zinc-50 text-zinc-600'
            )}
          >
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold',
                obj.found
                  ? 'bg-green-500 text-white'
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
