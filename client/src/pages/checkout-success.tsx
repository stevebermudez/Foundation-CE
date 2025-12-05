import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, BookOpen, Loader2, AlertCircle, RefreshCw, ArrowRight, KeyRound, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutSuccessPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const courseId = params.get("courseId");
  const sessionId = params.get("session_id");
  const [course, setCourse] = useState<any>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<"loading" | "success" | "error" | "idle">("idle");
  const [enrollmentError, setEnrollmentError] = useState<string>("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const { toast } = useToast();

  const fetchCourse = async () => {
    if (!courseId) return;
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data);
      }
    } catch (err) {
      console.error("Failed to fetch course:", err);
    }
  };

  const completeEnrollment = async () => {
    if (!courseId) {
      setEnrollmentError("No course ID provided");
      setEnrollmentStatus("error");
      return;
    }

    if (!sessionId) {
      setEnrollmentError("Payment session not verified. Please contact support if you completed payment.");
      setEnrollmentStatus("error");
      return;
    }

    setEnrollmentStatus("loading");
    setEnrollmentError("");
    
    try {
      const response = await fetch("/api/checkout/complete-enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, courseId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to complete enrollment");
      }

      // Save auth token to localStorage for auto-login
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      // Track if this is a new user
      setIsNewUser(data.isNewUser);
      setUserEmail(data.user?.email || "");
      
      setEnrollmentStatus("success");
      
      if (data.existing) {
        toast({
          title: "Already Enrolled",
          description: "You already have access to this course.",
        });
      } else if (data.isNewUser) {
        toast({
          title: "Account Created",
          description: "Your account has been created and you're enrolled in the course!",
        });
      } else {
        toast({
          title: "Enrollment Complete",
          description: "Your course has been added to your dashboard.",
        });
      }
    } catch (err: any) {
      console.error("Failed to complete enrollment:", err);
      setEnrollmentError(err.message || "Failed to activate your course access");
      setEnrollmentStatus("error");
      toast({
        title: "Enrollment Issue",
        description: "There was a problem activating your course. You can retry or contact support.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCourse();
    completeEnrollment();
  }, [courseId, sessionId]);

  const handleRetry = () => {
    completeEnrollment();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="border-2 border-green-200 dark:border-green-800">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-3xl text-green-700 dark:text-green-300">
              Payment Successful!
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Thank you for your purchase. Your transaction has been completed.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {enrollmentStatus === "loading" && (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <p className="text-slate-700 dark:text-slate-300">
                    Setting up your account and course access...
                  </p>
                </div>
              </div>
            )}

            {enrollmentStatus === "success" && (
              <>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-slate-700 dark:text-slate-300">
                      {isNewUser 
                        ? "Your account has been created and you're enrolled! You can start learning immediately."
                        : "Your course has been added to your dashboard. You can start learning immediately!"}
                    </p>
                  </div>
                </div>

                {isNewUser && userEmail && (
                  <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <KeyRound className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-slate-700 dark:text-slate-300 font-medium">
                          Set Up Your Password
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          We've created an account for <span className="font-medium">{userEmail}</span>. 
                          For security, please set your password using the forgot password feature on the login page.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setLocation("/login?showReset=true")}
                          className="mt-3 gap-2"
                          data-testid="button-set-password"
                        >
                          <Mail className="h-4 w-4" />
                          Set Password
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {enrollmentStatus === "error" && (
              <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      There was an issue activating your course
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {enrollmentError || "Please try again or contact support if the issue persists."}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRetry}
                      className="mt-3 gap-2"
                      data-testid="button-retry-enrollment"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry Activation
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {course && (
              <div className="border rounded-lg p-4 dark:border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white" data-testid="text-purchased-course">
                      {course.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary">{course.hoursRequired} hours</Badge>
                      {course.state && <Badge variant="outline">{course.state}</Badge>}
                      {course.deliveryMethod && (
                        <Badge variant="outline">{course.deliveryMethod}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <Button
                size="lg"
                onClick={() => setLocation("/dashboard")}
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 gap-2"
                data-testid="button-go-to-dashboard"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
              {courseId && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setLocation(`/course/${courseId}/learn`)}
                  className="w-full gap-2"
                  data-testid="button-start-learning"
                >
                  <BookOpen className="h-4 w-4" />
                  Start Learning Now
                </Button>
              )}
              <Button
                size="lg"
                variant="ghost"
                onClick={() => setLocation("/courses/fl")}
                className="w-full"
                data-testid="button-browse-more-courses"
              >
                Browse More Courses
              </Button>
            </div>

            <div className="border-t pt-4 dark:border-slate-700">
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  A confirmation email has been sent to your email address with your receipt and course access details.
                </p>
                {sessionId && (
                  <p className="text-xs text-muted-foreground">
                    Transaction ID: {sessionId.slice(0, 20)}...
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
