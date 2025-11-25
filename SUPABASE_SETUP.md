# Supabase Setup Guide

Complete guide for setting up Supabase database, storage, and policies for the Draw & Learn Notebook prototype.

**Project:** https://supabase.com/dashboard/project/zjeeylvjwvxfahvhiulc

---

## ✅ Phase 2 Checklist

- [x] 1. Run database schema SQL ✅
- [ ] 2. Create storage buckets (manual)
- [ ] 3. Set bucket policies (manual)
- [x] 4. Initialize database with word sets ✅
- [x] 5. Verify setup ✅
- [ ] 6. Generate scene images (Phase 4)

---

## 🗄️ Step 1: Create Database Schema

### Via SQL Editor (Recommended)

1. Go to [SQL Editor](https://supabase.com/dashboard/project/zjeeylvjwvxfahvhiulc/sql/new)
2. Copy contents of `supabase-schema.sql`
3. Click "Run" to execute
4. Verify tables were created (see verification queries at bottom of SQL file)

### What This Creates:
- **8 tables:** word_sets, words, scenes, scene_objects, students, word_attempts, scene_attempts
- **Indexes:** For optimized queries
- **RLS Policies:** Public read access for content, write access for attempts
- **3 default students:** Student 1, Student 2, Student 3

---

## 📦 Step 2: Create Storage Buckets

### Via Supabase Storage UI

1. Go to [Storage](https://supabase.com/dashboard/project/zjeeylvjwvxfahvhiulc/storage/buckets)
2. Click "New bucket"
3. Create the following buckets:

#### Bucket 1: scene-images
- **Name:** `scene-images`
- **Public:** ✅ Yes
- **File size limit:** 5 MB
- **Allowed MIME types:** `image/png`, `image/jpeg`, `image/webp`
- **Purpose:** Store AI-generated scene images (DALL-E output)

#### Bucket 2: hint-images
- **Name:** `hint-images`
- **Public:** ✅ Yes
- **File size limit:** 2 MB
- **Allowed MIME types:** `image/png`, `image/jpeg`, `image/webp`
- **Purpose:** Store hint images for vocabulary words

#### Bucket 3: student-drawings
- **Name:** `student-drawings`
- **Public:** ✅ Yes
- **File size limit:** 1 MB
- **Allowed MIME types:** `image/png`
- **Purpose:** Store student drawing submissions

---

## 🔐 Step 3: Set Storage Policies

### Via SQL Editor

Run this SQL to allow public access to storage buckets:

```sql
-- Allow public read access to all buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('scene-images', 'scene-images', true),
  ('hint-images', 'hint-images', true),
  ('student-drawings', 'student-drawings', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Allow public upload to student-drawings
CREATE POLICY "Public upload to student-drawings"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'student-drawings');

-- Allow public read from all buckets
CREATE POLICY "Public read from scene-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'scene-images');

CREATE POLICY "Public read from hint-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'hint-images');

CREATE POLICY "Public read from student-drawings"
ON storage.objects
FOR SELECT
USING (bucket_id = 'student-drawings');
```

### Alternative: Via Storage UI

For each bucket:
1. Go to bucket settings
2. Click "Policies"
3. Create policy:
   - **Policy name:** Public read access
   - **Policy definition:** SELECT
   - **Target roles:** public
   - **USING expression:** `true`

---

## 🎯 Step 4: Initialize Database

### Option A: Via API Route (Recommended)

```bash
# Start dev server
npm run dev

# Initialize database
curl -X POST http://localhost:3000/api/supabase-init

# Check status
curl http://localhost:3000/api/supabase-init
```

Expected response:
```json
{
  "success": true,
  "message": "Database initialized successfully",
  "summary": {
    "word_sets": 4,
    "words": 16,
    "scenes": 16,
    "students": 3
  }
}
```

### Option B: Manual SQL Insert

If API route doesn't work, manually insert word sets:

```sql
-- Insert Garden set
INSERT INTO word_sets (name, scene_word, order_index)
VALUES ('The Garden', 'garden', 0);

-- Get the ID and insert words
INSERT INTO words (word_set_id, text, hint_text, order_index)
VALUES
  ('[garden-id]', 'watering can', 'A container used to water plants', 0),
  ('[garden-id]', 'tree', 'A tall plant with trunk and branches', 1),
  ('[garden-id]', 'bee', 'An insect that makes honey', 2),
  ('[garden-id]', 'grass', 'Green plants covering the ground', 3);

-- Repeat for Kitchen, Beach, Birthday...
```

---

## ✅ Step 5: Verify Setup

### Database Verification

Run these queries in SQL Editor:

```sql
-- Check word sets
SELECT * FROM word_sets ORDER BY order_index;

-- Check words count
SELECT ws.name, COUNT(w.id) as word_count
FROM word_sets ws
LEFT JOIN words w ON w.word_set_id = ws.id
GROUP BY ws.id, ws.name
ORDER BY ws.order_index;

-- Check scenes
SELECT ws.name, COUNT(s.id) as scene_count
FROM word_sets ws
LEFT JOIN scenes s ON s.word_set_id = ws.id
GROUP BY ws.id, ws.name;

-- Check students
SELECT * FROM students;
```

Expected results:
- **4 word sets:** Garden, Kitchen, Beach, Birthday
- **16 words:** 4 per set
- **16 scenes:** 4 variations per set (image_url empty initially)
- **3 students:** Student 1, 2, 3

### Storage Verification

1. Go to [Storage](https://supabase.com/dashboard/project/zjeeylvjwvxfahvhiulc/storage/buckets)
2. Verify 3 buckets exist: `scene-images`, `hint-images`, `student-drawings`
3. Check each bucket is marked as "Public"

### API Verification

```bash
# Test Supabase connection
curl http://localhost:3000/api/supabase-init

# Should return status: "ready" if initialized
```

---

## 🎨 Step 6: Generate Scene Images (Phase 4)

Scene images will be generated in Phase 4 using `/api/generate-scene`:

```bash
# Generate all 16 scenes (4 sets × 4 variations)
# This will be done programmatically via script
```

**Note:** Scene generation requires:
- OpenAI API key (for DALL-E 3)
- `scene_generation_prompt.md` template
- Approximately 10-15 minutes for all 16 scenes
- Cost: ~$1.28 (16 × $0.08)

---

## 📊 Database Schema Overview

### Tables

```
word_sets (4 rows)
  ├─ id (UUID)
  ├─ name (TEXT) - e.g., "The Garden"
  ├─ scene_word (TEXT) - e.g., "garden"
  └─ order_index (INTEGER)

words (16 rows, 4 per set)
  ├─ id (UUID)
  ├─ word_set_id (FK → word_sets)
  ├─ text (TEXT) - e.g., "watering can"
  ├─ hint_text (TEXT)
  └─ order_index (INTEGER)

scenes (16 rows, 4 per set)
  ├─ id (UUID)
  ├─ word_set_id (FK → word_sets)
  ├─ image_url (TEXT) - URL to Supabase Storage
  ├─ scene_index (INTEGER) - 0-3
  └─ style_preset (TEXT)

scene_objects (64+ rows, linking words to scenes)
  ├─ id (UUID)
  ├─ scene_id (FK → scenes)
  ├─ word_id (FK → words)
  ├─ object_name (TEXT)
  └─ position_data (JSONB) - x, y coordinates

students (3 rows by default)
  ├─ id (UUID)
  └─ name (TEXT)

word_attempts (logged by students)
  ├─ id (UUID)
  ├─ student_id (FK → students)
  ├─ word_id (FK → words)
  ├─ is_correct (BOOLEAN)
  ├─ confidence (DECIMAL)
  ├─ used_hint (BOOLEAN)
  └─ drawing_data (TEXT) - base64 image

scene_attempts (logged by students)
  ├─ id (UUID)
  ├─ student_id (FK → students)
  ├─ scene_id (FK → scenes)
  ├─ object_name (TEXT)
  ├─ is_correct (BOOLEAN)
  └─ attempts_count (INTEGER)
```

---

## 🔧 Troubleshooting

### "permission denied for table word_sets"
- **Cause:** RLS policies not set correctly
- **Fix:** Re-run RLS policy SQL from `supabase-schema.sql`

### "relation 'word_sets' does not exist"
- **Cause:** Schema not created
- **Fix:** Run `supabase-schema.sql` in SQL Editor

### "Failed to create bucket"
- **Cause:** Bucket already exists or naming conflict
- **Fix:** Check existing buckets, use unique names if needed

### API route returns 500 error
- **Cause:** Environment variables not set
- **Fix:** Verify `.env.local` has Supabase keys set

### Cannot upload to storage buckets
- **Cause:** Storage policies not configured
- **Fix:** Run storage policy SQL from Step 3

---

## 📝 Quick Reference

### Supabase Dashboard URLs

- **Overview:** https://supabase.com/dashboard/project/zjeeylvjwvxfahvhiulc
- **Table Editor:** https://supabase.com/dashboard/project/zjeeylvjwvxfahvhiulc/editor
- **SQL Editor:** https://supabase.com/dashboard/project/zjeeylvjwvxfahvhiulc/sql/new
- **Storage:** https://supabase.com/dashboard/project/zjeeylvjwvxfahvhiulc/storage/buckets
- **API Settings:** https://supabase.com/dashboard/project/zjeeylvjwvxfahvhiulc/settings/api

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://zjeeylvjwvxfahvhiulc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_QNwizQgL4D0fdz3t9ymmiA_9yejtzjG
SUPABASE_SERVICE_ROLE_KEY=sb_secret_fszeKg2hLGtj42Od95n5zg_Aw82Rnec
```

---

## ✅ Phase 2 Complete Criteria

- [x] Database schema created (8 tables) ✅
- [ ] Storage buckets created (3 buckets) - **Manual setup required**
- [ ] Storage policies configured (public read/write) - **Manual setup required**
- [x] Word sets initialized (4 sets, 16 words) ✅
- [x] Students created (3 default profiles) ✅
- [x] Scene placeholders created (16 records) ✅
- [ ] Scene images generated (Phase 4)

---

**Status:** Database setup complete. Storage buckets need manual creation before Phase 4.
**Current Progress:**
- ✅ Supabase database initialized with 4 word sets (Garden, Kitchen, Beach, Birthday)
- ✅ 16 words inserted (4 per set)
- ✅ 16 scene placeholders created (images to be generated in Phase 4)
- ✅ 3 default students created
- ⏳ Storage buckets (scene-images, hint-images, student-drawings) - **need manual setup**

**Next:** Phase 3 - Build NotebookLayout, DrawingCanvas, LetterBank components
