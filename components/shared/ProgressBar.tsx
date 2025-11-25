'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  showFraction?: boolean;
  className?: string;
  barClassName?: string;
}

/**
 * ProgressBar - Visual progress indicator
 *
 * Features:
 * - Animated progress bar
 * - Optional label, percentage, and fraction display
 * - Customizable colors and styles
 */
export function ProgressBar({
  current,
  total,
  label,
  showPercentage = false,
  showFraction = true,
  className = '',
  barClassName = ''
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const isComplete = current >= total;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header with label and stats */}
      {(label || showPercentage || showFraction) && (
        <div className="flex justify-between items-center text-sm">
          {label && (
            <span className="font-medium text-zinc-700">{label}</span>
          )}
          <div className="flex items-center gap-2 text-zinc-600">
            {showFraction && (
              <span>
                {current}/{total}
              </span>
            )}
            {showPercentage && (
              <span className="font-medium">{percentage}%</span>
            )}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="relative w-full h-3 bg-zinc-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 0.6,
            ease: 'easeOut'
          }}
          className={cn(
            'h-full rounded-full',
            isComplete
              ? 'bg-gradient-to-r from-green-400 to-green-500'
              : 'bg-gradient-to-r from-amber-400 to-orange-400',
            barClassName
          )}
        />
      </div>
    </div>
  );
}

/**
 * CircularProgress - Circular progress indicator
 */
interface CircularProgressProps {
  current: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export function CircularProgress({
  current,
  total,
  size = 100,
  strokeWidth = 8,
  showLabel = true,
  className = ''
}: CircularProgressProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const isComplete = current >= total;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-zinc-200"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
          className={cn(
            isComplete ? 'text-green-500' : 'text-amber-500'
          )}
        />
      </svg>

      {/* Center label */}
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-zinc-800">
            {current}
          </span>
          <span className="text-sm text-zinc-600">/ {total}</span>
        </div>
      )}
    </div>
  );
}

/**
 * StepProgress - Multi-step progress indicator
 */
interface StepProgressProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function StepProgress({
  steps,
  currentStep,
  className = ''
}: StepProgressProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={index}>
            {/* Step circle */}
            <div className="flex flex-col items-center gap-2">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all',
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-amber-500 text-white'
                    : 'bg-zinc-300 text-zinc-600'
                )}
              >
                {isCompleted ? '✓' : index + 1}
              </motion.div>
              <span
                className={cn(
                  'text-xs font-medium text-center max-w-[80px]',
                  isCompleted || isCurrent ? 'text-zinc-800' : 'text-zinc-500'
                )}
              >
                {step}
              </span>
            </div>

            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-2 bg-zinc-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                  className="h-full bg-green-500"
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
