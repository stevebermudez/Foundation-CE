import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Clock,
  Award,
  FileText,
  CheckCircle2,
  BookOpen,
  Zap,
  ShoppingCart,
  PlayCircle,
  GraduationCap,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Link } from "wouter";

interface Lesson {
  id: string;
  lessonNumber: number;
  title: string;
  durationMinutes: number;
}

interface UnitWithLessons {
  id: string;
  unitNumber: number;
  title: string;
  description?: string;
  hoursRequired: number;
  lessons: Lesson[];
}

export default function CourseViewPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch course data from API
  const { data: course, isLoading } = useQuery({
    queryKey: ["/api/courses", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${params.id}`);
      if (!res.ok) throw new Error("Course not found");
      return res.json();
    },
    enabled: !!params.id,
  });

  // Fetch units with their lessons
  const { data: unitsWithLessons = [], isLoading: unitsLoading, isError: unitsError, refetch: refetchUnits } = useQuery<UnitWithLessons[]>({
    queryKey: ["/api/courses", params.id, "units-with-lessons"],
    queryFn: async () => {
      const unitsRes = await fetch(`/api/courses/${params.id}/units`);
      if (!unitsRes.ok) {
        throw new Error("Failed to fetch course units");
      }
      const unitsData = await unitsRes.json();
      
      // Fetch lessons for each unit
      const unitsWithLessonsData = await Promise.all(
        unitsData.map(async (unit: any) => {
          try {
            const lessonsRes = await fetch(`/api/units/${unit.id}/lessons`);
            const lessons = lessonsRes.ok ? await lessonsRes.json() : [];
            return { ...unit, lessons };
          } catch {
            return { ...unit, lessons: [] };
          }
        })
      );
      
      return unitsWithLessonsData;
    },
    enabled: !!params.id,
    retry: 2,
  });

  // Fetch enrollment data
  const { data: enrollment } = useQuery({
    queryKey: ["/api/enrollments", params.id],
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/enrollments/user`, { 
        headers,
        credentials: "include" 
      });
      if (!res.ok) return null;
      const enrollments = await res.json();
      return enrollments.find((e: any) => e.courseId === params.id) || null;
    },
    enabled: !!params.id,
  });

  // Fetch practice exams
  const { data: exams = [] } = useQuery({
    queryKey: ["/api/courses", params.id, "exams"],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${params.id}/exams`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!params.id,
  });

  // Calculate total lessons and duration
  const totalLessons = unitsWithLessons.reduce((acc, unit) => acc + (unit.lessons?.length || 0), 0);
  const totalMinutes = unitsWithLessons.reduce((acc, unit) => 
    acc + (unit.lessons?.reduce((sum, lesson) => sum + (lesson.durationMinutes || 15), 0) || 0), 0
  );

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const courseTitle = course?.title || "Course";
  const courseHours = course?.hoursRequired || 3;
  const courseDuration = `${Math.ceil(((courseHours || 3) * 60) / 50)}m`;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/courses/fl">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold text-lg line-clamp-1">
                  {courseTitle}
                </h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {courseDuration}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    {courseHours} CE Hours
                  </Badge>
                </div>
              </div>
            </div>
            {enrollment ? (
              <Button
                onClick={() => setLocation(`/course/${params.id}/learn`)}
                className="gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                data-testid="button-start-learning"
              >
                <PlayCircle className="h-4 w-4" />
                {(enrollment.hoursCompleted || 0) > 0 ? "Continue Learning" : "Start Learning"}
              </Button>
            ) : course && (
              <Button
                onClick={() => setLocation(`/checkout/${params.id}`)}
                className="gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                data-testid="button-buy-course"
              >
                <ShoppingCart className="h-4 w-4" />
                Buy Now - ${((course.price || 0) / 100).toFixed(2)}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview" data-testid="tab-overview">
              Overview
            </TabsTrigger>
            <TabsTrigger value="lessons" data-testid="tab-lessons">
              Video Lessons
            </TabsTrigger>
            <TabsTrigger value="resources" data-testid="tab-resources">
              Resources
            </TabsTrigger>
            <TabsTrigger value="quiz" data-testid="tab-quiz">
              Assessment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Course Overview Card */}
              <Card data-testid="card-course-overview">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Course Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{course?.description}</p>

                  <div className={`grid grid-cols-2 ${enrollment ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-4`}>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Hours Required
                      </p>
                      <p className="text-2xl font-bold">
                        {course?.hoursRequired}
                      </p>
                    </div>
                    {!enrollment && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="text-2xl font-bold">
                          ${((course?.price || 0) / 100).toFixed(2)}
                        </p>
                      </div>
                    )}
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        License Type
                      </p>
                      <p className="text-lg font-semibold">
                        {course?.licenseType}
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">State</p>
                      <p className="text-lg font-semibold">{course?.state}</p>
                    </div>
                  </div>

                  {enrollment && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold">Your Progress</p>
                        <Badge variant="secondary">
                          {Math.round(
                            (enrollment.hoursCompleted /
                              (course?.hoursRequired || 1)) *
                              100,
                          )}
                          % Complete
                        </Badge>
                      </div>
                      <Progress
                        value={
                          (enrollment.hoursCompleted / (course?.hoursRequired || 1)) *
                          100
                        }
                        className="h-2"
                      />
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-sm text-muted-foreground">
                          {enrollment.hoursCompleted} of {course?.hoursRequired}{" "}
                          hours completed
                        </p>
                        <Button
                          onClick={() => setLocation(`/course/${params.id}/learn`)}
                          className="gap-2"
                          data-testid="button-continue-learning"
                        >
                          <PlayCircle className="h-4 w-4" />
                          {(enrollment.hoursCompleted || 0) > 0 ? "Continue" : "Start Learning"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {!enrollment && course && (
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-green-800 dark:text-green-200">Ready to Get Started?</p>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            Enroll now and begin your learning journey today.
                          </p>
                        </div>
                        <Button
                          onClick={() => setLocation(`/checkout/${params.id}`)}
                          className="gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 shrink-0"
                          data-testid="button-enroll-overview"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Enroll Now - ${((course.price || 0) / 100).toFixed(2)}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Course Structure */}
              {unitsLoading ? (
                <Card data-testid="card-course-structure-loading">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Course Structure
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : unitsError ? (
                <Card data-testid="card-course-structure-error">
                  <CardContent className="py-8 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                    <p className="text-muted-foreground mb-4">Failed to load course structure.</p>
                    <Button variant="outline" onClick={() => refetchUnits()} className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              ) : unitsWithLessons.length > 0 ? (
                <Card data-testid="card-course-structure">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Course Structure ({unitsWithLessons.length} Units, {totalLessons} Lessons)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {unitsWithLessons.map((unit, idx: number) => (
                        <div
                          key={unit.id || idx}
                          className="p-3 border rounded-lg"
                          data-testid={`unit-${idx}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                              {unit.unitNumber || idx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{unit.title}</p>
                              {unit.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {unit.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-3 mt-2 text-xs">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  {unit.lessons?.length || 0} lessons
                                </span>
                                {unit.hoursRequired && (
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {unit.hoursRequired}h
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {/* Practice Exams */}
              {exams.length > 0 && (
                <Card data-testid="card-practice-exams">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Practice Exams ({exams.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {exams.map((exam: any, idx: number) => (
                        <div
                          key={exam.id || idx}
                          className="p-3 border rounded-lg flex items-center justify-between hover-elevate cursor-pointer"
                          data-testid={`exam-${idx}`}
                        >
                          <div>
                            <p className="font-medium">{exam.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {exam.totalQuestions} questions •{" "}
                              {exam.passingScore}% pass required
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Take Exam
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="lessons">
            <div className="space-y-6">
              {/* Course Curriculum Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Course Curriculum
                  </CardTitle>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {unitsWithLessons.length} Units
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {totalLessons} Lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(totalMinutes)} total
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {enrollment ? (
                    <Button
                      onClick={() => setLocation(`/course/${params.id}/learn`)}
                      className="w-full gap-2"
                      data-testid="button-start-curriculum"
                    >
                      <PlayCircle className="h-4 w-4" />
                      {(enrollment.hoursCompleted || 0) > 0 ? "Continue Learning" : "Start Learning"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setLocation(`/checkout/${params.id}`)}
                      className="w-full gap-2"
                      data-testid="button-enroll-curriculum"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Enroll to Access Lessons
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Units and Lessons */}
              {unitsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : unitsError ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                    <p className="text-muted-foreground mb-4">Failed to load course curriculum.</p>
                    <Button variant="outline" onClick={() => refetchUnits()} className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              ) : unitsWithLessons.length > 0 ? (
                <div className="space-y-4">
                  {unitsWithLessons.map((unit, unitIdx) => (
                    <Card key={unit.id} data-testid={`curriculum-unit-${unitIdx}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-3">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                            {unit.unitNumber || unitIdx + 1}
                          </div>
                          <div className="flex-1">
                            <span>{unit.title}</span>
                            <div className="font-normal text-sm text-muted-foreground mt-1">
                              {unit.lessons?.length || 0} lessons
                              {unit.hoursRequired && ` • ${unit.hoursRequired}h`}
                            </div>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      {unit.lessons && unit.lessons.length > 0 && (
                        <CardContent className="pt-0">
                          <div className="space-y-2 border-l-2 border-muted ml-4 pl-4">
                            {unit.lessons.map((lesson, lessonIdx) => (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-3 py-2 text-sm"
                                data-testid={`lesson-item-${unitIdx}-${lessonIdx}`}
                              >
                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                  {lesson.lessonNumber || lessonIdx + 1}
                                </div>
                                <span className="flex-1">{lesson.title}</span>
                                <span className="text-muted-foreground text-xs">
                                  {lesson.durationMinutes || 15}m
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Course curriculum is being prepared.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="resources">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Complete Course Study Guide",
                  pages: 45,
                  size: "2.3 MB",
                },
                {
                  title: "Ethics Quick Reference Card",
                  pages: 2,
                  size: "156 KB",
                },
                { title: "DRE Regulations Summary", pages: 12, size: "890 KB" },
                { title: "Case Study Workbook", pages: 28, size: "1.5 MB" },
              ].map((resource, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border rounded-lg hover-elevate cursor-pointer"
                  onClick={() => {
                    // Create a temporary link element to trigger download
                    const link = document.createElement("a");
                    link.href = "#"; // In production, this would be the actual PDF URL
                    link.download = `${resource.title}.pdf`;
                    link.click();
                    // Show a message that download would occur in production
                    alert(
                      `Downloading: ${resource.title}\n\nIn production, this would download a ${resource.size} PDF file with ${resource.pages} pages of course materials.`,
                    );
                  }}
                  data-testid={`resource-${index}`}
                >
                  <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{resource.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {resource.pages} pages • {resource.size}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quiz">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Course Assessments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-4">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Unit Quizzes & Final Exam</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Each unit includes a quiz to test your understanding. Complete all unit quizzes to unlock the final exam.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <h4 className="font-medium">Unit Quizzes</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {unitsWithLessons.length} quizzes • One per unit • 70% passing score
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      <h4 className="font-medium">Final Exam</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive exam • 70% passing score • Earn your certificate
                    </p>
                  </div>
                </div>

                {enrollment ? (
                  <Button
                    onClick={() => setLocation(`/course/${params.id}/learn`)}
                    className="w-full gap-2"
                    data-testid="button-start-assessments"
                  >
                    <PlayCircle className="h-4 w-4" />
                    {(enrollment.hoursCompleted || 0) > 0 ? "Continue to Assessments" : "Start Course"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setLocation(`/checkout/${params.id}`)}
                    className="w-full gap-2"
                    data-testid="button-enroll-assessments"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Enroll to Access Assessments
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
