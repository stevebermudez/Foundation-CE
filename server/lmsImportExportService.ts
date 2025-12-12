/**
 * Comprehensive LMS Import/Export Service
 * 
 * Supports:
 * - SCORM 1.2 & 2004
 * - xAPI (Tin Can API)
 * - IMS Common Cartridge 1.0, 1.1, 1.2, 1.3
 * - QTI 2.1, 2.2 (for quizzes/assessments)
 * - HTML toggle for exports
 */

import { db } from "./db";
import { 
  courses, units, lessons, questionBanks, bankQuestions, practiceExams, examQuestions, contentBlocks 
} from "@shared/schema";
import { eq } from "drizzle-orm";
import archiver from "archiver";
import * as fs from "fs";
import * as path from "path";
import { Readable } from "stream";
import { v4 as uuidv4 } from "uuid";
// Note: xml2js would need to be installed: npm install xml2js @types/xml2js
// For now, using basic string parsing for XML

// ============================================
// Types and Interfaces
// ============================================

export interface ExportOptions {
  includeHTML?: boolean; // Toggle HTML formatting in content
  includeQuizzes?: boolean;
  includeAssessments?: boolean;
  includeVideos?: boolean;
  includeMetadata?: boolean;
  format?: 'scorm12' | 'scorm2004' | 'xapi' | 'imscc' | 'qti' | 'json';
  stripHTML?: boolean; // Alternative to includeHTML for backward compatibility
}

export interface ImportOptions {
  format?: 'scorm12' | 'scorm2004' | 'xapi' | 'imscc' | 'qti' | 'json' | 'auto';
  extractQuizzes?: boolean;
  extractAssessments?: boolean;
  createUnits?: boolean;
  overwriteExisting?: boolean;
}

export interface ImportResult {
  success: boolean;
  courseId?: string;
  unitsCreated: number;
  lessonsCreated: number;
  quizzesExtracted: number;
  assessmentsExtracted: number;
  errors: string[];
  warnings: string[];
}

// ============================================
// HTML Content Processing
// ============================================

function processContent(content: string | null | undefined, options: ExportOptions): string {
  if (!content) return '';
  
  const includeHTML = options.includeHTML !== false && !options.stripHTML;
  
  if (includeHTML) {
    return content; // Return HTML as-is
  } else {
    // Strip HTML and return plain text
    return content
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}

// ============================================
// SCORM Export
// ============================================

export async function exportSCORM(
  courseId: string, 
  version: '1.2' | '2004' = '1.2',
  options: ExportOptions = {}
): Promise<Buffer> {
  const course = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course.length) throw new Error("Course not found");

  const courseData = course[0];
  const courseUnits = await db.select().from(units).where(eq(units.courseId, courseId)).orderBy(units.unitNumber);
  
  const archive = archiver('zip', { zlib: { level: 9 } });
  const chunks: Buffer[] = [];
  
  archive.on('data', (chunk) => chunks.push(chunk));
  
  // Generate manifest
  const manifest = await generateSCORMManifest(courseId, version, options);
  archive.append(manifest, { name: 'imsmanifest.xml' });
  
  // Generate content files
  for (const unit of courseUnits) {
    const unitLessons = await db.select().from(lessons)
      .where(eq(lessons.unitId, unit.id))
      .orderBy(lessons.lessonNumber);
    
    for (const lesson of unitLessons) {
      const content = processContent(lesson.content, options);
      const htmlContent = generateLessonHTML(lesson, content, courseData, options);
      archive.append(htmlContent, { name: `content/lesson_${lesson.id}.html` });
    }
  }
  
  // Add SCORM API wrapper
  const apiWrapper = getSCORMApiWrapper(version);
  archive.append(apiWrapper, { name: 'scorm_api.js' });
  
  await archive.finalize();
  
  return Buffer.concat(chunks);
}

async function generateSCORMManifest(
  courseId: string, 
  version: '1.2' | '2004',
  options: ExportOptions
): Promise<string> {
  const course = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course.length) throw new Error("Course not found");

  const courseData = course[0];
  const courseUnits = await db.select().from(units).where(eq(units.courseId, courseId)).orderBy(units.unitNumber);
  
  const manifestId = `course_${courseId}`;
  const schemaVersion = version === '1.2' ? '1.2' : 'CAM 1.3';
  
  let manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${manifestId}" version="1" 
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                      http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd
                      http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>${schemaVersion}</schemaversion>
    <lom xmlns="http://ltsc.ieee.org/xsd/LOM">
      <general>
        <identifier>
          <catalog>URI</catalog>
          <entry>${manifestId}</entry>
        </identifier>
        <title>
          <string>${escapeXML(courseData.title)}</string>
        </title>
        <description>
          <string>${escapeXML(courseData.description || '')}</string>
        </description>
      </general>
    </lom>
  </metadata>
  <organizations default="TOC1">
    <organization identifier="TOC1" structure="hierarchical">
      <title>${escapeXML(courseData.title)}</title>`;
  
  for (const unit of courseUnits) {
    const unitLessons = await db.select().from(lessons)
      .where(eq(lessons.unitId, unit.id))
      .orderBy(lessons.lessonNumber);
    
    manifest += `
      <item identifier="unit_${unit.id}">
        <title>${escapeXML(unit.title)}</title>`;
    
    for (const lesson of unitLessons) {
      manifest += `
        <item identifier="lesson_${lesson.id}" identifierref="res_lesson_${lesson.id}">
          <title>${escapeXML(lesson.title)}</title>
        </item>`;
    }
    
    manifest += `
      </item>`;
  }
  
  manifest += `
    </organization>
  </organizations>
  <resources>`;
  
  for (const unit of courseUnits) {
    const unitLessons = await db.select().from(lessons)
      .where(eq(lessons.unitId, unit.id))
      .orderBy(lessons.lessonNumber);
    
    for (const lesson of unitLessons) {
      manifest += `
    <resource identifier="res_lesson_${lesson.id}" type="webcontent" adlcp:scormtype="sco" href="content/lesson_${lesson.id}.html">
      <file href="content/lesson_${lesson.id}.html"/>
    </resource>`;
    }
  }
  
  manifest += `
  </resources>
</manifest>`;
  
  return manifest;
}

function generateLessonHTML(lesson: any, content: string, course: any, options: ExportOptions): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHTML(lesson.title)}</title>
  <script src="../scorm_api.js"></script>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .content { line-height: 1.6; }
  </style>
</head>
<body>
  <h1>${escapeHTML(lesson.title)}</h1>
  <div class="content">${options.includeHTML !== false && !options.stripHTML ? content : escapeHTML(content)}</div>
  <script>
    if (typeof API !== 'undefined') {
      API.LMSInitialize('');
      API.LMSSetValue('cmi.core.lesson_status', 'completed');
      API.LMSCommit('');
    }
  </script>
</body>
</html>`;
}

function getSCORMApiWrapper(version: '1.2' | '2004'): string {
  // Simplified SCORM API wrapper
  return `
var API = null;
var API_1484_11 = null;

function findAPI(win) {
  while ((win.API == null || win.API_1484_11 == null) && (win.parent != null && win.parent != win)) {
    win = win.parent;
  }
  return win.API || win.API_1484_11;
}

API = findAPI(window);
if (API == null) {
  API = findAPI(window.top);
}

if (API == null) {
  console.warn('SCORM API not found');
  API = {
    LMSInitialize: function() { return 'true'; },
    LMSFinish: function() { return 'true'; },
    LMSGetValue: function() { return ''; },
    LMSSetValue: function() { return 'true'; },
    LMSCommit: function() { return 'true'; },
    LMSGetLastError: function() { return '0'; },
    LMSGetErrorString: function() { return 'No error'; },
    LMSGetDiagnostic: function() { return 'No diagnostic'; }
  };
}
`;
}

// ============================================
// IMS Common Cartridge Export
// ============================================

export async function exportIMSCC(courseId: string, options: ExportOptions = {}): Promise<Buffer> {
  const course = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course.length) throw new Error("Course not found");

  const courseData = course[0];
  const courseUnits = await db.select().from(units).where(eq(units.courseId, courseId)).orderBy(units.unitNumber);
  
  const archive = archiver('zip', { zlib: { level: 9 } });
  const chunks: Buffer[] = [];
  
  archive.on('data', (chunk) => chunks.push(chunk));
  
  // Generate manifest
  const manifest = await generateIMSCCManifest(courseId, options);
  archive.append(manifest, { name: 'imsmanifest.xml' });
  
  // Generate content
  for (const unit of courseUnits) {
    const unitLessons = await db.select().from(lessons)
      .where(eq(lessons.unitId, unit.id))
      .orderBy(lessons.lessonNumber);
    
    for (const lesson of unitLessons) {
      const content = processContent(lesson.content, options);
      const htmlContent = generateLessonHTML(lesson, content, courseData, options);
      archive.append(htmlContent, { name: `content/lesson_${lesson.id}.html` });
    }
  }
  
  // Export quizzes if requested
  if (options.includeQuizzes) {
    const quizzes = await exportQuizzesAsQTI(courseId, options);
    for (const [filename, content] of Object.entries(quizzes)) {
      archive.append(content, { name: `assessments/${filename}` });
    }
  }
  
  await archive.finalize();
  
  return Buffer.concat(chunks);
}

async function generateIMSCCManifest(courseId: string, options: ExportOptions): Promise<string> {
  const course = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course.length) throw new Error("Course not found");

  const courseData = course[0];
  const courseUnits = await db.select().from(units).where(eq(units.courseId, courseId)).orderBy(units.unitNumber);
  
  // IMS CC manifest structure
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${courseId}" xmlns="http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1"
  xmlns:lom="http://ltsc.ieee.org/xsd/imsccv1p1/LOM/resource"
  xmlns:lomimscc="http://ltsc.ieee.org/xsd/imsccv1p1/LOM/manifest"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1 http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1.xsd">
  <metadata>
    <schema>IMS Common Cartridge</schema>
    <schemaversion>1.1.0</schemaversion>
    <lomimscc:lom>
      <lomimscc:general>
        <lomimscc:title>
          <lomimscc:string>${escapeXML(courseData.title)}</lomimscc:string>
        </lomimscc:title>
        <lomimscc:description>
          <lomimscc:string>${escapeXML(courseData.description || '')}</lomimscc:string>
        </lomimscc:description>
      </lomimscc:general>
    </lomimscc:lom>
  </metadata>
  <organizations>
    <organization identifier="org1">
      <item identifier="root">
        <title>${escapeXML(courseData.title)}</title>${generateIMSCCItems(courseUnits)}
      </item>
    </organization>
  </organizations>
  <resources>${generateIMSCCResources(courseUnits)}
  </resources>
</manifest>`;
}

function generateIMSCCItems(units: any[]): string {
  let items = '';
  for (const unit of units) {
    items += `
        <item identifier="unit_${unit.id}">
          <title>${escapeXML(unit.title)}</title>`;
    // Add lessons as sub-items
    items += `
        </item>`;
  }
  return items;
}

function generateIMSCCResources(units: any[]): string {
  let resources = '';
  for (const unit of units) {
    // Add resource entries for each lesson
  }
  return resources;
}

// ============================================
// QTI Export (for Quizzes)
// ============================================

export async function exportQTI(courseId: string, options: ExportOptions = {}): Promise<Record<string, string>> {
  const questionBanks = await db.select().from(questionBanks)
    .where(eq(questionBanks.courseId, courseId));
  
  const qtiExports: Record<string, string> = {};
  
  for (const bank of questionBanks) {
    const questions = await db.select().from(bankQuestions)
      .where(eq(bankQuestions.bankId, bank.id));
    
    const qti = generateQTIAssessment(bank, questions, options);
    qtiExports[`assessment_${bank.id}.xml`] = qti;
  }
  
  return qtiExports;
}

async function exportQuizzesAsQTI(courseId: string, options: ExportOptions): Promise<Record<string, string>> {
  return exportQTI(courseId, options);
}

function generateQTIAssessment(bank: any, questions: any[], options: ExportOptions): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<assessmentTest identifier="${bank.id}" title="${escapeXML(bank.title || 'Assessment')}" 
  xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/imsqti_v2p1.xsd">
  <testPart identifier="part1">
    <assessmentSection identifier="section1" title="Questions">${questions.map(q => generateQTIItem(q, options)).join('\n')}
    </assessmentSection>
  </testPart>
</assessmentTest>`;
}

function generateQTIItem(question: any, options: ExportOptions): string {
  const questionText = processContent(question.question, options);
  const questionType = question.type || 'multiple_choice';
  
  if (questionType === 'multiple_choice' || questionType === 'multiple_select') {
    const choices = question.choices ? JSON.parse(question.choices) : [];
    const correctAnswers = question.correctAnswer ? JSON.parse(question.correctAnswer) : [];
    
    return `
      <assessmentItem identifier="q_${question.id}" title="${escapeXML(questionText.substring(0, 50))}">
        <responseDeclaration identifier="RESPONSE" cardinality="${questionType === 'multiple_select' ? 'multiple' : 'single'}" baseType="identifier">
          <correctResponse>${correctAnswers.map((a: string) => `<value>${escapeXML(a)}</value>`).join('')}</correctResponse>
        </responseDeclaration>
        <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float"/>
        <itemBody>
          <p>${escapeXML(questionText)}</p>
          <choiceInteraction responseIdentifier="RESPONSE" shuffle="false" maxChoices="${questionType === 'multiple_select' ? choices.length : 1}">
            ${choices.map((choice: any, idx: number) => `
            <simpleChoice identifier="choice_${idx}">${escapeXML(choice.text || choice)}</simpleChoice>`).join('')}
          </choiceInteraction>
        </itemBody>
        <responseProcessing>
          <responseCondition>
            <responseIf>
              <match>
                <variable identifier="RESPONSE"/>
                <correct identifier="RESPONSE"/>
              </match>
              <setOutcomeValue identifier="SCORE">
                <baseValue baseType="float">${question.points || 1}</baseValue>
              </setOutcomeValue>
            </responseIf>
            <responseElse>
              <setOutcomeValue identifier="SCORE">
                <baseValue baseType="float">0</baseValue>
              </setOutcomeValue>
            </responseElse>
          </responseCondition>
        </responseProcessing>
      </assessmentItem>`;
  }
  
  return `
    <assessmentItem identifier="q_${question.id}" title="${escapeXML(questionText.substring(0, 50))}">
      <itemBody>
        <p>${escapeXML(questionText)}</p>
      </itemBody>
    </assessmentItem>`;
}

// ============================================
// xAPI Export
// ============================================

export async function exportxAPI(courseId: string, options: ExportOptions = {}): Promise<object> {
  const course = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course.length) throw new Error("Course not found");

  const courseData = course[0];
  const courseUnits = await db.select().from(units).where(eq(units.courseId, courseId)).orderBy(units.unitNumber);
  
  const statements: any[] = [];
  
  // Course statement
  statements.push({
    actor: { objectType: "Agent", name: "System" },
    verb: { id: "http://adlnet.gov/expapi/verbs/initialized", display: { "en-US": "initialized" } },
    object: {
      id: `https://foundationce.com/courses/${courseId}`,
      definition: {
        name: { "en-US": courseData.title },
        description: { "en-US": processContent(courseData.description, options) }
      }
    }
  });
  
  // Unit and lesson statements
  for (const unit of courseUnits) {
    statements.push({
      actor: { objectType: "Agent", name: "System" },
      verb: { id: "http://adlnet.gov/expapi/verbs/experienced", display: { "en-US": "experienced" } },
      object: {
        id: `https://foundationce.com/units/${unit.id}`,
        definition: {
          name: { "en-US": unit.title },
          description: { "en-US": processContent(unit.description, options) }
        }
      }
    });
    
    const unitLessons = await db.select().from(lessons)
      .where(eq(lessons.unitId, unit.id))
      .orderBy(lessons.lessonNumber);
    
    for (const lesson of unitLessons) {
      statements.push({
        actor: { objectType: "Agent", name: "System" },
        verb: { id: "http://adlnet.gov/expapi/verbs/experienced", display: { "en-US": "experienced" } },
        object: {
          id: `https://foundationce.com/lessons/${lesson.id}`,
          definition: {
            name: { "en-US": lesson.title },
            description: { "en-US": processContent(lesson.content, options) }
          }
        }
      });
    }
  }
  
  return {
    statements,
    metadata: {
      courseId,
      courseTitle: courseData.title,
      exportedAt: new Date().toISOString(),
      format: "xAPI"
    }
  };
}

// ============================================
// Import Functions
// ============================================

export async function importLMSPackage(
  packageBuffer: Buffer,
  options: ImportOptions = {}
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    unitsCreated: 0,
    lessonsCreated: 0,
    quizzesExtracted: 0,
    assessmentsExtracted: 0,
    errors: [],
    warnings: []
  };
  
  try {
    // Detect format
    const format = options.format || await detectFormat(packageBuffer);
    
    switch (format) {
      case 'scorm12':
      case 'scorm2004':
        return await importSCORM(packageBuffer, format, options);
      case 'imscc':
        return await importIMSCC(packageBuffer, options);
      case 'qti':
        return await importQTI(packageBuffer, options);
      case 'json':
        return await importJSON(packageBuffer, options);
      default:
        result.errors.push(`Unsupported format: ${format}`);
        return result;
    }
  } catch (error: any) {
    result.errors.push(error.message || 'Unknown import error');
    return result;
  }
}

async function detectFormat(buffer: Buffer): Promise<string> {
  // Try to extract and check manifest
  // This is a simplified detection - in production, you'd use a proper ZIP parser
  const bufferStr = buffer.toString('utf-8', 0, Math.min(1000, buffer.length));
  
  if (bufferStr.includes('imsmanifest.xml')) {
    if (bufferStr.includes('SCORM') || bufferStr.includes('adlcp:scormtype')) {
      if (bufferStr.includes('CAM 1.3') || bufferStr.includes('2004')) {
        return 'scorm2004';
      }
      return 'scorm12';
    }
    if (bufferStr.includes('Common Cartridge') || bufferStr.includes('imscc')) {
      return 'imscc';
    }
  }
  
  if (bufferStr.includes('assessmentTest') || bufferStr.includes('assessmentItem')) {
    return 'qti';
  }
  
  try {
    JSON.parse(bufferStr);
    return 'json';
  } catch {
    return 'unknown';
  }
}

async function importSCORM(
  buffer: Buffer,
  version: 'scorm12' | 'scorm2004',
  options: ImportOptions
): Promise<ImportResult> {
  // Implementation would extract ZIP, parse manifest, create course structure
  // This is a placeholder - full implementation would use a ZIP library
  const result: ImportResult = {
    success: false,
    unitsCreated: 0,
    lessonsCreated: 0,
    quizzesExtracted: 0,
    assessmentsExtracted: 0,
    errors: ['SCORM import not fully implemented'],
    warnings: []
  };
  
  return result;
}

async function importIMSCC(buffer: Buffer, options: ImportOptions): Promise<ImportResult> {
  // Implementation would extract ZIP, parse manifest, create course structure
  const result: ImportResult = {
    success: false,
    unitsCreated: 0,
    lessonsCreated: 0,
    quizzesExtracted: 0,
    assessmentsExtracted: 0,
    errors: ['IMS CC import not fully implemented'],
    warnings: []
  };
  
  return result;
}

async function importQTI(buffer: Buffer, options: ImportOptions): Promise<ImportResult> {
  // Implementation would parse QTI XML, extract questions, create question banks
  const result: ImportResult = {
    success: false,
    unitsCreated: 0,
    lessonsCreated: 0,
    quizzesExtracted: 0,
    assessmentsExtracted: 0,
    errors: ['QTI import not fully implemented'],
    warnings: []
  };
  
  return result;
}

async function importJSON(buffer: Buffer, options: ImportOptions): Promise<ImportResult> {
  try {
    const data = JSON.parse(buffer.toString('utf-8'));
    // Implementation would create course from JSON structure
    const result: ImportResult = {
      success: false,
      unitsCreated: 0,
      lessonsCreated: 0,
      quizzesExtracted: 0,
      assessmentsExtracted: 0,
      errors: ['JSON import not fully implemented'],
      warnings: []
    };
    
    return result;
  } catch (error: any) {
    const result: ImportResult = {
      success: false,
      unitsCreated: 0,
      lessonsCreated: 0,
      quizzesExtracted: 0,
      assessmentsExtracted: 0,
      errors: [`Invalid JSON: ${error.message}`],
      warnings: []
    };
    return result;
  }
}

// ============================================
// Utility Functions
// ============================================

function escapeXML(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHTML(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

