/**
 * Seed script for 14-Hour Florida Real Estate Continuing Education Package
 * 
 * This package consists of 3 courses:
 * 1. Course 1: 3-Hour Florida Core Law Update (Core Law requirement)
 * 2. Course 2: 3-Hour Ethics and Business Practices (Ethics requirement)
 * 3. Course 3: 8-Hour Florida Transaction Mastery - Contracts & Risk Management (Specialty)
 * 
 * Each course includes:
 * - Units (one per hour of instruction)
 * - Lessons (detailed content per unit)
 * - Unit quizzes (5 questions per hour)
 * - Final exam (Course 2 only has 20-question final, others use quizzes as assessment)
 * 
 * Bundle includes all three courses at discounted price
 */

import { db } from './db';
import { 
  courses, 
  courseBundles, 
  bundleCourses,
  units, 
  lessons, 
  practiceExams, 
  examQuestions 
} from '@shared/schema';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

// Generate consistent UUIDs for relational integrity
const COURSE_1_ID = uuidv4();
const COURSE_2_ID = uuidv4();
const COURSE_3_ID = uuidv4();
const BUNDLE_ID = uuidv4();

// Unit IDs for Course 1 (3 hours = 3 units)
const COURSE_1_UNIT_IDS = [uuidv4(), uuidv4(), uuidv4()];

// Unit IDs for Course 2 (3 hours = 3 units)
const COURSE_2_UNIT_IDS = [uuidv4(), uuidv4(), uuidv4()];

// Unit IDs for Course 3 (8 hours = 8 units, organized into 4 modules of 2 hours each)
const COURSE_3_UNIT_IDS = Array.from({ length: 8 }, () => uuidv4());

// Final exam ID for Course 2
const COURSE_2_FINAL_EXAM_ID = uuidv4();

export async function seed14HourCE() {
  console.log('🎓 Seeding 14-Hour Florida Real Estate CE Package...\n');

  try {
    // ========================================
    // STEP 1: CREATE COURSES
    // ========================================
    console.log('📚 Creating courses...');
    
    // Course 1: 3-Hour Florida Core Law Update
    await db.insert(courses).values({
      id: COURSE_1_ID,
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
      price: 2999, // $29.99
      sku: 'FL-CE-CORE-LAW-3HR',
      renewalApplicable: 1,
      renewalPeriodYears: 2,
      providerNumber: 'FL-DBPR-0001',
      courseOfferingNumber: 'CE-CORE-2025-001',
      instructorName: 'FoundationCE Faculty',
      expirationMonths: 12,
    });

    // Course 2: 3-Hour Ethics and Business Practices
    await db.insert(courses).values({
      id: COURSE_2_ID,
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
      price: 2999, // $29.99
      sku: 'FL-CE-ETHICS-3HR',
      renewalApplicable: 1,
      renewalPeriodYears: 2,
      providerNumber: 'FL-DBPR-0001',
      courseOfferingNumber: 'CE-ETHICS-2025-001',
      instructorName: 'FoundationCE Faculty',
      expirationMonths: 12,
    });

    // Course 3: 8-Hour Specialty (Transaction Mastery)
    await db.insert(courses).values({
      id: COURSE_3_ID,
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
      price: 4999, // $49.99
      sku: 'FL-CE-SPECIALTY-8HR',
      renewalApplicable: 1,
      renewalPeriodYears: 2,
      providerNumber: 'FL-DBPR-0001',
      courseOfferingNumber: 'CE-SPEC-2025-001',
      instructorName: 'FoundationCE Faculty',
      expirationMonths: 12,
    });

    console.log('✅ Created 3 courses');

    // ========================================
    // STEP 2: CREATE BUNDLE
    // ========================================
    console.log('📦 Creating 14-Hour CE bundle...');
    
    await db.insert(courseBundles).values({
      id: BUNDLE_ID,
      name: '14-Hour Florida Real Estate CE Package',
      description: 'Complete your Florida real estate continuing education requirements with this comprehensive package. Includes 3-Hour Core Law, 3-Hour Ethics, and 8-Hour Specialty courses. Save $21 compared to purchasing courses individually.',
      productType: 'RealEstate',
      state: 'FL',
      licenseType: 'Sales Associate & Broker',
      totalHours: 14,
      bundlePrice: 8997, // $89.97 (discounted from $109.97)
      individualCoursePrice: 10997, // $109.97 if purchased separately
      isActive: 1,
    });

    // Link courses to bundle
    await db.insert(bundleCourses).values([
      { bundleId: BUNDLE_ID, courseId: COURSE_1_ID, sequence: 1 },
      { bundleId: BUNDLE_ID, courseId: COURSE_2_ID, sequence: 2 },
      { bundleId: BUNDLE_ID, courseId: COURSE_3_ID, sequence: 3 },
    ]);

    console.log('✅ Created bundle with 3 courses');

    // ========================================
    // STEP 3: CREATE COURSE 1 UNITS & LESSONS
    // ========================================
    console.log('📖 Creating Course 1: Core Law units and lessons...');
    
    await seedCourse1Units();
    console.log('✅ Created Course 1 content');

    // ========================================
    // STEP 4: CREATE COURSE 2 UNITS, LESSONS & FINAL EXAM
    // ========================================
    console.log('📖 Creating Course 2: Ethics units, lessons, and final exam...');
    
    await seedCourse2Units();
    await seedCourse2FinalExam();
    console.log('✅ Created Course 2 content and final exam');

    // ========================================
    // STEP 5: CREATE COURSE 3 UNITS & LESSONS
    // ========================================
    console.log('📖 Creating Course 3: Transaction Mastery units and lessons...');
    
    await seedCourse3Units();
    console.log('✅ Created Course 3 content');

    console.log('\n🎉 Successfully seeded 14-Hour Florida Real Estate CE Package!');
    console.log(`   - Course 1 ID: ${COURSE_1_ID}`);
    console.log(`   - Course 2 ID: ${COURSE_2_ID}`);
    console.log(`   - Course 3 ID: ${COURSE_3_ID}`);
    console.log(`   - Bundle ID: ${BUNDLE_ID}`);

  } catch (error) {
    console.error('❌ Error seeding CE package:', error);
    throw error;
  }
}

// ========================================
// COURSE 1: 3-HOUR FLORIDA CORE LAW UPDATE
// ========================================
async function seedCourse1Units() {
  const course1Units = [
    {
      id: COURSE_1_UNIT_IDS[0],
      courseId: COURSE_1_ID,
      unitNumber: 1,
      title: 'Hour 1: Recent Changes Impacting Florida Real Estate',
      description: 'Explore the latest legislative and regulatory updates affecting Florida real estate practice, including FREC rule changes and disciplinary trends.',
      hoursRequired: 1,
      sequence: 1,
    },
    {
      id: COURSE_1_UNIT_IDS[1],
      courseId: COURSE_1_ID,
      unitNumber: 2,
      title: 'Hour 2: Agency Law & Brokerage Relationships',
      description: 'Master Florida agency law, understand single agent vs transaction broker duties, and learn proper disclosure requirements.',
      hoursRequired: 1,
      sequence: 2,
    },
    {
      id: COURSE_1_UNIT_IDS[2],
      courseId: COURSE_1_ID,
      unitNumber: 3,
      title: 'Hour 3: Escrow Management & Disciplinary Trends',
      description: 'Learn proper escrow handling procedures, understand common violations, and review recent disciplinary cases and trends.',
      hoursRequired: 1,
      sequence: 3,
    },
  ];

  await db.insert(units).values(course1Units);

  // Lessons for each unit
  const course1Lessons = [
    // Hour 1 Lessons
    {
      unitId: COURSE_1_UNIT_IDS[0],
      lessonNumber: 1,
      title: 'The Florida Real Estate Commission (FREC) and DBPR',
      content: `The Florida Real Estate Commission (FREC) operates under the authority of the Florida Department of Business and Professional Regulation (DBPR). Together, these bodies are responsible for licensing real estate professionals, enforcing laws and rules governing real estate practice, and protecting the public from unqualified or dishonest practitioners.

FREC consists of seven members appointed by the Governor and confirmed by the Senate. Membership includes licensed brokers and sales associates as well as consumer representatives who are not licensed in any profession regulated by DBPR. Each member serves a four-year term.

In addition to its licensing and enforcement role, FREC has rule-making authority under the Florida Administrative Code. These rules interpret and implement the statutes in Chapter 475, Florida Statutes, and provide detailed guidance on licensing requirements, advertising, escrow procedures, and professional conduct.

Recent years have seen updates in several areas, including electronic signatures, remote online notarization, and changes to continuing education requirements. Licensees must keep informed of these changes to avoid unintentional violations.`,
      durationMinutes: 10,
      sequence: 1,
    },
    {
      unitId: COURSE_1_UNIT_IDS[0],
      lessonNumber: 2,
      title: 'Recent Legislative Changes',
      content: `Florida's real estate laws are regularly updated to address market conditions, consumer protection needs, and industry practices. Understanding recent legislative changes is essential for compliance.

Recent legislative updates have included:

1. Changes to continuing education requirements for license renewal
2. Updates to the rental deposit and advance requirements
3. Modifications to disclosure requirements for material defects
4. Electronic signature and remote notarization authorization
5. Changes to community association disclosure requirements

Licensees are expected to stay current with all statutory changes. Ignorance of the law is not a defense against disciplinary action. The DBPR website and official Florida real estate education providers are reliable sources for updates.`,
      durationMinutes: 10,
      sequence: 2,
    },
    {
      unitId: COURSE_1_UNIT_IDS[0],
      lessonNumber: 3,
      title: 'FREC Rule Changes and Updates',
      content: `FREC has the authority to adopt rules that interpret and implement Florida's real estate licensing laws. These rules are published in the Florida Administrative Code and have the force of law.

Recent rule changes have addressed:

1. Advertising requirements - including social media and internet advertising standards
2. Escrow account requirements - including interest-bearing accounts and notification procedures
3. Education requirements - including distance learning standards and exam preparation courses
4. Brokerage operations - including office signage and record retention requirements

When FREC proposes new rules or amendments, the public has an opportunity to comment before adoption. Licensees should monitor FREC meeting agendas and proposed rules to anticipate changes that may affect their practice.

Non-compliance with FREC rules can result in disciplinary action including fines, license suspension, or revocation.`,
      durationMinutes: 10,
      sequence: 3,
    },
    // Hour 2 Lessons
    {
      unitId: COURSE_1_UNIT_IDS[1],
      lessonNumber: 1,
      title: 'Single Agent vs Transaction Broker',
      content: `Florida law recognizes different types of brokerage relationships, each with distinct duties and obligations.

A Single Agent represents either the buyer or the seller, but not both, in a real estate transaction. Single agents owe their principal a full set of fiduciary duties including:
- Dealing honestly and fairly
- Loyalty
- Confidentiality
- Obedience
- Full disclosure of all known facts that materially affect the value of residential real property
- Accounting for all funds
- Skill, care, and diligence
- Presenting all offers and counteroffers in a timely manner

A Transaction Broker provides a limited form of representation to buyers, sellers, or both. Transaction brokers do not owe loyalty or confidentiality beyond certain limited matters. Their duties include:
- Dealing honestly and fairly
- Accounting for all funds
- Using skill, care, and diligence
- Disclosing all known facts that materially affect the value of residential real property
- Presenting all offers and counteroffers in a timely manner
- Limited confidentiality

Transaction broker is the default relationship in Florida unless another relationship is established in writing.`,
      durationMinutes: 10,
      sequence: 1,
    },
    {
      unitId: COURSE_1_UNIT_IDS[1],
      lessonNumber: 2,
      title: 'Disclosure Requirements',
      content: `Florida law requires written disclosure of the brokerage relationship before a licensee provides services to a buyer or seller in a residential transaction.

The No Brokerage Relationship notice must be given when a licensee will not be representing the party but is still providing services (such as showing a listing to an unrepresented buyer).

Timing of disclosure:
- For residential sales: before or at the time of entering into a listing agreement or showing property
- For rentals: before showing property or accepting an application

The disclosure must be signed by the party, and the licensee should retain a copy for their records.

Failure to provide the required disclosure can result in disciplinary action against the licensee. Additionally, unclear or late disclosures can create confusion about duties and expectations, potentially leading to disputes or litigation.

Best practice: Provide disclosures early, explain them clearly, and document the timing of delivery.`,
      durationMinutes: 10,
      sequence: 2,
    },
    {
      unitId: COURSE_1_UNIT_IDS[1],
      lessonNumber: 3,
      title: 'Dual Agency and Authorized Brokerage',
      content: `In Florida, dual agency (representing both buyer and seller as a single agent) is not permitted. However, with proper disclosure and consent, a brokerage may use transaction brokers to work with both parties in the same transaction.

When the same brokerage has licensees working with both the buyer and seller:
1. Written disclosure must be provided to both parties
2. Neither party can receive full single-agent representation
3. Confidential information from one party cannot be shared with the other without permission
4. Both parties must understand the limitations of this arrangement

Designated sales associates is another option available for commercial transactions, but is not available for residential transactions.

Common pitfalls to avoid:
- Accidentally disclosing confidential pricing information
- Appearing to favor one party over the other
- Failing to disclose the in-house situation promptly

Clear communication and documentation help protect both the clients and the licensees in these situations.`,
      durationMinutes: 10,
      sequence: 3,
    },
    // Hour 3 Lessons
    {
      unitId: COURSE_1_UNIT_IDS[2],
      lessonNumber: 1,
      title: 'Escrow Account Requirements',
      content: `Florida law requires brokers to maintain escrow accounts for holding funds that belong to others in connection with real estate transactions. Proper escrow management is one of the most important compliance areas in real estate practice.

Key requirements include:

1. Escrow accounts must be in a Florida bank or credit union
2. The account must be insured by a federal agency (FDIC or NCUA)
3. Funds must be deposited within three business days after the broker receives them (unless the contract specifies otherwise)
4. Brokers must maintain accurate records of all escrow transactions
5. Monthly reconciliation statements are required

Interest-bearing escrow accounts may be used with written permission of all parties entitled to the funds. Interest earned belongs to the parties as agreed.

Personal funds of the broker may be kept in an escrow account only to cover minimum balance requirements or bank fees, typically up to $5,000.`,
      durationMinutes: 10,
      sequence: 1,
    },
    {
      unitId: COURSE_1_UNIT_IDS[2],
      lessonNumber: 2,
      title: 'Common Escrow Violations',
      content: `Escrow violations are among the most common reasons for disciplinary action against Florida real estate licensees. Understanding these violations helps avoid them.

Common violations include:

1. Failure to deposit escrow funds within required timeframes
2. Commingling - mixing escrow funds with personal or business funds
3. Conversion - using escrow funds for purposes other than intended
4. Improper disbursement of escrow funds
5. Failure to maintain proper records
6. Failure to notify FREC of conflicting demands on escrow funds

When there is a dispute over escrow funds, brokers have several options:
- Mediation (if agreed by all parties)
- Arbitration (if agreed by all parties)
- Litigation (interpleader action)
- Request FREC to issue an escrow disbursement order (EDO)

Brokers must notify FREC within 15 business days of receiving conflicting demands unless the matter is resolved within that time.`,
      durationMinutes: 10,
      sequence: 2,
    },
    {
      unitId: COURSE_1_UNIT_IDS[2],
      lessonNumber: 3,
      title: 'Recent Disciplinary Trends',
      content: `Review of recent FREC disciplinary cases reveals common areas of violation that licensees should be aware of:

1. Advertising violations - failure to include brokerage name, misleading claims, unlicensed advertising
2. Escrow violations - late deposits, inadequate records, improper disbursement
3. Disclosure failures - failing to disclose material facts or agency relationships
4. Unlicensed activity - practicing without a current active license
5. Trust account violations - commingling, conversion, failure to reconcile
6. Failure to supervise - brokers failing to supervise sales associates

Penalties range from administrative fines to license suspension or revocation, depending on severity and prior history.

The best way to avoid disciplinary action is to:
- Stay current on laws and rules
- Maintain accurate records
- Seek guidance when uncertain
- Complete required continuing education
- Respond promptly to DBPR inquiries

When receiving a complaint, cooperate fully and consider consulting with an attorney experienced in real estate license defense.`,
      durationMinutes: 10,
      sequence: 3,
    },
  ];

  await db.insert(lessons).values(course1Lessons);

  // Create unit quizzes for Course 1 (5 questions per hour)
  await seedCourse1Quizzes();
}

async function seedCourse1Quizzes() {
  // Hour 1 Quiz
  const hour1QuizId = uuidv4();
  await db.insert(practiceExams).values({
    id: hour1QuizId,
    courseId: COURSE_1_ID,
    title: 'Hour 1 Quiz: Recent Changes Impacting Florida Real Estate',
    description: 'Test your knowledge of recent legislative and regulatory changes affecting Florida real estate practice.',
    totalQuestions: 5,
    passingScore: 70,
    isActive: 1,
    isFinalExam: 0,
  });

  await db.insert(examQuestions).values([
    {
      examId: hour1QuizId,
      questionText: 'How many members serve on the Florida Real Estate Commission (FREC)?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'FREC consists of seven members appointed by the Governor and confirmed by the Senate.',
      options: JSON.stringify(['A) Five', 'B) Seven', 'C) Nine', 'D) Twelve']),
      sequence: 1,
    },
    {
      examId: hour1QuizId,
      questionText: 'Which of the following has authority to adopt rules that interpret Florida real estate law?',
      questionType: 'multiple_choice',
      correctAnswer: 'A',
      explanation: 'FREC has rule-making authority under the Florida Administrative Code to interpret and implement statutes in Chapter 475.',
      options: JSON.stringify(['A) FREC', 'B) The Governor', 'C) Local Realtor associations', 'D) Individual brokerages']),
      sequence: 2,
    },
    {
      examId: hour1QuizId,
      questionText: 'Where are FREC rules officially published?',
      questionType: 'multiple_choice',
      correctAnswer: 'C',
      explanation: 'FREC rules are published in the Florida Administrative Code and have the force of law.',
      options: JSON.stringify(['A) Local newspapers', 'B) MLS bulletins', 'C) Florida Administrative Code', 'D) Real estate textbooks only']),
      sequence: 3,
    },
    {
      examId: hour1QuizId,
      questionText: 'A licensee claims they were unaware of a recent rule change. Is ignorance of the law a valid defense against disciplinary action?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'Ignorance of the law is not a defense against disciplinary action. Licensees are expected to stay current with all statutory and rule changes.',
      options: JSON.stringify(['A) Yes, if the change was made within the last year', 'B) No, licensees are expected to stay current with all changes', 'C) Yes, if the licensee has not taken recent CE courses', 'D) It depends on the severity of the violation']),
      sequence: 4,
    },
    {
      examId: hour1QuizId,
      questionText: 'Which agency operates under the authority of DBPR and is responsible for licensing real estate professionals in Florida?',
      questionType: 'multiple_choice',
      correctAnswer: 'A',
      explanation: 'The Florida Real Estate Commission (FREC) operates under DBPR authority and is responsible for licensing, enforcing laws, and protecting the public.',
      options: JSON.stringify(['A) FREC', 'B) NAR', 'C) FAR', 'D) HUD']),
      sequence: 5,
    },
  ]);

  // Hour 2 Quiz
  const hour2QuizId = uuidv4();
  await db.insert(practiceExams).values({
    id: hour2QuizId,
    courseId: COURSE_1_ID,
    title: 'Hour 2 Quiz: Agency Law & Brokerage Relationships',
    description: 'Test your understanding of Florida agency law, single agent vs transaction broker duties, and disclosure requirements.',
    totalQuestions: 5,
    passingScore: 70,
    isActive: 1,
    isFinalExam: 0,
  });

  await db.insert(examQuestions).values([
    {
      examId: hour2QuizId,
      questionText: 'Which brokerage relationship is the default in Florida if no other relationship is established in writing?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'Transaction broker is the default relationship in Florida unless another relationship is established in writing.',
      options: JSON.stringify(['A) Single agent', 'B) Transaction broker', 'C) Dual agent', 'D) No brokerage relationship']),
      sequence: 1,
    },
    {
      examId: hour2QuizId,
      questionText: 'A single agent owes their principal all of the following duties EXCEPT:',
      questionType: 'multiple_choice',
      correctAnswer: 'D',
      explanation: 'Single agents owe loyalty, confidentiality, and full disclosure, among other duties. However, they are not required to guarantee the outcome of a transaction.',
      options: JSON.stringify(['A) Loyalty', 'B) Confidentiality', 'C) Full disclosure', 'D) Guaranteeing the outcome of a transaction']),
      sequence: 2,
    },
    {
      examId: hour2QuizId,
      questionText: 'When must a brokerage relationship disclosure be provided in a residential sales transaction?',
      questionType: 'multiple_choice',
      correctAnswer: 'A',
      explanation: 'For residential sales, disclosure must be provided before or at the time of entering into a listing agreement or showing property.',
      options: JSON.stringify(['A) Before or at the time of entering into a listing agreement or showing property', 'B) At closing', 'C) Within 30 days after showing property', 'D) Only when requested by the client']),
      sequence: 3,
    },
    {
      examId: hour2QuizId,
      questionText: 'Which of the following statements about dual agency in Florida is correct?',
      questionType: 'multiple_choice',
      correctAnswer: 'C',
      explanation: 'In Florida, dual agency (representing both buyer and seller as a single agent) is not permitted. However, transaction brokers may work with both parties with proper disclosure.',
      options: JSON.stringify(['A) Dual agency is permitted with verbal consent', 'B) Dual agency is the default relationship', 'C) Dual agency is not permitted in Florida', 'D) Dual agency requires court approval']),
      sequence: 4,
    },
    {
      examId: hour2QuizId,
      questionText: 'A transaction broker does NOT owe which of the following to their client?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'Transaction brokers provide limited representation and do not owe full loyalty in the same way a single agent does. They still must be honest and disclose material facts.',
      options: JSON.stringify(['A) Dealing honestly and fairly', 'B) Full loyalty', 'C) Accounting for all funds', 'D) Using skill, care, and diligence']),
      sequence: 5,
    },
  ]);

  // Hour 3 Quiz
  const hour3QuizId = uuidv4();
  await db.insert(practiceExams).values({
    id: hour3QuizId,
    courseId: COURSE_1_ID,
    title: 'Hour 3 Quiz: Escrow Management & Disciplinary Trends',
    description: 'Test your knowledge of escrow requirements, common violations, and recent disciplinary trends.',
    totalQuestions: 5,
    passingScore: 70,
    isActive: 1,
    isFinalExam: 0,
  });

  await db.insert(examQuestions).values([
    {
      examId: hour3QuizId,
      questionText: 'Within how many business days must a broker deposit escrow funds after receiving them (unless otherwise specified in the contract)?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'Funds must be deposited within three business days after the broker receives them, unless the contract specifies otherwise.',
      options: JSON.stringify(['A) One business day', 'B) Three business days', 'C) Five business days', 'D) Ten business days']),
      sequence: 1,
    },
    {
      examId: hour3QuizId,
      questionText: 'What is the maximum amount of personal funds a broker may keep in an escrow account to cover minimum balance requirements?',
      questionType: 'multiple_choice',
      correctAnswer: 'C',
      explanation: 'Personal funds of the broker may be kept in an escrow account only to cover minimum balance requirements or bank fees, typically up to $5,000.',
      options: JSON.stringify(['A) $1,000', 'B) $2,500', 'C) $5,000', 'D) $10,000']),
      sequence: 2,
    },
    {
      examId: hour3QuizId,
      questionText: 'When a broker receives conflicting demands on escrow funds, within how many business days must they notify FREC?',
      questionType: 'multiple_choice',
      correctAnswer: 'C',
      explanation: 'Brokers must notify FREC within 15 business days of receiving conflicting demands unless the matter is resolved within that time.',
      options: JSON.stringify(['A) 5 business days', 'B) 10 business days', 'C) 15 business days', 'D) 30 business days']),
      sequence: 3,
    },
    {
      examId: hour3QuizId,
      questionText: 'Mixing escrow funds with personal or business funds is known as:',
      questionType: 'multiple_choice',
      correctAnswer: 'A',
      explanation: 'Commingling is mixing escrow funds with personal or business funds, which is a serious violation of Florida real estate law.',
      options: JSON.stringify(['A) Commingling', 'B) Conversion', 'C) Disbursement', 'D) Reconciliation']),
      sequence: 4,
    },
    {
      examId: hour3QuizId,
      questionText: 'Which of the following is NOT a valid option for resolving an escrow dispute?',
      questionType: 'multiple_choice',
      correctAnswer: 'D',
      explanation: 'Brokers cannot simply keep disputed funds. Valid options include mediation, arbitration, litigation (interpleader), or requesting an EDO from FREC.',
      options: JSON.stringify(['A) Mediation', 'B) Arbitration', 'C) Request an Escrow Disbursement Order from FREC', 'D) Keep the funds until the parties agree']),
      sequence: 5,
    },
  ]);
}

// ========================================
// COURSE 2: 3-HOUR ETHICS AND BUSINESS PRACTICES
// ========================================
async function seedCourse2Units() {
  const course2Units = [
    {
      id: COURSE_2_UNIT_IDS[0],
      courseId: COURSE_2_ID,
      unitNumber: 1,
      title: 'Hour 1: Ethics vs. Law and Professional Standards',
      description: 'Understand the distinction between legal compliance and ethical conduct, explore ethical dilemmas, and learn professional standards for Florida real estate practice.',
      hoursRequired: 1,
      sequence: 1,
    },
    {
      id: COURSE_2_UNIT_IDS[1],
      courseId: COURSE_2_ID,
      unitNumber: 2,
      title: 'Hour 2: Professional Advertising and Marketing Standards',
      description: 'Master advertising compliance, understand fair housing considerations in marketing, and develop professional identification practices.',
      hoursRequired: 1,
      sequence: 2,
    },
    {
      id: COURSE_2_UNIT_IDS[2],
      courseId: COURSE_2_ID,
      unitNumber: 3,
      title: 'Hour 3: Commission Disputes and Professional Cooperation',
      description: 'Learn professional approaches to commission disputes, understand procuring cause principles, and develop cooperative relationships with other professionals.',
      hoursRequired: 1,
      sequence: 3,
    },
  ];

  await db.insert(units).values(course2Units);

  // Lessons for Course 2
  const course2Lessons = [
    // Hour 1 Lessons
    {
      unitId: COURSE_2_UNIT_IDS[0],
      lessonNumber: 1,
      title: 'Law vs. Ethics: Understanding the Distinction',
      content: `Law and ethics are related but distinct concepts that guide professional conduct in real estate.

Law refers to the formal rules established by government that are enforceable through regulatory or judicial action. In real estate, these include licensing statutes, contract law, fair housing laws, and FREC rules.

Ethics refers to broader standards of conduct based on principles such as honesty, fairness, and respect. Ethical standards often exceed legal requirements.

Example: A seller tells their agent that the roof has leaked in the past but was repaired. The law may require disclosure only of known existing defects. Ethics suggests full transparency about past issues that might concern a buyer, even if not legally required.

Understanding this distinction helps licensees:
- Recognize that legal compliance is the minimum standard
- Appreciate that ethical conduct builds trust and reputation
- Navigate situations where the law is unclear
- Make decisions that protect clients and the public`,
      durationMinutes: 10,
      sequence: 1,
    },
    {
      unitId: COURSE_2_UNIT_IDS[0],
      lessonNumber: 2,
      title: 'Ethical Decision-Making Framework',
      content: `When facing ethical dilemmas, licensees can apply a structured decision-making framework:

1. Identify the ethical issue - What values or principles are in conflict?

2. Gather relevant facts - What do you know? What do you need to know?

3. Consider stakeholders - Who is affected by this decision? How?

4. Evaluate options - What are the possible courses of action?

5. Apply ethical principles - Which option best aligns with honesty, fairness, and professional standards?

6. Make a decision and act - Choose the course of action that you can justify and defend.

7. Reflect on the outcome - What can you learn for future situations?

Common ethical dilemmas in real estate include:
- Pressure to omit negative information about a property
- Temptation to encourage a higher offer than the buyer intended
- Conflicts between loyalty to clients and honesty to other parties
- Balancing commission incentives with client interests

The best approach is to default to transparency and fairness, even when the law might allow less.`,
      durationMinutes: 10,
      sequence: 2,
    },
    {
      unitId: COURSE_2_UNIT_IDS[0],
      lessonNumber: 3,
      title: 'Professional Standards and Codes of Conduct',
      content: `In addition to legal requirements, many real estate professionals are bound by professional codes of conduct established by organizations such as the National Association of REALTORS® (NAR) or state associations.

Key principles found in most professional codes include:

1. Client interests first - The client's interests come before the agent's own interests.

2. Cooperation - Professionals should work cooperatively with other practitioners when it serves their clients.

3. Truthfulness - All statements should be accurate and not misleading.

4. Competence - Professionals should only undertake tasks within their expertise or seek appropriate guidance.

5. Fair treatment - All parties should be treated fairly and honestly.

Violations of professional codes can result in sanctions from the professional organization, separate from any regulatory action by DBPR or FREC.

Building a reputation for ethical conduct is one of the most valuable assets a real estate professional can develop. Trust leads to referrals, repeat business, and long-term success.`,
      durationMinutes: 10,
      sequence: 3,
    },
    // Hour 2 Lessons
    {
      unitId: COURSE_2_UNIT_IDS[1],
      lessonNumber: 1,
      title: 'Advertising Compliance Requirements',
      content: `Florida law and FREC rules establish specific requirements for real estate advertising. Compliance protects consumers and maintains professional standards.

Key advertising requirements include:

1. Brokerage identification - All advertising must include the name of the brokerage firm as registered with DBPR. This applies to all media including print, online, social media, and video.

2. Truthfulness - Advertisements must not contain false or misleading statements, including exaggerated claims about property features or market conditions.

3. License status - Advertisements should not suggest that a sales associate can act independently of their brokerage.

4. Property information - Facts about properties must be accurate and verifiable.

5. Equal opportunity - All advertising must comply with fair housing laws and avoid discriminatory language.

Common advertising violations include:
- Failing to include the brokerage name
- Using only a team name without the brokerage
- Making unsubstantiated claims (e.g., "#1 Agent" without verification)
- Using photos of properties that don't match the actual listing`,
      durationMinutes: 10,
      sequence: 1,
    },
    {
      unitId: COURSE_2_UNIT_IDS[1],
      lessonNumber: 2,
      title: 'Fair Housing in Advertising',
      content: `Fair housing laws prohibit discrimination in housing based on protected classes. These laws apply to all advertising, including:

- Print advertisements
- Online listings and websites
- Social media posts
- Video and virtual tours
- Email marketing
- Property signage

Protected classes under federal law include: race, color, religion, national origin, sex, familial status, and disability. Florida law adds additional protections.

Advertising best practices:
- Focus on property features, not the characteristics of potential buyers
- Avoid language that suggests preference for certain groups (e.g., "perfect for young professionals")
- Include the Equal Housing Opportunity logo or statement
- Avoid photos that suggest only certain types of people are welcome
- Be cautious with neighborhood descriptions that might be interpreted as code words

Even unintentional discriminatory language can result in complaints and investigations. When in doubt, focus strictly on the physical property and its features.`,
      durationMinutes: 10,
      sequence: 2,
    },
    {
      unitId: COURSE_2_UNIT_IDS[1],
      lessonNumber: 3,
      title: 'Digital Marketing and Social Media Standards',
      content: `Digital marketing and social media present unique challenges for real estate professionals. The same rules that apply to traditional advertising apply online, with some additional considerations.

Social media best practices:
1. Include your brokerage name in your profile and, where possible, in individual posts about listings
2. Be careful about testimonials - they must be genuine and accurately represent client experiences
3. Respond to comments and questions professionally
4. Avoid making promises or guarantees about market performance
5. Keep personal opinions separate from professional advice

Digital advertising considerations:
- Targeted advertising must not discriminate based on protected classes
- "Dark posts" (ads shown only to select audiences) must still comply with fair housing
- Retargeting and algorithms should be monitored for unintended discrimination
- Virtual tours and video walk-throughs must accurately represent the property

Record keeping:
- Keep copies of advertisements for your files
- Document the dates advertisements were published or posted
- Be prepared to produce advertising records if requested by DBPR`,
      durationMinutes: 10,
      sequence: 3,
    },
    // Hour 3 Lessons
    {
      unitId: COURSE_2_UNIT_IDS[2],
      lessonNumber: 1,
      title: 'Commission Agreements and Disputes',
      content: `Commission disputes are a common source of conflict in real estate transactions. Understanding the legal framework and professional standards helps resolve these disputes appropriately.

Commission basics:
- Commissions are negotiable between the broker and client
- Commission agreements should be in writing
- The listing agreement typically specifies the commission rate and how it will be split if a cooperating broker is involved
- The buyer representation agreement may also address compensation

Common sources of disputes:
1. Multiple brokers claiming to be procuring cause
2. Disagreements over whether conditions for earning commission were met
3. Expired listings followed by subsequent sales
4. In-house transactions where both sides are represented by the same brokerage

Professional approaches to disputes:
- Document all activities and communications throughout the transaction
- Communicate promptly and professionally when issues arise
- Attempt direct resolution before escalating
- Consider mediation or arbitration through professional associations
- Avoid public disputes or negative statements about other professionals`,
      durationMinutes: 10,
      sequence: 1,
    },
    {
      unitId: COURSE_2_UNIT_IDS[2],
      lessonNumber: 2,
      title: 'Procuring Cause Principles',
      content: `Procuring cause determines which broker is entitled to a commission when more than one broker claims to have contributed to a sale.

The basic test: Which broker's efforts were the primary cause of the transaction? This is often called the "but for" test - "but for" this broker's efforts, would the transaction have occurred?

Factors considered in procuring cause determinations:
1. Who first introduced the buyer to the property?
2. Who maintained ongoing contact and communication?
3. Was there a break in the chain of events?
4. Who conducted negotiations leading to the contract?
5. What were the terms of any representation agreements?

Important principles:
- Initial introduction alone does not guarantee procuring cause
- A buyer working with multiple brokers creates risk of disputes
- Written representation agreements help clarify expectations
- Time gaps between broker contacts may break the causal chain
- The conduct and diligence of each broker matters

When disputes arise, professional arbitration through associations like NAR or local boards can provide faster, less expensive resolution than litigation.`,
      durationMinutes: 10,
      sequence: 2,
    },
    {
      unitId: COURSE_2_UNIT_IDS[2],
      lessonNumber: 3,
      title: 'Professional Cooperation and Relationships',
      content: `Successful real estate professionals build cooperative relationships with other practitioners, even when representing different parties.

Benefits of professional cooperation:
- Smoother transactions for clients
- Faster resolution of issues
- Positive reputation in the professional community
- Increased referrals from other agents
- Better outcomes in dispute resolution

Best practices for cooperation:
1. Respond promptly to inquiries from other agents
2. Present all offers fairly and completely
3. Communicate clearly about showing availability and feedback
4. Honor commitments for appointments and deadlines
5. Share information that helps the transaction (while protecting confidential client information)
6. Avoid disparaging other professionals to clients

Handling disagreements:
- Address issues directly with the other professional first
- Keep the tone professional and focus on facts
- Avoid involving clients in inter-agent disputes unless necessary
- Seek supervisor guidance if needed
- Use formal dispute resolution when direct communication fails

The real estate community is relatively small. Your reputation for professionalism will follow you throughout your career.`,
      durationMinutes: 10,
      sequence: 3,
    },
  ];

  await db.insert(lessons).values(course2Lessons);

  // Create unit quizzes for Course 2
  await seedCourse2Quizzes();
}

async function seedCourse2Quizzes() {
  // Hour 1 Quiz
  const hour1QuizId = uuidv4();
  await db.insert(practiceExams).values({
    id: hour1QuizId,
    courseId: COURSE_2_ID,
    title: 'Hour 1 Quiz: Ethics vs. Law',
    description: 'Test your understanding of the distinction between legal compliance and ethical conduct.',
    totalQuestions: 5,
    passingScore: 70,
    isActive: 1,
    isFinalExam: 0,
  });

  await db.insert(examQuestions).values([
    {
      examId: hour1QuizId,
      questionText: 'What is the key difference between law and ethics in real estate?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'Law refers to formal enforceable rules established by government. Ethics refers to broader standards of conduct that often exceed legal requirements.',
      options: JSON.stringify(['A) They are identical concepts', 'B) Ethics often exceed legal requirements while law is the minimum standard', 'C) Ethics are legally enforceable while law is voluntary', 'D) Law applies only to brokers while ethics apply to sales associates']),
      sequence: 1,
    },
    {
      examId: hour1QuizId,
      questionText: 'When facing an ethical dilemma, what should be the first step in the decision-making process?',
      questionType: 'multiple_choice',
      correctAnswer: 'A',
      explanation: 'The first step is to identify the ethical issue - understanding what values or principles are in conflict.',
      options: JSON.stringify(['A) Identify the ethical issue', 'B) Make a quick decision to avoid delays', 'C) Ask your broker what to do', 'D) Do whatever is most profitable']),
      sequence: 2,
    },
    {
      examId: hour1QuizId,
      questionText: 'A seller discloses to their agent that the roof leaked last year but was repaired. What approach reflects ethical conduct?',
      questionType: 'multiple_choice',
      correctAnswer: 'C',
      explanation: 'Ethical conduct suggests full transparency about past issues that might concern a buyer, even if not strictly legally required.',
      options: JSON.stringify(['A) Only disclose if specifically asked by the buyer', 'B) Hide the information since the roof was repaired', 'C) Encourage the seller to disclose the past leak and repair', 'D) Disclose only after the contract is signed']),
      sequence: 3,
    },
    {
      examId: hour1QuizId,
      questionText: 'Which of the following is NOT typically a principle found in professional codes of conduct?',
      questionType: 'multiple_choice',
      correctAnswer: 'D',
      explanation: 'Professional codes emphasize client interests, truthfulness, and competence. Maximizing commission at any cost conflicts with putting clients first.',
      options: JSON.stringify(['A) Client interests first', 'B) Truthfulness', 'C) Cooperation with other practitioners', 'D) Maximizing commission at any cost']),
      sequence: 4,
    },
    {
      examId: hour1QuizId,
      questionText: 'Building a reputation for ethical conduct leads to all of the following EXCEPT:',
      questionType: 'multiple_choice',
      correctAnswer: 'D',
      explanation: 'Ethical conduct builds trust, referrals, and long-term success. However, ethical agents may sometimes receive less commission on individual transactions by putting client interests first.',
      options: JSON.stringify(['A) Increased referrals', 'B) Repeat business', 'C) Long-term success', 'D) Always receiving higher commissions']),
      sequence: 5,
    },
  ]);

  // Hour 2 Quiz
  const hour2QuizId = uuidv4();
  await db.insert(practiceExams).values({
    id: hour2QuizId,
    courseId: COURSE_2_ID,
    title: 'Hour 2 Quiz: Advertising Standards',
    description: 'Test your knowledge of advertising compliance and fair housing in marketing.',
    totalQuestions: 5,
    passingScore: 70,
    isActive: 1,
    isFinalExam: 0,
  });

  await db.insert(examQuestions).values([
    {
      examId: hour2QuizId,
      questionText: 'What must all real estate advertising include according to Florida law?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'All advertising must include the name of the brokerage firm as registered with DBPR, applying to all media.',
      options: JSON.stringify(['A) The sales associate\'s personal phone number', 'B) The name of the brokerage firm', 'C) The MLS number only', 'D) The property address only']),
      sequence: 1,
    },
    {
      examId: hour2QuizId,
      questionText: 'An advertisement states "Perfect starter home for young professionals." What is the fair housing concern?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'Language suggesting age preferences, even indirectly, can conflict with fair housing standards.',
      options: JSON.stringify(['A) No concern, the statement describes the property', 'B) The phrase may suggest age-based preference', 'C) Starter homes cannot be advertised', 'D) Only established neighborhoods can be marketed']),
      sequence: 2,
    },
    {
      examId: hour2QuizId,
      questionText: 'Which of the following is NOT a protected class under federal fair housing law?',
      questionType: 'multiple_choice',
      correctAnswer: 'D',
      explanation: 'Federal fair housing law protects race, color, religion, national origin, sex, familial status, and disability. Occupation is not a protected class.',
      options: JSON.stringify(['A) Race', 'B) Familial status', 'C) Disability', 'D) Occupation']),
      sequence: 3,
    },
    {
      examId: hour2QuizId,
      questionText: 'What is the best practice for advertising to avoid fair housing violations?',
      questionType: 'multiple_choice',
      correctAnswer: 'A',
      explanation: 'The safest approach is to focus strictly on property features rather than characteristics of potential buyers.',
      options: JSON.stringify(['A) Focus on property features, not characteristics of potential buyers', 'B) Use neighborhood descriptions that suggest community demographics', 'C) Target ads to specific demographic groups', 'D) Include photos showing only certain types of people']),
      sequence: 4,
    },
    {
      examId: hour2QuizId,
      questionText: 'A team markets as "The Premier Properties Team" without including their brokerage name. What is the problem?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'Professional identification requires that the licensed firm name appear so consumers understand who they are dealing with.',
      options: JSON.stringify(['A) No problem, the team name is sufficient', 'B) Consumers must know they are dealing with a licensed firm', 'C) Team names are not allowed in advertising', 'D) This is only a problem for large offices']),
      sequence: 5,
    },
  ]);

  // Hour 3 Quiz
  const hour3QuizId = uuidv4();
  await db.insert(practiceExams).values({
    id: hour3QuizId,
    courseId: COURSE_2_ID,
    title: 'Hour 3 Quiz: Commission Disputes',
    description: 'Test your understanding of commission disputes and professional cooperation.',
    totalQuestions: 5,
    passingScore: 70,
    isActive: 1,
    isFinalExam: 0,
  });

  await db.insert(examQuestions).values([
    {
      examId: hour3QuizId,
      questionText: 'The "but for" test in procuring cause asks:',
      questionType: 'multiple_choice',
      correctAnswer: 'C',
      explanation: 'The "but for" test determines whether, without the broker\'s efforts, the sale would have occurred.',
      options: JSON.stringify(['A) Whether the broker "bought" the property first', 'B) Whether the parties like the broker', 'C) Whether, without the broker\'s efforts, the sale would have occurred', 'D) Which broker received payment first']),
      sequence: 1,
    },
    {
      examId: hour3QuizId,
      questionText: 'What is the appropriate first step when a commission dispute arises between two brokers?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'The professional approach begins with documentation and direct discussion before escalating.',
      options: JSON.stringify(['A) File litigation immediately', 'B) Gather documentation and attempt direct discussion', 'C) Tell clients the other broker is dishonest', 'D) Refuse to work with that broker on future transactions']),
      sequence: 2,
    },
    {
      examId: hour3QuizId,
      questionText: 'Two brokers dispute a commission and both are members of a professional association. Which resolution method is most appropriate?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'Arbitration or association dispute resolution is faster, less expensive, and more professional than litigation.',
      options: JSON.stringify(['A) The listing broker automatically receives all commission', 'B) Pursue arbitration or association dispute resolution', 'C) File a lawsuit immediately in circuit court', 'D) Refuse to cooperate on future transactions']),
      sequence: 3,
    },
    {
      examId: hour3QuizId,
      questionText: 'A broker loses an arbitration decision. What represents professional conduct?',
      questionType: 'multiple_choice',
      correctAnswer: 'C',
      explanation: 'Professional standards require accepting adverse decisions and maintaining relationships despite disagreement.',
      options: JSON.stringify(['A) Post negative comments about the arbitrator on social media', 'B) Badmouth the other broker to mutual clients', 'C) Accept the decision professionally and maintain working relationships', 'D) Refuse to work with that broker on future transactions']),
      sequence: 4,
    },
    {
      examId: hour3QuizId,
      questionText: 'Which factor is NOT typically considered in procuring cause determinations?',
      questionType: 'multiple_choice',
      correctAnswer: 'D',
      explanation: 'Procuring cause focuses on who caused the sale, not personal relationships. Factors include who introduced the property, maintained contact, and conducted negotiations.',
      options: JSON.stringify(['A) Who first introduced the buyer to the property', 'B) Who maintained ongoing contact', 'C) Who conducted negotiations leading to the contract', 'D) Which broker the seller personally prefers']),
      sequence: 5,
    },
  ]);
}

async function seedCourse2FinalExam() {
  // Create the final exam for Course 2
  await db.insert(practiceExams).values({
    id: COURSE_2_FINAL_EXAM_ID,
    courseId: COURSE_2_ID,
    title: 'Course 2 Final Exam: Ethics and Business Practices',
    description: 'Comprehensive 20-question final exam covering all topics in the 3-Hour Ethics and Business Practices course. Passing score: 80% (16/20 correct).',
    totalQuestions: 20,
    passingScore: 80,
    timeLimit: 60,
    isActive: 1,
    isFinalExam: 1,
    examForm: 'A',
  });

  // 20 Final Exam Questions
  const finalExamQuestions = [
    {
      examId: COURSE_2_FINAL_EXAM_ID,
      questionText: 'A licensee follows all Florida statutes and FREC rules but takes an action a client considers ethically questionable. Which statement is most accurate?',
      questionType: 'multiple_choice',
      correctAnswer: 'C',
      explanation: 'Legal compliance is the minimum standard. Ethical conduct often exceeds legal requirements and considers broader principles of fairness and honesty.',
      options: JSON.stringify(['A) If the act is legal, it is automatically ethical.', 'B) Ethics and law are always identical in scope.', 'C) Ethical standards may exceed legal requirements.', 'D) Legal conduct always protects client interests fully.']),
      sequence: 1,
    },
    {
      examId: COURSE_2_FINAL_EXAM_ID,
      questionText: 'A licensee is deciding whether to disclose a past termite issue that was treated. The law does not clearly require disclosure of treated problems. What is the best approach?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'When in doubt, transparency builds trust and is the ethical approach, even when the law may not strictly require disclosure.',
      options: JSON.stringify(['A) Do not disclose because the law is unclear.', 'B) Default to transparency because ethical conduct often exceeds legal minimums.', 'C) Disclose only if the buyer is an inspector.', 'D) Disclose only at closing.']),
      sequence: 2,
    },
    {
      examId: COURSE_2_FINAL_EXAM_ID,
      questionText: 'Which of the following reflects the correct interpretation of "client interests first"?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'Client interests first means the client\'s interests come before the agent\'s own financial interests, requiring honest advice even when it affects commission.',
      options: JSON.stringify(['A) Always maximize commission for yourself first.', 'B) Prioritize the client\'s needs even when it may reduce your commission.', 'C) Only serve clients who pay the highest commissions.', 'D) Never refuse a listing, regardless of ethical concerns.']),
      sequence: 3,
    },
    {
      examId: COURSE_2_FINAL_EXAM_ID,
      questionText: 'Which scenario best illustrates an ethical dilemma?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'An ethical dilemma involves a conflict between values or principles. Knowing about a material defect while feeling pressure to stay silent creates such a conflict.',
      options: JSON.stringify(['A) Following a clear law that all parties agree on.', 'B) Knowing about a material defect but feeling pressure from the seller to stay silent.', 'C) Disclosing information that is required by law.', 'D) Signing a standard listing agreement.']),
      sequence: 4,
    },
    {
      examId: COURSE_2_FINAL_EXAM_ID,
      questionText: 'An agent makes a claim "We are the #1 team in the county!" without any substantiation. What is the likely issue?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'Advertising claims must be accurate and verifiable. Unsubstantiated superlative claims violate truthfulness standards.',
      options: JSON.stringify(['A) The claim is acceptable as promotional language.', 'B) The claim should be substantiated with verifiable data.', 'C) Only the sponsoring broker can make such claims.', 'D) Superlative claims are always permitted in advertising.']),
      sequence: 5,
    },
    {
      examId: COURSE_2_FINAL_EXAM_ID,
      questionText: 'A sales associate posts a listing on social media using only their personal brand name. What is missing?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'All advertising must include the brokerage firm name as registered with DBPR. Personal or team names alone are insufficient.',
      options: JSON.stringify(['A) Nothing, personal brand names are sufficient.', 'B) The sponsoring brokerage firm name.', 'C) The MLS logo.', 'D) The sales associate\'s license number.']),
      sequence: 6,
    },
    {
      examId: COURSE_2_FINAL_EXAM_ID,
      questionText: 'An agent advertises "Award-Winning Agent" with no further detail. What is the concern?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'Claims must be specific, verifiable, and not misleading. Unspecified award claims are vague and potentially deceptive.',
      options: JSON.stringify(['A) Award claims are never acceptable.', 'B) The claim should specify which award, when it was received, and from whom.', 'C) Any agent who has won any award can use this claim.', 'D) Award claims are only acceptable if verified by the local board.']),
      sequence: 7,
    },
    {
      examId: COURSE_2_FINAL_EXAM_ID,
      questionText: 'An advertisement states: "Perfect starter home for young professionals in an emerging neighborhood." What fair housing concern exists?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'Language suggesting age preferences, even indirectly, can conflict with fair housing standards.',
      options: JSON.stringify(['A) No concern; the statement describes the property accurately.', 'B) The phrase "young professionals" may suggest age-based preference.', 'C) Starter homes can only be marketed to young people.', 'D) Only established neighborhoods can use professional marketing.']),
      sequence: 8,
    },
    {
      examId: COURSE_2_FINAL_EXAM_ID,
      questionText: 'A listing agent uses a competitor\'s property photograph in a social media post without attribution or permission. What standards does this violate?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'Using another\'s content without credit violates truthfulness, attribution, and professional conduct standards.',
      options: JSON.stringify(['A) Only copyright law, not professional advertising standards.', 'B) Truthfulness (implying the photo is yours), attribution, and professional conduct.', 'C) No standards if the photo is from a public listing database.', 'D) Only the rule if the competitor complains.']),
      sequence: 9,
    },
    {
      examId: COURSE_2_FINAL_EXAM_ID,
      questionText: 'A broker displays a team name much larger than the sponsoring firm\'s name. What is the issue?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'Professional identification requires the firm name be clearly apparent and not subordinate to team branding.',
      options: JSON.stringify(['A) Team names and firm names have no size requirements.', 'B) The firm name should be equally prominent so affiliation is clear.', 'C) Team names must be smaller than firm names.', 'D) Teams should never use firm names.']),
      sequence: 10,
    },
    {
      examId: COURSE_2_FINAL_EXAM_ID,
      questionText: 'An agent creates testimonials from fabricated customers for use in marketing. What best describes this conduct?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'Fabricating testimonials violates advertising standards, constitutes fraud, and can result in serious discipline.',
      options: JSON.stringify(['A) Acceptable marketing practice to attract clients.', 'B) Violation of advertising standards, fraudulent conduct, and professional ethics.', 'C) Allowed if the testimonials are somewhat realistic.', 'D) Only problematic if discovered by regulators.']),
      sequence: 11,
    },
    {
      examId: COURSE_2_FINAL_EXAM_ID,
      questionText: 'A team marketing as "The Premier Properties Team" fails to include their sponsoring firm\'s name "ABC Realty Inc." in any marketing materials. What is the problem?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'Consumers must know they are dealing with a licensed firm for accountability purposes.',
      options: JSON.stringify(['A) No problem; the team name is more important.', 'B) Consumers must know they are dealing with ABC Realty Inc., a licensed firm.', 'C) Firm names are optional if the team name is well-known.', 'D) This is only a problem for large real estate offices.']),
      sequence: 12,
    },
    {
      examId: COURSE_2_FINAL_EXAM_ID,
      questionText: 'Broker A markets a property and shows it to Buyer B, who indicates no interest. Eight months later, Buyer B contacts Broker C, who represents Buyer B and facilitates an offer. Who is procuring cause?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'Procuring cause belongs to the broker whose efforts directly resulted in the transaction. The time gap and change in representation support Broker C\'s claim.',
      options: JSON.stringify(['A) Broker A, for the initial showing and marketing.', 'B) Broker C, for the active representation that led to the actual offer.', 'C) Both brokers equally.', 'D) The listing broker, regardless of buyer representation.']),
      sequence: 13,
    },
    {
      examId: COURSE_2_FINAL_EXAM_ID,
      questionText: 'Two brokers dispute which one should receive the buyer commission. Both are members of a professional association. Which resolution method is most appropriate?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'Professional dispute resolution through arbitration or association processes is faster, less expensive, and more professional than litigation.',
      options: JSON.stringify(['A) The listing broker automatically receives all commission.', 'B) The brokers should pursue arbitration or association dispute resolution.', 'C) File a lawsuit immediately in circuit court.', 'D) Refuse to cooperate on future transactions as punishment.']),
      sequence: 14,
    },
    {
      examId: COURSE_2_FINAL_EXAM_ID,
      questionText: 'A broker loses an arbitration decision regarding procuring cause. The broker is frustrated with the outcome. What represents professional conduct?',
      questionType: 'multiple_choice',
      correctAnswer: 'C',
      explanation: 'Professional standards require accepting adverse decisions and maintaining relationships despite disagreement.',
      options: JSON.stringify(['A) Post negative comments about the arbitrator on social media.', 'B) Badmouth the other broker to mutual clients.', 'C) Accept the decision professionally and maintain working relationships.', 'D) Refuse to work with that broker on future transactions.']),
      sequence: 15,
    },
    {
      examId: COURSE_2_FINAL_EXAM_ID,
      questionText: 'The "but for" test in procuring cause law asks which question?',
      questionType: 'multiple_choice',
      correctAnswer: 'C',
      explanation: 'The "but for" test determines whether the broker\'s efforts set in motion the chain of events causing the sale to occur.',
      options: JSON.stringify(['A) Whether the broker "bought" the property first.', 'B) Whether the parties like the broker.', 'C) Whether, without the broker\'s efforts, the sale would have occurred.', 'D) Which broker received payment first.']),
      sequence: 16,
    },
    {
      examId: COURSE_2_FINAL_EXAM_ID,
      questionText: 'When a commission dispute arises between two brokers, what is the appropriate first step?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'Professional approach begins with documentation and direct discussion before escalating to formal dispute resolution.',
      options: JSON.stringify(['A) File litigation immediately.', 'B) Gather documentation of involvement and attempt direct discussion.', 'C) Tell clients that the other broker is dishonest.', 'D) Refuse to work with that broker on any future transactions.']),
      sequence: 17,
    },
    {
      examId: COURSE_2_FINAL_EXAM_ID,
      questionText: 'A buyer\'s representation ends with Broker A. The buyer then establishes representation with Broker B and purchases a property. Which broker is likely procuring cause?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'When buyer establishes new representation with Broker B, the prior relationship with Broker A typically ends. Broker B is procuring cause because B\'s efforts directly caused the purchase.',
      options: JSON.stringify(['A) Broker A, because they were first.', 'B) Broker B, because they provided active representation resulting in the purchase.', 'C) Both equally, regardless of timing.', 'D) The listing broker, regardless of buyer representation.']),
      sequence: 18,
    },
    {
      examId: COURSE_2_FINAL_EXAM_ID,
      questionText: 'A referral broker receives a buyer inquiry but provides no representation. Instead, the broker refers the buyer to another broker who represents the buyer through closing. Which broker earns commission?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'The broker who provides representation resulting in the offer and sale earns commission. A referral without representation does not typically generate commission rights.',
      options: JSON.stringify(['A) The referring broker earns commission for the referral.', 'B) The representing broker earns commission for providing actual representation.', 'C) Commissions are split equally regardless of service provided.', 'D) The listing broker retains all commission regardless of other involvement.']),
      sequence: 19,
    },
    {
      examId: COURSE_2_FINAL_EXAM_ID,
      questionText: 'An exclusive buyer representation agreement gives Broker X the right to represent the buyer for all properties from January 1 through March 31. On March 15, the buyer purchases a property with Broker Y\'s assistance. Assuming proper documentation exists, what is the likely outcome?',
      questionType: 'multiple_choice',
      correctAnswer: 'B',
      explanation: 'Exclusive representation agreements grant procuring cause rights throughout the specified period unless properly terminated.',
      options: JSON.stringify(['A) Broker Y earns all commission because the deal closed with them.', 'B) Broker X earns commission because the purchase date falls within the exclusive period.', 'C) Commissions are split equally regardless of the exclusive agreement.', 'D) Neither broker earns commission due to the dispute.']),
      sequence: 20,
    },
  ];

  await db.insert(examQuestions).values(finalExamQuestions);
}

// ========================================
// COURSE 3: 8-HOUR FLORIDA TRANSACTION MASTERY
// ========================================
async function seedCourse3Units() {
  const course3Units = [
    // Module 1: FAR/BAR Contract Deep Dive (Hours 1-2)
    {
      id: COURSE_3_UNIT_IDS[0],
      courseId: COURSE_3_ID,
      unitNumber: 1,
      title: 'Hour 1: Contract Structure and Key Dates',
      description: 'Understand the essential components of the FAR/BAR residential contract, calculate deadlines correctly, and apply "time is of the essence" language.',
      hoursRequired: 1,
      sequence: 1,
    },
    {
      id: COURSE_3_UNIT_IDS[1],
      courseId: COURSE_3_ID,
      unitNumber: 2,
      title: 'Hour 2: Contract Contingencies and Termination Rights',
      description: 'Master contingency management, learn when and how contingencies can be exercised, waived, or allowed to lapse.',
      hoursRequired: 1,
      sequence: 2,
    },
    // Module 2: Disclosure & Inspection Issues (Hours 3-4)
    {
      id: COURSE_3_UNIT_IDS[2],
      courseId: COURSE_3_ID,
      unitNumber: 3,
      title: 'Hour 3: Property Disclosures and Seller Obligations',
      description: 'Understand disclosure requirements, distinguish between patent and latent defects, and learn as-is contract implications.',
      hoursRequired: 1,
      sequence: 3,
    },
    {
      id: COURSE_3_UNIT_IDS[3],
      courseId: COURSE_3_ID,
      unitNumber: 4,
      title: 'Hour 4: The Inspection Process and Repair Requests',
      description: 'Navigate the inspection process, analyze repair request scenarios, and determine when agreement or termination is appropriate.',
      hoursRequired: 1,
      sequence: 4,
    },
    // Module 3: Financing Contingencies & Valuation (Hours 5-6)
    {
      id: COURSE_3_UNIT_IDS[4],
      courseId: COURSE_3_ID,
      unitNumber: 5,
      title: 'Hour 5: Loan Approval and Appraisal Contingencies',
      description: 'Understand the loan approval process, distinguish stages from pre-approval to clear-to-close, and analyze appraisal protections.',
      hoursRequired: 1,
      sequence: 5,
    },
    {
      id: COURSE_3_UNIT_IDS[5],
      courseId: COURSE_3_ID,
      unitNumber: 6,
      title: 'Hour 6: Appraisal Gaps and Loan Conditions',
      description: 'Apply strategies for addressing appraisal gaps, evaluate loan conditions, and communicate financing issues professionally.',
      hoursRequired: 1,
      sequence: 6,
    },
    // Module 4: Closing the Deal & Title Issues (Hours 7-8)
    {
      id: COURSE_3_UNIT_IDS[6],
      courseId: COURSE_3_ID,
      unitNumber: 7,
      title: 'Hour 7: Title Examination and Defect Resolution',
      description: 'Understand title examination, identify common title defects, and interpret key components of a title commitment.',
      hoursRequired: 1,
      sequence: 7,
    },
    {
      id: COURSE_3_UNIT_IDS[7],
      courseId: COURSE_3_ID,
      unitNumber: 8,
      title: 'Hour 8: Closing Procedures and Post-Closing',
      description: 'Navigate closing procedures, understand fund disbursement, and manage post-closing responsibilities.',
      hoursRequired: 1,
      sequence: 8,
    },
  ];

  await db.insert(units).values(course3Units);

  // Lessons for Course 3 (abbreviated for script length - key content included)
  const course3Lessons = [
    // Hour 1: Contract Structure
    {
      unitId: COURSE_3_UNIT_IDS[0],
      lessonNumber: 1,
      title: 'Understanding the FAR/BAR Contract',
      content: `The FAR/BAR contract is the standard form used by many Florida real estate professionals for residential transactions. FAR refers to Florida Realtors; BAR refers to The Florida Bar. Together, their representatives developed and maintain this standardized form.

The contract creates a binding agreement between buyer and seller and defines:
- Property identification and legal description
- Purchase price and financing terms
- Earnest money deposit amount and terms
- All contingencies and their deadlines
- Closing date and possession terms
- Allocation of costs (who pays what)
- Default remedies if either party breaches

Standardization provides consistency and clarity, reduces negotiation time on basic terms, and ensures important issues are addressed.`,
      durationMinutes: 10,
      sequence: 1,
    },
    {
      unitId: COURSE_3_UNIT_IDS[0],
      lessonNumber: 2,
      title: 'The Effective Date and Deadline Calculations',
      content: `The Effective Date is the date the contract becomes binding. It is typically defined as the date the last party signs and delivers the accepted contract.

Why it matters:
- Nearly all deadlines (inspection, appraisal, financing, title, closing) are calculated from the Effective Date
- Misunderstanding the Effective Date leads to missed deadlines and disputes

Example:
Offer signed by buyer: June 1
Counteroffer signed by seller: June 2
Buyer initials and delivers final changes: June 3
Effective Date: June 3

If the inspection period is 10 days, count from June 4 (day after Effective Date). The last day for inspection notice is June 13.

Always check whether deadlines are calendar days or business days. Calendar days include weekends and holidays. Business days typically exclude weekends and federal holidays.`,
      durationMinutes: 10,
      sequence: 2,
    },
    {
      unitId: COURSE_3_UNIT_IDS[0],
      lessonNumber: 3,
      title: '"Time is of the Essence" and Written Notice',
      content: `Many residential contracts include a clause stating that "time is of the essence."

This phrase has a specific legal effect:
- Deadlines become strict and enforceable
- Missing a deadline by even one day can result in loss of the related right

Example:
Effective Date: June 3
Inspection period: 10 days
Deadline: June 13
Buyer sends inspection objection on June 14

Because time is of the essence, the buyer's objection is late. The buyer has waived the inspection contingency and must proceed under existing terms.

Most contingencies require written notice to exercise rights. Common forms of written notice include email, facsimile, and e-signature platforms. Verbal notice is rarely sufficient.

Best practices:
- Confirm how notice may be delivered under the contract
- Send notice early enough to avoid last-minute issues
- Request confirmation of receipt
- Keep copies in the transaction file`,
      durationMinutes: 10,
      sequence: 3,
    },
    // Hour 2: Contingencies
    {
      unitId: COURSE_3_UNIT_IDS[1],
      lessonNumber: 1,
      title: 'The Life Cycle of a Contingency',
      content: `A contingency typically progresses through these stages:

1. Creation – Included in the contract at the time of offer and acceptance
2. Activation – Becomes effective on the Effective Date
3. Exercise or Performance – Buyer or seller takes required actions
4. Waiver – The protected party voluntarily gives up the right
5. Satisfaction – The condition is met
6. Lapse – Deadline passes without proper notice; right may be lost
7. Release/Termination – Party terminates contract due to unsatisfied contingency

Many contingencies (especially financing) require the buyer to use "good-faith" or "diligent" effort. This means:
- Submit complete loan applications promptly
- Provide requested documents to lender in a timely manner
- Avoid making major credit changes that jeopardize approval
- Cooperate fully with underwriting

If a buyer fails to act in good faith, the buyer may lose the right to rely on the contingency.`,
      durationMinutes: 10,
      sequence: 1,
    },
    {
      unitId: COURSE_3_UNIT_IDS[1],
      lessonNumber: 2,
      title: 'Financing and Appraisal Contingencies',
      content: `The financing contingency protects the buyer when purchase depends on obtaining acceptable loan financing.

Key components:
- Loan type (conventional, FHA, VA, etc.)
- Maximum interest rate acceptable to buyer
- Minimum term and maximum payment level
- Approval deadline

Clear to Close vs. Pre-Approval:
Only "clear to close" indicates the buyer is fully ready from the lender's perspective. Pre-approval is not final loan approval.

The appraisal contingency protects the buyer if the property's appraised value is less than the purchase price.

If the appraisal comes in low, options include:
- Seller reduces price to appraised value
- Buyer brings additional cash to closing
- Both compromise: partial price reduction plus added buyer cash
- Parties terminate under appraisal contingency`,
      durationMinutes: 10,
      sequence: 2,
    },
    {
      unitId: COURSE_3_UNIT_IDS[1],
      lessonNumber: 3,
      title: 'Termination Procedures and Earnest Money',
      content: `When a buyer exercises a contingency right to terminate, proper procedure matters.

Key steps:
1. Verify the deadline has not passed
2. Provide written notice as required by the contract
3. Reference the specific contingency being exercised
4. Keep proof of timely delivery
5. Request return of earnest money deposit

If termination is proper under the contingency:
- Earnest money should be returned to the buyer
- Neither party should be in default
- The transaction ends without further obligation

If termination is NOT proper (e.g., deadline passed, no valid contingency):
- The terminating party may be in default
- Earnest money may be at risk
- The other party may have remedies under the contract

Common disputes arise when:
- Parties disagree about whether termination was timely
- Parties disagree about whether contingency conditions were satisfied
- Documentation is unclear or incomplete`,
      durationMinutes: 10,
      sequence: 3,
    },
    // Hours 3-8: Add key lessons for remaining units
    // Hour 3: Disclosures
    {
      unitId: COURSE_3_UNIT_IDS[2],
      lessonNumber: 1,
      title: 'Purpose of Property Disclosures',
      content: `Property disclosures exist to:
- Inform buyers about known issues affecting value, safety, or desirability
- Reduce the risk of post-closing lawsuits for non-disclosure
- Encourage transparency and trust between parties

Sellers and licensees must not misrepresent or conceal known material defects.

A material defect is a condition that significantly affects the property's value, habitability, or desirability. Examples include:
- Chronic roof leaks
- Known structural movement or foundation failure
- Repeated flooding in living areas
- Electrical problems creating fire risk
- Mold affecting indoor air quality
- Termite damage compromising structural integrity

Minor cosmetic issues (small nail holes, worn paint) are usually not material.`,
      durationMinutes: 15,
      sequence: 1,
    },
    {
      unitId: COURSE_3_UNIT_IDS[2],
      lessonNumber: 2,
      title: 'Patent vs. Latent Defects and As-Is Contracts',
      content: `Patent defects: Problems that are reasonably observable upon ordinary inspection (e.g., damaged drywall, obvious cracks, missing fixtures).

Latent defects: Hidden defects not easily discoverable by a reasonably careful visual inspection (e.g., concealed water damage behind walls, foundation issues beneath flooring).

Both patent and latent known material defects must typically be disclosed.

An "as-is" contract means the seller is not agreeing to make repairs or improvements. It does NOT excuse the seller from disclosing known material defects.

Under "as-is":
- Buyer typically has the right to inspect
- Buyer can accept property, attempt to renegotiate, or terminate within the inspection period
- Seller must still disclose known issues

Misunderstanding "as-is" is a major risk. Some sellers mistakenly believe they can hide defects if the home is sold "as-is". This is incorrect and can lead to litigation.`,
      durationMinutes: 15,
      sequence: 2,
    },
    // Hour 4: Inspections
    {
      unitId: COURSE_3_UNIT_IDS[3],
      lessonNumber: 1,
      title: 'Types of Inspections and Reports',
      content: `Buyers may order various inspections:
- General home inspection (overall structure and systems)
- Roof inspection
- Termite/pest inspection
- HVAC inspection
- Plumbing or sewer line inspection
- Septic system inspection
- Well water testing
- Pool/spa inspection
- Specialized mold or radon testing

Inspection reports typically include:
- Photos of observed issues
- Notes on safety concerns
- Assessments of remaining life for systems
- Recommendations for repair, replacement, or further evaluation

Buyers should review reports carefully and consult with inspectors before making repair requests.`,
      durationMinutes: 15,
      sequence: 1,
    },
    {
      unitId: COURSE_3_UNIT_IDS[3],
      lessonNumber: 2,
      title: 'Repair Requests and Negotiations',
      content: `Within the inspection period, buyer can:
- Accept property as-is and proceed
- Request seller repairs or credits
- Terminate (if contract allows)

Best practices for repair requests:
- Be specific about items to be repaired
- Focus on material defects and safety issues
- Provide supporting documentation from inspection reports

Seller response options:
- Agree to all requested repairs
- Agree to some repairs but not others
- Offer a credit at closing
- Decline all repairs

If repairs are agreed upon:
- Work must be completed by a specified date
- Work should be performed by properly licensed professionals
- Buyer should have the right to re-inspect repairs prior to closing`,
      durationMinutes: 15,
      sequence: 2,
    },
    // Hour 5: Loan Approval
    {
      unitId: COURSE_3_UNIT_IDS[4],
      lessonNumber: 1,
      title: 'Loan Approval Stages',
      content: `Understanding the stages of loan approval:

Pre-Qualification – Informal review of buyer's income, debts, and credit to estimate borrowing capacity.

Pre-Approval – More detailed; lender may review documentation and run credit, but not a full underwrite.

Conditional Approval – Underwriter issues approval subject to conditions (e.g., appraisal, additional documents).

Clear to Close – All conditions are satisfied; loan is ready to fund.

Only clear to close indicates the buyer is fully ready from the lender's perspective.

Common underwriting conditions:
- Verification of employment and income
- Updated bank statements
- Satisfactory appraisal
- Completion of required repairs
- Acceptable title commitment`,
      durationMinutes: 15,
      sequence: 1,
    },
    {
      unitId: COURSE_3_UNIT_IDS[4],
      lessonNumber: 2,
      title: 'Appraisal Basics and Contingency Protection',
      content: `Appraisers estimate market value by examining:
- Recent comparable sales (comps)
- Adjustments for differences in size, age, upgrades, and location
- Market conditions and trends

The appraised value heavily influences the maximum loan amount.

An appraisal contingency allows the buyer to:
- Renegotiate price if appraisal is lower than purchase price
- Terminate contract and recover earnest money if seller will not adjust and buyer cannot bring additional cash

Without such a contingency (or with a waiver), buyer may have to proceed regardless of the appraisal result, subject to lender approval.

If the appraisal contingency deadline passes without action, the contingency is often deemed satisfied or waived.`,
      durationMinutes: 15,
      sequence: 2,
    },
    // Hour 6: Appraisal Gaps
    {
      unitId: COURSE_3_UNIT_IDS[5],
      lessonNumber: 1,
      title: 'Handling Appraisal Gaps',
      content: `When a property appraises low, consider:
- Buyer's available cash reserves
- Seller's willingness to adjust price
- Market conditions (e.g., multiple-offer situations)

Possible solutions:
1. Seller reduces price to appraised value
2. Buyer brings additional cash to closing to preserve the contract price
3. Both compromise: partial price reduction plus added buyer cash
4. Seller provides credit toward closing costs so buyer can redirect cash
5. Parties terminate under appraisal contingency (if applicable)
6. Request reconsideration of value if comparable sales support higher value`,
      durationMinutes: 15,
      sequence: 1,
    },
    {
      unitId: COURSE_3_UNIT_IDS[5],
      lessonNumber: 2,
      title: 'Loan Condition Management',
      content: `Some lender conditions are simple (e.g., updated pay stub). Others are complex (e.g., resolving large unexplained deposits).

Agents should:
- Encourage buyers to be proactive
- Ask lenders early if any conditions seem hard to meet
- Monitor whether conditions can reasonably be cleared by closing

If conditions cannot be met by closing date:
- Parties might agree to extend closing
- If extension isn't possible, termination under financing contingency may occur (if buyer acted in good faith)

Communication best practices:
- Request specific status updates from lenders
- Clarify conditions and deadlines
- Manage expectations and reduce surprises`,
      durationMinutes: 15,
      sequence: 2,
    },
    // Hour 7: Title Issues
    {
      unitId: COURSE_3_UNIT_IDS[6],
      lessonNumber: 1,
      title: 'What is Title and Title Examination',
      content: `"Title" refers to legal ownership of property and the associated rights. Clear title means ownership is not subject to undisclosed or unacceptable claims.

Title examiners review:
- Deeds in the chain of title
- Liens (mortgages, judgments, tax liens)
- Easements and rights of way
- Restrictions and covenants
- Court records for potential claims

The result is a title commitment, stating conditions for issuing a title insurance policy.

Common sections of a title commitment:
- Schedule A – Basic information: proposed insured, policy amount, current owner, legal description
- Schedule B-I – Requirements to be met before issuing policy
- Schedule B-II – Exceptions: Items that will not be covered by insurance`,
      durationMinutes: 15,
      sequence: 1,
    },
    {
      unitId: COURSE_3_UNIT_IDS[6],
      lessonNumber: 2,
      title: 'Common Title Defects and Resolution',
      content: `Examples of common title defects:
- Unreleased prior mortgage
- Judgment liens against seller
- Unpaid property taxes or assessments
- Easements that restrict use in unexpected ways
- Missing heirs or questions about prior deeds

Most defects can be cured by:
- Paying off liens
- Obtaining releases or satisfactions
- Correcting deed errors with corrective deeds
- Obtaining court orders or affidavits when necessary

If defects cannot be cured within a reasonable time and the contract allows, buyer may have the right to terminate.

Title insurance protects against losses from covered title defects discovered after closing.`,
      durationMinutes: 15,
      sequence: 2,
    },
    // Hour 8: Closing Procedures
    {
      unitId: COURSE_3_UNIT_IDS[7],
      lessonNumber: 1,
      title: 'Closing Day Procedures',
      content: `Closing is when ownership transfers and the transaction is finalized.

Before closing:
- Final walkthrough to verify property condition
- Review closing disclosure for accuracy
- Confirm wire instructions directly with the title company

At closing:
- Sign all required documents
- Provide identification as required
- Deliver certified funds or wire transfer

The closing agent (often a title company or attorney) will:
- Collect and disburse all funds
- Record the deed
- Issue title insurance policies
- Distribute closing documents to all parties`,
      durationMinutes: 15,
      sequence: 1,
    },
    {
      unitId: COURSE_3_UNIT_IDS[7],
      lessonNumber: 2,
      title: 'Post-Closing Responsibilities',
      content: `After closing, several tasks remain:

For the buyer:
- Transfer utilities to their name
- File homestead exemption if applicable
- Change locks and security codes
- Update address with relevant parties

For the seller:
- Cancel utilities and redirect mail
- Keep copies of closing documents
- Maintain records for tax purposes

For the agents:
- Provide copies of all documents to clients
- Ensure all commission payments are properly distributed
- Maintain transaction files as required by law
- Follow up with clients for feedback and referrals

Record retention:
Florida law requires brokers to maintain transaction records for at least five years. This includes contracts, disclosures, correspondence, and financial records.`,
      durationMinutes: 15,
      sequence: 2,
    },
  ];

  await db.insert(lessons).values(course3Lessons);

  // Create unit quizzes for Course 3
  await seedCourse3Quizzes();
}

async function seedCourse3Quizzes() {
  // Create quizzes for each hour of Course 3
  const quizData = [
    {
      title: 'Hour 1 Quiz: Contract Structure and Key Dates',
      description: 'Test your knowledge of FAR/BAR contract components and deadline calculations.',
      unitIndex: 0,
      questions: [
        {
          questionText: 'An Effective Date is June 3. The inspection period is 10 calendar days. What is the last day the buyer can provide written notice of inspection issues?',
          correctAnswer: 'B',
          explanation: 'Count 10 days starting the day after the Effective Date: June 4–June 13. Deadline is June 13.',
          options: ['A) June 12', 'B) June 13', 'C) June 14', 'D) June 15'],
        },
        {
          questionText: 'A contract states "time is of the essence" for all dates. The buyer\'s inspection period ends on June 11. The buyer emails the inspection objection on June 12. What is the result?',
          correctAnswer: 'B',
          explanation: 'When time is of the essence, deadlines are strict. Missing the inspection deadline by even one day may waive the contingency.',
          options: ['A) The notice is valid because one day late is minor.', 'B) The notice is invalid; the buyer has waived the inspection contingency.', 'C) The seller must accept the late notice.', 'D) The parties must renegotiate a new deadline.'],
        },
        {
          questionText: 'Why is the Effective Date so important in a residential contract?',
          correctAnswer: 'B',
          explanation: 'Most key deadlines (inspection, appraisal, financing, etc.) are calculated from the Effective Date.',
          options: ['A) It determines when the seller must move out.', 'B) It sets the starting point for calculating most contractual deadlines.', 'C) It determines which title company is used.', 'D) It is only used for financing purposes.'],
        },
        {
          questionText: 'Which form of notice is generally sufficient to exercise contingency rights?',
          correctAnswer: 'B',
          explanation: 'Contracts typically require written notice within the applicable deadline to exercise contingency rights.',
          options: ['A) A verbal phone call.', 'B) Written notice delivered within the specified time period.', 'C) A text message with no confirmation.', 'D) A handshake agreement.'],
        },
        {
          questionText: 'What does the FAR/BAR contract standardization provide?',
          correctAnswer: 'C',
          explanation: 'Standardization provides consistency and clarity, reduces negotiation time on basic terms, and ensures important issues are addressed.',
          options: ['A) Guaranteed sale price', 'B) Automatic financing approval', 'C) Consistency, clarity, and coverage of important issues', 'D) Elimination of all negotiation'],
        },
      ],
    },
    {
      title: 'Hour 2 Quiz: Contract Contingencies and Termination',
      description: 'Test your understanding of contingency management and termination procedures.',
      unitIndex: 1,
      questions: [
        {
          questionText: 'Which of the following is NOT a stage in the life cycle of a contingency?',
          correctAnswer: 'D',
          explanation: 'The stages are: Creation, Activation, Exercise/Performance, Waiver, Satisfaction, Lapse, and Release/Termination. "Negotiation" is not a formal contingency stage.',
          options: ['A) Activation', 'B) Waiver', 'C) Satisfaction', 'D) Negotiation'],
        },
        {
          questionText: 'What does "good-faith effort" require in a financing contingency?',
          correctAnswer: 'B',
          explanation: 'Good faith requires the buyer to submit applications promptly, provide documents timely, avoid major credit changes, and cooperate fully.',
          options: ['A) The buyer must find the lowest interest rate available.', 'B) The buyer must cooperate with the lender and avoid actions that jeopardize approval.', 'C) The lender must approve the loan regardless of buyer qualifications.', 'D) The seller must help the buyer qualify.'],
        },
        {
          questionText: 'What does "Clear to Close" mean in the loan approval process?',
          correctAnswer: 'D',
          explanation: 'Clear to Close means all underwriting conditions are satisfied and the loan is ready to fund.',
          options: ['A) The buyer has started the loan application.', 'B) The buyer has been pre-qualified.', 'C) The lender has issued conditional approval.', 'D) All conditions are satisfied and the loan is ready to fund.'],
        },
        {
          questionText: 'If the appraisal comes in $20,000 below the purchase price, which is NOT a typical resolution option?',
          correctAnswer: 'D',
          explanation: 'The lender will not ignore the appraisal. Options include price reduction, buyer bringing cash, or termination under appraisal contingency.',
          options: ['A) Seller reduces price to appraised value.', 'B) Buyer brings additional cash to closing.', 'C) Parties terminate under appraisal contingency.', 'D) Lender ignores the appraisal and uses contract price.'],
        },
        {
          questionText: 'If a buyer fails to act in good faith on a financing contingency, what is the likely result?',
          correctAnswer: 'B',
          explanation: 'If a buyer fails to act in good faith, the buyer may lose the right to rely on the contingency to escape the contract.',
          options: ['A) The financing contingency automatically extends.', 'B) The buyer may lose the right to rely on the contingency.', 'C) The seller must find alternative financing for the buyer.', 'D) The lender becomes responsible for the buyer\'s actions.'],
        },
      ],
    },
    {
      title: 'Hour 3 Quiz: Property Disclosures',
      description: 'Test your knowledge of disclosure requirements and seller obligations.',
      unitIndex: 2,
      questions: [
        {
          questionText: 'A seller knows that the basement has flooded twice in the last three years. The water stains have been painted over. Is this information material?',
          correctAnswer: 'B',
          explanation: 'Repeated flooding is a classic example of a material defect that must be disclosed.',
          options: ['A) No, because the floods did not happen this year.', 'B) Yes, because repeated flooding can affect value and desirability.', 'C) No, because the damage was painted over.', 'D) Only if the buyer asks directly about flooding.'],
        },
        {
          questionText: 'Which best describes a latent defect?',
          correctAnswer: 'C',
          explanation: 'Latent defects are hidden issues not readily observable during a normal visual inspection.',
          options: ['A) A broken window easily seen when touring.', 'B) A missing door knob that any buyer would notice.', 'C) An interior wall concealing long-term water damage.', 'D) A dirty carpet in a bedroom.'],
        },
        {
          questionText: 'Under an "as-is" contract, what is most accurate regarding disclosure?',
          correctAnswer: 'B',
          explanation: 'As-is contracts do not remove the obligation to disclose known material defects.',
          options: ['A) Sellers do not need to disclose defects because the property is as-is.', 'B) Sellers must still disclose known material defects.', 'C) Only cosmetic issues must be disclosed.', 'D) As-is contracts transfer all risk including fraud.'],
        },
        {
          questionText: 'A listing agent knows of a serious foundation issue but the seller asks not to mention it. What should the agent do?',
          correctAnswer: 'C',
          explanation: 'Licensees must not participate in concealment of known material defects.',
          options: ['A) Agree and stay silent to preserve the listing.', 'B) Respect the seller\'s wishes because the agent represents the seller.', 'C) Refuse to conceal the defect and insist it be disclosed.', 'D) Only mention it if the buyer hires a structural engineer.'],
        },
        {
          questionText: 'Which condition is least likely to be a material defect?',
          correctAnswer: 'A',
          explanation: 'Minor cosmetic issues typically are not material, whereas issues affecting safety, structure, or functionality usually are.',
          options: ['A) A minor scratch on a bathroom mirror.', 'B) Termite damage affecting structural beams.', 'C) Repeated roof leaks above the kitchen.', 'D) Non-functioning main electrical panel.'],
        },
      ],
    },
    {
      title: 'Hour 4 Quiz: Inspection Process',
      description: 'Test your understanding of inspections and repair negotiations.',
      unitIndex: 3,
      questions: [
        {
          questionText: 'A buyer\'s inspection reveals a loose doorknob, a burned-out light bulb, and an active roof leak. Which item is most appropriate to prioritize in a repair request?',
          correctAnswer: 'C',
          explanation: 'Active roof leaks are serious, material issues that should be prioritized over minor cosmetic items.',
          options: ['A) Loose doorknob only.', 'B) Burned-out light bulb only.', 'C) The active roof leak.', 'D) None; all are minor issues.'],
        },
        {
          questionText: 'A buyer submits a repair request two days after the inspection deadline. What is the likely status?',
          correctAnswer: 'B',
          explanation: 'If the contract requires repair requests by a specific deadline, late requests may be ineffective and the contingency deemed waived.',
          options: ['A) Still open, because timing is flexible.', 'B) Waived, because the buyer missed the deadline.', 'C) Automatically extended by three days.', 'D) Converted into a financing contingency.'],
        },
        {
          questionText: 'A seller agrees to provide a $3,000 credit in lieu of repairs. How should this be documented?',
          correctAnswer: 'B',
          explanation: 'All modifications to contract terms, including repair credits, should be documented in a signed written addendum.',
          options: ['A) Verbal agreement between agents is enough.', 'B) In a written addendum to the contract.', 'C) A separate side letter not shared with the lender.', 'D) A casual email with no signature.'],
        },
        {
          questionText: 'When is the best time for a buyer to verify that agreed repairs have been properly completed?',
          correctAnswer: 'B',
          explanation: 'Final walkthrough gives the buyer a last opportunity before closing to confirm repairs are complete.',
          options: ['A) After closing.', 'B) During the final walkthrough before closing.', 'C) At the time of initial inspection only.', 'D) When picking up the keys from the listing agent.'],
        },
        {
          questionText: 'A seller refuses all repair requests but remains willing to close. If the contract allows, what can the buyer do?',
          correctAnswer: 'D',
          explanation: 'Buyer\'s options depend on contract language and whether the inspection period remains open.',
          options: ['A) Accept the property as-is and proceed.', 'B) Attempt to renegotiate again.', 'C) Terminate and recover earnest money if within inspection period.', 'D) Any of the above, depending on the contract and timing.'],
        },
      ],
    },
    {
      title: 'Hour 5 Quiz: Loan Approval and Appraisal',
      description: 'Test your knowledge of loan stages and appraisal contingencies.',
      unitIndex: 4,
      questions: [
        {
          questionText: 'Which stage indicates that a loan is fully ready to fund and close?',
          correctAnswer: 'D',
          explanation: 'Clear to close means all conditions have been met and the lender is ready to fund.',
          options: ['A) Pre-qualification', 'B) Pre-approval', 'C) Conditional approval', 'D) Clear to close'],
        },
        {
          questionText: 'Which factor is least likely to be directly considered by an appraiser when determining value?',
          correctAnswer: 'C',
          explanation: 'Appraisers consider objective market data, not the buyer\'s personal feelings.',
          options: ['A) Recent comparable sales.', 'B) Property condition and upgrades.', 'C) Buyer\'s emotional attachment to the home.', 'D) Location and neighborhood characteristics.'],
        },
        {
          questionText: 'A buyer\'s contract includes an appraisal contingency. The home appraises $25,000 below contract price. What is one option for the buyer?',
          correctAnswer: 'B',
          explanation: 'Price renegotiation or compromise is a common response to an appraisal gap.',
          options: ['A) Insist the lender use the contract price.', 'B) Ask the seller to reduce the price or negotiate a compromise.', 'C) Cancel the appraisal.', 'D) Demand the appraiser increase the value.'],
        },
        {
          questionText: 'An appraisal contingency deadline passes, and the buyer has not requested any changes. What is the likely consequence?',
          correctAnswer: 'B',
          explanation: 'When deadlines pass without action, contingencies are often deemed satisfied or waived.',
          options: ['A) The contingency is automatically extended.', 'B) The contingency is likely waived.', 'C) The appraiser must redo the appraisal.', 'D) The seller must reduce the price.'],
        },
        {
          questionText: 'A buyer wants to rely on the financing contingency to terminate, but the denial letter shows the buyer purchased a new car a week before closing. What is the likely outcome?',
          correctAnswer: 'B',
          explanation: 'Buyers must act in good faith and not undermine their own ability to qualify.',
          options: ['A) Buyer is fully protected regardless.', 'B) Buyer may not be protected because their own actions contributed to denial.', 'C) Lender must ignore new debt.', 'D) Seller must automatically refund earnest money.'],
        },
      ],
    },
    {
      title: 'Hour 6 Quiz: Appraisal Gaps and Loan Conditions',
      description: 'Test your understanding of appraisal gap solutions and loan condition management.',
      unitIndex: 5,
      questions: [
        {
          questionText: 'A property appraises $15,000 below contract price. Buyer has extra savings and still wants the home. Which is a possible solution?',
          correctAnswer: 'A',
          explanation: 'Buyer can use extra cash to bridge the gap if willing and able.',
          options: ['A) Buyer increases down payment to cover the gap.', 'B) Seller cancels the appraisal.', 'C) Lender ignores the appraised value.', 'D) Agent rewrites the appraisal.'],
        },
        {
          questionText: 'A lender condition requires proof that a large recent deposit came from an acceptable source. The buyer cannot provide documentation. What is the potential impact?',
          correctAnswer: 'B',
          explanation: 'Large unexplained deposits can cause underwriting concerns and may delay or prevent approval.',
          options: ['A) No impact, lenders do not care about sources.', 'B) Loan approval could be delayed or denied.', 'C) The condition automatically disappears at closing.', 'D) Seller must provide the documentation.'],
        },
        {
          questionText: 'What communication practice is best when working with lenders?',
          correctAnswer: 'C',
          explanation: 'Clear, specific communication helps manage expectations and reduce surprises.',
          options: ['A) Avoid discussing timelines with lenders.', 'B) Request vague updates and relay them to clients.', 'C) Ask for specific status updates and clarify conditions and deadlines.', 'D) Only contact the lender on the day of closing.'],
        },
        {
          questionText: 'A buyer\'s loan cannot be approved by the agreed closing date despite good-faith efforts. What might the parties do to preserve the deal?',
          correctAnswer: 'B',
          explanation: 'An extension, if mutually agreed upon in writing, can allow time for loan approval.',
          options: ['A) Automatically cancel the transaction.', 'B) Agree in writing to extend the closing date.', 'C) Force the lender to close on time.', 'D) Ignore the lender\'s concerns and close anyway.'],
        },
        {
          questionText: 'Who should ultimately decide whether to proceed with a transaction when appraisal or loan issues arise?',
          correctAnswer: 'C',
          explanation: 'Agents and lenders provide information and guidance, but the parties themselves must decide.',
          options: ['A) Only the real estate agents.', 'B) Only the lender.', 'C) The buyer and seller, after receiving advice from their professionals.', 'D) The title company.'],
        },
      ],
    },
    {
      title: 'Hour 7 Quiz: Title Examination',
      description: 'Test your knowledge of title examination and defect resolution.',
      unitIndex: 6,
      questions: [
        {
          questionText: 'Which document outlines conditions under which a title insurer will issue a title insurance policy?',
          correctAnswer: 'C',
          explanation: 'The title commitment describes requirements and exceptions relevant to issuance of a title policy.',
          options: ['A) Deed', 'B) Mortgage', 'C) Title commitment', 'D) Closing disclosure'],
        },
        {
          questionText: 'A prior mortgage from years ago still appears as an unreleased lien. How is this typically resolved?',
          correctAnswer: 'B',
          explanation: 'Old mortgages must be properly released of record to clear title.',
          options: ['A) Ignored if the mortgage is old.', 'B) Seller or title company obtains a release and records it.', 'C) Buyer assumes the loan.', 'D) Agents sign an affidavit instead.'],
        },
        {
          questionText: 'Which section of the title commitment lists items that will NOT be covered by the title insurance policy?',
          correctAnswer: 'C',
          explanation: 'Schedule B-II identifies exceptions that remain after closing and are not insured over.',
          options: ['A) Schedule A', 'B) Schedule B-I (Requirements)', 'C) Schedule B-II (Exceptions)', 'D) Legal Description'],
        },
        {
          questionText: 'Why is clear title important to a buyer?',
          correctAnswer: 'B',
          explanation: 'Clear title ensures the buyer is getting ownership free from undisclosed claims.',
          options: ['A) It guarantees the property will appreciate.', 'B) It ensures ownership without undisclosed claims.', 'C) It eliminates the need for inspections.', 'D) It guarantees low property taxes.'],
        },
        {
          questionText: 'Which of the following is NOT a common title defect?',
          correctAnswer: 'D',
          explanation: 'Seasonal landscaping changes are not title defects. Title defects involve ownership claims, liens, or encumbrances.',
          options: ['A) Unreleased prior mortgage.', 'B) Judgment liens against seller.', 'C) Unpaid property taxes.', 'D) Seasonal landscaping changes.'],
        },
      ],
    },
    {
      title: 'Hour 8 Quiz: Closing Procedures',
      description: 'Test your understanding of closing and post-closing responsibilities.',
      unitIndex: 7,
      questions: [
        {
          questionText: 'What is the primary purpose of the final walkthrough before closing?',
          correctAnswer: 'B',
          explanation: 'The final walkthrough is the buyer\'s last opportunity to verify property condition matches the agreement.',
          options: ['A) To negotiate a lower price.', 'B) To verify property condition and agreed repairs are complete.', 'C) To sign closing documents.', 'D) To meet the neighbors.'],
        },
        {
          questionText: 'Who typically handles the collection and disbursement of all funds at closing?',
          correctAnswer: 'C',
          explanation: 'The closing agent (often a title company or attorney) collects and disburses all funds.',
          options: ['A) The buyer\'s agent.', 'B) The seller\'s agent.', 'C) The closing agent (title company or attorney).', 'D) The lender directly.'],
        },
        {
          questionText: 'How long must Florida brokers maintain transaction records?',
          correctAnswer: 'C',
          explanation: 'Florida law requires brokers to maintain transaction records for at least five years.',
          options: ['A) One year', 'B) Three years', 'C) Five years', 'D) Seven years'],
        },
        {
          questionText: 'Which of the following is a buyer\'s responsibility after closing?',
          correctAnswer: 'B',
          explanation: 'Buyers should file for homestead exemption if applicable to receive property tax benefits.',
          options: ['A) Pay the seller\'s remaining mortgage.', 'B) File homestead exemption if applicable.', 'C) Cancel the seller\'s utilities.', 'D) Maintain the seller\'s transaction files.'],
        },
        {
          questionText: 'What should you do before wiring funds based on instructions received via email?',
          correctAnswer: 'D',
          explanation: 'Wire fraud is a serious risk. Always confirm wire instructions directly with the title company using a known phone number.',
          options: ['A) Wire immediately to avoid delays.', 'B) Ask your agent to handle it.', 'C) Wait until after closing to send funds.', 'D) Confirm wire instructions directly with the title company by phone.'],
        },
      ],
    },
  ];

  for (const quiz of quizData) {
    const quizId = uuidv4();
    await db.insert(practiceExams).values({
      id: quizId,
      courseId: COURSE_3_ID,
      title: quiz.title,
      description: quiz.description,
      totalQuestions: 5,
      passingScore: 70,
      isActive: 1,
      isFinalExam: 0,
    });

    const questions = quiz.questions.map((q, index) => ({
      examId: quizId,
      questionText: q.questionText,
      questionType: 'multiple_choice' as const,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      options: JSON.stringify(q.options),
      sequence: index + 1,
    }));

    await db.insert(examQuestions).values(questions);
  }
}

// Run if executed directly
const isMain = process.argv[1] && fileURLToPath(import.meta.url).includes(process.argv[1].replace(/\.ts$/, ''));

if (isMain) {
  seed14HourCE()
    .then(() => {
      console.log('\n✅ Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seed failed:', error);
      process.exit(1);
    });
}
