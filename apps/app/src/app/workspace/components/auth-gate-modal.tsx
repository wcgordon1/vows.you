"use client";

import { SignUp } from "@clerk/nextjs";
import { X } from "lucide-react";
import { useWorkspace } from "../hooks/use-workspace";
import { clearPendingAction } from "../lib/pending-action";

/**
 * Auth gate modal — shown when an anonymous user attempts a gated action
 * (create draft beyond limit, sync, export, etc.).
 *
 * Embeds Clerk's <SignIn /> inside our own modal with custom messaging.
 * On successful sign-in, useWorkspace detects the auth state change
 * and consumes the pending action automatically.
 */
export function AuthGateModal() {
  const { state, setShowAuthModal } = useWorkspace();

  if (!state.showAuthModal) return null;

  function handleClose() {
    clearPendingAction();
    setShowAuthModal(false);
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-10 right-0 flex items-center justify-center h-8 w-8 rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Custom messaging header */}
        <div className="rounded-t-xl bg-white px-6 pt-6 pb-2 text-center">
          <h2 className="text-lg font-serif font-semibold text-base-900">
            Save your vows
          </h2>
          <p className="text-sm text-base-500 mt-1">
            Create a free account to access your vows on any device.
          </p>
        </div>

        {/* Clerk SignUp form (with "Already have an account? Sign in" link) */}
        <div className="rounded-b-xl bg-white px-6 pb-6 flex justify-center">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 p-0 w-full",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "border-base-200 text-base-700 hover:bg-sand-50",
                formButtonPrimary:
                  "bg-accent-500 hover:bg-accent-600 text-white",
                footerAction: "text-base-500",
                footerActionLink: "text-accent-600 hover:text-accent-700",
              },
            }}
            routing="hash"
            signInUrl="#/sign-in"
            fallbackRedirectUrl="/workspace"
          />
        </div>
      </div>
    </div>
  );
}
