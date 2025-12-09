import { db } from "./db";
import { units, lessons, practiceExams, examQuestions, courses } from "@shared/schema";
import { eq, and, like } from "drizzle-orm";

const SESSION_12_LESSONS = {
  1: {
    title: "The Closing Process Overview",
    content: `<h2>The Closing Process Overview</h2>

<p>Closing, also known as settlement or escrow closing, is the final step in a real estate transaction. It is the point at which ownership of property transfers from seller to buyer, funds are disbursed, and all documents are signed and recorded. The closing process ensures that all contractual obligations have been satisfied and that both parties receive what was promised in the purchase agreement.</p>

<h3>Key Events at Closing</h3>

<p><strong>Title Transfer:</strong> The seller executes and delivers the deed to the buyer, transferring legal ownership of the property.</p>

<p><strong>Funds Disbursement:</strong> The purchase price is paid to the seller, existing liens are satisfied, and closing costs are distributed to appropriate parties.</p>

<p><strong>Document Execution:</strong> All necessary legal documents are signed by the appropriate parties, including the deed, mortgage documents, and closing disclosures.</p>

<p><strong>Recording:</strong> The deed and mortgage are recorded in the public records, providing constructive notice of the transfer and any new liens.</p>

<h3>The Closing Agent</h3>

<p>In Florida, the closing agent (also called settlement agent) is typically an attorney or a title company. Florida is considered an "attorney state" for closings, though title companies can conduct closings under attorney supervision. The closing agent serves as a neutral third party coordinating the transaction.</p>

<p><strong>Closing Agent Responsibilities:</strong></p>
<ul>
<li>Order and review title search and examination</li>
<li>Prepare or review closing documents</li>
<li>Calculate prorations and prepare settlement statement</li>
<li>Coordinate with lender on funding</li>
<li>Conduct closing meeting</li>
<li>Collect and disburse funds</li>
<li>Record documents in public records</li>
<li>Issue title insurance policies</li>
</ul>

<h3>Other Parties Involved</h3>

<p><strong>Buyer:</strong> Signs loan documents, pays closing costs and down payment, receives deed and keys.</p>

<p><strong>Seller:</strong> Executes deed, pays off existing liens, pays closing costs, receives net proceeds.</p>

<p><strong>Real Estate Agents:</strong> May attend closing, receive commission disbursement, assist parties with questions.</p>

<p><strong>Lender:</strong> Provides loan funds, requires specific documents and conditions be met.</p>

<p><strong>Title Company:</strong> Performs title search, issues title insurance, may serve as closing agent.</p>

<h3>Pre-Closing Activities</h3>

<p><strong>Title Work:</strong></p>
<ul>
<li><strong>Title Search:</strong> Examination of public records to determine ownership history and identify any liens, encumbrances, or defects.</li>
<li><strong>Title Examination:</strong> Attorney review of search results to render opinion on marketability.</li>
<li><strong>Title Commitment:</strong> Preliminary report showing current ownership, proposed insured, exceptions, and requirements for issuing title insurance.</li>
</ul>

<p><strong>Lender Requirements:</strong></p>
<ul>
<li>Final loan approval and clear-to-close</li>
<li>Appraisal completion and review</li>
<li>Survey review (if required)</li>
<li>Insurance verification</li>
<li>Loan document preparation</li>
<li>Wire transfer instructions</li>
</ul>

<h3>The Final Walkthrough</h3>

<p>The buyer typically has the right to conduct a final walkthrough of the property within 24-48 hours before closing. This inspection verifies:</p>
<ul>
<li>Property condition is same as when offer was made</li>
<li>Agreed-upon repairs have been completed</li>
<li>All fixtures and included items remain</li>
<li>No new damage has occurred</li>
<li>Property is vacant (unless otherwise agreed)</li>
</ul>

<p>If problems are discovered during the walkthrough, buyers should address them before closing, as it becomes much more difficult to resolve issues after title transfers.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Closing is the final step where title transfers and funds are disbursed</li>
<li>Florida is considered an "attorney state" for closings</li>
<li>The closing agent coordinates the entire transaction as a neutral party</li>
<li>Pre-closing activities include title work, lender requirements, and final walkthrough</li>
<li>All parties should review the Closing Disclosure before closing</li>
</ul>`
  },

  2: {
    title: "RESPA and TRID Requirements",
    content: `<h2>RESPA and TRID Requirements</h2>

<h3>Real Estate Settlement Procedures Act (RESPA)</h3>

<p>RESPA is a federal law enacted in 1974 to protect consumers in the home buying process. It requires lenders and settlement service providers to give borrowers timely disclosures about the nature and costs of the settlement process. RESPA is enforced by the Consumer Financial Protection Bureau (CFPB).</p>

<h3>RESPA Coverage</h3>

<p>RESPA applies to "federally related mortgage loans," which includes most residential mortgage loans:</p>
<ul>
<li>Purchase loans for 1-4 family residential properties</li>
<li>Refinance loans</li>
<li>Home equity loans and lines of credit</li>
<li>Reverse mortgages</li>
</ul>

<p>RESPA does not apply to loans for business, commercial, or agricultural purposes, or to temporary construction loans.</p>

<h3>RESPA Prohibitions</h3>

<p><strong>Kickbacks and Referral Fees (Section 8):</strong> RESPA prohibits giving or receiving anything of value for referrals of settlement service business. This includes fees, kickbacks, or items of value exchanged between real estate agents, lenders, title companies, appraisers, and other settlement service providers.</p>

<p><strong>Examples of Prohibited Conduct:</strong></p>
<ul>
<li>Title company paying real estate broker for referrals</li>
<li>Lender providing vacation trips to agents for loan referrals</li>
<li>Split fees between service providers where no actual service performed</li>
<li>Excessive gifts to referral sources</li>
</ul>

<p><strong>Fee Splitting (Section 8):</strong> No one may give or receive a portion of a charge for services not actually performed. If a fee is split, each party must provide a real service for their portion.</p>

<p><strong>Title Insurance Requirements (Section 9):</strong> Sellers cannot require buyers to purchase title insurance from a specific company as a condition of sale.</p>

<p><strong>Escrow Account Limits (Section 10):</strong> Limits the amount lenders can require borrowers to maintain in escrow accounts for taxes and insurance.</p>

<h3>Affiliated Business Arrangement (ABA) Disclosure</h3>

<p>When a settlement service provider refers business to a company with which they have an ownership or affiliate relationship, RESPA requires:</p>
<ul>
<li>Written disclosure of the relationship</li>
<li>Estimated charges for the service</li>
<li>Statement that consumer is not required to use the affiliated provider</li>
<li>Disclosure provided at or before time of referral</li>
</ul>

<h3>TRID - TILA-RESPA Integrated Disclosure</h3>

<p>In 2015, the CFPB implemented the TILA-RESPA Integrated Disclosure rule (TRID), also known as "Know Before You Owe." TRID combined the disclosure requirements of the Truth in Lending Act (TILA) and RESPA into two new forms: the Loan Estimate and the Closing Disclosure.</p>

<h3>Loan Estimate (LE)</h3>

<p>The Loan Estimate replaced the former Good Faith Estimate (GFE) and early Truth in Lending disclosure.</p>

<p><strong>Timing Requirement:</strong> Lenders must provide the Loan Estimate within 3 business days of receiving a loan application. Borrowers must receive the LE at least 7 business days before closing.</p>

<p><strong>Contents of Loan Estimate:</strong></p>
<ul>
<li>Loan terms (amount, interest rate, monthly payment)</li>
<li>Projected payments over loan life</li>
<li>Closing costs breakdown</li>
<li>Cash to close estimate</li>
<li>Loan features (balloon, prepayment penalty, negative amortization)</li>
<li>Comparisons (APR, total interest, total payments)</li>
</ul>

<h3>Closing Disclosure (CD)</h3>

<p>The Closing Disclosure replaced the HUD-1 Settlement Statement and final Truth in Lending disclosure.</p>

<p><strong>Timing Requirement:</strong> Borrowers must receive the Closing Disclosure at least 3 business days before closing. This is often called the "3-day rule" or "cooling-off period."</p>

<p><strong>Changes Requiring New 3-Day Period:</strong></p>
<ul>
<li>APR increases by more than 0.125% (1/8%)</li>
<li>Loan product changes (e.g., fixed to adjustable)</li>
<li>Prepayment penalty added</li>
</ul>

<h3>Tolerance Limits</h3>

<p>TRID establishes tolerance limits on how much certain fees can increase from the Loan Estimate to the Closing Disclosure:</p>
<ul>
<li><strong>Zero Tolerance:</strong> Fees paid to lender, transfer taxes, fees for required services from lender's chosen provider</li>
<li><strong>10% Cumulative:</strong> Recording fees, fees for required services where borrower selects provider from lender's list</li>
<li><strong>No Limit:</strong> Prepaid interest, property insurance premiums, fees for services borrower shops for independently</li>
</ul>

<h3>Key Points to Remember</h3>
<ul>
<li>RESPA protects consumers and prohibits kickbacks and referral fees</li>
<li>TRID requires the Loan Estimate within 3 business days of application</li>
<li>The Closing Disclosure must be received 3 business days before closing</li>
<li>Certain fee increases trigger a new 3-day waiting period</li>
<li>Affiliated Business Arrangements require proper disclosure</li>
</ul>`
  },

  3: {
    title: "Prorations, Closing Costs and Title Insurance",
    content: `<h2>Prorations, Closing Costs and Title Insurance</h2>

<h3>Understanding Prorations</h3>

<p>Prorations are the division of ongoing expenses and income between buyer and seller based on the date of closing. The goal is to ensure each party pays only for the period they own or benefit from the property. Prorations are calculated to the day of closing, with the day of closing typically belonging to the buyer.</p>

<h3>Proration Methods</h3>

<p><strong>365-Day Method (Actual Days):</strong> Uses actual number of days in the year and month. More accurate for daily calculations.</p>

<p><strong>360-Day Method (Banker's Year):</strong> Assumes 30 days per month and 360 days per year. Commonly used for interest calculations.</p>

<h3>Accrued vs. Prepaid Items</h3>

<p><strong>Accrued Items:</strong> Expenses that have been incurred but not yet paid. These are credited to the buyer (debited to seller) because the buyer will pay them later. Example: Property taxes in Florida (paid in arrears).</p>

<p><strong>Prepaid Items:</strong> Expenses that have been paid in advance. These are credited to the seller (debited to buyer) because the seller has already paid for future periods. Example: Homeowner's insurance paid for full year.</p>

<h3>Property Tax Prorations in Florida</h3>

<p>In Florida, property taxes are paid in arrears. The tax year runs from January 1 to December 31. The payment schedule offers discounts:</p>
<ul>
<li>November: 4% discount</li>
<li>December: 3% discount</li>
<li>January: 2% discount</li>
<li>February: 1% discount</li>
<li>March 31: Face amount due</li>
<li>April 1: Taxes become delinquent</li>
</ul>

<h3>Florida Transfer Taxes</h3>

<p><strong>Documentary Stamp Tax on Deeds:</strong></p>
<ul>
<li>Rate: $0.70 per $100 of consideration (or portion thereof)</li>
<li>Miami-Dade County: $0.60 per $100 (single-family residence)</li>
<li>Typically paid by seller</li>
</ul>

<p><strong>Documentary Stamp Tax on Notes:</strong></p>
<ul>
<li>Rate: $0.35 per $100 of indebtedness</li>
<li>Paid by buyer (borrower)</li>
</ul>

<p><strong>Intangible Tax on New Mortgages:</strong></p>
<ul>
<li>Rate: $0.002 per $1.00 (2 mills) or $2.00 per $1,000</li>
<li>Paid by buyer (borrower)</li>
</ul>

<h3>Common Buyer Closing Costs</h3>
<ul>
<li>Loan origination fee (0.5% - 1% of loan)</li>
<li>Appraisal fee ($400 - $700)</li>
<li>Credit report fee ($25 - $75)</li>
<li>Title insurance (lender's policy)</li>
<li>Survey ($300 - $600)</li>
<li>Recording fees</li>
<li>Documentary stamps on note</li>
<li>Intangible tax</li>
<li>Prepaid interest</li>
<li>Escrow deposits</li>
</ul>

<h3>Common Seller Closing Costs</h3>
<ul>
<li>Real estate commission (negotiable)</li>
<li>Documentary stamps on deed</li>
<li>Title search/abstract</li>
<li>Mortgage payoff</li>
<li>HOA estoppel letter</li>
<li>Prorated taxes (if unpaid)</li>
</ul>

<h3>Understanding Title Insurance</h3>

<p>Title insurance protects against losses arising from defects in title that existed prior to the policy date but were not discovered during the title search. Unlike other insurance that protects against future events, title insurance protects against past events.</p>

<p><strong>Owner's Policy:</strong> Protects the buyer/owner's equity in the property. Coverage equals the purchase price.</p>

<p><strong>Lender's Policy:</strong> Protects the lender's security interest. Coverage equals the loan amount and decreases as the loan is paid down. Required by virtually all lenders.</p>

<h3>What Title Insurance Covers</h3>
<ul>
<li>Errors in public records</li>
<li>Unknown liens or encumbrances</li>
<li>Forgery or fraud in chain of title</li>
<li>Missing heirs or undisclosed spouses</li>
<li>Defective acknowledgments</li>
<li>Legal defense costs for covered claims</li>
</ul>

<h3>Standard Title Insurance Exclusions</h3>
<ul>
<li>Defects known to insured but not disclosed</li>
<li>Government regulations (zoning, building codes)</li>
<li>Eminent domain actions</li>
<li>Matters arising after policy date</li>
</ul>

<h3>Wire Fraud Prevention</h3>

<p>Wire fraud has become a significant threat in real estate transactions. Criminals hack email accounts and send fraudulent wire instructions. Best practices include:</p>
<ul>
<li>Verify wire instructions by phone using known numbers</li>
<li>Never trust instructions received solely by email</li>
<li>Be suspicious of last-minute changes to wiring instructions</li>
<li>Use encrypted communication when possible</li>
</ul>

<h3>Key Points to Remember</h3>
<ul>
<li>Prorations divide expenses fairly between buyer and seller based on closing date</li>
<li>Florida property taxes are paid in arrears and credited to the buyer</li>
<li>Documentary stamps on deeds are $0.70 per $100, typically paid by seller</li>
<li>Intangible tax on mortgages is $2.00 per $1,000, paid by buyer</li>
<li>Title insurance protects against past defects, not future events</li>
<li>Always verify wire instructions by phone to prevent fraud</li>
</ul>`
  }
};

const SESSION_12_QUIZ_QUESTIONS = [
  {
    questionText: "Closing in a real estate transaction refers to:",
    options: ["The initial contract signing", "The point where title transfers and funds are disbursed", "The property inspection", "The loan application"],
    correctAnswer: "B",
    explanation: "Closing is the final step where ownership transfers from seller to buyer and all funds are disbursed."
  },
  {
    questionText: "In Florida, who typically serves as the closing agent?",
    options: ["The real estate agent only", "An attorney or title company", "The mortgage broker", "The property appraiser"],
    correctAnswer: "B",
    explanation: "Florida is considered an 'attorney state' where attorneys or title companies under attorney supervision conduct closings."
  },
  {
    questionText: "RESPA was enacted primarily to:",
    options: ["Regulate interest rates", "Protect consumers in the home buying process", "Set property tax rates", "License real estate agents"],
    correctAnswer: "B",
    explanation: "RESPA protects consumers by requiring timely disclosures about settlement costs and prohibiting kickbacks."
  },
  {
    questionText: "Under RESPA Section 8, which is prohibited?",
    options: ["Payments for actual services rendered", "Kickbacks for referrals of settlement services", "Cooperative brokerage arrangements", "Affiliated Business Arrangements with proper disclosure"],
    correctAnswer: "B",
    explanation: "RESPA Section 8 prohibits giving or receiving anything of value for referrals of settlement service business."
  },
  {
    questionText: "Under TRID, the Loan Estimate must be provided within:",
    options: ["24 hours of application", "3 business days of application", "7 business days of application", "At closing only"],
    correctAnswer: "B",
    explanation: "Lenders must provide the Loan Estimate within 3 business days of receiving a loan application."
  },
  {
    questionText: "The Closing Disclosure must be received by the borrower at least:",
    options: ["24 hours before closing", "3 business days before closing", "7 business days before closing", "At the closing table"],
    correctAnswer: "B",
    explanation: "The 3-day rule requires borrowers receive the Closing Disclosure at least 3 business days before closing."
  },
  {
    questionText: "A proration is best described as:",
    options: ["A commission split between agents", "Division of ongoing expenses between buyer and seller", "A discount on closing costs", "A type of mortgage payment"],
    correctAnswer: "B",
    explanation: "Prorations divide expenses fairly between buyer and seller based on the closing date."
  },
  {
    questionText: "In Florida, property taxes are paid:",
    options: ["In advance for the coming year", "In arrears for the prior year", "Monthly with mortgage payments", "At the time of purchase only"],
    correctAnswer: "B",
    explanation: "Florida property taxes are paid in arrears, covering the prior year's taxes."
  },
  {
    questionText: "Accrued items at closing are:",
    options: ["Credited to the seller", "Credited to the buyer", "Paid by the lender", "Not included on the settlement statement"],
    correctAnswer: "B",
    explanation: "Accrued items (expenses incurred but not yet paid) are credited to the buyer who will pay them later."
  },
  {
    questionText: "Documentary stamp tax on a deed in Florida (outside Miami-Dade) is:",
    options: ["$0.35 per $100", "$0.70 per $100", "$1.00 per $100", "$2.00 per $1,000"],
    correctAnswer: "B",
    explanation: "The standard Florida documentary stamp tax rate on deeds is $0.70 per $100 of consideration."
  },
  {
    questionText: "Documentary stamps on the deed are typically paid by the:",
    options: ["Buyer", "Seller", "Lender", "Title company"],
    correctAnswer: "B",
    explanation: "In Florida custom, documentary stamps on the deed are typically paid by the seller."
  },
  {
    questionText: "The intangible tax on a new mortgage in Florida is:",
    options: ["$0.35 per $100", "$0.70 per $100", "$2.00 per $1,000", "$3.50 per $1,000"],
    correctAnswer: "C",
    explanation: "Florida's intangible tax is $2.00 per $1,000 of new mortgage (equal to 2 mills or $0.002 per dollar)."
  },
  {
    questionText: "Title insurance protects against:",
    options: ["Future events only", "Past defects in title", "Property damage", "Mortgage default"],
    correctAnswer: "B",
    explanation: "Title insurance protects against existing but undiscovered defects in title that occurred before the policy date."
  },
  {
    questionText: "An owner's title insurance policy:",
    options: ["Decreases as the loan is paid", "Protects the lender", "Protects the buyer's equity", "Is never needed"],
    correctAnswer: "C",
    explanation: "The owner's policy protects the buyer/owner's equity and coverage equals the purchase price."
  },
  {
    questionText: "For a $400,000 sale, documentary stamps on the deed equal:",
    options: ["$1,400", "$2,100", "$2,800", "$4,000"],
    correctAnswer: "C",
    explanation: "$400,000 / 100 = 4,000 units x $0.70 = $2,800 documentary stamps on deed."
  }
];

async function updateSession12Content() {
  console.log("Starting Session 12 content update for FREC II Broker Pre-licensing course...");

  try {
    // Find the FREC II course
    const freciiCourseResult = await db
      .select()
      .from(courses)
      .where(eq(courses.sku, "FL-RE-PL-BROKER-72"));
    
    if (!freciiCourseResult || freciiCourseResult.length === 0) {
      console.error("FREC II course not found!");
      return;
    }

    const courseId = freciiCourseResult[0].id;
    console.log(`Found FREC II course: ${courseId}`);

    // Find Session 12 unit
    const session12Result = await db
      .select()
      .from(units)
      .where(and(
        eq(units.courseId, courseId),
        eq(units.unitNumber, 12)
      ));

    if (!session12Result || session12Result.length === 0) {
      console.error("Session 12 unit not found!");
      return;
    }

    const session12UnitId = session12Result[0].id;
    console.log(`Found Session 12 unit: ${session12UnitId}`);

    // Update unit title
    await db
      .update(units)
      .set({
        title: "Session 12: Closing Real Estate Transactions",
      })
      .where(eq(units.id, session12UnitId));
    console.log("Updated Session 12 unit title");

    // Get all lessons for Session 12
    const session12Lessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.unitId, session12UnitId));

    console.log(`Found ${session12Lessons.length} lessons for Session 12`);

    // Update each lesson
    for (const lesson of session12Lessons) {
      const lessonData = SESSION_12_LESSONS[lesson.lessonNumber as keyof typeof SESSION_12_LESSONS];
      if (lessonData) {
        await db
          .update(lessons)
          .set({
            title: lessonData.title,
            content: lessonData.content
          })
          .where(eq(lessons.id, lesson.id));
        console.log(`Updated Lesson ${lesson.lessonNumber}: ${lessonData.title}`);
      }
    }

    // Find the quiz for Session 12
    const quizResult = await db
      .select()
      .from(practiceExams)
      .where(
        and(
          eq(practiceExams.courseId, courseId),
          like(practiceExams.title, '%Session 12%')
        )
      );

    if (quizResult.length > 0) {
      const session12Quiz = quizResult[0];
      console.log(`Found Session 12 quiz: ${session12Quiz.id}`);

      // Update quiz title
      await db
        .update(practiceExams)
        .set({
          title: "Session 12 Quiz: Closing Real Estate Transactions",
          description: "15-question quiz covering closing procedures, RESPA, TRID, prorations, and title insurance"
        })
        .where(eq(practiceExams.id, session12Quiz.id));
      console.log("Updated quiz title");

      // Delete existing quiz questions
      await db
        .delete(examQuestions)
        .where(eq(examQuestions.examId, session12Quiz.id));
      console.log("Deleted existing quiz questions");

      // Insert new quiz questions
      for (let i = 0; i < SESSION_12_QUIZ_QUESTIONS.length; i++) {
        const q = SESSION_12_QUIZ_QUESTIONS[i];
        await db.insert(examQuestions).values({
          examId: session12Quiz.id,
          questionText: q.questionText,
          questionType: "multiple_choice",
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          sequence: i + 1,
        });
      }
      console.log(`Inserted ${SESSION_12_QUIZ_QUESTIONS.length} new quiz questions`);
    } else {
      console.log("Session 12 quiz not found - creating new one");
      
      const newQuiz = await db
        .insert(practiceExams)
        .values({
          courseId: courseId,
          title: "Session 12 Quiz: Closing Real Estate Transactions",
          description: "15-question quiz covering closing procedures, RESPA, TRID, prorations, and title insurance",
          totalQuestions: 15,
          passingScore: 70,
          isActive: 1,
        })
        .returning();
      
      console.log(`Created new quiz: ${newQuiz[0].id}`);

      // Insert quiz questions
      for (let i = 0; i < SESSION_12_QUIZ_QUESTIONS.length; i++) {
        const q = SESSION_12_QUIZ_QUESTIONS[i];
        await db.insert(examQuestions).values({
          examId: newQuiz[0].id,
          questionText: q.questionText,
          questionType: "multiple_choice",
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          sequence: i + 1,
        });
      }
      console.log(`Inserted ${SESSION_12_QUIZ_QUESTIONS.length} quiz questions`);
    }

    console.log("Session 12 content update complete!");
  } catch (error) {
    console.error("Error updating Session 12 content:", error);
    throw error;
  }
}

updateSession12Content()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
