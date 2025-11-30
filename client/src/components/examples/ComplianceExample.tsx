import ComplianceTracker from "../ComplianceTracker";
import { ThemeProvider } from "../ThemeProvider";

export default function ComplianceExample() {
  return (
    <ThemeProvider>
      <ComplianceTracker selectedState="CA" />
    </ThemeProvider>
  );
}
