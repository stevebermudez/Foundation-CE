import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  Trash2,
  Settings,
  Eye,
  EyeOff,
  Move,
  Copy,
  Edit2,
  Save,
  X,
  Image as ImageIcon,
  Video as VideoIcon,
  Type,
  Heading1,
  MousePointer,
  Code,
  Minus,
  Layout,
  Columns,
  LayoutGrid,
  AlignLeft,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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

interface VisualPageBuilderProps {
  sections: PageSection[];
  onSectionsChange: (sections: PageSection[]) => void;
  onSectionAdd?: (section: Partial<PageSection>) => void;
  onSectionUpdate: (sectionId: string, data: Partial<PageSection>) => void;
  onSectionDelete: (sectionId: string) => void;
  onBlockAdd: (sectionId: string, block: Partial<SectionBlock>) => void;
  onBlockUpdate: (blockId: string, data: Partial<SectionBlock>) => void;
  onBlockDelete: (blockId: string) => void;
  onBlockReorder: (sectionId: string, blockIds: string[]) => void;
  onSectionReorder: (sectionIds: string[]) => void;
}

// Sortable Section Component
function SortableSection({
  section,
  index,
  onUpdate,
  onDelete,
  onBlockAdd,
  onBlockUpdate,
  onBlockDelete,
  onBlockReorder,
  onMoveUp,
  onMoveDown,
}: {
  section: PageSection;
  index: number;
  onUpdate: (data: Partial<PageSection>) => void;
  onDelete: () => void;
  onBlockAdd: (block: Partial<SectionBlock>) => void;
  onBlockUpdate: (blockId: string, data: Partial<SectionBlock>) => void;
  onBlockDelete: (blockId: string) => void;
  onBlockReorder: (blockIds: string[]) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingBlock, setEditingBlock] = useState<SectionBlock | null>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const blockIds = section.blocks.map((b) => b.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative",
        isDragging && "z-50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="border-2 border-dashed border-transparent hover:border-primary/50 transition-all">
        {/* Section Header */}
        <div className="absolute -left-8 top-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={onMoveUp}
            disabled={index === 0}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={onMoveDown}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{section.sectionType}</Badge>
                  <span className="font-medium">{section.title || `Section ${index + 1}`}</span>
                  {section.isVisible === 0 && (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {section.blocks.length} block{section.blocks.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Visual Preview */}
          <div
            className={cn(
              "min-h-[200px] rounded-lg border-2 border-dashed p-6",
              section.backgroundColor && `bg-[${section.backgroundColor}]`
            )}
            style={{
              backgroundColor: section.backgroundColor || undefined,
              backgroundImage: section.backgroundImage ? `url(${section.backgroundImage})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <SectionBlocksEditor
              sectionId={section.id}
              blocks={section.blocks}
              onBlockAdd={onBlockAdd}
              onBlockUpdate={onBlockUpdate}
              onBlockDelete={onBlockDelete}
              onBlockReorder={onBlockReorder}
              onBlockEdit={(block) => {
                setEditingBlock(block);
                setShowBlockDialog(true);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section Settings Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>
          <SectionSettingsForm
            section={section}
            onSave={(data) => {
              onUpdate(data);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Block Edit Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Block</DialogTitle>
          </DialogHeader>
          {editingBlock && (
            <BlockSettingsForm
              block={editingBlock}
              onSave={(data) => {
                onBlockUpdate(editingBlock.id, data);
                setShowBlockDialog(false);
              }}
              onCancel={() => setShowBlockDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sortable Block Component
function SortableBlock({
  block,
  onEdit,
  onDelete,
}: {
  block: SectionBlock;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative border rounded-lg p-4 bg-background hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded mt-1"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {block.blockType}
            </Badge>
            {block.isVisible === 0 && (
              <EyeOff className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          <BlockPreview block={block} />
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit}>
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Section Blocks Editor with Drag-and-Drop
function SectionBlocksEditor({
  sectionId,
  blocks,
  onBlockAdd,
  onBlockUpdate,
  onBlockDelete,
  onBlockReorder,
  onBlockEdit,
}: {
  sectionId: string;
  blocks: SectionBlock[];
  onBlockAdd: (block: Partial<SectionBlock>) => void;
  onBlockUpdate: (blockId: string, data: Partial<SectionBlock>) => void;
  onBlockDelete: (blockId: string) => void;
  onBlockReorder: (blockIds: string[]) => void;
  onBlockEdit: (block: SectionBlock) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const blockIds = blocks.map((b) => b.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blockIds.indexOf(active.id as string);
      const newIndex = blockIds.indexOf(over.id as string);
      const newOrder = arrayMove(blocks, oldIndex, newIndex);
      onBlockReorder(newOrder.map((b) => b.id));
    }
  };

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center">
        <p className="text-muted-foreground mb-4">No blocks yet</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onBlockAdd({ blockType: "text", content: "", sortOrder: 0 })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add First Block
        </Button>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {blocks.map((block) => (
            <SortableBlock
              key={block.id}
              block={block}
              onEdit={() => onBlockEdit(block)}
              onDelete={() => onBlockDelete(block.id)}
            />
          ))}
        </div>
      </SortableContext>
      <div className="mt-4 pt-4 border-t">
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => onBlockAdd({ blockType: "text", content: "", sortOrder: blocks.length })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Block
        </Button>
      </div>
    </DndContext>
  );
}

// Block Preview Component
function BlockPreview({ block }: { block: SectionBlock }) {
  switch (block.blockType) {
    case "heading":
      return (
        <div className={cn(
          "font-bold",
          block.size === "small" && "text-lg",
          block.size === "medium" && "text-xl",
          block.size === "large" && "text-2xl",
          block.size === "full" && "text-3xl",
          block.alignment === "center" && "text-center",
          block.alignment === "right" && "text-right"
        )}>
          {block.content || "Heading"}
        </div>
      );
    case "text":
      return (
        <div className={cn(
          "text-sm text-muted-foreground",
          block.alignment === "center" && "text-center",
          block.alignment === "right" && "text-right"
        )}>
          {block.content || "Text content..."}
        </div>
      );
    case "image":
      return block.mediaUrl ? (
        <img
          src={block.mediaUrl}
          alt={block.mediaAlt || ""}
          className="max-h-32 object-cover rounded"
        />
      ) : (
        <div className="h-24 bg-muted rounded flex items-center justify-center">
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        </div>
      );
    case "video":
      return (
        <div className="h-24 bg-muted rounded flex items-center justify-center">
          <VideoIcon className="h-6 w-6 text-muted-foreground" />
          {block.mediaUrl && <span className="ml-2 text-xs truncate">{block.mediaUrl}</span>}
        </div>
      );
    case "button":
      return (
        <Button size="sm" variant="outline">
          {block.content || "Button"}
        </Button>
      );
    default:
      return <span className="text-sm">{block.blockType}</span>;
  }
}

// Section Settings Form
function SectionSettingsForm({
  section,
  onSave,
  onCancel,
}: {
  section: PageSection;
  onSave: (data: Partial<PageSection>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<PageSection>>({
    sectionType: section.sectionType,
    title: section.title || "",
    backgroundColor: section.backgroundColor || "",
    backgroundImage: section.backgroundImage || "",
    padding: section.padding || "normal",
    isVisible: section.isVisible ?? 1,
  });

  return (
    <div className="space-y-4">
      <div>
        <Label>Section Type</Label>
        <Select
          value={formData.sectionType}
          onValueChange={(val) => setFormData({ ...formData, sectionType: val })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hero">Hero Banner</SelectItem>
            <SelectItem value="text">Text Content</SelectItem>
            <SelectItem value="features">Features Grid</SelectItem>
            <SelectItem value="cta">Call to Action</SelectItem>
            <SelectItem value="columns">Column Layout</SelectItem>
            <SelectItem value="gallery">Image Gallery</SelectItem>
            <SelectItem value="custom">Custom HTML</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Title (optional)</Label>
        <Input
          value={formData.title || ""}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Section title"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Background Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={formData.backgroundColor || "#ffffff"}
              onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
              className="w-20"
            />
            <Input
              value={formData.backgroundColor || ""}
              onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
              placeholder="#ffffff"
            />
          </div>
        </div>
        <div>
          <Label>Padding</Label>
          <Select
            value={formData.padding}
            onValueChange={(val) => setFormData({ ...formData, padding: val })}
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
      </div>
      <div>
        <Label>Background Image URL (optional)</Label>
        <Input
          value={formData.backgroundImage || ""}
          onChange={(e) => setFormData({ ...formData, backgroundImage: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={formData.isVisible === 1}
          onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked ? 1 : 0 })}
        />
        <Label>Visible</Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
}

// Block Settings Form
function BlockSettingsForm({
  block,
  onSave,
  onCancel,
}: {
  block: SectionBlock;
  onSave: (data: Partial<SectionBlock>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<SectionBlock>>({
    blockType: block.blockType,
    content: block.content || "",
    mediaUrl: block.mediaUrl || "",
    mediaAlt: block.mediaAlt || "",
    linkUrl: block.linkUrl || "",
    alignment: block.alignment || "left",
    size: block.size || "medium",
    isVisible: block.isVisible ?? 1,
  });

  return (
    <Tabs defaultValue="content" className="w-full">
      <TabsList>
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="style">Style</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="space-y-4">
        <div>
          <Label>Block Type</Label>
          <Select
            value={formData.blockType}
            onValueChange={(val) => setFormData({ ...formData, blockType: val })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="heading">Heading</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="button">Button</SelectItem>
              <SelectItem value="spacer">Spacer</SelectItem>
              <SelectItem value="divider">Divider</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(formData.blockType === "heading" || formData.blockType === "text" || formData.blockType === "button") && (
          <div>
            <Label>
              {formData.blockType === "heading" ? "Heading Text" :
               formData.blockType === "button" ? "Button Text" : "Content"}
            </Label>
            {formData.blockType === "text" ? (
              <Textarea
                value={formData.content || ""}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                placeholder="Enter text content..."
              />
            ) : (
              <Input
                value={formData.content || ""}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder={formData.blockType === "heading" ? "Enter heading..." : "Button text"}
              />
            )}
          </div>
        )}

        {(formData.blockType === "image" || formData.blockType === "video") && (
          <>
            <div>
              <Label>{formData.blockType === "image" ? "Image URL" : "Video URL"}</Label>
              <Input
                value={formData.mediaUrl || ""}
                onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            {formData.blockType === "image" && (
              <div>
                <Label>Alt Text</Label>
                <Input
                  value={formData.mediaAlt || ""}
                  onChange={(e) => setFormData({ ...formData, mediaAlt: e.target.value })}
                  placeholder="Image description"
                />
              </div>
            )}
          </>
        )}

        {formData.blockType === "button" && (
          <div>
            <Label>Link URL</Label>
            <Input
              value={formData.linkUrl || ""}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              placeholder="/courses or https://..."
            />
          </div>
        )}
      </TabsContent>

      <TabsContent value="style" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Alignment</Label>
            <Select
              value={formData.alignment}
              onValueChange={(val) => setFormData({ ...formData, alignment: val })}
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
              value={formData.size}
              onValueChange={(val) => setFormData({ ...formData, size: val })}
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
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.isVisible === 1}
            onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked ? 1 : 0 })}
          />
          <Label>Visible</Label>
        </div>
      </TabsContent>

      <TabsContent value="advanced" className="space-y-4">
        <div>
          <Label>Custom Settings (JSON)</Label>
          <Textarea
            value={formData.settings || ""}
            onChange={(e) => setFormData({ ...formData, settings: e.target.value })}
            placeholder='{"custom": "settings"}'
            rows={4}
          />
        </div>
      </TabsContent>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </Tabs>
  );
}

// Main Visual Page Builder Component
export default function VisualPageBuilder({
  sections,
  onSectionsChange,
  onSectionAdd,
  onSectionUpdate,
  onSectionDelete,
  onBlockAdd,
  onBlockUpdate,
  onBlockDelete,
  onBlockReorder,
  onSectionReorder,
}: VisualPageBuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionType, setNewSectionType] = useState<string>("text");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sectionIds = sections.map((s) => s.id);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sectionIds.indexOf(active.id as string);
      const newIndex = sectionIds.indexOf(over.id as string);
      const newOrder = arrayMove(sections, oldIndex, newIndex);
      onSectionReorder(newOrder.map((s) => s.id));
    }
    setActiveId(null);
  };

  const handleAddSection = () => {
    if (onSectionAdd) {
      onSectionAdd({
        sectionType: newSectionType,
        title: "",
        padding: "normal",
        sortOrder: sections.length,
        isVisible: 1,
        blocks: [],
      });
    }
    setShowAddSection(false);
  };

  return (
    <div className="space-y-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {sections.map((section, index) => (
              <SortableSection
                key={section.id}
                section={section}
                index={index}
                onUpdate={(data) => onSectionUpdate(section.id, data)}
                onDelete={() => onSectionDelete(section.id)}
                onBlockAdd={(block) => onBlockAdd(section.id, block)}
                onBlockUpdate={onBlockUpdate}
                onBlockDelete={onBlockDelete}
                onBlockReorder={(blockIds) => onBlockReorder(section.id, blockIds)}
                onMoveUp={() => {
                  if (index > 0) {
                    const newOrder = [...sections];
                    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
                    onSectionReorder(newOrder.map((s) => s.id));
                  }
                }}
                onMoveDown={() => {
                  if (index < sections.length - 1) {
                    const newOrder = [...sections];
                    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                    onSectionReorder(newOrder.map((s) => s.id));
                  }
                }}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <Card className="opacity-50 rotate-3">
              <CardHeader>
                <CardTitle className="text-sm">
                  {sections.find((s) => s.id === activeId)?.title || "Section"}
                </CardTitle>
              </CardHeader>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add Section Button */}
      <Button
        variant="outline"
        className="w-full h-20 border-2 border-dashed"
        onClick={() => setShowAddSection(true)}
      >
        <Plus className="h-5 w-5 mr-2" />
        Add Section
      </Button>

      {/* Add Section Dialog */}
      <Dialog open={showAddSection} onOpenChange={setShowAddSection}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Section Type</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { value: "hero", label: "Hero", icon: Layout },
                  { value: "text", label: "Text", icon: AlignLeft },
                  { value: "features", label: "Features", icon: LayoutGrid },
                  { value: "cta", label: "CTA", icon: MousePointer },
                  { value: "columns", label: "Columns", icon: Columns },
                  { value: "gallery", label: "Gallery", icon: ImageIcon },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setNewSectionType(type.value)}
                    className={cn(
                      "p-4 rounded-lg border-2 text-center transition-colors",
                      newSectionType === type.value
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    <type.icon className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddSection(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSection}>
                Add Section
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

