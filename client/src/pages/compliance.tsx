import ComplianceTracker from "@/components/ComplianceTracker";

interface CompliancePageProps {
  selectedState: "CA" | "FL";
}

export default function CompliancePage({ selectedState }: CompliancePageProps) {
  return <ComplianceTracker selectedState={selectedState} />;
}
