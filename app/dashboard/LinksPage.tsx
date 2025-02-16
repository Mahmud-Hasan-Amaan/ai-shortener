import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { LinksTable } from "@/components/dashboard/links-table";
import ShortenUrl from "@/components/url/ShortenUrl";

export default async function LinksPage() {
  const { userId } = await auth();

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Create New Link</h2>
        <ShortenUrl />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Links</h2>
        <Suspense fallback={<div>Loading links...</div>}>
          <LinksTable userId={userId!} />
        </Suspense>
      </div>
    </div>
  );
}
