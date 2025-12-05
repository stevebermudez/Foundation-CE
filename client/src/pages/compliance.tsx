import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ComplianceTracker from "@/components/ComplianceTracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardCheck, Calendar, Shield, ArrowRight, Clock, FileCheck } from "lucide-react";
import type { Course } from "@shared/schema";

interface CompliancePageProps {
  selectedState: "CA" | "FL";
}

export default function CompliancePage({ selectedState }: CompliancePageProps) {
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 mb-6">
              <ClipboardCheck className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-4xl font-bold mb-4" data-testid="text-compliance-title">
              Compliance Tracker
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay on top of your licensing requirements. Track deadlines, monitor progress, and never miss a renewal.
            </p>
          </div>

          <Card className="border-2 border-emerald-500/20 shadow-lg mb-8">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Track Your License Requirements</CardTitle>
              <CardDescription className="text-base">
                Purchase a course to unlock compliance tracking and certificate management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Deadline Tracking</p>
                    <p className="text-sm text-muted-foreground">Never miss renewals</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">License Status</p>
                    <p className="text-sm text-muted-foreground">Real-time updates</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <FileCheck className="h-8 w-8 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Certificates</p>
                    <p className="text-sm text-muted-foreground">Download anytime</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-6 border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  What you'll be able to track:
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Course completion progress and time spent
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    CE hours earned toward license renewal
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Upcoming renewal deadlines and requirements
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Certificate history and downloads
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="flex-1 h-12 text-lg gap-2"
                  onClick={() => freci ? setLocation(`/checkout/${freci.id}`) : setLocation("/courses/fl")}
                  data-testid="button-buy-course"
                >
                  Get Started - ${((freci?.price || 5999) / 100).toFixed(2)}
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
              Sign in to track your compliance
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ComplianceTracker selectedState={selectedState} />;
}
