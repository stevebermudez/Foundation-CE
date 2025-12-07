import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { usePageMeta } from "@/hooks/use-page-meta";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Award, CheckCircle2 } from "lucide-react";
import type { Course } from "@shared/schema";

export default function HomePage() {
  const [, setLocation] = useLocation();

  usePageMeta({
    title: "Florida Real Estate Pre-licensing & CE Courses",
    description: "Complete your Florida real estate pre-licensing (FREC I) and continuing education requirements with FoundationCE. 63-hour course with practice exams and instant certificate.",
    ogDescription: "Professional continuing education for real estate professionals. State-approved courses in California and Florida with modern learning experience.",
  });

  const { data: allCourses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const freci = allCourses.find(c => c.sku === "FL-RE-PL-SA-FRECI-63");

  const handleBuyNow = (courseId: string) => {
    setLocation(`/checkout/${courseId}`);
  };

  return (
    <div>
      <Hero
        onBrowseCourses={() => setLocation("/courses/fl")}
        onGetStarted={() => freci && handleBuyNow(freci.id)}
      />

      {/* Featured Course Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Florida Sales Associate <span className="whitespace-nowrap">Pre-licensing</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              {freci?.description || "Complete 63-hour pre-licensing course for Florida real estate sales associates. Includes 60 hours of instruction across 19 units covering real estate law, practices, contracts, mortgages, and state regulations. Final 3-hour cumulative exam."}
            </p>
          </div>

          <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl">{freci?.title || "Florida Sales Associate Pre-licensing (FREC I)"}</CardTitle>
                  <CardDescription className="text-base mt-2">Complete your Florida real estate license requirement</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    ${((freci?.price || 5999) / 100).toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">One-time payment</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="text-2xl font-bold">{freci?.hoursRequired || 63} Hours</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <BookOpen className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Units</p>
                  <p className="text-2xl font-bold">19 Units</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Practice Exams</p>
                  <p className="text-2xl font-bold">380 Questions</p>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                  <Award className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Certificate</p>
                  <p className="text-2xl font-bold">Instant</p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-8">
                <h3 className="font-semibold mb-4 text-lg">What's Included:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Complete 63-hour curriculum across 19 units</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>20-question quiz for each unit</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>100-question comprehensive final exam</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Instant certificate of completion</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Self-paced learning on any device</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => freci && handleBuyNow(freci.id)}
                  className="flex-1 h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  data-testid="button-buy-course-home"
                >
                  Buy Now - ${((freci?.price || 5999) / 100).toFixed(2)}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => freci && setLocation(`/course/${freci.id}`)}
                  className="flex-1 h-14 text-lg font-semibold"
                  data-testid="button-view-details-home"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <FeaturesSection />
    </div>
  );
}
