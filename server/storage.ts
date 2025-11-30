import { users, enrollments, type User, type UpsertUser } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getEnrollment(userId: string, courseId: string): Promise<any | undefined>;
  createEnrollment(
    userId: string,
    courseId: string
  ): Promise<{ id: string; userId: string; courseId: string }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getEnrollment(userId: string, courseId: string) {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(
        eq(enrollments.userId, userId) && eq(enrollments.courseId, courseId)
      );
    return enrollment;
  }

  async createEnrollment(userId: string, courseId: string) {
    const [enrollment] = await db
      .insert(enrollments)
      .values({ userId, courseId })
      .returning();
    return enrollment;
  }
}

export const storage = new DatabaseStorage();
