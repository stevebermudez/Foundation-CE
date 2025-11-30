import { db } from "./db";
import { courses, courseBundles, bundleCourses } from "@shared/schema";

const CA_COURSES = [
  {
    title: "California Real Estate Law & Regulations",
    description: "Comprehensive overview of California real estate laws, regulations, and compliance requirements",
    hours: 10,
  },
  {
    title: "Fair Housing & Discrimination Laws",
    description: "Federal and California fair housing laws, prohibited discrimination practices, and compliance",
    hours: 3,
  },
  {
    title: "Real Estate Contracts & Transactions",
    description: "Contract formation, negotiation, terms, conditions, and transaction management",
    hours: 8,
  },
  {
    title: "Trust Accounts & Financial Management",
    description: "Trust account requirements, record keeping, and financial accountability",
    hours: 6,
  },
  {
    title: "Broker Responsibilities & Ethics",
    description: "Broker duties, ethical practices, customer service, and professional conduct",
    hours: 9,
  },
  {
    title: "Property Management & Landlord-Tenant Law",
    description: "Property management basics, landlord-tenant relationships, and dispute resolution",
    hours: 5,
  },
  {
    title: "Marketing & Advertising Compliance",
    description: "Fair advertising practices, disclosure requirements, and marketing compliance",
    hours: 4,
  },
];

export async function seedCourses() {
  try {
    console.log("Seeding California CE courses...");

    // Create individual courses
    const createdCourses = [];
    for (const course of CA_COURSES) {
      const [created] = await db
        .insert(courses)
        .values({
          title: course.title,
          description: course.description,
          type: "renewal",
          hoursRequired: course.hours,
          price: 1500, // $15.00 per course in cents
          renewalPeriodYears: 4,
          targetLicense: "salesperson",
        })
        .returning();
      createdCourses.push(created);
      console.log(`✓ Created course: ${course.title}`);
    }

    // Create broker version of courses
    const brokerCourses = [];
    for (const course of CA_COURSES) {
      const [created] = await db
        .insert(courses)
        .values({
          title: course.title,
          description: course.description,
          type: "renewal",
          hoursRequired: course.hours,
          price: 1500,
          renewalPeriodYears: 4,
          targetLicense: "broker",
        })
        .returning();
      brokerCourses.push(created);
    }

    // Create bundle for salespersons
    const [salespersonBundle] = await db
      .insert(courseBundles)
      .values({
        name: "California 45-Hour RE Renewal - Salesperson",
        description: "Complete 45-hour continuing education bundle for California real estate salesperson renewal",
        state: "CA",
        licenseType: "salesperson",
        totalHours: 45,
        bundlePrice: 4500, // $45.00 in cents
        individualCoursePrice: 1500, // $15.00 per course
        isActive: 1,
      })
      .returning();

    console.log(`✓ Created salesperson bundle: ${salespersonBundle.name}`);

    // Map courses to salesperson bundle
    for (let i = 0; i < createdCourses.length; i++) {
      await db.insert(bundleCourses).values({
        bundleId: salespersonBundle.id,
        courseId: createdCourses[i].id,
        sequence: i,
      });
    }

    // Create bundle for brokers
    const [brokerBundle] = await db
      .insert(courseBundles)
      .values({
        name: "California 45-Hour RE Renewal - Broker",
        description: "Complete 45-hour continuing education bundle for California real estate broker renewal",
        state: "CA",
        licenseType: "broker",
        totalHours: 45,
        bundlePrice: 4500,
        individualCoursePrice: 1500,
        isActive: 1,
      })
      .returning();

    console.log(`✓ Created broker bundle: ${brokerBundle.name}`);

    // Map courses to broker bundle
    for (let i = 0; i < brokerCourses.length; i++) {
      await db.insert(bundleCourses).values({
        bundleId: brokerBundle.id,
        courseId: brokerCourses[i].id,
        sequence: i,
      });
    }

    console.log("✓ All courses and bundles created successfully!");
    console.log(`\nSummary:`);
    console.log(`- Created ${CA_COURSES.length} courses for salespersons`);
    console.log(`- Created ${CA_COURSES.length} courses for brokers`);
    console.log(`- Created 2 bundles (45 hours each)`);
    console.log(`- Bundle price: $45.00 | Individual course price: $15.00`);
  } catch (error) {
    console.error("Error seeding courses:", error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedCourses()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
