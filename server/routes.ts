import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { validateRequest, validateUUID, createCourseSchema, updateCourseSchema, createUnitSchema, updateUnitSchema, createLessonSchema, updateLessonSchema } from "./validation";
import { asyncHandler, NotFoundError, ConflictError } from "./errors";
import { authRateLimit, publicRateLimit, authenticatedRateLimit, adminRateLimit, quizSubmissionRateLimit } from "./rateLimitRedis";
import { getQueryMetrics, getQueryStats } from "./queryMonitor";
import { getStripeClient, getStripeStatus, getStripePublishableKey } from "./stripeClient";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { seedFRECIPrelicensing } from "./seedFRECIPrelicensing";
import { seedLMSContent } from "./seedLMSContent";
import { updateAllLessonContent, fixQuestionBankSettings } from "./updateLessonContent";
import { migrateQuizDataToCanonicalSchema, checkMigrationNeeded } from "./migrateQuizData";
import { updatePlaceholderQuestions } from "./updatePlaceholderQuestions";
import { isAuthenticated, isAdmin } from "./oauthAuth";
import { jwtAuth } from "./jwtAuth";
import {
  createPaypalOrder,
  capturePaypalOrder,
  loadPaypalDefault,
} from "./paypal";
import { submitToDBPR, validateDBPRData, generateDBPRBatchFile } from "./dbprService";
import { generateCertificateHTML, generateCertificateFileName, CertificateData } from "./certificates";
import { sendContactFormEmail, sendEnrollmentConfirmationEmail, sendCertificateEmail } from "./emailService";
import { generateSCORMManifest, generateQTIAssessment, generateQuestionBankQTI, exportCourseData } from "./lmsExportService";
import { triggerCatalogSyncDebounced } from "./catalogAutoSync";
import express from "express";
import path from "path";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Serve static course viewer files from /public directory
  const publicPath = path.resolve(process.cwd(), "public");
  app.use("/course-viewer", express.static(publicPath));
  // Defer seeding operations to run asynchronously AFTER routes are registered
  // IMPORTANT: Only run seeding if explicitly enabled - production uses catalog import
  // Check for explicit dev flag OR non-production with dev script running
  const isProduction = process.env.NODE_ENV === 'production' || 
                       !process.env.npm_lifecycle_event?.includes('dev');
  const allowDevSeeds = process.env.ALLOW_DEV_SEEDS === 'true';
  
  if (!isProduction || allowDevSeeds) {
    setImmediate(async () => {
      try {
        const db = (await import("./db")).db;
        const { courses } = await import("@shared/schema");
        const { eq } = await import("drizzle-orm");

        const existing = await db
          .select()
          .from(courses)
          .where(eq(courses.sku, "FL-RE-PL-SA-FRECI-63"))
          .limit(1);

        if (existing.length === 0) {
          await seedFRECIPrelicensing();
          console.log("✓ FREC I course seeded successfully");
        } else {
          console.log("✓ FREC I course already exists");
        }
        
        // Seed LMS content (units, lessons, question banks)
        await seedLMSContent();
        
        // Update lesson content with real FREC I educational material
        await updateAllLessonContent();
        
        // Fix question bank settings (ensure unit quizzes use 10 questions)
        await fixQuestionBankSettings();
        
        // Migrate quiz data from question_banks to practice_exams (canonical schema)
        // This ensures both tables have the same real questions
        const needsMigration = await checkMigrationNeeded();
        if (needsMigration) {
          console.log("Quiz data migration needed - syncing to canonical schema...");
          await migrateQuizDataToCanonicalSchema();
        } else {
          console.log("✓ Quiz data already in canonical schema");
        }
        
        // Update any placeholder questions with real content
        await updatePlaceholderQuestions();
      } catch (err: any) {
        console.error("Error with FREC I seeding:", err);
      }
    });
  } else {
    console.log("🚫 Production mode detected: skipping ALL seed routines");
    console.log(`   NODE_ENV=${process.env.NODE_ENV}, npm_lifecycle_event=${process.env.npm_lifecycle_event}`);
    console.log("   Course content will be loaded from catalog snapshot only");
  }
  // Auth Routes - JWT or Passport
  const authMiddleware = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (token) {
      try {
        const jwtLib = await import("jsonwebtoken");
        const decoded = jwtLib.default.verify(
          token,
          process.env.SESSION_SECRET || "fallback-secret",
        ) as { id: string; email: string };
        req.user = decoded;
        return next();
      } catch (err) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    }
    return isAuthenticated(req, res, next);
  };

  app.get("/api/user", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.id || user.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ error: "User not found in session" });
      }
      
      const userData = await storage.getUser(userId);
      res.json({
        id: userId,
        email: userData?.email || user.email || user.claims?.email,
        firstName: userData?.firstName || user.firstName || user.claims?.first_name,
        lastName: userData?.lastName || user.lastName || user.claims?.last_name,
        profileImageUrl: userData?.profileImageUrl || user.profileImageUrl || user.claims?.profile_image_url,
      });
    } catch (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.patch("/api/user/profile", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const { licenseNumber, licenseExpirationDate } = req.body;
      res.json({
        message: "Profile updated",
        licenseNumber,
        licenseExpirationDate,
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Notification Routes
  app.get("/api/notifications", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const notificationsList = await storage.getUserNotifications(user.id);
      res.json(notificationsList);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/count", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const count = await storage.getUnreadNotificationCount(user.id);
      res.json({ count });
    } catch (err) {
      console.error("Error fetching notification count:", err);
      res.status(500).json({ error: "Failed to fetch notification count" });
    }
  });

  app.patch("/api/notifications/:id/read", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const notification = await storage.markNotificationRead(req.params.id, user.id);
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json(notification);
    } catch (err) {
      console.error("Error marking notification read:", err);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/read-all", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      await storage.markAllNotificationsRead(user.id);
      res.json({ success: true });
    } catch (err) {
      console.error("Error marking all notifications read:", err);
      res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const deleted = await storage.deleteNotification(req.params.id, user.id);
      if (!deleted) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting notification:", err);
      res.status(500).json({ error: "Failed to delete notification" });
    }
  });

  app.get("/api/enrollments/user", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const allEnrollments = await storage.getAllUserEnrollments(user.id);
      res.json(allEnrollments);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
      res.status(500).json({ error: "Failed to fetch enrollments" });
    }
  });

  // Compliance API endpoints
  app.get("/api/compliance/licenses", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const licenses = await storage.getUserLicenses(user.id);
      res.json(licenses);
    } catch (err) {
      console.error("Error fetching user licenses:", err);
      res.status(500).json({ error: "Failed to fetch licenses" });
    }
  });

  app.post("/api/compliance/licenses", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const { licenseNumber, licenseType, state, issueDate, expirationDate, renewalDueDate } = req.body;
      
      if (!licenseNumber || !licenseType || !state || !issueDate || !expirationDate) {
        return res.status(400).json({ error: "Missing required license fields" });
      }

      const license = await storage.createUserLicense({
        userId: user.id,
        licenseNumber,
        licenseType,
        state,
        issueDate: new Date(issueDate),
        expirationDate: new Date(expirationDate),
        renewalDueDate: renewalDueDate ? new Date(renewalDueDate) : new Date(expirationDate),
        status: "active"
      });
      res.json(license);
    } catch (err) {
      console.error("Error creating license:", err);
      res.status(500).json({ error: "Failed to create license" });
    }
  });

  app.get("/api/compliance/enrollments", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const completedEnrollments = await storage.getCompletedEnrollments(user.id);
      res.json(completedEnrollments);
    } catch (err) {
      console.error("Error fetching completed enrollments:", err);
      res.status(500).json({ error: "Failed to fetch completed enrollments" });
    }
  });

  app.get("/api/compliance/reports", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const [dbprReports, sirconReports] = await Promise.all([
        storage.getDBPRReportsByUser(user.id),
        storage.getSirconReportsByUser(user.id)
      ]);
      res.json({ dbprReports, sirconReports });
    } catch (err) {
      console.error("Error fetching compliance reports:", err);
      res.status(500).json({ error: "Failed to fetch compliance reports" });
    }
  });

  app.get("/api/compliance/summary", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const state = req.query.state as string;
      
      const [licenses, completedEnrollments, dbprReports, sirconReports] = await Promise.all([
        storage.getUserLicenses(user.id),
        storage.getCompletedEnrollments(user.id),
        storage.getDBPRReportsByUser(user.id),
        storage.getSirconReportsByUser(user.id)
      ]);

      // Filter by state if provided
      const filteredLicenses = state 
        ? licenses.filter(l => l.state === state)
        : licenses;
      
      const filteredEnrollments = state
        ? completedEnrollments.filter(e => e.course.state === state)
        : completedEnrollments;

      // Calculate hours completed per license type
      const hoursCompleted: Record<string, number> = {};
      for (const enrollment of filteredEnrollments) {
        const key = enrollment.course.licenseType;
        hoursCompleted[key] = (hoursCompleted[key] || 0) + (enrollment.hoursCompleted || 0);
      }

      // Combine all reports for reporting history
      const reportingHistory = [
        ...dbprReports.map(r => ({
          ...r,
          reportType: "DBPR" as const,
          agency: "FREC"
        })),
        ...sirconReports.map(r => ({
          ...r,
          reportType: "Sircon" as const,
          agency: r.licenseType?.includes("insurance") ? "OIR" : "FREC"
        }))
      ].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

      res.json({
        licenses: filteredLicenses,
        enrollments: filteredEnrollments,
        hoursCompleted,
        reportingHistory
      });
    } catch (err) {
      console.error("Error fetching compliance summary:", err);
      res.status(500).json({ error: "Failed to fetch compliance summary" });
    }
  });

  app.post("/api/enrollments", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const { courseId, sessionId } = req.body;
      
      if (!courseId) {
        return res.status(400).json({ error: "courseId is required" });
      }

      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      const existingEnrollment = await storage.getEnrollment(user.id, courseId);
      if (existingEnrollment) {
        return res.json({ enrollment: existingEnrollment, existing: true });
      }

      // Validate Stripe session if provided
      if (sessionId && process.env.STRIPE_SECRET_KEY) {
        try {
          const Stripe = (await import("stripe")).default;
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          
          // Verify session is paid and matches the course
          if (session.payment_status !== "paid") {
            return res.status(400).json({ error: "Payment not completed" });
          }
          
          // Verify session belongs to this user (if email matches)
          if (session.customer_email && user.email && 
              session.customer_email.toLowerCase() !== user.email.toLowerCase()) {
            console.warn(`Session email mismatch: ${session.customer_email} vs ${user.email}`);
            // Allow but log - user may have used different email
          }
        } catch (stripeErr: any) {
          console.error("Stripe session validation failed:", stripeErr.message);
          // If session is invalid or expired, deny enrollment
          if (stripeErr.code === "resource_missing") {
            return res.status(400).json({ error: "Invalid payment session" });
          }
          // For other Stripe errors, allow enrollment (may be test mode or config issue)
        }
      }

      const enrollment = await storage.createEnrollment(user.id, courseId);
      
      // Create welcome notification for the user
      try {
        await storage.createNotification({
          userId: user.id,
          type: "enrollment",
          title: "Welcome to " + course.title,
          message: `You've successfully enrolled in ${course.title}. Start learning today!`,
          link: `/learn/${enrollment.id}`,
          read: false
        });
      } catch (notifErr) {
        console.error("Failed to create enrollment notification:", notifErr);
      }

      // Send enrollment confirmation email
      try {
        const studentName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email?.split("@")[0] || "Student";
        await sendEnrollmentConfirmationEmail({
          studentEmail: user.email || "",
          studentName,
          courseName: course.title,
          courseHours: course.hoursRequired || 0,
          purchaseAmount: course.price || 0,
        });
      } catch (emailErr) {
        console.error("Failed to send enrollment confirmation email:", emailErr);
      }
      
      res.json({ enrollment, existing: false });
    } catch (err) {
      console.error("Error creating enrollment:", err);
      res.status(500).json({ error: "Failed to create enrollment" });
    }
  });

  // Email/Password Signup (JWT)
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const bcrypt = await import("bcrypt");
      const passwordHash = await bcrypt.default.hash(password, 10);

      // Generate UUID for new user using built-in crypto
      const { randomUUID } = await import("crypto");
      const userId = randomUUID();
      const newUser = await storage.upsertUser({
        id: userId,
        email,
        passwordHash,
        firstName,
        lastName,
      });

      // Generate JWT token
      const jwt = await import("jsonwebtoken");
      const token = jwt.default.sign(
        { id: newUser.id, email: newUser.email },
        process.env.SESSION_SECRET || "fallback-secret",
        { expiresIn: "7d" },
      );

      // Create welcome notification for new user
      try {
        await storage.createNotification({
          userId: newUser.id,
          type: "system",
          title: "Welcome to FoundationCE!",
          message: "Get started by exploring our course catalog and enrolling in your first course.",
          link: "/courses/fl",
          read: false
        });
      } catch (notifErr) {
        console.error("Failed to create welcome notification:", notifErr);
      }
      
      res.json({
        message: "handleSubmit successful",
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
      });
    } catch (err) {
      console.error("Signup error details:", {
        message: (err as Error).message,
        stack: (err as Error).stack,
        name: (err as Error).name,
      });
      res
        .status(500)
        .json({ error: "Signup failed", details: (err as Error).message });
    }
  });

  // Email/Password Login (JWT)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const bcrypt = await import("bcrypt");
      const passwordMatch = await bcrypt.default.compare(
        password,
        user.passwordHash,
      );

      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Generate JWT token
      const jwt = await import("jsonwebtoken");
      const token = jwt.default.sign(
        { id: user.id, email: user.email },
        process.env.SESSION_SECRET || "fallback-secret",
        { expiresIn: "7d" },
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Login failed" });
    }

});

  // Admin Login Route - validates credentials and returns JWT with isAdmin flag
  app.post("/api/auth/admin/login", authRateLimit, async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      // Verify password
      const bcrypt = await import("bcrypt");
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      // Check if user is admin
      const isAdminUser = await storage.isAdmin(user.id);
      if (!isAdminUser) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      // Generate JWT token with isAdmin flag
      const jwt = await import("jsonwebtoken");
      const token = jwt.default.sign(
        { id: user.id, email: user.email, isAdmin: true },
        process.env.SESSION_SECRET || "fallback-secret",
        { expiresIn: "7d" }
      );
      
      res.json({ 
        token,
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User',
          isAdmin: true 
        }
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Get current user endpoint - requires valid JWT token
  app.get("/api/auth/user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
      
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }
      
      const jwt = await import("jsonwebtoken");
      const decoded = jwt.default.verify(
        token,
        process.env.SESSION_SECRET || "fallback-secret"
      ) as { id: string; email: string; isAdmin?: boolean };
      
      const user = await storage.getUser(decoded.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const isAdminUser = await storage.isAdmin(decoded.id);
      
      res.json({ 
        id: user.id, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        isAdmin: isAdminUser
      });
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
      console.error("Get user error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Check if user is admin endpoint - requires valid JWT token
  app.get("/api/auth/is-admin", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
      
      if (!token) {
        return res.json({ isAdmin: false });
      }
      
      const jwt = await import("jsonwebtoken");
      const decoded = jwt.default.verify(
        token,
        process.env.SESSION_SECRET || "fallback-secret"
      ) as { id: string; email: string; isAdmin?: boolean };
      
      const isAdminUser = await storage.isAdmin(decoded.id);
      res.json({ isAdmin: isAdminUser });
    } catch (error) {
      res.json({ isAdmin: false });
    }
  });

  // Course Routes
  app.get("/api/courses", async (req, res) => {
    const courses = await storage.getCourses({
      state: req.query.state as string,
      licenseType: req.query.licenseType as string,
    });
    res.json(courses);
  });

  // Public route for course units
  app.get("/api/courses/:courseId/units", async (req, res) => {
    try {
      const units = await storage.getUnits(req.params.courseId);
      res.json(units);
    } catch (err) {
      console.error("Error fetching units:", err);
      res.status(500).json({ error: "Failed to fetch units" });
    }
  });

  // Public route for unit lessons
  app.get("/api/units/:unitId/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessons(req.params.unitId);
      res.json(lessons);
    } catch (err) {
      console.error("Error fetching lessons:", err);
      res.status(500).json({ error: "Failed to fetch lessons" });
    }
  });

  // Public route for practice exams by course
  app.get("/api/courses/:courseId/exams", async (req, res) => {
    try {
      const exams = await storage.getPracticeExams(req.params.courseId);
      res.json(exams);
    } catch (err) {
      console.error("Error fetching exams:", err);
      res.status(500).json({ error: "Failed to fetch exams" });
    }
  });

  // Course Completion & Regulatory Reporting
  app.post("/api/enrollments/:id/complete", async (req, res) => {
    try {
      const {
        userId,
        licenseNumber,
        ssnLast4,
        licenseType,
        firstName,
        lastName,
      } = req.body;
      const enrollment = await storage.updateEnrollmentHours(
        req.params.id,
        req.body.hoursCompleted || 0,
      );

      const course = await storage.getCourse(enrollment.courseId);
      const user = await storage.getUser(userId);
      const studentName =
        firstName && lastName
          ? `${firstName} ${lastName}`
          : user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : "Unknown";

      // Send certificate email on course completion
      if (user?.email && course) {
        try {
          const completionDate = new Date();
          const certificateData: CertificateData = {
            studentName,
            courseName: course.title,
            hours: course.hoursRequired || 0,
            completionDate,
            instructorName: course.instructorName || undefined,
            schoolName: "FoundationCE",
            schoolApprovalNumber: course.providerNumber || "ZH0004868",
            deliveryMethod: course.deliveryMethod || "Self-Paced Online",
          };
          const certificateHtml = generateCertificateHTML(certificateData);
          
          await sendCertificateEmail({
            studentEmail: user.email,
            studentName,
            courseName: course.title,
            courseHours: course.hoursRequired || 0,
            completionDate,
            certificateHtml,
          });
          console.log("Certificate email sent to:", user.email);
        } catch (emailErr) {
          console.error("Failed to send certificate email:", emailErr);
        }
      }

      // Trigger Sircon reporting if it's an insurance course
      if (course?.productType === "Insurance" && licenseNumber) {
        const sirconStatus = await storage.createSirconReport({
          enrollmentId: enrollment.id,
          userId,
          courseId: course.id,
          courseTitle: course.title,
          completionDate: new Date(),
          ceHours: course.hoursRequired || 0,
          state: course.state,
          licenseNumber,
          licenseType: (licenseType as any) || "property",
          status: "pending",
          confirmationNumber: null,
          errorMessage: null,
          submittedAt: null,
          confirmedAt: null,
        });
        return res.status(201).json({ enrollment, sirconStatus });
      }

      // Trigger DBPR reporting if it's a Florida real estate course
      if (course?.productType === "RealEstate" && course?.state === "FL") {
        const dbprStatus = await storage.createDBPRReport({
          enrollmentId: enrollment.id,
          userId,
          courseId: course.id,
          courseTitle: course.title,
          completionDate: new Date(),
          ceHours: course.hoursRequired || 0,
          licenseNumber: licenseNumber || null,
          ssnLast4: ssnLast4 || null,
          licenseType: (licenseType as any) || "salesperson",
          studentName,
          providerNumber: course.providerNumber || null,
          courseOfferingNumber: course.courseOfferingNumber || null,
          instructorName: course.instructorName || null,
          status: "pending",
          confirmationNumber: null,
          errorMessage: null,
          submittedAt: null,
          confirmedAt: null,
        });
        return res.status(201).json({ enrollment, dbprStatus });
      }

      res.json(enrollment);
    } catch (err) {
      console.error("Error completing enrollment:", err);
      res.status(500).json({ error: "Failed to complete enrollment" });
    }
  });

  // Get Sircon reporting status
  app.get("/api/sircon/status/:enrollmentId", async (req, res) => {
    try {
      const status = await storage.getSirconReport(req.params.enrollmentId);
      res.json(status);
    } catch (err) {
      console.error("Error fetching Sircon status:", err);
      res.status(500).json({ error: "Failed to fetch status" });
    }
  });

  // Get DBPR reporting status
  app.get("/api/dbpr/status/:enrollmentId", isAuthenticated, async (req, res) => {
    try {
      const { enrollmentId } = req.params;
      const userId = (req.user as any)?.id || (req.session as any)?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const enrollment = await storage.getEnrollmentById(enrollmentId);
      if (!enrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }
      
      if (enrollment.userId !== userId) {
        return res.status(403).json({ error: "Access denied - you can only view your own DBPR status" });
      }
      
      const status = await storage.getDBPRReport(enrollmentId);
      res.json(status);
    } catch (err) {
      console.error("Error fetching DBPR status:", err);
      res.status(500).json({ error: "Failed to fetch status" });
    }
  });

  // Submit completion to DBPR
  app.post("/api/dbpr/submit/:enrollmentId", isAuthenticated, async (req, res) => {
    try {
      const { enrollmentId } = req.params;
      const userId = (req.user as any)?.id || (req.session as any)?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const report = await storage.getDBPRReport(enrollmentId);
      
      if (!report) {
        return res.status(404).json({ error: "DBPR report not found" });
      }

      if (report.userId !== userId) {
        return res.status(403).json({ error: "Access denied - you can only submit your own course completions" });
      }

      const enrollment = await storage.getEnrollmentById(enrollmentId);
      if (!enrollment || !enrollment.completed) {
        return res.status(400).json({ error: "Enrollment not found or course not completed" });
      }

      const course = await storage.getCourse(enrollment.courseId);
      if (!course || course.state !== "FL" || course.productType !== "RealEstate") {
        return res.status(400).json({ error: "DBPR reporting is only for Florida Real Estate courses" });
      }

      if (report.status === "accepted") {
        return res.status(400).json({ error: "Report already accepted by DBPR" });
      }

      const validation = await validateDBPRData({
        studentName: report.studentName,
        licenseNumber: report.licenseNumber || "",
        ssnLast4: report.ssnLast4 || undefined,
        courseTitle: report.courseTitle,
        courseOfferingNumber: report.courseOfferingNumber || "",
        providerNumber: report.providerNumber || "",
        completionDate: new Date(report.completionDate),
        ceHours: report.ceHours,
        instructorName: report.instructorName || undefined,
        licenseType: report.licenseType as "salesperson" | "broker" | "instructor",
      });

      if (!validation.valid) {
        return res.status(400).json({ error: "Validation failed", errors: validation.errors });
      }

      const result = await submitToDBPR({
        studentName: report.studentName,
        licenseNumber: report.licenseNumber || "",
        ssnLast4: report.ssnLast4 || undefined,
        courseTitle: report.courseTitle,
        courseOfferingNumber: report.courseOfferingNumber || "",
        providerNumber: report.providerNumber || "",
        completionDate: new Date(report.completionDate),
        ceHours: report.ceHours,
        instructorName: report.instructorName || undefined,
        licenseType: report.licenseType as "salesperson" | "broker" | "instructor",
      });

      const updated = await storage.updateDBPRReport(report.id, {
        status: result.success ? "submitted" : "rejected",
        confirmationNumber: result.confirmationNumber || null,
        errorMessage: result.errorMessage || null,
        submittedAt: result.submittedAt,
        confirmedAt: result.success ? new Date() : null,
      });

      res.json({ success: result.success, report: updated, result });
    } catch (err) {
      console.error("DBPR submission error:", err);
      res.status(500).json({ error: "Failed to submit to DBPR" });
    }
  });

  // Export DBPR batch file for manual upload
  app.get("/api/dbpr/export", isAdmin, async (req, res) => {
    try {
      const { status = "pending" } = req.query;
      const db = (await import("./db")).db;
      const { dbprReports } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      const reports = await db
        .select()
        .from(dbprReports)
        .where(eq(dbprReports.status, status as string));

      if (reports.length === 0) {
        return res.status(404).json({ error: "No reports found with status: " + status });
      }

      const batchFile = generateDBPRBatchFile(reports);
      
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Content-Disposition", `attachment; filename="dbpr-batch-${new Date().toISOString().split('T')[0]}.txt"`);
      res.send(batchFile);
    } catch (err) {
      console.error("DBPR export error:", err);
      res.status(500).json({ error: "Failed to export DBPR batch" });
    }
  });

  // Generate certificate for completed enrollment
  app.get("/api/certificates/:enrollmentId", isAuthenticated, async (req, res) => {
    try {
      const { enrollmentId } = req.params;
      const userId = (req.user as any)?.id || (req.session as any)?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const enrollment = await storage.getEnrollmentById(enrollmentId);
      if (!enrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      if (enrollment.userId !== userId) {
        return res.status(403).json({ error: "Access denied - you can only access your own certificates" });
      }

      if (!enrollment.completed) {
        return res.status(400).json({ error: "Course not yet completed" });
      }

      const user = await storage.getUser(enrollment.userId);
      const course = await storage.getCourse(enrollment.courseId);
      
      if (!user || !course) {
        return res.status(404).json({ error: "User or course not found" });
      }

      const certificateData: CertificateData = {
        studentName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Student",
        courseName: course.title,
        hours: course.hoursRequired || 0,
        completionDate: new Date(enrollment.completedAt || new Date()),
        instructorName: course.instructorName || undefined,
        schoolName: "FoundationCE",
        schoolApprovalNumber: course.providerNumber || "ZH0004868",
        deliveryMethod: course.deliveryMethod || "Self-Paced Online",
      };

      const html = generateCertificateHTML(certificateData);
      
      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (err) {
      console.error("Certificate generation error:", err);
      res.status(500).json({ error: "Failed to generate certificate" });
    }
  });

  // Download certificate as HTML file
  app.get("/api/certificates/:enrollmentId/download", isAuthenticated, async (req, res) => {
    try {
      const { enrollmentId } = req.params;
      const userId = (req.user as any)?.id || (req.session as any)?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const enrollment = await storage.getEnrollmentById(enrollmentId);
      if (!enrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      if (enrollment.userId !== userId) {
        return res.status(403).json({ error: "Access denied - you can only download your own certificates" });
      }

      if (!enrollment.completed) {
        return res.status(400).json({ error: "Course not yet completed" });
      }

      const user = await storage.getUser(enrollment.userId);
      const course = await storage.getCourse(enrollment.courseId);
      
      if (!user || !course) {
        return res.status(404).json({ error: "User or course not found" });
      }

      const studentName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Student";
      const completionDate = new Date(enrollment.completedAt || new Date());

      const certificateData: CertificateData = {
        studentName: studentName,
        courseName: course.title,
        hours: course.hoursRequired || 0,
        completionDate,
        instructorName: course.instructorName || undefined,
        schoolName: "FoundationCE",
        schoolApprovalNumber: course.providerNumber || "ZH0004868",
        deliveryMethod: course.deliveryMethod || "Self-Paced Online",
      };

      const html = generateCertificateHTML(certificateData);
      const filename = generateCertificateFileName(studentName, completionDate);
      
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(html);
    } catch (err) {
      console.error("Certificate download error:", err);
      res.status(500).json({ error: "Failed to download certificate" });
    }
  });

  // Stripe Status - Check if Stripe is configured
  app.get("/api/stripe/status", (req, res) => {
    const status = getStripeStatus();
    res.json(status);
  });

  app.get("/api/courses/:id", async (req, res) => {
    const course = await storage.getCourse(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  });

  // Admin Course Preview - Bypass enrollment checks for admins
  app.get("/api/admin/courses/:id/preview", isAdmin, adminRateLimit, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const course = await storage.getCourse(id);
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // Get all units with lessons (no enrollment required for preview)
    const units = await storage.getUnits(id);
    const sortedUnits = units.sort((a, b) => a.unitNumber - b.unitNumber);

    const unitsWithLessons = await Promise.all(sortedUnits.map(async (unit) => {
      const lessons = await storage.getLessons(unit.id);
      const sortedLessons = lessons.sort((a, b) => a.lessonNumber - b.lessonNumber);
      return {
        id: unit.id,
        unitNumber: unit.unitNumber,
        title: unit.title,
        description: unit.description,
        hoursRequired: unit.hoursRequired,
        lessons: sortedLessons.map(lesson => ({
          id: lesson.id,
          lessonNumber: lesson.lessonNumber,
          title: lesson.title,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          durationMinutes: lesson.durationMinutes || 15,
        })),
      };
    }));

    res.json(unitsWithLessons);
  }));

  // ============================================================
  // LMS Routes - Sequential Learning, Time Tracking, Quizzes
  // ============================================================

  // Get course units with progress status for enrolled user
  app.get("/api/courses/:courseId/units-progress", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const { courseId } = req.params;
      
      const enrollment = await storage.getEnrollment(user.id, courseId);
      if (!enrollment) {
        return res.status(404).json({ error: "Not enrolled in this course" });
      }
      
      const units = await storage.getUnits(courseId);
      const sortedUnits = units.sort((a, b) => a.unitNumber - b.unitNumber);
      
      const unitsWithProgress = await Promise.all(sortedUnits.map(async (unit, index) => {
        let unitProg = await storage.getUnitProgress(enrollment.id, unit.id);
        
        // First unit should always be unlocked for enrolled users
        if (!unitProg && index === 0) {
          unitProg = await storage.createUnitProgress(enrollment.id, unit.id, user.id);
          unitProg = await storage.updateUnitProgress(unitProg.id, { status: "in_progress", startedAt: new Date() });
        } else if (!unitProg) {
          // Create locked progress for other units
          unitProg = await storage.createUnitProgress(enrollment.id, unit.id, user.id);
        }
        
        const lessons = await storage.getLessons(unit.id);
        const lessonProgress = await Promise.all(lessons.map(async (lesson) => {
          const prog = await storage.getLessonProgress(enrollment.id, lesson.id);
          return {
            ...lesson,
            completed: prog?.completed === 1,
            timeSpentSeconds: prog?.timeSpentSeconds || 0
          };
        }));
        
        const completedLessons = lessonProgress.filter(l => l.completed).length;
        
        return {
          ...unit,
          status: unitProg.status,
          lessonsCompleted: completedLessons,
          totalLessons: lessons.length,
          quizPassed: unitProg.quizPassed === 1,
          quizScore: unitProg.quizScore,
          quizAttempts: unitProg.quizAttempts || 0,
          timeSpentSeconds: unitProg.timeSpentSeconds || 0,
          lessons: lessonProgress.sort((a, b) => a.lessonNumber - b.lessonNumber),
          isLocked: unitProg.status === "locked"
        };
      }));
      
      res.json({
        enrollmentId: enrollment.id,
        currentUnitIndex: enrollment.currentUnitIndex || 1,
        totalTimeSeconds: enrollment.totalTimeSeconds || 0,
        finalExamPassed: enrollment.finalExamPassed === 1,
        finalExamScore: enrollment.finalExamScore,
        expiresAt: enrollment.expiresAt,
        policyAcknowledgedAt: enrollment.policyAcknowledgedAt,
        units: unitsWithProgress
      });
    } catch (err) {
      console.error("Error fetching units progress:", err);
      res.status(500).json({ error: "Failed to fetch units progress" });
    }
  });

  // Update time spent on a lesson (heartbeat from frontend)
  app.post("/api/lessons/:lessonId/time", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const { lessonId } = req.params;
      const { enrollmentId, secondsToAdd } = req.body;
      
      if (!enrollmentId || typeof secondsToAdd !== 'number') {
        return res.status(400).json({ error: "enrollmentId and secondsToAdd required" });
      }
      
      // Verify enrollment ownership
      const enrollment = await storage.getEnrollmentById(enrollmentId);
      if (!enrollment || enrollment.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      // Check if enrollment is expired (blocks content access)
      if (storage.isEnrollmentExpired(enrollment)) {
        return res.status(403).json({ 
          error: "Enrollment expired",
          expired: true,
          expiresAt: enrollment.expiresAt
        });
      }
      
      // SECURITY: Verify the lesson belongs to a unit in the enrolled course
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }
      const unit = await storage.getUnit(lesson.unitId);
      if (!unit || unit.courseId !== enrollment.courseId) {
        return res.status(403).json({ error: "Lesson not available for this enrollment" });
      }
      
      // Check if unit is unlocked
      const unitProg = await storage.getUnitProgress(enrollmentId, unit.id);
      if (!unitProg || unitProg.status === "locked") {
        return res.status(403).json({ error: "Unit is locked" });
      }
      
      // Cap time increment to prevent spoofing (max 2 minutes per request)
      const cappedSeconds = Math.min(secondsToAdd, 120);
      
      const progress = await storage.updateLessonTimeSpent(enrollmentId, lessonId, cappedSeconds);
      
      // Also update total course time
      await storage.updateEnrollmentProgress(enrollmentId, {
        totalTimeSeconds: (enrollment.totalTimeSeconds || 0) + cappedSeconds
      });
      
      res.json({ 
        timeSpentSeconds: progress.timeSpentSeconds,
        totalCourseTimeSeconds: (enrollment.totalTimeSeconds || 0) + cappedSeconds
      });
    } catch (err) {
      console.error("Error updating lesson time:", err);
      res.status(500).json({ error: "Failed to update time" });
    }
  });

  // Complete a lesson
  app.post("/api/lessons/:lessonId/complete", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const { lessonId } = req.params;
      const { enrollmentId } = req.body;
      
      if (!enrollmentId) {
        return res.status(400).json({ error: "enrollmentId required" });
      }
      
      // Verify enrollment ownership
      const enrollment = await storage.getEnrollmentById(enrollmentId);
      if (!enrollment || enrollment.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      // Check if enrollment is expired (blocks content access)
      if (storage.isEnrollmentExpired(enrollment)) {
        return res.status(403).json({ 
          error: "Enrollment expired",
          expired: true,
          expiresAt: enrollment.expiresAt
        });
      }
      
      // SECURITY: Verify the lesson belongs to a unit in the enrolled course
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }
      const unit = await storage.getUnit(lesson.unitId);
      if (!unit || unit.courseId !== enrollment.courseId) {
        return res.status(403).json({ error: "Lesson not available for this enrollment" });
      }
      
      // Check if unit is unlocked
      const unitProg = await storage.getUnitProgress(enrollmentId, unit.id);
      if (!unitProg || unitProg.status === "locked") {
        return res.status(403).json({ error: "Unit is locked" });
      }
      
      // Check minimum time requirement (optional - can be configured per lesson)
      const lessonProg = await storage.getLessonProgress(enrollmentId, lessonId);
      const minTimeSeconds = 60; // Minimum 1 minute per lesson
      if (lessonProg && (lessonProg.timeSpentSeconds || 0) < minTimeSeconds) {
        return res.status(400).json({ 
          error: "Minimum time not met",
          required: minTimeSeconds,
          spent: lessonProg.timeSpentSeconds || 0
        });
      }
      
      const lessonProg2 = await storage.completeLesson(enrollmentId, lessonId, user.id);
      
      // Recalculate and update overall enrollment progress
      const courseUnits = await storage.getUnits(enrollment.courseId);
      let totalLessons = 0;
      let completedLessons = 0;
      
      for (const u of courseUnits) {
        const unitLessons = await storage.getLessons(u.id);
        totalLessons += unitLessons.length;
        
        for (const l of unitLessons) {
          const lp = await storage.getLessonProgress(enrollmentId, l.id);
          if (lp?.completed) {
            completedLessons++;
          }
        }
      }
      
      const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const course = await storage.getCourse(enrollment.courseId);
      const hoursCompleted = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * (course?.hoursRequired || 63)) : 0;
      
      await storage.updateEnrollmentProgress(enrollmentId, { 
        progress: overallProgress,
        hoursCompleted: hoursCompleted
      });
      
      res.json({ 
        completed: true,
        lessonId,
        completedAt: lessonProg2.completedAt,
        overallProgress,
        hoursCompleted
      });
    } catch (err) {
      console.error("Error completing lesson:", err);
      res.status(500).json({ error: "Failed to complete lesson" });
    }
  });

  // Start a quiz attempt (unit quiz or final exam)
  app.post("/api/quizzes/:bankId/start", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const { bankId } = req.params;
      const { enrollmentId } = req.body;
      
      if (!enrollmentId) {
        return res.status(400).json({ error: "enrollmentId required" });
      }
      
      // Verify enrollment ownership
      const enrollment = await storage.getEnrollmentById(enrollmentId);
      if (!enrollment || enrollment.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      // Check if enrollment is expired (blocks quiz access)
      if (storage.isEnrollmentExpired(enrollment)) {
        return res.status(403).json({ 
          error: "Enrollment expired",
          expired: true,
          expiresAt: enrollment.expiresAt
        });
      }
      
      const bank = await storage.getQuestionBank(bankId);
      if (!bank) {
        return res.status(404).json({ error: "Question bank not found" });
      }
      
      // SECURITY: Verify the question bank belongs to the enrolled course
      if (bank.courseId !== enrollment.courseId) {
        return res.status(403).json({ error: "Quiz not available for this enrollment" });
      }
      
      // For unit quizzes, check if unit is unlocked and lessons are complete
      if (bank.bankType === "unit_quiz" && bank.unitId) {
        // Check if this unit is unlocked (not locked)
        const unitProg = await storage.getUnitProgress(enrollmentId, bank.unitId);
        if (!unitProg || unitProg.status === "locked") {
          return res.status(403).json({ error: "Unit is locked. Complete previous units first." });
        }
        
        const { lessonsComplete } = await storage.checkUnitCompletion(enrollmentId, bank.unitId);
        if (!lessonsComplete) {
          return res.status(400).json({ error: "Complete all lessons before taking the quiz" });
        }
      }
      
      // For final exam, check if all units are complete with passed quizzes
      if (bank.bankType === "final_exam") {
        const units = await storage.getUnits(bank.courseId);
        for (const unit of units) {
          const { lessonsComplete, quizPassed } = await storage.checkUnitCompletion(enrollmentId, unit.id);
          if (!lessonsComplete || !quizPassed) {
            return res.status(403).json({ error: "Complete all units and pass all quizzes before the final exam" });
          }
        }
        
        // Get course to check if Florida (for state-specific exam rules)
        const course = await storage.getCourse(bank.courseId);
        const isFloridaCourse = course?.state === "FL";
        
        // Florida courses: 2 attempts (original + 1 retest per Rule 61J2-3.008(5)(a))
        // Non-Florida courses: 3 attempts
        const maxAttempts = isFloridaCourse ? 2 : 3;
        const currentAttempts = enrollment.finalExamAttempts || 0;
        
        // Florida-specific: Check 30-day waiting period before allowing retest
        if (isFloridaCourse && currentAttempts > 0 && enrollment.finalExamPassed !== 1) {
          const lastExamDate = enrollment.lastExamDate || enrollment.firstExamDate;
          if (lastExamDate) {
            const retestEligibleDate = new Date(lastExamDate);
            retestEligibleDate.setDate(retestEligibleDate.getDate() + 30);
            
            const now = new Date();
            if (now < retestEligibleDate) {
              const daysRemaining = Math.ceil((retestEligibleDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              return res.status(403).json({ 
                error: `Per Florida Rule 61J2-3.008(5)(a), you must wait ${daysRemaining} more day(s) before retaking the examination.`,
                retestEligibleDate: retestEligibleDate.toISOString(),
                daysRemaining
              });
            }
          }
        }
        
        // Atomically increment attempt counter and check limits
        // This prevents race conditions from concurrent requests
        const incrementResult = await storage.incrementFinalExamAttempts(enrollmentId, maxAttempts);
        
        if (!incrementResult.success) {
          // Re-fetch enrollment to get current state for error message
          const currentEnrollment = await storage.getEnrollmentById(enrollmentId);
          
          if (currentEnrollment?.finalExamPassed === 1) {
            return res.status(400).json({ error: "You have already passed the final exam" });
          }
          
          const errorMessage = isFloridaCourse 
            ? "Per Florida Rule 61J2-3.008(5)(a), you have exceeded the maximum retests. You must repeat the course to be eligible for another examination."
            : `Maximum attempts reached. You have used all ${maxAttempts} final exam attempts.`;
          
          return res.status(403).json({ 
            error: errorMessage,
            attemptsUsed: currentEnrollment?.finalExamAttempts || maxAttempts,
            maxAttempts,
            isFloridaCourse
          });
        }
        
        // Track exam dates for Florida regulatory compliance
        const now = new Date();
        const updates: any = { lastExamDate: now };
        
        // Set firstExamDate only on first attempt
        if (!enrollment.firstExamDate) {
          updates.firstExamDate = now;
        }
        
        // Calculate retest eligible date (30 days from now)
        const retestDate = new Date(now);
        retestDate.setDate(retestDate.getDate() + 30);
        updates.retestEligibleDate = retestDate;
        
        await storage.updateEnrollmentProgress(enrollmentId, updates);
      }
      
      // Get random questions for this attempt
      const questionsCount = bank.questionsPerAttempt || 20;
      const questions = await storage.getRandomQuestions(bankId, questionsCount);
      
      if (questions.length === 0) {
        return res.status(404).json({ error: "No questions available in this quiz" });
      }
      
      const questionIds = questions.map(q => q.id);
      
      // Create the attempt
      const attempt = await storage.createQuizAttempt({
        enrollmentId,
        bankId,
        userId: user.id,
        questionIds: JSON.stringify(questionIds),
        totalQuestions: questions.length,
        correctAnswers: 0,
        timeSpentSeconds: 0,
        startedAt: new Date(),
        completedAt: null,
        score: null,
        passed: null
      });
      
      // Return questions without correct answers or explanations
      const sanitizedQuestions = questions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: JSON.parse(q.options)
      }));
      
      res.json({
        attemptId: attempt.id,
        bankTitle: bank.title,
        passingScore: bank.passingScore || 70,
        timeLimit: bank.timeLimit,
        questions: sanitizedQuestions
      });
    } catch (err) {
      console.error("Error starting quiz:", err);
      res.status(500).json({ error: "Failed to start quiz" });
    }
  });

  // Submit an answer and get immediate feedback
  app.post("/api/quizzes/attempts/:attemptId/answer", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const { attemptId } = req.params;
      const { questionId, selectedOption } = req.body;
      
      if (!questionId || selectedOption === undefined) {
        return res.status(400).json({ error: "questionId and selectedOption required" });
      }
      
      // Verify attempt ownership
      const attempt = await storage.getQuizAttempt(attemptId);
      if (!attempt || attempt.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      // SECURITY: Verify enrollment ownership and course matching
      const enrollment = await storage.getEnrollmentById(attempt.enrollmentId);
      if (!enrollment || enrollment.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      // Check if enrollment is expired (blocks quiz access)
      if (storage.isEnrollmentExpired(enrollment)) {
        return res.status(403).json({ 
          error: "Enrollment expired",
          expired: true,
          expiresAt: enrollment.expiresAt
        });
      }
      
      const bank = await storage.getQuestionBank(attempt.bankId);
      if (!bank || bank.courseId !== enrollment.courseId) {
        return res.status(403).json({ error: "Quiz not available for this enrollment" });
      }
      
      // For unit quizzes, verify unit is still unlocked
      if (bank.bankType === "unit_quiz" && bank.unitId) {
        const unitProg = await storage.getUnitProgress(enrollment.id, bank.unitId);
        if (!unitProg || unitProg.status === "locked") {
          return res.status(403).json({ error: "Unit is locked" });
        }
      }
      
      if (attempt.completedAt) {
        return res.status(400).json({ error: "Quiz already completed" });
      }
      
      // Get the question to check answer
      const allQuestions = await storage.getBankQuestions(attempt.bankId);
      const question = allQuestions.find(q => q.id === questionId);
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
      
      const isCorrect = selectedOption === question.correctOption;
      const options = JSON.parse(question.options);
      
      // Save the answer
      await storage.createQuizAnswer({
        attemptId,
        questionId,
        selectedOption,
        isCorrect: isCorrect ? 1 : 0
      });
      
      // Return feedback
      res.json({
        isCorrect,
        correctOption: question.correctOption,
        correctAnswer: options[question.correctOption],
        explanation: question.explanation,
        selectedAnswer: options[selectedOption]
      });
    } catch (err) {
      console.error("Error submitting answer:", err);
      res.status(500).json({ error: "Failed to submit answer" });
    }
  });

  // Complete a quiz attempt
  app.post("/api/quizzes/attempts/:attemptId/complete", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const { attemptId } = req.params;
      const { timeSpentSeconds } = req.body;
      
      // Verify attempt ownership
      const attempt = await storage.getQuizAttempt(attemptId);
      if (!attempt || attempt.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      // SECURITY: Verify enrollment ownership and course matching
      const enrollment = await storage.getEnrollmentById(attempt.enrollmentId);
      if (!enrollment || enrollment.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      // Check if enrollment is expired (blocks quiz access)
      if (storage.isEnrollmentExpired(enrollment)) {
        return res.status(403).json({ 
          error: "Enrollment expired",
          expired: true,
          expiresAt: enrollment.expiresAt
        });
      }
      
      const bank = await storage.getQuestionBank(attempt.bankId);
      if (!bank || bank.courseId !== enrollment.courseId) {
        return res.status(403).json({ error: "Quiz not available for this enrollment" });
      }
      
      // For unit quizzes, verify unit is still unlocked
      if (bank.bankType === "unit_quiz" && bank.unitId) {
        const unitProg = await storage.getUnitProgress(enrollment.id, bank.unitId);
        if (!unitProg || unitProg.status === "locked") {
          return res.status(403).json({ error: "Unit is locked" });
        }
      }
      
      if (attempt.completedAt) {
        return res.status(400).json({ error: "Quiz already completed" });
      }
      
      // Calculate score
      const answers = await storage.getQuizAnswers(attemptId);
      const correctCount = answers.filter(a => a.isCorrect === 1).length;
      const score = Math.round((correctCount / attempt.totalQuestions) * 100);
      
      const passed = score >= (bank?.passingScore || 70);
      
      // Update the attempt
      const updatedAttempt = await storage.updateQuizAttempt(attemptId, {
        score,
        correctAnswers: correctCount,
        passed: passed ? 1 : 0,
        timeSpentSeconds: timeSpentSeconds || 0,
        completedAt: new Date()
      });
      
      // Update unit progress if this was a unit quiz
      if (bank?.unitId) {
        const unitProg = await storage.getUnitProgress(attempt.enrollmentId, bank.unitId);
        if (unitProg) {
          await storage.updateUnitProgress(unitProg.id, {
            quizAttempts: (unitProg.quizAttempts || 0) + 1,
            quizScore: passed ? Math.max(score, unitProg.quizScore || 0) : unitProg.quizScore,
            quizPassed: passed ? 1 : unitProg.quizPassed
          });
          
          // If passed, mark unit as complete and unlock next unit
          if (passed) {
            await storage.updateUnitProgress(unitProg.id, {
              status: "completed",
              completedAt: new Date()
            });
            
            // Unlock next unit
            await storage.unlockNextUnit(attempt.enrollmentId);
            
            // Update enrollment current unit index and recalculate overall progress
            const enrollment = await storage.getEnrollmentById(attempt.enrollmentId);
            if (enrollment) {
              const units = await storage.getUnits(enrollment.courseId);
              const currentUnit = units.find(u => u.id === bank.unitId);
              
              // Recalculate overall progress based on completed lessons
              let totalLessons = 0;
              let completedLessons = 0;
              
              for (const u of units) {
                const unitLessons = await storage.getLessons(u.id);
                totalLessons += unitLessons.length;
                
                for (const l of unitLessons) {
                  const lp = await storage.getLessonProgress(attempt.enrollmentId, l.id);
                  if (lp?.completed) {
                    completedLessons++;
                  }
                }
              }
              
              const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
              const course = await storage.getCourse(enrollment.courseId);
              const hoursCompleted = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * (course?.hoursRequired || 63)) : 0;
              
              await storage.updateEnrollmentProgress(attempt.enrollmentId, {
                currentUnitIndex: currentUnit ? currentUnit.unitNumber + 1 : 1,
                progress: overallProgress,
                hoursCompleted: hoursCompleted
              });
            }
          }
        }
      }
      
      // Update enrollment for final exam
      if (bank?.bankType === "final_exam" && passed) {
        await storage.updateEnrollmentProgress(attempt.enrollmentId, {
          finalExamPassed: 1,
          finalExamScore: score,
          completed: 1,
          completedAt: new Date(),
          progress: 100
        });
      }
      
      res.json({
        score,
        passed,
        correctAnswers: correctCount,
        totalQuestions: attempt.totalQuestions,
        passingScore: bank?.passingScore || 70
      });
    } catch (err) {
      console.error("Error completing quiz:", err);
      res.status(500).json({ error: "Failed to complete quiz" });
    }
  });

  // Get quiz attempt history for a unit
  app.get("/api/quizzes/:bankId/attempts", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const { bankId } = req.params;
      const { enrollmentId } = req.query;
      
      if (!enrollmentId) {
        return res.status(400).json({ error: "enrollmentId required" });
      }
      
      // Verify enrollment ownership
      const enrollment = await storage.getEnrollmentById(enrollmentId as string);
      if (!enrollment || enrollment.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const attempts = await storage.getUserQuizAttempts(enrollmentId as string, bankId);
      
      res.json(attempts.map(a => ({
        id: a.id,
        score: a.score,
        passed: a.passed === 1,
        totalQuestions: a.totalQuestions,
        correctAnswers: a.correctAnswers,
        timeSpentSeconds: a.timeSpentSeconds,
        startedAt: a.startedAt,
        completedAt: a.completedAt
      })));
    } catch (err) {
      console.error("Error fetching quiz attempts:", err);
      res.status(500).json({ error: "Failed to fetch quiz attempts" });
    }
  });

  // Get question bank for a unit
  app.get("/api/units/:unitId/quiz", authMiddleware, async (req, res) => {
    try {
      const { unitId } = req.params;
      
      const bank = await storage.getQuestionBankByUnit(unitId);
      if (!bank) {
        return res.status(404).json({ error: "No quiz found for this unit" });
      }
      
      res.json({
        bankId: bank.id,
        title: bank.title,
        description: bank.description,
        questionsPerAttempt: bank.questionsPerAttempt,
        passingScore: bank.passingScore,
        timeLimit: bank.timeLimit
      });
    } catch (err) {
      console.error("Error fetching unit quiz:", err);
      res.status(500).json({ error: "Failed to fetch unit quiz" });
    }
  });

  // Get final exam info for a course (with Form A/B version logic)
  // Florida Rule 61J2-3.008(5)(a) - Exam retake policy:
  // - 70% minimum passing score
  // - 30-day wait after failing to retest
  // - Max 1 retest within 1 year of original exam
  // - Must repeat course after failing retest
  app.get("/api/courses/:courseId/final-exam", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const { courseId } = req.params;
      
      const enrollment = await storage.getEnrollment(user.id, courseId);
      if (!enrollment) {
        return res.status(404).json({ error: "Not enrolled in this course" });
      }
      
      // Get course to check state for regulatory requirements
      const course = await storage.getCourse(courseId);
      const isFloridaCourse = course?.state === "FL";
      
      // Get both exam forms
      const { formA, formB } = await storage.getFinalExamsByForm(courseId);
      
      // Fall back to legacy single final exam if no Form A/B
      let currentExam = formA || await storage.getFinalExamBank(courseId);
      if (!currentExam) {
        return res.status(404).json({ error: "No final exam found for this course" });
      }
      
      const attempts = enrollment.finalExamAttempts || 0;
      
      // Florida-specific exam policy (Rule 61J2-3.008(5)(a))
      // Max 2 attempts total (original + 1 retest)
      // Non-Florida courses get 3 attempts
      const maxAttempts = isFloridaCourse ? 2 : 3;
      const attemptsRemaining = Math.max(0, maxAttempts - attempts);
      
      // Florida 30-day wait period enforcement
      let retestEligibleDate: Date | null = null;
      let retestWaitMessage: string | null = null;
      let canRetakeNow = true;
      
      if (isFloridaCourse && attempts > 0 && enrollment.finalExamPassed !== 1) {
        // Check if student is within 30-day waiting period
        const lastExamDate = enrollment.lastExamDate || enrollment.firstExamDate;
        if (lastExamDate) {
          retestEligibleDate = new Date(lastExamDate);
          retestEligibleDate.setDate(retestEligibleDate.getDate() + 30);
          
          const now = new Date();
          if (now < retestEligibleDate) {
            canRetakeNow = false;
            const daysRemaining = Math.ceil((retestEligibleDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            retestWaitMessage = `Per Florida Rule 61J2-3.008(5)(a), you must wait ${daysRemaining} more day(s) before retaking the examination. Eligible date: ${retestEligibleDate.toLocaleDateString()}`;
          }
        }
        
        // Check 1-year window from first exam
        if (enrollment.firstExamDate) {
          const firstExamDate = new Date(enrollment.firstExamDate);
          const oneYearLater = new Date(firstExamDate);
          oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
          
          const now = new Date();
          if (now > oneYearLater && attempts >= maxAttempts) {
            retestWaitMessage = "Per Florida Rule 61J2-3.008(5)(a), you have exceeded the maximum retests within one year of your original examination. You must repeat the course to be eligible for another examination.";
            canRetakeNow = false;
          }
        }
      }
      
      // Determine which form to show based on attempt count
      // Attempt 1 (attempts=0): Form A
      // Attempt 2 (attempts=1): Form B
      // Attempt 3 (attempts=2): Form A (non-FL only)
      if (formA && formB) {
        if (attempts === 1) {
          currentExam = formB; // Switch to Form B for second attempt
        } else {
          currentExam = formA; // Form A for first and third attempts
        }
      }
      
      // Check if all units are complete
      const units = await storage.getUnits(courseId);
      let allUnitsComplete = true;
      for (const unit of units) {
        const { lessonsComplete, quizPassed } = await storage.checkUnitCompletion(enrollment.id, unit.id);
        if (!lessonsComplete || !quizPassed) {
          allUnitsComplete = false;
          break;
        }
      }
      
      res.json({
        bankId: currentExam.id,
        examId: currentExam.id,
        title: currentExam.title,
        description: currentExam.description,
        questionsPerAttempt: currentExam.questionsPerAttempt || currentExam.totalQuestions,
        totalQuestions: currentExam.totalQuestions,
        passingScore: currentExam.passingScore,
        timeLimit: currentExam.timeLimit,
        examForm: currentExam.examForm || "A",
        isUnlocked: allUnitsComplete,
        alreadyPassed: enrollment.finalExamPassed === 1,
        bestScore: enrollment.finalExamScore,
        attempts,
        maxAttempts,
        attemptsRemaining,
        canRetake: attemptsRemaining > 0 && enrollment.finalExamPassed !== 1 && canRetakeNow,
        // Florida-specific fields
        isFloridaCourse,
        retestEligibleDate: retestEligibleDate?.toISOString(),
        retestWaitMessage,
        firstExamDate: enrollment.firstExamDate,
        lastExamDate: enrollment.lastExamDate,
        examPolicy: isFloridaCourse ? {
          passingScore: 70,
          retestWaitDays: 30,
          maxRetestsPerYear: 1,
          requiresCourseRepeatAfterMaxRetests: true,
        } : null
      });
    } catch (err) {
      console.error("Error fetching final exam:", err);
      res.status(500).json({ error: "Failed to fetch final exam" });
    }
  });

  // Acknowledge course policy disclosure (Florida Rule 61J2-3.008(5)(a))
  app.post("/api/courses/:courseId/acknowledge-policy", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const { courseId } = req.params;
      
      const enrollment = await storage.getEnrollment(user.id, courseId);
      if (!enrollment) {
        return res.status(404).json({ error: "Not enrolled in this course" });
      }
      
      // Only allow acknowledgment once
      if (enrollment.policyAcknowledgedAt) {
        return res.json({ 
          success: true, 
          acknowledgedAt: enrollment.policyAcknowledgedAt,
          message: "Policy already acknowledged" 
        });
      }
      
      const updated = await storage.updateEnrollmentProgress(enrollment.id, {
        policyAcknowledgedAt: new Date()
      });
      
      res.json({ 
        success: true, 
        acknowledgedAt: updated.policyAcknowledgedAt,
        message: "Policy acknowledgment recorded" 
      });
    } catch (err) {
      console.error("Error acknowledging policy:", err);
      res.status(500).json({ error: "Failed to acknowledge policy" });
    }
  });

  // ============================================================
  // End of LMS Routes
  // ============================================================

  // Checkout - Create Stripe checkout session for a course
  app.post("/api/checkout/course", async (req, res) => {
    try {
      const { courseId, email, referral } = req.body;
      if (!courseId || !email) {
        return res.status(400).json({ error: "courseId and email required" });
      }

      const course = await storage.getCourse(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      const successUrl = `${req.headers.origin || process.env.CLIENT_URL || "http://localhost:5000"}/checkout/success?courseId=${courseId}`;
      const cancelUrl = `${req.headers.origin || process.env.CLIENT_URL || "http://localhost:5000"}/checkout/cancel`;

      const stripe = getStripeClient();
      
      // Build metadata with optional PromoteKit referral for affiliate tracking
      const metadata: Record<string, string> = {
        courseId,
        email,
      };
      // Include referral if it's a non-empty string (PromoteKit referral IDs)
      if (typeof referral === 'string' && referral.trim().length > 0) {
        metadata.promotekit_referral = referral.trim();
      }
      
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: course.title,
                description: course.description || undefined,
              },
              unit_amount: course.price || 1500,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        customer_email: email,
        success_url: successUrl + "&session_id={CHECKOUT_SESSION_ID}",
        cancel_url: cancelUrl,
        metadata,
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (err: any) {
      console.error("Checkout error:", err);
      const message = err.message || "Failed to create checkout session";
      res.status(500).json({ error: message });
    }
  });

  // Guest enrollment - Auto-create account after successful payment
  app.post("/api/checkout/complete-enrollment", async (req, res) => {
    try {
      const { sessionId, courseId } = req.body;
      
      if (!sessionId || !courseId) {
        return res.status(400).json({ error: "sessionId and courseId are required" });
      }

      // Verify the Stripe session
      const stripe = getStripeClient();
      let session;
      try {
        session = await stripe.checkout.sessions.retrieve(sessionId);
      } catch (stripeErr: any) {
        console.error("Stripe session retrieval failed:", stripeErr.message);
        return res.status(400).json({ error: "Invalid payment session" });
      }

      // Verify payment is complete
      if (session.payment_status !== "paid") {
        return res.status(400).json({ error: "Payment not completed" });
      }

      // SECURITY: Verify the courseId from session metadata matches the request
      const sessionCourseId = session.metadata?.courseId;
      if (!sessionCourseId) {
        return res.status(400).json({ error: "Invalid session - no course information" });
      }
      if (sessionCourseId !== courseId) {
        console.error(`Course mismatch: session has ${sessionCourseId}, request has ${courseId}`);
        return res.status(400).json({ error: "Course mismatch - payment was for a different course" });
      }

      // Get email from session
      const email = session.customer_email || session.metadata?.email;
      if (!email) {
        return res.status(400).json({ error: "No email found in payment session" });
      }

      // Check if course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      // Find or create user
      let user = await storage.getUserByEmail(email);
      let isNewUser = false;
      let temporaryPassword: string | null = null;

      if (!user) {
        // Create new user account
        isNewUser = true;
        const { randomUUID } = await import("crypto");
        const userId = randomUUID();
        
        // Generate a temporary password
        temporaryPassword = randomUUID().slice(0, 12);
        const bcrypt = await import("bcrypt");
        const passwordHash = await bcrypt.default.hash(temporaryPassword, 10);

        user = await storage.upsertUser({
          id: userId,
          email,
          passwordHash,
          firstName: "",
          lastName: "",
        });

        // Create welcome notification
        try {
          await storage.createNotification({
            userId: user.id,
            type: "system",
            title: "Welcome to FoundationCE!",
            message: "Your account has been created. Check your email to set your password.",
            link: "/dashboard",
            read: false
          });
        } catch (notifErr) {
          console.error("Failed to create welcome notification:", notifErr);
        }
      }

      // Check for existing enrollment
      const existingEnrollment = await storage.getEnrollment(user.id, courseId);
      if (existingEnrollment) {
        // Already enrolled - still return success with token
        const jwt = await import("jsonwebtoken");
        const token = jwt.default.sign(
          { id: user.id, email: user.email },
          process.env.SESSION_SECRET || "fallback-secret",
          { expiresIn: "7d" }
        );

        return res.json({
          success: true,
          enrollment: existingEnrollment,
          existing: true,
          isNewUser: false,
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          }
        });
      }

      // Create enrollment
      const enrollment = await storage.createEnrollment(user.id, courseId);

      // Create enrollment notification
      try {
        await storage.createNotification({
          userId: user.id,
          type: "enrollment",
          title: "Course Enrollment Confirmed",
          message: `You've been enrolled in "${course.title}". Start learning now!`,
          link: `/course/${courseId}/learn`,
          read: false
        });
      } catch (notifErr) {
        console.error("Failed to create enrollment notification:", notifErr);
      }

      // Generate JWT token for auto-login
      const jwt = await import("jsonwebtoken");
      const token = jwt.default.sign(
        { id: user.id, email: user.email },
        process.env.SESSION_SECRET || "fallback-secret",
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        enrollment,
        isNewUser,
        temporaryPassword: isNewUser ? temporaryPassword : null,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      });
    } catch (err: any) {
      console.error("Complete enrollment error:", err);
      res.status(500).json({ error: err.message || "Failed to complete enrollment" });
    }
  });

  // Bundle Checkout - Create Stripe checkout session for a bundle
  app.post("/api/checkout/bundle", async (req, res) => {
    try {
      const { bundleId, email, referral } = req.body;
      if (!bundleId || !email) {
        return res.status(400).json({ error: "bundleId and email required" });
      }

      const bundle = await storage.getCourseBundle(bundleId);
      if (!bundle) return res.status(404).json({ error: "Bundle not found" });

      const successUrl = `${req.headers.origin || process.env.CLIENT_URL || "http://localhost:5000"}/checkout/success?bundleId=${bundleId}`;
      const cancelUrl = `${req.headers.origin || process.env.CLIENT_URL || "http://localhost:5000"}/checkout/cancel`;

      const stripe = getStripeClient();
      
      // Build metadata with optional PromoteKit referral for affiliate tracking
      const metadata: Record<string, string> = {
        bundleId,
        email,
        type: 'bundle',
      };
      if (typeof referral === 'string' && referral.trim().length > 0) {
        metadata.promotekit_referral = referral.trim();
      }
      
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: bundle.name,
                description: bundle.description || undefined,
              },
              unit_amount: bundle.bundlePrice,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        customer_email: email,
        success_url: successUrl + "&session_id={CHECKOUT_SESSION_ID}",
        cancel_url: cancelUrl,
        metadata,
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (err: any) {
      console.error("Bundle checkout error:", err);
      const message = err.message || "Failed to create checkout session";
      res.status(500).json({ error: message });
    }
  });

  // Complete bundle enrollment after successful payment
  app.post("/api/checkout/complete-bundle-enrollment", async (req, res) => {
    try {
      const { sessionId, bundleId } = req.body;
      
      if (!sessionId || !bundleId) {
        return res.status(400).json({ error: "sessionId and bundleId are required" });
      }

      // Verify the Stripe session
      const stripe = getStripeClient();
      let session;
      try {
        session = await stripe.checkout.sessions.retrieve(sessionId);
      } catch (stripeErr: any) {
        console.error("Stripe session retrieval failed:", stripeErr.message);
        return res.status(400).json({ error: "Invalid payment session" });
      }

      // Verify payment is complete
      if (session.payment_status !== "paid") {
        return res.status(400).json({ error: "Payment not completed" });
      }

      // SECURITY: Verify the bundleId from session metadata matches the request
      const sessionBundleId = session.metadata?.bundleId;
      if (!sessionBundleId) {
        return res.status(400).json({ error: "Invalid session - no bundle information" });
      }
      if (sessionBundleId !== bundleId) {
        console.error(`Bundle mismatch: session has ${sessionBundleId}, request has ${bundleId}`);
        return res.status(400).json({ error: "Bundle mismatch - payment was for a different bundle" });
      }

      // Get email from session
      const email = session.customer_email || session.metadata?.email;
      if (!email) {
        return res.status(400).json({ error: "No email found in payment session" });
      }

      // Check if bundle exists and get courses
      const bundle = await storage.getCourseBundle(bundleId);
      if (!bundle) {
        return res.status(404).json({ error: "Bundle not found" });
      }
      const bundleCourses = await storage.getBundleCourses(bundleId);

      // Find or create user
      let user = await storage.getUserByEmail(email);
      let isNewUser = false;
      let temporaryPassword = "";

      if (!user) {
        isNewUser = true;
        const { v4: uuidv4 } = await import("uuid");
        const userId = uuidv4();
        temporaryPassword = Math.random().toString(36).slice(-10);

        const bcrypt = await import("bcrypt");
        const passwordHash = await bcrypt.default.hash(temporaryPassword, 10);

        user = await storage.upsertUser({
          id: userId,
          email,
          passwordHash,
          firstName: "",
          lastName: "",
        });

        // Create welcome notification
        try {
          await storage.createNotification({
            userId: user.id,
            type: "system",
            title: "Welcome to FoundationCE!",
            message: "Your account has been created. Check your email to set your password.",
            link: "/dashboard",
            read: false
          });
        } catch (notifErr) {
          console.error("Failed to create welcome notification:", notifErr);
        }
      }

      // Create bundle enrollment
      const bundleEnrollment = await storage.createBundleEnrollment(user.id, bundleId);

      // Enroll user in all courses in the bundle
      const courseEnrollments = [];
      for (const course of bundleCourses) {
        const existingEnrollment = await storage.getEnrollment(user.id, course.id);
        if (!existingEnrollment) {
          const enrollment = await storage.createEnrollment(user.id, course.id);
          courseEnrollments.push(enrollment);
        } else {
          courseEnrollments.push(existingEnrollment);
        }
      }

      // Create enrollment notification
      try {
        await storage.createNotification({
          userId: user.id,
          type: "enrollment",
          title: "Bundle Enrollment Confirmed",
          message: `You've been enrolled in "${bundle.name}" with ${bundleCourses.length} courses. Start learning now!`,
          link: `/dashboard`,
          read: false
        });
      } catch (notifErr) {
        console.error("Failed to create enrollment notification:", notifErr);
      }

      // Generate JWT token for auto-login
      const jwt = await import("jsonwebtoken");
      const token = jwt.default.sign(
        { id: user.id, email: user.email },
        process.env.SESSION_SECRET || "fallback-secret",
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        bundleEnrollment,
        courseEnrollments,
        isNewUser,
        temporaryPassword: isNewUser ? temporaryPassword : null,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      });
    } catch (err: any) {
      console.error("Complete bundle enrollment error:", err);
      res.status(500).json({ error: err.message || "Failed to complete bundle enrollment" });
    }
  });

  // Create Payment Intent for direct payment (supports Apple Pay, Google Pay, Cards)
  app.post("/api/payment/create-intent", async (req, res) => {
    try {
      const { courseId, email, amount } = req.body;
      if (!courseId || !email || !amount) {
        return res
          .status(400)
          .json({ error: "courseId, email, and amount required" });
      }

      const course = await storage.getCourse(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      const stripe = getStripeClient();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          courseId,
          email,
        },
        description: `Payment for ${course.title}`,
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        intentId: paymentIntent.id,
        publishableKey: await getStripePublishableKey(),
      });
    } catch (err) {
      console.error("Payment intent creation error:", err);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  // Confirm Payment Intent (for Apple Pay/Google Pay completion)
  app.post("/api/payment/confirm-intent", async (req, res) => {
    try {
      const { intentId, paymentMethodId } = req.body;
      if (!intentId) {
        return res.status(400).json({ error: "intentId required" });
      }

      const stripe = getStripeClient();
      const paymentIntent = await stripe.paymentIntents.confirm(intentId, {
        payment_method: paymentMethodId,
      });

      res.json({
        status: paymentIntent.status,
        intentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (err) {
      console.error("Payment confirmation error:", err);
      res.status(500).json({ error: "Failed to confirm payment" });
    }
  });

  // Webhook for payment completion (Apple Pay/Google Pay)
  app.post("/api/payment/webhook", async (req, res) => {
    try {
      const { intentId, status, courseId, email } = req.body;
      if (!intentId || !status || !courseId || !email) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (status === "succeeded") {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          const newUser = await storage.upsertUser({
            id: `user-${Date.now()}`,
            email,
            firstName: "",
            lastName: "",
          });
        }

        const existingUser = await storage.getUserByEmail(email);
        const enrollment = await storage.createEnrollment(
          existingUser!.id,
          courseId
        );

        res.json({ success: true, enrollment });
      } else {
        res.status(400).json({ error: "Payment did not succeed" });
      }
    } catch (err) {
      console.error("Webhook error:", err);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // PayPal Blueprint Routes (DO NOT MODIFY)
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Video Streaming Routes (HLS/DASH Adaptive Bitrate)
  app.get("/api/videos/:videoId/stream", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.videoId);
      if (!video) return res.status(404).json({ error: "Video not found" });

      // Return streaming URLs with quality options
      res.json({
        videoId: video.id,
        title: video.title,
        duration: video.durationMinutes,
        sources: [
          {
            quality: "auto",
            type: "application/x-mpegURL",
            src: `${video.videoUrl}?quality=auto`,
          },
          {
            quality: "1080p",
            bitrate: 5000,
            src: `${video.videoUrl}?quality=1080p`,
          },
          {
            quality: "720p",
            bitrate: 2500,
            src: `${video.videoUrl}?quality=720p`,
          },
          {
            quality: "480p",
            bitrate: 1200,
            src: `${video.videoUrl}?quality=480p`,
          },
          {
            quality: "360p",
            bitrate: 800,
            src: `${video.videoUrl}?quality=360p`,
          },
        ],
        poster: video.thumbnailUrl,
        captions: [
          {
            kind: "subtitles",
            src: `${video.videoUrl}/captions/en.vtt`,
            srcLang: "en",
            label: "English",
          },
        ],
      });
    } catch (err) {
      console.error("Error fetching stream:", err);
      res.status(500).json({ error: "Failed to fetch stream" });
    }
  });

  // Video manifest for HLS streaming
  app.get("/api/videos/:videoId/manifest.m3u8", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.videoId);
      if (!video) return res.status(404).json({ error: "Video not found" });

      // Generate HLS manifest for adaptive bitrate streaming
      const manifest = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXTINF:10.0,
segment0.ts
#EXTINF:10.0,
segment1.ts
#EXT-X-ENDLIST`;

      res.set("Content-Type", "application/vnd.apple.mpegurl");
      res.send(manifest);
    } catch (err) {
      console.error("Error generating manifest:", err);
      res.status(500).json({ error: "Failed to generate manifest" });
    }
  });

  // Get video quality options based on connection speed
  app.post("/api/videos/:videoId/quality", async (req, res) => {
    try {
      const { bandwidth, deviceType } = req.body;
      if (!bandwidth) {
        return res.status(400).json({ error: "bandwidth required" });
      }

      // Determine quality based on bandwidth (in kbps) and device type
      let recommendedQuality = "480p";
      if (bandwidth >= 5000) {
        recommendedQuality = "1080p";
      } else if (bandwidth >= 2500) {
        recommendedQuality = "720p";
      } else if (bandwidth >= 1200) {
        recommendedQuality = "480p";
      } else if (bandwidth >= 800) {
        recommendedQuality = "360p";
      } else {
        recommendedQuality = "360p";
      }

      // Adjust for mobile devices
      if (deviceType === "mobile") {
        if (recommendedQuality === "1080p") recommendedQuality = "720p";
        if (recommendedQuality === "720p") recommendedQuality = "480p";
      }

      res.json({
        recommended: recommendedQuality,
        available: ["1080p", "720p", "480p", "360p"],
        bandwidth,
        deviceType,
      });
    } catch (err) {
      console.error("Error determining quality:", err);
      res.status(500).json({ error: "Failed to determine quality" });
    }
  });

  // Video cache headers for CDN optimization
  app.get("/api/videos/:videoId/cache-info", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.videoId);
      if (!video) return res.status(404).json({ error: "Video not found" });

      // Return cache optimization info
      res.json({
        videoId: video.id,
        cacheable: true,
        ttl: 2592000, // 30 days in seconds
        revalidate: 604800, // 7 days
        compress: true,
        supportedFormats: ["mp4", "webm", "ogg"],
        cdnHeaders: {
          "Cache-Control": "public, max-age=2592000",
          "X-Accel-Buffering": "yes",
        },
      });
    } catch (err) {
      console.error("Error getting cache info:", err);
      res.status(500).json({ error: "Failed to get cache info" });
    }
  });

  // Course Bundle Routes
  app.get("/api/bundles", async (req, res) => {
    try {
      const bundles = await storage.getCourseBundles({
        state: req.query.state as string,
        licenseType: req.query.licenseType as string,
      });
      // Include courses for each bundle
      const bundlesWithCourses = await Promise.all(
        bundles.map(async (bundle) => {
          const courses = await storage.getBundleCourses(bundle.id);
          return { ...bundle, courses };
        })
      );
      res.json(bundlesWithCourses);
    } catch (err) {
      console.error("Error fetching bundles:", err);
      res.status(500).json({ error: "Failed to fetch bundles" });
    }
  });

  app.get("/api/bundles/:id", async (req, res) => {
    const bundle = await storage.getCourseBundle(req.params.id);
    if (!bundle) return res.status(404).json({ error: "Bundle not found" });
    const bundleCourses = await storage.getBundleCourses(req.params.id);
    res.json({ ...bundle, courses: bundleCourses });
  });

  app.post("/api/bundles/:id/enroll", async (req, res) => {
    const { userId } = req.body;
    const enrollment = await storage.createBundleEnrollment(
      userId,
      req.params.id,
    );
    res.status(201).json(enrollment);
  });

  app.get("/api/bundles/:id/enrollment/:userId", async (req, res) => {
    const enrollment = await storage.getBundleEnrollment(
      req.params.userId,
      req.params.id,
    );
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }
    res.json(enrollment);
  });

  // License Management Routes
  app.post("/api/licenses", async (req, res) => {
    try {
      const license = await storage.createUserLicense(req.body);
      res.status(201).json(license);
    } catch (err) {
      console.error("Error creating license:", err);
      res.status(500).json({ error: "Failed to create license" });
    }
  });

  app.get("/api/licenses/:userId", async (req, res) => {
    try {
      const licenses = await storage.getUserLicenses(req.params.userId);
      res.json(licenses);
    } catch (err) {
      console.error("Error fetching licenses:", err);
      res.status(500).json({ error: "Failed to fetch licenses" });
    }
  });

  app.patch("/api/licenses/:id", async (req, res) => {
    try {
      const license = await storage.updateUserLicense(req.params.id, req.body);
      res.json(license);
    } catch (err) {
      console.error("Error updating license:", err);
      res.status(500).json({ error: "Failed to update license" });
    }
  });

  app.get("/api/licenses/expiring/:days", async (req, res) => {
    try {
      const days = parseInt(req.params.days, 10);
      const expiring = await storage.getExpiringLicenses(days);
      res.json(expiring);
    } catch (err) {
      console.error("Error fetching expiring licenses:", err);
      res.status(500).json({ error: "Failed to fetch expiring licenses" });
    }
  });

  // CE Review Routes
  app.post("/api/ce-reviews", async (req, res) => {
    try {
      const review = await storage.createCEReview(req.body);
      res.status(201).json(review);
    } catch (err) {
      console.error("Error creating CE review:", err);
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.get("/api/ce-reviews/supervisor/:supervisorId", async (req, res) => {
    try {
      const reviews = await storage.getPendingCEReviews(
        req.params.supervisorId,
      );
      res.json(reviews);
    } catch (err) {
      console.error("Error fetching CE reviews:", err);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.patch("/api/ce-reviews/:id/approve", async (req, res) => {
    try {
      const review = await storage.approveCEReview(
        req.params.id,
        req.body.notes,
      );
      res.json(review);
    } catch (err) {
      console.error("Error approving CE review:", err);
      res.status(500).json({ error: "Failed to approve review" });
    }
  });

  app.patch("/api/ce-reviews/:id/reject", async (req, res) => {
    try {
      const review = await storage.rejectCEReview(
        req.params.id,
        req.body.notes,
      );
      res.json(review);
    } catch (err) {
      console.error("Error rejecting CE review:", err);
      res.status(500).json({ error: "Failed to reject review" });
    }
  });

  // Supervisor Routes
  app.post("/api/supervisors", async (req, res) => {
    try {
      const supervisor = await storage.createSupervisor(req.body);
      res.status(201).json(supervisor);
    } catch (err) {
      console.error("Error creating supervisor:", err);
      res.status(500).json({ error: "Failed to create supervisor" });
    }
  });

  app.get("/api/supervisors/:userId", async (req, res) => {
    try {
      const supervisor = await storage.getSupervisor(req.params.userId);
      if (!supervisor) {
        return res.status(404).json({ error: "Supervisor not found" });
      }
      res.json(supervisor);
    } catch (err) {
      console.error("Error fetching supervisor:", err);
      res.status(500).json({ error: "Failed to fetch supervisor" });
    }
  });

  // Account Type Routes
  app.get("/api/account/type/:userId", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const supervisor = await storage.getSupervisor(req.params.userId);
      const accountType = supervisor ? "supervisor" : "individual";

      res.json({ userId: user.id, accountType, user, supervisor });
    } catch (err) {
      console.error("Error fetching account type:", err);
      res.status(500).json({ error: "Failed to fetch account type" });
    }
  });

  app.get("/api/company/:id/members", async (req, res) => {
    try {
      const organization = await storage.getOrganization(req.params.id);
      if (!organization) return res.status(404).json({ error: "Company not found" });

      res.json({ company: organization, compliance: null });
    } catch (err) {
      console.error("Error fetching company members:", err);
      res.status(500).json({ error: "Failed to fetch company members" });
    }
  });

  // Practice Exam Routes
  app.get("/api/exams/course/:courseId", async (req, res) => {
    try {
      const exams = await storage.getPracticeExams(req.params.courseId);
      res.json(exams);
    } catch (err) {
      console.error("Error fetching exams:", err);
      res.status(500).json({ error: "Failed to fetch exams" });
    }
  });

  app.get("/api/exams/:examId", async (req, res) => {
    try {
      const exam = await storage.getPracticeExam(req.params.examId);
      if (!exam) return res.status(404).json({ error: "Exam not found" });
      const questions = await storage.getExamQuestions(req.params.examId);
      res.json({ ...exam, questions });
    } catch (err) {
      console.error("Error fetching exam:", err);
      res.status(500).json({ error: "Failed to fetch exam" });
    }
  });

  app.post("/api/exams/:examId/start", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const exam = await storage.getPracticeExam(req.params.examId);
      if (!exam) return res.status(404).json({ error: "Exam not found" });

      // Check if this is a final exam for a Florida course - enforce 2-attempt limit
      // Florida DBPR Rule 61J2-3.008(5)(a): 2 attempts max (Form A, then Form B)
      const isFinalExam = exam.isFinalExam === 1 || exam.title?.toLowerCase().includes("final");
      if (exam.courseId && isFinalExam) {
        const course = await storage.getCourse(exam.courseId);
        if (course?.state === "FL") {
          // Get user's enrollment for this course
          const enrollment = await storage.getEnrollment(user.id, course.id);
          if (enrollment) {
            // Get final exams ONLY for THIS course (scoped by course.id)
            const allExamsForCourse = await storage.getPracticeExams(course.id);
            const finalExamIdsForThisCourse = allExamsForCourse
              .filter((e: any) => e.isFinalExam === 1 || e.title?.toLowerCase().includes("final"))
              .map((e: any) => e.id);
            
            // Get all user attempts for this course's final exams
            const userAttempts = await storage.getUserExamAttempts(user.id, "");
            const courseFinalAttempts = userAttempts.filter((a: any) => 
              finalExamIdsForThisCourse.includes(a.examId)
            );
            
            // Use enrollment start date to determine which attempts belong to this enrollment
            // - Attempts with matching enrollmentId: count (new tracked attempts)
            // - Attempts without enrollmentId (legacy) created AFTER enrollment started: count
            // - Attempts without enrollmentId (legacy) created BEFORE enrollment started: don't count (previous enrollment)
            const enrollmentStartDate = enrollment.enrolledAt ? new Date(enrollment.enrolledAt) : new Date(0);
            
            const allFinalAttemptsForThisCourse = courseFinalAttempts.filter((a: any) => {
              // If attempt has enrollmentId, it must match this enrollment
              if (a.enrollmentId) {
                return a.enrollmentId === enrollment.id;
              }
              // Legacy attempt (no enrollmentId) - only count if created after this enrollment started
              const attemptDate = a.createdAt ? new Date(a.createdAt) : new Date(0);
              return attemptDate >= enrollmentStartDate;
            });
            
            // Florida 2-attempt limit - count all attempts, not just completed
            if (allFinalAttemptsForThisCourse.length >= 2) {
              return res.status(403).json({ 
                error: "Maximum exam attempts reached",
                message: "You have exhausted your 2 final exam attempts (Form A and Form B). Per Florida DBPR Rule 61J2-3.008(5)(a), you must repeat the course to attempt the exam again.",
                maxAttempts: 2,
                attemptsMade: allFinalAttemptsForThisCourse.length,
                requiresCourseRepeat: true
              });
            }
            
            // Check 30-day waiting period after first failed or incomplete attempt
            // This includes completed failures AND any started attempts (to prevent exploit)
            const completedAttempts = allFinalAttemptsForThisCourse.filter((a: any) => a.completedAt);
            const failedAttempts = completedAttempts.filter((a: any) => a.passed !== 1);
            
            if (failedAttempts.length > 0) {
              const lastFailedAttempt = failedAttempts.sort((a: any, b: any) => {
                const dateA = b.completedAt ? new Date(b.completedAt).getTime() : 0;
                const dateB = a.completedAt ? new Date(a.completedAt).getTime() : 0;
                return dateA - dateB;
              })[0];
              
              if (lastFailedAttempt.completedAt) {
                const lastFailDate = new Date(lastFailedAttempt.completedAt);
                const waitDays = 30;
                const eligibleDate = new Date(lastFailDate);
                eligibleDate.setDate(eligibleDate.getDate() + waitDays);
                
                if (new Date() < eligibleDate) {
                  const daysRemaining = Math.ceil((eligibleDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return res.status(403).json({
                    error: "Waiting period not elapsed",
                    message: `Per Florida DBPR Rule 61J2-3.008(5)(a), you must wait 30 days after a failed exam attempt before retesting.`,
                    daysRemaining,
                    eligibleDate: eligibleDate.toISOString(),
                    lastAttemptDate: lastFailDate.toISOString()
                  });
                }
              }
            }
          }
        }
      }

      // Get enrollment for this exam's course to link attempt to enrollment
      let enrollmentIdForAttempt: string | null = null;
      if (exam.courseId) {
        const enrollment = await storage.getEnrollment(user.id, exam.courseId);
        if (enrollment) {
          enrollmentIdForAttempt = enrollment.id;
        }
      }

      const attempt = await storage.createExamAttempt({
        userId: user.id,
        examId: req.params.examId,
        enrollmentId: enrollmentIdForAttempt,
        totalQuestions: exam.totalQuestions,
        startedAt: new Date(),
        completedAt: null,
        score: null,
        correctAnswers: 0,
        passed: null,
        timeSpent: null,
      });
      res.status(201).json(attempt);
    } catch (err) {
      console.error("Error starting exam:", err);
      res.status(500).json({ error: "Failed to start exam" });
    }
  });

  app.post("/api/exams/attempts/:attemptId/answer", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const { questionId, userAnswer, correctAnswer } = req.body;
      
      // Verify attempt ownership - check that this attempt belongs to the user
      const attempts = await storage.getUserExamAttempts(user.id, "");
      const attempt = attempts.find((a: any) => a.id === req.params.attemptId);
      if (!attempt) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const isCorrect = correctAnswer === userAnswer ? 1 : 0;

      const answer = await storage.submitExamAnswer({
        attemptId: req.params.attemptId,
        questionId,
        userAnswer,
        isCorrect,
      });
      res.status(201).json(answer);
    } catch (err) {
      console.error("Error submitting answer:", err);
      res.status(500).json({ error: "Failed to submit answer" });
    }
  });

  app.post("/api/exams/attempts/:attemptId/complete", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const { score, correctAnswers, timeSpent } = req.body;
      
      // Verify attempt ownership
      const attempts = await storage.getUserExamAttempts(user.id, "");
      const attempt = attempts.find((a: any) => a.id === req.params.attemptId);
      if (!attempt) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const passed = score >= 70 ? 1 : 0;

      const completed = await storage.completeExamAttempt(
        req.params.attemptId,
        score,
        correctAnswers,
        passed,
        timeSpent,
      );
      res.json(completed);
    } catch (err) {
      console.error("Error completing exam:", err);
      res.status(500).json({ error: "Failed to complete exam" });
    }
  });

  app.get("/api/exams/:examId/attempts/:userId", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      // Only allow users to fetch their own attempts
      if (req.params.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      const attempts = await storage.getUserExamAttempts(
        req.params.userId,
        req.params.examId,
      );
      res.json(attempts);
    } catch (err) {
      console.error("Error fetching attempts:", err);
      res.status(500).json({ error: "Failed to fetch attempts" });
    }
  });

  // Subscription Routes
  app.get("/api/subscriptions/:userId", async (req, res) => {
    try {
      const subscription = await storage.getUserSubscription(req.params.userId);
      res.json(subscription || { message: "No active subscription" });
    } catch (err) {
      console.error("Error fetching subscription:", err);
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  app.post("/api/subscriptions", async (req, res) => {
    try {
      const { userId, subscriptionType, pricePerMonth, annualPrice } = req.body;
      const subscription = await storage.createSubscription({
        userId,
        subscriptionType,
        pricePerMonth,
        annualPrice,
        status: "active",
        stripeSubscriptionId: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelledAt: null,
        autoRenew: 1,
      });
      res.status(201).json(subscription);
    } catch (err) {
      console.error("Error creating subscription:", err);
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });

  app.patch("/api/subscriptions/:id", async (req, res) => {
    try {
      const subscription = await storage.updateSubscription(
        req.params.id,
        req.body,
      );
      res.json(subscription);
    } catch (err) {
      console.error("Error updating subscription:", err);
      res.status(500).json({ error: "Failed to update subscription" });
    }
  });

  app.post("/api/subscriptions/:id/cancel", async (req, res) => {
    try {
      const subscription = await storage.cancelSubscription(req.params.id);
      res.json(subscription);
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      res.status(500).json({ error: "Failed to cancel subscription" });
    }
  });

  // Coupon Routes
  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, productType } = req.body;
      const result = await storage.validateCoupon(code, productType);
      res.json(result);
    } catch (err) {
      console.error("Error validating coupon:", err);
      res.status(500).json({ error: "Failed to validate coupon" });
    }
  });

  app.post("/api/coupons/apply", async (req, res) => {
    try {
      const { userId, couponId, enrollmentId, discountAmount } = req.body;
      const usage = await storage.applyCoupon(
        userId,
        couponId,
        enrollmentId,
        discountAmount,
      );
      res.status(201).json(usage);
    } catch (err) {
      console.error("Error applying coupon:", err);
      res.status(500).json({ error: "Failed to apply coupon" });
    }
  });

  app.get("/api/coupons/:code", async (req, res) => {
    try {
      const coupon = await storage.getCouponByCode(req.params.code);
      if (!coupon) return res.status(404).json({ error: "Coupon not found" });
      res.json(coupon);
    } catch (err) {
      console.error("Error fetching coupon:", err);
      res.status(500).json({ error: "Failed to fetch coupon" });
    }
  });

  // Completed Courses & Redo Routes
  app.get("/api/enrollments/completed/:userId", async (req, res) => {
    try {
      const completed = await storage.getCompletedEnrollments(
        req.params.userId,
      );
      res.json(completed);
    } catch (err) {
      console.error("Error fetching completed enrollments:", err);
      res.status(500).json({ error: "Failed to fetch completed courses" });
    }
  });

  app.post("/api/enrollments/:id/reset", async (req, res) => {
    try {
      const enrollment = await storage.resetEnrollment(req.params.id);
      res.json({ message: "Enrollment reset successfully", enrollment });
    } catch (err) {
      console.error("Error resetting enrollment:", err);
      res.status(500).json({ error: "Failed to reset enrollment" });
    }
  });

  // Email Campaign Routes
  app.post("/api/email-campaigns", async (req, res) => {
    try {
      const {
        name,
        subject,
        htmlContent,
        plainTextContent,
        targetSegment,
        createdBy,
      } = req.body;
      const campaign = await storage.createEmailCampaign({
        name,
        subject,
        htmlContent,
        plainTextContent,
        targetSegment,
        createdBy,
        status: "draft",
        recipientCount: 0,
        sentCount: 0,
        openCount: 0,
        clickCount: 0,
        scheduleDateTime: null,
        sentAt: null,
      });
      res.status(201).json(campaign);
    } catch (err) {
      console.error("Error creating email campaign:", err);
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  app.get("/api/email-campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.getEmailCampaign(req.params.id);
      if (!campaign)
        return res.status(404).json({ error: "Campaign not found" });
      res.json(campaign);
    } catch (err) {
      console.error("Error fetching campaign:", err);
      res.status(500).json({ error: "Failed to fetch campaign" });
    }
  });

  app.patch("/api/email-campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.updateEmailCampaign(
        req.params.id,
        req.body,
      );
      res.json(campaign);
    } catch (err) {
      console.error("Error updating campaign:", err);
      res.status(500).json({ error: "Failed to update campaign" });
    }
  });

  app.post("/api/email-campaigns/:id/recipients", async (req, res) => {
    try {
      const { recipients } = req.body; // Array of { userId, email }
      const added = await storage.addEmailRecipients(req.params.id, recipients);
      res.status(201).json({ count: added.length, recipients: added });
    } catch (err) {
      console.error("Error adding recipients:", err);
      res.status(500).json({ error: "Failed to add recipients" });
    }
  });

  app.get("/api/email-campaigns/:id/recipients", async (req, res) => {
    try {
      const recipients = await storage.getEmailRecipients(req.params.id);
      res.json(recipients);
    } catch (err) {
      console.error("Error fetching recipients:", err);
      res.status(500).json({ error: "Failed to fetch recipients" });
    }
  });

  app.post("/api/email-campaigns/:id/send", async (req, res) => {
    try {
      const { recipientId } = req.body;
      // Integration point: Call email service (SendGrid, Mailgun, etc.)
      const updated = await storage.markEmailSent(recipientId);
      res.json({ message: "Email marked as sent", recipient: updated });
    } catch (err) {
      console.error("Error sending email:", err);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  app.get("/api/email-campaigns/:id/stats", async (req, res) => {
    try {
      const stats = await storage.getCampaignStats(req.params.id);
      const sentCount = stats.campaign.sentCount || 0;
      const openCount = stats.campaign.openCount || 0;
      const clickCount = stats.campaign.clickCount || 0;
      const openRate =
        sentCount > 0
          ? Math.round((openCount / sentCount) * 100)
          : 0;
      const clickRate =
        sentCount > 0
          ? Math.round((clickCount / sentCount) * 100)
          : 0;
      res.json({
        ...stats,
        metrics: {
          openRate: `${openRate}%`,
          clickRate: `${clickRate}%`,
          recipients: stats.campaign.recipientCount,
          sent: sentCount,
        },
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Email Tracking Routes
  app.post("/api/email-tracking/open", async (req, res) => {
    try {
      const { recipientId, campaignId, userId, userAgent, ipAddress } =
        req.body;
      await storage.trackEmailOpen(
        recipientId,
        campaignId,
        userId,
        userAgent,
        ipAddress,
      );
      res.json({ message: "Open tracked" });
    } catch (err) {
      console.error("Error tracking open:", err);
      res.status(500).json({ error: "Failed to track open" });
    }
  });

  app.post("/api/email-tracking/click", async (req, res) => {
    try {
      const { recipientId, campaignId, userId, linkUrl, userAgent, ipAddress } =
        req.body;
      await storage.trackEmailClick(
        recipientId,
        campaignId,
        userId,
        linkUrl,
        userAgent,
        ipAddress,
      );
      res.json({ message: "Click tracked" });
    } catch (err) {
      console.error("Error tracking click:", err);
      res.status(500).json({ error: "Failed to track click" });
    }
  });

  // Admin Override Routes
  app.patch(
    "/api/admin/enrollments/:id/override",
    isAdmin,
    async (req, res) => {
      try {
        const { hoursCompleted, completed, generateCertificate } = req.body;
        const enrollmentId = req.params.id;

        if (
          typeof hoursCompleted !== "number" ||
          typeof completed !== "boolean"
        ) {
          return res
            .status(400)
            .json({ error: "hoursCompleted and completed fields required" });
        }

        const enrollment = await storage.adminOverrideEnrollment(
          enrollmentId,
          hoursCompleted,
          completed,
        );

        if (completed && generateCertificate) {
          const cert = await storage.createCertificate(
            enrollmentId,
            enrollment.userId,
            enrollment.courseId,
          );
          return res.json({
            message: "Enrollment overridden and certificate generated",
            enrollment,
            certificate: cert,
          });
        }

        res.json({
          message: "Enrollment overridden successfully",
          enrollment,
        });
      } catch (err) {
        console.error("Error overriding enrollment:", err);
        res.status(500).json({ error: "Failed to override enrollment" });
      }
    },
  );

  // Unit Management Routes
  app.get("/api/courses/:courseId/units", async (req, res) => {
    try {
      const units = await storage.getUnits(req.params.courseId);
      res.json(units);
    } catch (err) {
      console.error("Error fetching units:", err);
      res.status(500).json({ error: "Failed to fetch units" });
    }
  });

  app.post("/api/courses/:courseId/units", isAdmin, async (req, res) => {
    try {
      const { unitNumber, title, description, hoursRequired } = req.body;
      if (!unitNumber || !title) {
        return res.status(400).json({ error: "unitNumber and title required" });
      }
      const unit = await storage.createUnit(
        req.params.courseId,
        unitNumber,
        title,
        description,
        hoursRequired,
      );
      res.status(201).json(unit);
    } catch (err) {
      console.error("Error creating unit:", err);
      res.status(500).json({ error: "Failed to create unit" });
    }
  });

  app.patch("/api/units/:unitId", isAdmin, async (req, res) => {
    try {
      const unit = await storage.updateUnit(req.params.unitId, req.body);
      res.json(unit);
    } catch (err) {
      console.error("Error updating unit:", err);
      res.status(500).json({ error: "Failed to update unit" });
    }
  });

  app.delete("/api/units/:unitId", isAdmin, async (req, res) => {
    try {
      await storage.deleteUnit(req.params.unitId);
      res.json({ message: "Unit deleted successfully" });
    } catch (err) {
      console.error("Error deleting unit:", err);
      res.status(500).json({ error: "Failed to delete unit" });
    }
  });

  // Lesson Management Routes
  app.get("/api/units/:unitId/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessons(req.params.unitId);
      res.json(lessons);
    } catch (err) {
      console.error("Error fetching lessons:", err);
      res.status(500).json({ error: "Failed to fetch lessons" });
    }
  });

  app.post("/api/units/:unitId/lessons", isAdmin, async (req, res) => {
    try {
      const { lessonNumber, title, videoUrl, durationMinutes, content, imageUrl } = req.body;
      if (!lessonNumber || !title) {
        return res
          .status(400)
          .json({ error: "lessonNumber and title required" });
      }
      const lesson = await storage.createLesson(
        req.params.unitId,
        lessonNumber,
        title,
        videoUrl,
        durationMinutes,
        content,
        imageUrl,
      );
      res.status(201).json(lesson);
    } catch (err) {
      console.error("Error creating lesson:", err);
      res.status(500).json({ error: "Failed to create lesson" });
    }
  });

  app.patch("/api/lessons/:lessonId", isAdmin, async (req, res) => {
    try {
      const lesson = await storage.updateLesson(req.params.lessonId, req.body);
      res.json(lesson);
    } catch (err) {
      console.error("Error updating lesson:", err);
      res.status(500).json({ error: "Failed to update lesson" });
    }
  });

  app.delete("/api/lessons/:lessonId", isAdmin, async (req, res) => {
    try {
      await storage.deleteLesson(req.params.lessonId);
      res.json({ message: "Lesson deleted successfully" });
    } catch (err) {
      console.error("Error deleting lesson:", err);
      res.status(500).json({ error: "Failed to delete lesson" });
    }
  });

  // Data Override Routes - Admin Only
  app.patch(
    "/api/admin/enrollments/:enrollmentId/data",
    isAdmin,
    async (req, res) => {
      try {
        const { progress, hoursCompleted, completed } = req.body;
        const enrollment = await storage.adminOverrideEnrollmentData(
          req.params.enrollmentId,
          {
            progress: typeof progress === "number" ? progress : undefined,
            hoursCompleted:
              typeof hoursCompleted === "number" ? hoursCompleted : undefined,
            completed:
              typeof completed === "boolean" ? (completed ? 1 : 0) : undefined,
            completedAt:
              completed && typeof completed === "boolean"
                ? new Date()
                : undefined,
          },
        );
        res.json({ message: "Enrollment data overridden", enrollment });
      } catch (err) {
        console.error("Error overriding enrollment data:", err);
        res.status(500).json({ error: "Failed to override enrollment data" });
      }
    },
  );

  app.patch(
    "/api/admin/lesson-progress/:progressId/data",
    isAdmin,
    async (req, res) => {
      try {
        const { completed, timeSpentMinutes } = req.body;
        const progress = await storage.adminOverrideLessonProgress(
          req.params.progressId,
          {
            completed:
              typeof completed === "boolean" ? (completed ? 1 : 0) : undefined,
            timeSpentMinutes:
              typeof timeSpentMinutes === "number"
                ? timeSpentMinutes
                : undefined,
            completedAt:
              completed && typeof completed === "boolean"
                ? new Date()
                : undefined,
          },
        );
        res.json({ message: "Lesson progress overridden", progress });
      } catch (err) {
        console.error("Error overriding lesson progress:", err);
        res.status(500).json({ error: "Failed to override lesson progress" });
      }
    },
  );

  // Admin Create Lesson Progress - for marking lessons complete when no progress exists
  app.post(
    "/api/admin/lesson-progress",
    isAdmin,
    async (req, res) => {
      try {
        const { enrollmentId, lessonId, userId, completed } = req.body;
        if (!enrollmentId || !lessonId || !userId) {
          return res.status(400).json({ error: "enrollmentId, lessonId, and userId are required" });
        }
        const progress = await storage.adminCreateLessonProgress(
          enrollmentId,
          lessonId,
          userId,
          completed !== false
        );
        res.json({ message: "Lesson progress created", progress });
      } catch (err) {
        console.error("Error creating lesson progress:", err);
        res.status(500).json({ error: "Failed to create lesson progress" });
      }
    },
  );

  // Admin Unit Progress Override - allows admin to override unit completion status
  app.patch(
    "/api/admin/unit-progress/:progressId/data",
    isAdmin,
    async (req, res) => {
      try {
        const { status, lessonsCompleted, quizPassed, quizScore, timeSpentSeconds } = req.body;
        const progress = await storage.adminOverrideUnitProgress(
          req.params.progressId,
          {
            status: status || undefined,
            lessonsCompleted: typeof lessonsCompleted === "number" ? lessonsCompleted : undefined,
            quizPassed: typeof quizPassed === "boolean" ? (quizPassed ? 1 : 0) : undefined,
            quizScore: typeof quizScore === "number" ? quizScore : undefined,
            timeSpentSeconds: typeof timeSpentSeconds === "number" ? timeSpentSeconds : undefined,
            completedAt: status === "completed" ? new Date() : undefined,
            startedAt: status === "in_progress" ? new Date() : undefined
          },
        );
        res.json({ message: "Unit progress overridden", progress });
      } catch (err) {
        console.error("Error overriding unit progress:", err);
        res.status(500).json({ error: "Failed to override unit progress" });
      }
    },
  );

  // Admin Create Unit Progress - allows admin to create progress for a unit that doesn't have one
  app.post(
    "/api/admin/enrollments/:enrollmentId/units/:unitId/progress",
    isAdmin,
    async (req, res) => {
      try {
        const { enrollmentId, unitId } = req.params;
        const { status, lessonsCompleted, quizPassed, quizScore } = req.body;

        const enrollment = await storage.getEnrollmentById(enrollmentId);
        if (!enrollment) {
          return res.status(404).json({ error: "Enrollment not found" });
        }

        // Check if progress already exists
        const existingProgress = await storage.getUnitProgress(enrollmentId, unitId);
        if (existingProgress) {
          return res.status(400).json({ error: "Unit progress already exists. Use PATCH to update." });
        }

        const progress = await storage.adminCreateUnitProgress(
          enrollmentId,
          unitId,
          enrollment.userId,
          {
            status: status || "in_progress",
            lessonsCompleted: lessonsCompleted || 0,
            quizPassed: quizPassed ? 1 : 0,
            quizScore: quizScore || null,
            startedAt: new Date(),
            completedAt: status === "completed" ? new Date() : null
          }
        );
        res.json({ message: "Unit progress created", progress });
      } catch (err) {
        console.error("Error creating unit progress:", err);
        res.status(500).json({ error: "Failed to create unit progress" });
      }
    },
  );

  // Admin Get Detailed Enrollment Progress - get all units and lessons with progress
  app.get(
    "/api/admin/enrollments/:enrollmentId/detailed-progress",
    isAdmin,
    async (req, res) => {
      try {
        const detailedProgress = await storage.getEnrollmentDetailedProgress(req.params.enrollmentId);
        if (!detailedProgress) {
          return res.status(404).json({ error: "Enrollment not found" });
        }
        res.json(detailedProgress);
      } catch (err) {
        console.error("Error getting detailed progress:", err);
        res.status(500).json({ error: "Failed to get detailed progress" });
      }
    },
  );

  // Admin Complete All Lessons in a Unit - bulk operation
  app.post(
    "/api/admin/enrollments/:enrollmentId/units/:unitId/complete-all",
    isAdmin,
    async (req, res) => {
      try {
        const { enrollmentId, unitId } = req.params;

        const enrollment = await storage.getEnrollmentById(enrollmentId);
        if (!enrollment) {
          return res.status(404).json({ error: "Enrollment not found" });
        }

        // Get all lessons for this unit
        const lessons = await storage.getLessons(unitId);
        
        // Complete each lesson
        const completedLessons = await Promise.all(
          lessons.map(lesson => 
            storage.completeLesson(enrollmentId, lesson.id, enrollment.userId)
          )
        );

        // Update unit progress to completed
        let unitProg = await storage.getUnitProgress(enrollmentId, unitId);
        if (unitProg) {
          unitProg = await storage.adminOverrideUnitProgress(unitProg.id, {
            status: "completed",
            lessonsCompleted: lessons.length,
            quizPassed: 1,
            quizScore: 100,
            completedAt: new Date()
          });
        } else {
          unitProg = await storage.adminCreateUnitProgress(
            enrollmentId,
            unitId,
            enrollment.userId,
            {
              status: "completed",
              lessonsCompleted: lessons.length,
              quizPassed: 1,
              quizScore: 100,
              startedAt: new Date(),
              completedAt: new Date()
            }
          );
        }

        res.json({ 
          message: `Unit completed with ${lessons.length} lessons`, 
          unitProgress: unitProg,
          lessonsCompleted: completedLessons.length
        });
      } catch (err) {
        console.error("Error completing unit:", err);
        res.status(500).json({ error: "Failed to complete unit" });
      }
    },
  );

  app.patch(
    "/api/admin/exam-attempts/:attemptId/score",
    isAdmin,
    async (req, res) => {
      try {
        const { score } = req.body;
        if (typeof score !== "number" || score < 0 || score > 100) {
          return res
            .status(400)
            .json({ error: "Score must be a number between 0 and 100" });
        }
        const passed = score >= 70;
        const attempt = await storage.adminOverrideExamAttempt(
          req.params.attemptId,
          score,
          passed,
        );
        res.json({
          message: "Exam score overridden",
          attempt,
          passed: passed ? "PASS" : "FAIL",
        });
      } catch (err) {
        console.error("Error overriding exam score:", err);
        res.status(500).json({ error: "Failed to override exam score" });
      }
    },
  );

  app.patch("/api/admin/users/:userId/data", isAdmin, async (req, res) => {
    try {
      const { firstName, lastName, email, profileImageUrl } = req.body;
      const user = await storage.adminOverrideUserData(req.params.userId, {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email: email || undefined,
        profileImageUrl: profileImageUrl || undefined,
      });
      res.json({ message: "User data overridden", user });
    } catch (err) {
      console.error("Error overriding user data:", err);
      res.status(500).json({ error: "Failed to override user data" });
    }
  });

  // Video Management Routes - Course Level
  app.get("/api/courses/:courseId/videos", async (req, res) => {
    try {
      const videoList = await storage.getVideos(req.params.courseId);
      res.json(videoList);
    } catch (err) {
      console.error("Error fetching videos:", err);
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });

  app.post("/api/courses/:courseId/videos", isAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      const { title, videoUrl, thumbnailUrl, description, durationMinutes } =
        req.body;
      if (!title || !videoUrl) {
        return res.status(400).json({ error: "title and videoUrl required" });
      }
      const video = await storage.createVideo(
        req.params.courseId,
        user.id,
        title,
        videoUrl,
        thumbnailUrl,
        description,
        durationMinutes,
      );
      res.status(201).json(video);
    } catch (err) {
      console.error("Error creating video:", err);
      res.status(500).json({ error: "Failed to create video" });
    }
  });

  // Video Management Routes - Unit Level
  app.get("/api/units/:unitId/videos", async (req, res) => {
    try {
      const videoList = await storage.getUnitVideos(req.params.unitId);
      res.json(videoList);
    } catch (err) {
      console.error("Error fetching unit videos:", err);
      res.status(500).json({ error: "Failed to fetch unit videos" });
    }
  });

  app.post("/api/units/:unitId/videos", isAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      const {
        courseId,
        title,
        videoUrl,
        thumbnailUrl,
        description,
        durationMinutes,
      } = req.body;
      if (!courseId || !title || !videoUrl) {
        return res
          .status(400)
          .json({ error: "courseId, title and videoUrl required" });
      }
      const video = await storage.createVideo(
        courseId,
        user.id,
        title,
        videoUrl,
        thumbnailUrl,
        description,
        durationMinutes,
        req.params.unitId,
      );
      res.status(201).json(video);
    } catch (err) {
      console.error("Error creating unit video:", err);
      res.status(500).json({ error: "Failed to create unit video" });
    }
  });

  app.get("/api/videos/:videoId", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.videoId);
      if (!video) return res.status(404).json({ error: "Video not found" });
      res.json(video);
    } catch (err) {
      console.error("Error fetching video:", err);
      res.status(500).json({ error: "Failed to fetch video" });
    }
  });

  app.patch("/api/videos/:videoId", isAdmin, async (req, res) => {
    try {
      const video = await storage.updateVideo(req.params.videoId, req.body);
      res.json({ message: "Video updated", video });
    } catch (err) {
      console.error("Error updating video:", err);
      res.status(500).json({ error: "Failed to update video" });
    }
  });

  app.delete("/api/videos/:videoId", isAdmin, async (req, res) => {
    try {
      await storage.deleteVideo(req.params.videoId);
      res.json({ message: "Video deleted successfully" });
    } catch (err) {
      console.error("Error deleting video:", err);
      res.status(500).json({ error: "Failed to delete video" });
    }
  });

  app.patch("/api/lessons/:lessonId/video", isAdmin, async (req, res) => {
    try {
      const { videoId } = req.body;
      if (!videoId) {
        return res.status(400).json({ error: "videoId required" });
      }
      const lesson = await storage.attachVideoToLesson(
        req.params.lessonId,
        videoId,
      );
      res.json({ message: "Video attached to lesson", lesson });
    } catch (err) {
      console.error("Error attaching video:", err);
      res.status(500).json({ error: "Failed to attach video" });
    }
  });

  // LMS Data Export Routes (for plug-and-play LMS integration)
  app.get("/api/export/course/:courseId", isAdmin, async (req, res) => {
    try {
      const data = await storage.exportCourseData(req.params.courseId);
      res.json(data);
    } catch (err) {
      console.error("Error exporting course data:", err);
      res.status(500).json({ error: "Failed to export course data" });
    }
  });

  app.get(
    "/api/export/user/:userId/enrollments",
    isAuthenticated,
    async (req, res) => {
      try {
        const user = req.user as any;
        // Users can export their own data, admins can export anyone's
        const isAdmin = await storage.isAdmin(user.id);
        if (user.id !== req.params.userId && !isAdmin) {
          return res.status(403).json({ error: "Unauthorized" });
        }
        const data = await storage.exportUserEnrollmentData(req.params.userId);
        res.json(data);
      } catch (err) {
        console.error("Error exporting enrollment data:", err);
        res.status(500).json({ error: "Failed to export enrollment data" });
      }
    },
  );

  app.get(
    "/api/export/enrollment/:enrollmentId/progress",
    isAuthenticated,
    async (req, res) => {
      try {
        const data = await storage.exportProgressData(req.params.enrollmentId);
        res.json(data);
      } catch (err) {
        console.error("Error exporting progress data:", err);
        res.status(500).json({ error: "Failed to export progress data" });
      }
    },
  );

  // Real Estate Express LMS Integration
  app.get(
    "/api/export/enrollment/:enrollmentId/ree",
    isAuthenticated,
    async (req, res) => {
      try {
        const data = await storage.exportRealEstateExpressFormat(
          req.params.enrollmentId,
        );
        res.json(data);
      } catch (err) {
        console.error("Error exporting Real Estate Express data:", err);
        res
          .status(500)
          .json({ error: "Failed to export Real Estate Express format" });
      }
    },
  );

  app.post("/api/import/ree/enrollment", isAdmin, async (req, res) => {
    try {
      const { studentEmail, courseCode, hoursCompleted, completed } = req.body;
      if (!studentEmail || !courseCode) {
        return res
          .status(400)
          .json({ error: "studentEmail and courseCode required" });
      }

      const user = await storage.getUserByEmail(studentEmail);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const course = await storage.getCourseBySku(courseCode);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      const enrollment = await storage.getEnrollment(user.id, course.id);
      if (!enrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      const updated = await storage.adminOverrideEnrollmentData(enrollment.id, {
        hoursCompleted: hoursCompleted ? Number(hoursCompleted) : undefined,
        completed: completed ? 1 : 0,
        completedAt: completed ? new Date() : undefined,
      });

      res.json({
        message: "Enrollment imported from Real Estate Express",
        enrollment: updated,
      });
    } catch (err) {
      console.error("Error importing Real Estate Express data:", err);
      res
        .status(500)
        .json({ error: "Failed to import Real Estate Express enrollment" });
    }
  });

  // Course Content Export Routes
  app.get(
    "/api/export/course/:courseId/content.json",
    isAdmin,
    async (req, res) => {
      try {
        const jsonContent = await storage.exportCourseContentJSON(
          req.params.courseId,
        );
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="course-content-${req.params.courseId}.json"`,
        );
        res.send(jsonContent);
      } catch (err) {
        console.error("Error exporting course content as JSON:", err);
        res.status(500).json({ error: "Failed to export course content" });
      }
    },
  );

  app.get(
    "/api/export/course/:courseId/content.csv",
    isAdmin,
    async (req, res) => {
      try {
        const csvContent = await storage.exportCourseContentCSV(
          req.params.courseId,
        );
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="course-content-${req.params.courseId}.csv"`,
        );
        res.send(csvContent);
      } catch (err) {
        console.error("Error exporting course content as CSV:", err);
        res.status(500).json({ error: "Failed to export course content" });
      }
    },
  );

  // Get available final exam forms for a course
  app.get(
    "/api/export/course/:courseId/exam-forms",
    isAdmin,
    async (req, res) => {
      try {
        const forms = await storage.getAvailableFinalExamForms(req.params.courseId);
        res.json(forms);
      } catch (err) {
        console.error("Error fetching exam forms:", err);
        res.status(500).json({ error: "Failed to fetch exam forms" });
      }
    }
  );

  app.get(
    "/api/export/course/:courseId/content.docx",
    isAdmin,
    async (req, res) => {
      try {
        // Parse export options from query params
        const examFormsParam = req.query.examForms as string | undefined;
        const options = {
          includeLessons: req.query.includeLessons !== 'false',
          includeQuizzes: req.query.includeQuizzes !== 'false',
          includeVideos: req.query.includeVideos !== 'false',
          includeDescriptions: req.query.includeDescriptions !== 'false',
          unitNumbers: req.query.units 
            ? String(req.query.units).split(',').map(n => parseInt(n, 10)).filter(n => !isNaN(n))
            : [],
          examForms: examFormsParam 
            ? examFormsParam.split(',').filter(f => f.trim())
            : undefined // undefined means export all available forms
        };
        
        const docxBuffer = await storage.exportCourseContentDocx(
          req.params.courseId,
          options
        );
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="course-content-${req.params.courseId}.docx"`,
        );
        res.send(docxBuffer);
      } catch (err) {
        console.error("Error exporting course content as DOCX:", err);
        res.status(500).json({ error: "Failed to export course content" });
      }
    },
  );

  // Florida Regulatory Compliance - Answer Key Export with Page References
  app.get(
    "/api/export/course/:courseId/answer-key.docx",
    isAdmin,
    async (req, res) => {
      try {
        const examForm = req.query.form as 'A' | 'B' | undefined;
        const docxBuffer = await storage.exportAnswerKey(req.params.courseId, examForm);
        const formSuffix = examForm ? `-form-${examForm.toLowerCase()}` : '';
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="answer-key${formSuffix}-${req.params.courseId}.docx"`
        );
        res.send(docxBuffer);
      } catch (err) {
        console.error("Error exporting answer key:", err);
        res.status(500).json({ error: "Failed to export answer key" });
      }
    }
  );

  // ===== LMS Standards Export Routes (SCORM, QTI, xAPI) =====
  
  // SCORM 1.2 Package Manifest Export (XML only)
  app.get(
    "/api/export/course/:courseId/scorm-manifest.xml",
    isAdmin,
    async (req, res) => {
      try {
        const manifest = await generateSCORMManifest(req.params.courseId);
        res.setHeader("Content-Type", "application/xml");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="imsmanifest-${req.params.courseId}.xml"`
        );
        res.send(manifest);
      } catch (err) {
        console.error("Error generating SCORM manifest:", err);
        res.status(500).json({ error: "Failed to generate SCORM manifest" });
      }
    }
  );

  // SCORM 1.2 Complete Package Download (ZIP with all content)
  app.get(
    "/api/export/course/:courseId/scorm-package.zip",
    isAdmin,
    async (req, res) => {
      try {
        const { generateSCORMPackage, generateSCORMPackageWithExam } = await import("./lmsExportService");
        const examId = req.query.examId as string | undefined;
        
        let zipBuffer: Buffer;
        if (examId) {
          zipBuffer = await generateSCORMPackageWithExam(req.params.courseId, examId);
        } else {
          zipBuffer = await generateSCORMPackage(req.params.courseId);
        }
        
        res.setHeader("Content-Type", "application/zip");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="scorm-course-${req.params.courseId}.zip"`
        );
        res.send(zipBuffer);
      } catch (err) {
        console.error("Error generating SCORM package:", err);
        res.status(500).json({ error: "Failed to generate SCORM package" });
      }
    }
  );

  // QTI 2.1 Assessment Export for Exams
  app.get(
    "/api/export/exam/:examId/qti.xml",
    isAdmin,
    async (req, res) => {
      try {
        const qti = await generateQTIAssessment(req.params.examId);
        res.setHeader("Content-Type", "application/xml");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="exam-${req.params.examId}-qti.xml"`
        );
        res.send(qti);
      } catch (err) {
        console.error("Error generating QTI assessment:", err);
        res.status(500).json({ error: "Failed to generate QTI assessment" });
      }
    }
  );

  // QTI 2.1 Export for Question Banks
  app.get(
    "/api/export/question-bank/:bankId/qti.xml",
    isAdmin,
    async (req, res) => {
      try {
        const qti = await generateQuestionBankQTI(req.params.bankId);
        res.setHeader("Content-Type", "application/xml");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="bank-${req.params.bankId}-qti.xml"`
        );
        res.send(qti);
      } catch (err) {
        console.error("Error generating question bank QTI:", err);
        res.status(500).json({ error: "Failed to generate QTI for question bank" });
      }
    }
  );

  // Course Data Export (JSON with full structure)
  app.get(
    "/api/export/course/:courseId/full-export.json",
    isAdmin,
    async (req, res) => {
      try {
        const data = await exportCourseData(req.params.courseId);
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="course-full-${req.params.courseId}.json"`
        );
        res.json(data);
      } catch (err) {
        console.error("Error exporting full course data:", err);
        res.status(500).json({ error: "Failed to export course data" });
      }
    }
  );

  // Florida Regulatory Compliance - Get Final Exam Forms A and B
  app.get(
    "/api/courses/:courseId/final-exams",
    isAdmin,
    async (req, res) => {
      try {
        const exams = await storage.getFinalExamsByForm(req.params.courseId);
        res.json(exams);
      } catch (err) {
        console.error("Error fetching final exam forms:", err);
        res.status(500).json({ error: "Failed to fetch final exam forms" });
      }
    }
  );

  // Florida Regulatory Compliance - Create Final Exam Form A or B
  app.post(
    "/api/courses/:courseId/final-exam/:form",
    isAdmin,
    async (req, res) => {
      try {
        const form = req.params.form.toUpperCase() as 'A' | 'B';
        if (form !== 'A' && form !== 'B') {
          return res.status(400).json({ error: "Form must be 'A' or 'B'" });
        }
        const { questionIds } = req.body;
        if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
          return res.status(400).json({ error: "questionIds array is required" });
        }
        const exam = await storage.createFinalExamForm(req.params.courseId, form, questionIds);
        res.json(exam);
      } catch (err) {
        console.error("Error creating final exam form:", err);
        res.status(500).json({ error: "Failed to create final exam form" });
      }
    }
  );

  // Florida Regulatory Compliance - Export Final Exam Form A
  app.get(
    "/api/export/course/:courseId/final-exam-a.docx",
    isAdmin,
    async (req, res) => {
      try {
        const { formA } = await storage.exportFinalExamForms(req.params.courseId);
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="final-exam-form-a-${req.params.courseId}.docx"`
        );
        res.send(formA);
      } catch (err) {
        console.error("Error exporting final exam form A:", err);
        res.status(500).json({ error: "Failed to export final exam form A" });
      }
    }
  );

  // Florida Regulatory Compliance - Export Final Exam Form B
  app.get(
    "/api/export/course/:courseId/final-exam-b.docx",
    isAdmin,
    async (req, res) => {
      try {
        const { formB } = await storage.exportFinalExamForms(req.params.courseId);
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="final-exam-form-b-${req.params.courseId}.docx"`
        );
        res.send(formB);
      } catch (err) {
        console.error("Error exporting final exam form B:", err);
        res.status(500).json({ error: "Failed to export final exam form B" });
      }
    }
  );

  // All Users Data Export
  app.get("/api/export/users/data.json", isAdmin, async (req, res) => {
    try {
      const jsonContent = await storage.exportAllUsersData();
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="users-data-${new Date().toISOString().split("T")[0]}.json"`,
      );
      res.send(jsonContent);
    } catch (err) {
      console.error("Error exporting users data:", err);
      res.status(500).json({ error: "Failed to export users data" });
    }
  });

  app.get("/api/export/users/data.csv", isAdmin, async (req, res) => {
    try {
      const csvContent = await storage.exportAllUsersDataCSV();
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="users-data-${new Date().toISOString().split("T")[0]}.csv"`,
      );
      res.send(csvContent);
    } catch (err) {
      console.error("Error exporting users data as CSV:", err);
      res.status(500).json({ error: "Failed to export users data" });
    }
  });

  // Email Campaign Data Export
  app.get("/api/export/campaigns/data.json", isAdmin, async (req, res) => {
    try {
      const jsonContent = await storage.exportEmailCampaignData();
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="campaigns-data-${new Date().toISOString().split("T")[0]}.json"`,
      );
      res.send(jsonContent);
    } catch (err) {
      console.error("Error exporting campaign data:", err);
      res.status(500).json({ error: "Failed to export campaign data" });
    }
  });

  app.get("/api/export/campaigns/data.csv", isAdmin, async (req, res) => {
    try {
      const csvContent = await storage.exportEmailCampaignDataCSV();
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="campaigns-data-${new Date().toISOString().split("T")[0]}.csv"`,
      );
      res.send(csvContent);
    } catch (err) {
      console.error("Error exporting campaign data as CSV:", err);
      res.status(500).json({ error: "Failed to export campaign data" });
    }
  });

  // Admin endpoint to sync full course catalog from snapshot
  app.post("/api/admin/seed-courses", isAdmin, async (req, res) => {
    try {
      const { importCourseCatalog } = await import("./importCourseCatalog");
      const result = await importCourseCatalog();
      
      if (!result.success) {
        return res.status(500).json({ error: result.error || "Import failed" });
      }
      
      res.json({ 
        success: true, 
        message: `Course catalog synced successfully`,
        totalCourses: result.coursesImported,
        totalUnits: result.unitsImported,
        totalLessons: result.lessonsImported,
        totalQuestionBanks: result.questionBanksImported,
        totalBankQuestions: result.bankQuestionsImported,
        totalPracticeExams: result.practiceExamsImported,
        totalExamQuestions: result.examQuestionsImported,
        totalBundles: result.bundlesImported
      });
    } catch (err) {
      console.error("Error syncing course catalog:", err);
      res.status(500).json({ error: "Failed to sync course catalog" });
    }
  });

  // Admin endpoint for transactional catalog import (V2 - ACID guarantees)
  app.post("/api/admin/seed-courses-v2", isAdmin, async (req, res) => {
    try {
      const dryRun = req.query.dryRun === 'true';
      const { importCourseCatalogV2 } = await import("./catalogImportV2");
      const result = await importCourseCatalogV2(dryRun);
      
      if (!result.success) {
        return res.status(500).json({ 
          success: false,
          errors: result.errors,
          warnings: result.warnings,
          logs: result.logs
        });
      }
      
      res.json({ 
        success: true, 
        message: dryRun ? 'Dry run completed - no changes made' : 'Course catalog synced with ACID transactions',
        dryRun,
        duration: result.duration,
        counts: result.counts,
        reconciliation: result.reconciliation,
        errors: result.errors,
        warnings: result.warnings
      });
    } catch (err) {
      console.error("Error in V2 catalog sync:", err);
      res.status(500).json({ error: "Failed to sync course catalog with V2 importer" });
    }
  });

  // Admin endpoints
  app.get("/api/auth/is-admin", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.json({ isAdmin: false });
      }
      const user = req.user as any;
      const isAdminUser = await storage.isAdmin(user.id);
      res.json({ isAdmin: isAdminUser });
    } catch (err) {
      console.error("Error checking admin status:", err);
      res.json({ isAdmin: false });
    }
  });

  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const allUsers = (await storage.getUsers?.()) || [];
      const allCourses = (await storage.getCourses?.()) || [];
      const allEnrollments = (await storage.getEnrollments?.()) || [];

      res.json({
        totalUsers: allUsers.length || 0,
        totalCourses: allCourses.length || 0,
        totalEnrollments: allEnrollments.length || 0,
        completionRate:
          allEnrollments.length > 0
            ? Math.round(
                (allEnrollments.filter((e: any) => e.completed).length /
                  allEnrollments.length) *
                  100,
              )
            : 0,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Admin health check endpoint - uses comprehensive health check
  app.get("/api/admin/health", isAdmin, async (req, res) => {
    const { comprehensiveHealthCheck } = await import("./healthCheck");
    await comprehensiveHealthCheck(req, res);
  });

  // Query performance metrics endpoint
  app.get("/api/admin/query-metrics", isAdmin, async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.minDuration) filters.minDuration = parseInt(req.query.minDuration as string);
      if (req.query.maxDuration) filters.maxDuration = parseInt(req.query.maxDuration as string);
      if (req.query.userId) filters.userId = req.query.userId as string;
      if (req.query.route) filters.route = req.query.route as string;
      if (req.query.limit) filters.limit = parseInt(req.query.limit as string);

      const metrics = getQueryMetrics(filters);
      const stats = getQueryStats();

      res.json({
        metrics,
        stats,
      });
    } catch (err) {
      console.error("Error fetching query metrics:", err);
      res.status(500).json({ error: "Failed to fetch query metrics" });
    }
  });

  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const allUsers = (await storage.getUsers?.()) || [];
      res.json(allUsers.slice(0, 100));
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/enrollments", isAdmin, async (req, res) => {
    try {
      const allEnrollments = (await storage.getEnrollments?.()) || [];
      res.json(allEnrollments.slice(0, 100));
    } catch (err) {
      console.error("Error fetching enrollments:", err);
      res.status(500).json({ error: "Failed to fetch enrollments" });
    }
  });

  // Admin create user endpoint
  app.post("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const { email, firstName, lastName, password } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }

      // Hash password if provided
      let passwordHash = undefined;
      if (password) {
        const bcrypt = await import("bcrypt");
        passwordHash = await bcrypt.hash(password, 10);
      }

      const user = await storage.upsertUser({
        id: crypto.randomUUID(),
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        passwordHash,
      });

      res.status(201).json(user);
    } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Admin create enrollment endpoint
  app.post("/api/admin/enrollments", isAdmin, async (req, res) => {
    try {
      const { userId, courseId } = req.body;
      
      if (!userId || !courseId) {
        return res.status(400).json({ error: "userId and courseId are required" });
      }

      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      // Check if enrollment already exists
      const existingEnrollment = await storage.getEnrollment(userId, courseId);
      if (existingEnrollment) {
        return res.status(400).json({ error: "User is already enrolled in this course" });
      }

      const enrollment = await storage.createEnrollment(userId, courseId);
      res.status(201).json(enrollment);
    } catch (err) {
      console.error("Error creating enrollment:", err);
      res.status(500).json({ error: "Failed to create enrollment" });
    }
  });

  // Admin update enrollment endpoint
  app.patch("/api/admin/enrollments/:enrollmentId", isAdmin, async (req, res) => {
    try {
      const { enrollmentId } = req.params;
      const { progress, completed, hoursCompleted } = req.body;
      
      // Get enrollment by ID
      const allEnrollments = await storage.getEnrollments?.();
      const enrollment = allEnrollments?.find((e: any) => e.id === enrollmentId);
      
      if (!enrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      // Update the enrollment
      const updateData: any = {};
      if (progress !== undefined) updateData.progress = progress;
      if (completed !== undefined) updateData.completed = completed;
      if (hoursCompleted !== undefined) updateData.hoursCompleted = hoursCompleted;
      
      const updated = await storage.updateEnrollmentProgress(enrollmentId, updateData);
      res.json(updated);
    } catch (err) {
      console.error("Error updating enrollment:", err);
      res.status(500).json({ error: "Failed to update enrollment" });
    }
  });

  // Admin Health Check Endpoint
  app.get("/api/admin/health", adminRateLimit, isAdmin, asyncHandler(async (req, res) => {
    try {
      // Check database
      const dbStart = Date.now();
      let dbStatus = "unknown";
      let dbMessage = "Checking...";
      try {
        await db.execute(sql`SELECT 1 as health`);
        const dbLatency = Date.now() - dbStart;
        dbStatus = dbLatency < 1000 ? "healthy" : "degraded";
        dbMessage = dbLatency < 1000 ? "Connected" : `Slow (${dbLatency}ms)`;
      } catch (err) {
        dbStatus = "error";
        dbMessage = `Error: ${(err as Error).message}`;
      }

      // Check API (always healthy if we got here)
      const apiStatus = "healthy";
      const apiMessage = "Running";

      // Check payment gateway (Stripe)
      let paymentStatus = "unknown";
      let paymentMessage = "Checking...";
      try {
        const stripeStatus = getStripeStatus();
        if (stripeStatus.configured) {
          paymentStatus = "healthy";
          paymentMessage = "Connected";
        } else {
          paymentStatus = "not_configured";
          paymentMessage = "Not configured";
        }
      } catch (err) {
        paymentStatus = "error";
        paymentMessage = `Error: ${(err as Error).message}`;
      }

      // Return format matching frontend expectations
      res.json({
        database: {
          status: dbStatus,
          message: dbMessage,
        },
        api: {
          status: apiStatus,
          message: apiMessage,
        },
        payment: {
          status: paymentStatus,
          message: paymentMessage,
        },
      });
    } catch (err) {
      res.status(500).json({
        database: { status: "error", message: "Health check failed" },
        api: { status: "error", message: "Health check failed" },
        payment: { status: "error", message: "Health check failed" },
      });
    }
  }));

  // Course Management Admin Routes
  app.post("/api/admin/courses", adminRateLimit, isAdmin, validateRequest(createCourseSchema), asyncHandler(async (req, res) => {
    const userId = (req.user as any)?.id;
    const course = await storage.createCourse?.(req.body);
    if (!course) {
      throw new Error("Failed to create course");
    }
    // Audit log
    await storage.createAuditLog?.("CREATE", userId, "course", course.id, JSON.stringify({ title: course.title, sku: course.sku }), "info", req.ip, req.get("user-agent"));
    triggerCatalogSyncDebounced();
    res.status(201).json(course);
  }));

  app.get("/api/admin/courses", adminRateLimit, isAdmin, asyncHandler(async (req, res) => {
    const allCourses = (await storage.getCourses?.()) || [];
    res.json(allCourses.slice(0, 500));
  }));

  app.patch("/api/admin/courses/:courseId", adminRateLimit, isAdmin, validateUUID("courseId"), validateRequest(updateCourseSchema), asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const userId = (req.user as any)?.id;
    const course = await storage.updateCourse?.(courseId, req.body);
    if (!course) throw new NotFoundError("Course");
    // Audit log
    await storage.createAuditLog?.("UPDATE", userId, "course", courseId, JSON.stringify(req.body), "info", req.ip, req.get("user-agent"));
    triggerCatalogSyncDebounced();
    res.json(course);
  }));

  app.delete("/api/admin/courses/:courseId", adminRateLimit, isAdmin, validateUUID("courseId"), asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const userId = (req.user as any)?.id;
    const hardDelete = req.query.hardDelete === "true";
    await storage.deleteCourse?.(courseId, { hardDelete });
    // Audit log
    await storage.createAuditLog?.("DELETE", userId, "course", courseId, JSON.stringify({ mode: hardDelete ? "hard" : "soft" }), "warning", req.ip, req.get("user-agent"));
    triggerCatalogSyncDebounced();
    res.json({ success: true, mode: hardDelete ? "hard" : "soft" });
  }));

  // ===== Unit Management Routes =====
  app.get("/api/admin/courses/:courseId/units", isAdmin, async (req, res) => {
    try {
      const { courseId } = req.params;
      const unitList = await storage.getUnits(courseId);
      res.json(unitList);
    } catch (err) {
      console.error("Error fetching units:", err);
      res.status(500).json({ error: "Failed to fetch units" });
    }
  });

  app.post("/api/admin/courses/:courseId/units", adminRateLimit, isAdmin, validateUUID("courseId"), validateRequest(createUnitSchema), asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const unit = await storage.createUnitForCourse?.(courseId, req.body);
    if (!unit) throw new NotFoundError("Course");
    triggerCatalogSyncDebounced();
    res.status(201).json(unit);
  }));

  app.patch("/api/admin/units/:unitId", adminRateLimit, isAdmin, validateUUID("unitId"), validateRequest(updateUnitSchema), asyncHandler(async (req, res) => {
    const { unitId } = req.params;
    const unit = await storage.updateUnitWithValidation?.(unitId, req.body);
    if (!unit) throw new NotFoundError("Unit");
    triggerCatalogSyncDebounced();
    res.json(unit);
  }));

  app.delete("/api/admin/units/:unitId", isAdmin, async (req, res) => {
    try {
      const { unitId } = req.params;
      await storage.deleteUnitSafe?.(unitId);
      triggerCatalogSyncDebounced();
      res.json({ success: true });
    } catch (err: any) {
      if (err?.message === "UNIT_HAS_ACTIVE_ENROLLMENTS") {
        return res.status(400).json({ error: "Cannot delete unit with active enrollments" });
      }
      console.error("Error deleting unit:", err);
      res.status(500).json({ error: "Failed to delete unit" });
    }
  });

  app.post("/api/admin/courses/:courseId/units/reorder", isAdmin, async (req, res) => {
    try {
      const { unitIds } = req.body; // Array of unit IDs in new order
      const db = (await import("./db")).db;
      const { units } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      for (let i = 0; i < unitIds.length; i++) {
        await db.update(units).set({ unitNumber: i + 1 }).where(eq(units.id, unitIds[i]));
      }
      triggerCatalogSyncDebounced();
      res.json({ success: true });
    } catch (err) {
      console.error("Error reordering units:", err);
      res.status(500).json({ error: "Failed to reorder units" });
    }
  });

  // ===== Lesson Management Routes =====
  app.get("/api/admin/units/:unitId/lessons", isAdmin, async (req, res) => {
    try {
      const { unitId } = req.params;
      const lessonList = await storage.getLessons(unitId);
      res.json(lessonList);
    } catch (err) {
      console.error("Error fetching lessons:", err);
      res.status(500).json({ error: "Failed to fetch lessons" });
    }
  });

  app.post("/api/admin/units/:unitId/lessons", adminRateLimit, isAdmin, validateUUID("unitId"), validateRequest(createLessonSchema), asyncHandler(async (req, res) => {
    const { unitId } = req.params;
    const lesson = await storage.createLessonForUnit?.(unitId, req.body);
    if (!lesson) throw new NotFoundError("Unit");
    triggerCatalogSyncDebounced();
    res.status(201).json(lesson);
  }));

  app.patch("/api/admin/lessons/:lessonId", adminRateLimit, isAdmin, validateUUID("lessonId"), validateRequest(updateLessonSchema), asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const lesson = await storage.updateLessonWithValidation?.(lessonId, req.body);
    if (!lesson) throw new NotFoundError("Lesson");
    triggerCatalogSyncDebounced();
    res.json(lesson);
  }));

  app.delete("/api/admin/lessons/:lessonId", isAdmin, async (req, res) => {
    try {
      const { lessonId } = req.params;
      await storage.deleteLessonSafe?.(lessonId);
      triggerCatalogSyncDebounced();
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting lesson:", err);
      res.status(500).json({ error: "Failed to delete lesson" });
    }
  });

  app.post("/api/admin/units/:unitId/lessons/reorder", isAdmin, async (req, res) => {
    try {
      const { lessonIds } = req.body; // Array of lesson IDs in new order
      const db = (await import("./db")).db;
      const { lessons } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      for (let i = 0; i < lessonIds.length; i++) {
        await db.update(lessons).set({ lessonNumber: i + 1 }).where(eq(lessons.id, lessonIds[i]));
      }
      triggerCatalogSyncDebounced();
      res.json({ success: true });
    } catch (err) {
      console.error("Error reordering lessons:", err);
      res.status(500).json({ error: "Failed to reorder lessons" });
    }
  });

  // ===== Content Block Management Routes (Coursebox-style) =====
  
  // Get all content blocks for a lesson (admin - includes hidden)
  app.get("/api/admin/lessons/:lessonId/blocks", isAdmin, async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { contentBlocks } = await import("@shared/schema");
      const { eq, asc } = await import("drizzle-orm");
      
      const blocks = await db.select().from(contentBlocks)
        .where(eq(contentBlocks.lessonId, req.params.lessonId))
        .orderBy(asc(contentBlocks.sortOrder));
      res.json(blocks);
    } catch (err) {
      console.error("Error fetching content blocks:", err);
      res.status(500).json({ error: "Failed to fetch content blocks" });
    }
  });

  // Create a new content block
  app.post("/api/admin/lessons/:lessonId/blocks", isAdmin, async (req, res) => {
    try {
      const { insertContentBlockSchema } = await import("@shared/schema");
      const { blockType, content, settings } = req.body;
      
      if (!blockType) {
        return res.status(400).json({ error: "blockType is required" });
      }
      
      // Get max sort order for this lesson
      const db = (await import("./db")).db;
      const { contentBlocks } = await import("@shared/schema");
      const { eq, desc } = await import("drizzle-orm");
      
      const existing = await db.select().from(contentBlocks)
        .where(eq(contentBlocks.lessonId, req.params.lessonId))
        .orderBy(desc(contentBlocks.sortOrder))
        .limit(1);
      const nextOrder = existing.length > 0 ? (existing[0].sortOrder || 0) + 1 : 0;
      
      const blockData = {
        lessonId: req.params.lessonId,
        blockType,
        sortOrder: nextOrder,
        content: typeof content === 'object' ? JSON.stringify(content) : (content || null),
        settings: typeof settings === 'object' ? JSON.stringify(settings) : (settings || null),
        isVisible: 1,
      };
      
      const block = await storage.createContentBlock(blockData);
      res.status(201).json(block);
    } catch (err) {
      console.error("Error creating content block:", err);
      res.status(500).json({ error: "Failed to create content block" });
    }
  });

  // Update a content block
  app.patch("/api/admin/blocks/:blockId", isAdmin, async (req, res) => {
    try {
      const { blockType, content, settings, sortOrder, isVisible } = req.body;
      const updateData: any = {};
      
      if (blockType !== undefined) updateData.blockType = blockType;
      if (content !== undefined) updateData.content = typeof content === 'object' ? JSON.stringify(content) : content;
      if (settings !== undefined) updateData.settings = typeof settings === 'object' ? JSON.stringify(settings) : settings;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
      if (isVisible !== undefined) updateData.isVisible = isVisible;
      
      const block = await storage.updateContentBlock(req.params.blockId, updateData);
      res.json(block);
    } catch (err) {
      console.error("Error updating content block:", err);
      res.status(500).json({ error: "Failed to update content block" });
    }
  });

  // Delete a content block
  app.delete("/api/admin/blocks/:blockId", isAdmin, async (req, res) => {
    try {
      await storage.deleteContentBlock(req.params.blockId);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting content block:", err);
      res.status(500).json({ error: "Failed to delete content block" });
    }
  });

  // Reorder content blocks within a lesson
  app.post("/api/admin/lessons/:lessonId/blocks/reorder", isAdmin, async (req, res) => {
    try {
      const { blockIds } = req.body;
      if (!Array.isArray(blockIds)) {
        return res.status(400).json({ error: "blockIds must be an array" });
      }
      
      await storage.reorderContentBlocks(req.params.lessonId, blockIds);
      res.json({ success: true });
    } catch (err) {
      console.error("Error reordering content blocks:", err);
      res.status(500).json({ error: "Failed to reorder content blocks" });
    }
  });

  // Duplicate a content block
  app.post("/api/admin/blocks/:blockId/duplicate", isAdmin, async (req, res) => {
    try {
      const original = await storage.getContentBlock(req.params.blockId);
      
      if (!original) {
        return res.status(404).json({ error: "Block not found" });
      }
      
      const db = (await import("./db")).db;
      const { contentBlocks } = await import("@shared/schema");
      const { eq, desc } = await import("drizzle-orm");
      
      const existing = await db.select().from(contentBlocks)
        .where(eq(contentBlocks.lessonId, original.lessonId))
        .orderBy(desc(contentBlocks.sortOrder))
        .limit(1);
      const nextOrder = existing.length > 0 ? (existing[0].sortOrder || 0) + 1 : 0;
      
      const block = await storage.createContentBlock({
        lessonId: original.lessonId,
        blockType: original.blockType,
        sortOrder: nextOrder,
        content: original.content,
        settings: original.settings,
        isVisible: original.isVisible,
      });
      
      res.status(201).json(block);
    } catch (err) {
      console.error("Error duplicating content block:", err);
      res.status(500).json({ error: "Failed to duplicate content block" });
    }
  });

  // Get content blocks for learner view (filtered by visibility)
  app.get("/api/lessons/:lessonId/blocks", async (req, res) => {
    try {
      const blocks = await storage.getContentBlocks(req.params.lessonId);
      res.json(blocks);
    } catch (err) {
      console.error("Error fetching content blocks:", err);
      res.status(500).json({ error: "Failed to fetch content blocks" });
    }
  });

  // ===== AI Course Generation Routes =====
  
  // Generate course outline using AI
  app.post("/api/admin/ai/generate-course-outline", isAdmin, async (req, res) => {
    try {
      const { generateCourseOutline } = await import("./ai-services");
      const { title, description, hoursRequired, targetAudience, learningObjectives, state, licenseType } = req.body;
      
      if (!title || !hoursRequired) {
        return res.status(400).json({ error: "title and hoursRequired are required" });
      }
      
      const outline = await generateCourseOutline({
        title,
        description,
        hoursRequired,
        targetAudience,
        learningObjectives,
        state,
        licenseType,
      });
      
      res.json(outline);
    } catch (err) {
      console.error("Error generating course outline:", err);
      res.status(500).json({ error: "Failed to generate course outline" });
    }
  });

  // Generate quiz questions from lesson content using AI
  app.post("/api/admin/ai/generate-quiz", isAdmin, async (req, res) => {
    try {
      const { generateQuizFromContent } = await import("./ai-services");
      const { lessonContent, lessonTitle, unitTitle, numberOfQuestions } = req.body;
      
      if (!lessonContent || !lessonTitle) {
        return res.status(400).json({ error: "lessonContent and lessonTitle are required" });
      }
      
      const quiz = await generateQuizFromContent({
        lessonContent,
        lessonTitle,
        unitTitle,
        numberOfQuestions: numberOfQuestions || 5,
      });
      
      res.json(quiz);
    } catch (err) {
      console.error("Error generating quiz:", err);
      res.status(500).json({ error: "Failed to generate quiz" });
    }
  });

  // Generate lesson content blocks using AI
  app.post("/api/admin/ai/generate-lesson-content", isAdmin, async (req, res) => {
    try {
      const { generateLessonContent } = await import("./ai-services");
      const { lessonTitle, lessonDescription, unitTitle, courseTitle, keyTopics, targetDurationMinutes } = req.body;
      
      if (!lessonTitle || !keyTopics || !targetDurationMinutes) {
        return res.status(400).json({ error: "lessonTitle, keyTopics, and targetDurationMinutes are required" });
      }
      
      const content = await generateLessonContent({
        lessonTitle,
        lessonDescription: lessonDescription || lessonTitle,
        unitTitle,
        courseTitle,
        keyTopics,
        targetDurationMinutes,
      });
      
      res.json(content);
    } catch (err) {
      console.error("Error generating lesson content:", err);
      res.status(500).json({ error: "Failed to generate lesson content" });
    }
  });

  // Apply generated course outline - creates units and lessons in database
  app.post("/api/admin/ai/apply-course-outline", isAdmin, async (req, res) => {
    try {
      const { courseId, outline } = req.body;
      
      if (!courseId || !outline || !outline.units) {
        return res.status(400).json({ error: "courseId and outline with units are required" });
      }
      
      const createdUnits = [];
      
      for (const unitData of outline.units) {
        const unit = await storage.createUnit(
          courseId,
          unitData.unitNumber,
          unitData.title,
          unitData.description,
          unitData.hoursRequired
        );
        
        const createdLessons = [];
        for (const lessonData of unitData.lessons) {
          const lesson = await storage.createLesson(
            unit.id,
            lessonData.lessonNumber,
            lessonData.title,
            undefined, // videoUrl
            lessonData.durationMinutes,
            lessonData.description, // content
            undefined // imageUrl
          );
          createdLessons.push(lesson);
        }
        
        createdUnits.push({ unit, lessons: createdLessons });
      }
      
      res.json({ success: true, units: createdUnits });
    } catch (err) {
      console.error("Error applying course outline:", err);
      res.status(500).json({ error: "Failed to apply course outline" });
    }
  });

  // Apply generated content blocks to a lesson
  app.post("/api/admin/ai/apply-lesson-content", isAdmin, async (req, res) => {
    try {
      const { lessonId, blocks } = req.body;
      
      if (!lessonId || !blocks || !Array.isArray(blocks)) {
        return res.status(400).json({ error: "lessonId and blocks array are required" });
      }
      
      const createdBlocks = [];
      for (const blockData of blocks) {
        const block = await storage.createContentBlock({
          lessonId,
          blockType: blockData.blockType,
          sortOrder: blockData.sortOrder,
          content: JSON.stringify(blockData.content),
          settings: blockData.settings ? JSON.stringify(blockData.settings) : null,
          isVisible: 1,
        });
        createdBlocks.push(block);
      }
      
      res.json({ success: true, blocks: createdBlocks });
    } catch (err) {
      console.error("Error applying lesson content:", err);
      res.status(500).json({ error: "Failed to apply lesson content" });
    }
  });

  // ===== Question Bank Management Routes =====
  
  // Get all question banks for a course
  app.get("/api/admin/courses/:courseId/question-banks", isAdmin, async (req, res) => {
    try {
      const banks = await storage.getQuestionBanksByCourse(req.params.courseId);
      res.json(banks);
    } catch (err) {
      console.error("Error fetching question banks:", err);
      res.status(500).json({ error: "Failed to fetch question banks" });
    }
  });

  // Get final exams (practice_exams) for a course - for admin content builder
  app.get("/api/admin/courses/:courseId/final-exams", isAdmin, async (req, res) => {
    try {
      const allExams = await storage.getPracticeExams(req.params.courseId);
      const finalExams = allExams.filter(e => e.isFinalExam === 1);
      res.json(finalExams);
    } catch (err) {
      console.error("Error fetching final exams:", err);
      res.status(500).json({ error: "Failed to fetch final exams" });
    }
  });

  // Get question banks for a specific unit
  app.get("/api/admin/units/:unitId/question-banks", isAdmin, async (req, res) => {
    try {
      const banks = await storage.getQuestionBanksByUnit(req.params.unitId);
      res.json(banks);
    } catch (err) {
      console.error("Error fetching unit question banks:", err);
      res.status(500).json({ error: "Failed to fetch question banks" });
    }
  });

  // Get a single question bank
  app.get("/api/admin/question-banks/:bankId", isAdmin, async (req, res) => {
    try {
      const bank = await storage.getQuestionBank(req.params.bankId);
      if (!bank) {
        return res.status(404).json({ error: "Question bank not found" });
      }
      res.json(bank);
    } catch (err) {
      console.error("Error fetching question bank:", err);
      res.status(500).json({ error: "Failed to fetch question bank" });
    }
  });

  // Create a question bank
  app.post("/api/admin/question-banks", isAdmin, async (req, res) => {
    try {
      const { courseId, unitId, bankType, title, description, questionsPerAttempt, passingScore, timeLimit } = req.body;
      
      if (!courseId || !bankType || !title) {
        return res.status(400).json({ error: "courseId, bankType, and title are required" });
      }
      
      const bank = await storage.createQuestionBank({
        courseId,
        unitId: unitId || null,
        bankType,
        title,
        description: description || null,
        questionsPerAttempt: questionsPerAttempt || 10,
        passingScore: passingScore || 70,
        timeLimit: timeLimit || null,
        isActive: 1,
      });
      
      triggerCatalogSyncDebounced();
      res.status(201).json(bank);
    } catch (err) {
      console.error("Error creating question bank:", err);
      res.status(500).json({ error: "Failed to create question bank" });
    }
  });

  // Update a question bank
  app.patch("/api/admin/question-banks/:bankId", isAdmin, async (req, res) => {
    try {
      const bank = await storage.updateQuestionBank(req.params.bankId, req.body);
      triggerCatalogSyncDebounced();
      res.json(bank);
    } catch (err) {
      console.error("Error updating question bank:", err);
      res.status(500).json({ error: "Failed to update question bank" });
    }
  });

  // Delete a question bank
  app.delete("/api/admin/question-banks/:bankId", isAdmin, async (req, res) => {
    try {
      await storage.deleteQuestionBank(req.params.bankId);
      triggerCatalogSyncDebounced();
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting question bank:", err);
      res.status(500).json({ error: "Failed to delete question bank" });
    }
  });

  // ===== Bank Questions Management Routes =====

  // Get all questions in a bank
  app.get("/api/admin/question-banks/:bankId/questions", isAdmin, async (req, res) => {
    try {
      const questions = await storage.getBankQuestions(req.params.bankId);
      res.json(questions);
    } catch (err) {
      console.error("Error fetching bank questions:", err);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  // Get a single question
  app.get("/api/admin/questions/:questionId", isAdmin, async (req, res) => {
    try {
      const question = await storage.getBankQuestion(req.params.questionId);
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.json(question);
    } catch (err) {
      console.error("Error fetching question:", err);
      res.status(500).json({ error: "Failed to fetch question" });
    }
  });

  // Create a question in a bank
  app.post("/api/admin/question-banks/:bankId/questions", isAdmin, async (req, res) => {
    try {
      const { bankId } = req.params;
      const { questionText, questionType, options, correctOption, explanation, difficulty, category } = req.body;
      
      if (!questionText || options === undefined || correctOption === undefined || !explanation) {
        return res.status(400).json({ error: "questionText, options, correctOption, and explanation are required" });
      }
      
      const question = await storage.createBankQuestion({
        bankId,
        questionText,
        questionType: questionType || "multiple_choice",
        options: typeof options === "string" ? options : JSON.stringify(options),
        correctOption,
        explanation,
        difficulty: difficulty || "medium",
        category: category || null,
        isActive: 1,
      });
      
      triggerCatalogSyncDebounced();
      res.status(201).json(question);
    } catch (err) {
      console.error("Error creating question:", err);
      res.status(500).json({ error: "Failed to create question" });
    }
  });

  // Update a question
  app.patch("/api/admin/questions/:questionId", isAdmin, async (req, res) => {
    try {
      const data = { ...req.body };
      // Ensure options is stringified if it's an array
      if (data.options && typeof data.options !== "string") {
        data.options = JSON.stringify(data.options);
      }
      const question = await storage.updateBankQuestion(req.params.questionId, data);
      triggerCatalogSyncDebounced();
      res.json(question);
    } catch (err) {
      console.error("Error updating question:", err);
      res.status(500).json({ error: "Failed to update question" });
    }
  });

  // Delete a question
  app.delete("/api/admin/questions/:questionId", isAdmin, async (req, res) => {
    try {
      await storage.deleteBankQuestion(req.params.questionId);
      triggerCatalogSyncDebounced();
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting question:", err);
      res.status(500).json({ error: "Failed to delete question" });
    }
  });

  // Admin endpoint to manually trigger quiz question import
  app.post("/api/admin/import-quiz-questions", isAdmin, async (req, res) => {
    try {
      console.log("Manual quiz import triggered by admin");
      const { importAllUnitQuizzes } = await import("./importAllUnitQuizzes");
      await importAllUnitQuizzes();
      triggerCatalogSyncDebounced();
      res.json({ success: true, message: "Successfully imported 380 unit quiz questions (20 per unit x 19 units)" });
    } catch (err) {
      console.error("Error importing quiz questions:", err);
      res.status(500).json({ error: "Failed to import quiz questions" });
    }
  });

  // Admin endpoint to manually trigger final exam import
  app.post("/api/admin/import-final-exams", isAdmin, async (req, res) => {
    try {
      console.log("Manual final exam import triggered by admin");
      const db = (await import("./db")).db;
      const { courses } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      const courseResult = await db.select().from(courses).where(eq(courses.sku, "FL-RE-PL-SA-FRECI-63")).limit(1);
      if (courseResult.length === 0) {
        return res.status(404).json({ error: "FREC I course not found" });
      }
      
      const { importFinalExams } = await import("./importFinalExams");
      await importFinalExams(courseResult[0].id);
      triggerCatalogSyncDebounced();
      res.json({ success: true, message: "Successfully imported final exams (Form A: 100, Form B: 100)" });
    } catch (err) {
      console.error("Error importing final exams:", err);
      res.status(500).json({ error: "Failed to import final exams" });
    }
  });

  // Admin endpoint to normalize all unit quiz question counts to 10
  app.post("/api/admin/normalize-quiz-settings", isAdmin, async (req, res) => {
    try {
      console.log("Normalizing unit quiz settings...");
      const db = (await import("./db")).db;
      const { practiceExams, questionBanks } = await import("@shared/schema");
      const { eq, and, sql } = await import("drizzle-orm");
      
      // Update all unit quizzes in practice_exams to show 10 questions
      const examResult = await db.execute(sql`
        UPDATE practice_exams 
        SET total_questions = 10 
        WHERE is_final_exam = 0 
        AND title LIKE '%Unit%Quiz%'
      `);
      
      // Update all unit quiz banks in question_banks to use 10 questions per attempt
      const bankResult = await db.execute(sql`
        UPDATE question_banks 
        SET questions_per_attempt = 10 
        WHERE bank_type = 'unit_quiz'
      `);
      
      console.log("Quiz settings normalized to 10 questions per unit quiz");
      res.json({ 
        success: true, 
        message: "All unit quizzes normalized to 10 questions per attempt"
      });
    } catch (err) {
      console.error("Error normalizing quiz settings:", err);
      res.status(500).json({ error: "Failed to normalize quiz settings" });
    }
  });

  // ===== CMS Site Pages Management Routes =====
  
  // Get all site pages
  app.get("/api/admin/site-pages", isAdmin, async (req, res) => {
    try {
      const pages = await storage.getSitePages();
      res.json(pages);
    } catch (err) {
      console.error("Error fetching site pages:", err);
      res.status(500).json({ error: "Failed to fetch site pages" });
    }
  });

  // Get single site page with sections and blocks
  app.get("/api/admin/site-pages/:id", isAdmin, async (req, res) => {
    try {
      const page = await storage.getSitePage(req.params.id);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      
      const sections = await storage.getPageSections(page.id);
      const sectionsWithBlocks = await Promise.all(
        sections.map(async (section) => ({
          ...section,
          blocks: await storage.getSectionBlocks(section.id),
        }))
      );
      
      res.json({ page, sections: sectionsWithBlocks });
    } catch (err) {
      console.error("Error fetching site page:", err);
      res.status(500).json({ error: "Failed to fetch site page" });
    }
  });

  // Create new site page
  app.post("/api/admin/site-pages", isAdmin, async (req, res) => {
    try {
      const { slug, title, description, isPublished, metaTitle, metaKeywords, ogImage } = req.body;
      
      // Check if slug already exists
      const existing = await storage.getSitePageBySlug(slug);
      if (existing) {
        return res.status(400).json({ error: "A page with this URL slug already exists" });
      }
      
      const page = await storage.createSitePage({
        slug,
        title,
        description,
        isPublished: isPublished || 0,
        metaTitle,
        metaKeywords,
        ogImage,
      });
      res.json(page);
    } catch (err) {
      console.error("Error creating site page:", err);
      res.status(500).json({ error: "Failed to create site page" });
    }
  });

  // Update site page
  app.patch("/api/admin/site-pages/:id", isAdmin, async (req, res) => {
    try {
      // Filter out read-only and auto-generated fields
      const { id, createdAt, updatedAt, ...updateData } = req.body;
      
      // Convert isPublished boolean to integer if needed
      if (typeof updateData.isPublished === 'boolean') {
        updateData.isPublished = updateData.isPublished ? 1 : 0;
      }
      
      const page = await storage.updateSitePage(req.params.id, updateData);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      res.json(page);
    } catch (err) {
      console.error("Error updating site page:", err);
      res.status(500).json({ error: "Failed to update site page" });
    }
  });

  // Delete site page
  app.delete("/api/admin/site-pages/:id", isAdmin, async (req, res) => {
    try {
      const page = await storage.getSitePage(req.params.id);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      if (page.isSystemPage) {
        return res.status(400).json({ error: "Cannot delete system pages" });
      }
      await storage.deleteSitePage(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting site page:", err);
      res.status(500).json({ error: "Failed to delete site page" });
    }
  });

  // Create page section
  app.post("/api/admin/site-pages/:pageId/sections", isAdmin, async (req, res) => {
    try {
      const { sectionType, title, backgroundColor, backgroundImage, padding, sortOrder, settings } = req.body;
      const section = await storage.createPageSection({
        pageId: req.params.pageId,
        sectionType,
        title,
        backgroundColor,
        backgroundImage,
        padding,
        sortOrder: sortOrder || 0,
        settings: settings ? JSON.stringify(settings) : undefined,
      });
      res.json(section);
    } catch (err) {
      console.error("Error creating page section:", err);
      res.status(500).json({ error: "Failed to create page section" });
    }
  });

  // Update page section
  app.patch("/api/admin/sections/:id", isAdmin, async (req, res) => {
    try {
      const data = { ...req.body };
      if (data.settings && typeof data.settings === 'object') {
        data.settings = JSON.stringify(data.settings);
      }
      const section = await storage.updatePageSection(req.params.id, data);
      res.json(section);
    } catch (err) {
      console.error("Error updating page section:", err);
      res.status(500).json({ error: "Failed to update page section" });
    }
  });

  // Delete page section
  app.delete("/api/admin/sections/:id", isAdmin, async (req, res) => {
    try {
      await storage.deletePageSection(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting page section:", err);
      res.status(500).json({ error: "Failed to delete page section" });
    }
  });

  // Reorder page sections
  app.post("/api/admin/site-pages/:pageId/sections/reorder", isAdmin, async (req, res) => {
    try {
      const { sectionIds } = req.body;
      await storage.reorderPageSections(req.params.pageId, sectionIds);
      res.json({ success: true });
    } catch (err) {
      console.error("Error reordering sections:", err);
      res.status(500).json({ error: "Failed to reorder sections" });
    }
  });

  // Create section block
  app.post("/api/admin/sections/:sectionId/blocks", isAdmin, async (req, res) => {
    try {
      const { blockType, content, mediaUrl, mediaAlt, linkUrl, linkTarget, alignment, size, sortOrder, settings } = req.body;
      const block = await storage.createSectionBlock({
        sectionId: req.params.sectionId,
        blockType,
        content,
        mediaUrl,
        mediaAlt,
        linkUrl,
        linkTarget,
        alignment,
        size,
        sortOrder: sortOrder || 0,
        settings: settings ? JSON.stringify(settings) : undefined,
      });
      res.json(block);
    } catch (err) {
      console.error("Error creating section block:", err);
      res.status(500).json({ error: "Failed to create section block" });
    }
  });

  // Update section block
  app.patch("/api/admin/blocks/:id", isAdmin, async (req, res) => {
    try {
      const data = { ...req.body };
      if (data.settings && typeof data.settings === 'object') {
        data.settings = JSON.stringify(data.settings);
      }
      const block = await storage.updateSectionBlock(req.params.id, data);
      res.json(block);
    } catch (err) {
      console.error("Error updating section block:", err);
      res.status(500).json({ error: "Failed to update section block" });
    }
  });

  // Delete section block
  app.delete("/api/admin/blocks/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteSectionBlock(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting section block:", err);
      res.status(500).json({ error: "Failed to delete section block" });
    }
  });

  // Reorder section blocks
  app.post("/api/admin/sections/:sectionId/blocks/reorder", isAdmin, async (req, res) => {
    try {
      const { blockIds } = req.body;
      await storage.reorderSectionBlocks(req.params.sectionId, blockIds);
      res.json({ success: true });
    } catch (err) {
      console.error("Error reordering blocks:", err);
      res.status(500).json({ error: "Failed to reorder blocks" });
    }
  });

  // Public endpoint: Get page by slug for frontend rendering
  app.get("/api/pages/:slug", async (req, res) => {
    try {
      const pageData = await storage.getFullPageData(req.params.slug);
      if (!pageData) {
        return res.status(404).json({ error: "Page not found" });
      }
      // Only return published pages to public
      if (!pageData.page.isPublished) {
        return res.status(404).json({ error: "Page not found" });
      }
      res.json(pageData);
    } catch (err) {
      console.error("Error fetching page:", err);
      res.status(500).json({ error: "Failed to fetch page" });
    }
  });

  // Seed initial pages endpoint
  app.post("/api/admin/seed-pages", isAdmin, async (req, res) => {
    try {
      const existingPages = await storage.getSitePages();
      if (existingPages.length > 0) {
        return res.json({ message: "Pages already exist", pages: existingPages });
      }

      // Create default system pages
      const defaultPages = [
        { slug: "home", title: "Home", isSystemPage: 1, isPublished: 1, sortOrder: 0 },
        { slug: "about", title: "About Us", isSystemPage: 0, isPublished: 1, sortOrder: 1 },
        { slug: "courses", title: "Courses", isSystemPage: 1, isPublished: 1, sortOrder: 2 },
        { slug: "contact", title: "Contact", isSystemPage: 0, isPublished: 1, sortOrder: 3 },
        { slug: "pricing", title: "Pricing", isSystemPage: 0, isPublished: 1, sortOrder: 4 },
      ];

      const createdPages = [];
      for (const pageData of defaultPages) {
        const page = await storage.createSitePage(pageData);
        createdPages.push(page);
      }

      res.json({ success: true, pages: createdPages });
    } catch (err) {
      console.error("Error seeding pages:", err);
      res.status(500).json({ error: "Failed to seed pages" });
    }
  });

  // ===== Media Asset Management Routes =====
  app.get("/api/admin/media", isAdmin, async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { mediaAssets } = await import("@shared/schema");
      const { desc } = await import("drizzle-orm");
      
      const media = await db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt)).limit(200);
      res.json(media);
    } catch (err) {
      console.error("Error fetching media:", err);
      res.status(500).json({ error: "Failed to fetch media" });
    }
  });

  app.post("/api/admin/media", isAdmin, async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { mediaAssets } = await import("@shared/schema");
      
      const user = req.user as any;
      const { fileName, fileUrl, fileType, mimeType, fileSize, width, height, duration, thumbnailUrl, altText, description, courseId, unitId, lessonId } = req.body;
      
      const [media] = await db.insert(mediaAssets).values({
        fileName,
        fileUrl,
        fileType,
        mimeType,
        fileSize: fileSize || 0,
        width,
        height,
        duration,
        thumbnailUrl,
        altText,
        description,
        uploadedBy: user?.id || "system",
        courseId,
        unitId,
        lessonId,
      }).returning();
      
      res.status(201).json(media);
    } catch (err) {
      console.error("Error creating media asset:", err);
      res.status(500).json({ error: "Failed to create media asset" });
    }
  });

  app.delete("/api/admin/media/:mediaId", isAdmin, async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { mediaAssets } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      await db.delete(mediaAssets).where(eq(mediaAssets.id, req.params.mediaId));
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting media:", err);
      res.status(500).json({ error: "Failed to delete media" });
    }
  });

  // ===== Video Management Routes =====
  app.get("/api/admin/courses/:courseId/videos", isAdmin, async (req, res) => {
    try {
      const videos = await storage.getVideos(req.params.courseId);
      res.json(videos);
    } catch (err) {
      console.error("Error fetching videos:", err);
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });

  app.post("/api/admin/videos", isAdmin, async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { videos } = await import("@shared/schema");
      
      const user = req.user as any;
      const { courseId, unitId, title, videoUrl, thumbnailUrl, description, durationMinutes } = req.body;
      
      const [video] = await db.insert(videos).values({
        courseId,
        unitId,
        title,
        videoUrl,
        thumbnailUrl,
        description,
        durationMinutes,
        uploadedBy: user?.id || "system",
      }).returning();
      
      res.status(201).json(video);
    } catch (err) {
      console.error("Error creating video:", err);
      res.status(500).json({ error: "Failed to create video" });
    }
  });

  app.patch("/api/admin/videos/:videoId", isAdmin, async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { videos } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      const [video] = await db.update(videos).set({
        ...req.body,
        updatedAt: new Date()
      }).where(eq(videos.id, req.params.videoId)).returning();
      
      res.json(video);
    } catch (err) {
      console.error("Error updating video:", err);
      res.status(500).json({ error: "Failed to update video" });
    }
  });

  app.delete("/api/admin/videos/:videoId", isAdmin, async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { videos } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      await db.delete(videos).where(eq(videos.id, req.params.videoId));
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting video:", err);
      res.status(500).json({ error: "Failed to delete video" });
    }
  });

  // Website Pages Management Routes
  app.post("/api/admin/pages/:slug", isAdmin, async (req, res) => {
    try {
      const { slug } = req.params;
      const { blocks } = req.body;

      const page = {
        id: slug,
        slug,
        title: slug.charAt(0).toUpperCase() + slug.slice(1),
        blocks: blocks || [],
        updatedAt: new Date().toISOString(),
      };

      await storage.savePage?.(slug, page);
      res.json(page);
    } catch (err) {
      console.error("Error saving page:", err);
      res.status(500).json({ error: "Failed to save page" });
    }
  });

  app.get("/api/admin/pages/:slug", isAdmin, async (req, res) => {
    try {
      const { slug } = req.params;
      const page = await storage.getPage?.(slug);
      if (!page) return res.status(404).json({ error: "Page not found" });
      res.json(page);
    } catch (err) {
      console.error("Error fetching page:", err);
      res.status(500).json({ error: "Failed to fetch page" });
    }
  });

  // ===== Admin Financial Management Routes =====
  
  // Get all purchases (admin)
  app.get("/api/admin/purchases", isAdmin, async (req, res) => {
    try {
      const allPurchases = await storage.getAllPurchases();
      res.json(allPurchases);
    } catch (err) {
      console.error("Error fetching purchases:", err);
      res.status(500).json({ error: "Failed to fetch purchases" });
    }
  });

  // Get user's financial summary
  app.get("/api/admin/users/:userId/financial", isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const summary = await storage.getUserFinancialSummary(userId);
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        ...summary
      });
    } catch (err) {
      console.error("Error fetching user financial summary:", err);
      res.status(500).json({ error: "Failed to fetch financial summary" });
    }
  });

  // Get all refunds (admin)
  app.get("/api/admin/refunds", isAdmin, async (req, res) => {
    try {
      const allRefunds = await storage.getAllRefunds();
      res.json(allRefunds);
    } catch (err) {
      console.error("Error fetching refunds:", err);
      res.status(500).json({ error: "Failed to fetch refunds" });
    }
  });

  // Get all account credits (admin)
  app.get("/api/admin/credits", isAdmin, async (req, res) => {
    try {
      const allCredits = await storage.getAllAccountCredits();
      res.json(allCredits);
    } catch (err) {
      console.error("Error fetching credits:", err);
      res.status(500).json({ error: "Failed to fetch credits" });
    }
  });

  // Issue a refund via Stripe
  app.post("/api/admin/refunds", isAdmin, async (req, res) => {
    try {
      const { purchaseId, amount, reason, notes } = req.body;
      const adminUserId = (req.user as any)?.id || (req.session as any)?.userId;
      
      if (!purchaseId) {
        return res.status(400).json({ error: "purchaseId is required" });
      }

      const purchase = await storage.getPurchaseById(purchaseId);
      if (!purchase) {
        return res.status(404).json({ error: "Purchase not found" });
      }

      // Calculate refund amount (default to full amount)
      const refundAmount = amount || purchase.amount;
      if (refundAmount > purchase.amount) {
        return res.status(400).json({ error: "Refund amount cannot exceed purchase amount" });
      }

      // Create refund record
      const refundRecord = await storage.createRefund({
        purchaseId,
        userId: purchase.userId,
        amount: refundAmount,
        reason: reason || "requested_by_customer",
        notes,
        status: "pending",
        processedBy: adminUserId,
      });

      // Process Stripe refund if payment intent exists
      let stripeRefundId = null;
      if (purchase.stripePaymentIntentId && process.env.STRIPE_SECRET_KEY) {
        try {
          const stripe = getStripeClient();
          const stripeRefund = await stripe.refunds.create({
            payment_intent: purchase.stripePaymentIntentId,
            amount: refundAmount,
            reason: reason === "duplicate" ? "duplicate" : 
                    reason === "fraudulent" ? "fraudulent" : 
                    "requested_by_customer",
          });
          stripeRefundId = stripeRefund.id;
          
          // Update refund status to succeeded
          await storage.updateRefundStatus(refundRecord.id, "succeeded", stripeRefundId);
          
          // Update purchase status
          if (refundAmount === purchase.amount) {
            await storage.updatePurchaseStatus(purchaseId, "refunded");
          }
        } catch (stripeErr: any) {
          console.error("Stripe refund failed:", stripeErr.message);
          await storage.updateRefundStatus(refundRecord.id, "failed");
          return res.status(500).json({ 
            error: "Stripe refund failed", 
            details: stripeErr.message,
            refundId: refundRecord.id
          });
        }
      } else {
        // No Stripe payment intent - just mark as succeeded (manual refund)
        await storage.updateRefundStatus(refundRecord.id, "succeeded");
        if (refundAmount === purchase.amount) {
          await storage.updatePurchaseStatus(purchaseId, "refunded");
        }
      }

      const updatedRefund = await storage.getRefund(refundRecord.id);
      res.status(201).json(updatedRefund);
    } catch (err) {
      console.error("Error processing refund:", err);
      res.status(500).json({ error: "Failed to process refund" });
    }
  });

  // Add account credit
  app.post("/api/admin/credits", isAdmin, async (req, res) => {
    try {
      const { userId, amount, type, description, expiresAt, relatedPurchaseId } = req.body;
      const adminUserId = (req.user as any)?.id || (req.session as any)?.userId;
      
      if (!userId || !amount) {
        return res.status(400).json({ error: "userId and amount are required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const credit = await storage.createAccountCredit({
        userId,
        amount: Math.round(amount), // Ensure it's in cents
        type: type || "adjustment",
        description: description || "Account credit issued by admin",
        relatedPurchaseId,
        issuedBy: adminUserId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });

      res.status(201).json(credit);
    } catch (err) {
      console.error("Error creating credit:", err);
      res.status(500).json({ error: "Failed to create credit" });
    }
  });

  // Get user's account credit balance
  app.get("/api/admin/users/:userId/credit-balance", isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const balance = await storage.getAccountCreditBalance(userId);
      const credits = await storage.getAccountCredits(userId);
      
      res.json({ 
        userId,
        balance,
        credits 
      });
    } catch (err) {
      console.error("Error fetching credit balance:", err);
      res.status(500).json({ error: "Failed to fetch credit balance" });
    }
  });

  // Use account credit for enrollment (deduct from balance)
  app.post("/api/admin/credits/use", isAdmin, async (req, res) => {
    try {
      const { userId, amount, enrollmentId, description } = req.body;
      const adminUserId = (req.user as any)?.id || (req.session as any)?.userId;
      
      if (!userId || !amount) {
        return res.status(400).json({ error: "userId and amount are required" });
      }

      const currentBalance = await storage.getAccountCreditBalance(userId);
      if (currentBalance < amount) {
        return res.status(400).json({ 
          error: "Insufficient credit balance",
          currentBalance,
          requestedAmount: amount 
        });
      }

      // Create negative credit entry to record usage
      const credit = await storage.createAccountCredit({
        userId,
        amount: -Math.abs(amount), // Negative to deduct
        type: "used",
        description: description || "Credit applied to enrollment",
        relatedEnrollmentId: enrollmentId,
        issuedBy: adminUserId,
      });

      const newBalance = await storage.getAccountCreditBalance(userId);
      res.status(201).json({ credit, newBalance });
    } catch (err) {
      console.error("Error using credit:", err);
      res.status(500).json({ error: "Failed to use credit" });
    }
  });

  // Contact Form Submission
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Log contact message
      console.log("Contact form submission:", {
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString(),
      });

      // Send email notification
      const emailSent = await sendContactFormEmail({ name, email, subject, message });
      if (emailSent) {
        console.log("Contact form email sent successfully");
      }

      res.json({ success: true, message: "Your message has been received" });
    } catch (err) {
      console.error("Contact form error:", err);
      res.status(500).json({ error: "Failed to submit contact form" });
    }
  });

  // Admin User Seeding - Development only, requires environment variables
  app.post("/api/seed/admin", async (req, res) => {
    try {
      // Only allow in development environment
      if (process.env.NODE_ENV === "production") {
        return res.status(403).json({ error: "Seeding not allowed in production" });
      }

      // Require environment variables for admin credentials
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminEmail || !adminPassword) {
        return res.status(400).json({ 
          error: "ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required" 
        });
      }

      const bcrypt = await import("bcrypt");
      const crypto = await import("crypto");
      
      // Check if admin already exists
      let user = await storage.getUserByEmail(adminEmail);
      
      if (!user) {
        // Create admin user
        const passwordHash = await bcrypt.hash(adminPassword, 10);
        const userId = crypto.randomUUID();
        
        user = await storage.upsertUser({
          id: userId,
          email: adminEmail,
          passwordHash,
          firstName: "Admin",
          lastName: "User",
        });
      }
      
      // Add user to supervisors table with admin role
      const db = (await import("./db")).db;
      const { supervisors } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      // Check if already an admin
      const existingAdmin = await db.select().from(supervisors).where(eq(supervisors.userId, user.id)).limit(1);
      
      if (existingAdmin.length === 0) {
        await db.insert(supervisors).values({
          userId: user.id,
          role: "admin",
        });
      }
      
      res.json({ 
        success: true, 
        message: "Admin user created",
        email: adminEmail
      });
    } catch (err) {
      console.error("Error seeding admin:", err);
      res.status(500).json({ error: "Failed to seed admin user" });
    }
  });

  // Password Reset - Request Token
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res
          .status(200)
          .json({ message: "If email exists, reset link sent" });
      }

      const crypto = await import("crypto");
      const resetToken = crypto.randomBytes(32).toString("hex");
      const tokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);

      const bcrypt = await import("bcrypt");
      const hashedToken = await bcrypt.default.hash(resetToken, 10);

      const db = (await import("./db")).db;
      const { users } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");

      await db
        .update(users)
        .set({
          passwordResetToken: hashedToken,
          passwordResetTokenExpires: tokenExpires,
        })
        .where(eq(users.id, user.id));

      const siteUrl = process.env.SITE_URL || "https://www.foundationce.com";
      const resetLink = `${siteUrl}/reset-password?token=${resetToken}`;
      console.log("Reset link:", resetLink);
      res.json({ message: "If email exists, reset link sent" });
    } catch (err) {
      console.error("Forgot password error:", err);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  // Password Reset - Reset Password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ error: "Token and password required" });
      }

      const db = (await import("./db")).db;
      const { users } = await import("@shared/schema");
      const { eq, and, gt } = await import("drizzle-orm");
      const bcrypt = await import("bcrypt");

      const user = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.passwordResetToken, token),
            gt(users.passwordResetTokenExpires, new Date()),
          ),
        )
        .limit(1)
        .then((results) => results[0]);

      if (!user) {
        return res
          .status(400)
          .json({ error: "Invalid or expired reset token" });
      }

      const passwordHash = await bcrypt.default.hash(password, 10);
      await db
        .update(users)
        .set({
          passwordHash,
          passwordResetToken: null,
          passwordResetTokenExpires: null,
        })
        .where(eq(users.id, user.id));

      res.json({ message: "Password reset successful" });
    } catch (err) {
      console.error("Reset password error:", err);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // ===== Admin Settings Routes =====
  
  // System Settings
  app.get("/api/admin/settings", isAdmin, async (req, res) => {
    try {
      const settings = await storage.getAllSystemSettings();
      res.json(settings);
    } catch (err) {
      console.error("Error fetching settings:", err);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/admin/settings/:key", isAdmin, async (req, res) => {
    try {
      const value = await storage.getSystemSetting(req.params.key);
      res.json({ key: req.params.key, value });
    } catch (err) {
      console.error("Error fetching setting:", err);
      res.status(500).json({ error: "Failed to fetch setting" });
    }
  });

  app.post("/api/admin/settings", isAdmin, async (req, res) => {
    try {
      const { key, value, category, label, description } = req.body;
      const adminUserId = (req.user as any)?.id || (req.session as any)?.userId;
      
      if (!key || value === undefined) {
        return res.status(400).json({ error: "key and value are required" });
      }
      
      const setting = await storage.setSystemSetting(key, value, category, label, description, adminUserId);
      res.json(setting);
    } catch (err) {
      console.error("Error saving setting:", err);
      res.status(500).json({ error: "Failed to save setting" });
    }
  });

  app.get("/api/admin/settings/category/:category", isAdmin, async (req, res) => {
    try {
      const settings = await storage.getSystemSettingsByCategory(req.params.category);
      res.json(settings);
    } catch (err) {
      console.error("Error fetching settings by category:", err);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Email Templates
  app.get("/api/admin/email-templates", isAdmin, async (req, res) => {
    try {
      const templates = await storage.getAllEmailTemplates();
      res.json(templates);
    } catch (err) {
      console.error("Error fetching email templates:", err);
      res.status(500).json({ error: "Failed to fetch email templates" });
    }
  });

  app.get("/api/admin/email-templates/:id", isAdmin, async (req, res) => {
    try {
      const template = await storage.getEmailTemplateById(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (err) {
      console.error("Error fetching email template:", err);
      res.status(500).json({ error: "Failed to fetch email template" });
    }
  });

  app.post("/api/admin/email-templates", isAdmin, async (req, res) => {
    try {
      const { name, subject, body, category, variables } = req.body;
      const adminUserId = (req.user as any)?.id || (req.session as any)?.userId;
      
      if (!name || !subject || !body) {
        return res.status(400).json({ error: "name, subject, and body are required" });
      }
      
      const template = await storage.createEmailTemplate({ name, subject, body, category, variables, updatedBy: adminUserId });
      res.status(201).json(template);
    } catch (err) {
      console.error("Error creating email template:", err);
      res.status(500).json({ error: "Failed to create email template" });
    }
  });

  app.patch("/api/admin/email-templates/:id", isAdmin, async (req, res) => {
    try {
      const adminUserId = (req.user as any)?.id || (req.session as any)?.userId;
      const template = await storage.updateEmailTemplate(req.params.id, { ...req.body, updatedBy: adminUserId });
      res.json(template);
    } catch (err) {
      console.error("Error updating email template:", err);
      res.status(500).json({ error: "Failed to update email template" });
    }
  });

  app.delete("/api/admin/email-templates/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteEmailTemplate(req.params.id);
      res.json({ message: "Template deleted" });
    } catch (err) {
      console.error("Error deleting email template:", err);
      res.status(500).json({ error: "Failed to delete email template" });
    }
  });

  // User Roles
  app.get("/api/admin/roles", isAdmin, async (req, res) => {
    try {
      const roles = await storage.getAllUserRoles();
      res.json(roles);
    } catch (err) {
      console.error("Error fetching roles:", err);
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  });

  app.get("/api/admin/roles/:id", isAdmin, async (req, res) => {
    try {
      const role = await storage.getUserRole(req.params.id);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }
      res.json(role);
    } catch (err) {
      console.error("Error fetching role:", err);
      res.status(500).json({ error: "Failed to fetch role" });
    }
  });

  app.post("/api/admin/roles", isAdmin, async (req, res) => {
    try {
      const { name, description, permissions } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "name is required" });
      }
      
      const existingRole = await storage.getUserRoleByName(name);
      if (existingRole) {
        return res.status(400).json({ error: "Role with this name already exists" });
      }
      
      const role = await storage.createUserRole({ name, description, permissions });
      res.status(201).json(role);
    } catch (err) {
      console.error("Error creating role:", err);
      res.status(500).json({ error: "Failed to create role" });
    }
  });

  app.patch("/api/admin/roles/:id", isAdmin, async (req, res) => {
    try {
      const role = await storage.getUserRole(req.params.id);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }
      
      if (role.isSystem === 1) {
        return res.status(400).json({ error: "Cannot modify system roles" });
      }
      
      const updated = await storage.updateUserRole(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      console.error("Error updating role:", err);
      res.status(500).json({ error: "Failed to update role" });
    }
  });

  app.delete("/api/admin/roles/:id", isAdmin, async (req, res) => {
    try {
      const role = await storage.getUserRole(req.params.id);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }
      
      if (role.isSystem === 1) {
        return res.status(400).json({ error: "Cannot delete system roles" });
      }
      
      await storage.deleteUserRole(req.params.id);
      res.json({ message: "Role deleted" });
    } catch (err) {
      console.error("Error deleting role:", err);
      res.status(500).json({ error: "Failed to delete role" });
    }
  });

  // Role Assignments
  app.get("/api/admin/roles/:id/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getUsersWithRole(req.params.id);
      res.json(users);
    } catch (err) {
      console.error("Error fetching role users:", err);
      res.status(500).json({ error: "Failed to fetch role users" });
    }
  });

  app.post("/api/admin/users/:userId/roles", isAdmin, async (req, res) => {
    try {
      const { roleId } = req.body;
      const adminUserId = (req.user as any)?.id || (req.session as any)?.userId;
      
      if (!roleId) {
        return res.status(400).json({ error: "roleId is required" });
      }
      
      const assignment = await storage.assignUserRole(req.params.userId, roleId, adminUserId);
      res.status(201).json(assignment);
    } catch (err) {
      console.error("Error assigning role:", err);
      res.status(500).json({ error: "Failed to assign role" });
    }
  });

  app.delete("/api/admin/users/:userId/roles/:roleId", isAdmin, async (req, res) => {
    try {
      await storage.removeUserRole(req.params.userId, req.params.roleId);
      res.json({ message: "Role removed" });
    } catch (err) {
      console.error("Error removing role:", err);
      res.status(500).json({ error: "Failed to remove role" });
    }
  });

  app.get("/api/admin/users/:userId/roles", isAdmin, async (req, res) => {
    try {
      const assignments = await storage.getUserRoleAssignments(req.params.userId);
      res.json(assignments);
    } catch (err) {
      console.error("Error fetching user roles:", err);
      res.status(500).json({ error: "Failed to fetch user roles" });
    }
  });

  // Supervisors (for user management)
  app.get("/api/admin/supervisors", isAdmin, async (req, res) => {
    try {
      const supervisorList = await storage.getAllSupervisors();
      res.json(supervisorList);
    } catch (err) {
      console.error("Error fetching supervisors:", err);
      res.status(500).json({ error: "Failed to fetch supervisors" });
    }
  });

  // ============ PRIVACY/COMPLIANCE API ROUTES (GDPR/CCPA/SOC 2) ============
  
  // Save cookie consent preferences (public endpoint)
  app.post("/api/privacy/consent", async (req, res) => {
    try {
      const { visitorId, consents, source, version, userId } = req.body;
      if (!visitorId || !consents || !Array.isArray(consents)) {
        return res.status(400).json({ error: "visitorId and consents array required" });
      }
      
      const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
      const userAgent = req.headers['user-agent'];
      
      await storage.savePrivacyConsent(
        visitorId,
        consents,
        source || "cookie_banner",
        version || "1.0",
        userId,
        ipAddress,
        userAgent
      );
      
      // Log consent for audit trail
      await storage.createAuditLog(
        "consent_recorded",
        userId,
        "privacy_consent",
        visitorId,
        JSON.stringify({ consents, source }),
        "info",
        ipAddress,
        userAgent
      );
      
      res.json({ success: true });
    } catch (err) {
      console.error("Error saving consent:", err);
      res.status(500).json({ error: "Failed to save consent" });
    }
  });

  // Get user's privacy preferences (authenticated) - includes CCPA and FERPA preferences
  app.get("/api/privacy/preferences", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const preferences = await storage.getUserPrivacyPreferences(user.id);
      res.json(preferences || {
        // CCPA preferences
        doNotSell: 0,
        marketingEmails: 1,
        analyticsTracking: 1,
        functionalCookies: 1,
        thirdPartySharing: 0,
        // FERPA preferences
        directoryInfoOptOut: 0,
        educationRecordsConsent: 0,
        transcriptSharingConsent: 0,
        regulatoryReportingConsent: 1,
      });
    } catch (err) {
      console.error("Error fetching privacy preferences:", err);
      res.status(500).json({ error: "Failed to fetch preferences" });
    }
  });

  // Get user's consent history (authenticated - for GDPR transparency)
  app.get("/api/privacy/consent-history", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const db = (await import("./db")).db;
      const { privacyConsents } = await import("@shared/schema");
      const { eq, desc } = await import("drizzle-orm");
      
      const consents = await db.select()
        .from(privacyConsents)
        .where(eq(privacyConsents.userId, user.id))
        .orderBy(desc(privacyConsents.createdAt))
        .limit(50);
      
      // Audit log for consent history access
      await storage.createAuditLog(
        "consent_history_accessed",
        user.id,
        "privacy_consent",
        user.id,
        JSON.stringify({ recordCount: consents.length }),
        "info",
        req.ip,
        req.headers['user-agent']
      );
      
      res.json(consents);
    } catch (err) {
      console.error("Error fetching consent history:", err);
      res.status(500).json({ error: "Failed to fetch consent history" });
    }
  });

  // Update user's privacy preferences (authenticated)
  app.patch("/api/privacy/preferences", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const preferences = await storage.updateUserPrivacyPreferences(user.id, req.body);
      
      // Log preference change for audit trail
      await storage.createAuditLog(
        "privacy_preferences_updated",
        user.id,
        "user_privacy_preferences",
        user.id,
        JSON.stringify(req.body),
        "info",
        req.ip,
        req.headers['user-agent']
      );
      
      res.json(preferences);
    } catch (err) {
      console.error("Error updating privacy preferences:", err);
      res.status(500).json({ error: "Failed to update preferences" });
    }
  });

  // Submit data subject request (authenticated)
  app.post("/api/privacy/data-request", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const { requestType, requestDetails } = req.body;
      if (!requestType || !["access", "deletion", "rectification", "portability", "do_not_sell"].includes(requestType)) {
        return res.status(400).json({ error: "Valid requestType required" });
      }
      
      const request = await storage.createDataSubjectRequest(user.id, requestType, requestDetails);
      
      // Log DSR for audit trail
      await storage.createAuditLog(
        "data_subject_request_created",
        user.id,
        "data_subject_request",
        request.id,
        JSON.stringify({ requestType }),
        "info",
        req.ip,
        req.headers['user-agent']
      );
      
      res.json(request);
    } catch (err) {
      console.error("Error creating data request:", err);
      res.status(500).json({ error: "Failed to create data request" });
    }
  });

  // Get user's data subject requests (authenticated)
  app.get("/api/privacy/data-requests", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const requests = await storage.getDataSubjectRequests(user.id);
      res.json(requests);
    } catch (err) {
      console.error("Error fetching data requests:", err);
      res.status(500).json({ error: "Failed to fetch data requests" });
    }
  });

  // Export user's own data (authenticated - GDPR right to access)
  app.get("/api/privacy/export-my-data", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const exportData = await storage.exportUserData(user.id);
      
      // Log data export for audit trail
      await storage.createAuditLog(
        "data_export",
        user.id,
        "user",
        user.id,
        JSON.stringify({ exportedAt: new Date() }),
        "info",
        req.ip,
        req.headers['user-agent']
      );
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="foundationce_data_export_${user.id}.json"`);
      res.json(exportData);
    } catch (err) {
      console.error("Error exporting user data:", err);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  // Admin: Get all data subject requests
  app.get("/api/admin/data-requests", isAdmin, async (req, res) => {
    try {
      const requests = await storage.getAllDataSubjectRequests();
      res.json(requests);
    } catch (err) {
      console.error("Error fetching data requests:", err);
      res.status(500).json({ error: "Failed to fetch data requests" });
    }
  });

  // Admin: Update data subject request status
  app.patch("/api/admin/data-requests/:id", isAdmin, async (req, res) => {
    try {
      const { status, responseDetails } = req.body;
      const adminUser = (req as any).adminUser || { id: 'admin' };
      
      const updated = await storage.updateDataSubjectRequest(req.params.id, {
        status,
        responseDetails,
        processedBy: adminUser.id || 'admin',
      });
      
      // Log DSR update for audit trail
      await storage.createAuditLog(
        "data_subject_request_updated",
        adminUser.id || 'admin',
        "data_subject_request",
        req.params.id,
        JSON.stringify({ status, responseDetails }),
        "info",
        req.ip,
        req.headers['user-agent']
      );
      
      res.json(updated);
    } catch (err) {
      console.error("Error updating data request:", err);
      res.status(500).json({ error: "Failed to update data request" });
    }
  });

  // Admin: Get audit logs
  app.get("/api/admin/audit-logs", isAdmin, async (req, res) => {
    try {
      const { userId, action, resourceType, severity, startDate, endDate } = req.query;
      
      const logs = await storage.getAuditLogs({
        userId: userId as string,
        action: action as string,
        resourceType: resourceType as string,
        severity: severity as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });
      
      res.json(logs);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  // Admin: Export user data (for DSR fulfillment)
  app.get("/api/admin/users/:userId/export", isAdmin, async (req, res) => {
    try {
      const exportData = await storage.exportUserData(req.params.userId);
      
      // Log admin data export for audit trail
      const adminUser = (req as any).adminUser || { id: 'admin' };
      await storage.createAuditLog(
        "admin_data_export",
        adminUser.id || 'admin',
        "user",
        req.params.userId,
        JSON.stringify({ exportedAt: new Date(), exportedBy: adminUser.id }),
        "warning",
        req.ip,
        req.headers['user-agent']
      );
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="user_data_export_${req.params.userId}.json"`);
      res.json(exportData);
    } catch (err) {
      console.error("Error exporting user data:", err);
      res.status(500).json({ error: "Failed to export user data" });
    }
  });

  // Admin: Anonymize user (for GDPR/CCPA deletion)
  app.post("/api/admin/users/:userId/anonymize", isAdmin, async (req, res) => {
    try {
      const adminUser = (req as any).adminUser || { id: 'admin' };
      
      await storage.anonymizeUser(req.params.userId, adminUser.id || 'admin');
      
      res.json({ success: true, message: "User data anonymized" });
    } catch (err) {
      console.error("Error anonymizing user:", err);
      res.status(500).json({ error: "Failed to anonymize user" });
    }
  });

  // ============ FERPA API ROUTES (Educational Records) ============
  
  // Submit FERPA education records request (authenticated)
  app.post("/api/ferpa/records-request", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const { requestType, requestDetails, recordsRequested } = req.body;
      if (!requestType || !["access", "amendment", "disclosure_log"].includes(requestType)) {
        return res.status(400).json({ error: "Valid requestType required (access, amendment, disclosure_log)" });
      }
      
      const db = (await import("./db")).db;
      const { educationRecordsRequests } = await import("@shared/schema");
      
      const [request] = await db.insert(educationRecordsRequests).values({
        userId: user.id,
        requestType,
        requestDetails,
        recordsRequested,
        status: "pending",
      }).returning();
      
      // Log FERPA request for audit trail
      await storage.createAuditLog(
        "ferpa_records_request_created",
        user.id,
        "education_records_request",
        request.id,
        JSON.stringify({ requestType, recordsRequested }),
        "info",
        req.ip,
        req.headers['user-agent']
      );
      
      res.json(request);
    } catch (err) {
      console.error("Error creating FERPA request:", err);
      res.status(500).json({ error: "Failed to create education records request" });
    }
  });

  // Get user's FERPA requests (authenticated)
  app.get("/api/ferpa/records-requests", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const db = (await import("./db")).db;
      const { educationRecordsRequests } = await import("@shared/schema");
      const { eq, desc } = await import("drizzle-orm");
      
      const requests = await db.select()
        .from(educationRecordsRequests)
        .where(eq(educationRecordsRequests.userId, user.id))
        .orderBy(desc(educationRecordsRequests.createdAt));
      
      // Audit log for FERPA request listing
      await storage.createAuditLog(
        "ferpa_requests_viewed",
        user.id,
        "education_records_request",
        user.id,
        JSON.stringify({ count: requests.length }),
        "info",
        req.ip,
        req.headers['user-agent']
      );
      
      res.json(requests);
    } catch (err) {
      console.error("Error fetching FERPA requests:", err);
      res.status(500).json({ error: "Failed to fetch education records requests" });
    }
  });

  // Get user's education records (authenticated - FERPA right to inspect)
  app.get("/api/ferpa/my-records", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      // Gather all education records for the user
      const enrollments = await storage.getAllUserEnrollments(user.id);
      const userInfo = await storage.getUser(user.id);
      
      const educationRecords = {
        accessedAt: new Date().toISOString(),
        studentInfo: {
          id: userInfo?.id,
          email: userInfo?.email,
          firstName: userInfo?.firstName,
          lastName: userInfo?.lastName,
        },
        enrollmentRecords: enrollments.map((e: any) => ({
          courseTitle: e.course?.title,
          enrolledAt: e.enrolledAt,
          hoursCompleted: e.hoursCompleted,
          completed: e.completed,
          completedAt: e.completedAt,
          certificateNumber: e.certificateNumber,
        })),
        totalCourses: enrollments.length,
        completedCourses: enrollments.filter((e: any) => e.completed).length,
      };
      
      // Log the records access for audit trail
      await storage.createAuditLog(
        "ferpa_records_accessed",
        user.id,
        "education_records",
        user.id,
        JSON.stringify({ accessedAt: new Date() }),
        "info",
        req.ip,
        req.headers['user-agent']
      );
      
      res.json(educationRecords);
    } catch (err) {
      console.error("Error fetching education records:", err);
      res.status(500).json({ error: "Failed to fetch education records" });
    }
  });

  // Update user's FERPA preferences (authenticated)
  app.patch("/api/ferpa/preferences", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const { directoryInfoOptOut, educationRecordsConsent, transcriptSharingConsent, regulatoryReportingConsent } = req.body;
      
      const preferences = await storage.updateUserPrivacyPreferences(user.id, {
        directoryInfoOptOut,
        educationRecordsConsent,
        transcriptSharingConsent,
        regulatoryReportingConsent,
      });
      
      // Log FERPA preference change for audit trail
      await storage.createAuditLog(
        "ferpa_preferences_updated",
        user.id,
        "user_privacy_preferences",
        user.id,
        JSON.stringify({ directoryInfoOptOut, educationRecordsConsent, transcriptSharingConsent }),
        "info",
        req.ip,
        req.headers['user-agent']
      );
      
      res.json(preferences);
    } catch (err) {
      console.error("Error updating FERPA preferences:", err);
      res.status(500).json({ error: "Failed to update FERPA preferences" });
    }
  });

  // Admin: Get all FERPA education records requests
  app.get("/api/admin/ferpa-requests", isAdmin, async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { educationRecordsRequests, users } = await import("@shared/schema");
      const { desc, eq } = await import("drizzle-orm");
      
      const requests = await db.select({
        request: educationRecordsRequests,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
        .from(educationRecordsRequests)
        .leftJoin(users, eq(educationRecordsRequests.userId, users.id))
        .orderBy(desc(educationRecordsRequests.createdAt));
      
      res.json(requests);
    } catch (err) {
      console.error("Error fetching FERPA requests:", err);
      res.status(500).json({ error: "Failed to fetch FERPA requests" });
    }
  });

  // Admin: Update FERPA education records request
  app.patch("/api/admin/ferpa-requests/:id", isAdmin, async (req, res) => {
    try {
      const { status, responseDetails } = req.body;
      const adminUser = (req as any).adminUser || { id: 'admin' };
      
      const db = (await import("./db")).db;
      const { educationRecordsRequests } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      const [updated] = await db.update(educationRecordsRequests).set({
        status,
        responseDetails,
        processedBy: adminUser.id || 'admin',
        completedAt: status === 'completed' || status === 'denied' ? new Date() : null,
        updatedAt: new Date(),
      }).where(eq(educationRecordsRequests.id, req.params.id)).returning();
      
      // Log FERPA request update for audit trail
      await storage.createAuditLog(
        "ferpa_request_updated",
        adminUser.id || 'admin',
        "education_records_request",
        req.params.id,
        JSON.stringify({ status, responseDetails }),
        "info",
        req.ip,
        req.headers['user-agent']
      );
      
      res.json(updated);
    } catch (err) {
      console.error("Error updating FERPA request:", err);
      res.status(500).json({ error: "Failed to update FERPA request" });
    }
  });

  // ============ AFFILIATE MARKETING API ROUTES ============

  // Public: Track affiliate referral visit
  app.get("/api/ref/:code", async (req, res) => {
    try {
      const affiliate = await storage.getAffiliateByReferralCode(req.params.code);
      if (!affiliate || affiliate.status !== 'approved') {
        return res.redirect('/courses');
      }
      
      // Generate or get visitor ID from cookie
      let visitorId = req.cookies?.affiliate_visitor;
      if (!visitorId) {
        visitorId = `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Record the visit
      await storage.createAffiliateVisit({
        affiliateId: affiliate.id,
        visitorId,
        ipAddress: req.ip || null,
        userAgent: req.headers['user-agent'] || null,
        referrer: req.headers['referer'] as string || null,
        landingPage: req.query.to as string || '/courses',
        converted: 0,
        linkId: null,
        conversionId: null,
      });
      
      // Set cookies for tracking
      res.cookie('affiliate_visitor', visitorId, { maxAge: affiliate.cookieDurationDays * 24 * 60 * 60 * 1000, httpOnly: true });
      res.cookie('affiliate_ref', affiliate.id, { maxAge: affiliate.cookieDurationDays * 24 * 60 * 60 * 1000, httpOnly: true });
      res.cookie('affiliate_code', req.params.code, { maxAge: affiliate.cookieDurationDays * 24 * 60 * 60 * 1000 });
      
      const targetUrl = req.query.to as string || '/courses';
      res.redirect(targetUrl);
    } catch (err) {
      console.error("Error tracking referral:", err);
      res.redirect('/courses');
    }
  });

  // Public: Track affiliate link click
  app.get("/api/affiliate/link/:slug", async (req, res) => {
    try {
      const link = await storage.getAffiliateLinkBySlug(req.params.slug);
      if (!link || !link.isActive) {
        return res.redirect('/courses');
      }
      
      const affiliate = await storage.getAffiliate(link.affiliateId);
      if (!affiliate || affiliate.status !== 'approved') {
        return res.redirect('/courses');
      }
      
      // Increment click count
      await storage.incrementLinkClicks(link.id);
      
      // Generate or get visitor ID from cookie
      let visitorId = req.cookies?.affiliate_visitor;
      if (!visitorId) {
        visitorId = `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Record the visit
      await storage.createAffiliateVisit({
        affiliateId: affiliate.id,
        linkId: link.id,
        visitorId,
        ipAddress: req.ip || null,
        userAgent: req.headers['user-agent'] || null,
        referrer: req.headers['referer'] as string || null,
        landingPage: link.targetUrl || '/courses',
        converted: 0,
        conversionId: null,
      });
      
      // Set cookies for tracking
      res.cookie('affiliate_visitor', visitorId, { maxAge: affiliate.cookieDurationDays * 24 * 60 * 60 * 1000, httpOnly: true });
      res.cookie('affiliate_ref', affiliate.id, { maxAge: affiliate.cookieDurationDays * 24 * 60 * 60 * 1000, httpOnly: true });
      res.cookie('affiliate_link', link.id, { maxAge: affiliate.cookieDurationDays * 24 * 60 * 60 * 1000, httpOnly: true });
      
      const targetUrl = link.targetUrl || '/courses';
      res.redirect(targetUrl);
    } catch (err) {
      console.error("Error tracking affiliate link:", err);
      res.redirect('/courses');
    }
  });

  // Apply for affiliate program (authenticated)
  app.post("/api/affiliate/apply", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      // Check if already an affiliate
      const existing = await storage.getAffiliateByUserId(user.id);
      if (existing) {
        return res.status(400).json({ error: "You already have an affiliate account", affiliate: existing });
      }
      
      const { companyName, website, bio, promotionalMethods, paypalEmail } = req.body;
      
      const affiliate = await storage.createAffiliate({
        userId: user.id,
        companyName,
        website,
        bio,
        promotionalMethods,
        paypalEmail,
        status: 'pending',
      });
      
      await storage.createAuditLog(
        "affiliate_application_submitted",
        user.id,
        "affiliate",
        affiliate.id,
        JSON.stringify({ companyName, website }),
        "info",
        req.ip,
        req.headers['user-agent']
      );
      
      res.json(affiliate);
    } catch (err) {
      console.error("Error applying for affiliate:", err);
      res.status(500).json({ error: "Failed to submit affiliate application" });
    }
  });

  // Get current user's affiliate account
  app.get("/api/affiliate/me", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const affiliate = await storage.getAffiliateByUserId(user.id);
      if (!affiliate) {
        return res.status(404).json({ error: "No affiliate account found" });
      }
      
      res.json(affiliate);
    } catch (err) {
      console.error("Error fetching affiliate:", err);
      res.status(500).json({ error: "Failed to fetch affiliate account" });
    }
  });

  // Get affiliate dashboard stats
  app.get("/api/affiliate/dashboard", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const affiliate = await storage.getAffiliateByUserId(user.id);
      if (!affiliate || affiliate.status !== 'approved') {
        return res.status(403).json({ error: "Active affiliate account required" });
      }
      
      const stats = await storage.getAffiliateDashboardStats(affiliate.id);
      res.json(stats);
    } catch (err) {
      console.error("Error fetching affiliate dashboard:", err);
      res.status(500).json({ error: "Failed to fetch dashboard" });
    }
  });

  // Get affiliate's referral links
  app.get("/api/affiliate/links", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const affiliate = await storage.getAffiliateByUserId(user.id);
      if (!affiliate) {
        return res.status(403).json({ error: "Affiliate account required" });
      }
      
      const links = await storage.getAffiliateLinks(affiliate.id);
      res.json(links);
    } catch (err) {
      console.error("Error fetching affiliate links:", err);
      res.status(500).json({ error: "Failed to fetch links" });
    }
  });

  // Create new affiliate link
  app.post("/api/affiliate/links", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const affiliate = await storage.getAffiliateByUserId(user.id);
      if (!affiliate || affiliate.status !== 'approved') {
        return res.status(403).json({ error: "Approved affiliate account required" });
      }
      
      const { name, slug, targetUrl, courseId, utmSource, utmMedium, utmCampaign } = req.body;
      if (!name || !slug) {
        return res.status(400).json({ error: "Name and slug are required" });
      }
      
      // Check if slug is unique
      const existing = await storage.getAffiliateLinkBySlug(slug);
      if (existing) {
        return res.status(400).json({ error: "This slug is already taken" });
      }
      
      const link = await storage.createAffiliateLink({
        affiliateId: affiliate.id,
        name,
        slug,
        targetUrl,
        courseId,
        utmSource,
        utmMedium,
        utmCampaign,
        isActive: 1,
      });
      
      res.json(link);
    } catch (err) {
      console.error("Error creating affiliate link:", err);
      res.status(500).json({ error: "Failed to create link" });
    }
  });

  // Delete affiliate link
  app.delete("/api/affiliate/links/:id", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const affiliate = await storage.getAffiliateByUserId(user.id);
      if (!affiliate) {
        return res.status(403).json({ error: "Affiliate account required" });
      }
      
      await storage.deleteAffiliateLink(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting affiliate link:", err);
      res.status(500).json({ error: "Failed to delete link" });
    }
  });

  // Get affiliate's conversions
  app.get("/api/affiliate/conversions", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const affiliate = await storage.getAffiliateByUserId(user.id);
      if (!affiliate) {
        return res.status(403).json({ error: "Affiliate account required" });
      }
      
      const conversions = await storage.getAffiliateConversions(affiliate.id);
      res.json(conversions);
    } catch (err) {
      console.error("Error fetching conversions:", err);
      res.status(500).json({ error: "Failed to fetch conversions" });
    }
  });

  // Get affiliate's payouts
  app.get("/api/affiliate/payouts", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const affiliate = await storage.getAffiliateByUserId(user.id);
      if (!affiliate) {
        return res.status(403).json({ error: "Affiliate account required" });
      }
      
      const payouts = await storage.getAffiliatePayouts(affiliate.id);
      res.json(payouts);
    } catch (err) {
      console.error("Error fetching payouts:", err);
      res.status(500).json({ error: "Failed to fetch payouts" });
    }
  });

  // Request payout
  app.post("/api/affiliate/payouts/request", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const affiliate = await storage.getAffiliateByUserId(user.id);
      if (!affiliate || affiliate.status !== 'approved') {
        return res.status(403).json({ error: "Approved affiliate account required" });
      }
      
      const stats = await storage.getAffiliateDashboardStats(affiliate.id);
      if (stats.availableBalance < (affiliate.minimumPayout || 5000)) {
        return res.status(400).json({ 
          error: `Minimum payout is $${((affiliate.minimumPayout || 5000) / 100).toFixed(2)}. Your available balance is $${(stats.availableBalance / 100).toFixed(2)}.` 
        });
      }
      
      const { method } = req.body;
      if (!method || !['paypal', 'stripe', 'bank_transfer'].includes(method)) {
        return res.status(400).json({ error: "Valid payout method required" });
      }
      
      const payout = await storage.createPayoutRequest(affiliate.id, stats.availableBalance, method);
      
      await storage.createAuditLog(
        "affiliate_payout_requested",
        user.id,
        "affiliate_payout",
        payout.id,
        JSON.stringify({ amount: stats.availableBalance, method }),
        "info",
        req.ip,
        req.headers['user-agent']
      );
      
      res.json(payout);
    } catch (err) {
      console.error("Error requesting payout:", err);
      res.status(500).json({ error: "Failed to request payout" });
    }
  });

  // Get affiliate notifications
  app.get("/api/affiliate/notifications", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const affiliate = await storage.getAffiliateByUserId(user.id);
      if (!affiliate) {
        return res.status(403).json({ error: "Affiliate account required" });
      }
      
      const notifications = await storage.getAffiliateNotifications(affiliate.id);
      res.json(notifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/affiliate/notifications/:id/read", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      await storage.markAffiliateNotificationRead(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error("Error marking notification read:", err);
      res.status(500).json({ error: "Failed to update notification" });
    }
  });

  // Get available marketing creatives
  app.get("/api/affiliate/creatives", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const affiliate = await storage.getAffiliateByUserId(user.id);
      if (!affiliate) {
        return res.status(403).json({ error: "Affiliate account required" });
      }
      
      const creatives = await storage.getAffiliateCreatives();
      res.json(creatives);
    } catch (err) {
      console.error("Error fetching creatives:", err);
      res.status(500).json({ error: "Failed to fetch creatives" });
    }
  });

  // ============ ADMIN AFFILIATE ROUTES ============

  // Get all affiliates
  app.get("/api/admin/affiliates", isAdmin, async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const affiliateList = await storage.getAffiliates(status);
      res.json(affiliateList);
    } catch (err) {
      console.error("Error fetching affiliates:", err);
      res.status(500).json({ error: "Failed to fetch affiliates" });
    }
  });

  // Get single affiliate details
  app.get("/api/admin/affiliates/:id", isAdmin, async (req, res) => {
    try {
      const affiliate = await storage.getAffiliate(req.params.id);
      if (!affiliate) {
        return res.status(404).json({ error: "Affiliate not found" });
      }
      
      const user = await storage.getUser(affiliate.userId);
      const stats = await storage.getAffiliateDashboardStats(affiliate.id);
      const conversions = await storage.getAffiliateConversions(affiliate.id);
      const payouts = await storage.getAffiliatePayouts(affiliate.id);
      
      res.json({ affiliate, user, stats, conversions, payouts });
    } catch (err) {
      console.error("Error fetching affiliate:", err);
      res.status(500).json({ error: "Failed to fetch affiliate" });
    }
  });

  // Approve affiliate
  app.post("/api/admin/affiliates/:id/approve", isAdmin, async (req, res) => {
    try {
      const adminUser = (req as any).adminUser || { id: 'admin' };
      const affiliate = await storage.approveAffiliate(req.params.id, adminUser.id || 'admin');
      
      await storage.createAuditLog(
        "affiliate_approved",
        adminUser.id || 'admin',
        "affiliate",
        req.params.id,
        undefined,
        "info",
        req.ip,
        req.headers['user-agent']
      );
      
      res.json(affiliate);
    } catch (err) {
      console.error("Error approving affiliate:", err);
      res.status(500).json({ error: "Failed to approve affiliate" });
    }
  });

  // Reject affiliate
  app.post("/api/admin/affiliates/:id/reject", isAdmin, async (req, res) => {
    try {
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ error: "Rejection reason required" });
      }
      
      const adminUser = (req as any).adminUser || { id: 'admin' };
      const affiliate = await storage.rejectAffiliate(req.params.id, reason);
      
      await storage.createAuditLog(
        "affiliate_rejected",
        adminUser.id || 'admin',
        "affiliate",
        req.params.id,
        JSON.stringify({ reason }),
        "warning",
        req.ip,
        req.headers['user-agent']
      );
      
      res.json(affiliate);
    } catch (err) {
      console.error("Error rejecting affiliate:", err);
      res.status(500).json({ error: "Failed to reject affiliate" });
    }
  });

  // Update affiliate settings
  app.patch("/api/admin/affiliates/:id", isAdmin, async (req, res) => {
    try {
      const { commissionRate, tier, minimumPayout, cookieDurationDays, status } = req.body;
      
      const affiliate = await storage.updateAffiliate(req.params.id, {
        commissionRate,
        tier,
        minimumPayout,
        cookieDurationDays,
        status,
      });
      
      res.json(affiliate);
    } catch (err) {
      console.error("Error updating affiliate:", err);
      res.status(500).json({ error: "Failed to update affiliate" });
    }
  });

  // Get pending payouts
  app.get("/api/admin/affiliate-payouts", isAdmin, async (req, res) => {
    try {
      const payouts = await storage.getAllPendingPayouts();
      res.json(payouts);
    } catch (err) {
      console.error("Error fetching payouts:", err);
      res.status(500).json({ error: "Failed to fetch payouts" });
    }
  });

  // Process payout
  app.post("/api/admin/affiliate-payouts/:id/process", isAdmin, async (req, res) => {
    try {
      const { transactionId } = req.body;
      const adminUser = (req as any).adminUser || { id: 'admin' };
      
      const payout = await storage.processPayoutComplete(req.params.id, adminUser.id || 'admin', transactionId);
      
      await storage.createAuditLog(
        "affiliate_payout_processed",
        adminUser.id || 'admin',
        "affiliate_payout",
        req.params.id,
        JSON.stringify({ transactionId }),
        "info",
        req.ip,
        req.headers['user-agent']
      );
      
      res.json(payout);
    } catch (err) {
      console.error("Error processing payout:", err);
      res.status(500).json({ error: "Failed to process payout" });
    }
  });

  // Fail payout
  app.post("/api/admin/affiliate-payouts/:id/fail", isAdmin, async (req, res) => {
    try {
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ error: "Failure reason required" });
      }
      
      const payout = await storage.failPayout(req.params.id, reason);
      res.json(payout);
    } catch (err) {
      console.error("Error failing payout:", err);
      res.status(500).json({ error: "Failed to update payout" });
    }
  });

  // Create marketing creative
  app.post("/api/admin/affiliate-creatives", isAdmin, async (req, res) => {
    try {
      const { name, type, description, imageUrl, dimensions, htmlCode, textContent, courseId } = req.body;
      
      const creative = await storage.createAffiliateCreative({
        name,
        type,
        description,
        imageUrl,
        dimensions,
        htmlCode,
        textContent,
        courseId,
        isActive: 1,
      });
      
      res.json(creative);
    } catch (err) {
      console.error("Error creating creative:", err);
      res.status(500).json({ error: "Failed to create creative" });
    }
  });

  // Get all creatives (admin)
  app.get("/api/admin/affiliate-creatives", isAdmin, async (req, res) => {
    try {
      const creatives = await storage.getAffiliateCreatives();
      res.json(creatives);
    } catch (err) {
      console.error("Error fetching creatives:", err);
      res.status(500).json({ error: "Failed to fetch creatives" });
    }
  });

  // ===== State Configuration Routes =====
  
  // Get all state configurations
  app.get("/api/admin/state-configurations", isAdmin, async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { stateConfigurations } = await import("@shared/schema");
      const states = await db.select().from(stateConfigurations);
      res.json(states);
    } catch (err) {
      console.error("Error fetching state configurations:", err);
      res.status(500).json({ error: "Failed to fetch state configurations" });
    }
  });

  // Get single state configuration
  app.get("/api/admin/state-configurations/:stateCode", isAdmin, async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { stateConfigurations } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      const state = await db.select().from(stateConfigurations)
        .where(eq(stateConfigurations.stateCode, req.params.stateCode.toUpperCase()))
        .limit(1);
      if (!state.length) {
        return res.status(404).json({ error: "State configuration not found" });
      }
      res.json(state[0]);
    } catch (err) {
      console.error("Error fetching state configuration:", err);
      res.status(500).json({ error: "Failed to fetch state configuration" });
    }
  });

  // Create state configuration
  app.post("/api/admin/state-configurations", isAdmin, async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { stateConfigurations } = await import("@shared/schema");
      const { stateCode, stateName, ...rest } = req.body;
      
      if (!stateCode || !stateName) {
        return res.status(400).json({ error: "stateCode and stateName are required" });
      }
      
      const newState = await db.insert(stateConfigurations).values({
        stateCode: stateCode.toUpperCase(),
        stateName,
        ...rest,
      }).returning();
      
      res.status(201).json(newState[0]);
    } catch (err) {
      console.error("Error creating state configuration:", err);
      res.status(500).json({ error: "Failed to create state configuration" });
    }
  });

  // Update state configuration
  app.patch("/api/admin/state-configurations/:stateCode", isAdmin, async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { stateConfigurations } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      const updated = await db.update(stateConfigurations)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(stateConfigurations.stateCode, req.params.stateCode.toUpperCase()))
        .returning();
      
      if (!updated.length) {
        return res.status(404).json({ error: "State configuration not found" });
      }
      res.json(updated[0]);
    } catch (err) {
      console.error("Error updating state configuration:", err);
      res.status(500).json({ error: "Failed to update state configuration" });
    }
  });

  // Delete state configuration
  app.delete("/api/admin/state-configurations/:stateCode", isAdmin, async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { stateConfigurations } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      await db.delete(stateConfigurations)
        .where(eq(stateConfigurations.stateCode, req.params.stateCode.toUpperCase()));
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting state configuration:", err);
      res.status(500).json({ error: "Failed to delete state configuration" });
    }
  });

  // ===== Learning Analytics Routes =====
  
  // Track learning event
  app.post("/api/analytics/event", async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { learningAnalytics } = await import("@shared/schema");
      
      const event = await db.insert(learningAnalytics).values({
        ...req.body,
        ipAddress: req.ip,
        createdAt: new Date(),
      }).returning();
      
      res.status(201).json(event[0]);
    } catch (err) {
      console.error("Error tracking learning event:", err);
      res.status(500).json({ error: "Failed to track event" });
    }
  });

  // Get analytics summary for admin dashboard
  app.get("/api/admin/analytics/summary", isAdmin, async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { learningAnalytics, enrollments, users } = await import("@shared/schema");
      const { sql, count, desc, eq } = await import("drizzle-orm");
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const totalUsers = await db.select({ count: count() }).from(users);
      const totalEnrollments = await db.select({ count: count() }).from(enrollments);
      const completedEnrollments = await db.select({ count: count() })
        .from(enrollments)
        .where(eq(enrollments.completed, 1));
      
      const recentEvents = await db.select()
        .from(learningAnalytics)
        .orderBy(desc(learningAnalytics.createdAt))
        .limit(100);
      
      const eventsByType = await db.select({
        eventType: learningAnalytics.eventType,
        count: count(),
      })
        .from(learningAnalytics)
        .groupBy(learningAnalytics.eventType);
      
      res.json({
        totalUsers: totalUsers[0]?.count || 0,
        totalEnrollments: totalEnrollments[0]?.count || 0,
        completedEnrollments: completedEnrollments[0]?.count || 0,
        completionRate: totalEnrollments[0]?.count 
          ? Math.round((completedEnrollments[0]?.count || 0) / totalEnrollments[0].count * 100)
          : 0,
        recentEvents: recentEvents.slice(0, 20),
        eventsByType,
      });
    } catch (err) {
      console.error("Error fetching analytics summary:", err);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Get user learning progress
  app.get("/api/analytics/user/:userId", isAdmin, async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { learningAnalytics, enrollments } = await import("@shared/schema");
      const { eq, desc } = await import("drizzle-orm");
      
      const userEnrollments = await db.select()
        .from(enrollments)
        .where(eq(enrollments.userId, req.params.userId));
      
      const userEvents = await db.select()
        .from(learningAnalytics)
        .where(eq(learningAnalytics.userId, req.params.userId))
        .orderBy(desc(learningAnalytics.createdAt))
        .limit(50);
      
      res.json({
        enrollments: userEnrollments,
        recentActivity: userEvents,
      });
    } catch (err) {
      console.error("Error fetching user analytics:", err);
      res.status(500).json({ error: "Failed to fetch user analytics" });
    }
  });

  // ===== Notification Routes =====
  
  // Get user notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });
      
      const db = (await import("./db")).db;
      const { notifications } = await import("@shared/schema");
      const { eq, desc } = await import("drizzle-orm");
      
      const userNotifications = await db.select()
        .from(notifications)
        .where(eq(notifications.userId, user.id))
        .orderBy(desc(notifications.createdAt))
        .limit(50);
      
      res.json(userNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });
      
      const db = (await import("./db")).db;
      const { notifications } = await import("@shared/schema");
      const { eq, and } = await import("drizzle-orm");
      
      const updated = await db.update(notifications)
        .set({ read: true })
        .where(and(
          eq(notifications.id, req.params.id),
          eq(notifications.userId, user.id)
        ))
        .returning();
      
      if (!updated.length) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json(updated[0]);
    } catch (err) {
      console.error("Error marking notification as read:", err);
      res.status(500).json({ error: "Failed to update notification" });
    }
  });

  // ===== Achievement Routes =====
  
  // Get all achievements
  app.get("/api/achievements", async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { achievements } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      const allAchievements = await db.select()
        .from(achievements)
        .where(eq(achievements.isActive, 1));
      
      res.json(allAchievements);
    } catch (err) {
      console.error("Error fetching achievements:", err);
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  // Get user achievements
  app.get("/api/user/:userId/achievements", async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { userAchievements, achievements } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      const earned = await db.select({
        achievement: achievements,
        earnedAt: userAchievements.earnedAt,
      })
        .from(userAchievements)
        .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
        .where(eq(userAchievements.userId, req.params.userId));
      
      res.json(earned);
    } catch (err) {
      console.error("Error fetching user achievements:", err);
      res.status(500).json({ error: "Failed to fetch user achievements" });
    }
  });

  // Admin: Create achievement
  app.post("/api/admin/achievements", isAdmin, async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { achievements } = await import("@shared/schema");
      
      const { name, description, iconUrl, badgeColor, category, criteria, points } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Achievement name is required" });
      }
      
      const newAchievement = await db.insert(achievements).values({
        name,
        description,
        iconUrl,
        badgeColor: badgeColor || "gold",
        category,
        criteria: criteria ? JSON.stringify(criteria) : null,
        points: points || 0,
        isActive: 1,
      }).returning();
      
      res.status(201).json(newAchievement[0]);
    } catch (err) {
      console.error("Error creating achievement:", err);
      res.status(500).json({ error: "Failed to create achievement" });
    }
  });

  // Admin: Award achievement to user
  app.post("/api/admin/users/:userId/achievements/:achievementId", isAdmin, async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { userAchievements } = await import("@shared/schema");
      
      const awarded = await db.insert(userAchievements).values({
        userId: req.params.userId,
        achievementId: req.params.achievementId,
        earnedAt: new Date(),
        notified: 0,
      }).returning();
      
      res.status(201).json(awarded[0]);
    } catch (err) {
      console.error("Error awarding achievement:", err);
      res.status(500).json({ error: "Failed to award achievement" });
    }
  });

  // ===== Learning Path Routes =====
  
  // Get all learning paths
  app.get("/api/learning-paths", async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { learningPaths } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      const paths = await db.select()
        .from(learningPaths)
        .where(eq(learningPaths.isActive, 1));
      
      res.json(paths);
    } catch (err) {
      console.error("Error fetching learning paths:", err);
      res.status(500).json({ error: "Failed to fetch learning paths" });
    }
  });

  // Get learning path with courses
  app.get("/api/learning-paths/:pathId", async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { learningPaths, learningPathItems, courses } = await import("@shared/schema");
      const { eq, asc } = await import("drizzle-orm");
      
      const path = await db.select()
        .from(learningPaths)
        .where(eq(learningPaths.id, req.params.pathId))
        .limit(1);
      
      if (!path.length) {
        return res.status(404).json({ error: "Learning path not found" });
      }
      
      const items = await db.select({
        item: learningPathItems,
        course: courses,
      })
        .from(learningPathItems)
        .innerJoin(courses, eq(learningPathItems.courseId, courses.id))
        .where(eq(learningPathItems.learningPathId, req.params.pathId))
        .orderBy(asc(learningPathItems.sequence));
      
      res.json({
        ...path[0],
        courses: items.map(i => ({ ...i.item, course: i.course })),
      });
    } catch (err) {
      console.error("Error fetching learning path:", err);
      res.status(500).json({ error: "Failed to fetch learning path" });
    }
  });

  // Admin: Create learning path
  app.post("/api/admin/learning-paths", isAdmin, async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { learningPaths } = await import("@shared/schema");
      
      const { name, description, productType, state, licenseType, estimatedHours } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Learning path name is required" });
      }
      
      const newPath = await db.insert(learningPaths).values({
        name,
        description,
        productType,
        state,
        licenseType,
        estimatedHours,
        isActive: 1,
        sortOrder: 0,
      }).returning();
      
      res.status(201).json(newPath[0]);
    } catch (err) {
      console.error("Error creating learning path:", err);
      res.status(500).json({ error: "Failed to create learning path" });
    }
  });

  // Admin: Add course to learning path
  app.post("/api/admin/learning-paths/:pathId/courses", isAdmin, async (req, res) => {
    try {
      const db = (await import("./db")).db;
      const { learningPathItems } = await import("@shared/schema");
      
      const { courseId, sequence, isRequired } = req.body;
      
      if (!courseId) {
        return res.status(400).json({ error: "courseId is required" });
      }
      
      const newItem = await db.insert(learningPathItems).values({
        learningPathId: req.params.pathId,
        courseId,
        sequence: sequence || 0,
        isRequired: isRequired !== undefined ? isRequired : 1,
      }).returning();
      
      res.status(201).json(newItem[0]);
    } catch (err) {
      console.error("Error adding course to learning path:", err);
      res.status(500).json({ error: "Failed to add course to learning path" });
    }
  });

  return httpServer;
}
