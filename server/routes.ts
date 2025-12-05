import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { getStripeClient, getStripeStatus, getStripePublishableKey } from "./stripeClient";
import { seedFRECIPrelicensing } from "./seedFRECIPrelicensing";
import { seedLMSContent } from "./seedLMSContent";
import { isAuthenticated, isAdmin } from "./oauthAuth";
import { jwtAuth } from "./jwtAuth";
import {
  createPaypalOrder,
  capturePaypalOrder,
  loadPaypalDefault,
} from "./paypal";
import { submitToDBPR, validateDBPRData, generateDBPRBatchFile } from "./dbprService";
import { generateCertificateHTML, generateCertificateFileName, CertificateData } from "./certificates";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Seed FREC I course on startup if not already present
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
  } catch (err: any) {
    console.error("Error with FREC I seeding:", err);
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
  app.post("/api/auth/admin/login", async (req, res) => {
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
        studentName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
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

      const studentName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;
      const completionDate = new Date(enrollment.completedAt || new Date());

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
      
      const progress = await storage.completeLesson(enrollmentId, lessonId, user.id);
      
      res.json({ 
        completed: true,
        lessonId,
        completedAt: progress.completedAt
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
        timeSpentSeconds: 0
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
            
            // Update enrollment current unit index
            const enrollment = await storage.getEnrollmentById(attempt.enrollmentId);
            if (enrollment) {
              const units = await storage.getUnits(enrollment.courseId);
              const currentUnit = units.find(u => u.id === bank.unitId);
              if (currentUnit) {
                await storage.updateEnrollmentProgress(attempt.enrollmentId, {
                  currentUnitIndex: currentUnit.unitNumber + 1
                });
              }
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

  // Get final exam info for a course
  app.get("/api/courses/:courseId/final-exam", authMiddleware, async (req, res) => {
    try {
      const user = req.user as any;
      const { courseId } = req.params;
      
      const enrollment = await storage.getEnrollment(user.id, courseId);
      if (!enrollment) {
        return res.status(404).json({ error: "Not enrolled in this course" });
      }
      
      const bank = await storage.getFinalExamBank(courseId);
      if (!bank) {
        return res.status(404).json({ error: "No final exam found for this course" });
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
        bankId: bank.id,
        title: bank.title,
        description: bank.description,
        questionsPerAttempt: bank.questionsPerAttempt,
        passingScore: bank.passingScore,
        timeLimit: bank.timeLimit,
        isUnlocked: allUnitsComplete,
        alreadyPassed: enrollment.finalExamPassed === 1,
        bestScore: enrollment.finalExamScore,
        attempts: enrollment.finalExamAttempts || 0
      });
    } catch (err) {
      console.error("Error fetching final exam:", err);
      res.status(500).json({ error: "Failed to fetch final exam" });
    }
  });

  // ============================================================
  // End of LMS Routes
  // ============================================================

  // Checkout - Create Stripe checkout session for a course
  app.post("/api/checkout/course", async (req, res) => {
    try {
      const { courseId, email } = req.body;
      if (!courseId || !email) {
        return res.status(400).json({ error: "courseId and email required" });
      }

      const course = await storage.getCourse(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      const successUrl = `${req.headers.origin || process.env.CLIENT_URL || "http://localhost:5000"}/checkout/success?courseId=${courseId}`;
      const cancelUrl = `${req.headers.origin || process.env.CLIENT_URL || "http://localhost:5000"}/checkout/cancel`;

      const stripe = getStripeClient();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'link'],
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
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          courseId,
          email,
        },
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (err: any) {
      console.error("Checkout error:", err);
      const message = err.message || "Failed to create checkout session";
      res.status(500).json({ error: message });
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
      res.json(bundles);
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

      const attempt = await storage.createExamAttempt({
        userId: user.id,
        examId: req.params.examId,
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

  app.get(
    "/api/export/course/:courseId/content.docx",
    isAdmin,
    async (req, res) => {
      try {
        const docxBuffer = await storage.exportCourseContentDocx(
          req.params.courseId,
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

  // Course Management Admin Routes
  app.post("/api/admin/courses", isAdmin, async (req, res) => {
    try {
      const courseData = req.body;
      const course = await storage.createCourse?.(courseData);
      res.status(201).json(course);
    } catch (err) {
      console.error("Error creating course:", err);
      res.status(500).json({ error: "Failed to create course" });
    }
  });

  app.get("/api/admin/courses", isAdmin, async (req, res) => {
    try {
      const allCourses = (await storage.getCourses?.()) || [];
      res.json(allCourses.slice(0, 500));
    } catch (err) {
      console.error("Error fetching courses:", err);
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  app.patch("/api/admin/courses/:courseId", isAdmin, async (req, res) => {
    try {
      const { courseId } = req.params;
      const course = await storage.updateCourse?.(courseId, req.body);
      if (!course) return res.status(404).json({ error: "Course not found" });
      res.json(course);
    } catch (err) {
      console.error("Error updating course:", err);
      res.status(500).json({ error: "Failed to update course" });
    }
  });

  app.delete("/api/admin/courses/:courseId", isAdmin, async (req, res) => {
    try {
      const { courseId } = req.params;
      await storage.deleteCourse?.(courseId);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting course:", err);
      res.status(500).json({ error: "Failed to delete course" });
    }
  });

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

  app.post("/api/admin/courses/:courseId/units", isAdmin, async (req, res) => {
    try {
      const { courseId } = req.params;
      const { unitNumber, title, description, hoursRequired } = req.body;
      const unit = await storage.createUnit(courseId, unitNumber, title, description, hoursRequired);
      res.status(201).json(unit);
    } catch (err) {
      console.error("Error creating unit:", err);
      res.status(500).json({ error: "Failed to create unit" });
    }
  });

  app.patch("/api/admin/units/:unitId", isAdmin, async (req, res) => {
    try {
      const { unitId } = req.params;
      const unit = await storage.updateUnit(unitId, req.body);
      res.json(unit);
    } catch (err) {
      console.error("Error updating unit:", err);
      res.status(500).json({ error: "Failed to update unit" });
    }
  });

  app.delete("/api/admin/units/:unitId", isAdmin, async (req, res) => {
    try {
      const { unitId } = req.params;
      await storage.deleteUnit(unitId);
      res.json({ success: true });
    } catch (err) {
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

  app.post("/api/admin/units/:unitId/lessons", isAdmin, async (req, res) => {
    try {
      const { unitId } = req.params;
      const { lessonNumber, title, videoUrl, durationMinutes, content, imageUrl } = req.body;
      const lesson = await storage.createLesson(unitId, lessonNumber, title, videoUrl, durationMinutes, content, imageUrl);
      res.status(201).json(lesson);
    } catch (err) {
      console.error("Error creating lesson:", err);
      res.status(500).json({ error: "Failed to create lesson" });
    }
  });

  app.patch("/api/admin/lessons/:lessonId", isAdmin, async (req, res) => {
    try {
      const { lessonId } = req.params;
      const lesson = await storage.updateLesson(lessonId, req.body);
      res.json(lesson);
    } catch (err) {
      console.error("Error updating lesson:", err);
      res.status(500).json({ error: "Failed to update lesson" });
    }
  });

  app.delete("/api/admin/lessons/:lessonId", isAdmin, async (req, res) => {
    try {
      const { lessonId } = req.params;
      await storage.deleteLesson(lessonId);
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
      res.json({ success: true });
    } catch (err) {
      console.error("Error reordering lessons:", err);
      res.status(500).json({ error: "Failed to reorder lessons" });
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

  // Contact Form Submission
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Log contact message (in production, send email here)
      console.log("Contact form submission:", {
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString(),
      });

      res.json({ success: true, message: "Your message has been received" });
    } catch (err) {
      console.error("Contact form error:", err);
      res.status(500).json({ error: "Failed to submit contact form" });
    }
  });

  // Admin User Seeding - Creates a test admin user (should be removed in production)
  app.post("/api/seed/admin", async (req, res) => {
    try {
      const bcrypt = await import("bcrypt");
      const crypto = await import("crypto");
      
      const adminEmail = "admin@foundationce.com";
      const adminPassword = "admin1234";
      
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
        credentials: {
          email: adminEmail,
          password: adminPassword
        }
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

  return httpServer;
}
