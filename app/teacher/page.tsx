'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { NotebookLayout, NotebookHeader } from '@/components/notebook/NotebookLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { playSound } from '@/lib/sound-effects';
import { Users, BookOpen, Target, TrendingUp, Home } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  created_at: string;
}

interface WordSet {
  id: string;
  name: string;
}

interface WordAttempt {
  student_id: string;
  word_id: string;
  is_correct: boolean;
}

interface StudentProgress {
  studentId: string;
  studentName: string;
  totalAttempts: number;
  correctAttempts: number;
  wordsLearned: number;
  accuracy: number;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [students, setStudents] = React.useState<Student[]>([]);
  const [wordSets, setWordSets] = React.useState<WordSet[]>([]);
  const [attempts, setAttempts] = React.useState<WordAttempt[]>([]);
  const [studentProgress, setStudentProgress] = React.useState<StudentProgress[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load students
      const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .order('name');

      setStudents(studentsData || []);

      // Load word sets
      const { data: wordSetsData } = await supabase
        .from('word_sets')
        .select('*')
        .order('order_index');

      setWordSets(wordSetsData || []);

      // Load all word attempts
      const { data: attemptsData } = await supabase
        .from('word_attempts')
        .select('*');

      setAttempts(attemptsData || []);

      // Calculate student progress
      if (studentsData && attemptsData) {
        const progressMap = new Map<string, StudentProgress>();

        studentsData.forEach(student => {
          const studentAttempts = attemptsData.filter(a => a.student_id === student.id);
          const correctAttempts = studentAttempts.filter(a => a.is_correct);
          const uniqueWordsLearned = new Set(correctAttempts.map(a => a.word_id)).size;

          progressMap.set(student.id, {
            studentId: student.id,
            studentName: student.name,
            totalAttempts: studentAttempts.length,
            correctAttempts: correctAttempts.length,
            wordsLearned: uniqueWordsLearned,
            accuracy: studentAttempts.length > 0
              ? (correctAttempts.length / studentAttempts.length) * 100
              : 0
          });
        });

        setStudentProgress(Array.from(progressMap.values()));
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = (studentId: string) => {
    playSound('teacherNav', 0.4);
    router.push(`/teacher/student/${studentId}`);
  };

  const totalStudents = students.length;
  const totalWordSets = wordSets.length;
  const totalAttempts = attempts.length;
  const averageAccuracy = studentProgress.length > 0
    ? studentProgress.reduce((sum, p) => sum + p.accuracy, 0) / studentProgress.length
    : 0;

  if (loading) {
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <NotebookHeader
            title="Teacher Dashboard"
            subtitle="Monitor student progress and class analytics"
          />
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Student View
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-sm font-medium text-blue-900">Total Students</h3>
            </div>
            <p className="text-3xl font-bold text-blue-700">{totalStudents}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-green-600" />
              <h3 className="text-sm font-medium text-green-900">Word Sets</h3>
            </div>
            <p className="text-3xl font-bold text-green-700">{totalWordSets}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-6 h-6 text-amber-600" />
              <h3 className="text-sm font-medium text-amber-900">Total Attempts</h3>
            </div>
            <p className="text-3xl font-bold text-amber-700">{totalAttempts}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <h3 className="text-sm font-medium text-purple-900">Avg Accuracy</h3>
            </div>
            <p className="text-3xl font-bold text-purple-700">
              {Math.round(averageAccuracy)}%
            </p>
          </Card>
        </div>

        {/* Student progress table */}
        <div>
          <h2 className="text-2xl font-bold text-zinc-800 mb-4">Student Progress</h2>

          <div className="bg-white border-2 border-zinc-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b-2 border-zinc-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-zinc-700">Student Name</th>
                  <th className="text-center p-4 font-semibold text-zinc-700">Words Learned</th>
                  <th className="text-center p-4 font-semibold text-zinc-700">Total Attempts</th>
                  <th className="text-center p-4 font-semibold text-zinc-700">Accuracy</th>
                  <th className="text-right p-4 font-semibold text-zinc-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentProgress.map((progress, index) => (
                  <motion.tr
                    key={progress.studentId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-zinc-200 hover:bg-zinc-50 transition-colors"
                  >
                    <td className="p-4 font-medium text-zinc-800">{progress.studentName}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                        {progress.wordsLearned} / {totalWordSets * 4}
                      </span>
                    </td>
                    <td className="p-4 text-center text-zinc-600">{progress.totalAttempts}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full font-medium ${
                        progress.accuracy >= 80
                          ? 'bg-green-100 text-green-700'
                          : progress.accuracy >= 60
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {Math.round(progress.accuracy)}%
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewStudent(progress.studentId)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        View Details →
                      </Button>
                    </td>
                  </motion.tr>
                ))}

                {studentProgress.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500">
                      No student progress data yet. Students will appear here after they start learning.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => playSound('click', 0.3)}>
            <h3 className="text-lg font-bold text-zinc-800 mb-2">📊 Class Analytics</h3>
            <p className="text-sm text-zinc-600 mb-4">
              View detailed analytics and insights about your class performance
            </p>
            <Button variant="outline" className="w-full">
              Coming Soon
            </Button>
          </Card>

          <Card className="p-6 border-2 border-green-200 hover:border-green-400 transition-colors cursor-pointer"
                onClick={() => playSound('click', 0.3)}>
            <h3 className="text-lg font-bold text-zinc-800 mb-2">🎨 Generate Scenes</h3>
            <p className="text-sm text-zinc-600 mb-4">
              Generate scene images for word sets using DALL-E 3
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/teacher/scenes')}
            >
              Manage Scenes
            </Button>
          </Card>
        </div>
      </div>
    </NotebookLayout>
  );
}
