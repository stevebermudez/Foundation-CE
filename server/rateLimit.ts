import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

// Helper to get client IP (works behind proxies)
function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.headers["x-real-ip"] as string) ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

// Whitelist certain IPs (for testing, can be configured via env)
const whitelistIPs = (process.env.RATE_LIMIT_WHITELIST || "").split(",").filter(Boolean);

// Skip rate limiting for whitelisted IPs
const skipIfWhitelisted = (req: Request): boolean => {
  const ip = getClientIp(req);
  return whitelistIPs.includes(ip);
};

// Auth routes: 5 requests per minute (login/register)
export const authRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipIfWhitelisted,
  keyGenerator: (req) => getClientIp(req),
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too Many Requests",
      message: "Too many authentication attempts, please try again later",
      retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now() + 60000 - Date.now()) / 1000),
    });
  },
});

// Public routes: 100 requests per minute (course catalog, etc.)
export const publicRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: "Too many requests, please slow down",
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipIfWhitelisted,
  keyGenerator: (req) => getClientIp(req),
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too Many Requests",
      message: "Too many requests, please slow down",
      retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now() + 60000 - Date.now()) / 1000),
    });
  },
});

// Authenticated routes: 200 requests per minute
export const authenticatedRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  message: "Too many requests, please slow down",
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipIfWhitelisted,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    const userId = (req.user as any)?.id;
    return userId ? `user:${userId}` : getClientIp(req);
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too Many Requests",
      message: "Too many requests, please slow down",
      retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now() + 60000 - Date.now()) / 1000),
    });
  },
});

// Admin routes: 500 requests per minute
export const adminRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500,
  message: "Too many admin requests, please slow down",
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipIfWhitelisted,
  keyGenerator: (req) => {
    const userId = (req.user as any)?.id;
    return userId ? `admin:${userId}` : getClientIp(req);
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too Many Requests",
      message: "Too many admin requests, please slow down",
      retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now() + 60000 - Date.now()) / 1000),
    });
  },
});

// Quiz submission: 10 requests per minute (prevent answer brute-forcing)
export const quizSubmissionRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: "Too many quiz submissions, please wait before trying again",
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipIfWhitelisted,
  keyGenerator: (req) => {
    const userId = (req.user as any)?.id;
    const enrollmentId = req.body?.enrollmentId || req.params?.enrollmentId;
    return userId && enrollmentId ? `quiz:${userId}:${enrollmentId}` : getClientIp(req);
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too Many Requests",
      message: "Too many quiz submissions, please wait before trying again",
      retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now() + 60000 - Date.now()) / 1000),
    });
  },
});

