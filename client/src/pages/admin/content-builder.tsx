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
  videoUrl?: string;
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

  const getAuthHeaders = () => {
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
    mutationFn: async (data: { unitId: string; title: string; videoUrl?: string; durationMinutes?: number }) => {
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
      </div>

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
              />
            ))}
        </div>
      )}

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
    </div>
  );
}

function UnitCard({
  unit,
  lessons,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onOpenMediaLibrary,
}: {
  unit: Unit;
  lessons: Lesson[];
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddLesson: () => void;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  onOpenMediaLibrary: (callback: (url: string) => void) => void;
}) {
  const sortedLessons = lessons.sort((a, b) => a.lessonNumber - b.lessonNumber);

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
  return (
    <div className="flex items-center gap-3 p-3 pl-12 hover:bg-muted/50 transition-colors" data-testid={`row-lesson-${lesson.id}`}>
      <div className="text-muted-foreground cursor-grab">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="p-1.5 bg-secondary/50 rounded">
        {lesson.videoUrl ? (
          <Video className="h-4 w-4 text-primary" />
        ) : (
          <FileText className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium" data-testid={`text-lesson-title-${lesson.id}`}>
          {lesson.lessonNumber}. {lesson.title}
        </span>
        {lesson.durationMinutes && (
          <span className="text-xs text-muted-foreground ml-2">
            ({lesson.durationMinutes} min)
          </span>
        )}
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
  onSubmit: (data: { title: string; videoUrl?: string; durationMinutes?: number }) => void;
  isPending: boolean;
  initialData?: Lesson;
  onOpenMediaLibrary: (callback: (url: string) => void) => void;
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || "");
  const [durationMinutes, setDurationMinutes] = useState(initialData?.durationMinutes?.toString() || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      videoUrl: videoUrl || undefined,
      durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
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
          <div>
            <Label htmlFor="lessonVideo">Video URL</Label>
            <div className="flex gap-2">
              <Input
                id="lessonVideo"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="flex-1"
                data-testid="input-lesson-video"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onOpenMediaLibrary((url) => setVideoUrl(url))}
                data-testid="button-open-media-library"
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
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
          <div className="flex gap-2 justify-end">
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

  const getAuthHeaders = () => {
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
