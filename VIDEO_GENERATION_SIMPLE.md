# Simple Video Generation Guide (No NoteGPT)

## Free Options for Video Generation

### Option 1: Pictory.ai (Recommended - Easiest)

**Free Tier:** 3 videos/month  
**Best For:** Quick, automated video generation

**Setup:**
1. Sign up at https://pictory.ai (free account)
2. Get API key from dashboard
3. Add to `.env`: `PICTORY_API_KEY=your_key`
4. Done! ✅

**How it works:**
- Paste lesson text → Pictory generates video
- Returns video URL or YouTube link
- Automatically uploads to YouTube (if configured)

---

### Option 2: TTS + Slides (Free, Unlimited)

**Free Tier:** Unlimited (using free TTS services)  
**Best For:** High volume, custom control

**Setup:**
1. Get Google TTS API key (free: 4M chars/month)
   - Go to https://console.cloud.google.com
   - Enable "Cloud Text-to-Speech API"
   - Get API key
   - Add to `.env`: `GOOGLE_TTS_API_KEY=your_key`

2. Optional: Get ElevenLabs key (better voice quality)
   - Sign up at https://elevenlabs.io
   - Free: 10k characters/month
   - Add to `.env`: `ELEVENLABS_API_KEY=your_key`

**How it works:**
- Extracts lesson text
- Generates TTS audio
- Creates slides from content
- Combines into video
- Uploads to YouTube

---

### Option 3: Manual (No API Keys Needed)

**Free:** Forever  
**Best For:** One-off videos, testing

**How it works:**
1. Use Pictory.ai website manually
2. Paste lesson text
3. Generate video
4. Download or get YouTube link
5. Paste URL into lesson in admin panel

**No code needed!** Just use the website.

---

## Recommended Setup

### Start Simple (No API Keys):

1. **Use Pictory.ai website manually:**
   - Go to https://pictory.ai
   - Create free account
   - Generate 3 videos/month (free)
   - Upload to YouTube manually
   - Add YouTube URLs to lessons

**Time:** 5 minutes per video  
**Cost:** $0  
**API Keys:** None needed!

---

### Scale Up (With API Keys):

1. **Get Pictory API key:**
   - Sign up at Pictory
   - Get API key
   - Add `PICTORY_API_KEY` to `.env`
   - Now you can batch generate!

2. **Optional - Add YouTube API:**
   - Only if you want auto-upload
   - See `DEPLOYMENT.md` for setup

---

## What Changed

- ✅ **Removed NoteGPT as default** - Now optional
- ✅ **Pictory is default** - Free tier available
- ✅ **TTS+Slides works** - Free, unlimited
- ✅ **Manual option** - No API keys needed

---

## Quick Start (No API Keys)

1. Go to https://pictory.ai
2. Sign up (free)
3. Generate video from lesson text
4. Get YouTube link
5. Paste into lesson `videoUrl` field
6. Done!

**That's it!** No API keys, no code changes, just use the website.

---

## If You Want Automation

Add just one API key:

```bash
# In .env file
PICTORY_API_KEY=your_pictory_api_key_here
```

Then you can:
- Batch generate videos
- Automate the process
- Generate from admin UI

**Still free** (3 videos/month on free tier)!

---

## Cost Comparison

| Method | Free Tier | Setup Time | Automation |
|--------|-----------|------------|------------|
| **Pictory Manual** | 3 videos/month | 0 min | No |
| **Pictory API** | 3 videos/month | 5 min | Yes |
| **TTS + Slides** | Unlimited | 15 min | Yes |
| **Manual Upload** | Unlimited | 0 min | No |

**Recommendation:** Start with Pictory manual, add API later if needed.

