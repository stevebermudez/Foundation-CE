import { db } from "./db";
import { practiceExams, examQuestions, questionBanks, bankQuestions, courses } from "@shared/schema";
import { eq, like, and, or, not, sql } from "drizzle-orm";

export async function updatePlaceholderQuestions() {
  try {
    console.log("Checking for placeholder questions to update...");
    
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
    
    // First, aggressively delete ALL placeholder questions from both tables
    // But NOT final exam questions - those are handled separately
    
    // Get final exam ID to exclude it
    const finalExamResult = await db
      .select()
      .from(practiceExams)
      .where(sql`title LIKE '%Final Exam%' AND course_id = ${course.id}`)
      .limit(1);
    
    const finalExamId = finalExamResult.length > 0 ? finalExamResult[0].id : null;
    
    // Delete placeholder questions from unit quizzes only (not final exam)
    const examDeleteResult = await db.execute(sql`
      DELETE FROM exam_questions 
      WHERE (
        question_text LIKE '%Sample question%' 
        OR question_text LIKE '%for this unit covering key concepts%'
        OR question_text LIKE '%What is 2 + 2%'
        OR options LIKE '%Option A - First possible%'
      )
      AND exam_id NOT IN (SELECT id FROM practice_exams WHERE title LIKE '%Final Exam%')
    `);
    
    // Delete from bank_questions
    const bankDeleteResult = await db.execute(sql`
      DELETE FROM bank_questions 
      WHERE question_text LIKE '%Sample question%' 
         OR question_text LIKE '%for this unit covering key concepts%'
         OR question_text LIKE '%What is 2 + 2%'
         OR options LIKE '%Option A - First possible%'
         OR LENGTH(question_text) < 25
    `);
    
    // Delete test quizzes and question banks
    await db.execute(sql`
      DELETE FROM exam_questions WHERE exam_id IN (
        SELECT id FROM practice_exams WHERE title LIKE '%Test Quiz%' OR title LIKE '%Test %'
      )
    `);
    await db.execute(sql`DELETE FROM practice_exams WHERE title LIKE '%Test Quiz%' OR title LIKE '%Test %'`);
    await db.execute(sql`
      DELETE FROM bank_questions WHERE bank_id IN (
        SELECT id FROM question_banks WHERE title LIKE '%Test Quiz%' OR title LIKE '%Test %'
      )
    `);
    await db.execute(sql`DELETE FROM question_banks WHERE title LIKE '%Test Quiz%' OR title LIKE '%Test %'`);
    
    // Now handle duplicate quizzes
    const allExams = await db
      .select()
      .from(practiceExams)
      .where(eq(practiceExams.courseId, course.id));
    
    let duplicatesRemoved = 0;
    
    const unitExams: Record<number, Array<{id: string, title: string, questionCount: number}>> = {};
    
    for (const exam of allExams) {
      const unitMatch = exam.title?.match(/Unit\s+(\d+)/i);
      if (!unitMatch) continue;
      
      const unitNum = parseInt(unitMatch[1], 10);
      
      const questions = await db
        .select()
        .from(examQuestions)
        .where(eq(examQuestions.examId, exam.id));
      
      if (!unitExams[unitNum]) {
        unitExams[unitNum] = [];
      }
      
      unitExams[unitNum].push({
        id: exam.id,
        title: exam.title || '',
        questionCount: questions.length
      });
    }
    
    for (const [unitNumStr, exams] of Object.entries(unitExams)) {
      const unitNum = parseInt(unitNumStr, 10);
      
      if (exams.length > 1) {
        console.log(`Unit ${unitNum}: Found ${exams.length} duplicate quizzes`);
        
        // Sort by question count descending - keep the one with most questions
        exams.sort((a, b) => b.questionCount - a.questionCount);
        
        const keepExam = exams[0];
        console.log(`  Keeping: "${keepExam.title}" (${keepExam.questionCount} questions)`);
        
        for (let i = 1; i < exams.length; i++) {
          const duplicateExam = exams[i];
          console.log(`  Deleting: "${duplicateExam.title}" (${duplicateExam.questionCount} questions)`);
          
          await db.delete(examQuestions).where(eq(examQuestions.examId, duplicateExam.id));
          await db.delete(practiceExams).where(eq(practiceExams.id, duplicateExam.id));
          duplicatesRemoved++;
        }
      } else if (exams.length === 1) {
        const exam = exams[0];
        console.log(`Unit ${unitNum}: ${exam.questionCount} real questions ✓`);
      }
    }
    
    console.log(`✓ Cleanup complete - removed duplicates: ${duplicatesRemoved}`);
    
    // Import the proper 100-question final exams (Form A and Form B)
    // This is now handled by the importFinalExams function
    // Check if we need to import (if there are no Form A/B exams)
    const formAExam = allExams.find(e => e.isFinalExam === 1 && e.examForm === 'A');
    const formBExam = allExams.find(e => e.isFinalExam === 1 && e.examForm === 'B');
    
    if (!formAExam || !formBExam) {
      console.log("Final exam forms A/B not found - importing...");
      const { importFinalExams } = await import("./importFinalExams");
      await importFinalExams(course.id);
    } else {
      // Check if both forms have 100 questions
      const formAQuestions = await db.select().from(examQuestions).where(eq(examQuestions.examId, formAExam.id));
      const formBQuestions = await db.select().from(examQuestions).where(eq(examQuestions.examId, formBExam.id));
      
      console.log(`Final Exam Form A: ${formAQuestions.length} questions`);
      console.log(`Final Exam Form B: ${formBQuestions.length} questions`);
      
      if (formAQuestions.length < 100 || formBQuestions.length < 100) {
        console.log("Final exams incomplete - reimporting...");
        const { importFinalExams } = await import("./importFinalExams");
        await importFinalExams(course.id);
      }
    }
    
    // Add additional questions to units 9-19 (which are short)
    const { addUnitQuestions } = await import("./addUnitQuestions");
    await addUnitQuestions();
    
    // Remove questions that aren't specifically covered in lesson content
    const { removeUncoveredQuestions } = await import("./removeUncoveredQuestions");
    await removeUncoveredQuestions();
    
    // Sync quiz questions from exam_questions to bank_questions for admin console
    const { syncQuizQuestions } = await import("./syncQuizQuestions");
    await syncQuizQuestions();
    
  } catch (error) {
    console.error("Error updating placeholder questions:", error);
  }
}
