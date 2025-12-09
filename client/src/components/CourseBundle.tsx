import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, CheckCircle2, Package, ArrowRight } from "lucide-react";

interface BundleProps {
  bundleId: string;
  userId?: string;
}

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

export function CourseBundle({ bundleId, userId }: BundleProps) {
  const [, setLocation] = useLocation();
  
  const { data: bundle, isLoading } = useQuery<Bundle>({
    queryKey: ["/api/bundles", bundleId],
    enabled: !!bundleId,
  });

  const { data: enrollment } = useQuery({
    queryKey: ["/api/bundles", bundleId, "enrollment", userId],
    enabled: !!userId && !!bundleId,
  });

  if (isLoading) return <div className="text-center text-muted-foreground">Loading bundle...</div>;
  if (!bundle) return <div className="text-center text-red-500">Bundle not found</div>;

  const bundlePriceDisplay = (bundle.bundlePrice / 100).toFixed(2);
  const individualPriceDisplay = (bundle.individualCoursePrice / 100).toFixed(2);
  const savings = ((bundle.individualCoursePrice - bundle.bundlePrice) / 100).toFixed(2);
  const isEnrolled = !!enrollment;

  const handleEnroll = () => {
    setLocation(`/checkout/bundle/${bundleId}`);
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle data-testid="bundle-title">{bundle.name}</CardTitle>
                <CardDescription className="mt-1">{bundle.description}</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEnrolled && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Save ${savings}
                </Badge>
              )}
              {isEnrolled && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Enrolled
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
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
                <p className="font-bold text-lg">${bundlePriceDisplay}</p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">If Separate</p>
              <div className="flex items-center gap-1 mt-1">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <p className="font-bold text-lg line-through text-muted-foreground">${individualPriceDisplay}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Included Courses ({bundle.courses?.length || 0})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {bundle.courses?.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded border"
                  data-testid={`bundle-course-item-${course.id}`}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
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

          {!isEnrolled && (
            <Button
              onClick={handleEnroll}
              className="w-full gap-2"
              size="lg"
              data-testid="button-enroll-bundle"
            >
              Get Bundle - ${bundlePriceDisplay}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}

          {isEnrolled && (
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300">
                You're enrolled in this bundle. Access your courses from your dashboard.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setLocation("/dashboard")}
                data-testid="button-go-to-dashboard"
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
