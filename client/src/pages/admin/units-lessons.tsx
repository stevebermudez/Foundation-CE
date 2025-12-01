import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminUnitsLessonsPage({ courseId }: { courseId: string }) {
  const { toast } = useToast();
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);

  const { data: units = [] } = useQuery({
    queryKey: [`/api/admin/courses/${courseId}/units`],
    queryFn: async () => {
      const res = await fetch(`/api/admin/courses/${courseId}/units`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: lessons = {} } = useQuery({
    queryKey: [`/api/admin/units/lessons`, expandedUnit],
    queryFn: async () => {
      if (!expandedUnit) return {};
      const res = await fetch(`/api/admin/units/${expandedUnit}/lessons`);
      if (!res.ok) return {};
      return res.json();
    },
    enabled: !!expandedUnit,
  });

  const createUnitMutation = useMutation({
    mutationFn: async (data: { unitNumber: string; title: string; description: string; hoursRequired: string }) => {
      const res = await fetch(`/api/admin/courses/${courseId}/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          unitNumber: parseInt(data.unitNumber),
          title: data.title,
          description: data.description,
          hoursRequired: parseInt(data.hoursRequired),
        }),
      });
      if (!res.ok) throw new Error("Failed to create unit");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Unit created successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/courses/${courseId}/units`] });
    },
  });

  const deleteUnitMutation = useMutation({
    mutationFn: async (unitId: string) => {
      const res = await fetch(`/api/admin/units/${unitId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete unit");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Unit deleted successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/courses/${courseId}/units`] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Units & Lessons</h3>
        <UnitDialog courseId={courseId} onSuccess={() => {}} />
      </div>

      <div className="space-y-2">
        {units.map((unit: any) => (
          <Card key={unit.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setExpandedUnit(expandedUnit === unit.id ? null : unit.id)}
                  >
                    {expandedUnit === unit.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <div>
                    <h4 className="font-semibold">Unit {unit.unitNumber}: {unit.title}</h4>
                    <p className="text-sm text-muted-foreground">{unit.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge>{unit.hoursRequired} hrs</Badge>
                  <Button size="icon" variant="outline" data-testid={`button-delete-unit-${unit.id}`}>
                    <Trash2 className="h-4 w-4" onClick={() => deleteUnitMutation.mutate(unit.id)} />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedUnit === unit.id && (
              <CardContent className="border-t pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-semibold text-sm">Lessons</h5>
                    <LessonDialog unitId={unit.id} onSuccess={() => {}} />
                  </div>
                  {Array.isArray(lessons[unit.id]) && lessons[unit.id].map((lesson: any) => (
                    <div key={lesson.id} className="p-3 bg-muted rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium">Lesson {lesson.lessonNumber}: {lesson.title}</p>
                        <p className="text-xs text-muted-foreground">{lesson.durationMinutes} minutes</p>
                      </div>
                      <Button size="sm" variant="ghost" data-testid={`button-delete-lesson-${lesson.id}`}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function UnitDialog({ courseId, onSuccess }: { courseId: string; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ unitNumber: "", title: "", description: "", hoursRequired: "3" });
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/courses/${courseId}/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          unitNumber: parseInt(data.unitNumber),
          title: data.title,
          description: data.description,
          hoursRequired: parseInt(data.hoursRequired),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Unit created" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/courses/${courseId}/units`] });
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Unit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Unit</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Unit Number</Label>
            <Input type="number" value={data.unitNumber} onChange={(e) => setData({ ...data, unitNumber: e.target.value })} placeholder="1" />
          </div>
          <div>
            <Label>Title</Label>
            <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} placeholder="Unit title" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} />
          </div>
          <div>
            <Label>Hours Required</Label>
            <Input type="number" value={data.hoursRequired} onChange={(e) => setData({ ...data, hoursRequired: e.target.value })} />
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Unit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LessonDialog({ unitId, onSuccess }: { unitId: string; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ lessonNumber: "", title: "", videoUrl: "", durationMinutes: "15" });
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/units/${unitId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          lessonNumber: parseInt(data.lessonNumber),
          title: data.title,
          videoUrl: data.videoUrl,
          durationMinutes: parseInt(data.durationMinutes),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Lesson created" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/units/lessons`] });
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Plus className="h-3 w-3" />
          Add Lesson
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Lesson</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Lesson Number</Label>
            <Input type="number" value={data.lessonNumber} onChange={(e) => setData({ ...data, lessonNumber: e.target.value })} placeholder="1" />
          </div>
          <div>
            <Label>Title</Label>
            <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} placeholder="Lesson title" />
          </div>
          <div>
            <Label>Video URL</Label>
            <Input value={data.videoUrl} onChange={(e) => setData({ ...data, videoUrl: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <Label>Duration (minutes)</Label>
            <Input type="number" value={data.durationMinutes} onChange={(e) => setData({ ...data, durationMinutes: e.target.value })} />
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Lesson"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
