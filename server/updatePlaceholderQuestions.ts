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
    const placeholderPatterns = [
      "Sample question",
      "for this unit covering key concepts",
      "Option A - First possible answer",
      "Option A - First possible",
      "What is 2 + 2"
    ];
    
    // Delete from exam_questions
    const examDeleteResult = await db.execute(sql`
      DELETE FROM exam_questions 
      WHERE question_text LIKE '%Sample question%' 
         OR question_text LIKE '%for this unit covering key concepts%'
         OR question_text LIKE '%What is 2 + 2%'
         OR options LIKE '%Option A - First possible%'
         OR LENGTH(question_text) < 25
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
    
  } catch (error) {
    console.error("Error updating placeholder questions:", error);
  }
}
