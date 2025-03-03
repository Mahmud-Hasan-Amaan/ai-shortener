"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ShortenUrlInput } from "./ShortenUrlInput";
import { GeneratedUrl } from "./GeneratedUrl";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { MetadataDisplay } from "./MetadataDisplay";
import type { Metadata } from "@/types";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ErrorDetails {
  category: string;
  confidence: number;
  reason: string;
}

interface ErrorState {
  message: string;
  details?: ErrorDetails;
}

interface GeneratedData {
  shortUrl: string;
  originalUrl: string;
  qrCode: string;
  linkId: string;
  metadata: any;
}

export default function ShortenUrl() {
  const [inputUrl, setInputUrl] = useState("");
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [destinationUrl, setDestinationUrl] = useState("");
  const [error, setError] = useState<ErrorState | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [copying, setCopying] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate short URL");
      }

      const data = await response.json();
      console.log("Generated URL:", data.shortUrl);
      setGeneratedData({
        shortUrl: data.shortUrl,
        originalUrl: data.originalUrl,
        qrCode: data.qrCode,
        linkId: data.linkId,
        metadata: data.metadata,
      });
      setDestinationUrl(data.originalUrl);
      setMetadata({ ...data.metadata, _id: data.linkId });

      if (data.qrCode && typeof data.qrCode === "string") {
        setQrCode(data.qrCode);
      } else {
        console.error("Invalid QR code in response:", data.qrCode);
        toast.error("QR code generation failed");
      }

      setInputUrl("");
      toast.success("URL shortened successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopying(true);
      toast.success("Copied to clipboard!");
      // Reset back to copy icon after 1.5 seconds
      setTimeout(() => setCopying(false), 1500);
    } catch (error) {
      toast.error("Failed to copy to clipboard. Error: " + error);
    }
  };

  const handleSaveEdit = async (newShortUrl: string) => {
    try {
      const response = await fetch("/api/links/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldUrl: generatedData?.shortUrl,
          newUrl: newShortUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update URL");
      }

      setGeneratedData((prev) => ({
        ...prev!,
        shortUrl: newShortUrl,
        originalUrl: destinationUrl,
      }));
      toast.success("URL updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update URL"
      );
      throw error; // Re-throw to handle in the GeneratedUrl component
    }
  };

  const handleMetadataUpdate = async (newUrl: string | undefined) => {
    if (!generatedData?.linkId) {
      toast.error("No link ID found");
      return;
    }

    if (!newUrl || typeof newUrl !== "string") {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      // Add protocol if missing
      const urlToUpdate = newUrl.toString().trim();
      const urlWithProtocol = urlToUpdate.match(/^https?:\/\//)
        ? urlToUpdate
        : `https://${urlToUpdate}`;

      // Validate URL
      try {
        new URL(urlWithProtocol);
      } catch (e) {
        toast.error("Please enter a valid URL");
        return;
      }

      const response = await fetch(
        `/api/links/${generatedData.linkId}/metadata`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            url: urlWithProtocol,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update URL");
      }

      setGeneratedData((prev) => ({
        ...prev!,
        originalUrl: data.originalUrl,
        metadata: data.metadata,
      }));

      toast.success("URL updated successfully");
    } catch (error) {
      console.error("Edit error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update URL"
      );
    }
  };

  const handleEdit = async (newUrl: string) => {
    if (!generatedData?.linkId) {
      toast.error("No link ID found");
      return;
    }

    try {
      const response = await fetch(
        `/api/links/${generatedData.linkId}/metadata`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            url: newUrl,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update URL");
      }

      setGeneratedData((prev) => ({
        ...prev!,
        originalUrl: data.originalUrl,
        metadata: data.metadata,
      }));

      toast.success("URL updated successfully");
    } catch (error) {
      console.error("Edit error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update URL"
      );
    }
  };

  console.log({
    generatedData,
    destinationUrl,
    metadata,
  });

  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/5 p-8 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10" />

        <div className="relative z-10">
          <h3 className="text-center text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-8">
            Generate Smart Short URLs
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="url"
              placeholder="Enter your URL"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Generating..." : "Generate Short URL"}
            </Button>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20"
              >
                <p className="text-red-400 text-sm font-medium">
                  {error.message}
                </p>
                {error.details && (
                  <div className="mt-2 text-sm text-red-300 space-y-1">
                    <p>Reason: {error.details.reason}</p>
                    <p>Category: {error.details.category}</p>
                    <p>
                      Confidence: {Math.round(error.details.confidence * 100)}%
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {generatedData && metadata && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6"
              >
                {generatedData && (
                  <>
                    <GeneratedUrl
                      shortUrl={generatedData.shortUrl}
                      originalUrl={generatedData.originalUrl}
                      qrCode={generatedData.qrCode}
                      linkId={generatedData.linkId}
                      onEdit={handleEdit}
                    />
                    {generatedData.qrCode && (
                      <QRCodeDisplay qrCode={generatedData.qrCode} />
                    )}
                  </>
                )}
                {metadata && (
                  <MetadataDisplay
                    metadata={metadata}
                    shortUrl={generatedData.shortUrl}
                    linkId={generatedData.linkId}
                    onMetadataUpdate={handleMetadataUpdate}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
