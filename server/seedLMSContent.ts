import { db } from "./db";
import { courses, units, lessons, questionBanks, bankQuestions } from "@shared/schema";
import { eq } from "drizzle-orm";
import { getLessonContent } from "./lessonContent";

export async function seedLMSContent() {
  try {
    console.log("Seeding LMS content for FREC I course...");

    // Get the existing FREC I course
    const courseResult = await db
      .select()
      .from(courses)
      .where(eq(courses.sku, "FL-RE-PL-SA-FRECI-63"))
      .limit(1);

    if (courseResult.length === 0) {
      console.log("FREC I course not found. Please run seedFRECIPrelicensing first.");
      return;
    }

    const course = courseResult[0];
    console.log(`Found course: ${course.id}`);

    // Check if units already exist
    const existingUnits = await db.select().from(units).where(eq(units.courseId, course.id)).limit(1);
    if (existingUnits.length > 0) {
      console.log("LMS content already seeded");
      return;
    }

    // Unit definitions with detailed descriptions
    const unitDefs = [
      { 
        number: 1, 
        title: "The Real Estate Business",
        description: "Introduction to the real estate industry, types of properties, roles of professionals, and the value of real estate services.",
        hours: 3
      },
      { 
        number: 2, 
        title: "Real Estate License Law and Qualifications for Licensure",
        description: "Florida real estate licensing requirements, DBPR authority, application process, and qualifications for sales associates and brokers.",
        hours: 3
      },
      { 
        number: 3, 
        title: "Real Estate License Law and Commission Rules",
        description: "FREC powers and duties, administrative procedures, rule-making authority, and enforcement mechanisms.",
        hours: 3
      },
      { 
        number: 4, 
        title: "Authorized Relationships, Duties and Disclosure",
        description: "Agency relationships, fiduciary duties, transaction brokerage, disclosure requirements, and dual agency.",
        hours: 4
      },
      { 
        number: 5, 
        title: "Real Estate Brokerage Activities and Procedures",
        description: "Office operations, trust accounts, escrow procedures, record keeping, and advertising requirements.",
        hours: 3
      },
      { 
        number: 6, 
        title: "Violations of License Law, Penalties and Procedures",
        description: "Disciplinary actions, license violations, penalties, recovery fund, and hearing procedures.",
        hours: 3
      },
      { 
        number: 7, 
        title: "Federal and State Laws Pertaining to Real Estate",
        description: "Fair housing laws, ADA compliance, antitrust regulations, and environmental laws affecting real estate.",
        hours: 4
      },
      { 
        number: 8, 
        title: "Property Rights, Estates and Tenancies",
        description: "Bundle of rights, freehold and leasehold estates, condos, co-ops, CDDs, HOAs, and time sharing.",
        hours: 4
      },
      { 
        number: 9, 
        title: "Title, Deeds and Ownership Restrictions",
        description: "Types of deeds, title transfer, recording laws, title insurance, easements, and liens.",
        hours: 3
      },
      { 
        number: 10, 
        title: "Legal Descriptions",
        description: "Metes and bounds, rectangular survey, lot and block, and interpreting property legal descriptions.",
        hours: 3
      },
      { 
        number: 11, 
        title: "Real Estate Contracts",
        description: "Contract essentials, purchase agreements, listing agreements, options, and contract remedies.",
        hours: 4
      },
      { 
        number: 12, 
        title: "Residential Mortgages",
        description: "Mortgage concepts, promissory notes, mortgage instruments, foreclosure, and loan calculations.",
        hours: 3
      },
      { 
        number: 13, 
        title: "Types of Mortgages and Sources of Financing",
        description: "Conventional, FHA, VA loans, creative financing, and secondary mortgage markets.",
        hours: 3
      },
      { 
        number: 14, 
        title: "Real Estate Related Computations and Closing",
        description: "Proration calculations, settlement statements, closing costs, and RESPA requirements.",
        hours: 4
      },
      { 
        number: 15, 
        title: "The Real Estate Markets and Analysis",
        description: "Supply and demand, market cycles, economic factors, and comparative market analysis.",
        hours: 3
      },
      { 
        number: 16, 
        title: "Real Estate Appraisal",
        description: "Appraisal approaches, value principles, USPAP standards, and appraisal process.",
        hours: 3
      },
      { 
        number: 17, 
        title: "Real Estate Investments and Business Opportunity Brokerage",
        description: "Investment analysis, ROI calculations, business brokerage, and investment properties.",
        hours: 3
      },
      { 
        number: 18, 
        title: "Taxes Affecting Real Estate",
        description: "Property taxes, special assessments, tax liens, capital gains, and tax-deferred exchanges.",
        hours: 3
      },
      { 
        number: 19, 
        title: "Planning and Zoning",
        description: "Land use controls, zoning regulations, comprehensive plans, variances, and environmental regulations.",
        hours: 3
      },
    ];

    // Create units
    const createdUnits: any[] = [];
    for (const unitDef of unitDefs) {
      const unitResult = await db
        .insert(units)
        .values({
          courseId: course.id,
          unitNumber: unitDef.number,
          title: unitDef.title,
          description: unitDef.description,
          hoursRequired: unitDef.hours,
          sequence: unitDef.number,
        })
        .returning();
      createdUnits.push(unitResult[0]);
    }
    console.log(`Created ${createdUnits.length} units`);

    // Create lessons for each unit (3-4 lessons per unit)
    for (const unit of createdUnits) {
      const lessonCount = unit.hoursRequired >= 4 ? 4 : 3;
      const lessonTopics = getLessonTopics(unit.unitNumber, lessonCount);
      
      for (let i = 0; i < lessonCount; i++) {
        await db.insert(lessons).values({
          unitId: unit.id,
          lessonNumber: i + 1,
          title: lessonTopics[i],
          content: getLessonContent(unit.unitNumber, i + 1),
          durationMinutes: Math.floor((unit.hoursRequired * 60) / lessonCount),
          sequence: i + 1,
        });
      }
    }
    console.log(`Created lessons for all units`);

    // Create question banks for each unit
    for (const unit of createdUnits) {
      const bankResult = await db
        .insert(questionBanks)
        .values({
          courseId: course.id,
          unitId: unit.id,
          bankType: "unit_quiz",
          title: `Unit ${unit.unitNumber} Quiz: ${unit.title}`,
          description: `Test your knowledge of Unit ${unit.unitNumber}`,
          questionsPerAttempt: 10, // 10 random questions from bank of 20+
          passingScore: 70,
          isActive: 1,
        })
        .returning();

      // Add questions to the bank
      const questions = getUnitQuestions(unit.unitNumber);
      for (const q of questions) {
        await db.insert(bankQuestions).values({
          bankId: bankResult[0].id,
          questionText: q.text,
          questionType: "multiple_choice",
          options: JSON.stringify(q.options),
          correctOption: q.correctOption,
          explanation: q.explanation,
          difficulty: "medium",
          isActive: 1,
        });
      }
    }
    console.log(`Created question banks for all units`);

    // Create final exam question bank
    const finalBankResult = await db
      .insert(questionBanks)
      .values({
        courseId: course.id,
        unitId: null,
        bankType: "final_exam",
        title: "FREC I Final Exam",
        description: "Comprehensive 100-question final exam covering all 19 units",
        questionsPerAttempt: 100,
        passingScore: 70,
        timeLimit: 180, // 3 hours
        isActive: 1,
      })
      .returning();

    // Add final exam questions (sample from all units)
    const finalQuestions = getFinalExamQuestions();
    for (const q of finalQuestions) {
      await db.insert(bankQuestions).values({
        bankId: finalBankResult[0].id,
        questionText: q.text,
        questionType: "multiple_choice",
        options: JSON.stringify(q.options),
        correctOption: q.correctOption,
        explanation: q.explanation,
        difficulty: q.difficulty || "medium",
        isActive: 1,
      });
    }
    console.log(`Created final exam question bank with ${finalQuestions.length} questions`);

    console.log("LMS content seeding complete!");
  } catch (error) {
    console.error("Error seeding LMS content:", error);
    throw error;
  }
}

function getLessonTopics(unitNumber: number, lessonCount: number): string[] {
  const topicsByUnit: Record<number, string[]> = {
    1: ["Introduction to Real Estate", "Types of Real Estate Properties", "Roles in the Real Estate Industry", "Value of Professional Services"],
    2: ["DBPR and License Requirements", "Application Process", "Education and Exam Requirements", "Qualifications for Licensure"],
    3: ["FREC Authority and Duties", "Administrative Rules", "License Categories", "Renewal and Education"],
    4: ["Agency Relationships Explained", "Fiduciary Duties", "Transaction Brokerage", "Disclosure Requirements"],
    5: ["Office Operations", "Trust Account Management", "Escrow Procedures", "Advertising Compliance"],
    6: ["License Law Violations", "Disciplinary Process", "Penalties and Sanctions", "Recovery Fund"],
    7: ["Fair Housing Act", "ADA Requirements", "Antitrust Laws", "Environmental Regulations"],
    8: ["Property Rights Overview", "Freehold Estates", "Condos and Co-ops", "HOAs and Time Sharing"],
    9: ["Types of Deeds", "Title Transfer Process", "Title Insurance"],
    10: ["Metes and Bounds", "Rectangular Survey System", "Lot and Block"],
    11: ["Contract Essentials", "Purchase Agreements", "Listing Contracts", "Contract Remedies"],
    12: ["Mortgage Basics", "Promissory Notes", "Mortgage Instruments"],
    13: ["Conventional Loans", "Government Loans", "Creative Financing"],
    14: ["Proration Calculations", "Settlement Statements", "Closing Procedures", "RESPA Requirements"],
    15: ["Market Supply and Demand", "Market Cycles", "Comparative Market Analysis"],
    16: ["Appraisal Approaches", "Value Principles", "USPAP Standards"],
    17: ["Investment Analysis", "ROI Calculations", "Business Brokerage"],
    18: ["Property Taxes", "Special Assessments", "Tax Liens"],
    19: ["Zoning Regulations", "Land Use Controls", "Comprehensive Planning"],
  };
  
  return topicsByUnit[unitNumber]?.slice(0, lessonCount) || 
    Array.from({ length: lessonCount }, (_, i) => `Lesson ${i + 1}`);
}


function getUnitQuestions(unitNumber: number): Array<{
  text: string;
  options: string[];
  correctOption: number;
  explanation: string;
}> {
  // Sample questions for each unit - in production, these would be loaded from a content database
  const questionsByUnit: Record<number, Array<{
    text: string;
    options: string[];
    correctOption: number;
    explanation: string;
  }>> = {
    1: [
      {
        text: "The primary 'product' that a real estate sales associate offers to the public is",
        options: [
          "financing at below-market interest rates",
          "expert information on property transfer, markets, and marketing",
          "the legal right to draft deeds for customers",
          "construction management services"
        ],
        correctOption: 1,
        explanation: "The sales associate's primary product is expert information. They help buyers and sellers understand property values, market conditions, contract terms, and associated risks."
      },
      {
        text: "A sales associate who specializes in listing and selling income-producing office buildings and shopping centers is most likely working in",
        options: ["industrial sales", "agricultural sales", "residential sales", "commercial sales"],
        correctOption: 3,
        explanation: "Commercial real estate includes office buildings, shopping centers, and other income-producing commercial properties."
      },
      {
        text: "A property manager's main responsibility is to",
        options: [
          "obtain the highest possible selling price for the property",
          "protect the owner's investment and maximize the owner's return",
          "originate mortgage loans for tenants",
          "represent tenants in eviction proceedings"
        ],
        correctOption: 1,
        explanation: "Property managers are hired to protect and maximize the owner's return on their real estate investment."
      },
      {
        text: "Which statement regarding a comparative market analysis (CMA) is accurate",
        options: [
          "A CMA must comply with USPAP and can only be prepared by a state-certified appraiser",
          "A CMA is a type of federally regulated appraisal",
          "A CMA estimates probable selling price using recent comparable sales",
          "A CMA may be described to the public as an appraisal"
        ],
        correctOption: 2,
        explanation: "A CMA is an analysis that estimates probable selling price using recent comparable sales."
      },
      {
        text: "USPAP primarily sets standards for",
        options: [
          "property management agreements",
          "real estate license law enforcement",
          "ethical advertising practices",
          "appraisal practice and appraiser ethics"
        ],
        correctOption: 3,
        explanation: "USPAP (Uniform Standards of Professional Appraisal Practice) sets standards for appraisal practice and requires appraisers to follow ethical guidelines."
      },
      {
        text: "Which type of residential construction involves building homes on a large scale using model homes and standardized plans",
        options: ["Custom homes", "Spec homes", "Tract homes", "Modular homes"],
        correctOption: 2,
        explanation: "Tract homes are built on a large scale using standardized plans and model homes."
      },
      {
        text: "A developer purchases raw land, records a subdivision plat map, installs streets and utilities, then sells improved lots to builders. This process is called",
        options: ["assemblage", "subdivision and development", "dedication", "condemnation"],
        correctOption: 1,
        explanation: "Subdivision and development involves purchasing raw land, recording the plat map, installing infrastructure, and selling improved lots."
      },
      {
        text: "Dedication occurs when",
        options: [
          "a seller dedicates a property to charity for tax benefits",
          "a government agency takes land through eminent domain",
          "a developer transfers streets or parks to a governmental body for public use",
          "a lender records a mortgage in the public records"
        ],
        correctOption: 2,
        explanation: "Dedication is the process where a developer transfers streets, parks, or other land to a government entity for public use."
      },
      {
        text: "A real estate professional who specializes in analyzing existing or potential projects and providing advice to investors is primarily engaged in",
        options: ["counseling", "industrial sales", "property management", "title insurance"],
        correctOption: 0,
        explanation: "Real estate counselors specialize in analyzing projects and providing advice to investors."
      },
      {
        text: "The five major sales specialties in real estate are residential, commercial, industrial, agricultural, and",
        options: ["property management", "business opportunity brokerage", "appraisal", "mortgage brokerage"],
        correctOption: 1,
        explanation: "The five major sales specialties are residential, commercial, industrial, agricultural, and business opportunity brokerage."
      },
      {
        text: "Which of the following is NOT a role or function in the real estate industry",
        options: ["Licensed sales associate", "Mortgage originator", "Title insurer", "Building architect"],
        correctOption: 3,
        explanation: "While architects design buildings, they are not typically considered part of the real estate sales and transaction industry."
      },
      {
        text: "A broker who oversees a sales office with multiple agents is responsible for",
        options: [
          "ensuring agents comply with license law and firm policies",
          "personally closing every transaction",
          "negotiating all contracts on behalf of clients",
          "setting all listing and selling prices"
        ],
        correctOption: 0,
        explanation: "Brokers supervise their sales offices, ensuring agents comply with license law and ethical standards."
      },
      {
        text: "When a sales associate lists a property, they are primarily acting as a",
        options: ["principal", "fiduciary", "appraiser", "lender"],
        correctOption: 1,
        explanation: "When listing a property, the sales associate acts as a fiduciary, owing duties to their client."
      },
      {
        text: "A buyer's agent represents the buyer's interests and owes them",
        options: [
          "no special duties",
          "fiduciary duties of loyalty, care, and disclosure",
          "only a duty to find a property",
          "duties only after closing"
        ],
        correctOption: 1,
        explanation: "A buyer's agent is a fiduciary who owes the buyer duties of loyalty, care, and disclosure."
      },
      {
        text: "Real estate professionals benefit their clients by providing",
        options: [
          "access to properties for free",
          "guaranteed financing",
          "expert knowledge accumulated through repeated transactions",
          "legal representation in court"
        ],
        correctOption: 2,
        explanation: "Real estate professionals provide expert knowledge gained through handling many transactions."
      },
      {
        text: "Which of the following best describes the relationship between property values and neighborhood demand",
        options: [
          "property values always increase",
          "demand affects market conditions and property values",
          "property values are set by the government",
          "neighborhood demand has no effect on value"
        ],
        correctOption: 1,
        explanation: "Property values are driven by supply and demand. Neighborhoods with high demand typically have higher values."
      },
      {
        text: "A broker who maintains a trust account must",
        options: [
          "commingle client funds with personal funds",
          "maintain detailed records of all deposits and withdrawals",
          "use client funds for personal expenses temporarily",
          "place funds in a personal bank account"
        ],
        correctOption: 1,
        explanation: "Brokers must maintain meticulous records of all trust account activity."
      },
      {
        text: "The real estate market's size and health significantly impact which other industries",
        options: [
          "construction, mortgage lending, and title insurance",
          "agriculture only",
          "government services only",
          "hospitality and entertainment only"
        ],
        correctOption: 0,
        explanation: "Real estate activity affects numerous related industries including construction, mortgage lending, and title insurance."
      },
      {
        text: "A sales associate may perform which of the following activities",
        options: [
          "operate independently without broker supervision",
          "negotiate sales under broker supervision",
          "collect rent directly without disclosing it to the broker",
          "sign contracts on behalf of the broker without authorization"
        ],
        correctOption: 1,
        explanation: "Sales associates must work under broker supervision and negotiate sales accordingly."
      },
      {
        text: "Real estate investment counseling typically involves",
        options: [
          "managing day-to-day property operations",
          "providing expert advice on real estate investments",
          "selling insurance products",
          "appraising commercial properties"
        ],
        correctOption: 1,
        explanation: "Investment counselors provide expert advice on real estate investment opportunities."
      }
    ],
    2: [
      {
        text: "The primary purpose of Florida real estate license law is to",
        options: [
          "increase the income of real estate licensees",
          "protect the public by regulating real estate brokers and sales associates",
          "create a standard form of real estate contract",
          "regulate interest rates charged on real estate loans"
        ],
        correctOption: 1,
        explanation: "The guiding purpose behind Florida's licensing system is consumer protection."
      },
      {
        text: "Which state agency is responsible for licensing and regulating real estate professionals in Florida",
        options: [
          "Department of Financial Services",
          "Department of Business and Professional Regulation",
          "Department of State",
          "Real Estate Recovery Fund"
        ],
        correctOption: 1,
        explanation: "DBPR is the umbrella agency responsible for licensing real estate professionals in Florida."
      },
      {
        text: "Which entity provides administrative support specifically for the Florida Real Estate Commission",
        options: [
          "Division of Professions",
          "Division of Real Estate",
          "Florida Supreme Court",
          "Attorney General"
        ],
        correctOption: 1,
        explanation: "The Division of Real Estate (DRE) provides administrative support and coordinates the examination process."
      },
      {
        text: "Which Florida statute chapter primarily contains the real estate license law",
        options: ["Chapter 20", "Chapter 120", "Chapter 455", "Chapter 475"],
        correctOption: 3,
        explanation: "Chapter 475, Florida Statutes, is the primary real estate license law."
      },
      {
        text: "Which of the following is a basic qualification for a Florida sales associate license",
        options: [
          "United States citizenship",
          "Florida residency",
          "High school diploma or equivalent",
          "College degree in real estate"
        ],
        correctOption: 2,
        explanation: "A high school diploma or equivalent is a basic qualification for licensure."
      },
      {
        text: "A sales associate applicant was convicted of a misdemeanor 5 years ago. On the license application, the applicant must",
        options: [
          "omit the information because it is older than 3 years",
          "disclose only felonies, not misdemeanors",
          "disclose the offense if asked on the application",
          "wait until the conviction is expunged"
        ],
        correctOption: 2,
        explanation: "Applicants must disclose all arrests, charges, or convictions when asked."
      },
      {
        text: "Failure to disclose a prior criminal conviction on a license application",
        options: [
          "is acceptable if the conviction was sealed",
          "may be grounds for denial of the application",
          "has no effect if the applicant passes the exam",
          "is required under privacy laws"
        ],
        correctOption: 1,
        explanation: "Failure to disclose is often worse than the underlying offense and may result in denial."
      },
      {
        text: "A broker holds a broker license but chooses to work under another broker as an associate. This licensee is a",
        options: ["sales associate", "owner developer", "broker associate", "registered assistant"],
        correctOption: 2,
        explanation: "A broker associate has a broker license but works under another broker's supervision."
      },
      {
        text: "Registration refers to",
        options: [
          "the legal authorization to practice real estate",
          "placing the licensee's name and address on the records of DBPR",
          "automatic renewal of a license",
          "the post licensing education process"
        ],
        correctOption: 1,
        explanation: "Registration is placement on official records. Licensure grants the authority to practice."
      },
      {
        text: "Which of the following is a requirement common to both broker and sales associate applicants",
        options: [
          "United States citizenship",
          "Minimum of two years of college",
          "Fingerprint based background check",
          "At least two years of real estate experience"
        ],
        correctOption: 2,
        explanation: "Both broker and sales associate applicants must undergo fingerprint-based background checks."
      },
      {
        text: "Mutual recognition agreements allow",
        options: [
          "Florida residents to bypass pre license education",
          "nonresident licensees from certain states to obtain a Florida license with reduced requirements",
          "foreign nationals to practice without a Social Security number",
          "any out of state licensee to practice in Florida without a license"
        ],
        correctOption: 1,
        explanation: "Mutual recognition allows nonresident licensees from certain states to obtain Florida licenses with reduced requirements."
      },
      {
        text: "Which activity requires a real estate license when performed for another and for compensation",
        options: [
          "Paying a mortgage payment for a relative",
          "Giving a friend a free estimate of value",
          "Advertising and negotiating the sale of property for a commission",
          "Building a home as a licensed contractor"
        ],
        correctOption: 2,
        explanation: "Advertising and negotiating sales for compensation requires a real estate license."
      },
      {
        text: "Which person is required to hold an active real estate license",
        options: [
          "A salaried employee who leases units in a single building with no bonus",
          "An individual paid a fee to market and sell another person's home",
          "An attorney who drafts a contract as part of legal representation",
          "A person who sells their own property"
        ],
        correctOption: 1,
        explanation: "A person paid to market and sell another's property must be licensed."
      },
      {
        text: "Which of the following is typically exempt from real estate licensure",
        options: [
          "A sales associate who works for two brokers",
          "A property management firm that charges commission",
          "A partner selling partnership property receiving profit share",
          "A person who finds tenants for a fee per tenant"
        ],
        correctOption: 2,
        explanation: "Partners acting within partnership scope are typically exempt from licensure requirements."
      },
      {
        text: "Sales associates who receive compensation for performing real estate services without holding a license are",
        options: [
          "not in violation if they work under an owner",
          "in violation of Florida license law and may face penalties",
          "permitted if they work under an owner",
          "subject only to civil penalties"
        ],
        correctOption: 1,
        explanation: "Practicing without a license is a violation that may result in penalties."
      },
      {
        text: "The education requirement for a Florida sales associate license includes",
        options: [
          "72 hours of FREC Course II",
          "45 hours of post-licensing before taking the exam",
          "63 hours of pre-licensing education (FREC I)",
          "14 hours of continuing education before initial licensure"
        ],
        correctOption: 2,
        explanation: "Sales associate applicants must complete the 63-hour FREC I pre-licensing course."
      },
      {
        text: "A license applicant must be how old to obtain a Florida real estate license",
        options: ["16 years old", "18 years old", "21 years old", "25 years old"],
        correctOption: 1,
        explanation: "Applicants must be at least 18 years of age to obtain a Florida real estate license."
      },
      {
        text: "Good moral character for license applicants is determined by",
        options: [
          "the applicant's employer",
          "the Florida Real Estate Commission",
          "the local police department",
          "the applicant's references"
        ],
        correctOption: 1,
        explanation: "FREC determines whether applicants meet the good moral character requirement."
      },
      {
        text: "Which of the following is NOT a requirement for obtaining a Florida sales associate license",
        options: [
          "Pass the state licensing examination",
          "Complete required pre-licensing education",
          "Be at least 21 years of age",
          "Have a Social Security number"
        ],
        correctOption: 2,
        explanation: "The age requirement is 18, not 21. All other options are requirements."
      },
      {
        text: "An active license status means the licensee",
        options: [
          "has completed post-licensing education",
          "is authorized to practice real estate",
          "has been licensed for at least one year",
          "is working full-time as a sales associate"
        ],
        correctOption: 1,
        explanation: "Active status means the licensee is authorized to practice real estate."
      }
    ],
    // Add more questions for other units as needed
  };

  // Default questions for units without specific questions
  const defaultQuestions = Array.from({ length: 25 }, (_, i) => ({
    text: `Sample question ${i + 1} for this unit covering key concepts and terminology.`,
    options: [
      "Option A - First possible answer",
      "Option B - Second possible answer",
      "Option C - Third possible answer",
      "Option D - Fourth possible answer"
    ],
    correctOption: i % 4,
    explanation: `This is the explanation for question ${i + 1}. The correct answer demonstrates understanding of the material.`
  }));

  return questionsByUnit[unitNumber] || defaultQuestions;
}

function getFinalExamQuestions(): Array<{
  text: string;
  options: string[];
  correctOption: number;
  explanation: string;
  difficulty?: string;
}> {
  // Comprehensive final exam questions pulling from all units
  return [
    {
      text: "The primary purpose of Florida real estate license law is to",
      options: [
        "increase the income of real estate licensees",
        "protect the public by regulating real estate brokers and sales associates",
        "create a standard form of real estate contract",
        "regulate interest rates"
      ],
      correctOption: 1,
      explanation: "Consumer protection is the primary purpose of real estate license law.",
      difficulty: "easy"
    },
    {
      text: "A broker's fiduciary duties include all of the following EXCEPT",
      options: [
        "loyalty to the client",
        "confidentiality of client information",
        "disclosure of material facts",
        "guaranteeing the sale of the property"
      ],
      correctOption: 3,
      explanation: "Brokers cannot guarantee a sale. Fiduciary duties include loyalty, confidentiality, and disclosure.",
      difficulty: "medium"
    },
    {
      text: "Which type of estate provides the highest degree of ownership",
      options: [
        "Fee simple absolute",
        "Life estate",
        "Estate for years",
        "Estate at will"
      ],
      correctOption: 0,
      explanation: "Fee simple absolute provides the most complete form of ownership with unlimited duration.",
      difficulty: "medium"
    },
    {
      text: "A metes and bounds legal description typically begins at the",
      options: [
        "principal meridian",
        "point of beginning",
        "baseline",
        "section corner"
      ],
      correctOption: 1,
      explanation: "Metes and bounds descriptions start and return to a point of beginning.",
      difficulty: "medium"
    },
    {
      text: "The Fair Housing Act prohibits discrimination based on all EXCEPT",
      options: [
        "race",
        "religion",
        "marital status",
        "national origin"
      ],
      correctOption: 2,
      explanation: "Federal Fair Housing Act does not include marital status as a protected class.",
      difficulty: "hard"
    },
    {
      text: "An easement appurtenant requires",
      options: [
        "a dominant and servient estate",
        "a written lease agreement",
        "government approval",
        "payment of annual fees"
      ],
      correctOption: 0,
      explanation: "Easement appurtenant involves two properties: dominant (benefiting) and servient (burdened).",
      difficulty: "medium"
    },
    {
      text: "The loan-to-value ratio is calculated by",
      options: [
        "dividing the loan amount by the property value",
        "multiplying the loan amount by the interest rate",
        "dividing the property value by the loan amount",
        "subtracting the down payment from the value"
      ],
      correctOption: 0,
      explanation: "LTV = Loan Amount / Property Value x 100",
      difficulty: "easy"
    },
    {
      text: "RESPA requires disclosure of",
      options: [
        "property defects",
        "settlement costs",
        "zoning violations",
        "environmental hazards"
      ],
      correctOption: 1,
      explanation: "RESPA requires disclosure of settlement costs to borrowers.",
      difficulty: "medium"
    },
    {
      text: "The cost approach to value is most appropriate for",
      options: [
        "residential properties",
        "income properties",
        "special-purpose properties",
        "vacant land"
      ],
      correctOption: 2,
      explanation: "Cost approach is best for special-purpose properties with limited comparable sales.",
      difficulty: "medium"
    },
    {
      text: "Ad valorem taxes are based on",
      options: [
        "income generated by property",
        "assessed value of property",
        "size of the property",
        "age of the property"
      ],
      correctOption: 1,
      explanation: "Ad valorem (according to value) taxes are based on assessed property value.",
      difficulty: "easy"
    },
    // Add more comprehensive questions...
    {
      text: "Which agency enforces the Fair Housing Act",
      options: [
        "FBI",
        "HUD",
        "EPA",
        "OSHA"
      ],
      correctOption: 1,
      explanation: "HUD (Housing and Urban Development) enforces the Fair Housing Act.",
      difficulty: "easy"
    },
    {
      text: "A deed is NOT valid unless it",
      options: [
        "is recorded",
        "includes a survey",
        "is delivered and accepted",
        "is notarized"
      ],
      correctOption: 2,
      explanation: "A deed must be delivered and accepted to be valid. Recording is not required for validity.",
      difficulty: "medium"
    },
    {
      text: "The bundle of legal rights includes all EXCEPT",
      options: [
        "right of possession",
        "right of control",
        "right of guaranteed value appreciation",
        "right of disposition"
      ],
      correctOption: 2,
      explanation: "The bundle of rights does not include guaranteed appreciation.",
      difficulty: "easy"
    },
    {
      text: "Eminent domain is the government's right to",
      options: [
        "control land use through zoning",
        "take private property for public use with compensation",
        "impose property taxes",
        "regulate building codes"
      ],
      correctOption: 1,
      explanation: "Eminent domain allows government to take property for public use with just compensation.",
      difficulty: "easy"
    },
    {
      text: "Which of the following is a lien that affects all property owned",
      options: [
        "Mortgage lien",
        "Mechanic's lien",
        "Judgment lien",
        "Property tax lien"
      ],
      correctOption: 2,
      explanation: "Judgment liens attach to all real property owned by the debtor in the county.",
      difficulty: "medium"
    },
    {
      text: "In Florida, a written listing agreement is required",
      options: [
        "for all types of listings",
        "only for exclusive right of sale listings",
        "to collect a commission when there's a dispute",
        "only for commercial properties"
      ],
      correctOption: 2,
      explanation: "A written agreement is required to collect a commission when disputed.",
      difficulty: "medium"
    },
    {
      text: "The statute of frauds requires that real estate contracts be",
      options: [
        "verbal only",
        "witnessed by two people",
        "in writing to be enforceable",
        "approved by an attorney"
      ],
      correctOption: 2,
      explanation: "The statute of frauds requires real estate contracts to be in writing to be enforceable.",
      difficulty: "easy"
    },
    {
      text: "Points on a mortgage loan are",
      options: [
        "monthly payments",
        "prepaid interest charged at closing",
        "annual percentage rates",
        "down payment requirements"
      ],
      correctOption: 1,
      explanation: "Points are prepaid interest charges at closing, with one point equaling 1% of the loan.",
      difficulty: "medium"
    },
    {
      text: "The gross rent multiplier is used to estimate",
      options: [
        "property operating expenses",
        "property value based on rental income",
        "cap rate",
        "net operating income"
      ],
      correctOption: 1,
      explanation: "GRM = Price / Gross Monthly Rent, used to estimate property value.",
      difficulty: "medium"
    },
    {
      text: "A variance is granted by the",
      options: [
        "planning commission",
        "zoning board of adjustment",
        "city council",
        "building inspector"
      ],
      correctOption: 1,
      explanation: "The zoning board of adjustment grants variances from zoning requirements.",
      difficulty: "medium"
    },
    // Additional comprehensive final exam questions
    {
      text: "Which of the following is a personal property item",
      options: ["Attached light fixtures", "Growing trees", "Furniture", "Built-in appliances"],
      correctOption: 2,
      explanation: "Furniture is personal property (chattel) that is not attached to real property.",
      difficulty: "easy"
    },
    {
      text: "A real estate license in Florida is valid for",
      options: ["1 year", "2 years", "4 years", "5 years"],
      correctOption: 1,
      explanation: "Florida real estate licenses are valid for 2 years and must be renewed.",
      difficulty: "easy"
    },
    {
      text: "The process of combining two or more parcels of land is called",
      options: ["assemblage", "plottage", "subdivision", "dedication"],
      correctOption: 0,
      explanation: "Assemblage is the process of combining multiple parcels into a larger one.",
      difficulty: "medium"
    },
    {
      text: "Plottage value refers to",
      options: [
        "the cost of surveying land",
        "the increased value from combining parcels",
        "the tax assessment of land",
        "the depreciation of improvements"
      ],
      correctOption: 1,
      explanation: "Plottage is the increment in value when smaller parcels are combined into a larger one.",
      difficulty: "medium"
    },
    {
      text: "Which type of deed provides the LEAST protection to the buyer",
      options: ["General warranty deed", "Special warranty deed", "Bargain and sale deed", "Quitclaim deed"],
      correctOption: 3,
      explanation: "A quitclaim deed offers no warranties and only transfers whatever interest the grantor may have.",
      difficulty: "medium"
    },
    {
      text: "The income capitalization approach uses which formula",
      options: ["Value = NOI / Cap Rate", "Value = Price x GRM", "Value = Cost - Depreciation", "Value = Sales Price / Area"],
      correctOption: 0,
      explanation: "The income approach formula is Value = Net Operating Income / Capitalization Rate.",
      difficulty: "medium"
    },
    {
      text: "Which of the following is NOT a protected class under federal Fair Housing laws",
      options: ["National origin", "Familial status", "Sexual orientation", "Religion"],
      correctOption: 2,
      explanation: "Sexual orientation is not a protected class under federal Fair Housing Act, though some states provide protection.",
      difficulty: "medium"
    },
    {
      text: "A blind ad is one that",
      options: [
        "targets visually impaired consumers",
        "fails to identify the advertiser as a licensed broker",
        "is placed in underground publications",
        "contains false information"
      ],
      correctOption: 1,
      explanation: "A blind ad fails to disclose that the advertiser is a licensed real estate broker.",
      difficulty: "medium"
    },
    {
      text: "The purpose of the Real Estate Recovery Fund is to",
      options: [
        "fund licensee education",
        "compensate victims of real estate fraud by licensees",
        "provide low-interest loans to buyers",
        "pay for license examination costs"
      ],
      correctOption: 1,
      explanation: "The Recovery Fund compensates consumers who suffer monetary damages due to a licensee's actions.",
      difficulty: "medium"
    },
    {
      text: "Which government entity manages flood insurance",
      options: ["HUD", "FEMA", "EPA", "FDIC"],
      correctOption: 1,
      explanation: "FEMA (Federal Emergency Management Agency) administers the National Flood Insurance Program.",
      difficulty: "medium"
    },
    {
      text: "The principle that states property values tend to rise to match surrounding properties is called",
      options: ["progression", "regression", "contribution", "conformity"],
      correctOption: 0,
      explanation: "Progression means a lower-priced property benefits from being near higher-priced properties.",
      difficulty: "medium"
    },
    {
      text: "The principle of substitution states that",
      options: [
        "a buyer will not pay more for a property than the cost of an equally desirable substitute",
        "properties conform to neighborhood standards",
        "the whole is worth more than the sum of its parts",
        "land is valued by its most profitable legal use"
      ],
      correctOption: 0,
      explanation: "Substitution sets the upper limit of value at what a buyer would pay for a comparable alternative.",
      difficulty: "medium"
    },
    {
      text: "A promissory note is evidence of",
      options: ["ownership", "a debt", "insurance", "title"],
      correctOption: 1,
      explanation: "A promissory note is the borrower's written promise to repay the loan.",
      difficulty: "easy"
    },
    {
      text: "Which document pledges property as security for a loan",
      options: ["Promissory note", "Mortgage", "Deed", "Title insurance policy"],
      correctOption: 1,
      explanation: "The mortgage (or deed of trust) pledges the property as collateral for the loan.",
      difficulty: "easy"
    },
    {
      text: "PMI stands for",
      options: ["Property Management Insurance", "Private Mortgage Insurance", "Primary Mortgage Interest", "Public Mortgage Institute"],
      correctOption: 1,
      explanation: "PMI (Private Mortgage Insurance) protects lenders when borrowers have less than 20% down payment.",
      difficulty: "easy"
    },
    {
      text: "Which type of loan is insured by the federal government",
      options: ["Conventional loan", "FHA loan", "Portfolio loan", "Bridge loan"],
      correctOption: 1,
      explanation: "FHA loans are insured by the Federal Housing Administration.",
      difficulty: "easy"
    },
    {
      text: "PITI stands for",
      options: [
        "Principal, Insurance, Taxes, Income",
        "Principal, Interest, Taxes, Insurance",
        "Payment, Interest, Title, Insurance",
        "Property, Investment, Tax, Income"
      ],
      correctOption: 1,
      explanation: "PITI represents the four components of a typical mortgage payment.",
      difficulty: "easy"
    },
    {
      text: "An ARM is a type of mortgage where",
      options: [
        "the interest rate remains fixed",
        "the interest rate can change periodically",
        "no down payment is required",
        "only interest is paid initially"
      ],
      correctOption: 1,
      explanation: "An ARM (Adjustable Rate Mortgage) has an interest rate that changes based on market conditions.",
      difficulty: "medium"
    },
    {
      text: "Buyer's remorse is protected by which right",
      options: ["Right of rescission", "Right of redemption", "Right of first refusal", "Right of survivorship"],
      correctOption: 0,
      explanation: "The right of rescission allows borrowers to cancel certain loan transactions within three days.",
      difficulty: "medium"
    },
    {
      text: "In Florida, which party typically pays for title insurance protecting the lender",
      options: ["Buyer", "Seller", "Lender", "Real estate agent"],
      correctOption: 0,
      explanation: "In Florida, the buyer typically pays for the lender's title insurance policy.",
      difficulty: "medium"
    },
    {
      text: "A cloud on title refers to",
      options: [
        "weather damage to property",
        "any claim or encumbrance that may affect ownership",
        "unclear property boundaries",
        "property in a flood zone"
      ],
      correctOption: 1,
      explanation: "A cloud on title is any claim, lien, or encumbrance that affects clear ownership.",
      difficulty: "medium"
    },
    {
      text: "Which type of listing gives the broker an exclusive right to a commission regardless of who sells the property",
      options: [
        "Open listing",
        "Exclusive agency listing",
        "Exclusive right of sale listing",
        "Net listing"
      ],
      correctOption: 2,
      explanation: "An exclusive right of sale ensures the broker earns commission even if the owner finds the buyer.",
      difficulty: "medium"
    },
    {
      text: "A listing agreement is a contract between",
      options: [
        "buyer and seller",
        "seller and broker",
        "buyer and broker",
        "broker and broker"
      ],
      correctOption: 1,
      explanation: "A listing agreement is a contract between the property owner (seller) and the broker.",
      difficulty: "easy"
    },
    {
      text: "Earnest money is also known as",
      options: ["down payment", "good faith deposit", "closing costs", "escrow funds"],
      correctOption: 1,
      explanation: "Earnest money is a good faith deposit showing the buyer's serious intent to purchase.",
      difficulty: "easy"
    },
    {
      text: "Which of the following is TRUE about net listings",
      options: [
        "They are illegal in all states",
        "They guarantee the broker a minimum commission",
        "They are discouraged but legal in Florida",
        "They require a minimum sales price"
      ],
      correctOption: 2,
      explanation: "Net listings are legal but discouraged in Florida due to potential conflicts of interest.",
      difficulty: "medium"
    },
    {
      text: "The market value of a property is",
      options: [
        "the price the seller paid for the property",
        "the most probable price the property would bring in a competitive market",
        "the cost to build a new property",
        "the assessed value for tax purposes"
      ],
      correctOption: 1,
      explanation: "Market value is the most probable price under normal market conditions.",
      difficulty: "medium"
    },
    {
      text: "Physical deterioration that is economically feasible to repair is called",
      options: [
        "curable depreciation",
        "incurable depreciation",
        "functional obsolescence",
        "external obsolescence"
      ],
      correctOption: 0,
      explanation: "Curable depreciation refers to wear and tear that can be economically repaired.",
      difficulty: "medium"
    },
    {
      text: "A property's location near a busy highway causing decreased value is an example of",
      options: [
        "physical deterioration",
        "functional obsolescence",
        "external obsolescence",
        "curable depreciation"
      ],
      correctOption: 2,
      explanation: "External obsolescence is loss of value due to factors outside the property's boundaries.",
      difficulty: "medium"
    },
    {
      text: "Which approach to value is most commonly used for single-family homes",
      options: [
        "Income approach",
        "Cost approach",
        "Sales comparison approach",
        "Gross rent multiplier"
      ],
      correctOption: 2,
      explanation: "The sales comparison approach is most reliable for residential properties with many comparables.",
      difficulty: "medium"
    },
    {
      text: "Depreciation for appraisal purposes refers to",
      options: [
        "tax deduction for investment properties",
        "loss in value from any cause",
        "decrease in mortgage balance",
        "reduction in property taxes"
      ],
      correctOption: 1,
      explanation: "In appraisal, depreciation is any loss in value from physical, functional, or external factors.",
      difficulty: "medium"
    },
    {
      text: "What is the minimum age requirement for a Florida real estate license",
      options: ["16 years", "18 years", "21 years", "25 years"],
      correctOption: 1,
      explanation: "Applicants must be at least 18 years of age to obtain a Florida real estate license.",
      difficulty: "easy"
    },
    {
      text: "Which entity is responsible for rulemaking for Florida real estate licensees",
      options: ["DBPR", "FREC", "Division of Real Estate", "Governor"],
      correctOption: 1,
      explanation: "FREC (Florida Real Estate Commission) makes rules governing licensees.",
      difficulty: "medium"
    },
    {
      text: "Post-licensing education for sales associates in Florida consists of",
      options: ["14 hours", "28 hours", "45 hours", "63 hours"],
      correctOption: 2,
      explanation: "Florida sales associates must complete 45 hours of post-licensing education before first renewal.",
      difficulty: "medium"
    },
    {
      text: "Continuing education requirements for license renewal in Florida are",
      options: ["7 hours", "14 hours", "28 hours", "45 hours"],
      correctOption: 1,
      explanation: "Florida licensees must complete 14 hours of continuing education for each renewal cycle.",
      difficulty: "medium"
    },
    {
      text: "A broker must deposit escrow funds in the broker's trust account within",
      options: ["24 hours", "3 business days", "5 business days", "10 business days"],
      correctOption: 1,
      explanation: "Escrow funds must be deposited within three business days of receipt.",
      difficulty: "medium"
    },
    {
      text: "Commingling of funds refers to",
      options: [
        "depositing client funds in a trust account",
        "mixing personal funds with client escrow funds",
        "transferring funds between accounts",
        "investing escrow funds"
      ],
      correctOption: 1,
      explanation: "Commingling is illegally mixing personal or business funds with escrow funds.",
      difficulty: "medium"
    },
    {
      text: "A broker may maintain up to what amount of personal funds in an escrow account",
      options: ["$100", "$500", "$1,000", "$5,000"],
      correctOption: 2,
      explanation: "Brokers may keep up to $1,000 of personal funds in escrow to cover bank charges.",
      difficulty: "medium"
    },
    {
      text: "Conversion of escrow funds is",
      options: [
        "changing currencies",
        "using client funds for personal purposes",
        "moving funds between accounts",
        "investing escrow funds"
      ],
      correctOption: 1,
      explanation: "Conversion is the unauthorized use of client funds for personal benefit.",
      difficulty: "medium"
    },
    {
      text: "Transaction broker provides services to",
      options: [
        "only the buyer",
        "only the seller",
        "both buyer and seller without fiduciary duties",
        "neither party"
      ],
      correctOption: 2,
      explanation: "A transaction broker facilitates the transaction without advocating for either party.",
      difficulty: "medium"
    },
    {
      text: "Dual agency occurs when",
      options: [
        "two agents work on the same transaction",
        "one agent represents both buyer and seller",
        "an agent works for two brokerages",
        "a buyer and seller share an attorney"
      ],
      correctOption: 1,
      explanation: "Dual agency is when the same agent or brokerage represents both parties in a transaction.",
      difficulty: "medium"
    },
    {
      text: "Which disclosure is required in ALL real estate transactions in Florida",
      options: [
        "Lead-based paint disclosure",
        "Agency disclosure",
        "Seller's property disclosure",
        "HOA disclosure"
      ],
      correctOption: 1,
      explanation: "Agency disclosure is mandatory in all Florida real estate transactions.",
      difficulty: "medium"
    },
    {
      text: "The Florida Residential Landlord and Tenant Act applies to",
      options: [
        "all rental properties",
        "residential rentals only",
        "commercial rentals only",
        "month-to-month leases only"
      ],
      correctOption: 1,
      explanation: "This act specifically governs residential rental relationships in Florida.",
      difficulty: "medium"
    },
    {
      text: "A lease that automatically renews is called",
      options: ["estate for years", "periodic estate", "estate at will", "estate at sufferance"],
      correctOption: 1,
      explanation: "A periodic estate (like month-to-month) automatically renews until properly terminated.",
      difficulty: "medium"
    },
    {
      text: "A tenant who remains after the lease expires without permission is a",
      options: ["periodic tenant", "tenant at will", "holdover tenant", "subtenant"],
      correctOption: 2,
      explanation: "A holdover tenant (estate at sufferance) stays after the lease expires without consent.",
      difficulty: "medium"
    },
    {
      text: "Which legal description method uses monuments and natural features",
      options: ["Rectangular survey", "Lot and block", "Metes and bounds", "Government survey"],
      correctOption: 2,
      explanation: "Metes and bounds uses physical monuments, angles, and distances to describe boundaries.",
      difficulty: "medium"
    },
    {
      text: "A section of land contains how many acres",
      options: ["160 acres", "320 acres", "640 acres", "1280 acres"],
      correctOption: 2,
      explanation: "A section is one square mile, containing 640 acres.",
      difficulty: "medium"
    },
    {
      text: "Which of the following is a voluntary lien",
      options: ["Property tax lien", "Mechanic's lien", "Mortgage lien", "Judgment lien"],
      correctOption: 2,
      explanation: "A mortgage is a voluntary lien created when the owner pledges property as security.",
      difficulty: "medium"
    },
    {
      text: "Escheat occurs when",
      options: [
        "property is condemned",
        "property transfers to the state due to lack of heirs",
        "property is foreclosed",
        "zoning changes"
      ],
      correctOption: 1,
      explanation: "Escheat is the government's right to take property when an owner dies without heirs or will.",
      difficulty: "medium"
    },
    {
      text: "Homestead exemption in Florida protects property from",
      options: [
        "all liens",
        "forced sale by most creditors",
        "property taxes",
        "eminent domain"
      ],
      correctOption: 1,
      explanation: "Florida's homestead protection prevents forced sale for most debts, with some exceptions.",
      difficulty: "medium"
    },
    {
      text: "The millage rate is used to calculate",
      options: ["mortgage interest", "property taxes", "insurance premiums", "closing costs"],
      correctOption: 1,
      explanation: "Millage rate (mills per dollar) is used to calculate property taxes.",
      difficulty: "medium"
    },
    {
      text: "Special assessments are used to pay for",
      options: [
        "general government operations",
        "specific improvements benefiting properties",
        "school funding",
        "emergency services"
      ],
      correctOption: 1,
      explanation: "Special assessments fund specific improvements like sidewalks or sewers that benefit properties.",
      difficulty: "medium"
    },
    {
      text: "Nonconforming use refers to",
      options: [
        "illegal property use",
        "use that predates current zoning but is allowed to continue",
        "temporary building permit",
        "variance request"
      ],
      correctOption: 1,
      explanation: "Nonconforming use is a pre-existing use that doesn't comply with current zoning but may continue.",
      difficulty: "medium"
    },
    {
      text: "A conditional use permit is also called a",
      options: ["variance", "special exception", "rezoning", "nonconforming use"],
      correctOption: 1,
      explanation: "A conditional use (special exception) allows specific uses in zones where they're not normally permitted.",
      difficulty: "medium"
    },
    {
      text: "Which law requires lead-based paint disclosure for homes built before 1978",
      options: ["CERCLA", "Residential Lead-Based Paint Hazard Reduction Act", "Clean Water Act", "RESPA"],
      correctOption: 1,
      explanation: "The Residential Lead-Based Paint Hazard Reduction Act of 1992 requires this disclosure.",
      difficulty: "medium"
    },
    {
      text: "Radon is a",
      options: ["form of mold", "radioactive gas", "type of asbestos", "water contaminant"],
      correctOption: 1,
      explanation: "Radon is a naturally occurring radioactive gas that can accumulate in buildings.",
      difficulty: "easy"
    },
    {
      text: "A property in a flood zone requires",
      options: ["immediate sale", "flood insurance if federally financed", "demolition", "rezoning"],
      correctOption: 1,
      explanation: "Properties in flood zones require flood insurance for federally-backed mortgages.",
      difficulty: "medium"
    },
    {
      text: "CERCLA is also known as",
      options: ["Clean Air Act", "Superfund", "RESPA", "Fair Housing Act"],
      correctOption: 1,
      explanation: "CERCLA (Superfund) addresses cleanup of contaminated properties.",
      difficulty: "medium"
    },
    {
      text: "A buyer's agency agreement creates a relationship between",
      options: ["buyer and seller", "buyer and broker", "seller and broker", "broker and broker"],
      correctOption: 1,
      explanation: "A buyer's agency agreement establishes the broker-buyer relationship.",
      difficulty: "easy"
    },
    {
      text: "The seller's agent owes confidentiality to",
      options: ["buyer", "seller", "both parties", "neither party"],
      correctOption: 1,
      explanation: "The seller's agent owes confidentiality to their client, the seller.",
      difficulty: "easy"
    },
    {
      text: "Material facts must be disclosed to",
      options: ["only the principal", "all parties", "only buyers", "only sellers"],
      correctOption: 1,
      explanation: "Material facts that could affect a party's decision must be disclosed to all parties.",
      difficulty: "medium"
    },
    {
      text: "Which of the following would be a material fact",
      options: [
        "The seller's reason for moving",
        "A death on the property from natural causes",
        "Known roof leaks",
        "The seller's purchase price"
      ],
      correctOption: 2,
      explanation: "Physical defects like roof leaks are material facts that must be disclosed.",
      difficulty: "medium"
    },
    {
      text: "Steering is",
      options: [
        "directing buyers to or away from areas based on protected class status",
        "refusing to show a property",
        "requiring larger down payments",
        "charging higher interest rates"
      ],
      correctOption: 0,
      explanation: "Steering is directing people to or away from neighborhoods based on protected characteristics.",
      difficulty: "medium"
    },
    {
      text: "Blockbusting involves",
      options: [
        "building new developments",
        "inducing panic selling by introducing protected class members to an area",
        "blocking property sales",
        "refusing mortgage applications"
      ],
      correctOption: 1,
      explanation: "Blockbusting is inducing property owners to sell by implying neighborhood composition will change.",
      difficulty: "medium"
    },
    {
      text: "Redlining is",
      options: [
        "refusing to lend in certain areas based on demographics",
        "drawing property boundaries",
        "marking properties for sale",
        "highlighting contract terms"
      ],
      correctOption: 0,
      explanation: "Redlining is discriminatory refusal to provide services in certain neighborhoods.",
      difficulty: "medium"
    },
    {
      text: "The Americans with Disabilities Act requires",
      options: [
        "all buildings to have elevators",
        "reasonable accommodations in public spaces",
        "free parking for disabled persons",
        "reduced rent for disabled tenants"
      ],
      correctOption: 1,
      explanation: "The ADA requires reasonable accommodations for people with disabilities in public spaces.",
      difficulty: "medium"
    },
    {
      text: "A real estate contract must include",
      options: [
        "verbal agreement between parties",
        "consideration from at least one party",
        "attorney approval",
        "notarization"
      ],
      correctOption: 1,
      explanation: "All contracts require consideration (something of value exchanged by each party).",
      difficulty: "medium"
    },
    {
      text: "An option contract gives the optionee",
      options: [
        "the obligation to purchase",
        "the right to purchase within a specified period",
        "automatic ownership transfer",
        "rental rights"
      ],
      correctOption: 1,
      explanation: "An option gives the right, but not the obligation, to purchase within a specified time.",
      difficulty: "medium"
    },
    {
      text: "Specific performance is a remedy that",
      options: [
        "terminates the contract",
        "forces a party to fulfill contract obligations",
        "provides monetary damages",
        "returns the parties to pre-contract status"
      ],
      correctOption: 1,
      explanation: "Specific performance compels the breaching party to perform as contracted.",
      difficulty: "medium"
    },
    {
      text: "Liquidated damages are",
      options: [
        "actual damages proven in court",
        "predetermined damages agreed upon in the contract",
        "punitive damages",
        "treble damages"
      ],
      correctOption: 1,
      explanation: "Liquidated damages are pre-agreed compensation amounts if a party breaches.",
      difficulty: "medium"
    },
    {
      text: "A counteroffer is",
      options: [
        "acceptance of the original offer",
        "rejection and creation of a new offer",
        "extension of the original offer",
        "withdrawal of the offer"
      ],
      correctOption: 1,
      explanation: "A counteroffer rejects the original offer and creates a new offer for the other party.",
      difficulty: "easy"
    },
    {
      text: "Time is of the essence means",
      options: [
        "the contract should be completed quickly",
        "deadlines in the contract are strictly enforced",
        "urgency is requested",
        "extensions are not available"
      ],
      correctOption: 1,
      explanation: "This clause makes contract dates legally binding and failure to meet them is a breach.",
      difficulty: "medium"
    },
    {
      text: "A satisfaction of mortgage indicates",
      options: [
        "the mortgage is approved",
        "the mortgage debt has been paid in full",
        "the property has been sold",
        "the interest rate has been adjusted"
      ],
      correctOption: 1,
      explanation: "A satisfaction (or release) of mortgage shows the loan has been completely paid off.",
      difficulty: "easy"
    },
    {
      text: "Deficiency judgment may be sought when",
      options: [
        "the borrower pays off the loan early",
        "foreclosure sale proceeds don't cover the debt",
        "the property appreciates in value",
        "the buyer defaults on earnest money"
      ],
      correctOption: 1,
      explanation: "If the foreclosure sale doesn't cover the debt, the lender may seek a deficiency judgment.",
      difficulty: "medium"
    },
    {
      text: "Equity of redemption allows",
      options: [
        "automatic loan forgiveness",
        "the borrower to pay off the debt and keep the property before foreclosure sale",
        "extension of loan terms",
        "reduction of principal"
      ],
      correctOption: 1,
      explanation: "Equity of redemption is the borrower's right to pay the debt and stop foreclosure before the sale.",
      difficulty: "medium"
    },
    {
      text: "A subordination agreement allows",
      options: [
        "a new loan to take priority over an existing loan",
        "equal priority for all loans",
        "cancellation of existing loans",
        "automatic refinancing"
      ],
      correctOption: 0,
      explanation: "Subordination allows a later-recorded lien to take priority over an earlier one.",
      difficulty: "hard"
    },
    {
      text: "Negative amortization occurs when",
      options: [
        "the loan is paid off early",
        "monthly payments don't cover interest, so the balance grows",
        "interest rates decrease",
        "the borrower makes extra payments"
      ],
      correctOption: 1,
      explanation: "Negative amortization means the loan balance increases because payments don't cover interest.",
      difficulty: "hard"
    },
    {
      text: "The annual percentage rate (APR) includes",
      options: [
        "only the interest rate",
        "the interest rate plus certain loan costs",
        "only closing costs",
        "property taxes and insurance"
      ],
      correctOption: 1,
      explanation: "APR is the true cost of borrowing, including interest and certain loan fees.",
      difficulty: "medium"
    },
    {
      text: "A balloon payment is",
      options: [
        "an extra payment made toward principal",
        "a large final payment when the loan comes due",
        "an insurance premium",
        "a prepayment penalty"
      ],
      correctOption: 1,
      explanation: "A balloon payment is a large lump sum due at the end of a loan term.",
      difficulty: "medium"
    },
    {
      text: "Discount points are paid to",
      options: [
        "increase the interest rate",
        "buy down the interest rate",
        "avoid closing costs",
        "waive the down payment"
      ],
      correctOption: 1,
      explanation: "Discount points are prepaid interest used to lower (buy down) the loan interest rate.",
      difficulty: "medium"
    },
    {
      text: "The secondary mortgage market",
      options: [
        "provides loans directly to borrowers",
        "buys and sells existing loans",
        "offers second mortgages",
        "regulates interest rates"
      ],
      correctOption: 1,
      explanation: "The secondary market (Fannie Mae, Freddie Mac) purchases existing loans from primary lenders.",
      difficulty: "medium"
    },
    {
      text: "Fannie Mae is also known as",
      options: [
        "Federal Housing Administration",
        "Federal National Mortgage Association",
        "Federal Home Loan Bank",
        "Federal Reserve"
      ],
      correctOption: 1,
      explanation: "Fannie Mae (FNMA) is the Federal National Mortgage Association.",
      difficulty: "medium"
    },
    {
      text: "TILA (Truth in Lending Act) requires disclosure of",
      options: [
        "property defects",
        "loan terms and costs to borrowers",
        "zoning information",
        "environmental hazards"
      ],
      correctOption: 1,
      explanation: "TILA requires lenders to disclose all loan costs and terms to borrowers.",
      difficulty: "medium"
    },
    {
      text: "Regulation Z implements which law",
      options: ["RESPA", "TILA", "Fair Housing Act", "CERCLA"],
      correctOption: 1,
      explanation: "Regulation Z is the Federal Reserve regulation implementing the Truth in Lending Act.",
      difficulty: "medium"
    },
    {
      text: "The Loan Estimate must be provided within how many business days of application",
      options: ["1 day", "3 days", "5 days", "7 days"],
      correctOption: 1,
      explanation: "The Loan Estimate must be provided within three business days of receiving the application.",
      difficulty: "medium"
    },
    {
      text: "The Closing Disclosure must be provided at least how many days before closing",
      options: ["1 day", "3 days", "5 days", "7 days"],
      correctOption: 1,
      explanation: "The Closing Disclosure must be provided at least three business days before closing.",
      difficulty: "medium"
    },
    {
      text: "A mill equals",
      options: ["$1 per $100", "$10 per $1,000", "$1 per $1,000", "$100 per $10,000"],
      correctOption: 2,
      explanation: "One mill equals 1/10 of a cent, or $1 per $1,000 of assessed value.",
      difficulty: "medium"
    },
    {
      text: "Proration at closing means",
      options: [
        "dividing costs equally between parties",
        "allocating costs based on time of ownership",
        "paying all costs at signing",
        "deferring costs to a later date"
      ],
      correctOption: 1,
      explanation: "Proration divides costs like taxes and HOA fees based on ownership dates.",
      difficulty: "medium"
    },
    {
      text: "Who typically chooses the closing agent in Florida",
      options: ["Buyer", "Seller", "Lender", "Real estate agent"],
      correctOption: 0,
      explanation: "In Florida, the buyer typically chooses and pays for the closing agent.",
      difficulty: "medium"
    },
    {
      text: "Documentary stamp tax on the deed in Florida is paid by",
      options: ["buyer", "seller", "shared equally", "lender"],
      correctOption: 1,
      explanation: "In Florida, the seller typically pays the documentary stamp tax on the deed.",
      difficulty: "medium"
    },
    {
      text: "Documentary stamp tax on notes in Florida is paid by",
      options: ["buyer", "seller", "shared equally", "lender"],
      correctOption: 0,
      explanation: "The borrower (buyer) pays the documentary stamp tax on the promissory note.",
      difficulty: "medium"
    },
    {
      text: "Intangible tax in Florida is paid on",
      options: ["the sale price", "the loan amount", "property taxes", "title insurance"],
      correctOption: 1,
      explanation: "Intangible tax is paid on the mortgage amount when a new mortgage is recorded.",
      difficulty: "medium"
    }
  ];
}
