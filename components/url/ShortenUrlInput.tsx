"use client";
import { LinkIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface ShortenUrlInputProps {
  url: string;
  loading: boolean;
  onUrlChange: (value: string) => void;
  onGenerate: () => void;
}

export function ShortenUrlInput({
  url,
  loading,
  onUrlChange,
  onGenerate,
}: ShortenUrlInputProps) {
  const [error, setError] = useState<string | null>(null);

  const validateUrl = (input: string) => {
    if (input === "") {
      setError(null);
      return;
    }

    if (!input.startsWith("http://") && !input.startsWith("https://")) {
      setError("Please enter a valid URL starting with http:// or https://");
      return false;
    }

    setError(null);
    return true;
  };

  const handleUrlChange = (value: string) => {
    onUrlChange(value);
    validateUrl(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && url && !loading && !error) {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative group">
        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
        <input
          type="url"
          value={url}
          className={`w-full pl-12 pr-6 py-4 rounded-2xl border-2 ${
            error ? "border-red-500/50" : "border-white/10"
          } bg-black/5 backdrop-blur-sm text-white placeholder:text-gray-400 focus:outline-none ${
            error ? "focus:border-red-500/50" : "focus:border-purple-400/50"
          } transition-all`}
          placeholder="Enter your URL"
          onChange={(e) => handleUrlChange(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        {error && (
          <p className="absolute -bottom-6 left-0 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>

      <motion.button
        onClick={onGenerate}
        disabled={loading || !url || error !== null}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative overflow-hidden rounded-2xl py-4 px-6 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing & Generating...
            </>
          ) : (
            "Generate Smart Link"
          )}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.button>
    </div>
  );
}
