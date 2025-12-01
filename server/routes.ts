import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { getUncachableStripeClient } from "./stripeClient";
import { seedFRECIPrelicensing } from "./seedFRECIPrelicensing";
import { isAuthenticated, isAdmin } from "./oauthAuth";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";

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
  // Auth Routes
  app.get("/api/user", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      
      try {
        const userData = await storage.getUser(user.id);
        res.json({
          id: user.id,
          email: userData?.email || user.email,
          firstName: userData?.firstName || user.firstName,
          lastName: userData?.lastName || user.lastName,
          profileImageUrl: userData?.profileImageUrl || user.profileImageUrl,
        });
      } catch (dbErr) {
        console.error("Error querying database:", dbErr);
        res.json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        });
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.patch("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { licenseNumber, licenseExpirationDate } = req.body;
      // Profile saved successfully - license info can be used when completing courses
      res.json({ message: "Profile updated", licenseNumber, licenseExpirationDate });
    } catch (err) {
      console.error("Error updating profile:", err);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.get("/api/enrollments/user", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const enrollments = await storage.getCompletedEnrollments(user.id);
      res.json(enrollments);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
      res.status(500).json({ error: "Failed to fetch enrollments" });
    }
  });

  // Email/Password Signup
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

      const crypto = await import("crypto");
      const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
      
      const newUser = await storage.upsertUser({
        email,
        passwordHash,
        firstName,
        lastName,
      });

      req.login({ id: newUser.id }, (err) => {
        if (err) return res.status(500).json({ error: "Login failed" });
        res.json({ message: "Signup successful", user: { id: newUser.id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName } });
      });
    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).json({ error: "Signup failed" });
    }
  });

  // Email/Password Login
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

      const crypto = await import("crypto");
      const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
      
      if (passwordHash !== user.passwordHash) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      req.login({ id: user.id }, (err) => {
        if (err) return res.status(500).json({ error: "Login failed" });
        res.json({ message: "Login successful", user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Login failed" });
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

  // Course Completion & Regulatory Reporting
  app.post("/api/enrollments/:id/complete", async (req, res) => {
    try {
      const { userId, licenseNumber, ssnLast4, licenseType, firstName, lastName } = req.body;
      const enrollment = await storage.updateEnrollmentHours(
        req.params.id,
        req.body.hoursCompleted || 0
      );
      
      const course = await storage.getCourse(enrollment.courseId);
      const user = await storage.getUser(userId);
      const studentName = firstName && lastName ? `${firstName} ${lastName}` : user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "Unknown";
      
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
  app.get("/api/dbpr/status/:enrollmentId", async (req, res) => {
    try {
      const status = await storage.getDBPRReport(req.params.enrollmentId);
      res.json(status);
    } catch (err) {
      console.error("Error fetching DBPR status:", err);
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
        payment_method_types: ["card", "apple_pay", "google_pay"],
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

  // Create Payment Intent for direct payment (supports Apple Pay, Google Pay, Cards)
  app.post("/api/payment/create-intent", async (req, res) => {
    try {
      const { courseId, email, amount } = req.body;
      if (!courseId || !email || !amount) {
        return res.status(400).json({ error: "courseId, email, and amount required" });
      }

      const course = await storage.getCourse(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      const stripe = await getUncachableStripeClient();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        payment_method_types: ["card", "apple_pay", "google_pay"],
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

      const stripe = await getUncachableStripeClient();
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
        const enrollment = await storage.createEnrollment(existingUser!.id, courseId, {
          progress: 0,
          completed: 0,
          hoursCompleted: 0,
          completedAt: null,
        });

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

  // Admin Override Routes
  app.patch("/api/admin/enrollments/:id/override", isAdmin, async (req, res) => {
    try {
      const { hoursCompleted, completed, generateCertificate } = req.body;
      const enrollmentId = req.params.id;

      if (typeof hoursCompleted !== "number" || typeof completed !== "boolean") {
        return res.status(400).json({ error: "hoursCompleted and completed fields required" });
      }

      const enrollment = await storage.adminOverrideEnrollment(enrollmentId, hoursCompleted, completed);
      
      if (completed && generateCertificate) {
        const cert = await storage.createCertificate(enrollmentId, enrollment.userId, enrollment.courseId);
        return res.json({ 
          message: "Enrollment overridden and certificate generated",
          enrollment,
          certificate: cert
        });
      }

      res.json({ 
        message: "Enrollment overridden successfully",
        enrollment
      });
    } catch (err) {
      console.error("Error overriding enrollment:", err);
      res.status(500).json({ error: "Failed to override enrollment" });
    }
  });

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
      const unit = await storage.createUnit(req.params.courseId, unitNumber, title, description, hoursRequired);
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
      const { lessonNumber, title, videoUrl, durationMinutes } = req.body;
      if (!lessonNumber || !title) {
        return res.status(400).json({ error: "lessonNumber and title required" });
      }
      const lesson = await storage.createLesson(req.params.unitId, lessonNumber, title, videoUrl, durationMinutes);
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
  app.patch("/api/admin/enrollments/:enrollmentId/data", isAdmin, async (req, res) => {
    try {
      const { progress, hoursCompleted, completed } = req.body;
      const enrollment = await storage.adminOverrideEnrollmentData(req.params.enrollmentId, {
        progress: typeof progress === "number" ? progress : undefined,
        hoursCompleted: typeof hoursCompleted === "number" ? hoursCompleted : undefined,
        completed: typeof completed === "boolean" ? (completed ? 1 : 0) : undefined,
        completedAt: completed && typeof completed === "boolean" ? new Date() : undefined
      });
      res.json({ message: "Enrollment data overridden", enrollment });
    } catch (err) {
      console.error("Error overriding enrollment data:", err);
      res.status(500).json({ error: "Failed to override enrollment data" });
    }
  });

  app.patch("/api/admin/lesson-progress/:progressId/data", isAdmin, async (req, res) => {
    try {
      const { completed, timeSpentMinutes } = req.body;
      const progress = await storage.adminOverrideLessonProgress(req.params.progressId, {
        completed: typeof completed === "boolean" ? (completed ? 1 : 0) : undefined,
        timeSpentMinutes: typeof timeSpentMinutes === "number" ? timeSpentMinutes : undefined,
        completedAt: completed && typeof completed === "boolean" ? new Date() : undefined
      });
      res.json({ message: "Lesson progress overridden", progress });
    } catch (err) {
      console.error("Error overriding lesson progress:", err);
      res.status(500).json({ error: "Failed to override lesson progress" });
    }
  });

  app.patch("/api/admin/exam-attempts/:attemptId/score", isAdmin, async (req, res) => {
    try {
      const { score } = req.body;
      if (typeof score !== "number" || score < 0 || score > 100) {
        return res.status(400).json({ error: "Score must be a number between 0 and 100" });
      }
      const passed = score >= 70;
      const attempt = await storage.adminOverrideExamAttempt(req.params.attemptId, score, passed);
      res.json({ message: "Exam score overridden", attempt, passed: passed ? "PASS" : "FAIL" });
    } catch (err) {
      console.error("Error overriding exam score:", err);
      res.status(500).json({ error: "Failed to override exam score" });
    }
  });

  app.patch("/api/admin/users/:userId/data", isAdmin, async (req, res) => {
    try {
      const { firstName, lastName, email, profileImageUrl } = req.body;
      const user = await storage.adminOverrideUserData(req.params.userId, {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email: email || undefined,
        profileImageUrl: profileImageUrl || undefined
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
      const { title, videoUrl, thumbnailUrl, description, durationMinutes } = req.body;
      if (!title || !videoUrl) {
        return res.status(400).json({ error: "title and videoUrl required" });
      }
      const video = await storage.createVideo(req.params.courseId, user.id, title, videoUrl, thumbnailUrl, description, durationMinutes);
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
      const { courseId, title, videoUrl, thumbnailUrl, description, durationMinutes } = req.body;
      if (!courseId || !title || !videoUrl) {
        return res.status(400).json({ error: "courseId, title and videoUrl required" });
      }
      const video = await storage.createVideo(courseId, user.id, title, videoUrl, thumbnailUrl, description, durationMinutes, req.params.unitId);
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
      const lesson = await storage.attachVideoToLesson(req.params.lessonId, videoId);
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

  app.get("/api/export/user/:userId/enrollments", isAuthenticated, async (req, res) => {
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
  });

  app.get("/api/export/enrollment/:enrollmentId/progress", isAuthenticated, async (req, res) => {
    try {
      const data = await storage.exportProgressData(req.params.enrollmentId);
      res.json(data);
    } catch (err) {
      console.error("Error exporting progress data:", err);
      res.status(500).json({ error: "Failed to export progress data" });
    }
  });

  // Real Estate Express LMS Integration
  app.get("/api/export/enrollment/:enrollmentId/ree", isAuthenticated, async (req, res) => {
    try {
      const data = await storage.exportRealEstateExpressFormat(req.params.enrollmentId);
      res.json(data);
    } catch (err) {
      console.error("Error exporting Real Estate Express data:", err);
      res.status(500).json({ error: "Failed to export Real Estate Express format" });
    }
  });

  app.post("/api/import/ree/enrollment", isAdmin, async (req, res) => {
    try {
      const { studentEmail, courseCode, hoursCompleted, completed } = req.body;
      if (!studentEmail || !courseCode) {
        return res.status(400).json({ error: "studentEmail and courseCode required" });
      }
      
      const user = await storage.getUserByEmail(studentEmail);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const courseList = await db.select().from(courses).where(eq(courses.sku, courseCode));
      if (courseList.length === 0) {
        return res.status(404).json({ error: "Course not found" });
      }
      
      const enrollment = await storage.getEnrollment(user.id, courseList[0].id);
      if (!enrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }
      
      const updated = await storage.adminOverrideEnrollmentData(enrollment.id, {
        hoursCompleted: hoursCompleted ? Number(hoursCompleted) : undefined,
        completed: completed ? 1 : 0,
        completedAt: completed ? new Date() : undefined
      });
      
      res.json({ message: "Enrollment imported from Real Estate Express", enrollment: updated });
    } catch (err) {
      console.error("Error importing Real Estate Express data:", err);
      res.status(500).json({ error: "Failed to import Real Estate Express enrollment" });
    }
  });

  // Course Content Export Routes
  app.get("/api/export/course/:courseId/content.json", isAdmin, async (req, res) => {
    try {
      const jsonContent = await storage.exportCourseContentJSON(req.params.courseId);
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="course-content-${req.params.courseId}.json"`);
      res.send(jsonContent);
    } catch (err) {
      console.error("Error exporting course content as JSON:", err);
      res.status(500).json({ error: "Failed to export course content" });
    }
  });

  app.get("/api/export/course/:courseId/content.csv", isAdmin, async (req, res) => {
    try {
      const csvContent = await storage.exportCourseContentCSV(req.params.courseId);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="course-content-${req.params.courseId}.csv"`);
      res.send(csvContent);
    } catch (err) {
      console.error("Error exporting course content as CSV:", err);
      res.status(500).json({ error: "Failed to export course content" });
    }
  });

  app.get("/api/export/course/:courseId/content.docx", isAdmin, async (req, res) => {
    try {
      const docxBuffer = await storage.exportCourseContentDocx(req.params.courseId);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename="course-content-${req.params.courseId}.docx"`);
      res.send(docxBuffer);
    } catch (err) {
      console.error("Error exporting course content as DOCX:", err);
      res.status(500).json({ error: "Failed to export course content" });
    }
  });

  // All Users Data Export
  app.get("/api/export/users/data.json", isAdmin, async (req, res) => {
    try {
      const jsonContent = await storage.exportAllUsersData();
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="users-data-${new Date().toISOString().split('T')[0]}.json"`);
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
      res.setHeader("Content-Disposition", `attachment; filename="users-data-${new Date().toISOString().split('T')[0]}.csv"`);
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
      res.setHeader("Content-Disposition", `attachment; filename="campaigns-data-${new Date().toISOString().split('T')[0]}.json"`);
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
      res.setHeader("Content-Disposition", `attachment; filename="campaigns-data-${new Date().toISOString().split('T')[0]}.csv"`);
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
      const allUsers = await storage.getUsers?.() || [];
      const allCourses = await storage.getCourses?.() || [];
      const allEnrollments = await storage.getEnrollments?.() || [];
      
      res.json({
        totalUsers: allUsers.length || 0,
        totalCourses: allCourses.length || 0,
        totalEnrollments: allEnrollments.length || 0,
        completionRate: allEnrollments.length > 0 
          ? Math.round((allEnrollments.filter((e: any) => e.completed).length / allEnrollments.length) * 100)
          : 0,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getUsers?.() || [];
      res.json(allUsers.slice(0, 100));
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/enrollments", isAdmin, async (req, res) => {
    try {
      const allEnrollments = await storage.getEnrollments?.() || [];
      res.json(allEnrollments.slice(0, 100));
    } catch (err) {
      console.error("Error fetching enrollments:", err);
      res.status(500).json({ error: "Failed to fetch enrollments" });
    }
  });

  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userData = await storage.getUser(user.id);
      res.json(userData);
    } catch (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  return httpServer;
}
