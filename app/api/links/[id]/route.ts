import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Link from "@/models/Link";
import { NextRequest, NextResponse } from "next/server";
import { extractMetadata } from "@/lib/metadata";
import { validateUrl } from "@/lib/utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Find the link and ensure it belongs to the user
    const link = await Link.findOne({ _id: params.id, userId });

    if (!link) {
      return NextResponse.json(
        { error: "Link not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete the link
    await Link.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Link deleted successfully" });
  } catch (error) {
    console.error("Failed to delete link:", error);
    return NextResponse.json(
      { error: "Failed to delete link" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const id = params.id;
    const link = await Link.findOne({ _id: id, userId });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json(link);
  } catch (error) {
    console.error("Error fetching link:", error);
    return NextResponse.json(
      { error: "Failed to fetch link" },
      { status: 500 }
    );
  }
}

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
    const { isValid, error } = validateUrl(url);

    if (!isValid) {
      return NextResponse.json({ error }, { status: 400 });
    }

    await dbConnect();

    // Find the link and verify ownership
    const link = await Link.findOne({ _id: params.id, userId });
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Get new metadata
    const metadata = await extractMetadata(url);

    // Update the link
    link.originalUrl = url;
    link.metadata = {
      ...link.metadata,
      ...metadata,
      updatedAt: new Date(),
    };

    await link.save();

    return NextResponse.json({
      success: true,
      originalUrl: link.originalUrl,
      shortUrl: link.shortCode,
      metadata: link.metadata,
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Failed to update URL" },
      { status: 500 }
    );
  }
}
