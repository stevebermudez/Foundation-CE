import { db } from "./db";
import { courses, units, lessons, practiceExams, examQuestions } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedFRECIIBroker() {
  try {
    console.log("Seeding FREC II - Florida Real Estate Broker Pre-Licensing (72 hours)...");

    // Check if course already exists
    const existingCourse = await db
      .select()
      .from(courses)
      .where(eq(courses.sku, "FL-RE-PL-BROKER-72"));
    
    if (existingCourse.length > 0) {
      console.log("✓ FREC II Broker course already exists");
      return existingCourse[0];
    }

    // Create main course
    const courseResult = await db
      .insert(courses)
      .values({
        title: "Florida Real Estate Broker Pre-Licensing (FREC II)",
        description:
          "Complete 72-hour broker pre-licensing course for Florida real estate brokers. Covers 18 sessions including brokerage operations, property valuation, listing and selling, investment real estate, property management, and more. Includes comprehensive final exams. Prepares for Florida broker license exam.",
        productType: "RealEstate",
        state: "FL",
        licenseType: "Broker",
        requirementCycleType: "Pre-Licensing",
        requirementBucket: "Pre-Licensing Mandatory",
        hoursRequired: 72,
        deliveryMethod: "Self-Paced Online",
        price: 9999, // $99.99
        sku: "FL-RE-PL-BROKER-72",
        renewalApplicable: 0,
        expirationMonths: 12,
      })
      .returning();

    const course = courseResult[0];
    console.log(`Created FREC II course: ${course.id}`);

    // 18 Sessions/Units for FREC II
    const sessionDefs = [
      { number: 1, title: "Becoming a Licensed Real Estate Broker", hours: 4, part: "I" },
      { number: 2, title: "Opening a Real Estate Office", hours: 4, part: "I" },
      { number: 3, title: "Owning, Managing and Supervising a Real Estate Office", hours: 4, part: "I" },
      { number: 4, title: "Escrow Management", hours: 4, part: "I" },
      { number: 5, title: "Office Inspections, Disciplinary Process and Real Estate Recovery Fund", hours: 4, part: "I" },
      { number: 6, title: "Overview of Real Estate Valuation", hours: 4, part: "II" },
      { number: 7, title: "Sales Comparison, Cost-Depreciation and Income Approaches", hours: 4, part: "II" },
      { number: 8, title: "Comparative Market Analysis", hours: 4, part: "II" },
      { number: 9, title: "Business Valuation", hours: 4, part: "II" },
      { number: 10, title: "Agency Relationships and Disclosure Requirements", hours: 4, part: "III" },
      { number: 11, title: "Contracts", hours: 4, part: "III" },
      { number: 12, title: "Financing Real Estate", hours: 4, part: "III" },
      { number: 13, title: "Closing Real Estate Transactions", hours: 4, part: "III" },
      { number: 14, title: "Federal Income Tax Laws", hours: 4, part: "III" },
      { number: 15, title: "Investment Real Estate", hours: 4, part: "IV" },
      { number: 16, title: "Zoning and Planning, Subdividing of Land, and Special Issues", hours: 4, part: "IV" },
      { number: 17, title: "Environmental Issues Affecting Real Estate Transactions", hours: 4, part: "IV" },
      { number: 18, title: "Property Management", hours: 4, part: "IV" },
    ];

    // Create units
    const createdUnits = [];
    for (const session of sessionDefs) {
      const partName = session.part === "I" ? "Getting Started in the Real Estate Brokerage Business" :
                       session.part === "II" ? "Valuing Real Property" :
                       session.part === "III" ? "Listing and Selling Real Property" : "Specialties";
      
      const unitResult = await db
        .insert(units)
        .values({
          courseId: course.id,
          unitNumber: session.number,
          title: `Session ${session.number}: ${session.title}`,
          description: `Part ${session.part}: ${partName} - ${session.title}. Duration: ${session.hours} hours.`,
          hoursRequired: session.hours,
          sortOrder: session.number,
        })
        .returning();
      createdUnits.push(unitResult[0]);
    }
    console.log(`Created ${createdUnits.length} units`);

    // Create 3 lessons per unit (segments)
    const lessonsBySession: Record<number, string[]> = {
      1: ["Broker License Application Requirements", "Nonresident Applicants and Mutual Recognition", "Education and Experience Requirements"],
      2: ["Business Entity Options", "Office Location and Requirements", "Trade Name Registration and Signage"],
      3: ["Broker Supervision Responsibilities", "Sales Associate Supervision", "Office Policies and Procedures"],
      4: ["Escrow Account Requirements", "Deposit Procedures and Deadlines", "Monthly Reconciliation and Records"],
      5: ["Office Inspections", "Disciplinary Process and Penalties", "Real Estate Recovery Fund"],
      6: ["Appraisal Overview and USPAP", "State Certification Requirements", "Value, Price, and Cost Concepts"],
      7: ["Sales Comparison Approach", "Cost-Depreciation Approach", "Income Capitalization Approach"],
      8: ["CMA Purpose and Components", "Selecting Comparables", "Adjustments and Reconciliation"],
      9: ["Business Valuation Methods", "Asset-Based Valuation", "Income-Based Business Valuation"],
      10: ["Agency Relationship Types", "Single Agent vs Transaction Broker", "Disclosure Requirements and Timing"],
      11: ["Contract Essentials and Requirements", "Purchase Agreements and Contingencies", "Listing Agreements and Options"],
      12: ["Mortgage Types and Terms", "Loan Qualification Process", "Government and Conventional Financing"],
      13: ["Closing Procedures Overview", "Prorations and Settlement Statements", "Documentary Stamps and Recording"],
      14: ["Tax Benefits of Real Estate Ownership", "Capital Gains and Depreciation", "1031 Exchanges and Tax Planning"],
      15: ["Investment Analysis Fundamentals", "Cash Flow and Return Calculations", "Commercial Property Types"],
      16: ["Zoning Classifications and Regulations", "Land Development Process", "Environmental and ADA Considerations"],
      17: ["Environmental Hazards Overview", "Phase I and II Assessments", "Disclosure and Liability Issues"],
      18: ["Property Management Fundamentals", "Tenant Relations and Leasing", "Maintenance and Financial Management"],
    };

    for (const unit of createdUnits) {
      const lessonTitles = lessonsBySession[unit.unitNumber] || [];
      for (let i = 0; i < lessonTitles.length; i++) {
        await db.insert(lessons).values({
          unitId: unit.id,
          lessonNumber: i + 1,
          title: lessonTitles[i],
          description: `Lesson ${i + 1} of Session ${unit.unitNumber}: ${lessonTitles[i]}`,
          lessonContent: `<h2>${lessonTitles[i]}</h2><p>This lesson covers the key concepts and requirements related to ${lessonTitles[i].toLowerCase()} in Florida real estate brokerage.</p>`,
          sortOrder: i + 1,
        });
      }
    }
    console.log("Created 54 lessons (3 per session)");

    // Create unit quizzes (15 questions each, 3 per session = 54 total)
    const unitExams = [];
    for (const unit of createdUnits) {
      const examResult = await db
        .insert(practiceExams)
        .values({
          courseId: course.id,
          title: `Session ${unit.unitNumber} Quiz: ${sessionDefs[unit.unitNumber - 1].title}`,
          description: `15-question quiz covering Session ${unit.unitNumber}`,
          totalQuestions: 15,
          passingScore: 70,
          isActive: 1,
        })
        .returning();
      unitExams.push(examResult[0]);
    }
    console.log(`Created ${unitExams.length} session quizzes`);

    // Create Final Exam Form A
    const finalExamA = await db
      .insert(practiceExams)
      .values({
        courseId: course.id,
        title: "FREC II Final Exam - Form A",
        description: "Comprehensive 100-question final exam covering all 18 sessions of the broker pre-licensing course",
        totalQuestions: 100,
        passingScore: 75,
        isActive: 1,
        formVersion: "A",
      })
      .returning();
    console.log(`Created Final Exam Form A: ${finalExamA[0].id}`);

    // Create Final Exam Form B
    const finalExamB = await db
      .insert(practiceExams)
      .values({
        courseId: course.id,
        title: "FREC II Final Exam - Form B",
        description: "Comprehensive 100-question final exam covering all 18 sessions of the broker pre-licensing course",
        totalQuestions: 100,
        passingScore: 75,
        isActive: 1,
        formVersion: "B",
      })
      .returning();
    console.log(`Created Final Exam Form B: ${finalExamB[0].id}`);

    // Add sample questions to Session 1 Quiz
    const session1Questions = [
      {
        text: "A broker license requires how many months as a sales associate?",
        options: ["A. 12", "B. 18", "C. 24", "D. 36"],
        correctAnswer: "C",
        explanation: "To qualify for a Florida broker license, an applicant must have been actively licensed as a sales associate for at least 24 months within the preceding 5 years."
      },
      {
        text: "The Florida broker pre-licensing education requirement is:",
        options: ["A. 45 hours", "B. 63 hours", "C. 72 hours", "D. 84 hours"],
        correctAnswer: "C",
        explanation: "The Florida broker pre-licensing course (FREC Course II) is 72 hours."
      },
      {
        text: "A newly licensed broker must complete post-licensing education:",
        options: ["A. Within 6 months", "B. Within the first year", "C. Before the first license renewal", "D. Within 60 days"],
        correctAnswer: "C",
        explanation: "Newly licensed brokers must complete 60 hours of post-licensing education before their first license renewal."
      },
      {
        text: "Continuing education for Florida brokers requires how many hours per renewal cycle?",
        options: ["A. 10 hours", "B. 14 hours", "C. 21 hours", "D. 28 hours"],
        correctAnswer: "B",
        explanation: "Florida real estate brokers must complete 14 hours of continuing education every two years."
      },
      {
        text: "The mandatory core law portion of continuing education is:",
        options: ["A. 3 hours", "B. 4 hours", "C. 7 hours", "D. 14 hours"],
        correctAnswer: "A",
        explanation: "The core law requirement is 3 hours of the 14 total CE hours required."
      },
      {
        text: "Self-reporting of criminal convictions to DBPR must occur within:",
        options: ["A. 10 days", "B. 30 days", "C. 60 days", "D. 90 days"],
        correctAnswer: "B",
        explanation: "Licensed brokers must self-report criminal convictions within 30 days."
      },
      {
        text: "A Florida resident for licensing purposes has resided in Florida for:",
        options: ["A. 2 consecutive months", "B. 4 consecutive months", "C. 6 consecutive months", "D. 12 consecutive months"],
        correctAnswer: "B",
        explanation: "A person is considered a Florida resident for licensing purposes if they have resided in Florida for at least 4 consecutive months."
      },
      {
        text: "Mutual recognition agreements allow:",
        options: ["A. Automatic licensure", "B. Waiver of pre-license education", "C. No examination required", "D. No background check"],
        correctAnswer: "B",
        explanation: "Mutual recognition agreements provide waiver of pre-license education and experience requirements, but still require completing a Florida law course and passing the Florida exam."
      },
      {
        text: "The broker license examination passing score is:",
        options: ["A. 70%", "B. 75%", "C. 80%", "D. 85%"],
        correctAnswer: "B",
        explanation: "The passing score for the Florida broker license examination is 75% (75 correct answers out of 100)."
      },
      {
        text: "Post-licensing education for new brokers consists of:",
        options: ["A. 30 hours", "B. 45 hours", "C. 60 hours", "D. 72 hours"],
        correctAnswer: "C",
        explanation: "New brokers must complete 60 hours of post-licensing education."
      },
      {
        text: "If an applicant fails to disclose a criminal conviction on the application:",
        options: ["A. The application is approved with conditions", "B. It constitutes grounds for denial", "C. A warning is issued", "D. No consequences"],
        correctAnswer: "B",
        explanation: "Failure to disclose required information on the application constitutes grounds for denial or disciplinary action."
      },
      {
        text: "The attorney exception for broker pre-license education requires:",
        options: ["A. 2 years Florida practice", "B. 5 years Florida practice", "C. 10 years Florida practice", "D. Any Florida Bar membership"],
        correctAnswer: "B",
        explanation: "Active members of The Florida Bar must have practiced law in Florida for at least five years to qualify for the attorney exception."
      },
      {
        text: "Course completion certificates are valid for:",
        options: ["A. 1 year", "B. 2 years", "C. 3 years", "D. 5 years"],
        correctAnswer: "B",
        explanation: "Course completion certificates are valid for two years from the completion date."
      },
      {
        text: "Which is NOT a state with mutual recognition with Florida?",
        options: ["A. Georgia", "B. Alabama", "C. California", "D. Arkansas"],
        correctAnswer: "C",
        explanation: "California does not have a mutual recognition agreement with Florida. Florida has mutual recognition with states like Alabama, Arkansas, Georgia, and others."
      },
      {
        text: "Active military personnel stationed in Florida may receive:",
        options: ["A. License fee waivers", "B. Education exemptions", "C. Examination waivers", "D. All of the above"],
        correctAnswer: "A",
        explanation: "Active duty military members stationed in Florida may receive fee waivers for license applications."
      }
    ];

    let seqNum = 0;
    for (const q of session1Questions) {
      await db.insert(examQuestions).values({
        examId: unitExams[0].id,
        questionText: q.text,
        questionType: "multiple_choice",
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        options: JSON.stringify(q.options),
        sequence: seqNum++,
      });
    }
    console.log(`Added ${session1Questions.length} questions to Session 1 Quiz`);

    // Add questions to Final Exam Form A (first 50 from document)
    const finalExamAQuestions = [
      { text: "A sales associate who has been licensed for 30 months and completed the 72-hour broker course may:", options: ["A. Immediately practice as a broker", "B. Apply to take the broker examination", "C. Only practice under supervision for another year", "D. Apply for a broker associate license without examination"], correctAnswer: "B", explanation: "After meeting the 24-month experience requirement and completing the broker course, the applicant may apply to take the broker examination." },
      { text: "A broker must display at the office entrance:", options: ["A. Photos of all sales associates", "B. A sign with the brokerage name and 'Licensed Real Estate Broker'", "C. The broker's personal license only", "D. A list of recent sales"], correctAnswer: "B", explanation: "Brokers must display a sign at the office entrance showing the brokerage name and 'Licensed Real Estate Broker'." },
      { text: "Self-reporting of criminal convictions to DBPR must occur within:", options: ["A. 10 days", "B. 30 days", "C. 60 days", "D. 90 days"], correctAnswer: "B", explanation: "Licensees must self-report criminal convictions within 30 days." },
      { text: "Which violation would most likely result in license revocation?", options: ["A. Late license renewal", "B. Conversion of escrow funds", "C. Failure to display office sign", "D. First-time advertising violation"], correctAnswer: "B", explanation: "Conversion of escrow funds is one of the most serious violations and typically results in license revocation." },
      { text: "A citation may be issued for:", options: ["A. Fraud", "B. Minor violations with established penalty schedules", "C. Conversion", "D. Operating without a license"], correctAnswer: "B", explanation: "Citations are used for minor violations that have established penalty schedules." },
      { text: "The Recovery Fund is financed by:", options: ["A. State general revenue only", "B. Licensee fees and assessments", "C. Federal grants", "D. Court fines"], correctAnswer: "B", explanation: "The Real Estate Recovery Fund is financed by licensee fees and assessments." },
      { text: "Which person may NOT make a claim against the Recovery Fund?", options: ["A. Home buyer who was defrauded", "B. Home seller who suffered loss", "C. A licensee who was a party to the transaction", "D. An investor who lost money"], correctAnswer: "C", explanation: "Licensed real estate professionals cannot make claims against the Recovery Fund." },
      { text: "After FREC finds probable cause, the next step is:", options: ["A. License revocation", "B. Issuance of a formal complaint", "C. Criminal prosecution", "D. Immediate suspension"], correctAnswer: "B", explanation: "After finding probable cause, FREC issues a formal complaint to the licensee." },
      { text: "A licensee may elect all of the following hearing options EXCEPT:", options: ["A. Formal hearing before an ALJ", "B. Informal hearing before FREC", "C. Jury trial", "D. Stipulation (settlement)"], correctAnswer: "C", explanation: "Administrative proceedings do not include jury trials. Options include formal ALJ hearing, informal FREC hearing, or settlement." },
      { text: "The Real Estate Recovery Fund will pay a claim only if:", options: ["A. The licensee admits guilt", "B. The claimant obtains a judgment or EDO and cannot collect from licensee", "C. DBPR investigates the claim", "D. The transaction involved commercial property"], correctAnswer: "B", explanation: "Recovery Fund claims require the claimant to first obtain a court judgment or EDO and demonstrate inability to collect from the licensee." },
      { text: "A broker who receives a notice of noncompliance must correct the violation within:", options: ["A. 7 days", "B. 15 days", "C. 30 days", "D. 60 days"], correctAnswer: "B", explanation: "A notice of noncompliance gives the licensee 15 days to correct the violation." },
      { text: "Branch offices must be:", options: ["A. Within the same county as the main office", "B. Registered with DBPR", "C. Managed by a broker associate only", "D. Open during the same hours as the main office"], correctAnswer: "B", explanation: "All branch offices must be registered with DBPR." },
      { text: "Continuing education must be completed:", options: ["A. Before the license expires", "B. Within 30 days after expiration", "C. Within 6 months after expiration", "D. Only when renewing after inactive status"], correctAnswer: "A", explanation: "Continuing education must be completed before the license expiration date." },
      { text: "An involuntary inactive license results from:", options: ["A. Failure to complete CE", "B. Request by the licensee", "C. Broker termination or discipline", "D. Moving out of state"], correctAnswer: "A", explanation: "Failure to complete continuing education requirements results in involuntary inactive status." },
      { text: "A broker's escrow account must be maintained in:", options: ["A. Any U.S. financial institution", "B. A Florida banking institution", "C. An out-of-state bank for protection", "D. The broker's personal bank"], correctAnswer: "B", explanation: "Escrow accounts must be maintained in a Florida banking institution." },
      { text: "Operating as a sales associate with an expired license is a:", options: ["A. Civil infraction", "B. Second-degree misdemeanor", "C. First-degree misdemeanor", "D. Third-degree felony"], correctAnswer: "C", explanation: "Operating with an expired license is a first-degree misdemeanor." },
      { text: "A broker may keep up to _____ of personal funds in a property management escrow account:", options: ["A. $200", "B. $500", "C. $1,000", "D. $5,000"], correctAnswer: "C", explanation: "Brokers may maintain up to $1,000 of personal funds in a property management escrow account." },
      { text: "The probable cause panel determines whether:", options: ["A. A complaint should be dismissed or formal charges filed", "B. The licensee is guilty", "C. The penalty should be revocation", "D. The appeal should be granted"], correctAnswer: "A", explanation: "The probable cause panel determines if there is sufficient evidence to file formal charges." },
      { text: "How long must a broker retain transaction records after closing?", options: ["A. 2 years", "B. 3 years", "C. 5 years", "D. 7 years"], correctAnswer: "C", explanation: "Brokers must retain transaction records for 5 years after closing." },
      { text: "The FREC consists of how many members?", options: ["A. 5 members", "B. 7 members", "C. 9 members", "D. 11 members"], correctAnswer: "B", explanation: "FREC consists of 7 members appointed by the Governor." },
      { text: "The default brokerage relationship in Florida is:", options: ["A. Single agent", "B. Transaction broker", "C. Dual agent", "D. No brokerage relationship"], correctAnswer: "B", explanation: "Transaction broker is the default brokerage relationship in Florida." },
      { text: "A single agent relationship requires disclosure:", options: ["A. Before showing any property", "B. Before or at the time of entering into a listing or buyer representation agreement", "C. At closing only", "D. Only if requested by the customer"], correctAnswer: "B", explanation: "Single agent disclosure must be made before or at the time of entering into a listing or representation agreement." },
      { text: "A transaction broker owes which duty to the customer?", options: ["A. Loyalty", "B. Confidentiality of all information", "C. Limited confidentiality", "D. Full disclosure of all information"], correctAnswer: "C", explanation: "Transaction brokers owe limited confidentiality, not full confidentiality like single agents." },
      { text: "The transition from single agent to transaction broker requires:", options: ["A. Verbal agreement", "B. Informed written consent", "C. FREC approval", "D. No consent needed"], correctAnswer: "B", explanation: "Transition from single agent to transaction broker requires informed written consent." },
      { text: "Dual agency in residential real estate transactions in Florida is:", options: ["A. Permitted with disclosure", "B. Permitted without disclosure", "C. Prohibited", "D. Required in some transactions"], correctAnswer: "C", explanation: "Dual agency (representing both parties as single agent) is prohibited in Florida residential transactions." },
      { text: "How many duties does a single agent owe to the principal?", options: ["A. 5", "B. 7", "C. 9", "D. 11"], correctAnswer: "C", explanation: "A single agent owes 9 duties to the principal." },
      { text: "Which is NOT a single agent duty?", options: ["A. Loyalty", "B. Obedience", "C. Limited confidentiality", "D. Full disclosure"], correctAnswer: "C", explanation: "Limited confidentiality is a transaction broker duty. Single agents owe full confidentiality." },
      { text: "Earnest money received by a sales associate must be delivered to the broker:", options: ["A. Immediately", "B. By end of the next business day", "C. Within 3 business days", "D. Within 5 business days"], correctAnswer: "B", explanation: "Sales associates must deliver earnest money to the broker by the end of the next business day." },
      { text: "A broker must deposit earnest money into escrow by the end of which business day following receipt?", options: ["A. First", "B. Second", "C. Third", "D. Fifth"], correctAnswer: "C", explanation: "Brokers must deposit earnest money by the end of the third business day following receipt." },
      { text: "A broker may maintain how much personal funds in a sales escrow account to cover bank charges?", options: ["A. $200", "B. $500", "C. $1,000", "D. $5,000"], correctAnswer: "C", explanation: "Brokers may keep up to $1,000 of personal funds in a sales escrow account for bank charges." },
      { text: "How often must a broker reconcile escrow accounts?", options: ["A. Weekly", "B. Monthly", "C. Quarterly", "D. Annually"], correctAnswer: "B", explanation: "Escrow accounts must be reconciled monthly." },
      { text: "Commingling is:", options: ["A. Depositing funds late", "B. Mixing escrow funds with personal or business funds", "C. Having multiple escrow accounts", "D. Paying interest on escrow"], correctAnswer: "B", explanation: "Commingling is mixing escrow funds with personal or operating funds." },
      { text: "Conversion of escrow funds typically results in:", options: ["A. A warning letter", "B. A small fine", "C. License revocation and possible criminal prosecution", "D. Probation only"], correctAnswer: "C", explanation: "Conversion is a serious violation that typically results in revocation and may lead to criminal prosecution." },
      { text: "When conflicting demands for escrow funds arise, the broker must notify FREC within:", options: ["A. 5 business days", "B. 10 business days", "C. 15 business days", "D. 30 business days"], correctAnswer: "C", explanation: "Brokers must notify FREC of conflicting demands within 15 business days." },
      { text: "Which is NOT a valid settlement procedure for escrow disputes?", options: ["A. Mediation", "B. Arbitration", "C. Broker decides who receives funds", "D. Escrow disbursement order"], correctAnswer: "C", explanation: "The broker cannot unilaterally decide who receives disputed funds. Valid methods include mediation, arbitration, litigation, and EDO." },
      { text: "The maximum amount FREC can award through an escrow disbursement order is:", options: ["A. $25,000", "B. $50,000", "C. $100,000", "D. No limit"], correctAnswer: "B", explanation: "The maximum EDO amount is $50,000." },
      { text: "The Real Estate Recovery Fund pays a maximum of _____ per transaction:", options: ["A. $25,000", "B. $50,000", "C. $100,000", "D. $150,000"], correctAnswer: "B", explanation: "The Recovery Fund maximum is $50,000 per transaction." },
      { text: "The maximum Recovery Fund payment per licensee for all claims is:", options: ["A. $50,000", "B. $100,000", "C. $150,000", "D. $250,000"], correctAnswer: "C", explanation: "The maximum Recovery Fund payment per licensee is $150,000 for all claims combined." },
      { text: "To make a Recovery Fund claim, a person must:", options: ["A. File a complaint with DBPR", "B. Obtain a court judgment or EDO against the licensee", "C. Simply submit a written request", "D. Be a licensed real estate professional"], correctAnswer: "B", explanation: "Claimants must first obtain a court judgment or EDO and show inability to collect from the licensee." },
      { text: "When the Recovery Fund pays a claim, the licensee's license is:", options: ["A. Unaffected", "B. Placed on probation", "C. Automatically suspended until reimbursement", "D. Permanently revoked"], correctAnswer: "C", explanation: "The license is automatically suspended until the licensee reimburses the Recovery Fund with interest." },
      { text: "The sales comparison approach is based on the principle of:", options: ["A. Anticipation", "B. Substitution", "C. Contribution", "D. Conformity"], correctAnswer: "B", explanation: "The sales comparison approach is based on the principle of substitution - a buyer will not pay more for a property than for an equally desirable substitute." },
      { text: "When making adjustments in the sales comparison approach, adjustments are made to:", options: ["A. The subject property", "B. The comparable properties", "C. Both properties equally", "D. Neither property"], correctAnswer: "B", explanation: "Adjustments are always made to the comparable properties, not the subject." },
      { text: "If a comparable property is inferior to the subject, the appraiser should:", options: ["A. Subtract from the comparable's price", "B. Add to the comparable's price", "C. Make no adjustment", "D. Discard the comparable"], correctAnswer: "B", explanation: "If the comparable is inferior, add to its price to make it equal to the subject." },
      { text: "The cost approach formula is:", options: ["A. Value = Cost + Depreciation + Land", "B. Value = Cost - Depreciation + Land", "C. Value = NOI ÷ Cap Rate", "D. Value = Rent × GRM"], correctAnswer: "B", explanation: "The cost approach formula is: Value = Cost New - Depreciation + Land Value." },
      { text: "Reproduction cost refers to:", options: ["A. Cost to build with equivalent utility using modern materials", "B. Cost to build an exact replica using same materials", "C. Original construction cost", "D. Insurance replacement value"], correctAnswer: "B", explanation: "Reproduction cost is the cost to create an exact replica using the same materials and methods." },
      { text: "Which is NOT a type of depreciation in the cost approach?", options: ["A. Physical deterioration", "B. Functional obsolescence", "C. Financial depreciation", "D. External obsolescence"], correctAnswer: "C", explanation: "The three types of depreciation are physical deterioration, functional obsolescence, and external obsolescence." },
      { text: "External obsolescence is:", options: ["A. Always curable", "B. Sometimes curable", "C. Always incurable", "D. Not related to value"], correctAnswer: "C", explanation: "External obsolescence (factors outside the property) is always incurable by the property owner." },
      { text: "The age-life method calculates depreciation by:", options: ["A. Actual age ÷ Remaining life", "B. Effective age ÷ Economic life", "C. Actual age × Economic life", "D. Effective age × Remaining life"], correctAnswer: "B", explanation: "The age-life method: Depreciation = Effective Age ÷ Economic Life." },
      { text: "A building has cost new of $500,000, effective age of 10 years, and economic life of 50 years. The depreciated cost is:", options: ["A. $100,000", "B. $400,000", "C. $450,000", "D. $500,000"], correctAnswer: "B", explanation: "Depreciation = 10/50 = 20%. $500,000 × 0.80 = $400,000." },
      { text: "The income approach formula for direct capitalization is:", options: ["A. Value = NOI × Cap Rate", "B. Value = NOI ÷ Cap Rate", "C. Value = NOI + Cap Rate", "D. Value = NOI - Cap Rate"], correctAnswer: "B", explanation: "Value = Net Operating Income ÷ Capitalization Rate." },
    ];

    seqNum = 0;
    for (const q of finalExamAQuestions) {
      await db.insert(examQuestions).values({
        examId: finalExamA[0].id,
        questionText: q.text,
        questionType: "multiple_choice",
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        options: JSON.stringify(q.options),
        sequence: seqNum++,
      });
    }
    console.log(`Added ${finalExamAQuestions.length} questions to Final Exam Form A`);

    // Add questions to Final Exam Form B (different set from document)
    const finalExamBQuestions = [
      { text: "To qualify for a Florida broker license, an applicant must have been actively licensed as a sales associate for at least:", options: ["A. 12 months within the preceding 3 years", "B. 18 months within the preceding 4 years", "C. 24 months within the preceding 5 years", "D. 36 months within the preceding 7 years"], correctAnswer: "C", explanation: "Florida requires 24 months of active sales associate experience within the preceding 5 years." },
      { text: "A broker's office entrance sign must display:", options: ["A. The broker's home address", "B. The brokerage name and 'Licensed Real Estate Broker'", "C. All sales associates' names", "D. The MLS membership number"], correctAnswer: "B", explanation: "The sign must display the brokerage name and 'Licensed Real Estate Broker'." },
      { text: "Sales associates must receive compensation:", options: ["A. Directly from the buyer or seller", "B. From either party to the transaction", "C. Only from their employing broker or brokerage entity owner", "D. From the title company at closing"], correctAnswer: "C", explanation: "Sales associates must receive all compensation from their employing broker." },
      { text: "A broker who wishes to operate under a trade name must:", options: ["A. Simply use the name in advertising", "B. Register the name with DBPR before using it", "C. File with the county clerk only", "D. Obtain MLS approval"], correctAnswer: "B", explanation: "Trade names must be registered with DBPR before use." },
      { text: "Which license status allows a licensee to perform real estate services?", options: ["A. Inactive", "B. Active", "C. Suspended", "D. Involuntary inactive"], correctAnswer: "B", explanation: "Only active status permits performing real estate services." },
      { text: "A sales associate's license becomes involuntary inactive when:", options: ["A. The associate fails to complete continuing education", "B. The employing broker's license is suspended or revoked", "C. The associate moves to another county", "D. The brokerage changes its name"], correctAnswer: "B", explanation: "When the employing broker's license is suspended or revoked, the sales associate's license becomes involuntary inactive." },
      { text: "Group licenses may be issued to:", options: ["A. Any broker with multiple offices", "B. Only owner-developers selling their own property", "C. All property management companies", "D. Any brokerage with more than 10 associates"], correctAnswer: "B", explanation: "Group licenses are issued to owner-developers selling their own subdivided property." },
      { text: "A broker associate is:", options: ["A. A sales associate with 5 years of experience", "B. A person with a broker's license working under another broker", "C. A broker who owns 50% of the brokerage", "D. An unlicensed assistant to a broker"], correctAnswer: "B", explanation: "A broker associate holds a broker license but works under another broker." },
      { text: "FREC members are appointed by:", options: ["A. The DBPR Secretary", "B. The Florida Legislature", "C. The Governor", "D. Popular election"], correctAnswer: "C", explanation: "FREC members are appointed by the Governor." },
      { text: "The probable cause panel of FREC consists of:", options: ["A. One FREC member", "B. Two FREC members", "C. Three FREC members", "D. The entire FREC"], correctAnswer: "B", explanation: "The probable cause panel consists of two FREC members." },
      { text: "A notice of noncompliance may be issued for:", options: ["A. Conversion of escrow funds", "B. First-time minor violations with no prior discipline", "C. Fraud", "D. Operating without a license"], correctAnswer: "B", explanation: "Notices of noncompliance are for first-time minor violations." },
      { text: "The maximum administrative fine FREC may impose per violation is:", options: ["A. $1,000", "B. $2,500", "C. $5,000", "D. $10,000"], correctAnswer: "C", explanation: "The maximum administrative fine is $5,000 per violation." },
      { text: "License suspension may be for a maximum of:", options: ["A. 1 year", "B. 5 years", "C. 10 years", "D. Lifetime"], correctAnswer: "C", explanation: "License suspension can be for up to 10 years." },
      { text: "Operating as a real estate broker without a license is a:", options: ["A. Second-degree misdemeanor", "B. First-degree misdemeanor", "C. Third-degree felony", "D. Civil infraction only"], correctAnswer: "C", explanation: "Operating as a broker without a license is a third-degree felony." },
      { text: "A property has NOI of $75,000 and a cap rate of 7.5%. The value is:", options: ["A. $562,500", "B. $750,000", "C. $1,000,000", "D. $5,625"], correctAnswer: "C", explanation: "$75,000 ÷ 0.075 = $1,000,000." },
      { text: "Net Operating Income is calculated as:", options: ["A. Potential Gross Income minus vacancy", "B. Effective Gross Income minus operating expenses", "C. Effective Gross Income plus debt service", "D. Gross rent minus debt service"], correctAnswer: "B", explanation: "NOI = Effective Gross Income - Operating Expenses." },
      { text: "Which expense is NOT deducted to calculate NOI?", options: ["A. Property taxes", "B. Insurance", "C. Mortgage payment", "D. Management fees"], correctAnswer: "C", explanation: "Debt service (mortgage payments) is deducted after NOI is calculated." },
      { text: "The Gross Rent Multiplier is calculated by:", options: ["A. Monthly rent ÷ Sale price", "B. Sale price ÷ Monthly rent", "C. Annual rent × Sale price", "D. Sale price + Monthly rent"], correctAnswer: "B", explanation: "GRM = Sale Price ÷ Monthly (or Annual) Rent." },
      { text: "A property has monthly rent of $2,500 and a GRM of 140. The estimated value is:", options: ["A. $175,000", "B. $300,000", "C. $350,000", "D. $420,000"], correctAnswer: "C", explanation: "$2,500 × 140 = $350,000." },
      { text: "Documentary stamp tax on a deed in most Florida counties is:", options: ["A. $0.35 per $100", "B. $0.55 per $100", "C. $0.70 per $100", "D. $1.00 per $100"], correctAnswer: "C", explanation: "Documentary stamps on deeds are $0.70 per $100 in most Florida counties." },
      { text: "A property sells for $450,000. The documentary stamps on the deed are:", options: ["A. $1,575", "B. $2,475", "C. $3,150", "D. $4,500"], correctAnswer: "C", explanation: "$450,000 ÷ 100 × $0.70 = $3,150." },
      { text: "Documentary stamp tax on a promissory note is:", options: ["A. $0.35 per $100 of loan amount", "B. $0.70 per $100 of loan amount", "C. $0.35 per $100 of sale price", "D. $0.70 per $100 of sale price"], correctAnswer: "A", explanation: "Documentary stamps on notes are $0.35 per $100 of loan amount." },
      { text: "The intangible tax on a new mortgage is:", options: ["A. $0.001 per dollar", "B. $0.002 per dollar", "C. $0.35 per $100", "D. $0.70 per $100"], correctAnswer: "B", explanation: "The intangible tax is 2 mills ($0.002) per dollar of mortgage amount." },
      { text: "A buyer obtains a $360,000 mortgage. The intangible tax is:", options: ["A. $360", "B. $720", "C. $1,260", "D. $2,520"], correctAnswer: "B", explanation: "$360,000 × 0.002 = $720." },
      { text: "Florida property taxes are typically:", options: ["A. Paid in advance", "B. Paid in arrears", "C. Paid at closing only", "D. Not prorated"], correctAnswer: "B", explanation: "Florida property taxes are paid in arrears." },
      { text: "FHA minimum down payment with 580+ credit score is:", options: ["A. 0%", "B. 3%", "C. 3.5%", "D. 5%"], correctAnswer: "C", explanation: "FHA requires 3.5% minimum down payment for borrowers with 580+ credit score." },
      { text: "VA loans require:", options: ["A. 3.5% down", "B. No down payment", "C. 10% down", "D. 20% down"], correctAnswer: "B", explanation: "VA loans typically require no down payment." },
      { text: "PMI is required on conventional loans when LTV exceeds:", options: ["A. 70%", "B. 75%", "C. 80%", "D. 90%"], correctAnswer: "C", explanation: "Private mortgage insurance is required when LTV exceeds 80%." },
      { text: "The closing disclosure must be provided:", options: ["A. At closing", "B. 24 hours before", "C. 3 business days before", "D. 7 days before"], correctAnswer: "C", explanation: "TRID requires the closing disclosure 3 business days before closing." },
      { text: "RESPA prohibits:", options: ["A. Title insurance", "B. Kickbacks for referrals", "C. Loan origination fees", "D. Appraisals"], correctAnswer: "B", explanation: "RESPA prohibits kickbacks and unearned fees for referrals." },
      { text: "Which is a protected class under Fair Housing?", options: ["A. Income level", "B. Sexual orientation (federal)", "C. Familial status", "D. Age under 55"], correctAnswer: "C", explanation: "Familial status is one of the seven federally protected classes." },
      { text: "Blockbusting involves:", options: ["A. Refusing to show properties", "B. Inducing panic selling based on demographic changes", "C. Discriminating in advertising", "D. Charging different prices"], correctAnswer: "B", explanation: "Blockbusting is inducing panic selling by predicting neighborhood demographic changes." },
      { text: "Steering involves:", options: ["A. Refusing to rent", "B. Directing buyers based on protected class", "C. Advertising discrimination", "D. Loan discrimination"], correctAnswer: "B", explanation: "Steering is directing buyers to or away from areas based on protected class characteristics." },
      { text: "Lead-based paint disclosure applies to properties built before:", options: ["A. 1960", "B. 1970", "C. 1978", "D. 1988"], correctAnswer: "C", explanation: "Lead-based paint disclosure is required for properties built before 1978." },
      { text: "Security deposits in Florida must be returned within _____ if no claim:", options: ["A. 7 days", "B. 15 days", "C. 30 days", "D. 45 days"], correctAnswer: "B", explanation: "If no claim is made, security deposits must be returned within 15 days." },
      { text: "The three-day notice for nonpayment excludes:", options: ["A. Weekdays", "B. Mondays", "C. Saturdays, Sundays, holidays", "D. Nothing"], correctAnswer: "C", explanation: "The three-day notice excludes Saturdays, Sundays, and legal holidays." },
      { text: "A Phase I Environmental Assessment includes:", options: ["A. Soil sampling", "B. Groundwater testing", "C. Records review without sampling", "D. Contamination cleanup"], correctAnswer: "C", explanation: "Phase I is a records review and site inspection without physical sampling." },
      { text: "The depreciation period for residential rental property is:", options: ["A. 15 years", "B. 27.5 years", "C. 31.5 years", "D. 39 years"], correctAnswer: "B", explanation: "Residential rental property is depreciated over 27.5 years." },
      { text: "Commercial property depreciation period is:", options: ["A. 15 years", "B. 27.5 years", "C. 31.5 years", "D. 39 years"], correctAnswer: "D", explanation: "Commercial property is depreciated over 39 years." },
      { text: "A 1031 exchange identification period is:", options: ["A. 30 days", "B. 45 days", "C. 90 days", "D. 180 days"], correctAnswer: "B", explanation: "Replacement properties must be identified within 45 days." },
      { text: "CAM stands for:", options: ["A. Capital Asset Management", "B. Common Area Maintenance", "C. Commercial Asset Modification", "D. Certified Appraisal Method"], correctAnswer: "B", explanation: "CAM = Common Area Maintenance charges in commercial leases." },
      { text: "An option contract binds:", options: ["A. Both parties", "B. Only the buyer", "C. Only the seller", "D. Neither party"], correctAnswer: "C", explanation: "An option binds only the seller (optionor); the buyer has the right but not obligation to purchase." },
      { text: "Specific performance is:", options: ["A. Money damages", "B. Contract cancellation", "C. Court-ordered completion", "D. Deposit forfeiture"], correctAnswer: "C", explanation: "Specific performance is a court order requiring a party to complete the contract as agreed." },
      { text: "A void contract:", options: ["A. May be cancelled by injured party", "B. Has no legal effect", "C. Is enforceable", "D. Requires court action"], correctAnswer: "B", explanation: "A void contract has no legal effect from the beginning." },
      { text: "Record retention for real estate transactions is:", options: ["A. 2 years", "B. 3 years", "C. 5 years", "D. 7 years"], correctAnswer: "C", explanation: "Transaction records must be retained for 5 years." },
      { text: "The NW 1/4 of SE 1/4 of a section contains:", options: ["A. 10 acres", "B. 20 acres", "C. 40 acres", "D. 80 acres"], correctAnswer: "C", explanation: "1/4 of 1/4 of a 640-acre section = 640 × 1/4 × 1/4 = 40 acres." },
      { text: "A broker earned $27,000 at 6% commission. The sale price was:", options: ["A. $162,000", "B. $270,000", "C. $450,000", "D. $540,000"], correctAnswer: "C", explanation: "$27,000 ÷ 0.06 = $450,000." },
      { text: "What is the intangible tax on a $300,000 mortgage?", options: ["A. $300", "B. $600", "C. $1,050", "D. $2,100"], correctAnswer: "B", explanation: "$300,000 × 0.002 = $600." },
      { text: "Housing for 55+ must have at least _____ of units with resident 55+:", options: ["A. 51%", "B. 62%", "C. 80%", "D. 100%"], correctAnswer: "C", explanation: "55+ housing must have at least 80% of units with one resident 55 or older." },
      { text: "A buyer with $8,000 monthly income at 28% housing ratio qualifies for maximum PITI of:", options: ["A. $1,600", "B. $2,000", "C. $2,240", "D. $2,400"], correctAnswer: "C", explanation: "$8,000 × 0.28 = $2,240 maximum PITI." },
    ];

    seqNum = 0;
    for (const q of finalExamBQuestions) {
      await db.insert(examQuestions).values({
        examId: finalExamB[0].id,
        questionText: q.text,
        questionType: "multiple_choice",
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        options: JSON.stringify(q.options),
        sequence: seqNum++,
      });
    }
    console.log(`Added ${finalExamBQuestions.length} questions to Final Exam Form B`);

    console.log("✓ FREC II Broker Pre-Licensing course seeded successfully!");
    return course;
  } catch (error) {
    console.error("Error seeding FREC II course:", error);
    throw error;
  }
}
