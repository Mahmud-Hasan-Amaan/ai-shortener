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

    // Get all links for this user
    const userLinks = await Link.find({ userId });

    // Get all clicks with their timestamps
    const allClicks = userLinks.flatMap((link) =>
      (link.clicks || []).map((click) => ({
        timestamp: new Date(click.timestamp).toISOString(),
        clicks: 1,
        visitorId: click.visitorId,
        device: click.device || "unknown", // Make sure we include device info
      }))
    );

    // Process device data
    const deviceCounts: { [key: string]: number } = {};
    allClicks.forEach((click) => {
      const device = click.device || "unknown";
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });

    // Format device data for the frontend
    const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
      value,
    }));

    return NextResponse.json({
      data: allClicks,
      deviceData,
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
