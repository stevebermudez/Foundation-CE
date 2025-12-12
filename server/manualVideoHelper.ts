/**
 * Manual Video Generation Helper
 * 
 * Provides tools and content preparation for manual video creation
 * No API keys required - guides users through free video creation tools
 */

import { db } from './db';
import { lessons } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface ManualVideoContent {
  lessonId: string;
  title: string;
  script: string;
  keyPoints: string[];
  wordCount: number;
  estimatedDuration: number; // minutes
  formattedForPictory: string;
  formattedForInVideo: string;
  instructions: string[];
}

/**
 * Prepare lesson content for manual video creation
 */
export async function prepareLessonForVideo(lessonId: string): Promise<ManualVideoContent> {
  const lesson = await db.select().from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1);
  
  if (!lesson.length) {
    throw new Error('Lesson not found');
  }
  
  const lessonData = lesson[0];
  if (!lessonData.content) {
    throw new Error('Lesson has no content');
  }
  
  // Extract and clean text
  const cleanText = extractTextFromHTML(lessonData.content);
  
  // Generate script
  const script = generateVideoScript(cleanText, lessonData.title);
  
  // Extract key points
  const keyPoints = extractKeyPoints(cleanText);
  
  // Format for different tools
  const formattedForPictory = formatForPictory(script, lessonData.title, keyPoints);
  const formattedForInVideo = formatForInVideo(script, lessonData.title, keyPoints);
  
  // Generate instructions
  const instructions = generateInstructions(lessonData.title, cleanText.length);
  
  return {
    lessonId,
    title: lessonData.title,
    script,
    keyPoints,
    wordCount: cleanText.split(/\s+/).length,
    estimatedDuration: Math.ceil(cleanText.length / 200), // ~200 chars per minute
    formattedForPictory,
    formattedForInVideo,
    instructions
  };
}

/**
 * Extract plain text from HTML
 */
function extractTextFromHTML(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
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
 * Generate video script from text
 */
function generateVideoScript(text: string, title: string): string {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50);
  
  const intro = `Welcome to this lesson on ${title}. Let's get started.`;
  const outro = `That concludes our lesson on ${title}. Thanks for watching!`;
  
  return [intro, ...paragraphs, outro].join('\n\n');
}

/**
 * Extract key points from text
 */
function extractKeyPoints(text: string): string[] {
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
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    sentences
      .filter(s => s.length > 50 && s.length < 200)
      .slice(0, 5)
      .forEach(s => keyPoints.push(s.trim()));
  }
  
  return keyPoints.slice(0, 10);
}

/**
 * Format content for Pictory.ai
 */
function formatForPictory(script: string, title: string, keyPoints: string[]): string {
  let formatted = `# ${title}\n\n`;
  formatted += `## Video Script\n\n${script}\n\n`;
  
  if (keyPoints.length > 0) {
    formatted += `## Key Points\n\n`;
    keyPoints.forEach((point, i) => {
      formatted += `${i + 1}. ${point}\n`;
    });
  }
  
  return formatted;
}

/**
 * Format content for InVideo
 */
function formatForInVideo(script: string, title: string, keyPoints: string[]): string {
  let formatted = `Title: ${title}\n\n`;
  formatted += `Script:\n${script}\n\n`;
  
  if (keyPoints.length > 0) {
    formatted += `Scene Breakdown:\n`;
    keyPoints.forEach((point, i) => {
      formatted += `Scene ${i + 1}: ${point}\n`;
    });
  }
  
  return formatted;
}

/**
 * Generate step-by-step instructions
 */
function generateInstructions(title: string, contentLength: number): string[] {
  const estimatedTime = Math.ceil(contentLength / 200);
  
  return [
    `Lesson: ${title}`,
    `Estimated video length: ${estimatedTime} minutes`,
    '',
    'Step 1: Choose a free video tool',
    '  • Pictory.ai (free: 3 videos/month) - https://pictory.ai',
    '  • InVideo AI (free: 4 videos/month) - https://invideo.io',
    '  • Loom (free: 25 videos/month) - https://loom.com',
    '',
    'Step 2: Copy the script below',
    '  • Use the formatted script provided',
    '  • Paste into your chosen video tool',
    '',
    'Step 3: Generate video',
    '  • Follow the tool\'s instructions',
    '  • Wait for video to be created',
    '',
    'Step 4: Upload to YouTube',
    '  • Download the generated video',
    '  • Upload to YouTube (unlisted)',
    '  • Copy the YouTube URL',
    '',
    'Step 5: Add to lesson',
    '  • Go to lesson in admin panel',
    '  • Paste YouTube URL into videoUrl field',
    '  • Save lesson'
  ];
}

/**
 * Batch prepare multiple lessons for manual video creation
 */
export async function batchPrepareLessons(lessonIds: string[]): Promise<ManualVideoContent[]> {
  const results: ManualVideoContent[] = [];
  
  for (const lessonId of lessonIds) {
    try {
      const content = await prepareLessonForVideo(lessonId);
      results.push(content);
    } catch (error: any) {
      console.error(`Failed to prepare lesson ${lessonId}:`, error.message);
    }
  }
  
  return results;
}

