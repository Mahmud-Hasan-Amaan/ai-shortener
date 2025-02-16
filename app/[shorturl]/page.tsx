import RedirectAnimation from "@/components/url/RedirectAnimation";
import dbConnect from "@/lib/mongodb";
import Link from "@/models/Link";
import { auth } from "@clerk/nextjs/server";
import { UAParser } from "ua-parser-js";
import { NextRequest } from "next/server";
import { headers } from "next/headers";

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

    // Skip processing for static routes
    if (isStaticRoute(resolvedParams.shorturl)) {
      return null;
    }

    await dbConnect();
    const { userId } = await auth();

    // Find the URL without waiting for the update
    const shortUrlData = await Link.findOne({
      shortCode: resolvedParams.shorturl,
    });

    if (!shortUrlData) {
      return <RedirectAnimation url="/" />;
    }

    // Validate URL
    let redirectUrl;
    try {
      const url = new URL(shortUrlData.originalUrl);
      redirectUrl = url.toString();
    } catch (e) {
      console.error("Invalid URL:", e);
      return <RedirectAnimation url="/" />;
    }

    // Update stats without waiting
    if (shortUrlData._id) {
      const userAgent = (await headers()).get("user-agent") || "";
      const parser = new UAParser(userAgent);
      const result = parser.getResult();

      const deviceInfo = {
        device: result.device.type || "desktop",
        browser: result.browser.name,
        os: result.os.name,
        timestamp: new Date(),
      };

      Link.findByIdAndUpdate(
        shortUrlData._id,
        {
          $inc: { clickCount: 1 },
          $push: { clicks: deviceInfo },
          ...(userId && { $addToSet: { visitors: userId } }),
        },
        { new: true }
      ).catch(console.error);
    }

    // Redirect immediately
    return <RedirectAnimation url={redirectUrl} />;
  } catch (error) {
    console.error("Error:", error);
    return <RedirectAnimation url="/" />;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { shorturl: string } }
) {
  try {
    await dbConnect();
    const shortUrl = params.shorturl;

    const userAgent = request.headers.get("user-agent") || "";
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const deviceInfo = {
      device: result.device.type || "desktop",
      browser: result.browser.name,
      os: result.os.name,
      timestamp: new Date(),
    };

    // Find and update the link document
    const link = await Link.findOneAndUpdate(
      { shortUrl },
      {
        $inc: { clickCount: 1 },
        $push: { clicks: deviceInfo },
      },
      { new: true }
    );

    if (!link) {
      return new Response("Link not found", { status: 404 });
    }

    return Response.redirect(link.originalUrl);
  } catch (error) {
    console.error("Error processing redirect:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
