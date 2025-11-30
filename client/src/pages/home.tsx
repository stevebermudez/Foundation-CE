import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import TrustBadges from "@/components/TrustBadges";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, DollarSign } from "lucide-react";
import type { SelectCourse } from "@shared/schema";

export default function HomePage() {
  const [, setLocation] = useLocation();

  const { data: allCourses = [] } = useQuery<SelectCourse[]>({
    queryKey: ["/api/courses"],
    initialData: [],
  });

  const freci = allCourses.find(c => c.sku === "FL-RE-PL-SA-FRECI-63");

  const handleEnroll = async (courseId: string) => {
    try {
      const email = prompt("Enter your email address:");
      if (!email) return;

      const response = await fetch("/api/checkout/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, email }),
      });

      if (!response.ok) throw new Error("Checkout failed");
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to start checkout. Please try again.");
    }
  };

  return (
    <div>
      <Hero
        onBrowseCourses={() => setLocation("/courses/fl")}
        onGetStarted={() => setLocation("/courses/fl")}
      />
      <TrustBadges />
      <FeaturesSection />
    </div>
  );
}
