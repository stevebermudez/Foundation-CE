# FoundationCE - Continuing Education Platform

## Overview
A comprehensive white-label continuing education platform (FoundationCE) for real estate and insurance professionals in California and Florida. Supports both web and native mobile apps with practice exams, compliance tracking, and supervisor workflows.

## Key Requirements
- 45-hour renewal requirement every 4 years (salespersons & brokers)
- Prelicense education courses
- Course pricing: $59.99
- Compliance tracking and certificate generation
- State-specific regulatory requirements

## Project Structure
- **Web App**: React + TypeScript (client/src)
  - Pages: home, courses by state (CA/FL), course-view, dashboard, account-setup, compliance
  - Components: CourseBundle, PracticeExam, Dashboard, ComplianceTracker
  - UI: shadcn/ui components with Tailwind CSS
  - Ports to: http://0.0.0.0:5000
  
- **Native Mobile App**: Expo/React Native (native/)
  - Tab navigation: Courses, Dashboard, Settings
  - Cross-platform: iOS + Android via Expo
  - Setup: `cd native && npm install --legacy-peer-deps && npx expo start`
  
- **Backend**: Express.js + Node.js (server/)
  - API routes: /api/courses/*, /api/exams/*, /api/enrollments/*, /api/coupons/*, /api/emails/*
  - Services: Stripe payments, Bitcoin integration, email campaigns with tracking
  - Supervisor workflows: CE review management, license tracking
  
- **Database**: PostgreSQL (Neon)
  - Core tables: users, courses, enrollments, subscriptions
  - Features: practice exams, CE reviews, supervisor tracking, email campaigns, coupons
  
- **Authentication**: Replit Auth (Google, GitHub, X, Apple social logins)
- **Payments**: Stripe + Bitcoin (BTCPAY_SERVER or Coinbase integration ready)
- **Styling**: Tailwind CSS + shadcn components with dark mode

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

### Bug Fixes (December 2025)
- Fixed TypeScript type declarations for jsonwebtoken and bcrypt packages
- Fixed DBPR report type mismatch (now uses proper DBPRReport type instead of SirconReport)
- Fixed createEnrollment function call with correct number of arguments
- Fixed supervisors table insert (removed non-existent fullName/email fields)
- Fixed course.name → course.title references in export functions
- Removed invalid user.licenseNumber references (field doesn't exist in schema)
- Fixed docx export bold property (moved from Paragraph to TextRun)
- Removed enrollment updatedAt field from updates (field doesn't exist)
- Fixed duplicate getPracticeExams in IStorage interface
- Fixed Stripe payment_method_types (removed invalid apple_pay/google_pay values)

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

## Platform Features
- **Course Management**: State-specific (CA/FL), license-type filtering, requirement buckets
- **Practice Exams**: Auto-scoring (70% pass threshold), real-time explanations, answer tracking
- **Subscriptions**: Monthly/annual billing via Stripe
- **Coupons**: Discount codes with usage limits and validation
- **Email Blasts**: Campaign creation with open/click tracking and analytics
- **Supervisor Workflows**: CE review management, license expiration tracking
- **White-Label Support**: Multi-tenant architecture for organizations
- **Mobile Ready**: Native iOS/Android via Expo, web responsive design
- **Dark Mode**: Full light/dark theme support

## Architecture Notes
- Individual-only accounts (company accounts removed in recent update)
- Using Replit's built-in PostgreSQL database
- Stripe + Bitcoin payment options
- Server handles data persistence and API calls
- Frontend manages UI state with React Query
- Authentication: Replit Auth with social login support
- No "Choose Account Type" landing page - users go straight to individual setup

## LMS Integration & Plug-and-Play Capability

### Design for Future LMS Migration
The platform is architected for seamless integration with 3rd-party LMS systems via standardized data export/import:

**Data Export APIs (all with version="1.0" format):**
- `GET /api/export/course/:courseId` - Full course structure (units, lessons, videos)
- `GET /api/export/user/:userId/enrollments` - User enrollment history
- `GET /api/export/enrollment/:enrollmentId/progress` - Detailed progress tracking and certificates

**Plug-and-Play Architecture:**
1. **Layered Storage Interface** - All data operations via `IStorage` interface (server/storage.ts) - swap implementations without changing routes
2. **Standardized Data Format** - All exports include `formatVersion` and `exportedAt` for compatibility tracking
3. **RESTful API Design** - All endpoints follow REST conventions, easily consumable by external systems
4. **Authentication Abstraction** - OAuth/auth logic separated in `oauthAuth.ts` - adaptable to 3rd-party auth systems
5. **Database Agnostic** - Uses Drizzle ORM with PostgreSQL - can migrate to other databases by updating drizzle.config.ts

**Migration Path to Moodle/Canvas/Docebo:**
- Export course structure via `/api/export/course/:courseId` → SCORM package converter
- Export user progress via `/api/export/enrollment/:enrollmentId/progress` → LTI 1.3 grade sync
- Maintain dual operation during transition period
- All video assets remain accessible via `GET /api/videos/:videoId` endpoints

### Real Estate Express Integration
Real Estate Express specific endpoints for seamless data exchange:

**Export to Real Estate Express:**
- `GET /api/export/enrollment/:enrollmentId/ree` - Export enrollment data in Real Estate Express format
  - Includes student ID, name, email, license number
  - Course code (SKU), name, hours completed/required
  - Completion status, certificate number, progress percentage
  - Format version: "ree-1.0"

**Import from Real Estate Express:**
- `POST /api/import/ree/enrollment` - Import enrollment completion data from Real Estate Express
  - Required: studentEmail, courseCode
  - Optional: hoursCompleted, completed (boolean)
  - Automatically updates enrollment status and marks complete if applicable

**Use Cases:**
- Pull student enrollments from Real Estate Express and sync to FoundationCE
- Push completion data back to Real Estate Express after certificate generation
- Dual operation with both platforms during transition
- White-label support: each organization can maintain their own Real Estate Express account while using FoundationCE for delivery
