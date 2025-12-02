import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, BookOpen } from "lucide-react";

export default function CheckoutSuccessPage() {
  const [, setLocation] = useLocation();
  const query = useSearch();
  const params = new URLSearchParams(query);
  const courseId = params.get("courseId");
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
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
    fetchCourse();
  }, [courseId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="border-2 border-green-200 dark:border-green-800">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-3xl text-green-700 dark:text-green-300">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-center text-slate-700 dark:text-slate-300">
                Your course has been added to your dashboard. You can now begin learning immediately.
              </p>
            </div>

            {course && (
              <div className="border rounded-lg p-4 dark:border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{course.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {course.hoursRequired} hours • {course.deliveryMethod || "Self-Paced Online"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                size="lg"
                onClick={() => setLocation("/dashboard")}
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                data-testid="button-go-to-dashboard"
              >
                Go to Dashboard
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/courses/fl")}
                className="w-full"
                data-testid="button-browse-more-courses"
              >
                Browse More Courses
              </Button>
            </div>

            <div className="border-t pt-4 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                A confirmation email has been sent to your registered email address with your receipt and course access details.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
