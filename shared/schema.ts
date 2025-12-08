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
  expirationMonths: integer("expiration_months").default(6), // Months student has to complete course (default 6)
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
  expiresAt: timestamp("expires_at"), // When the enrollment expires (calculated from course.expirationMonths)
  expiredAt: timestamp("expired_at"), // When the enrollment was marked as expired (null if not expired)
  progress: integer("progress").default(0),
  hoursCompleted: integer("hours_completed").default(0),
  completed: integer("completed").default(0),
  completedAt: timestamp("completed_at"),
  certificateUrl: varchar("certificate_url"),
  // LMS progress fields
  currentUnitIndex: integer("current_unit_index").default(1), // Which unit user is on (1-19)
  totalTimeSeconds: integer("total_time_seconds").default(0), // Total time spent in course
  finalExamPassed: integer("final_exam_passed").default(0), // 1 if final exam passed
  finalExamScore: integer("final_exam_score"), // Final exam score percentage
  finalExamAttempts: integer("final_exam_attempts").default(0), // Number of final exam attempts
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
  isFinalExam: integer("is_final_exam").default(0), // 1 for final exam, 0 for unit quiz
  examForm: varchar("exam_form"), // "A", "B" for Florida dual exam requirement
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
  pageReference: varchar("page_reference"), // Florida requirement: page number where answer is found
  unitReference: varchar("unit_reference"), // Reference to unit/lesson for the answer
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

// Account credits - track credits issued to users for refunds, promotions, etc.
export const accountCredits = pgTable("account_credits", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  amount: integer("amount").notNull(), // in cents (positive = credit, negative = used)
  type: varchar("type").notNull(), // "refund", "promotional", "adjustment", "used"
  description: varchar("description"),
  relatedPurchaseId: varchar("related_purchase_id"), // if from a refund
  relatedEnrollmentId: varchar("related_enrollment_id"), // if used for enrollment
  issuedBy: varchar("issued_by"), // admin user ID who issued the credit
  expiresAt: timestamp("expires_at"), // optional expiration date
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAccountCreditSchema = createInsertSchema(accountCredits).omit({
  id: true,
  createdAt: true,
});
export type AccountCredit = typeof accountCredits.$inferSelect;
export type InsertAccountCredit = z.infer<typeof insertAccountCreditSchema>;

// Refund history - tracks all refunds processed
export const refunds = pgTable("refunds", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  purchaseId: varchar("purchase_id").notNull(),
  userId: varchar("user_id").notNull(),
  stripeRefundId: varchar("stripe_refund_id"),
  amount: integer("amount").notNull(), // in cents
  reason: varchar("reason"), // "requested_by_customer", "duplicate", "fraudulent", "other"
  notes: text("notes"), // admin notes
  status: varchar("status").default("pending"), // "pending", "succeeded", "failed", "cancelled"
  processedBy: varchar("processed_by"), // admin user ID
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRefundSchema = createInsertSchema(refunds).omit({
  id: true,
  createdAt: true,
});
export type Refund = typeof refunds.$inferSelect;
export type InsertRefund = z.infer<typeof insertRefundSchema>;

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
  content: text("content"),
  videoUrl: varchar("video_url"),
  imageUrl: varchar("image_url"),
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
  timeSpentSeconds: integer("time_spent_seconds").default(0), // More granular time tracking
  completedAt: timestamp("completed_at"),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Track user progress on units (sequential completion)
export const unitProgress = pgTable("unit_progress", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  enrollmentId: varchar("enrollment_id").notNull(),
  unitId: varchar("unit_id").notNull(),
  userId: varchar("user_id").notNull(),
  status: varchar("status").default("locked"), // "locked", "in_progress", "completed"
  lessonsCompleted: integer("lessons_completed").default(0),
  quizPassed: integer("quiz_passed").default(0), // 1 if unit quiz passed
  quizScore: integer("quiz_score"), // Best quiz score percentage
  quizAttempts: integer("quiz_attempts").default(0),
  timeSpentSeconds: integer("time_spent_seconds").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Question banks for unit quizzes and final exam
export const questionBanks = pgTable("question_banks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull(),
  unitId: varchar("unit_id"), // null for final exam
  bankType: varchar("bank_type").notNull(), // "unit_quiz" or "final_exam"
  title: varchar("title").notNull(),
  description: text("description"),
  questionsPerAttempt: integer("questions_per_attempt").default(20), // How many questions to show per attempt
  passingScore: integer("passing_score").default(70), // Percentage needed to pass
  timeLimit: integer("time_limit"), // Optional time limit in minutes
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Questions in a question bank (larger pool for rotation)
export const bankQuestions = pgTable("bank_questions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  bankId: varchar("bank_id").notNull(),
  questionText: text("question_text").notNull(),
  questionType: varchar("question_type").default("multiple_choice"), // "multiple_choice", "true_false"
  options: text("options").notNull(), // JSON array of option strings
  correctOption: integer("correct_option").notNull(), // Index of correct answer (0-based)
  explanation: text("explanation").notNull(), // Feedback explaining why answer is correct
  difficulty: varchar("difficulty").default("medium"), // "easy", "medium", "hard"
  category: varchar("category"), // Optional category for organizing questions
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quiz attempts (tracks each time user takes a quiz)
export const quizAttempts = pgTable("quiz_attempts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  enrollmentId: varchar("enrollment_id").notNull(),
  bankId: varchar("bank_id").notNull(),
  userId: varchar("user_id").notNull(),
  questionIds: text("question_ids").notNull(), // JSON array of question IDs for this attempt (rotated selection)
  score: integer("score"), // Percentage score
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").default(0),
  passed: integer("passed"), // 1 if passed, 0 if failed
  timeSpentSeconds: integer("time_spent_seconds").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Individual answers within a quiz attempt
export const quizAnswers = pgTable("quiz_answers", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  attemptId: varchar("attempt_id").notNull(),
  questionId: varchar("question_id").notNull(),
  selectedOption: integer("selected_option"), // Index of selected answer
  isCorrect: integer("is_correct"), // 1 if correct, 0 if incorrect
  answeredAt: timestamp("answered_at").defaultNow(),
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

// User notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(), // "course_available", "certificate_expiring", "exam_results", "enrollment", "system"
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  link: varchar("link"), // optional link to navigate to
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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
export type UnitProgress = typeof unitProgress.$inferSelect;
export type QuestionBank = typeof questionBanks.$inferSelect;
export type BankQuestion = typeof bankQuestions.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type QuizAnswer = typeof quizAnswers.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

// Notification Zod schemas
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

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

// Website Pages table for admin page editor
export const websitePages = pgTable("website_pages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  slug: varchar("slug").notNull().unique(),
  title: varchar("title").notNull(),
  blocks: text("blocks"), // JSON string of page blocks
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type WebsitePage = typeof websitePages.$inferSelect;
export type InsertWebsitePage = typeof websitePages.$inferInsert;

// System Settings table for platform-wide configuration
export const systemSettings = pgTable("system_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  value: text("value"),
  category: varchar("category").notNull().default("general"),
  label: varchar("label"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

// Email Templates table for customizable email communications
export const emailTemplates = pgTable("email_templates", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  subject: varchar("subject").notNull(),
  body: text("body").notNull(),
  category: varchar("category").notNull().default("transactional"),
  variables: text("variables"), // JSON array of available template variables
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

// User Roles table for role-based access control
export const userRoles = pgTable("user_roles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  permissions: text("permissions"), // JSON array of permission strings
  isSystem: integer("is_system").default(0), // System roles cannot be deleted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = typeof userRoles.$inferInsert;

// User Role Assignments - links users to roles
export const userRoleAssignments = pgTable("user_role_assignments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  roleId: varchar("role_id").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedBy: varchar("assigned_by"),
});

export type UserRoleAssignment = typeof userRoleAssignments.$inferSelect;
export type InsertUserRoleAssignment = typeof userRoleAssignments.$inferInsert;

// Privacy Consent Records - GDPR/CCPA compliance
export const privacyConsents = pgTable("privacy_consents", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  visitorId: varchar("visitor_id").notNull(), // Anonymous visitor ID or user ID
  userId: varchar("user_id"), // Linked user ID if logged in
  consentType: varchar("consent_type").notNull(), // "necessary", "analytics", "marketing", "functional"
  consented: integer("consented").notNull().default(0), // 1 = consented, 0 = declined
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  source: varchar("source").default("cookie_banner"), // "cookie_banner", "preference_center", "registration"
  version: varchar("version").default("1.0"), // Policy version consented to
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PrivacyConsent = typeof privacyConsents.$inferSelect;
export type InsertPrivacyConsent = typeof privacyConsents.$inferInsert;

// Data Subject Requests - GDPR/CCPA data access and deletion requests
export const dataSubjectRequests = pgTable("data_subject_requests", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  requestType: varchar("request_type").notNull(), // "access", "deletion", "rectification", "portability", "do_not_sell"
  status: varchar("status").notNull().default("pending"), // "pending", "processing", "completed", "denied"
  requestDetails: text("request_details"), // JSON with specific request details
  responseDetails: text("response_details"), // Admin response or processing notes
  completedAt: timestamp("completed_at"),
  processedBy: varchar("processed_by"), // Admin who processed the request
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type DataSubjectRequest = typeof dataSubjectRequests.$inferSelect;
export type InsertDataSubjectRequest = typeof dataSubjectRequests.$inferInsert;

// Audit Logs - SOC 2 compliance for security event tracking
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id"), // User who performed action (null for system actions)
  action: varchar("action").notNull(), // "login", "logout", "password_change", "data_export", "account_deletion", etc.
  resourceType: varchar("resource_type"), // "user", "course", "enrollment", etc.
  resourceId: varchar("resource_id"), // ID of affected resource
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  details: text("details"), // JSON with additional context
  severity: varchar("severity").default("info"), // "info", "warning", "error", "critical"
  createdAt: timestamp("created_at").defaultNow(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// User Privacy Preferences - GDPR, CCPA, and FERPA compliance
export const userPrivacyPreferences = pgTable("user_privacy_preferences", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  // CCPA preferences
  doNotSell: integer("do_not_sell").default(0), // CCPA Do Not Sell flag
  marketingEmails: integer("marketing_emails").default(1),
  analyticsTracking: integer("analytics_tracking").default(1),
  functionalCookies: integer("functional_cookies").default(1),
  thirdPartySharing: integer("third_party_sharing").default(0),
  // FERPA preferences
  directoryInfoOptOut: integer("directory_info_opt_out").default(0), // Opt out of directory information disclosure
  educationRecordsConsent: integer("education_records_consent").default(0), // Consent to share education records with third parties
  transcriptSharingConsent: integer("transcript_sharing_consent").default(0), // Consent to share transcripts/certificates
  regulatoryReportingConsent: integer("regulatory_reporting_consent").default(1), // Consent to report completions to regulatory bodies (default on)
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UserPrivacyPreference = typeof userPrivacyPreferences.$inferSelect;
export type InsertUserPrivacyPreference = typeof userPrivacyPreferences.$inferInsert;

// Educational Records Request - FERPA access and amendment requests
export const educationRecordsRequests = pgTable("education_records_requests", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  requestType: varchar("request_type").notNull(), // "access", "amendment", "disclosure_log"
  status: varchar("status").notNull().default("pending"), // "pending", "processing", "completed", "denied"
  requestDetails: text("request_details"), // JSON with specific request details
  responseDetails: text("response_details"), // Admin response or processing notes
  recordsRequested: text("records_requested"), // Specific records requested (course transcripts, certificates, etc.)
  completedAt: timestamp("completed_at"),
  processedBy: varchar("processed_by"), // Admin who processed the request
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type EducationRecordsRequest = typeof educationRecordsRequests.$inferSelect;
export type InsertEducationRecordsRequest = typeof educationRecordsRequests.$inferInsert;

// ============ AFFILIATE MARKETING TABLES ============

// Affiliates - Partner accounts for referral marketing
export const affiliates = pgTable("affiliates", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(), // Links to users table
  companyName: varchar("company_name"),
  website: varchar("website"),
  taxId: varchar("tax_id"), // For 1099 reporting (encrypted)
  paypalEmail: varchar("paypal_email"), // PayPal payout email
  bankAccountLast4: varchar("bank_account_last4"), // Last 4 digits of bank account
  status: varchar("status").notNull().default("pending"), // "pending", "approved", "suspended", "rejected"
  tier: varchar("tier").notNull().default("standard"), // "standard", "premium", "elite"
  commissionRate: integer("commission_rate").notNull().default(20), // Default 20% commission
  cookieDurationDays: integer("cookie_duration_days").notNull().default(30), // Tracking cookie duration
  referralCode: varchar("referral_code").unique(), // Unique code like "JOHN20"
  bio: text("bio"), // Affiliate description/bio
  promotionalMethods: text("promotional_methods"), // How they plan to promote
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by"), // Admin who approved
  rejectedReason: text("rejected_reason"),
  totalReferrals: integer("total_referrals").default(0),
  totalConversions: integer("total_conversions").default(0),
  totalEarnings: integer("total_earnings").default(0), // In cents
  totalPaidOut: integer("total_paid_out").default(0), // In cents
  minimumPayout: integer("minimum_payout").default(5000), // Minimum payout threshold in cents ($50)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;
export const insertAffiliateSchema = createInsertSchema(affiliates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalReferrals: true,
  totalConversions: true,
  totalEarnings: true,
  totalPaidOut: true,
});

// Affiliate Referral Links - Trackable links for each affiliate
export const affiliateLinks = pgTable("affiliate_links", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").notNull(),
  name: varchar("name").notNull(), // Link name for affiliate's reference
  slug: varchar("slug").unique().notNull(), // URL slug (e.g., "john-summer-promo")
  targetUrl: varchar("target_url"), // Optional specific landing page
  courseId: varchar("course_id"), // Optional specific course
  couponCode: varchar("coupon_code"), // Optional coupon to auto-apply
  utmSource: varchar("utm_source"),
  utmMedium: varchar("utm_medium"),
  utmCampaign: varchar("utm_campaign"),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  revenue: integer("revenue").default(0), // In cents
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AffiliateLink = typeof affiliateLinks.$inferSelect;
export type InsertAffiliateLink = typeof affiliateLinks.$inferInsert;
export const insertAffiliateLinkSchema = createInsertSchema(affiliateLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  clicks: true,
  conversions: true,
  revenue: true,
});

// Affiliate Visits - Track all referral visits
export const affiliateVisits = pgTable("affiliate_visits", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").notNull(),
  linkId: varchar("link_id"), // Optional - which specific link was used
  visitorId: varchar("visitor_id").notNull(), // Anonymous visitor tracking ID
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  referrer: varchar("referrer"),
  landingPage: varchar("landing_page"),
  converted: integer("converted").default(0), // 1 if this visit led to conversion
  conversionId: varchar("conversion_id"), // Links to affiliate_conversions
  createdAt: timestamp("created_at").defaultNow(),
});

export type AffiliateVisit = typeof affiliateVisits.$inferSelect;
export type InsertAffiliateVisit = typeof affiliateVisits.$inferInsert;

// Affiliate Conversions - Successful referral conversions
export const affiliateConversions = pgTable("affiliate_conversions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").notNull(),
  linkId: varchar("link_id"), // Which link was used
  userId: varchar("user_id").notNull(), // The converted customer
  enrollmentId: varchar("enrollment_id"), // The enrollment that was purchased
  courseId: varchar("course_id"),
  orderAmount: integer("order_amount").notNull(), // Order total in cents
  commissionRate: integer("commission_rate").notNull(), // Rate at time of conversion
  commissionAmount: integer("commission_amount").notNull(), // Commission earned in cents
  status: varchar("status").notNull().default("pending"), // "pending", "approved", "paid", "refunded", "disputed"
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by"),
  refundedAt: timestamp("refunded_at"),
  refundReason: text("refund_reason"),
  payoutId: varchar("payout_id"), // Links to affiliate_payouts when paid
  attributionType: varchar("attribution_type").default("last_click"), // "first_click", "last_click", "linear"
  cookieAge: integer("cookie_age"), // Days since referral click
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AffiliateConversion = typeof affiliateConversions.$inferSelect;
export type InsertAffiliateConversion = typeof affiliateConversions.$inferInsert;

// Affiliate Payouts - Payment transactions to affiliates
export const affiliatePayouts = pgTable("affiliate_payouts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").notNull(),
  amount: integer("amount").notNull(), // In cents
  method: varchar("method").notNull(), // "paypal", "stripe", "bank_transfer", "check"
  status: varchar("status").notNull().default("pending"), // "pending", "processing", "completed", "failed"
  paypalTransactionId: varchar("paypal_transaction_id"),
  stripeTransferId: varchar("stripe_transfer_id"),
  notes: text("notes"),
  processedAt: timestamp("processed_at"),
  processedBy: varchar("processed_by"), // Admin who processed
  failureReason: text("failure_reason"),
  periodStart: timestamp("period_start"), // Commission period start
  periodEnd: timestamp("period_end"), // Commission period end
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AffiliatePayout = typeof affiliatePayouts.$inferSelect;
export type InsertAffiliatePayout = typeof affiliatePayouts.$inferInsert;

// Affiliate Coupons - Promotional discount codes for affiliates
export const affiliateCoupons = pgTable("affiliate_coupons", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").notNull(),
  code: varchar("code").unique().notNull(), // Coupon code (e.g., "JOHN20OFF")
  discountType: varchar("discount_type").notNull(), // "percentage", "fixed"
  discountValue: integer("discount_value").notNull(), // Percentage or cents
  maxUses: integer("max_uses"), // Null for unlimited
  currentUses: integer("current_uses").default(0),
  minOrderAmount: integer("min_order_amount"), // Minimum order in cents
  courseId: varchar("course_id"), // Optional - specific course only
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AffiliateCoupon = typeof affiliateCoupons.$inferSelect;
export type InsertAffiliateCoupon = typeof affiliateCoupons.$inferInsert;
export const insertAffiliateCouponSchema = createInsertSchema(affiliateCoupons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentUses: true,
});

// Affiliate Creatives - Marketing materials for affiliates
export const affiliateCreatives = pgTable("affiliate_creatives", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // "banner", "email", "social", "text_link"
  description: text("description"),
  imageUrl: varchar("image_url"),
  dimensions: varchar("dimensions"), // "300x250", "728x90", etc.
  htmlCode: text("html_code"), // For banner embeds
  textContent: text("text_content"), // For text/email templates
  courseId: varchar("course_id"), // Optional - specific course
  isActive: integer("is_active").default(1),
  downloads: integer("downloads").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AffiliateCreative = typeof affiliateCreatives.$inferSelect;
export type InsertAffiliateCreative = typeof affiliateCreatives.$inferInsert;
export const insertAffiliateCreativeSchema = createInsertSchema(affiliateCreatives).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  downloads: true,
});

// Affiliate Notifications - Communication history with affiliates
export const affiliateNotifications = pgTable("affiliate_notifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").notNull(),
  type: varchar("type").notNull(), // "approval", "payout", "conversion", "announcement", "warning"
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  read: integer("read").default(0),
  actionUrl: varchar("action_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AffiliateNotification = typeof affiliateNotifications.$inferSelect;
export type InsertAffiliateNotification = typeof affiliateNotifications.$inferInsert;

// Affiliate Commission Tiers - Multi-tier commission structures
export const affiliateCommissionTiers = pgTable("affiliate_commission_tiers", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  minConversions: integer("min_conversions").default(0), // Min conversions to qualify
  minRevenue: integer("min_revenue").default(0), // Min revenue to qualify (cents)
  commissionRate: integer("commission_rate").notNull(), // Commission percentage
  bonusAmount: integer("bonus_amount"), // One-time bonus when tier reached (cents)
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AffiliateCommissionTier = typeof affiliateCommissionTiers.$inferSelect;
export type InsertAffiliateCommissionTier = typeof affiliateCommissionTiers.$inferInsert;

// ============================================================
// CMS Page Builder Tables
// ============================================================

// Site Pages - Marketing/static pages (Home, About, Contact, etc.)
export const sitePages = pgTable("site_pages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  slug: varchar("slug").unique().notNull(), // URL path (e.g., "home", "about", "contact")
  title: varchar("title").notNull(), // Page title for display and SEO
  description: text("description"), // Meta description for SEO
  isPublished: integer("is_published").default(0), // 1 = live, 0 = draft
  isSystemPage: integer("is_system_page").default(0), // 1 = cannot delete (Home, etc.)
  sortOrder: integer("sort_order").default(0), // Order in navigation
  metaTitle: varchar("meta_title"), // Custom SEO title
  metaKeywords: varchar("meta_keywords"), // SEO keywords
  ogImage: varchar("og_image"), // Open Graph image URL
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SitePage = typeof sitePages.$inferSelect;
export type InsertSitePage = typeof sitePages.$inferInsert;
export const insertSitePageSchema = createInsertSchema(sitePages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Page Sections - Container sections within a page (Hero, Features, CTA, etc.)
export const pageSections = pgTable("page_sections", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  pageId: varchar("page_id").notNull(), // References sitePages.id
  sectionType: varchar("section_type").notNull(), // "hero", "text", "features", "cta", "gallery", "columns", "custom"
  title: varchar("title"), // Optional section title
  backgroundColor: varchar("background_color"), // Custom background color
  backgroundImage: varchar("background_image"), // Background image URL
  padding: varchar("padding").default("normal"), // "none", "small", "normal", "large"
  sortOrder: integer("sort_order").default(0), // Order within page
  isVisible: integer("is_visible").default(1), // Toggle visibility without deleting
  settings: text("settings"), // JSON for additional section-specific settings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PageSection = typeof pageSections.$inferSelect;
export type InsertPageSection = typeof pageSections.$inferInsert;
export const insertPageSectionSchema = createInsertSchema(pageSections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Section Blocks - Individual content blocks within sections
export const sectionBlocks = pgTable("section_blocks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sectionId: varchar("section_id").notNull(), // References pageSections.id
  blockType: varchar("block_type").notNull(), // "heading", "text", "image", "video", "button", "spacer", "divider", "html"
  content: text("content"), // Main content (text, HTML, or markdown)
  mediaUrl: varchar("media_url"), // Image/video URL
  mediaAlt: varchar("media_alt"), // Alt text for images
  linkUrl: varchar("link_url"), // For buttons/links
  linkTarget: varchar("link_target").default("_self"), // "_self", "_blank"
  alignment: varchar("alignment").default("left"), // "left", "center", "right"
  size: varchar("size").default("medium"), // "small", "medium", "large", "full"
  sortOrder: integer("sort_order").default(0), // Order within section
  isVisible: integer("is_visible").default(1), // Toggle visibility
  settings: text("settings"), // JSON for block-specific styling/settings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SectionBlock = typeof sectionBlocks.$inferSelect;
export type InsertSectionBlock = typeof sectionBlocks.$inferInsert;
export const insertSectionBlockSchema = createInsertSchema(sectionBlocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================================
// WHITE-LABEL LMS INFRASTRUCTURE
// ============================================================

// State Regulatory Configurations - Supports multi-state compliance
export const stateConfigurations = pgTable("state_configurations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  stateCode: varchar("state_code").unique().notNull(), // "FL", "CA", "TX", etc.
  stateName: varchar("state_name").notNull(), // "Florida", "California", "Texas"
  isActive: integer("is_active").default(1), // Whether state is available for courses
  regulatoryBody: varchar("regulatory_body"), // "DBPR", "DRE", etc.
  regulatoryUrl: varchar("regulatory_url"), // Link to regulatory body
  providerNumber: varchar("provider_number"), // Platform's provider number for this state
  licenseTypes: text("license_types"), // JSON array of supported license types
  requirementCycles: text("requirement_cycles"), // JSON array of requirement cycles
  renewalPeriodYears: integer("renewal_period_years").default(2), // Default renewal period
  ceHoursRequired: integer("ce_hours_required"), // CE hours required for renewal
  preLicenseHoursRequired: integer("pre_license_hours_required"), // Pre-license hours
  postLicenseHoursRequired: integer("post_license_hours_required"), // Post-license hours
  electronicReporting: integer("electronic_reporting").default(0), // 1 if supports e-reporting
  reportingFormat: varchar("reporting_format"), // "DBPR", "DRE", custom format name
  certificateTemplate: text("certificate_template"), // HTML template for certificates
  specialRequirements: text("special_requirements"), // JSON for state-specific rules
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type StateConfiguration = typeof stateConfigurations.$inferSelect;
export type InsertStateConfiguration = typeof stateConfigurations.$inferInsert;
export const insertStateConfigurationSchema = createInsertSchema(stateConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// LMS Content Packages - Tracks SCORM/xAPI exports
export const contentPackages = pgTable("content_packages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull(),
  packageType: varchar("package_type").notNull(), // "scorm12", "scorm2004", "xapi", "qti", "commonCartridge"
  version: varchar("version").default("1.0"),
  filename: varchar("filename").notNull(),
  fileUrl: varchar("file_url"),
  fileSize: integer("file_size"), // In bytes
  manifest: text("manifest"), // XML/JSON manifest content
  metadata: text("metadata"), // Additional package metadata as JSON
  status: varchar("status").default("draft"), // "draft", "published", "archived"
  exportedBy: varchar("exported_by"), // Admin who created the export
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ContentPackage = typeof contentPackages.$inferSelect;
export type InsertContentPackage = typeof contentPackages.$inferInsert;
export const insertContentPackageSchema = createInsertSchema(contentPackages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Learning Analytics - Tracks detailed learner activity
export const learningAnalytics = pgTable("learning_analytics", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  enrollmentId: varchar("enrollment_id"),
  courseId: varchar("course_id"),
  unitId: varchar("unit_id"),
  lessonId: varchar("lesson_id"),
  eventType: varchar("event_type").notNull(), // "lesson_start", "lesson_complete", "quiz_attempt", "video_play", etc.
  eventData: text("event_data"), // JSON with event-specific data
  duration: integer("duration"), // Event duration in seconds
  score: integer("score"), // For quiz/exam events
  maxScore: integer("max_score"),
  sessionId: varchar("session_id"), // Group events by learning session
  deviceType: varchar("device_type"), // "desktop", "mobile", "tablet"
  browser: varchar("browser"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type LearningAnalytic = typeof learningAnalytics.$inferSelect;
export type InsertLearningAnalytic = typeof learningAnalytics.$inferInsert;
export const insertLearningAnalyticSchema = createInsertSchema(learningAnalytics).omit({
  id: true,
  createdAt: true,
});

// Competency Tracking - Tracks skill/competency development
export const competencies = pgTable("competencies", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category"), // "technical", "regulatory", "ethics", etc.
  level: varchar("level"), // "beginner", "intermediate", "advanced"
  createdAt: timestamp("created_at").defaultNow(),
});

export type Competency = typeof competencies.$inferSelect;
export type InsertCompetency = typeof competencies.$inferInsert;

// User Competency Progress
export const userCompetencies = pgTable("user_competencies", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  competencyId: varchar("competency_id").notNull(),
  level: integer("level").default(0), // 0-100 mastery level
  assessedAt: timestamp("assessed_at").defaultNow(),
  sourceType: varchar("source_type"), // "quiz", "exam", "lesson", "manual"
  sourceId: varchar("source_id"), // ID of quiz/exam/lesson that assessed this
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UserCompetency = typeof userCompetencies.$inferSelect;
export type InsertUserCompetency = typeof userCompetencies.$inferInsert;

// Learning Paths - Structured course sequences
export const learningPaths = pgTable("learning_paths", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  productType: varchar("product_type"), // "RealEstate", "Insurance"
  state: varchar("state"), // Optional state restriction
  licenseType: varchar("license_type"), // Target license type
  estimatedHours: integer("estimated_hours"),
  isActive: integer("is_active").default(1),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = typeof learningPaths.$inferInsert;

// Learning Path Items - Courses in a learning path
export const learningPathItems = pgTable("learning_path_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  learningPathId: varchar("learning_path_id").notNull(),
  courseId: varchar("course_id").notNull(),
  sequence: integer("sequence").default(0),
  isRequired: integer("is_required").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export type LearningPathItem = typeof learningPathItems.$inferSelect;
export type InsertLearningPathItem = typeof learningPathItems.$inferInsert;

// User Learning Path Progress
export const userLearningPaths = pgTable("user_learning_paths", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  learningPathId: varchar("learning_path_id").notNull(),
  status: varchar("status").default("in_progress"), // "not_started", "in_progress", "completed"
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  progress: integer("progress").default(0), // 0-100 percentage
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UserLearningPath = typeof userLearningPaths.$inferSelect;
export type InsertUserLearningPath = typeof userLearningPaths.$inferInsert;

// Notifications - User notification system
export const notifications = pgTable("notifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(), // "enrollment", "deadline", "achievement", "system", "marketing"
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  actionUrl: varchar("action_url"), // Link for the notification
  isRead: integer("is_read").default(0),
  readAt: timestamp("read_at"),
  expiresAt: timestamp("expires_at"), // Auto-delete after this date
  metadata: text("metadata"), // JSON for additional data
  createdAt: timestamp("created_at").defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Achievements/Badges - Gamification
export const achievements = pgTable("achievements", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  iconUrl: varchar("icon_url"),
  badgeColor: varchar("badge_color").default("gold"),
  category: varchar("category"), // "completion", "streak", "performance", "engagement"
  criteria: text("criteria"), // JSON criteria for earning
  points: integer("points").default(0), // Points awarded
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

// User Achievements
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  achievementId: varchar("achievement_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
  notified: integer("notified").default(0),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;
