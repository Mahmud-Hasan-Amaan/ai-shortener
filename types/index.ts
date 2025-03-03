export interface MetadataResult {
  title: string;
  description: string;
  image: string;
  keywords: string;
  content: string;
}

export interface AIGeneratedContent {
  alias: string;
  enhancedTitle: string;
  enhancedDescription: string;
  suggestedKeywords: string[];
}

export interface AIContentInput {
  url: string;
  rawMetadata?: {
    title?: string;
    description?: string;
    image?: string;
  };
  analysisType: "comprehensive" | "url_only";
  requirements: {
    shortTitle: {
      required: boolean;
      maxLength: number;
      style: string;
      generateFromContent: boolean;
    };
  };
}

export interface AIContent {
  alias: string;
  shortTitle: string;
  enhancedTitle: string;
  enhancedDescription: string;
  suggestedKeywords: string[];
  image?: string | null;
}

export interface AIPromptContext {
  url: string;
  metadata?: {
    title?: string;
    description?: string;
  };
  purpose: "shortening" | "insights";
  contentType?: "article" | "social" | "video" | "product" | "other";
}

export interface AIPromptRequirements {
  shortTitle: {
    required: boolean;
    maxLength: number;
    style: "concise" | "descriptive" | "branded";
    context: string;
  };
  enhancedDescription: {
    required: boolean;
    maxLength: number;
    tone: "professional" | "casual" | "technical";
  };
  keywords: {
    required: boolean;
    minCount: number;
    maxCount: number;
    relevance: "high" | "medium";
  };
}

export interface Metadata {
  title: string;
  shortTitle: string;
  description: string;
  image: string | null;
  keywords: string[];
}

export interface ErrorState {
  message: string;
  existingUrl?: string;
  existingShortUrl?: string;
  details?: {
    category: string;
    confidence: number;
  };
}

export type GenerateResponse = {
  success: boolean;
  shortUrl: string;
  metadata: Metadata;
  qrCode: string;
};
