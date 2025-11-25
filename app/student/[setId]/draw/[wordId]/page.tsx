'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { NotebookLayout, NotebookHeader } from '@/components/notebook/NotebookLayout';
import { DrawingCanvas, DrawingPrompt } from '@/components/drawing/DrawingCanvas';
import { HintCard } from '@/components/shared/HintCard';
import { Button } from '@/components/ui/button';
import { playSound } from '@/lib/sound-effects';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface Word {
  id: string;
  text: string;
  hint_text: string | null;
  word_set_id: string;
}

export default function DrawingPage() {
  const router = useRouter();
  const params = useParams();
  const setId = params.setId as string;
  const wordId = params.wordId as string;

  const [word, setWord] = React.useState<Word | null>(null);
  const [showHint, setShowHint] = React.useState(false);
  const [usedHint, setUsedHint] = React.useState(false);
  const [recognizing, setRecognizing] = React.useState(false);
  const [result, setResult] = React.useState<{
    isCorrect: boolean;
    confidence: number;
    feedback: string;
  } | null>(null);
  const [studentId, setStudentId] = React.useState<string>('');

  React.useEffect(() => {
    loadWord();
    loadStudentId();
  }, [wordId]);

  const loadWord = async () => {
    try {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('id', wordId)
        .single();

      if (error) throw error;
      setWord(data);
    } catch (error) {
      console.error('Error loading word:', error);
    }
  };

  const loadStudentId = async () => {
    try {
      // Get student ID from session storage (created in journey page)
      const sid = sessionStorage.getItem('studentId');
      if (sid) {
        setStudentId(sid);
      }
    } catch (error) {
      console.error('Error loading student:', error);
    }
  };

  const handleDrawingSubmit = async (imageDataUrl: string) => {
    if (!word || !studentId) return;

    setRecognizing(true);
    setResult(null);

    try {
      // Call GPT-4 Vision API to recognize drawing
      const response = await fetch('/api/recognise-drawing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          targetWord: word.text
        })
      });

      if (!response.ok) {
        throw new Error('Recognition failed');
      }

      const data = await response.json();
      setResult(data);

      // Log attempt to database
      await supabase
        .from('word_attempts')
        .insert({
          student_id: studentId,
          word_id: word.id,
          is_correct: data.isCorrect,
          confidence: data.confidence,
          used_hint: usedHint,
          drawing_data: imageDataUrl
        });

      if (data.isCorrect) {
        playSound('success', 0.7);
      } else {
        playSound('error', 0.5);
      }

    } catch (error) {
      console.error('Error recognizing drawing:', error);
      playSound('error', 0.5);
      setResult({
        isCorrect: false,
        confidence: 0,
        feedback: 'Sorry, something went wrong. Please try again!'
      });
    } finally {
      setRecognizing(false);
    }
  };

  const handleContinue = () => {
    playSound('click', 0.4);
    router.push(`/student/${setId}`);
  };

  if (!word) {
    return (
      <NotebookLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
        </div>
      </NotebookLayout>
    );
  }

  return (
    <NotebookLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="outline"
            onClick={() => router.push(`/student/${setId}`)}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <NotebookHeader
            title="Drawing Activity"
            subtitle="Draw the word and let AI check it!"
          />
        </div>

        {/* Drawing prompt */}
        <DrawingPrompt
          word={word.text}
          hint={word.hint_text || undefined}
          showHint={showHint}
          onToggleHint={() => {
            setShowHint(!showHint);
            if (!showHint && !usedHint) {
              setUsedHint(true);
            }
          }}
        />

        {/* Drawing canvas */}
        <DrawingCanvas
          onDrawingComplete={handleDrawingSubmit}
          width="100%"
          height={450}
        />

        {/* Recognition result */}
        <AnimatePresence>
          {recognizing && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center p-6 bg-blue-50 border-2 border-blue-200 rounded-lg"
            >
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-blue-800 font-medium">
                Analyzing your drawing with AI...
              </p>
            </motion.div>
          )}

          {result && !recognizing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-8 border-3 rounded-xl ${
                result.isCorrect
                  ? 'bg-green-50 border-green-400'
                  : 'bg-amber-50 border-amber-400'
              }`}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {result.isCorrect ? '🎉' : '💪'}
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${
                  result.isCorrect ? 'text-green-800' : 'text-amber-800'
                }`}>
                  {result.isCorrect ? 'Excellent Drawing!' : 'Keep Trying!'}
                </h3>
                <p className={`text-lg mb-4 ${
                  result.isCorrect ? 'text-green-700' : 'text-amber-700'
                }`}>
                  {result.feedback}
                </p>
                <div className="text-sm text-zinc-600 mb-6">
                  Confidence: {Math.round(result.confidence * 100)}%
                </div>

                {result.isCorrect ? (
                  <Button
                    onClick={handleContinue}
                    className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg"
                  >
                    Continue to Next Activity →
                  </Button>
                ) : (
                  <p className="text-amber-700">
                    Try drawing again with more details!
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NotebookLayout>
  );
}
