CREATE TABLE "bundle_courses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bundle_id" varchar NOT NULL,
	"course_id" varchar NOT NULL,
	"sequence" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bundle_enrollments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"bundle_id" varchar NOT NULL,
	"enrolled_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"hours_completed" integer DEFAULT 0,
	"is_complete" integer DEFAULT 0,
	"certificate_url" varchar
);
--> statement-breakpoint
CREATE TABLE "company_accounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"license_number" varchar,
	"license_type" varchar NOT NULL,
	"state" varchar NOT NULL,
	"admin_email" varchar,
	"contact_name" varchar,
	"contact_phone" varchar,
	"employees" integer DEFAULT 0,
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "company_accounts_license_number_unique" UNIQUE("license_number")
);
--> statement-breakpoint
CREATE TABLE "company_compliance" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"license_type" varchar NOT NULL,
	"required_hours" integer DEFAULT 45,
	"hours_completed" integer DEFAULT 0,
	"renewal_due_date" timestamp NOT NULL,
	"expiration_date" timestamp NOT NULL,
	"is_compliant" integer DEFAULT 0,
	"completed_date" timestamp,
	"renewal_cycle" integer DEFAULT 4,
	"notes" text,
	"last_audit_date" timestamp,
	"certificate_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "compliance_requirements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"license_type" varchar NOT NULL,
	"state" varchar NOT NULL,
	"hours_required" integer DEFAULT 45 NOT NULL,
	"hours_completed" integer DEFAULT 0,
	"renewal_due_date" timestamp NOT NULL,
	"compliant" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_bundles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"state" varchar NOT NULL,
	"license_type" varchar NOT NULL,
	"total_hours" integer NOT NULL,
	"bundle_price" integer NOT NULL,
	"individual_course_price" integer NOT NULL,
	"is_active" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"state" varchar NOT NULL,
	"license_type" varchar NOT NULL,
	"requirement_cycle_type" varchar NOT NULL,
	"requirement_bucket" varchar NOT NULL,
	"hours_required" integer NOT NULL,
	"delivery_method" varchar DEFAULT 'Self-Paced Online',
	"difficulty_level" varchar,
	"price" integer NOT NULL,
	"sku" varchar,
	"renewal_applicable" integer DEFAULT 1,
	"renewal_period_years" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "courses_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"course_id" varchar NOT NULL,
	"enrolled_at" timestamp DEFAULT now(),
	"progress" integer DEFAULT 0,
	"hours_completed" integer DEFAULT 0,
	"completed" integer DEFAULT 0,
	"completed_at" timestamp,
	"certificate_url" varchar
);
--> statement-breakpoint
CREATE TABLE "organization_courses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar NOT NULL,
	"course_id" varchar NOT NULL,
	"custom_title" varchar,
	"custom_price" integer,
	"is_active" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"logo_url" varchar,
	"primary_color" varchar DEFAULT '3b82f6',
	"secondary_color" varchar DEFAULT '1f2937',
	"accent_color" varchar DEFAULT '8b5cf6',
	"domain" varchar,
	"custom_css" text,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug"),
	CONSTRAINT "organizations_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" text NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_organizations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"organization_id" varchar NOT NULL,
	"role" varchar DEFAULT 'member',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"stripe_customer_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
