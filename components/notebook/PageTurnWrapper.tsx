'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '@/lib/sound-effects';

interface PageTurnWrapperProps {
  children: React.ReactNode;
  pageKey: string | number;
  direction?: 'forward' | 'backward';
  onAnimationComplete?: () => void;
}

/**
 * PageTurnWrapper - Animates page transitions with page-turn effect
 *
 * Features:
 * - Forward/backward page turn animations
 * - Automatic sound effect on page turn
 * - Smooth transitions with realistic timing
 * - Supports any child content
 */
export function PageTurnWrapper({
  children,
  pageKey,
  direction = 'forward',
  onAnimationComplete
}: PageTurnWrapperProps) {
  const isForward = direction === 'forward';

  // Play page turn sound when component mounts
  React.useEffect(() => {
    playSound('pageTurn', 0.3);
  }, [pageKey]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={{
          opacity: 0,
          x: isForward ? 100 : -100,
          rotateY: isForward ? 15 : -15,
          scale: 0.95
        }}
        animate={{
          opacity: 1,
          x: 0,
          rotateY: 0,
          scale: 1
        }}
        exit={{
          opacity: 0,
          x: isForward ? -100 : 100,
          rotateY: isForward ? -15 : 15,
          scale: 0.95
        }}
        transition={{
          duration: 0.5,
          ease: [0.43, 0.13, 0.23, 0.96], // Custom easing for natural feel
          opacity: { duration: 0.3 }
        }}
        onAnimationComplete={onAnimationComplete}
        style={{
          transformStyle: 'preserve-3d',
          perspective: 1000
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * PageNavigationButtons - Navigation buttons for page turns
 */
interface PageNavigationButtonsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  showPrevious?: boolean;
  showNext?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
}

export function PageNavigationButtons({
  onPrevious,
  onNext,
  showPrevious = true,
  showNext = true,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  className = ''
}: PageNavigationButtonsProps) {
  const handlePrevious = () => {
    playSound('click', 0.4);
    onPrevious?.();
  };

  const handleNext = () => {
    playSound('click', 0.4);
    onNext?.();
  };

  return (
    <div className={`flex justify-between items-center gap-4 mt-8 ${className}`}>
      {/* Previous button */}
      {showPrevious && onPrevious ? (
        <motion.button
          whileHover={{ scale: 1.05, x: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrevious}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-zinc-100 to-zinc-200 hover:from-zinc-200 hover:to-zinc-300 text-zinc-700 rounded-lg shadow-md transition-all duration-200 font-medium"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {previousLabel}
        </motion.button>
      ) : (
        <div />
      )}

      {/* Next button */}
      {showNext && onNext ? (
        <motion.button
          whileHover={{ scale: 1.05, x: 4 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg shadow-md transition-all duration-200 font-medium"
        >
          {nextLabel}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </motion.button>
      ) : (
        <div />
      )}
    </div>
  );
}

/**
 * PageTransitionProvider - Context for managing page transitions
 */
interface PageTransitionContextType {
  navigateToPage: (pageKey: string, direction?: 'forward' | 'backward') => void;
  currentPage: string;
}

const PageTransitionContext = React.createContext<PageTransitionContextType | undefined>(
  undefined
);

export function PageTransitionProvider({
  children,
  initialPage = 'home'
}: {
  children: React.ReactNode;
  initialPage?: string;
}) {
  const [currentPage, setCurrentPage] = React.useState(initialPage);

  const navigateToPage = React.useCallback((pageKey: string, direction?: 'forward' | 'backward') => {
    setCurrentPage(pageKey);
  }, []);

  return (
    <PageTransitionContext.Provider value={{ navigateToPage, currentPage }}>
      {children}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = React.useContext(PageTransitionContext);
  if (!context) {
    throw new Error('usePageTransition must be used within PageTransitionProvider');
  }
  return context;
}
