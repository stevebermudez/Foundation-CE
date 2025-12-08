import { db } from "./db";
import { courses, units, lessons, examQuestions, questionBanks, bankQuestions, practiceExams } from "@shared/schema";
import { eq } from "drizzle-orm";
import archiver from "archiver";
import { PassThrough } from "stream";

interface SCORMManifest {
  identifier: string;
  version: string;
  title: string;
  organizations: SCORMOrganization[];
  resources: SCORMResource[];
}

interface SCORMOrganization {
  identifier: string;
  title: string;
  items: SCORMItem[];
}

interface SCORMItem {
  identifier: string;
  title: string;
  identifierref?: string;
  children?: SCORMItem[];
}

interface SCORMResource {
  identifier: string;
  type: string;
  href: string;
  files: string[];
  scormType?: "sco" | "asset";
}

interface QTIAssessment {
  identifier: string;
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore?: number;
  items: QTIItem[];
}

interface QTIItem {
  identifier: string;
  title: string;
  questionType: string;
  questionText: string;
  choices?: QTIChoice[];
  correctResponse?: string | string[];
  feedback?: { correct?: string; incorrect?: string };
  points?: number;
}

interface QTIChoice {
  identifier: string;
  text: string;
}

export async function generateSCORMManifest(courseId: string): Promise<string> {
  const course = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course.length) throw new Error("Course not found");

  const courseData = course[0];
  const courseUnits = await db.select().from(units).where(eq(units.courseId, courseId));
  
  const unitItems: SCORMItem[] = [];
  const resources: SCORMResource[] = [];
  
  for (const unit of courseUnits) {
    const unitLessons = await db.select().from(lessons).where(eq(lessons.unitId, unit.id));
    
    const lessonItems: SCORMItem[] = unitLessons.map((lesson) => ({
      identifier: `lesson_${lesson.id}`,
      title: lesson.title,
      identifierref: `res_lesson_${lesson.id}`,
    }));
    
    unitItems.push({
      identifier: `unit_${unit.id}`,
      title: unit.title,
      children: lessonItems,
    });
    
    unitLessons.forEach(lesson => {
      resources.push({
        identifier: `res_lesson_${lesson.id}`,
        type: "webcontent",
        href: `content/lesson_${lesson.id}.html`,
        files: [`content/lesson_${lesson.id}.html`],
      });
    });
  }

  const manifest: SCORMManifest = {
    identifier: `course_${courseId}`,
    version: "1.2",
    title: courseData.title,
    organizations: [{
      identifier: "org_default",
      title: courseData.title,
      items: unitItems,
    }],
    resources,
  };

  return generateSCORMXML(manifest);
}

function generateSCORMXML(manifest: SCORMManifest): string {
  const itemsXML = (items: SCORMItem[], indent: string = ""): string => {
    return items.map(item => {
      const children = item.children ? itemsXML(item.children, indent + "  ") : "";
      const identifierref = item.identifierref ? ` identifierref="${item.identifierref}"` : "";
      return `${indent}<item identifier="${item.identifier}"${identifierref}>
${indent}  <title>${escapeXML(item.title)}</title>
${children}${indent}</item>`;
    }).join("\n");
  };

  const resourcesXML = manifest.resources.map(res => {
    const scormType = res.scormType ? ` adlcp:scormtype="${res.scormType}"` : ' adlcp:scormtype="sco"';
    return `    <resource identifier="${res.identifier}" type="${res.type}"${scormType} href="${res.href}">
${res.files.map(f => `      <file href="${f}" />`).join("\n")}
      <dependency identifierref="common_files" />
    </resource>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${manifest.identifier}" version="${manifest.version}"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                      http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="org_default">
    <organization identifier="org_default">
      <title>${escapeXML(manifest.title)}</title>
${itemsXML(manifest.organizations[0].items, "      ")}
    </organization>
  </organizations>
  <resources>
${resourcesXML}
    <resource identifier="common_files" type="webcontent" adlcp:scormtype="asset">
      <file href="shared/scormapi.js" />
    </resource>
  </resources>
</manifest>`;
}

function parseOptions(optionsStr: string): { A?: string; B?: string; C?: string; D?: string } {
  try {
    return JSON.parse(optionsStr);
  } catch {
    return {};
  }
}

export async function generateQTIAssessment(examId: string): Promise<string> {
  const questions = await db.select().from(examQuestions)
    .where(eq(examQuestions.examId, examId));
  
  if (!questions.length) throw new Error("No questions found for this exam");

  const qtiItems: QTIItem[] = questions.map((q, idx) => {
    const opts = parseOptions(q.options);
    const choices: QTIChoice[] = [];
    if (opts.A) choices.push({ identifier: "A", text: opts.A });
    if (opts.B) choices.push({ identifier: "B", text: opts.B });
    if (opts.C) choices.push({ identifier: "C", text: opts.C });
    if (opts.D) choices.push({ identifier: "D", text: opts.D });

    return {
      identifier: `item_${q.id}`,
      title: `Question ${idx + 1}`,
      questionType: q.questionType || "multiple_choice",
      questionText: q.questionText,
      choices,
      correctResponse: q.correctAnswer,
      feedback: {
        correct: "Correct!",
        incorrect: q.explanation || "Incorrect. Please review the material.",
      },
      points: 1,
    };
  });

  const assessment: QTIAssessment = {
    identifier: `exam_${examId}`,
    title: `Final Exam`,
    description: `Assessment for exam ${examId}`,
    passingScore: 70,
    items: qtiItems,
  };

  return generateQTIXML(assessment);
}

export async function generateQuestionBankQTI(bankId: string): Promise<string> {
  const bank = await db.select().from(questionBanks).where(eq(questionBanks.id, bankId)).limit(1);
  if (!bank.length) throw new Error("Question bank not found");

  const questions = await db.select().from(bankQuestions).where(eq(bankQuestions.bankId, bankId));
  
  if (!questions.length) throw new Error("No questions found in this bank");

  const answerLetters = ["A", "B", "C", "D"];
  
  const qtiItems: QTIItem[] = questions.map((q, idx) => {
    const opts = parseOptions(q.options);
    const choices: QTIChoice[] = [];
    if (opts.A) choices.push({ identifier: "A", text: opts.A });
    if (opts.B) choices.push({ identifier: "B", text: opts.B });
    if (opts.C) choices.push({ identifier: "C", text: opts.C });
    if (opts.D) choices.push({ identifier: "D", text: opts.D });

    const correctLetter = answerLetters[q.correctOption] || "A";

    return {
      identifier: `item_${q.id}`,
      title: `Question ${idx + 1}`,
      questionType: q.questionType || "multiple_choice",
      questionText: q.questionText,
      choices,
      correctResponse: correctLetter,
      feedback: {
        correct: "Correct!",
        incorrect: q.explanation || "Incorrect.",
      },
      points: 1,
    };
  });

  const assessment: QTIAssessment = {
    identifier: `bank_${bankId}`,
    title: bank[0].title,
    description: bank[0].description || undefined,
    items: qtiItems,
  };

  return generateQTIXML(assessment);
}

function generateQTIXML(assessment: QTIAssessment): string {
  const itemsXML = assessment.items.map((item) => {
    const choicesXML = item.choices?.map(c => 
      `        <simpleChoice identifier="${c.identifier}">${escapeXML(c.text)}</simpleChoice>`
    ).join("\n") || "";

    return `  <assessmentItem identifier="${item.identifier}" title="${escapeXML(item.title)}" adaptive="false" timeDependent="false">
    <responseDeclaration identifier="RESPONSE" cardinality="single" baseType="identifier">
      <correctResponse>
        <value>${item.correctResponse}</value>
      </correctResponse>
    </responseDeclaration>
    <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
      <defaultValue>
        <value>0</value>
      </defaultValue>
    </outcomeDeclaration>
    <itemBody>
      <choiceInteraction responseIdentifier="RESPONSE" shuffle="false" maxChoices="1">
        <prompt>${escapeXML(item.questionText)}</prompt>
${choicesXML}
      </choiceInteraction>
    </itemBody>
    <responseProcessing template="http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct"/>
    <modalFeedback outcomeIdentifier="FEEDBACK" showHide="show" identifier="correct">
      <p>${escapeXML(item.feedback?.correct || "Correct!")}</p>
    </modalFeedback>
    <modalFeedback outcomeIdentifier="FEEDBACK" showHide="show" identifier="incorrect">
      <p>${escapeXML(item.feedback?.incorrect || "Incorrect.")}</p>
    </modalFeedback>
  </assessmentItem>`;
  }).join("\n\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<assessmentTest xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd"
  identifier="${assessment.identifier}"
  title="${escapeXML(assessment.title)}">
  
  <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float"/>
  
  <testPart identifier="testPart1" navigationMode="linear" submissionMode="individual">
    <assessmentSection identifier="section1" title="${escapeXML(assessment.title)}" visible="true">
${itemsXML}
    </assessmentSection>
  </testPart>
  
  <outcomeProcessing>
    <setOutcomeValue identifier="SCORE">
      <sum>
        <testVariables variableIdentifier="SCORE"/>
      </sum>
    </setOutcomeValue>
  </outcomeProcessing>
</assessmentTest>`;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Generate HTML lesson file content
function generateLessonHTML(lesson: any, unitTitle: string, courseTitle: string): string {
  const content = lesson.content || lesson.description || "Lesson content not available.";
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeXML(lesson.title)} - ${escapeXML(courseTitle)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1 { color: #1a365d; border-bottom: 2px solid #3182ce; padding-bottom: 10px; }
    h2 { color: #2d3748; margin-top: 30px; }
    .unit-title { color: #718096; font-size: 0.9em; margin-bottom: 5px; }
    .lesson-content { background: #f7fafc; padding: 20px; border-radius: 8px; margin-top: 20px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 0.85em; }
  </style>
  <script>
    // SCORM 1.2 API Integration
    var API = null;
    function findAPI(win) {
      var tries = 0;
      while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
        tries++;
        if (tries > 7) return null;
        win = win.parent;
      }
      return win.API;
    }
    function initSCORM() {
      API = findAPI(window);
      if (API == null && window.opener != null) {
        API = findAPI(window.opener);
      }
      if (API != null) {
        API.LMSInitialize("");
        API.LMSSetValue("cmi.core.lesson_status", "incomplete");
      }
    }
    function completeSCORM() {
      if (API != null) {
        API.LMSSetValue("cmi.core.lesson_status", "completed");
        API.LMSCommit("");
        API.LMSFinish("");
      }
    }
    window.onload = initSCORM;
    window.onunload = completeSCORM;
  </script>
</head>
<body>
  <div class="unit-title">${escapeXML(unitTitle)}</div>
  <h1>${escapeXML(lesson.title)}</h1>
  
  <div class="lesson-content">
    ${content.split('\n').map((p: string) => p.trim() ? `<p>${escapeXML(p)}</p>` : '').join('\n')}
  </div>
  
  <div class="footer">
    <p>Course: ${escapeXML(courseTitle)}</p>
    <p>Generated by FoundationCE Learning Management System</p>
  </div>
</body>
</html>`;
}

// SCORM 1.2 API Wrapper JavaScript (included in package)
function getSCORMApiScript(): string {
  return `// SCORM 1.2 API Adapter for FoundationCE
var SCORM_API = {
  initialized: false,
  API: null,
  
  findAPI: function(win) {
    var tries = 0;
    while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
      tries++;
      if (tries > 7) return null;
      win = win.parent;
    }
    return win.API;
  },
  
  init: function() {
    if (this.initialized) return true;
    this.API = this.findAPI(window);
    if (this.API == null && window.opener != null) {
      this.API = this.findAPI(window.opener);
    }
    if (this.API) {
      this.API.LMSInitialize("");
      this.initialized = true;
      return true;
    }
    console.log("SCORM API not found - running in standalone mode");
    return false;
  },
  
  setValue: function(key, value) {
    if (this.API) this.API.LMSSetValue(key, value);
  },
  
  getValue: function(key) {
    return this.API ? this.API.LMSGetValue(key) : "";
  },
  
  commit: function() {
    if (this.API) this.API.LMSCommit("");
  },
  
  finish: function() {
    if (this.API) {
      this.API.LMSCommit("");
      this.API.LMSFinish("");
      this.initialized = false;
    }
  },
  
  setComplete: function() {
    this.setValue("cmi.core.lesson_status", "completed");
    this.commit();
  },
  
  setPassed: function(score) {
    this.setValue("cmi.core.score.raw", score);
    this.setValue("cmi.core.score.min", 0);
    this.setValue("cmi.core.score.max", 100);
    this.setValue("cmi.core.lesson_status", score >= 70 ? "passed" : "failed");
    this.commit();
  }
};
window.SCORM_API = SCORM_API;
`;
}

// Generate complete SCORM 1.2 package as ZIP using archiver
export async function generateSCORMPackage(courseId: string): Promise<Buffer> {
  const course = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course.length) throw new Error("Course not found");

  const courseData = course[0];
  const courseUnits = await db.select().from(units).where(eq(units.courseId, courseId));
  
  const unitItems: SCORMItem[] = [];
  const resources: SCORMResource[] = [];
  const lessonContents: Map<string, string> = new Map();
  
  // Gather all lesson content
  for (const unit of courseUnits.sort((a, b) => a.sortOrder - b.sortOrder)) {
    const unitLessons = await db.select().from(lessons).where(eq(lessons.unitId, unit.id));
    
    const lessonItems: SCORMItem[] = [];
    
    for (const lesson of unitLessons.sort((a, b) => a.sortOrder - b.sortOrder)) {
      const lessonFilename = `lesson_${lesson.id}.html`;
      const lessonContent = generateLessonHTML(lesson, unit.title, courseData.title);
      
      lessonContents.set(`content/${lessonFilename}`, lessonContent);
      
      lessonItems.push({
        identifier: `lesson_${lesson.id}`,
        title: lesson.title,
        identifierref: `res_lesson_${lesson.id}`,
      });
      
      resources.push({
        identifier: `res_lesson_${lesson.id}`,
        type: "webcontent",
        href: `content/${lessonFilename}`,
        files: [`content/${lessonFilename}`, "shared/scormapi.js"],
        scormType: "sco",
      });
    }
    
    unitItems.push({
      identifier: `unit_${unit.id}`,
      title: unit.title,
      children: lessonItems,
    });
  }

  // Generate manifest
  const manifest: SCORMManifest = {
    identifier: `course_${courseId}`,
    version: "1.2",
    title: courseData.title,
    organizations: [{
      identifier: "org_default",
      title: courseData.title,
      items: unitItems,
    }],
    resources,
  };

  const manifestXML = generateSCORMXML(manifest);
  
  // Generate metadata
  const metadataXML = `<?xml version="1.0" encoding="UTF-8"?>
<lom xmlns="http://www.imsglobal.org/xsd/imsmd_rootv1p2p1">
  <general>
    <title><langstring xml:lang="en-US">${escapeXML(courseData.title)}</langstring></title>
    <description><langstring xml:lang="en-US">${escapeXML(courseData.description || '')}</langstring></description>
  </general>
  <educational>
    <typicalLearningTime><datetime>PT${courseData.hoursRequired || 0}H</datetime></typicalLearningTime>
  </educational>
</lom>`;

  // Create ZIP using archiver (in-memory)
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    const passthrough = new PassThrough();
    passthrough.on('data', (chunk) => chunks.push(chunk));
    passthrough.on('end', () => resolve(Buffer.concat(chunks)));
    passthrough.on('error', reject);
    
    archive.pipe(passthrough);
    archive.on('error', reject);
    
    // Add manifest
    archive.append(manifestXML, { name: 'imsmanifest.xml' });
    
    // Add metadata
    archive.append(metadataXML, { name: 'metadata.xml' });
    
    // Add SCORM API script
    archive.append(getSCORMApiScript(), { name: 'shared/scormapi.js' });
    
    // Add all lesson HTML files
    lessonContents.forEach((content, path) => {
      archive.append(content, { name: path });
    });
    
    archive.finalize();
  });
}

// Generate SCORM package with exam content using archiver
export async function generateSCORMPackageWithExam(courseId: string, examId: string): Promise<Buffer> {
  const course = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course.length) throw new Error("Course not found");
  
  const exam = await db.select().from(practiceExams).where(eq(practiceExams.id, examId)).limit(1);
  const examData = exam.length ? exam[0] : null;

  const courseData = course[0];
  const courseUnits = await db.select().from(units).where(eq(units.courseId, courseId));
  
  const unitItems: SCORMItem[] = [];
  const resources: SCORMResource[] = [];
  const contents: Map<string, string> = new Map();
  
  // Gather all lesson content
  for (const unit of courseUnits.sort((a, b) => a.sortOrder - b.sortOrder)) {
    const unitLessons = await db.select().from(lessons).where(eq(lessons.unitId, unit.id));
    
    const lessonItems: SCORMItem[] = [];
    
    for (const lesson of unitLessons.sort((a, b) => a.sortOrder - b.sortOrder)) {
      const lessonFilename = `lesson_${lesson.id}.html`;
      const lessonContent = generateLessonHTML(lesson, unit.title, courseData.title);
      
      contents.set(`content/${lessonFilename}`, lessonContent);
      
      lessonItems.push({
        identifier: `lesson_${lesson.id}`,
        title: lesson.title,
        identifierref: `res_lesson_${lesson.id}`,
      });
      
      resources.push({
        identifier: `res_lesson_${lesson.id}`,
        type: "webcontent",
        href: `content/${lessonFilename}`,
        files: [`content/${lessonFilename}`, "shared/scormapi.js"],
        scormType: "sco",
      });
    }
    
    unitItems.push({
      identifier: `unit_${unit.id}`,
      title: unit.title,
      children: lessonItems,
    });
  }
  
  // Add exam as final SCO if provided
  if (examData && examId) {
    const examQuestionsList = await db.select().from(examQuestions).where(eq(examQuestions.examId, examId));
    
    // Generate exam HTML
    const examHTML = generateExamHTML(examData, examQuestionsList, courseData.title);
    contents.set(`content/exam_${examId}.html`, examHTML);
    
    unitItems.push({
      identifier: `exam_${examId}`,
      title: examData.title || "Final Examination",
      identifierref: `res_exam_${examId}`,
    });
    
    resources.push({
      identifier: `res_exam_${examId}`,
      type: "webcontent",
      href: `content/exam_${examId}.html`,
      files: [`content/exam_${examId}.html`, "shared/scormapi.js"],
      scormType: "sco",
    });
  }

  const manifest: SCORMManifest = {
    identifier: `course_exam_${courseId}`,
    version: "1.2",
    title: courseData.title,
    organizations: [{
      identifier: "org_default",
      title: courseData.title,
      items: unitItems,
    }],
    resources,
  };

  const manifestXML = generateSCORMXML(manifest);
  
  // Generate metadata
  const metadataXML = `<?xml version="1.0" encoding="UTF-8"?>
<lom xmlns="http://www.imsglobal.org/xsd/imsmd_rootv1p2p1">
  <general>
    <title><langstring xml:lang="en-US">${escapeXML(courseData.title)}</langstring></title>
  </general>
</lom>`;

  // Create ZIP using archiver (in-memory)
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    const passthrough = new PassThrough();
    passthrough.on('data', (chunk) => chunks.push(chunk));
    passthrough.on('end', () => resolve(Buffer.concat(chunks)));
    passthrough.on('error', reject);
    
    archive.pipe(passthrough);
    archive.on('error', reject);
    
    // Add manifest
    archive.append(manifestXML, { name: 'imsmanifest.xml' });
    
    // Add metadata
    archive.append(metadataXML, { name: 'metadata.xml' });
    
    // Add SCORM API script
    archive.append(getSCORMApiScript(), { name: 'shared/scormapi.js' });
    
    // Add all content files (lessons and exam)
    contents.forEach((content, path) => {
      archive.append(content, { name: path });
    });
    
    archive.finalize();
  });
}

// Generate exam HTML with SCORM tracking
function generateExamHTML(exam: any, questions: any[], courseTitle: string): string {
  const questionsHTML = questions.map((q, idx) => {
    const opts = parseOptions(q.options);
    const optionsHTML = ['A', 'B', 'C', 'D']
      .filter(letter => opts[letter as keyof typeof opts])
      .map(letter => `
        <label class="option">
          <input type="radio" name="q${idx}" value="${letter}">
          <span>${letter}. ${escapeXML(opts[letter as keyof typeof opts] || '')}</span>
        </label>
      `).join('');
    
    return `
      <div class="question" data-correct="${q.correctAnswer}">
        <p class="question-text"><strong>${idx + 1}.</strong> ${escapeXML(q.questionText)}</p>
        <div class="options">${optionsHTML}</div>
      </div>
    `;
  }).join('');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeXML(exam.title || 'Final Examination')} - ${escapeXML(courseTitle)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #1a365d; }
    .question { margin: 20px 0; padding: 15px; background: #f7fafc; border-radius: 8px; }
    .question-text { margin-bottom: 10px; }
    .options { display: flex; flex-direction: column; gap: 8px; }
    .option { display: flex; align-items: center; gap: 8px; padding: 8px; background: white; border-radius: 4px; cursor: pointer; }
    .option:hover { background: #edf2f7; }
    button { background: #3182ce; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; margin-top: 20px; }
    button:hover { background: #2c5282; }
    #result { margin-top: 20px; padding: 20px; border-radius: 8px; display: none; }
    #result.pass { background: #c6f6d5; color: #22543d; }
    #result.fail { background: #fed7d7; color: #822727; }
  </style>
  <script>
    var API = null;
    function findAPI(win) {
      var tries = 0;
      while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
        tries++;
        if (tries > 7) return null;
        win = win.parent;
      }
      return win.API;
    }
    function initSCORM() {
      API = findAPI(window);
      if (API == null && window.opener != null) {
        API = findAPI(window.opener);
      }
      if (API != null) {
        API.LMSInitialize("");
        API.LMSSetValue("cmi.core.lesson_status", "incomplete");
      }
    }
    function submitExam() {
      var questions = document.querySelectorAll('.question');
      var correct = 0;
      questions.forEach(function(q) {
        var selected = q.querySelector('input:checked');
        if (selected && selected.value === q.dataset.correct) correct++;
      });
      var score = Math.round((correct / questions.length) * 100);
      var passed = score >= ${exam.passingScore || 70};
      
      var resultDiv = document.getElementById('result');
      resultDiv.innerHTML = '<h2>' + (passed ? 'Passed!' : 'Not Passed') + '</h2><p>Score: ' + score + '%</p><p>Correct: ' + correct + ' / ' + questions.length + '</p>';
      resultDiv.className = passed ? 'pass' : 'fail';
      resultDiv.style.display = 'block';
      
      if (API != null) {
        API.LMSSetValue("cmi.core.score.raw", score);
        API.LMSSetValue("cmi.core.score.min", 0);
        API.LMSSetValue("cmi.core.score.max", 100);
        API.LMSSetValue("cmi.core.lesson_status", passed ? "passed" : "failed");
        API.LMSCommit("");
      }
    }
    window.onload = initSCORM;
    window.onunload = function() {
      if (API != null) API.LMSFinish("");
    };
  </script>
</head>
<body>
  <h1>${escapeXML(exam.title || 'Final Examination')}</h1>
  <p>Passing Score: ${exam.passingScore || 70}%</p>
  
  <form onsubmit="event.preventDefault(); submitExam();">
    ${questionsHTML}
    <button type="submit">Submit Exam</button>
  </form>
  
  <div id="result"></div>
</body>
</html>`;
}

export async function generatexAPIStatement(
  userId: string,
  verb: string,
  objectType: string,
  objectId: string,
  objectName: string,
  result?: { score?: number; success?: boolean; completion?: boolean; duration?: string }
): Promise<object> {
  const statement = {
    actor: {
      objectType: "Agent",
      account: {
        homePage: "https://foundationce.com",
        name: userId,
      },
    },
    verb: {
      id: `http://adlnet.gov/expapi/verbs/${verb}`,
      display: { "en-US": verb },
    },
    object: {
      objectType: "Activity",
      id: `https://foundationce.com/${objectType}/${objectId}`,
      definition: {
        name: { "en-US": objectName },
        type: `http://adlnet.gov/expapi/activities/${objectType}`,
      },
    },
    timestamp: new Date().toISOString(),
  };

  if (result) {
    (statement as any).result = {
      ...(result.score !== undefined && { score: { scaled: result.score / 100, raw: result.score, max: 100 } }),
      ...(result.success !== undefined && { success: result.success }),
      ...(result.completion !== undefined && { completion: result.completion }),
      ...(result.duration && { duration: result.duration }),
    };
  }

  return statement;
}

export async function exportCourseData(courseId: string): Promise<object> {
  const course = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course.length) throw new Error("Course not found");

  const courseUnits = await db.select().from(units).where(eq(units.courseId, courseId));
  
  const unitsWithLessons = await Promise.all(courseUnits.map(async (unit) => {
    const unitLessons = await db.select().from(lessons).where(eq(lessons.unitId, unit.id));
    return {
      ...unit,
      lessons: unitLessons,
    };
  }));

  return {
    exportVersion: "1.0",
    exportDate: new Date().toISOString(),
    course: course[0],
    units: unitsWithLessons,
    metadata: {
      totalUnits: courseUnits.length,
      totalLessons: unitsWithLessons.reduce((sum, u) => sum + u.lessons.length, 0),
    },
  };
}
