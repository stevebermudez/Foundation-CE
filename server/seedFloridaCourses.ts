import { db } from "./db";
import { courses, courseBundles, bundleCourses } from "@shared/schema";

const FLORIDA_POSTLICENSE_45 = [
  { title: "Florida Real Estate Law & Regulations", hours: 8 },
  { title: "Real Estate Contracts & Closings", hours: 8 },
  { title: "Fair Housing & Civil Rights", hours: 3 },
  { title: "Property Management Basics", hours: 6 },
  { title: "Trust Account Management", hours: 5 },
  { title: "Sales Techniques & Ethics", hours: 8 },
  { title: "Technology in Real Estate", hours: 4 },
  { title: "Risk Management", hours: 5 },
];

const FLORIDA_POSTLICENSE_60 = [
  { title: "Florida Real Estate Law & Regulations", hours: 10 },
  { title: "Real Estate Contracts & Closings", hours: 10 },
  { title: "Fair Housing & Civil Rights", hours: 4 },
  { title: "Property Management Basics", hours: 8 },
  { title: "Trust Account Management", hours: 6 },
  { title: "Sales Techniques & Ethics", hours: 10 },
  { title: "Technology in Real Estate", hours: 5 },
  { title: "Risk Management", hours: 7 },
];

const FLORIDA_RENEWAL_14 = [
  { title: "Core Law Update", hours: 3 },
  { title: "Ethics & Business Practices", hours: 3 },
  { title: "Florida Real Estate Market Trends", hours: 4 },
  { title: "Digital Marketing Compliance", hours: 2 },
  { title: "Contract Updates & Changes", hours: 2 },
];

export async function seedFloridaCourses() {
  try {
    console.log("Seeding Florida CE courses...");

    // Create 45-hour post-license courses (sales associates)
    const courses45 = [];
    for (const course of FLORIDA_POSTLICENSE_45) {
      const [created] = await db
        .insert(courses)
        .values({
          title: course.title,
          type: "prelicense",
          hoursRequired: course.hours,
          price: 1500,
          targetLicense: "salesperson",
        })
        .returning();
      courses45.push(created);
    }

    // Create 60-hour post-license courses (brokers)
    const courses60 = [];
    for (const course of FLORIDA_POSTLICENSE_60) {
      const [created] = await db
        .insert(courses)
        .values({
          title: course.title,
          type: "prelicense",
          hoursRequired: course.hours,
          price: 1500,
          targetLicense: "broker",
        })
        .returning();
      courses60.push(created);
    }

    // Create 14-hour renewal courses (both license types)
    const courses14 = [];
    for (const course of FLORIDA_RENEWAL_14) {
      const [created] = await db
        .insert(courses)
        .values({
          title: course.title,
          type: "renewal",
          hoursRequired: course.hours,
          price: 1500,
          renewalPeriodYears: 2,
          targetLicense: "salesperson",
        })
        .returning();
      courses14.push(created);
    }

    // Create 14-hour renewal courses for brokers
    const courses14Broker = [];
    for (const course of FLORIDA_RENEWAL_14) {
      const [created] = await db
        .insert(courses)
        .values({
          title: course.title,
          type: "renewal",
          hoursRequired: course.hours,
          price: 1500,
          renewalPeriodYears: 2,
          targetLicense: "broker",
        })
        .returning();
      courses14Broker.push(created);
    }

    // Create 45-hour post-license bundle for sales associates
    const [bundle45] = await db
      .insert(courseBundles)
      .values({
        name: "Florida 45-Hour Post-Licensing - Sales Associate",
        description: "Complete 45-hour post-licensing education for Florida real estate sales associates",
        state: "FL",
        licenseType: "salesperson",
        totalHours: 45,
        bundlePrice: 5999,
        individualCoursePrice: 1500,
        isActive: 1,
      })
      .returning();

    for (let i = 0; i < courses45.length; i++) {
      await db.insert(bundleCourses).values({
        bundleId: bundle45.id,
        courseId: courses45[i].id,
        sequence: i,
      });
    }
    console.log("✓ Created 45-hour sales associate bundle");

    // Create 60-hour post-license bundle for brokers
    const [bundle60] = await db
      .insert(courseBundles)
      .values({
        name: "Florida 60-Hour Post-Licensing - Broker",
        description: "Complete 60-hour post-licensing education for Florida real estate brokers",
        state: "FL",
        licenseType: "broker",
        totalHours: 60,
        bundlePrice: 6999,
        individualCoursePrice: 1500,
        isActive: 1,
      })
      .returning();

    for (let i = 0; i < courses60.length; i++) {
      await db.insert(bundleCourses).values({
        bundleId: bundle60.id,
        courseId: courses60[i].id,
        sequence: i,
      });
    }
    console.log("✓ Created 60-hour broker bundle");

    // Create 14-hour renewal bundle for sales associates
    const [bundleRenewal45] = await db
      .insert(courseBundles)
      .values({
        name: "Florida 14-Hour Renewal - Sales Associate",
        description: "14-hour continuing education renewal for Florida real estate sales associates (biennial)",
        state: "FL",
        licenseType: "salesperson",
        totalHours: 14,
        bundlePrice: 3999,
        individualCoursePrice: 1500,
        isActive: 1,
      })
      .returning();

    for (let i = 0; i < courses14.length; i++) {
      await db.insert(bundleCourses).values({
        bundleId: bundleRenewal45.id,
        courseId: courses14[i].id,
        sequence: i,
      });
    }
    console.log("✓ Created 14-hour renewal bundle for sales associates");

    // Create 14-hour renewal bundle for brokers
    const [bundleRenewal60] = await db
      .insert(courseBundles)
      .values({
        name: "Florida 14-Hour Renewal - Broker",
        description: "14-hour continuing education renewal for Florida real estate brokers (biennial)",
        state: "FL",
        licenseType: "broker",
        totalHours: 14,
        bundlePrice: 3999,
        individualCoursePrice: 1500,
        isActive: 1,
      })
      .returning();

    for (let i = 0; i < courses14Broker.length; i++) {
      await db.insert(bundleCourses).values({
        bundleId: bundleRenewal60.id,
        courseId: courses14Broker[i].id,
        sequence: i,
      });
    }
    console.log("✓ Created 14-hour renewal bundle for brokers");

    console.log("\n✓ All Florida courses and bundles created successfully!");
  } catch (error) {
    console.error("Error seeding Florida courses:", error);
    throw error;
  }
}

// Auto-run seed on import
seedFloridaCourses()
  .then(() => {
    console.log("Florida courses seeded successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to seed Florida courses:", err);
    process.exit(1);
  });
