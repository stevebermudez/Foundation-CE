import { db } from "./db";
import { practiceExams, examQuestions, courses } from "@shared/schema";
import { eq, like } from "drizzle-orm";

const realQuestionsByUnit: Record<number, Array<{
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}>> = {
  1: [
    { text: "The primary 'product' that a real estate sales associate offers to the public is", options: ["A. financing at below-market interest rates", "B. expert information on property transfer, markets, and marketing", "C. the legal right to draft deeds for customers", "D. construction management services"], correctAnswer: "B", explanation: "Real estate professionals provide expert knowledge and marketing services." },
    { text: "A sales associate who specializes in listing and selling income-producing office buildings and shopping centers is most likely working in", options: ["A. industrial sales", "B. agricultural sales", "C. residential sales", "D. commercial sales"], correctAnswer: "D", explanation: "Commercial real estate involves income-producing properties like office buildings." },
    { text: "A property manager's main responsibility is to", options: ["A. obtain the highest possible selling price for the property", "B. protect the owner's investment and maximize the owner's return", "C. originate mortgage loans for tenants", "D. represent tenants in eviction proceedings"], correctAnswer: "B", explanation: "Property managers focus on protecting and maximizing the owner's investment." },
    { text: "Which statement regarding a comparative market analysis (CMA) is accurate", options: ["A. A CMA must comply with USPAP and can only be prepared by a state-certified appraiser", "B. A CMA is a type of federally regulated appraisal", "C. A CMA estimates probable selling price using recent comparable sales", "D. A CMA may be described to the public as an appraisal"], correctAnswer: "C", explanation: "A CMA uses comparable sales to estimate probable selling price." },
    { text: "USPAP primarily sets standards for", options: ["A. property management agreements", "B. real estate license law enforcement", "C. ethical advertising practices", "D. appraisal practice and appraiser ethics"], correctAnswer: "D", explanation: "USPAP establishes ethical and performance standards for appraisers." },
    { text: "A sales associate is asked by a customer to 'do an appraisal' on the customer's house. The sales associate prepares a detailed CMA. To comply with Florida law, the sales associate should", options: ["A. advertise the CMA as a certified residential appraisal", "B. clearly identify the work product as a CMA, not an appraisal", "C. sign the report as a state-certified appraiser", "D. charge the same fee that a state-certified appraiser would charge"], correctAnswer: "B", explanation: "A CMA must be clearly identified as such, not an appraisal." },
    { text: "Which type of residential construction involves building homes on a large scale using model homes and standardized plans", options: ["A. Custom homes", "B. Spec homes", "C. Tract homes", "D. Modular homes"], correctAnswer: "C", explanation: "Tract homes are built on a large scale using standardized plans." },
    { text: "A developer purchases raw land, records a subdivision plat map, installs streets and utilities, then sells improved lots to builders. This process is called", options: ["A. assemblage", "B. subdivision and development", "C. dedication", "D. condemnation"], correctAnswer: "B", explanation: "Subdivision and development involves dividing land and adding infrastructure." },
    { text: "Dedication occurs when", options: ["A. a seller dedicates a property to charity for tax benefits", "B. a government agency takes land through eminent domain", "C. a developer transfers streets or parks to a governmental body for public use", "D. a lender records a mortgage in the public records"], correctAnswer: "C", explanation: "Dedication is the transfer of land to government for public use." },
    { text: "A real estate professional who specializes in analyzing existing or potential projects and providing advice to investors is primarily engaged in", options: ["A. counseling", "B. industrial sales", "C. property management", "D. title insurance"], correctAnswer: "A", explanation: "Real estate counselors provide investment advice and project analysis." },
    { text: "The five major sales specialties in real estate are residential, commercial, industrial, agricultural, and", options: ["A. property management", "B. business opportunity brokerage", "C. appraisal", "D. mortgage brokerage"], correctAnswer: "B", explanation: "Business opportunity brokerage is one of the five major sales specialties." },
    { text: "Which of the following is NOT a role or function in the real estate industry", options: ["A. Licensed sales associate", "B. Mortgage originator", "C. Title insurer", "D. Building architect"], correctAnswer: "D", explanation: "Building architect is not typically considered a real estate industry role." },
    { text: "A broker who oversees a sales office with multiple agents is responsible for", options: ["A. ensuring agents comply with license law and firm policies", "B. personally closing every transaction", "C. negotiating all contracts on behalf of clients", "D. setting all listing and selling prices"], correctAnswer: "A", explanation: "Brokers ensure compliance with license law and firm policies." },
    { text: "When a sales associate lists a property, they are primarily acting as a", options: ["A. principal", "B. fiduciary", "C. appraiser", "D. lender"], correctAnswer: "B", explanation: "A sales associate acts as a fiduciary when representing a client." },
    { text: "The real estate market's size and health significantly impact which other industries", options: ["A. construction, mortgage lending, and title insurance", "B. agriculture only", "C. government services only", "D. hospitality and entertainment only"], correctAnswer: "A", explanation: "Real estate impacts construction, lending, and title insurance industries." },
    { text: "A buyer's agent represents the buyer's interests and owes them", options: ["A. no special duties", "B. fiduciary duties of loyalty, care, and disclosure", "C. only a duty to find a property", "D. duties only after closing"], correctAnswer: "B", explanation: "Buyer's agents owe fiduciary duties to their clients." },
    { text: "Real estate professionals benefit their clients by providing", options: ["A. access to properties for free", "B. guaranteed financing", "C. expert knowledge accumulated through repeated transactions", "D. legal representation in court"], correctAnswer: "C", explanation: "Professionals provide expert knowledge from transaction experience." },
    { text: "Which of the following best describes the relationship between property values and neighborhood demand", options: ["A. property values always increase", "B. demand affects market conditions and property values", "C. property values are set by the government", "D. neighborhood demand has no effect on value"], correctAnswer: "B", explanation: "Demand directly affects market conditions and property values." },
    { text: "A broker who maintains a trust account must", options: ["A. commingle client funds with personal funds", "B. maintain detailed records of all deposits and withdrawals", "C. use client funds for personal expenses temporarily", "D. place funds in a personal bank account"], correctAnswer: "B", explanation: "Brokers must maintain detailed trust account records." },
    { text: "The primary purpose of Florida real estate license law is to", options: ["A. increase the income of real estate licensees", "B. protect the public by regulating real estate brokers and sales associates", "C. create a standard form of real estate contract", "D. regulate interest rates charged on real estate loans"], correctAnswer: "B", explanation: "License law primarily protects the public through regulation." }
  ],
  2: [
    { text: "The Division of Real Estate is a part of which state agency", options: ["A. Department of Education", "B. Department of Business and Professional Regulation", "C. Department of Revenue", "D. Department of State"], correctAnswer: "B", explanation: "The Division of Real Estate is under DBPR." },
    { text: "To apply for a Florida sales associate license, an applicant must be at least", options: ["A. 16 years old", "B. 18 years old", "C. 21 years old", "D. 25 years old"], correctAnswer: "B", explanation: "Applicants must be at least 18 years old." },
    { text: "A sales associate license is issued by the", options: ["A. local real estate board", "B. FREC", "C. DBPR", "D. state attorney general"], correctAnswer: "C", explanation: "DBPR issues real estate licenses in Florida." },
    { text: "FREC determines an applicant's fitness for licensure based on", options: ["A. the applicant's financial status", "B. the applicant's good moral character", "C. the applicant's personal references", "D. the applicant's driving record"], correctAnswer: "B", explanation: "Good moral character is required for licensure." },
    { text: "Which of the following is NOT a requirement for obtaining a Florida sales associate license", options: ["A. Pass the state licensing examination", "B. Complete required pre-licensing education", "C. Be at least 21 years of age", "D. Have a Social Security number"], correctAnswer: "C", explanation: "The age requirement is 18, not 21." },
    { text: "An active license status means the licensee", options: ["A. has completed post-licensing education", "B. is authorized to practice real estate", "C. has been licensed for at least one year", "D. is working full-time as a sales associate"], correctAnswer: "B", explanation: "Active status allows the licensee to practice." },
    { text: "A person who has been convicted of a felony may", options: ["A. never obtain a real estate license", "B. obtain a license if the conviction is expunged", "C. obtain a license at FREC's discretion", "D. obtain a license only after 20 years"], correctAnswer: "C", explanation: "FREC has discretion in evaluating felony convictions." },
    { text: "Post-licensing education must be completed within", options: ["A. 6 months", "B. 12 months", "C. 18 months", "D. 24 months"], correctAnswer: "D", explanation: "Post-licensing must be completed within 24 months." },
    { text: "A sales associate must work under", options: ["A. any licensed sales associate", "B. a licensed broker", "C. an attorney", "D. a mortgage lender"], correctAnswer: "B", explanation: "Sales associates must work under a licensed broker." },
    { text: "License renewal for sales associates occurs every", options: ["A. 1 year", "B. 2 years", "C. 3 years", "D. 5 years"], correctAnswer: "B", explanation: "Sales associate licenses renew every 2 years." },
    { text: "Continuing education requirements include", options: ["A. 14 hours every 2 years", "B. 14 hours every year", "C. 45 hours every 2 years", "D. 45 hours every year"], correctAnswer: "A", explanation: "CE requirement is 14 hours every 2 years." },
    { text: "A temporary license may be issued", options: ["A. to any applicant who pays the fee", "B. to a surviving spouse of a broker", "C. only to attorneys", "D. only to CPAs"], correctAnswer: "B", explanation: "Temporary licenses may be issued to surviving spouses." },
    { text: "The license of a sales associate who changes employing brokers", options: ["A. becomes inactive automatically", "B. must be transferred within 10 days", "C. is permanently revoked", "D. is suspended for 90 days"], correctAnswer: "B", explanation: "License transfer must occur within 10 days." },
    { text: "Which entity establishes education requirements for real estate licensees", options: ["A. FREC", "B. Local real estate boards", "C. The state legislature only", "D. Federal agencies"], correctAnswer: "A", explanation: "FREC establishes education requirements." },
    { text: "A real estate school must be approved by", options: ["A. DBPR", "B. The Department of Education", "C. Local government", "D. FREC"], correctAnswer: "A", explanation: "DBPR approves real estate schools." },
    { text: "Mutual recognition agreements allow", options: ["A. automatic licensure from any state", "B. licensure for applicants from participating states", "C. exemption from all requirements", "D. practice without a license"], correctAnswer: "B", explanation: "MRA allows licensure from participating states." },
    { text: "A broker associate is", options: ["A. an unlicensed assistant", "B. a broker working under another broker", "C. a sales associate in training", "D. a property manager"], correctAnswer: "B", explanation: "A broker associate is a broker working under another broker." },
    { text: "Group licenses are issued for", options: ["A. teams of sales associates", "B. multiple branch offices", "C. owner-developers", "D. property management firms"], correctAnswer: "C", explanation: "Group licenses are for owner-developers." },
    { text: "An expired license may be reactivated by", options: ["A. paying a fee only", "B. completing education and paying fees", "C. retaking the state exam", "D. starting the application process over"], correctAnswer: "B", explanation: "Reactivation requires education and fees." },
    { text: "The penalty for practicing real estate without a license is", options: ["A. a warning letter", "B. civil penalties only", "C. a third-degree felony", "D. a misdemeanor"], correctAnswer: "C", explanation: "Unlicensed practice is a third-degree felony." }
  ]
};

export async function updatePlaceholderQuestions() {
  try {
    console.log("Checking for placeholder questions to update...");
    
    const courseResult = await db
      .select()
      .from(courses)
      .where(eq(courses.sku, "FL-RE-PL-SA-FRECI-63"))
      .limit(1);
    
    if (courseResult.length === 0) {
      console.log("FREC I course not found");
      return;
    }
    
    const course = courseResult[0];
    
    const allExams = await db
      .select()
      .from(practiceExams)
      .where(eq(practiceExams.courseId, course.id));
    
    let totalUpdated = 0;
    
    for (const exam of allExams) {
      const unitMatch = exam.title?.match(/Unit\s+(\d+)/i);
      if (!unitMatch) continue;
      
      const unitNum = parseInt(unitMatch[1], 10);
      const realQuestions = realQuestionsByUnit[unitNum];
      
      if (!realQuestions) {
        console.log(`No real questions defined for Unit ${unitNum}, skipping`);
        continue;
      }
      
      const questions = await db
        .select()
        .from(examQuestions)
        .where(eq(examQuestions.examId, exam.id));
      
      const placeholderQuestions = questions.filter(q => 
        q.questionText?.includes('Sample question') ||
        q.questionText?.includes('for this unit covering key concepts')
      );
      
      if (placeholderQuestions.length === 0) {
        console.log(`Unit ${unitNum}: No placeholder questions found`);
        continue;
      }
      
      console.log(`Unit ${unitNum}: Found ${placeholderQuestions.length} placeholder questions to update`);
      
      for (let i = 0; i < placeholderQuestions.length && i < realQuestions.length; i++) {
        const placeholder = placeholderQuestions[i];
        const real = realQuestions[i];
        
        await db
          .update(examQuestions)
          .set({
            questionText: real.text,
            options: JSON.stringify(real.options),
            correctAnswer: real.correctAnswer,
            explanation: real.explanation
          })
          .where(eq(examQuestions.id, placeholder.id));
        
        totalUpdated++;
      }
      
      console.log(`Unit ${unitNum}: Updated ${Math.min(placeholderQuestions.length, realQuestions.length)} questions`);
    }
    
    console.log(`Total placeholder questions updated: ${totalUpdated}`);
    
  } catch (error) {
    console.error("Error updating placeholder questions:", error);
  }
}
