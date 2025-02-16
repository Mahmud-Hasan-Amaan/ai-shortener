import { NextResponse } from "next/server";
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

export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await getOrCreateUser();
    const { url } = await req.json();

    // Validate URL
    const validation = validateUrl(url);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    // Add safety check with metadata
    try {
      const metadata = await extractMetadata(url);
      const safetyResult = await analyzeSafety(url, metadata);

      if (!safetyResult.safe) {
        return NextResponse.json(
          {
            success: false,
            message: safetyResult.reason,
            details: {
              category: safetyResult.category,
              confidence: safetyResult.confidence,
              reason: safetyResult.reason,
            },
          },
          { status: 400 }
        );
      }

      // Continue with the rest of the URL processing...
    } catch (error) {
      console.error("Safety check failed:", error);
      return NextResponse.json(
        { success: false, message: "Failed to verify URL safety" },
        { status: 500 }
      );
    }

    // Check if the URL is already shortened by this specific user
    const existingUserUrl = (await Link.findOne({
      originalUrl: url,
      userId: user.clerkId,
    })
      .select("+qrCode")
      .lean()) as LinkDocument;

    if (existingUserUrl) {
      return NextResponse.json({
        success: true,
        shortUrl: `${process.env.NEXT_PUBLIC_HOST}/${existingUserUrl.shortCode}`,
        originalUrl: existingUserUrl.originalUrl,
        link: existingUserUrl,
        qrCode: existingUserUrl.qrCode,
        metadata: existingUserUrl.metadata,
        message: "URL information retrieved from database",
      });
    }

    // Generate metadata and AI content
    let metadata, aiContent;
    try {
      metadata = await extractMetadata(url);
      const aiInput = {
        url,
        metadata: {
          title: metadata.title || "",
          description: metadata.description || "",
        },
      };

      // Generate AI content
      aiContent = await generateAIContent(aiInput);

      // If the generated alias already exists, keep generating until we get a unique one
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 5;

      while (!isUnique && attempts < maxAttempts) {
        const existingAlias = await Link.findOne({
          shortCode: aiContent?.alias,
        });

        if (!existingAlias) {
          isUnique = true;
        } else {
          // Generate a new alias with a suffix
          const newAiContent = await generateAIContent({
            ...aiInput,
            attempt: attempts + 1, // Pass attempt number to AI for variation
          });
          aiContent = newAiContent;
        }
        attempts++;
      }

      // If we still don't have a unique alias, generate a random suffix
      if (!isUnique) {
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        if (aiContent) {
          aiContent.alias = `${aiContent.alias}-${randomSuffix}`;
        }
      }

      // Rest of your existing code for QR generation and saving...
      const logoBuffer = await getFaviconBuffer(url);
      if (!aiContent) throw new Error("Failed to generate content");
      const shortUrl = `${process.env.NEXT_PUBLIC_HOST}/${aiContent.alias}`;
      const qrCodeDataUrl = await generateQRCode(shortUrl, logoBuffer);

      // Save to database with the unique alias
      const link = await Link.create({
        userId: user.clerkId,
        originalUrl: url,
        shortCode: aiContent.alias,
        isActive: true,
        qrCode: qrCodeDataUrl,
        metadata: {
          title: metadata?.title || "Untitled",
          shortTitle:
            aiContent?.shortTitle ||
            metadata?.title?.substring(0, 50) ||
            "Untitled",
          description:
            metadata?.description ||
            aiContent?.enhancedDescription ||
            "No description",
          image: metadata?.image || null,
          keywords: metadata?.keywords || aiContent?.suggestedKeywords || [],
        },
      });

      const savedLink = (await Link.findById(link._id)
        .select("+qrCode")
        .lean()
        .exec()) as LinkDocument;

      if (!savedLink) {
        throw new Error("Failed to save link");
      }

      return NextResponse.json({
        success: true,
        shortUrl,
        originalUrl: url,
        qrCode: qrCodeDataUrl,
        metadata: savedLink.metadata,
        link: { ...savedLink, qrCode: qrCodeDataUrl },
      });
    } catch (error) {
      console.error("Error in generate route:", error);
      return NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Failed to generate short URL",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating short URL:", error);
    return NextResponse.json(
      { error: "Failed to create short URL" },
      { status: 500 }
    );
  }
}
