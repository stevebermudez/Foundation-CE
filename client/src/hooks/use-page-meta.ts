import { useEffect } from "react";

interface PageMetaOptions {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
}

export function usePageMeta(options: PageMetaOptions) {
  useEffect(() => {
    // Update title
    document.title = `${options.title} | FoundationCE`;
    
    // Update meta description
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute("content", options.description);
    }

    // Update Open Graph tags
    const updateOGMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    updateOGMeta("og:title", options.ogTitle || options.title);
    updateOGMeta("og:description", options.ogDescription || options.description);
    updateOGMeta("og:type", options.ogType || "website");
    if (options.ogImage) {
      updateOGMeta("og:image", options.ogImage);
    }

    // Add canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.href);
  }, [options]);
}
