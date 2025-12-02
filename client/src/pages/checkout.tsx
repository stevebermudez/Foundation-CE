import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { SelectCourse } from "@shared/schema";

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ courseId?: string }>();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch("/api/user", { headers });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setEmail(userData.email || "");
        } else {
          setLocation("/login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setLocation("/login");
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, [setLocation]);

  const { data: course } = useQuery({
    queryKey: ["/api/courses", params.courseId],
    queryFn: async () => {
      if (!params.courseId) return null;
      const res = await fetch(`/api/courses/${params.courseId}`);
      if (!res.ok) throw new Error("Course not found");
      return res.json();
    },
    enabled: !!params.courseId,
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !course?.id) {
      alert("Please enter a valid email address");
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
        body: JSON.stringify({ courseId: course.id, email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      console.error("Checkout error:", err);
      alert(`Checkout error: ${err.message}`);
      setIsLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Course not found</p>
          <Button onClick={() => setLocation("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation(-1 as any)}
          className="mb-8 gap-2"
          data-testid="button-back-checkout"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h1 className="text-3xl font-bold mb-8">Order Summary</h1>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Course</p>
                    <p className="font-semibold">{course.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">{course.hoursRequired} Hours</p>
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${((course.price || 5999) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div>
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleCheckout} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                      data-testid="input-email-checkout"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                    data-testid="button-complete-checkout"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Pay $${((course.price || 5999) / 100).toFixed(2)}`
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    You will be redirected to Stripe to complete your payment
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
