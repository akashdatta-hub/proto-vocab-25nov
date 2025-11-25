'use client';

import React from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import { motion } from 'framer-motion';
import { playSound } from '@/lib/sound-effects';
import { Button } from '@/components/ui/button';
import { Eraser, Undo2, Trash2, Pencil } from 'lucide-react';

interface DrawingCanvasProps {
  onDrawingComplete?: (imageDataUrl: string) => void;
  width?: string | number;
  height?: string | number;
  className?: string;
}

/**
 * DrawingCanvas - Interactive canvas for student drawings
 *
 * Features:
 * - Smooth drawing with react-sketch-canvas
 * - Undo, clear, and eraser tools
 * - Adjustable stroke width and color
 * - Export drawing as base64 image
 * - Touch and mouse support
 */
export function DrawingCanvas({
  onDrawingComplete,
  width = '100%',
  height = 400,
  className = ''
}: DrawingCanvasProps) {
  const canvasRef = React.useRef<ReactSketchCanvasRef>(null);
  const [isErasing, setIsErasing] = React.useState(false);
  const [strokeWidth, setStrokeWidth] = React.useState(4);
  const [strokeColor, setStrokeColor] = React.useState('#000000');

  const handleUndo = () => {
    canvasRef.current?.undo();
    playSound('click', 0.3);
  };

  const handleClear = () => {
    canvasRef.current?.clearCanvas();
    playSound('error', 0.4);
  };

  const toggleEraser = () => {
    setIsErasing(!isErasing);
    playSound('select', 0.3);
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;

    try {
      const imageData = await canvasRef.current.exportImage('png');
      onDrawingComplete?.(imageData);
      playSound('success', 0.5);
    } catch (error) {
      console.error('Failed to export drawing:', error);
      playSound('error', 0.5);
    }
  };

  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Orange', value: '#F97316' }
  ];

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-zinc-50 rounded-lg border-2 border-zinc-200">
        {/* Drawing tools */}
        <div className="flex items-center gap-2">
          <Button
            variant={isErasing ? 'default' : 'outline'}
            size="sm"
            onClick={toggleEraser}
            className="flex items-center gap-2"
          >
            {isErasing ? <Eraser className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            {isErasing ? 'Eraser' : 'Pencil'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            className="flex items-center gap-2"
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-zinc-300" />

        {/* Color picker */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-600 font-medium">Color:</span>
          <div className="flex gap-2">
            {colors.map((color) => (
              <motion.button
                key={color.value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setStrokeColor(color.value);
                  setIsErasing(false);
                  playSound('click', 0.2);
                }}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  strokeColor === color.value && !isErasing
                    ? 'border-zinc-800 scale-110'
                    : 'border-zinc-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-zinc-300" />

        {/* Stroke width */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-600 font-medium">Size:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-24 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <span className="text-sm text-zinc-600 w-8">{strokeWidth}px</span>
        </div>
      </div>

      {/* Canvas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-lg overflow-hidden border-4 border-zinc-300 bg-white shadow-lg"
        style={{
          width,
          height
        }}
      >
        <ReactSketchCanvas
          ref={canvasRef}
          width={typeof width === 'number' ? `${width}px` : width}
          height={typeof height === 'number' ? `${height}px` : height}
          strokeWidth={strokeWidth}
          strokeColor={isErasing ? '#FFFFFF' : strokeColor}
          canvasColor="#FFFFFF"
          exportWithBackgroundImage={false}
          allowOnlyPointerType="all"
          style={{
            border: 'none',
            borderRadius: '0.5rem'
          }}
        />
      </motion.div>

      {/* Export button */}
      {onDrawingComplete && (
        <Button
          onClick={handleExport}
          className="w-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-medium py-6 text-lg"
        >
          Submit Drawing
        </Button>
      )}
    </div>
  );
}

/**
 * DrawingPrompt - Displays the word to draw with optional hint
 */
interface DrawingPromptProps {
  word: string;
  hint?: string;
  showHint?: boolean;
  onToggleHint?: () => void;
  className?: string;
}

export function DrawingPrompt({
  word,
  hint,
  showHint = false,
  onToggleHint,
  className = ''
}: DrawingPromptProps) {
  return (
    <div className={`text-center space-y-4 ${className}`}>
      <div>
        <p className="text-lg text-zinc-600 mb-2">Draw this word:</p>
        <h2 className="text-4xl md:text-5xl font-bold text-zinc-800 font-serif">
          {word}
        </h2>
      </div>

      {hint && (
        <div>
          <Button
            variant="outline"
            onClick={() => {
              onToggleHint?.();
              playSound('click', 0.3);
            }}
            className="text-amber-600 hover:text-amber-700"
          >
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </Button>

          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-amber-50 rounded-lg border-2 border-amber-200"
            >
              <p className="text-zinc-700">{hint}</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
