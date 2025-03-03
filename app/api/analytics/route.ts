import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Link from "@/models/Link";
import { auth } from "@clerk/nextjs/server";

interface ApiResponse {
  data: {
    date: string;
    clicks: number;
    uniqueClicks: number;
    conversionRate: number;
    clickTimes: string[];
  }[];
  deviceData: {
    name: string;
    value: number;
  }[];
  locationData: {
    country: string;
    count: number;
    percentage: number;
  }[];
  referrerData: {
    source: string;
    count: number;
    percentage: number;
  }[];
  totalClicks: number;
  clicksGrowth: number;
}

interface Click {
  timestamp: Date;
  visitorId: string;
  device?: string;
  country?: string;
}

interface Link {
  userId: string;
  clicks: Click[];
  // ... other fields
}

// Helper function to round time to nearest interval
const roundToInterval = (date: Date, intervalMinutes: number = 15) => {
  const minutes = date.getMinutes();
  const roundedMinutes =
    Math.round(minutes / intervalMinutes) * intervalMinutes;
  const roundedDate = new Date(date);
  roundedDate.setMinutes(roundedMinutes, 0, 0); // Set seconds and milliseconds to 0
  return roundedDate;
};

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const userLinks = await Link.find({ userId });

    // Get all clicks with their data
    const allClicks = userLinks.flatMap((link) =>
      (link.clicks || []).map((click) => ({
        timestamp: new Date(click.timestamp).toISOString(),
        clicks: 1,
        visitorId: click.visitorId,
        device: click.device || "unknown",
        country: click.country || "Unknown", // Add country data
      }))
    );

    // Process device data
    const deviceCounts = {};
    const locationCounts = {};

    allClicks.forEach((click) => {
      // Device counting
      const device = click.device || "unknown";
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;

      // Location counting
      const country = click.country || "Unknown";
      locationCounts[country] = (locationCounts[country] || 0) + 1;
    });

    // Calculate total visits for percentages
    const totalVisits = Object.values(locationCounts).reduce(
      (sum: any, count: any) => sum + count,
      0
    );

    // Format location data
    const locationData = Object.entries(locationCounts).map(
      ([country, count]) => ({
        country,
        count,
        percentage: totalVisits > 0 ? (count as number) / totalVisits : 0,
      })
    );

    // Format device data
    const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    return NextResponse.json({
      data: allClicks,
      deviceData,
      locationData,
      totalClicks: allClicks.length,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
