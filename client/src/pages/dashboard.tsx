import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Dashboard from "@/components/Dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, BookOpen, Award, ArrowRight, CheckCircle2 } from "lucide-react";
import type { Course } from "@shared/schema";

export default function DashboardPage() {
  const [selectedState] = useState<"CA" | "FL">("FL");
  const [userName, setUserName] = useState("User");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const freci = courses.find(c => c.sku === "FL-RE-PL-SA-FRECI-63");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const response = await fetch("/api/user", {
          headers,
          credentials: "include",
        });
        if (response.ok) {
          const user = await response.json();
          setUserName(user.firstName || user.email?.split("@")[0] || "User");
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("authToken");
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
      }
    };
    fetchUser();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-48" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <GraduationCap className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4" data-testid="text-dashboard-title">
              My Courses
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track your learning progress, complete courses, and earn certificates. Get started by purchasing a course.
            </p>
          </div>

          <Card className="border-2 border-primary/20 shadow-lg mb-8">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Start Your Real Estate Career</CardTitle>
              <CardDescription className="text-base">
                Get your Florida real estate license with our comprehensive pre-licensing course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">63 Hours</p>
                    <p className="text-sm text-muted-foreground">Complete Curriculum</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Award className="h-8 w-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">State Approved</p>
                    <p className="text-sm text-muted-foreground">FREC Certified</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <CheckCircle2 className="h-8 w-8 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Certificate</p>
                    <p className="text-sm text-muted-foreground">Instant Download</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="flex-1 h-12 text-lg gap-2"
                  onClick={() => freci ? setLocation(`/checkout/${freci.id}`) : setLocation("/courses/fl")}
                  data-testid="button-buy-course"
                >
                  Buy Course - ${((freci?.price || 5999) / 100).toFixed(2)}
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1 h-12 text-lg"
                  asChild
                >
                  <Link href="/courses/fl" data-testid="link-browse-courses">
                    Browse Courses
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">Already have an account?</p>
            <Link href="/login" className="text-lg text-primary hover:underline" data-testid="link-sign-in">
              Sign in to access your courses
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return <Dashboard userName={userName} selectedState={selectedState} />;
}
