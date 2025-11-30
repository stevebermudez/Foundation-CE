import { useQuery } from "@tanstack/react-query";
import { CourseBundle } from "@/components/CourseBundle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

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

export default function FloridaCourses() {
  const { data: bundles, isLoading } = useQuery<Bundle[]>({
    queryKey: ["/api/bundles", { state: "FL" }],
  });

  const bundlesByType = bundles ? {
    postlicense45: bundles.find(b => b.totalHours === 45 && b.licenseType === "salesperson"),
    postlicense60: bundles.find(b => b.totalHours === 60 && b.licenseType === "broker"),
    renewal: bundles.filter(b => b.totalHours === 14),
  } : { postlicense45: undefined, postlicense60: undefined, renewal: [] };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Florida Continuing Education</h1>
          <p className="text-xl text-gray-600">Real Estate Sales Associate & Broker Requirements</p>
        </div>

        {/* Requirements Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Sales Associate Info */}
          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Badge>Sales Associate</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <div className="border-b pb-3">
                <p className="font-semibold text-gray-900">First Renewal (Post-Licensing)</p>
                <p className="text-sm text-gray-600 mt-1">45 hours required</p>
                <p className="text-lg font-bold text-blue-600 mt-1">$59.99</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Subsequent Renewals (Every 2 Years)</p>
                <p className="text-sm text-gray-600 mt-1">14 hours required:</p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4">
                  <li>• 3 hours Core Law</li>
                  <li>• 3 hours Ethics & Business Practices</li>
                  <li>• 8 hours Specialty (elective)</li>
                </ul>
                <p className="text-lg font-bold text-blue-600 mt-3">$39.99</p>
              </div>
            </CardContent>
          </Card>

          {/* Broker Info */}
          <Card className="border-2 border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">Broker</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <div className="border-b pb-3">
                <p className="font-semibold text-gray-900">First Renewal (Post-Licensing)</p>
                <p className="text-sm text-gray-600 mt-1">60 hours required</p>
                <p className="text-lg font-bold text-purple-600 mt-1">$69.99</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Subsequent Renewals (Every 2 Years)</p>
                <p className="text-sm text-gray-600 mt-1">14 hours required:</p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4">
                  <li>• 3 hours Core Law</li>
                  <li>• 3 hours Ethics & Business Practices</li>
                  <li>• 8 hours Specialty (elective)</li>
                </ul>
                <p className="text-lg font-bold text-purple-600 mt-3">$39.99</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Individual Course Option */}
        <Card className="mb-12 border-l-4 border-l-amber-500">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">À la Carte Options Available</p>
              <p className="text-sm text-gray-600 mt-1">Purchase individual courses for $15 each</p>
            </div>
          </CardContent>
        </Card>

        {/* Course Bundles */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading Florida courses...</p>
          </div>
        ) : bundles && bundles.length > 0 ? (
          <div className="space-y-8">
            {/* Post-Licensing 45-Hour */}
            {bundlesByType.postlicense45 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">45-Hour Post-Licensing (Sales Associates)</h2>
                <CourseBundle bundleId={bundlesByType.postlicense45.id} />
              </div>
            )}

            {/* Post-Licensing 60-Hour */}
            {bundlesByType.postlicense60 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">60-Hour Post-Licensing (Brokers)</h2>
                <CourseBundle bundleId={bundlesByType.postlicense60.id} />
              </div>
            )}

            {/* 14-Hour Renewals */}
            {bundlesByType.renewal.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">14-Hour Renewal (Every 2 Years)</h2>
                <div className="space-y-4">
                  {bundlesByType.renewal.map((bundle) => (
                    <CourseBundle key={bundle.id} bundleId={bundle.id} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              No Florida courses available yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
