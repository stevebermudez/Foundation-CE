# Video Generation Setup Guide

## Quick Start: Free Video Generation

### Option 1: Manual (Easiest - No Code)

1. **Use Pictory.ai** (Free: 3 videos/month)
   - Go to https://pictory.ai
   - Sign up for free account
   - Paste lesson text
   - Click "Generate Video"
   - Download video
   - Upload to YouTube (unlisted)
   - Copy YouTube URL → Paste into lesson `videoUrl` field

**Time:** 5 minutes per video

---

### Option 2: Semi-Automated (Recommended)

#### Step 1: Get Free API Keys

**ElevenLabs (Best Voice Quality)**
1. Sign up at https://elevenlabs.io
2. Free tier: 10,000 characters/month
3. Go to Profile → API Key
4. Copy API key
5. Set environment variable: `ELEVENLABS_API_KEY=your_key`

**Google Cloud TTS (More Volume)**
1. Go to https://console.cloud.google.com
2. Create project (free)
3. Enable "Cloud Text-to-Speech API"
4. Create service account → Download JSON key
5. Free tier: 0-4 million characters/month
6. Set environment variable: `GOOGLE_TTS_API_KEY=your_key`

**YouTube Data API (For Auto-Upload)**
1. Go to https://console.cloud.google.com
2. Enable "YouTube Data API v3"
3. Create OAuth 2.0 credentials
4. Get refresh token (use OAuth playground)
5. Set environment variables:
   ```
   YOUTUBE_CLIENT_ID=your_client_id
   YOUTUBE_CLIENT_SECRET=your_secret
   YOUTUBE_REFRESH_TOKEN=your_refresh_token
   ```

#### Step 2: Install FFmpeg (For Video Assembly)

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# Mac
brew install ffmpeg
```

**Windows:**
1. Download from https://ffmpeg.org/download.html
2. Add to PATH

#### Step 3: Use the Service

The `videoGenerationService.ts` is ready to use. You can:
- Call it from admin panel
- Trigger via API endpoint
- Batch process lessons

---

## Alternative: Use External Services (No Setup)

### Pictory.ai Integration
- Free: 3 videos/month
- API available (paid plans)
- Direct YouTube upload
- Best for: Quick start

### InVideo AI
- Free: 4 videos/month
- Template-based
- Good quality
- Best for: Consistent branding

### Loom (Screen Recording)
- Free: 25 videos/month
- Record slides + narration
- Quick and easy
- Best for: Manual creation

---

## Recommended Workflow

### For 10-50 Lessons:
1. Use **Pictory.ai** free tier (3/month)
2. Create multiple accounts if needed
3. Manually upload to YouTube
4. Copy URLs to lessons

### For 50+ Lessons:
1. Set up **Google TTS** (4M chars/month = ~400 videos)
2. Use **FFmpeg** for video assembly
3. Auto-upload to YouTube
4. Batch process all lessons

### For Best Quality:
1. Use **ElevenLabs** for voice (10k chars = ~1-2 videos)
2. Create slides in **Canva**
3. Use **CapCut** for editing
4. Upload to YouTube manually

---

## Cost Breakdown

| Service | Free Tier | Cost After Free |
|---------|-----------|-----------------|
| **YouTube** | Unlimited | $0 |
| **Google TTS** | 4M chars/month | $4 per 1M chars |
| **ElevenLabs** | 10k chars/month | $5/month for 30k |
| **Pictory.ai** | 3 videos/month | $19/month for 30 |
| **FFmpeg** | Free forever | $0 |
| **Canva** | Unlimited | $0 (or $13/month pro) |

**Total for 100 videos: $0** (using free tiers strategically)

---

## Next Steps

1. **Start Simple:** Use Pictory.ai manually for first 3 videos
2. **Test Integration:** Verify YouTube embeds work in your lessons
3. **Scale Up:** Set up automated generation for remaining lessons
4. **Optimize:** Use best free tools for your volume

The code is ready - just add your API keys and you're good to go!

