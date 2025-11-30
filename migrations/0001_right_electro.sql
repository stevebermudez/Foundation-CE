ALTER TABLE "courses" DROP CONSTRAINT "courses_sku_unique";--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "sku" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "course_bundles" ADD COLUMN "product_type" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "product_type" varchar NOT NULL;