/**
 * NMLS MLO Continuing Education Courses
 * 
 * The Nationwide Multistate Licensing System (NMLS) requires Mortgage Loan
 * Originators (MLOs) to complete 8 hours of continuing education annually.
 * 
 * This module defines the NMLS 8-hour package requirements and course content
 * approved by both DRE (California) and DFPI (California).
 */

import type { StateCode } from "./stateRegulators";

export interface NMLSCourse {
  id: string;
  title: string;
  description: string;
  ceHours: number;
  category: "federal" | "ethics" | "non_traditional" | "elective";
  nmlsApprovalNumber: string;
  approvedStates: StateCode[];
  regulatoryAgencies: string[];
  timedOption: boolean;
  untimedOption: boolean;
  duration: string;
  lessons: {
    id: string;
    title: string;
    duration: string;
    type: "video" | "reading" | "quiz";
  }[];
  passingScore: number;
}

export interface NMLS8HourPackage {
  id: string;
  name: string;
  description: string;
  totalHours: number;
  price: number;
  state: StateCode;
  regulatoryAgencies: string[];
  courses: NMLSCourse[];
  requirements: {
    federalHours: number;
    ethicsHours: number;
    nonTraditionalHours: number;
    electiveHours: number;
  };
}

export const NMLS_COURSES: NMLSCourse[] = [
  {
    id: "nmls-federal-law",
    title: "Federal Mortgage Laws and Regulations",
    description: "Comprehensive review of TILA-RESPA Integrated Disclosure (TRID), ECOA, HMDA, and other federal mortgage regulations affecting MLOs.",
    ceHours: 3,
    category: "federal",
    nmlsApprovalNumber: "NMLS-14789",
    approvedStates: ["CA", "FL"],
    regulatoryAgencies: ["CA_DRE", "CA_DFPI", "FL_DBPR"],
    timedOption: true,
    untimedOption: true,
    duration: "3h 30m",
    lessons: [
      { id: "fl-1", title: "Introduction to Federal Mortgage Regulations", duration: "15:00", type: "video" },
      { id: "fl-2", title: "TILA-RESPA Integrated Disclosure (TRID)", duration: "45:00", type: "video" },
      { id: "fl-3", title: "Equal Credit Opportunity Act (ECOA)", duration: "30:00", type: "video" },
      { id: "fl-4", title: "Home Mortgage Disclosure Act (HMDA)", duration: "30:00", type: "video" },
      { id: "fl-5", title: "Fair Housing and Anti-Discrimination Laws", duration: "25:00", type: "video" },
      { id: "fl-6", title: "Regulation Z Updates", duration: "20:00", type: "video" },
      { id: "fl-7", title: "CFPB Compliance Requirements", duration: "25:00", type: "video" },
      { id: "fl-8", title: "Module Assessment", duration: "20:00", type: "quiz" },
    ],
    passingScore: 75,
  },
  {
    id: "nmls-ethics",
    title: "Ethics for Mortgage Professionals",
    description: "Professional ethics training covering integrity, transparency, conflicts of interest, and ethical decision-making for MLOs.",
    ceHours: 2,
    category: "ethics",
    nmlsApprovalNumber: "NMLS-14790",
    approvedStates: ["CA", "FL"],
    regulatoryAgencies: ["CA_DRE", "CA_DFPI", "FL_DBPR"],
    timedOption: true,
    untimedOption: true,
    duration: "2h 15m",
    lessons: [
      { id: "eth-1", title: "Foundations of Professional Ethics", duration: "20:00", type: "video" },
      { id: "eth-2", title: "Conflicts of Interest and Disclosure", duration: "25:00", type: "video" },
      { id: "eth-3", title: "Predatory Lending Prevention", duration: "25:00", type: "video" },
      { id: "eth-4", title: "Consumer Protection Responsibilities", duration: "20:00", type: "video" },
      { id: "eth-5", title: "Case Studies in Ethical Decision Making", duration: "30:00", type: "video" },
      { id: "eth-6", title: "Ethics Assessment", duration: "15:00", type: "quiz" },
    ],
    passingScore: 75,
  },
  {
    id: "nmls-non-traditional",
    title: "Non-Traditional Mortgage Products",
    description: "Training on non-QM loans, adjustable-rate mortgages, reverse mortgages, and other non-traditional lending products.",
    ceHours: 2,
    category: "non_traditional",
    nmlsApprovalNumber: "NMLS-14791",
    approvedStates: ["CA", "FL"],
    regulatoryAgencies: ["CA_DRE", "CA_DFPI", "FL_DBPR"],
    timedOption: true,
    untimedOption: true,
    duration: "2h 20m",
    lessons: [
      { id: "nt-1", title: "Non-QM Lending Overview", duration: "25:00", type: "video" },
      { id: "nt-2", title: "Adjustable Rate Mortgage Products", duration: "25:00", type: "video" },
      { id: "nt-3", title: "Reverse Mortgage Fundamentals", duration: "25:00", type: "video" },
      { id: "nt-4", title: "Bank Statement and Asset-Based Lending", duration: "20:00", type: "video" },
      { id: "nt-5", title: "Risk Assessment for Non-Traditional Products", duration: "20:00", type: "video" },
      { id: "nt-6", title: "Non-Traditional Products Assessment", duration: "15:00", type: "quiz" },
    ],
    passingScore: 75,
  },
  {
    id: "nmls-elective-ca",
    title: "California State-Specific Mortgage Updates",
    description: "State-specific elective covering California mortgage law updates, DRE and DFPI regulatory changes, and state compliance requirements.",
    ceHours: 1,
    category: "elective",
    nmlsApprovalNumber: "NMLS-14792-CA",
    approvedStates: ["CA"],
    regulatoryAgencies: ["CA_DRE", "CA_DFPI"],
    timedOption: true,
    untimedOption: true,
    duration: "1h 15m",
    lessons: [
      { id: "el-ca-1", title: "California Mortgage Law Updates 2024", duration: "20:00", type: "video" },
      { id: "el-ca-2", title: "DRE Licensing Requirements", duration: "15:00", type: "video" },
      { id: "el-ca-3", title: "DFPI Compliance Updates", duration: "20:00", type: "video" },
      { id: "el-ca-4", title: "California State Assessment", duration: "10:00", type: "quiz" },
    ],
    passingScore: 75,
  },
  {
    id: "nmls-elective-fl",
    title: "Florida State-Specific Mortgage Updates",
    description: "State-specific elective covering Florida mortgage law updates, DBPR regulatory changes, and state compliance requirements.",
    ceHours: 1,
    category: "elective",
    nmlsApprovalNumber: "NMLS-14792-FL",
    approvedStates: ["FL"],
    regulatoryAgencies: ["FL_DBPR"],
    timedOption: true,
    untimedOption: true,
    duration: "1h 15m",
    lessons: [
      { id: "el-fl-1", title: "Florida Mortgage Law Updates 2024", duration: "20:00", type: "video" },
      { id: "el-fl-2", title: "DBPR Licensing Requirements", duration: "15:00", type: "video" },
      { id: "el-fl-3", title: "Florida-Specific Compliance", duration: "20:00", type: "video" },
      { id: "el-fl-4", title: "Florida State Assessment", duration: "10:00", type: "quiz" },
    ],
    passingScore: 75,
  },
];

export const NMLS_8_HOUR_PACKAGES: NMLS8HourPackage[] = [
  {
    id: "nmls-8hr-ca",
    name: "California NMLS MLO 8-Hour CE Package",
    description: "Complete 8-hour NMLS continuing education package approved by California DRE and DFPI. Fulfills all annual CE requirements for California mortgage loan originators.",
    totalHours: 8,
    price: 149,
    state: "CA",
    regulatoryAgencies: ["CA_DRE", "CA_DFPI"],
    courses: [
      NMLS_COURSES.find(c => c.id === "nmls-federal-law")!,
      NMLS_COURSES.find(c => c.id === "nmls-ethics")!,
      NMLS_COURSES.find(c => c.id === "nmls-non-traditional")!,
      NMLS_COURSES.find(c => c.id === "nmls-elective-ca")!,
    ],
    requirements: {
      federalHours: 3,
      ethicsHours: 2,
      nonTraditionalHours: 2,
      electiveHours: 1,
    },
  },
  {
    id: "nmls-8hr-fl",
    name: "Florida NMLS MLO 8-Hour CE Package",
    description: "Complete 8-hour NMLS continuing education package approved by Florida DBPR. Fulfills all annual CE requirements for Florida mortgage loan originators.",
    totalHours: 8,
    price: 149,
    state: "FL",
    regulatoryAgencies: ["FL_DBPR"],
    courses: [
      NMLS_COURSES.find(c => c.id === "nmls-federal-law")!,
      NMLS_COURSES.find(c => c.id === "nmls-ethics")!,
      NMLS_COURSES.find(c => c.id === "nmls-non-traditional")!,
      NMLS_COURSES.find(c => c.id === "nmls-elective-fl")!,
    ],
    requirements: {
      federalHours: 3,
      ethicsHours: 2,
      nonTraditionalHours: 2,
      electiveHours: 1,
    },
  },
];

export function getNMLSPackageByState(state: StateCode): NMLS8HourPackage | undefined {
  return NMLS_8_HOUR_PACKAGES.find(p => p.state === state);
}

export function getNMLSCoursesByState(state: StateCode): NMLSCourse[] {
  return NMLS_COURSES.filter(c => c.approvedStates.includes(state));
}
