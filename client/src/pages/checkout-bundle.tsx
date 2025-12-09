import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, CheckCircle, Clock, DollarSign, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  hoursRequired: number;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  totalHours: number;
  bundlePrice: number;
  individualCoursePrice: number;
  courses: Course[];
}

export default function CheckoutBundlePage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ bundleId: string }>();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [pageReady, setPageReady] = useState(false);
  const { toast } = useToast();

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
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setPageReady(true);
      }
    };
    checkAuth();
  }, []);

  const { data: bundle, isLoading: bundleLoading, error: bundleError } = useQuery<Bundle>({
    queryKey: ["/api/bundles", params.bundleId],
    queryFn: async () => {
      if (!params.bundleId) return null;
      const res = await fetch(`/api/bundles/${params.bundleId}`);
      if (!res.ok) throw new Error("Bundle not found");
      return res.json();
    },
    enabled: !!params.bundleId && pageReady,
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
    
    if (!bundle?.id) {
      toast({
        title: "Bundle Error",
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
      
      // Get PromoteKit referral ID if available
      let referral = "";
      try {
        referral = (window as any).promotekit_referral || "";
      } catch (e) {}

      const response = await fetch("/api/checkout/bundle", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ 
          bundleId: bundle.id, 
          email,
          referral,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast({
        title: "Checkout Error",
        description: err.message || "Failed to process checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!pageReady || bundleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (bundleError || !bundle) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600">Bundle not found or unavailable.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setLocation("/courses/fl")}
              data-testid="button-browse-courses"
            >
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bundlePrice = (bundle.bundlePrice / 100).toFixed(2);
  const individualPrice = (bundle.individualCoursePrice / 100).toFixed(2);
  const savings = ((bundle.individualCoursePrice - bundle.bundlePrice) / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-purple-950 dark:to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation("/courses/fl")}
          className="mb-4 gap-2"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Button>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Save ${savings}
                </Badge>
              </div>
              <CardTitle data-testid="text-bundle-title">{bundle.name}</CardTitle>
              <CardDescription>{bundle.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <p className="font-bold text-lg">{bundle.totalHours}h</p>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Bundle Price</p>
                  <div className="flex items-center gap-1 mt-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <p className="font-bold text-lg">${bundlePrice}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Included Courses ({bundle.courses?.length || 0})</h3>
                <div className="space-y-2">
                  {bundle.courses?.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border"
                      data-testid={`bundle-course-${course.id}`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-medium">{course.title}</p>
                      </div>
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {course.hoursRequired}h
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm">
                  <span className="font-medium">Individual price:</span>{" "}
                  <span className="line-through text-muted-foreground">${individualPrice}</span>{" "}
                  <span className="text-green-600 font-bold">${bundlePrice}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Complete Your Purchase</CardTitle>
              <CardDescription>
                Enter your email to continue to secure checkout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    data-testid="input-email"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your receipt and course access will be sent to this email
                  </p>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Bundle ({bundle.courses?.length || 0} courses)</span>
                    <span>${bundlePrice}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>You save</span>
                    <span>-${savings}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>${bundlePrice}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading || !email.trim()}
                  className="w-full"
                  data-testid="button-checkout"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay $${bundlePrice}`
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Secure payment powered by Stripe. Your payment information is encrypted and secure.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
