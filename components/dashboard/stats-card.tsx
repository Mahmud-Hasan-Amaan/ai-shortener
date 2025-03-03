import { auth } from "@clerk/nextjs";
import { dbConnect } from "@/lib/db";
import { Link } from "@/models/Link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, MousePointerClick, TrendingUp } from "lucide-react";

async function getStats() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    // Ensure DB connection is established first
    await dbConnect();

    // Now perform the aggregation
    const stats = await Link.aggregate([
      { $match: { userId } },
      {
        $facet: {
          totalLinks: [{ $count: "count" }],
          totalClicks: [
            {
              $group: {
                _id: null,
                clicks: { $sum: "$clicks" },
              },
            },
          ],
          mostClicked: [
            { $sort: { clicks: -1 } },
            { $limit: 1 },
            {
              $project: {
                originalUrl: 1,
                clicks: 1,
              },
            },
          ],
          recentLinks: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                originalUrl: 1,
                shortCode: 1,
                clicks: 1,
              },
            },
          ],
        },
      },
    ]);

    // Extract values from aggregation result
    const result = stats[0];
    return {
      totalLinks: result.totalLinks[0]?.count || 0,
      totalClicks: result.totalClicks[0]?.clicks || 0,
      mostClicked: result.mostClicked[0] || null,
      recentLinks: result.recentLinks || [],
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return null;
  }
}

export async function StatsCard() {
  const stats = await getStats();

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Loading stats...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Links</CardTitle>
          <Link2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLinks}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          <MousePointerClick className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClicks}</div>
        </CardContent>
      </Card>

      {stats.mostClicked && (
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Most Clicked Link
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium truncate">
              {stats.mostClicked.originalUrl}
            </div>
            <div className="text-2xl font-bold">
              {stats.mostClicked.clicks} clicks
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
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
