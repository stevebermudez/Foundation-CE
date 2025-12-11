import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Clock,
  Award,
  CheckCircle,
  PlayCircle,
  BookOpen,
  Eye,
  FileText,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Link } from "wouter";
import { ContentBlockRenderer } from "@/components/lms/ContentBlockRenderer";

interface Lesson {
  id: string;
  lessonNumber: number;
  title: string;
  content?: string;
  videoUrl?: string;
  durationMinutes: number;
}

interface Unit {
  id: string;
  unitNumber: number;
  title: string;
  description?: string;
  hoursRequired: number;
  lessons: Lesson[];
}

export default function AdminCoursePreviewPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Fetch course data
  const { data: course, isLoading: courseLoading } = useQuery<any>({
    queryKey: ["/api/courses", params.id],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const res = await fetch(`/api/courses/${params.id}`, {
        headers,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Course not found");
      return res.json();
    },
    enabled: !!params.id,
  });

  // Fetch units with lessons (admin preview - no enrollment required)
  const { data: units = [], isLoading: unitsLoading } = useQuery<Unit[]>({
    queryKey: ["/api/admin/courses", params.id, "preview"],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const res = await fetch(`/api/admin/courses/${params.id}/preview`, {
        headers,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch course preview");
      return res.json();
    },
    enabled: !!params.id,
  });

  // Auto-select first unit and lesson
  useEffect(() => {
    if (units.length > 0 && !selectedUnitId) {
      const firstUnit = units[0];
      setSelectedUnitId(firstUnit.id);
      if (firstUnit.lessons.length > 0) {
        setSelectedLessonId(firstUnit.lessons[0].id);
      }
    }
  }, [units, selectedUnitId]);

  const selectedUnit = units.find(u => u.id === selectedUnitId);
  const selectedLesson = selectedUnit?.lessons.find(l => l.id === selectedLessonId);

  // Navigation helpers
  const navigateToNextLesson = () => {
    if (!selectedUnit || !selectedLesson) return;
    
    const currentLessonIndex = selectedUnit.lessons.findIndex(l => l.id === selectedLessonId);
    if (currentLessonIndex < selectedUnit.lessons.length - 1) {
      setSelectedLessonId(selectedUnit.lessons[currentLessonIndex + 1].id);
    } else {
      // Move to next unit
      const currentUnitIndex = units.findIndex(u => u.id === selectedUnitId);
      if (currentUnitIndex < units.length - 1) {
        const nextUnit = units[currentUnitIndex + 1];
        setSelectedUnitId(nextUnit.id);
        if (nextUnit.lessons.length > 0) {
          setSelectedLessonId(nextUnit.lessons[0].id);
        }
      }
    }
  };

  const navigateToPreviousLesson = () => {
    if (!selectedUnit || !selectedLesson) return;
    
    const currentLessonIndex = selectedUnit.lessons.findIndex(l => l.id === selectedLessonId);
    if (currentLessonIndex > 0) {
      setSelectedLessonId(selectedUnit.lessons[currentLessonIndex - 1].id);
    } else {
      // Move to previous unit
      const currentUnitIndex = units.findIndex(u => u.id === selectedUnitId);
      if (currentUnitIndex > 0) {
        const prevUnit = units[currentUnitIndex - 1];
        setSelectedUnitId(prevUnit.id);
        if (prevUnit.lessons.length > 0) {
          setSelectedLessonId(prevUnit.lessons[prevUnit.lessons.length - 1].id);
        }
      }
    }
  };

  if (courseLoading || unitsLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-24" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
            <Link href="/admin/courses">
              <Button>Back to Courses</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalLessons = units.reduce((acc, unit) => acc + unit.lessons.length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/courses">
                <Button variant="ghost" size="icon" aria-label="Back to courses">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Preview Mode</span>
                </div>
                <h1 className="font-semibold text-lg line-clamp-1">{course.title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {units.length} units
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {totalLessons} lessons
              </span>
              <span className="flex items-center gap-1">
                <Award className="h-3.5 w-3.5" />
                {course.hoursRequired} CE Hours
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Units and Lessons */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Course Structure</CardTitle>
                <CardDescription>
                  Click any unit or lesson to preview
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {units.map((unit) => (
                    <div key={unit.id} className="p-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUnitId(unit.id);
                          if (unit.lessons.length > 0) {
                            setSelectedLessonId(unit.lessons[0].id);
                          }
                        }}
                        className={`w-full text-left p-2 rounded-lg transition-colors ${
                          selectedUnitId === unit.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Unit {unit.unitNumber}</span>
                          <Badge variant="outline" className="text-xs">
                            {unit.lessons.length}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {unit.title}
                        </p>
                      </button>
                      
                      {selectedUnitId === unit.id && unit.lessons.length > 0 && (
                        <div className="mt-2 ml-4 space-y-1 border-l-2 border-muted pl-3">
                          {unit.lessons.map((lesson) => (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => setSelectedLessonId(lesson.id)}
                              className={`w-full text-left p-2 rounded transition-colors text-sm ${
                                selectedLessonId === lesson.id
                                  ? "bg-primary/5 text-primary font-medium"
                                  : "hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs">L{lesson.lessonNumber}</span>
                                <span className="flex-1 line-clamp-1">{lesson.title}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedLesson ? (
              <LessonPreview
                lesson={selectedLesson}
                unit={selectedUnit!}
                course={course}
                onNext={navigateToNextLesson}
                onPrevious={navigateToPreviousLesson}
                hasNext={(() => {
                  if (!selectedUnit) return false;
                  const currentLessonIndex = selectedUnit.lessons.findIndex(l => l.id === selectedLessonId);
                  if (currentLessonIndex < selectedUnit.lessons.length - 1) return true;
                  const currentUnitIndex = units.findIndex(u => u.id === selectedUnitId);
                  return currentUnitIndex < units.length - 1;
                })()}
                hasPrevious={(() => {
                  if (!selectedUnit) return false;
                  const currentLessonIndex = selectedUnit.lessons.findIndex(l => l.id === selectedLessonId);
                  if (currentLessonIndex > 0) return true;
                  const currentUnitIndex = units.findIndex(u => u.id === selectedUnitId);
                  return currentUnitIndex > 0;
                })()}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Select a lesson to preview</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Lesson Preview Component (No time limits, free navigation)
function LessonPreview({
  lesson,
  unit,
  course,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}: {
  lesson: Lesson;
  unit: Unit;
  course: any;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}) {
  const { data: contentBlocks } = useQuery<any[]>({
    queryKey: ["/api/lessons", lesson.id, "blocks"],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const res = await fetch(`/api/lessons/${lesson.id}/blocks`, {
        headers,
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardDescription>
              Unit {unit.unitNumber} • Lesson {lesson.lessonNumber}
            </CardDescription>
            <CardTitle className="text-xl mt-1">{lesson.title}</CardTitle>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {lesson.durationMinutes || 15}m
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {lesson.videoUrl && (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {lesson.videoUrl.includes("youtube") ? (
              <iframe
                src={lesson.videoUrl.replace("watch?v=", "embed/")}
                className="w-full h-full"
                allowFullScreen
                title={`Video: ${lesson.title}`}
              />
            ) : (
              <video src={lesson.videoUrl} controls className="w-full h-full" />
            )}
          </div>
        )}

        {lesson.content && (
          <div className="prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
          </div>
        )}

        {contentBlocks && contentBlocks.length > 0 && (
          <div className="mt-6">
            <ContentBlockRenderer blocks={contentBlocks} />
          </div>
        )}

        {!lesson.content && !lesson.videoUrl && (!contentBlocks || contentBlocks.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Lesson content is being prepared.</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={onNext}
            disabled={!hasNext}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

