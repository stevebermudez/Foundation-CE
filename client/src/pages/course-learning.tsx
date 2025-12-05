import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Award,
  CheckCircle,
  Lock,
  PlayCircle,
  BookOpen,
  Timer,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Trophy,
  FileText,
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface Lesson {
  id: string;
  lessonNumber: number;
  title: string;
  content?: string;
  videoUrl?: string;
  durationMinutes: number;
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
  const queryClient = useQueryClient();
  
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [activeLesson, setActiveLesson] = useState<{ unitId: string; lessonId: string } | null>(null);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [activeQuizUnitId, setActiveQuizUnitId] = useState<string | null>(null);
  
  const timeTrackingRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimeUpdateRef = useRef<number>(Date.now());

  // Fetch course data
  const { data: course, isLoading: courseLoading } = useQuery({
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
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Time tracking mutation
  const updateTimeMutation = useMutation({
    mutationFn: async ({ lessonId, secondsToAdd }: { lessonId: string; secondsToAdd: number }) => {
      if (!progressData?.enrollmentId) return;
      
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const res = await fetch(`/api/lessons/${lessonId}/time`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          enrollmentId: progressData.enrollmentId,
          secondsToAdd,
        }),
      });
      return res.json();
    },
  });

  // Lesson completion mutation
  const completeLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      if (!progressData?.enrollmentId) return;
      
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const res = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ enrollmentId: progressData.enrollmentId }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to complete lesson");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", params.id, "units-progress"] });
      toast({
        title: "Lesson Completed",
        description: "Great job! Moving to the next lesson.",
      });
    },
    onError: (error: Error) => {
      if (error.message.includes("Minimum time")) {
        toast({
          title: "More Time Needed",
          description: "Please spend more time reviewing this lesson before marking it complete.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  // Start time tracking when a lesson is active
  useEffect(() => {
    if (activeLesson && progressData) {
      lastTimeUpdateRef.current = Date.now();
      
      timeTrackingRef.current = setInterval(() => {
        const now = Date.now();
        const secondsElapsed = Math.floor((now - lastTimeUpdateRef.current) / 1000);
        lastTimeUpdateRef.current = now;
        
        if (secondsElapsed > 0 && secondsElapsed <= 120) {
          updateTimeMutation.mutate({
            lessonId: activeLesson.lessonId,
            secondsToAdd: secondsElapsed,
          });
        }
      }, 30000); // Update every 30 seconds
      
      return () => {
        if (timeTrackingRef.current) {
          clearInterval(timeTrackingRef.current);
        }
      };
    }
  }, [activeLesson, progressData?.enrollmentId]);

  // Auto-expand the current unit
  useEffect(() => {
    if (progressData?.units) {
      const currentUnit = progressData.units.find(u => u.status === "in_progress");
      if (currentUnit) {
        setExpandedUnits(prev => ({ ...prev, [currentUnit.id]: true }));
      }
    }
  }, [progressData?.units]);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const selectLesson = (unitId: string, lessonId: string, lesson: Lesson) => {
    const unit = progressData?.units.find(u => u.id === unitId);
    if (unit?.isLocked) {
      toast({
        title: "Unit Locked",
        description: "Complete the previous unit to unlock this one.",
        variant: "destructive",
      });
      return;
    }
    setActiveLesson({ unitId, lessonId });
    setIsQuizMode(false);
  };

  const handleCompleteLesson = () => {
    if (activeLesson) {
      completeLessonMutation.mutate(activeLesson.lessonId);
    }
  };

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

  const startQuiz = (unitId: string) => {
    setActiveQuizUnitId(unitId);
    setIsQuizMode(true);
    setActiveLesson(null);
  };

  const allUnitsComplete = progressData?.units.every(u => u.status === "completed") || false;

  if (courseLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-1/2 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-48" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-96" />
            </div>
          </div>
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

  const activeUnit = activeLesson 
    ? progressData.units.find(u => u.id === activeLesson.unitId) 
    : null;
  const activeLessonData = activeUnit?.lessons.find(l => l.id === activeLesson?.lessonId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" data-testid="button-back-dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold text-lg line-clamp-1" data-testid="text-course-title">
                  {course?.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Timer className="h-3.5 w-3.5" />
                    {formatTime(progressData.totalTimeSeconds)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" />
                    {course?.hoursRequired} CE Hours
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Overall:</span>
                <Progress value={getTotalProgress()} className="w-24 h-2" />
                <span className="font-medium">{getTotalProgress()}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Unit Navigation */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Course Units
                </CardTitle>
                <CardDescription>
                  {progressData.units.filter(u => u.status === "completed").length} of {progressData.units.length} completed
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="p-3 space-y-2">
                    {progressData.units.map((unit, idx) => (
                      <div key={unit.id} className="border rounded-lg overflow-hidden">
                        <div
                          className={`flex items-center gap-2 p-3 cursor-pointer hover-elevate ${
                            unit.isLocked ? "opacity-60" : ""
                          }`}
                          onClick={() => !unit.isLocked && toggleUnit(unit.id)}
                          data-testid={`unit-header-${idx}`}
                        >
                          {unit.isLocked ? (
                            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          ) : unit.status === "completed" ? (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <PlayCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm truncate ${unit.isLocked ? "text-muted-foreground" : ""}`}>
                              Unit {unit.unitNumber}: {unit.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={getUnitProgress(unit)} className="h-1.5 flex-1" />
                              <span className="text-xs text-muted-foreground">
                                {unit.lessonsCompleted}/{unit.totalLessons}
                              </span>
                            </div>
                          </div>
                          {!unit.isLocked && (
                            expandedUnits[unit.id] ? 
                              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : 
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                        
                        {expandedUnits[unit.id] && !unit.isLocked && (
                          <div className="border-t bg-muted/30 p-2 space-y-1">
                            {unit.lessons.map((lesson, lessonIdx) => (
                              <div
                                key={lesson.id}
                                className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm
                                  ${activeLesson?.lessonId === lesson.id ? "bg-primary/10 text-primary" : "hover:bg-muted"}
                                `}
                                onClick={() => selectLesson(unit.id, lesson.id, lesson)}
                                data-testid={`lesson-${idx}-${lessonIdx}`}
                              >
                                {lesson.completed ? (
                                  <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                ) : (
                                  <div className="h-3.5 w-3.5 rounded-full border-2 flex-shrink-0" />
                                )}
                                <span className="flex-1 truncate">{lesson.title}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(lesson.timeSpentSeconds)}
                                </span>
                              </div>
                            ))}
                            
                            {/* Unit Quiz Button */}
                            <Separator className="my-2" />
                            <Button
                              variant={unit.quizPassed ? "outline" : "default"}
                              size="sm"
                              className="w-full"
                              disabled={unit.lessonsCompleted < unit.totalLessons}
                              onClick={() => startQuiz(unit.id)}
                              data-testid={`button-unit-quiz-${idx}`}
                            >
                              {unit.quizPassed ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                  Quiz Passed ({unit.quizScore}%)
                                </>
                              ) : (
                                <>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Take Unit Quiz
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Final Exam Button */}
                    <Separator className="my-3" />
                    <Card className={allUnitsComplete ? "border-yellow-500" : "opacity-60"}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <Trophy className={`h-5 w-5 ${allUnitsComplete ? "text-yellow-500" : "text-muted-foreground"}`} />
                          <div>
                            <p className="font-semibold">Final Exam</p>
                            <p className="text-xs text-muted-foreground">
                              {allUnitsComplete ? "Ready to take" : "Complete all units first"}
                            </p>
                          </div>
                        </div>
                        {progressData.finalExamPassed ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            Passed with {progressData.finalExamScore}%
                          </Badge>
                        ) : (
                          <Button
                            className="w-full"
                            disabled={!allUnitsComplete}
                            onClick={() => setLocation(`/course/${params.id}/final-exam`)}
                            data-testid="button-final-exam"
                          >
                            {allUnitsComplete ? "Start Final Exam" : "Locked"}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {isQuizMode && activeQuizUnitId ? (
              <UnitQuiz
                unitId={activeQuizUnitId}
                enrollmentId={progressData.enrollmentId}
                onComplete={() => {
                  setIsQuizMode(false);
                  setActiveQuizUnitId(null);
                  queryClient.invalidateQueries({ queryKey: ["/api/courses", params.id, "units-progress"] });
                }}
                onCancel={() => {
                  setIsQuizMode(false);
                  setActiveQuizUnitId(null);
                }}
              />
            ) : activeLessonData ? (
              <LessonViewer
                lesson={activeLessonData}
                unit={activeUnit!}
                onComplete={handleCompleteLesson}
                isCompleting={completeLessonMutation.isPending}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Welcome to Your Course</h2>
                  <p className="text-muted-foreground mb-4">
                    Select a lesson from the sidebar to begin learning.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Complete lessons in order, take the unit quiz, then move to the next unit.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Lesson Viewer Component
function LessonViewer({
  lesson,
  unit,
  onComplete,
  isCompleting,
}: {
  lesson: Lesson;
  unit: Unit;
  onComplete: () => void;
  isCompleting: boolean;
}) {
  const MIN_TIME_SECONDS = 60; // 1 minute minimum
  
  // Local state for real-time timer
  const [localElapsedSeconds, setLocalElapsedSeconds] = useState(lesson.timeSpentSeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset local timer when lesson changes
  useEffect(() => {
    setLocalElapsedSeconds(lesson.timeSpentSeconds);
  }, [lesson.id, lesson.timeSpentSeconds]);
  
  // Real-time 1-second timer
  useEffect(() => {
    if (lesson.completed) return;
    
    timerRef.current = setInterval(() => {
      setLocalElapsedSeconds(prev => prev + 1);
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [lesson.id, lesson.completed]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };
  
  const timeRemaining = Math.max(0, MIN_TIME_SECONDS - localElapsedSeconds);
  const canComplete = localElapsedSeconds >= MIN_TIME_SECONDS;
  const progressPercent = Math.min(100, (localElapsedSeconds / MIN_TIME_SECONDS) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardDescription>Unit {unit.unitNumber}</CardDescription>
            <CardTitle className="text-xl">{lesson.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1" data-testid="badge-time-spent">
              <Clock className="h-3 w-3" />
              {formatTime(localElapsedSeconds)}
            </Badge>
            {lesson.completed && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>
        
        {/* Progress bar for time requirement */}
        {!lesson.completed && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Time Progress</span>
              {canComplete ? (
                <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Ready to complete
                </span>
              ) : (
                <span className="text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1" data-testid="text-time-remaining">
                  <Timer className="h-3.5 w-3.5" />
                  {formatTime(timeRemaining)} remaining
                </span>
              )}
            </div>
            <Progress 
              value={progressPercent} 
              className={`h-2 ${canComplete ? '[&>div]:bg-green-500' : ''}`}
              data-testid="progress-time"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video Player */}
        {lesson.videoUrl && (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {lesson.videoUrl.includes("youtube") ? (
              <iframe
                src={lesson.videoUrl.replace("watch?v=", "embed/")}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              <video src={lesson.videoUrl} controls className="w-full h-full" />
            )}
          </div>
        )}

        {/* Lesson Content */}
        {lesson.content && (
          <div className="prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
          </div>
        )}

        {!lesson.content && !lesson.videoUrl && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Lesson content is being prepared.</p>
          </div>
        )}

        {/* Complete Button */}
        {!lesson.completed && (
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={onComplete}
              disabled={isCompleting || !canComplete}
              className="gap-2"
              data-testid="button-complete-lesson"
            >
              {isCompleting ? (
                "Completing..."
              ) : !canComplete ? (
                <>
                  <Timer className="h-4 w-4" />
                  {formatTime(timeRemaining)} remaining
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Mark as Complete
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Unit Quiz Component
function UnitQuiz({
  unitId,
  enrollmentId,
  onComplete,
  onCancel,
}: {
  unitId: string;
  enrollmentId: string;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [quizStarted, setQuizStarted] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [correctCount, setCorrectCount] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch quiz info
  const { data: quizInfo, isLoading: quizInfoLoading } = useQuery({
    queryKey: ["/api/units", unitId, "quiz"],
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const res = await fetch(`/api/units/${unitId}/quiz`, {
        headers,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Quiz not found");
      return res.json();
    },
  });

  const startQuiz = async () => {
    if (!quizInfo?.bankId) return;
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const res = await fetch(`/api/quizzes/${quizInfo.bankId}/start`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ enrollmentId }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to start quiz");
      }
      
      const data = await res.json();
      setAttemptId(data.attemptId);
      setQuestions(data.questions);
      setQuizStarted(true);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (selectedOption === null || !attemptId) return;
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const currentQuestion = questions[currentQuestionIndex];
      
      const res = await fetch(`/api/quizzes/attempts/${attemptId}/answer`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          questionId: currentQuestion.id,
          selectedOption,
        }),
      });
      
      if (!res.ok) throw new Error("Failed to submit answer");
      
      const feedbackData = await res.json();
      setFeedback(feedbackData);
      setAnsweredQuestions(prev => new Set(prev).add(currentQuestion.id));
      
      if (feedbackData.isCorrect) {
        setCorrectCount(prev => prev + 1);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setFeedback(null);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    if (!attemptId) return;
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const res = await fetch(`/api/quizzes/attempts/${attemptId}/complete`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ timeSpentSeconds: 0 }),
      });
      
      if (!res.ok) throw new Error("Failed to complete quiz");
      
      const result = await res.json();
      setQuizResult(result);
      setQuizCompleted(true);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (quizInfoLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
          <Skeleton className="h-4 w-1/3 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (quizCompleted && quizResult) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          {quizResult.passed ? (
            <>
              <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Quiz Passed!</h2>
            </>
          ) : (
            <>
              <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Quiz Not Passed</h2>
            </>
          )}
          <p className="text-3xl font-bold mb-4">{quizResult.score}%</p>
          <p className="text-muted-foreground mb-6">
            You answered {quizResult.correctAnswers} of {quizResult.totalQuestions} questions correctly.
            <br />
            Passing score: {quizResult.passingScore}%
          </p>
          <div className="flex gap-3 justify-center">
            {!quizResult.passed && (
              <Button variant="outline" onClick={() => {
                setQuizStarted(false);
                setQuizCompleted(false);
                setQuizResult(null);
                setAttemptId(null);
                setQuestions([]);
                setCurrentQuestionIndex(0);
                setSelectedOption(null);
                setFeedback(null);
                setAnsweredQuestions(new Set());
                setCorrectCount(0);
              }}>
                Try Again
              </Button>
            )}
            <Button onClick={onComplete}>
              {quizResult.passed ? "Continue to Next Unit" : "Back to Lessons"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quizStarted) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>{quizInfo?.title || "Unit Quiz"}</CardTitle>
          <CardDescription>
            {quizInfo?.description || "Test your knowledge of this unit"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{quizInfo?.questionsPerAttempt || 20}</p>
              <p className="text-sm text-muted-foreground">Questions</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{quizInfo?.passingScore || 70}%</p>
              <p className="text-sm text-muted-foreground">To Pass</p>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <p className="text-sm">
              Questions are randomly selected from a larger bank. Each attempt will have different questions.
              You'll receive immediate feedback after each answer with an explanation.
            </p>
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={startQuiz} disabled={isLoading} data-testid="button-start-quiz">
              {isLoading ? "Starting..." : "Start Quiz"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Question {currentQuestionIndex + 1} of {questions.length}
          </CardTitle>
          <Badge variant="outline">
            {correctCount} correct so far
          </Badge>
        </div>
        <Progress value={(currentQuestionIndex / questions.length) * 100} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-lg font-medium">{currentQuestion?.questionText}</p>
        
        <div className="space-y-3">
          {currentQuestion?.options.map((option: string, idx: number) => (
            <div
              key={idx}
              className={`p-4 border rounded-lg cursor-pointer transition-colors
                ${selectedOption === idx ? "border-primary bg-primary/5" : "hover:border-primary/50"}
                ${feedback && idx === feedback.correctOption ? "border-green-500 bg-green-50 dark:bg-green-950" : ""}
                ${feedback && selectedOption === idx && !feedback.isCorrect ? "border-red-500 bg-red-50 dark:bg-red-950" : ""}
                ${feedback ? "cursor-default" : ""}
              `}
              onClick={() => !feedback && setSelectedOption(idx)}
              data-testid={`option-${idx}`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center text-sm
                  ${selectedOption === idx ? "border-primary bg-primary text-primary-foreground" : ""}
                  ${feedback && idx === feedback.correctOption ? "border-green-500 bg-green-500 text-white" : ""}
                  ${feedback && selectedOption === idx && !feedback.isCorrect ? "border-red-500 bg-red-500 text-white" : ""}
                `}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span>{option}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback Section */}
        {feedback && (
          <div className={`p-4 rounded-lg ${feedback.isCorrect ? "bg-green-100 dark:bg-green-900/50" : "bg-red-100 dark:bg-red-900/50"}`}>
            <div className="flex items-start gap-3">
              {feedback.isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold mb-1">
                  {feedback.isCorrect ? "Correct!" : "Incorrect"}
                </p>
                {!feedback.isCorrect && (
                  <p className="text-sm mb-2">
                    The correct answer was: <strong>{feedback.correctAnswer}</strong>
                  </p>
                )}
                <p className="text-sm text-muted-foreground">{feedback.explanation}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Exit Quiz
          </Button>
          {!feedback ? (
            <Button
              onClick={submitAnswer}
              disabled={selectedOption === null || isLoading}
              data-testid="button-submit-answer"
            >
              {isLoading ? "Submitting..." : "Submit Answer"}
            </Button>
          ) : (
            <Button onClick={nextQuestion} className="gap-2" data-testid="button-next-question">
              {currentQuestionIndex < questions.length - 1 ? (
                <>
                  Next Question
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                "Finish Quiz"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
