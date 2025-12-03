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

### LMS Security Architecture
The LMS implements comprehensive server-side authorization to prevent client-side bypass attempts:
- **Enrollment Ownership**: All lesson, quiz, and exam routes verify the user owns the enrollment
- **Course Matching**: Routes validate that units/lessons/question banks belong to the enrolled course
- **Sequential Locking**: Unit progression is enforced server-side - locked units cannot be accessed even via direct API calls
- **Attempt Ownership**: Quiz and exam attempt routes verify the attempt belongs to the authenticated user
- **Practice Exam Security**: All practice exam routes require authentication and verify attempt ownership
- **Storage Methods**: `getUnit()` and `getLesson()` methods enable individual record validation for security checks

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