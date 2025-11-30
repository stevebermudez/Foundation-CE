import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, CheckCircle2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

const apiRequest = async (method: string, path: string, data?: any) => {
  const res = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

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
  const { data: bundle, isLoading } = useQuery<Bundle>({
    queryKey: ["/api/bundles", bundleId],
    enabled: !!bundleId,
  });

  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ["/api/bundles", bundleId, "enrollment", userId],
    enabled: !!userId && !!bundleId,
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/bundles/${bundleId}/enroll`, {
        userId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/bundles", bundleId, "enrollment", userId],
      });
    },
  });

  if (isLoading) return <div className="text-center text-gray-500">Loading bundle...</div>;
  if (!bundle) return <div className="text-center text-red-500">Bundle not found</div>;

  const bundlePriceDisplay = (bundle.bundlePrice / 100).toFixed(2);
  const individualPriceDisplay = (bundle.individualCoursePrice / 100).toFixed(2);
  const isEnrolled = !!enrollment;

  return (
    <div className="space-y-4">
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{bundle.name}</CardTitle>
              <CardDescription>{bundle.description}</CardDescription>
            </div>
            {isEnrolled && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Enrolled
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bundle Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Hours</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <p className="font-bold text-lg">{bundle.totalHours}h</p>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Bundle Price</p>
              <div className="flex items-center gap-1 mt-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <p className="font-bold text-lg">${bundlePriceDisplay}</p>
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Per Course</p>
              <div className="flex items-center gap-1 mt-1">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <p className="font-bold text-lg">${individualPriceDisplay}</p>
              </div>
            </div>
          </div>

          {/* Courses List */}
          <div>
            <h3 className="font-semibold mb-3">Included Courses</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {bundle.courses?.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{course.title}</p>
                  </div>
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {course.hoursRequired}h
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Enrollment Button */}
          {userId && !isEnrolled && (
            <Button
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending}
              className="w-full"
              size="lg"
              data-testid="button-enroll-bundle"
            >
              {enrollMutation.isPending ? "Enrolling..." : `Enroll Now - $${bundlePriceDisplay}`}
            </Button>
          )}

          {isEnrolled && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                You're enrolled in this bundle. Start your courses and track your progress.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
