import { useQuery } from "@tanstack/react-query";
import { CourseBundle } from "@/components/CourseBundle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Bundle {
  id: string;
  name: string;
  description: string;
  state: string;
  licenseType: string;
  totalHours: number;
  bundlePrice: number;
  individualCoursePrice: number;
}

export default function CaliforniaCourses() {
  const { data: bundles, isLoading } = useQuery<Bundle[]>({
    queryKey: ["/api/bundles", { state: "CA" }],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">California Continuing Education</h1>
          <p className="text-xl text-gray-600">45-Hour Renewal Requirements</p>
          <p className="text-gray-500 mt-2">Valid for Salespersons and Brokers (4-Year Renewal Cycle)</p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Card className="bg-white border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-lg">Total Hours Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">45 Hours</p>
              <p className="text-sm text-gray-600 mt-1">Every 4 years</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-lg">Bundle Price</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">$45.00</p>
              <p className="text-sm text-gray-600 mt-1">Complete package</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="text-lg">Individual Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">$15.00</p>
              <p className="text-sm text-gray-600 mt-1">Per course</p>
            </CardContent>
          </Card>
        </div>

        {/* Bundles */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading courses...</p>
          </div>
        ) : bundles && bundles.length > 0 ? (
          <div className="space-y-8">
            {bundles.map((bundle) => (
              <div key={bundle.id}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{bundle.name}</h2>
                  <Badge variant="outline" className="capitalize">
                    {bundle.licenseType}
                  </Badge>
                </div>
                <CourseBundle bundleId={bundle.id} />
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              No courses available yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
