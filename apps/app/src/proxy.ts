import { clerkMiddleware } from "@clerk/nextjs/server";

// Workspace is anonymous-first — no route protection.
// Auth gating is handled in-app via the workspace context
// (auth-gate-modal.tsx) when users attempt "durability" actions.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
