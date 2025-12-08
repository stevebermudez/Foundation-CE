import { db } from "./db";
import { stateConfigurations } from "@shared/schema";

async function seedStateConfigurations() {
  try {
    console.log("Seeding state configurations...");
    
    // Florida - Full configuration with DBPR regulatory data
    const floridaConfig = await db.insert(stateConfigurations).values({
      stateCode: "FL",
      stateName: "Florida",
      isActive: 1,
      regulatoryBody: "DBPR - Division of Real Estate",
      regulatoryUrl: "https://www.myfloridalicense.com/DBPR/real-estate/",
      licenseTypes: JSON.stringify(["Sales Associate", "Broker", "Broker Associate"]),
      requirementCycles: JSON.stringify(["Pre-Licensing", "Post-Licensing", "Continuing Education"]),
      renewalPeriodYears: 2,
      ceHoursRequired: 14,
      preLicenseHoursRequired: 63,
      postLicenseHoursRequired: 45,
      electronicReporting: 1,
      reportingFormat: "DBPR",
      specialRequirements: JSON.stringify({
        coreRequirement: "3 hours core law required each renewal",
        ethicsRequirement: "3 hours ethics every 2 years",
        brokerRequirement: "72-hour broker pre-license course",
        examRequirement: "Must pass state and national exam portions",
        postLicenseDeadline: "Initial 45 hours within first 18-24 months"
      }),
    }).onConflictDoUpdate({
      target: stateConfigurations.stateCode,
      set: {
        stateName: "Florida",
        regulatoryBody: "DBPR - Division of Real Estate",
        isActive: 1,
        updatedAt: new Date(),
      }
    }).returning();
    
    console.log("✓ Florida configuration seeded:", floridaConfig[0].stateCode);
    
    // California - Prepared for expansion (inactive)
    const californiaConfig = await db.insert(stateConfigurations).values({
      stateCode: "CA",
      stateName: "California",
      isActive: 0,
      regulatoryBody: "DRE - Department of Real Estate",
      regulatoryUrl: "https://www.dre.ca.gov/",
      licenseTypes: JSON.stringify(["Salesperson", "Broker"]),
      requirementCycles: JSON.stringify(["Pre-Licensing", "Continuing Education"]),
      renewalPeriodYears: 4,
      ceHoursRequired: 45,
      preLicenseHoursRequired: 135,
      postLicenseHoursRequired: 0,
      electronicReporting: 1,
      reportingFormat: "DRE",
      specialRequirements: JSON.stringify({
        collegeCredits: "Minimum 3 semester units or equivalent",
        brokerExperience: "2 years full-time salesperson experience",
        examValidity: "Exam scores valid for 2 years",
        firstRenewal: "45 hours including ethics, agency, fair housing, trust funds"
      }),
    }).onConflictDoUpdate({
      target: stateConfigurations.stateCode,
      set: {
        stateName: "California",
        updatedAt: new Date(),
      }
    }).returning();
    
    console.log("✓ California configuration seeded:", californiaConfig[0].stateCode);
    
    // Texas - Prepared for expansion (inactive)
    const texasConfig = await db.insert(stateConfigurations).values({
      stateCode: "TX",
      stateName: "Texas",
      isActive: 0,
      regulatoryBody: "TREC - Texas Real Estate Commission",
      regulatoryUrl: "https://www.trec.texas.gov/",
      licenseTypes: JSON.stringify(["Sales Agent", "Broker"]),
      requirementCycles: JSON.stringify(["Pre-Licensing", "Continuing Education"]),
      renewalPeriodYears: 2,
      ceHoursRequired: 18,
      preLicenseHoursRequired: 180,
      postLicenseHoursRequired: 0,
      electronicReporting: 1,
      reportingFormat: "TREC",
      specialRequirements: JSON.stringify({
        legalUpdate: "4 hours Legal Update I required",
        legalUpdate2: "4 hours Legal Update II required",
        brokerResponsibility: "6 hours broker responsibility (first renewal)",
        examRequirement: "Pass state exam within 1 year of completing education"
      }),
    }).onConflictDoUpdate({
      target: stateConfigurations.stateCode,
      set: {
        stateName: "Texas",
        updatedAt: new Date(),
      }
    }).returning();
    
    console.log("✓ Texas configuration seeded:", texasConfig[0].stateCode);
    
    console.log("\n✓ All state configurations seeded successfully!");
    console.log("  - Florida (Active)");
    console.log("  - California (Inactive - Ready for expansion)");
    console.log("  - Texas (Inactive - Ready for expansion)");
    
  } catch (err) {
    console.error("Error seeding state configurations:", err);
    throw err;
  }
}

seedStateConfigurations().then(() => process.exit(0)).catch(() => process.exit(1));
