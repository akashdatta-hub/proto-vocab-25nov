# Draw & Learn Notebook Prototype

An educational vocabulary learning app with drawing recognition, AI-generated scenes, and TTS narration.

## ✅ Phase 1: Complete

### Installed & Configured:
- ✅ Next.js 14 with TypeScript
- ✅ Tailwind CSS
- ✅ shadcn/ui components (button, card, table, tabs, dialog, sonner)
- ✅ Core dependencies:
  - `@supabase/supabase-js`
  - `framer-motion`
  - `react-sketch-canvas` (for drawing)
  - `openai`
  - `replicate`
  - `@google-cloud/text-to-speech`

### Project Structure:
```
proto-vocab-app/
├── app/
│   ├── api/
│   │   ├── tts/
│   │   ├── recognise-drawing/
│   │   ├── generate-scene/
│   │   └── supabase-init/
│   ├── student/
│   │   ├── [setId]/
│   │   │   ├── [wordId]/
│   │   │   └── scene/
│   │   └── collection/
│   └── teacher/
├── components/
│   ├── notebook/
│   ├── drawing/
│   ├── scene/
│   ├── collection/
│   ├── teacher/
│   ├── shared/
│   └── ui/ (shadcn)
├── lib/
│   ├── utils.ts
│   ├── sound-effects.ts ✅
│   ├── tsv-parser.ts ✅
│   └── constants.ts ✅
├── types/
│   └── index.ts ✅
├── public/
│   └── sounds/ ✅ (15 sound effects)
├── scene_generation_prompt.md ✅
├── words and scenes.tsv ✅
└── proto-vocab-25nov-6037e86dbb9e.json ✅
```

### Created Files:
- ✅ `types/index.ts` - TypeScript interfaces for all data types
- ✅ `lib/sound-effects.ts` - Sound effects management with accessibility
- ✅ `lib/tsv-parser.ts` - Parse word sets from TSV file
- ✅ `lib/constants.ts` - App constants, word sets, TTS templates
- ✅ `.env.local` - Environment variables (Supabase keys need to be added)

### Sound Effects:
15 curated sound effects copied to `public/sounds/`:
- UI interactions (clicks, selections)
- Page turns
- Success/error feedback
- Letter bank sounds
- Scene interactions
- Collection celebrations

## 🔧 Setup Instructions

### 1. Add Supabase Keys
Edit `.env.local` and add your Supabase keys:
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Get keys from: https://supabase.com/dashboard/project/zjeeylvjwvxfahvhiulc/settings/api

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm start
```

## 📊 Word Sets (from TSV)

The prototype uses 4 word sets:

1. **The Garden** - watering can, tree, bee, grass
2. **Kitchen** - plate, stove, spoon, knife
3. **Beach** - sand, shells, boat, fishes
4. **Birthday** - cake, candles, balloons, gift

**Total:** 16 words, 4 scenes (4 variations each = 16 scene images to generate)

## 🎨 Features

### Student Journey:
- Draw vocabulary words
- AI drawing recognition (OpenAI GPT-4 Vision)
- Text-to-speech narration (Google Cloud TTS)
- Scene selection & word spelling
- Collection page tracking progress

### Teacher Dashboard:
- Student progress tracking
- Word analytics
- Scene completion stats
- Hint usage metrics

### Technical:
- Notebook page-turn animations (Framer Motion)
- Sound effects with accessibility preferences
- Responsive design with shadcn/ui
- TypeScript for type safety
- Supabase for data persistence

## 📝 Next Steps

Phase 2: Supabase Setup
- Create database schema
- Set up storage buckets
- Seed word sets data
- Pre-generate scene images

## 📄 Reference Files

- `BUILD_PLAN.md` - Complete implementation plan
- `BUILD_PLAN_SUMMARY.md` - Quick reference of updates
- `SCENE_GENERATION_IMPLEMENTATION.md` - Scene generation guide
- `scene_generation_prompt.md` - DALL-E prompt template

## 🚀 Deployment

Ready to deploy to Vercel:
1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Deploy

---

**Phase 1 Status:** ✅ Complete
**Build Test:** ✅ Passing
**Ready for Phase 2:** ✅ Yes
