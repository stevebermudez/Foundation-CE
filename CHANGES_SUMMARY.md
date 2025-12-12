# Changes Summary - Removed NoteGPT as Default

## What Changed

### ✅ Removed NoteGPT Dependency
- NoteGPT is now **optional** instead of default
- Pictory is now the **default provider** (free tier: 3 videos/month)
- TTS+Slides remains available (free, unlimited)

### ✅ Updated Defaults

**Before:**
- Default provider: NoteGPT
- Required: NoteGPT API key

**After:**
- Default provider: Pictory
- Required: Pictory API key (or use manually)
- NoteGPT: Optional, only if you have API key

### ✅ Updated UI

**Admin Interface:**
- Provider dropdown now shows Pictory first
- NoteGPT moved to bottom as "Optional"
- Clear labels showing free tier limits

**Provider Options:**
1. **Pictory** (Free: 3 videos/month) - Default
2. **TTS + Slides** (Free, unlimited)
3. **NoteGPT** (Optional, requires API key)

---

## What You Need Now

### Option 1: Use Pictory (Recommended)
```bash
# Add to .env
PICTORY_API_KEY=your_pictory_api_key
```

**Get it:**
1. Sign up at https://pictory.ai
2. Free tier: 3 videos/month
3. Get API key from dashboard

### Option 2: Use TTS + Slides (Free, Unlimited)
```bash
# Add to .env (optional, for better voice)
GOOGLE_TTS_API_KEY=your_google_tts_key
# OR
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### Option 3: Manual (No API Keys)
- Use Pictory website manually
- Generate videos on their site
- Upload to YouTube manually
- Paste URLs into lessons

---

## Code Changes

### Backend (`server/videoGenerationService.ts`)
- ✅ Changed default provider from `'notegpt'` to `'pictory'`
- ✅ NoteGPT function still exists (optional)
- ✅ Pictory function fully implemented
- ✅ Better error handling for missing API keys

### API (`server/routes.ts`)
- ✅ Updated validation schemas
- ✅ Provider enum order changed (Pictory first)

### Frontend (`client/src/pages/admin/courses.tsx`)
- ✅ Default provider changed to Pictory
- ✅ UI labels updated
- ✅ Removed duplicate dialog function
- ✅ Provider dropdown reordered

---

## Migration Guide

### If You Had NoteGPT Set Up:

**No action needed!** NoteGPT still works if you have the API key.

Just change the provider in the UI dropdown if you want to use Pictory instead.

### If You're Starting Fresh:

1. **Easiest:** Use Pictory manually (no API keys)
2. **Automated:** Get Pictory API key
3. **High Volume:** Use TTS + Slides

---

## Files Updated

- ✅ `server/videoGenerationService.ts` - Default changed to Pictory
- ✅ `server/routes.ts` - Validation updated
- ✅ `client/src/pages/admin/courses.tsx` - UI updated
- ✅ `VIDEO_GENERATION_SIMPLE.md` - New simple guide

---

## What Still Works

- ✅ All existing functionality
- ✅ NoteGPT still available (if API key configured)
- ✅ TTS + Slides still works
- ✅ Manual upload still works
- ✅ YouTube integration still works

**Nothing broke - just changed the default!**

---

## Next Steps

1. **Test with Pictory:**
   - Sign up at pictory.ai
   - Get API key
   - Test video generation

2. **Or use manually:**
   - No API keys needed
   - Use Pictory website
   - Upload videos manually

3. **Or use TTS + Slides:**
   - Free, unlimited
   - Requires Google TTS or ElevenLabs key
   - More setup but more control

**All options are free!** Choose what works best for you.

