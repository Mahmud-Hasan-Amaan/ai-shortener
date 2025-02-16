"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, ExternalLink, Copy, Trash2 } from "lucide-react";

interface Link {
  _id: string;
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
}

interface LinksTableProps {
  userId: string;
}

export function LinksTable({ userId }: LinksTableProps) {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = async () => {
    try {
      const response = await fetch(`/api/links?userId=${userId}`, {
        credentials: "include",
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setLinks(data.links);
    } catch (error) {
      console.error("Failed to fetch links:", error);
      toast.error("Failed to load links");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [userId]);

  const copyToClipboard = async (shortUrl: string) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/${shortUrl}`
      );
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link" + err);
    }
  };

  const deleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      const response = await fetch(`/api/links/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      setLinks(links.filter((link) => link._id !== id));
      toast.success("Link deleted successfully");
    } catch (error) {
      console.error("Failed to delete link:", error);
      toast.error("Failed to delete link");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50">
      {links.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                  Original URL
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                  Short URL
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                  Clicks
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {links.map((link) => (
                <tr key={link._id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[300px]">
                        {link.originalUrl}
                      </span>
                      <a
                        href={link.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-500 hover:text-purple-400"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span>{link.shortUrl}</span>
                      <button
                        onClick={() => copyToClipboard(link.shortUrl)}
                        className="text-purple-500 hover:text-purple-400"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{link.clicks}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(link.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => deleteLink(link._id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-lg font-medium text-gray-400">
            No links created yet
          </p>
          <p className="text-sm text-gray-500">
            Start shortening URLs to see them here
          </p>
        </div>
      )}
    </div>
  );
}
