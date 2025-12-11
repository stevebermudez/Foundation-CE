import type { Request, Response, NextFunction } from "express";

interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: number;
  userId?: string;
  route?: string;
}

// In-memory store for query metrics (in production, use Redis or a time-series DB)
const queryMetrics: QueryMetrics[] = [];
const MAX_METRICS = 1000; // Keep last 1000 queries

/**
 * Middleware to monitor database query performance
 * Logs slow queries and provides metrics endpoint
 */
export function queryMonitorMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function (body: any) {
    const duration = Date.now() - startTime;
    const route = req.route?.path || req.path;
    const userId = (req.user as any)?.id;

    // Log slow queries (> 1 second)
    if (duration > 1000) {
      console.warn(`[Slow Query] ${req.method} ${route} took ${duration}ms`, {
        userId,
        query: req.body?.query || "N/A",
      });
    }

    // Store metrics
    if (queryMetrics.length >= MAX_METRICS) {
      queryMetrics.shift(); // Remove oldest
    }

    queryMetrics.push({
      query: `${req.method} ${route}`,
      duration,
      timestamp: Date.now(),
      userId,
      route,
    });

    return originalSend.call(this, body);
  };

  next();
}

/**
 * Get query performance metrics
 */
export function getQueryMetrics(filters?: {
  minDuration?: number;
  maxDuration?: number;
  userId?: string;
  route?: string;
  limit?: number;
}): QueryMetrics[] {
  let filtered = [...queryMetrics];

  if (filters?.minDuration) {
    filtered = filtered.filter((m) => m.duration >= filters.minDuration!);
  }

  if (filters?.maxDuration) {
    filtered = filtered.filter((m) => m.duration <= filters.maxDuration!);
  }

  if (filters?.userId) {
    filtered = filtered.filter((m) => m.userId === filters.userId);
  }

  if (filters?.route) {
    filtered = filtered.filter((m) => m.route === filters.route);
  }

  const limit = filters?.limit || 100;
  return filtered.slice(-limit).reverse(); // Most recent first
}

/**
 * Get query performance statistics
 */
export function getQueryStats(): {
  total: number;
  average: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
  slowQueries: number;
} {
  if (queryMetrics.length === 0) {
    return {
      total: 0,
      average: 0,
      min: 0,
      max: 0,
      p50: 0,
      p95: 0,
      p99: 0,
      slowQueries: 0,
    };
  }

  const durations = queryMetrics.map((m) => m.duration).sort((a, b) => a - b);
  const total = durations.length;
  const sum = durations.reduce((a, b) => a + b, 0);
  const average = sum / total;
  const min = durations[0];
  const max = durations[durations.length - 1];
  const p50 = durations[Math.floor(total * 0.5)];
  const p95 = durations[Math.floor(total * 0.95)];
  const p99 = durations[Math.floor(total * 0.99)];
  const slowQueries = durations.filter((d) => d > 1000).length;

  return {
    total,
    average: Math.round(average),
    min,
    max,
    p50,
    p95,
    p99,
    slowQueries,
  };
}


