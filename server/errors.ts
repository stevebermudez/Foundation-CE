import type { Request, Response, NextFunction } from "express";

// Custom error classes
export class ValidationError extends Error {
  statusCode = 400;
  constructor(message: string, public details?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends Error {
  statusCode = 401;
  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  statusCode = 403;
  constructor(message: string = "Forbidden - Access denied") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  constructor(resource: string = "Resource") {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  statusCode = 409;
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export class DatabaseError extends Error {
  statusCode = 500;
  constructor(message: string = "Database operation failed", public originalError?: Error) {
    super(message);
    this.name = "DatabaseError";
  }
}

// Generate unique request ID for tracing
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Add request ID to all requests
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  req.id = generateRequestId();
  res.setHeader("X-Request-ID", req.id);
  next();
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

// Async route wrapper to catch promise rejections
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Global error handler middleware
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const requestId = req.id || "unknown";
  
  // Log full error with stack trace (server-side only)
  console.error(`[${requestId}] Error:`, {
    message: err.message,
    stack: err.stack,
    name: err.name,
    statusCode: err.statusCode || 500,
    path: req.path,
    method: req.method,
    userId: (req.user as any)?.id,
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Handle known error types
  if (err instanceof ValidationError) {
    return res.status(statusCode).json({
      error: "Validation Error",
      message: err.message,
      details: err.details || [],
      requestId,
    });
  }

  if (err instanceof AuthenticationError || err instanceof AuthorizationError) {
    return res.status(statusCode).json({
      error: err.name,
      message: err.message,
      requestId,
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(statusCode).json({
      error: "Not Found",
      message: err.message,
      requestId,
    });
  }

  if (err instanceof ConflictError) {
    return res.status(statusCode).json({
      error: "Conflict",
      message: err.message,
      requestId,
    });
  }

  // Handle Drizzle ORM errors
  if (err.code === "23505") {
    // Unique constraint violation
    return res.status(409).json({
      error: "Conflict",
      message: "A record with this value already exists",
      requestId,
    });
  }

  if (err.code === "23503") {
    // Foreign key constraint violation
    return res.status(400).json({
      error: "Validation Error",
      message: "Referenced record does not exist",
      requestId,
    });
  }

  if (err.code === "23502") {
    // Not null constraint violation
    return res.status(400).json({
      error: "Validation Error",
      message: "Required field is missing",
      requestId,
    });
  }

  // Handle custom storage errors
  if (err.message === "COURSE_SKU_EXISTS" || err.message === "COURSE_TITLE_EXISTS") {
    return res.status(409).json({
      error: "Conflict",
      message: err.message === "COURSE_SKU_EXISTS" 
        ? "A course with this SKU already exists"
        : "A course with this title already exists",
      requestId,
    });
  }

  if (err.message === "COURSE_VERSION_CONFLICT" || err.message === "UNIT_VERSION_CONFLICT" || err.message === "LESSON_VERSION_CONFLICT") {
    return res.status(412).json({
      error: "Precondition Failed",
      message: "Resource was modified by another user. Please refresh and try again.",
      requestId,
    });
  }

  if (err.message === "UNIT_HAS_ACTIVE_ENROLLMENTS") {
    return res.status(409).json({
      error: "Conflict",
      message: "Cannot delete unit with active enrollments",
      requestId,
    });
  }

  // Default error response
  const isDevelopment = process.env.NODE_ENV === "development";
  
  res.status(statusCode).json({
    error: "Internal Server Error",
    message: isDevelopment ? err.message : "An unexpected error occurred",
    ...(isDevelopment && { stack: err.stack }),
    requestId,
  });
}

