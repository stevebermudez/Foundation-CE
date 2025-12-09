import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Play,
  ExternalLink,
} from "lucide-react";

interface ContentBlock {
  id: string;
  lessonId: string;
  blockType: string;
  sortOrder: number;
  content: string | null;
  settings: string | null;
  isVisible: number | null;
}

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
  onBlockInteraction?: (blockId: string, interactionType: string, data?: any) => void;
}

export function ContentBlockRenderer({ blocks, onBlockInteraction }: ContentBlockRendererProps) {
  return (
    <div className="space-y-6">
      {blocks.map((block) => (
        <BlockComponent 
          key={block.id} 
          block={block} 
          onInteraction={onBlockInteraction}
        />
      ))}
    </div>
  );
}

function BlockComponent({ 
  block, 
  onInteraction 
}: { 
  block: ContentBlock; 
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
}) {
  const content = parseContent(block.content);
  const settings = parseContent(block.settings);

  const handleInteraction = (type: string, data?: any) => {
    onInteraction?.(block.id, type, data);
  };

  switch (block.blockType) {
    case "text":
      return <TextBlock content={content} />;
    case "heading":
      return <HeadingBlock content={content} />;
    case "image":
      return <ImageBlock content={content} />;
    case "video":
      return <VideoBlock content={content} onPlay={() => handleInteraction("video_play")} />;
    case "flashcard":
      return <FlashcardBlock content={content} onFlip={() => handleInteraction("flashcard_flip")} />;
    case "accordion":
      return <AccordionBlock content={content} />;
    case "tabs":
      return <TabsBlock content={content} />;
    case "callout":
      return <CalloutBlock content={content} />;
    case "divider":
      return <DividerBlock />;
    case "code":
      return <CodeBlock content={content} />;
    case "embed":
      return <EmbedBlock content={content} />;
    default:
      return null;
  }
}

function parseContent(content: string | null): any {
  if (!content) return {};
  try {
    return JSON.parse(content);
  } catch {
    return { text: content };
  }
}

function TextBlock({ content }: { content: any }) {
  return (
    <div className="prose dark:prose-invert max-w-none" data-testid="block-text">
      <p className="whitespace-pre-wrap">{content.text}</p>
    </div>
  );
}

function HeadingBlock({ content }: { content: any }) {
  const level = content.level || 2;
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const sizeClasses: Record<number, string> = {
    1: "text-3xl font-bold",
    2: "text-2xl font-semibold",
    3: "text-xl font-semibold",
    4: "text-lg font-medium",
  };

  return (
    <Tag className={`${sizeClasses[level] || sizeClasses[2]}`} data-testid="block-heading">
      {content.text}
    </Tag>
  );
}

function ImageBlock({ content }: { content: any }) {
  if (!content.url) return null;
  
  return (
    <figure className="my-4" data-testid="block-image">
      <img 
        src={content.url} 
        alt={content.alt || ""} 
        className="rounded-lg max-w-full h-auto mx-auto"
      />
      {content.caption && (
        <figcaption className="text-center text-sm text-muted-foreground mt-2">
          {content.caption}
        </figcaption>
      )}
    </figure>
  );
}

function VideoBlock({ content, onPlay }: { content: any; onPlay?: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  if (!content.url) return null;

  const getEmbedUrl = (url: string): string | null => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (url.includes("vimeo.com")) {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(content.url);

  if (!embedUrl) {
    return (
      <Card className="p-4" data-testid="block-video">
        <a 
          href={content.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <ExternalLink className="w-4 h-4" />
          Watch Video
        </a>
      </Card>
    );
  }

  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-black" data-testid="block-video">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => {
          if (!isPlaying) {
            setIsPlaying(true);
            onPlay?.();
          }
        }}
      />
      {content.caption && (
        <p className="text-center text-sm text-muted-foreground mt-2">
          {content.caption}
        </p>
      )}
    </div>
  );
}

function FlashcardBlock({ content, onFlip }: { content: any; onFlip?: () => void }) {
  const cards = content.cards || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledCards, setShuffledCards] = useState(cards);

  if (cards.length === 0) return null;

  const currentCard = shuffledCards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    onFlip?.();
  };

  const nextCard = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="space-y-4" data-testid="block-flashcard">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {shuffledCards.length}
        </span>
        <Button size="sm" variant="outline" onClick={shuffleCards}>
          <RotateCcw className="w-4 h-4 mr-1" /> Shuffle
        </Button>
      </div>
      
      <div 
        className="relative min-h-[200px] cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <Card 
          className={`absolute inset-0 flex items-center justify-center p-6 transition-all duration-500 transform ${
            isFlipped ? 'rotate-y-180 opacity-0' : ''
          }`}
        >
          <CardContent className="text-center text-lg font-medium">
            {currentCard?.front}
            {currentCard?.hint && !isFlipped && (
              <p className="text-sm text-muted-foreground mt-2">
                Hint: {currentCard.hint}
              </p>
            )}
          </CardContent>
        </Card>
        <Card 
          className={`absolute inset-0 flex items-center justify-center p-6 bg-primary/5 transition-all duration-500 transform ${
            isFlipped ? '' : 'rotate-y-180 opacity-0'
          }`}
        >
          <CardContent className="text-center text-lg">
            {currentCard?.back}
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Click the card to flip
      </p>

      <div className="flex justify-center gap-2">
        <Button 
          variant="outline" 
          onClick={prevCard} 
          disabled={currentIndex === 0}
          data-testid="button-prev-card"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>
        <Button 
          variant="outline" 
          onClick={nextCard} 
          disabled={currentIndex === shuffledCards.length - 1}
          data-testid="button-next-card"
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function AccordionBlock({ content }: { content: any }) {
  const items = content.items || [];
  
  if (items.length === 0) return null;

  return (
    <Accordion type={content.allowMultipleOpen ? "multiple" : "single"} collapsible data-testid="block-accordion">
      {items.map((item: any, index: number) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-left">
            {item.title}
          </AccordionTrigger>
          <AccordionContent>
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{item.content}</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function TabsBlock({ content }: { content: any }) {
  const tabs = content.tabs || [];
  
  if (tabs.length === 0) return null;

  return (
    <Tabs defaultValue={`tab-${content.defaultTab || 0}`} data-testid="block-tabs">
      <TabsList className="flex-wrap h-auto">
        {tabs.map((tab: any, index: number) => (
          <TabsTrigger key={index} value={`tab-${index}`}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab: any, index: number) => (
        <TabsContent key={index} value={`tab-${index}`} className="mt-4">
          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{tab.content}</p>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

function CalloutBlock({ content }: { content: any }) {
  const typeStyles: Record<string, { bg: string; border: string; icon: any }> = {
    info: { 
      bg: "bg-blue-50 dark:bg-blue-950", 
      border: "border-blue-500", 
      icon: Info 
    },
    warning: { 
      bg: "bg-yellow-50 dark:bg-yellow-950", 
      border: "border-yellow-500", 
      icon: AlertTriangle 
    },
    success: { 
      bg: "bg-green-50 dark:bg-green-950", 
      border: "border-green-500", 
      icon: CheckCircle2 
    },
    error: { 
      bg: "bg-red-50 dark:bg-red-950", 
      border: "border-red-500", 
      icon: XCircle 
    },
    tip: { 
      bg: "bg-purple-50 dark:bg-purple-950", 
      border: "border-purple-500", 
      icon: Lightbulb 
    },
  };

  const style = typeStyles[content.type] || typeStyles.info;
  const Icon = style.icon;

  return (
    <div 
      className={`p-4 rounded-lg border-l-4 ${style.bg} ${style.border}`}
      data-testid="block-callout"
    >
      <div className="flex gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          {content.title && (
            <p className="font-semibold mb-1">{content.title}</p>
          )}
          <p className="whitespace-pre-wrap">{content.content}</p>
        </div>
      </div>
    </div>
  );
}

function DividerBlock() {
  return <hr className="my-6 border-t" data-testid="block-divider" />;
}

function CodeBlock({ content }: { content: any }) {
  return (
    <div className="rounded-lg overflow-hidden" data-testid="block-code">
      <div className="bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
        {content.language || "code"}
      </div>
      <pre className="bg-muted/50 p-4 overflow-x-auto">
        <code className="text-sm font-mono">{content.code}</code>
      </pre>
    </div>
  );
}

function EmbedBlock({ content }: { content: any }) {
  if (content.html) {
    return (
      <div 
        className="rounded-lg overflow-hidden"
        dangerouslySetInnerHTML={{ __html: content.html }}
        data-testid="block-embed"
      />
    );
  }

  if (content.url) {
    return (
      <div className="aspect-video rounded-lg overflow-hidden" data-testid="block-embed">
        <iframe
          src={content.url}
          className="w-full h-full border-0"
          title={content.title || "Embedded content"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return null;
}

export default ContentBlockRenderer;
