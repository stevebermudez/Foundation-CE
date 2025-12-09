/**
 * Import FREC II Quiz Questions from Document
 * Parses quiz questions from the CLAUD_FLORIDA_REAL_ESTATE_BROKER_PRE document
 * and inserts them into the question_banks and bank_questions tables
 */

import { db } from './db';
import { courses, units, questionBanks, bankQuestions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import mammoth from 'mammoth';

const FREC_II_SKU = 'FL-RE-PL-BROKER-72';
const DOCUMENT_PATH = 'attached_assets/CLAUD_FLORIDA_REAL_ESTATE_BROKER_PRE_12-8-25_1765274901520.docx';

interface ParsedQuestion {
  questionText: string;
  options: string[];
  correctOption: number;
}

interface ParsedQuiz {
  sessionNumber: number;
  quizNumber: number;
  title: string;
  questions: ParsedQuestion[];
}

async function extractDocumentContent(): Promise<string> {
  const result = await mammoth.extractRawText({ path: DOCUMENT_PATH });
  return result.value;
}

function parseQuizzes(text: string): ParsedQuiz[] {
  const quizzes: ParsedQuiz[] = [];
  
  // Find all quiz blocks using exec loop
  const quizPattern = /QUIZ (\d+)-(\d+): ([^\n]+)\n([\s\S]*?)(?=QUIZ \d+-\d+:|SESSION \d+:|FINAL EXAM|$)/g;
  let quizMatch: RegExpExecArray | null;
  
  while ((quizMatch = quizPattern.exec(text)) !== null) {
    const sessionNumber = parseInt(quizMatch[1]);
    const quizNumber = parseInt(quizMatch[2]);
    const title = quizMatch[3].trim();
    const content = quizMatch[4];
    
    const questions: ParsedQuestion[] = [];
    
    // Pattern: Question text followed by a. b. c. d. options
    const questionPattern = /([A-Z][^?]+\?)\s*a\.\s*([^b]+)b\.\s*([^c]+)c\.\s*([^d]+)d\.\s*([^\n]+)/g;
    let qMatch: RegExpExecArray | null;
    
    while ((qMatch = questionPattern.exec(content)) !== null) {
      const opts = [
        qMatch[2].trim(),
        qMatch[3].trim(),
        qMatch[4].trim(),
        qMatch[5].trim(),
      ];
      questions.push({
        questionText: qMatch[1].trim(),
        options: opts,
        correctOption: 2, // Default to 'c' (index 2) - will be updated from answer key
      });
    }
    
    if (questions.length > 0) {
      quizzes.push({
        sessionNumber,
        quizNumber,
        title,
        questions,
      });
    }
  }
  
  return quizzes;
}

function parseAnswerKey(text: string): Map<string, number[]> {
  const answerKeys = new Map<string, number[]>();
  
  // Find answer key sections
  const keyPattern = /QUIZ (\d+)-(\d+) ANSWER KEY\n([\s\S]*?)(?=QUIZ \d+-\d+ ANSWER KEY|SESSION \d+:|FINAL EXAM|$)/g;
  let keyMatch: RegExpExecArray | null;
  
  while ((keyMatch = keyPattern.exec(text)) !== null) {
    const key = `${keyMatch[1]}-${keyMatch[2]}`;
    const answers: number[] = [];
    
    // Parse answers like "1. c" or "1. C"
    const answerPattern = /(\d+)\.\s*([A-Da-d])/g;
    let aMatch: RegExpExecArray | null;
    while ((aMatch = answerPattern.exec(keyMatch[3])) !== null) {
      const letter = aMatch[2].toLowerCase();
      const index = letter.charCodeAt(0) - 'a'.charCodeAt(0); // a=0, b=1, c=2, d=3
      answers.push(index);
    }
    
    if (answers.length > 0) {
      answerKeys.set(key, answers);
    }
  }
  
  return answerKeys;
}

export async function importFRECIIQuizzes() {
  console.log('📝 Importing FREC II Quiz Questions...\n');

  try {
    // Find the FREC II course
    const course = await db.select().from(courses).where(eq(courses.sku, FREC_II_SKU)).limit(1);
    if (!course || course.length === 0) {
      console.log('❌ FREC II course not found');
      return;
    }
    const courseId = course[0].id;
    console.log(`Found course: ${course[0].title}`);

    // Get all units
    const courseUnits = await db.select().from(units)
      .where(eq(units.courseId, courseId))
      .orderBy(units.unitNumber);
    
    // Create unit lookup
    const unitMap = new Map<number, string>();
    for (const unit of courseUnits) {
      unitMap.set(unit.unitNumber, unit.id);
    }

    // Extract document content
    console.log('Extracting document content...');
    const docText = await extractDocumentContent();

    // Parse quizzes and answer keys
    const quizzes = parseQuizzes(docText);
    const answerKeys = parseAnswerKey(docText);
    console.log(`Parsed ${quizzes.length} quizzes\n`);

    let totalQuestions = 0;

    for (const quiz of quizzes) {
      const unitId = unitMap.get(quiz.sessionNumber);
      if (!unitId) {
        console.log(`⚠️  No unit found for session ${quiz.sessionNumber}`);
        continue;
      }

      // Apply answer key if available
      const key = `${quiz.sessionNumber}-${quiz.quizNumber}`;
      const answers = answerKeys.get(key);
      if (answers) {
        for (let i = 0; i < Math.min(quiz.questions.length, answers.length); i++) {
          quiz.questions[i].correctOption = answers[i];
        }
      }

      // Create question bank
      const [bank] = await db.insert(questionBanks).values({
        courseId,
        unitId,
        title: `Quiz ${quiz.sessionNumber}-${quiz.quizNumber}: ${quiz.title}`,
        bankType: 'unit_quiz',
        questionsPerAttempt: Math.min(10, quiz.questions.length),
        passingScore: 70,
        isActive: 1,
      }).returning();

      // Insert questions
      for (let i = 0; i < quiz.questions.length; i++) {
        const q = quiz.questions[i];
        await db.insert(bankQuestions).values({
          bankId: bank.id,
          questionText: q.questionText,
          options: JSON.stringify(q.options),
          correctOption: q.correctOption,
          explanation: `The correct answer is option ${String.fromCharCode(97 + q.correctOption).toUpperCase()}.`,
        });
      }

      console.log(`✅ Quiz ${quiz.sessionNumber}-${quiz.quizNumber}: ${quiz.questions.length} questions`);
      totalQuestions += quiz.questions.length;
    }

    console.log(`\n🎉 Imported ${quizzes.length} quizzes with ${totalQuestions} total questions`);

  } catch (error) {
    console.error('❌ Error importing quizzes:', error);
    throw error;
  }
}

// Run if executed directly
import { fileURLToPath } from 'url';
const isMain = process.argv[1] && fileURLToPath(import.meta.url).includes(process.argv[1].replace(/\.ts$/, ''));

if (isMain) {
  importFRECIIQuizzes()
    .then(() => {
      console.log('\n✅ Completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed:', error);
      process.exit(1);
    });
}
