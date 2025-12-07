import { useState } from "react";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit2, Trash2, AlertCircle, FileDown, Download } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ExportOptions {
  includeLessons: boolean;
  includeQuizzes: boolean;
  includeVideos: boolean;
  includeDescriptions: boolean;
}

function ExportDialog({ course, onClose }: { course: any; onClose: () => void }) {
  const { toast } = useToast();
  const [options, setOptions] = useState<ExportOptions>({
    includeLessons: true,
    includeQuizzes: true,
    includeVideos: false,
    includeDescriptions: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const params = new URLSearchParams();
      if (!options.includeLessons) params.set('includeLessons', 'false');
      if (!options.includeQuizzes) params.set('includeQuizzes', 'false');
      if (!options.includeVideos) params.set('includeVideos', 'false');
      if (!options.includeDescriptions) params.set('includeDescriptions', 'false');
      
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
      </div>
      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleExport} disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export to Word"}
        </Button>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Course Management</h2>
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
            </DialogHeader>
            <p className="text-sm text-muted-foreground mb-4">
              Choose what to include in your Word document export for "{exportingCourse.title}"
            </p>
            <ExportDialog course={exportingCourse} onClose={() => setExportingCourse(null)} />
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
