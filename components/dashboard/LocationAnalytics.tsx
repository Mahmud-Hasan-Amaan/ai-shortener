import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#8B5CF6",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
  "#F43F5E",
];

interface LocationData {
  country: string;
  count: number;
  percentage: number;
}

interface LocationAnalyticsProps {
  data: LocationData[];
}

export function LocationAnalytics({ data }: LocationAnalyticsProps) {
  // Format data for the pie chart
  const formattedData = data.map((item) => ({
    ...item,
    value: item.count, // Recharts uses 'value' as default for pie charts
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-2 rounded border border-gray-700">
          <p className="text-white">{`${data.country}`}</p>
          <p className="text-gray-300">{`Visits: ${data.count}`}</p>
          <p className="text-gray-400">{`(${(data.percentage * 100).toFixed(
            1
          )}%)`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Location Analytics</h2>
      <div className="h-[400px] rounded-lg border border-gray-800 bg-gray-900 p-4">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedData}
                dataKey="value"
                nameKey="country"
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {formattedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
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
