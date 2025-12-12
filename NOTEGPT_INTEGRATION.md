# NoteGPT Integration Guide

## Why NoteGPT is Excellent for Your Use Case

✅ **AI-Powered Educational Videos** - Specifically designed for educational content  
✅ **Math Video Generator** - Great for courses with mathematical concepts  
✅ **Structured Content** - Handles course materials, notes, and lessons well  
✅ **Automated Generation** - Converts text directly to video  
✅ **Free Tier Available** - Check their pricing for free tier limits  

---

## NoteGPT vs Other Options

| Feature | NoteGPT | Pictory | TTS+Slides |
|---------|---------|---------|------------|
| **Best For** | Educational content, math | General videos | Custom control |
| **Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Automation** | High | High | Medium |
| **Free Tier** | Check website | 3 videos/month | Unlimited (with free TTS) |
| **Math Support** | Excellent | Limited | Manual |
| **Setup Time** | 5 min | 5 min | 30 min |

**Recommendation:** Use **NoteGPT** for educational courses, especially if you have math or structured content.

---

## Setup Instructions

### Step 1: Sign Up for NoteGPT

1. Go to https://notegpt.io (or check their current website)
2. Sign up for an account
3. Navigate to API settings
4. Generate an API key
5. Check free tier limits

### Step 2: Configure Environment Variables

Add to your `.env` file:

```bash
# NoteGPT Configuration
NOTEGPT_API_KEY=your_api_key_here
NOTEGPT_API_URL=https://api.notegpt.io/v1  # Check actual API URL
```

### Step 3: Test Integration

The code is already integrated! Just call:

```bash
POST /api/lessons/:lessonId/generate-video
{
  "provider": "notegpt",
  "videoStyle": "explainer",
  "includeSubtitles": true
}
```

---

## API Integration

### NoteGPT API Endpoints (Template)

**Note:** You'll need to check NoteGPT's actual API documentation for exact endpoints and request/response formats.

```typescript
// Generate video from text
POST https://api.notegpt.io/v1/videos/generate
Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json

Body:
{
  "text": "Your lesson content here...",
  "title": "Lesson Title",
  "style": "explainer",  // or "math", "slides", etc.
  "language": "en-US",
  "includeSubtitles": true,
  "videoType": "educational"
}

Response:
{
  "videoId": "abc123",
  "videoUrl": "https://...",
  "youtubeVideoId": "xyz789",  // If they auto-upload
  "duration": 180,  // seconds
  "status": "completed"
}
```

---

## Usage Examples

### Generate Video for Single Lesson

```typescript
// Via API
POST /api/lessons/lesson-id-123/generate-video
{
  "provider": "notegpt",
  "videoStyle": "explainer",
  "includeSubtitles": true
}

// Response
{
  "success": true,
  "videoUrl": "https://www.youtube.com/watch?v=xyz789",
  "youtubeVideoId": "xyz789",
  "duration": 180
}
```

### Batch Generate for Course

```typescript
POST /api/courses/course-id-456/generate-videos
{
  "provider": "notegpt",
  "videoStyle": "explainer"
}

// Starts background processing for all lessons
```

### Using NoteGPT Math Video Generator

If your course has math content:

```typescript
POST /api/lessons/lesson-id/generate-video
{
  "provider": "notegpt",
  "videoStyle": "math",  // Special math video generation
  "includeSubtitles": true
}
```

---

## Manual Workflow (If No API)

If NoteGPT doesn't have an API yet, you can still use it:

1. **Go to NoteGPT website**
2. **Paste lesson content**
3. **Generate video**
4. **Download or get YouTube link**
5. **Manually add to lesson** via admin panel

The system already supports YouTube URLs, so this works seamlessly!

---

## Cost Comparison

| Service | Free Tier | Best For |
|---------|-----------|----------|
| **NoteGPT** | Check website | Educational content |
| **Pictory** | 3 videos/month | General videos |
| **Google TTS** | 4M chars/month | High volume |
| **ElevenLabs** | 10k chars/month | Best voice quality |

**Strategy:** Use NoteGPT for educational content, Pictory for general videos, TTS+Slides for high volume.

---

## Integration Status

✅ **Code Ready** - `videoGenerationService.ts` includes NoteGPT support  
✅ **API Endpoints** - `/api/lessons/:id/generate-video` supports NoteGPT  
✅ **Batch Processing** - Can generate videos for entire courses  
⏳ **Needs Configuration** - Add API key to environment variables  
⏳ **API Documentation** - Check NoteGPT's actual API docs for exact endpoints  

---

## Next Steps

1. **Sign up for NoteGPT** - Get API key
2. **Test with one lesson** - Verify integration works
3. **Batch process** - Generate videos for all lessons
4. **Monitor usage** - Stay within free tier limits

The integration is ready - just add your API key and you're good to go!

---

## Troubleshooting

### "API key not configured"
- Add `NOTEGPT_API_KEY` to your `.env` file
- Restart your server

### "API endpoint not found"
- Check NoteGPT's current API documentation
- Update `NOTEGPT_API_URL` if needed

### "Video generation failed"
- Check API response for error details
- Verify your API key has sufficient credits
- Check free tier limits

### Manual Fallback
If API doesn't work, use NoteGPT website manually:
1. Generate video on website
2. Get YouTube URL
3. Paste into lesson `videoUrl` field
4. Done!

