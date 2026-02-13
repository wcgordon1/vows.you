"use client";

import { type ReactNode } from "react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";

// NEXT_PUBLIC_* vars are inlined at build time in client components — reliable
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Lazy-init Convex client only when URL is available (avoids crash on preview deploys)
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClerkProvider({ children }: { children: ReactNode }) {
  // No keys at all (e.g. preview deployment without env vars) — render bare
  if (!clerkKey) {
    return <>{children}</>;
  }

  // Clerk available but no Convex — render Clerk only
  if (!convex) {
    return <ClerkProvider>{children}</ClerkProvider>;
  }

  // Full stack — Clerk + Convex
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
