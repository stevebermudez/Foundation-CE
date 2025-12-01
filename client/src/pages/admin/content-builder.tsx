import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, GripVertical, Image as ImageIcon, Video as VideoIcon, Type } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ContentBlock {
  id: string;
  type: "text" | "image" | "video";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ContentBuilderPage({ courseId }: { courseId: string }) {
  const { toast } = useToast();
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleAddBlock = (type: "text" | "image" | "video") => {
    const newBlock: ContentBlock = {
      id: Math.random().toString(),
      type,
      content: type === "text" ? "Click to edit" : "",
      x: 50,
      y: 50 + blocks.length * 80,
      width: type === "video" ? 400 : 300,
      height: type === "video" ? 225 : type === "image" ? 200 : 100,
    };
    setBlocks([...blocks, newBlock]);
    toast({ title: "Added", description: `${type} block added` });
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

  const saveContent = async () => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Saved", description: "Content saved successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/courses/${courseId}/content`] });
    } catch (err) {
      toast({ title: "Error", description: "Failed to save content", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Content Builder</h2>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleAddBlock("text")} className="gap-2">
            <Type className="h-4 w-4" />
            Text
          </Button>
          <Button size="sm" onClick={() => handleAddBlock("image")} className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Image
          </Button>
          <Button size="sm" onClick={() => handleAddBlock("video")} className="gap-2">
            <VideoIcon className="h-4 w-4" />
            Video
          </Button>
          <Button size="sm" onClick={saveContent} className="gap-2">
            Save Content
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div
            className="relative w-full border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg overflow-hidden"
            style={{ minHeight: "500px" }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {blocks.map((block) => (
              <ContentBlockElement
                key={block.id}
                block={block}
                isSelected={selectedBlock === block.id}
                onSelect={() => setSelectedBlock(block.id)}
                onDelete={() => handleDeleteBlock(block.id)}
                onContentChange={(content) => updateBlock(block.id, content)}
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
            <CardTitle className="text-sm">Edit Selected Element</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <BlockEditorPanel
              block={blocks.find((b) => b.id === selectedBlock)!}
              onUpdate={(content) => updateBlock(selectedBlock, content)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ContentBlockElement({
  block,
  isSelected,
  onSelect,
  onDelete,
  onContentChange,
  onMouseDown,
}: {
  block: ContentBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onContentChange: (content: string) => void;
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
    >
      {block.type === "text" && (
        <div className="w-full h-full bg-white border border-gray-200 p-3 rounded-lg flex items-center justify-center overflow-hidden">
          <p className="text-sm font-medium text-gray-700 line-clamp-3">{block.content || "Text..."}</p>
        </div>
      )}
      {block.type === "image" && (
        <div className="w-full h-full bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
          {block.content ? (
            <img src={block.content} alt="content" className="w-full h-full object-cover rounded-lg" />
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
        <div className="absolute -top-8 left-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="outline" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

function BlockEditorPanel({
  block,
  onUpdate,
}: {
  block: ContentBlock;
  onUpdate: (content: string) => void;
}) {
  if (block.type === "text") {
    return (
      <div className="space-y-2">
        <Label>Text Content</Label>
        <Textarea
          value={block.content}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="Enter your text here..."
          rows={4}
        />
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input
          value={block.content}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="https://example.com/image.jpg"
          type="url"
        />
      </div>
    );
  }

  if (block.type === "video") {
    return (
      <div className="space-y-2">
        <Label>Video URL</Label>
        <Input
          value={block.content}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="https://example.com/video.mp4"
          type="url"
        />
      </div>
    );
  }

  return null;
}
