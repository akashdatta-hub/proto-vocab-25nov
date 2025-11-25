'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { NotebookLayout, NotebookHeader } from '@/components/notebook/NotebookLayout';
import { Button } from '@/components/ui/button';
import { ProgressBar, StepProgress } from '@/components/shared/ProgressBar';
import { AudioButton } from '@/components/shared/AudioButton';
import { playSound } from '@/lib/sound-effects';
import { ArrowLeft, BookOpen, Pencil, Sparkles } from 'lucide-react';

interface WordSet {
  id: string;
  name: string;
  scene_word: string;
}

interface Word {
  id: string;
  text: string;
  hint_text: string | null;
  order_index: number;
}

interface WordProgress {
  drawn: boolean;
  spelled: boolean;
}

export default function StudentJourneyPage() {
  const router = useRouter();
  const params = useParams();
  const setId = params.setId as string;

  const [wordSet, setWordSet] = React.useState<WordSet | null>(null);
  const [words, setWords] = React.useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const [progress, setProgress] = React.useState<Record<string, WordProgress>>({});
  const [loading, setLoading] = React.useState(true);
  const [studentId, setStudentId] = React.useState<string>('');

  React.useEffect(() => {
    loadWordSetData();
    loadStudentProgress();
  }, [setId]);

  const loadWordSetData = async () => {
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

    } catch (error) {
      console.error('Error loading word set:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentProgress = async () => {
    try {
      // Get first student (for prototype)
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .limit(1);

      if (students && students.length > 0) {
        const sid = students[0].id;
        setStudentId(sid);

        // Load word attempts for this student and word set
        const { data: attempts } = await supabase
          .from('word_attempts')
          .select('word_id, is_correct')
          .eq('student_id', sid)
          .eq('is_correct', true);

        if (attempts) {
          const progressMap: Record<string, WordProgress> = {};
          attempts.forEach(attempt => {
            if (!progressMap[attempt.word_id]) {
              progressMap[attempt.word_id] = { drawn: false, spelled: false };
            }
            // Assume first correct attempt is drawing, second is spelling
            // In real implementation, track this in the database
            progressMap[attempt.word_id].drawn = true;
            progressMap[attempt.word_id].spelled = true;
          });
          setProgress(progressMap);
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const currentWord = words[currentWordIndex];
  const currentProgress = currentWord ? progress[currentWord.id] : null;
  const wordsCompleted = Object.values(progress).filter(p => p.drawn && p.spelled).length;

  const handleBack = () => {
    playSound('click', 0.4);
    router.push('/');
  };

  const handleStartDrawing = () => {
    playSound('select', 0.5);
    router.push(`/student/${setId}/draw/${currentWord.id}`);
  };

  const handleStartSpelling = () => {
    playSound('select', 0.5);
    router.push(`/student/${setId}/spell/${currentWord.id}`);
  };

  const handleViewScenes = () => {
    playSound('sceneSelect', 0.5);
    router.push(`/student/${setId}/scenes`);
  };

  const handleNextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      playSound('pageTurn', 0.4);
    }
  };

  const handlePreviousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      playSound('pageTurn', 0.4);
    }
  };

  if (loading || !wordSet || !currentWord) {
    return (
      <NotebookLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4" />
            <p className="text-zinc-600">Loading...</p>
          </div>
        </div>
      </NotebookLayout>
    );
  }

  const allWordsComplete = wordsCompleted === words.length;

  return (
    <NotebookLayout>
      <div className="space-y-8">
        {/* Header with back button */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Button
              variant="outline"
              onClick={handleBack}
              className="mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Word Sets
            </Button>

            <NotebookHeader
              title={wordSet.name}
              subtitle={`Word ${currentWordIndex + 1} of ${words.length}`}
            />
          </div>
        </div>

        {/* Overall progress */}
        <ProgressBar
          current={wordsCompleted}
          total={words.length}
          label="Words completed"
          showFraction={true}
        />

        {/* Current word card */}
        <motion.div
          key={currentWord.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-3 border-amber-300 rounded-2xl"
        >
          {/* Word display */}
          <div className="text-center mb-6">
            <h2 className="text-5xl font-bold text-zinc-800 mb-4 capitalize">
              {currentWord.text}
            </h2>

            {/* Audio button */}
            <AudioButton
              text={currentWord.text}
              variant="default"
            />

            {currentWord.hint_text && (
              <p className="mt-4 text-lg text-zinc-600">
                {currentWord.hint_text}
              </p>
            )}
          </div>

          {/* Activities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {/* Drawing activity */}
            <div className="p-6 bg-white rounded-xl border-2 border-zinc-200">
              <div className="flex items-center gap-3 mb-4">
                <Pencil className="w-6 h-6 text-amber-600" />
                <h3 className="text-xl font-bold text-zinc-800">Draw It</h3>
                {currentProgress?.drawn && (
                  <span className="ml-auto text-green-600 font-bold">✓</span>
                )}
              </div>
              <p className="text-zinc-600 mb-4">
                Draw the word and let AI check your drawing!
              </p>
              <Button
                onClick={handleStartDrawing}
                className="w-full bg-amber-500 hover:bg-amber-600"
                disabled={currentProgress?.drawn}
              >
                {currentProgress?.drawn ? 'Completed' : 'Start Drawing'}
              </Button>
            </div>

            {/* Spelling activity */}
            <div className="p-6 bg-white rounded-xl border-2 border-zinc-200">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-zinc-800">Spell It</h3>
                {currentProgress?.spelled && (
                  <span className="ml-auto text-green-600 font-bold">✓</span>
                )}
              </div>
              <p className="text-zinc-600 mb-4">
                Arrange the letters to spell the word correctly!
              </p>
              <Button
                onClick={handleStartSpelling}
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={currentProgress?.spelled}
              >
                {currentProgress?.spelled ? 'Completed' : 'Start Spelling'}
              </Button>
            </div>
          </div>

          {/* Word navigation */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-amber-200">
            <Button
              variant="outline"
              onClick={handlePreviousWord}
              disabled={currentWordIndex === 0}
            >
              ← Previous Word
            </Button>

            <span className="text-sm text-zinc-600">
              Word {currentWordIndex + 1} of {words.length}
            </span>

            <Button
              variant="outline"
              onClick={handleNextWord}
              disabled={currentWordIndex === words.length - 1}
            >
              Next Word →
            </Button>
          </div>
        </motion.div>

        {/* Scenes button (available after completing all words) */}
        {allWordsComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-3 border-green-300 rounded-2xl text-center"
          >
            <Sparkles className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              🎉 All Words Complete!
            </h3>
            <p className="text-green-700 mb-6">
              You've learned all {words.length} words! Now explore the {wordSet.scene_word} scene!
            </p>
            <Button
              onClick={handleViewScenes}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
            >
              Explore the Scene →
            </Button>
          </motion.div>
        )}
      </div>
    </NotebookLayout>
  );
}
