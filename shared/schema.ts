import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Courses table
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  createdAt: timestamp("created_at").defaultNow(),
});

// Course enrollment table
export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  organizationId: varchar("organization_id").notNull(),
  role: varchar("role").default("member"), // "admin" or "member"
  createdAt: timestamp("created_at").defaultNow(),
});

// White label course catalog (org-specific courses)
export const organizationCourses = pgTable("organization_courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  courseId: varchar("course_id").notNull(),
  customTitle: varchar("custom_title"), // override course title
  customPrice: integer("custom_price"), // override price (in cents)
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Company accounts for compliance tracking
export const companyAccounts = pgTable("company_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  licenseNumber: varchar("license_number").unique(),
  licenseType: varchar("license_type").notNull(), // "broker" or "salesperson"
  state: varchar("state").notNull(),
  adminEmail: varchar("admin_email"),
  contactName: varchar("contact_name"),
  contactPhone: varchar("contact_phone"),
  employees: integer("employees").default(0),
  status: varchar("status").default("active"), // "active", "inactive", "expired"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Company-level compliance tracking
export const companyCompliance = pgTable("company_compliance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  licenseType: varchar("license_type").notNull(), // "broker" or "salesperson"
  requiredHours: integer("required_hours").default(45),
  hoursCompleted: integer("hours_completed").default(0),
  renewalDueDate: timestamp("renewal_due_date").notNull(),
  expirationDate: timestamp("expiration_date").notNull(),
  isCompliant: integer("is_compliant").default(0),
  completedDate: timestamp("completed_date"),
  renewalCycle: integer("renewal_cycle").default(4), // years between renewals
  notes: text("notes"),
  lastAuditDate: timestamp("last_audit_date"),
  certificateUrl: varchar("certificate_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course bundles (e.g., 45-hour packages)
export const courseBundles = pgTable("course_bundles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bundleId: varchar("bundle_id").notNull(),
  courseId: varchar("course_id").notNull(),
  sequence: integer("sequence").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Track bundle purchases and enrollments
export const bundleEnrollments = pgTable("bundle_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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

// User license tracking
export const userLicenses = pgTable("user_licenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  attemptId: varchar("attempt_id").notNull(),
  questionId: varchar("question_id").notNull(),
  userAnswer: varchar("user_answer").notNull(),
  isCorrect: integer("is_correct"), // 1 for correct, 0 for incorrect
  answeredAt: timestamp("answered_at").defaultNow(),
});

// User subscriptions (monthly/annual billing)
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Enrollment = typeof enrollments.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type ComplianceRequirement = typeof complianceRequirements.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type UserOrganization = typeof userOrganizations.$inferSelect;
export type OrganizationCourse = typeof organizationCourses.$inferSelect;
export type CompanyAccount = typeof companyAccounts.$inferSelect;
export type CompanyCompliance = typeof companyCompliance.$inferSelect;
export type CourseBundle = typeof courseBundles.$inferSelect;
export type BundleEnrollment = typeof bundleEnrollments.$inferSelect;
export type SirconReport = typeof sirconReports.$inferSelect;
export type UserLicense = typeof userLicenses.$inferSelect;
export type CEReview = typeof ceReviews.$inferSelect;
export type Supervisor = typeof supervisors.$inferSelect;
export type PracticeExam = typeof practiceExams.$inferSelect;
export type ExamQuestion = typeof examQuestions.$inferSelect;
export type ExamAttempt = typeof examAttempts.$inferSelect;
export type ExamAnswer = typeof examAnswers.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
