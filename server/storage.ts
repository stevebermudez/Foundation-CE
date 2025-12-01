import { users, enrollments, courses, complianceRequirements, organizations, userOrganizations, organizationCourses, courseBundles, bundleCourses, bundleEnrollments, sirconReports, dbprReports, userLicenses, ceReviews, supervisors, practiceExams, examQuestions, examAttempts, examAnswers, subscriptions, coupons, couponUsage, emailCampaigns, emailRecipients, emailTracking, units, lessons, lessonProgress, certificates, videos, type User, type UpsertUser, type Course, type Enrollment, type ComplianceRequirement, type Organization, type CourseBundle, type BundleEnrollment, type SirconReport, type UserLicense, type CEReview, type Supervisor, type PracticeExam, type ExamQuestion, type ExamAttempt, type ExamAnswer, type Subscription, type Coupon, type CouponUsage, type EmailCampaign, type EmailRecipient, type EmailTracking, type Unit, type Lesson, type LessonProgress, type Certificate, type Video } from "@shared/schema";
import { eq, and, lt, gte, desc, sql, inArray } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
  getCourseBundles(filters?: { state?: string; licenseType?: string }): Promise<CourseBundle[]>;
  getCourseBundle(id: string): Promise<CourseBundle | undefined>;
  getBundleCourses(bundleId: string): Promise<Course[]>;
  createBundleEnrollment(userId: string, bundleId: string): Promise<BundleEnrollment>;
  getBundleEnrollment(userId: string, bundleId: string): Promise<BundleEnrollment | undefined>;
  createSirconReport(report: Omit<SirconReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<SirconReport>;
  getSirconReport(enrollmentId: string): Promise<SirconReport | undefined>;
  updateSirconReport(id: string, data: Partial<SirconReport>): Promise<SirconReport>;
  createDBPRReport(report: Omit<SirconReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<SirconReport>;
  getDBPRReport(enrollmentId: string): Promise<SirconReport | undefined>;
  updateDBPRReport(id: string, data: Partial<SirconReport>): Promise<SirconReport>;
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
  getPracticeExams(courseId: string): Promise<PracticeExam[]>;
  getPracticeExam(examId: string): Promise<PracticeExam | undefined>;
  getExamQuestions(examId: string): Promise<ExamQuestion[]>;
  createExamAttempt(attempt: Omit<ExamAttempt, 'id' | 'createdAt'>): Promise<ExamAttempt>;
  submitExamAnswer(answer: Omit<ExamAnswer, 'id' | 'answeredAt'>): Promise<ExamAnswer>;
  completeExamAttempt(attemptId: string, score: number, correctAnswers: number, passed: number, timeSpent: number): Promise<ExamAttempt>;
  getUserExamAttempts(userId: string, examId: string): Promise<ExamAttempt[]>;
  getUserSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription>;
  updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription>;
  cancelSubscription(id: string): Promise<Subscription>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  validateCoupon(code: string, productType?: string): Promise<{ valid: boolean; discount?: number; message: string }>;
  applyCoupon(userId: string, couponId: string, enrollmentId?: string, discountAmount?: number): Promise<CouponUsage>;
  getCompletedEnrollments(userId: string): Promise<(Enrollment & { course: Course })[]>;
  resetEnrollment(enrollmentId: string): Promise<Enrollment>;
  createEmailCampaign(campaign: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailCampaign>;
  getEmailCampaign(id: string): Promise<EmailCampaign | undefined>;
  updateEmailCampaign(id: string, data: Partial<EmailCampaign>): Promise<EmailCampaign>;
  addEmailRecipients(campaignId: string, recipients: Array<{ userId: string; email: string }>): Promise<EmailRecipient[]>;
  getEmailRecipients(campaignId: string): Promise<EmailRecipient[]>;
  markEmailSent(recipientId: string): Promise<EmailRecipient>;
  trackEmailOpen(recipientId: string, campaignId: string, userId: string, userAgent?: string, ipAddress?: string): Promise<EmailTracking>;
  trackEmailClick(recipientId: string, campaignId: string, userId: string, linkUrl: string, userAgent?: string, ipAddress?: string): Promise<EmailTracking>;
  getCampaignStats(campaignId: string): Promise<{ campaign: EmailCampaign; recipients: EmailRecipient[]; tracking: EmailTracking[] }>;
  getUnits(courseId: string): Promise<Unit[]>;
  getLessons(unitId: string): Promise<Lesson[]>;
  saveLessonProgress(enrollmentId: string, userId: string, lessonId: string, timeSpentMinutes: number, completed: boolean): Promise<LessonProgress>;
  getLessonProgress(enrollmentId: string, lessonId: string): Promise<LessonProgress | undefined>;
  getEnrollmentProgress(enrollmentId: string): Promise<{ completed: number; total: number; percentage: number }>;
  createCertificate(enrollmentId: string, userId: string, courseId: string): Promise<Certificate>;
  getCertificate(enrollmentId: string): Promise<Certificate | undefined>;
  isAdmin(userId: string): Promise<boolean>;
  adminOverrideEnrollment(enrollmentId: string, hoursCompleted: number, completed: boolean): Promise<Enrollment>;
  createUnit(courseId: string, unitNumber: number, title: string, description?: string, hoursRequired?: number): Promise<Unit>;
  updateUnit(unitId: string, data: Partial<Unit>): Promise<Unit>;
  deleteUnit(unitId: string): Promise<void>;
  createLesson(unitId: string, lessonNumber: number, title: string, videoUrl?: string, durationMinutes?: number): Promise<Lesson>;
  updateLesson(lessonId: string, data: Partial<Lesson>): Promise<Lesson>;
  deleteLesson(lessonId: string): Promise<void>;
  adminOverrideEnrollmentData(enrollmentId: string, data: Partial<Enrollment>): Promise<Enrollment>;
  adminOverrideLessonProgress(lessonProgressId: string, data: Partial<LessonProgress>): Promise<LessonProgress>;
  adminOverrideExamAttempt(attemptId: string, score: number, passed: boolean): Promise<ExamAttempt>;
  adminOverrideUserData(userId: string, data: Partial<User>): Promise<User>;
  getVideos(courseId: string): Promise<Video[]>;
  getUnitVideos(unitId: string): Promise<Video[]>;
  getVideo(videoId: string): Promise<Video | undefined>;
  createVideo(courseId: string, uploadedBy: string, title: string, videoUrl: string, thumbnailUrl?: string, description?: string, durationMinutes?: number, unitId?: string): Promise<Video>;
  updateVideo(videoId: string, data: Partial<Video>): Promise<Video>;
  deleteVideo(videoId: string): Promise<void>;
  attachVideoToLesson(lessonId: string, videoId: string): Promise<Lesson>;
  exportCourseData(courseId: string): Promise<any>;
  exportUserEnrollmentData(userId: string, courseId?: string): Promise<any>;
  exportProgressData(enrollmentId: string): Promise<any>;
  exportRealEstateExpressFormat(enrollmentId: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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
    try {
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
      
      const result = await query;
      return result || [];
    } catch (err) {
      console.error("Error fetching courses:", err);
      return [];
    }
  }

  async getCourse(id: string): Promise<Course | undefined> {
    try {
      const result = await db.select().from(courses).where(eq(courses.id, id));
      return result && result.length > 0 ? result[0] : undefined;
    } catch (err) {
      console.error(`Error fetching course ${id}:`, err);
      return undefined;
    }
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
      .where(inArray(organizations.id, orgIds));
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
      .where(inArray(courses.id, courseIds));
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
    try {
      const [bundle] = await db
        .select()
        .from(courseBundles)
        .where(eq(courseBundles.id, id));
      return bundle;
    } catch (error) {
      return undefined;
    }
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
      .where(inArray(courses.id, courseIds));
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

  async createDBPRReport(
    report: Omit<SirconReport, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SirconReport> {
    const [created] = await db
      .insert(dbprReports)
      .values(report)
      .returning();
    return created;
  }

  async getDBPRReport(enrollmentId: string): Promise<SirconReport | undefined> {
    const [report] = await db
      .select()
      .from(dbprReports)
      .where(eq(dbprReports.enrollmentId, enrollmentId));
    return report;
  }

  async updateDBPRReport(id: string, data: Partial<SirconReport>): Promise<SirconReport> {
    const [updated] = await db
      .update(dbprReports)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(dbprReports.id, id))
      .returning();
    return updated;
  }

  async createUserLicense(license: Omit<UserLicense, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserLicense> {
    const [created] = await db
      .insert(userLicenses)
      .values(license)
      .returning();
    return created;
  }

  async getUserLicenses(userId: string): Promise<UserLicense[]> {
    return await db
      .select()
      .from(userLicenses)
      .where(eq(userLicenses.userId, userId))
      .orderBy(desc(userLicenses.createdAt));
  }

  async updateUserLicense(id: string, data: Partial<UserLicense>): Promise<UserLicense> {
    const [updated] = await db
      .update(userLicenses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userLicenses.id, id))
      .returning();
    return updated;
  }

  async getExpiringLicenses(daysUntilExpiry: number): Promise<UserLicense[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysUntilExpiry);
    
    return await db
      .select()
      .from(userLicenses)
      .where(
        and(
          lt(userLicenses.expirationDate, futureDate),
          gte(userLicenses.expirationDate, new Date()),
          eq(userLicenses.status, "active")
        )
      )
      .orderBy(userLicenses.expirationDate);
  }

  async createCEReview(review: Omit<CEReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<CEReview> {
    const [created] = await db
      .insert(ceReviews)
      .values(review)
      .returning();
    return created;
  }

  async getPendingCEReviews(supervisorId: string): Promise<any[]> {
    return await db
      .select()
      .from(ceReviews)
      .innerJoin(users, eq(ceReviews.userId, users.id))
      .innerJoin(courses, eq(ceReviews.courseId, courses.id))
      .innerJoin(enrollments, eq(ceReviews.enrollmentId, enrollments.id))
      .where(
        and(
          eq(ceReviews.supervisorId, supervisorId),
          eq(ceReviews.reviewStatus, "pending")
        )
      )
      .orderBy(desc(ceReviews.createdAt));
  }

  async approveCEReview(id: string, notes?: string): Promise<CEReview> {
    const [updated] = await db
      .update(ceReviews)
      .set({ 
        reviewStatus: "approved", 
        reviewNotes: notes,
        reviewedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(ceReviews.id, id))
      .returning();
    return updated;
  }

  async rejectCEReview(id: string, notes: string): Promise<CEReview> {
    const [updated] = await db
      .update(ceReviews)
      .set({ 
        reviewStatus: "rejected", 
        reviewNotes: notes,
        reviewedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(ceReviews.id, id))
      .returning();
    return updated;
  }

  async getSupervisor(userId: string): Promise<Supervisor | undefined> {
    const [supervisor] = await db
      .select()
      .from(supervisors)
      .where(eq(supervisors.userId, userId));
    return supervisor;
  }

  async createSupervisor(supervisor: Omit<Supervisor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supervisor> {
    const [created] = await db
      .insert(supervisors)
      .values(supervisor)
      .returning();
    return created;
  }

  async getPracticeExams(courseId: string): Promise<PracticeExam[]> {
    return await db
      .select()
      .from(practiceExams)
      .where(and(eq(practiceExams.courseId, courseId), eq(practiceExams.isActive, 1)))
      .orderBy(practiceExams.createdAt);
  }

  async getPracticeExam(examId: string): Promise<PracticeExam | undefined> {
    const [exam] = await db.select().from(practiceExams).where(eq(practiceExams.id, examId));
    return exam;
  }

  async getExamQuestions(examId: string): Promise<ExamQuestion[]> {
    return await db
      .select()
      .from(examQuestions)
      .where(eq(examQuestions.examId, examId))
      .orderBy(examQuestions.sequence);
  }

  async createExamAttempt(attempt: Omit<ExamAttempt, 'id' | 'createdAt'>): Promise<ExamAttempt> {
    const [created] = await db
      .insert(examAttempts)
      .values(attempt)
      .returning();
    return created;
  }

  async submitExamAnswer(answer: Omit<ExamAnswer, 'id' | 'answeredAt'>): Promise<ExamAnswer> {
    const [created] = await db
      .insert(examAnswers)
      .values(answer)
      .returning();
    return created;
  }

  async completeExamAttempt(
    attemptId: string,
    score: number,
    correctAnswers: number,
    passed: number,
    timeSpent: number
  ): Promise<ExamAttempt> {
    const [updated] = await db
      .update(examAttempts)
      .set({
        score,
        correctAnswers,
        passed,
        timeSpent,
        completedAt: new Date(),
      })
      .where(eq(examAttempts.id, attemptId))
      .returning();
    return updated;
  }

  async getUserExamAttempts(userId: string, examId: string): Promise<ExamAttempt[]> {
    return await db
      .select()
      .from(examAttempts)
      .where(and(eq(examAttempts.userId, userId), eq(examAttempts.examId, examId)))
      .orderBy(desc(examAttempts.createdAt));
  }

  async getUserSubscription(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    return subscription;
  }

  async createSubscription(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    const [created] = await db
      .insert(subscriptions)
      .values(subscription)
      .returning();
    return created;
  }

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription> {
    const [updated] = await db
      .update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return updated;
  }

  async cancelSubscription(id: string): Promise<Subscription> {
    const [updated] = await db
      .update(subscriptions)
      .set({ 
        status: "cancelled",
        cancelledAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, id))
      .returning();
    return updated;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code));
    return coupon;
  }

  async validateCoupon(code: string, productType?: string): Promise<{ valid: boolean; discount?: number; message: string }> {
    const coupon = await this.getCouponByCode(code);
    
    if (!coupon) {
      return { valid: false, message: "Coupon code not found" };
    }

    if (!coupon.isActive) {
      return { valid: false, message: "Coupon is inactive" };
    }

    if (coupon.expirationDate && new Date() > coupon.expirationDate) {
      return { valid: false, message: "Coupon has expired" };
    }

    if (coupon.maxUses && (coupon.timesUsed ?? 0) >= coupon.maxUses) {
      return { valid: false, message: "Coupon usage limit reached" };
    }

    return { 
      valid: true, 
      discount: coupon.discountValue,
      message: "Coupon is valid"
    };
  }

  async applyCoupon(userId: string, couponId: string, enrollmentId?: string, discountAmount?: number): Promise<CouponUsage> {
    // Increment usage count
    await db
      .update(coupons)
      .set({ timesUsed: sql`${coupons.timesUsed} + 1` })
      .where(eq(coupons.id, couponId));

    // Record usage
    const [usage] = await db
      .insert(couponUsage)
      .values({
        userId,
        couponId,
        enrollmentId,
        discountAmount: discountAmount || 0,
      })
      .returning();
    return usage;
  }

  async getCompletedEnrollments(userId: string): Promise<(Enrollment & { course: Course })[]> {
    const completed = await db
      .select()
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.completed, 1)
        )
      )
      .orderBy(desc(enrollments.completedAt));

    return completed.map((row: any) => ({
      ...row.enrollments,
      course: row.courses
    }));
  }

  async resetEnrollment(enrollmentId: string): Promise<Enrollment> {
    const [updated] = await db
      .update(enrollments)
      .set({
        completed: 0,
        completedAt: null,
        progress: 0,
        hoursCompleted: 0,
        certificateUrl: null
      })
      .where(eq(enrollments.id, enrollmentId))
      .returning();
    return updated;
  }

  async createEmailCampaign(campaign: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailCampaign> {
    const [created] = await db
      .insert(emailCampaigns)
      .values(campaign)
      .returning();
    return created;
  }

  async getEmailCampaign(id: string): Promise<EmailCampaign | undefined> {
    const [campaign] = await db
      .select()
      .from(emailCampaigns)
      .where(eq(emailCampaigns.id, id));
    return campaign;
  }

  async updateEmailCampaign(id: string, data: Partial<EmailCampaign>): Promise<EmailCampaign> {
    const [updated] = await db
      .update(emailCampaigns)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(emailCampaigns.id, id))
      .returning();
    return updated;
  }

  async addEmailRecipients(campaignId: string, recipients: Array<{ userId: string; email: string }>): Promise<EmailRecipient[]> {
    const created = await db
      .insert(emailRecipients)
      .values(recipients.map(r => ({ campaignId, ...r })))
      .returning();
    
    // Update recipient count in campaign
    await db
      .update(emailCampaigns)
      .set({ recipientCount: sql`${emailCampaigns.recipientCount} + ${recipients.length}` })
      .where(eq(emailCampaigns.id, campaignId));
    
    return created;
  }

  async getEmailRecipients(campaignId: string): Promise<EmailRecipient[]> {
    return await db
      .select()
      .from(emailRecipients)
      .where(eq(emailRecipients.campaignId, campaignId))
      .orderBy(desc(emailRecipients.createdAt));
  }

  async markEmailSent(recipientId: string): Promise<EmailRecipient> {
    const [updated] = await db
      .update(emailRecipients)
      .set({ status: "sent", sentAt: new Date() })
      .where(eq(emailRecipients.id, recipientId))
      .returning();
    
    // Update sent count in campaign
    if (updated.campaignId) {
      await db
        .update(emailCampaigns)
        .set({ sentCount: sql`${emailCampaigns.sentCount} + 1` })
        .where(eq(emailCampaigns.id, updated.campaignId));
    }
    
    return updated;
  }

  async trackEmailOpen(recipientId: string, campaignId: string, userId: string, userAgent?: string, ipAddress?: string): Promise<EmailTracking> {
    const [tracking] = await db
      .insert(emailTracking)
      .values({
        recipientId,
        campaignId,
        userId,
        eventType: "open",
        userAgent: userAgent || null,
        ipAddress: ipAddress || null
      })
      .returning();
    
    // Mark recipient as opened and update campaign stats
    await db
      .update(emailRecipients)
      .set({ openedAt: new Date() })
      .where(eq(emailRecipients.id, recipientId));
    
    await db
      .update(emailCampaigns)
      .set({ openCount: sql`${emailCampaigns.openCount} + 1` })
      .where(eq(emailCampaigns.id, campaignId));
    
    return tracking;
  }

  async trackEmailClick(recipientId: string, campaignId: string, userId: string, linkUrl: string, userAgent?: string, ipAddress?: string): Promise<EmailTracking> {
    const [tracking] = await db
      .insert(emailTracking)
      .values({
        recipientId,
        campaignId,
        userId,
        eventType: "click",
        linkUrl,
        userAgent: userAgent || null,
        ipAddress: ipAddress || null
      })
      .returning();
    
    // Mark recipient as clicked and update campaign stats
    await db
      .update(emailRecipients)
      .set({ clickedAt: new Date() })
      .where(eq(emailRecipients.id, recipientId));
    
    await db
      .update(emailCampaigns)
      .set({ clickCount: sql`${emailCampaigns.clickCount} + 1` })
      .where(eq(emailCampaigns.id, campaignId));
    
    return tracking;
  }

  async getCampaignStats(campaignId: string): Promise<{ campaign: EmailCampaign; recipients: EmailRecipient[]; tracking: EmailTracking[] }> {
    const campaign = await this.getEmailCampaign(campaignId);
    const recipients = await this.getEmailRecipients(campaignId);
    const tracking = await db
      .select()
      .from(emailTracking)
      .where(eq(emailTracking.campaignId, campaignId));
    
    return {
      campaign: campaign!,
      recipients,
      tracking
    };
  }

  async getUnits(courseId: string): Promise<Unit[]> {
    return await db.select().from(units).where(eq(units.courseId, courseId)).orderBy(units.unitNumber);
  }

  async getLessons(unitId: string): Promise<Lesson[]> {
    return await db.select().from(lessons).where(eq(lessons.unitId, unitId)).orderBy(lessons.lessonNumber);
  }

  async saveLessonProgress(enrollmentId: string, userId: string, lessonId: string, timeSpentMinutes: number, completed: boolean): Promise<LessonProgress> {
    const existing = await db.select().from(lessonProgress).where(and(eq(lessonProgress.enrollmentId, enrollmentId), eq(lessonProgress.lessonId, lessonId)));
    
    if (existing.length > 0) {
      const [updated] = await db.update(lessonProgress).set({
        completed: completed ? 1 : 0,
        timeSpentMinutes,
        completedAt: completed ? new Date() : null,
        lastAccessedAt: new Date(),
        updatedAt: new Date()
      }).where(eq(lessonProgress.id, existing[0].id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(lessonProgress).values({
        enrollmentId,
        userId,
        lessonId,
        completed: completed ? 1 : 0,
        timeSpentMinutes,
        completedAt: completed ? new Date() : null
      }).returning();
      return created;
    }
  }

  async getLessonProgress(enrollmentId: string, lessonId: string): Promise<LessonProgress | undefined> {
    const [progress] = await db.select().from(lessonProgress).where(and(eq(lessonProgress.enrollmentId, enrollmentId), eq(lessonProgress.lessonId, lessonId)));
    return progress;
  }

  async getEnrollmentProgress(enrollmentId: string): Promise<{ completed: number; total: number; percentage: number }> {
    const enrollment = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId));
    if (!enrollment.length) return { completed: 0, total: 0, percentage: 0 };
    
    const courseId = enrollment[0].courseId;
    const allUnits = await this.getUnits(courseId);
    
    let totalLessons = 0;
    let completedLessons = 0;
    
    for (const unit of allUnits) {
      const unitLessons = await this.getLessons(unit.id);
      totalLessons += unitLessons.length;
      
      for (const lesson of unitLessons) {
        const progress = await this.getLessonProgress(enrollmentId, lesson.id);
        if (progress?.completed === 1) completedLessons++;
      }
    }
    
    return {
      completed: completedLessons,
      total: totalLessons,
      percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    };
  }

  async createCertificate(enrollmentId: string, userId: string, courseId: string): Promise<Certificate> {
    const certNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const [cert] = await db.insert(certificates).values({
      enrollmentId,
      userId,
      courseId,
      certificateNumber: certNumber,
      issuedDate: new Date(),
      expirationDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) // 2 years
    }).returning();
    return cert;
  }

  async getCertificate(enrollmentId: string): Promise<Certificate | undefined> {
    const [cert] = await db.select().from(certificates).where(eq(certificates.enrollmentId, enrollmentId));
    return cert;
  }

  async isAdmin(userId: string): Promise<boolean> {
    const admin = await db.select().from(supervisors).where(eq(supervisors.userId, userId)).limit(1);
    return admin.length > 0 && admin[0].role === "admin";
  }

  async adminOverrideEnrollment(enrollmentId: string, hoursCompleted: number, completed: boolean): Promise<Enrollment> {
    const [updated] = await db.update(enrollments).set({
      hoursCompleted,
      completed: completed ? 1 : 0,
      completedAt: completed ? new Date() : null,
      progress: 100
    }).where(eq(enrollments.id, enrollmentId)).returning();
    return updated;
  }

  async createUnit(courseId: string, unitNumber: number, title: string, description?: string, hoursRequired?: number): Promise<Unit> {
    const [unit] = await db.insert(units).values({
      courseId,
      unitNumber,
      title,
      description: description || null,
      hoursRequired: hoursRequired || 3
    }).returning();
    return unit;
  }

  async updateUnit(unitId: string, data: Partial<Unit>): Promise<Unit> {
    const [updated] = await db.update(units).set(data).where(eq(units.id, unitId)).returning();
    return updated;
  }

  async deleteUnit(unitId: string): Promise<void> {
    await db.delete(lessons).where(eq(lessons.unitId, unitId));
    await db.delete(units).where(eq(units.id, unitId));
  }

  async createLesson(unitId: string, lessonNumber: number, title: string, videoUrl?: string, durationMinutes?: number): Promise<Lesson> {
    const [lesson] = await db.insert(lessons).values({
      unitId,
      lessonNumber,
      title,
      videoUrl: videoUrl || null,
      durationMinutes: durationMinutes || 15
    }).returning();
    return lesson;
  }

  async updateLesson(lessonId: string, data: Partial<Lesson>): Promise<Lesson> {
    const [updated] = await db.update(lessons).set(data).where(eq(lessons.id, lessonId)).returning();
    return updated;
  }

  async deleteLesson(lessonId: string): Promise<void> {
    await db.delete(lessons).where(eq(lessons.id, lessonId));
  }

  async adminOverrideEnrollmentData(enrollmentId: string, data: Partial<Enrollment>): Promise<Enrollment> {
    const [updated] = await db.update(enrollments).set({
      ...data,
      updatedAt: new Date()
    }).where(eq(enrollments.id, enrollmentId)).returning();
    return updated;
  }

  async adminOverrideLessonProgress(lessonProgressId: string, data: Partial<LessonProgress>): Promise<LessonProgress> {
    const [updated] = await db.update(lessonProgress).set({
      ...data,
      updatedAt: new Date()
    }).where(eq(lessonProgress.id, lessonProgressId)).returning();
    return updated;
  }

  async adminOverrideExamAttempt(attemptId: string, score: number, passed: boolean): Promise<ExamAttempt> {
    const [updated] = await db.update(examAttempts).set({
      score,
      passed: passed ? 1 : 0,
      completedAt: new Date()
    }).where(eq(examAttempts.id, attemptId)).returning();
    return updated;
  }

  async adminOverrideUserData(userId: string, data: Partial<User>): Promise<User> {
    const [updated] = await db.update(users).set({
      ...data,
      updatedAt: new Date()
    }).where(eq(users.id, userId)).returning();
    return updated;
  }

  async getVideos(courseId: string): Promise<Video[]> {
    return await db.select().from(videos).where(eq(videos.courseId, courseId)).orderBy(videos.createdAt);
  }

  async getUnitVideos(unitId: string): Promise<Video[]> {
    return await db.select().from(videos).where(eq(videos.unitId, unitId)).orderBy(videos.createdAt);
  }

  async getVideo(videoId: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, videoId));
    return video;
  }

  async createVideo(courseId: string, uploadedBy: string, title: string, videoUrl: string, thumbnailUrl?: string, description?: string, durationMinutes?: number, unitId?: string): Promise<Video> {
    const [video] = await db.insert(videos).values({
      courseId,
      unitId: unitId || null,
      uploadedBy,
      title,
      videoUrl,
      thumbnailUrl: thumbnailUrl || null,
      description: description || null,
      durationMinutes: durationMinutes || null
    }).returning();
    return video;
  }

  async updateVideo(videoId: string, data: Partial<Video>): Promise<Video> {
    const [updated] = await db.update(videos).set({
      ...data,
      updatedAt: new Date()
    }).where(eq(videos.id, videoId)).returning();
    return updated;
  }

  async deleteVideo(videoId: string): Promise<void> {
    await db.delete(lessons).where(eq(lessons.videoId, videoId));
    await db.delete(videos).where(eq(videos.id, videoId));
  }

  async attachVideoToLesson(lessonId: string, videoId: string): Promise<Lesson> {
    const [updated] = await db.update(lessons).set({
      videoId,
      updatedAt: new Date()
    }).where(eq(lessons.id, lessonId)).returning();
    return updated;
  }

  async exportCourseData(courseId: string): Promise<any> {
    const course = await this.getCourse(courseId);
    const unitList = await this.getUnits(courseId);
    const unitsWithLessons = await Promise.all(unitList.map(async (unit) => ({
      ...unit,
      lessons: await this.getLessons(unit.id),
      videos: await this.getUnitVideos(unit.id)
    })));
    const courseVideos = await this.getVideos(courseId);
    return {
      course,
      units: unitsWithLessons,
      videos: courseVideos,
      exportedAt: new Date().toISOString(),
      formatVersion: "1.0"
    };
  }

  async exportUserEnrollmentData(userId: string, courseId?: string): Promise<any> {
    const enrollmentList = await db.select().from(enrollments).where(
      courseId ? and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)) : eq(enrollments.userId, userId)
    );
    return {
      userId,
      enrollments: enrollmentList,
      exportedAt: new Date().toISOString(),
      formatVersion: "1.0"
    };
  }

  async exportProgressData(enrollmentId: string): Promise<any> {
    const enrollment = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId)).then(r => r[0]);
    const progressList = await db.select().from(lessonProgress).where(eq(lessonProgress.enrollmentId, enrollmentId));
    const cert = await this.getCertificate(enrollmentId);
    return {
      enrollmentId,
      enrollment,
      lessonProgress: progressList,
      certificate: cert,
      exportedAt: new Date().toISOString(),
      formatVersion: "1.0"
    };
  }

  async exportRealEstateExpressFormat(enrollmentId: string): Promise<any> {
    const enrollment = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId)).then(r => r[0]);
    if (!enrollment) throw new Error("Enrollment not found");
    
    const user = await this.getUser(enrollment.userId);
    const course = await this.getCourse(enrollment.courseId);
    const progressList = await db.select().from(lessonProgress).where(eq(lessonProgress.enrollmentId, enrollmentId));
    const cert = await this.getCertificate(enrollmentId);
    
    const completedHours = progressList.filter(p => p.completed).length * 3; // Assuming 3 hours per lesson
    
    return {
      // Real Estate Express compatible format
      studentId: user?.id || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      licenseNumber: user?.licenseNumber || "",
      courseCode: course?.sku || "",
      courseName: course?.name || "",
      completionStatus: enrollment.completed ? "completed" : "in_progress",
      completionDate: cert?.issuedDate || null,
      certificateNumber: cert?.certificateNumber || null,
      hoursCompleted: completedHours,
      hoursRequired: course?.hoursRequired || 0,
      lessonsCompleted: progressList.filter(p => p.completed).length,
      totalLessons: progressList.length,
      progressPercentage: enrollment.progress || 0,
      exportedAt: new Date().toISOString(),
      formatVersion: "ree-1.0",
      systemId: "foundationCE"
    };
  }
}

export const storage = new DatabaseStorage();
