"use client";

import { X, Check, FileDown, Infinity, History, Heart } from "lucide-react";
import { useWorkspace } from "../hooks/use-workspace";

const FEATURES = [
  { icon: Infinity, text: "Unlimited drafts" },
  { icon: FileDown, text: "Export as PDF" },
  { icon: History, text: "Version history" },
  { icon: Heart, text: "Partner sharing" },
];

/**
 * Paywall modal — shown when a signed-in free user attempts a paid action
 * (export PDF, create draft beyond free limit, etc.).
 *
 * Intent-based: only appears when the user clicks something that requires
 * an upgrade. Never interrupts during writing.
 */
export function PaywallModal() {
  const { state, setShowPaywallModal, setPaidEntitlement } = useWorkspace();

  if (!state.showPaywallModal) return null;

  function handleClose() {
    setShowPaywallModal(false);
  }

  function handlePurchase() {
    // TODO: Integrate Stripe / Polar.sh checkout
    // For now, mock the purchase completion
    setPaidEntitlement(true);
    setShowPaywallModal(false);
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm mx-4 rounded-xl bg-white shadow-2xl overflow-hidden">
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 flex items-center justify-center h-7 w-7 rounded-full text-base-400 transition-colors hover:bg-sand-100 hover:text-base-600 z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="px-6 pt-8 pb-4 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-[11px] font-semibold text-accent-600 uppercase tracking-wider mb-4">
            Complete
          </div>
          <h2 className="text-xl font-serif font-semibold text-base-900">
            Your vows deserve the full experience
          </h2>
          <p className="text-sm text-base-500 mt-2 leading-relaxed">
            One-time purchase. No subscriptions. Yours forever.
          </p>
        </div>

        {/* Features */}
        <div className="px-6 pb-4">
          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-accent-50">
                  <Icon className="h-4 w-4 text-accent-500" />
                </div>
                <span className="text-sm text-base-700">{text}</span>
                <Check className="h-4 w-4 text-green-500 ml-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="px-6 pb-8 pt-2">
          <div className="text-center mb-4">
            <span className="text-3xl font-bold text-base-900">$129</span>
            <span className="text-sm text-base-400 ml-1">one-time</span>
          </div>
          <button
            onClick={handlePurchase}
            className="w-full rounded-lg bg-accent-500 py-3 text-base font-medium text-white shadow-md transition-colors hover:bg-accent-600"
          >
            Get Complete Access
          </button>
          <p className="text-[11px] text-base-400 text-center mt-3">
            30-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </div>
  );
}
