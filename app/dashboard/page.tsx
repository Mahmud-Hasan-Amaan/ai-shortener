import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { StatsCard } from "@/components/dashboard/stats-card";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { DashboardUrlShortener } from "@/components/dashboard/url-shortener";

export default async function DashboardPage() {
  const session = await auth();

  // Redirect to login if no session exists
  if (!session?.userId) {
    redirect("/login");
  }

  // Now we can safely use the authenticated user's ID
  const userId = session.userId;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Analytics Overview</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Suspense fallback={<div>Loading stats...</div>}>
          <StatsCard userId={userId!} />
        </Suspense>
      </div>

      <DashboardUrlShortener />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Click Analytics</h2>
        <Suspense fallback={<div>Loading analytics...</div>}>
          <AnalyticsChart userId={userId} />
        </Suspense>
      </div>
    </div>
  );
}
