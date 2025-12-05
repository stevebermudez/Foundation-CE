import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Clock,
  Award,
  CheckCircle,
  Lock,
  PlayCircle,
  BookOpen,
  Timer,
  AlertCircle,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";

interface Lesson {
  id: string;
  lessonNumber: number;
  title: string;
  completed: boolean;
  timeSpentSeconds: number;
}

interface Unit {
  id: string;
  unitNumber: number;
  title: string;
  description?: string;
  hoursRequired: number;
  status: "locked" | "in_progress" | "completed";
  lessonsCompleted: number;
  totalLessons: number;
  quizPassed: boolean;
  quizScore?: number;
  quizAttempts: number;
  timeSpentSeconds: number;
  lessons: Lesson[];
  isLocked: boolean;
}

interface CourseProgress {
  enrollmentId: string;
  currentUnitIndex: number;
  totalTimeSeconds: number;
  finalExamPassed: boolean;
  finalExamScore?: number;
  units: Unit[];
}

export default function CourseLearningPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch course data
  const { data: course, isLoading: courseLoading } = useQuery<any>({
    queryKey: ["/api/courses", params.id],
    enabled: !!params.id,
  });

  // Fetch units with progress
  const { data: progressData, isLoading: progressLoading } = useQuery<CourseProgress>({
    queryKey: ["/api/courses", params.id, "units-progress"],
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const res = await fetch(`/api/courses/${params.id}/units-progress`, {
        headers,
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 404) throw new Error("Not enrolled");
        throw new Error("Failed to fetch progress");
      }
      return res.json();
    },
    enabled: !!params.id,
    refetchInterval: 30000,
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getUnitProgress = (unit: Unit) => {
    if (unit.totalLessons === 0) return 0;
    return Math.round((unit.lessonsCompleted / unit.totalLessons) * 100);
  };

  const getTotalProgress = () => {
    if (!progressData?.units) return 0;
    const totalLessons = progressData.units.reduce((acc, u) => acc + u.totalLessons, 0);
    const completedLessons = progressData.units.reduce((acc, u) => acc + u.lessonsCompleted, 0);
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons / totalLessons) * 100);
  };

  const getCompletedUnits = () => {
    if (!progressData?.units) return 0;
    return progressData.units.filter(u => u.status === "completed").length;
  };

  const allUnitsComplete = progressData?.units.every(u => u.status === "completed") || false;

  // Find the current unit to continue
  const currentUnit = progressData?.units.find(u => u.status === "in_progress") || 
    progressData?.units.find(u => !u.isLocked && u.status !== "completed");

  if (courseLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-24" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Not Enrolled</h2>
            <p className="text-muted-foreground mb-4">
              You need to be enrolled in this course to access the learning materials.
            </p>
            <Link href={`/courses/fl`}>
              <Button>Browse Courses</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" data-testid="button-back-dashboard" aria-label="Back to dashboard">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="font-bold text-xl" data-testid="text-course-title">
                {course?.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Timer className="h-3.5 w-3.5" />
                  {formatTime(progressData.totalTimeSeconds)} spent
                </span>
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" />
                  {course?.hoursRequired} CE Hours
                </span>
              </div>
            </div>
          </div>
          
          {/* Overall Progress */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Course Progress</span>
              <span className="text-sm font-bold">{getTotalProgress()}%</span>
            </div>
            <Progress value={getTotalProgress()} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {getCompletedUnits()} of {progressData.units.length} units completed
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Continue Learning Card */}
        {currentUnit && !allUnitsComplete && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <PlayCircle className="h-10 w-10 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Continue where you left off</p>
                    <p className="font-semibold">Unit {currentUnit.unitNumber}: {currentUnit.title}</p>
                  </div>
                </div>
                <Button
                  onClick={() => setLocation(`/course/${params.id}/unit/${currentUnit.id}`)}
                  className="gap-2"
                  data-testid="button-continue-learning"
                >
                  Continue Learning
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Units List */}
        <div className="space-y-3" role="list" aria-label="Course units">
          <h2 className="font-semibold text-lg px-1">Course Units</h2>
          
          {progressData.units.map((unit, idx) => (
            <Card 
              key={unit.id}
              className={`cursor-pointer transition-colors ${
                unit.isLocked 
                  ? "opacity-60" 
                  : "hover:border-primary/50"
              }`}
              onClick={() => {
                if (unit.isLocked) {
                  toast({
                    title: "Unit Locked",
                    description: "Complete the previous unit to unlock this one.",
                    variant: "destructive",
                  });
                } else {
                  setLocation(`/course/${params.id}/unit/${unit.id}`);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (unit.isLocked) {
                    toast({
                      title: "Unit Locked",
                      description: "Complete the previous unit to unlock this one.",
                      variant: "destructive",
                    });
                  } else {
                    setLocation(`/course/${params.id}/unit/${unit.id}`);
                  }
                }
              }}
              tabIndex={0}
              role="listitem"
              aria-label={`Unit ${unit.unitNumber}: ${unit.title}${unit.isLocked ? ', locked' : unit.status === 'completed' ? ', completed' : ''}`}
              data-testid={`unit-card-${idx}`}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1" aria-hidden="true">
                    {unit.isLocked ? (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </div>
                    ) : unit.status === "completed" ? (
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary">{unit.unitNumber}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{unit.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {unit.totalLessons} lessons
                          </span>
                          {unit.hoursRequired > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {unit.hoursRequired}h
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {!unit.isLocked && (
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    
                    {!unit.isLocked && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            {unit.lessonsCompleted}/{unit.totalLessons} lessons
                          </span>
                          {unit.quizPassed && (
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              Quiz Passed
                            </Badge>
                          )}
                        </div>
                        <Progress value={getUnitProgress(unit)} className="h-1.5" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Final Exam Card */}
        <Card className={allUnitsComplete ? "border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20" : "opacity-60"}>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                allUnitsComplete ? "bg-yellow-100 dark:bg-yellow-900" : "bg-muted"
              }`}>
                <Trophy className={`h-5 w-5 ${allUnitsComplete ? "text-yellow-600" : "text-muted-foreground"}`} />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold">Final Exam</h3>
                <p className="text-sm text-muted-foreground">
                  {allUnitsComplete 
                    ? progressData.finalExamPassed 
                      ? `Passed with ${progressData.finalExamScore}%`
                      : "Ready to take"
                    : "Complete all units first"
                  }
                </p>
              </div>
              
              {allUnitsComplete && (
                <Button
                  variant={progressData.finalExamPassed ? "outline" : "default"}
                  onClick={() => setLocation(`/course/${params.id}/final-exam`)}
                  data-testid="button-final-exam"
                >
                  {progressData.finalExamPassed ? "View Results" : "Start Exam"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
