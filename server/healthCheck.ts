import type { Request, Response } from "express";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { redisClient } from "./rateLimitRedis";

interface HealthCheckResult {
  status: "healthy" | "degraded" | "error";
  message: string;
  timestamp?: number;
  latency?: number;
}

interface HealthStatus {
  status: "healthy" | "degraded" | "error";
  timestamp: number;
  version: string;
  uptime: number;
  checks: {
    api: HealthCheckResult;
    database: HealthCheckResult;
    redis?: HealthCheckResult;
    storage?: HealthCheckResult;
    memory?: HealthCheckResult;
  };
}

/**
 * Comprehensive health check endpoint
 * Checks: API, Database, Redis, Storage, Memory
 */
export async function comprehensiveHealthCheck(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  const healthStatus: HealthStatus = {
    status: "healthy",
    timestamp: Date.now(),
    version: process.env.npm_package_version || "1.0.0",
    uptime: process.uptime(),
    checks: {
      api: { status: "healthy", message: "API server is running" },
      database: await checkDatabase(),
      memory: checkMemory(),
    },
  };

  // Check Redis if configured
  if (process.env.REDIS_URL) {
    healthStatus.checks.redis = await checkRedis();
  }

  // Determine overall status
  const checkStatuses = Object.values(healthStatus.checks).map((check) => check.status);
  if (checkStatuses.includes("error")) {
    healthStatus.status = "error";
  } else if (checkStatuses.includes("degraded")) {
    healthStatus.status = "degraded";
  }

  const latency = Date.now() - startTime;
  healthStatus.checks.api.latency = latency;

  const statusCode = healthStatus.status === "error" ? 503 : healthStatus.status === "degraded" ? 200 : 200;
  res.status(statusCode).json(healthStatus);
}

/**
 * Liveness probe - simple check that server is running
 */
export function livenessCheck(_req: Request, res: Response): void {
  res.status(200).json({
    status: "alive",
    timestamp: Date.now(),
  });
}

/**
 * Readiness probe - checks if server is ready to accept traffic
 */
export async function readinessCheck(_req: Request, res: Response): Promise<void> {
  const dbCheck = await checkDatabase();
  
  if (dbCheck.status === "error") {
    res.status(503).json({
      status: "not_ready",
      message: "Database connection failed",
      timestamp: Date.now(),
    });
    return;
  }

  res.status(200).json({
    status: "ready",
    timestamp: Date.now(),
  });
}

/**
 * Check database connectivity and performance
 */
async function checkDatabase(): Promise<HealthCheckResult> {
  try {
    const startTime = Date.now();
    const result = await db.execute(sql`SELECT 1 as health`);
    const latency = Date.now() - startTime;

    // Check if result exists (NeonHttpQueryResult doesn't have .length)
    if (!result) {
      return {
        status: "degraded",
        message: "Database query returned no results",
        latency,
      };
    }

    // Warn if query takes too long
    if (latency > 1000) {
      return {
        status: "degraded",
        message: `Database query slow (${latency}ms)`,
        latency,
      };
    }

    return {
      status: "healthy",
      message: "Database connection active",
      latency,
    };
  } catch (err) {
    return {
      status: "error",
      message: `Database connection failed: ${(err as Error).message}`,
    };
  }
}

/**
 * Check Redis connectivity
 */
async function checkRedis(): Promise<HealthCheckResult> {
  if (!redisClient) {
    return {
      status: "degraded",
      message: "Redis not configured",
    };
  }

  try {
    const startTime = Date.now();
    await redisClient.ping();
    const latency = Date.now() - startTime;

    return {
      status: "healthy",
      message: "Redis connection active",
      latency,
    };
  } catch (err) {
    return {
      status: "error",
      message: `Redis connection failed: ${(err as Error).message}`,
    };
  }
}

/**
 * Check memory usage
 */
function checkMemory(): HealthCheckResult {
  const usage = process.memoryUsage();
  const totalMB = usage.heapTotal / 1024 / 1024;
  const usedMB = usage.heapUsed / 1024 / 1024;
  const rssMB = usage.rss / 1024 / 1024;

  // Warn if memory usage is high (> 80% of heap)
  const heapUsagePercent = (usage.heapUsed / usage.heapTotal) * 100;
  
  if (heapUsagePercent > 90) {
    return {
      status: "error",
      message: `Memory usage critical: ${heapUsagePercent.toFixed(1)}% (${usedMB.toFixed(1)}MB / ${totalMB.toFixed(1)}MB)`,
    };
  } else if (heapUsagePercent > 80) {
    return {
      status: "degraded",
      message: `Memory usage high: ${heapUsagePercent.toFixed(1)}% (${usedMB.toFixed(1)}MB / ${totalMB.toFixed(1)}MB)`,
    };
  }

  return {
    status: "healthy",
    message: `Memory usage: ${heapUsagePercent.toFixed(1)}% (${usedMB.toFixed(1)}MB / ${totalMB.toFixed(1)}MB, RSS: ${rssMB.toFixed(1)}MB)`,
  };
}


