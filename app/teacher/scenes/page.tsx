'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { NotebookLayout, NotebookHeader } from '@/components/notebook/NotebookLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { playSound } from '@/lib/sound-effects';
import { ArrowLeft, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface WordSet {
  id: string;
  name: string;
  scene_word: string;
}

interface Scene {
  id: string;
  word_set_id: string;
  image_url: string;
  scene_index: number;
}

export default function SceneManagementPage() {
  const router = useRouter();
  const [wordSets, setWordSets] = React.useState<WordSet[]>([]);
  const [scenes, setScenes] = React.useState<Scene[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadSceneData();
  }, []);

  const loadSceneData = async () => {
    try {
      // Load word sets
      const { data: wordSetsData } = await supabase
        .from('word_sets')
        .select('*')
        .order('order_index');

      setWordSets(wordSetsData || []);

      // Load scenes
      const { data: scenesData } = await supabase
        .from('scenes')
        .select('*');

      setScenes(scenesData || []);

    } catch (error) {
      console.error('Error loading scene data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScenesForWordSet = (wordSetId: string) => {
    return scenes.filter(s => s.word_set_id === wordSetId);
  };

  const getSceneProgress = (wordSetId: string) => {
    const wordSetScenes = getScenesForWordSet(wordSetId);
    const generated = wordSetScenes.filter(s => s.image_url && s.image_url !== '').length;
    return { generated, total: 4 };
  };

  const handleGenerateScene = async (wordSetId: string, sceneIndex: number) => {
    playSound('click', 0.4);
    setGenerating(`${wordSetId}-${sceneIndex}`);

    try {
      // Get words for this word set
      const { data: words } = await supabase
        .from('words')
        .select('text')
        .eq('word_set_id', wordSetId)
        .order('order_index');

      if (!words || words.length === 0) {
        throw new Error('No words found for this word set');
      }

      const wordSet = wordSets.find(ws => ws.id === wordSetId);
      if (!wordSet) {
        throw new Error('Word set not found');
      }

      // Call scene generation API
      const response = await fetch('/api/generate-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordSetId,
          sceneWord: wordSet.scene_word,
          words: words.map(w => w.text),
          sceneIndex
        })
      });

      if (!response.ok) {
        throw new Error('Scene generation failed');
      }

      const result = await response.json();
      playSound('success', 0.6);

      // Reload scene data
      await loadSceneData();

    } catch (error) {
      console.error('Error generating scene:', error);
      playSound('error', 0.5);
      alert(`Failed to generate scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
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
            onClick={() => router.push('/teacher')}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          <NotebookHeader
            title="Scene Generation"
            subtitle="Generate AI scenes using DALL-E 3"
          />
        </div>

        {/* Info banner */}
        <Card className="p-6 bg-blue-50 border-2 border-blue-200">
          <div className="flex items-start gap-3">
            <ImageIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-1">About Scene Generation</h3>
              <p className="text-sm text-blue-700">
                Each word set can have up to 4 scene variations. Scenes are generated using DALL-E 3 with child-friendly
                line drawing style. Cost: ~$0.04 per scene (standard quality).
              </p>
            </div>
          </div>
        </Card>

        {/* Word sets with scene generation */}
        <div className="space-y-4">
          {wordSets.map((wordSet, index) => {
            const progress = getSceneProgress(wordSet.id);
            const wordSetScenes = getScenesForWordSet(wordSet.id);

            return (
              <motion.div
                key={wordSet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 border-2 border-zinc-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-800 mb-1">{wordSet.name}</h3>
                      <p className="text-sm text-zinc-600 capitalize">Scene: {wordSet.scene_word}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full font-medium ${
                        progress.generated === progress.total
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {progress.generated} / {progress.total} Generated
                      </span>
                    </div>
                  </div>

                  {/* Scene variations */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[0, 1, 2, 3].map(sceneIndex => {
                      const scene = wordSetScenes.find(s => s.scene_index === sceneIndex);
                      const hasImage = scene && scene.image_url && scene.image_url !== '';
                      const isGenerating = generating === `${wordSet.id}-${sceneIndex}`;

                      return (
                        <div
                          key={sceneIndex}
                          className="relative aspect-video bg-zinc-100 rounded-lg border-2 border-zinc-300 overflow-hidden"
                        >
                          {hasImage ? (
                            <>
                              <img
                                src={scene.image_url}
                                alt={`Scene ${sceneIndex + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            </>
                          ) : isGenerating ? (
                            <div className="flex flex-col items-center justify-center h-full">
                              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
                              <span className="text-xs text-zinc-600">Generating...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full p-2">
                              <AlertCircle className="w-6 h-6 text-zinc-400 mb-2" />
                              <Button
                                size="sm"
                                onClick={() => handleGenerateScene(wordSet.id, sceneIndex)}
                                disabled={!!generating}
                                className="text-xs"
                              >
                                Generate
                              </Button>
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                            Scene {sceneIndex + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Generate all button */}
        <Card className="p-6 bg-amber-50 border-2 border-amber-200">
          <h3 className="font-bold text-amber-900 mb-2">⚠️ Batch Generation</h3>
          <p className="text-sm text-amber-700 mb-4">
            To generate all scenes at once, use the command-line script. This will generate all 16 scenes (~10-15 minutes, $0.64 cost).
          </p>
          <code className="block bg-white p-3 rounded border border-amber-200 text-sm text-zinc-800">
            npx tsx scripts/generate-all-scenes.ts
          </code>
        </Card>
      </div>
    </NotebookLayout>
  );
}
