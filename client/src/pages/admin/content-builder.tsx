import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Video,
  FileText,
  Image as ImageIcon,
  Upload,
  MoreVertical,
  ArrowLeft,
  Layers,
  BookOpen,
  X,
  Check,
  Eye,
  HelpCircle,
  ClipboardList,
  Award,
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  sku: string;
  state: string;
  licenseType: string;
  hoursRequired: number;
  price: number;
}

interface Unit {
  id: string;
  courseId: string;
  unitNumber: number;
  title: string;
  description: string;
  hoursRequired: number;
}

interface Lesson {
  id: string;
  unitId: string;
  lessonNumber: number;
  title: string;
  content?: string;
  videoUrl?: string;
  imageUrl?: string;
  durationMinutes?: number;
}

interface MediaAsset {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  thumbnailUrl?: string;
}

interface QuestionBank {
  id: string;
  courseId: string;
  unitId?: string | null;
  bankType: string;
  title: string;
  description?: string | null;
  questionsPerAttempt?: number | null;
  passingScore?: number | null;
  timeLimit?: number | null;
  isActive?: number | null;
}

interface BankQuestion {
  id: string;
  bankId: string;
  questionText: string;
  questionType?: string | null;
  options: string;
  correctOption: number;
  explanation: string;
  difficulty?: string | null;
  category?: string | null;
  isActive?: number | null;
}

export default function ContentBuilderPage({ courseId }: { courseId?: string }) {
  const { toast } = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(courseId || null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaSelectCallback, setMediaSelectCallback] = useState<((url: string) => void) | null>(null);
  
  // Quiz management state
  const [showQuizManager, setShowQuizManager] = useState<string | null>(null);
  const [showQuestionBankForm, setShowQuestionBankForm] = useState(false);
  const [editingQuestionBank, setEditingQuestionBank] = useState<QuestionBank | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<BankQuestion | null>(null);

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("adminToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const { data: courses = [], isLoading: loadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/admin/courses"],
    queryFn: async () => {
      const res = await fetch("/api/admin/courses", { 
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: units = [], isLoading: loadingUnits } = useQuery<Unit[]>({
    queryKey: ["/api/admin/courses", selectedCourseId, "units"],
    queryFn: async () => {
      if (!selectedCourseId) return [];
      const res = await fetch(`/api/admin/courses/${selectedCourseId}/units`, { 
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedCourseId,
  });

  const { data: allLessons = {}, isLoading: loadingLessons } = useQuery<Record<string, Lesson[]>>({
    queryKey: ["/api/admin/lessons", units.map(u => u.id)],
    queryFn: async () => {
      const lessonsMap: Record<string, Lesson[]> = {};
      await Promise.all(
        units.map(async (unit) => {
          const res = await fetch(`/api/admin/units/${unit.id}/lessons`, { 
            headers: getAuthHeaders(),
            credentials: 'include'
          });
          if (res.ok) {
            lessonsMap[unit.id] = await res.json();
          }
        })
      );
      return lessonsMap;
    },
    enabled: units.length > 0,
  });

  const { data: mediaAssets = [] } = useQuery<MediaAsset[]>({
    queryKey: ["/api/admin/media"],
    queryFn: async () => {
      const res = await fetch("/api/admin/media", { 
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: showMediaLibrary,
  });

  const createUnitMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; hoursRequired: number }) => {
      const existingUnits = units.length;
      const res = await fetch(`/api/admin/courses/${selectedCourseId}/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          unitNumber: existingUnits + 1,
        }),
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to create unit");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Unit created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses", selectedCourseId, "units"] });
      setShowUnitForm(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create unit", variant: "destructive" });
    },
  });

  const updateUnitMutation = useMutation({
    mutationFn: async ({ unitId, data }: { unitId: string; data: Partial<Unit> }) => {
      const res = await fetch(`/api/admin/units/${unitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to update unit");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Unit updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses", selectedCourseId, "units"] });
      setEditingUnit(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update unit", variant: "destructive" });
    },
  });

  const deleteUnitMutation = useMutation({
    mutationFn: async (unitId: string) => {
      const res = await fetch(`/api/admin/units/${unitId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to delete unit");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Unit deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses", selectedCourseId, "units"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete unit", variant: "destructive" });
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: async (data: { unitId: string; title: string; content?: string; videoUrl?: string; imageUrl?: string; durationMinutes?: number }) => {
      const existingLessons = allLessons[data.unitId]?.length || 0;
      const res = await fetch(`/api/admin/units/${data.unitId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          lessonNumber: existingLessons + 1,
        }),
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to create lesson");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Lesson created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lessons", units.map(u => u.id)] });
      setShowLessonForm(false);
      setSelectedUnitId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create lesson", variant: "destructive" });
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: async ({ lessonId, data }: { lessonId: string; data: Partial<Lesson> }) => {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to update lesson");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Lesson updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lessons", units.map(u => u.id)] });
      setEditingLesson(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update lesson", variant: "destructive" });
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to delete lesson");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Lesson deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lessons", units.map(u => u.id)] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete lesson", variant: "destructive" });
    },
  });

  // Question bank queries
  const { data: courseQuestionBanks = [] } = useQuery<QuestionBank[]>({
    queryKey: ["/api/admin/courses", selectedCourseId, "question-banks"],
    queryFn: async () => {
      if (!selectedCourseId) return [];
      const res = await fetch(`/api/admin/courses/${selectedCourseId}/question-banks`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedCourseId,
  });

  const { data: selectedBankQuestions = [] } = useQuery<BankQuestion[]>({
    queryKey: ["/api/admin/question-banks", selectedBankId, "questions"],
    queryFn: async () => {
      if (!selectedBankId) return [];
      const res = await fetch(`/api/admin/question-banks/${selectedBankId}/questions`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedBankId,
  });

  // Question bank mutations
  const createQuestionBankMutation = useMutation({
    mutationFn: async (data: Partial<QuestionBank>) => {
      const res = await fetch("/api/admin/question-banks", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to create question bank");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Question bank created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses", selectedCourseId, "question-banks"] });
      setShowQuestionBankForm(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create question bank", variant: "destructive" });
    },
  });

  const updateQuestionBankMutation = useMutation({
    mutationFn: async ({ bankId, data }: { bankId: string; data: Partial<QuestionBank> }) => {
      const res = await fetch(`/api/admin/question-banks/${bankId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to update question bank");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Question bank updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses", selectedCourseId, "question-banks"] });
      setEditingQuestionBank(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update question bank", variant: "destructive" });
    },
  });

  const deleteQuestionBankMutation = useMutation({
    mutationFn: async (bankId: string) => {
      const res = await fetch(`/api/admin/question-banks/${bankId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to delete question bank");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Question bank deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses", selectedCourseId, "question-banks"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete question bank", variant: "destructive" });
    },
  });

  // Question mutations
  const createQuestionMutation = useMutation({
    mutationFn: async (data: Partial<BankQuestion> & { bankId: string }) => {
      const res = await fetch(`/api/admin/question-banks/${data.bankId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to create question");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Question created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/question-banks", selectedBankId, "questions"] });
      setShowQuestionForm(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create question", variant: "destructive" });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ questionId, data }: { questionId: string; data: Partial<BankQuestion> }) => {
      const res = await fetch(`/api/admin/questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to update question");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Question updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/question-banks", selectedBankId, "questions"] });
      setEditingQuestion(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update question", variant: "destructive" });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const res = await fetch(`/api/admin/questions/${questionId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to delete question");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Question deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/question-banks", selectedBankId, "questions"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete question", variant: "destructive" });
    },
  });

  const getUnitQuestionBanks = (unitId: string) => {
    return courseQuestionBanks.filter(bank => bank.unitId === unitId);
  };

  const getFinalExamBanks = () => {
    return courseQuestionBanks.filter(bank => bank.bankType === "final_exam");
  };

  const toggleUnit = (unitId: string) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId);
    } else {
      newExpanded.add(unitId);
    }
    setExpandedUnits(newExpanded);
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  if (!selectedCourseId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" data-testid="text-content-builder-title">Content Builder</h2>
            <p className="text-muted-foreground mt-1">Select a course to manage its units and lessons</p>
          </div>
        </div>

        {loadingCourses ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No courses available</p>
                <p className="text-sm text-muted-foreground mt-1">Create a course first in the Courses tab</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="cursor-pointer hover-elevate"
                onClick={() => setSelectedCourseId(course.id)}
                data-testid={`card-course-select-${course.id}`}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="outline">{course.state}</Badge>
                    <Badge variant="outline">{course.hoursRequired} hrs</Badge>
                    <Badge variant="secondary">{course.sku}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Layers className="h-4 w-4" />
                    <span>Click to manage units & lessons</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedCourseId(null);
            setSelectedUnitId(null);
            setExpandedUnits(new Set());
          }}
          data-testid="button-back-to-courses"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold" data-testid="text-course-title">{selectedCourse?.title}</h2>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge variant="outline">{selectedCourse?.state}</Badge>
            <Badge variant="outline">{selectedCourse?.hoursRequired} hrs</Badge>
            <Badge variant="secondary">{selectedCourse?.sku}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(`/course/${selectedCourseId}`, '_blank')}
            data-testid="button-preview-course"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="py-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{units.length}</p>
              <p className="text-xs text-muted-foreground">Units</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Object.values(allLessons).flat().length}
              </p>
              <p className="text-xs text-muted-foreground">Lessons</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Object.values(allLessons).flat().filter(l => l.content || l.videoUrl || l.imageUrl).length}
              </p>
              <p className="text-xs text-muted-foreground">With Content</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {Object.values(allLessons).flat().filter(l => l.videoUrl).length}
              </p>
              <p className="text-xs text-muted-foreground">Videos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold">Course Structure</span>
          <span className="text-sm text-muted-foreground">({units.length} units)</span>
        </div>
        <Button onClick={() => setShowUnitForm(true)} className="gap-2" data-testid="button-add-unit">
          <Plus className="h-4 w-4" />
          Add Unit
        </Button>
      </div>

      {loadingUnits ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : units.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No units yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add units to structure your course content</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {units
            .sort((a, b) => a.unitNumber - b.unitNumber)
            .map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                lessons={allLessons[unit.id] || []}
                questionBanks={getUnitQuestionBanks(unit.id)}
                isExpanded={expandedUnits.has(unit.id)}
                onToggle={() => toggleUnit(unit.id)}
                onEdit={() => setEditingUnit(unit)}
                onDelete={() => deleteUnitMutation.mutate(unit.id)}
                onAddLesson={() => {
                  setSelectedUnitId(unit.id);
                  setShowLessonForm(true);
                }}
                onEditLesson={(lesson) => setEditingLesson(lesson)}
                onDeleteLesson={(lessonId) => deleteLessonMutation.mutate(lessonId)}
                onOpenMediaLibrary={(callback) => {
                  setMediaSelectCallback(() => callback);
                  setShowMediaLibrary(true);
                }}
                onManageQuiz={() => setShowQuizManager(unit.id)}
                onAddQuestionBank={() => {
                  setSelectedUnitId(unit.id);
                  setShowQuestionBankForm(true);
                }}
                onEditQuestionBank={(bank) => setEditingQuestionBank(bank)}
                onDeleteQuestionBank={(bankId) => deleteQuestionBankMutation.mutate(bankId)}
                onManageQuestions={(bankId) => setSelectedBankId(bankId)}
              />
            ))}
        </div>
      )}

      {/* Course Final Exam Section */}
      <Card className="mt-6 border-amber-200 dark:border-amber-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-lg">Course Final Exam</CardTitle>
            </div>
            <Button 
              size="sm" 
              className="gap-1"
              onClick={() => {
                setSelectedUnitId(null);
                setShowQuestionBankForm(true);
              }}
              data-testid="button-add-final-exam"
            >
              <Plus className="h-3 w-3" />
              Add Final Exam
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {getFinalExamBanks().length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No final exam configured</p>
              <p className="text-xs mt-1">Add a final exam question bank to enable end-of-course assessment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getFinalExamBanks().map((bank) => (
                <div 
                  key={bank.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  data-testid={`card-final-exam-${bank.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{bank.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {bank.questionsPerAttempt} questions
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {bank.passingScore}% to pass
                      </Badge>
                      {bank.timeLimit && (
                        <Badge variant="outline" className="text-xs">
                          {bank.timeLimit} min limit
                        </Badge>
                      )}
                    </div>
                    {bank.description && (
                      <p className="text-sm text-muted-foreground mt-1">{bank.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setSelectedBankId(bank.id)}
                      data-testid={`button-manage-questions-${bank.id}`}
                    >
                      Manage Questions
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setEditingQuestionBank(bank)}
                      data-testid={`button-edit-bank-${bank.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => deleteQuestionBankMutation.mutate(bank.id)}
                      data-testid={`button-delete-bank-${bank.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <UnitFormDialog
        open={showUnitForm}
        onClose={() => setShowUnitForm(false)}
        onSubmit={(data) => createUnitMutation.mutate(data)}
        isPending={createUnitMutation.isPending}
      />

      {editingUnit && (
        <UnitFormDialog
          open={true}
          onClose={() => setEditingUnit(null)}
          onSubmit={(data) => updateUnitMutation.mutate({ unitId: editingUnit.id, data })}
          isPending={updateUnitMutation.isPending}
          initialData={editingUnit}
        />
      )}

      <LessonFormDialog
        open={showLessonForm}
        onClose={() => {
          setShowLessonForm(false);
          setSelectedUnitId(null);
        }}
        onSubmit={(data) => createLessonMutation.mutate({ ...data, unitId: selectedUnitId! })}
        isPending={createLessonMutation.isPending}
        onOpenMediaLibrary={(callback) => {
          setMediaSelectCallback(() => callback);
          setShowMediaLibrary(true);
        }}
      />

      {editingLesson && (
        <LessonFormDialog
          open={true}
          onClose={() => setEditingLesson(null)}
          onSubmit={(data) => updateLessonMutation.mutate({ lessonId: editingLesson.id, data })}
          isPending={updateLessonMutation.isPending}
          initialData={editingLesson}
          onOpenMediaLibrary={(callback) => {
            setMediaSelectCallback(() => callback);
            setShowMediaLibrary(true);
          }}
        />
      )}

      <MediaLibraryDialog
        open={showMediaLibrary}
        onClose={() => {
          setShowMediaLibrary(false);
          setMediaSelectCallback(null);
        }}
        onSelect={(url) => {
          if (mediaSelectCallback) {
            mediaSelectCallback(url);
          }
          setShowMediaLibrary(false);
          setMediaSelectCallback(null);
        }}
        mediaAssets={mediaAssets}
      />

      {/* Question Bank Form Dialog */}
      <QuestionBankFormDialog
        open={showQuestionBankForm}
        onClose={() => {
          setShowQuestionBankForm(false);
          setSelectedUnitId(null);
        }}
        onSubmit={(data) => createQuestionBankMutation.mutate(data)}
        isPending={createQuestionBankMutation.isPending}
        courseId={selectedCourseId!}
        unitId={selectedUnitId}
      />

      {/* Edit Question Bank Dialog */}
      {editingQuestionBank && (
        <QuestionBankFormDialog
          open={true}
          onClose={() => setEditingQuestionBank(null)}
          onSubmit={(data) => updateQuestionBankMutation.mutate({ bankId: editingQuestionBank.id, data })}
          isPending={updateQuestionBankMutation.isPending}
          initialData={editingQuestionBank}
          courseId={selectedCourseId!}
          unitId={editingQuestionBank.unitId}
        />
      )}

      {/* Question Manager Dialog */}
      {selectedBankId && (
        <QuestionManagerDialog
          open={true}
          onClose={() => setSelectedBankId(null)}
          bankId={selectedBankId}
          questions={selectedBankQuestions}
          onAddQuestion={() => setShowQuestionForm(true)}
          onEditQuestion={(question) => setEditingQuestion(question)}
          onDeleteQuestion={(questionId) => deleteQuestionMutation.mutate(questionId)}
        />
      )}

      {/* Question Form Dialog */}
      <QuestionFormDialog
        open={showQuestionForm}
        onClose={() => setShowQuestionForm(false)}
        onSubmit={(data) => createQuestionMutation.mutate(data)}
        isPending={createQuestionMutation.isPending}
        bankId={selectedBankId!}
      />

      {/* Edit Question Dialog */}
      {editingQuestion && (
        <QuestionFormDialog
          open={true}
          onClose={() => setEditingQuestion(null)}
          onSubmit={(data) => updateQuestionMutation.mutate({ questionId: editingQuestion.id, data })}
          isPending={updateQuestionMutation.isPending}
          initialData={editingQuestion}
          bankId={editingQuestion.bankId}
        />
      )}
    </div>
  );
}

function UnitCard({
  unit,
  lessons,
  questionBanks,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onOpenMediaLibrary,
  onManageQuiz,
  onAddQuestionBank,
  onEditQuestionBank,
  onDeleteQuestionBank,
  onManageQuestions,
}: {
  unit: Unit;
  lessons: Lesson[];
  questionBanks: QuestionBank[];
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddLesson: () => void;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  onOpenMediaLibrary: (callback: (url: string) => void) => void;
  onManageQuiz: () => void;
  onAddQuestionBank: () => void;
  onEditQuestionBank: (bank: QuestionBank) => void;
  onDeleteQuestionBank: (bankId: string) => void;
  onManageQuestions: (bankId: string) => void;
}) {
  const sortedLessons = lessons.sort((a, b) => a.lessonNumber - b.lessonNumber);
  const [showQuizSection, setShowQuizSection] = useState(false);

  return (
    <Card className="overflow-hidden" data-testid={`card-unit-${unit.id}`}>
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="text-muted-foreground cursor-grab" data-testid={`grip-unit-${unit.id}`}>
          <GripVertical className="h-5 w-5" />
        </div>
        <div className="p-2 bg-primary/10 rounded-md">
          <span className="text-sm font-bold text-primary">#{unit.unitNumber}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold" data-testid={`text-unit-title-${unit.id}`}>{unit.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{unit.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {lessons.length} lessons
          </Badge>
          <Badge variant="outline" className="text-xs">
            {unit.hoursRequired} hrs
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button size="icon" variant="ghost" data-testid={`button-unit-menu-${unit.id}`}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddLesson(); }} data-testid={`menu-add-lesson-${unit.id}`}>
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }} data-testid={`menu-edit-unit-${unit.id}`}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Unit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-destructive"
                data-testid={`menu-delete-unit-${unit.id}`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Unit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="text-muted-foreground">
            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t bg-muted/30">
          {/* Lessons Section */}
          {sortedLessons.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No lessons yet.{" "}
              <button onClick={onAddLesson} className="text-primary hover:underline" data-testid={`button-add-first-lesson-${unit.id}`}>
                Add the first lesson
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {sortedLessons.map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  onEdit={() => onEditLesson(lesson)}
                  onDelete={() => onDeleteLesson(lesson.id)}
                />
              ))}
              <div className="p-2 flex justify-center">
                <Button size="sm" variant="ghost" className="gap-2" onClick={onAddLesson} data-testid={`button-add-more-lesson-${unit.id}`}>
                  <Plus className="h-4 w-4" />
                  Add Lesson
                </Button>
              </div>
            </div>
          )}

          {/* Quiz Section */}
          <div className="border-t">
            <div 
              className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 cursor-pointer hover:bg-muted/50"
              onClick={() => setShowQuizSection(!showQuizSection)}
            >
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="font-medium text-sm">Unit Quiz</span>
                <Badge variant="outline" className="text-xs">
                  {questionBanks.length} {questionBanks.length === 1 ? 'bank' : 'banks'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={(e) => { e.stopPropagation(); onAddQuestionBank(); }}
                  data-testid={`button-add-question-bank-${unit.id}`}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Question Bank
                </Button>
                {showQuizSection ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
            </div>

            {showQuizSection && (
              <div className="p-3 space-y-2 bg-muted/20">
                {questionBanks.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No question banks yet</p>
                    <p className="text-xs mt-1">Create a question bank to add quiz questions for this unit</p>
                  </div>
                ) : (
                  questionBanks.map((bank) => (
                    <div 
                      key={bank.id} 
                      className="flex items-center justify-between p-3 bg-background rounded-lg border"
                      data-testid={`question-bank-${bank.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{bank.title}</span>
                          <Badge variant="secondary" className="text-xs">
                            {bank.questionsPerAttempt} questions
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {bank.passingScore}% to pass
                          </Badge>
                        </div>
                        {bank.description && (
                          <p className="text-xs text-muted-foreground mt-1">{bank.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onManageQuestions(bank.id)}
                          data-testid={`button-manage-questions-${bank.id}`}
                        >
                          <HelpCircle className="h-4 w-4 mr-1" />
                          Questions
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => onEditQuestionBank(bank)}
                          data-testid={`button-edit-bank-${bank.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => onDeleteQuestionBank(bank.id)}
                          data-testid={`button-delete-bank-${bank.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function LessonRow({
  lesson,
  onEdit,
  onDelete,
}: {
  lesson: Lesson;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const hasContent = !!lesson.content;
  const hasVideo = !!lesson.videoUrl;
  const hasImage = !!lesson.imageUrl;
  const isComplete = hasContent || hasVideo || hasImage;

  return (
    <div className="flex items-center gap-3 p-3 pl-12 hover:bg-muted/50 transition-colors" data-testid={`row-lesson-${lesson.id}`}>
      <div className="text-muted-foreground cursor-grab">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className={`p-1.5 rounded ${isComplete ? 'bg-green-100 dark:bg-green-900/30' : 'bg-secondary/50'}`}>
        {hasVideo ? (
          <Video className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : hasContent ? (
          <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <FileText className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" data-testid={`text-lesson-title-${lesson.id}`}>
            {lesson.lessonNumber}. {lesson.title}
          </span>
          {lesson.durationMinutes && (
            <span className="text-xs text-muted-foreground">
              ({lesson.durationMinutes} min)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {hasContent && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
              Text
            </span>
          )}
          {hasVideo && (
            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded">
              Video
            </span>
          )}
          {hasImage && (
            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">
              Image
            </span>
          )}
          {!isComplete && (
            <span className="text-xs text-muted-foreground italic">
              No content yet
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" onClick={onEdit} data-testid={`button-edit-lesson-${lesson.id}`}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onDelete} data-testid={`button-delete-lesson-${lesson.id}`}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

function UnitFormDialog({
  open,
  onClose,
  onSubmit,
  isPending,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; hoursRequired: number }) => void;
  isPending: boolean;
  initialData?: Unit;
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [hoursRequired, setHoursRequired] = useState(initialData?.hoursRequired?.toString() || "1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      hoursRequired: parseInt(hoursRequired) || 1,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Unit" : "Add New Unit"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="unitTitle">Unit Title *</Label>
            <Input
              id="unitTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Introduction to Real Estate Law"
              required
              data-testid="input-unit-title"
            />
          </div>
          <div>
            <Label htmlFor="unitDescription">Description</Label>
            <Textarea
              id="unitDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this unit's content"
              rows={3}
              data-testid="input-unit-description"
            />
          </div>
          <div>
            <Label htmlFor="unitHours">Hours Required</Label>
            <Input
              id="unitHours"
              type="number"
              min="0.5"
              step="0.5"
              value={hoursRequired}
              onChange={(e) => setHoursRequired(e.target.value)}
              data-testid="input-unit-hours"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-unit">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()} data-testid="button-save-unit">
              {isPending ? "Saving..." : "Save Unit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LessonFormDialog({
  open,
  onClose,
  onSubmit,
  isPending,
  initialData,
  onOpenMediaLibrary,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content?: string; videoUrl?: string; imageUrl?: string; durationMinutes?: number }) => void;
  isPending: boolean;
  initialData?: Lesson;
  onOpenMediaLibrary: (callback: (url: string) => void) => void;
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [durationMinutes, setDurationMinutes] = useState(initialData?.durationMinutes?.toString() || "");
  const [activeTab, setActiveTab] = useState<"content" | "media">("content");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      content: content || undefined,
      videoUrl: videoUrl || undefined,
      imageUrl: imageUrl || undefined,
      durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
    });
  };

  const isYouTubeUrl = (url: string) => url.includes("youtube.com") || url.includes("youtu.be");
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Lesson" : "Add New Lesson"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="lessonTitle">Lesson Title *</Label>
            <Input
              id="lessonTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Understanding Property Rights"
              required
              data-testid="input-lesson-title"
            />
          </div>

          <div className="flex gap-2 border-b">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "content" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("content")}
              data-testid="tab-lesson-content"
            >
              Content
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "media" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("media")}
              data-testid="tab-lesson-media"
            >
              Media
            </button>
          </div>

          {activeTab === "content" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="lessonContent">Lesson Content</Label>
                <Textarea
                  id="lessonContent"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter lesson content here. You can use basic formatting like paragraphs and lists."
                  rows={10}
                  className="font-mono text-sm"
                  data-testid="input-lesson-content"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tip: Use blank lines between paragraphs for formatting
                </p>
              </div>
            </div>
          )}

          {activeTab === "media" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="lessonVideo">Video URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="lessonVideo"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or direct video URL"
                    className="flex-1"
                    data-testid="input-lesson-video"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => onOpenMediaLibrary((url) => setVideoUrl(url))}
                    data-testid="button-open-video-library"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {videoUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border bg-muted">
                    {isYouTubeUrl(videoUrl) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(videoUrl) || undefined}
                        className="w-full aspect-video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Video preview"
                      />
                    ) : (
                      <video
                        src={videoUrl}
                        controls
                        className="w-full aspect-video"
                      >
                        Your browser does not support video playback
                      </video>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="lessonImage">Featured Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="lessonImage"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1"
                    data-testid="input-lesson-image"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => onOpenMediaLibrary((url) => setImageUrl(url))}
                    data-testid="button-open-image-library"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {imageUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border">
                    <img
                      src={imageUrl}
                      alt="Featured image preview"
                      className="w-full max-h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="lessonDuration">Duration (minutes)</Label>
                <Input
                  id="lessonDuration"
                  type="number"
                  min="1"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="e.g., 15"
                  data-testid="input-lesson-duration"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-lesson">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()} data-testid="button-save-lesson">
              {isPending ? "Saving..." : "Save Lesson"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MediaLibraryDialog({
  open,
  onClose,
  onSelect,
  mediaAssets,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  mediaAssets: MediaAsset[];
}) {
  const [filter, setFilter] = useState<string>("all");
  const [externalUrl, setExternalUrl] = useState("");
  const { toast } = useToast();

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("adminToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const uploadMutation = useMutation({
    mutationFn: async (data: { fileName: string; fileUrl: string; fileType: string; mimeType: string }) => {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to save media");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Success", description: "Media added to library" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
      onSelect(data.fileUrl);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save media", variant: "destructive" });
    },
  });

  const filteredAssets = mediaAssets.filter((asset) => {
    if (filter === "all") return true;
    return asset.fileType === filter;
  });

  const handleAddExternalUrl = () => {
    if (!externalUrl.trim()) return;

    const isVideo = externalUrl.match(/\.(mp4|webm|mov|avi)$/i) || externalUrl.includes("youtube") || externalUrl.includes("vimeo");
    const isImage = externalUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);

    uploadMutation.mutate({
      fileName: externalUrl.split("/").pop() || "external-media",
      fileUrl: externalUrl,
      fileType: isVideo ? "video" : isImage ? "image" : "document",
      mimeType: isVideo ? "video/mp4" : isImage ? "image/jpeg" : "application/octet-stream",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Paste external URL (video, image)..."
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                data-testid="input-external-url"
              />
            </div>
            <Button
              onClick={handleAddExternalUrl}
              disabled={!externalUrl.trim() || uploadMutation.isPending}
              data-testid="button-add-external-url"
            >
              {uploadMutation.isPending ? "Adding..." : "Add URL"}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              data-testid="button-filter-all"
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filter === "video" ? "default" : "outline"}
              onClick={() => setFilter("video")}
              data-testid="button-filter-video"
            >
              <Video className="h-4 w-4 mr-1" />
              Videos
            </Button>
            <Button
              size="sm"
              variant={filter === "image" ? "default" : "outline"}
              onClick={() => setFilter("image")}
              data-testid="button-filter-image"
            >
              <ImageIcon className="h-4 w-4 mr-1" />
              Images
            </Button>
          </div>

          <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
            {filteredAssets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No media files yet</p>
                <p className="text-sm mt-1">Add external URLs or upload files to build your library</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="group relative border rounded-lg overflow-hidden cursor-pointer hover-elevate"
                    onClick={() => onSelect(asset.fileUrl)}
                    data-testid={`media-asset-${asset.id}`}
                  >
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      {asset.fileType === "image" && asset.thumbnailUrl ? (
                        <img
                          src={asset.thumbnailUrl || asset.fileUrl}
                          alt={asset.fileName}
                          className="w-full h-full object-cover"
                        />
                      ) : asset.fileType === "video" ? (
                        <Video className="h-8 w-8 text-muted-foreground" />
                      ) : (
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs truncate">{asset.fileName}</p>
                    </div>
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose} data-testid="button-close-media-library">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Question Bank Form Dialog
function QuestionBankFormDialog({
  open,
  onClose,
  onSubmit,
  isPending,
  initialData,
  courseId,
  unitId,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<QuestionBank>) => void;
  isPending: boolean;
  initialData?: QuestionBank;
  courseId: string;
  unitId?: string | null;
}) {
  const defaultBankType = initialData?.bankType || (unitId ? "unit_quiz" : "final_exam");
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [questionsPerAttempt, setQuestionsPerAttempt] = useState(initialData?.questionsPerAttempt?.toString() || "10");
  const [passingScore, setPassingScore] = useState(initialData?.passingScore?.toString() || "70");
  const [timeLimit, setTimeLimit] = useState(initialData?.timeLimit?.toString() || "");
  const [bankType, setBankType] = useState(defaultBankType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      courseId,
      unitId: unitId || null,
      bankType,
      title,
      description: description || null,
      questionsPerAttempt: parseInt(questionsPerAttempt) || 10,
      passingScore: parseInt(passingScore) || 70,
      timeLimit: timeLimit ? parseInt(timeLimit) : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Question Bank" : "Create Question Bank"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="bankTitle">Title *</Label>
            <Input
              id="bankTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Unit 1 Quiz"
              required
              data-testid="input-bank-title"
            />
          </div>
          <div>
            <Label htmlFor="bankDescription">Description</Label>
            <Textarea
              id="bankDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this question bank"
              rows={2}
              data-testid="input-bank-description"
            />
          </div>
          <div>
            <Label htmlFor="bankType">Bank Type</Label>
            <Select value={bankType} onValueChange={setBankType}>
              <SelectTrigger data-testid="select-bank-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unit_quiz">Unit Quiz</SelectItem>
                <SelectItem value="final_exam">Final Exam</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="questionsPerAttempt">Questions per Attempt</Label>
              <Input
                id="questionsPerAttempt"
                type="number"
                min="1"
                value={questionsPerAttempt}
                onChange={(e) => setQuestionsPerAttempt(e.target.value)}
                data-testid="input-questions-per-attempt"
              />
            </div>
            <div>
              <Label htmlFor="passingScore">Passing Score (%)</Label>
              <Input
                id="passingScore"
                type="number"
                min="0"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                data-testid="input-passing-score"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="timeLimit">Time Limit (minutes, optional)</Label>
            <Input
              id="timeLimit"
              type="number"
              min="1"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              placeholder="Leave empty for no limit"
              data-testid="input-time-limit"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-bank">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()} data-testid="button-save-bank">
              {isPending ? "Saving..." : "Save Question Bank"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Question Form Dialog
function QuestionFormDialog({
  open,
  onClose,
  onSubmit,
  isPending,
  initialData,
  bankId,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<BankQuestion> & { bankId: string }) => void;
  isPending: boolean;
  initialData?: BankQuestion;
  bankId: string;
}) {
  const [questionText, setQuestionText] = useState(initialData?.questionText || "");
  const [questionType, setQuestionType] = useState(initialData?.questionType || "multiple_choice");
  const [options, setOptions] = useState<string[]>(() => {
    if (initialData?.options) {
      try {
        return JSON.parse(initialData.options);
      } catch {
        return ["", "", "", ""];
      }
    }
    return ["", "", "", ""];
  });
  const [correctOption, setCorrectOption] = useState(initialData?.correctOption?.toString() || "0");
  const [explanation, setExplanation] = useState(initialData?.explanation || "");
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "medium");
  const [category, setCategory] = useState(initialData?.category || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      bankId,
      questionText,
      questionType,
      options: JSON.stringify(options.filter(o => o.trim() !== "")),
      correctOption: parseInt(correctOption),
      explanation,
      difficulty,
      category: category || null,
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (parseInt(correctOption) >= index && parseInt(correctOption) > 0) {
        setCorrectOption((parseInt(correctOption) - 1).toString());
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Question" : "Add Question"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="questionText">Question Text *</Label>
            <Textarea
              id="questionText"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter your question here..."
              rows={3}
              required
              data-testid="input-question-text"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="questionType">Question Type</Label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger data-testid="select-question-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger data-testid="select-difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Answer Options</Label>
            <div className="space-y-2 mt-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={parseInt(correctOption) === index}
                    onChange={() => setCorrectOption(index.toString())}
                    className="h-4 w-4"
                    data-testid={`radio-correct-option-${index}`}
                  />
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1"
                    data-testid={`input-option-${index}`}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeOption(index)}
                      data-testid={`button-remove-option-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addOption}
              className="mt-2"
              data-testid="button-add-option"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Option
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Select the radio button next to the correct answer
            </p>
          </div>

          <div>
            <Label htmlFor="explanation">Explanation *</Label>
            <Textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why the correct answer is right..."
              rows={3}
              required
              data-testid="input-explanation"
            />
          </div>

          <div>
            <Label htmlFor="category">Category (optional)</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Agency Law, Property Rights"
              data-testid="input-category"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-question">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !questionText.trim() || !explanation.trim()} 
              data-testid="button-save-question"
            >
              {isPending ? "Saving..." : "Save Question"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Question Manager Dialog (to view/edit questions in a bank)
function QuestionManagerDialog({
  open,
  onClose,
  bankId,
  questions,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
}: {
  open: boolean;
  onClose: () => void;
  bankId: string;
  questions: BankQuestion[];
  onAddQuestion: () => void;
  onEditQuestion: (question: BankQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Manage Questions
            <Badge variant="secondary">{questions.length} questions</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={onAddQuestion} data-testid="button-add-question">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          <div className="border rounded-lg max-h-[50vh] overflow-y-auto">
            {questions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No questions yet</p>
                <p className="text-sm mt-1">Add questions to this bank</p>
              </div>
            ) : (
              <div className="divide-y">
                {questions.map((question, index) => {
                  let parsedOptions: string[] = [];
                  try {
                    parsedOptions = JSON.parse(question.options);
                  } catch {
                    parsedOptions = [];
                  }
                  return (
                    <div key={question.id} className="p-4 hover:bg-muted/50" data-testid={`question-row-${question.id}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">Q{index + 1}</Badge>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                question.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                question.difficulty === 'hard' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                ''
                              }`}
                            >
                              {question.difficulty}
                            </Badge>
                            {question.category && (
                              <Badge variant="outline" className="text-xs">{question.category}</Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium mb-2">{question.questionText}</p>
                          <div className="space-y-1">
                            {parsedOptions.map((opt, optIndex) => (
                              <div 
                                key={optIndex}
                                className={`text-xs px-2 py-1 rounded ${
                                  optIndex === question.correctOption 
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {String.fromCharCode(65 + optIndex)}. {opt}
                                {optIndex === question.correctOption && (
                                  <Check className="h-3 w-3 inline ml-1" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => onEditQuestion(question)}
                            data-testid={`button-edit-question-${question.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => onDeleteQuestion(question.id)}
                            data-testid={`button-delete-question-${question.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose} data-testid="button-close-question-manager">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
