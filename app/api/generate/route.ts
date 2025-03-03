import { Groq } from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Link from "@/models/Link";
import { extractMetadata } from "@/lib/metadata";
import { generateQRCode } from "@/lib/services/qrcode";
import type {
  AIContent as AIContentType,
  LinkMetadata as LinkMetadataType,
} from "@/types/link";
import { getOrCreateUser } from "@/lib/utils/getOrCreateUser";
import QRCode from "qrcode";
import { validateUrl } from "@/lib/utils";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
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

async function generateAIMetadata(url: string, originalMetadata: any) {
  const prompt = `Given this URL and metadata, generate enhanced SEO content.
    URL: ${url}
    Original Title: ${originalMetadata.title}
    Original Description: ${originalMetadata.description}

    Return a JSON object with exactly this structure:
    {
      "enhancedTitle": "string",
      "enhancedDescription": "string",
      "suggestedKeywords": ["string"],
      "category": "string"
    }`;

  try {
    const completion = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "system",
          content:
            "You are a metadata enhancement assistant. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}");

    return {
      title: result.enhancedTitle || originalMetadata.title,
      description: result.enhancedDescription || originalMetadata.description,
      keywords: result.suggestedKeywords || [],
      classification: result.category || "Web Content",
    };
  } catch (error) {
    console.error("AI generation error:", error);
    // Return original metadata if AI enhancement fails
    return {
      title: originalMetadata.title,
      description: originalMetadata.description,
      keywords: [],
      classification: "Web Content",
    };
  }
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
    const originalMetadata = await extractMetadata(url);

    // Generate AI-enhanced metadata
    const aiMetadata = await generateAIMetadata(url, originalMetadata);

    // Generate short code
    const shortCode = await generateUniqueShortCode(aiMetadata.title);

    // Generate QR code
    const shortUrl = `${process.env.NEXT_PUBLIC_HOST}/${shortCode}`;
    const qrCode = await QRCode.toDataURL(shortUrl);

    // Save to database
    await dbConnect();
    const link = await Link.create({
      userId,
      originalUrl: url,
      shortCode,
      metadata: {
        ...originalMetadata,
        ...aiMetadata,
        aiGenerated: true,
      },
      qrCode,
    });

    return NextResponse.json({
      success: true,
      linkId: link._id.toString(),
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

async function generateUniqueShortCode(shortTitle: string) {
  // Convert short title to URL-friendly string
  const baseCode = shortTitle
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
