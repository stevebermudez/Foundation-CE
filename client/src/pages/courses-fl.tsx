import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, DollarSign, Package, CheckCircle, ArrowRight, GraduationCap } from "lucide-react";
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

export default function FloridaCourses() {
  const [, setLocation] = useLocation();
  
  const { data: allCourses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: bundles = [] } = useQuery<Bundle[]>({
    queryKey: ["/api/bundles"],
  });

  const freci = allCourses.find(c => c.sku === "FL-RE-PL-SA-FRECI-63");
  const frecii = allCourses.find(c => c.sku === "FL-RE-PL-BROKER-72");
  const ceBundle = bundles.find(b => b.name?.includes("14-Hour"));
  
  const ceCourses = allCourses.filter(c => 
    c.sku?.startsWith("FL-RE-CE-") && c.state === "FL"
  );

  const handleBuyNow = (courseId: string) => {
    setLocation(`/checkout/${courseId}`);
  };

  const handleBundleCheckout = (bundleId: string) => {
    setLocation(`/checkout/bundle/${bundleId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 px-4 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Florida Real Estate Courses</h1>
            <p className="text-xl text-white/90 mb-6">
              State-approved pre-licensing and continuing education courses for Florida real estate professionals
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="pt-6">
                  <p className="text-sm text-white/80">Pre-Licensing</p>
                  <p className="text-3xl font-bold text-white">FREC I & II</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="pt-6">
                  <p className="text-sm text-white/80">Continuing Ed</p>
                  <p className="text-3xl font-bold text-white">14 Hours</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="pt-6">
                  <p className="text-sm text-white/80">Format</p>
                  <p className="text-3xl font-bold text-white">Self-Paced</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-16 pb-16">
        {/* CE Bundle Section */}
        {ceBundle && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Package className="h-8 w-8 text-purple-600" />
              <h2 className="text-3xl font-bold">Continuing Education Bundle</h2>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Best Value
              </Badge>
            </div>
            
            <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl" data-testid="text-bundle-name">
                      {ceBundle.name}
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {ceBundle.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">
                      Save ${((ceBundle.individualCoursePrice - ceBundle.bundlePrice) / 100).toFixed(2)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Hours</p>
                      <p className="font-semibold">{ceBundle.totalHours} Hours</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Included Courses</p>
                      <p className="font-semibold">{ceBundle.courses?.length || 3} Courses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Bundle Price</p>
                      <p className="font-semibold text-green-600">${(ceBundle.bundlePrice / 100).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold mb-3">Courses Included:</h4>
                  <div className="grid gap-2">
                    {ceBundle.courses?.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-700 rounded border">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">{course.title}</span>
                        </div>
                        <Badge variant="outline">{course.hoursRequired}h</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg"
                    onClick={() => handleBundleCheckout(ceBundle.id)}
                    className="flex-1 h-14 text-lg font-bold bg-purple-600 hover:bg-purple-700 gap-2"
                    data-testid="button-buy-bundle"
                  >
                    Get Bundle - ${(ceBundle.bundlePrice / 100).toFixed(2)}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  Individual price: <span className="line-through">${(ceBundle.individualCoursePrice / 100).toFixed(2)}</span>
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Pre-Licensing Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold">Pre-Licensing Courses</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* FREC I */}
            {freci && (
              <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-lg hover-elevate">
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Sales Associate
                  </Badge>
                  <CardTitle className="text-xl">{freci.title}</CardTitle>
                  <CardDescription>{freci.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">{freci.hoursRequired} Hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">19 Units</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={() => handleBuyNow(freci.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      data-testid="button-buy-freci"
                    >
                      Buy Now - ${((freci.price || 5999) / 100).toFixed(2)}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setLocation(`/course/${freci.id}`)}
                      data-testid="button-preview-freci"
                    >
                      Preview Course
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* FREC II */}
            {frecii && (
              <Card className="border-2 border-indigo-200 dark:border-indigo-800 shadow-lg hover-elevate">
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    Broker
                  </Badge>
                  <CardTitle className="text-xl">{frecii.title}</CardTitle>
                  <CardDescription>{frecii.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm">{frecii.hoursRequired} Hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm">18 Sessions</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={() => handleBuyNow(frecii.id)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      data-testid="button-buy-frecii"
                    >
                      Buy Now - ${((frecii.price || 9999) / 100).toFixed(2)}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setLocation(`/course/${frecii.id}`)}
                      data-testid="button-preview-frecii"
                    >
                      Preview Course
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Individual CE Courses Section */}
        {ceCourses.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-8 w-8 text-green-600" />
              <h2 className="text-3xl font-bold">Individual CE Courses</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Purchase courses individually if you only need specific requirements
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {ceCourses.map((course) => (
                <Card key={course.id} className="border shadow-lg hover-elevate">
                  <CardHeader>
                    <Badge className="w-fit mb-2" variant="outline">
                      {course.hoursRequired} Hours
                    </Badge>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      <Button 
                        onClick={() => handleBuyNow(course.id)}
                        className="w-full"
                        data-testid={`button-buy-ce-${course.id}`}
                      >
                        Buy - ${((course.price || 2999) / 100).toFixed(2)}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setLocation(`/course/${course.id}`)}
                        data-testid={`button-preview-ce-${course.id}`}
                      >
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
