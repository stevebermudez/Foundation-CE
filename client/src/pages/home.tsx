import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { usePageMeta } from "@/hooks/use-page-meta";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Package, GraduationCap, Clock, BookOpen, ArrowRight } from "lucide-react";
import type { Course } from "@shared/schema";

interface Bundle {
  id: string;
  name: string;
  description: string;
  totalHours: number;
  bundlePrice: number;
  individualCoursePrice: number;
  courses: { id: string; title: string; hoursRequired: number }[];
}

export default function HomePage() {
  const [, setLocation] = useLocation();

  usePageMeta({
    title: "Florida Real Estate Pre-licensing & CE Courses",
    description: "Complete your Florida real estate pre-licensing (FREC I, FREC II) and continuing education requirements with FoundationCE. State-approved courses with practice exams and instant certificates.",
    ogDescription: "Professional continuing education for real estate professionals. State-approved courses in Florida with modern learning experience.",
  });

  const { data: allCourses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: bundles = [] } = useQuery<Bundle[]>({
    queryKey: ["/api/bundles"],
  });

  const freci = allCourses.find(c => c.sku === "FL-RE-PL-SA-FRECI-63");
  const frecii = allCourses.find(c => c.sku === "FL-RE-PL-BROKER-72");
  const ceBundle = bundles.find(b => b.name?.includes("14-Hour"));

  const handleBuyNow = (courseId: string) => {
    setLocation(`/checkout/${courseId}`);
  };

  const handleBundleCheckout = (bundleId: string) => {
    setLocation(`/checkout/bundle/${bundleId}`);
  };

  return (
    <div>
      <Hero
        onBrowseCourses={() => setLocation("/courses/fl")}
        onGetStarted={() => freci && handleBuyNow(freci.id)}
      />

      {/* CE Bundle Section - Best Value */}
      {ceBundle && (
        <section className="py-20 px-4 bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Package className="h-10 w-10 text-purple-600" />
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-lg px-4 py-1">
                  Best Value - Save $20
                </Badge>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                14-Hour CE Package
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Complete your Florida real estate continuing education requirements with one convenient package
              </p>
            </div>

            <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl md:text-3xl" data-testid="text-home-bundle-name">
                      {ceBundle.name}
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      {ceBundle.description}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                      ${(ceBundle.bundlePrice / 100).toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground line-through">
                      ${(ceBundle.individualCoursePrice / 100).toFixed(2)} if purchased separately
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Hours</p>
                      <p className="font-semibold">{ceBundle.totalHours} Hours</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Courses</p>
                      <p className="font-semibold">{ceBundle.courses?.length || 3} Included</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">You Save</p>
                      <p className="font-semibold text-green-600">
                        ${((ceBundle.individualCoursePrice - ceBundle.bundlePrice) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold mb-3">Courses Included:</h4>
                  <div className="grid gap-2">
                    {ceBundle.courses?.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-700 rounded border">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">{course.title}</span>
                        </div>
                        <Badge variant="outline">{course.hoursRequired}h</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={() => handleBundleCheckout(ceBundle.id)}
                  className="w-full h-14 text-lg font-bold bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 gap-2"
                  data-testid="button-buy-bundle-home"
                >
                  Get Bundle - ${(ceBundle.bundlePrice / 100).toFixed(2)}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Pre-Licensing Courses Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <GraduationCap className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Pre-Licensing Courses
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Start your real estate career with our state-approved pre-licensing courses
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* FREC I Card */}
            <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
                <Badge className="w-fit mb-2 bg-blue-600 text-white">Sales Associate</Badge>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{freci?.title || "Florida Sales Associate Pre-licensing (FREC I)"}</CardTitle>
                    <CardDescription className="text-base mt-2">63-hour course for new sales associates</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      ${((freci?.price || 5999) / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span>63 hours across 19 units</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span>380 practice quiz questions</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span>100-question final exam</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span>Instant certificate</span>
                  </li>
                </ul>
                <div className="flex flex-col gap-3">
                  <Button
                    size="lg"
                    onClick={() => freci && handleBuyNow(freci.id)}
                    className="w-full h-12 font-bold bg-blue-600 hover:bg-blue-700"
                    data-testid="button-buy-freci-home"
                  >
                    Buy Now - ${((freci?.price || 5999) / 100).toFixed(2)}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => freci && setLocation(`/course/${freci.id}`)}
                    data-testid="button-view-freci-home"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* FREC II Card */}
            <Card className="border-2 border-indigo-200 dark:border-indigo-800 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900">
                <Badge className="w-fit mb-2 bg-indigo-600 text-white">Broker</Badge>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{frecii?.title || "Florida Broker Pre-licensing (FREC II)"}</CardTitle>
                    <CardDescription className="text-base mt-2">72-hour course for aspiring brokers</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      ${((frecii?.price || 9999) / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                    <span>72 hours across 18 sessions</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                    <span>193 practice quiz questions</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                    <span>Two 50-question final exams</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                    <span>Instant certificate</span>
                  </li>
                </ul>
                <div className="flex flex-col gap-3">
                  <Button
                    size="lg"
                    onClick={() => frecii && handleBuyNow(frecii.id)}
                    className="w-full h-12 font-bold bg-indigo-600 hover:bg-indigo-700"
                    data-testid="button-buy-frecii-home"
                  >
                    Buy Now - ${((frecii?.price || 9999) / 100).toFixed(2)}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => frecii && setLocation(`/course/${frecii.id}`)}
                    data-testid="button-view-frecii-home"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation("/courses/fl")}
              className="gap-2"
              data-testid="button-view-all-courses"
            >
              View All Florida Courses
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      <FeaturesSection />
    </div>
  );
}
