import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { setupAuth } from "./oauthAuth";
import { createServer } from "http";
import { ensureAdminExists } from "./seedAdmin";
import { importCourseCatalog } from "./importCourseCatalog";
import { requestIdMiddleware, errorHandler } from "./errors";
import { compressionMiddleware } from "./compression";
import { comprehensiveHealthCheck, livenessCheck, readinessCheck } from "./healthCheck";
import { queryMonitorMiddleware } from "./queryMonitor";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Response compression (compress responses > 1KB)
app.use(compressionMiddleware);

// Add request ID to all requests for tracing
app.use(requestIdMiddleware);

// Query performance monitoring
app.use(queryMonitorMiddleware);

// Health check endpoints
app.get("/health", comprehensiveHealthCheck);
app.get("/health/live", livenessCheck);
app.get("/health/ready", readinessCheck);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Setup auth and routes first (required for server to handle requests)
  await setupAuth(app);
  await registerRoutes(httpServer, app);

  // Global error handler (must be last middleware)
  app.use(errorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
      
      // Run non-critical initialization tasks AFTER server is listening
      // This allows health checks to succeed quickly during deployment
      setImmediate(async () => {
        try {
          await ensureAdminExists();
          
          // Auto-sync course catalog on startup (replaces manual sync button)
          console.log("Auto-syncing course catalog...");
          const result = await importCourseCatalog();
          if (result.success) {
            console.log(`Course catalog synced: ${result.coursesImported} courses, ${result.unitsImported} units, ${result.lessonsImported} lessons`);
          } else {
            console.error("Course catalog sync failed:", result.error);
          }
        } catch (err) {
          console.error("Error in deferred initialization:", err);
        }
      });
    },
  );
})();
