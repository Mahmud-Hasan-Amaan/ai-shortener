import { load } from "cheerio";
import { MetadataResult } from "@/types";

export async function extractMetadata(url: string): Promise<MetadataResult> {
  try {
    console.log("Starting metadata extraction for:", url);

    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // If response is not ok, try to extract information from the URL itself
    if (!response.ok) {
      console.log(
        `Failed to fetch URL (${response.status}), using fallback extraction`
      );
      return extractFallbackMetadata(url);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("text/html")) {
      return extractFallbackMetadata(url);
    }

    const html = await response.text();
    const $ = load(html);

    // Get website domain for favicon
    const urlObject = new URL(url);
    const domain = urlObject.origin;
    console.log("Domain:", domain);

    // Find favicon in different possible locations
    let favicon =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="apple-touch-icon"]').attr("href") ||
      `/favicon.ico`;

    console.log("Initial favicon path:", favicon);

    // If favicon is a relative path, make it absolute
    if (favicon && !favicon.startsWith("http")) {
      favicon = favicon.startsWith("/")
        ? `${domain}${favicon}`
        : `${domain}/${favicon}`;
      console.log("Converted to absolute path:", favicon);
    }

    // If no favicon found, try Google Favicon service
    if (!favicon) {
      favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      console.log("Using Google favicon service:", favicon);
    }

    const metadata = {
      title:
        $("title").first().text() ||
        $('meta[property="og:title"]').attr("content") ||
        extractTitleFromUrl(url),
      description:
        $('meta[name="description"]').attr("content") ||
        $('meta[property="og:description"]').attr("content") ||
        "",
      image: $('meta[property="og:image"]').attr("content") || "",
      favicon: favicon,
      keywords: $('meta[name="keywords"]').attr("content") || "",
      content: $("body").text().trim().substring(0, 1000) || "",
    };

    // Validate extracted metadata
    if (!metadata.title || metadata.title === "Error") {
      return extractFallbackMetadata(url);
    }

    return metadata;
  } catch (error) {
    console.error("Failed to extract metadata:", error);
    return extractFallbackMetadata(url);
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
