import { load } from "cheerio";
import sharp from "sharp";
import { MetadataResult } from "@/types";

// Cache for metadata results
const metadataCache = new Map<
  string,
  { data: MetadataResult; timestamp: number }
>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

async function optimizeImage(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();

    const optimizedBuffer = await sharp(buffer)
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    return `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Image optimization failed:", error);
    return null;
  }
}

export async function extractMetadata(url: string): Promise<MetadataResult> {
  try {
    // Basic fallback metadata
    const fallbackMetadata = {
      title: "Untitled",
      description: "No description available",
      keywords: [],
      subject: "General",
      topic: "General",
      classification: "Web Content",
      language: "EN",
      author: "Unknown",
      copyright: `© ${new Date().getFullYear()}`,
      ogType: "website",
      ogSiteName: "Website",
      favicon: "https://www.google.com/s2/favicons?domain=unknown",
    };

    // Check if input is HTML instead of URL
    if (
      url.trim().startsWith("<!DOCTYPE html") ||
      url.trim().startsWith("<html")
    ) {
      const $ = load(url);
      return {
        ...fallbackMetadata,
        title:
          $("title").text() || $("h1").first().text() || fallbackMetadata.title,
        description:
          $('meta[name="description"]').attr("content") ||
          $('meta[property="og:description"]').attr("content") ||
          fallbackMetadata.description,
        favicon:
          $('link[rel="icon"]').attr("href") ||
          $('link[rel="shortcut icon"]').attr("href") ||
          fallbackMetadata.favicon,
      };
    }

    // Normal URL processing
    try {
      const urlObj = new URL(url);
      const response = await fetch(url);
      const html = await response.text();
      const $ = load(html);

      return {
        title:
          $('meta[property="og:title"]').attr("content") ||
          $("title").text() ||
          urlObj.hostname,
        description:
          $('meta[property="og:description"]').attr("content") ||
          $('meta[name="description"]').attr("content") ||
          `Content from ${urlObj.hostname}`,
        keywords:
          $('meta[name="keywords"]')
            .attr("content")
            ?.split(",")
            .map((k) => k.trim()) || [],
        subject: "General",
        topic: "General",
        classification: "Web Content",
        language: "EN",
        author: "Unknown",
        copyright: `© ${new Date().getFullYear()}`,
        ogType: $('meta[property="og:type"]').attr("content") || "website",
        ogSiteName:
          $('meta[property="og:site_name"]').attr("content") || urlObj.hostname,
        favicon:
          $('link[rel="icon"]').attr("href") ||
          $('link[rel="shortcut icon"]').attr("href") ||
          `https://www.google.com/s2/favicons?domain=${urlObj.hostname}`,
      };
    } catch (error) {
      console.error("URL processing error:", error);
      return fallbackMetadata;
    }
  } catch (error) {
    console.error("Metadata extraction error:", error);
    return fallbackMetadata;
  }
}

function extractFallbackMetadata(url: string): MetadataResult {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split("/").filter(Boolean);

    return {
      title: extractTitleFromUrl(url),
      description: `Content from ${urlObj.hostname}${urlObj.pathname}`,
      image: "",
      keywords: pathSegments.join(", "),
      content: `Content from ${urlObj.hostname}`,
    };
  } catch (error) {
    console.error("Fallback extraction failed:", error);
    return {
      title: "Untitled Content",
      description: "",
      image: "",
      keywords: "",
      content: "",
    };
  }
}

function extractTitle($: CheerioAPI): string {
  return (
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
    $("title").first().text() ||
    ""
  ).trim();
}

function extractDescription($: CheerioAPI): string {
  return (
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content") ||
    $('meta[name="twitter:description"]').attr("content") ||
    ""
  ).trim();
}

function extractKeywords($: CheerioAPI): string {
  return ($('meta[name="keywords"]').attr("content") || "").trim();
}

function extractAuthor($: CheerioAPI): string {
  return (
    $('meta[name="author"]').attr("content") ||
    $('meta[property="article:author"]').attr("content") ||
    ""
  ).trim();
}

function extractCopyright($: CheerioAPI): string {
  return (
    $('meta[name="copyright"]').attr("content") ||
    `© ${new Date().getFullYear()}`
  );
}

function extractSiteName($: CheerioAPI, url: string): string {
  return (
    $('meta[property="og:site_name"]').attr("content") || new URL(url).hostname
  );
}

function extractContent($: CheerioAPI): string {
  return $("body").text().replace(/\s+/g, " ").trim().substring(0, 1000);
}

function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split("/").filter(Boolean);

    if (pathSegments.length > 0) {
      // Convert last path segment to title case
      const lastSegment = pathSegments[pathSegments.length - 1]
        .replace(/[-_]/g, " ")
        .replace(/\.[^/.]+$/, "") // Remove file extension
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");

      return lastSegment || urlObj.hostname;
    }

    return urlObj.hostname;
  } catch {
    return "Untitled";
  }
}
