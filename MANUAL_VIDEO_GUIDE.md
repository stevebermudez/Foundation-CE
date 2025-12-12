# Manual Video Generation Guide

## No API Keys Required! 🎉

This guide shows you how to create videos for your lessons using **100% free tools** with **no API keys needed**.

---

## Quick Start (5 Minutes)

### Step 1: Choose a Free Tool

**Pictory.ai** (Recommended)
- Free: 3 videos/month
- Website: https://pictory.ai
- Best for: Automated video creation from text

**InVideo AI**
- Free: 4 videos/month  
- Website: https://invideo.io
- Best for: Template-based videos

**Loom**
- Free: 25 videos/month
- Website: https://loom.com
- Best for: Screen recordings with narration

---

### Step 2: Get Lesson Content

1. Go to your admin panel
2. Click "Prepare Video Content" on any lesson
3. Copy the script that's provided
4. Use it in your chosen video tool

**Or use the API:**
```bash
GET /api/lessons/:lessonId/prepare-video
```

This returns:
- Formatted script ready for video tools
- Key points extracted
- Word count and estimated duration
- Step-by-step instructions

---

### Step 3: Create Video

1. **Pictory.ai:**
   - Sign up (free)
   - Click "Create Video"
   - Paste the script
   - Click "Generate"
   - Wait 2-5 minutes
   - Download video

2. **InVideo:**
   - Sign up (free)
   - Choose "AI Video" template
   - Paste script
   - Customize scenes
   - Export video

3. **Loom:**
   - Install browser extension
   - Record screen with slides
   - Narrate the script
   - Save video

---

### Step 4: Upload to YouTube

1. Go to https://youtube.com
2. Click "Create" → "Upload video"
3. Upload your video
4. Set privacy to **"Unlisted"** (important!)
5. Copy the video URL

**Unlisted means:**
- Only accessible via direct link
- Won't appear in search
- Perfect for course content
- Can be embedded (which your site does)

---

### Step 5: Add to Lesson

1. Go to lesson in admin panel
2. Find "Video URL" field
3. Paste YouTube URL
4. Save lesson

**Done!** ✅

---

## Using the Admin UI

### Prepare Content for Video

1. Go to `/admin/courses`
2. Click on a course
3. Click "Prepare Video Content" button
4. View formatted script
5. Copy and use in video tool

### Add Video URL Manually

1. Go to lesson editor
2. Find "Video URL" field
3. Paste YouTube URL
4. Save

---

## Batch Processing

### Prepare Multiple Lessons

```bash
POST /api/courses/:courseId/prepare-videos
```

Returns formatted content for all lessons, ready to use in video tools.

---

## Free Tools Comparison

| Tool | Free Tier | Best For | Time per Video |
|------|-----------|----------|---------------|
| **Pictory.ai** | 3/month | Automated | 5 min |
| **InVideo AI** | 4/month | Templates | 10 min |
| **Loom** | 25/month | Screen record | 15 min |
| **Canva + TTS** | Unlimited | Custom | 20 min |

---

## Workflow Example

### For 10 Lessons:

1. **Prepare all content:**
   - Use batch prepare endpoint
   - Get scripts for all lessons

2. **Create videos:**
   - Use Pictory.ai (3 free/month)
   - Create 3 videos
   - Wait for next month or use InVideo for more

3. **Upload to YouTube:**
   - Upload all videos as unlisted
   - Copy URLs

4. **Add to lessons:**
   - Paste URLs in admin panel
   - Done!

**Total time:** ~2-3 hours for 10 videos  
**Total cost:** $0

---

## Tips & Tricks

### Maximize Free Tiers

- **Rotate tools:** Use Pictory (3/month) + InVideo (4/month) = 7 videos/month free
- **Create multiple accounts:** If needed (check terms of service)
- **Batch create:** Prepare all content, then create videos when you have time

### Speed Up Process

- **Use templates:** InVideo has pre-made templates
- **Reuse styles:** Once you find a style you like, reuse it
- **Batch upload:** Upload multiple videos to YouTube at once

### Quality Tips

- **Add visuals:** Include relevant images in your videos
- **Use subtitles:** Most tools auto-generate them
- **Keep it short:** 3-5 minute videos work best
- **Clear audio:** Use good microphone if recording

---

## API Endpoints

### Prepare Single Lesson
```
GET /api/lessons/:lessonId/prepare-video
```

**Response:**
```json
{
  "success": true,
  "content": {
    "title": "Lesson Title",
    "script": "Formatted script...",
    "keyPoints": ["Point 1", "Point 2"],
    "wordCount": 500,
    "estimatedDuration": 3,
    "formattedForPictory": "...",
    "formattedForInVideo": "...",
    "instructions": ["Step 1...", "Step 2..."]
  }
}
```

### Prepare Batch
```
POST /api/courses/:courseId/prepare-videos
```

Returns prepared content for all lessons in the course.

---

## Troubleshooting

### "Script too long"
- Split lesson into multiple shorter videos
- Or use key points only

### "Video tool limit reached"
- Wait for next month
- Or use a different tool
- Or create account on different tool

### "YouTube upload failed"
- Check file size (YouTube has limits)
- Try compressing video
- Or use YouTube's web uploader

---

## Next Steps

1. **Start with one lesson** - Test the workflow
2. **Prepare all content** - Use batch endpoint
3. **Create videos gradually** - Use free tiers
4. **Upload to YouTube** - All at once or as you go
5. **Add URLs to lessons** - Update as videos are ready

**No rush!** You can do this over time using free tiers.

---

## Support

- **Pictory help:** https://pictory.ai/help
- **InVideo help:** https://invideo.io/support
- **YouTube help:** https://support.google.com/youtube

All tools have free support and tutorials!

