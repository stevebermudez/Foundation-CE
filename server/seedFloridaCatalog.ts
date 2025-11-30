import { db } from "./db";
import { courses, courseBundles, bundleCourses } from "@shared/schema";

export async function seedFloridaCatalog() {
  try {
    console.log("Seeding complete Florida CE catalog...");

    // 1. Post-Licensing Courses
    const [saPostLicense] = await db
      .insert(courses)
      .values({
        title: "Florida Sales Associate Post Licensing Course",
        description: "Full 45 hour requirement for first renewal after initial licensure",
        state: "FL",
        licenseType: "Sales Associate",
        requirementCycleType: "Post-Licensing",
        requirementBucket: "Post-Licensing Mandatory",
        hoursRequired: 45,
        deliveryMethod: "Self-Paced Online",
        price: 1500,
        sku: "FL-PL-SA-45",
        renewalApplicable: 0,
      })
      .returning();

    const [brPostLicense] = await db
      .insert(courses)
      .values({
        title: "Florida Broker Post Licensing Course",
        description: "Full 60 hour requirement for first renewal after initial licensure",
        state: "FL",
        licenseType: "Broker",
        requirementCycleType: "Post-Licensing",
        requirementBucket: "Post-Licensing Mandatory",
        hoursRequired: 60,
        deliveryMethod: "Self-Paced Online",
        price: 1500,
        sku: "FL-PL-BR-60",
        renewalApplicable: 0,
      })
      .returning();

    // 2. Core Law (3 hours)
    const [coreLaw] = await db
      .insert(courses)
      .values({
        title: "Florida Core Law",
        description: "Mandatory legal update for renewal",
        state: "FL",
        licenseType: "Sales Associate & Broker",
        requirementCycleType: "Continuing Education (Renewal)",
        requirementBucket: "Core Law",
        hoursRequired: 3,
        deliveryMethod: "Self-Paced Online",
        price: 1500,
        sku: "FL-CE-CORELAW-3",
        renewalApplicable: 1,
        renewalPeriodYears: 2,
      })
      .returning();

    // 3. Ethics and Business Practices (3 hours)
    const [ethics] = await db
      .insert(courses)
      .values({
        title: "Ethics and Business Practices",
        description: "Mandatory ethics content for renewal",
        state: "FL",
        licenseType: "Sales Associate & Broker",
        requirementCycleType: "Continuing Education (Renewal)",
        requirementBucket: "Ethics & Business Practices",
        hoursRequired: 3,
        deliveryMethod: "Self-Paced Online",
        price: 1500,
        sku: "FL-CE-ETHICS-3",
        renewalApplicable: 1,
        renewalPeriodYears: 2,
      })
      .returning();

    // 4. Electives (various hours, all $15)
    const electives = [
      { title: "Real Estate Marketing Essentials", hours: 3, sku: "FL-CE-ELEC-MKT-3" },
      { title: "Florida Property Management Basics", hours: 3, sku: "FL-CE-ELEC-PM-3" },
      { title: "Understanding Agency and Disclosure", hours: 3, sku: "FL-CE-ELEC-AGENCY-3" },
      { title: "Fair Housing in Florida", hours: 3, sku: "FL-CE-ELEC-FH-3" },
      { title: "Real Estate Investment Fundamentals", hours: 3, sku: "FL-CE-ELEC-INV-3" },
      { title: "Florida Contracts and Forms Review", hours: 3, sku: "FL-CE-ELEC-FORMS-3" },
      { title: "Florida Real Estate Finance", hours: 6, sku: "FL-CE-ELEC-FIN-6" },
      { title: "Florida Legal Compliance Deep Dive", hours: 8, sku: "FL-CE-ELEC-LEGAL-8" },
      { title: "Residential Construction and Inspection Basics for Agents", hours: 4, sku: "FL-CE-ELEC-CONST-4" },
      { title: "Negotiation Strategies for Real Estate", hours: 6, sku: "FL-CE-ELEC-NEG-6" },
    ];

    const electiveCourses = [];
    for (const elective of electives) {
      const [created] = await db
        .insert(courses)
        .values({
          title: elective.title,
          state: "FL",
          licenseType: "Sales Associate & Broker",
          requirementCycleType: "Continuing Education (Renewal)",
          requirementBucket: "Specialty / Elective",
          hoursRequired: elective.hours,
          deliveryMethod: "Self-Paced Online",
          price: 1500,
          sku: elective.sku,
          renewalApplicable: 1,
          renewalPeriodYears: 2,
        })
        .returning();
      electiveCourses.push(created);
    }

    // 5. Create Bundles
    const [saPostLicenseBundle] = await db
      .insert(courseBundles)
      .values({
        name: "Florida Sales Associate Post Licensing Package",
        description: "Full 45 hour requirement for first renewal after initial licensure",
        state: "FL",
        licenseType: "Sales Associate",
        totalHours: 45,
        bundlePrice: 5999,
        individualCoursePrice: 1500,
        isActive: 1,
      })
      .returning();

    await db.insert(bundleCourses).values({
      bundleId: saPostLicenseBundle.id,
      courseId: saPostLicense.id,
      sequence: 0,
    });

    const [brPostLicenseBundle] = await db
      .insert(courseBundles)
      .values({
        name: "Florida Broker Post Licensing Package",
        description: "Full 60 hour requirement for first renewal after initial licensure",
        state: "FL",
        licenseType: "Broker",
        totalHours: 60,
        bundlePrice: 6999,
        individualCoursePrice: 1500,
        isActive: 1,
      })
      .returning();

    await db.insert(bundleCourses).values({
      bundleId: brPostLicenseBundle.id,
      courseId: brPostLicense.id,
      sequence: 0,
    });

    const [ceRenewalBundle] = await db
      .insert(courseBundles)
      .values({
        name: "Florida Continuing Education Renewal Package",
        description: "14 hour biennial CE requirement for Florida real estate professionals",
        state: "FL",
        licenseType: "Sales Associate & Broker",
        totalHours: 14,
        bundlePrice: 3999,
        individualCoursePrice: 1500,
        isActive: 1,
      })
      .returning();

    // Add CE courses to renewal bundle (3 core law + 3 ethics + 8 electives)
    await db.insert(bundleCourses).values({
      bundleId: ceRenewalBundle.id,
      courseId: coreLaw.id,
      sequence: 0,
    });
    await db.insert(bundleCourses).values({
      bundleId: ceRenewalBundle.id,
      courseId: ethics.id,
      sequence: 1,
    });
    // Add one 8-hour elective to complete 14 hours
    await db.insert(bundleCourses).values({
      bundleId: ceRenewalBundle.id,
      courseId: electiveCourses[7].id, // 8-hour legal compliance course
      sequence: 2,
    });

    console.log("✓ Complete Florida CE catalog seeded successfully!");
    console.log("\nCatalog Summary:");
    console.log("- 2 Post-Licensing Bundles (45h and 60h)");
    console.log("- 1 CE Renewal Bundle (14h)");
    console.log("- 13 Individual Courses (à la carte)");
    console.log("- All courses priced at $15 individually");
  } catch (error) {
    console.error("Error seeding Florida catalog:", error);
    throw error;
  }
}

// Auto-run
seedFloridaCatalog()
  .then(() => {
    console.log("Florida catalog seeded successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to seed Florida catalog:", err);
    process.exit(1);
  });
