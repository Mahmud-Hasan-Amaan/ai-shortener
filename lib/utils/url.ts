export function normalizeDomain(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

export function validateUrl(url: string): { isValid: boolean; error?: string } {
  try {
    const urlObject = new URL(url);
    if (!["http:", "https:"].includes(urlObject.protocol)) {
      return {
        isValid: false,
        error:
          "Invalid URL. Please provide a URL starting with 'http://' or 'https://'",
      };
    }
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: `Invalid URL format. Please provide a valid URL. The Error is: ${error}`,
    };
  }
}
