/**
 * Export Course Catalog to JSON
 * 
 * Exports all course content (courses, units, lessons, quizzes, exams) 
 * to a JSON snapshot file for deployment to production.
 * 
 * Usage: npx tsx server/exportCourseCatalog.ts
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
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function exportCatalog(): Promise<CatalogSnapshot> {
  console.log('📦 Exporting Course Catalog...\n');
  
  // Export courses
  console.log('📚 Exporting courses...');
  const coursesData = await db.select().from(courses);
  const filteredCourses = coursesData.filter(c => COURSE_IDS.includes(c.id));
  console.log(`  Found ${filteredCourses.length} courses`);
  
  // Export units for these courses
  console.log('📖 Exporting units...');
  const allUnits: any[] = [];
  for (const courseId of COURSE_IDS) {
    const courseUnits = await db.select().from(units).where(eq(units.courseId, courseId));
    allUnits.push(...courseUnits);
  }
  console.log(`  Found ${allUnits.length} units`);
  
  // Export lessons for these units
  console.log('📝 Exporting lessons...');
  const allLessons: any[] = [];
  for (const unit of allUnits) {
    const unitLessons = await db.select().from(lessons).where(eq(lessons.unitId, unit.id));
    allLessons.push(...unitLessons);
  }
  console.log(`  Found ${allLessons.length} lessons`);
  
  // Export question banks for these courses
  console.log('❓ Exporting question banks...');
  const allQuestionBanks: any[] = [];
  for (const courseId of COURSE_IDS) {
    const banks = await db.select().from(questionBanks).where(eq(questionBanks.courseId, courseId));
    allQuestionBanks.push(...banks);
  }
  console.log(`  Found ${allQuestionBanks.length} question banks`);
  
  // Export bank questions
  console.log('📋 Exporting bank questions...');
  const allBankQuestions: any[] = [];
  for (const bank of allQuestionBanks) {
    const questions = await db.select().from(bankQuestions).where(eq(bankQuestions.bankId, bank.id));
    allBankQuestions.push(...questions);
  }
  console.log(`  Found ${allBankQuestions.length} bank questions`);
  
  // Export practice exams
  console.log('📝 Exporting practice exams...');
  const allPracticeExams: any[] = [];
  for (const courseId of COURSE_IDS) {
    const exams = await db.select().from(practiceExams).where(eq(practiceExams.courseId, courseId));
    allPracticeExams.push(...exams);
  }
  console.log(`  Found ${allPracticeExams.length} practice exams`);
  
  // Export exam questions
  console.log('📋 Exporting exam questions...');
  const allExamQuestions: any[] = [];
  for (const exam of allPracticeExams) {
    const questions = await db.select().from(examQuestions).where(eq(examQuestions.examId, exam.id));
    allExamQuestions.push(...questions);
  }
  console.log(`  Found ${allExamQuestions.length} exam questions`);
  
  // Export bundles
  console.log('📦 Exporting bundles...');
  const allBundles: any[] = [];
  for (const bundleId of BUNDLE_IDS) {
    const bundle = await db.select().from(courseBundles).where(eq(courseBundles.id, bundleId));
    allBundles.push(...bundle);
  }
  console.log(`  Found ${allBundles.length} bundles`);
  
  // Export bundle courses
  console.log('🔗 Exporting bundle courses...');
  const allBundleCourses: any[] = [];
  for (const bundleId of BUNDLE_IDS) {
    const bcs = await db.select().from(bundleCourses).where(eq(bundleCourses.bundleId, bundleId));
    allBundleCourses.push(...bcs);
  }
  console.log(`  Found ${allBundleCourses.length} bundle courses`);
  
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

async function main() {
  try {
    const snapshot = await exportCatalog();
    
    const outputPath = path.join(__dirname, 'catalogSnapshot.json');
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

main();
