import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Link from "@/models/Link";

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { oldUrl, newUrl } = await req.json();

    // Extract short codes from URLs
    const oldShortCode = oldUrl.split("/").pop();
    const newShortCode = newUrl.split("/").pop();

    // Check if new short code already exists
    const existingLink = await Link.findOne({
      shortCode: newShortCode,
      userId: { $ne: userId }, // Exclude current user's links
    });

    if (existingLink) {
      return NextResponse.json(
        { error: "This short URL is already taken" },
        { status: 400 }
      );
    }

    // Update the link
    const updatedLink = await Link.findOneAndUpdate(
      { shortCode: oldShortCode, userId },
      { shortCode: newShortCode },
      { new: true }
    );

    if (!updatedLink) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      shortUrl: newUrl,
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Failed to update link" },
      { status: 500 }
    );
  }
}
