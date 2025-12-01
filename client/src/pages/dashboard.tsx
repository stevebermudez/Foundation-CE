import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  const [selectedState] = useState<"CA" | "FL">("FL");
  const [userName, setUserName] = useState("User");
  const [, setLocation] = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const user = await response.json();
          setUserName(user.firstName || user.email?.split("@")[0] || "User");
        } else {
          setLocation("/login");
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setLocation("/login");
      }
    };
    fetchUser();
  }, [setLocation]);
  
  return <Dashboard userName={userName} selectedState={selectedState} />;
}
