export type ContentType = "article" | "social" | "video" | "product" | "other";

export function detectContentType(url: string): ContentType {
  const urlLower = url.toLowerCase();

  if (
    urlLower.includes("facebook.com") ||
    urlLower.includes("twitter.com") ||
    urlLower.includes("linkedin.com")
  ) {
    return "social";
  }

  if (urlLower.includes("youtube.com") || urlLower.includes("vimeo.com")) {
    return "video";
  }

  if (
    urlLower.includes("amazon.com") ||
    urlLower.includes("shop") ||
    urlLower.includes("product")
  ) {
    return "product";
  }

  if (
    urlLower.includes("blog") ||
    urlLower.includes("article") ||
    urlLower.includes("news")
  ) {
    return "article";
  }

  return "other";
}
