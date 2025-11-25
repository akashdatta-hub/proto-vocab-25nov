'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { NotebookLayout, NotebookHeader } from '@/components/notebook/NotebookLayout';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/shared/ProgressBar';
import { playSound } from '@/lib/sound-effects';
import { VolumeControl } from '@/components/shared/AudioButton';

interface WordSet {
  id: string;
  name: string;
  scene_word: string;
  order_index: number;
}

interface WordAttempt {
  word_id: string;
  is_correct: boolean;
}

export default function Home() {
  const router = useRouter();
  const [wordSets, setWordSets] = React.useState<WordSet[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [studentId, setStudentId] = React.useState<string>('');
  const [progress, setProgress] = React.useState<Record<string, number>>({});

  // Load word sets and progress on mount
  React.useEffect(() => {
    loadWordSets();
    loadStudentProgress();
  }, []);

  const loadWordSets = async () => {
    try {
      const { data, error } = await supabase
        .from('word_sets')
        .select('*')
        .order('order_index');

      if (error) throw error;

      setWordSets(data || []);
    } catch (error) {
      console.error('Error loading word sets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentProgress = async () => {
    // For prototype, use first student or create a session student
    try {
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .limit(1);

      if (students && students.length > 0) {
        const studentId = students[0].id;
        setStudentId(studentId);

        // Load word attempts for this student
        const { data: attempts } = await supabase
          .from('word_attempts')
          .select('word_id, is_correct')
          .eq('student_id', studentId)
          .eq('is_correct', true);

        // Count correct attempts per word set
        if (attempts) {
          const { data: words } = await supabase
            .from('words')
            .select('id, word_set_id');

          if (words) {
            const correctWordIds = new Set((attempts as WordAttempt[]).map(a => a.word_id));
            const progressBySet: Record<string, number> = {};

            words.forEach(word => {
              if (!progressBySet[word.word_set_id]) {
                progressBySet[word.word_set_id] = 0;
              }
              if (correctWordIds.has(word.id)) {
                progressBySet[word.word_set_id]++;
              }
            });

            setProgress(progressBySet);
          }
        }
      }
    } catch (error) {
      console.error('Error loading student progress:', error);
    }
  };

  const handleSelectWordSet = (wordSetId: string) => {
    playSound('select', 0.5);
    router.push(`/student/${wordSetId}`);
  };

  if (loading) {
    return (
      <NotebookLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4" />
            <p className="text-zinc-600">Loading word sets...</p>
          </div>
        </div>
      </NotebookLayout>
    );
  }

  return (
    <NotebookLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <NotebookHeader
            title="Draw & Learn Notebook"
            subtitle="Choose a word set to start learning!"
          />
          <VolumeControl />
        </div>

        {/* Word sets grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wordSets.map((wordSet, index) => {
            const wordsCompleted = progress[wordSet.id] || 0;
            const totalWords = 4; // Each set has 4 words

            return (
              <motion.div
                key={wordSet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  onClick={() => handleSelectWordSet(wordSet.id)}
                  className="w-full h-auto p-0 overflow-hidden border-2 border-zinc-300 hover:border-amber-400 transition-all duration-300 group"
                >
                  <div className="w-full p-6 text-left">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-zinc-800 group-hover:text-amber-600 transition-colors mb-1">
                          {wordSet.name}
                        </h2>
                        <p className="text-sm text-zinc-600 capitalize">
                          Scene: {wordSet.scene_word}
                        </p>
                      </div>

                      {/* Progress indicator */}
                      <CircularProgress
                        current={wordsCompleted}
                        total={totalWords}
                        size={60}
                        strokeWidth={6}
                        showLabel={true}
                      />
                    </div>

                    {/* Progress text */}
                    <div className="flex items-center gap-2 text-sm">
                      {wordsCompleted === totalWords ? (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <span>✓</span>
                          <span>Complete!</span>
                        </span>
                      ) : wordsCompleted > 0 ? (
                        <span className="text-amber-600 font-medium">
                          {wordsCompleted} of {totalWords} words learned
                        </span>
                      ) : (
                        <span className="text-zinc-500">
                          Start learning {totalWords} new words
                        </span>
                      )}
                    </div>

                    {/* Decorative emoji */}
                    <div className="mt-4 text-4xl opacity-20 group-hover:opacity-100 transition-opacity">
                      {wordSet.scene_word === 'garden' && '🌳'}
                      {wordSet.scene_word === 'kitchen' && '🍳'}
                      {wordSet.scene_word === 'beach' && '🏖️'}
                      {wordSet.scene_word === 'birthday' && '🎂'}
                    </div>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg"
        >
          <h3 className="text-lg font-bold text-blue-800 mb-2">
            📚 How to use this notebook:
          </h3>
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>Choose a word set from above</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>Draw each word to learn it</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>Spell the word correctly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <span>Find the words in the scene</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">5.</span>
              <span>View your collection and progress!</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </NotebookLayout>
  );
}
