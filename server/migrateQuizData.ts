import { db } from "./db";
import { practiceExams, examQuestions, questionBanks, bankQuestions } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

const letterLabels = ['A', 'B', 'C', 'D'];

export async function migrateQuizDataToCanonicalSchema(): Promise<void> {
  console.log("Starting quiz data migration to canonical schema...");
  
  try {
    // Get all question banks
    const allBanks = await db.select().from(questionBanks);
    console.log(`Found ${allBanks.length} question banks to check`);
    
    // Get all existing practice exams to avoid duplicates
    const existingExams = await db.select().from(practiceExams);
    const existingExamTitles = new Set(existingExams.map(e => e.title.toLowerCase()));
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const bank of allBanks) {
      // Check if a practice_exam with this title already exists
      if (existingExamTitles.has(bank.title.toLowerCase())) {
        // Check if it has questions
        const existingExam = existingExams.find(e => e.title.toLowerCase() === bank.title.toLowerCase());
        if (existingExam) {
          const existingQuestions = await db.select().from(examQuestions).where(eq(examQuestions.examId, existingExam.id));
          // Check if questions are real (not placeholders)
          const realQuestions = existingQuestions.filter(q => 
            q.questionText && 
            !q.questionText.includes('[Comprehensive content') &&
            !q.questionText.includes('Plausible distractor')
          );
          if (realQuestions.length > 0) {
            console.log(`Skipping "${bank.title}" - already has ${realQuestions.length} real questions in practice_exams`);
            skippedCount++;
            continue;
          }
        }
      }
      
      // Get questions from this bank
      const bankQs = await db.select().from(bankQuestions).where(eq(bankQuestions.bankId, bank.id));
      
      if (bankQs.length === 0) {
        console.log(`Skipping "${bank.title}" - no questions in bank`);
        skippedCount++;
        continue;
      }
      
      // Check if questions are real (not placeholder text)
      const realBankQuestions = bankQs.filter(q => 
        q.questionText && 
        !q.questionText.includes('[Comprehensive content') &&
        !q.questionText.includes('Plausible distractor') &&
        !q.questionText.includes('Correct answer option')
      );
      
      if (realBankQuestions.length === 0) {
        console.log(`Skipping "${bank.title}" - ${bankQs.length} questions are all placeholders`);
        skippedCount++;
        continue;
      }
      
      console.log(`Migrating "${bank.title}" - ${realBankQuestions.length} real questions`);
      
      // Find or create practice_exam
      let targetExam = existingExams.find(e => e.title.toLowerCase() === bank.title.toLowerCase());
      
      if (!targetExam) {
        // Create new practice_exam
        const [newExam] = await db.insert(practiceExams).values({
          courseId: bank.courseId,
          title: bank.title,
          description: bank.description,
          totalQuestions: realBankQuestions.length,
          passingScore: bank.passingScore || 70,
          timeLimit: bank.timeLimit,
          isActive: bank.isActive,
        }).returning();
        
        targetExam = newExam;
        console.log(`  Created practice_exam: ${targetExam.id}`);
      } else {
        // Delete existing placeholder questions if any
        const deleted = await db.delete(examQuestions)
          .where(eq(examQuestions.examId, targetExam.id))
          .returning();
        if (deleted.length > 0) {
          console.log(`  Deleted ${deleted.length} existing placeholder questions`);
        }
      }
      
      // Migrate questions
      for (let i = 0; i < realBankQuestions.length; i++) {
        const bq = realBankQuestions[i];
        
        // Parse options
        let options: string[];
        try {
          options = typeof bq.options === 'string' ? JSON.parse(bq.options) : (bq.options as string[]) || [];
        } catch {
          options = [];
        }
        
        // Transform options to "A. text" format if not already
        const formattedOptions = options.map((opt, idx) => {
          if (/^[A-D]\./.test(opt)) {
            return opt; // Already formatted
          }
          return `${letterLabels[idx]}. ${opt}`;
        });
        
        // Convert correctOption (index) to correctAnswer (letter)
        const correctAnswer = letterLabels[bq.correctOption] || 'A';
        
        await db.insert(examQuestions).values({
          examId: targetExam.id,
          questionText: bq.questionText,
          questionType: bq.questionType || 'multiple_choice',
          correctAnswer: correctAnswer,
          explanation: bq.explanation,
          options: JSON.stringify(formattedOptions),
          sequence: i,
        });
      }
      
      console.log(`  Migrated ${realBankQuestions.length} questions to exam_questions`);
      migratedCount++;
    }
    
    console.log(`Migration complete: ${migratedCount} banks migrated, ${skippedCount} skipped`);
    
  } catch (error) {
    console.error("Error during quiz data migration:", error);
    throw error;
  }
}

export async function checkMigrationNeeded(): Promise<boolean> {
  try {
    // Check if there are question_banks with questions that don't have corresponding practice_exams with questions
    const banks = await db.select().from(questionBanks);
    const exams = await db.select().from(practiceExams);
    
    for (const bank of banks) {
      const bankQs = await db.select().from(bankQuestions).where(eq(bankQuestions.bankId, bank.id)).limit(1);
      if (bankQs.length === 0) continue;
      
      // Check if real questions (not placeholders)
      if (bankQs[0].questionText?.includes('[Comprehensive content')) continue;
      
      // Check if corresponding practice_exam has real questions
      const matchingExam = exams.find(e => e.title.toLowerCase() === bank.title.toLowerCase());
      if (!matchingExam) return true;
      
      const examQs = await db.select().from(examQuestions).where(eq(examQuestions.examId, matchingExam.id)).limit(1);
      if (examQs.length === 0) return true;
      if (examQs[0].questionText?.includes('[Comprehensive content')) return true;
    }
    
    return false;
  } catch {
    return false;
  }
}
