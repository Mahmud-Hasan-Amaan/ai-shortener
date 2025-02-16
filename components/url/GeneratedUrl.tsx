"use client";
import Link from "next/link";
import { Copy, Check, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface GeneratedUrlProps {
  shortUrl: string;
  destinationUrl: string;
  copying: boolean;
  onCopy: (url: string) => void;
}

export function GeneratedUrl({
  shortUrl,
  destinationUrl,
  copying,
  onCopy,
}: GeneratedUrlProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-purple-400 font-medium mb-3">Your Shortened Link</p>
        <div className="flex items-center justify-center gap-3">
          <code className="px-4 py-2 rounded-xl bg-black/20 text-cyan-400 font-mono">
            <Link
              href={shortUrl}
              target="_blank"
              className="hover:text-cyan-300 transition-colors"
            >
              {shortUrl}
            </Link>
          </code>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onCopy(shortUrl)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            title="Copy to clipboard"
          >
            {copying ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <Copy className="w-5 h-5 text-gray-400" />
            )}
          </motion.button>
        </div>
      </div>

      {destinationUrl && (
        <div className="text-center px-4 py-3 rounded-xl bg-black/10">
          <p className="text-sm text-gray-400 mb-2">Destination URL</p>
          <p className="text-sm text-white/80 break-all flex items-center justify-center gap-2">
            <Link
              href={destinationUrl}
              target="_blank"
              className="hover:text-purple-400 transition-colors"
            >
              {destinationUrl}
            </Link>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </p>
        </div>
      )}
    </div>
  );
}
