import { users, enrollments, courses, complianceRequirements, type User, type UpsertUser, type Course, type Enrollment, type ComplianceRequirement } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined>;
  createEnrollment(userId: string, courseId: string): Promise<Enrollment>;
  getCourses(filters?: { type?: string; targetLicense?: string }): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  getComplianceRequirement(userId: string): Promise<ComplianceRequirement | undefined>;
  createComplianceRequirement(requirement: Omit<ComplianceRequirement, 'id' | 'updatedAt'>): Promise<ComplianceRequirement>;
  updateEnrollmentHours(enrollmentId: string, hoursCompleted: number): Promise<Enrollment>;
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
