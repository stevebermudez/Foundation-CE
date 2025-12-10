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
import { eq, and, inArray, notInArray, sql } from 'drizzle-orm';
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
    console.log(`📅 Exported at: ${snapshot.exportedAt}`);
    
    // Check snapshot staleness
    const exportedAt = new Date(snapshot.exportedAt);
    const ageMs = Date.now() - exportedAt.getTime();
    const ageHours = ageMs / (1000 * 60 * 60);
    const ageDays = ageHours / 24;
    
    if (ageDays > 7) {
      console.log(`⚠️  WARNING: Snapshot is ${Math.floor(ageDays)} days old! Consider re-exporting for latest content.`);
    } else if (ageHours > 24) {
      console.log(`ℹ️  Snapshot is ${Math.floor(ageHours)} hours old.`);
    } else {
      console.log(`✓ Snapshot is fresh (${Math.floor(ageHours * 60)} minutes old).`);
    }
    console.log('');
    
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
    const snapshotUnitIds = snapshot.units.map(u => u.id);
    const snapshotCourseIds = snapshot.courses.map(c => c.id);
    
    for (const rawUnit of snapshot.units) {
      const unit = parseTimestamps(rawUnit);
      const existing = await db.select().from(units).where(eq(units.id, unit.id));
      if (existing.length > 0) {
        await db.update(units).set(unit).where(eq(units.id, unit.id));
      } else {
        await db.insert(units).values(unit);
      }
    }
    
    // Remove duplicate/stale units that aren't in the snapshot (for snapshot courses only)
    if (snapshotUnitIds.length > 0 && snapshotCourseIds.length > 0) {
      const staleUnits = await db.select({ id: units.id }).from(units)
        .where(and(
          inArray(units.courseId, snapshotCourseIds),
          notInArray(units.id, snapshotUnitIds)
        ));
      
      if (staleUnits.length > 0) {
        const staleUnitIds = staleUnits.map(u => u.id);
        // First delete lessons belonging to stale units
        await db.delete(lessons).where(inArray(lessons.unitId, staleUnitIds));
        // Then delete the stale units
        await db.delete(units).where(inArray(units.id, staleUnitIds));
        console.log(`  🧹 Removed ${staleUnits.length} stale units`);
      }
    }
    console.log(`  ✓ ${snapshot.units.length} units`);
    
    // Import lessons
    console.log('📝 Importing lessons...');
    const snapshotLessonIds = snapshot.lessons.map(l => l.id);
    
    for (const rawLesson of snapshot.lessons) {
      const lesson = parseTimestamps(rawLesson);
      const existing = await db.select().from(lessons).where(eq(lessons.id, lesson.id));
      if (existing.length > 0) {
        await db.update(lessons).set(lesson).where(eq(lessons.id, lesson.id));
      } else {
        await db.insert(lessons).values(lesson);
      }
    }
    
    // Remove duplicate/stale lessons that aren't in the snapshot (for snapshot units only)
    if (snapshotLessonIds.length > 0 && snapshotUnitIds.length > 0) {
      const staleLessons = await db.select({ id: lessons.id }).from(lessons)
        .where(and(
          inArray(lessons.unitId, snapshotUnitIds),
          notInArray(lessons.id, snapshotLessonIds)
        ));
      
      if (staleLessons.length > 0) {
        const staleLessonIds = staleLessons.map(l => l.id);
        await db.delete(lessons).where(inArray(lessons.id, staleLessonIds));
        console.log(`  🧹 Removed ${staleLessons.length} stale lessons`);
      }
    }
    console.log(`  ✓ ${snapshot.lessons.length} lessons`);
    
    // Import question banks
    console.log('❓ Importing question banks...');
    const snapshotQuestionBankIds = snapshot.questionBanks.map(b => b.id);
    
    for (const rawBank of snapshot.questionBanks) {
      const bank = parseTimestamps(rawBank);
      const existing = await db.select().from(questionBanks).where(eq(questionBanks.id, bank.id));
      if (existing.length > 0) {
        await db.update(questionBanks).set(bank).where(eq(questionBanks.id, bank.id));
      } else {
        await db.insert(questionBanks).values(bank);
      }
    }
    
    // Remove stale question banks (for snapshot courses only)
    if (snapshotQuestionBankIds.length > 0 && snapshotCourseIds.length > 0) {
      const staleBanks = await db.select({ id: questionBanks.id }).from(questionBanks)
        .where(and(
          inArray(questionBanks.courseId, snapshotCourseIds),
          notInArray(questionBanks.id, snapshotQuestionBankIds)
        ));
      
      if (staleBanks.length > 0) {
        const staleBankIds = staleBanks.map(b => b.id);
        await db.delete(bankQuestions).where(inArray(bankQuestions.bankId, staleBankIds));
        await db.delete(questionBanks).where(inArray(questionBanks.id, staleBankIds));
        console.log(`  🧹 Removed ${staleBanks.length} stale question banks`);
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
    const snapshotPracticeExamIds = snapshot.practiceExams.map(e => e.id);
    
    for (const rawExam of snapshot.practiceExams) {
      const exam = parseTimestamps(rawExam);
      const existing = await db.select().from(practiceExams).where(eq(practiceExams.id, exam.id));
      if (existing.length > 0) {
        await db.update(practiceExams).set(exam).where(eq(practiceExams.id, exam.id));
      } else {
        await db.insert(practiceExams).values(exam);
      }
    }
    
    // Remove stale practice exams (for snapshot courses only)
    if (snapshotPracticeExamIds.length > 0 && snapshotCourseIds.length > 0) {
      const staleExams = await db.select({ id: practiceExams.id }).from(practiceExams)
        .where(and(
          inArray(practiceExams.courseId, snapshotCourseIds),
          notInArray(practiceExams.id, snapshotPracticeExamIds)
        ));
      
      if (staleExams.length > 0) {
        const staleExamIds = staleExams.map(e => e.id);
        await db.delete(examQuestions).where(inArray(examQuestions.examId, staleExamIds));
        await db.delete(practiceExams).where(inArray(practiceExams.id, staleExamIds));
        console.log(`  🧹 Removed ${staleExams.length} stale practice exams`);
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
    
    // Fix orphan enrollments - map old course IDs to canonical ones
    console.log('🔧 Checking for orphan enrollments...');
    const { enrollments } = await import('@shared/schema');
    const validCourseIds = snapshot.courses.map(c => c.id);
    
    // Find enrollments with course IDs not in our snapshot
    const allEnrollments = await db.select().from(enrollments);
    const orphanEnrollments = allEnrollments.filter(e => !validCourseIds.includes(e.courseId));
    
    if (orphanEnrollments.length > 0) {
      console.log(`  Found ${orphanEnrollments.length} orphan enrollments`);
      
      // Map to FREC I (the most common pre-licensing course) since these are likely old FREC I enrollments
      const frecICourseId = '4793335c-ce58-4cab-af5c-a9160d593ced';
      
      for (const enrollment of orphanEnrollments) {
        await db.update(enrollments)
          .set({ courseId: frecICourseId })
          .where(eq(enrollments.id, enrollment.id));
      }
      console.log(`  ✓ Migrated ${orphanEnrollments.length} orphan enrollments to FREC I course`);
    } else {
      console.log(`  ✓ No orphan enrollments found`);
    }
    
    // Ensure all units have question banks (especially for CE courses)
    console.log('🏦 Ensuring all units have question banks...');
    const allUnits = await db.select().from(units);
    const existingBanks = await db.select().from(questionBanks);
    const existingBankUnitIds = new Set(
      existingBanks.map(b => b.unitId).filter((id): id is string => id !== null)
    );
    
    // Also get all practice exams to copy questions from
    const allPracticeExams = await db.select().from(practiceExams);
    const allExamQuestions = await db.select().from(examQuestions);
    
    let createdBanks = 0;
    let copiedQuestions = 0;
    
    for (const unit of allUnits) {
      // Skip if unit already has a question bank
      if (existingBankUnitIds.has(unit.id)) continue;
      
      // Create a question bank for this unit
      const bankId = crypto.randomUUID();
      const bankTitle = `${unit.title} Quiz`;
      
      await db.insert(questionBanks).values({
        id: bankId,
        title: bankTitle,
        courseId: unit.courseId,
        unitId: unit.id,
        bankType: 'unit_quiz',
        questionsPerAttempt: 10,
        passingScore: 70,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      createdBanks++;
      
      // Find a matching practice exam for this unit (by title match or course + unit combo)
      const matchingExam = allPracticeExams.find(pe => {
        // Match by course_id and title similarity
        if (pe.courseId !== unit.courseId) return false;
        const unitTitle = unit.title.toLowerCase();
        const examTitle = pe.title.toLowerCase();
        // Check if the unit title is contained in the exam title
        return examTitle.includes(unitTitle.replace(/ quiz$/i, '')) ||
               unitTitle.includes(examTitle.replace(/ quiz$/i, ''));
      });
      
      if (matchingExam) {
        // Copy questions from the practice exam to the new question bank
        const questionsForExam = allExamQuestions.filter(eq => eq.examId === matchingExam.id);
        
        for (const eq of questionsForExam) {
          await db.insert(bankQuestions).values({
            bankId: bankId,
            questionText: eq.questionText || '',
            questionType: eq.questionType || 'multiple_choice',
            options: eq.options || '[]',
            correctOption: eq.correctAnswer ? parseInt(eq.correctAnswer) || 0 : 0,
            explanation: eq.explanation || '',
            difficulty: 'medium',
            isActive: 1,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          copiedQuestions++;
        }
      }
    }
    
    if (createdBanks > 0) {
      console.log(`  ✓ Created ${createdBanks} missing question banks for units`);
      if (copiedQuestions > 0) {
        console.log(`  ✓ Copied ${copiedQuestions} questions to new question banks`);
      }
    } else {
      console.log(`  ✓ All units already have question banks`);
    }
    
    // Also ensure ALL empty question banks (including newly created ones) get populated
    console.log('📝 Populating empty question banks...');
    let populatedBanks = 0;
    let populatedQuestions = 0;
    
    // Re-fetch all question banks including newly created ones
    const allBanks = await db.select().from(questionBanks);
    
    for (const bank of allBanks) {
      // Check if bank has any questions
      const existingBankQuestions = await db.select({ id: bankQuestions.id })
        .from(bankQuestions)
        .where(eq(bankQuestions.bankId, bank.id));
      
      if (existingBankQuestions.length > 0) continue;
      
      // Find matching practice exam by course_id and hour number
      if (!bank.courseId) continue;
      
      const bankTitle = bank.title.toLowerCase();
      const bankHourMatch = bankTitle.match(/hour (\d+)/);
      
      const matchingExam = allPracticeExams.find(pe => {
        if (pe.courseId !== bank.courseId) return false;
        if (pe.isFinalExam) return false; // Skip final exams
        
        const examTitle = pe.title.toLowerCase();
        const examHourMatch = examTitle.match(/hour (\d+)/);
        
        // Match by hour number
        if (bankHourMatch && examHourMatch && bankHourMatch[1] === examHourMatch[1]) {
          return true;
        }
        return false;
      });
      
      if (matchingExam) {
        const questionsForExam = allExamQuestions.filter(eq => eq.examId === matchingExam.id);
        
        if (questionsForExam.length > 0) {
          for (const eq of questionsForExam) {
            await db.insert(bankQuestions).values({
              bankId: bank.id,
              questionText: eq.questionText || '',
              questionType: eq.questionType || 'multiple_choice',
              options: eq.options || '[]',
              correctOption: eq.correctAnswer ? parseInt(eq.correctAnswer) || 0 : 0,
              explanation: eq.explanation || '',
              difficulty: 'medium',
              isActive: 1,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            populatedQuestions++;
          }
          populatedBanks++;
          console.log(`    - Populated "${bank.title}" with ${questionsForExam.length} questions from "${matchingExam.title}"`);
        }
      }
    }
    
    if (populatedBanks > 0) {
      console.log(`  ✓ Populated ${populatedBanks} empty question banks with ${populatedQuestions} questions`);
    } else {
      console.log(`  ✓ No empty question banks need populating`);
    }
    
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
