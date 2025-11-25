'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NotebookLayoutProps {
  children: React.ReactNode;
  showRings?: boolean;
  className?: string;
}

/**
 * NotebookLayout - Provides paper texture background and notebook aesthetic
 *
 * Features:
 * - Paper texture background with slight grain
 * - Optional spiral ring binding on left edge
 * - Responsive padding and layout
 * - Soft shadow for depth
 */
export function NotebookLayout({
  children,
  showRings = true,
  className
}: NotebookLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl"
      >
        {/* Notebook page container */}
        <div className="relative">
          {/* Spiral rings (left side) */}
          {showRings && (
            <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-start pt-12 gap-16 z-10">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-4 border-zinc-400 bg-zinc-200 shadow-inner"
                  style={{
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.1)'
                  }}
                />
              ))}
            </div>
          )}

          {/* Paper page */}
          <div
            className={cn(
              'relative bg-white rounded-r-lg shadow-2xl',
              showRings ? 'ml-4 pl-12' : 'ml-0 pl-8 rounded-l-lg',
              'pr-8 py-8 md:py-12',
              'min-h-[600px]',
              // Paper texture effect
              'bg-[radial-gradient(circle_at_50%_50%,rgba(255,248,240,0)_0%,rgba(255,248,240,0.8)_100%)]',
              className
            )}
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 31px,
                  rgba(200, 200, 200, 0.1) 31px,
                  rgba(200, 200, 200, 0.1) 32px
                )
              `,
              boxShadow: `
                0 1px 2px rgba(0, 0, 0, 0.05),
                0 4px 8px rgba(0, 0, 0, 0.08),
                0 12px 24px rgba(0, 0, 0, 0.12),
                inset 0 0 100px rgba(255, 248, 240, 0.5)
              `
            }}
          >
            {/* Red margin line */}
            <div
              className="absolute left-0 top-0 bottom-0 w-px bg-red-300 opacity-60"
              style={{ left: showRings ? '3.5rem' : '2rem' }}
            />

            {/* Content */}
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * NotebookPage - Individual page within notebook with optional page number
 */
interface NotebookPageProps {
  children: React.ReactNode;
  pageNumber?: number;
  className?: string;
}

export function NotebookPage({
  children,
  pageNumber,
  className
}: NotebookPageProps) {
  return (
    <div className={cn('relative', className)}>
      {children}

      {/* Page number (bottom right) */}
      {pageNumber !== undefined && (
        <div className="absolute bottom-4 right-4 text-sm text-zinc-400 font-serif">
          {pageNumber}
        </div>
      )}
    </div>
  );
}

/**
 * NotebookHeader - Styled header for notebook pages
 */
interface NotebookHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function NotebookHeader({
  title,
  subtitle,
  className
}: NotebookHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      <h1 className="text-3xl md:text-4xl font-bold text-zinc-800 mb-2 font-serif">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg text-zinc-600 font-handwriting">
          {subtitle}
        </p>
      )}
      {/* Decorative underline */}
      <div className="mt-4 h-1 w-24 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full" />
    </div>
  );
}
