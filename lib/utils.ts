import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export function validateUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const validProtocols = ["http:", "https:"];

    if (!validProtocols.includes(parsedUrl.protocol)) {
      return {
        isValid: false,
        error: "Invalid URL protocol. Must be http or https.",
      };
    }

    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: "Invalid URL format" };
  }
}
