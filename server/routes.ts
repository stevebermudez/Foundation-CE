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
      type: req.query.type as string,
      targetLicense: req.query.license as string,
    });
    res.json(courses);
  });

  app.get("/api/courses/:id", async (req, res) => {
    const course = await storage.getCourse(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  });

  // Course Bundle Routes
  app.get("/api/bundles", async (req, res) => {
    const bundles = await storage.getCourseBundles({
      state: req.query.state as string,
      licenseType: req.query.licenseType as string,
    });
    res.json(bundles);
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

  return httpServer;
}
