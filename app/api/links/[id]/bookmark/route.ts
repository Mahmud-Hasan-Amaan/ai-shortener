import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Link from "@/models/Link";
import mongoose from "mongoose";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await the entire params object
    const { id: linkId } = await context.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return NextResponse.json({ error: "Invalid link ID" }, { status: 400 });
    }

    // First find the link to get its current bookmark status
    const existingLink = await Link.findOne({
      _id: linkId,
      userId,
    });

    if (!existingLink) {
      return NextResponse.json(
        { error: "Link not found or unauthorized" },
        { status: 404 }
      );
    }

    // Toggle the bookmark status
    const updatedLink = await Link.findOneAndUpdate(
      { _id: linkId, userId },
      { $set: { isBookmarked: !existingLink.isBookmarked } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      isBookmarked: updatedLink.isBookmarked,
    });
  } catch (error) {
    console.error("Failed to toggle bookmark:", error);
    return NextResponse.json(
      { error: "Failed to toggle bookmark" },
      { status: 500 }
    );
  }
}
