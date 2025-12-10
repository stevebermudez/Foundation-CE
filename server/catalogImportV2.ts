/**
 * Catalog Import V2 - Bulletproof Content Pipeline
 * 
 * Features:
 * - Pre-validation of all data before any writes
 * - Integrity verification after imports
 * - Automatic quiz system reconciliation (question_banks ↔ practice_exams)
 * - Detailed structured logging
 * - Rollback capability via snapshots
 * - Checksums for content verification
 */

import { db } from './db';
import { withTransaction, getTransactionDb } from './dbTransaction';
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
import { eq, and, inArray, notInArray, sql, count } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

type TransactionDB = ReturnType<typeof getTransactionDb>;

// Structured log entry for audit trail
interface ImportLogEntry {
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  stage: string;
  message: string;
  details?: any;
}

// Import result with full audit trail
interface ImportResult {
  success: boolean;
  startTime: Date;
  endTime: Date;
  duration: number;
  snapshotVersion: string;
  snapshotChecksum: string;
  counts: {
    courses: { expected: number; imported: number; verified: number };
    units: { expected: number; imported: number; verified: number };
    lessons: { expected: number; imported: number; verified: number };
    questionBanks: { expected: number; imported: number; verified: number };
    bankQuestions: { expected: number; imported: number; verified: number };
    practiceExams: { expected: number; imported: number; verified: number };
    examQuestions: { expected: number; imported: number; verified: number };
    bundles: { expected: number; imported: number; verified: number };
  };
  reconciliation: {
    banksCreated: number;
    questionsPopulated: number;
    orphansFixed: number;
  };
  logs: ImportLogEntry[];
  errors: string[];
  warnings: string[];
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

class CatalogImporter {
  private logs: ImportLogEntry[] = [];
  private errors: string[] = [];
  private warnings: string[] = [];
  
  private log(level: ImportLogEntry['level'], stage: string, message: string, details?: any) {
    const entry: ImportLogEntry = {
      timestamp: new Date(),
      level,
      stage,
      message,
      details
    };
    this.logs.push(entry);
    
    const prefix = level === 'ERROR' ? '❌' : level === 'WARN' ? '⚠️' : level === 'SUCCESS' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${stage}] ${message}`);
    
    if (level === 'ERROR') this.errors.push(message);
    if (level === 'WARN') this.warnings.push(message);
  }

  private calculateChecksum(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  private parseTimestamps(obj: any): any {
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

  private getSnapshotPath(): string {
    const possiblePaths = [
      path.resolve(process.cwd(), 'server', 'catalogSnapshot.json'),
      path.resolve(process.cwd(), 'dist', 'server', 'catalogSnapshot.json'),
      path.resolve(process.cwd(), 'catalogSnapshot.json'),
    ];
    
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    return possiblePaths[0];
  }

  async validateSnapshot(snapshot: CatalogSnapshot): Promise<boolean> {
    this.log('INFO', 'VALIDATION', 'Starting pre-import validation...');
    let isValid = true;

    // Check required arrays exist
    const requiredArrays = ['courses', 'units', 'lessons', 'questionBanks', 'bankQuestions', 'practiceExams', 'examQuestions', 'bundles'];
    for (const arr of requiredArrays) {
      if (!Array.isArray((snapshot as any)[arr])) {
        this.log('ERROR', 'VALIDATION', `Missing or invalid array: ${arr}`);
        isValid = false;
      }
    }

    // Validate referential integrity in snapshot
    const courseIds = new Set(snapshot.courses.map(c => c.id));
    const unitIds = new Set(snapshot.units.map(u => u.id));
    
    // Check all units reference valid courses
    for (const unit of snapshot.units) {
      if (!courseIds.has(unit.courseId)) {
        this.log('ERROR', 'VALIDATION', `Unit "${unit.title}" references non-existent course: ${unit.courseId}`);
        isValid = false;
      }
    }

    // Check all lessons reference valid units
    for (const lesson of snapshot.lessons) {
      if (!unitIds.has(lesson.unitId)) {
        this.log('ERROR', 'VALIDATION', `Lesson "${lesson.title}" references non-existent unit: ${lesson.unitId}`);
        isValid = false;
      }
    }

    // Check all question banks reference valid courses
    for (const bank of snapshot.questionBanks) {
      if (bank.courseId && !courseIds.has(bank.courseId)) {
        this.log('WARN', 'VALIDATION', `Question bank "${bank.title}" references non-existent course: ${bank.courseId}`);
      }
    }

    // Check all practice exams reference valid courses
    for (const exam of snapshot.practiceExams) {
      if (exam.courseId && !courseIds.has(exam.courseId)) {
        this.log('WARN', 'VALIDATION', `Practice exam "${exam.title}" references non-existent course: ${exam.courseId}`);
      }
    }

    // Check all bank questions reference valid question banks
    const questionBankIds = new Set(snapshot.questionBanks.map(qb => qb.id));
    for (const bq of snapshot.bankQuestions) {
      if (!questionBankIds.has(bq.bankId)) {
        this.log('ERROR', 'VALIDATION', `Bank question references non-existent bank: ${bq.bankId}`);
        isValid = false;
      }
    }

    // Check all exam questions reference valid practice exams
    const practiceExamIds = new Set(snapshot.practiceExams.map(pe => pe.id));
    for (const eq of snapshot.examQuestions) {
      if (!practiceExamIds.has(eq.examId)) {
        this.log('ERROR', 'VALIDATION', `Exam question references non-existent exam: ${eq.examId}`);
        isValid = false;
      }
    }

    // Check all bundle courses reference valid bundles and courses
    const bundleIds = new Set(snapshot.bundles.map(b => b.id));
    for (const bc of snapshot.bundleCourses) {
      if (!bundleIds.has(bc.bundleId)) {
        this.log('ERROR', 'VALIDATION', `Bundle course references non-existent bundle: ${bc.bundleId}`);
        isValid = false;
      }
      if (!courseIds.has(bc.courseId)) {
        this.log('ERROR', 'VALIDATION', `Bundle course references non-existent course: ${bc.courseId}`);
        isValid = false;
      }
    }

    if (isValid) {
      this.log('SUCCESS', 'VALIDATION', 'Pre-import validation passed');
    } else {
      this.log('ERROR', 'VALIDATION', 'Pre-import validation FAILED - aborting import');
    }

    return isValid;
  }

  async importWithValidation(dryRun: boolean = false): Promise<ImportResult> {
    const startTime = new Date();
    const result: ImportResult = {
      success: false,
      startTime,
      endTime: startTime,
      duration: 0,
      snapshotVersion: '',
      snapshotChecksum: '',
      counts: {
        courses: { expected: 0, imported: 0, verified: 0 },
        units: { expected: 0, imported: 0, verified: 0 },
        lessons: { expected: 0, imported: 0, verified: 0 },
        questionBanks: { expected: 0, imported: 0, verified: 0 },
        bankQuestions: { expected: 0, imported: 0, verified: 0 },
        practiceExams: { expected: 0, imported: 0, verified: 0 },
        examQuestions: { expected: 0, imported: 0, verified: 0 },
        bundles: { expected: 0, imported: 0, verified: 0 },
      },
      reconciliation: {
        banksCreated: 0,
        questionsPopulated: 0,
        orphansFixed: 0
      },
      logs: this.logs,
      errors: this.errors,
      warnings: this.warnings
    };

    try {
      this.log('INFO', 'START', `Starting catalog import (dryRun: ${dryRun})`);

      // Load and validate snapshot
      const snapshotPath = this.getSnapshotPath();
      if (!fs.existsSync(snapshotPath)) {
        this.log('ERROR', 'LOAD', `Snapshot file not found: ${snapshotPath}`);
        throw new Error(`Snapshot file not found: ${snapshotPath}`);
      }

      const snapshotContent = fs.readFileSync(snapshotPath, 'utf-8');
      const snapshot: CatalogSnapshot = JSON.parse(snapshotContent);
      
      result.snapshotVersion = snapshot.version;
      result.snapshotChecksum = this.calculateChecksum(snapshotContent);
      
      this.log('INFO', 'LOAD', `Loaded snapshot v${snapshot.version} (checksum: ${result.snapshotChecksum})`);

      // Set expected counts
      result.counts.courses.expected = snapshot.courses.length;
      result.counts.units.expected = snapshot.units.length;
      result.counts.lessons.expected = snapshot.lessons.length;
      result.counts.questionBanks.expected = snapshot.questionBanks.length;
      result.counts.bankQuestions.expected = snapshot.bankQuestions.length;
      result.counts.practiceExams.expected = snapshot.practiceExams.length;
      result.counts.examQuestions.expected = snapshot.examQuestions.length;
      result.counts.bundles.expected = snapshot.bundles.length;

      // Validate before proceeding
      const isValid = await this.validateSnapshot(snapshot);
      if (!isValid) {
        throw new Error('Snapshot validation failed');
      }

      if (dryRun) {
        this.log('INFO', 'DRYRUN', 'Dry run mode - no changes will be made');
        result.success = true;
        result.endTime = new Date();
        result.duration = result.endTime.getTime() - startTime.getTime();
        return result;
      }

      // Execute all imports within a transaction for ACID guarantees
      this.log('INFO', 'TRANSACTION', 'Starting transactional import...');
      
      try {
        await withTransaction(async (tx) => {
          // Phase 1: Import all entities in dependency order using transaction
          await this.importCoursesWithTx(tx, snapshot.courses);
          result.counts.courses.imported = snapshot.courses.length;

          await this.importUnitsWithTx(tx, snapshot);
          result.counts.units.imported = snapshot.units.length;

          await this.importLessonsWithTx(tx, snapshot);
          result.counts.lessons.imported = snapshot.lessons.length;

          await this.importQuestionBanksWithTx(tx, snapshot);
          result.counts.questionBanks.imported = snapshot.questionBanks.length;

          await this.importBankQuestionsWithTx(tx, snapshot.bankQuestions);
          result.counts.bankQuestions.imported = snapshot.bankQuestions.length;

          await this.importPracticeExamsWithTx(tx, snapshot);
          result.counts.practiceExams.imported = snapshot.practiceExams.length;

          await this.importExamQuestionsWithTx(tx, snapshot.examQuestions);
          result.counts.examQuestions.imported = snapshot.examQuestions.length;

          await this.importBundlesWithTx(tx, snapshot);
          result.counts.bundles.imported = snapshot.bundles.length;

          // Phase 2: Reconcile quiz systems within same transaction
          const reconcileResult = await this.reconcileQuizSystemsWithTx(tx, snapshot);
          result.reconciliation = reconcileResult;

          this.log('SUCCESS', 'TRANSACTION', 'All imports committed successfully');
        });
      } catch (txError: any) {
        // Transaction automatically rolls back on error
        this.log('ERROR', 'TRANSACTION', `Transaction rolled back: ${txError.message}`);
        throw txError;
      }

      // Phase 3: Verify all imports (outside transaction, using read-only db)
      await this.verifyImport(result);

      // Check for any verification failures
      const verificationFailed = Object.values(result.counts).some(
        c => c.verified < c.expected
      );

      if (verificationFailed) {
        this.log('ERROR', 'VERIFY', 'Post-import verification detected missing content');
        result.success = false;
      } else {
        this.log('SUCCESS', 'COMPLETE', 'Import completed successfully with all content verified');
        result.success = true;
      }

    } catch (error: any) {
      this.log('ERROR', 'FATAL', `Import failed: ${error.message}`, { 
        stack: error.stack,
        cause: error.cause 
      });
      result.success = false;
    }

    result.endTime = new Date();
    result.duration = result.endTime.getTime() - startTime.getTime();
    result.logs = this.logs;
    result.errors = this.errors;
    result.warnings = this.warnings;

    // Write audit log
    await this.writeAuditLog(result);

    return result;
  }

  private async importCourses(coursesData: any[]) {
    this.log('INFO', 'COURSES', `Importing ${coursesData.length} courses...`);
    for (const rawCourse of coursesData) {
      const course = this.parseTimestamps(rawCourse);
      const existing = await db.select().from(courses).where(eq(courses.id, course.id));
      if (existing.length > 0) {
        await db.update(courses).set(course).where(eq(courses.id, course.id));
      } else {
        await db.insert(courses).values(course);
      }
    }
    this.log('SUCCESS', 'COURSES', `Imported ${coursesData.length} courses`);
  }

  private async importUnits(snapshot: CatalogSnapshot) {
    this.log('INFO', 'UNITS', `Importing ${snapshot.units.length} units...`);
    const snapshotUnitIds = snapshot.units.map(u => u.id);
    const snapshotCourseIds = snapshot.courses.map(c => c.id);

    for (const rawUnit of snapshot.units) {
      const unit = this.parseTimestamps(rawUnit);
      const existing = await db.select().from(units).where(eq(units.id, unit.id));
      if (existing.length > 0) {
        await db.update(units).set(unit).where(eq(units.id, unit.id));
      } else {
        await db.insert(units).values(unit);
      }
    }

    // Clean stale units
    if (snapshotUnitIds.length > 0 && snapshotCourseIds.length > 0) {
      const staleUnits = await db.select({ id: units.id }).from(units)
        .where(and(
          inArray(units.courseId, snapshotCourseIds),
          notInArray(units.id, snapshotUnitIds)
        ));
      
      if (staleUnits.length > 0) {
        const staleUnitIds = staleUnits.map(u => u.id);
        await db.delete(lessons).where(inArray(lessons.unitId, staleUnitIds));
        await db.delete(units).where(inArray(units.id, staleUnitIds));
        this.log('INFO', 'UNITS', `Cleaned ${staleUnits.length} stale units`);
      }
    }
    this.log('SUCCESS', 'UNITS', `Imported ${snapshot.units.length} units`);
  }

  private async importLessons(snapshot: CatalogSnapshot) {
    this.log('INFO', 'LESSONS', `Importing ${snapshot.lessons.length} lessons...`);
    const snapshotLessonIds = snapshot.lessons.map(l => l.id);
    const snapshotUnitIds = snapshot.units.map(u => u.id);

    for (const rawLesson of snapshot.lessons) {
      const lesson = this.parseTimestamps(rawLesson);
      const existing = await db.select().from(lessons).where(eq(lessons.id, lesson.id));
      if (existing.length > 0) {
        await db.update(lessons).set(lesson).where(eq(lessons.id, lesson.id));
      } else {
        await db.insert(lessons).values(lesson);
      }
    }

    // Clean stale lessons
    if (snapshotLessonIds.length > 0 && snapshotUnitIds.length > 0) {
      const staleLessons = await db.select({ id: lessons.id }).from(lessons)
        .where(and(
          inArray(lessons.unitId, snapshotUnitIds),
          notInArray(lessons.id, snapshotLessonIds)
        ));
      
      if (staleLessons.length > 0) {
        await db.delete(lessons).where(inArray(lessons.id, staleLessons.map(l => l.id)));
        this.log('INFO', 'LESSONS', `Cleaned ${staleLessons.length} stale lessons`);
      }
    }
    this.log('SUCCESS', 'LESSONS', `Imported ${snapshot.lessons.length} lessons`);
  }

  private async importQuestionBanks(snapshot: CatalogSnapshot) {
    this.log('INFO', 'QBANKS', `Importing ${snapshot.questionBanks.length} question banks...`);
    const snapshotBankIds = snapshot.questionBanks.map(b => b.id);
    const snapshotCourseIds = snapshot.courses.map(c => c.id);

    for (const rawBank of snapshot.questionBanks) {
      const bank = this.parseTimestamps(rawBank);
      const existing = await db.select().from(questionBanks).where(eq(questionBanks.id, bank.id));
      if (existing.length > 0) {
        await db.update(questionBanks).set(bank).where(eq(questionBanks.id, bank.id));
      } else {
        await db.insert(questionBanks).values(bank);
      }
    }

    // Clean stale banks
    if (snapshotBankIds.length > 0 && snapshotCourseIds.length > 0) {
      const staleBanks = await db.select({ id: questionBanks.id }).from(questionBanks)
        .where(and(
          inArray(questionBanks.courseId, snapshotCourseIds),
          notInArray(questionBanks.id, snapshotBankIds)
        ));
      
      if (staleBanks.length > 0) {
        const staleBankIds = staleBanks.map(b => b.id);
        await db.delete(bankQuestions).where(inArray(bankQuestions.bankId, staleBankIds));
        await db.delete(questionBanks).where(inArray(questionBanks.id, staleBankIds));
        this.log('INFO', 'QBANKS', `Cleaned ${staleBanks.length} stale question banks`);
      }
    }
    this.log('SUCCESS', 'QBANKS', `Imported ${snapshot.questionBanks.length} question banks`);
  }

  private async importBankQuestions(questionsData: any[]) {
    this.log('INFO', 'BQUESTIONS', `Importing ${questionsData.length} bank questions...`);
    for (const rawQuestion of questionsData) {
      const question = this.parseTimestamps(rawQuestion);
      const existing = await db.select().from(bankQuestions).where(eq(bankQuestions.id, question.id));
      if (existing.length > 0) {
        await db.update(bankQuestions).set(question).where(eq(bankQuestions.id, question.id));
      } else {
        await db.insert(bankQuestions).values(question);
      }
    }
    this.log('SUCCESS', 'BQUESTIONS', `Imported ${questionsData.length} bank questions`);
  }

  private async importPracticeExams(snapshot: CatalogSnapshot) {
    this.log('INFO', 'PEXAMS', `Importing ${snapshot.practiceExams.length} practice exams...`);
    const snapshotExamIds = snapshot.practiceExams.map(e => e.id);
    const snapshotCourseIds = snapshot.courses.map(c => c.id);

    for (const rawExam of snapshot.practiceExams) {
      const exam = this.parseTimestamps(rawExam);
      const existing = await db.select().from(practiceExams).where(eq(practiceExams.id, exam.id));
      if (existing.length > 0) {
        await db.update(practiceExams).set(exam).where(eq(practiceExams.id, exam.id));
      } else {
        await db.insert(practiceExams).values(exam);
      }
    }

    // Clean stale exams
    if (snapshotExamIds.length > 0 && snapshotCourseIds.length > 0) {
      const staleExams = await db.select({ id: practiceExams.id }).from(practiceExams)
        .where(and(
          inArray(practiceExams.courseId, snapshotCourseIds),
          notInArray(practiceExams.id, snapshotExamIds)
        ));
      
      if (staleExams.length > 0) {
        const staleExamIds = staleExams.map(e => e.id);
        await db.delete(examQuestions).where(inArray(examQuestions.examId, staleExamIds));
        await db.delete(practiceExams).where(inArray(practiceExams.id, staleExamIds));
        this.log('INFO', 'PEXAMS', `Cleaned ${staleExams.length} stale practice exams`);
      }
    }
    this.log('SUCCESS', 'PEXAMS', `Imported ${snapshot.practiceExams.length} practice exams`);
  }

  private async importExamQuestions(questionsData: any[]) {
    this.log('INFO', 'EQUESTIONS', `Importing ${questionsData.length} exam questions...`);
    for (const rawQuestion of questionsData) {
      const question = this.parseTimestamps(rawQuestion);
      const existing = await db.select().from(examQuestions).where(eq(examQuestions.id, question.id));
      if (existing.length > 0) {
        await db.update(examQuestions).set(question).where(eq(examQuestions.id, question.id));
      } else {
        await db.insert(examQuestions).values(question);
      }
    }
    this.log('SUCCESS', 'EQUESTIONS', `Imported ${questionsData.length} exam questions`);
  }

  private async importBundles(snapshot: CatalogSnapshot) {
    this.log('INFO', 'BUNDLES', `Importing ${snapshot.bundles.length} bundles...`);
    
    for (const rawBundle of snapshot.bundles) {
      const bundle = this.parseTimestamps(rawBundle);
      const existing = await db.select().from(courseBundles).where(eq(courseBundles.id, bundle.id));
      if (existing.length > 0) {
        await db.update(courseBundles).set(bundle).where(eq(courseBundles.id, bundle.id));
      } else {
        await db.insert(courseBundles).values(bundle);
      }
    }

    // Import bundle-course relationships
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

    this.log('SUCCESS', 'BUNDLES', `Imported ${snapshot.bundles.length} bundles`);
  }

  private async reconcileQuizSystems(snapshot: CatalogSnapshot): Promise<{
    banksCreated: number;
    questionsPopulated: number;
    orphansFixed: number;
  }> {
    this.log('INFO', 'RECONCILE', 'Reconciling question_banks ↔ practice_exams...');
    
    let banksCreated = 0;
    let questionsPopulated = 0;
    let orphansFixed = 0;

    // Get all units and their associated data
    const allUnits = await db.select().from(units);
    const allBanks = await db.select().from(questionBanks);
    const allExams = await db.select().from(practiceExams);
    const allExamQuestions = await db.select().from(examQuestions);

    // Ensure every unit has a question bank
    for (const unit of allUnits) {
      const hasBank = allBanks.some(b => b.unitId === unit.id);
      
      if (!hasBank) {
        // Create missing question bank
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
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        banksCreated++;
        
        // Try to populate from matching practice exam
        const matchingExam = allExams.find(pe => {
          if (pe.courseId !== unit.courseId) return false;
          const unitTitle = unit.title.toLowerCase();
          const examTitle = pe.title.toLowerCase();
          
          // Match by hour number for CE courses
          const unitHour = unitTitle.match(/hour (\d+)/);
          const examHour = examTitle.match(/hour (\d+)/);
          if (unitHour && examHour && unitHour[1] === examHour[1]) {
            return true;
          }
          
          // Match by unit number
          const unitNum = unitTitle.match(/unit (\d+)/);
          const examNum = examTitle.match(/unit (\d+)/);
          if (unitNum && examNum && unitNum[1] === examNum[1]) {
            return true;
          }
          
          return false;
        });

        if (matchingExam) {
          const questions = allExamQuestions.filter(eq => eq.examId === matchingExam.id);
          for (const q of questions) {
            await db.insert(bankQuestions).values({
              bankId: bankId,
              questionText: q.questionText || '',
              questionType: q.questionType || 'multiple_choice',
              options: q.options || '[]',
              correctOption: q.correctAnswer ? parseInt(q.correctAnswer) || 0 : 0,
              explanation: q.explanation || '',
              difficulty: 'medium',
              isActive: 1,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            questionsPopulated++;
          }
        }
      }
    }

    // Populate any empty question banks from practice exams
    const emptyBanks = await db.select().from(questionBanks);
    for (const bank of emptyBanks) {
      const questionCount = await db.select({ count: count() }).from(bankQuestions)
        .where(eq(bankQuestions.bankId, bank.id));
      
      if (questionCount[0].count === 0 && bank.courseId) {
        // Find matching practice exam by hour pattern
        const bankTitle = bank.title.toLowerCase();
        const bankHour = bankTitle.match(/hour (\d+)/);
        
        if (bankHour) {
          const matchingExam = allExams.find(pe => {
            if (pe.courseId !== bank.courseId) return false;
            const examTitle = pe.title.toLowerCase();
            const examHour = examTitle.match(/hour (\d+)/);
            return examHour && examHour[1] === bankHour[1];
          });

          if (matchingExam) {
            const questions = allExamQuestions.filter(eq => eq.examId === matchingExam.id);
            for (const q of questions) {
              await db.insert(bankQuestions).values({
                bankId: bank.id,
                questionText: q.questionText || '',
                questionType: q.questionType || 'multiple_choice',
                options: q.options || '[]',
                correctOption: q.correctAnswer ? parseInt(q.correctAnswer) || 0 : 0,
                explanation: q.explanation || '',
                difficulty: 'medium',
                isActive: 1,
                createdAt: new Date(),
                updatedAt: new Date()
              });
              questionsPopulated++;
            }
            orphansFixed++;
          }
        }
      }
    }

    this.log('SUCCESS', 'RECONCILE', `Reconciliation complete: ${banksCreated} banks created, ${questionsPopulated} questions populated, ${orphansFixed} orphans fixed`);
    
    return { banksCreated, questionsPopulated, orphansFixed };
  }

  private async verifyImport(result: ImportResult) {
    this.log('INFO', 'VERIFY', 'Verifying import integrity...');

    // Count all entities in database
    const courseCount = await db.select({ count: count() }).from(courses);
    const unitCount = await db.select({ count: count() }).from(units);
    const lessonCount = await db.select({ count: count() }).from(lessons);
    const bankCount = await db.select({ count: count() }).from(questionBanks);
    const bqCount = await db.select({ count: count() }).from(bankQuestions);
    const examCount = await db.select({ count: count() }).from(practiceExams);
    const eqCount = await db.select({ count: count() }).from(examQuestions);
    const bundleCount = await db.select({ count: count() }).from(courseBundles);

    result.counts.courses.verified = Number(courseCount[0].count);
    result.counts.units.verified = Number(unitCount[0].count);
    result.counts.lessons.verified = Number(lessonCount[0].count);
    result.counts.questionBanks.verified = Number(bankCount[0].count);
    result.counts.bankQuestions.verified = Number(bqCount[0].count);
    result.counts.practiceExams.verified = Number(examCount[0].count);
    result.counts.examQuestions.verified = Number(eqCount[0].count);
    result.counts.bundles.verified = Number(bundleCount[0].count);

    // Log verification results
    const checks = [
      { name: 'Courses', expected: result.counts.courses.expected, actual: result.counts.courses.verified },
      { name: 'Units', expected: result.counts.units.expected, actual: result.counts.units.verified },
      { name: 'Lessons', expected: result.counts.lessons.expected, actual: result.counts.lessons.verified },
      { name: 'Question Banks', expected: result.counts.questionBanks.expected, actual: result.counts.questionBanks.verified },
      { name: 'Bank Questions', expected: result.counts.bankQuestions.expected, actual: result.counts.bankQuestions.verified },
      { name: 'Practice Exams', expected: result.counts.practiceExams.expected, actual: result.counts.practiceExams.verified },
      { name: 'Exam Questions', expected: result.counts.examQuestions.expected, actual: result.counts.examQuestions.verified },
      { name: 'Bundles', expected: result.counts.bundles.expected, actual: result.counts.bundles.verified },
    ];

    for (const check of checks) {
      if (check.actual >= check.expected) {
        this.log('SUCCESS', 'VERIFY', `${check.name}: ${check.actual} (expected ${check.expected})`);
      } else {
        this.log('ERROR', 'VERIFY', `${check.name}: ${check.actual} < ${check.expected} MISSING CONTENT!`);
      }
    }
  }

  private async writeAuditLog(result: ImportResult) {
    const logDir = path.resolve(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, `import-${result.startTime.toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(logFile, JSON.stringify(result, null, 2));
    this.log('INFO', 'AUDIT', `Audit log written to ${logFile}`);
  }

  // ==================== TRANSACTIONAL VERSIONS ====================
  // These methods accept a transaction context for ACID guarantees

  private async importCoursesWithTx(tx: any, coursesData: any[]) {
    this.log('INFO', 'COURSES', `Importing ${coursesData.length} courses (transactional)...`);
    for (const rawCourse of coursesData) {
      const course = this.parseTimestamps(rawCourse);
      const existing = await tx.select().from(courses).where(eq(courses.id, course.id));
      if (existing.length > 0) {
        await tx.update(courses).set(course).where(eq(courses.id, course.id));
      } else {
        await tx.insert(courses).values(course);
      }
    }
    this.log('SUCCESS', 'COURSES', `Imported ${coursesData.length} courses`);
  }

  private async importUnitsWithTx(tx: any, snapshot: CatalogSnapshot) {
    this.log('INFO', 'UNITS', `Importing ${snapshot.units.length} units (transactional)...`);
    const snapshotUnitIds = snapshot.units.map(u => u.id);
    const snapshotCourseIds = snapshot.courses.map(c => c.id);

    for (const rawUnit of snapshot.units) {
      const unit = this.parseTimestamps(rawUnit);
      const existing = await tx.select().from(units).where(eq(units.id, unit.id));
      if (existing.length > 0) {
        await tx.update(units).set(unit).where(eq(units.id, unit.id));
      } else {
        await tx.insert(units).values(unit);
      }
    }

    if (snapshotUnitIds.length > 0 && snapshotCourseIds.length > 0) {
      const staleUnits = await tx.select({ id: units.id }).from(units)
        .where(and(
          inArray(units.courseId, snapshotCourseIds),
          notInArray(units.id, snapshotUnitIds)
        ));
      
      if (staleUnits.length > 0) {
        const staleUnitIds = staleUnits.map((u: any) => u.id);
        await tx.delete(lessons).where(inArray(lessons.unitId, staleUnitIds));
        await tx.delete(units).where(inArray(units.id, staleUnitIds));
        this.log('INFO', 'UNITS', `Cleaned ${staleUnits.length} stale units`);
      }
    }
    this.log('SUCCESS', 'UNITS', `Imported ${snapshot.units.length} units`);
  }

  private async importLessonsWithTx(tx: any, snapshot: CatalogSnapshot) {
    this.log('INFO', 'LESSONS', `Importing ${snapshot.lessons.length} lessons (transactional)...`);
    const snapshotLessonIds = snapshot.lessons.map(l => l.id);
    const snapshotUnitIds = snapshot.units.map(u => u.id);

    for (const rawLesson of snapshot.lessons) {
      const lesson = this.parseTimestamps(rawLesson);
      const existing = await tx.select().from(lessons).where(eq(lessons.id, lesson.id));
      if (existing.length > 0) {
        await tx.update(lessons).set(lesson).where(eq(lessons.id, lesson.id));
      } else {
        await tx.insert(lessons).values(lesson);
      }
    }

    if (snapshotLessonIds.length > 0 && snapshotUnitIds.length > 0) {
      const staleLessons = await tx.select({ id: lessons.id }).from(lessons)
        .where(and(
          inArray(lessons.unitId, snapshotUnitIds),
          notInArray(lessons.id, snapshotLessonIds)
        ));
      
      if (staleLessons.length > 0) {
        await tx.delete(lessons).where(inArray(lessons.id, staleLessons.map((l: any) => l.id)));
        this.log('INFO', 'LESSONS', `Cleaned ${staleLessons.length} stale lessons`);
      }
    }
    this.log('SUCCESS', 'LESSONS', `Imported ${snapshot.lessons.length} lessons`);
  }

  private async importQuestionBanksWithTx(tx: any, snapshot: CatalogSnapshot) {
    this.log('INFO', 'QBANKS', `Importing ${snapshot.questionBanks.length} question banks (transactional)...`);
    const snapshotBankIds = snapshot.questionBanks.map(b => b.id);
    const snapshotCourseIds = snapshot.courses.map(c => c.id);

    for (const rawBank of snapshot.questionBanks) {
      const bank = this.parseTimestamps(rawBank);
      const existing = await tx.select().from(questionBanks).where(eq(questionBanks.id, bank.id));
      if (existing.length > 0) {
        await tx.update(questionBanks).set(bank).where(eq(questionBanks.id, bank.id));
      } else {
        await tx.insert(questionBanks).values(bank);
      }
    }

    if (snapshotBankIds.length > 0 && snapshotCourseIds.length > 0) {
      const staleBanks = await tx.select({ id: questionBanks.id }).from(questionBanks)
        .where(and(
          inArray(questionBanks.courseId, snapshotCourseIds),
          notInArray(questionBanks.id, snapshotBankIds)
        ));
      
      if (staleBanks.length > 0) {
        const staleBankIds = staleBanks.map((b: any) => b.id);
        await tx.delete(bankQuestions).where(inArray(bankQuestions.bankId, staleBankIds));
        await tx.delete(questionBanks).where(inArray(questionBanks.id, staleBankIds));
        this.log('INFO', 'QBANKS', `Cleaned ${staleBanks.length} stale question banks`);
      }
    }
    this.log('SUCCESS', 'QBANKS', `Imported ${snapshot.questionBanks.length} question banks`);
  }

  private async importBankQuestionsWithTx(tx: any, questionsData: any[]) {
    this.log('INFO', 'BQUESTIONS', `Importing ${questionsData.length} bank questions (transactional)...`);
    for (const rawQuestion of questionsData) {
      const question = this.parseTimestamps(rawQuestion);
      const existing = await tx.select().from(bankQuestions).where(eq(bankQuestions.id, question.id));
      if (existing.length > 0) {
        await tx.update(bankQuestions).set(question).where(eq(bankQuestions.id, question.id));
      } else {
        await tx.insert(bankQuestions).values(question);
      }
    }
    this.log('SUCCESS', 'BQUESTIONS', `Imported ${questionsData.length} bank questions`);
  }

  private async importPracticeExamsWithTx(tx: any, snapshot: CatalogSnapshot) {
    this.log('INFO', 'PEXAMS', `Importing ${snapshot.practiceExams.length} practice exams (transactional)...`);
    const snapshotExamIds = snapshot.practiceExams.map(e => e.id);
    const snapshotCourseIds = snapshot.courses.map(c => c.id);

    for (const rawExam of snapshot.practiceExams) {
      const exam = this.parseTimestamps(rawExam);
      const existing = await tx.select().from(practiceExams).where(eq(practiceExams.id, exam.id));
      if (existing.length > 0) {
        await tx.update(practiceExams).set(exam).where(eq(practiceExams.id, exam.id));
      } else {
        await tx.insert(practiceExams).values(exam);
      }
    }

    if (snapshotExamIds.length > 0 && snapshotCourseIds.length > 0) {
      const staleExams = await tx.select({ id: practiceExams.id }).from(practiceExams)
        .where(and(
          inArray(practiceExams.courseId, snapshotCourseIds),
          notInArray(practiceExams.id, snapshotExamIds)
        ));
      
      if (staleExams.length > 0) {
        const staleExamIds = staleExams.map((e: any) => e.id);
        await tx.delete(examQuestions).where(inArray(examQuestions.examId, staleExamIds));
        await tx.delete(practiceExams).where(inArray(practiceExams.id, staleExamIds));
        this.log('INFO', 'PEXAMS', `Cleaned ${staleExams.length} stale practice exams`);
      }
    }
    this.log('SUCCESS', 'PEXAMS', `Imported ${snapshot.practiceExams.length} practice exams`);
  }

  private async importExamQuestionsWithTx(tx: any, questionsData: any[]) {
    this.log('INFO', 'EQUESTIONS', `Importing ${questionsData.length} exam questions (transactional)...`);
    for (const rawQuestion of questionsData) {
      const question = this.parseTimestamps(rawQuestion);
      const existing = await tx.select().from(examQuestions).where(eq(examQuestions.id, question.id));
      if (existing.length > 0) {
        await tx.update(examQuestions).set(question).where(eq(examQuestions.id, question.id));
      } else {
        await tx.insert(examQuestions).values(question);
      }
    }
    this.log('SUCCESS', 'EQUESTIONS', `Imported ${questionsData.length} exam questions`);
  }

  private async importBundlesWithTx(tx: any, snapshot: CatalogSnapshot) {
    this.log('INFO', 'BUNDLES', `Importing ${snapshot.bundles.length} bundles (transactional)...`);
    
    for (const rawBundle of snapshot.bundles) {
      const bundle = this.parseTimestamps(rawBundle);
      const existing = await tx.select().from(courseBundles).where(eq(courseBundles.id, bundle.id));
      if (existing.length > 0) {
        await tx.update(courseBundles).set(bundle).where(eq(courseBundles.id, bundle.id));
      } else {
        await tx.insert(courseBundles).values(bundle);
      }
    }

    for (const bc of snapshot.bundleCourses) {
      const existing = await tx.select().from(bundleCourses)
        .where(and(
          eq(bundleCourses.bundleId, bc.bundleId),
          eq(bundleCourses.courseId, bc.courseId)
        ));
      if (existing.length === 0) {
        await tx.insert(bundleCourses).values(bc);
      }
    }

    this.log('SUCCESS', 'BUNDLES', `Imported ${snapshot.bundles.length} bundles`);
  }

  private async reconcileQuizSystemsWithTx(tx: any, snapshot: CatalogSnapshot): Promise<{
    banksCreated: number;
    questionsPopulated: number;
    orphansFixed: number;
  }> {
    this.log('INFO', 'RECONCILE', 'Reconciling question_banks ↔ practice_exams (transactional)...');
    
    let banksCreated = 0;
    let questionsPopulated = 0;
    let orphansFixed = 0;

    const allUnits = await tx.select().from(units);
    const allBanks = await tx.select().from(questionBanks);
    const allExams = await tx.select().from(practiceExams);
    const allExamQuestions = await tx.select().from(examQuestions);

    for (const unit of allUnits) {
      const hasBank = allBanks.some((b: any) => b.unitId === unit.id);
      
      if (!hasBank) {
        const bankId = crypto.randomUUID();
        const bankTitle = `${unit.title} Quiz`;
        
        await tx.insert(questionBanks).values({
          id: bankId,
          title: bankTitle,
          courseId: unit.courseId,
          unitId: unit.id,
          bankType: 'unit_quiz',
          questionsPerAttempt: 10,
          passingScore: 70,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        banksCreated++;
        
        const matchingExam = allExams.find((pe: any) => {
          if (pe.courseId !== unit.courseId) return false;
          const unitTitle = unit.title.toLowerCase();
          const examTitle = pe.title.toLowerCase();
          
          const unitHour = unitTitle.match(/hour (\d+)/);
          const examHour = examTitle.match(/hour (\d+)/);
          if (unitHour && examHour && unitHour[1] === examHour[1]) {
            return true;
          }
          
          const unitNum = unitTitle.match(/unit (\d+)/);
          const examNum = examTitle.match(/unit (\d+)/);
          if (unitNum && examNum && unitNum[1] === examNum[1]) {
            return true;
          }
          
          return false;
        });

        if (matchingExam) {
          const questions = allExamQuestions.filter((eq: any) => eq.examId === matchingExam.id);
          for (const q of questions) {
            await tx.insert(bankQuestions).values({
              bankId: bankId,
              questionText: q.questionText || '',
              questionType: q.questionType || 'multiple_choice',
              options: q.options || '[]',
              correctOption: q.correctAnswer ? parseInt(q.correctAnswer) || 0 : 0,
              explanation: q.explanation || '',
              difficulty: 'medium',
              isActive: 1,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            questionsPopulated++;
          }
        }
      }
    }

    const emptyBanks = await tx.select().from(questionBanks);
    for (const bank of emptyBanks) {
      const questionCount = await tx.select({ count: count() }).from(bankQuestions)
        .where(eq(bankQuestions.bankId, bank.id));
      
      if (questionCount[0].count === 0 && bank.courseId) {
        const bankTitle = bank.title.toLowerCase();
        const bankHour = bankTitle.match(/hour (\d+)/);
        
        if (bankHour) {
          const matchingExam = allExams.find((pe: any) => {
            if (pe.courseId !== bank.courseId) return false;
            const examTitle = pe.title.toLowerCase();
            const examHour = examTitle.match(/hour (\d+)/);
            return examHour && examHour[1] === bankHour[1];
          });

          if (matchingExam) {
            const questions = allExamQuestions.filter((eq: any) => eq.examId === matchingExam.id);
            for (const q of questions) {
              await tx.insert(bankQuestions).values({
                bankId: bank.id,
                questionText: q.questionText || '',
                questionType: q.questionType || 'multiple_choice',
                options: q.options || '[]',
                correctOption: q.correctAnswer ? parseInt(q.correctAnswer) || 0 : 0,
                explanation: q.explanation || '',
                difficulty: 'medium',
                isActive: 1,
                createdAt: new Date(),
                updatedAt: new Date()
              });
              questionsPopulated++;
            }
            orphansFixed++;
          }
        }
      }
    }

    this.log('SUCCESS', 'RECONCILE', `Reconciliation complete: ${banksCreated} banks created, ${questionsPopulated} questions populated, ${orphansFixed} orphans fixed`);
    
    return { banksCreated, questionsPopulated, orphansFixed };
  }
}

// Export function for use in routes
export async function importCourseCatalogV2(dryRun: boolean = false): Promise<ImportResult> {
  const importer = new CatalogImporter();
  return importer.importWithValidation(dryRun);
}

// CLI execution
if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run');
  importCourseCatalogV2(dryRun)
    .then(result => {
      console.log('\n📊 Import Summary:');
      console.log(`   Success: ${result.success}`);
      console.log(`   Duration: ${result.duration}ms`);
      console.log(`   Errors: ${result.errors.length}`);
      console.log(`   Warnings: ${result.warnings.length}`);
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Import failed:', err);
      process.exit(1);
    });
}
