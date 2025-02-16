"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ShortenUrlInput } from "./ShortenUrlInput";
import { GeneratedUrl } from "./GeneratedUrl";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { MetadataDisplay } from "./MetadataDisplay";
import type { Metadata } from "@/types";

interface ErrorDetails {
  category: string;
  confidence: number;
  reason: string;
}

interface ErrorState {
  message: string;
  details?: ErrorDetails;
}

export default function ShortenUrl() {
  const [url, setUrl] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [error, setError] = useState<ErrorState | null>(null);
  const [generated, setGenerated] = useState("");
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setQrCode(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();
      console.log("Full API Response:", result); // Debug full response

      if (!response.ok) {
        setError({
          message: result.message,
          details: {
            category: result.details.category,
            confidence: result.details.confidence,
            reason: result.details.reason,
          },
        });
        toast.error(result.message);
        return; // Add return to prevent further execution
      }

      if (result.success) {
        setGenerated(result.shortUrl);
        setDestinationUrl(result.originalUrl);
        setMetadata(result.metadata);

        if (result.qrCode && typeof result.qrCode === "string") {
          setQrCode(result.qrCode);
        } else {
          console.error("Invalid QR code in response:", result.qrCode);
          toast.error("QR code generation failed");
        }

        setUrl("");
        toast.success("URL shortened successfully!");
      }
    } catch (error) {
      console.error("Generate error:", error);
      setError({
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate short URL",
      });
      toast.error("Failed to generate short URL");
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

  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/5 p-8 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10" />

        <div className="relative z-10">
          <h3 className="text-center text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-8">
            Generate Smart Short URLs
          </h3>

          <ShortenUrlInput
            url={url}
            loading={loading}
            onUrlChange={setUrl}
            onGenerate={generate}
          />

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
            {(generated || metadata) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6"
              >
                {generated && (
                  <>
                    <GeneratedUrl
                      shortUrl={generated}
                      destinationUrl={destinationUrl}
                      copying={copying}
                      onCopy={copyToClipboard}
                    />
                    {qrCode && <QRCodeDisplay qrCode={qrCode} />}
                  </>
                )}
                {metadata && <MetadataDisplay metadata={metadata} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
