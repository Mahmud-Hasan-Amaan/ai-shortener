"use client";
import { motion } from "framer-motion";
import { Metadata } from "@/types";

interface MetadataDisplayProps {
  metadata: Metadata;
}

export function MetadataDisplay({ metadata }: MetadataDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-6 pt-6 border-t border-white/10"
    >
      <h4 className="text-purple-400 font-medium mb-4">Metadata</h4>
      <div className="grid gap-3 text-sm">
        <div className="p-3 rounded-xl bg-black/10">
          <p className="text-gray-400 mb-1">Original Title</p>
          <p className="text-white/80">{metadata.title || "N/A"}</p>
        </div>
        <div className="p-3 rounded-xl bg-black/10">
          <p className="text-gray-400 mb-1">Short Title</p>
          <p className="text-white/80">{metadata.shortTitle || "N/A"}</p>
        </div>
        <div className="p-3 rounded-xl bg-black/10">
          <p className="text-gray-400 mb-1">Description</p>
          <p className="text-white/80">{metadata.description || "N/A"}</p>
        </div>
        {metadata.keywords && metadata.keywords.length > 0 && (
          <div className="p-3 rounded-xl bg-black/10">
            <p className="text-gray-400 mb-2">Keywords</p>
            <div className="flex flex-wrap gap-2">
              {metadata.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-xs"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
