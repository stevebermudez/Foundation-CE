import { useState, useMemo } from "react";
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
    case "inline_quiz":
      return <InlineQuizBlock content={content} onAnswer={(correct) => handleInteraction("quiz_answer", { correct })} />;
    case "fill_blank":
      return <FillBlankBlock content={content} onComplete={(correct) => handleInteraction("fill_blank_complete", { correct })} />;
    case "matching":
      return <MatchingBlock content={content} onComplete={(correct) => handleInteraction("matching_complete", { correct })} />;
    case "hotspot":
      return <HotspotBlock content={content} onComplete={(correct) => handleInteraction("hotspot_complete", { correct })} />;
    case "sorting":
      return <SortingBlock content={content} onComplete={(correct) => handleInteraction("sorting_complete", { correct })} />;
    case "timeline":
      return <TimelineBlock content={content} onComplete={(correct) => handleInteraction("timeline_complete", { correct })} />;
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

function InlineQuizBlock({ content, onAnswer }: { content: any; onAnswer?: (correct: boolean) => void }) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);

  const options = content.questionType === "true_false" 
    ? ["True", "False"] 
    : (content.options || []);
  const correctIndex = content.correctOptionIndex ?? 0;
  const isCorrect = selectedOption === correctIndex;

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setShowResult(true);
    setHasAttempted(true);
    onAnswer?.(isCorrect);
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setShowResult(false);
  };

  return (
    <Card className="p-4" data-testid="block-inline-quiz">
      <div className="space-y-4">
        <p className="font-medium text-lg">{content.question}</p>
        
        <div className="space-y-2">
          {options.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => !showResult && setSelectedOption(index)}
              disabled={showResult}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                showResult
                  ? index === correctIndex
                    ? 'bg-green-100 dark:bg-green-900 border-green-500'
                    : selectedOption === index
                    ? 'bg-red-100 dark:bg-red-900 border-red-500'
                    : 'bg-muted/50 border-muted'
                  : selectedOption === index
                  ? 'bg-primary/10 border-primary'
                  : 'bg-card border-muted hover:border-primary/50'
              }`}
              data-testid={`quiz-option-${index}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === index ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  {showResult && index === correctIndex && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  {showResult && selectedOption === index && index !== correctIndex && <XCircle className="w-4 h-4 text-red-600" />}
                </div>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>

        {!showResult ? (
          <Button 
            onClick={handleSubmit} 
            disabled={selectedOption === null}
            data-testid="button-submit-quiz"
          >
            Check Answer
          </Button>
        ) : (
          <div className="space-y-3">
            <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <><CheckCircle2 className="w-5 h-5 text-green-600" /><span className="font-medium text-green-800 dark:text-green-200">Correct!</span></>
                ) : (
                  <><XCircle className="w-5 h-5 text-red-600" /><span className="font-medium text-red-800 dark:text-red-200">Incorrect</span></>
                )}
              </div>
              {content.explanation && (
                <p className="mt-2 text-sm">{content.explanation}</p>
              )}
            </div>
            {content.allowRetry !== false && !isCorrect && (
              <Button variant="outline" onClick={handleRetry} data-testid="button-retry-quiz">
                Try Again
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function FillBlankBlock({ content, onComplete }: { content: any; onComplete?: (allCorrect: boolean) => void }) {
  const blanks = content.blanks || [];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const updateAnswer = (blankId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [blankId]: value }));
  };

  const checkAnswers = () => {
    const newResults: Record<string, boolean> = {};
    let allCorrect = true;

    blanks.forEach((blank: any, index: number) => {
      const userAnswer = answers[blank.id || `blank-${index}`]?.trim().toLowerCase() || "";
      const correctAnswer = blank.answer?.trim().toLowerCase() || "";
      const acceptableAnswers = (blank.acceptableAnswers || []).map((a: string) => a.trim().toLowerCase());
      
      const isCorrect = userAnswer === correctAnswer || acceptableAnswers.includes(userAnswer);
      newResults[blank.id || `blank-${index}`] = isCorrect;
      if (!isCorrect) allCorrect = false;
    });

    setResults(newResults);
    setShowResults(true);
    onComplete?.(allCorrect);
  };

  const handleRetry = () => {
    setAnswers({});
    setResults({});
    setShowResults(false);
  };

  const renderTextWithBlanks = () => {
    const text = content.text || "";
    const parts = text.split(/\{\{blank\}\}/gi);
    
    return (
      <div className="text-lg leading-relaxed">
        {parts.map((part: string, index: number) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && index < blanks.length && (
              <span className="inline-block mx-1">
                <input
                  type="text"
                  value={answers[blanks[index].id || `blank-${index}`] || ""}
                  onChange={(e) => updateAnswer(blanks[index].id || `blank-${index}`, e.target.value)}
                  disabled={showResults}
                  placeholder={blanks[index].hint || "..."}
                  className={`border-b-2 bg-transparent px-2 py-1 min-w-[100px] text-center focus:outline-none ${
                    showResults
                      ? results[blanks[index].id || `blank-${index}`]
                        ? 'border-green-500 text-green-700 dark:text-green-300'
                        : 'border-red-500 text-red-700 dark:text-red-300'
                      : 'border-muted-foreground focus:border-primary'
                  }`}
                  data-testid={`input-blank-${index}`}
                />
              </span>
            )}
          </span>
        ))}
      </div>
    );
  };

  const allCorrect = Object.values(results).every(r => r);

  return (
    <Card className="p-4" data-testid="block-fill-blank">
      <div className="space-y-4">
        {renderTextWithBlanks()}

        {!showResults ? (
          <Button onClick={checkAnswers} data-testid="button-check-blanks">
            Check Answers
          </Button>
        ) : (
          <div className="space-y-3">
            <div className={`p-3 rounded-lg ${allCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-amber-100 dark:bg-amber-900'}`}>
              <div className="flex items-center gap-2">
                {allCorrect ? (
                  <><CheckCircle2 className="w-5 h-5 text-green-600" /><span className="font-medium text-green-800 dark:text-green-200">All correct!</span></>
                ) : (
                  <><AlertTriangle className="w-5 h-5 text-amber-600" /><span className="font-medium text-amber-800 dark:text-amber-200">Some answers need correction</span></>
                )}
              </div>
            </div>
            {!allCorrect && content.allowRetry !== false && (
              <Button variant="outline" onClick={handleRetry} data-testid="button-retry-blanks">
                Try Again
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function MatchingBlock({ content, onComplete }: { content: any; onComplete?: (allCorrect: boolean) => void }) {
  const pairs = content.pairs || [];
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [shuffledRight, setShuffledRight] = useState<any[]>(() => {
    const items = [...pairs].map((p: any) => ({ id: p.id, right: p.right }));
    return items.sort(() => Math.random() - 0.5);
  });

  const matchedRightIds = useMemo(() => {
    const rightIds = new Set<string>();
    Object.values(matches).forEach(rightId => rightIds.add(rightId));
    return rightIds;
  }, [matches]);

  const handleLeftClick = (pairId: string) => {
    if (showResults) return;
    if (selectedLeft === pairId) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(pairId);
    }
  };

  const handleRightClick = (rightId: string) => {
    if (showResults || !selectedLeft) return;
    if (matchedRightIds.has(rightId)) return;
    
    setMatches(prev => ({ ...prev, [selectedLeft]: rightId }));
    setSelectedLeft(null);
  };

  const clearMatch = (leftId: string) => {
    if (showResults) return;
    setMatches(prev => {
      const newMatches = { ...prev };
      delete newMatches[leftId];
      return newMatches;
    });
  };

  const checkMatches = () => {
    setShowResults(true);
    const allCorrect = pairs.every((p: any) => matches[p.id] === p.id);
    onComplete?.(allCorrect);
  };

  const handleRetry = () => {
    setMatches({});
    setShowResults(false);
    setSelectedLeft(null);
    const items = [...pairs].map((p: any) => ({ id: p.id, right: p.right }));
    setShuffledRight(items.sort(() => Math.random() - 0.5));
  };

  const isMatchCorrect = (leftId: string) => {
    return matches[leftId] === leftId;
  };

  const getMatchedRightText = (leftId: string) => {
    const rightId = matches[leftId];
    if (!rightId) return null;
    const pair = pairs.find((p: any) => p.id === rightId);
    return pair?.right;
  };

  const allCorrect = showResults && pairs.every((p: any) => matches[p.id] === p.id);

  return (
    <Card className="p-4" data-testid="block-matching">
      <div className="space-y-4">
        {content.title && <h3 className="font-semibold text-lg">{content.title}</h3>}
        {content.instructions && <p className="text-muted-foreground">{content.instructions}</p>}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground mb-2">Terms</p>
            {pairs.map((pair: any) => (
              <div key={pair.id} className="relative">
                <button
                  onClick={() => matches[pair.id] && !showResults ? clearMatch(pair.id) : handleLeftClick(pair.id)}
                  disabled={showResults}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    showResults
                      ? isMatchCorrect(pair.id)
                        ? 'bg-green-100 dark:bg-green-900 border-green-500'
                        : matches[pair.id]
                        ? 'bg-red-100 dark:bg-red-900 border-red-500'
                        : 'bg-muted border-muted'
                      : selectedLeft === pair.id
                      ? 'bg-primary/20 border-primary ring-2 ring-primary'
                      : matches[pair.id]
                      ? 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700'
                      : 'bg-card border-muted hover:border-primary/50'
                  }`}
                  data-testid={`matching-left-${pair.id}`}
                >
                  <div className="font-medium">{pair.left}</div>
                  {matches[pair.id] && !showResults && (
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Matched (click to clear)</span>
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground mb-2">Definitions</p>
            {(shuffledRight.length ? shuffledRight : pairs.map((p: any) => ({ id: p.id, right: p.right }))).map((item: any) => (
              <button
                key={item.id}
                onClick={() => handleRightClick(item.id)}
                disabled={showResults || matchedRightIds.has(item.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  matchedRightIds.has(item.id)
                    ? 'bg-muted/50 border-muted text-muted-foreground cursor-not-allowed'
                    : selectedLeft
                    ? 'bg-card border-muted hover:border-primary hover:bg-primary/5'
                    : 'bg-card border-muted'
                }`}
                data-testid={`matching-right-${item.id}`}
              >
                {item.right}
              </button>
            ))}
          </div>
        </div>

        {!showResults ? (
          <Button 
            onClick={checkMatches} 
            disabled={Object.keys(matches).length !== pairs.length}
            data-testid="button-check-matches"
          >
            Check Matches
          </Button>
        ) : (
          <div className="space-y-3">
            <div className={`p-3 rounded-lg ${allCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <div className="flex items-center gap-2">
                {allCorrect ? (
                  <><CheckCircle2 className="w-5 h-5 text-green-600" /><span className="font-medium text-green-800 dark:text-green-200">Perfect! All matches are correct!</span></>
                ) : (
                  <><XCircle className="w-5 h-5 text-red-600" /><span className="font-medium text-red-800 dark:text-red-200">Some matches are incorrect</span></>
                )}
              </div>
            </div>
            {!allCorrect && content.allowRetry !== false && (
              <Button variant="outline" onClick={handleRetry} data-testid="button-retry-matches">
                Try Again
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function HotspotBlock({ content, onComplete }: { content: any; onComplete?: (allCorrect: boolean) => void }) {
  const hotspots = content.hotspots || [];
  const [clickedSpots, setClickedSpots] = useState<Set<string>>(new Set());
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const isQuizMode = content.mode === "quiz";
  const correctSpots = hotspots.filter((h: any) => h.isCorrect);

  const handleSpotClick = (spot: any) => {
    if (showResults) return;

    if (isQuizMode) {
      setClickedSpots(prev => {
        const newSet = new Set(prev);
        if (newSet.has(spot.id)) {
          newSet.delete(spot.id);
        } else {
          newSet.add(spot.id);
        }
        return newSet;
      });
    } else {
      setSelectedSpot(spot);
    }
  };

  const checkAnswers = () => {
    setShowResults(true);
    const userCorrect = Array.from(clickedSpots).filter(id => 
      hotspots.find((h: any) => h.id === id)?.isCorrect
    );
    const allCorrect = userCorrect.length === correctSpots.length && 
                       clickedSpots.size === correctSpots.length;
    onComplete?.(allCorrect);
  };

  const handleRetry = () => {
    setClickedSpots(new Set());
    setShowResults(false);
  };

  const allCorrect = showResults && 
    Array.from(clickedSpots).every(id => hotspots.find((h: any) => h.id === id)?.isCorrect) &&
    clickedSpots.size === correctSpots.length;

  return (
    <Card className="p-4" data-testid="block-hotspot">
      <div className="space-y-4">
        {content.title && <h3 className="font-semibold text-lg">{content.title}</h3>}
        {content.instructions && <p className="text-muted-foreground">{content.instructions}</p>}
        
        <div className="relative inline-block w-full">
          <img 
            src={content.imageUrl} 
            alt={content.imageAlt || "Interactive image"} 
            className="w-full rounded-lg"
          />
          {hotspots.map((spot: any) => (
            <button
              key={spot.id}
              onClick={() => handleSpotClick(spot)}
              style={{
                position: "absolute",
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                width: `${spot.width || 10}%`,
                height: `${spot.height || 10}%`,
                transform: "translate(-50%, -50%)",
              }}
              className={`rounded-full border-2 transition-all ${
                showResults
                  ? spot.isCorrect
                    ? clickedSpots.has(spot.id)
                      ? 'bg-green-500/50 border-green-500'
                      : 'bg-green-500/30 border-green-500 border-dashed'
                    : clickedSpots.has(spot.id)
                    ? 'bg-red-500/50 border-red-500'
                    : 'bg-transparent border-transparent'
                  : clickedSpots.has(spot.id)
                  ? 'bg-primary/50 border-primary'
                  : 'bg-primary/20 border-primary/50 hover:bg-primary/40'
              }`}
              data-testid={`hotspot-${spot.id}`}
            />
          ))}
        </div>

        {!isQuizMode && selectedSpot && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium">{selectedSpot.label}</h4>
            {selectedSpot.description && <p className="text-sm mt-1">{selectedSpot.description}</p>}
          </div>
        )}

        {isQuizMode && !showResults && (
          <Button onClick={checkAnswers} disabled={clickedSpots.size === 0} data-testid="button-check-hotspots">
            Check Answers
          </Button>
        )}

        {isQuizMode && showResults && (
          <div className="space-y-3">
            <div className={`p-3 rounded-lg ${allCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <div className="flex items-center gap-2">
                {allCorrect ? (
                  <><CheckCircle2 className="w-5 h-5 text-green-600" /><span className="font-medium text-green-800 dark:text-green-200">Perfect! You found all the correct spots!</span></>
                ) : (
                  <><XCircle className="w-5 h-5 text-red-600" /><span className="font-medium text-red-800 dark:text-red-200">Some spots are incorrect or missing</span></>
                )}
              </div>
            </div>
            {!allCorrect && content.allowRetry !== false && (
              <Button variant="outline" onClick={handleRetry} data-testid="button-retry-hotspots">
                Try Again
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function SortingBlock({ content, onComplete }: { content: any; onComplete?: (allCorrect: boolean) => void }) {
  const correctOrder = useMemo(() => {
    return [...(content.items || [])].sort((a, b) => a.correctPosition - b.correctPosition);
  }, [content.items]);

  const [items, setItems] = useState<any[]>(() => {
    const shuffled = [...(content.items || [])];
    shuffled.sort(() => Math.random() - 0.5);
    return shuffled;
  });
  const [showResults, setShowResults] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    if (showResults) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === items.length - 1) return;
    
    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setItems(newItems);
  };

  const checkOrder = () => {
    setShowResults(true);
    const allCorrect = items.every((item, index) => item.correctPosition === index + 1);
    onComplete?.(allCorrect);
  };

  const handleRetry = () => {
    const shuffled = [...(content.items || [])];
    shuffled.sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setShowResults(false);
  };

  const allCorrect = showResults && items.every((item, index) => item.correctPosition === index + 1);

  return (
    <Card className="p-4" data-testid="block-sorting">
      <div className="space-y-4">
        {content.title && <h3 className="font-semibold text-lg">{content.title}</h3>}
        {content.instructions && <p className="text-muted-foreground">{content.instructions}</p>}
        
        <div className="space-y-2">
          {items.map((item: any, index: number) => {
            const isCorrect = item.correctPosition === index + 1;
            return (
              <div
                key={item.id}
                draggable={!showResults}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  showResults
                    ? isCorrect
                      ? 'bg-green-100 dark:bg-green-900 border-green-500'
                      : 'bg-red-100 dark:bg-red-900 border-red-500'
                    : draggedIndex === index
                    ? 'bg-primary/20 border-primary'
                    : 'bg-card border-muted'
                } ${!showResults ? 'cursor-grab active:cursor-grabbing' : ''}`}
                data-testid={`sorting-item-${item.id}`}
              >
                {!showResults && (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveItem(index, "up")}
                      disabled={index === 0}
                      className="p-1 hover:bg-muted rounded disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4 rotate-90" />
                    </button>
                    <button
                      onClick={() => moveItem(index, "down")}
                      disabled={index === items.length - 1}
                      className="p-1 hover:bg-muted rounded disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </button>
                  </div>
                )}
                <span className="text-sm font-medium w-6 text-center">{index + 1}.</span>
                <span className="flex-1">{item.content}</span>
                {showResults && (
                  isCorrect 
                    ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                    : <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
            );
          })}
        </div>

        {!showResults ? (
          <Button onClick={checkOrder} data-testid="button-check-sorting">
            Check Order
          </Button>
        ) : (
          <div className="space-y-3">
            <div className={`p-3 rounded-lg ${allCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <div className="flex items-center gap-2">
                {allCorrect ? (
                  <><CheckCircle2 className="w-5 h-5 text-green-600" /><span className="font-medium text-green-800 dark:text-green-200">Perfect! All items are in the correct order!</span></>
                ) : (
                  <><XCircle className="w-5 h-5 text-red-600" /><span className="font-medium text-red-800 dark:text-red-200">Some items are in the wrong position</span></>
                )}
              </div>
            </div>
            {!allCorrect && content.allowRetry !== false && (
              <Button variant="outline" onClick={handleRetry} data-testid="button-retry-sorting">
                Try Again
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function TimelineBlock({ content, onComplete }: { content: any; onComplete?: (allCorrect: boolean) => void }) {
  const events = content.events || [];
  const isVertical = content.layout !== "horizontal";
  const isInteractive = content.isInteractive;

  const [orderedEvents, setOrderedEvents] = useState<any[]>(() => {
    if (isInteractive) {
      const shuffled = [...events];
      shuffled.sort(() => Math.random() - 0.5);
      return shuffled;
    }
    return events;
  });
  const [showResults, setShowResults] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    if (!isInteractive || showResults) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isInteractive || showResults) return;
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newEvents = [...orderedEvents];
    const draggedEvent = newEvents[draggedIndex];
    newEvents.splice(draggedIndex, 1);
    newEvents.splice(index, 0, draggedEvent);
    setOrderedEvents(newEvents);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const checkOrder = () => {
    setShowResults(true);
    const allCorrect = orderedEvents.every((event, index) => event.id === events[index].id);
    onComplete?.(allCorrect);
  };

  const handleRetry = () => {
    const shuffled = [...events];
    shuffled.sort(() => Math.random() - 0.5);
    setOrderedEvents(shuffled);
    setShowResults(false);
  };

  const allCorrect = showResults && orderedEvents.every((event, index) => event.id === events[index].id);

  if (!isInteractive) {
    return (
      <Card className="p-4" data-testid="block-timeline">
        <div className="space-y-4">
          {content.title && <h3 className="font-semibold text-lg">{content.title}</h3>}
          
          <div className={`relative ${isVertical ? 'space-y-4 pl-6' : 'flex gap-4 overflow-x-auto pb-4'}`}>
            {isVertical && (
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-primary/30" />
            )}
            {events.map((event: any, index: number) => (
              <div
                key={event.id}
                className={`relative ${isVertical ? '' : 'flex-shrink-0 w-64'}`}
              >
                {isVertical && (
                  <div className="absolute -left-6 top-2 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                )}
                <div className="p-3 bg-muted/50 rounded-lg">
                  {event.date && (
                    <span className="text-xs font-medium text-primary">{event.date}</span>
                  )}
                  <h4 className="font-medium">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4" data-testid="block-timeline">
      <div className="space-y-4">
        {content.title && <h3 className="font-semibold text-lg">{content.title}</h3>}
        {content.instructions && <p className="text-muted-foreground">{content.instructions}</p>}
        
        <div className="space-y-2">
          {orderedEvents.map((event: any, index: number) => {
            const correctIndex = events.findIndex((e: any) => e.id === event.id);
            const isCorrect = correctIndex === index;
            return (
              <div
                key={event.id}
                draggable={!showResults}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`p-3 rounded-lg border transition-colors ${
                  showResults
                    ? isCorrect
                      ? 'bg-green-100 dark:bg-green-900 border-green-500'
                      : 'bg-red-100 dark:bg-red-900 border-red-500'
                    : draggedIndex === index
                    ? 'bg-primary/20 border-primary'
                    : 'bg-card border-muted'
                } ${!showResults ? 'cursor-grab active:cursor-grabbing' : ''}`}
                data-testid={`timeline-event-${event.id}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium w-6 text-center">{index + 1}.</span>
                  <div className="flex-1">
                    {event.date && (
                      <span className="text-xs font-medium text-primary">{event.date}</span>
                    )}
                    <h4 className="font-medium">{event.title}</h4>
                  </div>
                  {showResults && (
                    isCorrect 
                      ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                      : <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!showResults ? (
          <Button onClick={checkOrder} data-testid="button-check-timeline">
            Check Order
          </Button>
        ) : (
          <div className="space-y-3">
            <div className={`p-3 rounded-lg ${allCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <div className="flex items-center gap-2">
                {allCorrect ? (
                  <><CheckCircle2 className="w-5 h-5 text-green-600" /><span className="font-medium text-green-800 dark:text-green-200">Perfect! Events are in the correct order!</span></>
                ) : (
                  <><XCircle className="w-5 h-5 text-red-600" /><span className="font-medium text-red-800 dark:text-red-200">Some events are in the wrong position</span></>
                )}
              </div>
            </div>
            {!allCorrect && content.allowRetry !== false && (
              <Button variant="outline" onClick={handleRetry} data-testid="button-retry-timeline">
                Try Again
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export default ContentBlockRenderer;
