"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ClickAnalytics } from "./ClickAnalytics";
import { DeviceAnalytics } from "./DeviceAnalytics";
import { LocationAnalytics } from "./LocationAnalytics";

type TimeLevel = "year" | "months" | "weeks" | "days" | "hours" | "minutes";
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

      case "weeks":
        // Show Weeks 1-4
        console.log(
          "Selected Month/Year:",
          selectedDate.getMonth() + 1,
          selectedDate.getFullYear()
        );

        for (let week = 1; week <= 4; week++) {
          const weekData = rawData.filter((d) => {
            const date = new Date(d.timestamp);

            // Only process dates in the selected month and year
            if (
              date.getMonth() !== selectedDate.getMonth() ||
              date.getFullYear() !== selectedDate.getFullYear()
            ) {
              return false;
            }

            // Calculate the week number based on the day of the week
            const firstDayOfMonth = new Date(
              date.getFullYear(),
              date.getMonth(),
              1
            );
            const dayOffset = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.
            const adjustedDate = date.getDate() + dayOffset - 1;
            const weekOfMonth = Math.floor(adjustedDate / 7) + 1;

            const matches = weekOfMonth === week;

            if (matches) {
              console.log(`Week ${week} data:`, {
                date: date.toISOString(),
                dayOfMonth: date.getDate(),
                dayOfWeek: date.getDay(),
                weekOfMonth,
                clicks: d.clicks,
              });
            }

            return matches;
          });

          const weekClicks = weekData.reduce(
            (sum, d) => sum + (d.clicks || 0),
            0
          );
          console.log(`Total clicks for Week ${week}:`, weekClicks);

          points.push({
            date: `Week ${week}`,
            clicks: weekClicks || 0,
            label: `Week ${week}`,
          });
        }

        console.log("Final points data:", points);
        break;

      case "days":
        // Show days of the week
        const weekStart = new Date(selectedDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week

        for (let i = 0; i < 7; i++) {
          const currentDate = new Date(weekStart);
          currentDate.setDate(weekStart.getDate() + i);

          points.push({
            date: currentDate.toLocaleDateString("en-US", { weekday: "long" }),
            clicks: rawData
              .filter((d) => {
                const date = new Date(d.timestamp);
                return date.toDateString() === currentDate.toDateString();
              })
              .reduce((sum, d) => sum + d.clicks, 0),
            label: currentDate.toLocaleDateString("en-US", {
              weekday: "short",
            }),
          });
        }
        break;

      case "hours":
        console.log("Raw Data:", rawData);
        console.log("Selected Date:", selectedDate);

        for (let hour = 0; hour < 24; hour++) {
          const period = hour >= 12 ? "PM" : "AM";
          const hour12 = hour % 12 || 12;
          const timeLabel = `${hour12} ${period}`;

          const hourlyClicks = rawData
            .filter((d) => {
              const date = new Date(d.timestamp);
              const dataDate = date.toDateString();
              const selectedDateStr = selectedDate.toDateString();

              // Log matching data points
              if (dataDate === selectedDateStr && date.getHours() === hour) {
                console.log(`Found data for ${hour}:00 -`, d);
              }

              return dataDate === selectedDateStr && date.getHours() === hour;
            })
            .reduce((sum, d) => sum + (d.clicks || 1), 0);

          points.push({
            date: timeLabel,
            clicks: hourlyClicks || 0, // Use 0 to show no data
            label: timeLabel,
          });
        }
        break;

      case "minutes":
        const selectedHour = selectedDate.getHours();
        const hour12 = selectedHour % 12 || 12;
        const period = selectedHour >= 12 ? "PM" : "AM";

        // Show 5-minute intervals (0, 5, 10, ..., 55)
        for (let minute = 0; minute < 60; minute += 5) {
          const timeLabel = `${hour12}:${minute
            .toString()
            .padStart(2, "0")} ${period}`;

          const minuteClicks = rawData
            .filter((d) => {
              const date = new Date(d.timestamp);
              const sameDate =
                date.toDateString() === selectedDate.toDateString();
              const sameHour = date.getHours() === selectedHour;
              const minuteRange =
                Math.floor(date.getMinutes() / 5) * 5 === minute;

              if (sameDate && sameHour && minuteRange) {
                console.log(`Found data for ${timeLabel} -`, d);
              }

              return sameDate && sameHour && minuteRange;
            })
            .reduce((sum, d) => sum + (d.clicks || 1), 0);

          points.push({
            date: timeLabel,
            clicks: minuteClicks || 0, // Use 0 to show no data
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
        setTimeLevel("weeks");
        const monthIndex = new Date(
          Date.parse(clickedValue.date + " 1, 2000")
        ).getMonth();
        setSelectedDate(new Date(selectedDate.getFullYear(), monthIndex, 1));
        break;
      case "weeks":
        setTimeLevel("days");
        const weekNum = parseInt(clickedValue.date.split(" ")[1]);
        setSelectedDate(
          new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            (weekNum - 1) * 7 + 1
          )
        );
        break;
      case "days":
        setTimeLevel("hours");
        const clickedDate = new Date(selectedDate);
        const startOfWeek = new Date(clickedDate);
        startOfWeek.setDate(clickedDate.getDate() - clickedDate.getDay()); // Get to Sunday

        const dayIndex = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ].indexOf(clickedValue.date);

        const targetDate = new Date(startOfWeek);
        targetDate.setDate(startOfWeek.getDate() + dayIndex);
        targetDate.setHours(0, 0, 0, 0);

        console.log("Setting date to:", targetDate.toISOString());
        setSelectedDate(targetDate);
        break;
      case "hours":
        setTimeLevel("minutes");
        const [hourStr, periodStr] = clickedValue.date.split(" ");
        let hour24 = parseInt(hourStr);
        if (periodStr === "PM" && hour24 !== 12) hour24 += 12;
        if (periodStr === "AM" && hour24 === 12) hour24 = 0;

        const newDateWithHour = new Date(selectedDate);
        newDateWithHour.setHours(hour24, 0, 0, 0); // Set to start of hour
        console.log("Setting hour to:", newDateWithHour.toISOString());
        setSelectedDate(newDateWithHour);
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
