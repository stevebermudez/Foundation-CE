import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Loader2, 
  Book, 
  Clock, 
  FileText, 
  Check,
  ChevronDown,
  ChevronRight
} from "lucide-react";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("adminToken");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

interface GeneratedLesson {
  lessonNumber: number;
  title: string;
  description: string;
  durationMinutes: number;
  keyTopics: string[];
}

interface GeneratedUnit {
  unitNumber: number;
  title: string;
  description: string;
  hoursRequired: number;
  lessons: GeneratedLesson[];
}

interface GeneratedOutline {
  title: string;
  description: string;
  units: GeneratedUnit[];
  totalHours: number;
}

interface AICourseGeneratorProps {
  courseId?: string;
  onOutlineApplied?: () => void;
}

export function AICourseGenerator({ courseId, onOutlineApplied }: AICourseGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hoursRequired, setHoursRequired] = useState(14);
  const [state, setState] = useState("FL");
  const [licenseType, setLicenseType] = useState("Sales Associate");
  const [targetAudience, setTargetAudience] = useState("Real estate professionals seeking continuing education");
  const [learningObjectives, setLearningObjectives] = useState("");
  const [generatedOutline, setGeneratedOutline] = useState<GeneratedOutline | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<number[]>([]);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const objectives = learningObjectives.split("\n").filter(o => o.trim());
      const res = await fetch("/api/admin/ai/generate-course-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({
          title,
          description,
          hoursRequired,
          targetAudience,
          learningObjectives: objectives.length > 0 ? objectives : undefined,
          state,
          licenseType,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate outline");
      return res.json() as Promise<GeneratedOutline>;
    },
    onSuccess: (data) => {
      setGeneratedOutline(data);
      setExpandedUnits([1]);
      toast({ title: "Success", description: "Course outline generated successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate course outline", variant: "destructive" });
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!courseId || !generatedOutline) throw new Error("Missing data");
      const res = await fetch("/api/admin/ai/apply-course-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({ courseId, outline: generatedOutline }),
      });
      if (!res.ok) throw new Error("Failed to apply outline");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Course outline applied! Units and lessons created." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses", courseId, "units"] });
      setIsOpen(false);
      setGeneratedOutline(null);
      onOutlineApplied?.();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to apply course outline", variant: "destructive" });
    },
  });

  const toggleUnit = (unitNumber: number) => {
    setExpandedUnits(prev => 
      prev.includes(unitNumber) 
        ? prev.filter(u => u !== unitNumber) 
        : [...prev, unitNumber]
    );
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2" data-testid="button-ai-generate">
        <Sparkles className="w-4 h-4" />
        Generate with AI
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Course Outline Generator
            </DialogTitle>
            <DialogDescription>
              Generate a complete course structure with units and lessons using AI. Uses Replit AI Integrations (charges apply to your credits).
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            {!generatedOutline ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Course Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Florida Real Estate Law Update"
                      data-testid="input-ai-title"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief course description..."
                      rows={2}
                      data-testid="input-ai-description"
                    />
                  </div>

                  <div>
                    <Label>Hours Required</Label>
                    <Input
                      type="number"
                      value={hoursRequired}
                      onChange={(e) => setHoursRequired(parseInt(e.target.value) || 14)}
                      min={1}
                      max={100}
                      data-testid="input-ai-hours"
                    />
                  </div>

                  <div>
                    <Label>State</Label>
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger data-testid="select-ai-state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FL">Florida</SelectItem>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>License Type</Label>
                    <Select value={licenseType} onValueChange={setLicenseType}>
                      <SelectTrigger data-testid="select-ai-license">
                        <SelectValue placeholder="Select license type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sales Associate">Sales Associate</SelectItem>
                        <SelectItem value="Broker">Broker</SelectItem>
                        <SelectItem value="Sales Associate & Broker">Sales Associate & Broker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Target Audience</Label>
                    <Input
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="Who is this course for?"
                      data-testid="input-ai-audience"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Learning Objectives (one per line)</Label>
                    <Textarea
                      value={learningObjectives}
                      onChange={(e) => setLearningObjectives(e.target.value)}
                      placeholder="Understand Florida real estate law updates&#10;Apply new regulations to daily practice&#10;Identify compliance requirements"
                      rows={3}
                      data-testid="input-ai-objectives"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => generateMutation.mutate()} 
                    disabled={!title || generateMutation.isPending}
                    data-testid="button-generate-outline"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Outline
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{generatedOutline.title}</CardTitle>
                    <CardDescription>{generatedOutline.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Book className="w-4 h-4" />
                        {generatedOutline.units.length} Units
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {generatedOutline.units.reduce((sum, u) => sum + u.lessons.length, 0)} Lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {generatedOutline.totalHours} Hours
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  {generatedOutline.units.map((unit) => (
                    <Card key={unit.unitNumber} className="overflow-hidden">
                      <div 
                        className="flex items-center justify-between p-4 cursor-pointer hover-elevate"
                        onClick={() => toggleUnit(unit.unitNumber)}
                        data-testid={`unit-header-${unit.unitNumber}`}
                      >
                        <div className="flex items-center gap-3">
                          {expandedUnits.includes(unit.unitNumber) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          <div>
                            <h4 className="font-medium">
                              Unit {unit.unitNumber}: {unit.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">{unit.description}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{unit.hoursRequired}h</Badge>
                      </div>
                      
                      {expandedUnits.includes(unit.unitNumber) && (
                        <div className="border-t bg-muted/30 p-4 space-y-2">
                          {unit.lessons.map((lesson) => (
                            <div key={lesson.lessonNumber} className="flex items-start gap-3 p-2 rounded-md bg-background">
                              <div className="flex-1">
                                <h5 className="font-medium text-sm">
                                  Lesson {lesson.lessonNumber}: {lesson.title}
                                </h5>
                                <p className="text-xs text-muted-foreground">{lesson.description}</p>
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {lesson.keyTopics.slice(0, 3).map((topic, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {lesson.durationMinutes}m
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>

                <div className="flex justify-between gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setGeneratedOutline(null)}>
                    Regenerate
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => applyMutation.mutate()} 
                      disabled={!courseId || applyMutation.isPending}
                      data-testid="button-apply-outline"
                    >
                      {applyMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Apply Outline
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface AILessonGeneratorProps {
  lessonId: string;
  lessonTitle: string;
  unitTitle?: string;
  courseTitle?: string;
  onContentApplied?: () => void;
}

export function AILessonContentGenerator({ 
  lessonId, 
  lessonTitle, 
  unitTitle, 
  courseTitle, 
  onContentApplied 
}: AILessonGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [keyTopics, setKeyTopics] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [lessonDescription, setLessonDescription] = useState("");
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const topics = keyTopics.split(",").map(t => t.trim()).filter(t => t);
      if (topics.length === 0) throw new Error("At least one topic required");
      
      const res = await fetch("/api/admin/ai/generate-lesson-content", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({
          lessonTitle,
          lessonDescription: lessonDescription || lessonTitle,
          unitTitle,
          courseTitle,
          keyTopics: topics,
          targetDurationMinutes: durationMinutes,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate content");
      return res.json();
    },
    onSuccess: async (data) => {
      const applyRes = await fetch("/api/admin/ai/apply-lesson-content", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({ lessonId, blocks: data.blocks }),
      });
      
      if (!applyRes.ok) throw new Error("Failed to apply content");
      
      toast({ title: "Success", description: "Lesson content generated and applied!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lessons", lessonId, "blocks"] });
      setIsOpen(false);
      onContentApplied?.();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate lesson content", variant: "destructive" });
    },
  });

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setIsOpen(true)} className="gap-1" data-testid="button-ai-lesson">
        <Sparkles className="w-3 h-3" />
        AI Generate
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Generate Lesson Content
            </DialogTitle>
            <DialogDescription>
              Create educational content blocks for "{lessonTitle}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Key Topics (comma separated)</Label>
              <Input
                value={keyTopics}
                onChange={(e) => setKeyTopics(e.target.value)}
                placeholder="Real estate contracts, Property disclosure, Closing procedures"
                data-testid="input-lesson-topics"
              />
            </div>

            <div>
              <Label>Lesson Description (optional)</Label>
              <Textarea
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                placeholder="Brief description of what this lesson covers..."
                rows={2}
              />
            </div>

            <div>
              <Label>Target Duration (minutes)</Label>
              <Input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 20)}
                min={5}
                max={60}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => generateMutation.mutate()} 
                disabled={!keyTopics || generateMutation.isPending}
                data-testid="button-generate-lesson"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface AIQuizGeneratorProps {
  lessonContent: string;
  lessonTitle: string;
  unitTitle?: string;
  onQuestionsGenerated?: (questions: any[]) => void;
}

export function AIQuizGenerator({ 
  lessonContent, 
  lessonTitle, 
  unitTitle,
  onQuestionsGenerated 
}: AIQuizGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({
          lessonContent,
          lessonTitle,
          unitTitle,
          numberOfQuestions,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate quiz");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Success", description: `Generated ${data.questions.length} quiz questions!` });
      onQuestionsGenerated?.(data.questions);
      setIsOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate quiz questions", variant: "destructive" });
    },
  });

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setIsOpen(true)} className="gap-1" data-testid="button-ai-quiz">
        <Sparkles className="w-3 h-3" />
        AI Quiz
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Generate Quiz Questions
            </DialogTitle>
            <DialogDescription>
              Create quiz questions based on lesson content
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Number of Questions</Label>
              <Input
                type="number"
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(parseInt(e.target.value) || 5)}
                min={1}
                max={20}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Questions will be generated from the lesson content: "{lessonTitle}"
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => generateMutation.mutate()} 
                disabled={!lessonContent || generateMutation.isPending}
                data-testid="button-generate-quiz"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Questions
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
