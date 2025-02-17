import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Link from "@/models/Link";
import { extractMetadata } from "@/lib/metadata";
import { generateAIContent } from "@/lib/ai";
import { analyzeSafety } from "@/lib/safety";
import { validateUrl } from "@/lib/utils/url";
import { getFaviconBuffer } from "@/lib/services/favicon";
import { generateQRCode } from "@/lib/services/qrcode";
import type {
  AIContent as AIContentType,
  LinkMetadata as LinkMetadataType,
} from "@/types/link";
import { getOrCreateUser } from "@/lib/utils/getOrCreateUser";
import { OpenAI } from "openai";
import QRCode from "qrcode";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type AIContent = AIContentType;
export type LinkMetadata = LinkMetadataType;

interface LinkDocument {
  _id: unknown;
  shortCode: string;
  originalUrl: string;
  qrCode: string;
  metadata: LinkMetadata;
  __v: number;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await req.json();
    const { isValid, error } = validateUrl(url);

    if (!isValid) {
      return NextResponse.json({ error }, { status: 400 });
    }

    // Fetch original metadata from URL
    const response = await fetch(url);
    const html = await response.text();
    const originalMetadata = extractMetadata(html); // You'll need to implement this

    // Generate AI-enhanced metadata
    const aiMetadata = await generateAIMetadata(url, originalMetadata);

    // Generate short code
    const shortCode = await generateUniqueShortCode(aiMetadata.shortTitle);

    // Generate QR code
    const shortUrl = `${process.env.NEXT_PUBLIC_HOST}/${shortCode}`;
    const qrCode = await QRCode.toDataURL(shortUrl);

    // Save to database
    await dbConnect();
    const link = new Link({
      userId,
      originalUrl: url,
      shortCode,
      metadata: {
        ...originalMetadata,
        ...aiMetadata,
        aiGenerated: true,
      },
    });
    await link.save();

    return NextResponse.json({
      success: true,
      shortUrl,
      originalUrl: url,
      metadata: link.metadata,
      qrCode,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate short URL" },
      { status: 500 }
    );
  }
}

async function generateAIMetadata(url: string, originalMetadata: any) {
  const prompt = `Analyze this URL and its original metadata to generate enhanced, SEO-friendly metadata:
URL: ${url}
Original Title: ${originalMetadata.title || ""}
Original Description: ${originalMetadata.description || ""}

Please provide:
1. A concise, catchy short title (max 50 chars)
2. An engaging, SEO-optimized description (max 160 chars)
3. Relevant keywords (max 5)
4. A category for this content
5. The target audience
6. Content safety rating (G, PG, PG-13, etc.)

Format the response as JSON.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are an AI expert in SEO and content analysis.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
  });

  const aiResponse = JSON.parse(completion.choices[0].message.content);

  return {
    shortTitle: aiResponse.shortTitle,
    description: aiResponse.description,
    keywords: aiResponse.keywords,
    category: aiResponse.category,
    targetAudience: aiResponse.targetAudience,
    safetyRating: aiResponse.safetyRating,
    aiAnalysis: {
      tone: aiResponse.tone,
      contentType: aiResponse.contentType,
      recommendations: aiResponse.recommendations,
    },
  };
}

async function generateUniqueShortCode(shortTitle: string) {
  // Convert short title to URL-friendly string
  let baseCode = shortTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 30);

  // Check if it exists and append random string if needed
  let shortCode = baseCode;
  let counter = 0;
  while (await Link.exists({ shortCode })) {
    counter++;
    shortCode = `${baseCode}-${counter}`;
  }

  return shortCode;
}
