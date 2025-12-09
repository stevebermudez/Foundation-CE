import { db } from "./db";
import { questionBanks, bankQuestions } from "@shared/schema";
import { eq } from "drizzle-orm";

const SESSION_12_UNIT_ID = "0c7bbad9-0e58-4a00-a3bd-c70719ca72b2";
const FREC_II_COURSE_ID = "04ed7248-fd4e-44e1-8b55-3ba7d204040b";

const QUIZ_BANKS = [
  {
    title: "Quiz 12-1: THE CLOSING PROCESS",
    questions: [
      {
        questionText: "Closing in a real estate transaction refers to:",
        options: ["The initial contract signing", "The point where title transfers and funds are disbursed", "The property inspection", "The loan application"],
        correctOption: 1,
        explanation: "Closing is the final step where ownership transfers from seller to buyer and all funds are disbursed."
      },
      {
        questionText: "In Florida, who typically serves as the closing agent?",
        options: ["The real estate agent only", "An attorney or title company", "The mortgage broker", "The property appraiser"],
        correctOption: 1,
        explanation: "Florida is considered an 'attorney state' where attorneys or title companies under attorney supervision conduct closings."
      },
      {
        questionText: "Which is NOT a responsibility of the closing agent?",
        options: ["Preparing closing documents", "Setting the sale price", "Recording documents in public records", "Disbursing funds"],
        correctOption: 1,
        explanation: "The closing agent coordinates the transaction but does not set the sale price - that's negotiated between buyer and seller."
      },
      {
        questionText: "The final walkthrough typically occurs:",
        options: ["30 days before closing", "24-48 hours before closing", "After closing", "At the time of loan application"],
        correctOption: 1,
        explanation: "The buyer typically conducts a final walkthrough within 24-48 hours before closing to verify property condition."
      },
      {
        questionText: "What does the title commitment show?",
        options: ["Only the purchase price", "Current ownership, proposed insured, and requirements for title insurance", "Just the mortgage amount", "Only property taxes"],
        correctOption: 1,
        explanation: "The title commitment is a preliminary report showing current ownership, proposed insured, exceptions, and requirements for issuing title insurance."
      }
    ]
  },
  {
    title: "Quiz 12-2: RESPA AND TRID REQUIREMENTS",
    questions: [
      {
        questionText: "RESPA was enacted primarily to:",
        options: ["Regulate interest rates", "Protect consumers in the home buying process", "Set property tax rates", "License real estate agents"],
        correctOption: 1,
        explanation: "RESPA protects consumers by requiring timely disclosures about settlement costs and prohibiting kickbacks."
      },
      {
        questionText: "Under RESPA Section 8, which is prohibited?",
        options: ["Payments for actual services rendered", "Kickbacks for referrals of settlement services", "Cooperative brokerage arrangements", "Affiliated Business Arrangements with proper disclosure"],
        correctOption: 1,
        explanation: "RESPA Section 8 prohibits giving or receiving anything of value for referrals of settlement service business."
      },
      {
        questionText: "Under TRID, the Loan Estimate must be provided within:",
        options: ["24 hours of application", "3 business days of application", "7 business days of application", "At closing only"],
        correctOption: 1,
        explanation: "Lenders must provide the Loan Estimate within 3 business days of receiving a loan application."
      },
      {
        questionText: "The Closing Disclosure must be received by the borrower at least:",
        options: ["24 hours before closing", "3 business days before closing", "7 business days before closing", "At the closing table"],
        correctOption: 1,
        explanation: "The 3-day rule requires borrowers receive the Closing Disclosure at least 3 business days before closing."
      },
      {
        questionText: "Which change would trigger a new 3-day waiting period?",
        options: ["Minor change in closing costs", "APR increases by more than 0.125%", "Change in closing location", "Different escrow officer"],
        correctOption: 1,
        explanation: "An APR increase of more than 0.125% (1/8%), loan product change, or prepayment penalty addition triggers a new 3-day period."
      }
    ]
  },
  {
    title: "Quiz 12-3: PRORATIONS, CLOSING COSTS AND TITLE INSURANCE",
    questions: [
      {
        questionText: "A proration is best described as:",
        options: ["A commission split between agents", "Division of ongoing expenses between buyer and seller", "A discount on closing costs", "A type of mortgage payment"],
        correctOption: 1,
        explanation: "Prorations divide expenses fairly between buyer and seller based on the closing date."
      },
      {
        questionText: "In Florida, property taxes are paid:",
        options: ["In advance for the coming year", "In arrears for the prior year", "Monthly with mortgage payments", "At the time of purchase only"],
        correctOption: 1,
        explanation: "Florida property taxes are paid in arrears, covering the prior year's taxes."
      },
      {
        questionText: "Documentary stamp tax on a deed in Florida (outside Miami-Dade) is:",
        options: ["$0.35 per $100", "$0.70 per $100", "$1.00 per $100", "$2.00 per $1,000"],
        correctOption: 1,
        explanation: "The standard Florida documentary stamp tax rate on deeds is $0.70 per $100 of consideration."
      },
      {
        questionText: "The intangible tax on a new mortgage in Florida is:",
        options: ["$0.35 per $100", "$0.70 per $100", "$2.00 per $1,000", "$3.50 per $1,000"],
        correctOption: 2,
        explanation: "Florida's intangible tax is $2.00 per $1,000 of new mortgage (equal to 2 mills or $0.002 per dollar)."
      },
      {
        questionText: "Title insurance protects against:",
        options: ["Future events only", "Past defects in title", "Property damage", "Mortgage default"],
        correctOption: 1,
        explanation: "Title insurance protects against existing but undiscovered defects in title that occurred before the policy date."
      }
    ]
  }
];

async function createSession12QuestionBanks() {
  console.log("Creating question banks for Session 12...");

  try {
    // First, delete any existing question banks for Session 12
    const existingBanks = await db
      .select()
      .from(questionBanks)
      .where(eq(questionBanks.unitId, SESSION_12_UNIT_ID));

    for (const bank of existingBanks) {
      await db.delete(bankQuestions).where(eq(bankQuestions.bankId, bank.id));
      await db.delete(questionBanks).where(eq(questionBanks.id, bank.id));
    }
    console.log(`Deleted ${existingBanks.length} existing question banks`);

    // Create new question banks
    for (const bankData of QUIZ_BANKS) {
      const [newBank] = await db.insert(questionBanks).values({
        courseId: FREC_II_COURSE_ID,
        unitId: SESSION_12_UNIT_ID,
        bankType: "unit_quiz",
        title: bankData.title,
        description: `Quiz questions for ${bankData.title}`,
        questionsPerAttempt: 5,
        passingScore: 70,
        isActive: 1,
      }).returning();

      console.log(`Created question bank: ${bankData.title} (${newBank.id})`);

      // Insert questions
      for (const q of bankData.questions) {
        await db.insert(bankQuestions).values({
          bankId: newBank.id,
          questionText: q.questionText,
          questionType: "multiple_choice",
          options: JSON.stringify(q.options),
          correctOption: q.correctOption,
          explanation: q.explanation,
          difficulty: "medium",
          isActive: 1,
        });
      }
      console.log(`  Inserted ${bankData.questions.length} questions`);
    }

    // Verify
    const finalCount = await db
      .select()
      .from(questionBanks)
      .where(eq(questionBanks.unitId, SESSION_12_UNIT_ID));
    
    console.log(`\nSession 12 now has ${finalCount.length} question banks`);
    console.log("Done!");
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

createSession12QuestionBanks()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
