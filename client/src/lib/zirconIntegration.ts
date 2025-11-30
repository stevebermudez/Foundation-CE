/**
 * Zircon Integration Module
 * 
 * Zircon is a third-party service that handles CE reporting to insurance
 * regulatory agencies across multiple states. This integration enables
 * automatic course completion reporting to:
 * - California Department of Insurance (CDI)
 * - Florida Office of Insurance Regulation (OIR)
 * - Other state insurance regulators as they are enabled
 */

export interface ZirconCourseCompletion {
  studentId: string;
  courseId: string;
  courseTitle: string;
  completionDate: string;
  ceHours: number;
  state: string;
  licenseNumber: string;
  licenseType: "life" | "health" | "property" | "casualty" | "all_lines";
  providerNumber: string;
  courseApprovalNumber: string;
}

export interface ZirconReportingStatus {
  completionId: string;
  status: "pending" | "submitted" | "accepted" | "rejected";
  submittedAt?: string;
  confirmedAt?: string;
  confirmationNumber?: string;
  errorMessage?: string;
}

export interface ZirconConfig {
  apiEndpoint: string;
  providerId: string;
  providerName: string;
  supportedStates: string[];
}

export const ZIRCON_CONFIG: ZirconConfig = {
  apiEndpoint: "https://api.zircon.io/v1", // placeholder
  providerId: "PROCE-001",
  providerName: "ProCE Professional Education",
  supportedStates: ["CA", "FL", "TX", "NY", "IL", "PA", "OH", "GA", "NC", "MI"],
};

/**
 * Submit a course completion to Zircon for reporting to the state insurance regulator
 */
export async function submitCourseCompletion(
  completion: ZirconCourseCompletion
): Promise<ZirconReportingStatus> {
  // todo: implement actual API call to Zircon
  console.log("Submitting to Zircon:", completion);
  
  // Simulated response for demo
  return {
    completionId: `ZRC-${Date.now()}`,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
}

/**
 * Check the status of a previously submitted completion
 */
export async function checkReportingStatus(
  completionId: string
): Promise<ZirconReportingStatus> {
  // todo: implement actual API call to Zircon
  console.log("Checking Zircon status for:", completionId);
  
  // Simulated response for demo
  return {
    completionId,
    status: "accepted",
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    confirmedAt: new Date().toISOString(),
    confirmationNumber: `CONF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
  };
}

/**
 * Get all pending reports for a student
 */
export async function getPendingReports(
  studentId: string
): Promise<ZirconReportingStatus[]> {
  // todo: implement actual API call to Zircon
  console.log("Getting pending reports for student:", studentId);
  
  return [];
}

/**
 * Validate license number format for a given state
 */
export function validateLicenseNumber(
  licenseNumber: string,
  state: string
): { valid: boolean; message?: string } {
  // Basic validation patterns by state
  const patterns: Record<string, RegExp> = {
    CA: /^[0-9A-Z]{7,10}$/,
    FL: /^[A-Z][0-9]{6,8}$/,
  };

  const pattern = patterns[state];
  if (!pattern) {
    return { valid: true }; // No validation for unsupported states
  }

  if (pattern.test(licenseNumber)) {
    return { valid: true };
  }

  return {
    valid: false,
    message: `Invalid license number format for ${state}`,
  };
}

/**
 * Get Zircon provider approval status for a state
 */
export function getProviderStatus(state: string): {
  approved: boolean;
  providerNumber?: string;
} {
  const providerNumbers: Record<string, string> = {
    CA: "CDI-PROCE-2024-001",
    FL: "OIR-PROCE-2024-001",
  };

  const providerNumber = providerNumbers[state];
  return {
    approved: !!providerNumber,
    providerNumber,
  };
}
