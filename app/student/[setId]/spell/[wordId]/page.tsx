'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { NotebookLayout, NotebookHeader } from '@/components/notebook/NotebookLayout';
import { LetterBank, LetterBankInstructions } from '@/components/drawing/LetterBank';
import { AudioButton } from '@/components/shared/AudioButton';
import { Button } from '@/components/ui/button';
import { playSound } from '@/lib/sound-effects';
import { ArrowLeft } from 'lucide-react';

interface Word {
  id: string;
  text: string;
  hint_text: string | null;
  word_set_id: string;
}

export default function SpellingPage() {
  const router = useRouter();
  const params = useParams();
  const setId = params.setId as string;
  const wordId = params.wordId as string;

  const [word, setWord] = React.useState<Word | null>(null);
  const [completed, setCompleted] = React.useState(false);
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
      const { data } = await supabase
        .from('students')
        .select('id')
        .limit(1);

      if (data && data.length > 0) {
        setStudentId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading student:', error);
    }
  };

  const handleComplete = async (isCorrect: boolean) => {
    if (!word || !studentId || !isCorrect) return;

    setCompleted(true);

    try {
      // Log successful spelling attempt to database
      await supabase
        .from('word_attempts')
        .insert({
          student_id: studentId,
          word_id: word.id,
          is_correct: true,
          confidence: 1.0,
          used_hint: false
        });

      playSound('wordComplete', 0.7);
    } catch (error) {
      console.error('Error logging spelling attempt:', error);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
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
            title="Spelling Activity"
            subtitle="Arrange the letters to spell the word!"
          />
        </div>

        {/* Word display with audio */}
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg">
          <p className="text-sm text-blue-600 mb-2">Listen and spell this word:</p>
          <AudioButton
            text={word.text}
            variant="default"
          />
          {word.hint_text && (
            <p className="mt-4 text-sm text-blue-700 italic">
              Hint: {word.hint_text}
            </p>
          )}
        </div>

        {/* Instructions */}
        <LetterBankInstructions />

        {/* Letter bank */}
        <LetterBank
          targetWord={word.text}
          onComplete={handleComplete}
        />

        {/* Success message */}
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-green-50 border-3 border-green-400 rounded-xl text-center"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              Perfect Spelling!
            </h3>
            <p className="text-lg text-green-700 mb-6">
              You spelled "{word.text}" correctly!
            </p>
            <Button
              onClick={handleContinue}
              className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg"
            >
              Continue to Journey →
            </Button>
          </motion.div>
        )}
      </div>
    </NotebookLayout>
  );
}
