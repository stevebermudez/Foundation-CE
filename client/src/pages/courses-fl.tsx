import CourseCatalog from "@/components/CourseCatalog";
import { Card, CardContent } from "@/components/ui/card";

export default function FloridaCourses() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-500 text-white py-16 px-4 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-4">Florida Real Estate & Insurance CE</h1>
            <p className="text-xl text-white/90 mb-6">Flexible, self-paced continuing education courses for real estate and insurance professionals in Florida</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="pt-6">
                  <p className="text-sm text-white/80">Requirements Every 2 Years</p>
                  <p className="text-3xl font-bold text-white">14 Hours</p>
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
      <CourseCatalog selectedState="FL" />
    </div>
  );
}
