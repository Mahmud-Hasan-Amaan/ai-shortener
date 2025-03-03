"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Copy, Check, ExternalLink, Edit2, X, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { MetadataDisplay } from "./MetadataDisplay";

interface GeneratedUrlProps {
  shortUrl: string;
  originalUrl: string;
  qrCode?: string;
  linkId: string;
  metadata?: any;
  onEdit?: (url: string) => Promise<void>;
}

export function GeneratedUrl({
  shortUrl,
  originalUrl,
  qrCode,
  linkId,
  onEdit,
}: GeneratedUrlProps) {
  const [showQR, setShowQR] = useState(false);
  const [copying, setCopying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(originalUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);

  const handleCopy = async () => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(shortUrl);
      toast.success("URL copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy URL");
    } finally {
      setCopying(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      // Add protocol if missing
      const urlToUpdate = editValue.startsWith("http")
        ? editValue
        : `https://${editValue}`;

      // Validate URL
      try {
        new URL(urlToUpdate);
      } catch (e) {
        toast.error("Please enter a valid URL");
        return;
      }

      const response = await fetch(`/api/links/${linkId}/metadata`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: urlToUpdate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update URL");
      }

      await onEdit?.(urlToUpdate);
      setMetadata(data.metadata);
      setIsEditing(false);
      toast.success("URL updated successfully");
    } catch (error) {
      console.error("Save error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update URL"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSubmitting) {
      handleSave();
    }
  };

  // Fetch initial metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch(`/api/links/${linkId}/metadata`);
        const data = await response.json();
        if (response.ok) {
          setMetadata(data.metadata);
        }
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      }
    };

    if (linkId) {
      fetchMetadata();
    }
  }, [linkId]);

  return (
    <Card className="p-6 mt-4 bg-card">
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground">Original URL:</p>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <div className="flex-1 flex items-center space-x-2">
                <Input
                  value={editValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  placeholder="Enter new URL"
                  disabled={isSubmitting}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsEditing(false);
                    setEditValue(originalUrl);
                  }}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium break-all flex-1">
                  {originalUrl}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Show metadata only when it's available */}
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Metadata</h3>
            <MetadataDisplay
              metadata={metadata}
              onEdit={async (field, value) => {
                try {
                  const response = await fetch(
                    `/api/links/${linkId}/metadata`,
                    {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        field,
                        value,
                      }),
                    }
                  );

                  const data = await response.json();
                  if (!response.ok) {
                    throw new Error(data.error);
                  }

                  setMetadata(data.metadata);
                  toast.success(`Updated ${field} successfully`);
                } catch (error) {
                  console.error("Metadata update error:", error);
                  toast.error(`Failed to update ${field}`);
                  throw error;
                }
              }}
            />
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground">Short URL:</p>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium break-all flex-1">{shortUrl}</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              disabled={copying}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {qrCode && (
          <div className="flex flex-col items-center space-y-2">
            <Button
              variant="outline"
              onClick={() => setShowQR(!showQR)}
              className="w-full"
            >
              <QrCode className="h-4 w-4 mr-2" />
              {showQR ? "Hide QR Code" : "Show QR Code"}
            </Button>

            {showQR && (
              <div className="p-4 bg-white rounded-lg">
                <QRCodeSVG
                  value={shortUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
