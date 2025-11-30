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
  type: varchar("type").notNull(), // "prelicense" or "renewal"
  hoursRequired: integer("hours_required").notNull(),
  price: integer("price").notNull(), // in cents (5999 = $59.99)
  renewalPeriodYears: integer("renewal_period_years"), // null for prelicense, 4 for renewal
  targetLicense: varchar("target_license").notNull(), // "salesperson" or "broker"
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

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Enrollment = typeof enrollments.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type ComplianceRequirement = typeof complianceRequirements.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type UserOrganization = typeof userOrganizations.$inferSelect;
export type OrganizationCourse = typeof organizationCourses.$inferSelect;
