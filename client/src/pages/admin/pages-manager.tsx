import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, Trash2, GripVertical, Image as ImageIcon, Video as VideoIcon, 
  Type, Save, FileText, Settings, Eye, EyeOff, ChevronUp, ChevronDown,
  Layout, Columns, Square, LayoutGrid, Heading1, AlignLeft, MousePointer,
  ExternalLink, Minus, Code, RefreshCw, Globe
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SectionBlock {
  id: string;
  sectionId: string;
  blockType: string;
  content: string | null;
  mediaUrl: string | null;
  mediaAlt: string | null;
  linkUrl: string | null;
  linkTarget: string | null;
  alignment: string | null;
  size: string | null;
  sortOrder: number;
  isVisible: number | null;
  settings: string | null;
}

interface PageSection {
  id: string;
  pageId: string;
  sectionType: string;
  title: string | null;
  backgroundColor: string | null;
  backgroundImage: string | null;
  padding: string | null;
  sortOrder: number;
  isVisible: number | null;
  settings: string | null;
  blocks: SectionBlock[];
}

interface SitePage {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  isPublished: number | null;
  isSystemPage: number | null;
  sortOrder: number;
  metaTitle: string | null;
  metaKeywords: string | null;
  ogImage: string | null;
}

const SECTION_TYPES = [
  { value: "hero", label: "Hero Banner", icon: Layout },
  { value: "text", label: "Text Content", icon: AlignLeft },
  { value: "features", label: "Features Grid", icon: LayoutGrid },
  { value: "cta", label: "Call to Action", icon: MousePointer },
  { value: "columns", label: "Column Layout", icon: Columns },
  { value: "gallery", label: "Image Gallery", icon: ImageIcon },
  { value: "custom", label: "Custom HTML", icon: Code },
];

const BLOCK_TYPES = [
  { value: "heading", label: "Heading", icon: Heading1 },
  { value: "text", label: "Text", icon: Type },
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "video", label: "Video", icon: VideoIcon },
  { value: "button", label: "Button", icon: MousePointer },
  { value: "spacer", label: "Spacer", icon: Minus },
  { value: "divider", label: "Divider", icon: Minus },
  { value: "html", label: "HTML", icon: Code },
];

export default function PagesManagerPage() {
  const { toast } = useToast();
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [showPageDialog, setShowPageDialog] = useState(false);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [editingPage, setEditingPage] = useState<Partial<SitePage> | null>(null);
  const [editingSection, setEditingSection] = useState<Partial<PageSection> | null>(null);
  const [editingBlock, setEditingBlock] = useState<Partial<SectionBlock> | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("adminToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch all pages
  const { data: pages = [], isLoading: pagesLoading, refetch: refetchPages } = useQuery<SitePage[]>({
    queryKey: ["/api/admin/site-pages"],
    queryFn: async () => {
      const res = await fetch("/api/admin/site-pages", {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch pages");
      return res.json();
    },
  });

  // Fetch selected page with sections and blocks
  const { data: pageData, isLoading: pageLoading, refetch: refetchPage } = useQuery<{
    page: SitePage;
    sections: PageSection[];
  }>({
    queryKey: ["/api/admin/site-pages", selectedPageId],
    queryFn: async () => {
      if (!selectedPageId) return null;
      const res = await fetch(`/api/admin/site-pages/${selectedPageId}`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch page");
      return res.json();
    },
    enabled: !!selectedPageId,
  });

  // Auto-select first page
  useEffect(() => {
    if (pages.length > 0 && !selectedPageId) {
      setSelectedPageId(pages[0].id);
    }
  }, [pages, selectedPageId]);

  // Seed pages mutation
  const seedPagesMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/seed-pages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      if (!res.ok) throw new Error("Failed to seed pages");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Default pages created" });
      refetchPages();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create pages", variant: "destructive" });
    },
  });

  // Create page mutation
  const createPageMutation = useMutation({
    mutationFn: async (data: Partial<SitePage>) => {
      const res = await fetch("/api/admin/site-pages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create page");
      }
      return res.json();
    },
    onSuccess: (newPage) => {
      toast({ title: "Success", description: "Page created" });
      refetchPages();
      setSelectedPageId(newPage.id);
      setShowPageDialog(false);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Update page mutation
  const updatePageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SitePage> }) => {
      const res = await fetch(`/api/admin/site-pages/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update page");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Page updated" });
      refetchPages();
      refetchPage();
      setShowPageDialog(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update page", variant: "destructive" });
    },
  });

  // Delete page mutation
  const deletePageMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/site-pages/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete page");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Page deleted" });
      setSelectedPageId(null);
      refetchPages();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Create section mutation
  const createSectionMutation = useMutation({
    mutationFn: async (data: Partial<PageSection>) => {
      const res = await fetch(`/api/admin/site-pages/${selectedPageId}/sections`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create section");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Section added" });
      refetchPage();
      setShowSectionDialog(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add section", variant: "destructive" });
    },
  });

  // Update section mutation
  const updateSectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PageSection> }) => {
      const res = await fetch(`/api/admin/sections/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update section");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Section updated" });
      refetchPage();
      setShowSectionDialog(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update section", variant: "destructive" });
    },
  });

  // Delete section mutation
  const deleteSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/sections/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete section");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Section removed" });
      refetchPage();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete section", variant: "destructive" });
    },
  });

  // Create block mutation
  const createBlockMutation = useMutation({
    mutationFn: async ({ sectionId, data }: { sectionId: string; data: Partial<SectionBlock> }) => {
      const res = await fetch(`/api/admin/sections/${sectionId}/blocks`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create block");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Block added" });
      refetchPage();
      setShowBlockDialog(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add block", variant: "destructive" });
    },
  });

  // Update block mutation
  const updateBlockMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SectionBlock> }) => {
      const res = await fetch(`/api/admin/blocks/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update block");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Block updated" });
      refetchPage();
      setShowBlockDialog(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update block", variant: "destructive" });
    },
  });

  // Delete block mutation
  const deleteBlockMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/blocks/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete block");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Block removed" });
      refetchPage();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete block", variant: "destructive" });
    },
  });

  // Reorder sections
  const reorderSectionsMutation = useMutation({
    mutationFn: async (sectionIds: string[]) => {
      const res = await fetch(`/api/admin/site-pages/${selectedPageId}/sections/reorder`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ sectionIds }),
      });
      if (!res.ok) throw new Error("Failed to reorder sections");
      return res.json();
    },
    onSuccess: () => {
      refetchPage();
    },
  });

  const moveSectionUp = (index: number) => {
    if (!pageData?.sections || index === 0) return;
    const newOrder = [...pageData.sections];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    reorderSectionsMutation.mutate(newOrder.map((s) => s.id));
  };

  const moveSectionDown = (index: number) => {
    if (!pageData?.sections || index === pageData.sections.length - 1) return;
    const newOrder = [...pageData.sections];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    reorderSectionsMutation.mutate(newOrder.map((s) => s.id));
  };

  const handleSavePage = () => {
    if (!editingPage) return;
    if (editingPage.id) {
      updatePageMutation.mutate({ id: editingPage.id, data: editingPage });
    } else {
      createPageMutation.mutate(editingPage);
    }
  };

  const handleSaveSection = () => {
    if (!editingSection) return;
    if (editingSection.id) {
      updateSectionMutation.mutate({ id: editingSection.id, data: editingSection });
    } else {
      createSectionMutation.mutate(editingSection);
    }
  };

  const handleSaveBlock = () => {
    if (!editingBlock || !selectedSectionId) return;
    if (editingBlock.id) {
      updateBlockMutation.mutate({ id: editingBlock.id, data: editingBlock });
    } else {
      createBlockMutation.mutate({ sectionId: selectedSectionId, data: editingBlock });
    }
  };

  const renderBlockContent = (block: SectionBlock) => {
    switch (block.blockType) {
      case "heading":
        return <h3 className="text-lg font-bold">{block.content || "Heading"}</h3>;
      case "text":
        return <p className="text-sm text-muted-foreground">{block.content || "Text content..."}</p>;
      case "image":
        return block.mediaUrl ? (
          <img src={block.mediaUrl} alt={block.mediaAlt || ""} className="max-h-24 object-cover rounded" />
        ) : (
          <div className="h-16 bg-muted rounded flex items-center justify-center text-muted-foreground">
            <ImageIcon className="h-6 w-6" />
          </div>
        );
      case "video":
        return (
          <div className="h-16 bg-muted rounded flex items-center justify-center text-muted-foreground">
            <VideoIcon className="h-6 w-6" />
            {block.mediaUrl && <span className="ml-2 text-xs truncate max-w-32">{block.mediaUrl}</span>}
          </div>
        );
      case "button":
        return (
          <Button size="sm" variant="outline">
            {block.content || "Button"}
          </Button>
        );
      case "spacer":
        return <div className="h-8 border-2 border-dashed border-muted rounded" />;
      case "divider":
        return <hr className="border-muted" />;
      case "html":
        return <div className="text-xs font-mono bg-muted p-2 rounded">&lt;HTML&gt;</div>;
      default:
        return <span>{block.blockType}</span>;
    }
  };

  if (pagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Website Pages Editor</h2>
          <p className="text-muted-foreground">Build and customize your website pages visually</p>
        </div>
        <div className="flex gap-2">
          {pages.length === 0 && (
            <Button
              onClick={() => seedPagesMutation.mutate()}
              disabled={seedPagesMutation.isPending}
              variant="outline"
              className="gap-2"
              data-testid="button-seed-pages"
            >
              <RefreshCw className={`h-4 w-4 ${seedPagesMutation.isPending ? "animate-spin" : ""}`} />
              Create Default Pages
            </Button>
          )}
          <Button
            onClick={() => {
              setEditingPage({ slug: "", title: "", isPublished: 0 });
              setShowPageDialog(true);
            }}
            className="gap-2"
            data-testid="button-add-page"
          >
            <Plus className="h-4 w-4" />
            New Page
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Pages List Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Pages
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-1 p-3">
                {pages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => setSelectedPageId(page.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between group ${
                      selectedPageId === page.id
                        ? "bg-primary text-primary-foreground"
                        : "hover-elevate"
                    }`}
                    data-testid={`button-page-${page.slug}`}
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span className="font-medium">{page.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {page.isPublished ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3 opacity-50" />
                      )}
                      {page.isSystemPage ? (
                        <Badge variant="secondary" className="text-xs px-1">System</Badge>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Page Editor */}
        <div className="lg:col-span-3 space-y-4">
          {selectedPageId && pageData ? (
            <>
              {/* Page Header */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {pageData.page.title}
                        {pageData.page.isPublished ? (
                          <Badge className="bg-green-500">Published</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">/{pageData.page.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingPage(pageData.page);
                          setShowPageDialog(true);
                        }}
                        data-testid="button-edit-page"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Settings
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/${pageData.page.slug === "home" ? "" : pageData.page.slug}`, "_blank")}
                        data-testid="button-preview-page"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      {!pageData.page.isSystemPage && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm("Delete this page?")) {
                              deletePageMutation.mutate(pageData.page.id);
                            }
                          }}
                          data-testid="button-delete-page"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Sections */}
              <div className="space-y-4">
                {pageData.sections.map((section, index) => (
                  <Card key={section.id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => moveSectionUp(index)}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => moveSectionDown(index)}
                              disabled={index === pageData.sections.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <div>
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Badge variant="outline">{section.sectionType}</Badge>
                              {section.title || `Section ${index + 1}`}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              {section.blocks.length} block{section.blocks.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSectionId(section.id);
                              setEditingBlock({ blockType: "text", content: "", alignment: "left", size: "medium" });
                              setShowBlockDialog(true);
                            }}
                            data-testid={`button-add-block-${section.id}`}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Block
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingSection(section);
                              setShowSectionDialog(true);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm("Delete this section and all its content?")) {
                                deleteSectionMutation.mutate(section.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {section.blocks.length === 0 ? (
                        <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center text-muted-foreground">
                          <p>No blocks in this section</p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => {
                              setSelectedSectionId(section.id);
                              setEditingBlock({ blockType: "text", content: "", alignment: "left", size: "medium" });
                              setShowBlockDialog(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Block
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {section.blocks.map((block) => (
                            <div
                              key={block.id}
                              className="flex items-center gap-3 p-3 border rounded-lg group hover-elevate"
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                              <Badge variant="secondary" className="text-xs">
                                {block.blockType}
                              </Badge>
                              <div className="flex-1 min-w-0">{renderBlockContent(block)}</div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    setSelectedSectionId(section.id);
                                    setEditingBlock(block);
                                    setShowBlockDialog(true);
                                  }}
                                >
                                  <Settings className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    if (confirm("Delete this block?")) {
                                      deleteBlockMutation.mutate(block.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Add Section Button */}
                <Button
                  variant="outline"
                  className="w-full h-16 border-2 border-dashed"
                  onClick={() => {
                    setEditingSection({ sectionType: "text", title: "", padding: "normal" });
                    setShowSectionDialog(true);
                  }}
                  data-testid="button-add-section"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Section
                </Button>
              </div>
            </>
          ) : (
            <Card className="h-64 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a page to edit</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Page Dialog */}
      <Dialog open={showPageDialog} onOpenChange={setShowPageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPage?.id ? "Edit Page" : "Create New Page"}</DialogTitle>
            <DialogDescription>
              {editingPage?.id ? "Update the page settings below." : "Configure your new page settings."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="page-title">Page Title</Label>
              <Input
                id="page-title"
                value={editingPage?.title || ""}
                onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                placeholder="About Us"
                data-testid="input-page-title"
              />
            </div>
            <div>
              <Label htmlFor="page-slug">URL Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">/</span>
                <Input
                  id="page-slug"
                  value={editingPage?.slug || ""}
                  onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                  placeholder="about-us"
                  data-testid="input-page-slug"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="page-description">Description (SEO)</Label>
              <Textarea
                id="page-description"
                value={editingPage?.description || ""}
                onChange={(e) => setEditingPage({ ...editingPage, description: e.target.value })}
                placeholder="Brief description for search engines..."
                data-testid="input-page-description"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="page-published"
                checked={!!editingPage?.isPublished}
                onCheckedChange={(checked) => setEditingPage({ ...editingPage, isPublished: checked ? 1 : 0 })}
              />
              <Label htmlFor="page-published">Published</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPageDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSavePage}
              disabled={!editingPage?.title || !editingPage?.slug}
              data-testid="button-save-page"
            >
              {editingPage?.id ? "Update" : "Create"} Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Dialog */}
      <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSection?.id ? "Edit Section" : "Add Section"}</DialogTitle>
            <DialogDescription>
              {editingSection?.id ? "Update the section settings." : "Choose a section type and configure it."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Section Type</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {SECTION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setEditingSection({ ...editingSection, sectionType: type.value })}
                    className={`p-3 rounded-lg border-2 text-center transition-colors ${
                      editingSection?.sectionType === type.value
                        ? "border-primary bg-primary/10"
                        : "border-muted hover-elevate"
                    }`}
                  >
                    <type.icon className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-xs">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="section-title">Section Title (optional)</Label>
              <Input
                id="section-title"
                value={editingSection?.title || ""}
                onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                placeholder="Our Features"
              />
            </div>
            <div>
              <Label htmlFor="section-padding">Padding</Label>
              <Select
                value={editingSection?.padding || "normal"}
                onValueChange={(val) => setEditingSection({ ...editingSection, padding: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="section-bg">Background Color (optional)</Label>
              <Input
                id="section-bg"
                value={editingSection?.backgroundColor || ""}
                onChange={(e) => setEditingSection({ ...editingSection, backgroundColor: e.target.value })}
                placeholder="#f5f5f5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSection} disabled={!editingSection?.sectionType}>
              {editingSection?.id ? "Update" : "Add"} Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBlock?.id ? "Edit Block" : "Add Block"}</DialogTitle>
            <DialogDescription>
              {editingBlock?.id ? "Update the block content." : "Choose a block type and add content."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Block Type</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {BLOCK_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setEditingBlock({ ...editingBlock, blockType: type.value })}
                    className={`p-2 rounded-lg border-2 text-center transition-colors ${
                      editingBlock?.blockType === type.value
                        ? "border-primary bg-primary/10"
                        : "border-muted hover-elevate"
                    }`}
                  >
                    <type.icon className="h-4 w-4 mx-auto mb-1" />
                    <span className="text-xs">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {(editingBlock?.blockType === "heading" || editingBlock?.blockType === "text" || editingBlock?.blockType === "button" || editingBlock?.blockType === "html") && (
              <div>
                <Label htmlFor="block-content">
                  {editingBlock.blockType === "heading" ? "Heading Text" : 
                   editingBlock.blockType === "button" ? "Button Text" :
                   editingBlock.blockType === "html" ? "HTML Code" : "Content"}
                </Label>
                {editingBlock.blockType === "text" || editingBlock.blockType === "html" ? (
                  <Textarea
                    id="block-content"
                    value={editingBlock?.content || ""}
                    onChange={(e) => setEditingBlock({ ...editingBlock, content: e.target.value })}
                    placeholder={editingBlock.blockType === "html" ? "<div>...</div>" : "Enter text..."}
                    rows={4}
                  />
                ) : (
                  <Input
                    id="block-content"
                    value={editingBlock?.content || ""}
                    onChange={(e) => setEditingBlock({ ...editingBlock, content: e.target.value })}
                    placeholder={editingBlock.blockType === "heading" ? "Enter heading..." : "Button text"}
                  />
                )}
              </div>
            )}

            {(editingBlock?.blockType === "image" || editingBlock?.blockType === "video") && (
              <>
                <div>
                  <Label htmlFor="block-media-url">
                    {editingBlock.blockType === "image" ? "Image URL" : "Video URL"}
                  </Label>
                  <Input
                    id="block-media-url"
                    value={editingBlock?.mediaUrl || ""}
                    onChange={(e) => setEditingBlock({ ...editingBlock, mediaUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                {editingBlock.blockType === "image" && (
                  <div>
                    <Label htmlFor="block-media-alt">Alt Text (accessibility)</Label>
                    <Input
                      id="block-media-alt"
                      value={editingBlock?.mediaAlt || ""}
                      onChange={(e) => setEditingBlock({ ...editingBlock, mediaAlt: e.target.value })}
                      placeholder="Description of image"
                    />
                  </div>
                )}
              </>
            )}

            {editingBlock?.blockType === "button" && (
              <div>
                <Label htmlFor="block-link-url">Link URL</Label>
                <Input
                  id="block-link-url"
                  value={editingBlock?.linkUrl || ""}
                  onChange={(e) => setEditingBlock({ ...editingBlock, linkUrl: e.target.value })}
                  placeholder="/courses or https://..."
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Alignment</Label>
                <Select
                  value={editingBlock?.alignment || "left"}
                  onValueChange={(val) => setEditingBlock({ ...editingBlock, alignment: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Size</Label>
                <Select
                  value={editingBlock?.size || "medium"}
                  onValueChange={(val) => setEditingBlock({ ...editingBlock, size: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="full">Full Width</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBlock} disabled={!editingBlock?.blockType}>
              {editingBlock?.id ? "Update" : "Add"} Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
