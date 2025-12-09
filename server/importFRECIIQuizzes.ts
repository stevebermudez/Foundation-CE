/**
 * Import FREC II Quiz Questions from Document
 * Parses quiz questions from the CLAUD_FLORIDA_REAL_ESTATE_BROKER_PRE document
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
  explanation: string;
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
  
  // Split by quiz headers
  const quizSections = text.split(/(?=QUIZ \d+-\d+:)/);
  
  for (const section of quizSections) {
    const headerMatch = section.match(/^QUIZ (\d+)-(\d+):\s*([^\n]+)/);
    if (!headerMatch) continue;
    
    const sessionNumber = parseInt(headerMatch[1]);
    const quizNumber = parseInt(headerMatch[2]);
    const title = headerMatch[3].trim();
    
    // Get content after header, before answer key
    let content = section.substring(headerMatch[0].length);
    const answerKeyIndex = content.search(/Answer Key - Quiz/i);
    
    let answerContent = '';
    if (answerKeyIndex > 0) {
      answerContent = content.substring(answerKeyIndex);
      content = content.substring(0, answerKeyIndex);
    }
    
    const questions = parseQuestionsV2(content, answerContent);
    
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

function parseQuestionsV2(questionContent: string, answerContent: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  
  // Questions end with ? or : followed by options a. b. c. d.
  // Match pattern: question text ending in ? or : followed by a. optA b. optB c. optC d. optD
  const questionPattern = /([A-Z][^?:]*[?:])\s*a\.\s*([^\n]*?)\s+b\.\s*([^\n]*?)\s+c\.\s*([^\n]*?)\s+d\.\s*([^\n]*?)(?=\n|[A-Z][^?:]*[?:]|$)/g;
  
  let match: RegExpExecArray | null;
  while ((match = questionPattern.exec(questionContent)) !== null) {
    const questionText = match[1].trim();
    const options = [
      match[2].trim(),
      match[3].trim(),
      match[4].trim(),
      match[5].trim(),
    ];
    
    // Validate - question must be substantial and options non-empty
    if (questionText.length < 15) continue;
    if (options.some(o => o.length === 0 || o.length > 500)) continue;
    
    questions.push({
      questionText: cleanQuestionText(questionText),
      options,
      correctOption: 0,
      explanation: '',
    });
  }
  
  // Parse answer keys and apply to questions
  const answers = parseAnswerContent(answerContent);
  for (let i = 0; i < questions.length && i < answers.length; i++) {
    questions[i].correctOption = answers[i].correctOption;
    questions[i].explanation = answers[i].explanation;
  }
  
  return questions;
}

function cleanQuestionText(text: string): string {
  // Remove any leading option markers from previous questions
  return text.replace(/^[a-d]\.\s*[^\n]*\s*/gi, '').trim();
}

function parseAnswerContent(content: string): Array<{ correctOption: number; explanation: string }> {
  const answers: Array<{ correctOption: number; explanation: string }> = [];
  
  if (!content) return answers;
  
  // Split by answer entries - each starts with a letter followed by period
  // Format: "a. Answer text Explanation: ..."
  const answerPattern = /([a-d])\.\s*([^]*?)(?=\n\s*[a-d]\.\s|$)/gi;
  
  let match: RegExpExecArray | null;
  while ((match = answerPattern.exec(content)) !== null) {
    const letter = match[1].toLowerCase();
    const correctOption = letter.charCodeAt(0) - 'a'.charCodeAt(0);
    const explanation = match[2].trim().substring(0, 500); // Limit explanation length
    
    answers.push({ correctOption, explanation });
  }
  
  return answers;
}

async function clearExistingQuestionBanks(courseId: string) {
  const existingBanks = await db.select({ id: questionBanks.id })
    .from(questionBanks)
    .where(eq(questionBanks.courseId, courseId));
  
  for (const bank of existingBanks) {
    await db.delete(bankQuestions).where(eq(bankQuestions.bankId, bank.id));
  }
  
  await db.delete(questionBanks).where(eq(questionBanks.courseId, courseId));
  
  console.log(`Cleared ${existingBanks.length} existing question banks`);
}

export async function importFRECIIQuizzes() {
  console.log('📝 Importing FREC II Quiz Questions...\n');

  try {
    const course = await db.select().from(courses).where(eq(courses.sku, FREC_II_SKU)).limit(1);
    if (!course || course.length === 0) {
      console.log('❌ FREC II course not found');
      return;
    }
    const courseId = course[0].id;
    console.log(`Found course: ${course[0].title}`);

    await clearExistingQuestionBanks(courseId);

    const courseUnits = await db.select().from(units)
      .where(eq(units.courseId, courseId))
      .orderBy(units.unitNumber);
    
    const unitMap = new Map<number, string>();
    for (const unit of courseUnits) {
      unitMap.set(unit.unitNumber, unit.id);
    }

    console.log('Extracting document content...');
    const docText = await extractDocumentContent();

    const quizzes = parseQuizzes(docText);
    console.log(`Parsed ${quizzes.length} quizzes\n`);

    let totalQuestions = 0;

    for (const quiz of quizzes) {
      const unitId = unitMap.get(quiz.sessionNumber);
      if (!unitId) {
        console.log(`⚠️  No unit found for session ${quiz.sessionNumber}`);
        continue;
      }

      const [bank] = await db.insert(questionBanks).values({
        courseId,
        unitId,
        title: `Quiz ${quiz.sessionNumber}-${quiz.quizNumber}: ${quiz.title}`,
        bankType: 'unit_quiz',
        questionsPerAttempt: Math.min(10, quiz.questions.length),
        passingScore: 70,
        isActive: 1,
      }).returning();

      for (const q of quiz.questions) {
        await db.insert(bankQuestions).values({
          bankId: bank.id,
          questionText: q.questionText,
          options: JSON.stringify(q.options),
          correctOption: q.correctOption,
          explanation: q.explanation || `The correct answer is option ${String.fromCharCode(65 + q.correctOption)}.`,
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
