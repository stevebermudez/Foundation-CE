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
  FileCheck,
  Loader2,
  ExternalLink,
} from "lucide-react";

import caRealEstate from "@assets/generated_images/california_luxury_real_estate.png";
import flRealEstate from "@assets/generated_images/florida_beachfront_properties.png";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

function CompletedCourseCard({ enrollment }: { enrollment: any }) {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const isFloridaCourse = enrollment.course?.state === "FL" && enrollment.course?.productType === "RealEstate";
  
  const { data: dbprStatus } = useQuery<any>({
    queryKey: ["/api/dbpr/status", enrollment.id],
    enabled: isFloridaCourse,
  });

  const handleDownloadCertificate = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/certificates/${enrollment.id}/download`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to download certificate");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${enrollment.id}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Certificate Downloaded",
        description: "Your completion certificate has been downloaded.",
      });
    } catch (err) {
      toast({
        title: "Download Failed",
        description: "Unable to download certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleViewCertificate = () => {
    window.open(`/api/certificates/${enrollment.id}`, "_blank");
  };

  const getDbprStatusBadge = () => {
    if (!dbprStatus) return null;
    
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      pending: { label: "DBPR Pending", variant: "secondary" },
      submitted: { label: "DBPR Submitted", variant: "default" },
      accepted: { label: "DBPR Reported", variant: "default" },
      rejected: { label: "DBPR Error", variant: "destructive" },
    };
    
    const config = statusMap[dbprStatus.status] || statusMap.pending;
    return (
      <Badge variant={config.variant} className="text-xs gap-1">
        <FileCheck className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <h3 className="font-semibold" data-testid={`text-completed-course-${enrollment.id}`}>
                {enrollment.course?.title}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground ml-7">
              <span>
                Completed: {enrollment.completedAt ? new Date(enrollment.completedAt).toLocaleDateString() : "Recent"}
              </span>
              <Badge variant="secondary" className="text-xs">
                {enrollment.course?.hoursRequired} CE Hours
              </Badge>
              {isFloridaCourse && getDbprStatusBadge()}
            </div>
            {dbprStatus?.confirmationNumber && (
              <p className="text-xs text-muted-foreground ml-7 mt-1">
                DBPR Confirmation: {dbprStatus.confirmationNumber}
              </p>
            )}
          </div>
          <div className="flex gap-2 shrink-0 ml-7 sm:ml-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleViewCertificate}
              data-testid={`button-view-cert-${enrollment.id}`}
            >
              <ExternalLink className="h-4 w-4" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleDownloadCertificate}
              disabled={downloading}
              data-testid={`button-download-cert-${enrollment.id}`}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Certificate
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DashboardProps {
  userName: string;
  selectedState: "CA" | "FL";
}

export default function Dashboard({ userName, selectedState }: DashboardProps) {
  const { data: enrollments = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/enrollments/user"],
  });

  const inProgressCourses = enrollments.filter((e: any) => !e.completed);
  const completedCourses = enrollments.filter((e: any) => e.completed);
  const totalCeHours = completedCourses.reduce((sum: number, e: any) => sum + (e.course?.hoursRequired || 0), 0);
  const requiredCeHours = selectedState === "FL" ? 63 : 45;
  
  const stats = {
    enrolledCourses: inProgressCourses.length,
    completedCourses: completedCourses.length,
    totalCeHours: totalCeHours,
    requiredCeHours: requiredCeHours,
    upcomingDeadline: "Dec 31, 2025",
  };
  
  const ceProgress = Math.min((stats.totalCeHours / stats.requiredCeHours) * 100, 100);

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
                  <p className="text-2xl font-bold" data-testid="stat-in-progress">{stats.enrolledCourses}</p>
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
                  <p className="text-2xl font-bold" data-testid="stat-completed">{stats.completedCourses}</p>
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
                  <p className="text-2xl font-bold" data-testid="stat-ce-hours">{stats.totalCeHours}/{stats.requiredCeHours}</p>
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
                  <p className="text-lg font-bold" data-testid="stat-deadline">{stats.upcomingDeadline}</p>
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
                  In Progress ({inProgressCourses.length})
                </TabsTrigger>
                <TabsTrigger value="completed" data-testid="tab-completed">
                  Completed ({completedCourses.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="in-progress" className="space-y-4">
                {inProgressCourses.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">No courses in progress.</p>
                    <Button onClick={() => window.location.href = "/courses/fl"} data-testid="button-browse-courses">
                      Browse Courses
                    </Button>
                  </Card>
                ) : (
                  inProgressCourses.map((enrollment: any) => (
                    <Card key={enrollment.id} className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-40 h-32 sm:h-auto shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-white/80" />
                        </div>
                        <CardContent className="flex-1 p-4">
                          <div className="flex flex-col h-full">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-2 line-clamp-2" data-testid={`text-course-title-${enrollment.id}`}>
                                {enrollment.course?.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {enrollment.hoursCompleted || 0}/{enrollment.course?.hoursRequired || 0} hours
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {enrollment.course?.hoursRequired} CE Hours
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm text-muted-foreground">Progress</span>
                                <span className="text-sm font-medium">{enrollment.progress || 0}%</span>
                              </div>
                              <Progress value={enrollment.progress || 0} className="h-2 mb-3" />
                              <Button 
                                size="sm" 
                                className="gap-1" 
                                onClick={() => window.location.href = `/course/${enrollment.courseId}`}
                                data-testid={`button-continue-${enrollment.id}`}
                              >
                                Continue
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {completedCourses.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No completed courses yet.</p>
                  </Card>
                ) : (
                  completedCourses.map((enrollment: any) => (
                    <CompletedCourseCard key={enrollment.id} enrollment={enrollment} />
                  ))
                )}
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
                      <p className="text-3xl font-bold">{stats.totalCeHours}</p>
                      <p className="text-xs text-muted-foreground">of {stats.requiredCeHours}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Required</span>
                    <span className="font-medium">{stats.requiredCeHours} hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium text-green-500">{stats.totalCeHours} hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="font-medium">{Math.max(0, stats.requiredCeHours - stats.totalCeHours)} hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {stats.totalCeHours < stats.requiredCeHours && (
              <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
                        Renewal Deadline Approaching
                      </h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                        Complete {stats.requiredCeHours - stats.totalCeHours} more CE hours by {stats.upcomingDeadline} to renew your license.
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-orange-300 dark:border-orange-800" 
                        onClick={() => window.location.href = "/courses/fl"}
                        data-testid="button-view-requirements"
                      >
                        View Courses
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {stats.totalCeHours >= stats.requiredCeHours && (
              <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                        CE Requirements Complete
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        You have completed all required CE hours for this renewal period.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
