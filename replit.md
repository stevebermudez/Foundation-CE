# FoundationCE - Continuing Education Platform

## Overview
FoundationCE is a white-label continuing education platform designed for real estate and insurance professionals in California and Florida. It supports both web and native mobile applications, providing features such as practice exams, compliance tracking, and supervisor workflows. The platform's core purpose is to meet state-specific regulatory requirements for professional licensing and renewals, offering a comprehensive solution for continuing education in these sectors. The business vision is to provide a scalable, adaptable platform that can expand to other regulated industries and states, capitalizing on the recurring need for professional development and compliance.

## User Preferences
I prefer simple language and clear, direct instructions. I appreciate iterative development and want to be involved in key decisions, so please ask before making major architectural changes or implementing complex features. Do not make changes to the `Z` folder. Do not make changes to the `Y` file.

## System Architecture

### UI/UX Decisions
The platform uses `shadcn/ui` components with `Tailwind CSS` for a modern, responsive design with full dark mode support. The web application is built with React and TypeScript, while the native mobile app uses Expo/React Native for a consistent cross-platform experience. Key UI elements include CourseDisplay with color-coded requirement badges and a dashboard for progress tracking. The admin dashboard features a redesigned interface with persistent sidebar navigation using `shadcn Sidebar` for consistent navigation and includes KPI cards, data tables, and unified styling. A Squarespace-style visual page builder allows for managing marketing pages with various section and block types.

### Technical Implementations
- **Frontend**: React + TypeScript (web), Expo/React Native (mobile).
- **Backend**: Express.js + Node.js for API routes.
- **Database**: PostgreSQL (Neon) with Drizzle ORM.
- **Authentication**: Replit Auth (Google, GitHub, X, Apple) and session-based authentication for admin routes.
- **Payment Processing**: Stripe for credit cards, BTCPAY_SERVER or Coinbase for Bitcoin.
- **Course Management**: Robust classification by product type, state, license type, requirement cycle, and delivery. Includes an admin content builder (codeless LMS) for managing course content, quizzes, and exams from question banks.
- **Compliance & Reporting**: Electronic reporting to Florida DBPR, HTML certificate generation, WCAG 2.1 Level AA accessibility.
- **LMS Features**: Server-side authorization, sequential unit locking, course expiration management, and content export to Microsoft Word. Supports Florida DBPR regulatory compliance including dual end-of-course examinations and answer key exports.
- **Content Architecture**: Real FREC I educational content with lesson scripts and auto-update. Unit quizzes have 20 professionally-written questions with explanations and subunit references.
- **Interactive Learning**: Advanced block-based content editor for lessons with 17 block types (text, image, inline quiz, fill-in-the-blank, matching, hotspot, sorting, timeline). Six auto-graded block types provide instant feedback and track analytics.
- **Admin Features**: Comprehensive admin UI for user payments, refunds, account credits, system configuration, email templates, and user roles.
- **Regulatory Compliance Infrastructure**: Privacy consent, data subject rights, FERPA protection, SOC 2 audit logging, and dedicated legal pages.
- **Automated Processes**: `updatePlaceholderQuestions.ts` script for quiz deduplication and content replacement, `seed14HourCE.ts` for CE package creation.

### System Design Choices
- **Layered Architecture**: Abstracted data operations via `IStorage` interface.
- **API Design**: RESTful APIs with standardized, versioned data formats. OAuth/authentication logic is separated.
- **LMS Integration & Standards**: Designed for seamless integration, potential migration to 3rd-party LMS, and readiness for SCORM 1.2, QTI 2.1, and xAPI export.
- **Multi-State Configuration**: Abstracted state-specific regulatory requirements with a configurable database table and API routes, seeded for FL, CA, and TX.
- **Learning Analytics & Gamification**: Event tracking, summary dashboards, achievement/badge system, notifications, and learning paths.
- **Enterprise Content Pipeline**: Robust `catalogImportV2.ts` with pre-validation, post-verification, audit logging, and WebSocket-based Neon connection for true ACID transactions. Includes automatic quiz reconciliation.

## External Dependencies
- **Database**: Neon (PostgreSQL)
- **Authentication**: Replit Auth (Google, GitHub, X, Apple)
- **Payment Gateways**: Stripe, BTCPAY_SERVER, Coinbase
- **Affiliate Marketing**: PromoteKit
- **UI Framework**: shadcn/ui
- **Styling**: Tailwind CSS
- **Mobile Development**: Expo/React Native
- **ORM**: Drizzle ORM
- **Government Portals**: Florida DBPR (for electronic reporting)