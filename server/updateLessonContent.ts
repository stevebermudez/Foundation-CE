import { db } from "./db";
import { lessons, units } from "@shared/schema";
import { eq } from "drizzle-orm";
import { getLessonContent } from "./lessonContent";

export async function updateAllLessonContent() {
  try {
    console.log("Updating lesson content with real FREC I educational material...");

    const allUnits = await db.select().from(units).orderBy(units.unitNumber);
    
    for (const unit of allUnits) {
      const unitLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.unitId, unit.id))
        .orderBy(lessons.lessonNumber);
      
      for (const lesson of unitLessons) {
        const newContent = getLessonContent(unit.unitNumber, lesson.lessonNumber);
        
        await db
          .update(lessons)
          .set({ content: newContent })
          .where(eq(lessons.id, lesson.id));
        
        console.log(`Updated Unit ${unit.unitNumber}, Lesson ${lesson.lessonNumber}: ${lesson.title}`);
      }
    }

    console.log("All lesson content updated successfully!");
  } catch (error) {
    console.error("Error updating lesson content:", error);
    throw error;
  }
}
