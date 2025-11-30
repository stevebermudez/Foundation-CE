import { users, enrollments, courses, complianceRequirements, organizations, userOrganizations, organizationCourses, companyAccounts, companyCompliance, type User, type UpsertUser, type Course, type Enrollment, type ComplianceRequirement, type Organization, type CompanyAccount, type CompanyCompliance } from "@shared/schema";
import { eq, and, lt, gte } from "drizzle-orm";
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
  getOrganization(id: string): Promise<Organization | undefined>;
  getOrganizationBySlug(slug: string): Promise<Organization | undefined>;
  createOrganization(org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization>;
  getUserOrganizations(userId: string): Promise<Organization[]>;
  getOrganizationCourses(organizationId: string): Promise<Course[]>;
  getCompanyAccount(id: string): Promise<CompanyAccount | undefined>;
  createCompanyAccount(account: Omit<CompanyAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompanyAccount>;
  getCompanyCompliance(companyId: string): Promise<CompanyCompliance[]>;
  createCompanyCompliance(compliance: Omit<CompanyCompliance, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompanyCompliance>;
  updateCompanyCompliance(id: string, data: Partial<CompanyCompliance>): Promise<CompanyCompliance>;
  getExpiringCompliance(daysUntilExpiry: number): Promise<(CompanyCompliance & { company: CompanyAccount })[]>;
  markComplianceComplete(id: string, hoursCompleted: number): Promise<CompanyCompliance>;
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
        and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId))
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

  async getCourses(filters?: { type?: string; targetLicense?: string }): Promise<Course[]> {
    let query = db.select().from(courses) as any;
    
    if (filters?.type) {
      query = query.where(eq(courses.type, filters.type));
    }
    if (filters?.targetLicense) {
      query = query.where(eq(courses.targetLicense, filters.targetLicense));
    }
    
    return await query;
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getComplianceRequirement(userId: string): Promise<ComplianceRequirement | undefined> {
    const [requirement] = await db
      .select()
      .from(complianceRequirements)
      .where(eq(complianceRequirements.userId, userId));
    return requirement;
  }

  async createComplianceRequirement(
    requirement: Omit<ComplianceRequirement, 'id' | 'updatedAt'>
  ): Promise<ComplianceRequirement> {
    const [result] = await db
      .insert(complianceRequirements)
      .values(requirement)
      .returning();
    return result;
  }

  async updateEnrollmentHours(
    enrollmentId: string,
    hoursCompleted: number
  ): Promise<Enrollment> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, enrollmentId));

    if (!enrollment) throw new Error("Enrollment not found");

    const [updated] = await db
      .update(enrollments)
      .set({ hoursCompleted })
      .where(eq(enrollments.id, enrollmentId))
      .returning();
    
    return updated;
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id));
    return org;
  }

  async getOrganizationBySlug(slug: string): Promise<Organization | undefined> {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, slug));
    return org;
  }

  async createOrganization(
    org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Organization> {
    const [created] = await db
      .insert(organizations)
      .values(org)
      .returning();
    return created;
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    const userOrgs = await db
      .select({ id: organizations.id })
      .from(userOrganizations)
      .innerJoin(organizations, eq(userOrganizations.organizationId, organizations.id))
      .where(eq(userOrganizations.userId, userId));

    const orgIds = userOrgs.map((uo: any) => uo.id);
    if (orgIds.length === 0) return [];

    return await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgIds[0]));
  }

  async getOrganizationCourses(organizationId: string): Promise<Course[]> {
    const orgCourses = await db
      .select({ courseId: organizationCourses.courseId })
      .from(organizationCourses)
      .where(
        and(
          eq(organizationCourses.organizationId, organizationId),
          eq(organizationCourses.isActive, 1)
        )
      );

    const courseIds = orgCourses.map((oc: any) => oc.courseId);
    if (courseIds.length === 0) return [];

    return await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseIds[0]));
  }

  async getCompanyAccount(id: string): Promise<CompanyAccount | undefined> {
    const [account] = await db
      .select()
      .from(companyAccounts)
      .where(eq(companyAccounts.id, id));
    return account;
  }

  async createCompanyAccount(
    account: Omit<CompanyAccount, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CompanyAccount> {
    const [created] = await db
      .insert(companyAccounts)
      .values(account)
      .returning();
    return created;
  }

  async getCompanyCompliance(companyId: string): Promise<CompanyCompliance[]> {
    return await db
      .select()
      .from(companyCompliance)
      .where(eq(companyCompliance.companyId, companyId));
  }

  async createCompanyCompliance(
    compliance: Omit<CompanyCompliance, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CompanyCompliance> {
    const [created] = await db
      .insert(companyCompliance)
      .values(compliance)
      .returning();
    return created;
  }

  async updateCompanyCompliance(id: string, data: Partial<CompanyCompliance>): Promise<CompanyCompliance> {
    const [updated] = await db
      .update(companyCompliance)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(companyCompliance.id, id))
      .returning();
    return updated;
  }

  async getExpiringCompliance(daysUntilExpiry: number): Promise<(CompanyCompliance & { company: CompanyAccount })[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysUntilExpiry);

    return await db
      .select()
      .from(companyCompliance)
      .innerJoin(companyAccounts, eq(companyCompliance.companyId, companyAccounts.id))
      .where(
        and(
          lt(companyCompliance.expirationDate, futureDate),
          gte(companyCompliance.expirationDate, new Date()),
          eq(companyCompliance.isCompliant, 0)
        )
      );
  }

  async markComplianceComplete(id: string, hoursCompleted: number): Promise<CompanyCompliance> {
    const [updated] = await db
      .update(companyCompliance)
      .set({ 
        hoursCompleted,
        isCompliant: 1,
        completedDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(companyCompliance.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
