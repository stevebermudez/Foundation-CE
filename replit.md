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
- **Florida CE Courses Added**:
  - 45-hour post-licensing for sales associates: $59.99
  - 60-hour post-licensing for brokers: $69.99
  - 14-hour renewal (every 2 years, both license types): $39.99
  - Individual courses: $15 each
  - Pages: /courses/fl for Florida, /courses/ca for California

- **California CE Courses**:
  - 45-hour renewal bundles: $45 total
  - 7 courses totaling 45 hours

- **Features Implemented**:
  - CourseBundle component for enrollment UI
  - State-based course filtering (CA, FL)
  - Bundle and individual course pricing
  - Company compliance tracking with expiration dates
  - White-label organization support

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
