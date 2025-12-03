import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// User table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  passwordHash: varchar("password_hash"), // for email/password auth
  passwordResetToken: varchar("password_reset_token"), // for password reset
  passwordResetTokenExpires: timestamp("password_reset_token_expires"), // expiration time for reset token
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

// Courses table
export const courses = pgTable("courses", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  productType: varchar("product_type").notNull(), // "RealEstate" or "Insurance"
  state: varchar("state").notNull(), // "CA", "FL"
  licenseType: varchar("license_type").notNull(), // "Sales Associate", "Broker", "Sales Associate & Broker", etc.
  requirementCycleType: varchar("requirement_cycle_type").notNull(), // "Post-Licensing" or "Continuing Education (Renewal)"
  requirementBucket: varchar("requirement_bucket").notNull(), // "Core Law", "Ethics & Business Practices", "Specialty / Elective", "Post-Licensing Mandatory"
  hoursRequired: integer("hours_required").notNull(),
  deliveryMethod: varchar("delivery_method").default("Self-Paced Online"), // "Self-Paced Online", "Live Webinar", "Classroom"
  difficultyLevel: varchar("difficulty_level"), // "Basic", "Intermediate", "Advanced"
  price: integer("price").notNull(), // in cents (5999 = $59.99)
  sku: varchar("sku").notNull(), // course code (unique per product type + state)
  renewalApplicable: integer("renewal_applicable").default(1), // true for renewal, false for prelicense
  renewalPeriodYears: integer("renewal_period_years"), // 2 for FL, 4 for CA
  providerNumber: varchar("provider_number"), // DBPR provider/school number
  courseOfferingNumber: varchar("course_offering_number"), // DBPR course offering number
  instructorName: varchar("instructor_name"), // Course instructor (for regulatory reports)
  createdAt: timestamp("created_at").defaultNow(),
});

// Course enrollment table
export const enrollments = pgTable("enrollments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  courseId: varchar("course_id").notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  progress: integer("progress").default(0),
  hoursCompleted: integer("hours_completed").default(0),
  completed: integer("completed").default(0),
  completedAt: timestamp("completed_at"),
  certificateUrl: varchar("certificate_url"),
});

// Compliance requirements tracking
export const complianceRequirements = pgTable("compliance_requirements", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  licenseType: varchar("license_type").notNull(), // "salesperson" or "broker"
  state: varchar("state").notNull(),
  hoursRequired: integer("hours_required").notNull().default(45),
  hoursCompleted: integer("hours_completed").default(0),
  renewalDueDate: timestamp("renewal_due_date").notNull(),
  compliant: integer("compliant").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// White label organizations table
export const organizations = pgTable("organizations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").unique().notNull(), // URL-friendly identifier
  logoUrl: varchar("logo_url"),
  primaryColor: varchar("primary_color").default("3b82f6"), // hex without #
  secondaryColor: varchar("secondary_color").default("1f2937"),
  accentColor: varchar("accent_color").default("8b5cf6"),
  domain: varchar("domain").unique(), // custom domain
  customCss: text("custom_css"), // additional custom CSS
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Map users to organizations
export const userOrganizations = pgTable("user_organizations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  organizationId: varchar("organization_id").notNull(),
  role: varchar("role").default("member"), // "admin" or "member"
  createdAt: timestamp("created_at").defaultNow(),
});

// White label course catalog (org-specific courses)
export const organizationCourses = pgTable("organization_courses", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  courseId: varchar("course_id").notNull(),
  customTitle: varchar("custom_title"), // override course title
  customPrice: integer("custom_price"), // override price (in cents)
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Course bundles (e.g., 45-hour packages)
export const courseBundles = pgTable("course_bundles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  productType: varchar("product_type").notNull(), // "RealEstate" or "Insurance"
  state: varchar("state").notNull(), // "CA", "TX", etc.
  licenseType: varchar("license_type").notNull(), // "salesperson", "broker"
  totalHours: integer("total_hours").notNull(),
  bundlePrice: integer("bundle_price").notNull(), // in cents (4500 = $45.00)
  individualCoursePrice: integer("individual_course_price").notNull(), // in cents (1500 = $15.00)
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Map courses to bundles
export const bundleCourses = pgTable("bundle_courses", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  bundleId: varchar("bundle_id").notNull(),
  courseId: varchar("course_id").notNull(),
  sequence: integer("sequence").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Track bundle purchases and enrollments
export const bundleEnrollments = pgTable("bundle_enrollments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  bundleId: varchar("bundle_id").notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  hoursCompleted: integer("hours_completed").default(0),
  isComplete: integer("is_complete").default(0),
  certificateUrl: varchar("certificate_url"),
});

// Sircon reporting for insurance CE completions
export const sirconReports = pgTable("sircon_reports", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  enrollmentId: varchar("enrollment_id").notNull(),
  userId: varchar("user_id").notNull(),
  courseId: varchar("course_id").notNull(),
  courseTitle: varchar("course_title").notNull(),
  completionDate: timestamp("completion_date").notNull(),
  ceHours: integer("ce_hours").notNull(),
  state: varchar("state").notNull(),
  licenseNumber: varchar("license_number").notNull(),
  licenseType: varchar("license_type").notNull(),
  status: varchar("status").default("pending"), // "pending", "submitted", "accepted", "rejected"
  confirmationNumber: varchar("confirmation_number"),
  errorMessage: text("error_message"),
  submittedAt: timestamp("submitted_at"),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// DBPR reporting for Florida real estate course completions
export const dbprReports = pgTable("dbpr_reports", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  enrollmentId: varchar("enrollment_id").notNull(),
  userId: varchar("user_id").notNull(),
  courseId: varchar("course_id").notNull(),
  courseTitle: varchar("course_title").notNull(),
  completionDate: timestamp("completion_date").notNull(),
  ceHours: integer("ce_hours").notNull(),
  licenseNumber: varchar("license_number"),
  ssnLast4: varchar("ssn_last4"),
  licenseType: varchar("license_type").notNull(),
  studentName: varchar("student_name").notNull(),
  providerNumber: varchar("provider_number"),
  courseOfferingNumber: varchar("course_offering_number"),
  instructorName: varchar("instructor_name"),
  status: varchar("status").default("pending"), // "pending", "submitted", "accepted", "rejected"
  confirmationNumber: varchar("confirmation_number"),
  errorMessage: text("error_message"),
  submittedAt: timestamp("submitted_at"),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User license tracking
export const userLicenses = pgTable("user_licenses", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  licenseNumber: varchar("license_number").notNull(),
  licenseType: varchar("license_type").notNull(), // "salesperson", "broker"
  state: varchar("state").notNull(), // "CA", "FL"
  issueDate: timestamp("issue_date").notNull(),
  expirationDate: timestamp("expiration_date").notNull(),
  renewalDueDate: timestamp("renewal_due_date"),
  status: varchar("status").default("active"), // "active", "expired", "pending_renewal"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CE review table (supervisors reviewing agent CE completions)
export const ceReviews = pgTable("ce_reviews", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  enrollmentId: varchar("enrollment_id").notNull(),
  userId: varchar("user_id").notNull(),
  supervisorId: varchar("supervisor_id").notNull(),
  courseId: varchar("course_id").notNull(),
  reviewStatus: varchar("review_status").default("pending"), // "pending", "approved", "rejected"
  reviewNotes: text("review_notes"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Supervisor role assignments
export const supervisors = pgTable("supervisors", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  companyId: varchar("company_id"),
  role: varchar("role").default("supervisor"), // "supervisor", "admin"
  canReviewCE: integer("can_review_ce").default(1),
  canTrackLicenses: integer("can_track_licenses").default(1),
  canApproveRenewals: integer("can_approve_renewals").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Practice exams
export const practiceExams = pgTable("practice_exams", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  totalQuestions: integer("total_questions").notNull(),
  passingScore: integer("passing_score").default(70), // percentage
  timeLimit: integer("time_limit"), // in minutes, optional
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Exam questions
export const examQuestions = pgTable("exam_questions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  examId: varchar("exam_id").notNull(),
  questionText: text("question_text").notNull(),
  questionType: varchar("question_type").notNull(), // "multiple_choice", "true_false"
  correctAnswer: varchar("correct_answer").notNull(),
  explanation: text("explanation"), // shown after answer
  options: text("options").notNull(), // JSON array of options
  sequence: integer("sequence").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User exam attempts
export const examAttempts = pgTable("exam_attempts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  examId: varchar("exam_id").notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  score: integer("score"),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").default(0),
  passed: integer("passed"), // 1 for pass (>= 70%), 0 for fail
  timeSpent: integer("time_spent"), // in seconds
  createdAt: timestamp("created_at").defaultNow(),
});

// User exam answers (tracks each answer during exam)
export const examAnswers = pgTable("exam_answers", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  attemptId: varchar("attempt_id").notNull(),
  questionId: varchar("question_id").notNull(),
  userAnswer: varchar("user_answer").notNull(),
  isCorrect: integer("is_correct"), // 1 for correct, 0 for incorrect
  answeredAt: timestamp("answered_at").defaultNow(),
});

// Purchase history table - tracks individual course purchases via Stripe
export const purchases = pgTable("purchases", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  courseId: varchar("course_id").notNull(),
  stripeSessionId: varchar("stripe_session_id").unique().notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  amount: integer("amount").notNull(), // in cents
  currency: varchar("currency").default("usd"),
  status: varchar("status").default("completed"), // "pending", "completed", "failed", "refunded"
  customerEmail: varchar("customer_email"),
  purchasedAt: timestamp("purchased_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const upsertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
});
export type Purchase = typeof purchases.$inferSelect;
export type UpsertPurchase = z.infer<typeof upsertPurchaseSchema>;

// User subscriptions (monthly/annual billing)
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id").unique(),
  subscriptionType: varchar("subscription_type").notNull(), // "monthly" or "annual"
  status: varchar("status").default("active"), // "active", "paused", "cancelled"
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelledAt: timestamp("cancelled_at"),
  pricePerMonth: integer("price_per_month").notNull(), // in cents
  annualPrice: integer("annual_price"), // annual pricing (in cents)
  autoRenew: integer("auto_renew").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coupon codes for discounts and registration
export const coupons = pgTable("coupons", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  code: varchar("code").unique().notNull(), // "EARLY50", "WELCOME25", etc.
  discountType: varchar("discount_type").notNull(), // "percentage" or "fixed"
  discountValue: integer("discount_value").notNull(), // percentage (50 = 50%) or cents (2500 = $25.00)
  description: varchar("description"),
  maxUses: integer("max_uses"), // null = unlimited
  timesUsed: integer("times_used").default(0),
  expirationDate: timestamp("expiration_date"),
  isActive: integer("is_active").default(1),
  applicableProductTypes: varchar("applicable_product_types"), // "RealEstate", "Insurance", or both (JSON)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Track coupon usage per user
export const couponUsage = pgTable("coupon_usage", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  couponId: varchar("coupon_id").notNull(),
  enrollmentId: varchar("enrollment_id"), // which enrollment used it
  discountAmount: integer("discount_amount").notNull(), // in cents
  usedAt: timestamp("used_at").defaultNow(),
});

// Email campaigns/blasts
export const emailCampaigns = pgTable("email_campaigns", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  subject: varchar("subject").notNull(),
  htmlContent: text("html_content").notNull(),
  plainTextContent: text("plain_text_content"),
  status: varchar("status").default("draft"), // "draft", "scheduled", "sent", "sending"
  targetSegment: varchar("target_segment"), // "all", "inactive", "completed", "no_subscription", JSON for custom
  recipientCount: integer("recipient_count").default(0),
  sentCount: integer("sent_count").default(0),
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
  scheduleDateTime: timestamp("schedule_date_time"),
  sentAt: timestamp("sent_at"),
  createdBy: varchar("created_by").notNull(), // admin user ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email campaign recipients tracking
export const emailRecipients = pgTable("email_recipients", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull(),
  userId: varchar("user_id").notNull(),
  email: varchar("email").notNull(),
  status: varchar("status").default("pending"), // "pending", "sent", "failed", "bounced"
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email tracking (individual opens/clicks with tracking pixel)
export const emailTracking = pgTable("email_tracking", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  recipientId: varchar("recipient_id").notNull(),
  campaignId: varchar("campaign_id").notNull(),
  userId: varchar("user_id").notNull(),
  eventType: varchar("event_type").notNull(), // "open", "click"
  linkUrl: varchar("link_url"), // for click events
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Support Chat
export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: varchar("title").default("New Chat"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course units (19 units in FREC I)
export const units = pgTable("units", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull(),
  unitNumber: integer("unit_number").notNull(), // 1-19
  title: varchar("title").notNull(),
  description: text("description"),
  hoursRequired: integer("hours_required").default(3),
  sequence: integer("sequence").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Videos (reusable video assets - can be at course or unit level)
export const videos = pgTable("videos", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull(),
  unitId: varchar("unit_id"),
  title: varchar("title").notNull(),
  videoUrl: varchar("video_url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  description: text("description"),
  durationMinutes: integer("duration_minutes"),
  uploadedBy: varchar("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lessons within units (3 lessons per unit)
export const lessons = pgTable("lessons", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  unitId: varchar("unit_id").notNull(),
  videoId: varchar("video_id"),
  lessonNumber: integer("lesson_number").notNull(),
  title: varchar("title").notNull(),
  videoUrl: varchar("video_url"),
  durationMinutes: integer("duration_minutes").default(15),
  sequence: integer("sequence").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Track user progress on lessons
export const lessonProgress = pgTable("lesson_progress", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  enrollmentId: varchar("enrollment_id").notNull(),
  lessonId: varchar("lesson_id").notNull(),
  userId: varchar("user_id").notNull(),
  completed: integer("completed").default(0),
  timeSpentMinutes: integer("time_spent_minutes").default(0),
  completedAt: timestamp("completed_at"),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Certificates
export const certificates = pgTable("certificates", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  enrollmentId: varchar("enrollment_id").notNull(),
  userId: varchar("user_id").notNull(),
  courseId: varchar("course_id").notNull(),
  certificateNumber: varchar("certificate_number").unique().notNull(),
  issuedDate: timestamp("issued_date").defaultNow(),
  expirationDate: timestamp("expiration_date"),
  certificatePdfUrl: varchar("certificate_pdf_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  role: varchar("role").notNull(), // "user" or "assistant"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Media library for uploaded assets (images, videos, documents)
export const mediaAssets = pgTable("media_assets", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fileName: varchar("file_name").notNull(),
  fileUrl: varchar("file_url").notNull(),
  fileType: varchar("file_type").notNull(), // "image", "video", "document"
  mimeType: varchar("mime_type").notNull(),
  fileSize: integer("file_size").notNull(), // bytes
  width: integer("width"), // for images/videos
  height: integer("height"), // for images/videos
  duration: integer("duration"), // for videos (seconds)
  thumbnailUrl: varchar("thumbnail_url"),
  altText: varchar("alt_text"),
  description: text("description"),
  uploadedBy: varchar("uploaded_by").notNull(),
  courseId: varchar("course_id"), // optional link to course
  unitId: varchar("unit_id"), // optional link to unit
  lessonId: varchar("lesson_id"), // optional link to lesson
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Enrollment = typeof enrollments.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type ComplianceRequirement = typeof complianceRequirements.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type UserOrganization = typeof userOrganizations.$inferSelect;
export type OrganizationCourse = typeof organizationCourses.$inferSelect;
export type CourseBundle = typeof courseBundles.$inferSelect;
export type BundleEnrollment = typeof bundleEnrollments.$inferSelect;
export type SirconReport = typeof sirconReports.$inferSelect;
export type DBPRReport = typeof dbprReports.$inferSelect;
export type UserLicense = typeof userLicenses.$inferSelect;
export type CEReview = typeof ceReviews.$inferSelect;
export type Supervisor = typeof supervisors.$inferSelect;
export type PracticeExam = typeof practiceExams.$inferSelect;
export type ExamQuestion = typeof examQuestions.$inferSelect;
export type ExamAttempt = typeof examAttempts.$inferSelect;
export type ExamAnswer = typeof examAnswers.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type CouponUsage = typeof couponUsage.$inferSelect;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type EmailRecipient = typeof emailRecipients.$inferSelect;
export type EmailTracking = typeof emailTracking.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type Unit = typeof units.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;

// Chat Zod schemas
export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// Unit Zod schemas
export const insertUnitSchema = createInsertSchema(units).omit({
  id: true,
  createdAt: true,
});
export type InsertUnit = z.infer<typeof insertUnitSchema>;

export const updateUnitSchema = insertUnitSchema.partial();
export type UpdateUnit = z.infer<typeof updateUnitSchema>;

// Lesson Zod schemas
export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
  createdAt: true,
});
export type InsertLesson = z.infer<typeof insertLessonSchema>;

export const updateLessonSchema = insertLessonSchema.partial();
export type UpdateLesson = z.infer<typeof updateLessonSchema>;

// Video Zod schemas
export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVideo = z.infer<typeof insertVideoSchema>;

export const updateVideoSchema = insertVideoSchema.partial();
export type UpdateVideo = z.infer<typeof updateVideoSchema>;
