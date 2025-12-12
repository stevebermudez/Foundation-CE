/**
 * Free Video Generation Service
 * 
 * Generates explainer videos from lesson content using free tools:
 * - Text-to-Speech (ElevenLabs, Google TTS, or Azure)
 * - Slide generation (Canva API or templates)
 * - Video assembly (FFmpeg)
 * - YouTube upload (YouTube Data API)
 * 
 * All services use free tiers where possible.
 */

import { db } from './db';
import { lessons } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface VideoGenerationOptions {
  lessonId: string;
  provider?: 'pictory' | 'tts-slides' | 'manual' | 'notegpt'; // Video generation provider (notegpt optional)
  useElevenLabs?: boolean; // Use ElevenLabs (better quality, limited free tier)
  useGoogleTTS?: boolean; // Use Google TTS (more volume, good quality)
  voiceId?: string; // ElevenLabs voice ID
  language?: string; // Language code (default: 'en-US')
  videoStyle?: 'slides' | 'animated' | 'talking-head' | 'math' | 'explainer'; // Video style
  includeSubtitles?: boolean; // Generate and burn subtitles
}

export interface VideoGenerationResult {
  success: boolean;
  videoUrl?: string;
  youtubeVideoId?: string;
  duration?: number;
  error?: string;
  warnings?: string[];
}

/**
 * Generate video from lesson content
 * 
 * Manual workflow (no API keys required):
 * - Extract lesson text for manual video creation
 * - Provide instructions and templates
 * - Helper functions to prepare content for video tools
 * 
 * Optional automated providers (require API keys):
 * - Pictory: Automated video creation (requires API key)
 * - TTS+Slides: Custom generation (requires TTS API key)
 */
export async function generateVideoFromLesson(
  options: VideoGenerationOptions
): Promise<VideoGenerationResult> {
  try {
    // Get lesson
    const lesson = await db.select().from(lessons)
      .where(eq(lessons.id, options.lessonId))
      .limit(1);
    
    if (!lesson.length) {
      return { success: false, error: 'Lesson not found' };
    }
    
    const lessonData = lesson[0];
    
    if (!lessonData.content) {
      return { success: false, error: 'Lesson has no content' };
    }
    
    const provider = options.provider || 'manual'; // Default to manual (no API keys)
    
    // Route to appropriate provider
    switch (provider) {
      case 'manual':
        return await prepareManualVideoGeneration(lessonData, options);
      case 'pictory':
        // Only works if API key is configured
        return await generateVideoWithPictory(lessonData, options);
      case 'tts-slides':
        // Only works if TTS API key is configured
        return await generateVideoWithTTSSlides(lessonData, options);
      case 'notegpt':
        // Disabled - no public API
        return {
          success: false,
          error: 'NoteGPT API is not publicly available. Use manual workflow instead.',
          warnings: ['See MANUAL_VIDEO_GUIDE.md for instructions']
        };
      default:
        return { success: false, error: `Unknown provider: ${provider}` };
    }
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error during video generation'
    };
  }
}

/**
 * Prepare content for manual video generation
 * Extracts text, creates script, provides instructions
 */
async function prepareManualVideoGeneration(
  lesson: any,
  options: VideoGenerationOptions
): Promise<VideoGenerationResult> {
  // Extract and clean text
  const cleanText = extractTextFromHTML(lesson.content);
  if (cleanText.length < 100) {
    return { success: false, error: 'Lesson content too short (minimum 100 characters required)' };
  }
  
  // Generate video script
  const script = await generateVideoScript(cleanText, lesson.title);
  
  // Create structured content for video tools
  const videoContent = {
    title: lesson.title,
    script: script,
    keyPoints: extractKeyPoints(cleanText),
    estimatedDuration: Math.ceil(cleanText.length / 200), // ~200 words per minute
    wordCount: cleanText.split(/\s+/).length
  };
  
  // Return instructions instead of generating video
  return {
    success: false,
    error: 'Manual video generation - use the provided content to create video',
    warnings: [
      `Content prepared: ${videoContent.wordCount} words, ~${videoContent.estimatedDuration} minutes`,
      'Copy the script below and use it with Pictory.ai, InVideo, or other free video tools',
      'Once video is created, upload to YouTube and add the URL to this lesson'
    ]
  };
}

/**
 * Extract key points from text for video structure
 */
function extractKeyPoints(text: string): string[] {
  // Simple extraction: find sentences with important keywords or numbered lists
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const keyPoints: string[] = [];
  
  // Look for numbered/bulleted items
  const listItems = text.match(/^[\s]*[•\-\*]\s+([^\n]+)/gm) || 
                    text.match(/^[\s]*\d+[\.\)]\s+([^\n]+)/gm);
  
  if (listItems && listItems.length > 0) {
    listItems.forEach(item => {
      const clean = item.replace(/^[\s]*[•\-\*\d\.\)]\s+/, '').trim();
      if (clean.length > 20 && clean.length < 200) {
        keyPoints.push(clean);
      }
    });
  }
  
  // If no list items, extract important sentences
  if (keyPoints.length === 0) {
    sentences
      .filter(s => s.length > 50 && s.length < 200)
      .slice(0, 5)
      .forEach(s => keyPoints.push(s.trim()));
  }
  
  return keyPoints.slice(0, 10); // Max 10 key points
}

/**
 * Generate video using NoteGPT API
 * NoteGPT is excellent for educational content, especially math and structured topics
 */
async function generateVideoWithNoteGPT(
  lesson: any,
  options: VideoGenerationOptions
): Promise<VideoGenerationResult> {
  const NOTEGPT_API_KEY = process.env.NOTEGPT_API_KEY;
  const NOTEGPT_API_URL = process.env.NOTEGPT_API_URL || 'https://api.notegpt.io/v1';
  
  if (!NOTEGPT_API_KEY) {
    return {
      success: false,
      error: 'NoteGPT API key not configured. Set NOTEGPT_API_KEY environment variable. Sign up at https://notegpt.io'
    };
  }
  
  // Extract and clean text
  const cleanText = extractTextFromHTML(lesson.content);
  if (cleanText.length < 100) {
    return { success: false, error: 'Lesson content too short (minimum 100 characters required)' };
  }
  
  // Validate text length (NoteGPT may have limits)
  const MAX_TEXT_LENGTH = 50000; // Adjust based on NoteGPT's limits
  if (cleanText.length > MAX_TEXT_LENGTH) {
    return {
      success: false,
      error: `Lesson content too long (${cleanText.length} characters, max ${MAX_TEXT_LENGTH}). Please split into smaller sections.`
    };
  }
  
  try {
    // NoteGPT API call with timeout and retry logic
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout
    
    try {
      const response = await fetch(`${NOTEGPT_API_URL}/videos/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${NOTEGPT_API_KEY}`,
          'User-Agent': 'FoundationCE/1.0'
        },
        body: JSON.stringify({
          text: cleanText.substring(0, MAX_TEXT_LENGTH),
          title: lesson.title.substring(0, 200), // Limit title length
          style: options.videoStyle || 'explainer',
          language: options.language || 'en-US',
          includeSubtitles: options.includeSubtitles !== false,
          videoType: 'educational',
          duration: 'auto',
          voice: 'professional'
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        
        console.error('NoteGPT API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage
        });
        
        return {
          success: false,
          error: `NoteGPT API error (${response.status}): ${errorMessage}`
        };
      }
      
      const result = await response.json();
      
      // NoteGPT may return:
      // 1. Direct video URL (if they host)
      // 2. Video file to download
      // 3. YouTube upload link
      
      let videoUrl: string;
      let youtubeVideoId: string | undefined;
      
      // Handle different response formats from NoteGPT
      if (result.videoUrl) {
        // Direct video URL from NoteGPT (they host it)
        videoUrl = result.videoUrl;
        console.log('[Video Generation] NoteGPT returned direct video URL');
      } else if (result.youtubeVideoId) {
        // NoteGPT already uploaded to YouTube
        youtubeVideoId = result.youtubeVideoId;
        videoUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;
        console.log('[Video Generation] NoteGPT returned YouTube video ID');
      } else if (result.videoFileUrl) {
        // NoteGPT provides a file to download
        // Try to upload to YouTube if credentials are available
        const hasYouTubeCreds = process.env.YOUTUBE_CLIENT_ID && 
                                process.env.YOUTUBE_CLIENT_SECRET && 
                                process.env.YOUTUBE_REFRESH_TOKEN;
        
        if (hasYouTubeCreds) {
          // Download and upload to YouTube
          console.log('[Video Generation] Downloading video file and uploading to YouTube...');
          const videoResponse = await fetch(result.videoFileUrl);
          const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
          
          const youtubeResult = await uploadToYouTube({
            videoBuffer,
            title: lesson.title,
            description: `Explainer video for: ${lesson.title}`,
            tags: ['education', 'course', 'lesson', 'notegpt'],
            privacy: 'unlisted'
          });
          
          if (!youtubeResult.success) {
            return {
              success: false,
              error: youtubeResult.error || 'Failed to upload to YouTube. You can manually upload the video file.',
              warnings: [`Video file available at: ${result.videoFileUrl}`]
            };
          }
          
          youtubeVideoId = youtubeResult.videoId;
          videoUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;
        } else {
          // No YouTube credentials - return the file URL for manual upload
          return {
            success: false,
            error: 'NoteGPT returned a video file, but YouTube API is not configured. Please either: 1) Set up YouTube API credentials, or 2) Manually download and upload the video.',
            warnings: [
              `Video file URL: ${result.videoFileUrl}`,
              'You can download this file and upload it to YouTube manually, then add the YouTube URL to the lesson.'
            ]
          };
        }
      } else {
        return {
          success: false,
          error: 'NoteGPT did not return a video URL, YouTube ID, or file URL. Please check NoteGPT API response format.',
          warnings: ['Check NoteGPT API documentation for response format']
        };
      }
      
      // Update lesson with video URL
      await db.update(lessons)
        .set({ videoUrl })
        .where(eq(lessons.id, options.lessonId));
      
      return {
        success: true,
        videoUrl,
        youtubeVideoId,
        duration: result.duration
      };
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'NoteGPT API request timed out (5 minutes). The video may be too long or the service may be busy.'
        };
      }
      
      console.error('NoteGPT generation error:', error);
      return {
        success: false,
        error: `NoteGPT generation failed: ${error.message || 'Unknown error'}`
      };
    }
  } catch (error: any) {
    console.error('NoteGPT generation outer error:', error);
    return {
      success: false,
      error: `NoteGPT generation failed: ${error.message || 'Unknown error'}`
    };
  }
}

/**
 * Generate video using Pictory API
 * Pictory offers free tier: 3 videos/month
 * Sign up at https://pictory.ai
 */
async function generateVideoWithPictory(
  lesson: any,
  options: VideoGenerationOptions
): Promise<VideoGenerationResult> {
  const PICTORY_API_KEY = process.env.PICTORY_API_KEY;
  const PICTORY_API_URL = process.env.PICTORY_API_URL || 'https://api.pictory.ai/v1';
  
  if (!PICTORY_API_KEY) {
    return {
      success: false,
      error: 'Pictory API key not configured. Set PICTORY_API_KEY environment variable. Sign up at https://pictory.ai (free tier: 3 videos/month)'
    };
  }
  
  // Extract and clean text
  const cleanText = extractTextFromHTML(lesson.content);
  if (cleanText.length < 100) {
    return { success: false, error: 'Lesson content too short (minimum 100 characters required)' };
  }
  
  const MAX_TEXT_LENGTH = 50000;
  if (cleanText.length > MAX_TEXT_LENGTH) {
    return {
      success: false,
      error: `Lesson content too long (${cleanText.length} characters, max ${MAX_TEXT_LENGTH}). Please split into smaller sections.`
    };
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout
    
    try {
      // Pictory API call
      const response = await fetch(`${PICTORY_API_URL}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PICTORY_API_KEY}`,
          'User-Agent': 'FoundationCE/1.0'
        },
        body: JSON.stringify({
          script: cleanText.substring(0, MAX_TEXT_LENGTH),
          title: lesson.title.substring(0, 200),
          style: options.videoStyle || 'explainer',
          includeSubtitles: options.includeSubtitles !== false
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        
        console.error('Pictory API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage
        });
        
        return {
          success: false,
          error: `Pictory API error (${response.status}): ${errorMessage}`
        };
      }
      
      const result = await response.json();
      
      // Pictory may return video URL, YouTube ID, or file URL
      let videoUrl: string;
      let youtubeVideoId: string | undefined;
      
      if (result.videoUrl) {
        videoUrl = result.videoUrl;
      } else if (result.youtubeVideoId) {
        youtubeVideoId = result.youtubeVideoId;
        videoUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;
      } else if (result.videoFileUrl) {
        // Handle file download and YouTube upload if credentials available
        const hasYouTubeCreds = process.env.YOUTUBE_CLIENT_ID && 
                                process.env.YOUTUBE_CLIENT_SECRET && 
                                process.env.YOUTUBE_REFRESH_TOKEN;
        
        if (hasYouTubeCreds) {
          const videoResponse = await fetch(result.videoFileUrl);
          const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
          
          const youtubeResult = await uploadToYouTube({
            videoBuffer,
            title: lesson.title,
            description: `Explainer video for: ${lesson.title}`,
            tags: ['education', 'course', 'lesson', 'pictory'],
            privacy: 'unlisted'
          });
          
          if (!youtubeResult.success) {
            return {
              success: false,
              error: youtubeResult.error || 'Failed to upload to YouTube',
              warnings: [`Video file available at: ${result.videoFileUrl}`]
            };
          }
          
          youtubeVideoId = youtubeResult.videoId;
          videoUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;
        } else {
          return {
            success: false,
            error: 'Pictory returned a video file, but YouTube API is not configured. Please either: 1) Set up YouTube API credentials, or 2) Manually download and upload the video.',
            warnings: [
              `Video file URL: ${result.videoFileUrl}`,
              'You can download this file and upload it to YouTube manually, then add the YouTube URL to the lesson.'
            ]
          };
        }
      } else {
        return {
          success: false,
          error: 'Pictory did not return a video URL, YouTube ID, or file URL. Please check Pictory API documentation.'
        };
      }
      
      // Update lesson with video URL
      await db.update(lessons)
        .set({ videoUrl })
        .where(eq(lessons.id, options.lessonId));
      
      return {
        success: true,
        videoUrl,
        youtubeVideoId,
        duration: result.duration
      };
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Pictory API request timed out (5 minutes). The video may be too long or the service may be busy.'
        };
      }
      
      console.error('Pictory generation error:', error);
      return {
        success: false,
        error: `Pictory generation failed: ${error.message || 'Unknown error'}`
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Pictory generation failed: ${error.message || 'Unknown error'}`
    };
  }
}

/**
 * Generate video using TTS + Slides (original method)
 */
async function generateVideoWithTTSSlides(
  lesson: any,
  options: VideoGenerationOptions
): Promise<VideoGenerationResult> {
  // Extract and clean text
  const cleanText = extractTextFromHTML(lesson.content);
  if (cleanText.length < 100) {
    return { success: false, error: 'Lesson content too short' };
  }
  
  // Generate video script
  const script = await generateVideoScript(cleanText, lesson.title);
  
  // Create slides from script
  const slides = await createSlidesFromScript(script, lesson.title);
  
  // Generate TTS audio
  const audioBuffer = await generateTTSAudio(
    script,
    options.useElevenLabs || false,
    options.voiceId,
    options.language || 'en-US'
  );
  
  // Assemble video
  const videoBuffer = await assembleVideo(slides, audioBuffer, {
    includeSubtitles: options.includeSubtitles !== false,
    style: options.videoStyle || 'slides'
  });
  
  // Upload to YouTube
  const youtubeResult = await uploadToYouTube({
    videoBuffer,
    title: lesson.title,
    description: `Explainer video for: ${lesson.title}`,
    tags: ['education', 'course', 'lesson'],
    privacy: 'unlisted'
  });
  
  if (!youtubeResult.success || !youtubeResult.videoId) {
    return {
      success: false,
      error: youtubeResult.error || 'Failed to upload to YouTube'
    };
  }
  
  // Update lesson with video URL
  const videoUrl = `https://www.youtube.com/watch?v=${youtubeResult.videoId}`;
  await db.update(lessons)
    .set({ videoUrl })
    .where(eq(lessons.id, options.lessonId));
  
  return {
    success: true,
    videoUrl,
    youtubeVideoId: youtubeResult.videoId,
    duration: youtubeResult.duration
  };
}

/**
 * Extract plain text from HTML content
 */
function extractTextFromHTML(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate video script from lesson text
 * Can use AI to enhance and structure the script
 */
async function generateVideoScript(text: string, title: string): Promise<string> {
  // For now, return cleaned text
  // In production, you could use OpenAI/Claude to:
  // - Break into logical sections
  // - Add transitions
  // - Optimize for spoken delivery
  
  // Simple script generation: break into paragraphs
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50);
  
  // Add intro and outro
  const intro = `Welcome to this lesson on ${title}. Let's get started.`;
  const outro = `That concludes our lesson on ${title}. Thanks for watching!`;
  
  return [intro, ...paragraphs, outro].join('\n\n');
}

/**
 * Create slides from script
 * Returns array of slide objects with text and optional images
 */
async function createSlidesFromScript(script: string, title: string): Promise<Slide[]> {
  // Break script into slide-sized chunks (2-3 sentences per slide)
  const sentences = script.match(/[^.!?]+[.!?]+/g) || [];
  const slides: Slide[] = [];
  
  // Title slide
  slides.push({
    text: title,
    type: 'title',
    duration: 3
  });
  
  // Content slides (2-3 sentences each)
  for (let i = 0; i < sentences.length; i += 2) {
    const slideText = sentences.slice(i, i + 2).join(' ');
    if (slideText.trim().length > 20) {
      slides.push({
        text: slideText.trim(),
        type: 'content',
        duration: Math.max(5, slideText.length / 15) // ~15 chars per second
      });
    }
  }
  
  return slides;
}

interface Slide {
  text: string;
  type: 'title' | 'content';
  duration: number; // seconds
  imageUrl?: string;
}

/**
 * Generate TTS audio from script
 */
async function generateTTSAudio(
  script: string,
  useElevenLabs: boolean,
  voiceId?: string,
  language: string = 'en-US'
): Promise<Buffer> {
  if (useElevenLabs) {
    return await generateElevenLabsAudio(script, voiceId);
  } else {
    return await generateGoogleTTSAudio(script, language);
  }
}

/**
 * Generate audio using ElevenLabs (best quality, limited free tier)
 */
async function generateElevenLabsAudio(text: string, voiceId?: string): Promise<Buffer> {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const ELEVENLABS_VOICE_ID = voiceId || process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Default voice
  
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured. Set ELEVENLABS_API_KEY environment variable.');
  }
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY
    },
    body: JSON.stringify({
      text: text.substring(0, 5000), // ElevenLabs free tier limit
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs TTS failed: ${error}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate audio using Google Cloud TTS (more volume, good quality)
 */
async function generateGoogleTTSAudio(text: string, language: string = 'en-US'): Promise<Buffer> {
  // Note: Requires Google Cloud TTS API setup
  // Free tier: 0-4 million characters/month
  
  const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY;
  
  if (!GOOGLE_TTS_API_KEY) {
    // Fallback: Use Web Speech API (browser-based, not ideal for server)
    throw new Error('Google TTS API key not configured. Set GOOGLE_TTS_API_KEY environment variable.');
  }
  
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: language,
        name: `${language}-Standard-D`, // High-quality voice
        ssmlGender: 'NEUTRAL'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0
      }
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google TTS failed: ${error}`);
  }
  
  const data = await response.json();
  return Buffer.from(data.audioContent, 'base64');
}

/**
 * Assemble video from slides and audio
 * Uses FFmpeg to combine images and audio
 */
async function assembleVideo(
  slides: Slide[],
  audioBuffer: Buffer,
  options: { includeSubtitles?: boolean; style?: string }
): Promise<Buffer> {
  // This requires FFmpeg to be installed on the server
  // For now, return a placeholder
  
  // In production, you would:
  // 1. Create image files from slides (using canvas or image generation)
  // 2. Use FFmpeg to combine images + audio
  // 3. Add subtitles if requested
  // 4. Export as MP4
  
  // Example FFmpeg command:
  // ffmpeg -i audio.mp3 -loop 1 -i slide1.png -t 5 -pix_fmt yuv420p -shortest output.mp4
  
  throw new Error('Video assembly not fully implemented. Requires FFmpeg and image generation.');
}

/**
 * Upload video to YouTube
 */
async function uploadToYouTube(options: {
  videoBuffer: Buffer;
  title: string;
  description: string;
  tags: string[];
  privacy: 'public' | 'unlisted' | 'private';
}): Promise<{ success: boolean; videoId?: string; duration?: number; error?: string }> {
  // Requires YouTube Data API v3
  // Setup: https://developers.google.com/youtube/v3/guides/uploading_a_video
  
  const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
  const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
  const YOUTUBE_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN;
  
  if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET || !YOUTUBE_REFRESH_TOKEN) {
    return {
      success: false,
      error: 'YouTube API credentials not configured. See VIDEO_GENERATION_STRATEGY.md for setup instructions.'
    };
  }
  
  // Get access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: YOUTUBE_CLIENT_ID,
      client_secret: YOUTUBE_CLIENT_SECRET,
      refresh_token: YOUTUBE_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    })
  });
  
  if (!tokenResponse.ok) {
    return { success: false, error: 'Failed to get YouTube access token' };
  }
  
  const { access_token } = await tokenResponse.json();
  
  // Upload video using resumable upload
  // This is a simplified version - full implementation would handle resumable uploads
  const metadata = {
    snippet: {
      title: options.title,
      description: options.description,
      tags: options.tags,
      categoryId: '27' // Education category
    },
    status: {
      privacyStatus: options.privacy,
      selfDeclaredMadeForKids: false
    }
  };
  
  // Step 1: Initialize upload
  const initResponse = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
      'X-Upload-Content-Type': 'video/*',
      'X-Upload-Content-Length': options.videoBuffer.length.toString()
    },
    body: JSON.stringify(metadata)
  });
  
  if (!initResponse.ok) {
    const error = await initResponse.text();
    return { success: false, error: `YouTube upload init failed: ${error}` };
  }
  
  const uploadUrl = initResponse.headers.get('Location');
  if (!uploadUrl) {
    return { success: false, error: 'No upload URL received from YouTube' };
  }
  
  // Step 2: Upload video data
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'video/*',
      'Content-Length': options.videoBuffer.length.toString()
    },
    body: options.videoBuffer
  });
  
  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    return { success: false, error: `YouTube upload failed: ${error}` };
  }
  
  const videoData = await uploadResponse.json();
  
  return {
    success: true,
    videoId: videoData.id,
    duration: videoData.contentDetails?.duration ? parseDuration(videoData.contentDetails.duration) : undefined
  };
}

function parseDuration(duration: string): number {
  // Parse ISO 8601 duration (e.g., "PT1M30S" = 90 seconds)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Batch generate videos for multiple lessons
 */
export async function batchGenerateVideos(
  lessonIds: string[],
  options?: Omit<VideoGenerationOptions, 'lessonId'>
): Promise<VideoGenerationResult[]> {
  const results: VideoGenerationResult[] = [];
  
  for (const lessonId of lessonIds) {
    try {
      const result = await generateVideoFromLesson({
        ...options,
        lessonId
      });
      results.push(result);
      
      // Rate limiting: wait between requests to avoid hitting API limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error: any) {
      results.push({
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

