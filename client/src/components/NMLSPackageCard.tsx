import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Award,
  Clock,
  FileText,
  Timer,
  TimerOff,
  BookOpen,
  CheckCircle,
  Shield,
} from "lucide-react";
import { type NMLS8HourPackage } from "@/lib/nmlsCourses";

interface NMLSPackageCardProps {
  package: NMLS8HourPackage;
  enrolled?: boolean;
  progress?: {
    completedCourses: number;
    totalCourses: number;
    completedHours: number;
  };
  onEnroll: () => void;
  onContinue: () => void;
}

export default function NMLSPackageCard({
  package: pkg,
  enrolled = false,
  progress,
  onEnroll,
  onContinue,
}: NMLSPackageCardProps) {
  const progressPercent = progress
    ? (progress.completedCourses / progress.totalCourses) * 100
    : 0;

  return (
    <Card className="overflow-hidden border-2 border-primary/20" data-testid={`card-nmls-package-${pkg.id}`}>
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
            <Award className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <Badge className="bg-primary text-primary-foreground mb-1">NMLS Approved</Badge>
            <h3 className="font-bold text-lg">{pkg.name}</h3>
          </div>
        </div>
      </div>

      <CardHeader className="pt-4 pb-2">
        <p className="text-sm text-muted-foreground">{pkg.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {pkg.regulatoryAgencies.map((agency) => (
            <Badge key={agency} variant="outline" className="gap-1">
              <Shield className="h-3 w-3" />
              {agency.replace("_", " ")}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-2xl font-bold text-primary">{pkg.totalHours}</p>
            <p className="text-xs text-muted-foreground">Total CE Hours</p>
          </div>
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-2xl font-bold">{pkg.courses.length}</p>
            <p className="text-xs text-muted-foreground">Courses Included</p>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-3">Required Topics</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Federal Law & Regulations</span>
              <Badge variant="secondary" className="text-xs">{pkg.requirements.federalHours} hrs</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Ethics</span>
              <Badge variant="secondary" className="text-xs">{pkg.requirements.ethicsHours} hrs</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Non-Traditional Lending</span>
              <Badge variant="secondary" className="text-xs">{pkg.requirements.nonTraditionalHours} hrs</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">State-Specific Electives</span>
              <Badge variant="secondary" className="text-xs">{pkg.requirements.electiveHours} hr</Badge>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-3">Included Courses</h4>
          <div className="space-y-2">
            {pkg.courses.map((course) => (
              <div
                key={course.id}
                className="flex items-start gap-2 p-2 bg-muted/50 rounded-md"
              >
                {progress && progress.completedCourses > pkg.courses.indexOf(course) ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                ) : (
                  <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{course.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{course.ceHours} hrs</span>
                    <span className="text-xs text-muted-foreground">|</span>
                    <span className="text-xs text-muted-foreground">{course.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
          <TimerOff className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700 dark:text-green-300">
            No-timer exam option available for all courses
          </span>
        </div>

        {enrolled && progress && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Package Progress</span>
              <span className="text-sm text-muted-foreground">
                {progress.completedCourses}/{progress.totalCourses} courses
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {progress.completedHours} of {pkg.totalHours} CE hours completed
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        {!enrolled ? (
          <>
            <div className="flex items-center justify-between w-full">
              <span className="text-2xl font-bold">${pkg.price}</span>
              <span className="text-sm text-muted-foreground">Complete package</span>
            </div>
            <Button className="w-full" size="lg" onClick={onEnroll} data-testid={`button-enroll-${pkg.id}`}>
              Enroll in Package
            </Button>
          </>
        ) : (
          <Button className="w-full" size="lg" onClick={onContinue} data-testid={`button-continue-${pkg.id}`}>
            {progressPercent === 100 ? "View Certificates" : "Continue Learning"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
