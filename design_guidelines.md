# Design Guidelines: Multi-State Continuing Education Platform

## Design Approach
**Hybrid Approach**: Design system foundation (Material Design for content-rich applications) with inspiration from firsttuesday.us and betterce.com for educational platform patterns. Focus on trust, compliance clarity, and learning efficiency.

**Core Principles**: 
- Professional credibility and regulatory compliance
- Clear information hierarchy for tracking and reporting
- Efficient learning workflows
- Accessible across devices and testing modes

## Typography System

**Font Stack**: 
- Primary: Inter (headings, UI elements) - professional, highly legible
- Secondary: Open Sans (body text, course content) - optimal reading

**Hierarchy**:
- Hero/Page Titles: text-4xl md:text-5xl font-bold
- Section Headers: text-2xl md:text-3xl font-semibold
- Card Titles: text-xl font-semibold
- Body Text: text-base leading-relaxed
- Labels/Meta: text-sm font-medium
- Captions: text-xs

## Layout System

**Spacing Primitives**: Tailwind units 2, 4, 6, 8, 12, 16
- Tight spacing: p-2, gap-2 (within components)
- Standard spacing: p-4, gap-4, m-6 (component padding)
- Section spacing: py-12 md:py-16, px-4 md:px-8
- Large gaps: gap-8, mb-12 (between major sections)

**Container Strategy**:
- Max widths: max-w-7xl (dashboard), max-w-4xl (course content), max-w-prose (lesson text)
- Full-width sections for video players and testing interfaces

## Component Library

### Navigation
**Main Header**: Sticky navigation with logo left, primary nav center (Browse Courses, My Courses, Compliance, Resources), user menu right with profile/notifications
- Mobile: Hamburger menu with drawer
- Include state selector toggle (CA/FL) in header

**Sidebar Navigation** (Dashboard/Admin):
- Vertical navigation for multi-section dashboards
- Collapsible on mobile
- Clear active state indicators

### Course Components

**Course Cards**: 
- Thumbnail image/icon top
- Title, CE hours badge, state/profession tags
- Progress bar if enrolled
- Brief description
- Primary CTA button

**Video Player**:
- Full-width within content area
- Custom controls with progress tracking
- Timestamp markers for lessons
- Resume capability indicator
- Side panel for lesson outline/notes

**PDF Viewer/Download**:
- Embedded preview with download button
- Chapter navigation sidebar
- Print-friendly formatting

### Testing Interface

**Quiz Container**:
- Clear question counter (Question 3 of 25)
- Timer display (for timed mode) - prominent but non-intrusive top-right
- "No Timer" badge for untimed courses
- Question text with generous whitespace
- Answer options with clear selection states
- Navigation: Previous/Next buttons, Review Answers option
- Submit button - distinct styling

**Results/Feedback**:
- Immediate answer feedback (correct/incorrect with explanations)
- Score summary cards
- Certificate preview/download on completion
- Retake options clearly presented

### Dashboard Components

**Progress Cards**:
- Course progress rings/bars
- CE hours completed/required counters
- Compliance status indicators (green checkmark, amber warning, red alert)
- Next deadline prominently displayed

**Compliance Panel**:
- Timeline view of requirements
- State-specific requirement checklists
- DRE/FREC reporting status with submission confirmations
- Audit trail table (date, action, status)

### Forms & Data Entry

**Search & Filters**:
- Prominent search bar with autocomplete
- Filter chips for: State, Profession, Category, CE Hours, Testing Mode
- Sort dropdown (Newest, Popular, CE Hours)

**Admin Approval Forms**:
- Multi-step forms with progress indicator
- File upload zones for course materials
- Compliance checklist with expandable sections
- Approval workflow status

## Page Layouts

### Homepage/Marketing
- Hero: Large background image (classroom/professional setting) with blurred-background CTA buttons
- Trust indicators: License numbers, accreditation badges, student count
- Course highlights grid: 3-column (lg), 2-column (md), 1-column (sm)
- State/profession selector cards
- Footer: Links, contact, regulatory info

### Course Catalog
- Filterable grid layout
- 3-column course cards (lg), 2-column (md), 1-column (sm)
- Sticky filter sidebar on desktop

### Course View
- Two-column: Video player/content (70%) + outline/resources sidebar (30%)
- Tabbed sections below: Lessons, Resources, Discussion
- Fixed bottom bar: Progress + Continue/Mark Complete button

### Student Dashboard
- Multi-section layout: Overview stats cards (top), Enrolled Courses grid, Compliance tracker, Recent certificates
- Responsive grid: 3-column stats cards, 2-column course grid

### Testing Interface
- Centered single-column layout (max-w-3xl)
- Sticky header with timer/progress
- Generous padding around questions
- Review panel (sidebar on desktop, modal on mobile)

## Images

**Hero Image**: Professional learning environment - modern classroom or professionals in training session. Position: Full-width hero section with overlay for text/CTAs.

**Course Thumbnails**: Category-specific imagery (real estate for property courses, insurance for insurance courses). Use consistently styled illustrations or professional photos.

**Trust/Accreditation**: Regulatory body logos (DRE, FREC) and accreditation badges throughout.

## Interaction Patterns

- Minimal animations: Subtle transitions on hover states, smooth scrolling
- Loading states: Skeleton screens for course lists, spinners for submissions
- Toast notifications for save confirmations and compliance updates
- Modal dialogs for certificate previews and important actions

## Accessibility Standards
- WCAG 2.1 AA compliance
- Keyboard navigation throughout testing interface
- Screen reader support for progress indicators
- High contrast mode support
- Focus indicators on all interactive elements