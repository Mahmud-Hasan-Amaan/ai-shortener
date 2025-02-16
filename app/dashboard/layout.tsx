import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Link as LinkIcon,
  Settings,
  User,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold">LinkPersona AI</h1>
        </div>

        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>

          <Link
            href="/dashboard/links"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <LinkIcon className="w-5 h-5" />
            My Links
          </Link>

          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <User className="w-5 h-5" />
            Profile
          </Link>

          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-950">{children}</main>
    </div>
  );
}
