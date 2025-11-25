'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { NotebookLayout, NotebookHeader } from '@/components/notebook/NotebookLayout';
import { CircularProgress } from '@/components/shared/ProgressBar';
import { AudioButton } from '@/components/shared/AudioButton';
import { Button } from '@/components/ui/button';
import { playSound } from '@/lib/sound-effects';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';

interface WordSet {
  id: string;
  name: string;
  scene_word: string;
}

interface Word {
  id: string;
  text: string;
  hint_text: string | null;
}

interface WordProgress {
  drawn: boolean;
  spelled: boolean;
}

export default function CollectionPage() {
  const router = useRouter();
  const params = useParams();
  const setId = params.setId as string;

  const [wordSet, setWordSet] = React.useState<WordSet | null>(null);
  const [words, setWords] = React.useState<Word[]>([]);
  const [progress, setProgress] = React.useState<Record<string, WordProgress>>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadCollectionData();
  }, [setId]);

  const loadCollectionData = async () => {
    try {
      // Load word set
      const { data: wordSetData, error: wordSetError } = await supabase
        .from('word_sets')
        .select('*')
        .eq('id', setId)
        .single();

      if (wordSetError) throw wordSetError;
      setWordSet(wordSetData);

      // Load words for this set
      const { data: wordsData, error: wordsError } = await supabase
        .from('words')
        .select('*')
        .eq('word_set_id', setId)
        .order('order_index');

      if (wordsError) throw wordsError;
      setWords(wordsData || []);

      // Load student progress
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .limit(1);

      if (students && students.length > 0) {
        const studentId = students[0].id;

        // Load word attempts
        const { data: attempts } = await supabase
          .from('word_attempts')
          .select('word_id, is_correct')
          .eq('student_id', studentId)
          .eq('is_correct', true);

        if (attempts) {
          const progressMap: Record<string, WordProgress> = {};
          attempts.forEach(attempt => {
            if (!progressMap[attempt.word_id]) {
              progressMap[attempt.word_id] = { drawn: false, spelled: false };
            }
            // Simplification: mark both as complete if any correct attempt exists
            progressMap[attempt.word_id].drawn = true;
            progressMap[attempt.word_id].spelled = true;
          });
          setProgress(progressMap);
        }
      }
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    playSound('click', 0.4);
    router.push(`/student/${setId}`);
  };

  if (loading || !wordSet) {
    return (
      <NotebookLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
        </div>
      </NotebookLayout>
    );
  }

  const wordsCompleted = Object.values(progress).filter(p => p.drawn && p.spelled).length;
  const completionPercentage = words.length > 0 ? (wordsCompleted / words.length) * 100 : 0;

  return (
    <NotebookLayout>
      <div className="space-y-8">
        <div>
          <Button
            variant="outline"
            onClick={handleBack}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Journey
          </Button>

          <NotebookHeader
            title="Word Collection"
            subtitle={wordSet.name}
          />
        </div>

        {/* Overall progress */}
        <div className="flex items-center justify-center">
          <div className="text-center">
            <CircularProgress
              current={wordsCompleted}
              total={words.length}
              size={120}
              strokeWidth={10}
              showLabel={true}
            />
            <p className="mt-4 text-lg font-medium text-zinc-700">
              {completionPercentage === 100 ? (
                <span className="text-green-600">🎉 All words learned!</span>
              ) : (
                `${Math.round(completionPercentage)}% Complete`
              )}
            </p>
          </div>
        </div>

        {/* Word cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {words.map((word, index) => {
            const wordProgress = progress[word.id];
            const isComplete = wordProgress?.drawn && wordProgress?.spelled;

            return (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 border-2 rounded-xl ${
                  isComplete
                    ? 'bg-green-50 border-green-400'
                    : 'bg-zinc-50 border-zinc-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-zinc-800 capitalize mb-1">
                      {word.text}
                    </h3>
                    {word.hint_text && (
                      <p className="text-sm text-zinc-600">{word.hint_text}</p>
                    )}
                  </div>

                  <div className="ml-4">
                    {isComplete ? (
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    ) : (
                      <Circle className="w-8 h-8 text-zinc-400" />
                    )}
                  </div>
                </div>

                {/* Audio button */}
                <div className="flex items-center gap-4">
                  <AudioButton
                    text={word.text}
                    variant="small"
                  />

                  {/* Progress indicators */}
                  <div className="flex items-center gap-3 text-sm">
                    <span className={wordProgress?.drawn ? 'text-green-600' : 'text-zinc-400'}>
                      {wordProgress?.drawn ? '✓' : '○'} Drawn
                    </span>
                    <span className={wordProgress?.spelled ? 'text-green-600' : 'text-zinc-400'}>
                      {wordProgress?.spelled ? '✓' : '○'} Spelled
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Completion message */}
        {completionPercentage === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-3 border-green-400 rounded-xl text-center"
          >
            <div className="text-6xl mb-4">🌟</div>
            <h3 className="text-3xl font-bold text-green-800 mb-2">
              Amazing Work!
            </h3>
            <p className="text-lg text-green-700 mb-6">
              You've mastered all {words.length} words in the {wordSet.name} set!
            </p>
            <Button
              onClick={() => router.push('/')}
              className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg"
            >
              Choose Another Word Set →
            </Button>
          </motion.div>
        )}
      </div>
    </NotebookLayout>
  );
}
