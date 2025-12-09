import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff,
  Type,
  Heading1,
  Image,
  Video,
  Code,
  Layers,
  CreditCard,
  ChevronDown,
  LayoutList,
  AlertCircle,
  Minus,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  FolderOpen,
  Link,
  Check
} from "lucide-react";

interface ContentBlock {
  id: string;
  lessonId: string;
  blockType: string;
  sortOrder: number;
  content: string | null;
  settings: string | null;
  isVisible: number | null;
  createdAt: string;
  updatedAt: string;
}

interface BlockEditorProps {
  lessonId: string;
  lessonTitle: string;
  onClose: () => void;
}

const BLOCK_TYPES = [
  { type: "text", label: "Text", icon: Type, description: "Rich text content" },
  { type: "heading", label: "Heading", icon: Heading1, description: "Section heading (H1-H6)" },
  { type: "image", label: "Image", icon: Image, description: "Single image with caption" },
  { type: "video", label: "Video", icon: Video, description: "YouTube, Vimeo, or direct URL" },
  { type: "flashcard", label: "Flashcards", icon: CreditCard, description: "Interactive flip cards" },
  { type: "accordion", label: "Accordion", icon: ChevronDown, description: "Collapsible sections" },
  { type: "tabs", label: "Tabs", icon: LayoutList, description: "Tabbed content panels" },
  { type: "callout", label: "Callout", icon: AlertCircle, description: "Info/warning/tip boxes" },
  { type: "divider", label: "Divider", icon: Minus, description: "Visual separator" },
  { type: "code", label: "Code", icon: Code, description: "Code block with syntax" },
  { type: "embed", label: "Embed", icon: Layers, description: "iFrame or external content" },
];

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function BlockEditor({ lessonId, lessonTitle, onClose }: BlockEditorProps) {
  const { toast } = useToast();
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);

  const { data: blocks = [], isLoading } = useQuery<ContentBlock[]>({
    queryKey: ["/api/admin/lessons", lessonId, "blocks"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/lessons/${lessonId}/blocks`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createBlockMutation = useMutation({
    mutationFn: async (data: { blockType: string; content?: any; settings?: any }) => {
      const res = await fetch(`/api/admin/lessons/${lessonId}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create block");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Block added successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lessons", lessonId, "blocks"] });
      setShowAddBlock(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add block", variant: "destructive" });
    },
  });

  const updateBlockMutation = useMutation({
    mutationFn: async ({ blockId, data }: { blockId: string; data: any }) => {
      const res = await fetch(`/api/admin/blocks/${blockId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update block");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Block updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lessons", lessonId, "blocks"] });
      setEditingBlock(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update block", variant: "destructive" });
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: async (blockId: string) => {
      const res = await fetch(`/api/admin/blocks/${blockId}`, {
        method: "DELETE",
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete block");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Block deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lessons", lessonId, "blocks"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete block", variant: "destructive" });
    },
  });

  const duplicateBlockMutation = useMutation({
    mutationFn: async (blockId: string) => {
      const res = await fetch(`/api/admin/blocks/${blockId}/duplicate`, {
        method: "POST",
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to duplicate block");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Block duplicated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lessons", lessonId, "blocks"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to duplicate block", variant: "destructive" });
    },
  });

  const reorderBlocksMutation = useMutation({
    mutationFn: async (blockIds: string[]) => {
      const res = await fetch(`/api/admin/lessons/${lessonId}/blocks/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({ blockIds }),
      });
      if (!res.ok) throw new Error("Failed to reorder blocks");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lessons", lessonId, "blocks"] });
    },
  });

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newBlocks = [...blocks];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    reorderBlocksMutation.mutate(newBlocks.map(b => b.id));
  };

  const toggleVisibility = (block: ContentBlock) => {
    updateBlockMutation.mutate({
      blockId: block.id,
      data: { isVisible: block.isVisible === 1 ? 0 : 1 },
    });
  };

  const handleAddBlock = (blockType: string) => {
    const defaultContent = getDefaultContent(blockType);
    createBlockMutation.mutate({ blockType, content: defaultContent });
  };

  const getDefaultContent = (blockType: string): any => {
    switch (blockType) {
      case "text":
        return { text: "" };
      case "heading":
        return { text: "New Heading", level: 2 };
      case "image":
        return { url: "", alt: "", caption: "" };
      case "video":
        return { url: "", provider: "youtube", caption: "" };
      case "flashcard":
        return { cards: [{ front: "Front of card", back: "Back of card" }] };
      case "accordion":
        return { items: [{ title: "Section 1", content: "Content here...", isOpen: false }] };
      case "tabs":
        return { tabs: [{ label: "Tab 1", content: "Content here..." }], defaultTab: 0 };
      case "callout":
        return { type: "info", title: "", content: "Important information here..." };
      case "divider":
        return { style: "solid" };
      case "code":
        return { code: "", language: "javascript" };
      case "embed":
        return { url: "", html: "" };
      default:
        return {};
    }
  };

  const getBlockIcon = (blockType: string) => {
    const blockDef = BLOCK_TYPES.find(b => b.type === blockType);
    return blockDef?.icon || Type;
  };

  const getBlockLabel = (blockType: string) => {
    const blockDef = BLOCK_TYPES.find(b => b.type === blockType);
    return blockDef?.label || blockType;
  };

  const parseContent = (content: string | null): any => {
    if (!content) return {};
    try {
      return JSON.parse(content);
    } catch {
      return { text: content };
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Block Editor: {lessonTitle}
          </DialogTitle>
          <DialogDescription>
            Build your lesson content using interactive blocks. Drag to reorder, click to edit.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading blocks...</div>
          ) : blocks.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Layers className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No content blocks yet</p>
              <Button onClick={() => setShowAddBlock(true)} data-testid="button-add-first-block">
                <Plus className="w-4 h-4 mr-2" /> Add Your First Block
              </Button>
            </div>
          ) : (
            blocks.map((block, index) => {
              const BlockIcon = getBlockIcon(block.blockType);
              const content = parseContent(block.content);
              
              return (
                <Card 
                  key={block.id} 
                  className={`transition-opacity ${block.isVisible === 0 ? 'opacity-50' : ''}`}
                  data-testid={`block-${block.id}`}
                >
                  <div className="flex items-center gap-2 p-3 border-b bg-muted/30">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    <BlockIcon className="w-4 h-4" />
                    <span className="font-medium text-sm">{getBlockLabel(block.blockType)}</span>
                    <div className="flex-1" />
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => moveBlock(index, "up")}
                        disabled={index === 0}
                        data-testid={`button-move-up-${block.id}`}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => moveBlock(index, "down")}
                        disabled={index === blocks.length - 1}
                        data-testid={`button-move-down-${block.id}`}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleVisibility(block)}
                        data-testid={`button-toggle-visibility-${block.id}`}
                      >
                        {block.isVisible === 1 ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => duplicateBlockMutation.mutate(block.id)}
                        data-testid={`button-duplicate-${block.id}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteBlockMutation.mutate(block.id)}
                        data-testid={`button-delete-${block.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <CardContent 
                    className="p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => setEditingBlock(block)}
                  >
                    <BlockPreview blockType={block.blockType} content={content} />
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setShowAddBlock(true)} data-testid="button-add-block">
            <Plus className="w-4 h-4 mr-2" /> Add Block
          </Button>
          <Button onClick={onClose} data-testid="button-close-editor">
            Done
          </Button>
        </div>

        {showAddBlock && (
          <AddBlockDialog
            onSelect={handleAddBlock}
            onClose={() => setShowAddBlock(false)}
          />
        )}

        {editingBlock && (
          <EditBlockDialog
            block={editingBlock}
            onSave={(data) => updateBlockMutation.mutate({ blockId: editingBlock.id, data })}
            onClose={() => setEditingBlock(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function BlockPreview({ blockType, content }: { blockType: string; content: any }) {
  switch (blockType) {
    case "text":
      return (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {content.text || "Click to add text content..."}
        </p>
      );
    case "heading":
      return (
        <p className="font-semibold">
          {content.text || "Click to edit heading..."}
        </p>
      );
    case "image":
      return content.url ? (
        <div className="flex items-center gap-3">
          <img src={content.url} alt={content.alt || ""} className="w-16 h-16 object-cover rounded" />
          <span className="text-sm text-muted-foreground">{content.caption || "No caption"}</span>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Click to add image...</p>
      );
    case "video":
      return (
        <div className="flex items-center gap-2">
          <Video className="w-8 h-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {content.url || "Click to add video URL..."}
          </span>
        </div>
      );
    case "flashcard":
      return (
        <div className="flex items-center gap-2">
          <CreditCard className="w-8 h-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {content.cards?.length || 0} flashcard(s)
          </span>
        </div>
      );
    case "accordion":
      return (
        <div className="flex items-center gap-2">
          <ChevronDown className="w-8 h-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {content.items?.length || 0} accordion section(s)
          </span>
        </div>
      );
    case "tabs":
      return (
        <div className="flex items-center gap-2">
          <LayoutList className="w-8 h-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {content.tabs?.length || 0} tab(s)
          </span>
        </div>
      );
    case "callout":
      return (
        <div className={`p-2 rounded border-l-4 ${
          content.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' :
          content.type === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-950' :
          content.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-950' :
          content.type === 'tip' ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' :
          'border-blue-500 bg-blue-50 dark:bg-blue-950'
        }`}>
          <p className="text-sm">{content.title || content.type?.toUpperCase()}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{content.content}</p>
        </div>
      );
    case "divider":
      return <hr className="border-t" />;
    case "code":
      return (
        <pre className="text-xs bg-muted p-2 rounded overflow-hidden">
          <code className="line-clamp-2">{content.code || "// Click to add code..."}</code>
        </pre>
      );
    case "embed":
      return (
        <div className="flex items-center gap-2">
          <Layers className="w-8 h-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {content.url || "Click to add embed URL..."}
          </span>
        </div>
      );
    default:
      return <p className="text-sm text-muted-foreground">Unknown block type</p>;
  }
}

function AddBlockDialog({ onSelect, onClose }: { onSelect: (type: string) => void; onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Content Block</DialogTitle>
          <DialogDescription>Choose a block type to add to your lesson</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 py-4">
          {BLOCK_TYPES.map(({ type, label, icon: Icon, description }) => (
            <Card
              key={type}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => {
                onSelect(type);
                onClose();
              }}
              data-testid={`block-type-${type}`}
            >
              <CardContent className="p-4 text-center">
                <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditBlockDialog({ block, onSave, onClose }: { block: ContentBlock; onSave: (data: any) => void; onClose: () => void }) {
  const content = block.content ? JSON.parse(block.content) : {};
  const [formData, setFormData] = useState(content);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  const handleSave = () => {
    onSave({ content: formData });
  };

  const updateFormData = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const openMediaLibrary = (type: "image" | "video") => {
    setMediaType(type);
    setShowMediaLibrary(true);
  };

  const handleMediaSelect = (url: string, alt?: string) => {
    updateFormData("url", url);
    if (alt && mediaType === "image") {
      updateFormData("alt", alt);
    }
    setShowMediaLibrary(false);
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {BLOCK_TYPES.find(b => b.type === block.blockType)?.label || block.blockType}</DialogTitle>
          <DialogDescription>Modify the content of this block</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {block.blockType === "text" && (
            <div>
              <Label>Text Content</Label>
              <Textarea
                value={formData.text || ""}
                onChange={(e) => updateFormData("text", e.target.value)}
                rows={6}
                placeholder="Enter your text content here..."
                data-testid="input-text-content"
              />
            </div>
          )}

          {block.blockType === "heading" && (
            <>
              <div>
                <Label>Heading Text</Label>
                <Input
                  value={formData.text || ""}
                  onChange={(e) => updateFormData("text", e.target.value)}
                  placeholder="Enter heading text..."
                  data-testid="input-heading-text"
                />
              </div>
              <div>
                <Label>Heading Level</Label>
                <Select value={String(formData.level || 2)} onValueChange={(v) => updateFormData("level", parseInt(v))}>
                  <SelectTrigger data-testid="select-heading-level">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">H1 - Main Title</SelectItem>
                    <SelectItem value="2">H2 - Section</SelectItem>
                    <SelectItem value="3">H3 - Subsection</SelectItem>
                    <SelectItem value="4">H4 - Sub-subsection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {block.blockType === "image" && (
            <>
              <div>
                <Label>Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.url || ""}
                    onChange={(e) => updateFormData("url", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    data-testid="input-image-url"
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => openMediaLibrary("image")}
                    data-testid="button-browse-images"
                  >
                    <FolderOpen className="w-4 h-4 mr-1" /> Browse
                  </Button>
                </div>
              </div>
              {formData.url && (
                <div className="border rounded-lg p-2">
                  <img 
                    src={formData.url} 
                    alt={formData.alt || "Preview"} 
                    className="max-h-32 mx-auto rounded"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
              <div>
                <Label>Alt Text (for accessibility)</Label>
                <Input
                  value={formData.alt || ""}
                  onChange={(e) => updateFormData("alt", e.target.value)}
                  placeholder="Describe the image..."
                  data-testid="input-image-alt"
                />
              </div>
              <div>
                <Label>Caption (optional)</Label>
                <Input
                  value={formData.caption || ""}
                  onChange={(e) => updateFormData("caption", e.target.value)}
                  placeholder="Image caption..."
                  data-testid="input-image-caption"
                />
              </div>
            </>
          )}

          {block.blockType === "video" && (
            <>
              <div>
                <Label>Video URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.url || ""}
                    onChange={(e) => updateFormData("url", e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    data-testid="input-video-url"
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => openMediaLibrary("video")}
                    data-testid="button-browse-videos"
                  >
                    <FolderOpen className="w-4 h-4 mr-1" /> Browse
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports YouTube, Vimeo, or direct video URLs
                </p>
              </div>
              <div>
                <Label>Caption (optional)</Label>
                <Input
                  value={formData.caption || ""}
                  onChange={(e) => updateFormData("caption", e.target.value)}
                  placeholder="Video caption..."
                  data-testid="input-video-caption"
                />
              </div>
            </>
          )}

          {block.blockType === "flashcard" && (
            <FlashcardEditor cards={formData.cards || []} onChange={(cards) => updateFormData("cards", cards)} />
          )}

          {block.blockType === "accordion" && (
            <AccordionEditor items={formData.items || []} onChange={(items) => updateFormData("items", items)} />
          )}

          {block.blockType === "tabs" && (
            <TabsEditor tabs={formData.tabs || []} onChange={(tabs) => updateFormData("tabs", tabs)} />
          )}

          {block.blockType === "callout" && (
            <>
              <div>
                <Label>Type</Label>
                <Select value={formData.type || "info"} onValueChange={(v) => updateFormData("type", v)}>
                  <SelectTrigger data-testid="select-callout-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="tip">Tip</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title (optional)</Label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  placeholder="Callout title..."
                  data-testid="input-callout-title"
                />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  value={formData.content || ""}
                  onChange={(e) => updateFormData("content", e.target.value)}
                  rows={3}
                  placeholder="Callout content..."
                  data-testid="input-callout-content"
                />
              </div>
            </>
          )}

          {block.blockType === "code" && (
            <>
              <div>
                <Label>Language</Label>
                <Select value={formData.language || "javascript"} onValueChange={(v) => updateFormData("language", v)}>
                  <SelectTrigger data-testid="select-code-language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="css">CSS</SelectItem>
                    <SelectItem value="sql">SQL</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Code</Label>
                <Textarea
                  value={formData.code || ""}
                  onChange={(e) => updateFormData("code", e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                  placeholder="// Enter your code here..."
                  data-testid="input-code-content"
                />
              </div>
            </>
          )}

          {block.blockType === "embed" && (
            <>
              <div>
                <Label>Embed URL</Label>
                <Input
                  value={formData.url || ""}
                  onChange={(e) => updateFormData("url", e.target.value)}
                  placeholder="https://example.com/embed"
                  data-testid="input-embed-url"
                />
              </div>
              <div>
                <Label>Or paste HTML (optional)</Label>
                <Textarea
                  value={formData.html || ""}
                  onChange={(e) => updateFormData("html", e.target.value)}
                  rows={4}
                  placeholder="<iframe src='...'></iframe>"
                  data-testid="input-embed-html"
                />
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-edit">
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save-block">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </div>

        {showMediaLibrary && (
          <MediaLibraryDialog
            mediaType={mediaType}
            onSelect={handleMediaSelect}
            onClose={() => setShowMediaLibrary(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function FlashcardEditor({ cards, onChange }: { cards: any[]; onChange: (cards: any[]) => void }) {
  const addCard = () => {
    onChange([...cards, { front: "", back: "" }]);
  };

  const updateCard = (index: number, field: string, value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    onChange(newCards);
  };

  const removeCard = (index: number) => {
    onChange(cards.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Flashcards ({cards.length})</Label>
        <Button size="sm" onClick={addCard} data-testid="button-add-flashcard">
          <Plus className="w-4 h-4 mr-1" /> Add Card
        </Button>
      </div>
      {cards.map((card, index) => (
        <Card key={index} className="p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-sm font-medium">Card {index + 1}</span>
            <Button size="icon" variant="ghost" onClick={() => removeCard(index)} data-testid={`button-remove-card-${index}`}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Front</Label>
              <Textarea
                value={card.front || ""}
                onChange={(e) => updateCard(index, "front", e.target.value)}
                rows={2}
                placeholder="Question or term..."
                data-testid={`input-card-front-${index}`}
              />
            </div>
            <div>
              <Label className="text-xs">Back</Label>
              <Textarea
                value={card.back || ""}
                onChange={(e) => updateCard(index, "back", e.target.value)}
                rows={2}
                placeholder="Answer or definition..."
                data-testid={`input-card-back-${index}`}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function AccordionEditor({ items, onChange }: { items: any[]; onChange: (items: any[]) => void }) {
  const addItem = () => {
    onChange([...items, { title: "", content: "", isOpen: false }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Accordion Sections ({items.length})</Label>
        <Button size="sm" onClick={addItem} data-testid="button-add-accordion">
          <Plus className="w-4 h-4 mr-1" /> Add Section
        </Button>
      </div>
      {items.map((item, index) => (
        <Card key={index} className="p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-sm font-medium">Section {index + 1}</span>
            <Button size="icon" variant="ghost" onClick={() => removeItem(index)} data-testid={`button-remove-section-${index}`}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Title</Label>
              <Input
                value={item.title || ""}
                onChange={(e) => updateItem(index, "title", e.target.value)}
                placeholder="Section title..."
                data-testid={`input-section-title-${index}`}
              />
            </div>
            <div>
              <Label className="text-xs">Content</Label>
              <Textarea
                value={item.content || ""}
                onChange={(e) => updateItem(index, "content", e.target.value)}
                rows={3}
                placeholder="Section content..."
                data-testid={`input-section-content-${index}`}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function TabsEditor({ tabs, onChange }: { tabs: any[]; onChange: (tabs: any[]) => void }) {
  const addTab = () => {
    onChange([...tabs, { label: "", content: "" }]);
  };

  const updateTab = (index: number, field: string, value: string) => {
    const newTabs = [...tabs];
    newTabs[index] = { ...newTabs[index], [field]: value };
    onChange(newTabs);
  };

  const removeTab = (index: number) => {
    onChange(tabs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Tabs ({tabs.length})</Label>
        <Button size="sm" onClick={addTab} data-testid="button-add-tab">
          <Plus className="w-4 h-4 mr-1" /> Add Tab
        </Button>
      </div>
      {tabs.map((tab, index) => (
        <Card key={index} className="p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-sm font-medium">Tab {index + 1}</span>
            <Button size="icon" variant="ghost" onClick={() => removeTab(index)} data-testid={`button-remove-tab-${index}`}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Label</Label>
              <Input
                value={tab.label || ""}
                onChange={(e) => updateTab(index, "label", e.target.value)}
                placeholder="Tab label..."
                data-testid={`input-tab-label-${index}`}
              />
            </div>
            <div>
              <Label className="text-xs">Content</Label>
              <Textarea
                value={tab.content || ""}
                onChange={(e) => updateTab(index, "content", e.target.value)}
                rows={3}
                placeholder="Tab content..."
                data-testid={`input-tab-content-${index}`}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

interface MediaAsset {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  mimeType: string | null;
  thumbnailUrl: string | null;
  altText: string | null;
  createdAt: string;
}

function MediaLibraryDialog({ 
  onSelect, 
  onClose, 
  mediaType = "image" 
}: { 
  onSelect: (url: string, alt?: string) => void; 
  onClose: () => void;
  mediaType?: "image" | "video";
}) {
  const [newUrl, setNewUrl] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const { toast } = useToast();

  const { data: assets = [], isLoading } = useQuery<MediaAsset[]>({
    queryKey: ["/api/admin/media"],
    queryFn: async () => {
      const res = await fetch("/api/admin/media", {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const addMediaMutation = useMutation({
    mutationFn: async (data: { fileName: string; fileUrl: string; fileType: string; altText?: string }) => {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add media");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
      toast({ title: "Success", description: "Media added to library" });
    },
  });

  const filteredAssets = assets.filter(a => 
    mediaType === "image" 
      ? a.fileType === "image" || a.mimeType?.startsWith("image/")
      : a.fileType === "video" || a.mimeType?.startsWith("video/")
  );

  const handleAddUrl = () => {
    if (!newUrl) return;
    const fileName = newUrl.split("/").pop() || "media";
    addMediaMutation.mutate({
      fileName,
      fileUrl: newUrl,
      fileType: mediaType,
      altText: newAlt,
    });
    onSelect(newUrl, newAlt);
  };

  const handleSelectAsset = () => {
    if (selectedAsset) {
      onSelect(selectedAsset.fileUrl, selectedAsset.altText || "");
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Media Library - {mediaType === "image" ? "Images" : "Videos"}
          </DialogTitle>
          <DialogDescription>
            Select from your library or add a new URL
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Link className="w-4 h-4" /> Add from URL
            </Label>
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder={mediaType === "image" ? "https://example.com/image.jpg" : "https://youtube.com/watch?v=..."}
              data-testid="input-media-url"
            />
            {mediaType === "image" && (
              <Input
                value={newAlt}
                onChange={(e) => setNewAlt(e.target.value)}
                placeholder="Alt text (for accessibility)"
                data-testid="input-media-alt"
              />
            )}
            <Button 
              onClick={handleAddUrl} 
              disabled={!newUrl || addMediaMutation.isPending}
              className="w-full"
              data-testid="button-add-media-url"
            >
              <Plus className="w-4 h-4 mr-2" /> Add & Select
            </Button>
          </div>

          <div className="flex flex-col">
            <Label className="mb-2">Library ({filteredAssets.length})</Label>
            <ScrollArea className="flex-1 border rounded-lg p-2">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-4">Loading...</p>
              ) : filteredAssets.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No {mediaType}s in library yet
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {filteredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedAsset?.id === asset.id ? "border-primary" : "border-transparent hover:border-muted-foreground"
                      }`}
                      onClick={() => setSelectedAsset(asset)}
                      data-testid={`media-asset-${asset.id}`}
                    >
                      {mediaType === "image" ? (
                        <img
                          src={asset.thumbnailUrl || asset.fileUrl}
                          alt={asset.altText || asset.fileName}
                          className="w-full h-16 object-cover"
                        />
                      ) : (
                        <div className="w-full h-16 bg-muted flex items-center justify-center">
                          <Video className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      {selectedAsset?.id === asset.id && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSelectAsset} 
            disabled={!selectedAsset}
            data-testid="button-select-media"
          >
            <Check className="w-4 h-4 mr-2" /> Select
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
