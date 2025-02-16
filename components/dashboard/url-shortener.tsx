"use client";
import ShortenUrl from "../url/ShortenUrl";

export function DashboardUrlShortener() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Create New Link</h2>
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
        <ShortenUrl />
      </div>
    </div>
  );
}
