import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { LinksTable } from "@/components/dashboard/links-table";

export default async function LinksPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Your Links</h1>
      <LinksTable userId={userId} />
    </div>
  );
}
