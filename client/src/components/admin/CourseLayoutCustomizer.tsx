import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Layout,
  Palette,
  Type,
  Image as ImageIcon,
  Video as VideoIcon,
  Settings,
  Save,
  Eye,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  description: string | null;
  sku: string;
  courseHours: number | null;
  price: number | null;
}

interface CourseLayoutSettings {
  courseId: string;
  // Header/Footer
  showHeader: boolean;
  headerStyle: "default" | "minimal" | "custom";
  showFooter: boolean;
  footerStyle: "default" | "minimal" | "custom";
  
  // Navigation
  navigationStyle: "sidebar" | "top" | "bottom" | "floating";
  showProgressBar: boolean;
  showBreadcrumbs: boolean;
  
  // Content Layout
  contentWidth: "full" | "wide" | "standard" | "narrow";
  sidebarPosition: "left" | "right" | "none";
  showTableOfContents: boolean;
  
  // Visual Theme
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: "sans" | "serif" | "mono";
  fontSize: "small" | "medium" | "large";
  
  // Course-Specific
  showCourseInfo: boolean;
  showInstructorInfo: boolean;
  showRelatedCourses: boolean;
  showCertificatePreview: boolean;
  
  // Video Player
  videoPlayerStyle: "default" | "minimal" | "theater" | "picture-in-picture";
  autoPlay: boolean;
  showSubtitles: boolean;
  playbackSpeed: boolean;
  
  // Quiz/Exam
  quizLayout: "inline" | "modal" | "fullscreen";
  showQuizTimer: boolean;
  allowReview: boolean;
  
  // Mobile
  mobileLayout: "responsive" | "app-like" | "simplified";
  showMobileMenu: boolean;
  
  // Custom CSS
  customCSS: string | null;
}

interface CourseLayoutCustomizerProps {
  courseId: string;
  onSave?: (settings: Partial<CourseLayoutSettings>) => void;
}

export default function CourseLayoutCustomizer({
  courseId,
  onSave,
}: CourseLayoutCustomizerProps) {
  const { toast } = useToast();
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [settings, setSettings] = useState<Partial<CourseLayoutSettings>>({
    showHeader: true,
    headerStyle: "default",
    showFooter: true,
    footerStyle: "default",
    navigationStyle: "sidebar",
    showProgressBar: true,
    showBreadcrumbs: true,
    contentWidth: "standard",
    sidebarPosition: "right",
    showTableOfContents: true,
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    fontFamily: "sans",
    fontSize: "medium",
    showCourseInfo: true,
    videoPlayerStyle: "default",
    autoPlay: false,
    quizLayout: "inline",
    showQuizTimer: true,
    mobileLayout: "responsive",
    showMobileMenu: true,
  });

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("adminToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch course
  const { data: course } = useQuery<Course>({
    queryKey: ["/api/admin/courses", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch course");
      return res.json();
    },
    enabled: !!courseId,
  });

  // Save layout settings
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<CourseLayoutSettings>) => {
      const res = await fetch(`/api/admin/courses/${courseId}/layout`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save layout settings");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Layout settings saved" });
      onSave?.(settings);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save layout settings", variant: "destructive" });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Course Layout Customizer</h3>
          <p className="text-sm text-muted-foreground">
            Customize the visual appearance and layout of {course?.title || "this course"}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg">
            <Button
              size="sm"
              variant={previewDevice === "desktop" ? "default" : "ghost"}
              onClick={() => setPreviewDevice("desktop")}
              className="rounded-r-none"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={previewDevice === "tablet" ? "default" : "ghost"}
              onClick={() => setPreviewDevice("tablet")}
              className="rounded-none"
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={previewDevice === "mobile" ? "default" : "ghost"}
              onClick={() => setPreviewDevice("mobile")}
              className="rounded-l-none"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save Layout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="layout" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="layout">
            <Layout className="h-4 w-4 mr-2" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="content">
            <BookOpen className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="video">
            <VideoIcon className="h-4 w-4 mr-2" />
            Video
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Settings className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Header & Footer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Header</Label>
                  <p className="text-xs text-muted-foreground">Display course header</p>
                </div>
                <Switch
                  checked={settings.showHeader}
                  onCheckedChange={(checked) => setSettings({ ...settings, showHeader: checked })}
                />
              </div>
              {settings.showHeader && (
                <div>
                  <Label>Header Style</Label>
                  <Select
                    value={settings.headerStyle}
                    onValueChange={(val: "default" | "minimal" | "custom") =>
                      setSettings({ ...settings, headerStyle: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Footer</Label>
                  <p className="text-xs text-muted-foreground">Display course footer</p>
                </div>
                <Switch
                  checked={settings.showFooter}
                  onCheckedChange={(checked) => setSettings({ ...settings, showFooter: checked })}
                />
              </div>
              {settings.showFooter && (
                <div>
                  <Label>Footer Style</Label>
                  <Select
                    value={settings.footerStyle}
                    onValueChange={(val: "default" | "minimal" | "custom") =>
                      setSettings({ ...settings, footerStyle: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Navigation Style</Label>
                <Select
                  value={settings.navigationStyle}
                  onValueChange={(val: "sidebar" | "top" | "bottom" | "floating") =>
                    setSettings({ ...settings, navigationStyle: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="top">Top Bar</SelectItem>
                    <SelectItem value="bottom">Bottom Bar</SelectItem>
                    <SelectItem value="floating">Floating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Progress Bar</Label>
                  <p className="text-xs text-muted-foreground">Display course completion progress</p>
                </div>
                <Switch
                  checked={settings.showProgressBar}
                  onCheckedChange={(checked) => setSettings({ ...settings, showProgressBar: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Breadcrumbs</Label>
                  <p className="text-xs text-muted-foreground">Display navigation breadcrumbs</p>
                </div>
                <Switch
                  checked={settings.showBreadcrumbs}
                  onCheckedChange={(checked) => setSettings({ ...settings, showBreadcrumbs: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content Layout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Content Width</Label>
                <Select
                  value={settings.contentWidth}
                  onValueChange={(val: "full" | "wide" | "standard" | "narrow") =>
                    setSettings({ ...settings, contentWidth: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Width</SelectItem>
                    <SelectItem value="wide">Wide (1400px)</SelectItem>
                    <SelectItem value="standard">Standard (1200px)</SelectItem>
                    <SelectItem value="narrow">Narrow (900px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sidebar Position</Label>
                <Select
                  value={settings.sidebarPosition}
                  onValueChange={(val: "left" | "right" | "none") =>
                    setSettings({ ...settings, sidebarPosition: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Table of Contents</Label>
                  <p className="text-xs text-muted-foreground">Display lesson navigation</p>
                </div>
                <Switch
                  checked={settings.showTableOfContents}
                  onCheckedChange={(checked) => setSettings({ ...settings, showTableOfContents: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mobile Layout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Mobile Layout Style</Label>
                <Select
                  value={settings.mobileLayout}
                  onValueChange={(val: "responsive" | "app-like" | "simplified") =>
                    setSettings({ ...settings, mobileLayout: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="responsive">Responsive</SelectItem>
                    <SelectItem value="app-like">App-like</SelectItem>
                    <SelectItem value="simplified">Simplified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Mobile Menu</Label>
                  <p className="text-xs text-muted-foreground">Display hamburger menu on mobile</p>
                </div>
                <Switch
                  checked={settings.showMobileMenu}
                  onCheckedChange={(checked) => setSettings({ ...settings, showMobileMenu: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Primary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      placeholder="#8b5cf6"
                    />
                  </div>
                </div>
                <div>
                  <Label>Background Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={settings.backgroundColor}
                      onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      value={settings.backgroundColor}
                      onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
                <div>
                  <Label>Text Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={settings.textColor}
                      onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      value={settings.textColor}
                      onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                      placeholder="#1f2937"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Typography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Font Family</Label>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(val: "sans" | "serif" | "mono") =>
                    setSettings({ ...settings, fontFamily: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sans">Sans Serif</SelectItem>
                    <SelectItem value="serif">Serif</SelectItem>
                    <SelectItem value="mono">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Font Size</Label>
                <Select
                  value={settings.fontSize}
                  onValueChange={(val: "small" | "medium" | "large") =>
                    setSettings({ ...settings, fontSize: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Course Info</Label>
                  <p className="text-xs text-muted-foreground">Display course details</p>
                </div>
                <Switch
                  checked={settings.showCourseInfo}
                  onCheckedChange={(checked) => setSettings({ ...settings, showCourseInfo: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Instructor Info</Label>
                  <p className="text-xs text-muted-foreground">Display instructor details</p>
                </div>
                <Switch
                  checked={settings.showInstructorInfo}
                  onCheckedChange={(checked) => setSettings({ ...settings, showInstructorInfo: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Related Courses</Label>
                  <p className="text-xs text-muted-foreground">Display related course suggestions</p>
                </div>
                <Switch
                  checked={settings.showRelatedCourses}
                  onCheckedChange={(checked) => setSettings({ ...settings, showRelatedCourses: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Certificate Preview</Label>
                  <p className="text-xs text-muted-foreground">Display certificate preview</p>
                </div>
                <Switch
                  checked={settings.showCertificatePreview}
                  onCheckedChange={(checked) => setSettings({ ...settings, showCertificatePreview: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quiz & Exam</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Quiz Layout</Label>
                <Select
                  value={settings.quizLayout}
                  onValueChange={(val: "inline" | "modal" | "fullscreen") =>
                    setSettings({ ...settings, quizLayout: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inline">Inline</SelectItem>
                    <SelectItem value="modal">Modal</SelectItem>
                    <SelectItem value="fullscreen">Fullscreen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Quiz Timer</Label>
                  <p className="text-xs text-muted-foreground">Display countdown timer</p>
                </div>
                <Switch
                  checked={settings.showQuizTimer}
                  onCheckedChange={(checked) => setSettings({ ...settings, showQuizTimer: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Review</Label>
                  <p className="text-xs text-muted-foreground">Allow reviewing answers before submission</p>
                </div>
                <Switch
                  checked={settings.allowReview}
                  onCheckedChange={(checked) => setSettings({ ...settings, allowReview: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Tab */}
        <TabsContent value="video" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Video Player</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Player Style</Label>
                <Select
                  value={settings.videoPlayerStyle}
                  onValueChange={(val: "default" | "minimal" | "theater" | "picture-in-picture") =>
                    setSettings({ ...settings, videoPlayerStyle: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="theater">Theater Mode</SelectItem>
                    <SelectItem value="picture-in-picture">Picture-in-Picture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-play</Label>
                  <p className="text-xs text-muted-foreground">Automatically start videos</p>
                </div>
                <Switch
                  checked={settings.autoPlay}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoPlay: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Subtitles</Label>
                  <p className="text-xs text-muted-foreground">Display video subtitles</p>
                </div>
                <Switch
                  checked={settings.showSubtitles}
                  onCheckedChange={(checked) => setSettings({ ...settings, showSubtitles: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Playback Speed Control</Label>
                  <p className="text-xs text-muted-foreground">Allow speed adjustment</p>
                </div>
                <Switch
                  checked={settings.playbackSpeed}
                  onCheckedChange={(checked) => setSettings({ ...settings, playbackSpeed: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Custom CSS</CardTitle>
            </CardHeader>
            <CardContent>
              <Label>Custom Stylesheet</Label>
              <Textarea
                value={settings.customCSS || ""}
                onChange={(e) => setSettings({ ...settings, customCSS: e.target.value })}
                placeholder="/* Add your custom CSS here */"
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Add custom CSS to override default styles. Use with caution.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 bg-muted/50",
              previewDevice === "mobile" && "max-w-sm mx-auto",
              previewDevice === "tablet" && "max-w-2xl mx-auto"
            )}
          >
            <div className="text-center text-muted-foreground">
              <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Preview will appear here</p>
              <p className="text-xs mt-2">
                {previewDevice === "desktop" && "Desktop view"}
                {previewDevice === "tablet" && "Tablet view"}
                {previewDevice === "mobile" && "Mobile view"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


