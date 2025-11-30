import CourseCatalog from "@/components/CourseCatalog";
import { Card, CardContent } from "@/components/ui/card";

export default function CaliforniaCourses() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 px-4 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-4">California Real Estate CE</h1>
            <p className="text-xl text-white/90 mb-6">Complete continuing education for California real estate professionals. Self-paced, flexible, and designed for busy agents.</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="pt-6">
                  <p className="text-sm text-white/80">Renewal Every 4 Years</p>
                  <p className="text-3xl font-bold text-white">45 Hours</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="pt-6">
                  <p className="text-sm text-white/80">Individual Courses</p>
                  <p className="text-3xl font-bold text-white">$15</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="pt-6">
                  <p className="text-sm text-white/80">Self-Paced Learning</p>
                  <p className="text-3xl font-bold text-white">100%</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Catalog */}
      <CourseCatalog selectedState="CA" />
    </div>
  );
}
