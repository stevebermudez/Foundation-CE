import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  Calendar,
  Download,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

import caRealEstate from "@assets/generated_images/california_luxury_real_estate.png";
import flRealEstate from "@assets/generated_images/florida_beachfront_properties.png";

interface DashboardProps {
  userName: string;
  selectedState: "CA" | "FL";
}

// todo: remove mock functionality
const mockEnrolledCourses = [
  {
    id: "1",
    title: "California Real Estate Ethics and Professional Conduct",
    thumbnail: caRealEstate,
    progress: 65,
    ceHours: 3,
    lastAccessed: "2 hours ago",
    nextDeadline: "Dec 31, 2025",
  },
  {
    id: "7",
    title: "California Property Management Essentials",
    thumbnail: caRealEstate,
    progress: 30,
    ceHours: 6,
    lastAccessed: "Yesterday",
    nextDeadline: "Dec 31, 2025",
  },
];

const mockCompletedCourses = [
  {
    id: "4",
    title: "Agency Relationships and Disclosures",
    thumbnail: flRealEstate,
    completedDate: "Nov 15, 2025",
    ceHours: 3,
    certificateId: "CERT-2025-001",
  },
];

const mockStats = {
  enrolledCourses: 2,
  completedCourses: 1,
  totalCeHours: 3,
  requiredCeHours: 45,
  upcomingDeadline: "Dec 31, 2025",
};

export default function Dashboard({ userName, selectedState }: DashboardProps) {
  const ceProgress = (mockStats.totalCeHours / mockStats.requiredCeHours) * 100;

  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-welcome">
            Welcome back, {userName}
          </h1>
          <p className="text-muted-foreground">
            Track your progress and stay compliant with {selectedState === "CA" ? "California DRE" : "Florida FREC"} requirements.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockStats.enrolledCourses}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockStats.completedCourses}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockStats.totalCeHours}/{mockStats.requiredCeHours}</p>
                  <p className="text-sm text-muted-foreground">CE Hours</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-lg font-bold">{mockStats.upcomingDeadline}</p>
                  <p className="text-sm text-muted-foreground">Next Deadline</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tabs defaultValue="in-progress">
              <TabsList className="mb-4">
                <TabsTrigger value="in-progress" data-testid="tab-in-progress">
                  In Progress ({mockEnrolledCourses.length})
                </TabsTrigger>
                <TabsTrigger value="completed" data-testid="tab-completed">
                  Completed ({mockCompletedCourses.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="in-progress" className="space-y-4">
                {mockEnrolledCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-40 h-32 sm:h-auto shrink-0">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <CardContent className="flex-1 p-4">
                        <div className="flex flex-col h-full">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2 line-clamp-2" data-testid={`text-course-title-${course.id}`}>
                              {course.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {course.lastAccessed}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {course.ceHours} CE Hours
                              </Badge>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm text-muted-foreground">Progress</span>
                              <span className="text-sm font-medium">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2 mb-3" />
                            <Button size="sm" className="gap-1" data-testid={`button-continue-${course.id}`}>
                              Continue
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {mockCompletedCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-40 h-32 sm:h-auto shrink-0 relative">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <CheckCircle className="h-10 w-10 text-green-500" />
                        </div>
                      </div>
                      <CardContent className="flex-1 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-semibold mb-2">{course.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span>Completed: {course.completedDate}</span>
                              <Badge variant="secondary" className="text-xs">
                                {course.ceHours} CE Hours
                              </Badge>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2 shrink-0" data-testid={`button-download-cert-${course.id}`}>
                            <Download className="h-4 w-4" />
                            Certificate
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">CE Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${ceProgress * 3.52} 352`}
                        className="text-primary transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <p className="text-3xl font-bold">{mockStats.totalCeHours}</p>
                      <p className="text-xs text-muted-foreground">of {mockStats.requiredCeHours}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Required</span>
                    <span className="font-medium">{mockStats.requiredCeHours} hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium text-green-500">{mockStats.totalCeHours} hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="font-medium">{mockStats.requiredCeHours - mockStats.totalCeHours} hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
                      Renewal Deadline Approaching
                    </h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                      Complete 42 more CE hours by {mockStats.upcomingDeadline} to renew your license.
                    </p>
                    <Button size="sm" variant="outline" className="border-orange-300 dark:border-orange-800" data-testid="button-view-requirements">
                      View Requirements
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
