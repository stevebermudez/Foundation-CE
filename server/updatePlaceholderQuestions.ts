import { db } from "./db";
import { practiceExams, examQuestions, questionBanks, bankQuestions, courses } from "@shared/schema";
import { eq, like, and, not, sql } from "drizzle-orm";

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
    
    const allExams = await db
      .select()
      .from(practiceExams)
      .where(eq(practiceExams.courseId, course.id));
    
    let totalDeleted = 0;
    let duplicatesRemoved = 0;
    
    const unitExams: Record<number, Array<{id: string, title: string, questionCount: number, placeholderCount: number}>> = {};
    
    for (const exam of allExams) {
      const unitMatch = exam.title?.match(/Unit\s+(\d+)/i);
      if (!unitMatch) continue;
      
      const unitNum = parseInt(unitMatch[1], 10);
      
      const questions = await db
        .select()
        .from(examQuestions)
        .where(eq(examQuestions.examId, exam.id));
      
      const placeholderCount = questions.filter(q => 
        q.questionText?.includes('Sample question') ||
        q.questionText?.includes('for this unit covering key concepts')
      ).length;
      
      if (!unitExams[unitNum]) {
        unitExams[unitNum] = [];
      }
      
      unitExams[unitNum].push({
        id: exam.id,
        title: exam.title || '',
        questionCount: questions.length,
        placeholderCount
      });
    }
    
    for (const [unitNumStr, exams] of Object.entries(unitExams)) {
      const unitNum = parseInt(unitNumStr, 10);
      
      if (exams.length > 1) {
        console.log(`Unit ${unitNum}: Found ${exams.length} duplicate quizzes`);
        
        exams.sort((a, b) => {
          if (a.placeholderCount === 0 && b.placeholderCount > 0) return -1;
          if (a.placeholderCount > 0 && b.placeholderCount === 0) return 1;
          return b.questionCount - a.questionCount;
        });
        
        const keepExam = exams[0];
        console.log(`  Keeping: "${keepExam.title}" (${keepExam.questionCount} questions, ${keepExam.placeholderCount} placeholders)`);
        
        for (let i = 1; i < exams.length; i++) {
          const duplicateExam = exams[i];
          console.log(`  Deleting: "${duplicateExam.title}" (${duplicateExam.questionCount} questions, ${duplicateExam.placeholderCount} placeholders)`);
          
          await db.delete(examQuestions).where(eq(examQuestions.examId, duplicateExam.id));
          await db.delete(practiceExams).where(eq(practiceExams.id, duplicateExam.id));
          duplicatesRemoved++;
          totalDeleted += duplicateExam.questionCount;
        }
      } else if (exams.length === 1) {
        const exam = exams[0];
        if (exam.placeholderCount > 0) {
          console.log(`Unit ${unitNum}: Has ${exam.placeholderCount} placeholder questions in "${exam.title}"`);
          
          const allBanks = await db
            .select()
            .from(questionBanks)
            .where(eq(questionBanks.courseId, course.id));
          
          const matchingBank = allBanks.find(bank => {
            const bankTitle = bank.title?.toLowerCase() || '';
            return bankTitle.includes(`unit ${unitNum}`) || 
                   bankTitle.includes(`unit_${unitNum}`) ||
                   bankTitle.includes(`unit${unitNum}`);
          });
          
          if (matchingBank) {
            const bankQs = await db
              .select()
              .from(bankQuestions)
              .where(eq(bankQuestions.bankId, matchingBank.id));
            
            const realBankQs = bankQs.filter(q => 
              q.questionText && 
              !q.questionText.includes('Sample question') &&
              !q.questionText.includes('for this unit covering key concepts')
            );
            
            if (realBankQs.length > 0) {
              console.log(`  Found ${realBankQs.length} real questions in question_banks - replacing placeholders`);
              
              await db.delete(examQuestions).where(
                and(
                  eq(examQuestions.examId, exam.id),
                  sql`question_text LIKE '%Sample question%' OR question_text LIKE '%for this unit covering key concepts%'`
                )
              );
              
              for (const realQ of realBankQs) {
                const existingInExam = await db
                  .select()
                  .from(examQuestions)
                  .where(and(
                    eq(examQuestions.examId, exam.id),
                    eq(examQuestions.questionText, realQ.questionText || '')
                  ))
                  .limit(1);
                
                if (existingInExam.length === 0) {
                  const letterLabels = ['A', 'B', 'C', 'D'];
                  const correctLetter = letterLabels[realQ.correctOption ?? 0] || 'A';
                  
                  await db.insert(examQuestions).values({
                    id: crypto.randomUUID(),
                    examId: exam.id,
                    questionText: realQ.questionText,
                    options: realQ.options,
                    correctAnswer: correctLetter,
                    explanation: realQ.explanation,
                    questionType: realQ.questionType || 'multiple_choice'
                  });
                  totalDeleted++;
                }
              }
            }
          }
        } else {
          console.log(`Unit ${unitNum}: ${exam.questionCount} real questions ✓`);
        }
      }
    }
    
    if (duplicatesRemoved > 0 || totalDeleted > 0) {
      console.log(`✓ Removed ${duplicatesRemoved} duplicate quizzes and ${totalDeleted} placeholder questions`);
    } else {
      console.log("✓ No placeholder questions or duplicates need updating");
    }
    
  } catch (error) {
    console.error("Error updating placeholder questions:", error);
  }
}
