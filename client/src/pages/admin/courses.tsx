import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit2, Trash2, AlertCircle, FileDown, Download, FileText, ClipboardList, Eye, PlayCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ExportOptions {
  includeLessons: boolean;
  includeQuizzes: boolean;
  includeVideos: boolean;
  includeDescriptions: boolean;
  selectedExamForms: string[];
}

interface ExamFormInfo {
  form: string;
  id: string;
  title: string;
  questionCount: number;
  passingScore: number;
  timeLimit: number;
}

interface ExportOptions {
  includeLessons?: boolean;
  includeQuizzes?: boolean;
  includeVideos?: boolean;
  includeDescriptions?: boolean;
  selectedExamForms?: string[];
  includeHTML?: boolean;
}

function ExportDialog({ course, onClose }: { course: any; onClose: () => void }) {
  const { toast } = useToast();
  const [options, setOptions] = useState<ExportOptions>({
    includeLessons: true,
    includeQuizzes: true,
    includeVideos: false,
    includeDescriptions: true,
    selectedExamForms: [],
    includeHTML: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [examForms, setExamForms] = useState<ExamFormInfo[]>([]);
  const [loadingForms, setLoadingForms] = useState(true);

  // Fetch available final exam forms
  useEffect(() => {
    const fetchExamForms = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`/api/export/course/${course.id}/exam-forms`, {
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const forms = await res.json();
          setExamForms(forms);
          // Default: select all forms
          setOptions(prev => ({ ...prev, selectedExamForms: forms.map((f: ExamFormInfo) => f.form) }));
        }
      } catch (err) {
        console.error("Failed to fetch exam forms:", err);
      } finally {
        setLoadingForms(false);
      }
    };
    fetchExamForms();
  }, [course.id]);

  const toggleExamForm = (form: string) => {
    setOptions(prev => ({
      ...prev,
      selectedExamForms: prev.selectedExamForms.includes(form)
        ? prev.selectedExamForms.filter(f => f !== form)
        : [...prev.selectedExamForms, form]
    }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const params = new URLSearchParams();
      if (!options.includeLessons) params.set('includeLessons', 'false');
      if (!options.includeQuizzes) params.set('includeQuizzes', 'false');
      if (!options.includeVideos) params.set('includeVideos', 'false');
      if (!options.includeDescriptions) params.set('includeDescriptions', 'false');
      if (options.includeHTML === false) params.set('stripHTML', 'true');
      else if (options.includeHTML === true) params.set('includeHTML', 'true');
      
      // Add exam forms selection
      if (examForms.length > 0 && options.selectedExamForms.length > 0) {
        params.set('examForms', options.selectedExamForms.join(','));
      } else if (examForms.length > 0 && options.selectedExamForms.length === 0) {
        params.set('examForms', ''); // Empty means no exams
      }
      
      const url = `/api/export/course/${course.id}/content.docx${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        throw new Error("Failed to download");
      }
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${course.title.replace(/[^a-z0-9]/gi, '-')}-content.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast({
        title: "Export Complete",
        description: "Your Word document has been downloaded.",
      });
      onClose();
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "Could not download course content.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeLessons"
            checked={options.includeLessons}
            onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeLessons: !!checked }))}
          />
          <Label htmlFor="includeLessons">Include lesson tables</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeQuizzes"
            checked={options.includeQuizzes}
            onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeQuizzes: !!checked }))}
          />
          <Label htmlFor="includeQuizzes">Include quiz info</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeDescriptions"
            checked={options.includeDescriptions}
            onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeDescriptions: !!checked }))}
          />
          <Label htmlFor="includeDescriptions">Include descriptions</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeVideos"
            checked={options.includeVideos}
            onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeVideos: !!checked }))}
          />
          <Label htmlFor="includeVideos">Include video URLs (adds column to tables)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeHTML"
            checked={options.includeHTML !== false}
            onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeHTML: !!checked }))}
          />
          <Label htmlFor="includeHTML">Preserve HTML formatting</Label>
        </div>
        
        {/* Final Exam Forms Selection */}
        {!loadingForms && examForms.length > 0 && (
          <div className="border-t pt-3 mt-3">
            <Label className="text-sm font-medium mb-2 block">Final Exam Versions</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Select which final exam versions to include in the export
            </p>
            <div className="space-y-2 pl-2">
              {examForms.map((form) => (
                <div key={form.form} className="flex items-center space-x-2">
                  <Checkbox
                    id={`examForm-${form.form}`}
                    checked={options.selectedExamForms.includes(form.form)}
                    onCheckedChange={() => toggleExamForm(form.form)}
                    data-testid={`checkbox-exam-form-${form.form.toLowerCase()}`}
                  />
                  <Label htmlFor={`examForm-${form.form}`} className="text-sm">
                    Form {form.form} ({form.questionCount} questions)
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {loadingForms && (
          <div className="text-sm text-muted-foreground">Loading exam forms...</div>
        )}
      </div>
      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleExport} disabled={isExporting} data-testid="button-export-docx">
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export to Word"}
        </Button>
      </div>
    </div>
  );
}

function VideoGenerationDialog({ course, onClose }: { course: any; onClose: () => void }) {
  const { toast } = useToast();
  const [isPreparing, setIsPreparing] = useState(false);
  const [preparedContent, setPreparedContent] = useState<any>(null);
  const [showManualGuide, setShowManualGuide] = useState(false);

  const handlePrepareContent = async () => {
    setIsPreparing(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/courses/${course.id}/generate-videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ provider: 'manual' })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to prepare content');
      }

      const result = await res.json();
      setPreparedContent(result);
      setShowManualGuide(true);
      toast({
        title: "Content Prepared",
        description: `Prepared ${result.lessons?.length || 0} lessons for manual video creation`,
      });
    } catch (err: any) {
      toast({
        title: "Preparation Failed",
        description: err.message || "Could not prepare content.",
        variant: "destructive"
      });
    } finally {
      setIsPreparing(false);
    }
  };

  if (showManualGuide && preparedContent) {
    return (
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
          <h3 className="font-semibold mb-2">✅ Content Prepared Successfully!</h3>
          <p className="text-sm mb-4">
            {preparedContent.lessons?.length || 0} lessons ready for video creation. 
            Follow the steps below to create videos using free tools.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Step 1: Choose a Free Tool</h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li><strong>Pictory.ai</strong> - Free: 3 videos/month - https://pictory.ai</li>
              <li><strong>InVideo AI</strong> - Free: 4 videos/month - https://invideo.io</li>
              <li><strong>Loom</strong> - Free: 25 videos/month - https://loom.com</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Step 2: Use Prepared Scripts</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Each lesson has a formatted script ready to copy. Click on a lesson below to view its script.
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2">
              {preparedContent.lessons?.map((lesson: any, idx: number) => (
                <div key={idx} className="p-2 bg-muted rounded text-sm">
                  <div className="font-medium">{lesson.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {lesson.wordCount} words • ~{lesson.estimatedDuration} min
                  </div>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs">View Script</summary>
                    <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto whitespace-pre-wrap">
                      {lesson.script}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Step 3: Create & Upload Videos</h4>
            <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
              <li>Paste script into your chosen video tool</li>
              <li>Generate video (takes 2-5 minutes)</li>
              <li>Download the video</li>
              <li>Upload to YouTube as <strong>Unlisted</strong></li>
              <li>Copy YouTube URL</li>
              <li>Add URL to lesson in admin panel</li>
            </ol>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm">
            <p className="font-medium mb-1">💡 Tip:</p>
            <p>You can create videos gradually using free tiers. No need to do all at once!</p>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => { setShowManualGuide(false); setPreparedContent(null); }}>
            Close
          </Button>
          <Button onClick={onClose}>
            Got It
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
        <h3 className="font-semibold mb-2">Manual Video Creation (No API Keys Needed)</h3>
        <p className="text-sm text-muted-foreground">
          This will prepare formatted scripts for all lessons. You can then use free tools like Pictory.ai, 
          InVideo, or Loom to create videos manually. No API keys required!
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="font-medium mb-2">How It Works:</h4>
          <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
            <li>We prepare formatted scripts for each lesson</li>
            <li>You copy scripts to free video tools (Pictory, InVideo, etc.)</li>
            <li>Tools generate videos automatically</li>
            <li>You upload videos to YouTube</li>
            <li>Add YouTube URLs to lessons</li>
          </ol>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md text-sm">
          <p className="font-medium mb-1">✅ Free Options:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Pictory.ai: 3 videos/month free</li>
            <li>InVideo: 4 videos/month free</li>
            <li>Loom: 25 videos/month free</li>
          </ul>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={onClose} disabled={isPreparing}>Cancel</Button>
        <Button onClick={handlePrepareContent} disabled={isPreparing}>
          {isPreparing ? "Preparing..." : "Prepare Content for Videos"}
        </Button>
      </div>
    </div>
  );
}

function FloridaComplianceDialog({ course, onClose }: { course: any; onClose: () => void }) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (exportType: 'answer-key' | 'final-exam-a' | 'final-exam-b', formParam?: 'A' | 'B') => {
    setIsExporting(exportType);
    try {
      const token = localStorage.getItem("adminToken");
      let url = '';
      let filename = '';
      
      if (exportType === 'answer-key') {
        const params = formParam ? `?form=${formParam}` : '';
        url = `/api/export/course/${course.id}/answer-key.docx${params}`;
        filename = formParam 
          ? `answer-key-form-${formParam.toLowerCase()}-${course.title.replace(/[^a-z0-9]/gi, '-')}.docx`
          : `answer-key-${course.title.replace(/[^a-z0-9]/gi, '-')}.docx`;
      } else if (exportType === 'final-exam-a') {
        url = `/api/export/course/${course.id}/final-exam-a.docx`;
        filename = `final-exam-form-a-${course.title.replace(/[^a-z0-9]/gi, '-')}.docx`;
      } else if (exportType === 'final-exam-b') {
        url = `/api/export/course/${course.id}/final-exam-b.docx`;
        filename = `final-exam-form-b-${course.title.replace(/[^a-z0-9]/gi, '-')}.docx`;
      }
      
      const res = await fetch(url, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        throw new Error("Failed to download");
      }
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast({
        title: "Export Complete",
        description: `Your ${exportType.replace(/-/g, ' ')} document has been downloaded.`,
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "Could not download the document.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Florida DBPR requires an answer key with page references and two end-of-course examinations 
        (Form A and Form B) for distance pre-licensing and post-licensing education courses.
      </p>
      
      <div className="space-y-3">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Answer Key with Page References
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Exports a table with question numbers, correct answers, and page references where 
            the information for each question can be found.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleExport('answer-key')}
              disabled={isExporting === 'answer-key'}
              data-testid="button-export-answer-key"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting === 'answer-key' ? "Exporting..." : "Export All Questions"}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleExport('answer-key', 'A')}
              disabled={isExporting === 'answer-key'}
              data-testid="button-export-answer-key-a"
            >
              Form A Key
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleExport('answer-key', 'B')}
              disabled={isExporting === 'answer-key'}
              data-testid="button-export-answer-key-b"
            >
              Form B Key
            </Button>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            End-of-Course Examinations
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Florida requires two separate final examinations (Form A and Form B) for distance 
            education courses.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm"
              onClick={() => handleExport('final-exam-a')}
              disabled={isExporting === 'final-exam-a'}
              data-testid="button-export-exam-a"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting === 'final-exam-a' ? "Exporting..." : "Export Form A"}
            </Button>
            <Button 
              size="sm"
              onClick={() => handleExport('final-exam-b')}
              disabled={isExporting === 'final-exam-b'}
              data-testid="button-export-exam-b"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting === 'final-exam-b' ? "Exporting..." : "Export Form B"}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

interface CourseFormData {
  title: string;
  description: string;
  productType: string;
  state: string;
  licenseType: string;
  requirementCycleType: string;
  requirementBucket: string;
  hoursRequired: string;
  deliveryMethod: string;
  difficultyLevel: string;
  price: string;
  sku: string;
  renewalApplicable: string;
  renewalPeriodYears: string;
  expirationMonths: string;
  providerNumber: string;
  courseOfferingNumber: string;
  instructorName: string;
}

function CourseForm({ onSuccess, initialData }: { onSuccess: () => void; initialData?: any }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CourseFormData>(
    initialData || {
      title: "",
      description: "",
      productType: "RealEstate",
      state: "FL",
      licenseType: "Sales Associate",
      requirementCycleType: "Continuing Education (Renewal)",
      requirementBucket: "Core Law",
      hoursRequired: "3",
      deliveryMethod: "Self-Paced Online",
      difficultyLevel: "Basic",
      price: "1500",
      sku: "",
      renewalApplicable: "1",
      renewalPeriodYears: "2",
      expirationMonths: "6",
      providerNumber: "",
      courseOfferingNumber: "",
      instructorName: "",
    }
  );
  const [isOpen, setIsOpen] = useState(false);

  const createCourseMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      const token = localStorage.getItem("adminToken");
      const priceInCents = Math.round(parseFloat(data.price) * 100);
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          hoursRequired: parseInt(data.hoursRequired),
          price: priceInCents,
          renewalApplicable: data.renewalApplicable === "1" ? 1 : 0,
          renewalPeriodYears: parseInt(data.renewalPeriodYears),
          expirationMonths: parseInt(data.expirationMonths) || 6,
        }),
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to create course");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Course created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      setIsOpen(false);
      onSuccess();
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.sku) {
      toast({
        title: "Validation Error",
        description: "Title and SKU are required",
        variant: "destructive",
      });
      return;
    }
    createCourseMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-course" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Course
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Course" : "Create New Course"}
          </DialogTitle>
          <DialogDescription>
            {initialData ? "Update the course details below." : "Fill in the details to create a new course."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Florida 14-Hour Renewal"
                data-testid="input-course-title"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Course description..."
                rows={3}
                data-testid="input-course-description"
              />
            </div>
          </div>

          {/* Classification */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Classification</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productType">Product Type *</Label>
                <Select
                  value={formData.productType}
                  onValueChange={(val) =>
                    setFormData({ ...formData, productType: val })
                  }
                >
                  <SelectTrigger data-testid="select-product-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RealEstate">Real Estate</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(val) =>
                    setFormData({ ...formData, state: val })
                  }
                >
                  <SelectTrigger data-testid="select-state">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="licenseType">License Type *</Label>
                <Select
                  value={formData.licenseType}
                  onValueChange={(val) =>
                    setFormData({ ...formData, licenseType: val })
                  }
                >
                  <SelectTrigger data-testid="select-license-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales Associate">
                      Sales Associate
                    </SelectItem>
                    <SelectItem value="Broker">Broker</SelectItem>
                    <SelectItem value="Sales Associate & Broker">
                      Sales Associate & Broker
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="requirementCycleType">Requirement Cycle *</Label>
                <Select
                  value={formData.requirementCycleType}
                  onValueChange={(val) =>
                    setFormData({ ...formData, requirementCycleType: val })
                  }
                >
                  <SelectTrigger data-testid="select-cycle-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prelicensing">
                      Prelicensing
                    </SelectItem>
                    <SelectItem value="Post-Licensing">
                      Post-Licensing
                    </SelectItem>
                    <SelectItem value="Continuing Education (Renewal)">
                      Continuing Education (Renewal)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="requirementBucket">Requirement Bucket *</Label>
                <Select
                  value={formData.requirementBucket}
                  onValueChange={(val) =>
                    setFormData({ ...formData, requirementBucket: val })
                  }
                >
                  <SelectTrigger data-testid="select-bucket">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Core Law">Core Law</SelectItem>
                    <SelectItem value="Ethics & Business Practices">
                      Ethics & Business Practices
                    </SelectItem>
                    <SelectItem value="Specialty / Elective">
                      Specialty / Elective
                    </SelectItem>
                    <SelectItem value="Post-Licensing Mandatory">
                      Post-Licensing Mandatory
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="deliveryMethod">Delivery Method</Label>
                <Select
                  value={formData.deliveryMethod}
                  onValueChange={(val) =>
                    setFormData({ ...formData, deliveryMethod: val })
                  }
                >
                  <SelectTrigger data-testid="select-delivery">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Self-Paced Online">
                      Self-Paced Online
                    </SelectItem>
                    <SelectItem value="Live Webinar">Live Webinar</SelectItem>
                    <SelectItem value="Classroom">Classroom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Content Details */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Content Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hoursRequired">Hours Required *</Label>
                <Input
                  id="hoursRequired"
                  type="number"
                  value={formData.hoursRequired}
                  onChange={(e) =>
                    setFormData({ ...formData, hoursRequired: e.target.value })
                  }
                  placeholder="3"
                  data-testid="input-hours"
                />
              </div>

              <div>
                <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                <Select
                  value={formData.difficultyLevel}
                  onValueChange={(val) =>
                    setFormData({ ...formData, difficultyLevel: val })
                  }
                >
                  <SelectTrigger data-testid="select-difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="15.00"
                  data-testid="input-price"
                />
              </div>

              <div>
                <Label htmlFor="sku">SKU (Course Code) *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  placeholder="FL-RE-CE-14"
                  data-testid="input-sku"
                />
              </div>
            </div>
          </div>

          {/* Renewal & Regulatory */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Renewal & Regulatory</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="renewalApplicable">Renewal Applicable</Label>
                <Select
                  value={formData.renewalApplicable}
                  onValueChange={(val) =>
                    setFormData({ ...formData, renewalApplicable: val })
                  }
                >
                  <SelectTrigger data-testid="select-renewal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Yes</SelectItem>
                    <SelectItem value="0">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="renewalPeriodYears">Renewal Period (Years)</Label>
                <Input
                  id="renewalPeriodYears"
                  type="number"
                  value={formData.renewalPeriodYears}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      renewalPeriodYears: e.target.value,
                    })
                  }
                  placeholder="2"
                  data-testid="input-renewal-period"
                />
              </div>

              <div>
                <Label htmlFor="expirationMonths">Enrollment Expiration (Months)</Label>
                <Input
                  id="expirationMonths"
                  type="number"
                  min="1"
                  max="24"
                  value={formData.expirationMonths}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expirationMonths: e.target.value,
                    })
                  }
                  placeholder="6"
                  data-testid="input-expiration-months"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Students must complete the course within this time period
                </p>
              </div>

              <div>
                <Label htmlFor="providerNumber">Provider Number</Label>
                <Input
                  id="providerNumber"
                  value={formData.providerNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, providerNumber: e.target.value })
                  }
                  placeholder="DBPR provider number"
                  data-testid="input-provider"
                />
              </div>

              <div>
                <Label htmlFor="courseOfferingNumber">
                  Course Offering Number
                </Label>
                <Input
                  id="courseOfferingNumber"
                  value={formData.courseOfferingNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      courseOfferingNumber: e.target.value,
                    })
                  }
                  placeholder="DBPR offering number"
                  data-testid="input-offering"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="instructorName">Instructor Name</Label>
                <Input
                  id="instructorName"
                  value={formData.instructorName}
                  onChange={(e) =>
                    setFormData({ ...formData, instructorName: e.target.value })
                  }
                  placeholder="Course instructor name"
                  data-testid="input-instructor"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              type="submit"
              disabled={createCourseMutation.isPending}
              data-testid="button-save-course"
            >
              {createCourseMutation.isPending ? "Saving..." : "Save Course"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              data-testid="button-cancel-course"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminCoursesPage() {
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [exportingCourse, setExportingCourse] = useState<any | null>(null);
  const [generatingVideoCourse, setGeneratingVideoCourse] = useState<any | null>(null);
  const [floridaComplianceCourse, setFloridaComplianceCourse] = useState<any | null>(null);
  
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["/api/admin/courses"],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/courses", { 
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { toast } = useToast();
  
  const updateCourseMutation = useMutation({
    mutationFn: async ({ courseId, data }: { courseId: string; data: any }) => {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to update course");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Course updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      setEditingCourse(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive",
      });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to delete course");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Course deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Courses</h2>
          <p className="text-muted-foreground">
            Create and manage your course catalog
          </p>
        </div>
        <CourseForm onSuccess={() => {}} />
      </div>

      {isLoading ? (
        <div>Loading courses...</div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No courses yet</p>
              <p className="text-sm text-muted-foreground">
                Click "Add Course" to create your first course
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {courses.map((course: any) => (
            <Card key={course.id} data-testid={`course-card-${course.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{course.title}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{course.state}</Badge>
                      <Badge variant="outline">{course.productType}</Badge>
                      <Badge variant="outline">{course.hoursRequired} hrs</Badge>
                      <Badge variant="secondary">
                        ${(course.price / 100).toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setExportingCourse(course)}
                      data-testid={`button-export-${course.id}`}
                      aria-label={`Export ${course.title} to Word document`}
                    >
                      <FileDown className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => window.location.href = `/admin/courses/${course.id}/preview`}
                      data-testid={`button-preview-${course.id}`}
                      aria-label={`Preview ${course.title}`}
                      title="Preview Course"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    {course.state === 'FL' && (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setFloridaComplianceCourse(course)}
                        data-testid={`button-florida-compliance-${course.id}`}
                        aria-label={`Florida DBPR compliance exports for ${course.title}`}
                        title="Florida DBPR Compliance"
                      >
                        <ClipboardList className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setGeneratingVideoCourse(course)}
                      data-testid={`button-generate-videos-${course.id}`}
                      aria-label={`Generate videos for ${course.title}`}
                      title="Generate Videos"
                    >
                      <PlayCircle className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setEditingCourse(course)}
                      data-testid={`button-edit-${course.id}`}
                      aria-label={`Edit ${course.title}`}
                    >
                      <Edit2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(course.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${course.id}`}
                      aria-label={`Delete ${course.title}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {course.description}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <p className="font-semibold">License Type</p>
                    <p className="text-muted-foreground">
                      {course.licenseType}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Requirement</p>
                    <p className="text-muted-foreground">
                      {course.requirementCycleType}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Delivery</p>
                    <p className="text-muted-foreground">
                      {course.deliveryMethod}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">SKU</p>
                    <p className="text-muted-foreground">{course.sku}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {editingCourse && (
        <EditCourseDialog
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSave={(data) => updateCourseMutation.mutate({ courseId: editingCourse.id, data })}
          isPending={updateCourseMutation.isPending}
        />
      )}
      
      {exportingCourse && (
        <Dialog open={!!exportingCourse} onOpenChange={(open) => !open && setExportingCourse(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Course Content</DialogTitle>
              <DialogDescription>
                Choose what to include in your Word document export for "{exportingCourse.title}"
              </DialogDescription>
            </DialogHeader>
            <ExportDialog course={exportingCourse} onClose={() => setExportingCourse(null)} />
          </DialogContent>
        </Dialog>
      )}
      
      {floridaComplianceCourse && (
        <Dialog open={!!floridaComplianceCourse} onOpenChange={(open) => !open && setFloridaComplianceCourse(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Florida DBPR Regulatory Compliance</DialogTitle>
              <DialogDescription>
                Export compliance documents required for Florida distance education course approval.
              </DialogDescription>
            </DialogHeader>
            <FloridaComplianceDialog 
              course={floridaComplianceCourse} 
              onClose={() => setFloridaComplianceCourse(null)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function EditCourseDialog({
  course,
  onClose,
  onSave,
  isPending,
}: {
  course: any;
  onClose: () => void;
  onSave: (data: any) => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState<CourseFormData>({
    title: course.title || "",
    description: course.description || "",
    productType: course.productType || "RealEstate",
    state: course.state || "FL",
    licenseType: course.licenseType || "Sales Associate",
    requirementCycleType: course.requirementCycleType || "Continuing Education (Renewal)",
    requirementBucket: course.requirementBucket || "Core Law",
    hoursRequired: course.hoursRequired?.toString() || "3",
    deliveryMethod: course.deliveryMethod || "Self-Paced Online",
    difficultyLevel: course.difficultyLevel || "Basic",
    price: ((course.price || 0) / 100).toString(),
    sku: course.sku || "",
    renewalApplicable: course.renewalApplicable ? "1" : "0",
    renewalPeriodYears: course.renewalPeriodYears?.toString() || "2",
    expirationMonths: course.expirationMonths?.toString() || "6",
    providerNumber: course.providerNumber || "",
    courseOfferingNumber: course.courseOfferingNumber || "",
    instructorName: course.instructorName || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceInCents = Math.round(parseFloat(formData.price) * 100);
    onSave({
      ...formData,
      hoursRequired: parseInt(formData.hoursRequired),
      price: priceInCents,
      renewalApplicable: formData.renewalApplicable === "1" ? 1 : 0,
      renewalPeriodYears: parseInt(formData.renewalPeriodYears),
      expirationMonths: parseInt(formData.expirationMonths) || 6,
    });
  };

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="edit-title">Course Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                data-testid="input-edit-course-title"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                data-testid="input-edit-course-description"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Classification</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Product Type</Label>
                <Select
                  value={formData.productType}
                  onValueChange={(val) => setFormData({ ...formData, productType: val })}
                >
                  <SelectTrigger data-testid="select-edit-product-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RealEstate">Real Estate</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>State</Label>
                <Select
                  value={formData.state}
                  onValueChange={(val) => setFormData({ ...formData, state: val })}
                >
                  <SelectTrigger data-testid="select-edit-state">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>License Type</Label>
                <Select
                  value={formData.licenseType}
                  onValueChange={(val) => setFormData({ ...formData, licenseType: val })}
                >
                  <SelectTrigger data-testid="select-edit-license-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales Associate">Sales Associate</SelectItem>
                    <SelectItem value="Broker">Broker</SelectItem>
                    <SelectItem value="Sales Associate & Broker">Sales Associate & Broker</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Requirement Cycle</Label>
                <Select
                  value={formData.requirementCycleType}
                  onValueChange={(val) => setFormData({ ...formData, requirementCycleType: val })}
                >
                  <SelectTrigger data-testid="select-edit-cycle-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prelicensing">Prelicensing</SelectItem>
                    <SelectItem value="Post-Licensing">Post-Licensing</SelectItem>
                    <SelectItem value="Continuing Education (Renewal)">Continuing Education (Renewal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Content Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-hours">Hours Required</Label>
                <Input
                  id="edit-hours"
                  type="number"
                  value={formData.hoursRequired}
                  onChange={(e) => setFormData({ ...formData, hoursRequired: e.target.value })}
                  data-testid="input-edit-hours"
                />
              </div>

              <div>
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  data-testid="input-edit-price"
                />
              </div>

              <div>
                <Label htmlFor="edit-sku">SKU</Label>
                <Input
                  id="edit-sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  data-testid="input-edit-sku"
                />
              </div>

              <div>
                <Label>Delivery Method</Label>
                <Select
                  value={formData.deliveryMethod}
                  onValueChange={(val) => setFormData({ ...formData, deliveryMethod: val })}
                >
                  <SelectTrigger data-testid="select-edit-delivery">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Self-Paced Online">Self-Paced Online</SelectItem>
                    <SelectItem value="Live Webinar">Live Webinar</SelectItem>
                    <SelectItem value="Classroom">Classroom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-expiration-months">Enrollment Expiration (Months)</Label>
                <Input
                  id="edit-expiration-months"
                  type="number"
                  min="1"
                  max="24"
                  value={formData.expirationMonths}
                  onChange={(e) => setFormData({ ...formData, expirationMonths: e.target.value })}
                  data-testid="input-edit-expiration-months"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Students must complete within this time period
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button type="submit" disabled={isPending} data-testid="button-update-course">
              {isPending ? "Saving..." : "Update Course"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-edit">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
