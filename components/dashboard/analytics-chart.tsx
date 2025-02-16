"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ClickAnalytics } from "./ClickAnalytics";
import { DeviceAnalytics } from "./DeviceAnalytics";
import { LocationAnalytics } from "./LocationAnalytics";

type TimeLevel = "year" | "months" | "days" | "hours" | "minutes";
type Breadcrumb = { level: TimeLevel; date: Date };

export function AnalyticsChart({ userId }: { userId: string }) {
  const [rawData, setRawData] = useState<any[]>([]);
  const [deviceData, setDeviceData] = useState<any[]>([]);
  const [locationData, setLocationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLevel, setTimeLevel] = useState<TimeLevel>("year");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch");

        const result = await response.json();
        setRawData(result.data || []);
        setDeviceData(result.deviceData || []);
        setLocationData(result.locationData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const getFilteredData = () => {
    if (!rawData.length) return [];

    const points = [];

    switch (timeLevel) {
      case "year":
        // Years from 2024 to 2030
        for (let year = 2024; year <= 2030; year++) {
          points.push({
            date: year.toString(),
            clicks: rawData
              .filter((d) => new Date(d.timestamp).getFullYear() === year)
              .reduce((sum, d) => sum + d.clicks, 0),
            label: year.toString(),
          });
        }
        break;

      case "months":
        // Show all months for selected year
        const months = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        months.forEach((month, index) => {
          const monthClicks = rawData
            .filter((d) => {
              const date = new Date(d.timestamp);
              return (
                date.getMonth() === index &&
                date.getFullYear() === selectedDate.getFullYear()
              );
            })
            .reduce((sum, d) => sum + d.clicks, 0);

          points.push({
            date: month,
            clicks: monthClicks,
            label: month,
          });
        });
        break;

      case "days":
        // Show Weeks 1-4
        for (let week = 1; week <= 4; week++) {
          points.push({
            date: `Week ${week}`,
            clicks: rawData
              .filter((d) => {
                const date = new Date(d.timestamp);
                const weekOfMonth = Math.ceil(date.getDate() / 7);
                return (
                  weekOfMonth === week &&
                  date.getMonth() === selectedDate.getMonth() &&
                  date.getFullYear() === selectedDate.getFullYear()
                );
              })
              .reduce((sum, d) => sum + d.clicks, 0),
            label: `Week ${week}`,
          });
        }
        break;

      case "hours":
        // Show hours (12-hour format)
        for (let hour = 0; hour < 24; hour++) {
          const period = hour >= 12 ? "PM" : "AM";
          const hour12 = hour % 12 || 12;
          const timeLabel = `${hour12} ${period}`;

          points.push({
            date: timeLabel,
            clicks: rawData
              .filter((d) => {
                const date = new Date(d.timestamp);
                return (
                  date.getHours() === hour &&
                  date.toDateString() === selectedDate.toDateString()
                );
              })
              .reduce((sum, d) => sum + d.clicks, 0),
            label: timeLabel,
          });
        }
        break;

      case "minutes":
        // Show 5-minute intervals for the selected hour (1:00 PM, 1:05 PM, etc.)
        const hour = selectedDate.getHours();
        const hour12 = hour % 12 || 12;
        const period = hour >= 12 ? "PM" : "AM";

        for (let minute = 0; minute < 60; minute += 5) {
          const timeLabel = `${hour12}:${minute
            .toString()
            .padStart(2, "0")} ${period}`;
          points.push({
            date: timeLabel,
            clicks: rawData
              .filter((d) => {
                const date = new Date(d.timestamp);
                return (
                  date.getHours() === hour &&
                  Math.floor(date.getMinutes() / 5) * 5 === minute &&
                  date.toDateString() === selectedDate.toDateString()
                );
              })
              .reduce((sum, d) => sum + d.clicks, 0),
            label: timeLabel,
          });
        }
        break;
    }

    return points;
  };

  const handleClick = (point: any) => {
    if (!point.activePayload) return;
    const clickedValue = point.activePayload[0].payload;

    if (timeLevel === "minutes") return;

    setBreadcrumbs([...breadcrumbs, { level: timeLevel, date: selectedDate }]);

    switch (timeLevel) {
      case "year":
        setTimeLevel("months");
        setSelectedDate(new Date(parseInt(clickedValue.date), 0, 1));
        break;
      case "months":
        setTimeLevel("days");
        const monthIndex = new Date(
          Date.parse(clickedValue.date + " 1, 2000")
        ).getMonth();
        setSelectedDate(new Date(selectedDate.getFullYear(), monthIndex, 1));
        break;
      case "days":
        setTimeLevel("hours");
        const weekNum = parseInt(clickedValue.date.split(" ")[1]);
        setSelectedDate(
          new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            (weekNum - 1) * 7 + 1
          )
        );
        break;
      case "hours":
        setTimeLevel("minutes");
        const [hour, period] = clickedValue.date.split(" ");
        let hour24 = parseInt(hour);
        if (period === "PM" && hour24 !== 12) hour24 += 12;
        if (period === "AM" && hour24 === 12) hour24 = 0;
        const newDate = new Date(selectedDate);
        newDate.setHours(hour24);
        setSelectedDate(newDate);
        break;
    }
  };

  return (
    <div className="space-y-8">
      <ClickAnalytics
        data={getFilteredData()}
        loading={loading}
        timeLevel={timeLevel}
        breadcrumbs={breadcrumbs}
        onBreadcrumbClick={(level, date, index) => {
          setTimeLevel(level as TimeLevel);
          setSelectedDate(date);
          setBreadcrumbs(breadcrumbs.slice(0, index));
        }}
        onDataPointClick={handleClick}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DeviceAnalytics data={deviceData} />
        <LocationAnalytics data={locationData} />
      </div>

      <div className="mt-4 p-4 bg-gray-800 rounded">
        <h3 className="font-bold mb-2">Debug Data:</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(rawData, null, 2)}
        </pre>
      </div>
    </div>
  );
}
