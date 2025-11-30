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
The platform uses comprehensive course attributes to distinguish between ALL factors:

**Classification Fields:**
- `productType`: "RealEstate" or "Insurance"
- `state`: "CA", "FL"
- `licenseType`: "Sales Associate", "Broker", "Sales Associate & Broker", etc.
- `requirementCycleType`: "Post-Licensing" or "Continuing Education (Renewal)"
- `requirementBucket`: "Core Law", "Ethics & Business Practices", "Specialty / Elective", "Post-Licensing Mandatory"
- `deliveryMethod`: "Self-Paced Online", "Live Webinar", "Classroom"
- `difficultyLevel`: "Basic", "Intermediate", "Advanced" (optional)
- `sku`: Unique course code (e.g., "FL-RE-CE-14PKG", "CA-RE-CE-45PKG")
- `renewalApplicable`: Boolean (true for renewal, false for prelicense)

**Product Type Separation:**
- Real Estate courses: FL, CA with state-specific requirements
- Insurance courses: Framework ready for expansion (separate pricing, requirements, renewal cycles)

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

### Complete Catalog Buildout (Real Estate - Florida & California)

**Florida Real Estate CE:**
- **Post-Licensing Packages:**
  - Sales Associate: 45 hours, $59.99
  - Broker: 60 hours, $69.99
- **CE Renewal Package:** 14 hours (biennial), $39.99
  - 3 hours Core Law
  - 3 hours Ethics & Business Practices
  - 8 hours Specialty/Elective
- **À la Carte:** $15 per course (13 courses)
- **SKU Format:** FL-RE-[CE/PL]-[TYPE]-[HOURS]

**California Real Estate CE:**
- **CE Renewal Package:** 45 hours (quadrennial), $39.99
  - 7 mandatory courses (18 hours total)
  - 7 elective courses (27+ hours available)
- **À la Carte:** $15 per course (14 courses)
- **SKU Format:** CA-RE-CE-[TYPE]-[HOURS]

### Implementation
- **Seed Files:** `server/seedFloridaCatalog.ts`, `server/seedCaliforniaCatalog.ts`
- **UI Component:** CourseDisplay with product type, state, license type, cycle type, bucket, delivery, and pricing
- **Color-Coded Display:** Red (Core Law), Blue (Ethics), Purple (Specialty)
- **Pages:** /courses/fl for Florida, /courses/ca for California

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
