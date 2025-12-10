/**
 * Production Seed Script for Foundation CE Courses
 * 
 * This script seeds the following courses to production:
 * - FREC I: 63-Hour Florida Sales Associate Pre-Licensing
 * - FREC II: 72-Hour Florida Broker Pre-Licensing
 * - 3-Hour Florida Core Law Update (CE)
 * - 3-Hour Ethics and Business Practices (CE)
 * - 8-Hour Florida Transaction Mastery (CE)
 * - 14-Hour CE Bundle
 * 
 * This script is IDEMPOTENT - safe to run multiple times.
 * It uses fixed UUIDs from development and upserts data.
 * 
 * Usage: npx tsx server/seedProductionCourses.ts
 */

import { db } from './db';
import { 
  courses, 
  courseBundles, 
  bundleCourses,
  units, 
  lessons
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// ============================================
// FIXED UUIDs FROM DEVELOPMENT DATABASE
// ============================================

const COURSE_IDS = {
  FREC_I: '4793335c-ce58-4cab-af5c-a9160d593ced',
  FREC_II: '04ed7248-fd4e-44e1-8b55-3ba7d204040b',
  CORE_LAW_3HR: 'bbb3196b-7aca-40d0-84e5-6a4f42871a2f',
  ETHICS_3HR: 'fe41fdc7-eb98-449e-ab90-8d7d8637737f',
  TRANSACTION_8HR: '590f235f-50f7-4020-a10a-af675950acd8'
};

const BUNDLE_IDS = {
  CE_14HR: '24da327b-4fda-4464-884c-ecf47bb92d95'
};

// ============================================
// COURSE DATA
// ============================================

const courseData = [
  {
    id: COURSE_IDS.FREC_I,
    title: 'Florida Sales Associate Prelicensing (FREC I)',
    description: 'Complete 63-hour pre-licensing course for Florida real estate sales associates. Includes 60 hours of instruction across 19 units covering real estate law, practices, contracts, mortgages, and state regulations. Final 3-hour cumulative exam. Prepares for Florida real estate license exam.',
    productType: 'RealEstate',
    state: 'FL',
    licenseType: 'Sales Associate',
    requirementCycleType: 'Pre-Licensing',
    requirementBucket: 'Pre-Licensing Mandatory',
    hoursRequired: 63,
    deliveryMethod: 'Self-Paced Online',
    difficultyLevel: 'Beginner',
    price: 5999,
    sku: 'FL-RE-PL-SA-FRECI-63',
    renewalApplicable: 0,
    expirationMonths: 6
  },
  {
    id: COURSE_IDS.FREC_II,
    title: 'Florida Real Estate Broker Pre-Licensing (FREC II)',
    description: 'Complete 72-hour pre-licensing course for Florida real estate brokers. Covers advanced topics including brokerage operations, real estate investments, business planning, and Florida real estate law. Required for broker license examination.',
    productType: 'RealEstate',
    state: 'FL',
    licenseType: 'Broker',
    requirementCycleType: 'Pre-Licensing',
    requirementBucket: 'Pre-Licensing Mandatory',
    hoursRequired: 72,
    deliveryMethod: 'Self-Paced Online',
    difficultyLevel: 'Advanced',
    price: 17999,
    sku: 'FL-RE-PL-BROKER-72',
    renewalApplicable: 0,
    expirationMonths: 6
  },
  {
    id: COURSE_IDS.CORE_LAW_3HR,
    title: '3-Hour Florida Core Law Update',
    description: 'Stay current with the latest changes to Florida real estate law, agency relationships, and escrow management. This mandatory course covers recent legislative updates, disciplinary trends, and compliance requirements for all Florida real estate licensees.',
    productType: 'RealEstate',
    state: 'FL',
    licenseType: 'Sales Associate & Broker',
    requirementCycleType: 'Continuing Education (Renewal)',
    requirementBucket: 'Core Law',
    hoursRequired: 3,
    deliveryMethod: 'Self-Paced Online',
    difficultyLevel: 'Intermediate',
    price: 2999,
    sku: 'FL-CE-CORE-LAW-3HR',
    renewalApplicable: 1,
    renewalPeriodYears: 2,
    providerNumber: 'FL-DBPR-0001',
    courseOfferingNumber: 'CE-CORE-2025-001',
    instructorName: 'FoundationCE Faculty',
    expirationMonths: 12
  },
  {
    id: COURSE_IDS.ETHICS_3HR,
    title: '3-Hour Ethics and Business Practices',
    description: 'Develop ethical decision-making skills and master professional standards for Florida real estate practice. Topics include the distinction between legal compliance and ethical conduct, advertising standards, fair housing considerations, and commission dispute resolution.',
    productType: 'RealEstate',
    state: 'FL',
    licenseType: 'Sales Associate & Broker',
    requirementCycleType: 'Continuing Education (Renewal)',
    requirementBucket: 'Ethics & Business Practices',
    hoursRequired: 3,
    deliveryMethod: 'Self-Paced Online',
    difficultyLevel: 'Intermediate',
    price: 2999,
    sku: 'FL-CE-ETHICS-3HR',
    renewalApplicable: 1,
    renewalPeriodYears: 2,
    providerNumber: 'FL-DBPR-0001',
    courseOfferingNumber: 'CE-ETHICS-2025-001',
    instructorName: 'FoundationCE Faculty',
    expirationMonths: 12
  },
  {
    id: COURSE_IDS.TRANSACTION_8HR,
    title: '8-Hour Florida Transaction Mastery: Contracts & Risk Management',
    description: 'Master the FAR/BAR residential contract, understand contingency management, navigate financing and appraisal issues, and develop expertise in closing transactions. This comprehensive specialty course covers the complete transaction lifecycle from contract to close.',
    productType: 'RealEstate',
    state: 'FL',
    licenseType: 'Sales Associate & Broker',
    requirementCycleType: 'Continuing Education (Renewal)',
    requirementBucket: 'Specialty / Elective',
    hoursRequired: 8,
    deliveryMethod: 'Self-Paced Online',
    difficultyLevel: 'Intermediate',
    price: 4999,
    sku: 'FL-CE-SPECIALTY-8HR',
    renewalApplicable: 1,
    renewalPeriodYears: 2,
    providerNumber: 'FL-DBPR-0001',
    courseOfferingNumber: 'CE-SPEC-2025-001',
    instructorName: 'FoundationCE Faculty',
    expirationMonths: 12
  }
];

// ============================================
// UNIT DATA (14-Hour CE Courses + FREC II)
// ============================================

const unitData = [
  // Core Law 3-Hour Units
  { id: 'b8ca0e0f-d27c-4dcc-9052-d8b43d1d5c03', courseId: COURSE_IDS.CORE_LAW_3HR, unitNumber: 1, title: 'Hour 1: Recent Changes Impacting Florida Real Estate', hoursRequired: 1 },
  { id: '8747794a-b8a9-4847-baf0-aa6f325e7331', courseId: COURSE_IDS.CORE_LAW_3HR, unitNumber: 2, title: 'Hour 2: Agency Law & Brokerage Relationships', hoursRequired: 1 },
  { id: 'f99bd2d3-aed9-406f-a72a-4e6c170b4f94', courseId: COURSE_IDS.CORE_LAW_3HR, unitNumber: 3, title: 'Hour 3: Escrow Management & Disciplinary Trends', hoursRequired: 1 },
  
  // Ethics 3-Hour Units
  { id: '7b0a9386-01ec-426d-9c7c-f8aaa3642821', courseId: COURSE_IDS.ETHICS_3HR, unitNumber: 1, title: 'Hour 1: Ethics vs. Law and Professional Standards', hoursRequired: 1 },
  { id: '42ea02fb-30bb-40d2-85e9-56ce4f58f924', courseId: COURSE_IDS.ETHICS_3HR, unitNumber: 2, title: 'Hour 2: Professional Advertising and Marketing Standards', hoursRequired: 1 },
  { id: 'a6afbf6b-f80a-4c17-9550-21c0acfbe1cd', courseId: COURSE_IDS.ETHICS_3HR, unitNumber: 3, title: 'Hour 3: Commission Disputes and Professional Cooperation', hoursRequired: 1 },
  
  // Transaction Mastery 8-Hour Units
  { id: '10f4ee0d-f8a1-41f6-b27c-96aa474d2ad7', courseId: COURSE_IDS.TRANSACTION_8HR, unitNumber: 1, title: 'Hour 1: Contract Structure and Key Dates', hoursRequired: 1 },
  { id: '81b17460-08a7-462f-9a12-cd7b5cad4597', courseId: COURSE_IDS.TRANSACTION_8HR, unitNumber: 2, title: 'Hour 2: Contract Contingencies and Termination Rights', hoursRequired: 1 },
  { id: '5d9ac551-52d8-4160-b5f3-2f71fa10d5f0', courseId: COURSE_IDS.TRANSACTION_8HR, unitNumber: 3, title: 'Hour 3: Property Disclosures and Seller Obligations', hoursRequired: 1 },
  { id: 'ccea8b47-17cd-4b59-9518-622daa3b9ce2', courseId: COURSE_IDS.TRANSACTION_8HR, unitNumber: 4, title: 'Hour 4: The Inspection Process and Repair Requests', hoursRequired: 1 },
  { id: '4bf74438-91e2-479b-a315-a9b9bfa0c5b7', courseId: COURSE_IDS.TRANSACTION_8HR, unitNumber: 5, title: 'Hour 5: Loan Approval and Appraisal Contingencies', hoursRequired: 1 },
  { id: 'a25de530-55f0-43b9-a856-38bac08e489c', courseId: COURSE_IDS.TRANSACTION_8HR, unitNumber: 6, title: 'Hour 6: Appraisal Gaps and Loan Conditions', hoursRequired: 1 },
  { id: 'acd74122-246f-46b8-8c2e-412a8217e971', courseId: COURSE_IDS.TRANSACTION_8HR, unitNumber: 7, title: 'Hour 7: Title Examination and Defect Resolution', hoursRequired: 1 },
  { id: '890c1b87-a3a3-4ec2-a339-17284a7710e3', courseId: COURSE_IDS.TRANSACTION_8HR, unitNumber: 8, title: 'Hour 8: Closing Procedures and Post-Closing', hoursRequired: 1 },
  
  // FREC II Units
  { id: '44a68198-cc19-4404-a2cb-0f6c8197f1a5', courseId: COURSE_IDS.FREC_II, unitNumber: 1, title: 'Session 1: Becoming a Licensed Real Estate Broker', hoursRequired: 4 },
  { id: 'd60e3ded-63b7-4ba7-bbd2-d4472940c4de', courseId: COURSE_IDS.FREC_II, unitNumber: 2, title: 'Session 2: Opening a Real Estate Office', hoursRequired: 4 },
  { id: '87f72341-f9ef-4595-b519-87be14c7d1de', courseId: COURSE_IDS.FREC_II, unitNumber: 3, title: 'Session 3: Owning, Managing and Supervising a Real Estate Office', hoursRequired: 4 },
  { id: '22c6fdeb-65b5-4c7f-a140-3ec8d5a9eeeb', courseId: COURSE_IDS.FREC_II, unitNumber: 4, title: 'Session 4: Escrow Management', hoursRequired: 4 },
  { id: '0fafc522-8aa5-45ae-928f-13b91a7593f1', courseId: COURSE_IDS.FREC_II, unitNumber: 5, title: 'Session 5: Office Inspections, Disciplinary Process and Real Estate Recovery Fund', hoursRequired: 4 },
  { id: '2caca0d8-a7a4-4536-9155-9b4d02a65633', courseId: COURSE_IDS.FREC_II, unitNumber: 6, title: 'Session 6: Overview of Real Estate Valuation', hoursRequired: 4 },
  { id: '2f273cde-962c-4373-9da4-249ef8419dba', courseId: COURSE_IDS.FREC_II, unitNumber: 7, title: 'Session 7: Sales Comparison, Cost-Depreciation and Income Approaches', hoursRequired: 4 },
  { id: 'a6390e67-c6f6-4a8e-82d1-759d1883db08', courseId: COURSE_IDS.FREC_II, unitNumber: 8, title: 'Session 8: Comparative Market Analysis', hoursRequired: 4 },
  { id: '3a52b7aa-e604-4aa8-8f4b-d67bf4219365', courseId: COURSE_IDS.FREC_II, unitNumber: 9, title: 'Session 9: Business Valuation', hoursRequired: 4 },
  { id: '765cc785-1983-401d-a8a6-3f332cfedb27', courseId: COURSE_IDS.FREC_II, unitNumber: 10, title: 'Session 10: Agency Relationships and Disclosure Requirements', hoursRequired: 4 },
  { id: '2c94560f-157d-49c1-a016-a38548cc39ea', courseId: COURSE_IDS.FREC_II, unitNumber: 11, title: 'Session 11: Contracts', hoursRequired: 4 },
  { id: '0c7bbad9-0e58-4a00-a3bd-c70719ca72b2', courseId: COURSE_IDS.FREC_II, unitNumber: 12, title: 'Session 12: Closing Real Estate Transactions', hoursRequired: 4 },
  { id: '03b9c5fd-36b5-45aa-91e2-f1e252b0c11b', courseId: COURSE_IDS.FREC_II, unitNumber: 13, title: 'Session 13: Closing Real Estate Transactions', hoursRequired: 4 },
  { id: '7eb569cb-4fb4-42b6-bf4b-59030c2ff70b', courseId: COURSE_IDS.FREC_II, unitNumber: 14, title: 'Session 14: Federal Income Tax Laws', hoursRequired: 4 },
  { id: '290d13a1-fe3a-43f1-a686-b771f4a2d8da', courseId: COURSE_IDS.FREC_II, unitNumber: 15, title: 'Session 15: Investment Real Estate', hoursRequired: 4 },
  { id: '98f61e10-9b2e-4c77-b554-d55bc4282f06', courseId: COURSE_IDS.FREC_II, unitNumber: 16, title: 'Session 16: Zoning and Planning, Subdividing of Land, and Special Issues', hoursRequired: 4 },
  { id: '159f9699-9fc4-4ac4-814f-367bbef026de', courseId: COURSE_IDS.FREC_II, unitNumber: 17, title: 'Session 17: Environmental Issues Affecting Real Estate Transactions', hoursRequired: 4 },
  { id: 'e43a2d90-441e-4f0a-9217-82a0534bfd91', courseId: COURSE_IDS.FREC_II, unitNumber: 18, title: 'Session 18: Property Management', hoursRequired: 4 }
];

// ============================================
// BUNDLE DATA
// ============================================

const bundleData = {
  id: BUNDLE_IDS.CE_14HR,
  name: '14-Hour Florida Real Estate CE Package',
  description: 'Complete your 14-hour continuing education requirement with this comprehensive package. Includes the 3-Hour Core Law Update, 3-Hour Ethics course, and 8-Hour Specialty course. Save $20 compared to purchasing courses individually.',
  productType: 'RealEstate',
  state: 'FL',
  licenseType: 'Sales Associate & Broker',
  totalHours: 14,
  bundlePrice: 8997,
  individualCoursePrice: 10997,
  isActive: 1
};

const bundleCourseData = [
  { bundleId: BUNDLE_IDS.CE_14HR, courseId: COURSE_IDS.CORE_LAW_3HR },
  { bundleId: BUNDLE_IDS.CE_14HR, courseId: COURSE_IDS.ETHICS_3HR },
  { bundleId: BUNDLE_IDS.CE_14HR, courseId: COURSE_IDS.TRANSACTION_8HR }
];

// ============================================
// UPSERT HELPERS
// ============================================

async function upsertCourse(course: typeof courseData[0]) {
  const existing = await db.select().from(courses).where(eq(courses.id, course.id));
  
  if (existing.length > 0) {
    await db.update(courses).set(course).where(eq(courses.id, course.id));
    console.log(`  ✓ Updated: ${course.title}`);
  } else {
    await db.insert(courses).values(course);
    console.log(`  + Created: ${course.title}`);
  }
}

async function upsertUnit(unit: typeof unitData[0]) {
  const existing = await db.select().from(units).where(eq(units.id, unit.id));
  
  if (existing.length > 0) {
    await db.update(units).set(unit).where(eq(units.id, unit.id));
  } else {
    await db.insert(units).values(unit);
  }
}

async function upsertBundle(bundle: typeof bundleData) {
  const existing = await db.select().from(courseBundles).where(eq(courseBundles.id, bundle.id));
  
  if (existing.length > 0) {
    await db.update(courseBundles).set(bundle).where(eq(courseBundles.id, bundle.id));
    console.log(`  ✓ Updated bundle: ${bundle.name}`);
  } else {
    await db.insert(courseBundles).values(bundle);
    console.log(`  + Created bundle: ${bundle.name}`);
  }
}

async function upsertBundleCourse(bc: typeof bundleCourseData[0]) {
  const existing = await db.select().from(bundleCourses)
    .where(and(
      eq(bundleCourses.bundleId, bc.bundleId),
      eq(bundleCourses.courseId, bc.courseId)
    ));
  
  if (existing.length === 0) {
    await db.insert(bundleCourses).values(bc);
  }
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function seedProductionCourses() {
  console.log('🎓 Foundation CE Production Seed Script');
  console.log('=========================================\n');
  
  // Seed Courses
  console.log('📚 Seeding Courses...');
  for (const course of courseData) {
    await upsertCourse(course);
  }
  
  // Seed Units
  console.log('\n📖 Seeding Units...');
  let unitCount = 0;
  for (const unit of unitData) {
    await upsertUnit(unit);
    unitCount++;
  }
  console.log(`  ✓ Processed ${unitCount} units`);
  
  // Seed Bundle
  console.log('\n📦 Seeding Bundles...');
  await upsertBundle(bundleData);
  
  for (const bc of bundleCourseData) {
    await upsertBundleCourse(bc);
  }
  console.log(`  ✓ Bundle courses linked`);
  
  // Summary
  console.log('\n=========================================');
  console.log('✅ Production seed complete!\n');
  console.log('Courses seeded:');
  console.log('  - FREC I: 63-Hour Sales Associate Pre-Licensing');
  console.log('  - FREC II: 72-Hour Broker Pre-Licensing');
  console.log('  - 3-Hour Core Law Update');
  console.log('  - 3-Hour Ethics and Business Practices');
  console.log('  - 8-Hour Transaction Mastery');
  console.log('  - 14-Hour CE Bundle\n');
}

// Run if called directly
seedProductionCourses()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
