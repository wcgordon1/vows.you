// ─── Pending Action ──────────────────────────────────────────────────────────
// Stores an action the user intended to take before being gated by auth/paywall.
// Persists in sessionStorage so it survives page refresh and redirect flows.

import type { GatedAction } from "./entitlements";

const STORAGE_KEY = "vows-pending-action";

export interface PendingAction {
  type: GatedAction;
  payload?: Record<string, unknown>;
  returnUrl: string;
}

/**
 * Store a pending action to resume after auth/payment completes.
 */
export function setPendingAction(action: PendingAction): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(action));
  } catch {
    // sessionStorage unavailable — action will be lost on redirect
  }
}

/**
 * Retrieve and clear the pending action (consume it).
 * Returns null if there's no pending action.
 */
export function consumePendingAction(): PendingAction | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    return JSON.parse(raw) as PendingAction;
  } catch {
    return null;
  }
}

/**
 * Peek at the pending action without consuming it.
 */
export function peekPendingAction(): PendingAction | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PendingAction) : null;
  } catch {
    return null;
  }
}

/**
 * Clear any pending action (e.g., user cancelled).
 */
export function clearPendingAction(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
