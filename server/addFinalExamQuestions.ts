/**
 * Script to add new questions to FREC I Final Exams Form A and Form B
 * Form A: Add 4 questions (Q97-Q100) to bring total from 96 to 100
 * Form B: Add 5 questions (Q96-Q100) to bring total from 95 to 100
 */

import { db } from './db';
import { practiceExams, examQuestions } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const FREC_I_COURSE_ID = '4793335c-ce58-4cab-af5c-a9160d593ced';

interface NewQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  pageReference?: string;
  unitReference?: string;
}

const formANewQuestions: NewQuestion[] = [
  {
    questionText: "A broker associate is best described as a person who:",
    options: [
      "A. Holds a sales associate license and supervises other agents",
      "B. Holds a broker license but chooses to work under another broker's supervision",
      "C. Manages a branch office independently",
      "D. Only handles commercial transactions"
    ],
    correctAnswer: "B",
    explanation: "A broker associate is an individual who has earned a broker license but elects to work under the supervision of another broker rather than operating their own brokerage. This allows them to benefit from an established firm's resources while maintaining their broker credentials.",
    pageReference: "Page 2",
    unitReference: "Unit 1, Lesson 3"
  },
  {
    questionText: "When a buyer provides earnest money with a purchase offer, the broker must:",
    options: [
      "A. Deposit it into the broker's personal account immediately",
      "B. Return it to the buyer if the seller doesn't accept within 24 hours",
      "C. Hold it without depositing until closing",
      "D. Deposit it into the brokerage escrow account by the end of the third business day following receipt"
    ],
    correctAnswer: "D",
    explanation: "Florida law requires that earnest money deposits be placed in the broker's escrow account by the end of the third business day following receipt, unless the contract specifies otherwise. Commingling with personal or business operating funds is prohibited.",
    pageReference: "Page 22",
    unitReference: "Unit 5, Lesson 3"
  },
  {
    questionText: "A periodic estate is characterized by:",
    options: [
      "A. Automatic renewal from period to period until properly terminated by either party",
      "B. A definite beginning and ending date with no renewal",
      "C. Tenancy without the landlord's permission",
      "D. Ownership that reverts to the grantor upon a specific event"
    ],
    correctAnswer: "A",
    explanation: "A periodic estate (such as month-to-month or year-to-year tenancy) automatically renews at the end of each period unless proper notice of termination is given by either the landlord or tenant. This distinguishes it from an estate for years, which has a definite termination date.",
    pageReference: "Page 41",
    unitReference: "Unit 8, Lesson 4"
  },
  {
    questionText: "The government's authority to enact zoning ordinances and building codes is derived from:",
    options: [
      "A. Eminent domain",
      "B. Escheat",
      "C. Police power",
      "D. Taxation authority"
    ],
    correctAnswer: "C",
    explanation: "Police power is the government's constitutional authority to enact laws and regulations to protect the public health, safety, morals, and general welfare. Zoning ordinances, building codes, and environmental regulations are all exercises of police power. Unlike eminent domain, police power does not require compensation to property owners.",
    pageReference: "Page 38",
    unitReference: "Unit 8, Lesson 1"
  }
];

const formBNewQuestions: NewQuestion[] = [
  {
    questionText: "Once a purchase contract is fully executed, the buyer holds:",
    options: [
      "A. Legal title to the property",
      "B. Equitable title to the property",
      "C. A leasehold interest in the property",
      "D. Fee simple ownership of the property"
    ],
    correctAnswer: "B",
    explanation: "When a sales contract is executed, the buyer acquires equitable title, which represents the right to obtain full legal ownership upon fulfillment of contract terms. Legal title remains with the seller until the deed is delivered and accepted at closing.",
    pageReference: "Page 56",
    unitReference: "Unit 11, Lesson 2"
  },
  {
    questionText: "Which physical characteristic of land refers to the fact that land cannot be destroyed?",
    options: [
      "A. Immobility",
      "B. Uniqueness (heterogeneity)",
      "C. Scarcity",
      "D. Indestructibility"
    ],
    correctAnswer: "D",
    explanation: "Indestructibility (also called durability) is the physical characteristic recognizing that land is permanent and cannot be destroyed. While buildings may be demolished and surfaces altered, the land itself endures.",
    pageReference: "Page 38",
    unitReference: "Unit 8, Lesson 1"
  },
  {
    questionText: "A tenant who remains in possession after their lease expires without the landlord's consent is holding:",
    options: [
      "A. An estate at sufferance",
      "B. A periodic estate",
      "C. An estate at will",
      "D. An estate for years"
    ],
    correctAnswer: "A",
    explanation: "An estate at sufferance occurs when a tenant wrongfully remains in possession after their legal right to occupy has ended, without the landlord's consent. The tenant is called a holdover tenant.",
    pageReference: "Page 41",
    unitReference: "Unit 8, Lesson 4"
  },
  {
    questionText: "FHA loans use qualifying ratios of:",
    options: [
      "A. 28% front-end and 36% back-end",
      "B. 29% front-end and 41% back-end",
      "C. 31% front-end and 43% back-end",
      "D. 25% front-end and 33% back-end"
    ],
    correctAnswer: "C",
    explanation: "FHA loans typically use qualifying ratios of 31% for the front-end ratio (housing expense to income) and 43% for the back-end ratio (total debt to income). These ratios are more lenient than conventional loan standards (28/36) because FHA loans are insured by the federal government.",
    pageReference: "Page 66",
    unitReference: "Unit 13, Lesson 2"
  },
  {
    questionText: "An abstract of title provides:",
    options: [
      "A. Insurance against title defects",
      "B. A historical summary of all recorded documents affecting title to a property",
      "C. A guarantee of clear title",
      "D. The current market value of the property"
    ],
    correctAnswer: "B",
    explanation: "An abstract of title is a condensed history of the title to a property, consisting of a summary of all recorded documents that affect the title. It includes deeds, mortgages, liens, judgments, and other encumbrances. Unlike title insurance, an abstract does not provide protection against defects.",
    pageReference: "Page 46",
    unitReference: "Unit 9, Lesson 3"
  }
];

async function addQuestionsToExam(examId: string, questions: NewQuestion[], startSequence: number) {
  console.log(`Adding ${questions.length} questions to exam ${examId} starting at sequence ${startSequence}`);
  
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const sequence = startSequence + i;
    
    await db.insert(examQuestions).values({
      id: uuidv4(),
      examId,
      questionText: q.questionText,
      questionType: 'multiple_choice',
      options: JSON.stringify(q.options),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      sequence,
      pageReference: q.pageReference,
      unitReference: q.unitReference
    });
    
    console.log(`  Added Q${sequence}: ${q.questionText.substring(0, 50)}...`);
  }
}

async function updateExamTotalQuestions(examId: string, totalQuestions: number) {
  await db.update(practiceExams)
    .set({ totalQuestions })
    .where(eq(practiceExams.id, examId));
  console.log(`Updated exam ${examId} totalQuestions to ${totalQuestions}`);
}

async function main() {
  console.log('=== Adding New Questions to FREC I Final Exams ===\n');
  
  // Get Form A and Form B exams
  const exams = await db.select()
    .from(practiceExams)
    .where(and(
      eq(practiceExams.courseId, FREC_I_COURSE_ID),
      eq(practiceExams.isFinalExam, 1)
    ));
  
  const formA = exams.find(e => e.examForm === 'A');
  const formB = exams.find(e => e.examForm === 'B');
  
  if (!formA) {
    console.error('Form A final exam not found!');
    return;
  }
  
  if (!formB) {
    console.error('Form B final exam not found!');
    return;
  }
  
  console.log(`Form A: ${formA.id} (${formA.title})`);
  console.log(`Form B: ${formB.id} (${formB.title})`);
  
  // Get current question counts
  const formAQuestions = await db.select({ count: sql<number>`count(*)` })
    .from(examQuestions)
    .where(eq(examQuestions.examId, formA.id));
  
  const formBQuestions = await db.select({ count: sql<number>`count(*)` })
    .from(examQuestions)
    .where(eq(examQuestions.examId, formB.id));
  
  const formACount = Number(formAQuestions[0]?.count || 0);
  const formBCount = Number(formBQuestions[0]?.count || 0);
  
  console.log(`\nCurrent counts: Form A = ${formACount}, Form B = ${formBCount}`);
  
  // Add questions to Form A (starting at sequence 97)
  if (formACount < 100) {
    console.log('\n--- Adding Form A Questions ---');
    await addQuestionsToExam(formA.id, formANewQuestions, 97);
    await updateExamTotalQuestions(formA.id, 100);
  } else {
    console.log('Form A already has 100+ questions, skipping');
  }
  
  // Add questions to Form B (starting at sequence 96)
  if (formBCount < 100) {
    console.log('\n--- Adding Form B Questions ---');
    await addQuestionsToExam(formB.id, formBNewQuestions, 96);
    await updateExamTotalQuestions(formB.id, 100);
  } else {
    console.log('Form B already has 100+ questions, skipping');
  }
  
  // Verify final counts
  const finalFormAQuestions = await db.select({ count: sql<number>`count(*)` })
    .from(examQuestions)
    .where(eq(examQuestions.examId, formA.id));
  
  const finalFormBQuestions = await db.select({ count: sql<number>`count(*)` })
    .from(examQuestions)
    .where(eq(examQuestions.examId, formB.id));
  
  console.log('\n=== Final Question Counts ===');
  console.log(`Form A: ${finalFormAQuestions[0]?.count} questions`);
  console.log(`Form B: ${finalFormBQuestions[0]?.count} questions`);
  console.log('\nDone!');
}

main().catch(console.error);
