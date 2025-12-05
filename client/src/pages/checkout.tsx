import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Shield, Clock, CheckCircle, CreditCard, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@shared/schema";

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ courseId?: string }>();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [pageReady, setPageReady] = useState(false);
  const { toast } = useToast();

  // Check if user is logged in (optional - does not block checkout)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const response = await fetch("/api/user", { 
          headers,
          credentials: "include"
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setEmail(userData.email || "");
        }
        // No redirect if not logged in - allow guest checkout
      } catch (err) {
        console.error("Auth check failed:", err);
        // Continue without auth - guest checkout allowed
      } finally {
        setPageReady(true);
      }
    };
    checkAuth();
  }, []);

  const { data: course, isLoading: courseLoading, error: courseError } = useQuery<Course>({
    queryKey: ["/api/courses", params.courseId],
    queryFn: async () => {
      if (!params.courseId) return null;
      const res = await fetch(`/api/courses/${params.courseId}`);
      if (!res.ok) throw new Error("Course not found");
      return res.json();
    },
    enabled: !!params.courseId && pageReady,
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter a valid email address to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (!course?.id) {
      toast({
        title: "Course Error",
        description: "Unable to process checkout. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch("/api/checkout/course", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ courseId: course.id, email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }
      
      toast({
        title: "Redirecting to Payment",
        description: "You'll be redirected to Stripe to complete your purchase.",
      });
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast({
        title: "Checkout Failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (!pageReady) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-10 w-24 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <Skeleton className="h-8 w-48 mb-8" />
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-full" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full mt-4" />
                </CardContent>
              </Card>
            </div>
            <div>
              <Skeleton className="h-8 w-32 mb-8" />
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">!</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The course you're looking for doesn't exist or may have been removed.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => setLocation("/courses/fl")} data-testid="button-browse-courses">
                Browse Courses
              </Button>
              <Button variant="outline" onClick={() => setLocation("/")} data-testid="button-go-home">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const coursePrice = (course.price || 5999) / 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-8 gap-2"
          data-testid="button-back-checkout"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            <h1 className="text-2xl font-bold mb-6">Complete Your Purchase</h1>
            
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" data-testid="text-course-title">{course.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="secondary">{course.hoursRequired} Hours</Badge>
                      {course.state && <Badge variant="outline">{course.state}</Badge>}
                      {course.deliveryMethod && (
                        <Badge variant="outline">{course.deliveryMethod}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Course Price</span>
                    <span>${coursePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Processing Fee</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-blue-600 dark:text-blue-400" data-testid="text-total-price">
                      ${coursePrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Payment Details</CardTitle>
                <CardDescription>
                  {user 
                    ? "Your account email will be used for course access" 
                    : "Enter your email to receive your receipt and course access"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading || !!user}
                        required
                        className="h-12 pl-10"
                        data-testid="input-email-checkout"
                      />
                    </div>
                    {!user && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Your account will be created automatically after purchase
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                    disabled={isLoading}
                    data-testid="button-complete-checkout"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay ${coursePrice.toFixed(2)}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="sticky top-4">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">What's Included</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Immediate course access after payment</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Certificate of completion</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>DBPR electronic reporting (FL courses)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Self-paced learning with no deadlines</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>24/7 access on any device</span>
                  </li>
                </ul>

                <div className="border-t mt-6 pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Secure checkout powered by Stripe</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
