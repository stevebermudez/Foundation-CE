/**
 * Format Course Lessons - Applies HTML formatting to all lessons in a course
 * 
 * This script reads all lessons for a specified course and reformats their
 * plain text content into nicely structured HTML.
 * 
 * Usage:
 *   tsx server/formatCourseLessons.ts [courseSKU]
 * 
 * If no SKU is provided, it will format FREC II course by default.
 */

import { db } from './db';
import { courses, units, lessons } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { formatTextToHTMLEnhanced } from './formatLessonContent';

const DEFAULT_COURSE_SKU = 'FL-RE-PL-BROKER-72'; // FREC II

async function formatCourseLessons(courseSKU?: string) {
  const sku = courseSKU || DEFAULT_COURSE_SKU;
  
  console.log(`\n🔄 Formatting lesson content for course: ${sku}\n`);
  
  try {
    // Find the course
    const courseResults = await db.select().from(courses).where(eq(courses.sku, sku)).limit(1);
    
    if (courseResults.length === 0) {
      console.error(`❌ Course not found: ${sku}`);
      process.exit(1);
    }
    
    const course = courseResults[0];
    console.log(`✓ Found course: ${course.title}`);
    
    // Get all units for this course
    const courseUnits = await db.select().from(units)
      .where(eq(units.courseId, course.id))
      .orderBy(units.unitNumber);
    
    console.log(`✓ Found ${courseUnits.length} units\n`);
    
    let totalUpdated = 0;
    let totalSkipped = 0;
    
    for (const unit of courseUnits) {
      const unitLessons = await db.select().from(lessons)
        .where(eq(lessons.unitId, unit.id))
        .orderBy(lessons.lessonNumber);
      
      for (const lesson of unitLessons) {
        if (!lesson.content || lesson.content.trim().length === 0) {
          console.log(`⚠️  Unit ${unit.unitNumber}, Lesson ${lesson.lessonNumber}: No content to format`);
          totalSkipped++;
          continue;
        }
        
        // Check if content is already formatted HTML
        const hasHTML = lesson.content.includes('<') && lesson.content.includes('>');
        const isWellFormatted = hasHTML && (
          lesson.content.includes('<h') || 
          lesson.content.includes('<p>') || 
          lesson.content.includes('<ul>') ||
          lesson.content.includes('<ol>')
        );
        
        if (isWellFormatted) {
          console.log(`⏭️  Unit ${unit.unitNumber}, Lesson ${lesson.lessonNumber}: Already formatted`);
          totalSkipped++;
          continue;
        }
        
        // Format the content
        const formattedContent = formatTextToHTMLEnhanced(lesson.content);
        
        // Only update if formatting actually changed something
        if (formattedContent !== lesson.content && formattedContent.length > 0) {
          await db.update(lessons)
            .set({ content: formattedContent })
            .where(eq(lessons.id, lesson.id));
          
          console.log(`✅ Unit ${unit.unitNumber}, Lesson ${lesson.lessonNumber}: ${lesson.title}`);
          totalUpdated++;
        } else {
          console.log(`⚠️  Unit ${unit.unitNumber}, Lesson ${lesson.lessonNumber}: No changes needed`);
          totalSkipped++;
        }
      }
    }
    
    console.log(`\n🎉 Formatting complete!`);
    console.log(`   Updated: ${totalUpdated} lessons`);
    console.log(`   Skipped: ${totalSkipped} lessons\n`);
    
  } catch (error) {
    console.error('❌ Error formatting course lessons:', error);
    throw error;
  }
}

// Run if executed directly (works with both CommonJS and ES modules)
const isMainModule = 
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('formatCourseLessons.ts') ||
  process.argv[1]?.endsWith('formatCourseLessons.js') ||
  process.argv[1]?.includes('formatCourseLessons');

if (isMainModule) {
  const courseSKU = process.argv[2];
  formatCourseLessons(courseSKU)
    .then(() => {
      console.log('✅ Completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed:', error);
      process.exit(1);
    });
}

export { formatCourseLessons };

