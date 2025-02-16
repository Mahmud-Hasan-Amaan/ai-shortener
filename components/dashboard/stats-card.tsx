async function getStats(userId: string) {
  const Link = (await import("@/models/Link")).default;
  await (await import("@/lib/mongodb")).default();

  const totalLinks = await Link.countDocuments({ userId });
  const totalClicks = await Link.aggregate([
    { $match: { userId } },
    { $group: { _id: null, total: { $sum: "$clickCount" } } },
  ]);

  const last30Days = await Link.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    },
    { $count: "total" },
  ]);

  return {
    totalLinks,
    totalClicks: totalClicks[0]?.total || 0,
    last30Days: last30Days[0]?.total || 0,
  };
}

export async function StatsCard({ userId }: { userId: string }) {
  const stats = await getStats(userId);

  return (
    <>
      <div className="rounded-lg border p-4 dark:border-gray-800">
        <h3 className="text-sm font-medium">Total Links</h3>
        <p className="mt-2 text-3xl font-bold">{stats.totalLinks}</p>
      </div>
      <div className="rounded-lg border p-4 dark:border-gray-800">
        <h3 className="text-sm font-medium">Total Clicks</h3>
        <p className="mt-2 text-3xl font-bold">{stats.totalClicks}</p>
      </div>
      <div className="rounded-lg border p-4 dark:border-gray-800">
        <h3 className="text-sm font-medium">Links Created (30 days)</h3>
        <p className="mt-2 text-3xl font-bold">{stats.last30Days}</p>
      </div>
    </>
  );
}
