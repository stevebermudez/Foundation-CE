/**
 * Update FREC II Broker Pre-Licensing Course Lessons with Full Content
 * Extracts content from the attached document and updates database lessons
 */

import { db } from './db';
import { courses, units, lessons } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import mammoth from 'mammoth';
import * as fs from 'fs';
import * as path from 'path';

const FREC_II_SKU = 'FL-RE-PL-BROKER-72';
const DOCUMENT_PATH = 'attached_assets/CLAUD_FLORIDA_REAL_ESTATE_BROKER_PRE_12-8-25_1765274901520.docx';

interface SegmentContent {
  sessionNumber: number;
  segmentNumber: number;
  title: string;
  content: string;
}

async function extractDocumentContent(): Promise<string> {
  const result = await mammoth.extractRawText({ path: DOCUMENT_PATH });
  return result.value;
}

function parseSegments(text: string): SegmentContent[] {
  const segments: SegmentContent[] = [];
  
  // Find all session blocks
  const sessionMatches = text.matchAll(/SESSION (\d+):[^\n]+\n([\s\S]*?)(?=SESSION \d+:|$)/g);
  
  let sessionNum = 0;
  for (const sessionMatch of sessionMatches) {
    const sessionNumber = parseInt(sessionMatch[1]);
    const sessionContent = sessionMatch[2];
    
    // Skip if session number is duplicated (table of contents entries)
    if (sessionNumber <= sessionNum) continue;
    sessionNum = sessionNumber;
    
    // Find segments within this session
    const segmentMatches = sessionContent.matchAll(/SEGMENT (\d+): ([^\(]+)\((\d+) minutes\)\n([\s\S]*?)(?=SEGMENT \d+:|$)/g);
    
    for (const segmentMatch of segmentMatches) {
      const segmentNumber = parseInt(segmentMatch[1]);
      const title = segmentMatch[2].trim();
      const content = segmentMatch[4].trim();
      
      // Only use first 3 segments per session (matching our 3 lessons per unit)
      if (segmentNumber <= 3) {
        segments.push({
          sessionNumber,
          segmentNumber,
          title,
          content: content.substring(0, 6000), // Limit content length
        });
      }
    }
  }
  
  return segments;
}

export async function updateFRECIIContent() {
  console.log('🔄 Updating FREC II lesson content from document...\n');

  try {
    // Find the FREC II course
    const course = await db.select().from(courses).where(eq(courses.sku, FREC_II_SKU)).limit(1);
    if (!course || course.length === 0) {
      console.log('❌ FREC II course not found');
      return;
    }
    const courseId = course[0].id;
    console.log(`Found course: ${course[0].title}`);

    // Extract document content
    console.log('Extracting document content...');
    const docText = await extractDocumentContent();
    console.log(`Document length: ${docText.length} characters`);

    // Parse segments
    const segments = parseSegments(docText);
    console.log(`Parsed ${segments.length} segments\n`);

    // Get all units for this course
    const courseUnits = await db.select().from(units)
      .where(eq(units.courseId, courseId))
      .orderBy(units.unitNumber);

    let updatedCount = 0;

    for (const unit of courseUnits) {
      const unitLessons = await db.select().from(lessons)
        .where(eq(lessons.unitId, unit.id))
        .orderBy(lessons.lessonNumber);

      for (const lesson of unitLessons) {
        // Find matching segment
        const segment = segments.find(
          s => s.sessionNumber === unit.unitNumber && s.segmentNumber === lesson.lessonNumber
        );

        if (segment && segment.content.length > 100) {
          await db.update(lessons)
            .set({
              title: segment.title,
              content: segment.content,
            })
            .where(eq(lessons.id, lesson.id));

          console.log(`✅ Updated Session ${unit.unitNumber}, Lesson ${lesson.lessonNumber}: ${segment.title}`);
          updatedCount++;
        } else {
          console.log(`⚠️  No content found for Session ${unit.unitNumber}, Lesson ${lesson.lessonNumber}`);
        }
      }
    }

    console.log(`\n🎉 Updated ${updatedCount} lessons with document content`);

  } catch (error) {
    console.error('❌ Error updating FREC II content:', error);
    throw error;
  }
}

// Run if executed directly
import { fileURLToPath } from 'url';
const isMain = process.argv[1] && fileURLToPath(import.meta.url).includes(process.argv[1].replace(/\.ts$/, ''));

if (isMain) {
  updateFRECIIContent()
    .then(() => {
      console.log('\n✅ Completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed:', error);
      process.exit(1);
    });
}
