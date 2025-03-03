import RedirectAnimation from "@/components/url/RedirectAnimation";
import dbConnect from "@/lib/mongodb";
import Link from "@/models/Link";
import { auth } from "@clerk/nextjs/server";
import { UAParser } from "ua-parser-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Static routes that should never be treated as short URLs
const STATIC_ROUTES = [
  "sign-in",
  "sign-up",
  "dashboard",
  "profile",
  "settings",
  "api",
];

function isStaticRoute(path: string) {
  return STATIC_ROUTES.some((route) => path === route);
}

// Mark this route as unstable_noStore to prevent caching
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type PageProps = {
  params: Promise<{ shorturl: string }>;
};

// Add generateMetadata for dynamic params
export async function generateMetadata({
  params,
}: {
  params: PageProps["params"];
}) {
  const resolvedParams = await params;

  // Check if this is a static route
  if (isStaticRoute(resolvedParams.shorturl)) {
    return {
      title:
        resolvedParams.shorturl.charAt(0).toUpperCase() +
        resolvedParams.shorturl.slice(1),
    };
  }

  return {
    title: `Redirecting... | ${resolvedParams.shorturl}`,
  };
}

export default async function Page({
  params,
}: {
  params: PageProps["params"];
}) {
  try {
    const resolvedParams = await params;
    if (isStaticRoute(resolvedParams.shorturl)) {
      return null;
    }

    await dbConnect();
    const { userId } = await auth();
    const headersList = await headers();

    const shortUrlData = await Link.findOne({
      shortCode: resolvedParams.shorturl,
    });

    if (!shortUrlData) {
      return <RedirectAnimation url="/" />;
    }

    // Get IP and country
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      "Unknown";

    let country = "Unknown";
    try {
      // Skip geolocation for localhost/internal IPs
      if (
        ip === "::1" ||
        ip === "127.0.0.1" ||
        ip.startsWith("192.168.") ||
        ip.startsWith("10.")
      ) {
        country = "Local Development";
      } else {
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
        const geoData = await geoResponse.json();
        if (geoData.status === "success") {
          country = geoData.country;
          console.log("Detected country:", country, "IP:", ip);
        }
      }
    } catch (error) {
      console.error("Geolocation error:", error);
    }

    // Update stats
    if (shortUrlData._id) {
      const userAgent = headersList.get("user-agent") || "";
      const parser = new UAParser(userAgent);
      const result = parser.getResult();

      const clickInfo = {
        timestamp: new Date(),
        visitorId: ip,
        device: result.device.type || "desktop",
        browser: result.browser.name,
        os: result.os.name,
        country: country,
      };

      Link.findByIdAndUpdate(
        shortUrlData._id,
        {
          $inc: { clickCount: 1 },
          $push: { clicks: clickInfo },
          ...(userId && { $addToSet: { visitors: userId } }),
        },
        { new: true }
      ).catch(console.error);
    }

    return <RedirectAnimation url={shortUrlData.originalUrl} />;
  } catch (error) {
    console.error("Error:", error);
    return <RedirectAnimation url="/" />;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { shortCode: string } }
) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "Unknown";

    // Get country using IP geolocation
    let country = "Unknown";
    try {
      const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
      const geoData = await geoResponse.json();
      if (geoData.status === "success") {
        country = geoData.country;
        console.log("Detected country:", country); // Debug log
      }
    } catch (error) {
      console.error("Geolocation error:", error);
    }

    const userAgent = request.headers.get("user-agent") || "Unknown";
    const device = userAgent.toLowerCase().includes("mobile")
      ? "mobile"
      : "desktop";

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

export function parseUserAgent(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes("mobile")) return "Mobile";
  if (ua.includes("tablet")) return "Tablet";
  return "Desktop";
}
