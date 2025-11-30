import { db } from "./db";
import { courses, courseBundles, bundleCourses } from "@shared/schema";

export async function seedCaliforniaCatalog() {
  try {
    console.log("Seeding complete California CE catalog...");

    // 1. Mandatory Courses (7 courses totaling 18 hours)
    const mandatoryCourseSpecs = [
      { title: "Ethics", hours: 3, sku: "CA-CE-ETHICS-3" },
      { title: "Agency", hours: 3, sku: "CA-CE-AGENCY-3" },
      { title: "Trust Funds", hours: 3, sku: "CA-CE-TRUSTFUNDS-3" },
      { title: "Fair Housing", hours: 3, sku: "CA-CE-FAIRHOUSING-3" },
      { title: "Risk Management", hours: 3, sku: "CA-CE-RISKMGMT-3" },
      { title: "Implicit Bias Training", hours: 2, sku: "CA-CE-IMPLICITBIAS-2" },
      { title: "Management and Supervision", hours: 3, sku: "CA-CE-MGMT-3" },
    ];

    const mandatoryCourses = [];
    for (const spec of mandatoryCourseSpecs) {
      const result = await db
        .insert(courses)
        .values({
          title: spec.title,
          description: "Required continuing education course for California real estate professionals",
          state: "CA",
          licenseType: "Salesperson & Broker",
          requirementCycleType: "Continuing Education (Renewal)",
          requirementBucket: "Core Law",
          hoursRequired: spec.hours,
          deliveryMethod: "Self-Paced Online",
          price: 1500,
          sku: spec.sku,
          renewalApplicable: 1,
          renewalPeriodYears: 4,
        })
        .returning();
      mandatoryCourses.push(result[0]);
    }

    // 2. Elective Courses (7 courses)
    const electiveSpecs = [
      { title: "Real Estate Finance", hours: 8, sku: "CA-CE-FINANCE-8" },
      { title: "Contracts and Disclosures", hours: 6, sku: "CA-CE-CONTRACTS-6" },
      { title: "Property Management", hours: 6, sku: "CA-CE-PROP-MGMT-6" },
      { title: "Residential Inspection Basics", hours: 4, sku: "CA-CE-INSPECTION-4" },
      { title: "Environmental and Hazards", hours: 6, sku: "CA-CE-ENVIRON-6" },
      { title: "Real Estate Investments", hours: 6, sku: "CA-CE-INVEST-6" },
      { title: "Advertising Compliance", hours: 4, sku: "CA-CE-ADV-4" },
    ];

    const electiveCourses = [];
    for (const spec of electiveSpecs) {
      const result = await db
        .insert(courses)
        .values({
          title: spec.title,
          description: "Elective continuing education course for California real estate professionals",
          state: "CA",
          licenseType: "Salesperson & Broker",
          requirementCycleType: "Continuing Education (Renewal)",
          requirementBucket: "Specialty / Elective",
          hoursRequired: spec.hours,
          deliveryMethod: "Self-Paced Online",
          price: 1500,
          sku: spec.sku,
          renewalApplicable: 1,
          renewalPeriodYears: 4,
        })
        .returning();
      electiveCourses.push(result[0]);
    }

    // 3. Create Renewal Bundle (45 hours)
    const bundleResult = await db
      .insert(courseBundles)
      .values({
        name: "California Real Estate Renewal Package",
        description: "Complete 45-hour renewal package meeting all California DRE requirements",
        state: "CA",
        licenseType: "Salesperson & Broker",
        totalHours: 45,
        bundlePrice: 3999,
        individualCoursePrice: 1500,
        isActive: 1,
      })
      .returning();
    const bundle = bundleResult[0];

    // Add mandatory courses to bundle (18 hours)
    let sequence = 0;
    for (const course of mandatoryCourses) {
      await db.insert(bundleCourses).values({
        bundleId: bundle.id,
        courseId: course.id,
        sequence: sequence++,
      });
    }

    // Add electives to bundle (need 27 hours worth)
    // Adding all 7 electives (total 40 hours, but platform allows à la carte selection)
    for (const course of electiveCourses) {
      await db.insert(bundleCourses).values({
        bundleId: bundle.id,
        courseId: course.id,
        sequence: sequence++,
      });
    }

    console.log("✓ Complete California CE catalog seeded successfully!");
    console.log("\nCatalog Summary:");
    console.log("- 1 CE Renewal Bundle (45h for $39.99)");
    console.log("- 7 Mandatory Courses (18h total)");
    console.log("- 7 Elective Courses (27h+ available)");
    console.log("- All courses priced at $15 individually");
    console.log("- Renewal period: 4 years");
  } catch (error) {
    console.error("Error seeding California catalog:", error);
    throw error;
  }
}

// Auto-run
seedCaliforniaCatalog()
  .then(() => {
    console.log("California catalog seeded successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to seed California catalog:", err);
    process.exit(1);
  });
