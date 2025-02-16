import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Link from "@/models/Link";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const userId = session?.userId;

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await dbConnect();

    // First verify the link belongs to the user
    const link = await Link.findOne({ _id: params.id, userId });

    if (!link) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Delete the link
    await Link.deleteOne({ _id: params.id });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete link:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
