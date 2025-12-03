import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Image as ImageIcon, Video as VideoIcon, Type, Save } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PageBlock {
  id: string;
  type: "text" | "image" | "video";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PageData {
  id: string;
  slug: string;
  title: string;
  blocks: PageBlock[];
  updatedAt: string;
}

const DEFAULT_PAGES = [
  { slug: "home", title: "Home" },
  { slug: "about", title: "About Us" },
  { slug: "courses", title: "Courses" },
  { slug: "contact", title: "Contact" },
  { slug: "pricing", title: "Pricing" },
];

export default function PagesManagerPage() {
  const { toast } = useToast();
  const [selectedPageSlug, setSelectedPageSlug] = useState<string>("home");
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const { data: pageData, isLoading } = useQuery({
    queryKey: [`/api/admin/pages/${selectedPageSlug}`],
    queryFn: async () => {
      const res = await fetch(`/api/admin/pages/${selectedPageSlug}`, { credentials: 'include' });
      if (res.status === 404) return { blocks: [] };
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/pages/${selectedPageSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ blocks }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Page saved successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/pages/${selectedPageSlug}`] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save page", variant: "destructive" });
    },
  });

  const handleAddBlock = (type: "text" | "image" | "video") => {
    const newBlock: PageBlock = {
      id: Math.random().toString(),
      type,
      content: type === "text" ? "Click to edit" : "",
      x: 50,
      y: 50 + blocks.length * 80,
      width: type === "video" ? 400 : 300,
      height: type === "video" ? 225 : type === "image" ? 200 : 100,
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    setSelectedBlock(null);
  };

  const handleMouseDown = (e: React.MouseEvent, blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    setIsDragging(blockId);
    setDragOffset({ x: e.clientX - block.x, y: e.clientY - block.y });
    setSelectedBlock(blockId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    setBlocks(
      blocks.map((b) =>
        b.id === isDragging ? { ...b, x: Math.max(0, newX), y: Math.max(0, newY) } : b
      )
    );
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  // Load page blocks when page changes
  if (pageData && pageData.blocks && JSON.stringify(pageData.blocks) !== JSON.stringify(blocks) && blocks.length === 0) {
    setBlocks(pageData.blocks);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Website Pages Editor</h2>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
          <Save className="h-4 w-4" />
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Pages List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {DEFAULT_PAGES.map((page) => (
              <button
                key={page.slug}
                onClick={() => {
                  setSelectedPageSlug(page.slug);
                  setBlocks([]);
                  setSelectedBlock(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedPageSlug === page.slug
                    ? "bg-blue-500 text-white"
                    : "bg-muted hover:bg-muted/80"
                }`}
                data-testid={`button-page-${page.slug}`}
              >
                {page.title}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Editor */}
        <div className="md:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {DEFAULT_PAGES.find((p) => p.slug === selectedPageSlug)?.title || "Page"}
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAddBlock("text")} variant="outline" className="gap-2">
                    <Type className="h-3 w-3" />
                    Text
                  </Button>
                  <Button size="sm" onClick={() => handleAddBlock("image")} variant="outline" className="gap-2">
                    <ImageIcon className="h-3 w-3" />
                    Image
                  </Button>
                  <Button size="sm" onClick={() => handleAddBlock("video")} variant="outline" className="gap-2">
                    <VideoIcon className="h-3 w-3" />
                    Video
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="relative w-full border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg overflow-hidden"
                style={{ minHeight: "600px" }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {blocks.map((block) => (
                  <BlockElement
                    key={block.id}
                    block={block}
                    isSelected={selectedBlock === block.id}
                    onSelect={() => setSelectedBlock(block.id)}
                    onDelete={() => handleDeleteBlock(block.id)}
                    onMouseDown={(e) => handleMouseDown(e, block.id)}
                  />
                ))}
                {blocks.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <p className="text-center">
                      Click buttons above to add text, images, or videos<br />
                      <span className="text-sm">Then drag to position elements</span>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedBlock && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Edit Element</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  const block = blocks.find((b) => b.id === selectedBlock);
                  if (!block) return null;

                  if (block.type === "text") {
                    return (
                      <div className="space-y-2">
                        <Label className="text-sm">Content</Label>
                        <Textarea
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, e.target.value)}
                          placeholder="Enter text..."
                          rows={3}
                        />
                      </div>
                    );
                  }

                  if (block.type === "image") {
                    return (
                      <div className="space-y-2">
                        <Label className="text-sm">Image URL</Label>
                        <Input
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          type="url"
                        />
                      </div>
                    );
                  }

                  if (block.type === "video") {
                    return (
                      <div className="space-y-2">
                        <Label className="text-sm">Video URL</Label>
                        <Input
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, e.target.value)}
                          placeholder="https://example.com/video.mp4"
                          type="url"
                        />
                      </div>
                    );
                  }
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function BlockElement({
  block,
  isSelected,
  onSelect,
  onDelete,
  onMouseDown,
}: {
  block: PageBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className={`absolute cursor-move transition-all ${
        isSelected ? "ring-2 ring-blue-500 ring-offset-2" : "hover:ring-1 hover:ring-gray-400"
      } rounded-lg group`}
      style={{
        left: `${block.x}px`,
        top: `${block.y}px`,
        width: `${block.width}px`,
        height: `${block.height}px`,
      }}
      onClick={onSelect}
      onMouseDown={onMouseDown}
      data-testid={`block-${block.id}`}
    >
      {block.type === "text" && (
        <div className="w-full h-full bg-white border border-gray-200 p-3 rounded-lg flex items-center justify-center overflow-hidden">
          <p className="text-sm font-medium text-gray-700 line-clamp-3">{block.content || "Text..."}</p>
        </div>
      )}
      {block.type === "image" && (
        <div className="w-full h-full bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
          {block.content ? (
            <img src={block.content} alt="page content" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <ImageIcon className="h-8 w-8 text-gray-400" />
          )}
        </div>
      )}
      {block.type === "video" && (
        <div className="w-full h-full bg-black border border-gray-200 rounded-lg flex items-center justify-center">
          {block.content ? (
            <video src={block.content} className="w-full h-full object-cover rounded-lg" controls />
          ) : (
            <VideoIcon className="h-8 w-8 text-gray-600" />
          )}
        </div>
      )}
      {isSelected && (
        <button
          className="absolute -top-8 left-0 p-1 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          data-testid={`button-delete-block-${block.id}`}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
