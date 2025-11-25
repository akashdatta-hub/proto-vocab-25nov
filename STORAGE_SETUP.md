# Storage Buckets Setup - Quick Reference

**Status:** ⏳ Manual setup required before Phase 4 (Scene Generation)

This is a quick reference for creating the 3 required storage buckets in Supabase. Detailed instructions are in [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

---

## 📦 Required Buckets

### 1. scene-images
- **Purpose:** Store AI-generated scene images (DALL-E 3 output)
- **Public:** ✅ Yes
- **File size limit:** 5 MB
- **Allowed MIME types:** `image/png`, `image/jpeg`, `image/webp`
- **Expected files:** 16 scene images (4 variations × 4 word sets)

### 2. hint-images
- **Purpose:** Store hint images for vocabulary words
- **Public:** ✅ Yes
- **File size limit:** 2 MB
- **Allowed MIME types:** `image/png`, `image/jpeg`, `image/webp`
- **Expected files:** Optional hint images for vocabulary words

### 3. student-drawings
- **Purpose:** Store student drawing submissions from canvas
- **Public:** ✅ Yes
- **File size limit:** 1 MB
- **Allowed MIME types:** `image/png`
- **Expected files:** Student drawings (logged with word_attempts)

---

## 🚀 Quick Setup Steps

### Option 1: Via Supabase UI (Recommended)

1. Go to [Storage Dashboard](https://supabase.com/dashboard/project/zjeeylvjwvxfahvhiulc/storage/buckets)
2. Click **"New bucket"** 3 times to create:
   - `scene-images` (5MB limit, public)
   - `hint-images` (2MB limit, public)
   - `student-drawings` (1MB limit, public)
3. For each bucket, set:
   - ✅ Public bucket
   - File size limits as noted above
   - Allowed MIME types as noted above

### Option 2: Via SQL (If buckets already created)

Run this SQL to make existing buckets public:

```sql
-- Make buckets public
UPDATE storage.buckets
SET public = true
WHERE id IN ('scene-images', 'hint-images', 'student-drawings');
```

---

## 🔐 Storage Policies (Auto-Applied)

If policies are not automatically created, run this SQL:

```sql
-- Allow public read from scene-images
CREATE POLICY "Public read from scene-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'scene-images');

-- Allow public read from hint-images
CREATE POLICY "Public read from hint-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'hint-images');

-- Allow public upload to student-drawings
CREATE POLICY "Public upload to student-drawings"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'student-drawings');

-- Allow public read from student-drawings
CREATE POLICY "Public read from student-drawings"
ON storage.objects
FOR SELECT
USING (bucket_id = 'student-drawings');
```

---

## ✅ Verification

After creating buckets, verify:

1. Go to [Storage Dashboard](https://supabase.com/dashboard/project/zjeeylvjwvxfahvhiulc/storage/buckets)
2. Check that all 3 buckets exist
3. Verify each bucket shows "Public" badge
4. Try uploading a test image to each bucket

---

## 📝 When Are These Needed?

- **scene-images:** Phase 4 - Scene image generation via `/api/generate-scene`
- **hint-images:** Phase 5 - Vocabulary hint images (optional)
- **student-drawings:** Phase 5 - Student drawing submissions from canvas

---

## 🔗 Quick Links

- [Storage Dashboard](https://supabase.com/dashboard/project/zjeeylvjwvxfahvhiulc/storage/buckets)
- [SQL Editor](https://supabase.com/dashboard/project/zjeeylvjwvxfahvhiulc/sql/new)
- [Full Setup Guide](SUPABASE_SETUP.md)

---

**Next after storage setup:** Phase 4 - Generate 16 scene images via DALL-E 3
