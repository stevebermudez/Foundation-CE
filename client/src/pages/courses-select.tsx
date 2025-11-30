import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CoursesSelectPage() {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] items-center justify-center px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Select Your State</h1>
        <p className="text-muted-foreground text-lg">
          Choose your state to view available continuing education courses
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl w-full">
        <Card className="p-8 flex flex-col items-center justify-center hover-elevate cursor-pointer transition-all" onClick={() => navigate("/courses/ca")}>
          <h2 className="text-2xl font-bold mb-2">California</h2>
          <p className="text-muted-foreground mb-6 text-center">
            Real Estate and Insurance CE courses
          </p>
          <Button size="lg" onClick={() => navigate("/courses/ca")} data-testid="button-courses-ca">
            Browse CA Courses
          </Button>
        </Card>

        <Card className="p-8 flex flex-col items-center justify-center hover-elevate cursor-pointer transition-all" onClick={() => navigate("/courses/fl")}>
          <h2 className="text-2xl font-bold mb-2">Florida</h2>
          <p className="text-muted-foreground mb-6 text-center">
            Real Estate and Insurance CE courses
          </p>
          <Button size="lg" onClick={() => navigate("/courses/fl")} data-testid="button-courses-fl">
            Browse FL Courses
          </Button>
        </Card>
      </div>
    </div>
  );
}
