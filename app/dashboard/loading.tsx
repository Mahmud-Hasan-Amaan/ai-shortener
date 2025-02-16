export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Stats Loading */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-lg border border-gray-800 bg-gray-900/50 animate-pulse"
          />
        ))}
      </div>

      {/* Chart Loading */}
      <div className="space-y-4">
        <div className="h-6 w-48 bg-gray-900/50 rounded animate-pulse" />
        <div className="h-[300px] rounded-lg border border-gray-800 bg-gray-900/50 animate-pulse" />
      </div>

      {/* Table Loading */}
      <div className="space-y-4">
        <div className="h-6 w-32 bg-gray-900/50 rounded animate-pulse" />
        <div className="h-64 rounded-lg border border-gray-800 bg-gray-900/50 animate-pulse" />
      </div>
    </div>
  );
}
