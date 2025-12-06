# FoundationCE - Continuing Education Platform

## Overview
FoundationCE is a white-label continuing education platform for real estate and insurance professionals in California and Florida. It supports web and native mobile applications, offering features like practice exams, compliance tracking, and supervisor workflows. The platform aims to meet state-specific regulatory requirements for licensing and renewals, providing a comprehensive solution for professional development in these sectors.

## User Preferences
I prefer simple language and clear, direct instructions. I appreciate iterative development and want to be involved in key decisions, so please ask before making major architectural changes or implementing complex features. Do not make changes to the `Z` folder. Do not make changes to the `Y` file.

## System Architecture

### UI/UX Decisions
The platform utilizes `shadcn/ui` components with `Tailwind CSS` for a modern and responsive design, including full dark mode support. The web application is built with React and TypeScript, while the native mobile app uses Expo/React Native, ensuring a consistent cross-platform experience. Key UI components include CourseDisplay for detailed course information with color-coded requirement badges and a dashboard for tracking progress and compliance.

### Technical Implementations
- **Frontend**: React + TypeScript for the web application, Expo/React Native for native mobile applications.
- **Backend**: Express.js + Node.js providing API routes for courses, exams, enrollments, and payments.
- **Database**: PostgreSQL (Neon) for data persistence, managed with Drizzle ORM.
- **Authentication**: Replit Auth supporting Google, GitHub, X, and Apple social logins. Admin routes use session-based authentication with cookies.
- **Payment Processing**: Stripe for credit card payments and Bitcoin integration (BTCPAY_SERVER or Coinbase).
- **Course Classification**: A robust system categorizes courses by product type, state, license type, requirement cycle, and delivery method.
- **Compliance & Reporting**: Includes electronic reporting to Florida DBPR and HTML certificate generation.
- **Admin Content Builder**: A codeless LMS for managing course content, units, lessons, and media.

### Feature Specifications
- **Course Management**: Supports state-specific courses (CA/FL), filtering by license type, and requirement buckets (Core Law, Ethics, Electives).
- **Practice Exams**: Auto-scoring, real-time explanations, and answer tracking.
- **Supervisor Workflows**: Tools for CE review management and license expiration tracking.
- **White-Label Support**: Designed for multi-tenant architecture.
- **Email Campaigns**: Features for creating and tracking email blasts.

### System Design Choices
- **Layered Storage Interface**: Data operations are abstracted through an `IStorage` interface, allowing for flexible storage implementation changes.
- **Standardized Data Format**: Export APIs provide data in a consistent, versioned format for external system compatibility.
- **RESTful API Design**: Adheres to REST conventions for easy consumption by external systems.
- **Authentication Abstraction**: OAuth/authentication logic is separated for adaptability.
- **LMS Integration**: Architected for seamless integration and potential migration to 3rd-party LMS systems like Moodle or Canvas via data export/import APIs and SCORM package conversion readiness.
- **Real Estate Express Integration**: Dedicated APIs for exporting and importing enrollment data in Real Estate Express specific formats.

### LMS Content Architecture
The LMS now contains real FREC I educational content (63-hour Florida Sales Associate Pre-Licensing Course):
- **Content Source**: Detailed lesson scripts extracted from uploaded course materials in attached_assets
- **Coverage**: All 19 units have full educational content with learning objectives, key concepts, and exam preparation tips (60+ lessons total)
- **Content File**: `server/lessonContent.ts` contains all lesson HTML content organized by unit and lesson number
- **Auto-Update**: `server/updateLessonContent.ts` updates existing database lessons with real content on application startup
- **Topics Covered**: 
  - Units 1-3: Real estate business, license law, DBPR/FREC
  - Units 4-6: Agency relationships, brokerage operations, violations/penalties
  - Units 7-10: Fair housing, property rights, deeds, legal descriptions
  - Units 11-13: Real estate contracts, mortgages, loan types
  - Units 14-16: Closing procedures, market analysis, appraisal
  - Units 17-19: Investments, taxes, planning/zoning

### LMS Security Architecture
The LMS implements comprehensive server-side authorization to prevent client-side bypass attempts:
- **Enrollment Ownership**: All lesson, quiz, and exam routes verify the user owns the enrollment
- **Course Matching**: Routes validate that units/lessons/question banks belong to the enrolled course
- **Sequential Locking**: Unit progression is enforced server-side - locked units cannot be accessed even via direct API calls
- **Attempt Ownership**: Quiz and exam attempt routes verify the attempt belongs to the authenticated user
- **Practice Exam Security**: All practice exam routes require authentication and verify attempt ownership
- **Storage Methods**: `getUnit()` and `getLesson()` methods enable individual record validation for security checks

### Admin Content Export
Administrators can export course content to Word documents for offline review or distribution:
- **Export Button**: Located in admin dashboard → Courses tab, each course card has a download icon button
- **API Endpoint**: `GET /api/export/course/:courseId/content.docx` (requires admin authentication)
- **Document Contents**:
  - Course title, description, SKU, and total hours
  - All units with unit number, title, description, and required hours
  - Lessons table for each unit showing lesson number, title, duration, and video URL
- **File Format**: Microsoft Word (.docx) with proper headings and formatted tables
- **Key Files**:
  - `server/storage.ts` - `exportCourseContentDocx()` method generates the document
  - `client/src/pages/admin/courses.tsx` - Export button UI with FileDown icon

### Admin Financial Management
Complete admin UI for managing user payments, refunds, and account credits:
- **Finance Tab**: Located in admin dashboard (`/admin/dashboard` → Finance tab)
- **Database Tables**: `purchases`, `refunds`, `accountCredits` track all financial transactions
- **Features**:
  - View all purchases with search/filter by user email
  - Issue Stripe refunds (full or partial) with reason and notes
  - Add manual account credits for adjustments, promotions, or compensation
  - View user financial summaries with complete transaction history
  - Revenue/refund/credit totals displayed in overview cards
- **Validation**: Client-side validation ensures positive amounts, caps refunds to purchase amount
- **API Routes**:
  - `GET /api/admin/purchases` - List all purchases
  - `GET /api/admin/refunds` - List all refunds
  - `GET /api/admin/credits` - List all account credits
  - `GET /api/admin/users/:userId/financial` - User financial summary
  - `POST /api/admin/refunds` - Issue a refund
  - `POST /api/admin/credits` - Add account credit

### WCAG 2.1 Level AA Accessibility Compliance
The platform implements comprehensive accessibility features to ensure ADA compliance and protect against potential litigation:
- **Skip Navigation**: SkipLinks component allows keyboard users to bypass repetitive navigation and jump directly to main content
- **ARIA Landmarks**: Proper roles assigned to header (role="banner"), main content (role="main"), footer (role="contentinfo"), and navigation areas
- **Focus Indicators**: High-visibility focus outlines (2px solid ring) on all interactive elements for keyboard navigation
- **Screen Reader Support**: All icon-only buttons include descriptive aria-label attributes; decorative icons marked with aria-hidden="true"
- **Reduced Motion**: CSS media query @media (prefers-reduced-motion: reduce) disables animations for users with vestibular disorders
- **Form Accessibility**: All form inputs have associated labels via htmlFor/id pairing
- **Accessibility Statement**: Dedicated /accessibility page with compliance information and contact details for accessibility concerns
- **Key Files**: 
  - `client/src/components/SkipLinks.tsx` - Skip navigation component
  - `client/src/pages/accessibility.tsx` - Accessibility statement page
  - `client/src/index.css` - Focus indicators and reduced motion CSS utilities

## External Dependencies
- **Database**: Neon (PostgreSQL)
- **Authentication**: Replit Auth (Google, GitHub, X, Apple)
- **Payment Gateways**: Stripe, BTCPAY_SERVER, Coinbase
- **UI Framework**: shadcn/ui
- **Styling**: Tailwind CSS
- **Mobile Development**: Expo/React Native
- **ORM**: Drizzle ORM
- **Email Services**: Integrated for campaign management (specific provider not detailed, but functionality present)
- **Government Portals**: Florida DBPR (for electronic reporting)