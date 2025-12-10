export type StateCode = 
  | "AL" | "AK" | "AZ" | "AR" | "CA" | "CO" | "CT" | "DE" | "FL" | "GA"
  | "HI" | "ID" | "IL" | "IN" | "IA" | "KS" | "KY" | "LA" | "ME" | "MD"
  | "MA" | "MI" | "MN" | "MS" | "MO" | "MT" | "NE" | "NV" | "NH" | "NJ"
  | "NM" | "NY" | "NC" | "ND" | "OH" | "OK" | "OR" | "PA" | "RI" | "SC"
  | "SD" | "TN" | "TX" | "UT" | "VT" | "VA" | "WA" | "WV" | "WI" | "WY";

export type ProfessionType = "real_estate" | "insurance" | "mortgage";

export interface ExamPolicy {
  passingScore: number; // Minimum passing percentage (e.g., 70)
  retestWaitDays: number; // Days to wait before retesting after failure
  maxRetestsPerYear: number; // Maximum retests within one year of original exam
  requiresCourseRepeatAfterMaxRetests: boolean; // Must repeat course after max retests
  hourEquivalency: string; // "50-minute distance learning hour = 50-minute classroom hour"
}

export interface RegulatoryAgency {
  id: string;
  name: string;
  abbreviation: string;
  state: StateCode;
  profession: ProfessionType;
  website: string;
  ceRequirements: {
    totalHours: number;
    renewalPeriod: string;
    mandatoryTopics?: { topic: string; hours: number }[];
  };
  examPolicy?: ExamPolicy; // Florida Rule 61J2-3.008(5)(a) exam policies
  reportingMethod: "auto" | "manual" | "sircon";
  supportsUntimedExams: boolean;
}

export interface StateInfo {
  code: StateCode;
  name: string;
  enabled: boolean;
  comingSoon: boolean;
  agencies: RegulatoryAgency[];
}

export const REGULATORY_AGENCIES: Record<string, RegulatoryAgency> = {
  CA_DRE: {
    id: "CA_DRE",
    name: "California Department of Real Estate",
    abbreviation: "DRE",
    state: "CA",
    profession: "real_estate",
    website: "https://www.dre.ca.gov/",
    ceRequirements: {
      totalHours: 45,
      renewalPeriod: "4 years",
      mandatoryTopics: [
        { topic: "Ethics", hours: 3 },
        { topic: "Fair Housing", hours: 3 },
        { topic: "Agency", hours: 3 },
        { topic: "Trust Fund Handling", hours: 3 },
        { topic: "Risk Management", hours: 3 },
      ],
    },
    reportingMethod: "auto",
    supportsUntimedExams: true,
  },
  CA_DFPI: {
    id: "CA_DFPI",
    name: "California Department of Financial Protection and Innovation",
    abbreviation: "DFPI",
    state: "CA",
    profession: "mortgage",
    website: "https://dfpi.ca.gov/",
    ceRequirements: {
      totalHours: 8,
      renewalPeriod: "1 year",
      mandatoryTopics: [
        { topic: "Federal Law & Regulations", hours: 3 },
        { topic: "Ethics", hours: 2 },
        { topic: "Non-Traditional Mortgage Lending", hours: 2 },
        { topic: "Electives", hours: 1 },
      ],
    },
    reportingMethod: "auto",
    supportsUntimedExams: true,
  },
  CA_DOI: {
    id: "CA_DOI",
    name: "California Department of Insurance",
    abbreviation: "CDI",
    state: "CA",
    profession: "insurance",
    website: "https://www.insurance.ca.gov/",
    ceRequirements: {
      totalHours: 24,
      renewalPeriod: "2 years",
      mandatoryTopics: [
        { topic: "Ethics", hours: 3 },
        { topic: "Annuity Training", hours: 4 },
      ],
    },
    reportingMethod: "sircon",
    supportsUntimedExams: true,
  },
  FL_FREC: {
    id: "FL_FREC",
    name: "Florida Real Estate Commission",
    abbreviation: "FREC",
    state: "FL",
    profession: "real_estate",
    website: "https://www.myfloridalicense.com/DBPR/real-estate-commission/",
    ceRequirements: {
      totalHours: 14,
      renewalPeriod: "2 years",
      mandatoryTopics: [
        { topic: "Core Law", hours: 3 },
        { topic: "Ethics", hours: 3 },
      ],
    },
    examPolicy: {
      passingScore: 70,
      retestWaitDays: 30,
      maxRetestsPerYear: 1,
      requiresCourseRepeatAfterMaxRetests: true,
      hourEquivalency: "A 50-minute distance learning hour is equivalent to a 50-minute classroom hour",
    },
    reportingMethod: "auto",
    supportsUntimedExams: true,
  },
  FL_OIR: {
    id: "FL_OIR",
    name: "Florida Office of Insurance Regulation",
    abbreviation: "OIR",
    state: "FL",
    profession: "insurance",
    website: "https://floir.com/",
    ceRequirements: {
      totalHours: 24,
      renewalPeriod: "2 years",
      mandatoryTopics: [
        { topic: "Ethics", hours: 3 },
        { topic: "Laws & Rules Update", hours: 5 },
      ],
    },
    reportingMethod: "sircon",
    supportsUntimedExams: true,
  },
  FL_DBPR: {
    id: "FL_DBPR",
    name: "Florida Department of Business and Professional Regulation",
    abbreviation: "DBPR",
    state: "FL",
    profession: "mortgage",
    website: "https://www.myfloridalicense.com/",
    ceRequirements: {
      totalHours: 8,
      renewalPeriod: "1 year",
      mandatoryTopics: [
        { topic: "Federal Law & Regulations", hours: 3 },
        { topic: "Ethics", hours: 2 },
        { topic: "Non-Traditional Mortgage Lending", hours: 2 },
        { topic: "Electives", hours: 1 },
      ],
    },
    reportingMethod: "auto",
    supportsUntimedExams: true,
  },
};

export const ALL_STATES: StateInfo[] = [
  {
    code: "AL",
    name: "Alabama",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "AK",
    name: "Alaska",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "AZ",
    name: "Arizona",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "AR",
    name: "Arkansas",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "CA",
    name: "California",
    enabled: true,
    comingSoon: false,
    agencies: [
      REGULATORY_AGENCIES.CA_DRE,
      REGULATORY_AGENCIES.CA_DFPI,
      REGULATORY_AGENCIES.CA_DOI,
    ],
  },
  {
    code: "CO",
    name: "Colorado",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "CT",
    name: "Connecticut",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "DE",
    name: "Delaware",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "FL",
    name: "Florida",
    enabled: true,
    comingSoon: false,
    agencies: [
      REGULATORY_AGENCIES.FL_FREC,
      REGULATORY_AGENCIES.FL_OIR,
      REGULATORY_AGENCIES.FL_DBPR,
    ],
  },
  {
    code: "GA",
    name: "Georgia",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "HI",
    name: "Hawaii",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "ID",
    name: "Idaho",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "IL",
    name: "Illinois",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "IN",
    name: "Indiana",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "IA",
    name: "Iowa",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "KS",
    name: "Kansas",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "KY",
    name: "Kentucky",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "LA",
    name: "Louisiana",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "ME",
    name: "Maine",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "MD",
    name: "Maryland",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "MA",
    name: "Massachusetts",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "MI",
    name: "Michigan",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "MN",
    name: "Minnesota",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "MS",
    name: "Mississippi",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "MO",
    name: "Missouri",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "MT",
    name: "Montana",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "NE",
    name: "Nebraska",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "NV",
    name: "Nevada",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "NH",
    name: "New Hampshire",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "NJ",
    name: "New Jersey",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "NM",
    name: "New Mexico",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "NY",
    name: "New York",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "NC",
    name: "North Carolina",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "ND",
    name: "North Dakota",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "OH",
    name: "Ohio",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "OK",
    name: "Oklahoma",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "OR",
    name: "Oregon",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "PA",
    name: "Pennsylvania",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "RI",
    name: "Rhode Island",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "SC",
    name: "South Carolina",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "SD",
    name: "South Dakota",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "TN",
    name: "Tennessee",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "TX",
    name: "Texas",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "UT",
    name: "Utah",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "VT",
    name: "Vermont",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "VA",
    name: "Virginia",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "WA",
    name: "Washington",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "WV",
    name: "West Virginia",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "WI",
    name: "Wisconsin",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
  {
    code: "WY",
    name: "Wyoming",
    enabled: false,
    comingSoon: true,
    agencies: [],
  },
];

export const ENABLED_STATES = ALL_STATES.filter((s) => s.enabled);
export const COMING_SOON_STATES = ALL_STATES.filter((s) => s.comingSoon);

export function getStateByCode(code: StateCode): StateInfo | undefined {
  return ALL_STATES.find((s) => s.code === code);
}

export function getAgenciesByState(code: StateCode): RegulatoryAgency[] {
  return getStateByCode(code)?.agencies || [];
}

export function getAgenciesByProfession(
  code: StateCode,
  profession: ProfessionType
): RegulatoryAgency[] {
  return getAgenciesByState(code).filter((a) => a.profession === profession);
}
