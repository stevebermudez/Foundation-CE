# API Keys Guide - What You Actually Need

## Quick Answer: Which Keys Are Required?

### ✅ **REQUIRED for Video Generation:**
1. **NoteGPT API Key** - To generate videos from lesson text

### ⚠️ **OPTIONAL (Only if you want auto-upload to YouTube):**
2. **YouTube API Credentials** - To automatically upload videos to YouTube

### ❌ **NOT REQUIRED (Alternative options available):**
- ElevenLabs API Key (optional, for better voice quality)
- Google TTS API Key (optional, for high-volume generation)

---

## Option 1: Minimal Setup (Just NoteGPT)

**You only need ONE API key to get started:**

### NoteGPT API Key

**What it does:** Generates videos from your lesson text automatically

**How to get it:**
1. Go to https://notegpt.io (or their current website)
2. Sign up for a free account
3. Navigate to "API" or "Settings" → "API Keys"
4. Generate a new API key
5. Copy the key

**Add to your `.env` file:**
```bash
NOTEGPT_API_KEY=your_notegpt_api_key_here
```

**That's it!** You can now generate videos. NoteGPT may:
- Return a direct video URL (you can use that)
- Return a YouTube link (if they auto-upload)
- Return a video file (you'd need to upload manually)

---

## Option 2: Full Automation (NoteGPT + YouTube)

If you want videos to **automatically upload to YouTube**, you also need:

### YouTube Data API Credentials

**What it does:** Automatically uploads generated videos to your YouTube channel

**How to get them:**

1. **Go to Google Cloud Console:**
   - Visit https://console.cloud.google.com
   - Create a new project (or select existing)

2. **Enable YouTube Data API:**
   - Go to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:3000` (or your domain)
   - Copy the **Client ID** and **Client Secret**

4. **Get Refresh Token:**
   - Go to https://developers.google.com/oauthplayground
   - Click the gear icon (⚙️) → Check "Use your own OAuth credentials"
   - Enter your Client ID and Client Secret
   - In "Select & authorize APIs", find "YouTube Data API v3"
   - Authorize and get your **Refresh Token**

**Add to your `.env` file:**
```bash
YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
YOUTUBE_REFRESH_TOKEN=your_refresh_token_here
```

---

## What If I Don't Want to Set Up YouTube API?

**No problem!** You have options:

### Option A: Manual YouTube Upload
1. Generate video with NoteGPT
2. NoteGPT may give you a video file or URL
3. Manually upload to YouTube
4. Copy YouTube URL
5. Paste into lesson `videoUrl` field in admin panel

### Option B: Use NoteGPT's YouTube Integration
- Some NoteGPT plans may auto-upload to YouTube
- Check their documentation
- If they return a `youtubeVideoId`, you're all set!

### Option C: Use Direct Video URLs
- If NoteGPT provides direct video URLs (hosted by them)
- You can use those URLs directly
- No YouTube needed!

---

## Free Tier Limits

### NoteGPT
- **Check their website** for current free tier
- Usually: Limited videos per month
- May have character limits

### YouTube
- **Unlimited uploads** (free forever)
- No quotas for uploads
- Only need API for automation

---

## Quick Setup Checklist

### Minimal (Just NoteGPT):
- [ ] Sign up at NoteGPT
- [ ] Get API key
- [ ] Add `NOTEGPT_API_KEY` to `.env`
- [ ] Done! ✅

### Full Automation:
- [ ] Sign up at NoteGPT → Get API key
- [ ] Google Cloud Console → Enable YouTube API
- [ ] Create OAuth credentials
- [ ] Get refresh token
- [ ] Add all 4 values to `.env`
- [ ] Done! ✅

---

## Testing Without API Keys

You can test the UI and code without API keys:

1. **UI works** - Button appears, dialog opens
2. **Validation works** - Input validation happens
3. **Error handling works** - Shows "API key not configured" message

To actually generate videos, you need at least the NoteGPT API key.

---

## Environment Variables Summary

```bash
# REQUIRED for video generation
NOTEGPT_API_KEY=your_key_here

# OPTIONAL - Only if you want auto-upload to YouTube
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_REFRESH_TOKEN=your_refresh_token

# OPTIONAL - Alternative TTS providers (not needed if using NoteGPT)
ELEVENLABS_API_KEY=your_key  # Only if using TTS+Slides method
GOOGLE_TTS_API_KEY=your_key  # Only if using TTS+Slides method
```

---

## Cost Breakdown

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| **NoteGPT** | Check website | Varies |
| **YouTube** | Unlimited | $0 |
| **Google Cloud** | Free tier available | $0 for basic use |

**Minimum cost: $0** (using free tiers)

---

## Troubleshooting

### "API key not configured"
- Add `NOTEGPT_API_KEY` to your `.env` file
- Restart your server
- Verify the key is correct (no extra spaces)

### "YouTube upload failed"
- You can skip YouTube API if NoteGPT provides direct URLs
- Or set up YouTube API credentials (see above)
- Or upload videos manually

### "NoteGPT API error: 401"
- API key is invalid or expired
- Regenerate key from NoteGPT dashboard
- Make sure you copied the full key

---

## Recommendation

**Start Simple:**
1. Get NoteGPT API key (5 minutes)
2. Test with one lesson
3. See what NoteGPT returns (video URL, YouTube link, or file)
4. If you need auto-upload, then set up YouTube API

**You don't need all the keys at once!** Start with NoteGPT and add YouTube later if needed.

