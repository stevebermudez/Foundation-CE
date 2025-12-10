/**
 * Import Course Catalog from JSON Snapshot
 * 
 * Imports all course content from catalogSnapshot.json into the database.
 * This is called by the admin sync endpoint and runs in production.
 * 
 * IDEMPOTENT - safe to run multiple times using upserts.
 */

import { db } from './db';
import { 
  courses, 
  units, 
  lessons,
  questionBanks,
  bankQuestions,
  practiceExams,
  examQuestions,
  courseBundles,
  bundleCourses
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

// Resolve snapshot path - works in both development and production
function getSnapshotPath(): string {
  // Try multiple locations to find the snapshot file
  const possiblePaths = [
    path.resolve(process.cwd(), 'server', 'catalogSnapshot.json'),  // Source location
    path.resolve(process.cwd(), 'dist', 'server', 'catalogSnapshot.json'),  // Dist location
    path.resolve(process.cwd(), 'catalogSnapshot.json'),  // Root location
  ];
  
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  
  // Return first option for error messaging
  return possiblePaths[0];
}

interface CatalogSnapshot {
  version: string;
  exportedAt: string;
  courses: any[];
  units: any[];
  lessons: any[];
  questionBanks: any[];
  bankQuestions: any[];
  practiceExams: any[];
  examQuestions: any[];
  bundles: any[];
  bundleCourses: any[];
}

// Convert ISO timestamp strings back to Date objects
function parseTimestamps(obj: any): any {
  if (!obj) return obj;
  const timestampFields = ['createdAt', 'updatedAt', 'startedAt', 'completedAt', 'answeredAt'];
  const result = { ...obj };
  for (const field of timestampFields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = new Date(result[field]);
    }
  }
  return result;
}

export async function importCourseCatalog(): Promise<{
  success: boolean;
  coursesImported: number;
  unitsImported: number;
  lessonsImported: number;
  questionBanksImported: number;
  bankQuestionsImported: number;
  practiceExamsImported: number;
  examQuestionsImported: number;
  bundlesImported: number;
  error?: string;
}> {
  try {
    console.log('📥 Importing Course Catalog from snapshot...\n');
    
    // Load snapshot
    const snapshotPath = getSnapshotPath();
    console.log(`📂 Looking for snapshot at: ${snapshotPath}`);
    
    if (!fs.existsSync(snapshotPath)) {
      throw new Error(`catalogSnapshot.json not found at ${snapshotPath}. Ensure the file exists in the server directory.`);
    }
    
    const snapshot: CatalogSnapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
    console.log(`📦 Snapshot version: ${snapshot.version}`);
    console.log(`📅 Exported at: ${snapshot.exportedAt}\n`);
    
    // Import courses
    console.log('📚 Importing courses...');
    for (const rawCourse of snapshot.courses) {
      const course = parseTimestamps(rawCourse);
      const existing = await db.select().from(courses).where(eq(courses.id, course.id));
      if (existing.length > 0) {
        await db.update(courses).set(course).where(eq(courses.id, course.id));
      } else {
        await db.insert(courses).values(course);
      }
    }
    console.log(`  ✓ ${snapshot.courses.length} courses`);
    
    // Import units
    console.log('📖 Importing units...');
    for (const rawUnit of snapshot.units) {
      const unit = parseTimestamps(rawUnit);
      const existing = await db.select().from(units).where(eq(units.id, unit.id));
      if (existing.length > 0) {
        await db.update(units).set(unit).where(eq(units.id, unit.id));
      } else {
        await db.insert(units).values(unit);
      }
    }
    console.log(`  ✓ ${snapshot.units.length} units`);
    
    // Import lessons
    console.log('📝 Importing lessons...');
    for (const rawLesson of snapshot.lessons) {
      const lesson = parseTimestamps(rawLesson);
      const existing = await db.select().from(lessons).where(eq(lessons.id, lesson.id));
      if (existing.length > 0) {
        await db.update(lessons).set(lesson).where(eq(lessons.id, lesson.id));
      } else {
        await db.insert(lessons).values(lesson);
      }
    }
    console.log(`  ✓ ${snapshot.lessons.length} lessons`);
    
    // Import question banks
    console.log('❓ Importing question banks...');
    for (const rawBank of snapshot.questionBanks) {
      const bank = parseTimestamps(rawBank);
      const existing = await db.select().from(questionBanks).where(eq(questionBanks.id, bank.id));
      if (existing.length > 0) {
        await db.update(questionBanks).set(bank).where(eq(questionBanks.id, bank.id));
      } else {
        await db.insert(questionBanks).values(bank);
      }
    }
    console.log(`  ✓ ${snapshot.questionBanks.length} question banks`);
    
    // Import bank questions
    console.log('📋 Importing bank questions...');
    for (const rawQuestion of snapshot.bankQuestions) {
      const question = parseTimestamps(rawQuestion);
      const existing = await db.select().from(bankQuestions).where(eq(bankQuestions.id, question.id));
      if (existing.length > 0) {
        await db.update(bankQuestions).set(question).where(eq(bankQuestions.id, question.id));
      } else {
        await db.insert(bankQuestions).values(question);
      }
    }
    console.log(`  ✓ ${snapshot.bankQuestions.length} bank questions`);
    
    // Import practice exams
    console.log('📝 Importing practice exams...');
    for (const rawExam of snapshot.practiceExams) {
      const exam = parseTimestamps(rawExam);
      const existing = await db.select().from(practiceExams).where(eq(practiceExams.id, exam.id));
      if (existing.length > 0) {
        await db.update(practiceExams).set(exam).where(eq(practiceExams.id, exam.id));
      } else {
        await db.insert(practiceExams).values(exam);
      }
    }
    console.log(`  ✓ ${snapshot.practiceExams.length} practice exams`);
    
    // Import exam questions
    console.log('📋 Importing exam questions...');
    for (const rawQuestion of snapshot.examQuestions) {
      const question = parseTimestamps(rawQuestion);
      const existing = await db.select().from(examQuestions).where(eq(examQuestions.id, question.id));
      if (existing.length > 0) {
        await db.update(examQuestions).set(question).where(eq(examQuestions.id, question.id));
      } else {
        await db.insert(examQuestions).values(question);
      }
    }
    console.log(`  ✓ ${snapshot.examQuestions.length} exam questions`);
    
    // Import bundles
    console.log('📦 Importing bundles...');
    for (const rawBundle of snapshot.bundles) {
      const bundle = parseTimestamps(rawBundle);
      const existing = await db.select().from(courseBundles).where(eq(courseBundles.id, bundle.id));
      if (existing.length > 0) {
        await db.update(courseBundles).set(bundle).where(eq(courseBundles.id, bundle.id));
      } else {
        await db.insert(courseBundles).values(bundle);
      }
    }
    console.log(`  ✓ ${snapshot.bundles.length} bundles`);
    
    // Import bundle courses
    console.log('🔗 Importing bundle courses...');
    for (const bc of snapshot.bundleCourses) {
      const existing = await db.select().from(bundleCourses)
        .where(and(
          eq(bundleCourses.bundleId, bc.bundleId),
          eq(bundleCourses.courseId, bc.courseId)
        ));
      if (existing.length === 0) {
        await db.insert(bundleCourses).values(bc);
      }
    }
    console.log(`  ✓ ${snapshot.bundleCourses.length} bundle courses`);
    
    console.log('\n✅ Import complete!');
    
    return {
      success: true,
      coursesImported: snapshot.courses.length,
      unitsImported: snapshot.units.length,
      lessonsImported: snapshot.lessons.length,
      questionBanksImported: snapshot.questionBanks.length,
      bankQuestionsImported: snapshot.bankQuestions.length,
      practiceExamsImported: snapshot.practiceExams.length,
      examQuestionsImported: snapshot.examQuestions.length,
      bundlesImported: snapshot.bundles.length
    };
  } catch (err: any) {
    console.error('Import failed:', err);
    return {
      success: false,
      coursesImported: 0,
      unitsImported: 0,
      lessonsImported: 0,
      questionBanksImported: 0,
      bankQuestionsImported: 0,
      practiceExamsImported: 0,
      examQuestionsImported: 0,
      bundlesImported: 0,
      error: err.message
    };
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  importCourseCatalog()
    .then((result) => {
      if (result.success) {
        console.log('\nSummary:');
        console.log(`  - ${result.coursesImported} courses`);
        console.log(`  - ${result.unitsImported} units`);
        console.log(`  - ${result.lessonsImported} lessons`);
        console.log(`  - ${result.questionBanksImported} question banks`);
        console.log(`  - ${result.bankQuestionsImported} bank questions`);
        console.log(`  - ${result.practiceExamsImported} practice exams`);
        console.log(`  - ${result.examQuestionsImported} exam questions`);
        console.log(`  - ${result.bundlesImported} bundles`);
        process.exit(0);
      } else {
        console.error('Import failed:', result.error);
        process.exit(1);
      }
    });
}
