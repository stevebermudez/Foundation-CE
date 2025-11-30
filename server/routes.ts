import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { getUncachableStripeClient } from "./stripeClient";
import { seedFRECIPrelicensing } from "./seedFRECIPrelicensing";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed FREC I course on startup if not already present
  try {
    const db = (await import("./db")).db;
    const { courses } = (await import("@shared/schema"));
    const { eq } = (await import("drizzle-orm"));
    
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
  } catch (err: any) {
    console.error("Error with FREC I seeding:", err);
  }
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

      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: course.title,
                description: course.description,
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
    } catch (err) {
      console.error("Checkout error:", err);
      res.status(500).json({ error: "Failed to create checkout session" });
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
      });
      res.status(201).json(subscription);
    } catch (err) {
      console.error("Error creating subscription:", err);
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });

  app.patch("/api/subscriptions/:id", async (req, res) => {
    try {
      const subscription = await storage.updateSubscription(req.params.id, req.body);
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
      const usage = await storage.applyCoupon(userId, couponId, enrollmentId, discountAmount);
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
      const completed = await storage.getCompletedEnrollments(req.params.userId);
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
      const { name, subject, htmlContent, plainTextContent, targetSegment, createdBy } = req.body;
      const campaign = await storage.createEmailCampaign({
        name,
        subject,
        htmlContent,
        plainTextContent,
        targetSegment,
        createdBy,
        status: "draft",
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
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });
      res.json(campaign);
    } catch (err) {
      console.error("Error fetching campaign:", err);
      res.status(500).json({ error: "Failed to fetch campaign" });
    }
  });

  app.patch("/api/email-campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.updateEmailCampaign(req.params.id, req.body);
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
      const openRate = stats.campaign.sentCount > 0 ? Math.round((stats.campaign.openCount / stats.campaign.sentCount) * 100) : 0;
      const clickRate = stats.campaign.sentCount > 0 ? Math.round((stats.campaign.clickCount / stats.campaign.sentCount) * 100) : 0;
      res.json({
        ...stats,
        metrics: {
          openRate: `${openRate}%`,
          clickRate: `${clickRate}%`,
          recipients: stats.campaign.recipientCount,
          sent: stats.campaign.sentCount,
        }
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Email Tracking Routes
  app.post("/api/email-tracking/open", async (req, res) => {
    try {
      const { recipientId, campaignId, userId, userAgent, ipAddress } = req.body;
      await storage.trackEmailOpen(recipientId, campaignId, userId, userAgent, ipAddress);
      res.json({ message: "Open tracked" });
    } catch (err) {
      console.error("Error tracking open:", err);
      res.status(500).json({ error: "Failed to track open" });
    }
  });

  app.post("/api/email-tracking/click", async (req, res) => {
    try {
      const { recipientId, campaignId, userId, linkUrl, userAgent, ipAddress } = req.body;
      await storage.trackEmailClick(recipientId, campaignId, userId, linkUrl, userAgent, ipAddress);
      res.json({ message: "Click tracked" });
    } catch (err) {
      console.error("Error tracking click:", err);
      res.status(500).json({ error: "Failed to track click" });
    }
  });

  return httpServer;
}
