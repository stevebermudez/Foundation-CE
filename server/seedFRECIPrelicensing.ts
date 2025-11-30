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

    // Unit 1 questions (fully detailed)
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

    // Unit 2 questions (Real Estate License Law and Qualifications)
    const unit2Questions = [
      {
        text: "The primary purpose of Florida real estate license law is to",
        options: [
          "A. increase the income of real estate licensees",
          "B. protect the public by regulating real estate brokers and sales associates",
          "C. create a standard form of real estate contract",
          "D. regulate interest rates charged on real estate loans",
        ],
        correctAnswer: "B",
        explanation: "The guiding purpose behind Florida's licensing system is consumer protection, not to benefit licensees.",
      },
      {
        text: "Which state agency is responsible for licensing and regulating real estate professionals in Florida",
        options: [
          "A. Department of Financial Services",
          "B. Department of Business and Professional Regulation",
          "C. Department of State",
          "D. Real Estate Recovery Fund",
        ],
        correctAnswer: "B",
        explanation: "DBPR (Department of Business and Professional Regulation) is the umbrella agency responsible for licensing real estate professionals in Florida.",
      },
      {
        text: "Which entity provides administrative and ministerial support services specifically for the Florida Real Estate Commission",
        options: [
          "A. Division of Professions",
          "B. Division of Real Estate",
          "C. Florida Supreme Court",
          "D. Attorney General",
        ],
        correctAnswer: "B",
        explanation: "The Division of Real Estate (DRE) is part of DBPR and provides administrative support, maintains records, and coordinates the examination process for FREC.",
      },
      {
        text: "Which Florida statute chapter primarily contains the real estate license law",
        options: [
          "A. Chapter 20",
          "B. Chapter 120",
          "C. Chapter 455",
          "D. Chapter 475",
        ],
        correctAnswer: "D",
        explanation: "Chapter 475, Florida Statutes, is the primary real estate license law defining license types, disciplinary grounds, and recovery funds.",
      },
      {
        text: "Which of the following is one of the basic qualifications for a Florida sales associate license",
        options: [
          "A. United States citizenship",
          "B. Florida residency",
          "C. High school diploma or equivalent",
          "D. College degree in real estate",
        ],
        correctAnswer: "C",
        explanation: "A high school diploma or equivalent is a basic qualification. Applicants must also be 18+, have a Social Security number, and be of good moral character.",
      },
      {
        text: "A sales associate applicant was convicted of a misdemeanor 5 years ago and had adjudication withheld. On the license application, the applicant must",
        options: [
          "A. omit the information because adjudication was withheld",
          "B. omit the information because it is older than 3 years",
          "C. disclose the offense if asked, even if adjudication was withheld",
          "D. disclose only felonies, not misdemeanors",
        ],
        correctAnswer: "C",
        explanation: "Applicants must disclose all arrests, charges, or convictions, even if adjudication was withheld or the record was sealed or expunged.",
      },
      {
        text: "Failure to disclose a prior criminal conviction on a license application",
        options: [
          "A. is acceptable if the conviction was sealed",
          "B. may be grounds for denial of the application",
          "C. has no effect if the applicant later passes the exam",
          "D. is required under privacy laws",
        ],
        correctAnswer: "B",
        explanation: "Failure to disclose is often worse than the underlying offense and may result in application denial.",
      },
      {
        text: "Which statement correctly describes the education requirement for a sales associate applicant",
        options: [
          "A. The applicant must complete a 72 hour FREC Course II",
          "B. The applicant must complete a pre license course unless an education exemption applies",
          "C. The applicant needs only to pass the state exam",
          "D. The applicant must complete 45 hours of post licensing education before taking the exam",
        ],
        correctAnswer: "B",
        explanation: "Sales associates must complete an approved pre-license course (FREC I, 63 hours) before taking the state exam, except in cases of exemption.",
      },
      {
        text: "A broker holds a broker license but chooses to work under another broker as an associate. This licensee is",
        options: [
          "A. a sales associate",
          "B. an owner developer",
          "C. a broker associate",
          "D. a registered assistant",
        ],
        correctAnswer: "C",
        explanation: "A broker associate has a broker license but chooses to work under another broker's supervision rather than operating independently.",
      },
      {
        text: "Registration refers to",
        options: [
          "A. the legal authorization to practice real estate",
          "B. placing the licensee's name and address on the records of the DBPR",
          "C. automatic renewal of a license",
          "D. the post licensing education process",
        ],
        correctAnswer: "B",
        explanation: "Registration is placement on official records. Licensure is the legal authorization to practice. Both may be required, but licensure grants authority.",
      },
      {
        text: "Which of the following is a requirement common to both broker and sales associate applicants",
        options: [
          "A. United States citizenship",
          "B. Minimum of two years of college",
          "C. Fingerprint based background check",
          "D. At least two years of real estate experience",
        ],
        correctAnswer: "C",
        explanation: "Both broker and sales associate applicants must undergo fingerprint-based background checks ordered by DBPR.",
      },
      {
        text: "Mutual recognition agreements allow",
        options: [
          "A. Florida residents to bypass pre license education",
          "B. nonresident licensees from certain states to obtain a Florida license without the full pre license course",
          "C. foreign nationals to practice without a Social Security number",
          "D. any out of state licensee to perform services in Florida without a Florida license",
        ],
        correctAnswer: "B",
        explanation: "Mutual recognition is a specific agreement between Florida and certain states allowing nonresident licensees to obtain Florida licenses with reduced requirements.",
      },
      {
        text: "Which activity is considered a real estate service that usually requires a license when performed for another and for compensation",
        options: [
          "A. Paying a mortgage payment for a relative",
          "B. Giving a friend a free estimate of value without expectation of compensation",
          "C. Advertising and negotiating the sale of property for a commission",
          "D. Building a home as a licensed contractor",
        ],
        correctAnswer: "C",
        explanation: "Advertising, buying, selling, renting, and managing real property for another and for compensation require a real estate license.",
      },
      {
        text: "Which person is required to hold an active real estate license",
        options: [
          "A. A salaried employee of an owner who leases units in a single building and receives no bonuses based on rentals",
          "B. An individual paid a fee to market and sell another person's home",
          "C. An attorney at law who drafts a contract as part of legal representation",
          "D. A person who sells their own property",
        ],
        correctAnswer: "B",
        explanation: "A person paid to market and sell another's property is performing real estate services for compensation and must be licensed.",
      },
      {
        text: "Which of the following is typically exempt from real estate licensure when performing real estate related tasks",
        options: [
          "A. A sales associate who works for two brokers at the same time",
          "B. A property management firm that charges a commission to manage rentals",
          "C. A partner in a partnership who sells partnership property and receives a share of profits in proportion to their interest",
          "D. A person who finds tenants for a landlord in exchange for a fee per tenant",
        ],
        correctAnswer: "C",
        explanation: "Partners acting within the scope of their partnership interest are typically exempt from licensure requirements.",
      },
      {
        text: "A person who performs real estate services for another, for compensation, without a required license is",
        options: [
          "A. guilty of unlicensed activity",
          "B. exempt if the services are occasional",
          "C. permitted if they work under an owner",
          "D. subject only to civil, not criminal, penalties",
        ],
        correctAnswer: "A",
        explanation: "Unlicensed activity is a serious violation subject to criminal penalties, administrative fines, and civil liability.",
      },
      {
        text: "The term \"owner developer\" refers to",
        options: [
          "A. a licensed sales associate who also holds a contractor license",
          "B. an individual or entity that owns subdivisions or properties and employs licensees to sell them",
          "C. any person who develops property and sells it through a broker",
          "D. a government agency that owns and develops public property",
        ],
        correctAnswer: "B",
        explanation: "An owner developer is an individual or entity that owns subdivisions or properties and may employ licensees to handle sales within certain limitations.",
      },
      {
        text: "Which statement about post licensing and continuing education is correct",
        options: [
          "A. A sales associate must complete post licensing education before the first renewal",
          "B. Continuing education is completed once, and then no further education is required",
          "C. Post licensing and continuing education are optional",
          "D. Only brokers are required to complete post licensing education",
        ],
        correctAnswer: "A",
        explanation: "Post-licensing education must be completed before the first renewal, and continuing education is required for all subsequent renewals.",
      },
      {
        text: "Which law primarily governs administrative procedure, such as rulemaking and hearings, that affect licensees",
        options: [
          "A. Chapter 20, Florida Statutes",
          "B. Chapter 120, Florida Statutes",
          "C. Chapter 475, Florida Statutes",
          "D. Rule Chapter 61J2, Florida Administrative Code",
        ],
        correctAnswer: "B",
        explanation: "Chapter 120, Florida Statutes, sets out administrative procedure for rulemaking and hearings affecting licensees.",
      },
      {
        text: "A sales associate applicant lives in another state and owns a vacation condo in Florida. For the purpose of mutual recognition rules, that person is considered",
        options: [
          "A. a Florida resident if they spend at least 2 weeks per year in the condo",
          "B. a Florida resident if they hold a Florida driver license",
          "C. a nonresident unless they meet the statutory definition of Florida resident",
          "D. a resident of both states for licensing purposes",
        ],
        correctAnswer: "C",
        explanation: "Florida residency is determined by the statutory definition, not simply by owning property or spending time in the state.",
      },
    ];

    sequenceNum = 0;
    for (const q of unit2Questions) {
      await db.insert(examQuestions).values({
        examId: unitExams[1].id,
        questionText: q.text,
        questionType: "multiple_choice",
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        options: JSON.stringify(q.options),
        sequence: sequenceNum++,
      });
    }
    console.log(`Added ${unit2Questions.length} sample questions to Unit 2 Quiz`);

    // Unit 3 questions (Real Estate License Law & Commission Rules)
    const unit3Questions = [
      {
        text: "The main purpose of the Florida Real Estate Commission is to",
        options: [
          "A. promote the real estate industry",
          "B. protect the public",
          "C. regulate mortgage lenders",
          "D. increase commission rates",
        ],
        correctAnswer: "B",
        explanation: "FREC's mission is to protect the public by regulating real estate practice in Florida.",
      },
      {
        text: "How many members sit on the Florida Real Estate Commission",
        options: ["A. five", "B. six", "C. seven", "D. nine"],
        correctAnswer: "C",
        explanation: "FREC is a seven-member commission appointed by the Governor and confirmed by the Florida Senate.",
      },
      {
        text: "How many FREC members must be consumer members",
        options: ["A. one", "B. two", "C. three", "D. four"],
        correctAnswer: "B",
        explanation: "Two FREC members must be consumer members with no connection to the real estate industry to balance industry expertise with public interest.",
      },
      {
        text: "Which FREC members must have at least five years of active broker experience",
        options: [
          "A. all licensed members",
          "B. two members",
          "C. four members",
          "D. one member",
        ],
        correctAnswer: "C",
        explanation: "Four FREC members must be licensed brokers with at least five years of active experience.",
      },
      {
        text: "FREC's quasi-legislative powers allow the Commission to",
        options: [
          "A. issue criminal penalties",
          "B. adopt rules",
          "C. conduct ministerial tasks only",
          "D. prosecute licensees",
        ],
        correctAnswer: "B",
        explanation: "Quasi-legislative powers allow FREC to make rules that become part of the Florida Administrative Code under Rule Chapter 61J2.",
      },
      {
        text: "FREC's quasi-judicial powers include",
        options: [
          "A. appointing DBPR staff",
          "B. issuing administrative discipline",
          "C. establishing real estate laws",
          "D. preparing state exams",
        ],
        correctAnswer: "B",
        explanation: "Quasi-judicial powers allow FREC to discipline licensees, impose fines, suspend or revoke licenses, and grant or deny applications.",
      },
      {
        text: "Prima facie evidence means",
        options: [
          "A. evidence requiring expert testimony",
          "B. evidence based entirely on speculation",
          "C. evidence that appears valid on its face",
          "D. evidence that cannot be rebutted",
        ],
        correctAnswer: "C",
        explanation: "Prima facie means 'on its face.' A current, valid real estate license is prima facie evidence that the licensee is properly licensed.",
      },
      {
        text: "Which disciplinary action may FREC impose",
        options: [
          "A. imprisonment",
          "B. summary suspension",
          "C. civil forfeiture",
          "D. wage garnishment",
        ],
        correctAnswer: "B",
        explanation: "Summary suspension may be issued when a licensee poses an immediate, serious danger to the public.",
      },
      {
        text: "FREC rules are found in the",
        options: [
          "A. Federal Register",
          "B. Florida Administrative Code",
          "C. Florida Building Code",
          "D. United States Code",
        ],
        correctAnswer: "B",
        explanation: "FREC rules are adopted and found in Rule Chapter 61J2 of the Florida Administrative Code.",
      },
      {
        text: "A current, valid real estate license issued by DBPR is considered",
        options: [
          "A. conclusive proof of competence",
          "B. prima facie evidence of licensure",
          "C. evidence only if notarized",
          "D. insufficient proof of authority",
        ],
        correctAnswer: "B",
        explanation: "A valid real estate license constitutes prima facie evidence that the licensee is properly licensed and authorized.",
      },
      {
        text: "A licensee who fails to renew by the expiration date becomes",
        options: [
          "A. revoked",
          "B. suspended",
          "C. involuntarily inactive",
          "D. null and void immediately",
        ],
        correctAnswer: "C",
        explanation: "Failure to renew on time results in the license becoming involuntarily inactive.",
      },
      {
        text: "A license that is involuntarily inactive for too long becomes",
        options: [
          "A. extended automatically",
          "B. placed on probation",
          "C. null and void",
          "D. transferred to another broker",
        ],
        correctAnswer: "C",
        explanation: "If an involuntarily inactive license is not reactivated within the prescribed period, the license becomes null and void.",
      },
      {
        text: "Which term describes a license that no longer exists and cannot be reinstated",
        options: [
          "A. revoked",
          "B. suspended",
          "C. null and void",
          "D. expired",
        ],
        correctAnswer: "C",
        explanation: "Null and void means the license no longer exists and cannot be reactivated through the standard reactivation process.",
      },
      {
        text: "Advertising by a sales associate must be in the name of",
        options: [
          "A. the associate",
          "B. the broker of record",
          "C. the MLS",
          "D. the developer",
        ],
        correctAnswer: "B",
        explanation: "All advertising by a sales associate must be in the name of the broker of record, not the associate personally.",
      },
      {
        text: "A single licensee may",
        options: [
          "A. work for two brokers at the same time",
          "B. advertise without including the brokerage name",
          "C. pay compensation directly to another licensee",
          "D. work for only one employing broker at a time",
        ],
        correctAnswer: "D",
        explanation: "A sales associate or broker associate may only work for one employer at a time under FREC rules.",
      },
      {
        text: "A sales associate changes brokerages. The associate must",
        options: [
          "A. notify DBPR",
          "B. notify only the MLS",
          "C. take the exam again",
          "D. obtain a new Social Security number",
        ],
        correctAnswer: "A",
        explanation: "When changing employers, a licensee must notify the state (DBPR) and update their license record.",
      },
      {
        text: "FREC may issue a summary suspension when",
        options: [
          "A. a licensee requests a hearing",
          "B. a licensee poses an immediate danger to the public",
          "C. a licensee wants to change employers",
          "D. a licensee fails to complete CE",
        ],
        correctAnswer: "B",
        explanation: "Summary suspension is an emergency action available when a licensee poses an immediate, serious danger to the public.",
      },
      {
        text: "The Real Estate Recovery Fund is used to",
        options: [
          "A. pay commissions",
          "B. reimburse consumers harmed by licensee misconduct",
          "C. fund MLS systems",
          "D. issue licenses faster",
        ],
        correctAnswer: "B",
        explanation: "The Recovery Fund may compensate injured parties for certain damages caused by a licensee, who must later reimburse the Fund.",
      },
      {
        text: "FREC members serve",
        options: [
          "A. two-year terms",
          "B. four-year staggered terms",
          "C. life appointments",
          "D. unlimited consecutive terms",
        ],
        correctAnswer: "B",
        explanation: "FREC members serve staggered four-year terms and cannot serve more than two consecutive terms.",
      },
      {
        text: "The adoption of administrative rules by FREC is an example of",
        options: [
          "A. judicial power",
          "B. ministerial power",
          "C. quasi-legislative power",
          "D. summary power",
        ],
        correctAnswer: "C",
        explanation: "Rulemaking is a quasi-legislative power that allows FREC to interpret and implement Chapter 475 of Florida Statutes.",
      },
    ];

    sequenceNum = 0;
    for (const q of unit3Questions) {
      await db.insert(examQuestions).values({
        examId: unitExams[2].id,
        questionText: q.text,
        questionType: "multiple_choice",
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        options: JSON.stringify(q.options),
        sequence: sequenceNum++,
      });
    }
    console.log(`Added ${unit3Questions.length} sample questions to Unit 3 Quiz`);

    // Unit 4 questions (Authorized Relationships, Duties and Disclosure)
    const unit4Questions = [
      {
        text: "In Florida, unless a single agent or no brokerage relationship is established in writing in a residential sale, a licensee is presumed to be",
        options: [
          "A. a dual agent",
          "B. a transaction broker",
          "C. a single agent",
          "D. a designated sales associate",
        ],
        correctAnswer: "B",
        explanation: "Florida law presumes transaction brokerage unless a single agent or no brokerage relationship is established in writing.",
      },
      {
        text: "Which brokerage relationship creates a fiduciary relationship with a principal",
        options: [
          "A. Transaction broker",
          "B. Single agent",
          "C. No brokerage relationship",
          "D. Designated agency",
        ],
        correctAnswer: "B",
        explanation: "A single agent relationship creates a fiduciary relationship with a principal, with full fiduciary duties.",
      },
      {
        text: "Dual agency in Florida residential sales is",
        options: [
          "A. permitted only if disclosed",
          "B. permitted if both parties consent in writing",
          "C. prohibited",
          "D. required in all listings",
        ],
        correctAnswer: "C",
        explanation: "Dual agency is prohibited in Florida residential transactions.",
      },
      {
        text: "Which duty is owed by a single agent but NOT by a transaction broker",
        options: [
          "A. Accounting for all funds",
          "B. Dealing honestly and fairly",
          "C. Loyalty",
          "D. Disclosing known material facts",
        ],
        correctAnswer: "C",
        explanation: "Loyalty is a fiduciary duty owed by single agents but not by transaction brokers.",
      },
      {
        text: "In a no brokerage relationship with a residential seller, a licensee owes",
        options: [
          "A. loyalty and obedience",
          "B. limited confidentiality",
          "C. dealing honestly and fairly and accounting for all funds",
          "D. no duties since there is no representation",
        ],
        correctAnswer: "C",
        explanation: "Even with no brokerage relationship, limited duties include dealing honestly and fairly, and accounting for funds.",
      },
      {
        text: "The Single Agent Notice must be given",
        options: [
          "A. at closing",
          "B. before or at the time of entering into a listing or representation agreement or before showing property",
          "C. after the first offer is presented",
          "D. only if the customer requests it",
        ],
        correctAnswer: "B",
        explanation: "The Single Agent Notice must be given in writing before or at the time of entering into an agreement or before showing property.",
      },
      {
        text: "Limited confidentiality is a characteristic of which brokerage relationship",
        options: [
          "A. No brokerage relationship",
          "B. Single agent",
          "C. Transaction broker",
          "D. Designated agency",
        ],
        correctAnswer: "C",
        explanation: "Transaction brokers owe limited confidentiality, meaning they cannot disclose information that would harm negotiations.",
      },
      {
        text: "The No Brokerage Relationship Notice is required in",
        options: [
          "A. all real estate transactions",
          "B. all commercial transactions only",
          "C. certain residential transactions when the licensee has no brokerage relationship with a buyer or seller",
          "D. leases only",
        ],
        correctAnswer: "C",
        explanation: "The No Brokerage Relationship Notice must be provided in writing before showing property in covered residential transactions.",
      },
      {
        text: "Which statement about residential sales disclosure requirements is correct",
        options: [
          "A. They apply to all commercial transactions",
          "B. They apply only when more than four residential units are involved",
          "C. They apply to sales of four or fewer residential units, certain residential vacant land, and agricultural property of ten acres or less",
          "D. They apply to leases of any length",
        ],
        correctAnswer: "C",
        explanation: "Disclosure requirements apply to residential property of four or fewer units, unimproved residential property, and agricultural property of ten acres or less.",
      },
      {
        text: "A transaction broker owes a buyer all of the following duties EXCEPT",
        options: [
          "A. loyalty",
          "B. accounting for all funds",
          "C. using skill, care, and diligence",
          "D. disclosing known material defects",
        ],
        correctAnswer: "A",
        explanation: "Loyalty is a fiduciary duty that transaction brokers do not owe to either party.",
      },
      {
        text: "Which disclosure must be obtained before a single agent may change to a transaction broker relationship",
        options: [
          "A. No Brokerage Relationship Notice",
          "B. Consent to Transition to Transaction Broker",
          "C. Designated Agency Consent",
          "D. Transaction Broker Notice for Residential Sales",
        ],
        correctAnswer: "B",
        explanation: "The Consent to Transition to Transaction Broker must be signed in writing before changing from single agent to transaction broker.",
      },
      {
        text: "A transaction broker is best described as",
        options: [
          "A. a fiduciary for both buyer and seller",
          "B. a limited representative for one or more parties in a transaction",
          "C. a government agent",
          "D. a principal in the transaction",
        ],
        correctAnswer: "B",
        explanation: "A transaction broker provides limited representation to one or more parties without fiduciary duties.",
      },
      {
        text: "In which situation are relationship disclosures NOT required",
        options: [
          "A. Sale of a single family home",
          "B. Sale of a duplex",
          "C. Unanticipated casual conversations that do not involve confidential information",
          "D. Sale of a four unit residential building",
        ],
        correctAnswer: "C",
        explanation: "Relationship disclosures are not required in unanticipated casual conversations that do not involve confidential information.",
      },
      {
        text: "A broker may designate sales associates to act as single agents for different customers in the same transaction when",
        options: [
          "A. the transaction is a residential sale of four or fewer units",
          "B. both buyer and seller have assets of one million dollars or more and the transaction is nonresidential",
          "C. the broker has written approval from FREC",
          "D. both customers waive their rights to confidentiality",
        ],
        correctAnswer: "B",
        explanation: "Designated sales associates are only permitted in nonresidential transactions where both parties have assets of one million dollars or more.",
      },
      {
        text: "Designated sales associates must",
        options: [
          "A. follow the duties of a transaction broker",
          "B. act as dual agents for both parties",
          "C. follow all single agent duties including loyalty and confidentiality",
          "D. provide no disclosures",
        ],
        correctAnswer: "C",
        explanation: "Designated sales associates follow all single agent duties, including loyalty and confidentiality to their respective clients.",
      },
      {
        text: "Which of the following is a duty that applies to ALL three authorized brokerage relationships in a residential transaction",
        options: [
          "A. Loyalty",
          "B. Obedience",
          "C. Limited confidentiality",
          "D. Dealing honestly and fairly",
        ],
        correctAnswer: "D",
        explanation: "Dealing honestly and fairly is a duty owed in all three authorized brokerage relationships.",
      },
      {
        text: "The law that lists authorized brokerage relationships and required disclosures is found primarily in",
        options: [
          "A. Chapter 475.278, Florida Statutes",
          "B. Chapter 455, Florida Statutes",
          "C. Chapter 61J2, Florida Administrative Code",
          "D. Chapter 713, Florida Statutes",
        ],
        correctAnswer: "A",
        explanation: "Chapter 475.278, Florida Statutes, establishes authorized brokerage relationships and disclosure requirements.",
      },
      {
        text: "A buyer tells a transaction broker the highest price they are willing to pay. The broker may disclose this information to the seller only",
        options: [
          "A. if the buyer gives written permission or disclosure is required by law",
          "B. if it helps get the deal closed",
          "C. if the seller is also a customer of the brokerage",
          "D. under no circumstances",
        ],
        correctAnswer: "A",
        explanation: "Limited confidentiality means a transaction broker cannot disclose negotiation information without written permission or legal requirement.",
      },
      {
        text: "A licensee who has no brokerage relationship with a seller must still",
        options: [
          "A. provide loyalty and obedience",
          "B. provide full disclosure of negotiation strategies",
          "C. deal honestly and fairly and disclose known material defects",
          "D. place the seller's interests above all others",
        ],
        correctAnswer: "C",
        explanation: "Even with no brokerage relationship, licensees must deal honestly and fairly and disclose known material defects.",
      },
      {
        text: "In a designated sales associate transaction, the broker must",
        options: [
          "A. keep confidential information from each side and not use it to the detriment of the other party",
          "B. share all confidential information with both parties",
          "C. act as a dual agent",
          "D. personally represent the party with the higher offer",
        ],
        correctAnswer: "A",
        explanation: "In a designated sales associate arrangement, the broker must keep confidential information from each side and not use it to harm either party.",
      },
    ];

    sequenceNum = 0;
    for (const q of unit4Questions) {
      await db.insert(examQuestions).values({
        examId: unitExams[3].id,
        questionText: q.text,
        questionType: "multiple_choice",
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        options: JSON.stringify(q.options),
        sequence: sequenceNum++,
      });
    }
    console.log(`Added ${unit4Questions.length} sample questions to Unit 4 Quiz`);

    // Unit 5 questions (Brokerage Activities and Procedures)
    const unit5Questions = [
      {
        text: "A broker's office must be",
        options: [
          "A. a temporary shelter used for open houses",
          "B. a stationary physical location where business can be conducted privately",
          "C. located in a residence only",
          "D. registered every month",
        ],
        correctAnswer: "B",
        explanation: "A broker's office must be a physical, stationary building that provides privacy for conducting business.",
      },
      {
        text: "A branch office must be registered if",
        options: [
          "A. business is conducted there more than temporarily",
          "B. it is used only for negotiations",
          "C. it is located out of state",
          "D. it has fewer than three employees",
        ],
        correctAnswer: "A",
        explanation: "A branch office must be registered if the broker intends to conduct real estate business there more than temporarily.",
      },
      {
        text: "Which name must appear on the entrance sign of a brokerage office",
        options: [
          "A. The names of all sales associates",
          "B. The broker's name and the words Licensed Real Estate Broker",
          "C. The name of the MLS",
          "D. The team name only",
        ],
        correctAnswer: "B",
        explanation: "The entrance sign must include the broker's name and the words Licensed Real Estate Broker or the abbreviation Lic Real Estate Broker.",
      },
      {
        text: "A sales associate must deliver an earnest money deposit to the broker",
        options: [
          "A. immediately",
          "B. within three business days",
          "C. by the end of the next business day",
          "D. within five calendar days",
        ],
        correctAnswer: "C",
        explanation: "A sales associate must deliver a deposit to their broker no later than the end of the next business day.",
      },
      {
        text: "A broker must deposit earnest money into an escrow account",
        options: [
          "A. by the end of the third business day after the associate received it",
          "B. immediately",
          "C. by the end of the first business day",
          "D. within one week",
        ],
        correctAnswer: "A",
        explanation: "The broker must deposit funds into the trust account by the end of the third business day following receipt of the deposit by the licensee.",
      },
      {
        text: "Commingling occurs when a broker",
        options: [
          "A. deposits escrow funds into operating accounts",
          "B. deposits funds with a title company",
          "C. pays rent on behalf of a tenant",
          "D. accepts a check payable to a seller",
        ],
        correctAnswer: "A",
        explanation: "Commingling occurs when a broker mixes escrow funds with operating accounts, which is prohibited.",
      },
      {
        text: "A blind ad is one that",
        options: [
          "A. includes only the brokerage phone number",
          "B. fails to include the registered brokerage name",
          "C. lists the price without permission",
          "D. contains the broker's name only",
        ],
        correctAnswer: "B",
        explanation: "A blind ad is an advertisement that fails to disclose the licensed name of the brokerage.",
      },
      {
        text: "A sales associate may receive compensation from",
        options: [
          "A. the seller",
          "B. the buyer",
          "C. only their employing broker",
          "D. any broker participating in the transaction",
        ],
        correctAnswer: "C",
        explanation: "A sales associate may only be paid by their employing broker.",
      },
      {
        text: "Brokerage records must be retained for",
        options: [
          "A. three years",
          "B. five years",
          "C. ten years",
          "D. seven years",
        ],
        correctAnswer: "B",
        explanation: "A broker is required to maintain business records for at least five years.",
      },
      {
        text: "A Florida broker may pay a referral fee to an out of state broker if",
        options: [
          "A. the out of state broker participates physically in the Florida transaction",
          "B. the out of state broker does not physically participate",
          "C. both brokers are members of the same MLS",
          "D. the buyer agrees in writing",
        ],
        correctAnswer: "B",
        explanation: "A Florida broker may pay a referral fee to an out of state broker if the out of state broker does not physically participate in the transaction.",
      },
      {
        text: "Listings are legally the property of",
        options: [
          "A. the sales associate",
          "B. the buyer",
          "C. the broker",
          "D. the seller",
        ],
        correctAnswer: "C",
        explanation: "Listings are legally the property of the broker, not the sales associate.",
      },
      {
        text: "A sales associate leaves a brokerage. The associate may",
        options: [
          "A. take all personal clients and listings",
          "B. take only buyer clients",
          "C. take no listings unless the broker agrees",
          "D. transfer all pending closings to the new broker",
        ],
        correctAnswer: "C",
        explanation: "When a sales associate changes employers, they may not take listings without the broker's permission.",
      },
      {
        text: "An escrow dispute exists when",
        options: [
          "A. the buyer fails to make a deposit on time",
          "B. the buyer and seller make conflicting demands for the deposit",
          "C. the associate loses the deposit check",
          "D. the title company refuses to close",
        ],
        correctAnswer: "B",
        explanation: "An escrow dispute arises when there is a good faith doubt as to which party should receive the escrowed funds.",
      },
      {
        text: "One authorized settlement procedure is",
        options: [
          "A. commingling",
          "B. issuing a blind ad",
          "C. mediation",
          "D. self adjudication",
        ],
        correctAnswer: "C",
        explanation: "Authorized settlement procedures include mediation, arbitration, litigation, or a request for an escrow disbursement order.",
      },
      {
        text: "A sales associate holds an earnest money check over a weekend. The associate must",
        options: [
          "A. hold it until the buyer's lender approves",
          "B. deliver it to the broker no later than the end of the next business day",
          "C. hold it until the seller signs",
          "D. deliver it when convenient",
        ],
        correctAnswer: "B",
        explanation: "A sales associate must deliver deposits to the broker no later than the end of the next business day.",
      },
      {
        text: "A broker may keep personal money in an escrow account for",
        options: [
          "A. any purpose",
          "B. paying marketing expenses",
          "C. covering bank fees",
          "D. earning interest",
        ],
        correctAnswer: "C",
        explanation: "A broker may place a small amount of personal money in the trust account to cover bank fees only.",
      },
      {
        text: "Team advertising must always",
        options: [
          "A. use a team name that is larger than the brokerage name",
          "B. identify the brokerage name clearly",
          "C. include home addresses of all team members",
          "D. list the names of all team members",
        ],
        correctAnswer: "B",
        explanation: "Team advertising must follow strict rules and clearly identify the registered brokerage name.",
      },
      {
        text: "Failure to deposit escrow funds on time is",
        options: [
          "A. a ministerial issue only",
          "B. grounds for disciplinary action",
          "C. acceptable if disclosed",
          "D. permitted in new construction transactions",
        ],
        correctAnswer: "B",
        explanation: "Failure to deposit escrow funds on time is grounds for disciplinary action against the licensee.",
      },
      {
        text: "Which statement is correct regarding earnest money deposits",
        options: [
          "A. An associate may deposit checks directly into the escrow account",
          "B. The broker must deposit funds by the end of the third business day after receipt",
          "C. Deposits are returned automatically if a contract is cancelled",
          "D. Deposits must be held in an interest bearing account",
        ],
        correctAnswer: "B",
        explanation: "The broker must deposit earnest money into the trust account by the end of the third business day after receipt.",
      },
      {
        text: "Misleading advertising by a licensee is",
        options: [
          "A. legal if no one complains",
          "B. a violation of Florida law",
          "C. permitted online only",
          "D. allowed if the advertiser is a broker associate",
        ],
        correctAnswer: "B",
        explanation: "Misleading advertising by a licensee is a violation of Florida law and subject to disciplinary action.",
      },
    ];

    sequenceNum = 0;
    for (const q of unit5Questions) {
      await db.insert(examQuestions).values({
        examId: unitExams[4].id,
        questionText: q.text,
        questionType: "multiple_choice",
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        options: JSON.stringify(q.options),
        sequence: sequenceNum++,
      });
    }
    console.log(`Added ${unit5Questions.length} sample questions to Unit 5 Quiz`);

    // Unit 6 - Violations of License Law (20 questions)
    const unit6Questions = [
      { text: "The primary purpose of disciplinary action under Florida real estate license law is to", options: ["A. punish licensees", "B. protect the public", "C. increase state revenue", "D. reduce the number of licensees"], correctAnswer: "B", explanation: "Disciplinary action exists to protect the public from dishonest or incompetent licensees." },
      { text: "Commingling occurs when a broker", options: ["A. mixes escrow funds with personal or business funds", "B. deposits escrow funds in a title company", "C. places a sign on a property without permission", "D. pays commission to a cooperating broker"], correctAnswer: "A", explanation: "Commingling is mixing client funds with the broker's personal or business funds." },
      { text: "Conversion occurs when a broker", options: ["A. returns escrow funds to the wrong party by mistake", "B. deposits escrow funds in a trust account", "C. uses client funds for personal or business expenses without authorization", "D. changes from one broker to another"], correctAnswer: "C", explanation: "Conversion is using client funds for personal or business purposes without authorization." },
      { text: "Practicing real estate without a license is", options: ["A. a minor administrative infraction only", "B. a criminal offense and a violation of license law", "C. allowed if supervised by a broker", "D. permitted for out of state brokers"], correctAnswer: "B", explanation: "Practicing without a license is both a criminal offense and violation of license law." },
      { text: "Which of the following is the first step in the disciplinary process", options: ["A. probable cause determination", "B. filing of a formal complaint", "C. investigation", "D. receipt of a legally sufficient complaint"], correctAnswer: "D", explanation: "The process begins with receipt of a legally sufficient complaint." },
      { text: "A complaint is legally sufficient when it", options: ["A. is in writing and notarized", "B. contains facts that, if true, would be a violation of law or rule", "C. is submitted by another licensee", "D. is reviewed by the governor"], correctAnswer: "B", explanation: "Legal sufficiency requires facts that would constitute a violation if proven true." },
      { text: "After a complaint is found legally sufficient, the next step is", options: ["A. judicial review", "B. filing a lawsuit in civil court", "C. an investigation", "D. immediate suspension of the license"], correctAnswer: "C", explanation: "Investigation follows determination that the complaint is legally sufficient." },
      { text: "The probable cause panel", options: ["A. conducts the initial investigation", "B. issues the final order", "C. determines whether there is sufficient evidence of a violation", "D. pays claims from the Recovery Fund"], correctAnswer: "C", explanation: "The panel determines if probable cause exists based on the investigative report." },
      { text: "An informal hearing before FREC is used when", options: ["A. the licensee disputes material facts", "B. the licensee admits the facts but wants to be heard on the penalty", "C. the case involves criminal charges", "D. the complainant demands a jury trial"], correctAnswer: "B", explanation: "An informal hearing is for cases where facts are not disputed, only penalty is at issue." },
      { text: "A formal hearing is conducted by", options: ["A. the governor", "B. the Real Estate Recovery Fund", "C. an administrative law judge", "D. a county court judge"], correctAnswer: "C", explanation: "Formal hearings are before an administrative law judge for disputed material facts." },
      { text: "A final order in a disciplinary case is issued by", options: ["A. the administrative law judge", "B. the Department of State", "C. the Florida Real Estate Commission", "D. the county clerk"], correctAnswer: "C", explanation: "FREC issues the final order after the hearing process." },
      { text: "A notice of noncompliance is most likely used for", options: ["A. conversion of escrow funds", "B. serious criminal misconduct", "C. a minor first time violation that can be corrected", "D. unlicensed practice"], correctAnswer: "C", explanation: "Notices of noncompliance are for minor, first-time violations that can be quickly corrected." },
      { text: "A citation issued by DBPR", options: ["A. is a criminal charge", "B. is a type of administrative fine for certain listed violations", "C. automatically revokes a license", "D. cannot be disputed"], correctAnswer: "B", explanation: "A citation is an administrative fine that resolves certain violations without a full hearing." },
      { text: "Which of the following is a possible administrative penalty that FREC may impose", options: ["A. incarceration", "B. probation", "C. revocation followed by imprisonment", "D. only a warning, never suspension"], correctAnswer: "B", explanation: "FREC may impose probation as an administrative penalty; criminal penalties are not FREC's power." },
      { text: "Suspension of a real estate license means", options: ["A. the license is null and void and cannot be reinstated", "B. the licensee may practice only commercial real estate", "C. the licensee temporarily loses the right to practice for a set period", "D. the licensee may practice only under supervision"], correctAnswer: "C", explanation: "Suspension temporarily removes practice rights for a set period; the license is not permanent." },
      { text: "The Real Estate Recovery Fund is designed to", options: ["A. pay commissions to cooperating brokers", "B. reimburse licensees for business losses", "C. reimburse members of the public who suffer monetary damages because of licensee misconduct in certain situations", "D. pay advertising expenses for the Commission"], correctAnswer: "C", explanation: "The Fund reimburses injured consumers for certain monetary damages from licensee dishonesty." },
      { text: "Before a claimant may receive payment from the Real Estate Recovery Fund, the claimant usually must", options: ["A. file a complaint with the MLS", "B. obtain a civil judgment and show that collection was attempted and failed", "C. request an informal hearing", "D. apply to the local association of Realtors"], correctAnswer: "B", explanation: "A civil judgment and failed collection attempt are prerequisites for Recovery Fund claims." },
      { text: "Payment from the Real Estate Recovery Fund on behalf of a licensee generally results in", options: ["A. promotion of the licensee", "B. automatic suspension of the license until the Fund is repaid", "C. no effect on the licensee's status", "D. automatic renewal of the license"], correctAnswer: "B", explanation: "Fund payment triggers automatic license suspension until the Fund is repaid by the licensee." },
      { text: "Which of the following is most likely to result in revocation of a real estate license", options: ["A. Failing to complete continuing education on time one time", "B. Minor record keeping errors", "C. Conversion of escrow funds and serious fraud", "D. Failure to return a phone call"], correctAnswer: "C", explanation: "Serious violations like conversion and fraud are the most likely to result in revocation." },
      { text: "Judicial review of a final order in a disciplinary case is obtained by", options: ["A. filing a request with the Recovery Fund", "B. filing an appeal in the appropriate court within the allowed time", "C. appealing to the MLS", "D. sending a letter directly to FREC"], correctAnswer: "B", explanation: "Judicial review requires filing an appeal in the proper court within the legal timeframe." },
    ];

    sequenceNum = 0;
    for (const q of unit6Questions) {
      await db.insert(examQuestions).values({
        examId: unitExams[5].id,
        questionText: q.text,
        questionType: "multiple_choice",
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        options: JSON.stringify(q.options),
        sequence: sequenceNum++,
      });
    }
    console.log(`Added ${unit6Questions.length} questions to Unit 6 Quiz`);

    // Unit 7 - Federal and State Laws (20 questions)
    const unit7Questions = [
      { text: "The Civil Rights Act of 1866 prohibits discrimination based on", options: ["A. race only", "B. race and religion", "C. race and sex", "D. all protected classes"], correctAnswer: "A", explanation: "The Civil Rights Act of 1866 prohibits discrimination based solely on race with no exemptions." },
      { text: "Familial status under the Fair Housing Act includes", options: ["A. married couples only", "B. households with a child under eighteen", "C. senior citizens only", "D. individuals living alone"], correctAnswer: "B", explanation: "Familial status refers to households with children under age eighteen or pregnant individuals." },
      { text: "Steering occurs when a licensee", options: ["A. encourages owners to sell based on protected class", "B. directs buyers to or away from neighborhoods based on protected class", "C. refuses to finance a loan", "D. charges higher commissions"], correctAnswer: "B", explanation: "Steering is guiding buyers to or away from neighborhoods based on protected class membership." },
      { text: "Blockbusting involves", options: ["A. urging owners to sell because protected classes are moving in", "B. refusing to negotiate with buyers", "C. refusing to maintain a rental unit", "D. soliciting rentals in senior housing"], correctAnswer: "A", explanation: "Blockbusting is encouraging owners to sell based on protected classes moving into the area." },
      { text: "The Fair Housing Act protects all except", options: ["A. race", "B. sex", "C. marital status", "D. disability"], correctAnswer: "C", explanation: "The Fair Housing Act does not protect marital status; it protects seven classes including race, religion, sex, national origin, disability, and familial status." },
      { text: "The ADA applies primarily to", options: ["A. private residences only", "B. public accommodations such as sales and leasing offices", "C. all property with four or fewer units", "D. any home over ten years old"], correctAnswer: "B", explanation: "The ADA applies to public accommodations like model homes with public areas and sales offices." },
      { text: "RESPA prohibits", options: ["A. paying referral fees for sending customers to a lender", "B. collecting rent", "C. showing property without disclosure", "D. paying advertising costs"], correctAnswer: "A", explanation: "RESPA prohibits referral fees and kickbacks for business referrals." },
      { text: "A violation of RESPA can occur if a broker", options: ["A. receives a fee for actual title services performed", "B. receives a referral fee for sending business to a mortgage company", "C. provides a Loan Estimate", "D. charges a commission"], correctAnswer: "B", explanation: "RESPA violations include receiving referral fees; only fees for actual services are permitted." },
      { text: "ECOA prohibits discrimination based on", options: ["A. political affiliation", "B. marital status", "C. hobbies", "D. rental history"], correctAnswer: "B", explanation: "ECOA prohibits credit discrimination based on marital status and other protected factors." },
      { text: "Under antitrust law, price fixing occurs when", options: ["A. a broker charges a high commission", "B. two brokers agree to charge the same commission rate", "C. sellers agree to all accept offers at the same price", "D. buyers negotiate together"], correctAnswer: "B", explanation: "Price fixing is an illegal agreement between competitors to charge the same rates." },
      { text: "Market allocation occurs when brokers", options: ["A. advertise their listings together", "B. participate in a multiple offer situation", "C. agree to avoid competing in certain areas", "D. use the same photographer"], correctAnswer: "C", explanation: "Market allocation is an illegal agreement to divide geographic areas and avoid competition." },
      { text: "The Florida Residential Landlord Tenant Act requires landlords to", options: ["A. allow tenants to make any modifications they want without permission", "B. maintain the property in compliance with building, housing, and health codes", "C. pay for all tenant damages immediately", "D. never enter the rental unit during the lease term"], correctAnswer: "B", explanation: "Landlords must maintain habitability and comply with building and health codes." },
      { text: "Security deposits under Florida law must", options: ["A. be held in a non interest-bearing account only", "B. be refunded within 30 days regardless of damages", "C. be handled according to strict written notice and claims procedures", "D. be kept by the landlord as automatic compensation"], correctAnswer: "C", explanation: "Strict rules govern deposits including written notice of where held, interest bearing status, and claim procedures." },
      { text: "The Telephone Consumer Protection Act prohibits", options: ["A. all marketing calls", "B. marketing calls to do-not-call numbers without prior consent or business relationship", "C. telephone conversations only", "D. all business calls before 9 AM"], correctAnswer: "B", explanation: "The TCPA restricts calls to do-not-call numbers and limits calling hours for marketing." },
      { text: "The CAN-SPAM Act requires commercial emails to include", options: ["A. the sender's personal cell phone number", "B. a valid physical address of the sender and a clear opt-out link", "C. the recipient's social security number", "D. credit card information for verification"], correctAnswer: "B", explanation: "CAN-SPAM requires physical address, clear subject lines, and working unsubscribe links." },
      { text: "Which statement regarding commission rates is correct", options: ["A. Commissions are set by state law", "B. Commissions are set by local real estate associations", "C. Commissions are always negotiable between parties", "D. Commissions cannot exceed 6 percent"], correctAnswer: "C", explanation: "Commissions are negotiable; agreeing on standard rates violates antitrust law." },
      { text: "A group boycott violates antitrust law when", options: ["A. real estate agents refuse to work with a disreputable broker", "B. agents collectively agree not to cooperate with a specific firm or person", "C. a broker terminates an unproductive agent", "D. an agent changes brokers"], correctAnswer: "B", explanation: "Group boycotts are illegal agreements where competitors collectively refuse to deal with another party." },
      { text: "Redlining is prohibited under fair housing law and involves", options: ["A. refusing loans or insurance based on neighborhood characteristics rather than borrower qualifications", "B. using red pens to mark documents", "C. only affecting commercial properties", "D. requiring proof of citizenship"], correctAnswer: "A", explanation: "Redlining is denying credit or insurance based on neighborhood characteristics, not borrower merit." },
      { text: "A reasonable accommodation for a person with a disability might include", options: ["A. allowing a service animal in a no-pets policy", "B. physically modifying the property", "C. changing lease terms or policies", "D. any of the above"], correctAnswer: "D", explanation: "Reasonable accommodations include policy changes, modifications, and adaptive devices." },
      { text: "Affiliated business arrangements under RESPA", options: ["A. are always prohibited", "B. are permitted if proper written disclosure is provided and the arrangement is not mandatory", "C. require loan approval before disclosure", "D. are only allowed between family members"], correctAnswer: "B", explanation: "Affiliated businesses are legal with proper disclosure and without forcing buyer use of the affiliate." },
    ];

    sequenceNum = 0;
    for (const q of unit7Questions) {
      await db.insert(examQuestions).values({
        examId: unitExams[6].id,
        questionText: q.text,
        questionType: "multiple_choice",
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        options: JSON.stringify(q.options),
        sequence: sequenceNum++,
      });
    }
    console.log(`Added ${unit7Questions.length} questions to Unit 7 Quiz`);

    // Unit 8 - Property Rights & Estates (20 questions)
    const unit8Questions = [
      { text: "Which of the following best describes real property", options: ["A. Land only", "B. Land and personal property", "C. Land and everything permanently attached to it, plus legal rights", "D. Movable property only"], correctAnswer: "C", explanation: "Real property includes land, permanent attachments, and the legal rights of ownership." },
      { text: "The bundle of rights in real property includes all of the following except", options: ["A. right of possession", "B. right of exclusion", "C. right to determine zoning", "D. right of disposition"], correctAnswer: "C", explanation: "Zoning is determined by government entities, not individual property owners." },
      { text: "A fee simple estate is", options: ["A. a leasehold interest with a definite termination date", "B. a freehold estate with the greatest bundle of rights", "C. an interest limited to the holder's lifetime", "D. a non inheritable estate"], correctAnswer: "B", explanation: "Fee simple absolute is the largest freehold estate with the greatest bundle of property rights." },
      { text: "A life estate", options: ["A. always includes the right of survivorship", "B. lasts for a specific number of years", "C. terminates at the death of a named person", "D. is the same as a leasehold estate"], correctAnswer: "C", explanation: "A life estate terminates upon the death of the named life tenant." },
      { text: "A tenant who has possession of property for a fixed term under a written lease holds", options: ["A. a fee simple estate", "B. a tenancy in common", "C. an estate for years", "D. a life estate"], correctAnswer: "C", explanation: "An estate for years is a leasehold estate for a definite period under a lease." },
      { text: "Ownership in severalty means title is held", options: ["A. by two or more persons", "B. by a single person or legal entity", "C. under a lease", "D. by a married couple"], correctAnswer: "B", explanation: "Severalty ownership means a single person or entity holds exclusive title." },
      { text: "In a tenancy in common", options: ["A. each co owner has a right of survivorship", "B. each co owner's interest passes to heirs on death", "C. only married couples may hold title", "D. the interests must be equal"], correctAnswer: "B", explanation: "In a tenancy in common, interests pass to heirs or per will, with no right of survivorship." },
      { text: "The form of ownership for married couples in Florida that includes the right of survivorship is", options: ["A. tenancy in common", "B. joint tenancy", "C. tenancy by the entireties", "D. ownership in severalty"], correctAnswer: "C", explanation: "Tenancy by the entireties is for married couples and includes automatic survivorship rights." },
      { text: "Which statement regarding joint tenancy is correct", options: ["A. It has no right of survivorship", "B. It usually requires the four unities of possession, interest, time, and title", "C. It is only available to spouses", "D. It is the same as tenancy in common"], correctAnswer: "B", explanation: "Joint tenancy requires unity of possession, interest, time, and title to be valid." },
      { text: "Florida homestead protections apply primarily to", options: ["A. any rental property", "B. any vacant land", "C. an owner's primary residence, subject to certain limits", "D. commercial property only"], correctAnswer: "C", explanation: "Homestead protections are limited to the owner's primary residence with acreage limits." },
      { text: "In a condominium, the owner typically holds", options: ["A. a leasehold interest only", "B. stock in a corporation and a proprietary lease", "C. title to the unit interior plus an undivided interest in common elements", "D. no ownership in common areas"], correctAnswer: "C", explanation: "Condominium owners hold title to their unit and an undivided share of common areas." },
      { text: "In a cooperative, a resident usually owns", options: ["A. the interior of the unit in fee simple", "B. shares of stock in the corporation that owns the building", "C. an undivided interest in the entire building", "D. only a leasehold interest"], correctAnswer: "B", explanation: "Cooperative residents own corporate shares and have a proprietary lease to occupy a unit." },
      { text: "A condominium must be created by", options: ["A. a verbal agreement of all residents", "B. a county ordinance only", "C. a recorded declaration describing the property and unit owner rights", "D. approval by the local homeowners association"], correctAnswer: "C", explanation: "Condominiums are created by a recorded declaration that describes rights and common elements." },
      { text: "Homeowners associations enforce", options: ["A. criminal laws", "B. state building codes only", "C. covenants, conditions, and restrictions (CC&Rs)", "D. federal tax law"], correctAnswer: "C", explanation: "HOAs enforce CC&Rs, which are private contractual restrictions on property use." },
      { text: "A Community Development District (CDD)", options: ["A. is the same as a homeowners association", "B. is a special purpose government unit that finances infrastructure improvements", "C. only applies to commercial property", "D. has no impact on property owner assessments"], correctAnswer: "B", explanation: "CDDs are special government entities that finance infrastructure and levy assessments on residents." },
      { text: "In a fee simple time share, the buyer", options: ["A. owns a contractual right to use property for a period", "B. owns a fractional interest in real property", "C. cannot transfer the interest to heirs", "D. owns only a leasehold interest"], correctAnswer: "B", explanation: "Fee simple time shares involve ownership of a fractional real property interest." },
      { text: "In a right-to-use time share arrangement, the buyer", options: ["A. owns the entire property in fee simple", "B. owns a real property interest that can be inherited", "C. has a contractual right to occupy for a period but does not own real property", "D. owns stock in a corporation"], correctAnswer: "C", explanation: "Right-to-use is a contractual license to occupy; no real property ownership is transferred." },
      { text: "Time share contracts typically allow purchasers", options: ["A. no cancellation rights", "B. a rescission period during which they can cancel", "C. one year to decide if they want to keep it", "D. permanent transfer limitations"], correctAnswer: "B", explanation: "Consumer protection laws provide a rescission period for time share purchases." },
      { text: "A declaration of condominium must disclose", options: ["A. all unit owners' personal financial information", "B. the description of property, unit boundaries, common elements, and owner rights", "C. all resident complaints about neighbors", "D. future plans to increase assessments"], correctAnswer: "B", explanation: "Declarations must include property description, unit definitions, common areas, and owner rights." },
      { text: "The main difference between a condominium and a cooperative is", options: ["A. cooperatives have more amenities", "B. condos involve real property ownership; cooperatives involve corporate stock ownership", "C. only cooperatives are found in Florida", "D. condos always cost more"], correctAnswer: "B", explanation: "Condominiums involve direct real property ownership; cooperatives involve indirect ownership via corporate shares." },
    ];

    sequenceNum = 0;
    for (const q of unit8Questions) {
      await db.insert(examQuestions).values({
        examId: unitExams[7].id,
        questionText: q.text,
        questionType: "multiple_choice",
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        options: JSON.stringify(q.options),
        sequence: sequenceNum++,
      });
    }
    console.log(`Added ${unit8Questions.length} questions to Unit 8 Quiz`);

    // Unit 9 - Title, Deeds and Ownership Restrictions (20 questions)
    const unit9Questions = [
      { text: "Alienation refers to", options: ["A. the right to exclude others", "B. the transfer of ownership", "C. the creation of a lien", "D. the recording of a survey"], correctAnswer: "B", explanation: "Alienation means the transfer of ownership." },
      { text: "Voluntary alienation occurs through", options: ["A. foreclosure", "B. a deed or a will", "C. escheat", "D. adverse possession"], correctAnswer: "B", explanation: "Voluntary alienation occurs when the owner deliberately transfers title by deed or by will." },
      { text: "Constructive notice is provided by", options: ["A. personal delivery of a document", "B. verbal disclosure", "C. recording documents in the public records", "D. mailing a letter"], correctAnswer: "C", explanation: "Constructive notice is notice given by the public records when documents are properly recorded." },
      { text: "A deed must contain", options: ["A. the purchase price", "B. the signature of the grantee", "C. a granting clause", "D. a mortgage provision"], correctAnswer: "C", explanation: "A valid deed requires a granting clause but does not require purchase price or grantee signature." },
      { text: "Which deed provides the most warranties", options: ["A. quitclaim deed", "B. special warranty deed", "C. bargain and sale deed", "D. general warranty deed"], correctAnswer: "D", explanation: "A general warranty deed provides the most complete warranties of title." },
      { text: "A quitclaim deed is often used to", options: ["A. guarantee clear title", "B. remove a cloud on title", "C. give a lender more security", "D. transfer a mortgage"], correctAnswer: "B", explanation: "Quitclaim deeds are often used to clear clouds on title because they convey whatever interest exists." },
      { text: "Title insurance protects the", options: ["A. seller only", "B. buyer and lender", "C. title examiner", "D. broker only"], correctAnswer: "B", explanation: "Title insurance protects both the buyer and the lender against losses from title defects." },
      { text: "An easement is", options: ["A. a right to use another's land for a specific purpose", "B. a trespass by a structure", "C. a superior lien", "D. a government taking"], correctAnswer: "A", explanation: "An easement is a right to use another's land for a specific purpose." },
      { text: "An encroachment refers to", options: ["A. a zoning violation", "B. property crossing a lot line without permission", "C. a specific lien", "D. a government regulation"], correctAnswer: "B", explanation: "An encroachment occurs when a structure or improvement trespasses on another's property." },
      { text: "The government's power to take private property for public use is", options: ["A. police power", "B. escheat", "C. eminent domain", "D. taxation"], correctAnswer: "C", explanation: "Eminent domain is the right of government to take private property for public use with just compensation." },
      { text: "A variance allows", options: ["A. a change to the zoning classification", "B. a deviation from specific zoning requirements", "C. the government to take property", "D. a private restriction to be removed"], correctAnswer: "B", explanation: "A variance permits deviation from specific zoning requirements when strict compliance creates hardship." },
      { text: "Special assessments are", options: ["A. voluntary fees", "B. specific liens for improvements that benefit the property", "C. general liens on all assets", "D. zoning fines"], correctAnswer: "B", explanation: "Special assessments are specific liens for improvements that benefit the property." },
      { text: "The highest priority lien in Florida is", options: ["A. first mortgage lien", "B. judgment lien", "C. real estate property tax lien", "D. vendor lien"], correctAnswer: "C", explanation: "Real estate property tax liens always take priority over all other liens regardless of recording date." },
      { text: "Escheat occurs when", options: ["A. an owner donates land to a charity", "B. a property is abandoned", "C. a person dies without a will and without heirs", "D. a property is rezoned"], correctAnswer: "C", explanation: "Escheat occurs when a person dies without a will and without heirs, returning property to the state." },
      { text: "A special warranty deed protects the grantee", options: ["A. against all title defects in history", "B. only against defects arising during the grantor's ownership", "C. against encroachments", "D. against zoning violations"], correctAnswer: "B", explanation: "A special warranty deed limits warranties to defects that occurred during the grantor's ownership." },
      { text: "A deed restriction is", options: ["A. a government rule that must be followed", "B. a private limit placed on property use", "C. a new zoning requirement", "D. a mortgage term"], correctAnswer: "B", explanation: "Deed restrictions are private restrictions placed on property by previous owners or developers." },
      { text: "A survey is most likely to uncover", options: ["A. a superior lien", "B. an easement appurtenant", "C. an encroachment", "D. unpaid taxes"], correctAnswer: "C", explanation: "A survey is most likely to uncover encroachments as it measures exact boundary lines." },
      { text: "Title passes when a deed is", options: ["A. recorded only", "B. signed only", "C. delivered and accepted", "D. notarized"], correctAnswer: "C", explanation: "Title passes upon delivery and acceptance of a deed, not upon recording or notarization." },
      { text: "A lien for unpaid property taxes is", options: ["A. junior to a first mortgage", "B. always the lowest priority lien", "C. a superior lien", "D. equal to judgment liens"], correctAnswer: "C", explanation: "Property tax liens are superior liens with the highest priority of all liens." },
      { text: "Zoning is an example of", options: ["A. police power", "B. escheat", "C. private restriction", "D. eminent domain"], correctAnswer: "A", explanation: "Zoning is an example of police power, which is the authority to regulate property for public welfare." },
    ];

    sequenceNum = 0;
    for (const q of unit9Questions) {
      await db.insert(examQuestions).values({
        examId: unitExams[8].id,
        questionText: q.text,
        questionType: "multiple_choice",
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        options: JSON.stringify(q.options),
        sequence: sequenceNum++,
      });
    }
    console.log(`Added ${unit9Questions.length} questions to Unit 9 Quiz`);

    // Unit 10 - Real Estate Contracts (20 questions)
    const unit10Questions = [
      { text: "Which of the following is required for a valid contract", options: ["A. earnest money", "B. written document", "C. competent parties", "D. notarization"], correctAnswer: "C", explanation: "Competent parties is an essential element of a valid contract." },
      { text: "Consideration in a real estate contract refers to", options: ["A. the purchase price only", "B. something of legal value exchanged", "C. the broker's fee", "D. the appraisal value"], correctAnswer: "B", explanation: "Consideration is something of legal value that each party exchanges." },
      { text: "A voidable contract is", options: ["A. illegal", "B. unenforceable due to the Statute of Frauds", "C. valid until one party chooses to cancel it", "D. missing an essential element"], correctAnswer: "C", explanation: "A voidable contract is valid but can be set aside by one of the parties." },
      { text: "An executory contract is", options: ["A. fully performed", "B. signed but not delivered", "C. still in progress", "D. illegal"], correctAnswer: "C", explanation: "An executory contract is still in progress and has not been fully performed by all parties." },
      { text: "A counteroffer", options: ["A. accepts the original offer", "B. rejects the original offer", "C. requires the offeror to perform", "D. has no legal impact"], correctAnswer: "B", explanation: "Any change to the offer is not acceptance but a counteroffer that rejects the original offer." },
      { text: "The Statute of Frauds requires that", options: ["A. all agreements be written", "B. all real estate sales contracts be written to be enforceable", "C. leases under one year be written", "D. oral agreements be recorded"], correctAnswer: "B", explanation: "The Statute of Frauds requires contracts for the sale of real property to be in writing." },
      { text: "Oral leases longer than one year are", options: ["A. void", "B. enforceable without limitations", "C. unenforceable under the Statute of Frauds", "D. valid only with earnest money"], correctAnswer: "C", explanation: "Leases for more than one year must be in writing to be enforceable under the Statute of Frauds." },
      { text: "Specific performance is", options: ["A. a monetary award", "B. a court order requiring the breaching party to perform", "C. a form of rescission", "D. a type of assignment"], correctAnswer: "B", explanation: "Specific performance is a remedy where the court orders the breaching party to perform as agreed." },
      { text: "Liquidated damages", options: ["A. are determined by a jury", "B. must be equal to ten percent of the purchase price", "C. are pre agreed damages written into the contract", "D. are never allowed in real estate contracts"], correctAnswer: "C", explanation: "Liquidated damages are damages agreed to in advance and written into the contract." },
      { text: "A listing agreement must", options: ["A. renew automatically", "B. include a definite termination date", "C. be open ended", "D. be verbal"], correctAnswer: "B", explanation: "All listing agreements must contain a definite termination date and must be in writing." },
      { text: "In an exclusive right of sale listing", options: ["A. the broker earns a commission only if the broker finds the buyer", "B. the owner may avoid paying a commission by finding the buyer", "C. the broker earns a commission regardless of who finds the buyer", "D. more than one broker may list the property"], correctAnswer: "C", explanation: "In an exclusive right of sale, the broker earns a commission regardless of who finds the buyer." },
      { text: "A buyer brokerage agreement", options: ["A. is optional and may be oral", "B. must be written and must contain a termination date", "C. is prohibited from including compensation", "D. is not covered by the Statute of Frauds"], correctAnswer: "B", explanation: "Buyer brokerage agreements must be in writing and contain a definite termination date." },
      { text: "Assignment transfers", options: ["A. title", "B. contract rights and obligations", "C. ownership of real property", "D. possession only"], correctAnswer: "B", explanation: "An assignment transfers contract rights and obligations from one party to another." },
      { text: "Novation", options: ["A. cancels a contract without replacement", "B. substitutes a new contract that replaces the original", "C. transfers possession", "D. is a type of financing"], correctAnswer: "B", explanation: "Novation replaces the original contract with a new one and releases the original party." },
      { text: "A void contract is", options: ["A. valid unless challenged", "B. missing an essential element", "C. enforceable only with witnesses", "D. the same as a voidable contract"], correctAnswer: "B", explanation: "A void contract is missing one or more required elements and has no legal effect." },
      { text: "A bilateral contract contains", options: ["A. a promise for an act", "B. a promise for a promise", "C. an obligation only on one side", "D. no obligations"], correctAnswer: "B", explanation: "A bilateral contract contains promises from both sides." },
      { text: "A listing agreement creates", options: ["A. an ownership interest", "B. an employment relationship", "C. a leasehold", "D. a mortgage"], correctAnswer: "B", explanation: "Listing agreements are employment contracts between property owners and brokers." },
      { text: "Contract termination by impossibility occurs when", options: ["A. the parties disagree", "B. performance becomes legally or physically impossible", "C. one party wants to renegotiate", "D. the buyer finds a better property"], correctAnswer: "B", explanation: "A contract terminates through impossibility when performance becomes legally or physically impossible." },
      { text: "A contract that appears valid but cannot be enforced in court due to legal defenses is", options: ["A. void", "B. voidable", "C. unenforceable", "D. executed"], correctAnswer: "C", explanation: "An unenforceable contract appears valid but cannot be enforced in court due to legal defenses." },
      { text: "The Statute of Limitations for an action on a written contract in Florida is", options: ["A. two years", "B. three years", "C. five years", "D. seven years"], correctAnswer: "C", explanation: "In Florida, written contracts have a five year limitation period for lawsuits." },
    ];

    sequenceNum = 0;
    for (const q of unit10Questions) {
      await db.insert(examQuestions).values({
        examId: unitExams[9].id,
        questionText: q.text,
        questionType: "multiple_choice",
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        options: JSON.stringify(q.options),
        sequence: sequenceNum++,
      });
    }
    console.log(`Added ${unit10Questions.length} questions to Unit 10 Quiz`);

    // Unit 11 - Residential Mortgages (20 questions)
    const unit11Questions = [
      { text: "Florida is a", options: ["A. title theory state", "B. lien theory state", "C. hybrid theory state", "D. deed theory state"], correctAnswer: "B", explanation: "In lien theory, the borrower holds legal title and the lender has a lien on the property." },
      { text: "The promissory note", options: ["A. pledges the property as collateral", "B. is the borrower's written promise to repay the loan", "C. is recorded in the public records", "D. conveys title"], correctAnswer: "B", explanation: "The promissory note is the promise to repay the loan specifying amount, rate, and terms." },
      { text: "The mortgage", options: ["A. transfers title to the lender", "B. pledges the property as security", "C. sets the interest rate", "D. replaces the promissory note"], correctAnswer: "B", explanation: "The mortgage is the security instrument pledging property as collateral for the debt." },
      { text: "The clause that allows a lender to demand full repayment after default is the", options: ["A. habendum clause", "B. acceleration clause", "C. seisin clause", "D. granting clause"], correctAnswer: "B", explanation: "The acceleration clause allows the lender to demand full repayment if the borrower defaults." },
      { text: "An adjustable rate mortgage", options: ["A. has a fixed interest rate for the entire term", "B. changes interest rates at set intervals based on an index and margin", "C. contains no interest payments", "D. can never adjust upward"], correctAnswer: "B", explanation: "ARMs have interest rates that change at specified intervals based on an index and margin." },
      { text: "FHA", options: ["A. lends money directly to borrowers", "B. insures lenders against losses", "C. guarantees loans", "D. enforces zoning laws"], correctAnswer: "B", explanation: "FHA insures lenders against loss if the borrower defaults." },
      { text: "VA loans", options: ["A. require monthly mortgage insurance", "B. are insured by FHA", "C. may require no down payment", "D. are only for retired veterans"], correctAnswer: "C", explanation: "VA loans are guaranteed by the Department of Veterans Affairs and may require no down payment." },
      { text: "A conventional loan is", options: ["A. insured by FHA", "B. guaranteed by VA", "C. not backed by the federal government", "D. only available through credit unions"], correctAnswer: "C", explanation: "Conventional loans are not insured or guaranteed by the federal government." },
      { text: "The housing expense ratio compares", options: ["A. total debt to net income", "B. monthly housing cost to gross income", "C. the down payment to property value", "D. loan costs to closing costs"], correctAnswer: "B", explanation: "The housing expense ratio compares monthly housing cost to borrower's gross monthly income." },
      { text: "The total debt ratio includes", options: ["A. housing costs only", "B. credit card debt, car loans, and housing costs", "C. down payment plus taxes", "D. closing costs"], correctAnswer: "B", explanation: "The total debt ratio compares all monthly obligations to gross monthly income." },
      { text: "Loan to value ratio equals", options: ["A. loan amount divided by property value", "B. down payment divided by loan amount", "C. interest rate divided by property value", "D. closing costs divided by loan amount"], correctAnswer: "A", explanation: "LTV is the loan amount divided by the property value." },
      { text: "One discount point equals", options: ["A. one percent of the purchase price", "B. one percent of the loan amount", "C. ten percent of the loan amount", "D. one half of one percent of the property value"], correctAnswer: "B", explanation: "One discount point equals one percent of the loan amount." },
      { text: "In a fully amortized loan", options: ["A. interest only is paid", "B. payments are interest only for the first half of the loan", "C. the loan balance never reaches zero", "D. each payment reduces principal"], correctAnswer: "D", explanation: "In a fully amortized loan each payment reduces the principal until the loan is paid off." },
      { text: "Early payments in an amortized loan", options: ["A. consist mostly of interest", "B. consist mostly of principal", "C. are equal parts principal and interest", "D. are all applied to the down payment"], correctAnswer: "A", explanation: "Early payments in an amortized loan consist mostly of interest." },
      { text: "A short sale occurs when", options: ["A. the borrower pays off the loan early", "B. the lender modifies the loan", "C. the property is sold for less than the loan balance with lender approval", "D. the loan term is reduced"], correctAnswer: "C", explanation: "A short sale is when property is sold for less than the loan balance with lender approval." },
      { text: "A deficiency judgment", options: ["A. occurs when the lender owes the borrower money after foreclosure", "B. is prohibited in Florida", "C. is a claim for the unpaid balance after foreclosure", "D. applies only to FHA loans"], correctAnswer: "C", explanation: "A deficiency judgment is a claim for the unpaid balance after foreclosure." },
      { text: "The due on sale clause", options: ["A. prevents foreclosure", "B. allows the loan to be assumed without approval", "C. requires the borrower to pay the loan in full if the property is transferred", "D. applies only to VA loans"], correctAnswer: "C", explanation: "The due on sale clause requires the loan to be paid off if the property is transferred." },
      { text: "FHA loans require", options: ["A. an upfront mortgage insurance premium", "B. no mortgage insurance", "C. a down payment of at least 20 percent", "D. a veteran's certificate"], correctAnswer: "A", explanation: "FHA loans require an upfront mortgage insurance premium plus annual amounts." },
      { text: "VA guarantees", options: ["A. the borrower's employment", "B. part of the loan for eligible veterans", "C. the home will appraise over value", "D. the interest rate"], correctAnswer: "B", explanation: "VA guarantees part of the loan for eligible veterans." },
      { text: "The primary mortgage market consists of", options: ["A. agencies that buy loans from lenders", "B. lenders who originate loans", "C. investors who buy mortgage backed securities", "D. insurance companies only"], correctAnswer: "B", explanation: "The primary mortgage market consists of lenders who originate loans." },
    ];

    sequenceNum = 0;
    for (const q of unit11Questions) {
      await db.insert(examQuestions).values({
        examId: unitExams[10].id,
        questionText: q.text,
        questionType: "multiple_choice",
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        options: JSON.stringify(q.options),
        sequence: sequenceNum++,
      });
    }
    console.log(`Added ${unit11Questions.length} questions to Unit 11 Quiz`);

    // Unit 12 - The Real Estate Market and Analysis (20 questions)
    const unit12Questions = [
      { text: "Value exists when a property has", options: ["A. scarcity only", "B. utility only", "C. scarcity, utility, demand, and transferability", "D. zoning approval only"], correctAnswer: "C", explanation: "All four characteristics are required: scarcity, utility, demand, and transferability." },
      { text: "Cost refers to", options: ["A. the amount paid in the market", "B. the worth to typical buyers", "C. the expense required to create the property", "D. the appraised value"], correctAnswer: "C", explanation: "Cost is the total production expense required to create a property." },
      { text: "When supply increases and demand remains stable", options: ["A. prices rise", "B. prices fall", "C. prices stay the same", "D. supply becomes irrelevant"], correctAnswer: "B", explanation: "When supply increases and demand remains stable, prices fall." },
      { text: "Market equilibrium occurs when", options: ["A. supply and demand are balanced", "B. prices fall", "C. prices rise", "D. only buyers control the market"], correctAnswer: "A", explanation: "Market equilibrium occurs when supply and demand are balanced." },
      { text: "Substitution means that", options: ["A. buyers prefer older homes", "B. value is maximized by unique properties", "C. buyers will not pay more for a property than the price of a comparable substitute", "D. appraisers ignore comparables"], correctAnswer: "C", explanation: "Buyers will not pay more for a property than the cost of acquiring a similar substitute." },
      { text: "Highest and best use must be", options: ["A. physically possible", "B. legally permissible", "C. financially feasible", "D. all of the above"], correctAnswer: "D", explanation: "Highest and best use must be physically possible, legally permissible, and financially feasible." },
      { text: "Conformity suggests that", options: ["A. value is created when property differs from the neighborhood", "B. value is created when property is similar to surrounding properties", "C. zoning is irrelevant", "D. the largest home always has the lowest value"], correctAnswer: "B", explanation: "Value is created when property is similar in style and quality to surrounding properties." },
      { text: "Progression means that", options: ["A. a superior property loses value", "B. a smaller property may gain value when near larger or higher quality properties", "C. improvements always increase value", "D. land value decreases naturally"], correctAnswer: "B", explanation: "Progression means a smaller property may increase in value near higher quality properties." },
      { text: "Contribution means", options: ["A. each improvement adds equal value", "B. value of an improvement is measured by what it adds to the property", "C. the tax assessor sets value", "D. the builder determines value"], correctAnswer: "B", explanation: "Contribution measures the value of an improvement by what it adds to property value." },
      { text: "Economic forces affecting value include", options: ["A. zoning", "B. climate", "C. employment and income", "D. physical dimensions"], correctAnswer: "C", explanation: "Economic forces include employment levels, income, inflation, and interest rates." },
      { text: "Physical forces affecting value include", options: ["A. interest rates", "B. taxes", "C. climate and topography", "D. wage growth"], correctAnswer: "C", explanation: "Physical forces include climate, topography, environment, and natural resources." },
      { text: "Government forces affecting value include", options: ["A. household size", "B. population trends", "C. zoning and building codes", "D. competition"], correctAnswer: "C", explanation: "Government forces include zoning, taxes, building codes, and land use regulations." },
      { text: "Social forces include", options: ["A. inflation", "B. interest rates", "C. population trends", "D. construction costs"], correctAnswer: "C", explanation: "Social forces include population trends, household size, migration patterns, and lifestyle preferences." },
      { text: "Market cycles typically follow which sequence", options: ["A. decline, fall, expansion", "B. peak, expansion, recovery, decline", "C. expansion, peak, contraction, recovery", "D. recovery, decline, contraction, expansion"], correctAnswer: "C", explanation: "Market cycles move through expansion, peak, contraction, and recovery phases." },
      { text: "Residential demand is influenced most by", options: ["A. vacancy rates", "B. traffic counts", "C. household income and employment", "D. zoning for industrial use"], correctAnswer: "C", explanation: "Residential demand is influenced by population growth, employment, and wage levels." },
      { text: "Commercial demand is influenced most by", options: ["A. school quality", "B. weather", "C. traffic counts and visibility", "D. number of bedrooms"], correctAnswer: "C", explanation: "Commercial demand focuses on traffic counts, access, visibility, and parking." },
      { text: "Housing starts measure", options: ["A. land availability", "B. new construction activity", "C. consumer confidence only", "D. mortgage underwriting"], correctAnswer: "B", explanation: "Housing starts measure the number of new construction projects." },
      { text: "Absorption rate measures", options: ["A. mortgage rates", "B. spending habits", "C. how quickly properties are sold or leased", "D. number of builders"], correctAnswer: "C", explanation: "Absorption rate measures the speed at which available properties are sold or leased." },
      { text: "High vacancy rates indicate", options: ["A. oversupply", "B. strong demand", "C. equilibrium", "D. high prices"], correctAnswer: "A", explanation: "High vacancy rates signal oversupply in the market." },
      { text: "Consumer confidence affects real estate by", options: ["A. determining zoning", "B. influencing population size", "C. increasing or decreasing spending and investment", "D. setting interest rates"], correctAnswer: "C", explanation: "Consumer confidence increases or decreases spending and investment in real estate." },
    ];

    sequenceNum = 0;
    for (const q of unit12Questions) {
      await db.insert(examQuestions).values({
        examId: unitExams[11].id,
        questionText: q.text,
        questionType: "multiple_choice",
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        options: JSON.stringify(q.options),
        sequence: sequenceNum++,
      });
    }
    console.log(`Added ${unit12Questions.length} questions to Unit 12 Quiz`);

    // Add placeholder questions for remaining units (Units 13-19)
    for (let i = 12; i < units.length; i++) {
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
    console.log(`Added placeholder questions for Units 13-19 (20 questions each)`);

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
