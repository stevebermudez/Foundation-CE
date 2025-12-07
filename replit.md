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
- **Admin Content Builder**: A codeless LMS for managing course content, units, lessons, and media, including comprehensive quiz and exam management with question banks and configurable options.
- **LMS Content Architecture**: Contains real FREC I educational content (63-hour Florida Sales Associate Pre-Licensing Course) with detailed lesson scripts and auto-update functionality.
- **LMS Security Architecture**: Implements comprehensive server-side authorization including enrollment ownership, course matching, sequential unit locking, and attempt ownership verification.
- **Admin Content Export**: Allows administrators to export course content to Microsoft Word documents for offline review.
- **Admin Financial Management**: Provides a complete admin UI for managing user payments, refunds, and account credits.
- **WCAG 2.1 Level AA Accessibility Compliance**: Implements features like Skip Navigation, ARIA Landmarks, high-visibility focus indicators, screen reader support, reduced motion, and form accessibility.
- **Course Expiration Management**: Configurable enrollment expiration periods tracked per course, with content access blocking for expired non-completed enrollments.
- **Admin Settings Management**: Infrastructure for system configuration, email templates, and user roles.
- **Regulatory Compliance Infrastructure**: Includes privacy consent management (cookie banner, preference center), data subject rights (export, deletion, do not sell), FERPA educational records protection, SOC 2 audit logging, and dedicated legal compliance pages.

### System Design Choices
- **Layered Storage Interface**: Data operations abstracted through an `IStorage` interface.
- **Standardized Data Format**: Export APIs provide consistent, versioned data.
- **RESTful API Design**: Adheres to REST conventions.
- **Authentication Abstraction**: OAuth/authentication logic is separated.
- **LMS Integration**: Architected for seamless integration and potential migration to 3rd-party LMS systems via data export/import APIs and SCORM package conversion readiness.
- **Real Estate Express Integration**: Dedicated APIs for exporting and importing enrollment data in specific formats.

## External Dependencies
- **Database**: Neon (PostgreSQL)
- **Authentication**: Replit Auth (Google, GitHub, X, Apple)
- **Payment Gateways**: Stripe, BTCPAY_SERVER, Coinbase
- **UI Framework**: shadcn/ui
- **Styling**: Tailwind CSS
- **Mobile Development**: Expo/React Native
- **ORM**: Drizzle ORM
- **Government Portals**: Florida DBPR (for electronic reporting)