'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { NotebookLayout, NotebookHeader } from '@/components/notebook/NotebookLayout';
import { SceneCard, SceneGrid } from '@/components/scene/SceneCard';
import { SceneSilhouette, SceneObjectsList } from '@/components/scene/SceneSilhouette';
import { Button } from '@/components/ui/button';
import { playSound } from '@/lib/sound-effects';
import { ArrowLeft } from 'lucide-react';

interface WordSet {
  id: string;
  name: string;
  scene_word: string;
}

interface Scene {
  id: string;
  image_url: string;
  scene_index: number;
}

interface SceneObject {
  id: string;
  wordId: string;
  objectName: string;
  position: { x: number; y: number };
  found: boolean;
}

export default function ScenesPage() {
  const router = useRouter();
  const params = useParams();
  const setId = params.setId as string;

  const [wordSet, setWordSet] = React.useState<WordSet | null>(null);
  const [scenes, setScenes] = React.useState<Scene[]>([]);
  const [selectedScene, setSelectedScene] = React.useState<Scene | null>(null);
  const [sceneObjects, setSceneObjects] = React.useState<SceneObject[]>([]);
  const [currentObjectIndex, setCurrentObjectIndex] = React.useState(0);
  const [studentId, setStudentId] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadSceneData();
    loadStudentId();
  }, [setId]);

  const loadSceneData = async () => {
    try {
      // Load word set
      const { data: wordSetData, error: wordSetError } = await supabase
        .from('word_sets')
        .select('*')
        .eq('id', setId)
        .single();

      if (wordSetError) throw wordSetError;
      setWordSet(wordSetData);

      // Load scenes for this word set
      const { data: scenesData, error: scenesError } = await supabase
        .from('scenes')
        .select('*')
        .eq('word_set_id', setId)
        .neq('image_url', '')
        .order('scene_index');

      if (scenesError) throw scenesError;
      setScenes(scenesData || []);

      // Load words for this set
      const { data: wordsData, error: wordsError } = await supabase
        .from('words')
        .select('*')
        .eq('word_set_id', setId)
        .order('order_index');

      if (wordsError) throw wordsError;

      // Create mock scene objects (in real app, these would come from scene_objects table)
      if (wordsData && scenesData && scenesData.length > 0) {
        const mockObjects: SceneObject[] = wordsData.map((word, index) => ({
          id: `obj-${word.id}`,
          wordId: word.id,
          objectName: word.text,
          position: {
            x: 20 + (index * 25), // Mock positions
            y: 30 + (index % 2) * 20
          },
          found: false
        }));
        setSceneObjects(mockObjects);
      }

    } catch (error) {
      console.error('Error loading scene data:', error);
    } finally {
      setLoading(false);
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

  const handleSceneSelect = async (scene: Scene) => {
    setSelectedScene(scene);
    playSound('sceneSelect', 0.5);

    // Load scene objects with actual positions from database
    await loadSceneObjects(scene.id);
  };

  const loadSceneObjects = async (sceneId: string) => {
    try {
      // Load scene_objects for this specific scene
      const { data: sceneObjectsData, error } = await supabase
        .from('scene_objects')
        .select('*')
        .eq('scene_id', sceneId);

      if (error) {
        console.error('Error loading scene objects:', error);
        return;
      }

      if (sceneObjectsData && sceneObjectsData.length > 0) {
        // Map database objects to our SceneObject interface
        const objects: SceneObject[] = sceneObjectsData.map((obj: any) => ({
          id: obj.id,
          wordId: obj.word_id,
          objectName: obj.object_name,
          position: obj.position_data || { x: 50, y: 50 }, // Use stored position or default
          found: false
        }));
        setSceneObjects(objects);
        setCurrentObjectIndex(0); // Reset to first object
      }
    } catch (error) {
      console.error('Error loading scene objects:', error);
    }
  };

  const handleObjectClick = async (objectId: string) => {
    const objectIndex = sceneObjects.findIndex(obj => obj.id === objectId);
    if (objectIndex === -1 || objectIndex !== currentObjectIndex) return;

    // Mark object as found
    const updatedObjects = [...sceneObjects];
    updatedObjects[objectIndex].found = true;
    setSceneObjects(updatedObjects);

    // Log scene attempt to database
    if (studentId && selectedScene) {
      try {
        await supabase
          .from('scene_attempts')
          .insert({
            student_id: studentId,
            scene_id: selectedScene.id,
            object_name: updatedObjects[objectIndex].objectName,
            is_correct: true,
            attempts_count: 1
          });
      } catch (error) {
        console.error('Error logging scene attempt:', error);
      }
    }
  };

  const handleNextObject = () => {
    if (currentObjectIndex < sceneObjects.length - 1) {
      setCurrentObjectIndex(currentObjectIndex + 1);
    }
  };

  const handleBackToScenes = () => {
    setSelectedScene(null);
    setCurrentObjectIndex(0);
    // Reset found status
    setSceneObjects(sceneObjects.map(obj => ({ ...obj, found: false })));
    playSound('click', 0.4);
  };

  const handleBackToJourney = () => {
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

  // Scene selection view
  if (!selectedScene) {
    return (
      <NotebookLayout>
        <div className="space-y-6">
          <div>
            <Button
              variant="outline"
              onClick={handleBackToJourney}
              className="mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Journey
            </Button>

            <NotebookHeader
              title="Explore the Scenes"
              subtitle={`Find objects in the ${wordSet.scene_word}`}
            />
          </div>

          {scenes.length === 0 ? (
            <div className="p-8 bg-amber-50 border-2 border-amber-300 rounded-lg text-center">
              <p className="text-amber-800 text-lg mb-2">
                🎨 Scenes are being generated!
              </p>
              <p className="text-amber-700">
                Scene images haven't been created yet. Please ask your teacher to generate them.
              </p>
            </div>
          ) : (
            <>
              <p className="text-lg text-zinc-700">
                Choose a scene variation to explore:
              </p>

              <SceneGrid>
                {scenes.map((scene) => (
                  <SceneCard
                    key={scene.id}
                    imageUrl={scene.image_url}
                    sceneWord={wordSet.scene_word}
                    objectsFound={0}
                    totalObjects={sceneObjects.length}
                    onClick={() => handleSceneSelect(scene)}
                  />
                ))}
              </SceneGrid>
            </>
          )}
        </div>
      </NotebookLayout>
    );
  }

  // Scene exploration view
  const allObjectsFound = sceneObjects.every(obj => obj.found);

  return (
    <NotebookLayout>
      <div className="space-y-6">
        <div>
          <Button
            variant="outline"
            onClick={handleBackToScenes}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Scene Selection
          </Button>

          <NotebookHeader
            title={`Scene ${selectedScene.scene_index + 1}`}
            subtitle="Click on the objects to find them!"
          />
        </div>

        {/* Objects list */}
        <SceneObjectsList
          objects={sceneObjects}
          currentObjectIndex={currentObjectIndex}
        />

        {/* Interactive scene */}
        <SceneSilhouette
          imageUrl={selectedScene.image_url}
          sceneWord={wordSet.scene_word}
          objects={sceneObjects}
          currentObjectIndex={currentObjectIndex}
          onObjectClick={handleObjectClick}
          onNextObject={handleNextObject}
        />

        {/* Completion actions */}
        {allObjectsFound && (
          <div className="flex gap-4">
            <Button
              onClick={handleBackToScenes}
              variant="outline"
              className="flex-1"
            >
              Try Another Scene
            </Button>
            <Button
              onClick={handleBackToJourney}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Back to Journey
            </Button>
          </div>
        )}
      </div>
    </NotebookLayout>
  );
}
