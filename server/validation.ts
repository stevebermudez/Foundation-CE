import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

// Course validation schemas
export const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().optional().nullable(),
  productType: z.enum(["RealEstate", "Insurance"], { required_error: "Product type is required" }),
  state: z.string().min(2, "State code required").max(2, "State code must be 2 characters"),
  licenseType: z.string().min(1, "License type is required"),
  requirementCycleType: z.string().min(1, "Requirement cycle type is required"),
  requirementBucket: z.string().min(1, "Requirement bucket is required"),
  hoursRequired: z.number().int().positive("Hours must be positive"),
  deliveryMethod: z.string().optional(),
  difficultyLevel: z.string().optional(),
  price: z.number().int().nonnegative("Price must be non-negative"),
  sku: z.string().min(1, "SKU is required").max(100, "SKU too long"),
  renewalApplicable: z.number().int().min(0).max(1).optional(),
  renewalPeriodYears: z.number().int().positive().optional(),
  providerNumber: z.string().optional().nullable(),
  courseOfferingNumber: z.string().optional().nullable(),
  instructorName: z.string().optional().nullable(),
  instructorEmail: z.string().email("Invalid email").optional().nullable(),
  instructorPhone: z.string().optional().nullable(),
  instructorAddress: z.string().optional().nullable(),
  instructorAvailability: z.string().optional().nullable(),
  expirationMonths: z.number().int().min(1).max(24).optional(),
  units: z.array(z.object({
    unitNumber: z.number().int().positive().optional(),
    title: z.string().min(1, "Unit title required"),
    description: z.string().optional().nullable(),
    hoursRequired: z.number().int().nonnegative().optional(),
    sequence: z.number().int().nonnegative().optional(),
  })).optional(),
});

export const updateCourseSchema = createCourseSchema.partial().extend({
  expectedVersion: z.number().int().positive().optional(),
});

// Unit validation schemas
export const createUnitSchema = z.object({
  unitNumber: z.number().int().positive().optional(),
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().optional().nullable(),
  hoursRequired: z.number().int().nonnegative("Hours must be non-negative").optional(),
  sequence: z.number().int().nonnegative().optional(),
});

export const updateUnitSchema = createUnitSchema.partial().extend({
  courseId: z.string().uuid().optional(),
  expectedVersion: z.number().int().positive().optional(),
});

// Lesson validation schemas
export const createLessonSchema = z.object({
  lessonNumber: z.number().int().positive().optional(),
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  content: z.string().optional().nullable(),
  videoUrl: z.string().url("Invalid URL").optional().nullable(),
  imageUrl: z.string().url("Invalid URL").optional().nullable(),
  durationMinutes: z.number().int().nonnegative().optional(),
  sequence: z.number().int().nonnegative().optional(),
});

export const updateLessonSchema = createLessonSchema.partial().extend({
  unitId: z.string().uuid().optional(),
  expectedVersion: z.number().int().positive().optional(),
});

// Question bank validation schemas
export const createQuestionBankSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  unitId: z.string().uuid("Invalid unit ID").optional().nullable(),
  bankType: z.enum(["unit_quiz", "final_exam"], { required_error: "Bank type is required" }),
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().optional().nullable(),
  questionsPerAttempt: z.number().int().positive().optional(),
  passingScore: z.number().int().min(0).max(100, "Passing score must be 0-100").optional(),
  timeLimit: z.number().int().positive().optional(),
  isActive: z.number().int().min(0).max(1).optional(),
});

export const updateQuestionBankSchema = createQuestionBankSchema.partial().omit({ courseId: true });

// Question validation schemas
export const createQuestionSchema = z.object({
  bankId: z.string().uuid("Invalid bank ID"),
  questionText: z.string().min(1, "Question text is required"),
  questionType: z.enum(["multiple_choice", "true_false"]).default("multiple_choice"),
  options: z.string().refine((val) => {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) && parsed.length >= 2;
    } catch {
      return false;
    }
  }, "Options must be a valid JSON array with at least 2 items"),
  correctOption: z.number().int().nonnegative("Correct option must be non-negative"),
  explanation: z.string().min(1, "Explanation is required"),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  category: z.string().optional().nullable(),
  isActive: z.number().int().min(0).max(1).optional(),
});

export const updateQuestionSchema = createQuestionSchema.partial().omit({ bankId: true });

// Enrollment validation schemas
export const createEnrollmentSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  courseId: z.string().uuid("Invalid course ID"),
});

// Validation middleware factory
export function validateRequest(schema: z.ZodSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = source === "body" ? req.body : source === "query" ? req.query : req.params;
      const validated = schema.parse(data);
      
      // Replace the original data with validated data
      if (source === "body") {
        req.body = validated;
      } else if (source === "query") {
        req.query = validated as any;
      } else {
        req.params = validated as any;
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation Error",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}

// Helper to validate UUID params
export function validateUUID(paramName: string = "id") {
  return (req: Request, res: Response, next: NextFunction) => {
    const uuid = req.params[paramName];
    if (!uuid || !z.string().uuid().safeParse(uuid).success) {
      return res.status(400).json({
        error: "Validation Error",
        details: [{ field: paramName, message: "Invalid UUID format" }],
      });
    }
    next();
  };
}

