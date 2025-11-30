import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import TrustBadges from "@/components/TrustBadges";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, DollarSign } from "lucide-react";

export default function HomePage() {
  const [, setLocation] = useLocation();

  const { data: allCourses = [] } = useQuery({
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
        onBrowseCourses={() => freci && setLocation(`/course/${freci.id}`)}
        onGetStarted={() => freci && handleEnroll(freci.id)}
      />
      <TrustBadges />

      {/* Featured Prelicensing Course */}
      {freci && (
        <section className="py-16 px-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Florida Sales Associate Prelicensing
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Complete your 63-hour requirement and get licensed in real estate
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
                <div className="grid sm:grid-cols-4 gap-6 mb-6">
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
                      <p className="text-sm text-muted-foreground">Units</p>
                      <p className="font-semibold">19 Units</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 text-blue-600">✓</div>
                    <div>
                      <p className="text-sm text-muted-foreground">Practice Exams</p>
                      <p className="font-semibold">380 Questions</p>
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
                    onClick={() => handleEnroll(freci.id)}
                    data-testid="button-buy-course"
                  >
                    Buy Now - ${(freci.price / 100).toFixed(2)}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setLocation(`/course/${freci.id}`)}
                    data-testid="button-view-course"
                  >
                    View Course Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <FeaturesSection />
    </div>
  );
}
