# Real Estate Education Platform

## Overview
A full-stack real estate licensing education platform for salespersons and brokers, offering prelicense and renewal courses with compliance tracking.

## Key Requirements
- 45-hour renewal requirement every 4 years (salespersons & brokers)
- Prelicense education courses
- Course pricing: $59.99
- Compliance tracking and certificate generation
- State-specific regulatory requirements

## Project Structure
- **Frontend**: React + TypeScript (client/src)
  - Pages: /courses/ca, /courses/fl for state-specific courses
  - Components: CourseBundle, ComplianceMonitor
- **Backend**: Express.js + Node.js (server)
  - Seed files: seedCourses.ts, seedFloridaCourses.ts
  - Routes: /api/bundles/*, /api/courses/*, /api/compliance/*
- **Database**: PostgreSQL (Neon)
  - Tables: courses, courseBundles, bundleCourses, bundleEnrollments
  - Tables: companyAccounts, companyCompliance for corporate tracking
- **Authentication**: Replit Auth
- **Payments**: Stripe integration
- **Styling**: Tailwind CSS + shadcn components

## Course Classification System
The platform now uses comprehensive course attributes to distinguish requirements:

**Classification Fields:**
- `state`: "CA", "FL"
- `licenseType`: "Sales Associate", "Broker", "Sales Associate & Broker"
- `requirementCycleType`: "Post-Licensing" or "Continuing Education (Renewal)"
- `requirementBucket`: "Core Law", "Ethics & Business Practices", "Specialty / Elective", "Post-Licensing Mandatory"
- `deliveryMethod`: "Self-Paced Online", "Live Webinar", "Classroom"
- `difficultyLevel`: "Basic", "Intermediate", "Advanced"
- `sku`: Unique course code (e.g., "FL-CE-14PKG")
- `renewalApplicable`: Boolean (true for renewal, false for prelicense)

**Florida CE Structure:**
- **Post-Licensing (First Renewal):**
  - Sales Associates: 45 hours ($59.99)
  - Brokers: 60 hours ($69.99)
- **Continuing Education (Every 2 Years):**
  - All licensees: 14 hours ($39.99)
    - 3 hours Core Law (red badge)
    - 3 hours Ethics & Business Practices (blue badge)
    - 8 hours Specialty/Elective (purple badge)
  
**California CE Structure:**
- **Renewal (Every 4 Years):**
  - All licensees: 45 hours ($45.00)
  
**Pricing Options:**
- Bundle: Pay full price for all courses in package
- À la Carte: $15 per individual course

**Course Display:**
Courses display with color-coded requirement buckets and detailed classification information via CourseDisplay component.

## Recent Changes

### Florida Complete Catalog Buildout
- **Post-Licensing Packages:**
  - Sales Associate: 45 hours, $59.99
  - Broker: 60 hours, $69.99
- **CE Renewal Package:** 14 hours (biennial), $39.99
  - 3 hours Core Law
  - 3 hours Ethics & Business Practices
  - 8 hours Specialty/Elective
- **À la Carte Individual Courses:** $15 each
  - 10 elective courses (3-8 hours each)
  - Core Law (3h)
  - Ethics (3h)
- **Seed File:** `server/seedFloridaCatalog.ts` (ready-to-use)
- **UI:** CourseDisplay component with color-coded requirement buckets
- **Pages:** /courses/fl for Florida (color-coded display), /courses/ca for California

### Classification System
- State, License Type, Requirement Cycle Type, Requirement Bucket, Delivery Method, Difficulty Level, SKU
- Enables filtering and display of courses by requirement

## User Preferences
- Full-stack JavaScript application
- Minimize files, collapse similar components
- Frontend-heavy architecture
- Use existing shadcn components
- Dark mode support

## Architecture Notes
- Using Replit's built-in PostgreSQL database
- Stripe integration for payments
- Server handles data persistence and API calls
- Frontend manages UI state with React Query
