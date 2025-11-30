import { db } from "./db";
import { courses, courseBundles, bundleCourses } from "@shared/schema";

export async function seedFloridaCatalog() {
  try {
    console.log("Seeding complete Florida Real Estate CE catalog...");

    // 1. Post-Licensing Courses
    const saPostLicenseResult = await db
      .insert(courses)
      .values({
        title: "Florida Sales Associate Post Licensing Course",
        description: "Full 45 hour requirement for first renewal after initial licensure",
        productType: "RealEstate",
        state: "FL",
        licenseType: "Sales Associate",
        requirementCycleType: "Post-Licensing",
        requirementBucket: "Post-Licensing Mandatory",
        hoursRequired: 45,
        deliveryMethod: "Self-Paced Online",
        price: 1500,
        sku: "FL-RE-PL-SA-45",
        renewalApplicable: 0,
      })
      .returning();
    const saPostLicense = saPostLicenseResult[0];

    const brPostLicenseResult = await db
      .insert(courses)
      .values({
        title: "Florida Broker Post Licensing Course",
        description: "Full 60 hour requirement for first renewal after initial licensure",
        productType: "RealEstate",
        state: "FL",
        licenseType: "Broker",
        requirementCycleType: "Post-Licensing",
        requirementBucket: "Post-Licensing Mandatory",
        hoursRequired: 60,
        deliveryMethod: "Self-Paced Online",
        price: 1500,
        sku: "FL-RE-PL-BR-60",
        renewalApplicable: 0,
      })
      .returning();
    const brPostLicense = brPostLicenseResult[0];

    // 2. Core Law (3 hours)
    const coreLawResult = await db
      .insert(courses)
      .values({
        title: "Florida Core Law",
        description: "Mandatory legal update for renewal",
        productType: "RealEstate",
        state: "FL",
        licenseType: "Sales Associate & Broker",
        requirementCycleType: "Continuing Education (Renewal)",
        requirementBucket: "Core Law",
        hoursRequired: 3,
        deliveryMethod: "Self-Paced Online",
        price: 1500,
        sku: "FL-RE-CE-CORELAW-3",
        renewalApplicable: 1,
        renewalPeriodYears: 2,
      })
      .returning();
    const coreLaw = coreLawResult[0];

    // 3. Ethics and Business Practices (3 hours)
    const ethicsResult = await db
      .insert(courses)
      .values({
        title: "Ethics and Business Practices",
        description: "Mandatory ethics content for renewal",
        productType: "RealEstate",
        state: "FL",
        licenseType: "Sales Associate & Broker",
        requirementCycleType: "Continuing Education (Renewal)",
        requirementBucket: "Ethics & Business Practices",
        hoursRequired: 3,
        deliveryMethod: "Self-Paced Online",
        price: 1500,
        sku: "FL-RE-CE-ETHICS-3",
        renewalApplicable: 1,
        renewalPeriodYears: 2,
      })
      .returning();
    const ethics = ethicsResult[0];

    // 4. Electives (various hours, all $15)
    const electives = [
      { title: "Real Estate Marketing Essentials", hours: 3, sku: "FL-RE-CE-ELEC-MKT-3" },
      { title: "Florida Property Management Basics", hours: 3, sku: "FL-RE-CE-ELEC-PM-3" },
      { title: "Understanding Agency and Disclosure", hours: 3, sku: "FL-RE-CE-ELEC-AGENCY-3" },
      { title: "Fair Housing in Florida", hours: 3, sku: "FL-RE-CE-ELEC-FH-3" },
      { title: "Real Estate Investment Fundamentals", hours: 3, sku: "FL-RE-CE-ELEC-INV-3" },
      { title: "Florida Contracts and Forms Review", hours: 3, sku: "FL-RE-CE-ELEC-FORMS-3" },
      { title: "Florida Real Estate Finance", hours: 6, sku: "FL-RE-CE-ELEC-FIN-6" },
      { title: "Florida Legal Compliance Deep Dive", hours: 8, sku: "FL-RE-CE-ELEC-LEGAL-8" },
      { title: "Residential Construction and Inspection Basics for Agents", hours: 4, sku: "FL-RE-CE-ELEC-CONST-4" },
      { title: "Negotiation Strategies for Real Estate", hours: 6, sku: "FL-RE-CE-ELEC-NEG-6" },
    ];

    const electiveCourses = [];
    for (const elective of electives) {
      const result = await db
        .insert(courses)
        .values({
          title: elective.title,
          productType: "RealEstate",
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
      electiveCourses.push(result[0]);
    }

    // 5. Create Bundles
    const saPostLicenseBundleResult = await db
      .insert(courseBundles)
      .values({
        name: "Florida Sales Associate Post Licensing Package",
        description: "Full 45 hour requirement for first renewal after initial licensure",
        productType: "RealEstate",
        state: "FL",
        licenseType: "Sales Associate",
        totalHours: 45,
        bundlePrice: 5999,
        individualCoursePrice: 1500,
        isActive: 1,
      })
      .returning();
    const saPostLicenseBundle = saPostLicenseBundleResult[0];

    await db.insert(bundleCourses).values({
      bundleId: saPostLicenseBundle.id,
      courseId: saPostLicense.id,
      sequence: 0,
    });

    const brPostLicenseBundleResult = await db
      .insert(courseBundles)
      .values({
        name: "Florida Broker Post Licensing Package",
        description: "Full 60 hour requirement for first renewal after initial licensure",
        productType: "RealEstate",
        state: "FL",
        licenseType: "Broker",
        totalHours: 60,
        bundlePrice: 6999,
        individualCoursePrice: 1500,
        isActive: 1,
      })
      .returning();
    const brPostLicenseBundle = brPostLicenseBundleResult[0];

    await db.insert(bundleCourses).values({
      bundleId: brPostLicenseBundle.id,
      courseId: brPostLicense.id,
      sequence: 0,
    });

    const ceRenewalBundleResult = await db
      .insert(courseBundles)
      .values({
        name: "Florida Continuing Education Renewal Package",
        description: "14 hour biennial CE requirement for Florida real estate professionals",
        productType: "RealEstate",
        state: "FL",
        licenseType: "Sales Associate & Broker",
        totalHours: 14,
        bundlePrice: 3999,
        individualCoursePrice: 1500,
        isActive: 1,
      })
      .returning();
    const ceRenewalBundle = ceRenewalBundleResult[0];

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
    await db.insert(bundleCourses).values({
      bundleId: ceRenewalBundle.id,
      courseId: electiveCourses[7].id,
      sequence: 2,
    });

    console.log("✓ Complete Florida Real Estate CE catalog seeded!");
  } catch (error) {
    console.error("Error seeding Florida catalog:", error);
    throw error;
  }
}
