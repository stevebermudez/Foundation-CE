/**
 * Unit Tests for Video Generation Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateVideoFromLesson, extractTextFromHTML } from '../videoGenerationService';

// Mock dependencies
vi.mock('../db', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  }
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((field, value) => ({ field, value }))
}));

describe('Video Generation Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractTextFromHTML', () => {
    it('should extract plain text from HTML', () => {
      const html = '<p>Hello <strong>world</strong>!</p>';
      const result = extractTextFromHTML(html);
      expect(result).toBe('Hello world!');
    });

    it('should handle HTML entities', () => {
      const html = '<p>Hello &amp; goodbye</p>';
      const result = extractTextFromHTML(html);
      expect(result).toBe('Hello & goodbye');
    });

    it('should handle empty HTML', () => {
      const result = extractTextFromHTML('');
      expect(result).toBe('');
    });

    it('should handle null/undefined', () => {
      expect(extractTextFromHTML(null as any)).toBe('');
      expect(extractTextFromHTML(undefined as any)).toBe('');
    });
  });

  describe('generateVideoFromLesson', () => {
    it('should return error if lesson not found', async () => {
      const { db } = await import('../db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
          })
        })
      } as any);

      const result = await generateVideoFromLesson({
        lessonId: 'non-existent',
        provider: 'notegpt'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Lesson not found');
    });

    it('should return error if lesson has no content', async () => {
      const { db } = await import('../db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'lesson-1',
              title: 'Test Lesson',
              content: null
            }])
          })
        })
      } as any);

      const result = await generateVideoFromLesson({
        lessonId: 'lesson-1',
        provider: 'notegpt'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('no content');
    });

    it('should return error if content too short', async () => {
      const { db } = await import('../db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'lesson-1',
              title: 'Test Lesson',
              content: '<p>Short</p>'
            }])
          })
        })
      } as any);

      const result = await generateVideoFromLesson({
        lessonId: 'lesson-1',
        provider: 'notegpt'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('too short');
    });

    it('should return error if NoteGPT API key not configured', async () => {
      const originalEnv = process.env.NOTEGPT_API_KEY;
      delete process.env.NOTEGPT_API_KEY;

      const { db } = await import('../db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'lesson-1',
              title: 'Test Lesson',
              content: '<p>' + 'x'.repeat(200) + '</p>'
            }])
          })
        })
      } as any);

      const result = await generateVideoFromLesson({
        lessonId: 'lesson-1',
        provider: 'notegpt'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('API key not configured');

      if (originalEnv) {
        process.env.NOTEGPT_API_KEY = originalEnv;
      }
    });
  });
});

