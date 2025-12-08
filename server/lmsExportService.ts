import { db } from "./db";
import { courses, units, lessons, examQuestions, questionBanks, bankQuestions } from "@shared/schema";
import { eq } from "drizzle-orm";

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

  const resourcesXML = manifest.resources.map(res => 
    `    <resource identifier="${res.identifier}" type="${res.type}" href="${res.href}">
${res.files.map(f => `      <file href="${f}" />`).join("\n")}
    </resource>`
  ).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${manifest.identifier}" version="${manifest.version}"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
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
