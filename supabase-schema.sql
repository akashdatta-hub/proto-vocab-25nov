-- Draw & Learn Notebook - Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zjeeylvjwvxfahvhiulc/sql/new

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- WORD SETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS word_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  scene_word TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word_set_id UUID REFERENCES word_sets(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  definition TEXT,
  hint_text TEXT,
  hint_image_url TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SCENES TABLE (4 variations per word set)
-- ============================================
CREATE TABLE IF NOT EXISTS scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word_set_id UUID REFERENCES word_sets(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  scene_index INTEGER NOT NULL CHECK (scene_index >= 0 AND scene_index <= 3),
  style_preset TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SCENE OBJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scene_objects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,
  object_name TEXT NOT NULL,
  position_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STUDENTS TABLE (no auth, simple profiles)
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WORD ATTEMPTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS word_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  confidence DECIMAL(3,2),
  used_hint BOOLEAN DEFAULT FALSE,
  drawing_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SCENE ATTEMPTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scene_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  object_name TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  attempts_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_words_set_id ON words(word_set_id);
CREATE INDEX IF NOT EXISTS idx_scenes_set_id ON scenes(word_set_id);
CREATE INDEX IF NOT EXISTS idx_scene_objects_scene_id ON scene_objects(scene_id);
CREATE INDEX IF NOT EXISTS idx_word_attempts_student ON word_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_word_attempts_word ON word_attempts(word_id);
CREATE INDEX IF NOT EXISTS idx_scene_attempts_student ON scene_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_scene_attempts_scene ON scene_attempts(scene_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE word_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_attempts ENABLE ROW LEVEL SECURITY;

-- Public read access for word sets, words, scenes, and scene objects
CREATE POLICY "Public read access for word_sets" ON word_sets FOR SELECT USING (true);
CREATE POLICY "Public read access for words" ON words FOR SELECT USING (true);
CREATE POLICY "Public read access for scenes" ON scenes FOR SELECT USING (true);
CREATE POLICY "Public read access for scene_objects" ON scene_objects FOR SELECT USING (true);

-- Public read/write for students (no auth in prototype)
CREATE POLICY "Public access for students" ON students FOR ALL USING (true);

-- Public write access for attempts (students can log their attempts)
CREATE POLICY "Public write access for word_attempts" ON word_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read access for word_attempts" ON word_attempts FOR SELECT USING (true);
CREATE POLICY "Public write access for scene_attempts" ON scene_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read access for scene_attempts" ON scene_attempts FOR SELECT USING (true);

-- ============================================
-- SEED DEFAULT STUDENTS
-- ============================================
INSERT INTO students (name) VALUES
  ('Student 1'),
  ('Student 2'),
  ('Student 3')
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify schema was created correctly:

-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check students were inserted
SELECT * FROM students;

-- ============================================
-- NOTES
-- ============================================
-- After running this schema:
-- 1. Create storage buckets via Supabase Storage UI:
--    - scene-images (public)
--    - hint-images (public)
--    - student-drawings (public)
--
-- 2. Run the /api/supabase-init endpoint to:
--    - Insert word sets from TSV
--    - Generate and upload scene images
--    - Link scene objects to words
