"use client";

import { type ReactNode } from "react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";

// ── Singleton Convex client ────────────────────────────────────────────────
// Created once per URL and cached at module level (survives re-renders).
let cachedConvex: ConvexReactClient | null = null;
let cachedUrl: string | null = null;

function getConvexClient(url: string): ConvexReactClient {
  if (cachedUrl !== url || !cachedConvex) {
    cachedConvex = new ConvexReactClient(url);
    cachedUrl = url;
  }
  return cachedConvex;
}

// ── Provider ───────────────────────────────────────────────────────────────
// Props come from the server-component root layout (process.env at runtime),
// which bypasses the flaky NEXT_PUBLIC_* build-time inlining in monorepos.

interface Props {
  children: ReactNode;
  convexUrl?: string;
  clerkKey?: string;
}

export function ConvexClerkProvider({ children, convexUrl, clerkKey }: Props) {
  // No Clerk key → bare render (preview deploys without env vars)
  if (!clerkKey) {
    return <>{children}</>;
  }

  // Clerk available but no Convex → auth only, no real-time DB
  if (!convexUrl) {
    return <ClerkProvider publishableKey={clerkKey}>{children}</ClerkProvider>;
  }

  // Full stack — Clerk + Convex
  const convex = getConvexClient(convexUrl);

  return (
    <ClerkProvider publishableKey={clerkKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
