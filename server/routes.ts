import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Company Account Routes
  app.get("/api/company/:id", async (req, res) => {
    const company = await storage.getCompanyAccount(req.params.id);
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json(company);
  });

  app.post("/api/company", async (req, res) => {
    const company = await storage.createCompanyAccount(req.body);
    res.status(201).json(company);
  });

  // Company Compliance Routes
  app.get("/api/company/:id/compliance", async (req, res) => {
    const compliance = await storage.getCompanyCompliance(req.params.id);
    res.json(compliance);
  });

  app.post("/api/company/:id/compliance", async (req, res) => {
    const compliance = await storage.createCompanyCompliance({
      ...req.body,
      companyId: req.params.id,
    });
    res.status(201).json(compliance);
  });

  app.patch("/api/compliance/:id", async (req, res) => {
    const compliance = await storage.updateCompanyCompliance(
      req.params.id,
      req.body
    );
    res.json(compliance);
  });

  app.post("/api/compliance/:id/complete", async (req, res) => {
    const { hoursCompleted } = req.body;
    const compliance = await storage.markComplianceComplete(
      req.params.id,
      hoursCompleted
    );
    res.json(compliance);
  });

  // Expiring Compliance Monitoring
  app.get("/api/compliance/expiring/:days", async (req, res) => {
    const days = parseInt(req.params.days, 10);
    const expiring = await storage.getExpiringCompliance(days);
    res.json(expiring);
  });

  // Course Routes
  app.get("/api/courses", async (req, res) => {
    const courses = await storage.getCourses({
      state: req.query.state as string,
      licenseType: req.query.licenseType as string,
    });
    res.json(courses);
  });

  // Course Completion & Sircon Reporting
  app.post("/api/enrollments/:id/complete", async (req, res) => {
    try {
      const { userId, licenseNumber, licenseType } = req.body;
      const enrollment = await storage.updateEnrollmentHours(
        req.params.id,
        req.body.hoursCompleted || 0
      );
      
      // Trigger Sircon reporting if it's an insurance course
      const course = await storage.getCourse(enrollment.courseId);
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

  app.get("/api/courses/:id", async (req, res) => {
    const course = await storage.getCourse(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
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
    const enrollment = await storage.createBundleEnrollment(userId, req.params.id);
    res.status(201).json(enrollment);
  });

  app.get("/api/bundles/:id/enrollment/:userId", async (req, res) => {
    const enrollment = await storage.getBundleEnrollment(
      req.params.userId,
      req.params.id
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
      const reviews = await storage.getPendingCEReviews(req.params.supervisorId);
      res.json(reviews);
    } catch (err) {
      console.error("Error fetching CE reviews:", err);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.patch("/api/ce-reviews/:id/approve", async (req, res) => {
    try {
      const review = await storage.approveCEReview(req.params.id, req.body.notes);
      res.json(review);
    } catch (err) {
      console.error("Error approving CE review:", err);
      res.status(500).json({ error: "Failed to approve review" });
    }
  });

  app.patch("/api/ce-reviews/:id/reject", async (req, res) => {
    try {
      const review = await storage.rejectCEReview(req.params.id, req.body.notes);
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
      const company = await storage.getCompanyAccount(req.params.id);
      if (!company) return res.status(404).json({ error: "Company not found" });
      
      // Return company and its compliance info
      const compliance = await storage.getCompanyCompliance(req.params.id);
      res.json({ company, compliance });
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

  app.post("/api/exams/:examId/start", async (req, res) => {
    try {
      const { userId } = req.body;
      const exam = await storage.getPracticeExam(req.params.examId);
      if (!exam) return res.status(404).json({ error: "Exam not found" });

      const attempt = await storage.createExamAttempt({
        userId,
        examId: req.params.examId,
        totalQuestions: exam.totalQuestions,
      });
      res.status(201).json(attempt);
    } catch (err) {
      console.error("Error starting exam:", err);
      res.status(500).json({ error: "Failed to start exam" });
    }
  });

  app.post("/api/exams/attempts/:attemptId/answer", async (req, res) => {
    try {
      const { questionId, userAnswer, correctAnswer } = req.body;
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

  app.post("/api/exams/attempts/:attemptId/complete", async (req, res) => {
    try {
      const { score, correctAnswers, timeSpent } = req.body;
      const passed = score >= 70 ? 1 : 0;

      const completed = await storage.completeExamAttempt(
        req.params.attemptId,
        score,
        correctAnswers,
        passed,
        timeSpent
      );
      res.json(completed);
    } catch (err) {
      console.error("Error completing exam:", err);
      res.status(500).json({ error: "Failed to complete exam" });
    }
  });

  app.get("/api/exams/:examId/attempts/:userId", async (req, res) => {
    try {
      const attempts = await storage.getUserExamAttempts(req.params.userId, req.params.examId);
      res.json(attempts);
    } catch (err) {
      console.error("Error fetching attempts:", err);
      res.status(500).json({ error: "Failed to fetch attempts" });
    }
  });

  return httpServer;
}
