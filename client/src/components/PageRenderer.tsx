import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

interface SectionBlock {
  id: string;
  blockType: string;
  content: string | null;
  mediaUrl: string | null;
  mediaAlt: string | null;
  linkUrl: string | null;
  linkTarget: string | null;
  alignment: string | null;
  size: string | null;
  sortOrder: number;
  settings: string | null;
}

interface PageSection {
  id: string;
  sectionType: string;
  title: string | null;
  backgroundColor: string | null;
  backgroundImage: string | null;
  padding: string | null;
  sortOrder: number;
  settings: string | null;
  blocks: SectionBlock[];
}

interface SitePage {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  isPublished: number | null;
  metaTitle: string | null;
  metaKeywords: string | null;
  ogImage: string | null;
}

interface PageData {
  page: SitePage;
  sections: PageSection[];
}

interface PageRendererProps {
  slug: string;
  fallback?: React.ReactNode;
}

const getPaddingClass = (padding: string | null): string => {
  switch (padding) {
    case "none": return "py-0";
    case "small": return "py-4 md:py-6";
    case "normal": return "py-8 md:py-12";
    case "large": return "py-12 md:py-20";
    default: return "py-8 md:py-12";
  }
};

const getAlignmentClass = (alignment: string | null): string => {
  switch (alignment) {
    case "center": return "text-center mx-auto";
    case "right": return "text-right ml-auto";
    default: return "text-left";
  }
};

const getSizeClass = (size: string | null, blockType: string): string => {
  if (blockType === "heading") {
    switch (size) {
      case "small": return "text-lg md:text-xl";
      case "medium": return "text-2xl md:text-3xl";
      case "large": return "text-3xl md:text-4xl lg:text-5xl";
      case "full": return "text-4xl md:text-5xl lg:text-6xl";
      default: return "text-2xl md:text-3xl";
    }
  }
  if (blockType === "text") {
    switch (size) {
      case "small": return "text-sm";
      case "medium": return "text-base";
      case "large": return "text-lg md:text-xl";
      default: return "text-base";
    }
  }
  if (blockType === "image") {
    switch (size) {
      case "small": return "max-w-xs";
      case "medium": return "max-w-md";
      case "large": return "max-w-2xl";
      case "full": return "w-full";
      default: return "max-w-md";
    }
  }
  return "";
};

function BlockRenderer({ block }: { block: SectionBlock }) {
  const alignmentClass = getAlignmentClass(block.alignment);
  const sizeClass = getSizeClass(block.size, block.blockType);

  switch (block.blockType) {
    case "heading":
      return (
        <h2 className={`font-bold ${alignmentClass} ${sizeClass}`}>
          {block.content}
        </h2>
      );

    case "text":
      return (
        <div 
          className={`prose prose-lg dark:prose-invert max-w-none ${alignmentClass} ${sizeClass}`}
          dangerouslySetInnerHTML={{ __html: block.content?.replace(/\n/g, "<br />") || "" }}
        />
      );

    case "image":
      if (!block.mediaUrl) return null;
      return (
        <div className={alignmentClass}>
          <img
            src={block.mediaUrl}
            alt={block.mediaAlt || ""}
            className={`rounded-lg ${sizeClass} ${block.alignment === "center" ? "mx-auto" : ""}`}
          />
        </div>
      );

    case "video":
      if (!block.mediaUrl) return null;
      if (block.mediaUrl.includes("youtube.com") || block.mediaUrl.includes("youtu.be")) {
        const videoId = block.mediaUrl.includes("youtu.be")
          ? block.mediaUrl.split("/").pop()
          : new URL(block.mediaUrl).searchParams.get("v");
        return (
          <div className={`aspect-video ${alignmentClass}`}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
      return (
        <div className={alignmentClass}>
          <video
            src={block.mediaUrl}
            controls
            className={`rounded-lg ${sizeClass}`}
          />
        </div>
      );

    case "button":
      const isExternal = block.linkUrl?.startsWith("http");
      const ButtonComponent = (
        <Button size="lg" className={alignmentClass === "text-center mx-auto" ? "mx-auto" : ""}>
          {block.content || "Learn More"}
        </Button>
      );
      
      if (block.linkUrl) {
        if (isExternal) {
          return (
            <div className={alignmentClass}>
              <a href={block.linkUrl} target={block.linkTarget || "_blank"} rel="noopener noreferrer">
                {ButtonComponent}
              </a>
            </div>
          );
        }
        return (
          <div className={alignmentClass}>
            <Link href={block.linkUrl}>
              {ButtonComponent}
            </Link>
          </div>
        );
      }
      return <div className={alignmentClass}>{ButtonComponent}</div>;

    case "spacer":
      const height = block.size === "small" ? "h-4" : block.size === "large" ? "h-16" : "h-8";
      return <div className={height} />;

    case "divider":
      return <hr className="border-border my-4" />;

    case "html":
      if (!block.content) return null;
      return (
        <div
          className={alignmentClass}
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      );

    default:
      return null;
  }
}

function SectionRenderer({ section }: { section: PageSection }) {
  const paddingClass = getPaddingClass(section.padding);
  
  const style: React.CSSProperties = {};
  if (section.backgroundColor) {
    style.backgroundColor = section.backgroundColor;
  }
  if (section.backgroundImage) {
    style.backgroundImage = `url(${section.backgroundImage})`;
    style.backgroundSize = "cover";
    style.backgroundPosition = "center";
  }

  const renderSectionContent = () => {
    switch (section.sectionType) {
      case "hero":
        return (
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              {section.blocks.map((block) => (
                <BlockRenderer key={block.id} block={block} />
              ))}
            </div>
          </div>
        );

      case "features":
        return (
          <div className="container mx-auto px-4">
            {section.title && (
              <h2 className="text-3xl font-bold text-center mb-12">{section.title}</h2>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {section.blocks.map((block) => (
                <Card key={block.id} className="p-6">
                  <BlockRenderer block={block} />
                </Card>
              ))}
            </div>
          </div>
        );

      case "columns":
        const columnCount = Math.min(section.blocks.length, 4);
        const gridClass = columnCount === 2 ? "md:grid-cols-2" : 
                          columnCount === 3 ? "md:grid-cols-3" : 
                          columnCount === 4 ? "md:grid-cols-4" : "md:grid-cols-2";
        return (
          <div className="container mx-auto px-4">
            {section.title && (
              <h2 className="text-3xl font-bold text-center mb-8">{section.title}</h2>
            )}
            <div className={`grid gap-8 ${gridClass}`}>
              {section.blocks.map((block) => (
                <div key={block.id}>
                  <BlockRenderer block={block} />
                </div>
              ))}
            </div>
          </div>
        );

      case "cta":
        return (
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              {section.blocks.map((block) => (
                <BlockRenderer key={block.id} block={block} />
              ))}
            </div>
          </div>
        );

      case "gallery":
        return (
          <div className="container mx-auto px-4">
            {section.title && (
              <h2 className="text-3xl font-bold text-center mb-8">{section.title}</h2>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {section.blocks.filter(b => b.blockType === "image").map((block) => (
                <div key={block.id} className="aspect-square overflow-hidden rounded-lg">
                  {block.mediaUrl && (
                    <img
                      src={block.mediaUrl}
                      alt={block.mediaAlt || ""}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "text":
      case "custom":
      default:
        return (
          <div className="container mx-auto px-4">
            {section.title && (
              <h2 className="text-3xl font-bold mb-8">{section.title}</h2>
            )}
            <div className="space-y-6">
              {section.blocks.map((block) => (
                <BlockRenderer key={block.id} block={block} />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <section className={paddingClass} style={style}>
      {section.backgroundImage && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      <div className={section.backgroundImage ? "relative z-10" : ""}>
        {renderSectionContent()}
      </div>
    </section>
  );
}

export default function PageRenderer({ slug, fallback }: PageRendererProps) {
  const { data, isLoading, error } = useQuery<PageData>({
    queryKey: ["/api/pages", slug],
    queryFn: async () => {
      const res = await fetch(`/api/pages/${slug}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch page");
      }
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return fallback || null;
  }

  return (
    <>
      {data.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </>
  );
}
