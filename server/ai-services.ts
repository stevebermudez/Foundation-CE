import OpenAI from "openai";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

export interface CourseOutlineRequest {
  title: string;
  description?: string;
  hoursRequired: number;
  targetAudience?: string;
  learningObjectives?: string[];
  state?: string;
  licenseType?: string;
}

export interface GeneratedUnit {
  unitNumber: number;
  title: string;
  description: string;
  hoursRequired: number;
  lessons: GeneratedLesson[];
}

export interface GeneratedLesson {
  lessonNumber: number;
  title: string;
  description: string;
  durationMinutes: number;
  keyTopics: string[];
}

export interface GeneratedCourseOutline {
  title: string;
  description: string;
  units: GeneratedUnit[];
  totalHours: number;
}

export async function generateCourseOutline(request: CourseOutlineRequest): Promise<GeneratedCourseOutline> {
  const systemPrompt = `You are an expert instructional designer specializing in professional continuing education courses. 
Your task is to create detailed, well-structured course outlines that meet regulatory requirements and provide genuine educational value.

For real estate continuing education:
- Courses must be practical and applicable to real-world scenarios
- Content should align with state regulatory requirements
- Include a mix of theoretical knowledge and practical application
- Each unit should have clear learning objectives
- Lessons should build upon each other progressively

Output your response as valid JSON matching the exact structure requested.`;

  const userPrompt = `Create a detailed course outline for:

Title: ${request.title}
Description: ${request.description || 'A professional continuing education course'}
Total Hours Required: ${request.hoursRequired}
Target Audience: ${request.targetAudience || 'Real estate professionals'}
${request.state ? `State: ${request.state}` : ''}
${request.licenseType ? `License Type: ${request.licenseType}` : ''}
${request.learningObjectives?.length ? `Learning Objectives:\n${request.learningObjectives.map(o => `- ${o}`).join('\n')}` : ''}

Create a course outline with the following structure:
1. Break the course into logical units (typically 1 unit per 3-4 hours of content)
2. Each unit should have 3-5 lessons
3. Each lesson should be 15-30 minutes
4. The total hours should match the required hours (${request.hoursRequired})

Return the outline as JSON with this exact structure:
{
  "title": "Course Title",
  "description": "Course description",
  "units": [
    {
      "unitNumber": 1,
      "title": "Unit Title",
      "description": "Unit description",
      "hoursRequired": 3,
      "lessons": [
        {
          "lessonNumber": 1,
          "title": "Lesson Title",
          "description": "Brief lesson description",
          "durationMinutes": 20,
          "keyTopics": ["topic1", "topic2"]
        }
      ]
    }
  ],
  "totalHours": ${request.hoursRequired}
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 8192,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  return JSON.parse(content) as GeneratedCourseOutline;
}

export interface QuizGenerationRequest {
  lessonContent: string;
  lessonTitle: string;
  unitTitle?: string;
  numberOfQuestions?: number;
  questionTypes?: ("multiple_choice" | "true_false")[];
}

export interface GeneratedQuestion {
  questionText: string;
  questionType: "multiple_choice" | "true_false";
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface GeneratedQuiz {
  questions: GeneratedQuestion[];
  lessonTitle: string;
}

export async function generateQuizFromContent(request: QuizGenerationRequest): Promise<GeneratedQuiz> {
  const systemPrompt = `You are an expert assessment designer specializing in professional continuing education. 
Your task is to create effective quiz questions that test understanding of the material.

Guidelines:
- Questions should test comprehension, not just memorization
- Include a mix of difficulty levels
- Provide clear, educational explanations for correct answers
- All distractors (wrong options) should be plausible but clearly incorrect
- Questions should be directly related to the lesson content provided

Output your response as valid JSON matching the exact structure requested.`;

  const numberOfQuestions = request.numberOfQuestions || 5;
  
  const userPrompt = `Create ${numberOfQuestions} quiz questions based on this lesson content:

Lesson Title: ${request.lessonTitle}
${request.unitTitle ? `Unit: ${request.unitTitle}` : ''}

LESSON CONTENT:
${request.lessonContent}

Generate a mix of multiple choice and true/false questions that test understanding of this material.

Return the quiz as JSON with this exact structure:
{
  "questions": [
    {
      "questionText": "The question text",
      "questionType": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this answer is correct",
      "difficulty": "medium"
    },
    {
      "questionText": "True or false question text",
      "questionType": "true_false",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "explanation": "Why this is true/false",
      "difficulty": "easy"
    }
  ],
  "lessonTitle": "${request.lessonTitle}"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 8192,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  return JSON.parse(content) as GeneratedQuiz;
}

export interface LessonContentRequest {
  lessonTitle: string;
  lessonDescription: string;
  unitTitle?: string;
  courseTitle?: string;
  keyTopics: string[];
  targetDurationMinutes: number;
}

export interface GeneratedLessonContent {
  title: string;
  blocks: {
    blockType: string;
    content: any;
    sortOrder: number;
  }[];
}

export async function generateLessonContent(request: LessonContentRequest): Promise<GeneratedLessonContent> {
  const systemPrompt = `You are an expert instructional content creator specializing in professional continuing education. 
Your task is to create engaging, educational lesson content using a block-based content format.

Available block types:
- "heading": { "text": "Heading text", "level": 2 }
- "text": { "text": "Paragraph text with <strong>bold</strong> and <em>italic</em> support" }
- "callout": { "type": "info|warning|success|tip", "title": "Title", "content": "Content" }
- "flashcard": { "cards": [{ "front": "Term/Question", "back": "Definition/Answer" }] }
- "accordion": { "items": [{ "title": "Section", "content": "Content" }] }

Guidelines:
- Start with a heading (level 2)
- Use callouts for important information, tips, or warnings
- Include flashcards for key terms or concepts
- Use accordion for detailed explanations that might be optional reading
- Keep text blocks focused and scannable
- Aim for the target duration (assume ~200 words per minute reading speed)

Output your response as valid JSON.`;

  const userPrompt = `Create lesson content for:

Course: ${request.courseTitle || 'Professional Course'}
Unit: ${request.unitTitle || 'Learning Unit'}
Lesson: ${request.lessonTitle}
Description: ${request.lessonDescription}
Target Duration: ${request.targetDurationMinutes} minutes
Key Topics: ${request.keyTopics.join(', ')}

Generate educational content using the block format. Include:
1. An introduction heading and text
2. Content sections for each key topic
3. At least one callout with important information
4. Flashcards for key terms (3-5 cards)
5. Summary or key takeaways

Return as JSON:
{
  "title": "${request.lessonTitle}",
  "blocks": [
    { "blockType": "heading", "content": { "text": "...", "level": 2 }, "sortOrder": 0 },
    { "blockType": "text", "content": { "text": "..." }, "sortOrder": 1 },
    ...
  ]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 8192,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  return JSON.parse(content) as GeneratedLessonContent;
}
