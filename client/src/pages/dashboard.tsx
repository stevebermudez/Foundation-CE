import Dashboard from "@/components/Dashboard";

interface DashboardPageProps {
  selectedState: "CA" | "FL";
}

export default function DashboardPage({ selectedState }: DashboardPageProps) {
  // todo: replace with actual user data
  return <Dashboard userName="Sarah" selectedState={selectedState} />;
}
