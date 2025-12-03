import { DBPRReport } from "@shared/schema";

export interface DBPRSubmissionResult {
  success: boolean;
  confirmationNumber?: string;
  errorMessage?: string;
  submittedAt: Date;
}

export interface DBPRCourseCompletionData {
  studentName: string;
  licenseNumber: string;
  ssnLast4?: string;
  courseTitle: string;
  courseOfferingNumber: string;
  providerNumber: string;
  completionDate: Date;
  ceHours: number;
  instructorName?: string;
  licenseType: "salesperson" | "broker" | "instructor";
}

export async function submitToDBPR(data: DBPRCourseCompletionData): Promise<DBPRSubmissionResult> {
  const DBPR_API_URL = process.env.DBPR_API_URL;
  const DBPR_API_KEY = process.env.DBPR_API_KEY;
  const DBPR_PROVIDER_ID = process.env.DBPR_PROVIDER_ID;

  if (!DBPR_API_URL || !DBPR_API_KEY) {
    console.log("DBPR API not configured - using simulation mode");
    return simulateDBPRSubmission(data);
  }

  try {
    const payload = {
      providerId: DBPR_PROVIDER_ID,
      completionRecord: {
        studentLicenseNumber: data.licenseNumber,
        studentSSNLast4: data.ssnLast4,
        studentName: data.studentName,
        courseOfferingNumber: data.courseOfferingNumber,
        courseTitle: data.courseTitle,
        completionDate: data.completionDate.toISOString().split('T')[0],
        creditHours: data.ceHours,
        instructorName: data.instructorName,
        licenseType: mapLicenseType(data.licenseType),
      },
      submissionTimestamp: new Date().toISOString(),
    };

    const response = await fetch(DBPR_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DBPR_API_KEY}`,
        "X-Provider-ID": DBPR_PROVIDER_ID || "",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        errorMessage: `DBPR API Error: ${response.status} - ${errorText}`,
        submittedAt: new Date(),
      };
    }

    const result = await response.json();
    return {
      success: true,
      confirmationNumber: result.confirmationNumber || result.transactionId,
      submittedAt: new Date(),
    };
  } catch (error: any) {
    console.error("DBPR submission error:", error);
    return {
      success: false,
      errorMessage: error.message || "Failed to connect to DBPR API",
      submittedAt: new Date(),
    };
  }
}

function simulateDBPRSubmission(data: DBPRCourseCompletionData): DBPRSubmissionResult {
  const confirmationNumber = `DBPR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  console.log("=== DBPR Submission (Simulation Mode) ===");
  console.log("Student:", data.studentName);
  console.log("License Number:", data.licenseNumber);
  console.log("Course:", data.courseTitle);
  console.log("CE Hours:", data.ceHours);
  console.log("Completion Date:", data.completionDate.toISOString().split('T')[0]);
  console.log("Confirmation Number:", confirmationNumber);
  console.log("==========================================");

  return {
    success: true,
    confirmationNumber,
    submittedAt: new Date(),
  };
}

function mapLicenseType(type: string): string {
  const typeMap: Record<string, string> = {
    salesperson: "SL",
    broker: "BK", 
    instructor: "IN",
  };
  return typeMap[type] || "SL";
}

export function generateDBPRFileRecord(report: DBPRReport): string {
  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const fields = [
    report.providerNumber || "ZH0004868",
    report.courseOfferingNumber || "",
    report.licenseNumber || "",
    report.ssnLast4 || "",
    report.studentName,
    formatDate(new Date(report.completionDate)),
    report.ceHours.toString(),
    mapLicenseType(report.licenseType),
    report.instructorName || "",
  ];

  return fields.join("|");
}

export function generateDBPRBatchFile(reports: DBPRReport[]): string {
  const header = [
    "PROVIDER_NUMBER",
    "COURSE_OFFERING_NUMBER", 
    "LICENSE_NUMBER",
    "SSN_LAST4",
    "STUDENT_NAME",
    "COMPLETION_DATE",
    "CE_HOURS",
    "LICENSE_TYPE",
    "INSTRUCTOR_NAME",
  ].join("|");

  const records = reports.map(generateDBPRFileRecord);
  
  return [header, ...records].join("\n");
}

export async function validateDBPRData(data: DBPRCourseCompletionData): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (!data.studentName || data.studentName.trim().length < 2) {
    errors.push("Student name is required and must be at least 2 characters");
  }

  if (!data.licenseNumber) {
    errors.push("License number is required for DBPR reporting");
  } else if (!/^[A-Z]{2}\d+$/.test(data.licenseNumber.toUpperCase())) {
    errors.push("License number format appears invalid (expected format: SL1234567 or BK1234567)");
  }

  if (!data.courseOfferingNumber) {
    errors.push("Course offering number is required");
  }

  if (!data.providerNumber) {
    errors.push("Provider number is required");
  }

  if (data.ceHours <= 0) {
    errors.push("CE hours must be greater than 0");
  }

  if (!data.completionDate) {
    errors.push("Completion date is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
