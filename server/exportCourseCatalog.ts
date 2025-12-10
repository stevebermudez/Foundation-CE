/**
 * Export Course Catalog to JSON
 * 
 * Exports all course content (courses, units, lessons, quizzes, exams) 
 * to a JSON snapshot file for deployment to production.
 * 
 * Can be used as:
 * - CLI: npx tsx server/exportCourseCatalog.ts
 * - Module: import { exportCourseCatalog } from './exportCourseCatalog'
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
import { eq, and, like } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

// Course IDs to export
const COURSE_IDS = [
  '4793335c-ce58-4cab-af5c-a9160d593ced', // FREC I
  '04ed7248-fd4e-44e1-8b55-3ba7d204040b', // FREC II
  'bbb3196b-7aca-40d0-84e5-6a4f42871a2f', // Core Law 3HR
  'fe41fdc7-eb98-449e-ab90-8d7d8637737f', // Ethics 3HR
  '590f235f-50f7-4020-a10a-af675950acd8'  // Transaction 8HR
];

const BUNDLE_IDS = [
  '24da327b-4fda-4464-884c-ecf47bb92d95' // 14-Hour CE Bundle
];

export interface CatalogSnapshot {
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

export interface ExportResult {
  success: boolean;
  coursesExported: number;
  unitsExported: number;
  lessonsExported: number;
  questionBanksExported: number;
  bankQuestionsExported: number;
  practiceExamsExported: number;
  examQuestionsExported: number;
  bundlesExported: number;
  error?: string;
}

/**
 * Auto-detect and fix final exam flags before export.
 * This ensures exams with "Final Exam" in their title are properly flagged.
 */
async function validateAndFixFinalExams(): Promise<{ fixed: number; warnings: string[] }> {
  const warnings: string[] = [];
  let fixed = 0;
  
  // Find exams that look like final exams but aren't flagged
  const allExams = await db.select().from(practiceExams);
  
  for (const exam of allExams) {
    const titleLower = exam.title.toLowerCase();
    const isFinalExamTitle = titleLower.includes('final exam');
    
    if (isFinalExamTitle && exam.isFinalExam !== 1) {
      // Auto-fix: Mark as final exam
      await db.update(practiceExams)
        .set({ isFinalExam: 1 })
        .where(eq(practiceExams.id, exam.id));
      console.log(`  🔧 Auto-fixed: "${exam.title}" marked as final exam`);
      fixed++;
    }
    
    // Check for missing exam form on final exams
    if (isFinalExamTitle && !exam.examForm) {
      // Try to detect form from title
      if (titleLower.includes('form a')) {
        await db.update(practiceExams)
          .set({ examForm: 'A' })
          .where(eq(practiceExams.id, exam.id));
        console.log(`  🔧 Auto-fixed: "${exam.title}" set to Form A`);
        fixed++;
      } else if (titleLower.includes('form b')) {
        await db.update(practiceExams)
          .set({ examForm: 'B' })
          .where(eq(practiceExams.id, exam.id));
        console.log(`  🔧 Auto-fixed: "${exam.title}" set to Form B`);
        fixed++;
      } else {
        warnings.push(`Final exam "${exam.title}" is missing Form A/B designation`);
      }
    }
  }
  
  // Validate pre-licensing courses have dual final exams
  for (const courseId of COURSE_IDS) {
    const course = await db.select().from(courses).where(eq(courses.id, courseId));
    if (course.length === 0) continue;
    
    const courseData = course[0];
    if (courseData.requirementCycleType === 'Pre-Licensing') {
      const finals = await db.select().from(practiceExams)
        .where(and(
          eq(practiceExams.courseId, courseId),
          eq(practiceExams.isFinalExam, 1)
        ));
      
      const hasFormA = finals.some(e => e.examForm === 'A');
      const hasFormB = finals.some(e => e.examForm === 'B');
      
      if (!hasFormA || !hasFormB) {
        warnings.push(`Pre-licensing course "${courseData.title}" should have both Form A and Form B final exams (has: ${finals.map(e => `Form ${e.examForm || '?'}`).join(', ') || 'none'})`);
      }
    }
  }
  
  return { fixed, warnings };
}

function getSnapshotPath(): string {
  const possiblePaths = [
    path.resolve(process.cwd(), 'server', 'catalogSnapshot.json'),
    path.resolve(process.cwd(), 'dist', 'server', 'catalogSnapshot.json'),
    path.resolve(process.cwd(), 'catalogSnapshot.json'),
  ];
  
  for (const p of possiblePaths) {
    const dir = path.dirname(p);
    if (fs.existsSync(dir)) {
      return p;
    }
  }
  
  return possiblePaths[0];
}

async function buildCatalogSnapshot(): Promise<CatalogSnapshot> {
  // Export courses
  const coursesData = await db.select().from(courses);
  const filteredCourses = coursesData.filter(c => COURSE_IDS.includes(c.id));
  
  // Export units for these courses
  const allUnits: any[] = [];
  for (const courseId of COURSE_IDS) {
    const courseUnits = await db.select().from(units).where(eq(units.courseId, courseId));
    allUnits.push(...courseUnits);
  }
  
  // Export lessons for these units
  const allLessons: any[] = [];
  for (const unit of allUnits) {
    const unitLessons = await db.select().from(lessons).where(eq(lessons.unitId, unit.id));
    allLessons.push(...unitLessons);
  }
  
  // Export question banks for these courses
  const allQuestionBanks: any[] = [];
  for (const courseId of COURSE_IDS) {
    const banks = await db.select().from(questionBanks).where(eq(questionBanks.courseId, courseId));
    allQuestionBanks.push(...banks);
  }
  
  // Export bank questions
  const allBankQuestions: any[] = [];
  for (const bank of allQuestionBanks) {
    const questions = await db.select().from(bankQuestions).where(eq(bankQuestions.bankId, bank.id));
    allBankQuestions.push(...questions);
  }
  
  // Export practice exams
  const allPracticeExams: any[] = [];
  for (const courseId of COURSE_IDS) {
    const exams = await db.select().from(practiceExams).where(eq(practiceExams.courseId, courseId));
    allPracticeExams.push(...exams);
  }
  
  // Export exam questions
  const allExamQuestions: any[] = [];
  for (const exam of allPracticeExams) {
    const questions = await db.select().from(examQuestions).where(eq(examQuestions.examId, exam.id));
    allExamQuestions.push(...questions);
  }
  
  // Export bundles
  const allBundles: any[] = [];
  for (const bundleId of BUNDLE_IDS) {
    const bundle = await db.select().from(courseBundles).where(eq(courseBundles.id, bundleId));
    allBundles.push(...bundle);
  }
  
  // Export bundle courses
  const allBundleCourses: any[] = [];
  for (const bundleId of BUNDLE_IDS) {
    const bcs = await db.select().from(bundleCourses).where(eq(bundleCourses.bundleId, bundleId));
    allBundleCourses.push(...bcs);
  }
  
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    courses: filteredCourses,
    units: allUnits,
    lessons: allLessons,
    questionBanks: allQuestionBanks,
    bankQuestions: allBankQuestions,
    practiceExams: allPracticeExams,
    examQuestions: allExamQuestions,
    bundles: allBundles,
    bundleCourses: allBundleCourses
  };
}

/**
 * Export course catalog to JSON snapshot file.
 * This function can be called from other modules.
 */
export async function exportCourseCatalog(): Promise<ExportResult> {
  try {
    // Validate and auto-fix final exam issues before export
    const validation = await validateAndFixFinalExams();
    if (validation.fixed > 0) {
      console.log(`✅ Auto-fixed ${validation.fixed} final exam issue(s)`);
    }
    if (validation.warnings.length > 0) {
      console.log(`⚠️ Export warnings:`);
      validation.warnings.forEach(w => console.log(`   - ${w}`));
    }
    
    const snapshot = await buildCatalogSnapshot();
    
    const outputPath = getSnapshotPath();
    fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));
    
    return {
      success: true,
      coursesExported: snapshot.courses.length,
      unitsExported: snapshot.units.length,
      lessonsExported: snapshot.lessons.length,
      questionBanksExported: snapshot.questionBanks.length,
      bankQuestionsExported: snapshot.bankQuestions.length,
      practiceExamsExported: snapshot.practiceExams.length,
      examQuestionsExported: snapshot.examQuestions.length,
      bundlesExported: snapshot.bundles.length
    };
  } catch (error) {
    return {
      success: false,
      coursesExported: 0,
      unitsExported: 0,
      lessonsExported: 0,
      questionBanksExported: 0,
      bankQuestionsExported: 0,
      practiceExamsExported: 0,
      examQuestionsExported: 0,
      bundlesExported: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// CLI entry point - only runs when called directly
async function main() {
  try {
    console.log('📦 Exporting Course Catalog...\n');
    
    // Validate and auto-fix final exam issues before export
    console.log('🔍 Validating final exams...');
    const validation = await validateAndFixFinalExams();
    if (validation.fixed > 0) {
      console.log(`✅ Auto-fixed ${validation.fixed} final exam issue(s)`);
    }
    if (validation.warnings.length > 0) {
      console.log(`⚠️ Validation warnings:`);
      validation.warnings.forEach(w => console.log(`   - ${w}`));
    }
    console.log('');
    
    const snapshot = await buildCatalogSnapshot();
    
    console.log(`📚 Exporting courses...`);
    console.log(`  Found ${snapshot.courses.length} courses`);
    console.log(`📖 Exporting units...`);
    console.log(`  Found ${snapshot.units.length} units`);
    console.log(`📝 Exporting lessons...`);
    console.log(`  Found ${snapshot.lessons.length} lessons`);
    console.log(`❓ Exporting question banks...`);
    console.log(`  Found ${snapshot.questionBanks.length} question banks`);
    console.log(`📋 Exporting bank questions...`);
    console.log(`  Found ${snapshot.bankQuestions.length} bank questions`);
    console.log(`📝 Exporting practice exams...`);
    console.log(`  Found ${snapshot.practiceExams.length} practice exams`);
    console.log(`📋 Exporting exam questions...`);
    console.log(`  Found ${snapshot.examQuestions.length} exam questions`);
    console.log(`📦 Exporting bundles...`);
    console.log(`  Found ${snapshot.bundles.length} bundles`);
    console.log(`🔗 Exporting bundle courses...`);
    console.log(`  Found ${snapshot.bundleCourses.length} bundle courses`);
    
    const outputPath = getSnapshotPath();
    fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));
    
    console.log('\n✅ Export complete!');
    console.log(`📁 Output: ${outputPath}`);
    console.log(`\nSummary:`);
    console.log(`  - ${snapshot.courses.length} courses`);
    console.log(`  - ${snapshot.units.length} units`);
    console.log(`  - ${snapshot.lessons.length} lessons`);
    console.log(`  - ${snapshot.questionBanks.length} question banks`);
    console.log(`  - ${snapshot.bankQuestions.length} bank questions`);
    console.log(`  - ${snapshot.practiceExams.length} practice exams`);
    console.log(`  - ${snapshot.examQuestions.length} exam questions`);
    console.log(`  - ${snapshot.bundles.length} bundles`);
    
    process.exit(0);
  } catch (err) {
    console.error('Export failed:', err);
    process.exit(1);
  }
}

// Only run main() when this file is executed directly (not imported)
const isMainModule = process.argv[1]?.includes('exportCourseCatalog');
if (isMainModule) {
  main();
}
