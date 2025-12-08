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
- **Florida DBPR Regulatory Compliance**: Complete support for Florida distance education course approval requirements including:
  - Answer key export with page number references for final exam questions
  - Dual end-of-course examinations (Form A and Form B) for pre-licensing and post-licensing courses
  - Export capabilities for regulatory submission
  - Page reference and unit reference fields in exam questions schema
- **Automated Placeholder Cleanup**: The `updatePlaceholderQuestions.ts` script runs on every server restart to:
  - Detect and remove duplicate quizzes (keeping those with real content)
  - Replace placeholder questions with real content from question banks
  - Ensure all unit quizzes contain authentic educational content
- **Unit Quiz Question Banks**: All 19 units contain exactly 20 professionally-written quiz questions each (380 total):
  - Questions include detailed explanations and subunit references
  - Each question is specifically covered in the corresponding unit's lesson content
  - Import script: `server/importAllUnitQuizzes.ts` replaces all unit quiz questions
- **Visual Page Builder (CMS)**: Squarespace-style drag-and-drop page editor for managing marketing pages without code:
  - Database tables: `site_pages`, `page_sections`, `section_blocks` with hierarchical structure
  - Section types: Hero, Text Content, Features Grid, Call to Action, Column Layout, Image Gallery, Custom HTML
  - Block types: Heading, Text, Image, Video, Button, Spacer, Divider, HTML
  - Full CRUD operations via admin API endpoints at `/api/admin/site-pages`
  - PageRenderer and CMSPage components for displaying dynamic CMS content on frontend
  - Direct slug-based routing at `/:slug` with SEO metadata propagation (document.title, meta description, OG tags)
  - Publish-state enforcement: unpublished pages return 404 to public visitors
  - Complex responsive layouts: columns auto-stack on mobile, features grid, gallery with hover effects
  - Admin access at `/admin/pages` or `/admin/pages-manager`

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
- **Affiliate Marketing**: PromoteKit (Stripe-native affiliate tracking)
- **UI Framework**: shadcn/ui
- **Styling**: Tailwind CSS
- **Mobile Development**: Expo/React Native
- **ORM**: Drizzle ORM
- **Government Portals**: Florida DBPR (for electronic reporting)

## Affiliate Marketing (PromoteKit)

### Overview
The platform uses PromoteKit for affiliate marketing, which integrates directly with Stripe for tracking referrals and commissions.

### Setup Instructions
1. **Create PromoteKit Account**: Sign up at https://promotekit.com
2. **Connect Stripe**: Link your Stripe account in PromoteKit dashboard
3. **Configure Campaign**: Set commission rates, cookie duration, and payout terms
4. **Update Script**: Replace the PromoteKit script in `client/index.html` with your account-specific script from PromoteKit setup

### How It Works
- PromoteKit script (`client/index.html`) tracks visitors who arrive via affiliate links
- Referral ID stored in `window.promotekit_referral` cookie (60-day duration)
- Checkout page (`client/src/pages/checkout.tsx`) passes referral to backend
- Backend (`server/routes.ts`) includes `promotekit_referral` in Stripe checkout metadata
- PromoteKit automatically tracks conversions via Stripe webhook integration

### Files Involved
- `client/index.html` - PromoteKit tracking script
- `client/src/pages/checkout.tsx` - Passes referral ID to checkout API
- `server/routes.ts` - Includes referral in Stripe metadata
- `client/src/pages/affiliate-program.tsx` - Public affiliate program info page

### Commission Structure (Configurable in PromoteKit)
- Starter: 15% (0-10 sales/month)
- Pro Partner: 20% (11-50 sales/month)
- Elite Partner: 25% (50+ sales/month)

### Pricing
- Free tier: Up to 3 referrals
- Pro: $29/month (up to $10K/month in affiliate revenue)