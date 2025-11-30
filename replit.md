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
- **Backend**: Express.js + Node.js (server)
- **Database**: PostgreSQL (Neon)
- **Authentication**: Replit Auth
- **Payments**: Stripe integration
- **Styling**: Tailwind CSS + shadcn components

## Recent Changes
- Created 45-hour CE course bundles for California (7 courses totaling 45 hours)
- Bundle pricing: $45 total, $15 per individual course
- Separate bundles for salespersons and brokers
- Courses included:
  - California Real Estate Law & Regulations (10h)
  - Fair Housing & Discrimination Laws (3h)
  - Real Estate Contracts & Transactions (8h)
  - Trust Accounts & Financial Management (6h)
  - Broker Responsibilities & Ethics (9h)
  - Property Management & Landlord-Tenant Law (5h)
  - Marketing & Advertising Compliance (4h)
- Created CourseBundle component for enrollment UI
- Created California courses page at /courses-ca
- Added bundle enrollment API endpoints
- Company compliance tracking with monitoring dashboard

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
