# Format Course Lesson Content

This utility automatically formats plain text lesson content into nicely structured HTML with proper headings, paragraphs, lists, and emphasis.

## Problem

When course content was imported from Replit, all formatting was stripped out, leaving plain text blocks. This tool reformats that content into proper HTML structure.

## Solution

The formatting utility:
- Detects headings (all caps, lines ending with colons, etc.)
- Converts bulleted and numbered lists
- Creates proper paragraphs
- Adds emphasis for bold text patterns
- Structures content with proper HTML tags

## Usage

### Option 1: Command Line Script

Format all lessons for the default course (FREC II):
```bash
npm run format:lessons
```

Format lessons for a specific course by SKU:
```bash
tsx server/formatCourseLessons.ts FL-RE-PL-BROKER-72
```

### Option 2: API Endpoint (Admin Only)

You can also format lessons via the admin API:

```bash
POST /api/admin/courses/:courseId/format-lessons
```

Example using curl:
```bash
curl -X POST http://localhost:5000/api/admin/courses/YOUR_COURSE_ID/format-lessons \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## What It Does

1. **Reads all lessons** for the specified course
2. **Checks if content is already formatted** (skips if HTML is already present)
3. **Formats plain text** into structured HTML:
   - Headings (h2, h3) from all-caps lines or lines ending with colons
   - Paragraphs from regular text
   - Lists (ul, ol) from bulleted or numbered items
   - Bold text from patterns like **text** or ALL CAPS phrases
4. **Updates the database** with formatted content

## Example

**Before (plain text):**
```
EDUCATION AND EXPERIENCE REQUIREMENTS

Pre-License Education: The 72-Hour Broker Course
The broker pre-license course (FREC Course II) is mandatory for all broker applicants.

Course Content Requirements:
• Part I: Brokerage Business Operations (20 hours)
• Part II: Property Valuation (12 hours)
• Part III: Listing and Selling (20 hours)
```

**After (formatted HTML):**
```html
<h2>EDUCATION AND EXPERIENCE REQUIREMENTS</h2>
<p><strong>Pre-License Education: The 72-Hour Broker Course</strong></p>
<p>The broker pre-license course (FREC Course II) is mandatory for all broker applicants.</p>
<h3>Course Content Requirements:</h3>
<ul>
  <li>Part I: Brokerage Business Operations (20 hours)</li>
  <li>Part II: Property Valuation (12 hours)</li>
  <li>Part III: Listing and Selling (20 hours)</li>
</ul>
```

## Files

- `server/formatLessonContent.ts` - Core formatting functions
- `server/formatCourseLessons.ts` - Script to format all lessons in a course
- `server/routes.ts` - API endpoint for formatting (admin only)

## Notes

- The formatter is **idempotent** - safe to run multiple times
- Already formatted content is **skipped** automatically
- Only plain text content is reformatted
- The formatter preserves existing HTML if it's already well-structured

