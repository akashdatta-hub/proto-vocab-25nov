# Deployment Guide - Draw & Learn Notebook

## 🔐 Security Note

The Google Cloud TTS credentials file (`proto-vocab-25nov-6037e86dbb9e.json`) is **NOT** included in the repository for security reasons. You need to add it manually in both local and production environments.

---

## 🏠 Local Development Setup

### 1. Environment Variables

Create `.env.local` from the example:
```bash
cp .env.example .env.local
```

### 2. Add Your API Keys

Edit `.env.local` and add:

- **OpenAI API Key**: Already configured
- **Replicate Token**: Already configured
- **Supabase Keys**: Get from [Supabase Dashboard](https://supabase.com/dashboard/project/zjeeylvjwvxfahvhiulc/settings/api)
  - Copy `anon/public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Add Google Cloud TTS Credentials

Place `proto-vocab-25nov-6037e86dbb9e.json` in the project root directory.

**Important:** This file is gitignored for security. Keep it safe locally.

### 4. Install & Run

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## ☁️ Vercel Deployment

### Project Links
- **GitHub Repository:** https://github.com/akashdatta-hub/proto-vocab-25nov
- **Vercel Project:** https://vercel.com/akashs-projects-7ee4774b/proto-vocab-25nov

### Prerequisites
- GitHub repository pushed
- Vercel account connected to GitHub
- All API credentials ready

### Deployment Method: Git-based (Recommended)

**All deployments should be done through Git.** Vercel automatically deploys when you push to GitHub.

#### Option A: Deploy via Git Push (Primary Method)

```bash
# Make your changes
git add .
git commit -m "Your commit message"
git push origin main

# Vercel will automatically deploy
# Monitor at: https://vercel.com/akashs-projects-7ee4774b/proto-vocab-25nov
```

#### Option B: Deploy via Vercel CLI (Alternative)

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Link to existing project
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Step 1: Initial Setup (First Time Only)

If not already connected:

1. Go to https://vercel.com/akashs-projects-7ee4774b/proto-vocab-25nov
2. Or create new: https://vercel.com/new
3. Import GitHub repository: `akashdatta-hub/proto-vocab-25nov`
4. Select the `proto-vocab-app` folder as the root directory

### Step 2: Configure Build Settings

Vercel should auto-detect Next.js. Verify:
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Step 3: Add Environment Variables

In Vercel project settings → Environment Variables, add:

```bash
# OpenAI
OPENAI_API_KEY=your_openai_key_here

# Replicate
REPLICATE_API_TOKEN=your_replicate_token_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://zjeeylvjwvxfahvhiulc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from Supabase dashboard]
SUPABASE_SERVICE_ROLE_KEY=[from Supabase dashboard]
```

### Step 4: Upload Google Cloud Credentials

**Option A: Environment Variable (Recommended for Vercel)**

1. Convert the JSON file to base64:
   ```bash
   cat proto-vocab-25nov-6037e86dbb9e.json | base64
   ```

2. Add to Vercel environment variables:
   ```
   GOOGLE_CREDENTIALS_BASE64=[paste base64 string]
   ```

3. Update `lib/tts.ts` to decode from base64:
   ```typescript
   const credentials = JSON.parse(
     Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64!, 'base64').toString()
   );
   ```

**Option B: Vercel File Upload**

Vercel doesn't support direct file uploads. Use Option A instead.

### Step 5: Deploy

Click "Deploy" and wait for build to complete.

### Step 6: Verify Deployment

Test the following:
- ✅ Homepage loads
- ✅ Student journey accessible
- ✅ Teacher dashboard accessible
- ✅ API routes respond (test with `/api/tts` later)

---

## 🗄️ Supabase Setup (Required Before Full Deployment)

### 1. Create Database Tables

Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/zjeeylvjwvxfahvhiulc/sql/new) and run:

```sql
-- Copy schema from BUILD_PLAN.md Phase 2.1
-- Or use the initialization API route: POST /api/supabase-init
```

### 2. Create Storage Buckets

In Supabase Storage, create:
- `scene-images` (public)
- `hint-images` (public)
- `student-drawings` (public)

### 3. Set Bucket Policies

Make all buckets publicly readable:
```sql
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id IN ('scene-images', 'hint-images', 'student-drawings'));
```

### 4. Seed Data

After deployment, call:
```bash
curl -X POST https://your-app.vercel.app/api/supabase-init
```

This will:
- Create word sets from TSV
- Generate scene images (16 total)
- Store URLs in database

---

## 🧪 Testing Deployment

### Checklist

- [ ] Homepage loads correctly
- [ ] Environment variables are set
- [ ] Supabase connection works
- [ ] TTS API responds (test route)
- [ ] Drawing recognition works
- [ ] Scene generation works (test with 1 scene first)
- [ ] Sound effects play
- [ ] Page turn animations work

### Test API Routes

```bash
# Test TTS (after implementation)
curl -X POST https://your-app.vercel.app/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","context":"draw_word"}'

# Test drawing recognition (after implementation)
curl -X POST https://your-app.vercel.app/api/recognise-drawing \
  -H "Content-Type: application/json" \
  -d '{"imageBase64":"...","targetWord":"tree"}'
```

---

## 🔧 Troubleshooting

### "Cannot find module 'proto-vocab-25nov-6037e86dbb9e.json'"

**Local:** Ensure the JSON file is in the project root
**Vercel:** Use base64 environment variable method (see Step 4)

### "Supabase connection failed"

Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are set correctly

### "OpenAI API error"

Verify `OPENAI_API_KEY` is valid and has credits

### Build fails on Vercel

Check build logs for specific errors. Common issues:
- Missing environment variables
- TypeScript errors
- Dependency installation failures

---

## 📊 Cost Estimation (Monthly)

- **Vercel**: Free tier (Hobby plan)
- **Supabase**: Free tier (up to 500MB database, 1GB storage)
- **OpenAI API**:
  - DALL-E 3: 16 scenes × $0.08 = **$1.28** (one-time)
  - GPT-4 Vision: ~$0.01 per drawing recognition
  - Estimated: **$5-10/month** for prototype usage
- **Google Cloud TTS**: ~$4 per 1M characters
  - Estimated: **$1-2/month** for prototype
- **Replicate**: Pay-per-use (fallback only)

**Total estimated cost: $7-15/month** for active development/testing

---

## 🚀 Going Live

Before launching to students:

1. ✅ Complete all phases (1-9)
2. ✅ Test full student journey
3. ✅ Pre-generate all 16 scenes
4. ✅ Test on multiple devices/browsers
5. ✅ Set up monitoring (Vercel Analytics)
6. ✅ Configure custom domain (optional)
7. ✅ Review Supabase row-level security policies

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review Supabase logs
3. Test API routes individually
4. Verify all environment variables are set

---

## 🔄 Development Workflow

### Standard Git Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Make your changes
# ... edit files ...

# 3. Test locally
npm run dev
npm run build  # Test production build

# 4. Commit with descriptive message
git add .
git commit -m "feat: Add new component

- Detailed description
- What was changed
- Why it was changed

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 5. Push to GitHub
git push origin main

# 6. Verify deployment on Vercel
# Visit: https://vercel.com/akashs-projects-7ee4774b/proto-vocab-25nov
# Check: https://proto-vocab-25nov.vercel.app (or your custom domain)
```

### Using Vercel CLI for Quick Previews

```bash
# Deploy to preview (doesn't affect production)
vercel

# This gives you a preview URL to test changes before merging to main

# If satisfied, deploy to production
vercel --prod
```

### Branch Strategy (Optional)

For larger features, consider using feature branches:

```bash
# Create feature branch
git checkout -b feature/new-component

# Make changes and commit
git add .
git commit -m "feat: Add new component"

# Push feature branch (creates preview deployment on Vercel)
git push origin feature/new-component

# Merge to main when ready
git checkout main
git merge feature/new-component
git push origin main
```

### Quick Commands Reference

```bash
# Local development
npm run dev              # Start dev server
npm run build            # Test production build
npm run start            # Run production build locally

# Git operations
git status               # Check changes
git log --oneline        # View commit history
git diff                 # See unstaged changes

# Vercel CLI
vercel                   # Preview deployment
vercel --prod            # Production deployment
vercel logs              # View deployment logs
vercel env ls            # List environment variables
vercel env add           # Add environment variable
```

### CI/CD Setup (Automatic)

Vercel is already configured for automatic deployments:

- **Push to `main`** → Automatic production deployment
- **Push to other branches** → Automatic preview deployment
- **Pull requests** → Preview deployment with unique URL

Monitor all deployments at: https://vercel.com/akashs-projects-7ee4774b/proto-vocab-25nov/deployments

---

**Status:** Ready for deployment after Phase 2 (Supabase Setup)
