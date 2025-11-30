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

    // Add placeholder questions for remaining units (Units 5-19)
    for (let i = 4; i < units.length; i++) {
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
    console.log(`Added placeholder questions for Units 5-19 (20 questions each)`);

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
