import Dashboard from "../Dashboard";
import { ThemeProvider } from "../ThemeProvider";

export default function DashboardExample() {
  return (
    <ThemeProvider>
      <Dashboard userName="Sarah" selectedState="CA" />
    </ThemeProvider>
  );
}
