import { db } from "./db";
import { questionBanks, bankQuestions, practiceExams, examQuestions, courses } from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";

export async function syncQuizQuestions() {
  console.log("Syncing quiz questions from exam_questions to bank_questions...");
  
  const courseResult = await db
    .select()
    .from(courses)
    .where(eq(courses.sku, "FL-RE-PL-SA-FRECI-63"))
    .limit(1);
  
  if (courseResult.length === 0) {
    console.log("FREC I course not found");
    return;
  }
  
  const course = courseResult[0];
  
  // Get all question banks for this course
  const banks = await db.select().from(questionBanks).where(eq(questionBanks.courseId, course.id));
  
  // Get all practice exams for this course (non-final exams)
  const exams = await db.select().from(practiceExams).where(
    and(
      eq(practiceExams.courseId, course.id),
      eq(practiceExams.isFinalExam, 0)
    )
  );
  
  let totalSynced = 0;
  
  for (const bank of banks) {
    // Skip final exam banks
    if (bank.title?.includes('Final Exam')) continue;
    
    // Check if bank already has questions
    const existingQuestions = await db.select().from(bankQuestions).where(eq(bankQuestions.bankId, bank.id));
    if (existingQuestions.length > 0) {
      console.log(`${bank.title}: already has ${existingQuestions.length} questions, skipping`);
      continue;
    }
    
    // Find matching practice exam by unit number (extract from title like "Unit X Quiz:")
    const unitMatch = bank.title?.match(/Unit\s+(\d+)/i);
    const unitNum = unitMatch ? parseInt(unitMatch[1]) : null;
    
    let matchingExam = exams.find(e => e.title?.toLowerCase() === bank.title?.toLowerCase());
    
    // If exact match fails, try matching by unit number
    if (!matchingExam && unitNum) {
      matchingExam = exams.find(e => {
        const examUnitMatch = e.title?.match(/Unit\s+(\d+)/i);
        return examUnitMatch && parseInt(examUnitMatch[1]) === unitNum;
      });
    }
    
    if (!matchingExam) {
      console.log(`${bank.title}: no matching practice exam found`);
      continue;
    }
    
    // Get questions from the practice exam
    const examQs = await db.select().from(examQuestions).where(eq(examQuestions.examId, matchingExam.id));
    
    if (examQs.length === 0) {
      console.log(`${bank.title}: matching exam has no questions`);
      continue;
    }
    
    // Copy questions to the question bank
    let copied = 0;
    for (const q of examQs) {
      // Convert letter answer (A, B, C, D) to 0-based index
      const answerMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
      const correctOptionIndex = answerMap[q.correctAnswer || 'A'] ?? 0;
      
      await db.insert(bankQuestions).values({
        bankId: bank.id,
        questionText: q.questionText || '',
        questionType: q.questionType || 'multiple_choice',
        options: q.options || '[]',
        correctOption: correctOptionIndex,
        explanation: q.explanation || 'See course materials for explanation.'
      });
      copied++;
    }
    
    console.log(`${bank.title}: synced ${copied} questions from practice exam`);
    totalSynced += copied;
  }
  
  console.log(`✓ Sync complete - total questions synced: ${totalSynced}`);
}
