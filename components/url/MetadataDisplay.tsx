"use client";
import { motion } from "framer-motion";
import { Metadata } from "@/types";
import { Brain, Save, Edit2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { MetadataEditor } from "./MetadataEditor";
import { toast } from "sonner";
import mongoose from "mongoose";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface MetadataDisplayProps {
  metadata:
    | {
        title?: string;
        description?: string;
        keywords?: string[];
        classification?: string;
        subject?: string;
        topic?: string;
        language?: string;
        author?: string;
        copyright?: string;
        ogType?: string;
        ogSiteName?: string;
        favicon?: string;
      }
    | null
    | undefined;
  onEdit?: (field: string, value: string) => Promise<void>;
}

const METADATA_FIELDS = [
  { key: "title", label: "Title" },
  { key: "description", label: "Description" },
  { key: "classification", label: "Classification" },
  { key: "subject", label: "Subject" },
  { key: "topic", label: "Topic" },
  { key: "language", label: "Language" },
  { key: "author", label: "Author" },
  { key: "copyright", label: "Copyright" },
  { key: "ogType", label: "Type" },
  { key: "ogSiteName", label: "Site Name" },
] as const;

export function MetadataDisplay({ metadata, onEdit }: MetadataDisplayProps) {
  // Early return if metadata is null or undefined
  if (!metadata) {
    return <div>Loading metadata...</div>;
  }

  const renderEditableField = (
    label: string,
    field: keyof typeof metadata,
    value: string | undefined
  ) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
      if (!onEdit) return;
      try {
        setIsSubmitting(true);
        await onEdit(field, editValue);
        setIsEditing(false);
      } catch (error) {
        console.error(`Failed to update ${field}:`, error);
        toast.error(`Failed to update ${label}`);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div key={field} className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}:</p>
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-8"
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
                setEditValue(value || "");
              }}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm">{value || "Not specified"}</p>
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {METADATA_FIELDS.map(({ key, label }) =>
        renderEditableField(
          label,
          key,
          metadata[key as keyof typeof metadata]?.toString()
        )
      )}

      {/* Keywords section */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Keywords:</p>
        <div className="flex flex-wrap gap-2">
          {metadata.keywords?.length ? (
            metadata.keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary">
                {keyword}
              </Badge>
            ))
          ) : (
            <p className="text-sm">No keywords specified</p>
          )}
        </div>
      </div>

      {/* Favicon section */}
      {metadata.favicon && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Favicon:</p>
          <img
            src={metadata.favicon}
            alt="Site favicon"
            className="w-6 h-6"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}
