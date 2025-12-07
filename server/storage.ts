import { users, enrollments, courses, complianceRequirements, organizations, userOrganizations, organizationCourses, courseBundles, bundleCourses, bundleEnrollments, sirconReports, dbprReports, userLicenses, ceReviews, supervisors, practiceExams, examQuestions, examAttempts, examAnswers, subscriptions, coupons, couponUsage, emailCampaigns, emailRecipients, emailTracking, units, lessons, lessonProgress, unitProgress, questionBanks, bankQuestions, quizAttempts, quizAnswers, certificates, videos, notifications, purchases, accountCredits, refunds, systemSettings, emailTemplates, userRoles, userRoleAssignments, privacyConsents, dataSubjectRequests, auditLogs, userPrivacyPreferences, affiliates, affiliateLinks, affiliateVisits, affiliateConversions, affiliatePayouts, affiliateCoupons, affiliateCreatives, affiliateNotifications, affiliateCommissionTiers, type User, type UpsertUser, type Course, type Enrollment, type ComplianceRequirement, type Organization, type CourseBundle, type BundleEnrollment, type SirconReport, type DBPRReport, type UserLicense, type CEReview, type Supervisor, type PracticeExam, type ExamQuestion, type ExamAttempt, type ExamAnswer, type Subscription, type Coupon, type CouponUsage, type EmailCampaign, type EmailRecipient, type EmailTracking, type Unit, type Lesson, type LessonProgress, type UnitProgress, type QuestionBank, type BankQuestion, type QuizAttempt, type QuizAnswer, type Certificate, type Video, type Notification, type InsertNotification, type Purchase, type UpsertPurchase, type AccountCredit, type InsertAccountCredit, type Refund, type InsertRefund, type SystemSetting, type EmailTemplate, type UserRole, type UserRoleAssignment, type PrivacyConsent, type DataSubjectRequest, type AuditLog, type UserPrivacyPreference, type Affiliate, type InsertAffiliate, type AffiliateLink, type InsertAffiliateLink, type AffiliateVisit, type AffiliateConversion, type AffiliatePayout, type AffiliateCoupon, type AffiliateCreative, type AffiliateNotification, type AffiliateCommissionTier } from "@shared/schema";
import { eq, and, lt, gte, desc, sql, inArray } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined>;
  createEnrollment(userId: string, courseId: string): Promise<Enrollment>;
  isEnrollmentExpired(enrollment: Enrollment): boolean;
  getActiveEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined>;
  canRepurchaseCourse(userId: string, courseId: string): Promise<{ canRepurchase: boolean; reason?: string; previousEnrollment?: Enrollment }>;
  getCourses(filters?: { state?: string; licenseType?: string; requirementBucket?: string }): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  getCourseBySku(sku: string): Promise<Course | undefined>;
  createCourse?(courseData: any): Promise<Course>;
  updateCourse?(courseId: string, data: Partial<Course>): Promise<Course | undefined>;
  deleteCourse?(courseId: string): Promise<void>;
  getUsers?(): Promise<User[]>;
  getEnrollments?(): Promise<Enrollment[]>;
  createPracticeExam?(data: any): Promise<PracticeExam>;
  createExamQuestion?(data: any): Promise<ExamQuestion>;
  savePage?(slug: string, page: any): Promise<any>;
  getPage?(slug: string): Promise<any>;
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
  getSirconReportsByUser(userId: string): Promise<SirconReport[]>;
  updateSirconReport(id: string, data: Partial<SirconReport>): Promise<SirconReport>;
  createDBPRReport(report: Omit<DBPRReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<DBPRReport>;
  getDBPRReport(enrollmentId: string): Promise<DBPRReport | undefined>;
  getDBPRReportsByUser(userId: string): Promise<DBPRReport[]>;
  updateDBPRReport(id: string, data: Partial<DBPRReport>): Promise<DBPRReport>;
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
  getAllUserEnrollments(userId: string): Promise<(Enrollment & { course: Course })[]>;
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
  getUnit(unitId: string): Promise<Unit | undefined>;
  getLessons(unitId: string): Promise<Lesson[]>;
  getLesson(lessonId: string): Promise<Lesson | undefined>;
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
  createLesson(unitId: string, lessonNumber: number, title: string, videoUrl?: string, durationMinutes?: number, content?: string, imageUrl?: string): Promise<Lesson>;
  updateLesson(lessonId: string, data: Partial<Lesson>): Promise<Lesson>;
  deleteLesson(lessonId: string): Promise<void>;
  adminOverrideEnrollmentData(enrollmentId: string, data: Partial<Enrollment>): Promise<Enrollment>;
  adminOverrideLessonProgress(lessonProgressId: string, data: Partial<LessonProgress>): Promise<LessonProgress>;
  adminCreateLessonProgress(enrollmentId: string, lessonId: string, userId: string, completed?: boolean): Promise<LessonProgress>;
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
  exportCourseContentJSON(courseId: string): Promise<string>;
  exportCourseContentCSV(courseId: string): Promise<string>;
  exportCourseContentDocx(courseId: string, options?: {
    includeLessons?: boolean;
    includeQuizzes?: boolean;
    includeVideos?: boolean;
    includeDescriptions?: boolean;
    unitNumbers?: number[];
  }): Promise<Buffer>;
  exportAllUsersData(): Promise<string>;
  exportAllUsersDataCSV(): Promise<string>;
  exportEmailCampaignData(): Promise<string>;
  exportEmailCampaignDataCSV(): Promise<string>;
  
  // LMS Progress Tracking Methods
  getUnitProgress(enrollmentId: string, unitId: string): Promise<UnitProgress | undefined>;
  createUnitProgress(enrollmentId: string, unitId: string, userId: string): Promise<UnitProgress>;
  updateUnitProgress(id: string, data: Partial<UnitProgress>): Promise<UnitProgress>;
  getAllUnitProgress(enrollmentId: string): Promise<UnitProgress[]>;
  
  // Question Bank Methods
  getQuestionBank(bankId: string): Promise<QuestionBank | undefined>;
  getQuestionBankByUnit(unitId: string): Promise<QuestionBank | undefined>;
  getQuestionBanksByUnit(unitId: string): Promise<QuestionBank[]>;
  getQuestionBanksByCourse(courseId: string): Promise<QuestionBank[]>;
  getFinalExamBank(courseId: string): Promise<QuestionBank | undefined>;
  createQuestionBank(data: Omit<QuestionBank, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuestionBank>;
  updateQuestionBank(bankId: string, data: Partial<QuestionBank>): Promise<QuestionBank>;
  deleteQuestionBank(bankId: string): Promise<void>;
  getBankQuestions(bankId: string): Promise<BankQuestion[]>;
  getBankQuestion(questionId: string): Promise<BankQuestion | undefined>;
  createBankQuestion(data: Omit<BankQuestion, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankQuestion>;
  updateBankQuestion(questionId: string, data: Partial<BankQuestion>): Promise<BankQuestion>;
  deleteBankQuestion(questionId: string): Promise<void>;
  getRandomQuestions(bankId: string, count: number): Promise<BankQuestion[]>;
  
  // Quiz Attempt Methods
  createQuizAttempt(data: Omit<QuizAttempt, 'id' | 'createdAt'>): Promise<QuizAttempt>;
  getQuizAttempt(attemptId: string): Promise<QuizAttempt | undefined>;
  updateQuizAttempt(attemptId: string, data: Partial<QuizAttempt>): Promise<QuizAttempt>;
  getUserQuizAttempts(enrollmentId: string, bankId: string): Promise<QuizAttempt[]>;
  
  // Quiz Answer Methods
  createQuizAnswer(data: Omit<QuizAnswer, 'id' | 'answeredAt'>): Promise<QuizAnswer>;
  getQuizAnswers(attemptId: string): Promise<QuizAnswer[]>;
  
  // Progress Update Methods
  updateLessonTimeSpent(enrollmentId: string, lessonId: string, secondsToAdd: number): Promise<LessonProgress>;
  completeLesson(enrollmentId: string, lessonId: string, userId: string): Promise<LessonProgress>;
  updateEnrollmentProgress(enrollmentId: string, data: Partial<Enrollment>): Promise<Enrollment>;
  checkUnitCompletion(enrollmentId: string, unitId: string): Promise<{ lessonsComplete: boolean; quizPassed: boolean }>;
  unlockNextUnit(enrollmentId: string): Promise<UnitProgress | undefined>;
  getEnrollmentById(enrollmentId: string): Promise<Enrollment | undefined>;
  
  // Notification Methods
  createNotification(data: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  markNotificationRead(notificationId: string, userId: string): Promise<Notification | null>;
  markAllNotificationsRead(userId: string): Promise<void>;
  deleteNotification(notificationId: string, userId: string): Promise<boolean>;
  
  // Financial/Payment Methods
  createPurchase(data: UpsertPurchase): Promise<Purchase>;
  getPurchase(stripeSessionId: string): Promise<Purchase | undefined>;
  getPurchaseById(purchaseId: string): Promise<Purchase | undefined>;
  getPurchasesByUser(userId: string): Promise<Purchase[]>;
  getAllPurchases(): Promise<Purchase[]>;
  updatePurchaseStatus(purchaseId: string, status: string): Promise<Purchase>;
  
  // Account Credits Methods
  createAccountCredit(data: InsertAccountCredit): Promise<AccountCredit>;
  getAccountCredits(userId: string): Promise<AccountCredit[]>;
  getAccountCreditBalance(userId: string): Promise<number>;
  getAllAccountCredits(): Promise<AccountCredit[]>;
  
  // Refund Methods
  createRefund(data: InsertRefund): Promise<Refund>;
  getRefund(refundId: string): Promise<Refund | undefined>;
  getRefundsByUser(userId: string): Promise<Refund[]>;
  getRefundsByPurchase(purchaseId: string): Promise<Refund[]>;
  getAllRefunds(): Promise<Refund[]>;
  updateRefundStatus(refundId: string, status: string, stripeRefundId?: string): Promise<Refund>;
  
  // Financial Summary Methods
  getUserFinancialSummary(userId: string): Promise<{
    totalSpent: number;
    totalRefunded: number;
    creditBalance: number;
    purchases: Purchase[];
    refunds: Refund[];
    credits: AccountCredit[];
  }>;
  
  // System Settings Methods
  getSystemSetting(key: string): Promise<string | null>;
  setSystemSetting(key: string, value: string, category?: string, label?: string, description?: string, updatedBy?: string): Promise<any>;
  getSystemSettingsByCategory(category: string): Promise<any[]>;
  getAllSystemSettings(): Promise<any[]>;
  
  // Email Template Methods
  getEmailTemplate(name: string): Promise<any | undefined>;
  getEmailTemplateById(id: string): Promise<any | undefined>;
  getAllEmailTemplates(): Promise<any[]>;
  createEmailTemplate(data: { name: string; subject: string; body: string; category?: string; variables?: string; updatedBy?: string }): Promise<any>;
  updateEmailTemplate(id: string, data: Partial<{ subject: string; body: string; category: string; variables: string; isActive: number; updatedBy: string }>): Promise<any>;
  deleteEmailTemplate(id: string): Promise<void>;
  
  // User Roles Methods
  getUserRole(id: string): Promise<any | undefined>;
  getUserRoleByName(name: string): Promise<any | undefined>;
  getAllUserRoles(): Promise<any[]>;
  createUserRole(data: { name: string; description?: string; permissions?: string; isSystem?: number }): Promise<any>;
  updateUserRole(id: string, data: Partial<{ name: string; description: string; permissions: string }>): Promise<any>;
  deleteUserRole(id: string): Promise<void>;
  
  // User Role Assignments
  getUserRoleAssignments(userId: string): Promise<any[]>;
  assignUserRole(userId: string, roleId: string, assignedBy?: string): Promise<any>;
  removeUserRole(userId: string, roleId: string): Promise<void>;
  getUsersWithRole(roleId: string): Promise<User[]>;
  getAllSupervisors(): Promise<Supervisor[]>;
  
  // Privacy/Compliance Methods (GDPR/CCPA/SOC 2)
  savePrivacyConsent(visitorId: string, consents: Array<{ consentType: string; consented: number }>, source?: string, version?: string, userId?: string, ipAddress?: string, userAgent?: string): Promise<void>;
  getPrivacyConsents(visitorId: string): Promise<any[]>;
  getUserPrivacyPreferences(userId: string): Promise<any | undefined>;
  updateUserPrivacyPreferences(userId: string, preferences: { doNotSell?: number; marketingEmails?: number; analyticsTracking?: number; functionalCookies?: number; thirdPartySharing?: number }): Promise<any>;
  createDataSubjectRequest(userId: string, requestType: string, requestDetails?: string): Promise<any>;
  getDataSubjectRequests(userId: string): Promise<any[]>;
  getAllDataSubjectRequests(): Promise<any[]>;
  updateDataSubjectRequest(requestId: string, data: { status?: string; responseDetails?: string; processedBy?: string }): Promise<any>;
  createAuditLog(action: string, userId?: string, resourceType?: string, resourceId?: string, details?: string, severity?: string, ipAddress?: string, userAgent?: string): Promise<any>;
  getAuditLogs(filters?: { userId?: string; action?: string; resourceType?: string; severity?: string; startDate?: Date; endDate?: Date }): Promise<any[]>;
  exportUserData(userId: string): Promise<any>;
  anonymizeUser(userId: string, processedBy: string): Promise<void>;
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
    if (userData.email) {
      const existingByEmail = await this.getUserByEmail(userData.email);
      if (existingByEmail && existingByEmail.id !== userData.id) {
        const [updated] = await db
          .update(users)
          .set({
            firstName: userData.firstName || existingByEmail.firstName,
            lastName: userData.lastName || existingByEmail.lastName,
            profileImageUrl: userData.profileImageUrl || existingByEmail.profileImageUrl,
            updatedAt: new Date(),
          })
          .where(eq(users.email, userData.email))
          .returning();
        return updated;
      }
    }
    
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
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
    // Get course to determine expiration period
    const course = await this.getCourse(courseId);
    const expirationMonths = course?.expirationMonths || 6; // Default to 6 months
    
    // Calculate expiration date
    const enrolledAt = new Date();
    const expiresAt = new Date(enrolledAt);
    expiresAt.setMonth(expiresAt.getMonth() + expirationMonths);
    
    const [enrollment] = await db
      .insert(enrollments)
      .values({ 
        userId, 
        courseId,
        enrolledAt,
        expiresAt
      })
      .returning();
    return enrollment;
  }
  
  // Check if an enrollment is expired (but not completed)
  isEnrollmentExpired(enrollment: Enrollment): boolean {
    // Completed courses never expire (certificates remain accessible)
    if (enrollment.completed) return false;
    // If no expiration date set, not expired
    if (!enrollment.expiresAt) return false;
    // Check if current date is past expiration
    return new Date() > new Date(enrollment.expiresAt);
  }
  
  // Get active (non-expired) enrollment for a user and course
  async getActiveEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined> {
    const enrollment = await this.getEnrollment(userId, courseId);
    if (!enrollment) return undefined;
    
    // Return enrollment if completed or not expired
    if (enrollment.completed || !this.isEnrollmentExpired(enrollment)) {
      return enrollment;
    }
    return undefined;
  }
  
  // Check if user can repurchase a course (has expired, non-completed enrollment)
  async canRepurchaseCourse(userId: string, courseId: string): Promise<{ canRepurchase: boolean; reason?: string; previousEnrollment?: Enrollment }> {
    const enrollment = await this.getEnrollment(userId, courseId);
    
    if (!enrollment) {
      return { canRepurchase: true }; // Never enrolled, can purchase
    }
    
    if (enrollment.completed) {
      return { canRepurchase: false, reason: "Course already completed" };
    }
    
    if (this.isEnrollmentExpired(enrollment)) {
      return { canRepurchase: true, previousEnrollment: enrollment };
    }
    
    return { canRepurchase: false, reason: "Active enrollment exists" };
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

  async getCourseBySku(sku: string): Promise<Course | undefined> {
    try {
      const result = await db.select().from(courses).where(eq(courses.sku, sku));
      return result && result.length > 0 ? result[0] : undefined;
    } catch (err) {
      console.error(`Error fetching course by SKU ${sku}:`, err);
      return undefined;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const result = await db.select().from(users);
      return result || [];
    } catch (err) {
      console.error("Error fetching users:", err);
      return [];
    }
  }

  async getEnrollments(): Promise<Enrollment[]> {
    try {
      const result = await db.select().from(enrollments);
      return result || [];
    } catch (err) {
      console.error("Error fetching enrollments:", err);
      return [];
    }
  }

  async createCourse(courseData: any): Promise<Course> {
    const [course] = await db
      .insert(courses)
      .values(courseData)
      .returning();
    return course;
  }

  async updateCourse(courseId: string, data: Partial<Course>): Promise<Course | undefined> {
    const [course] = await db
      .update(courses)
      .set(data)
      .where(eq(courses.id, courseId))
      .returning();
    return course;
  }

  async deleteCourse(courseId: string): Promise<void> {
    await db.delete(courses).where(eq(courses.id, courseId));
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

  async getSirconReportsByUser(userId: string): Promise<SirconReport[]> {
    return await db
      .select()
      .from(sirconReports)
      .where(eq(sirconReports.userId, userId))
      .orderBy(desc(sirconReports.createdAt));
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
    report: Omit<DBPRReport, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DBPRReport> {
    const [created] = await db
      .insert(dbprReports)
      .values(report)
      .returning();
    return created;
  }

  async getDBPRReport(enrollmentId: string): Promise<DBPRReport | undefined> {
    const [report] = await db
      .select()
      .from(dbprReports)
      .where(eq(dbprReports.enrollmentId, enrollmentId));
    return report;
  }

  async getDBPRReportsByUser(userId: string): Promise<DBPRReport[]> {
    return await db
      .select()
      .from(dbprReports)
      .where(eq(dbprReports.userId, userId))
      .orderBy(desc(dbprReports.createdAt));
  }

  async updateDBPRReport(id: string, data: Partial<DBPRReport>): Promise<DBPRReport> {
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

  async getAllUserEnrollments(userId: string): Promise<(Enrollment & { course: Course })[]> {
    const allEnrollments = await db
      .select()
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.enrolledAt));

    return allEnrollments.map((row: any) => ({
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

  async getUnit(unitId: string): Promise<Unit | undefined> {
    const result = await db.select().from(units).where(eq(units.id, unitId)).limit(1);
    return result[0];
  }

  async getLessons(unitId: string): Promise<Lesson[]> {
    return await db.select().from(lessons).where(eq(lessons.unitId, unitId)).orderBy(lessons.lessonNumber);
  }

  async getLesson(lessonId: string): Promise<Lesson | undefined> {
    const result = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
    return result[0];
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

  async createLesson(unitId: string, lessonNumber: number, title: string, videoUrl?: string, durationMinutes?: number, content?: string, imageUrl?: string): Promise<Lesson> {
    const [lesson] = await db.insert(lessons).values({
      unitId,
      lessonNumber,
      title,
      videoUrl: videoUrl || null,
      durationMinutes: durationMinutes || 15,
      content: content || null,
      imageUrl: imageUrl || null
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
    const [updated] = await db.update(enrollments).set(data).where(eq(enrollments.id, enrollmentId)).returning();
    return updated;
  }

  async adminOverrideLessonProgress(lessonProgressId: string, data: Partial<LessonProgress>): Promise<LessonProgress> {
    const [updated] = await db.update(lessonProgress).set({
      ...data,
      updatedAt: new Date()
    }).where(eq(lessonProgress.id, lessonProgressId)).returning();
    
    // Sync unit_progress.lessonsCompleted when lesson completion changes
    if (data.completed !== undefined) {
      const lesson = await this.getLesson(updated.lessonId);
      if (lesson) {
        const unitLessons = await this.getLessons(lesson.unitId);
        let completedCount = 0;
        for (const l of unitLessons) {
          const prog = await this.getLessonProgress(updated.enrollmentId, l.id);
          if (prog?.completed) completedCount++;
        }
        const unitProg = await this.getUnitProgress(updated.enrollmentId, lesson.unitId);
        if (unitProg) {
          await db.update(unitProgress)
            .set({ lessonsCompleted: completedCount, updatedAt: new Date() })
            .where(eq(unitProgress.id, unitProg.id));
        }
      }
    }
    
    return updated;
  }
  
  async adminCreateLessonProgress(enrollmentId: string, lessonId: string, userId: string, completed: boolean = true): Promise<LessonProgress> {
    const [created] = await db.insert(lessonProgress).values({
      enrollmentId,
      lessonId,
      userId,
      completed: completed ? 1 : 0,
      completedAt: completed ? new Date() : null
    }).returning();
    
    // Sync unit_progress.lessonsCompleted
    const lesson = await this.getLesson(lessonId);
    if (lesson) {
      const unitLessons = await this.getLessons(lesson.unitId);
      let completedCount = 0;
      for (const l of unitLessons) {
        const prog = await this.getLessonProgress(enrollmentId, l.id);
        if (prog?.completed) completedCount++;
      }
      const unitProg = await this.getUnitProgress(enrollmentId, lesson.unitId);
      if (unitProg) {
        await db.update(unitProgress)
          .set({ lessonsCompleted: completedCount, updatedAt: new Date() })
          .where(eq(unitProgress.id, unitProg.id));
      }
    }
    
    return created;
  }

  async adminOverrideExamAttempt(attemptId: string, score: number, passed: boolean): Promise<ExamAttempt> {
    const [updated] = await db.update(examAttempts).set({
      score,
      passed: passed ? 1 : 0,
      completedAt: new Date()
    }).where(eq(examAttempts.id, attemptId)).returning();
    return updated;
  }

  async adminOverrideUnitProgress(unitProgressId: string, data: Partial<UnitProgress>): Promise<UnitProgress> {
    const [updated] = await db.update(unitProgress).set({
      ...data,
      updatedAt: new Date()
    }).where(eq(unitProgress.id, unitProgressId)).returning();
    return updated;
  }

  async adminCreateUnitProgress(enrollmentId: string, unitId: string, userId: string, data: Partial<UnitProgress>): Promise<UnitProgress> {
    const [created] = await db.insert(unitProgress).values({
      enrollmentId,
      unitId,
      userId,
      status: data.status || "locked",
      lessonsCompleted: data.lessonsCompleted || 0,
      quizPassed: data.quizPassed || 0,
      quizScore: data.quizScore || null,
      timeSpentSeconds: data.timeSpentSeconds || 0,
      startedAt: data.startedAt || null,
      completedAt: data.completedAt || null
    }).returning();
    return created;
  }

  async getEnrollmentDetailedProgress(enrollmentId: string): Promise<{
    enrollment: Enrollment;
    units: Array<{
      unit: Unit;
      progress: UnitProgress | null;
      lessons: Array<{
        lesson: Lesson;
        progress: LessonProgress | null;
      }>;
    }>;
  } | null> {
    const enrollment = await this.getEnrollmentById(enrollmentId);
    if (!enrollment) return null;

    const courseUnits = await this.getUnits(enrollment.courseId);
    const sortedUnits = courseUnits.sort((a, b) => a.unitNumber - b.unitNumber);

    const unitDetails = await Promise.all(sortedUnits.map(async (unit) => {
      const progress = await this.getUnitProgress(enrollmentId, unit.id);
      const unitLessons = await this.getLessons(unit.id);
      const sortedLessons = unitLessons.sort((a, b) => a.lessonNumber - b.lessonNumber);

      const lessonDetails = await Promise.all(sortedLessons.map(async (lesson) => {
        const lessonProg = await this.getLessonProgress(enrollmentId, lesson.id);
        return { lesson, progress: lessonProg || null };
      }));

      return { unit, progress: progress || null, lessons: lessonDetails };
    }));

    return { enrollment, units: unitDetails };
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
    
    const completedHours = progressList.filter(p => p.completed).length * 3;
    
    return {
      studentId: user?.id || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      courseCode: course?.sku || "",
      courseName: course?.title || "",
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

  async exportCourseContentJSON(courseId: string): Promise<string> {
    const course = await this.getCourse(courseId);
    const unitList = await this.getUnits(courseId);
    
    const unitsWithContent = await Promise.all(unitList.map(async (unit) => {
      const lessonList = await this.getLessons(unit.id);
      const videos = await this.getUnitVideos(unit.id);
      
      const lessonsWithVideos = lessonList.map(lesson => ({
        id: lesson.id,
        lessonNumber: lesson.lessonNumber,
        title: lesson.title,
        videoId: lesson.videoId,
        videoUrl: lesson.videoUrl,
        durationMinutes: lesson.durationMinutes,
        createdAt: lesson.createdAt
      }));
      
      return {
        id: unit.id,
        unitNumber: unit.unitNumber,
        title: unit.title,
        description: unit.description,
        hoursRequired: unit.hoursRequired,
        lessons: lessonsWithVideos,
        unitVideos: videos
      };
    }));
    
    const courseVideos = await this.getVideos(courseId);
    
    const exportData = {
      course: {
        id: course?.id,
        name: course?.title,
        sku: course?.sku,
        description: course?.description,
        hoursRequired: course?.hoursRequired,
        price: course?.price,
        state: course?.state,
        productType: course?.productType,
        requirementCycleType: course?.requirementCycleType
      },
      units: unitsWithContent,
      courseVideos,
      exportedAt: new Date().toISOString(),
      formatVersion: "1.0"
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  async exportCourseContentCSV(courseId: string): Promise<string> {
    const course = await this.getCourse(courseId);
    const unitList = await this.getUnits(courseId);
    
    let csv = "Unit Number,Unit Title,Unit Hours,Lesson Number,Lesson Title,Video URL,Duration (minutes)\n";
    
    for (const unit of unitList) {
      const lessons = await this.getLessons(unit.id);
      
      if (lessons.length === 0) {
        csv += `${unit.unitNumber},"${unit.title}",${unit.hoursRequired},,,,\n`;
      } else {
        lessons.forEach((lesson, index) => {
          if (index === 0) {
            csv += `${unit.unitNumber},"${unit.title}",${unit.hoursRequired},${lesson.lessonNumber},"${lesson.title}","${lesson.videoUrl || ''}",${lesson.durationMinutes || ''}\n`;
          } else {
            csv += `,,,,${lesson.lessonNumber},"${lesson.title}","${lesson.videoUrl || ''}",${lesson.durationMinutes || ''}\n`;
          }
        });
      }
    }
    
    return csv;
  }

  async exportCourseContentDocx(courseId: string, options?: {
    includeLessons?: boolean;
    includeQuizzes?: boolean;
    includeVideos?: boolean;
    includeDescriptions?: boolean;
    unitNumbers?: number[];
  }): Promise<Buffer> {
    const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType, AlignmentType, convertInchesToTwip } = await import("docx");
    
    // Helper function to strip HTML tags and convert to plain text
    const stripHtml = (html: string): string => {
      if (!html) return '';
      return html
        // Replace block elements with line breaks
        .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/ul>|<\/ol>/gi, '\n')
        // Remove all remaining HTML tags
        .replace(/<[^>]+>/g, '')
        // Decode common HTML entities
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        // Clean up multiple newlines
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    };
    
    const opts = {
      includeLessons: options?.includeLessons !== false,
      includeQuizzes: options?.includeQuizzes !== false,
      includeVideos: options?.includeVideos !== false,
      includeDescriptions: options?.includeDescriptions !== false,
      unitNumbers: options?.unitNumbers || []
    };
    
    const course = await this.getCourse(courseId);
    let unitList = await this.getUnits(courseId);
    
    // Filter units if specific ones requested
    if (opts.unitNumbers.length > 0) {
      unitList = unitList.filter(u => opts.unitNumbers.includes(u.unitNumber));
    }
    
    const sections: any[] = [];
    
    // Title - larger and bold
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: course?.title || "Course Content",
            bold: true,
            size: 48 // 24pt
          })
        ],
        spacing: { after: 300 }
      })
    );
    
    // Course Info
    if (opts.includeDescriptions && course?.description) {
      sections.push(
        new Paragraph({
          text: stripHtml(course.description),
          spacing: { after: 200 }
        })
      );
    }
    
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Course Code: ", bold: true }),
          new TextRun({ text: course?.sku || "N/A" }),
          new TextRun({ text: "  |  Total Hours: ", bold: true }),
          new TextRun({ text: String(course?.hoursRequired || 0) })
        ],
        spacing: { after: 400 }
      })
    );
    
    // Units and Lessons
    for (const unit of unitList) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Unit ${unit.unitNumber}: ${unit.title}`,
              bold: true,
              size: 32 // 16pt
            })
          ],
          spacing: { before: 400, after: 150 }
        })
      );
      
      if (opts.includeDescriptions && unit.description) {
        sections.push(
          new Paragraph({
            text: stripHtml(unit.description),
            spacing: { after: 100 }
          })
        );
      }
      
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Required Hours: ", italics: true }),
            new TextRun({ text: String(unit.hoursRequired || 3), italics: true })
          ],
          spacing: { after: 200 }
        })
      );
      
      // Lessons with full content
      if (opts.includeLessons) {
        const lessonList = await this.getLessons(unit.id);
        
        for (const lesson of lessonList) {
          // Lesson heading
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Lesson ${lesson.lessonNumber}: ${lesson.title}`,
                  bold: true,
                  size: 26 // 13pt
                })
              ],
              spacing: { before: 250, after: 100 }
            })
          );
          
          // Duration and video URL if applicable
          const metaParts = [];
          if (lesson.durationMinutes) {
            metaParts.push(`Duration: ${lesson.durationMinutes} minutes`);
          }
          if (opts.includeVideos && lesson.videoUrl) {
            metaParts.push(`Video: ${lesson.videoUrl}`);
          }
          if (metaParts.length > 0) {
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: metaParts.join("  |  "), italics: true, size: 20 })],
                spacing: { after: 100 }
              })
            );
          }
          
          // Lesson content (the actual script/text)
          if (lesson.content) {
            // Strip HTML tags and convert to plain text
            const cleanContent = stripHtml(lesson.content);
            // Split content into paragraphs by double newlines
            const contentParagraphs = cleanContent.split(/\n\n+/).filter(p => p.trim());
            for (const para of contentParagraphs) {
              sections.push(
                new Paragraph({
                  text: para.trim(),
                  spacing: { after: 120 }
                })
              );
            }
          } else {
            sections.push(
              new Paragraph({
                children: [new TextRun({ text: "(No content available)", italics: true })],
                spacing: { after: 100 }
              })
            );
          }
        }
      }
      
      // Quiz info with full questions
      if (opts.includeQuizzes) {
        const questionBank = await this.getQuestionBankByUnit(unit.id);
        if (questionBank) {
          const questions = await this.getBankQuestions(questionBank.id);
          
          // Quiz header
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ 
                  text: `Unit ${unit.unitNumber} Quiz`,
                  bold: true,
                  size: 28
                })
              ],
              spacing: { before: 300, after: 100 }
            })
          );
          
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${questions.length} questions  |  Passing Score: ${questionBank.passingScore || 70}%`, italics: true })
              ],
              spacing: { after: 150 }
            })
          );
          
          // Each question with answers
          questions.forEach((q, qIndex) => {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `${qIndex + 1}. `, bold: true }),
                  new TextRun({ text: q.questionText || '' })
                ],
                spacing: { before: 150, after: 80 }
              })
            );
            
            // Answer options - parse JSON string if needed
            let options: string[] = [];
            try {
              options = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options as string[]) || [];
            } catch { options = []; }
            
            options.forEach((opt, optIndex) => {
              const letter = String.fromCharCode(65 + optIndex); // A, B, C, D...
              const isCorrect = q.correctOption === optIndex;
              sections.push(
                new Paragraph({
                  children: [
                    new TextRun({ 
                      text: `   ${letter}. ${opt}`,
                      bold: isCorrect,
                      color: isCorrect ? "008000" : undefined
                    }),
                    ...(isCorrect ? [new TextRun({ text: " (Correct)", bold: true, color: "008000" })] : [])
                  ],
                  spacing: { after: 40 }
                })
              );
            });
            
            // Explanation if available
            if (q.explanation) {
              sections.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: "   Explanation: ", italics: true, bold: true }),
                    new TextRun({ text: q.explanation, italics: true })
                  ],
                  spacing: { before: 50, after: 100 }
                })
              );
            }
          });
        }
      }
      
      sections.push(new Paragraph({ text: "", spacing: { after: 300 } }));
    }
    
    // Final Exam (if exists and quizzes are included)
    if (opts.includeQuizzes) {
      const finalExamBank = await this.getFinalExamBank(courseId);
      if (finalExamBank) {
        const finalQuestions = await this.getBankQuestions(finalExamBank.id);
        
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ 
                text: "Course Final Exam",
                bold: true,
                size: 36
              })
            ],
            spacing: { before: 500, after: 150 }
          })
        );
        
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${finalQuestions.length} questions  |  Passing Score: ${finalExamBank.passingScore || 70}%`, italics: true })
            ],
            spacing: { after: 200 }
          })
        );
        
        finalQuestions.forEach((q, qIndex) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${qIndex + 1}. `, bold: true }),
                new TextRun({ text: q.questionText || '' })
              ],
              spacing: { before: 150, after: 80 }
            })
          );
          
          let options: string[] = [];
          try {
            options = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options as string[]) || [];
          } catch { options = []; }
          
          options.forEach((opt, optIndex) => {
            const letter = String.fromCharCode(65 + optIndex);
            const isCorrect = q.correctOption === optIndex;
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: `   ${letter}. ${opt}`,
                    bold: isCorrect,
                    color: isCorrect ? "008000" : undefined
                  }),
                  ...(isCorrect ? [new TextRun({ text: " (Correct)", bold: true, color: "008000" })] : [])
                ],
                spacing: { after: 40 }
              })
            );
          });
          
          if (q.explanation) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({ text: "   Explanation: ", italics: true, bold: true }),
                  new TextRun({ text: q.explanation, italics: true })
                ],
                spacing: { before: 50, after: 100 }
              })
            );
          }
        });
      }
    }
    
    // Export metadata footer
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ 
            text: `Exported on ${new Date().toLocaleDateString()} from FoundationCE`,
            italics: true,
            size: 18
          })
        ],
        spacing: { before: 600 }
      })
    );
    
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1)
              }
            }
          },
          children: sections
        }
      ]
    });
    
    return await Packer.toBuffer(doc);
  }

  async exportAllUsersData(): Promise<string> {
    const userList = await db.select().from(users);
    const enrichedUsers = await Promise.all(userList.map(async (user) => {
      const enrollmentList = await db.select().from(enrollments).where(eq(enrollments.userId, user.id));
      return {
        ...user,
        enrollments: enrollmentList
      };
    }));
    
    return JSON.stringify({
      totalUsers: userList.length,
      users: enrichedUsers,
      exportedAt: new Date().toISOString(),
      formatVersion: "1.0"
    }, null, 2);
  }

  async exportAllUsersDataCSV(): Promise<string> {
    const userList = await db.select().from(users);
    let csv = "User ID,Email,First Name,Last Name,License Number,Total Enrollments,Created At\n";
    
    for (const user of userList) {
      const enrollmentCount = await db.select().from(enrollments).where(eq(enrollments.userId, user.id)).then(r => r.length);
      csv += `"${user.id}","${user.email || ''}","${user.firstName || ''}","${user.lastName || ''}","",${enrollmentCount},"${user.createdAt || ''}"\n`;
    }
    
    return csv;
  }

  async exportEmailCampaignData(): Promise<string> {
    const campaignList = await db.select().from(emailCampaigns);
    const enrichedCampaigns = await Promise.all(campaignList.map(async (campaign) => {
      const recipients = await this.getEmailRecipients(campaign.id);
      const stats = await this.getCampaignStats(campaign.id);
      return {
        campaign,
        recipients: recipients.length,
        uniqueOpens: stats.tracking.filter((t: any) => t.action === 'open').length,
        uniqueClicks: stats.tracking.filter((t: any) => t.action === 'click').length,
        openRate: recipients.length > 0 ? ((stats.tracking.filter((t: any) => t.action === 'open').length / recipients.length) * 100).toFixed(2) : "0",
        clickRate: recipients.length > 0 ? ((stats.tracking.filter((t: any) => t.action === 'click').length / recipients.length) * 100).toFixed(2) : "0"
      };
    }));
    
    return JSON.stringify({
      totalCampaigns: campaignList.length,
      campaigns: enrichedCampaigns,
      exportedAt: new Date().toISOString(),
      formatVersion: "1.0"
    }, null, 2);
  }

  async exportEmailCampaignDataCSV(): Promise<string> {
    const campaignList = await db.select().from(emailCampaigns);
    let csv = "Campaign ID,Campaign Name,Total Recipients,Unique Opens,Unique Clicks,Open Rate %,Click Rate %,Created At\n";
    
    for (const campaign of campaignList) {
      const stats = await this.getCampaignStats(campaign.id);
      const recipients = stats.recipients.length;
      const opens = stats.tracking.filter((t: any) => t.action === 'open').length;
      const clicks = stats.tracking.filter((t: any) => t.action === 'click').length;
      const openRate = recipients > 0 ? ((opens / recipients) * 100).toFixed(2) : "0";
      const clickRate = recipients > 0 ? ((clicks / recipients) * 100).toFixed(2) : "0";
      
      csv += `"${campaign.id}","${campaign.name || ''}",${recipients},${opens},${clicks},${openRate},${clickRate},"${campaign.createdAt || ''}"\n`;
    }
    
    return csv;
  }

  async savePage(slug: string, page: any): Promise<any> {
    const { websitePages } = await import("@shared/schema");
    const title = page.title || slug.charAt(0).toUpperCase() + slug.slice(1);
    const blocksJson = JSON.stringify(page.blocks || []);
    
    // Check if page exists
    const existing = await db.select().from(websitePages).where(eq(websitePages.slug, slug)).limit(1);
    
    if (existing.length > 0) {
      // Update existing page
      const [updated] = await db.update(websitePages)
        .set({ blocks: blocksJson, updatedAt: new Date() })
        .where(eq(websitePages.slug, slug))
        .returning();
      return { ...updated, blocks: JSON.parse(updated.blocks || '[]') };
    } else {
      // Create new page
      const [created] = await db.insert(websitePages)
        .values({ slug, title, blocks: blocksJson })
        .returning();
      return { ...created, blocks: JSON.parse(created.blocks || '[]') };
    }
  }

  async getPage(slug: string): Promise<any> {
    const { websitePages } = await import("@shared/schema");
    const [page] = await db.select().from(websitePages).where(eq(websitePages.slug, slug)).limit(1);
    if (!page) return null;
    return { ...page, blocks: JSON.parse(page.blocks || '[]') };
  }

  // ============================================================
  // LMS Progress Tracking Methods
  // ============================================================

  async getUnitProgress(enrollmentId: string, unitId: string): Promise<UnitProgress | undefined> {
    const [progress] = await db.select()
      .from(unitProgress)
      .where(and(
        eq(unitProgress.enrollmentId, enrollmentId),
        eq(unitProgress.unitId, unitId)
      ));
    return progress;
  }

  async createUnitProgress(enrollmentId: string, unitId: string, userId: string): Promise<UnitProgress> {
    const [progress] = await db.insert(unitProgress)
      .values({ enrollmentId, unitId, userId, status: "locked" })
      .returning();
    return progress;
  }

  async updateUnitProgress(id: string, data: Partial<UnitProgress>): Promise<UnitProgress> {
    const [updated] = await db.update(unitProgress)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(unitProgress.id, id))
      .returning();
    return updated;
  }

  async getAllUnitProgress(enrollmentId: string): Promise<UnitProgress[]> {
    return await db.select()
      .from(unitProgress)
      .where(eq(unitProgress.enrollmentId, enrollmentId));
  }

  // ============================================================
  // Question Bank Methods
  // ============================================================

  async getQuestionBank(bankId: string): Promise<QuestionBank | undefined> {
    const [bank] = await db.select()
      .from(questionBanks)
      .where(eq(questionBanks.id, bankId));
    return bank;
  }

  async getQuestionBankByUnit(unitId: string): Promise<QuestionBank | undefined> {
    const [bank] = await db.select()
      .from(questionBanks)
      .where(and(
        eq(questionBanks.unitId, unitId),
        eq(questionBanks.bankType, "unit_quiz"),
        eq(questionBanks.isActive, 1)
      ));
    return bank;
  }

  async getQuestionBanksByUnit(unitId: string): Promise<QuestionBank[]> {
    return await db.select()
      .from(questionBanks)
      .where(and(
        eq(questionBanks.unitId, unitId),
        eq(questionBanks.isActive, 1)
      ))
      .orderBy(questionBanks.createdAt);
  }

  async getQuestionBanksByCourse(courseId: string): Promise<QuestionBank[]> {
    return await db.select()
      .from(questionBanks)
      .where(and(
        eq(questionBanks.courseId, courseId),
        eq(questionBanks.isActive, 1)
      ))
      .orderBy(questionBanks.createdAt);
  }

  async getFinalExamBank(courseId: string): Promise<QuestionBank | undefined> {
    const [bank] = await db.select()
      .from(questionBanks)
      .where(and(
        eq(questionBanks.courseId, courseId),
        eq(questionBanks.bankType, "final_exam"),
        eq(questionBanks.isActive, 1)
      ));
    return bank;
  }

  async createQuestionBank(data: Omit<QuestionBank, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuestionBank> {
    const [bank] = await db.insert(questionBanks)
      .values(data)
      .returning();
    return bank;
  }

  async updateQuestionBank(bankId: string, data: Partial<QuestionBank>): Promise<QuestionBank> {
    const [updated] = await db.update(questionBanks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(questionBanks.id, bankId))
      .returning();
    return updated;
  }

  async deleteQuestionBank(bankId: string): Promise<void> {
    await db.update(questionBanks)
      .set({ isActive: 0 })
      .where(eq(questionBanks.id, bankId));
  }

  async getBankQuestions(bankId: string): Promise<BankQuestion[]> {
    return await db.select()
      .from(bankQuestions)
      .where(and(
        eq(bankQuestions.bankId, bankId),
        eq(bankQuestions.isActive, 1)
      ));
  }

  async createBankQuestion(data: Omit<BankQuestion, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankQuestion> {
    const [question] = await db.insert(bankQuestions)
      .values(data)
      .returning();
    return question;
  }

  async getBankQuestion(questionId: string): Promise<BankQuestion | undefined> {
    const [question] = await db.select()
      .from(bankQuestions)
      .where(eq(bankQuestions.id, questionId));
    return question;
  }

  async updateBankQuestion(questionId: string, data: Partial<BankQuestion>): Promise<BankQuestion> {
    const [updated] = await db.update(bankQuestions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bankQuestions.id, questionId))
      .returning();
    return updated;
  }

  async deleteBankQuestion(questionId: string): Promise<void> {
    await db.update(bankQuestions)
      .set({ isActive: 0 })
      .where(eq(bankQuestions.id, questionId));
  }

  async getRandomQuestions(bankId: string, count: number): Promise<BankQuestion[]> {
    const allQuestions = await this.getBankQuestions(bankId);
    // Shuffle and select random questions
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  // ============================================================
  // Quiz Attempt Methods
  // ============================================================

  async createQuizAttempt(data: Omit<QuizAttempt, 'id' | 'createdAt'>): Promise<QuizAttempt> {
    const [attempt] = await db.insert(quizAttempts)
      .values(data)
      .returning();
    return attempt;
  }

  async getQuizAttempt(attemptId: string): Promise<QuizAttempt | undefined> {
    const [attempt] = await db.select()
      .from(quizAttempts)
      .where(eq(quizAttempts.id, attemptId));
    return attempt;
  }

  async updateQuizAttempt(attemptId: string, data: Partial<QuizAttempt>): Promise<QuizAttempt> {
    const [updated] = await db.update(quizAttempts)
      .set(data)
      .where(eq(quizAttempts.id, attemptId))
      .returning();
    return updated;
  }

  async getUserQuizAttempts(enrollmentId: string, bankId: string): Promise<QuizAttempt[]> {
    return await db.select()
      .from(quizAttempts)
      .where(and(
        eq(quizAttempts.enrollmentId, enrollmentId),
        eq(quizAttempts.bankId, bankId)
      ))
      .orderBy(desc(quizAttempts.createdAt));
  }

  // ============================================================
  // Quiz Answer Methods
  // ============================================================

  async createQuizAnswer(data: Omit<QuizAnswer, 'id' | 'answeredAt'>): Promise<QuizAnswer> {
    const [answer] = await db.insert(quizAnswers)
      .values(data)
      .returning();
    return answer;
  }

  async getQuizAnswers(attemptId: string): Promise<QuizAnswer[]> {
    return await db.select()
      .from(quizAnswers)
      .where(eq(quizAnswers.attemptId, attemptId));
  }

  // ============================================================
  // Progress Update Methods
  // ============================================================

  async updateLessonTimeSpent(enrollmentId: string, lessonId: string, secondsToAdd: number): Promise<LessonProgress> {
    const existing = await this.getLessonProgress(enrollmentId, lessonId);
    
    if (existing) {
      const [updated] = await db.update(lessonProgress)
        .set({ 
          timeSpentSeconds: (existing.timeSpentSeconds || 0) + secondsToAdd,
          lastAccessedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(lessonProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      // Get user from enrollment
      const enrollment = await this.getEnrollmentById(enrollmentId);
      if (!enrollment) throw new Error("Enrollment not found");
      
      const [created] = await db.insert(lessonProgress)
        .values({ 
          enrollmentId, 
          lessonId, 
          userId: enrollment.userId,
          timeSpentSeconds: secondsToAdd 
        })
        .returning();
      return created;
    }
  }

  async completeLesson(enrollmentId: string, lessonId: string, userId: string): Promise<LessonProgress> {
    const existing = await this.getLessonProgress(enrollmentId, lessonId);
    
    let result: LessonProgress;
    if (existing) {
      const [updated] = await db.update(lessonProgress)
        .set({ 
          completed: 1,
          completedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(lessonProgress.id, existing.id))
        .returning();
      result = updated;
    } else {
      const [created] = await db.insert(lessonProgress)
        .values({ 
          enrollmentId, 
          lessonId, 
          userId,
          completed: 1,
          completedAt: new Date()
        })
        .returning();
      result = created;
    }
    
    // Update unit_progress.lessonsCompleted to keep admin dashboard in sync
    const lesson = await this.getLesson(lessonId);
    if (lesson) {
      const unitId = lesson.unitId;
      const unitLessons = await this.getLessons(unitId);
      let completedCount = 0;
      for (const l of unitLessons) {
        const prog = await this.getLessonProgress(enrollmentId, l.id);
        if (prog?.completed) completedCount++;
      }
      
      const unitProg = await this.getUnitProgress(enrollmentId, unitId);
      if (unitProg) {
        await db.update(unitProgress)
          .set({ lessonsCompleted: completedCount, updatedAt: new Date() })
          .where(eq(unitProgress.id, unitProg.id));
      }
    }
    
    return result;
  }

  async updateEnrollmentProgress(enrollmentId: string, data: Partial<Enrollment>): Promise<Enrollment> {
    const [updated] = await db.update(enrollments)
      .set(data)
      .where(eq(enrollments.id, enrollmentId))
      .returning();
    return updated;
  }

  async checkUnitCompletion(enrollmentId: string, unitId: string): Promise<{ lessonsComplete: boolean; quizPassed: boolean }> {
    // Get all lessons for the unit
    const unitLessons = await this.getLessons(unitId);
    
    // Get completed lessons
    let completedCount = 0;
    for (const lesson of unitLessons) {
      const progress = await this.getLessonProgress(enrollmentId, lesson.id);
      if (progress?.completed) completedCount++;
    }
    
    const lessonsComplete = unitLessons.length > 0 && completedCount === unitLessons.length;
    
    // Check quiz status
    const unitProg = await this.getUnitProgress(enrollmentId, unitId);
    const quizPassed = unitProg?.quizPassed === 1;
    
    return { lessonsComplete, quizPassed };
  }

  async unlockNextUnit(enrollmentId: string): Promise<UnitProgress | undefined> {
    const enrollment = await this.getEnrollmentById(enrollmentId);
    if (!enrollment) return undefined;
    
    // Get all units for the course
    const courseUnits = await this.getUnits(enrollment.courseId);
    const sortedUnits = courseUnits.sort((a, b) => a.unitNumber - b.unitNumber);
    
    // Find the next locked unit
    for (const unit of sortedUnits) {
      const progress = await this.getUnitProgress(enrollmentId, unit.id);
      if (!progress) {
        // Create and unlock this unit
        const [newProgress] = await db.insert(unitProgress)
          .values({
            enrollmentId,
            unitId: unit.id,
            userId: enrollment.userId,
            status: "in_progress",
            startedAt: new Date()
          })
          .returning();
        return newProgress;
      } else if (progress.status === "locked") {
        // Unlock existing progress
        const [updated] = await db.update(unitProgress)
          .set({ status: "in_progress", startedAt: new Date(), updatedAt: new Date() })
          .where(eq(unitProgress.id, progress.id))
          .returning();
        return updated;
      }
    }
    
    return undefined;
  }

  async getEnrollmentById(enrollmentId: string): Promise<Enrollment | undefined> {
    const [enrollment] = await db.select()
      .from(enrollments)
      .where(eq(enrollments.id, enrollmentId));
    return enrollment;
  }

  // Notification Methods
  async createNotification(data: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications)
      .values(data)
      .returning();
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.read, false)
      ));
    return result[0]?.count || 0;
  }

  async markNotificationRead(notificationId: string, userId: string): Promise<Notification | null> {
    const [notification] = await db.update(notifications)
      .set({ read: true })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ))
      .returning();
    return notification || null;
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
  }

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const result = await db.delete(notifications)
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ))
      .returning();
    return result.length > 0;
  }

  // Financial/Payment Methods
  async createPurchase(data: UpsertPurchase): Promise<Purchase> {
    const [purchase] = await db.insert(purchases)
      .values(data)
      .returning();
    return purchase;
  }

  async getPurchase(stripeSessionId: string): Promise<Purchase | undefined> {
    const [purchase] = await db.select()
      .from(purchases)
      .where(eq(purchases.stripeSessionId, stripeSessionId));
    return purchase;
  }

  async getPurchaseById(purchaseId: string): Promise<Purchase | undefined> {
    const [purchase] = await db.select()
      .from(purchases)
      .where(eq(purchases.id, purchaseId));
    return purchase;
  }

  async getPurchasesByUser(userId: string): Promise<Purchase[]> {
    return await db.select()
      .from(purchases)
      .where(eq(purchases.userId, userId))
      .orderBy(desc(purchases.purchasedAt));
  }

  async getAllPurchases(): Promise<Purchase[]> {
    return await db.select()
      .from(purchases)
      .orderBy(desc(purchases.purchasedAt));
  }

  async updatePurchaseStatus(purchaseId: string, status: string): Promise<Purchase> {
    const [purchase] = await db.update(purchases)
      .set({ status })
      .where(eq(purchases.id, purchaseId))
      .returning();
    return purchase;
  }

  // Account Credits Methods
  async createAccountCredit(data: InsertAccountCredit): Promise<AccountCredit> {
    const [credit] = await db.insert(accountCredits)
      .values(data)
      .returning();
    return credit;
  }

  async getAccountCredits(userId: string): Promise<AccountCredit[]> {
    return await db.select()
      .from(accountCredits)
      .where(eq(accountCredits.userId, userId))
      .orderBy(desc(accountCredits.createdAt));
  }

  async getAccountCreditBalance(userId: string): Promise<number> {
    const credits = await this.getAccountCredits(userId);
    const now = new Date();
    return credits
      .filter(c => !c.expiresAt || new Date(c.expiresAt) > now)
      .reduce((sum, c) => sum + c.amount, 0);
  }

  async getAllAccountCredits(): Promise<AccountCredit[]> {
    return await db.select()
      .from(accountCredits)
      .orderBy(desc(accountCredits.createdAt));
  }

  // Refund Methods
  async createRefund(data: InsertRefund): Promise<Refund> {
    const [refund] = await db.insert(refunds)
      .values(data)
      .returning();
    return refund;
  }

  async getRefund(refundId: string): Promise<Refund | undefined> {
    const [refund] = await db.select()
      .from(refunds)
      .where(eq(refunds.id, refundId));
    return refund;
  }

  async getRefundsByUser(userId: string): Promise<Refund[]> {
    return await db.select()
      .from(refunds)
      .where(eq(refunds.userId, userId))
      .orderBy(desc(refunds.createdAt));
  }

  async getRefundsByPurchase(purchaseId: string): Promise<Refund[]> {
    return await db.select()
      .from(refunds)
      .where(eq(refunds.purchaseId, purchaseId))
      .orderBy(desc(refunds.createdAt));
  }

  async getAllRefunds(): Promise<Refund[]> {
    return await db.select()
      .from(refunds)
      .orderBy(desc(refunds.createdAt));
  }

  async updateRefundStatus(refundId: string, status: string, stripeRefundId?: string): Promise<Refund> {
    const updateData: Partial<Refund> = { 
      status,
      processedAt: status === 'succeeded' || status === 'failed' ? new Date() : undefined
    };
    if (stripeRefundId) {
      updateData.stripeRefundId = stripeRefundId;
    }
    const [refund] = await db.update(refunds)
      .set(updateData)
      .where(eq(refunds.id, refundId))
      .returning();
    return refund;
  }

  // Financial Summary Methods
  async getUserFinancialSummary(userId: string): Promise<{
    totalSpent: number;
    totalRefunded: number;
    creditBalance: number;
    purchases: Purchase[];
    refunds: Refund[];
    credits: AccountCredit[];
  }> {
    const userPurchases = await this.getPurchasesByUser(userId);
    const userRefunds = await this.getRefundsByUser(userId);
    const userCredits = await this.getAccountCredits(userId);
    const creditBalance = await this.getAccountCreditBalance(userId);

    const totalSpent = userPurchases
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRefunded = userRefunds
      .filter(r => r.status === 'succeeded')
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      totalSpent,
      totalRefunded,
      creditBalance,
      purchases: userPurchases,
      refunds: userRefunds,
      credits: userCredits
    };
  }

  // System Settings Methods
  async getSystemSetting(key: string): Promise<string | null> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting?.value ?? null;
  }

  async setSystemSetting(key: string, value: string, category: string = "general", label?: string, description?: string, updatedBy?: string): Promise<SystemSetting> {
    const existing = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    if (existing.length > 0) {
      const [updated] = await db.update(systemSettings)
        .set({ value, category, label, description, updatedBy, updatedAt: new Date() })
        .where(eq(systemSettings.key, key))
        .returning();
      return updated;
    }
    const [created] = await db.insert(systemSettings)
      .values({ key, value, category, label, description, updatedBy })
      .returning();
    return created;
  }

  async getSystemSettingsByCategory(category: string): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings).where(eq(systemSettings.category, category));
  }

  async getAllSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings).orderBy(systemSettings.category, systemSettings.key);
  }

  // Email Template Methods
  async getEmailTemplate(name: string): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.name, name));
    return template;
  }

  async getEmailTemplateById(id: string): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return template;
  }

  async getAllEmailTemplates(): Promise<EmailTemplate[]> {
    return await db.select().from(emailTemplates).orderBy(emailTemplates.category, emailTemplates.name);
  }

  async createEmailTemplate(data: { name: string; subject: string; body: string; category?: string; variables?: string; updatedBy?: string }): Promise<EmailTemplate> {
    const [template] = await db.insert(emailTemplates)
      .values({
        name: data.name,
        subject: data.subject,
        body: data.body,
        category: data.category || "transactional",
        variables: data.variables,
        updatedBy: data.updatedBy
      })
      .returning();
    return template;
  }

  async updateEmailTemplate(id: string, data: Partial<{ subject: string; body: string; category: string; variables: string; isActive: number; updatedBy: string }>): Promise<EmailTemplate> {
    const [template] = await db.update(emailTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(emailTemplates.id, id))
      .returning();
    return template;
  }

  async deleteEmailTemplate(id: string): Promise<void> {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
  }

  // User Roles Methods
  async getUserRole(id: string): Promise<UserRole | undefined> {
    const [role] = await db.select().from(userRoles).where(eq(userRoles.id, id));
    return role;
  }

  async getUserRoleByName(name: string): Promise<UserRole | undefined> {
    const [role] = await db.select().from(userRoles).where(eq(userRoles.name, name));
    return role;
  }

  async getAllUserRoles(): Promise<UserRole[]> {
    return await db.select().from(userRoles).orderBy(userRoles.name);
  }

  async createUserRole(data: { name: string; description?: string; permissions?: string; isSystem?: number }): Promise<UserRole> {
    const [role] = await db.insert(userRoles)
      .values({
        name: data.name,
        description: data.description,
        permissions: data.permissions,
        isSystem: data.isSystem || 0
      })
      .returning();
    return role;
  }

  async updateUserRole(id: string, data: Partial<{ name: string; description: string; permissions: string }>): Promise<UserRole> {
    const [role] = await db.update(userRoles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userRoles.id, id))
      .returning();
    return role;
  }

  async deleteUserRole(id: string): Promise<void> {
    // First remove all assignments for this role
    await db.delete(userRoleAssignments).where(eq(userRoleAssignments.roleId, id));
    // Then delete the role
    await db.delete(userRoles).where(eq(userRoles.id, id));
  }

  // User Role Assignments
  async getUserRoleAssignments(userId: string): Promise<UserRoleAssignment[]> {
    return await db.select().from(userRoleAssignments).where(eq(userRoleAssignments.userId, userId));
  }

  async assignUserRole(userId: string, roleId: string, assignedBy?: string): Promise<UserRoleAssignment> {
    // Check if already assigned
    const existing = await db.select().from(userRoleAssignments)
      .where(and(eq(userRoleAssignments.userId, userId), eq(userRoleAssignments.roleId, roleId)));
    if (existing.length > 0) return existing[0];
    
    const [assignment] = await db.insert(userRoleAssignments)
      .values({ userId, roleId, assignedBy })
      .returning();
    return assignment;
  }

  async removeUserRole(userId: string, roleId: string): Promise<void> {
    await db.delete(userRoleAssignments)
      .where(and(eq(userRoleAssignments.userId, userId), eq(userRoleAssignments.roleId, roleId)));
  }

  async getUsersWithRole(roleId: string): Promise<User[]> {
    const assignments = await db.select().from(userRoleAssignments).where(eq(userRoleAssignments.roleId, roleId));
    if (assignments.length === 0) return [];
    const userIds = assignments.map(a => a.userId);
    return await db.select().from(users).where(inArray(users.id, userIds));
  }

  async getAllSupervisors(): Promise<Supervisor[]> {
    return await db.select().from(supervisors).orderBy(supervisors.createdAt);
  }

  // Privacy/Compliance Methods (GDPR/CCPA/SOC 2)
  async savePrivacyConsent(
    visitorId: string, 
    consents: Array<{ consentType: string; consented: number }>, 
    source?: string, 
    version?: string, 
    userId?: string, 
    ipAddress?: string, 
    userAgent?: string
  ): Promise<void> {
    for (const consent of consents) {
      await db.insert(privacyConsents).values({
        visitorId,
        userId: userId || null,
        consentType: consent.consentType,
        consented: consent.consented,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        source: source || "cookie_banner",
        version: version || "1.0",
      });
    }
  }

  async getPrivacyConsents(visitorId: string): Promise<PrivacyConsent[]> {
    return await db.select().from(privacyConsents)
      .where(eq(privacyConsents.visitorId, visitorId))
      .orderBy(desc(privacyConsents.createdAt));
  }

  async getUserPrivacyPreferences(userId: string): Promise<UserPrivacyPreference | undefined> {
    const [prefs] = await db.select().from(userPrivacyPreferences)
      .where(eq(userPrivacyPreferences.userId, userId));
    return prefs;
  }

  async updateUserPrivacyPreferences(
    userId: string, 
    preferences: { 
      doNotSell?: number; 
      marketingEmails?: number; 
      analyticsTracking?: number; 
      functionalCookies?: number; 
      thirdPartySharing?: number;
      directoryInfoOptOut?: number;
      educationRecordsConsent?: number;
      transcriptSharingConsent?: number;
      regulatoryReportingConsent?: number;
    }
  ): Promise<UserPrivacyPreference> {
    const existing = await this.getUserPrivacyPreferences(userId);
    if (existing) {
      const [updated] = await db.update(userPrivacyPreferences)
        .set({ ...preferences, updatedAt: new Date() })
        .where(eq(userPrivacyPreferences.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(userPrivacyPreferences)
        .values({ userId, ...preferences })
        .returning();
      return created;
    }
  }

  async createDataSubjectRequest(userId: string, requestType: string, requestDetails?: string): Promise<DataSubjectRequest> {
    const [request] = await db.insert(dataSubjectRequests).values({
      userId,
      requestType,
      requestDetails: requestDetails || null,
      status: "pending",
    }).returning();
    return request;
  }

  async getDataSubjectRequests(userId: string): Promise<DataSubjectRequest[]> {
    return await db.select().from(dataSubjectRequests)
      .where(eq(dataSubjectRequests.userId, userId))
      .orderBy(desc(dataSubjectRequests.createdAt));
  }

  async getAllDataSubjectRequests(): Promise<DataSubjectRequest[]> {
    return await db.select().from(dataSubjectRequests)
      .orderBy(desc(dataSubjectRequests.createdAt));
  }

  async updateDataSubjectRequest(
    requestId: string, 
    data: { status?: string; responseDetails?: string; processedBy?: string }
  ): Promise<DataSubjectRequest> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.status === "completed") {
      updateData.completedAt = new Date();
    }
    const [updated] = await db.update(dataSubjectRequests)
      .set(updateData)
      .where(eq(dataSubjectRequests.id, requestId))
      .returning();
    return updated;
  }

  async createAuditLog(
    action: string, 
    userId?: string, 
    resourceType?: string, 
    resourceId?: string, 
    details?: string, 
    severity?: string, 
    ipAddress?: string, 
    userAgent?: string
  ): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values({
      action,
      userId: userId || null,
      resourceType: resourceType || null,
      resourceId: resourceId || null,
      details: details || null,
      severity: severity || "info",
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    }).returning();
    return log;
  }

  async getAuditLogs(filters?: { 
    userId?: string; 
    action?: string; 
    resourceType?: string; 
    severity?: string; 
    startDate?: Date; 
    endDate?: Date 
  }): Promise<AuditLog[]> {
    let query = db.select().from(auditLogs);
    const conditions = [];
    
    if (filters?.userId) {
      conditions.push(eq(auditLogs.userId, filters.userId));
    }
    if (filters?.action) {
      conditions.push(eq(auditLogs.action, filters.action));
    }
    if (filters?.resourceType) {
      conditions.push(eq(auditLogs.resourceType, filters.resourceType));
    }
    if (filters?.severity) {
      conditions.push(eq(auditLogs.severity, filters.severity));
    }
    if (filters?.startDate) {
      conditions.push(gte(auditLogs.createdAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lt(auditLogs.createdAt, filters.endDate));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(auditLogs.createdAt)).limit(1000);
  }

  async exportUserData(userId: string): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const userEnrollments = await this.getAllUserEnrollments(userId);
    const userPurchases = await this.getPurchasesByUser(userId);
    const userLicensesData = await this.getUserLicenses(userId);
    const privacyPrefs = await this.getUserPrivacyPreferences(userId);
    const dsrRequests = await this.getDataSubjectRequests(userId);
    const consents = user.id ? await db.select().from(privacyConsents)
      .where(eq(privacyConsents.userId, user.id)) : [];

    return {
      exportDate: new Date().toISOString(),
      version: "1.0",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
      enrollments: userEnrollments.map(e => ({
        courseTitle: e.course.title,
        enrolledAt: e.enrolledAt,
        hoursCompleted: e.hoursCompleted,
        completed: e.completed,
        completedAt: e.completedAt,
      })),
      purchases: userPurchases.map(p => ({
        amount: p.amount,
        status: p.status,
        createdAt: p.createdAt,
      })),
      licenses: userLicensesData.map(l => ({
        state: l.state,
        licenseNumber: l.licenseNumber,
        licenseType: l.licenseType,
        expirationDate: l.expirationDate,
      })),
      privacyPreferences: privacyPrefs,
      consentHistory: consents,
      dataSubjectRequests: dsrRequests,
    };
  }

  async anonymizeUser(userId: string, processedBy: string): Promise<void> {
    const anonymizedEmail = `deleted_${Date.now()}@anonymized.local`;
    
    await db.update(users).set({
      email: anonymizedEmail,
      firstName: "Deleted",
      lastName: "User",
      profileImageUrl: null,
      passwordHash: null,
      updatedAt: new Date(),
    }).where(eq(users.id, userId));

    // Log the anonymization
    await this.createAuditLog(
      "user_anonymized",
      processedBy,
      "user",
      userId,
      JSON.stringify({ reason: "GDPR/CCPA deletion request" }),
      "warning"
    );
  }

  // ============ AFFILIATE MARKETING METHODS ============

  async createAffiliate(data: Omit<InsertAffiliate, 'id' | 'createdAt' | 'updatedAt'>): Promise<Affiliate> {
    const referralCode = data.referralCode || this.generateReferralCode();
    const [affiliate] = await db.insert(affiliates).values({
      ...data,
      referralCode,
    }).returning();
    return affiliate;
  }

  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async getAffiliate(id: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, id));
    return affiliate;
  }

  async getAffiliateByUserId(userId: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.userId, userId));
    return affiliate;
  }

  async getAffiliateByReferralCode(code: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.referralCode, code));
    return affiliate;
  }

  async updateAffiliate(id: string, data: Partial<Affiliate>): Promise<Affiliate> {
    const [updated] = await db.update(affiliates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(affiliates.id, id))
      .returning();
    return updated;
  }

  async getAffiliates(status?: string): Promise<(Affiliate & { user: User })[]> {
    const query = status 
      ? db.select().from(affiliates).where(eq(affiliates.status, status))
      : db.select().from(affiliates);
    
    const affiliateList = await query.orderBy(desc(affiliates.createdAt));
    
    const result = await Promise.all(affiliateList.map(async (aff) => {
      const user = await this.getUser(aff.userId);
      return { ...aff, user: user! };
    }));
    
    return result.filter(r => r.user);
  }

  async approveAffiliate(id: string, approvedBy: string): Promise<Affiliate> {
    const [updated] = await db.update(affiliates).set({
      status: 'approved',
      approvedAt: new Date(),
      approvedBy,
      updatedAt: new Date(),
    }).where(eq(affiliates.id, id)).returning();
    
    // Create notification
    await this.createAffiliateNotification(id, 'approval', 'Application Approved!', 
      'Congratulations! Your affiliate application has been approved. You can now start earning commissions.', '/affiliate/dashboard');
    
    return updated;
  }

  async rejectAffiliate(id: string, reason: string): Promise<Affiliate> {
    const [updated] = await db.update(affiliates).set({
      status: 'rejected',
      rejectedReason: reason,
      updatedAt: new Date(),
    }).where(eq(affiliates.id, id)).returning();
    
    await this.createAffiliateNotification(id, 'warning', 'Application Not Approved',
      `Your affiliate application was not approved. Reason: ${reason}`);
    
    return updated;
  }

  // Affiliate Links
  async createAffiliateLink(data: Omit<InsertAffiliateLink, 'id' | 'createdAt' | 'updatedAt'>): Promise<AffiliateLink> {
    const [link] = await db.insert(affiliateLinks).values(data).returning();
    return link;
  }

  async getAffiliateLinks(affiliateId: string): Promise<AffiliateLink[]> {
    return db.select().from(affiliateLinks)
      .where(eq(affiliateLinks.affiliateId, affiliateId))
      .orderBy(desc(affiliateLinks.createdAt));
  }

  async getAffiliateLinkBySlug(slug: string): Promise<AffiliateLink | undefined> {
    const [link] = await db.select().from(affiliateLinks).where(eq(affiliateLinks.slug, slug));
    return link;
  }

  async updateAffiliateLink(id: string, data: Partial<AffiliateLink>): Promise<AffiliateLink> {
    const [updated] = await db.update(affiliateLinks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(affiliateLinks.id, id))
      .returning();
    return updated;
  }

  async deleteAffiliateLink(id: string): Promise<void> {
    await db.delete(affiliateLinks).where(eq(affiliateLinks.id, id));
  }

  async incrementLinkClicks(id: string): Promise<void> {
    await db.update(affiliateLinks).set({
      clicks: sql`${affiliateLinks.clicks} + 1`,
    }).where(eq(affiliateLinks.id, id));
  }

  // Affiliate Visits (Tracking)
  async createAffiliateVisit(data: Omit<AffiliateVisit, 'id' | 'createdAt'>): Promise<AffiliateVisit> {
    const [visit] = await db.insert(affiliateVisits).values(data).returning();
    
    // Also increment affiliate total referrals
    await db.update(affiliates).set({
      totalReferrals: sql`${affiliates.totalReferrals} + 1`,
    }).where(eq(affiliates.id, data.affiliateId));
    
    return visit;
  }

  async getAffiliateVisitByVisitorId(visitorId: string, affiliateId: string): Promise<AffiliateVisit | undefined> {
    const [visit] = await db.select().from(affiliateVisits)
      .where(and(
        eq(affiliateVisits.visitorId, visitorId),
        eq(affiliateVisits.affiliateId, affiliateId)
      ))
      .orderBy(desc(affiliateVisits.createdAt))
      .limit(1);
    return visit;
  }

  async getRecentAffiliateVisit(visitorId: string, daysBack: number = 30): Promise<AffiliateVisit | undefined> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    
    const [visit] = await db.select().from(affiliateVisits)
      .where(and(
        eq(affiliateVisits.visitorId, visitorId),
        gte(affiliateVisits.createdAt, cutoffDate),
        eq(affiliateVisits.converted, 0)
      ))
      .orderBy(desc(affiliateVisits.createdAt))
      .limit(1);
    return visit;
  }

  // Affiliate Conversions
  async createAffiliateConversion(data: Omit<AffiliateConversion, 'id' | 'createdAt' | 'updatedAt'>): Promise<AffiliateConversion> {
    const [conversion] = await db.insert(affiliateConversions).values(data).returning();
    
    // Update affiliate stats
    await db.update(affiliates).set({
      totalConversions: sql`${affiliates.totalConversions} + 1`,
      totalEarnings: sql`${affiliates.totalEarnings} + ${data.commissionAmount}`,
    }).where(eq(affiliates.id, data.affiliateId));
    
    // Update link stats if applicable
    if (data.linkId) {
      await db.update(affiliateLinks).set({
        conversions: sql`${affiliateLinks.conversions} + 1`,
        revenue: sql`${affiliateLinks.revenue} + ${data.orderAmount}`,
      }).where(eq(affiliateLinks.id, data.linkId));
    }
    
    // Create notification
    await this.createAffiliateNotification(data.affiliateId, 'conversion', 'New Conversion!',
      `You earned a commission of $${(data.commissionAmount / 100).toFixed(2)} from a new referral!`, '/affiliate/dashboard');
    
    return conversion;
  }

  async getAffiliateConversions(affiliateId: string): Promise<AffiliateConversion[]> {
    return db.select().from(affiliateConversions)
      .where(eq(affiliateConversions.affiliateId, affiliateId))
      .orderBy(desc(affiliateConversions.createdAt));
  }

  async approveConversion(id: string, approvedBy: string): Promise<AffiliateConversion> {
    const [updated] = await db.update(affiliateConversions).set({
      status: 'approved',
      approvedAt: new Date(),
      approvedBy,
      updatedAt: new Date(),
    }).where(eq(affiliateConversions.id, id)).returning();
    return updated;
  }

  async refundConversion(id: string, reason: string): Promise<AffiliateConversion> {
    const [conversion] = await db.select().from(affiliateConversions).where(eq(affiliateConversions.id, id));
    
    const [updated] = await db.update(affiliateConversions).set({
      status: 'refunded',
      refundedAt: new Date(),
      refundReason: reason,
      updatedAt: new Date(),
    }).where(eq(affiliateConversions.id, id)).returning();
    
    // Deduct from affiliate earnings
    await db.update(affiliates).set({
      totalEarnings: sql`${affiliates.totalEarnings} - ${conversion.commissionAmount}`,
    }).where(eq(affiliates.id, conversion.affiliateId));
    
    return updated;
  }

  // Affiliate Payouts
  async createPayoutRequest(affiliateId: string, amount: number, method: string): Promise<AffiliatePayout> {
    const [payout] = await db.insert(affiliatePayouts).values({
      affiliateId,
      amount,
      method,
      status: 'pending',
    }).returning();
    return payout;
  }

  async getAffiliatePayouts(affiliateId: string): Promise<AffiliatePayout[]> {
    return db.select().from(affiliatePayouts)
      .where(eq(affiliatePayouts.affiliateId, affiliateId))
      .orderBy(desc(affiliatePayouts.createdAt));
  }

  async getAllPendingPayouts(): Promise<(AffiliatePayout & { affiliate: Affiliate })[]> {
    const payouts = await db.select().from(affiliatePayouts)
      .where(eq(affiliatePayouts.status, 'pending'))
      .orderBy(desc(affiliatePayouts.createdAt));
    
    return Promise.all(payouts.map(async (p) => {
      const affiliate = await this.getAffiliate(p.affiliateId);
      return { ...p, affiliate: affiliate! };
    }));
  }

  async processPayoutComplete(id: string, processedBy: string, transactionId?: string): Promise<AffiliatePayout> {
    const [payout] = await db.select().from(affiliatePayouts).where(eq(affiliatePayouts.id, id));
    
    const [updated] = await db.update(affiliatePayouts).set({
      status: 'completed',
      processedAt: new Date(),
      processedBy,
      paypalTransactionId: transactionId,
      updatedAt: new Date(),
    }).where(eq(affiliatePayouts.id, id)).returning();
    
    // Update affiliate total paid out
    await db.update(affiliates).set({
      totalPaidOut: sql`${affiliates.totalPaidOut} + ${payout.amount}`,
    }).where(eq(affiliates.id, payout.affiliateId));
    
    await this.createAffiliateNotification(payout.affiliateId, 'payout', 'Payout Sent!',
      `Your payout of $${(payout.amount / 100).toFixed(2)} has been processed.`);
    
    return updated;
  }

  async failPayout(id: string, reason: string): Promise<AffiliatePayout> {
    const [updated] = await db.update(affiliatePayouts).set({
      status: 'failed',
      failureReason: reason,
      updatedAt: new Date(),
    }).where(eq(affiliatePayouts.id, id)).returning();
    return updated;
  }

  // Affiliate Coupons
  async createAffiliateCoupon(data: Omit<AffiliateCoupon, 'id' | 'createdAt' | 'updatedAt' | 'currentUses'>): Promise<AffiliateCoupon> {
    const [coupon] = await db.insert(affiliateCoupons).values(data).returning();
    return coupon;
  }

  async getAffiliateCoupons(affiliateId: string): Promise<AffiliateCoupon[]> {
    return db.select().from(affiliateCoupons)
      .where(eq(affiliateCoupons.affiliateId, affiliateId))
      .orderBy(desc(affiliateCoupons.createdAt));
  }

  async getAffiliateCouponByCode(code: string): Promise<AffiliateCoupon | undefined> {
    const [coupon] = await db.select().from(affiliateCoupons)
      .where(and(
        eq(affiliateCoupons.code, code.toUpperCase()),
        eq(affiliateCoupons.isActive, 1)
      ));
    return coupon;
  }

  async incrementCouponUsage(id: string): Promise<void> {
    await db.update(affiliateCoupons).set({
      currentUses: sql`${affiliateCoupons.currentUses} + 1`,
    }).where(eq(affiliateCoupons.id, id));
  }

  // Affiliate Creatives
  async getAffiliateCreatives(): Promise<AffiliateCreative[]> {
    return db.select().from(affiliateCreatives)
      .where(eq(affiliateCreatives.isActive, 1))
      .orderBy(desc(affiliateCreatives.createdAt));
  }

  async createAffiliateCreative(data: Omit<AffiliateCreative, 'id' | 'createdAt' | 'updatedAt' | 'downloads'>): Promise<AffiliateCreative> {
    const [creative] = await db.insert(affiliateCreatives).values(data).returning();
    return creative;
  }

  async incrementCreativeDownloads(id: string): Promise<void> {
    await db.update(affiliateCreatives).set({
      downloads: sql`${affiliateCreatives.downloads} + 1`,
    }).where(eq(affiliateCreatives.id, id));
  }

  // Affiliate Notifications
  async createAffiliateNotification(affiliateId: string, type: string, title: string, message: string, actionUrl?: string): Promise<AffiliateNotification> {
    const [notification] = await db.insert(affiliateNotifications).values({
      affiliateId,
      type,
      title,
      message,
      actionUrl,
    }).returning();
    return notification;
  }

  async getAffiliateNotifications(affiliateId: string): Promise<AffiliateNotification[]> {
    return db.select().from(affiliateNotifications)
      .where(eq(affiliateNotifications.affiliateId, affiliateId))
      .orderBy(desc(affiliateNotifications.createdAt))
      .limit(50);
  }

  async markAffiliateNotificationRead(id: string): Promise<void> {
    await db.update(affiliateNotifications).set({ read: 1 })
      .where(eq(affiliateNotifications.id, id));
  }

  // Commission Tiers
  async getCommissionTiers(): Promise<AffiliateCommissionTier[]> {
    return db.select().from(affiliateCommissionTiers)
      .where(eq(affiliateCommissionTiers.isActive, 1))
      .orderBy(affiliateCommissionTiers.minConversions);
  }

  async getApplicableTier(conversions: number, revenue: number): Promise<AffiliateCommissionTier | undefined> {
    const tiers = await this.getCommissionTiers();
    let applicable: AffiliateCommissionTier | undefined;
    
    for (const tier of tiers) {
      if (conversions >= (tier.minConversions || 0) && revenue >= (tier.minRevenue || 0)) {
        applicable = tier;
      }
    }
    
    return applicable;
  }

  // Affiliate Dashboard Stats
  async getAffiliateDashboardStats(affiliateId: string): Promise<{
    totalClicks: number;
    totalConversions: number;
    conversionRate: number;
    pendingEarnings: number;
    approvedEarnings: number;
    paidEarnings: number;
    availableBalance: number;
  }> {
    const affiliate = await this.getAffiliate(affiliateId);
    if (!affiliate) throw new Error('Affiliate not found');
    
    const conversions = await this.getAffiliateConversions(affiliateId);
    
    const pendingEarnings = conversions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + c.commissionAmount, 0);
    
    const approvedEarnings = conversions
      .filter(c => c.status === 'approved')
      .reduce((sum, c) => sum + c.commissionAmount, 0);
    
    const paidEarnings = affiliate.totalPaidOut || 0;
    const availableBalance = approvedEarnings; // Amount available for payout
    
    const links = await this.getAffiliateLinks(affiliateId);
    const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
    
    return {
      totalClicks,
      totalConversions: affiliate.totalConversions || 0,
      conversionRate: totalClicks > 0 ? ((affiliate.totalConversions || 0) / totalClicks) * 100 : 0,
      pendingEarnings,
      approvedEarnings,
      paidEarnings,
      availableBalance,
    };
  }
}

export const storage = new DatabaseStorage();
