import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Link from "@/models/Link";

export async function GET(
  request: Request,
  { params }: { params: { shortCode: string } }
) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "Unknown";

    // Get country using a geolocation service
    let country = "Unknown";
    try {
      const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
      const geoData = await geoResponse.json();
      if (geoData.status === "success") {
        country = geoData.country;
      }
    } catch (error) {
      console.error("Geolocation error:", error);
    }

    const userAgent = request.headers.get("user-agent") || "Unknown";
    const device = parseUserAgent(userAgent);

    await dbConnect();

    const link = await Link.findOneAndUpdate(
      { shortCode: params.shortCode },
      {
        $push: {
          clicks: {
            timestamp: new Date(),
            visitorId: ip,
            device,
            country,
          },
        },
        $inc: { clickCount: 1 },
      },
      { new: true }
    );

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.redirect(link.originalUrl);
  } catch (error) {
    console.error("Click processing error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function parseUserAgent(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes("mobile")) return "Mobile";
  if (ua.includes("tablet")) return "Tablet";
  return "Desktop";
}
