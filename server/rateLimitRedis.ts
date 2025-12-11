import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

// Redis store for distributed rate limiting (optional)
let redisStore: any = null;
let redisClient: any = null;

// Try to initialize Redis if available
try {
  if (process.env.REDIS_URL) {
    const RedisStore = require("rate-limit-redis");
    const Redis = require("ioredis");
    
    redisClient = new Redis(process.env.REDIS_URL, {
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redisClient.on("error", (err: Error) => {
      console.warn("[RateLimit] Redis connection error, falling back to memory:", err.message);
      redisStore = null;
    });

    redisClient.on("connect", () => {
      console.log("[RateLimit] Connected to Redis for distributed rate limiting");
    });

    redisStore = new RedisStore({
      client: redisClient,
      prefix: "rl:",
    });
  }
} catch (err) {
  console.warn("[RateLimit] Redis not available, using memory store:", (err as Error).message);
}

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

// Create rate limiter with Redis store if available, otherwise memory
function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
  keyGenerator?: (req: Request) => string;
}) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message,
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStore || undefined, // Use Redis if available, otherwise memory
    skip: skipIfWhitelisted,
    keyGenerator: options.keyGenerator || ((req: Request) => getClientIp(req)),
    handler: (req: Request, res: Response): void => {
      res.status(429).json({
        error: "Too Many Requests",
        message: options.message,
        retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now() + options.windowMs - Date.now()) / 1000),
      });
    },
  });
}

// Auth routes: 5 requests per minute (login/register)
export const authRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later",
});

// Public routes: 100 requests per minute (course catalog, etc.)
export const publicRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many requests, please slow down",
});

// Authenticated routes: 200 requests per minute
export const authenticatedRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  max: 200,
  message: "Too many requests, please slow down",
  keyGenerator: (req: Request): string => {
    const userId = (req.user as any)?.id;
    return userId ? `user:${userId}` : getClientIp(req);
  },
});

// Admin routes: 500 requests per minute
export const adminRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  max: 500,
  message: "Too many admin requests, please slow down",
  keyGenerator: (req: Request): string => {
    const userId = (req.user as any)?.id;
    return userId ? `admin:${userId}` : getClientIp(req);
  },
});

// Quiz submission: 10 requests per minute (prevent answer brute-forcing)
export const quizSubmissionRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many quiz submissions, please wait before trying again",
  keyGenerator: (req: Request): string => {
    const userId = (req.user as any)?.id;
    const enrollmentId = req.body?.enrollmentId || req.params?.enrollmentId;
    return userId && enrollmentId ? `quiz:${userId}:${enrollmentId}` : getClientIp(req);
  },
});

// Export Redis client for health checks
export { redisClient };

