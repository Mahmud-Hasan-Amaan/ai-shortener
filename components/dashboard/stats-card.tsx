import { cache } from "react";
import dbConnect from "@/lib/mongodb";
import Link from "@/models/Link";
import { formatNumber } from "@/lib/utils";

// Cache the stats fetching for 1 minute
const getStats = cache(async (userId: string) => {
  try {
    await dbConnect();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Optimize MongoDB query by using a single aggregation pipeline
    const stats = await Link.aggregate([
      { $match: { userId } },
      {
        $facet: {
          totalLinks: [{ $count: "count" }],
          totalClicks: [
            { $group: { _id: null, total: { $sum: "$clickCount" } } },
          ],
          last30Days: [
            {
              $match: {
                createdAt: { $gte: thirtyDaysAgo },
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]).exec();

    const result = stats[0];
    return {
      totalLinks: result.totalLinks[0]?.count || 0,
      totalClicks: result.totalClicks[0]?.total || 0,
      last30Days: result.last30Days[0]?.count || 0,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      totalLinks: 0,
      totalClicks: 0,
      last30Days: 0,
    };
  }
});

interface StatsCardProps {
  userId: string;
}

export async function StatsCard({ userId }: StatsCardProps) {
  const stats = await getStats(userId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-lg border p-4 dark:border-gray-800">
        <h3 className="text-sm font-medium">Total Links</h3>
        <p className="mt-2 text-3xl font-bold">
          {formatNumber(stats.totalLinks)}
        </p>
      </div>
      <div className="rounded-lg border p-4 dark:border-gray-800">
        <h3 className="text-sm font-medium">Total Clicks</h3>
        <p className="mt-2 text-3xl font-bold">
          {formatNumber(stats.totalClicks)}
        </p>
      </div>
      <div className="rounded-lg border p-4 dark:border-gray-800">
        <h3 className="text-sm font-medium">Links Created (30 days)</h3>
        <p className="mt-2 text-3xl font-bold">
          {formatNumber(stats.last30Days)}
        </p>
      </div>
    </div>
  );
}
