import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Hero from "@/components/Hero";
import StateSelector from "@/components/StateSelector";
import FeaturesSection from "@/components/FeaturesSection";
import TrustBadges from "@/components/TrustBadges";
import CourseCatalog from "@/components/CourseCatalog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, DollarSign } from "lucide-react";

export default function HomePage() {
  const [selectedState, setSelectedState] = useState<"CA" | "FL">("CA");
  const [, setLocation] = useLocation();

  const { data: allCourses = [] } = useQuery({
    queryKey: ["/api/courses"],
    initialData: [],
  });

  const freci = allCourses.find(c => c.sku === "FL-RE-PL-SA-FRECI-63");

  const handleStateSelect = (state: "CA" | "FL") => {
    setSelectedState(state);
    setLocation(state === "CA" ? "/courses/ca" : "/courses/fl");
  };

  return (
    <div>
      <Hero
        onBrowseCourses={() => setLocation("/courses")}
        onGetStarted={() => setLocation("/courses")}
      />
      <TrustBadges />

      {/* Featured Prelicensing Course */}
      {freci && (
        <section className="py-16 px-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Florida Prelicensing Course
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Complete your 63-hour requirement to get licensed
              </p>
            </div>
            <Card className="border-2 border-blue-200 shadow-lg hover-elevate">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{freci.title}</CardTitle>
                    <CardDescription className="mt-2 text-base">{freci.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-6 mb-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-semibold">{freci.hoursRequired} Hours</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Format</p>
                      <p className="font-semibold">Self-Paced</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-semibold">${(freci.price / 100).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    size="lg"
                    onClick={() => setLocation(`/course/${freci.id}`)}
                    data-testid="button-freci-course"
                  >
                    View Course
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setLocation("/courses/fl")}
                    data-testid="button-all-fl-courses"
                  >
                    Browse All Florida Courses
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

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
