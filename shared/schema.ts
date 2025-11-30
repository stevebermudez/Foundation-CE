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
