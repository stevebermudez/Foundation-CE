import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import StreamingVideoPlayer from "@/components/StreamingVideoPlayer";
import QuizComponent from "@/components/QuizComponent";
import {
  ArrowLeft,
  Clock,
  Award,
  FileText,
  Timer,
  TimerOff,
  CheckCircle2,
  Circle,
  BookOpen,
  Zap,
} from "lucide-react";
import { Link } from "wouter";

import caRealEstate from "@assets/generated_images/california_luxury_real_estate.png";
import flRealEstate from "@assets/generated_images/florida_beachfront_properties.png";

const mockLessons = [
  {
    id: "1",
    title: "Introduction to Florida Real Estate",
    duration: "45:00",
    completed: false,
  },
  {
    id: "2",
    title: "Real Estate License Law and Qualifications",
    duration: "60:00",
    completed: false,
  },
  {
    id: "3",
    title: "Authorized Relationships, Duties, and Disclosure",
    duration: "75:00",
    completed: false,
  },
  {
    id: "4",
    title: "Real Estate Brokerage Operations and Federal Laws",
    duration: "90:00",
    completed: false,
  },
  {
    id: "5",
    title: "Property Rights, Estates, and Ownership",
    duration: "60:00",
    completed: false,
  },
  {
    id: "6",
    title: "Encumbrances and Title Transfer",
    duration: "75:00",
    completed: false,
  },
  {
    id: "7",
    title: "Real Estate Contracts",
    duration: "90:00",
    completed: false,
  },
  {
    id: "8",
    title: "Residential Purchase and Sale Contract",
    duration: "105:00",
    completed: false,
  },
  {
    id: "9",
    title: "Professional Practices and Listing Presentations",
    duration: "60:00",
    completed: false,
  },
  {
    id: "10",
    title: "Real Estate Financing Principles",
    duration: "75:00",
    completed: false,
  },
  {
    id: "11",
    title: "Mortgage Lending and Loan Types",
    duration: "90:00",
    completed: false,
  },
  {
    id: "12",
    title: "Real Estate Appraisal and Market Analysis",
    duration: "75:00",
    completed: false,
  },
  {
    id: "13",
    title: "Real Estate Market Conditions and Property Analysis",
    duration: "60:00",
    completed: false,
  },
  {
    id: "14",
    title: "Real Estate Mathematics and Calculations",
    duration: "90:00",
    completed: false,
  },
  {
    id: "15",
    title: "Taxes Affecting Real Estate",
    duration: "60:00",
    completed: false,
  },
  {
    id: "16",
    title: "Land Use Controls and Regulations",
    duration: "75:00",
    completed: false,
  },
  {
    id: "17",
    title: "Construction, Building Codes, and Property Insurance",
    duration: "60:00",
    completed: false,
  },
  {
    id: "18",
    title: "Environmental Issues and Disclosures",
    duration: "45:00",
    completed: false,
  },
  {
    id: "19",
    title: "Final Exam Preparation and Review",
    duration: "120:00",
    completed: false,
  },
];
const mockQuestions = [
  {
    id: "1",
    question:
      "What is the primary fiduciary duty owed by a real estate agent to their client?",
    options: [
      "Obedience to all instructions",
      "Loyalty and putting client interests first",
      "Maintaining confidentiality only",
      "Providing accurate market analysis",
    ],
    correctAnswer: 1,
    explanation:
      "The primary fiduciary duty is loyalty, which means putting the client's interests above all others.",
  },
  {
    id: "2",
    question: "When must material facts be disclosed to a buyer?",
    options: [
      "Only when asked directly",
      "After the purchase agreement is signed",
      "As soon as the agent becomes aware of them",
      "Only for properties over $1 million",
    ],
    correctAnswer: 2,
    explanation:
      "Material facts must be disclosed as soon as the agent becomes aware of them.",
  },
  {
    id: "3",
    question:
      "Which of the following is NOT a protected class under fair housing laws?",
    options: ["Race", "Religion", "Income level", "Familial status"],
    correctAnswer: 2,
    explanation:
      "Income level is not a protected class under federal fair housing laws.",
  },
  {
    id: "4",
    question:
      "What is the purpose of the Real Estate Transfer Disclosure Statement?",
    options: [
      "To transfer property title",
      "To disclose known property defects",
      "To calculate property taxes",
      "To verify buyer financing",
    ],
    correctAnswer: 1,
    explanation:
      "The TDS is used to disclose known material facts and defects about the property to buyers.",
  },
  {
    id: "5",
    question:
      "An agent may represent both buyer and seller in the same transaction when:",
    options: [
      "Never - it's always illegal",
      "The broker gives permission",
      "Both parties provide informed written consent",
      "The property value exceeds $500,000",
    ],
    correctAnswer: 2,
    explanation:
      "Dual agency is permitted only when both parties provide informed written consent to the arrangement.",
  },
];

export default function CourseViewPage() {
  const params = useParams<{ id: string }>();
  const [currentLesson, setCurrentLesson] = useState(mockLessons[2]);
  const [activeTab, setActiveTab] = useState("overview");
  const [testMode, setTestMode] = useState<"untimed" | "timed" | false>(false);

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

  // Fetch units and lessons
  const { data: units = [] } = useQuery({
    queryKey: ["/api/courses", params.id, "units"],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${params.id}/units`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!params.id,
  });

  // Fetch enrollment data
  const { data: enrollment } = useQuery({
    queryKey: ["/api/enrollments", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/enrollments/user`, { credentials: "include" });
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

  const handleLessonComplete = () => {
    const updatedLessons = mockLessons.map((l) =>
      l.id === currentLesson.id ? { ...l, completed: true } : l,
    );
    const currentIndex = updatedLessons.findIndex(
      (l) => l.id === currentLesson.id,
    );
    if (currentIndex < updatedLessons.length - 1) {
      setCurrentLesson(updatedLessons[currentIndex + 1]);
    }
    console.log("Lesson completed:", currentLesson.id);
  };

  const handleQuizComplete = (score: number, passed: boolean) => {
    console.log(`Quiz completed - Score: ${score}%, Passed: ${passed}`);
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

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Hours Required
                      </p>
                      <p className="text-2xl font-bold">
                        {course?.hoursRequired}
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-2xl font-bold">
                        ${((course?.price || 0) / 100).toFixed(2)}
                      </p>
                    </div>
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
                        <p className="font-semibold">Enrollment Progress</p>
                        <Badge variant="secondary">
                          {Math.round(
                            (enrollment.hoursCompleted /
                              course?.hoursRequired) *
                              100,
                          )}
                          %
                        </Badge>
                      </div>
                      <Progress
                        value={
                          (enrollment.hoursCompleted / course?.hoursRequired) *
                          100
                        }
                        className="h-2"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        {enrollment.hoursCompleted} of {course?.hoursRequired}{" "}
                        hours completed
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Course Structure */}
              {units.length > 0 && (
                <Card data-testid="card-course-structure">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Course Structure ({units.length} Units)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {units.map((unit: any, idx: number) => (
                        <div
                          key={unit.id || idx}
                          className="p-3 border rounded-lg hover-elevate cursor-pointer"
                          data-testid={`unit-${idx}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1 text-muted-foreground">
                              Unit {unit.unitNumber || idx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{unit.title}</p>
                              {unit.description && (
                                <p className="text-sm text-muted-foreground">
                                  {unit.description}
                                </p>
                              )}
                              <div className="flex gap-2 mt-2 text-xs">
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
              )}

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
            <StreamingVideoPlayer
              courseTitle={courseTitle}
              currentLesson={currentLesson}
              lessons={mockLessons}
              videoUrl="https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4"
              hlsUrl="https://test-streams.mux.dev/x36xhzz/x3lis7z91.m3u8"
              onLessonSelect={(id) => {
                const lesson = mockLessons.find((l) => l.id === id);
                if (lesson) setCurrentLesson(lesson);
              }}
              onComplete={handleLessonComplete}
              onDownloadPdf={() => console.log("Download PDF guide")}
            />
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
            {!testMode ? (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">
                    Choose Your Testing Mode
                  </h2>
                  <p className="text-muted-foreground">
                    Select how you'd like to take the assessment. Both options
                    are compliant with state requirements.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div
                    className="p-6 border rounded-lg cursor-pointer hover-elevate text-center"
                    onClick={() => setTestMode("untimed")}
                    data-testid="button-untimed-mode"
                  >
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                      <TimerOff className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No Timer</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Take the exam at your own pace. No time pressure - review
                      questions as needed.
                    </p>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    >
                      Recommended
                    </Badge>
                  </div>

                  <div
                    className="p-6 border rounded-lg cursor-pointer hover-elevate text-center"
                    onClick={() => setTestMode("timed")}
                    data-testid="button-timed-mode"
                  >
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
                      <Timer className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Timed Exam</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      60 minutes to complete. Traditional testing experience
                      with countdown timer.
                    </p>
                    <Badge variant="outline">60 minute limit</Badge>
                  </div>
                </div>
              </div>
            ) : (
              <QuizComponent
                courseTitle={courseTitle}
                questions={mockQuestions}
                isTimed={testMode === "timed"}
                timeLimit={60}
                passingScore={70}
                onComplete={handleQuizComplete}
                onDownloadCertificate={() =>
                  console.log("Download certificate")
                }
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
