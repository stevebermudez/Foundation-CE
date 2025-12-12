# Video Generation Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables

Add to your `.env` file:

```bash
# NoteGPT Configuration (Required for video generation)
NOTEGPT_API_KEY=your_notegpt_api_key_here
NOTEGPT_API_URL=https://api.notegpt.io/v1  # Optional, defaults to this

# YouTube Configuration (Required for auto-upload)
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REFRESH_TOKEN=your_youtube_refresh_token

# Optional: Alternative TTS providers
ELEVENLABS_API_KEY=your_elevenlabs_key  # Optional
GOOGLE_TTS_API_KEY=your_google_tts_key  # Optional
```

### 2. API Setup

#### NoteGPT API
1. Sign up at https://notegpt.io
2. Navigate to API settings
3. Generate API key
4. Copy to `NOTEGPT_API_KEY`

#### YouTube Data API
1. Go to https://console.cloud.google.com
2. Create/select project
3. Enable "YouTube Data API v3"
4. Create OAuth 2.0 credentials
5. Get refresh token using OAuth playground
6. Add credentials to `.env`

### 3. Dependencies

All dependencies are already in `package.json`. No additional installs needed.

### 4. Database

No schema changes required. Uses existing `lessons` table with `videoUrl` field.

## Deployment Steps

### Step 1: Set Environment Variables

```bash
# Production environment
export NOTEGPT_API_KEY=your_key
export YOUTUBE_CLIENT_ID=your_id
export YOUTUBE_CLIENT_SECRET=your_secret
export YOUTUBE_REFRESH_TOKEN=your_token
```

### Step 2: Build and Deploy

```bash
# Build
npm run build

# Start production server
npm start
```

### Step 3: Verify Deployment

1. **Test API endpoint:**
   ```bash
   curl -X POST http://your-domain/api/lessons/LESSON_ID/generate-video \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"provider": "notegpt"}'
   ```

2. **Check admin UI:**
   - Navigate to `/admin/courses`
   - Click "Generate Videos" button on a course
   - Verify dialog appears and options work

3. **Monitor logs:**
   ```bash
   # Check for errors
   tail -f logs/app.log | grep -i "video\|notegpt"
   ```

## Security Considerations

### ✅ Implemented

- **Authentication:** All endpoints require admin authentication
- **Rate Limiting:** Admin endpoints have rate limits
- **Input Validation:** Zod schemas validate all inputs
- **Error Handling:** Proper error messages without exposing internals
- **Timeout Protection:** 5-minute timeout on API calls
- **Content Length Limits:** Prevents abuse with max text length

### ⚠️ Additional Recommendations

1. **API Key Security:**
   - Store keys in environment variables (never commit)
   - Rotate keys periodically
   - Use different keys for dev/staging/prod

2. **Rate Limiting:**
   - Monitor API usage
   - Set up alerts for unusual activity
   - Consider additional rate limiting per user

3. **Monitoring:**
   - Log all video generation attempts
   - Track success/failure rates
   - Monitor API quota usage

## Monitoring & Maintenance

### Logs to Monitor

```bash
# Video generation logs
grep "Video Generation" logs/app.log

# API errors
grep "NoteGPT API error" logs/app.log

# YouTube upload errors
grep "YouTube upload" logs/app.log
```

### Health Checks

Add to your health check endpoint:

```typescript
// Check if NoteGPT API is accessible
const notegptHealth = await fetch(`${NOTEGPT_API_URL}/health`)
  .then(r => r.ok)
  .catch(() => false);
```

### Metrics to Track

- Video generation success rate
- Average generation time
- API quota usage
- Failed generations by reason

## Troubleshooting

### Common Issues

**1. "API key not configured"**
- Check `.env` file has `NOTEGPT_API_KEY`
- Restart server after adding env vars
- Verify key is correct

**2. "NoteGPT API error: 401"**
- API key is invalid or expired
- Regenerate key from NoteGPT dashboard

**3. "Request timed out"**
- Video generation taking too long
- Check NoteGPT service status
- Consider increasing timeout (not recommended)

**4. "YouTube upload failed"**
- Check YouTube API credentials
- Verify refresh token is valid
- Check YouTube API quota

**5. "Content too long"**
- Lesson content exceeds 50,000 characters
- Split lesson into smaller sections
- Or adjust `MAX_TEXT_LENGTH` in code

## Rollback Plan

If issues occur:

1. **Disable video generation:**
   ```typescript
   // In routes.ts, comment out video generation endpoints
   ```

2. **Remove UI button:**
   ```typescript
   // In courses.tsx, hide Generate Videos button
   ```

3. **Keep existing videos:**
   - Videos already generated remain functional
   - Only new generation is disabled

## Performance Considerations

- **Batch Processing:** Limited to 50 lessons per batch
- **Rate Limiting:** 2-second delay between videos in batch
- **Timeout:** 5 minutes per video generation
- **Background Processing:** Batch jobs run async, don't block API

## Cost Management

### Free Tier Limits

- **NoteGPT:** Check their website for current limits
- **YouTube:** Unlimited uploads (free)
- **Google TTS:** 4M characters/month (free)

### Monitoring Usage

```typescript
// Track API usage
const usage = {
  notegpt: await getNoteGPTUsage(),
  youtube: await getYouTubeQuota(),
  tts: await getTTSUsage()
};
```

## Support

For issues:
1. Check logs first
2. Verify API keys
3. Test with single lesson
4. Contact NoteGPT support if API issues
5. Check YouTube API status

## Version History

- **v1.0.0** - Initial implementation with NoteGPT integration
  - Single lesson generation
  - Batch course generation
  - Admin UI integration
  - Error handling and validation

