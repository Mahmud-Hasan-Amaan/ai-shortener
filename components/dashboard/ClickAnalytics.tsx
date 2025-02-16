import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2, ChevronLeft } from "lucide-react";

interface ClickAnalyticsProps {
  data: any[];
  loading: boolean;
  timeLevel: string;
  breadcrumbs: { level: string; date: Date }[];
  onBreadcrumbClick: (level: string, date: Date, index: number) => void;
  onDataPointClick: (point: any) => void;
}

export function ClickAnalytics({
  data,
  loading,
  timeLevel,
  breadcrumbs,
  onBreadcrumbClick,
  onDataPointClick,
}: ClickAnalyticsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Click Analytics</h2>

      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <button
              onClick={() => onBreadcrumbClick(crumb.level, crumb.date, index)}
              className="text-gray-400 hover:text-gray-300"
            >
              {crumb.level.charAt(0).toUpperCase() + crumb.level.slice(1)}
            </button>
            <ChevronLeft className="h-4 w-4 text-gray-400" />
          </React.Fragment>
        ))}
        <span className="font-medium text-purple-500">
          {timeLevel.charAt(0).toUpperCase() + timeLevel.slice(1)}
        </span>
      </div>

      {/* Chart */}
      <div className="h-[400px] rounded-lg border border-gray-800 bg-gray-900 p-4">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              onClick={onDataPointClick}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="label"
                stroke="#6B7280"
                tick={{ fill: "#6B7280" }}
              />
              <YAxis
                stroke="#6B7280"
                tick={{ fill: "#6B7280" }}
                allowDecimals={false}
                domain={[0, "auto"]}
                tickFormatter={(value) => Math.round(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "0.5rem",
                  padding: "8px",
                }}
              />
              <Line
                type="linear"
                dataKey="clicks"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: "#8B5CF6", r: 4, cursor: "pointer" }}
                activeDot={{ r: 6, fill: "#A78BFA" }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
