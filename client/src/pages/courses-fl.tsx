import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, DollarSign } from "lucide-react";

export default function FloridaCourses() {
  const [, setLocation] = useLocation();
  
  const { data: allCourses = [] } = useQuery({
    queryKey: ["/api/courses"],
    initialData: [],
  });

  const freci = allCourses.find(c => c.sku === "FL-RE-PL-SA-FRECI-63");

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 px-4 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-4">Florida Sales Associate Prelicensing</h1>
            <p className="text-xl text-white/90 mb-6">Complete your 63-hour prelicensing requirement and get licensed in Florida real estate</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="pt-6">
                  <p className="text-sm text-white/80">Total Hours</p>
                  <p className="text-3xl font-bold text-white">63 Hours</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="pt-6">
                  <p className="text-sm text-white/80">Format</p>
                  <p className="text-3xl font-bold text-white">Self-Paced</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="pt-6">
                  <p className="text-sm text-white/80">Price</p>
                  <p className="text-3xl font-bold text-white">$59.99</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Details */}
      {freci && (
        <section className="py-16 px-4">
          <div className="mx-auto max-w-7xl">
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
                    onClick={() => setLocation(`/course/${freci.id}`)}
                    data-testid="button-start-course"
                  >
                    Start Course
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
