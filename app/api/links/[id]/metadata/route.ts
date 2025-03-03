import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Link from "@/models/Link";
import { Groq } from "groq-sdk";
import { extractMetadata } from "@/lib/metadata";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await req.json();

    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find and verify link ownership
    const link = await Link.findOne({
      _id: params.id,
      userId,
    }).lean();

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Get base metadata
    const baseMetadata = await extractMetadata(url);

    // Generate AI enhanced metadata
    const prompt = `Enhance this metadata for SEO:
      Title: ${baseMetadata.title}
      Description: ${baseMetadata.description}
      URL: ${url}

      Return only valid JSON in this format:
      {
        "title": "enhanced title",
        "description": "enhanced description",
        "keywords": ["keyword1", "keyword2"],
        "category": "content category"
      }`;

    const completion = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "system",
          content:
            "You are an SEO metadata expert. Respond only with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const aiMetadata = JSON.parse(
      completion.choices[0]?.message?.content || "{}"
    );

    // Update link with combined metadata
    const updatedLink = await Link.findByIdAndUpdate(
      params.id,
      {
        $set: {
          originalUrl: url,
          metadata: {
            ...baseMetadata,
            title: aiMetadata.title || baseMetadata.title,
            description: aiMetadata.description || baseMetadata.description,
            keywords: aiMetadata.keywords || baseMetadata.keywords,
            classification: aiMetadata.category || "Web Content",
            updatedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      originalUrl: updatedLink.originalUrl,
      metadata: updatedLink.metadata,
    });
  } catch (error) {
    console.error("Metadata update error:", error);
    return NextResponse.json(
      { error: "Failed to update metadata" },
      { status: 500 }
    );
  }
}
