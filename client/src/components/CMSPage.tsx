import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
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

interface CMSPageProps {
  slug: string;
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
        <h2 className={`font-bold ${alignmentClass} ${sizeClass}`} data-testid={`cms-heading-${block.id}`}>
          {block.content}
        </h2>
      );

    case "text":
      return (
        <div 
          className={`prose prose-lg dark:prose-invert max-w-none ${alignmentClass} ${sizeClass}`}
          data-testid={`cms-text-${block.id}`}
          dangerouslySetInnerHTML={{ __html: block.content?.replace(/\n/g, "<br />") || "" }}
        />
      );

    case "image":
      if (!block.mediaUrl) return null;
      return (
        <div className={alignmentClass} data-testid={`cms-image-${block.id}`}>
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
          <div className={`aspect-video ${alignmentClass}`} data-testid={`cms-video-${block.id}`}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video content"
            />
          </div>
        );
      }
      return (
        <div className={alignmentClass} data-testid={`cms-video-${block.id}`}>
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
        <Button size="lg" className={alignmentClass === "text-center mx-auto" ? "mx-auto" : ""} data-testid={`cms-button-${block.id}`}>
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
      return <div className={height} aria-hidden="true" />;

    case "divider":
      return <hr className="border-border my-4" />;

    case "html":
      if (!block.content) return null;
      return (
        <div
          className={alignmentClass}
          data-testid={`cms-html-${block.id}`}
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

  const parseSettings = (settings: string | null): Record<string, unknown> => {
    if (!settings) return {};
    try {
      return JSON.parse(settings);
    } catch {
      return {};
    }
  };

  const sectionSettings = parseSettings(section.settings);
  const columnCount = (sectionSettings.columns as number) || Math.min(section.blocks.length, 4);

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
        const featureGridClass = columnCount === 2 ? "md:grid-cols-2" : 
                                 columnCount === 4 ? "md:grid-cols-2 lg:grid-cols-4" : 
                                 "md:grid-cols-2 lg:grid-cols-3";
        return (
          <div className="container mx-auto px-4">
            {section.title && (
              <h2 className="text-3xl font-bold text-center mb-12" data-testid={`cms-section-title-${section.id}`}>
                {section.title}
              </h2>
            )}
            <div className={`grid gap-6 md:gap-8 ${featureGridClass}`}>
              {section.blocks.map((block, index) => (
                <Card key={block.id} className="p-6 h-full flex flex-col" data-testid={`cms-feature-card-${index}`}>
                  <BlockRenderer block={block} />
                </Card>
              ))}
            </div>
          </div>
        );

      case "columns":
        const gridClass = columnCount === 2 ? "md:grid-cols-2" : 
                          columnCount === 3 ? "md:grid-cols-3" : 
                          columnCount === 4 ? "md:grid-cols-2 lg:grid-cols-4" : 
                          "md:grid-cols-2";
        return (
          <div className="container mx-auto px-4">
            {section.title && (
              <h2 className="text-3xl font-bold text-center mb-8" data-testid={`cms-section-title-${section.id}`}>
                {section.title}
              </h2>
            )}
            <div className={`grid gap-6 md:gap-8 ${gridClass}`}>
              {section.blocks.map((block) => (
                <div key={block.id} className="flex flex-col">
                  <BlockRenderer block={block} />
                </div>
              ))}
            </div>
          </div>
        );

      case "cta":
        const ctaBgClass = sectionSettings.variant === "primary" ? "bg-primary text-primary-foreground" : "";
        return (
          <div className={`container mx-auto px-4 ${ctaBgClass}`}>
            <div className="max-w-2xl mx-auto text-center space-y-4 py-8">
              {section.blocks.map((block) => (
                <BlockRenderer key={block.id} block={block} />
              ))}
            </div>
          </div>
        );

      case "gallery":
        const galleryColumns = (sectionSettings.columns as number) || 4;
        const galleryGridClass = galleryColumns === 2 ? "grid-cols-2" :
                                  galleryColumns === 3 ? "grid-cols-2 md:grid-cols-3" :
                                  "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
        return (
          <div className="container mx-auto px-4">
            {section.title && (
              <h2 className="text-3xl font-bold text-center mb-8" data-testid={`cms-section-title-${section.id}`}>
                {section.title}
              </h2>
            )}
            <div className={`grid gap-4 ${galleryGridClass}`}>
              {section.blocks.filter(b => b.blockType === "image").map((block, index) => (
                <div key={block.id} className="aspect-square overflow-hidden rounded-lg group" data-testid={`cms-gallery-image-${index}`}>
                  {block.mediaUrl && (
                    <img
                      src={block.mediaUrl}
                      alt={block.mediaAlt || ""}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
              <h2 className="text-3xl font-bold mb-8" data-testid={`cms-section-title-${section.id}`}>
                {section.title}
              </h2>
            )}
            <div className="space-y-6 max-w-4xl">
              {section.blocks.map((block) => (
                <BlockRenderer key={block.id} block={block} />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <section 
      className={`${paddingClass} ${section.backgroundImage ? "relative" : ""}`} 
      style={style}
      data-testid={`cms-section-${section.id}`}
      aria-label={section.title || `${section.sectionType} section`}
    >
      {section.backgroundImage && (
        <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      )}
      <div className={section.backgroundImage ? "relative z-10" : ""}>
        {renderSectionContent()}
      </div>
    </section>
  );
}

function usePageMeta(page: SitePage | null) {
  useEffect(() => {
    if (!page) return;

    const title = page.metaTitle || page.title;
    document.title = `${title} | FoundationCE`;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", page.description || "");

    if (page.metaKeywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", page.metaKeywords);
    }

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", title);

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement("meta");
      ogDescription.setAttribute("property", "og:description");
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute("content", page.description || "");

    if (page.ogImage) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement("meta");
        ogImage.setAttribute("property", "og:image");
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute("content", page.ogImage);
    }

    return () => {
      document.title = "FoundationCE";
    };
  }, [page]);
}

export default function CMSPage({ slug }: CMSPageProps) {
  const { data, isLoading, error } = useQuery<PageData | null>({
    queryKey: ["/api/pages", slug],
    queryFn: async () => {
      const res = await fetch(`/api/pages/${slug}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch page");
      }
      return res.json();
    },
    retry: false,
  });

  usePageMeta(data?.page || null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" role="status" aria-label="Loading page">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  if (!data.page.isPublished) {
    return null;
  }

  return (
    <main data-testid={`cms-page-${slug}`}>
      {data.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </main>
  );
}

export function CMSPageWrapper({ params }: { params: { slug: string } }) {
  return <CMSPage slug={params.slug} />;
}
