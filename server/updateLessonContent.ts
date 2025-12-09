import { db } from "./db";
import { lessons, units, questionBanks, courses } from "@shared/schema";
import { eq, and, ne } from "drizzle-orm";
import { getLessonContent } from "./lessonContent";

const expectedLessonCounts: Record<number, number> = {
  1: 3, 2: 3, 3: 3, 4: 4, 5: 3, 6: 3, 7: 4, 8: 4, 9: 3, 10: 3,
  11: 4, 12: 3, 13: 3, 14: 4, 15: 3, 16: 3, 17: 3, 18: 3, 19: 3
};

const FALLBACK_MARKER = "Content for this lesson is being developed";

// FREC I Pre-Licensing Course SKU - only update lessons for this course
const FREC_I_SKU = "FL-RE-SA-63HR";

export async function updateAllLessonContent() {
  try {
    console.log("Updating lesson content with real FREC I educational material...");

    // Find the FREC I course to only update its lessons (not CE courses)
    const frecICourse = await db.select().from(courses).where(eq(courses.sku, FREC_I_SKU)).limit(1);
    if (!frecICourse || frecICourse.length === 0) {
      console.log("FREC I course not found, skipping lesson content update");
      return;
    }
    const frecICourseId = frecICourse[0].id;
    
    // Only get units for the FREC I course
    const allUnits = await db.select().from(units)
      .where(eq(units.courseId, frecICourseId))
      .orderBy(units.unitNumber);
    let fallbackCount = 0;
    let mismatchCount = 0;
    
    for (const unit of allUnits) {
      const unitLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.unitId, unit.id))
        .orderBy(lessons.lessonNumber);
      
      const expectedCount = expectedLessonCounts[unit.unitNumber];
      if (expectedCount && unitLessons.length !== expectedCount) {
        console.warn(`WARNING: Unit ${unit.unitNumber} has ${unitLessons.length} lessons, expected ${expectedCount}`);
        mismatchCount++;
      }
      
      for (const lesson of unitLessons) {
        const newContent = getLessonContent(unit.unitNumber, lesson.lessonNumber);
        
        if (newContent.includes(FALLBACK_MARKER)) {
          console.warn(`WARNING: Unit ${unit.unitNumber}, Lesson ${lesson.lessonNumber} is using placeholder content`);
          fallbackCount++;
        }
        
        await db
          .update(lessons)
          .set({ content: newContent })
          .where(eq(lessons.id, lesson.id));
        
        console.log(`Updated Unit ${unit.unitNumber}, Lesson ${lesson.lessonNumber}: ${lesson.title}`);
      }
    }

    if (fallbackCount > 0) {
      console.warn(`VALIDATION: ${fallbackCount} lessons are using placeholder content`);
    }
    if (mismatchCount > 0) {
      console.warn(`VALIDATION: ${mismatchCount} units have unexpected lesson counts`);
    }
    if (fallbackCount === 0 && mismatchCount === 0) {
      console.log("VALIDATION: All lessons have real content and counts match expectations");
    }

    console.log("All lesson content updated successfully!");
  } catch (error) {
    console.error("Error updating lesson content:", error);
    throw error;
  }
}

// Fix question bank settings to use 10 questions for unit quizzes (not the default 20)
export async function fixQuestionBankSettings() {
  try {
    console.log("Checking question bank settings...");
    
    // Update all unit quizzes to use 10 questions per attempt
    const result = await db
      .update(questionBanks)
      .set({ questionsPerAttempt: 10 })
      .where(
        and(
          eq(questionBanks.bankType, "unit_quiz"),
          ne(questionBanks.questionsPerAttempt, 10)
        )
      );
    
    console.log("Question bank settings verified - unit quizzes set to 10 questions");
  } catch (error) {
    console.error("Error fixing question bank settings:", error);
  }
}
