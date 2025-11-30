import { useState } from "react";
import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  const [selectedState] = useState<"CA" | "FL">("CA");
  
  return <Dashboard userName="Sarah" selectedState={selectedState} />;
}
