import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
  FileText,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";

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

export default function UnitLearningPage() {
  const params = useParams<{ courseId: string; unitId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [isQuizMode, setIsQuizMode] = useState(false);
  
  const timeTrackingRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimeUpdateRef = useRef<number>(Date.now());

  // Fetch course data
  const { data: course, isLoading: courseLoading } = useQuery<any>({
    queryKey: ["/api/courses", params.courseId],
    enabled: !!params.courseId,
  });

  // Fetch units with progress
  const { data: progressData, isLoading: progressLoading } = useQuery<CourseProgress>({
    queryKey: ["/api/courses", params.courseId, "units-progress"],
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const res = await fetch(`/api/courses/${params.courseId}/units-progress`, {
        headers,
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 404) throw new Error("Not enrolled");
        throw new Error("Failed to fetch progress");
      }
      return res.json();
    },
    enabled: !!params.courseId,
    refetchInterval: 30000,
  });

  // Get current unit from progress data
  const currentUnit = progressData?.units.find(u => u.id === params.unitId);
  const currentUnitIndex = progressData?.units.findIndex(u => u.id === params.unitId) ?? -1;
  const nextUnit = progressData?.units[currentUnitIndex + 1];

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
            lessonId: activeLesson,
            secondsToAdd: secondsElapsed,
          });
        }
      }, 30000);
      
      return () => {
        if (timeTrackingRef.current) {
          clearInterval(timeTrackingRef.current);
        }
      };
    }
  }, [activeLesson, progressData?.enrollmentId]);

  // Auto-select first incomplete lesson
  useEffect(() => {
    if (currentUnit && !activeLesson && !isQuizMode) {
      const firstIncomplete = currentUnit.lessons.find(l => !l.completed);
      if (firstIncomplete) {
        setActiveLesson(firstIncomplete.id);
      } else if (currentUnit.lessons.length > 0) {
        setActiveLesson(currentUnit.lessons[0].id);
      }
    }
  }, [currentUnit, activeLesson, isQuizMode]);

  const handleCompleteLesson = () => {
    if (activeLesson && currentUnit) {
      const currentLessonIndex = currentUnit.lessons.findIndex(l => l.id === activeLesson);
      const nextLesson = currentUnit.lessons[currentLessonIndex + 1];
      
      completeLessonMutation.mutate(activeLesson, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/courses", params.courseId, "units-progress"] });
          
          if (nextLesson) {
            setActiveLesson(nextLesson.id);
            toast({
              title: "Lesson Completed",
              description: "Great job! Moving to the next lesson.",
            });
          } else {
            // Last lesson complete - auto-start quiz
            setActiveLesson(null);
            setIsQuizMode(true);
            toast({
              title: "All Lessons Complete!",
              description: "Starting the unit quiz...",
            });
          }
        },
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getUnitProgress = () => {
    if (!currentUnit || currentUnit.totalLessons === 0) return 0;
    return Math.round((currentUnit.lessonsCompleted / currentUnit.totalLessons) * 100);
  };

  if (courseLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-48" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!progressData || !currentUnit) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unit Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This unit doesn't exist or you don't have access to it.
            </p>
            <Link href={`/course/${params.courseId}/learn`}>
              <Button>Back to Course</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Security: Prevent access to locked units via direct URL
  if (currentUnit.isLocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unit Locked</h2>
            <p className="text-muted-foreground mb-4">
              Complete the previous unit to unlock this one.
            </p>
            <Link href={`/course/${params.courseId}/learn`}>
              <Button>Back to Course</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeLessonData = currentUnit.lessons.find(l => l.id === activeLesson);
  const allLessonsComplete = currentUnit.lessonsCompleted === currentUnit.totalLessons;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href={`/course/${params.courseId}/learn`}>
                <Button variant="ghost" size="icon" data-testid="button-back-course">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <p className="text-sm text-muted-foreground">Unit {currentUnit.unitNumber}</p>
                <h1 className="font-semibold text-lg line-clamp-1" data-testid="text-unit-title">
                  {currentUnit.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Progress value={getUnitProgress()} className="w-20 h-2" />
              <span className="font-medium">{getUnitProgress()}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Lesson List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Lessons
            </CardTitle>
            <CardDescription>
              {currentUnit.lessonsCompleted} of {currentUnit.totalLessons} completed
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {currentUnit.lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover-elevate ${
                    activeLesson === lesson.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                  }`}
                  onClick={() => {
                    setActiveLesson(lesson.id);
                    setIsQuizMode(false);
                  }}
                  data-testid={`lesson-item-${idx}`}
                >
                  <div className="flex-shrink-0">
                    {lesson.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : activeLesson === lesson.id ? (
                      <PlayCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${lesson.completed ? "text-muted-foreground" : ""}`}>
                      {lesson.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(lesson.timeSpentSeconds)} spent
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Lesson Content */}
        {activeLessonData && !isQuizMode && (
          <LessonViewer
            lesson={activeLessonData}
            unit={currentUnit}
            onComplete={handleCompleteLesson}
            isCompleting={completeLessonMutation.isPending}
          />
        )}

        {/* Quiz Section */}
        {allLessonsComplete && !isQuizMode && (
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-semibold">Ready for the Unit Quiz?</p>
                    <p className="text-sm text-muted-foreground">
                      {currentUnit.quizPassed 
                        ? `Passed with ${currentUnit.quizScore}%` 
                        : "Complete the quiz to unlock the next unit"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsQuizMode(true)}
                  className="gap-2"
                  variant={currentUnit.quizPassed ? "outline" : "default"}
                  data-testid="button-start-quiz"
                >
                  <FileText className="h-4 w-4" />
                  {currentUnit.quizPassed ? "Retake Quiz" : "Start Quiz"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz Mode */}
        {isQuizMode && (
          <UnitQuiz
            unitId={currentUnit.id}
            enrollmentId={progressData.enrollmentId}
            onComplete={() => {
              setIsQuizMode(false);
              queryClient.invalidateQueries({ queryKey: ["/api/courses", params.courseId, "units-progress"] });
              
              // If quiz passed and there's a next unit, offer to continue
              if (nextUnit && !nextUnit.isLocked) {
                toast({
                  title: "Quiz Passed!",
                  description: "Ready to start the next unit.",
                });
              }
            }}
            onCancel={() => setIsQuizMode(false)}
          />
        )}

        {/* Navigation to Next Unit */}
        {currentUnit.quizPassed && nextUnit && !nextUnit.isLocked && (
          <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-semibold">Unit Complete!</p>
                    <p className="text-sm text-muted-foreground">
                      Continue to Unit {nextUnit.unitNumber}: {nextUnit.title}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setLocation(`/course/${params.courseId}/unit/${nextUnit.id}`)}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                  data-testid="button-next-unit"
                >
                  Next Unit
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
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
  const MIN_TIME_SECONDS = 60;
  
  const [localElapsedSeconds, setLocalElapsedSeconds] = useState(lesson.timeSpentSeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    setLocalElapsedSeconds(lesson.timeSpentSeconds);
  }, [lesson.id, lesson.timeSpentSeconds]);
  
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
            <CardDescription>Lesson {lesson.lessonNumber}</CardDescription>
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
      });
      
      if (!res.ok) throw new Error("Failed to complete quiz");
      
      const result = await res.json();
      setQuizResult(result);
      setQuizCompleted(true);
      
      if (result.passed) {
        toast({
          title: "Quiz Passed!",
          description: `You scored ${result.score}%`,
        });
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

  if (quizInfoLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (quizCompleted && quizResult) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          {quizResult.passed ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Quiz Passed!</h2>
              <p className="text-muted-foreground mb-4">
                You scored {quizResult.score}% ({correctCount}/{questions.length} correct)
              </p>
            </>
          ) : (
            <>
              <FileText className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Keep Trying!</h2>
              <p className="text-muted-foreground mb-4">
                You scored {quizResult.score}%. You need {quizInfo?.passingScore || 70}% to pass.
              </p>
            </>
          )}
          <Button onClick={onComplete} data-testid="button-quiz-done">
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!quizStarted) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Unit Quiz</h2>
          <p className="text-muted-foreground mb-6">
            {quizInfo?.totalQuestions || 10} questions • {quizInfo?.passingScore || 70}% to pass
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={onCancel} data-testid="button-quiz-cancel">
              Cancel
            </Button>
            <Button onClick={startQuiz} disabled={isLoading} data-testid="button-quiz-start">
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
            {correctCount} correct
          </Badge>
        </div>
        <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-lg font-medium">{currentQuestion?.questionText}</p>
        
        <div className="space-y-3">
          {currentQuestion?.options?.map((option: string, idx: number) => (
            <div
              key={idx}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedOption === idx
                  ? feedback
                    ? feedback.isCorrect
                      ? "border-green-500 bg-green-50 dark:bg-green-950"
                      : "border-red-500 bg-red-50 dark:bg-red-950"
                    : "border-primary bg-primary/5"
                  : feedback && idx === feedback.correctOption
                    ? "border-green-500 bg-green-50 dark:bg-green-950"
                    : "hover:border-muted-foreground/50"
              }`}
              onClick={() => !feedback && setSelectedOption(idx)}
              data-testid={`quiz-option-${idx}`}
            >
              {option}
            </div>
          ))}
        </div>

        {feedback && (
          <div className={`p-4 rounded-lg ${feedback.isCorrect ? "bg-green-100 dark:bg-green-900/30" : "bg-orange-100 dark:bg-orange-900/30"}`}>
            <p className="font-medium">{feedback.isCorrect ? "Correct!" : "Incorrect"}</p>
            {feedback.explanation && (
              <p className="text-sm mt-1">{feedback.explanation}</p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          {!feedback ? (
            <Button
              onClick={submitAnswer}
              disabled={selectedOption === null || isLoading}
              data-testid="button-submit-answer"
            >
              {isLoading ? "Submitting..." : "Submit Answer"}
            </Button>
          ) : (
            <Button onClick={nextQuestion} data-testid="button-next-question">
              {currentQuestionIndex < questions.length - 1 ? "Next Question" : "See Results"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
