import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Static routes that should be handled by Clerk
const AUTH_ROUTES = [
  "/sign-in",
  "/sign-up",
  "/dashboard",
  "/profile",
  "/settings",
];

// API routes that should bypass URL shortener logic
const API_ROUTES = ["/api/auth", "/api/shorturl", "/api/generate"];

// System routes that should be ignored
const SYSTEM_ROUTES = [
  "/_next",
  "/favicon.ico",
  "/manifest.json",
  "/robots.txt",
  "/sitemap.xml",
];

function isAuthRoute(path: string) {
  return AUTH_ROUTES.some((route) => path.startsWith(route));
}

function isApiRoute(path: string) {
  return API_ROUTES.some((route) => path.startsWith(route));
}

function isSystemRoute(path: string) {
  return SYSTEM_ROUTES.some((route) => path.startsWith(route)) || path === "/";
}

export default clerkMiddleware((auth, request) => {
  const path = request.nextUrl.pathname;

  // Handle auth routes with Clerk
  if (isAuthRoute(path)) {
    return;
  }

  // Allow API routes to pass through
  if (isApiRoute(path)) {
    return NextResponse.next();
  }

  // Allow system routes to pass through
  if (isSystemRoute(path)) {
    return NextResponse.next();
  }

  // For single-segment paths, treat as potential short URLs
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 1) {
    return NextResponse.next();
  }

  // Default to Clerk's auth handling
  return;
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
