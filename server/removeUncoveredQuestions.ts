import { db } from "./db";
import { practiceExams, examQuestions, questionBanks, bankQuestions } from "@shared/schema";
import { eq, and, like, or } from "drizzle-orm";

// Questions to remove - NOT covered in lesson content (verified side-by-side)

const questionsToRemove: Record<number, string[]> = {
  // Unit 9: Title, Deeds - Lessons cover deed types, valid requirements, recording, title insurance, encumbrances, liens
  9: [
    "Voluntary alienation occurs through", // alienation terminology not covered
    "The government's power to take private property for public use is", // eminent domain not in this unit
    "A covenant that promises the grantor has the right to convey the property is the covenant of", // specific covenant names not detailed
    "A survey is most likely to uncover", // surveys not covered
    "The covenant of seisin warrants that", // specific covenant names not detailed
  ],
  
  // Unit 10: Legal Descriptions - Lessons cover metes/bounds, rectangular survey, lot/block only
  10: [
    "Which of the following is required for a valid contract", // contracts are Unit 11
    "Consideration in a real estate contract refers to", // contracts are Unit 11
    "The Statute of Frauds requires that", // contracts are Unit 11
    "Oral leases longer than one year are", // contracts are Unit 11
    "In an exclusive right of sale listing", // listing contracts are Unit 11
    "Contract termination by impossibility occurs when", // contracts are Unit 11
    "A contract that appears valid but cannot be enforced in court due to legal defenses is", // contracts are Unit 11
    "The Statute of Limitations for an action on a written contract in Florida is", // not in legal descriptions
    "A benchmark is used primarily for", // benchmarks not covered in lessons
  ],
  
  // Unit 11: Real Estate Contracts - Lessons cover contract elements, types, listings, remedies
  11: [
    "The clause that allows a lender to demand full repayment after default is the", // acceleration clause is mortgages Unit 12
    "The housing expense ratio compares", // mortgage qualifying is Unit 13
    "Early payments in an amortized loan", // amortization is Unit 12
    "The primary mortgage market consists of", // mortgage markets is Unit 13
  ],
  
  // Unit 12: Residential Mortgages - Lessons cover promissory notes, mortgages, clauses, equity, LTV
  12: [
    "Value exists when a property has", // value concepts are Unit 16 appraisal
    "When supply increases and demand remains stable", // markets Unit 15
    "Market equilibrium occurs when", // markets Unit 15
    "Economic forces affecting value include", // markets Unit 15
    "Physical forces affecting value include", // markets Unit 15
    "Government forces affecting value include", // markets Unit 15
    "Market cycles typically follow which sequence", // markets Unit 15
    "Residential demand is influenced most by", // markets Unit 15
    "Commercial demand is influenced most by", // markets Unit 15
    "Consumer confidence affects real estate by", // markets Unit 15
    "In a deed of trust, the neutral third party who holds title is the", // FL uses mortgages not deeds of trust
  ],
  
  // Unit 13: Types of Mortgages - Lessons cover FHA, VA, conventional, PMI, balloon, ARM, secondary market
  13: [
    "One discount point typically increases lender yield by", // discount points not explicitly covered
    "Simple interest is calculated on", // interest math not covered
    "The Federal Reserve increases credit availability by", // Fed policy not covered
    "Monthly interest is calculated by", // interest math not covered
    "Early payments in a fully amortized loan consist mostly of", // amortization details in Unit 12
    "The housing expense ratio compares", // qualifying ratios not covered
    "A wraparound mortgage", // wraparound not explicitly covered
    "The index in an ARM is", // ARM index details not covered
    "A negative amortization loan is one where", // negative amortization not covered
  ],
  
  // Unit 14: Closing - Lessons cover closing statements, prorations, doc stamps, RESPA - well covered
  14: [
    // Most questions are covered - keeping all
  ],
  
  // Unit 15: Markets and Analysis - Lessons cover supply/demand, buyer's/seller's market, CMA, cycles
  15: [
    "The primary objective of a property manager is to", // property management not in this unit
    "A property manager is an agent for", // property management not covered
    "Screening tenants must comply with", // property management not covered
    "Corrective maintenance involves", // property management not covered
    "Property managers can reduce risk by", // property management not covered
    "A management agreement that sets compensation and duties is", // property management not covered
    "The principle of highest and best use states that property should be valued based on", // this is appraisal Unit 16
    "Depreciation in real estate refers to", // depreciation is appraisal Unit 16
  ],
  
  // Unit 16: Real Estate Appraisal - Lessons cover approaches, USPAP, value principles, depreciation - well covered
  16: [
    // Most questions are covered - keeping all
  ],
  
  // Unit 17: Investments and Business Brokerage - Lessons cover cash flow, NOI, cap rate, leverage, GRM
  17: [
    "The Internal Rate of Return (IRR) considers", // IRR not explicitly covered
    "A 1031 exchange allows investors to", // 1031 exchanges not covered
  ],
  
  // Unit 18: Taxes - Lessons cover ad valorem, mills, homestead, special assessments, SOH, doc stamps
  18: [
    "The primary residence capital gains exclusion allows single filers to exclude up to", // federal income tax exclusion not covered
  ],
  
  // Unit 19: Planning and Zoning - Lessons cover police power, zoning, variances, comprehensive plan
  19: [
    "An Environmental Impact Statement (EIS) evaluates", // EIS/NEPA not covered in lessons
  ],
};

export async function removeUncoveredQuestions() {
  console.log("Removing questions not covered in lesson content...");
  
  const courseId = "4793335c-ce58-4cab-af5c-a9160d593ced";
  let totalRemoved = 0;
  
  for (const [unitNumStr, questionTexts] of Object.entries(questionsToRemove)) {
    const unitNum = parseInt(unitNumStr);
    if (questionTexts.length === 0) {
      console.log(`Unit ${unitNum}: all questions verified as covered`);
      continue;
    }
    
    // Find the practice exam for this unit
    const exams = await db.select().from(practiceExams).where(
      and(
        eq(practiceExams.courseId, courseId),
        like(practiceExams.title, `Unit ${unitNum} Quiz%`)
      )
    );
    
    if (exams.length === 0) {
      console.log(`Unit ${unitNum}: no quiz found, skipping`);
      continue;
    }
    
    const exam = exams[0];
    let removedFromExam = 0;
    
    // Remove matching questions from exam_questions
    for (const qText of questionTexts) {
      const result = await db.delete(examQuestions).where(
        and(
          eq(examQuestions.examId, exam.id),
          like(examQuestions.questionText, `${qText}%`)
        )
      ).returning({ id: examQuestions.id });
      
      if (result.length > 0) {
        removedFromExam += result.length;
      }
    }
    
    // Also find matching question bank and remove from bank_questions
    const banks = await db.select().from(questionBanks).where(
      and(
        eq(questionBanks.courseId, courseId),
        like(questionBanks.title, `Unit ${unitNum} Quiz%`)
      )
    );
    
    let removedFromBank = 0;
    if (banks.length > 0) {
      const bank = banks[0];
      for (const qText of questionTexts) {
        const result = await db.delete(bankQuestions).where(
          and(
            eq(bankQuestions.bankId, bank.id),
            like(bankQuestions.questionText, `${qText}%`)
          )
        ).returning({ id: bankQuestions.id });
        
        if (result.length > 0) {
          removedFromBank += result.length;
        }
      }
    }
    
    console.log(`Unit ${unitNum}: removed ${removedFromExam} from quiz, ${removedFromBank} from bank`);
    totalRemoved += removedFromExam;
  }
  
  console.log(`✓ Cleanup complete - removed ${totalRemoved} uncovered questions total`);
}
