import { useState } from "react";
import Hero from "@/components/Hero";
import StateSelector from "@/components/StateSelector";
import FeaturesSection from "@/components/FeaturesSection";
import TrustBadges from "@/components/TrustBadges";
import CourseCatalog from "@/components/CourseCatalog";
import { useLocation } from "wouter";

export default function HomePage() {
  const [selectedState, setSelectedState] = useState<"CA" | "FL">("CA");
  const [, setLocation] = useLocation();

  const handleStateSelect = (state: "CA" | "FL") => {
    setSelectedState(state);
    setLocation(state === "CA" ? "/courses/ca" : "/courses/fl");
  };

  return (
    <div>
      <Hero
        onBrowseCourses={() => setLocation(selectedState === "CA" ? "/courses/ca" : "/courses/fl")}
        onGetStarted={() => setLocation(selectedState === "CA" ? "/courses/ca" : "/courses/fl")}
      />
      <TrustBadges />
      <StateSelector onSelectState={handleStateSelect} />
      <FeaturesSection />
      <section className="py-16 px-4 bg-muted/30">
        <div className="mx-auto max-w-7xl mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Popular Courses
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start earning CE credits today with our most popular state-approved courses.
          </p>
        </div>
        <CourseCatalog selectedState={selectedState} />
      </section>
    </div>
  );
}
