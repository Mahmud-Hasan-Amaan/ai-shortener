export interface AIContent {
  alias: string;
  shortTitle: string;
  enhancedTitle: string;
  enhancedDescription: string;
  suggestedKeywords: string[];
  image?: string;
}

export interface LinkMetadata {
  title: string;
  shortTitle: string;
  description: string;
  image: string | null;
  keywords: string[];
}

export interface GenerateResponse {
  success: boolean;
  shortUrl?: string;
  originalUrl?: string;
  qrCode?: string;
  metadata?: LinkMetadata;
  link?: string | URL;
  message?: string;
}
