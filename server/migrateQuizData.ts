import { db } from "./db";
import { practiceExams, examQuestions, questionBanks, bankQuestions } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

const letterLabels = ['A', 'B', 'C', 'D'];

function isPlaceholderQuestion(questionText: string | null): boolean {
  if (!questionText) return true;
  return (
    questionText.includes('[Comprehensive content') ||
    questionText.includes('Plausible distractor') ||
    questionText.includes('Correct answer option')
  );
}

export async function migrateQuizDataToCanonicalSchema(): Promise<void> {
  console.log("Starting quiz data migration to canonical schema...");
  
  try {
    const allBanks = await db.select().from(questionBanks);
    console.log(`Found ${allBanks.length} question banks to check`);
    
    const existingExams = await db.select().from(practiceExams);
    const existingExamTitles = new Set(existingExams.map(e => e.title.toLowerCase()));
    const existingExamMap = new Map(existingExams.map(e => [e.title.toLowerCase(), e]));
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const bank of allBanks) {
      if (existingExamTitles.has(bank.title.toLowerCase())) {
        const existingExam = existingExamMap.get(bank.title.toLowerCase());
        if (existingExam) {
          const existingQuestions = await db.select().from(examQuestions).where(eq(examQuestions.examId, existingExam.id));
          const realQuestions = existingQuestions.filter(q => !isPlaceholderQuestion(q.questionText));
          if (realQuestions.length > 0) {
            console.log(`Skipping "${bank.title}" - already has ${realQuestions.length} real questions in practice_exams`);
            skippedCount++;
            continue;
          }
        }
      }
      
      const bankQs = await db.select().from(bankQuestions).where(eq(bankQuestions.bankId, bank.id));
      
      if (bankQs.length === 0) {
        console.log(`Skipping "${bank.title}" - no questions in bank`);
        skippedCount++;
        continue;
      }
      
      const realBankQuestions = bankQs.filter(q => !isPlaceholderQuestion(q.questionText));
      
      if (realBankQuestions.length === 0) {
        console.log(`Skipping "${bank.title}" - ${bankQs.length} questions are all placeholders`);
        skippedCount++;
        continue;
      }
      
      console.log(`Migrating "${bank.title}" - ${realBankQuestions.length} real questions`);
      
      let targetExam = existingExamMap.get(bank.title.toLowerCase());
      
      if (!targetExam) {
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
        existingExamTitles.add(newExam.title.toLowerCase());
        existingExamMap.set(newExam.title.toLowerCase(), newExam);
        console.log(`  Created practice_exam: ${targetExam.id}`);
      } else {
        const deleted = await db.delete(examQuestions)
          .where(eq(examQuestions.examId, targetExam.id))
          .returning();
        if (deleted.length > 0) {
          console.log(`  Deleted ${deleted.length} existing placeholder questions`);
        }
        
        await db.update(practiceExams)
          .set({ totalQuestions: realBankQuestions.length })
          .where(eq(practiceExams.id, targetExam.id));
        console.log(`  Updated totalQuestions to ${realBankQuestions.length}`);
      }
      
      for (let i = 0; i < realBankQuestions.length; i++) {
        const bq = realBankQuestions[i];
        
        let options: string[];
        try {
          options = typeof bq.options === 'string' ? JSON.parse(bq.options) : (bq.options as string[]) || [];
        } catch {
          options = [];
        }
        
        const formattedOptions = options.map((opt, idx) => {
          if (/^[A-D]\./.test(opt)) {
            return opt;
          }
          return `${letterLabels[idx]}. ${opt}`;
        });
        
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
    const banks = await db.select().from(questionBanks);
    const exams = await db.select().from(practiceExams);
    
    for (const bank of banks) {
      const bankQs = await db.select().from(bankQuestions).where(eq(bankQuestions.bankId, bank.id));
      if (bankQs.length === 0) continue;
      
      const realBankQuestions = bankQs.filter(q => !isPlaceholderQuestion(q.questionText));
      if (realBankQuestions.length === 0) continue;
      
      const matchingExam = exams.find(e => e.title.toLowerCase() === bank.title.toLowerCase());
      if (!matchingExam) return true;
      
      const examQs = await db.select().from(examQuestions).where(eq(examQuestions.examId, matchingExam.id));
      if (examQs.length === 0) return true;
      
      const realExamQuestions = examQs.filter(q => !isPlaceholderQuestion(q.questionText));
      if (realExamQuestions.length === 0) return true;
    }
    
    return false;
  } catch {
    return false;
  }
}
