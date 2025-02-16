import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

interface LocationData {
  country: string;
  count: number;
  percentage: number;
}

interface LocationAnalyticsProps {
  data: LocationData[];
}

export function LocationAnalytics({ data }: LocationAnalyticsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Location Analytics</h2>
      <div className="h-[400px] rounded-lg border border-gray-800 bg-gray-900 p-4">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="country"
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ country, percent }) =>
                  `${country}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            <p className="text-lg font-medium text-gray-400">
              No Location Data
            </p>
            <p className="text-sm text-gray-500">
              Start sharing your links to see location analytics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
