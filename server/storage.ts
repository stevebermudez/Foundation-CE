import { users, enrollments, courses, complianceRequirements, organizations, userOrganizations, organizationCourses, companyAccounts, companyCompliance, courseBundles, bundleCourses, bundleEnrollments, sirconReports, userLicenses, ceReviews, supervisors, type User, type UpsertUser, type Course, type Enrollment, type ComplianceRequirement, type Organization, type CompanyAccount, type CompanyCompliance, type CourseBundle, type BundleEnrollment, type SirconReport, type UserLicense, type CEReview, type Supervisor } from "@shared/schema";
import { eq, and, lt, gte, desc, sql } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined>;
  createEnrollment(userId: string, courseId: string): Promise<Enrollment>;
  getCourses(filters?: { state?: string; licenseType?: string; requirementBucket?: string }): Promise<Course[]>;
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
  getCourseBundles(filters?: { state?: string; licenseType?: string }): Promise<CourseBundle[]>;
  getCourseBundle(id: string): Promise<CourseBundle | undefined>;
  getBundleCourses(bundleId: string): Promise<Course[]>;
  createBundleEnrollment(userId: string, bundleId: string): Promise<BundleEnrollment>;
  getBundleEnrollment(userId: string, bundleId: string): Promise<BundleEnrollment | undefined>;
  createSirconReport(report: Omit<SirconReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<SirconReport>;
  getSirconReport(enrollmentId: string): Promise<SirconReport | undefined>;
  updateSirconReport(id: string, data: Partial<SirconReport>): Promise<SirconReport>;
  createUserLicense(license: Omit<UserLicense, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserLicense>;
  getUserLicenses(userId: string): Promise<UserLicense[]>;
  updateUserLicense(id: string, data: Partial<UserLicense>): Promise<UserLicense>;
  getExpiringLicenses(daysUntilExpiry: number): Promise<UserLicense[]>;
  createCEReview(review: Omit<CEReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<CEReview>;
  getPendingCEReviews(supervisorId: string): Promise<(CEReview & { user: User; course: Course; enrollment: Enrollment })[]>;
  approveCEReview(id: string, notes?: string): Promise<CEReview>;
  rejectCEReview(id: string, notes: string): Promise<CEReview>;
  getSupervisor(userId: string): Promise<Supervisor | undefined>;
  createSupervisor(supervisor: Omit<Supervisor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supervisor>;
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

  async getCourses(filters?: { state?: string; licenseType?: string; requirementBucket?: string }): Promise<Course[]> {
    let query = db.select().from(courses) as any;
    
    if (filters?.state) {
      query = query.where(eq(courses.state, filters.state));
    }
    if (filters?.licenseType) {
      query = query.where(eq(courses.licenseType, filters.licenseType));
    }
    if (filters?.requirementBucket) {
      query = query.where(eq(courses.requirementBucket, filters.requirementBucket));
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

  async getExpiringCompliance(daysUntilExpiry: number): Promise<any[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysUntilExpiry);

    const results = await db
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
    
    return results.map((row: any) => ({
      ...row.company_compliance,
      company: row.company_accounts
    }));
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

  async getCourseBundles(filters?: { state?: string; licenseType?: string }): Promise<CourseBundle[]> {
    let query = db.select().from(courseBundles).where(eq(courseBundles.isActive, 1)) as any;
    
    if (filters?.state) {
      query = query.where(eq(courseBundles.state, filters.state));
    }
    if (filters?.licenseType) {
      query = query.where(eq(courseBundles.licenseType, filters.licenseType));
    }
    
    return await query;
  }

  async getCourseBundle(id: string): Promise<CourseBundle | undefined> {
    const [bundle] = await db
      .select()
      .from(courseBundles)
      .where(eq(courseBundles.id, id));
    return bundle;
  }

  async getBundleCourses(bundleId: string): Promise<Course[]> {
    const bundleCourseList = await db
      .select({ courseId: bundleCourses.courseId })
      .from(bundleCourses)
      .where(eq(bundleCourses.bundleId, bundleId))
      .orderBy(bundleCourses.sequence);

    const courseIds = bundleCourseList.map((bc: any) => bc.courseId);
    if (courseIds.length === 0) return [];

    return await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseIds[0]));
  }

  async createBundleEnrollment(userId: string, bundleId: string): Promise<BundleEnrollment> {
    const [enrollment] = await db
      .insert(bundleEnrollments)
      .values({ userId, bundleId })
      .returning();
    return enrollment;
  }

  async getBundleEnrollment(userId: string, bundleId: string): Promise<BundleEnrollment | undefined> {
    const [enrollment] = await db
      .select()
      .from(bundleEnrollments)
      .where(
        and(
          eq(bundleEnrollments.userId, userId),
          eq(bundleEnrollments.bundleId, bundleId)
        )
      );
    return enrollment;
  }

  async createSirconReport(
    report: Omit<SirconReport, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SirconReport> {
    const [created] = await db
      .insert(sirconReports)
      .values(report)
      .returning();
    return created;
  }

  async getSirconReport(enrollmentId: string): Promise<SirconReport | undefined> {
    const [report] = await db
      .select()
      .from(sirconReports)
      .where(eq(sirconReports.enrollmentId, enrollmentId));
    return report;
  }

  async updateSirconReport(id: string, data: Partial<SirconReport>): Promise<SirconReport> {
    const [updated] = await db
      .update(sirconReports)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sirconReports.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
