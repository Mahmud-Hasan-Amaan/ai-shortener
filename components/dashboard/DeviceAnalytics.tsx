"use client";

import { useState, useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  HelpCircle,
  MousePointerClick,
} from "lucide-react";

type DeviceData = {
  name: string;
  value: number;
  color: string;
  icon: React.ElementType;
  percent: number;
};

const COLORS = {
  desktop: "hsl(var(--chart-1))",
  mobile: "hsl(var(--chart-2))",
  tablet: "hsl(var(--chart-3))",
  tv: "hsl(var(--chart-4))",
  unknown: "hsl(var(--chart-5))",
};

const DEVICE_ICONS = {
  desktop: Laptop,
  mobile: Smartphone,
  tablet: Tablet,
  tv: Monitor,
  unknown: HelpCircle,
};

const RADIAN = Math.PI / 180;

interface DeviceAnalyticsProps {
  data: { name: string; value: number }[];
}

export function DeviceAnalytics({ data }: DeviceAnalyticsProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>();

  // Transform the incoming data
  const processedData = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return data.map((item) => ({
      name: item.name,
      value: item.value,
      color:
        COLORS[item.name.toLowerCase() as keyof typeof COLORS] ||
        COLORS.unknown,
      icon:
        DEVICE_ICONS[item.name.toLowerCase() as keyof typeof DEVICE_ICONS] ||
        DEVICE_ICONS.unknown,
      percent: total > 0 ? item.value / total : 0,
    }));
  }, [data]);

  const total = processedData.reduce((sum, item) => sum + item.value, 0);
  const activeItem =
    activeIndex !== undefined ? processedData[activeIndex] : null;

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    payload,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const sin = Math.sin(-midAngle * RADIAN);
    const cos = Math.cos(-midAngle * RADIAN);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 40) * cos;
    const my = cy + (outerRadius + 40) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";
    const isActive = activeIndex === index;

    return (
      <g>
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={payload.color}
          fill="none"
          strokeWidth={isActive ? 2 : 1}
        />
        <circle cx={ex} cy={ey} r={2} fill={payload.color} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill={payload.color}
          dominantBaseline="central"
          className={`text-xs ${isActive ? "font-bold" : "font-medium"}`}
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      </g>
    );
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
      props;
    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Device Analytics</h2>
      <div className="h-[400px] rounded-lg border border-gray-800 bg-gray-900 p-4">
        {processedData.some((d) => d.value > 0) ? (
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div className="relative h-[400px] w-full overflow-visible">
              <div className="absolute left-0 right-0 h-full">
                <ResponsiveContainer width="150%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={processedData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      dataKey="value"
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(undefined)}
                      labelLine={false}
                      label={renderCustomizedLabel}
                    >
                      {processedData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke={entry.color}
                          strokeWidth={2}
                          opacity={
                            activeIndex === undefined || activeIndex === index
                              ? 1
                              : 0.3
                          }
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Stats - Now positioned relative to the pie chart */}
                <div
                  className="absolute"
                  style={{
                    left: "75%", // Half of the 150% width
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeItem ? activeItem.name : "total"}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                      className="whitespace-nowrap text-center"
                    >
                      <motion.div
                        className="mb-2 flex justify-center"
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {activeItem ? (
                          <activeItem.icon size={48} color={activeItem.color} />
                        ) : (
                          <MousePointerClick
                            size={48}
                            className="text-primary"
                          />
                        )}
                      </motion.div>
                      <motion.div className="text-3xl font-bold">
                        {activeItem ? activeItem.value : total}
                      </motion.div>
                      <motion.div className="text-sm font-medium text-muted-foreground">
                        {activeItem ? activeItem.name : "TOTAL CLICKS"}
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Device List */}
            <div className="flex flex-col justify-center gap-4 pl-20">
              {processedData.map((item, index) => (
                <motion.div
                  key={item.name}
                  className="flex items-center justify-between gap-2 rounded-lg p-3 transition-colors hover:bg-muted/50"
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(undefined)}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                      whileHover={{ scale: 1.2 }}
                    />
                    <span className="text-base font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base text-muted-foreground">
                      {item.value}
                    </span>
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <item.icon size={24} className="text-muted-foreground" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            <p className="text-lg font-medium text-gray-400">No Device Data</p>
            <p className="text-sm text-gray-500">
              Start sharing your links to see device analytics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
