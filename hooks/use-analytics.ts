import { useState, useEffect } from "react";
import { toast } from "sonner";

export type TimeRange = "year" | "month" | "week" | "day" | "hour";

interface AnalyticsData {
  date: string;
  clicks: number;
  uniqueClicks?: number;
  conversionRate?: number;
}

export function useAnalytics(userId: string) {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDateRange = () => {
    const end = new Date(currentDate);
    const start = new Date(currentDate);

    switch (timeRange) {
      case "year":
        start.setFullYear(start.getFullYear() - 1);
        break;
      case "month":
        start.setMonth(start.getMonth() - 1);
        break;
      case "week":
        start.setDate(start.getDate() - 7);
        break;
      case "day":
        start.setDate(start.getDate() - 1);
        break;
      case "hour":
        start.setHours(start.getHours() - 1);
        break;
    }

    return { start, end };
  };

  const fetchAnalytics = async () => {
    try {
      const { start, end } = getDateRange();
      const response = await fetch(
        `/api/analytics?userId=${userId}&timeRange=${timeRange}&startDate=${start.toISOString()}&endDate=${end.toISOString()}`,
        {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to load analytics data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [timeRange, currentDate]);

  return {
    data,
    loading,
    timeRange,
    setTimeRange,
    currentDate,
    setCurrentDate,
    refetch: fetchAnalytics,
  };
}
