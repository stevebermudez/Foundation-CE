import { db } from "./db";
import { courses, practiceExams, examQuestions } from "@shared/schema";

export async function seedFRECIPrelicensing() {
  try {
    console.log("Seeding FREC I - Florida Sales Associate Prelicensing (63 hours)...");

    // Create main course
    const courseResult = await db
      .insert(courses)
      .values({
        title: "Florida Sales Associate Prelicensing (FREC I)",
        description:
          "Complete 63-hour pre-licensing course for Florida real estate sales associates. Includes 60 hours of instruction across 19 units covering real estate law, practices, contracts, mortgages, and state regulations. Final 3-hour cumulative exam. Prepares for Florida real estate license exam.",
        productType: "RealEstate",
        state: "FL",
        licenseType: "Sales Associate",
        requirementCycleType: "Post-Licensing",
        requirementBucket: "Post-Licensing Mandatory",
        hoursRequired: 63,
        deliveryMethod: "Self-Paced Online",
        price: 5999, // $59.99
        sku: "FL-RE-PL-SA-FRECI-63",
        renewalApplicable: 0,
      })
      .returning();

    const course = courseResult[0];
    console.log(`Created course: ${course.id}`);

    // Unit quiz definitions (19 units, 20 questions each)
    const units = [
      { number: 1, title: "The Real Estate Business" },
      { number: 2, title: "Real Estate License Law and Qualifications for Licensure" },
      { number: 3, title: "Real Estate License Law and Commission Rules" },
      { number: 4, title: "Authorized Relationships, Duties and Disclosure" },
      { number: 5, title: "Real Estate Brokerage Activities and Procedures" },
      { number: 6, title: "Violations of License Law, Penalties and Procedures" },
      { number: 7, title: "Federal and State Laws Pertaining to Real Estate" },
      { number: 8, title: "Property Rights, Estates and Tenancies; Condos, Co-ops, CDDs, HOAs, Time Sharing" },
      { number: 9, title: "Title, Deeds and Ownership Restrictions" },
      { number: 10, title: "Legal Descriptions" },
      { number: 11, title: "Real Estate Contracts" },
      { number: 12, title: "Residential Mortgages" },
      { number: 13, title: "Types of Mortgages and Sources of Financing" },
      { number: 14, title: "Real Estate Related Computations and Closing of Transactions" },
      { number: 15, title: "The Real Estate Markets and Analysis" },
      { number: 16, title: "Real Estate Appraisal" },
      { number: 17, title: "Real Estate Investments and Business Opportunity Brokerage" },
      { number: 18, title: "Taxes Affecting Real Estate" },
      { number: 19, title: "Planning and Zoning" },
    ];

    // Create unit quizzes
    const unitExams = [];
    for (const unit of units) {
      const examResult = await db
        .insert(practiceExams)
        .values({
          courseId: course.id,
          title: `Unit ${unit.number} Quiz: ${unit.title}`,
          description: `20-question quiz covering Unit ${unit.number}: ${unit.title}`,
          totalQuestions: 20,
          passingScore: 70,
          isActive: 1,
        })
        .returning();
      unitExams.push(examResult[0]);
    }
    console.log(`Created ${unitExams.length} unit quizzes`);

    // Create final exam
    const finalExamResult = await db
      .insert(practiceExams)
      .values({
        courseId: course.id,
        title: "FREC I Final Exam",
        description: "Comprehensive 100-question final exam covering all 19 units of the course",
        totalQuestions: 100,
        passingScore: 70,
        isActive: 1,
      })
      .returning();
    const finalExam = finalExamResult[0];
    console.log(`Created final exam: ${finalExam.id}`);

    // Sample questions for Unit 1 (from user's document)
    const unit1Questions = [
      {
        text: "The primary 'product' that a real estate sales associate offers to the public is",
        options: [
          "A. financing at below-market interest rates",
          "B. expert information on property transfer, markets, and marketing",
          "C. the legal right to draft deeds for customers",
          "D. construction management services",
        ],
        correctAnswer: "B",
        explanation:
          "The sales associate's primary product is expert information. They help buyers and sellers understand property values, market conditions, contract terms, and associated risks.",
      },
      {
        text: "A sales associate who specializes in listing and selling income-producing office buildings and shopping centers is most likely working in",
        options: ["A. industrial sales", "B. agricultural sales", "C. residential sales", "D. commercial sales"],
        correctAnswer: "D",
        explanation:
          "Commercial real estate includes office buildings, shopping centers, and other income-producing commercial properties.",
      },
      {
        text: "A property manager's main responsibility is to",
        options: [
          "A. obtain the highest possible selling price for the property",
          "B. protect the owner's investment and maximize the owner's return",
          "C. originate mortgage loans for tenants",
          "D. represent tenants in eviction proceedings",
        ],
        correctAnswer: "B",
        explanation:
          "Property managers are hired to protect and maximize the owner's return on their real estate investment.",
      },
      {
        text: "Which statement regarding a comparative market analysis (CMA) is accurate",
        options: [
          "A. A CMA must comply with USPAP and can only be prepared by a state-certified appraiser",
          "B. A CMA is a type of federally regulated appraisal",
          "C. A CMA estimates probable selling price using recent comparable sales",
          "D. A CMA may be described to the public as an appraisal",
        ],
        correctAnswer: "C",
        explanation:
          "A CMA is an analysis that estimates probable selling price using recent comparable sales. Unlike appraisals, CMAs do not require USPAP compliance and do not need to be prepared by certified appraisers.",
      },
      {
        text: "USPAP primarily sets standards for",
        options: [
          "A. property management agreements",
          "B. real estate license law enforcement",
          "C. ethical advertising practices",
          "D. appraisal practice and appraiser ethics",
        ],
        correctAnswer: "D",
        explanation:
          "USPAP (Uniform Standards of Professional Appraisal Practice) sets standards for appraisal practice and requires appraisers to follow ethical guidelines.",
      },
      {
        text: "A sales associate is asked by a customer to 'do an appraisal' on the customer's house. The sales associate prepares a detailed CMA. To comply with Florida law, the sales associate should",
        options: [
          "A. advertise the CMA as a certified residential appraisal",
          "B. clearly identify the work product as a CMA, not an appraisal",
          "C. sign the report as a state-certified appraiser",
          "D. charge the same fee that a state-certified appraiser would charge",
        ],
        correctAnswer: "B",
        explanation:
          "Sales associates must clearly distinguish between a CMA and an appraisal. Representing a CMA as an appraisal would be a violation of Florida law.",
      },
      {
        text: "Which type of residential construction involves building homes on a large scale using model homes and standardized plans",
        options: [
          "A. Custom homes",
          "B. Spec homes",
          "C. Tract homes",
          "D. Modular homes",
        ],
        correctAnswer: "C",
        explanation:
          "Tract homes are built on a large scale using standardized plans and model homes, allowing for efficient production and consistent pricing.",
      },
      {
        text: "A developer purchases raw land, records a subdivision plat map, installs streets and utilities, then sells improved lots to builders. This process is called",
        options: [
          "A. assemblage",
          "B. subdivision and development",
          "C. dedication",
          "D. condemnation",
        ],
        correctAnswer: "B",
        explanation:
          "Subdivision and development involves purchasing raw land, recording the plat map, installing infrastructure, and selling improved lots.",
      },
      {
        text: "Dedication occurs when",
        options: [
          "A. a seller dedicates a property to charity for tax benefits",
          "B. a government agency takes land through eminent domain",
          "C. a developer transfers streets or parks to a governmental body for public use",
          "D. a lender records a mortgage in the public records",
        ],
        correctAnswer: "C",
        explanation:
          "Dedication is the process where a developer transfers streets, parks, or other land to a government entity for public use.",
      },
      {
        text: "A real estate professional who specializes in analyzing existing or potential projects and providing advice to investors is primarily engaged in",
        options: [
          "A. counseling",
          "B. industrial sales",
          "C. property management",
          "D. title insurance",
        ],
        correctAnswer: "A",
        explanation:
          "Real estate counselors specialize in analyzing projects and providing advice to investors about real estate decisions.",
      },
      {
        text: "The five major sales specialties in real estate are residential, commercial, industrial, agricultural, and",
        options: [
          "A. property management",
          "B. business opportunity brokerage",
          "C. appraisal",
          "D. mortgage brokerage",
        ],
        correctAnswer: "B",
        explanation:
          "The five major sales specialties recognized in Florida real estate are residential, commercial, industrial, agricultural, and business opportunity brokerage.",
      },
      {
        text: "Which of the following is NOT a role or function in the real estate industry",
        options: [
          "A. Licensed sales associate",
          "B. Mortgage originator",
          "C. Title insurer",
          "D. Building architect",
        ],
        correctAnswer: "D",
        explanation:
          "While architects design buildings, they are not typically considered part of the real estate sales and transaction industry. The other roles directly facilitate real estate transactions.",
      },
      {
        text: "A broker who oversees a sales office with multiple agents is responsible for",
        options: [
          "A. ensuring agents comply with license law and firm policies",
          "B. personally closing every transaction",
          "C. negotiating all contracts on behalf of clients",
          "D. setting all listing and selling prices",
        ],
        correctAnswer: "A",
        explanation:
          "Brokers supervise their sales offices, ensuring agents comply with license law, firm policies, and ethical standards.",
      },
      {
        text: "When a sales associate lists a property, they are primarily acting as a",
        options: [
          "A. principal",
          "B. fiduciary",
          "C. appraiser",
          "D. lender",
        ],
        correctAnswer: "B",
        explanation:
          "When listing a property, the sales associate acts as a fiduciary, owing duties of loyalty and care to their client.",
      },
      {
        text: "The real estate market's size and health significantly impact which other industries",
        options: [
          "A. construction, mortgage lending, and title insurance",
          "B. agriculture only",
          "C. government services only",
          "D. hospitality and entertainment only",
        ],
        correctAnswer: "A",
        explanation:
          "Real estate activity affects numerous related industries including construction, mortgage lending, title insurance, and many support services.",
      },
      {
        text: "A buyer's agent represents the buyer's interests and owes them",
        options: [
          "A. no special duties",
          "B. fiduciary duties of loyalty, care, and disclosure",
          "C. only a duty to find a property",
          "D. duties only after closing",
        ],
        correctAnswer: "B",
        explanation:
          "A buyer's agent is a fiduciary who owes the buyer duties of loyalty, care, confidentiality, and disclosure.",
      },
      {
        text: "Real estate professionals benefit their clients by providing",
        options: [
          "A. access to properties for free",
          "B. guaranteed financing",
          "C. expert knowledge accumulated through repeated transactions",
          "D. legal representation in court",
        ],
        correctAnswer: "C",
        explanation:
          "The value proposition of real estate professionals is their expert knowledge gained through handling many transactions—knowledge most consumers lack.",
      },
      {
        text: "Which of the following best describes the relationship between property values and neighborhood demand",
        options: [
          "A. property values always increase",
          "B. demand affects market conditions and property values",
          "C. property values are set by the government",
          "D. neighborhood demand has no effect on value",
        ],
        correctAnswer: "B",
        explanation:
          "Property values are driven by supply and demand. Neighborhoods with high demand typically have higher property values.",
      },
      {
        text: "A broker who maintains a trust account must",
        options: [
          "A. commingle client funds with personal funds",
          "B. maintain detailed records of all deposits and withdrawals",
          "C. use client funds for personal expenses temporarily",
          "D. place funds in a personal bank account",
        ],
        correctAnswer: "B",
        explanation:
          "Brokers must maintain meticulous records of all trust account activity to ensure accountability and protect client funds.",
      },
    ];

    // Add Unit 1 questions to the first unit quiz
    let sequenceNum = 0;
    for (const q of unit1Questions) {
      await db.insert(examQuestions).values({
        examId: unitExams[0].id,
        questionText: q.text,
        questionType: "multiple_choice",
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        options: JSON.stringify(q.options),
        sequence: sequenceNum++,
      });
    }
    console.log(`Added ${unit1Questions.length} sample questions to Unit 1 Quiz`);

    // Add placeholder questions for remaining units and final exam
    // Unit 2-19: Add basic structure (can be expanded later)
    for (let i = 1; i < units.length; i++) {
      for (let j = 0; j < 20; j++) {
        await db.insert(examQuestions).values({
          examId: unitExams[i].id,
          questionText: `Unit ${units[i].number} Question ${j + 1}: [Content to be added for ${units[i].title}]`,
          questionType: "multiple_choice",
          correctAnswer: "A",
          explanation: "This question requires detailed content from the course materials.",
          options: JSON.stringify([
            "A. Option 1",
            "B. Option 2",
            "C. Option 3",
            "D. Option 4",
          ]),
          sequence: j,
        });
      }
    }
    console.log(`Added placeholder questions for Units 2-19 (20 questions each)`);

    // Add 100 sample questions to final exam
    for (let i = 0; i < 100; i++) {
      const sectionNum = Math.floor(i / 5) + 1;
      await db.insert(examQuestions).values({
        examId: finalExam.id,
        questionText: `Final Exam Question ${i + 1}: [Comprehensive content covering multiple units]`,
        questionType: "multiple_choice",
        correctAnswer: "A",
        explanation: "This question requires review of course materials across multiple units.",
        options: JSON.stringify([
          "A. Correct answer option",
          "B. Plausible distractor",
          "C. Plausible distractor",
          "D. Plausible distractor",
        ]),
        sequence: i,
      });
    }
    console.log(`Added 100 placeholder questions to final exam`);

    console.log("✓ Successfully seeded FREC I Prelicensing course");
  } catch (error) {
    console.error("Error seeding FREC I course:", error);
    throw error;
  }
}
