import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Link from "@/models/Link";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const session = await auth();
  const userId = session?.userId;

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await dbConnect();
    const links = await Link.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({ links });
  } catch (error) {
    console.error("Failed to fetch links:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
