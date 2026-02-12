// ─── Entitlements ────────────────────────────────────────────────────────────
// Centralized gating logic. Pure functions — no React, no side effects.
//
// Draft limits:
//   Anonymous (no account): 1 draft
//   Free (signed in):       2 drafts
//   Paid ("Complete"):      Unlimited
//
// Signup is NOT the same as paid. Account creation unlocks "durability"
// features (sync, multi-device). Payment unlocks premium features.

// ─── Types ───────────────────────────────────────────────────────────────────

export type GatedAction =
  | "CREATE_DRAFT"
  | "EXPORT_PDF"
  | "SYNC"
  | "SHARE";

export type GateResult =
  | { allowed: true }
  | { allowed: false; reason: "NEEDS_ACCOUNT" }
  | { allowed: false; reason: "NEEDS_UPGRADE" };

// ─── Constants ───────────────────────────────────────────────────────────────

const ANONYMOUS_DRAFT_LIMIT = 1;
const FREE_DRAFT_LIMIT = 2;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Can the user create another draft?
 */
export function canCreateDraft(
  currentDraftCount: number,
  isSignedIn: boolean,
  hasPaidEntitlement: boolean,
): GateResult {
  if (hasPaidEntitlement) return { allowed: true };

  const limit = isSignedIn ? FREE_DRAFT_LIMIT : ANONYMOUS_DRAFT_LIMIT;

  if (currentDraftCount >= limit) {
    // If anonymous, first gate is account creation
    if (!isSignedIn) {
      return { allowed: false, reason: "NEEDS_ACCOUNT" };
    }
    // Signed in but at free limit — needs upgrade
    return { allowed: false, reason: "NEEDS_UPGRADE" };
  }

  return { allowed: true };
}

/**
 * Can the user export to PDF / print?
 */
export function canExportPDF(
  isSignedIn: boolean,
  hasPaidEntitlement: boolean,
): GateResult {
  if (!isSignedIn) {
    return { allowed: false, reason: "NEEDS_ACCOUNT" };
  }
  if (!hasPaidEntitlement) {
    return { allowed: false, reason: "NEEDS_UPGRADE" };
  }
  return { allowed: true };
}

/**
 * Does this action require a signed-in account?
 */
export function requiresAccount(
  action: GatedAction,
  isSignedIn: boolean,
): boolean {
  if (isSignedIn) return false;

  // These actions always require an account for anonymous users
  const accountRequired: GatedAction[] = ["SYNC", "SHARE", "EXPORT_PDF"];
  return accountRequired.includes(action);
}

/**
 * Full gate check for any action. Returns what's blocking (if anything).
 */
export function checkGate(
  action: GatedAction,
  opts: {
    isSignedIn: boolean;
    hasPaidEntitlement: boolean;
    currentDraftCount: number;
  },
): GateResult {
  switch (action) {
    case "CREATE_DRAFT":
      return canCreateDraft(
        opts.currentDraftCount,
        opts.isSignedIn,
        opts.hasPaidEntitlement,
      );
    case "EXPORT_PDF":
      return canExportPDF(opts.isSignedIn, opts.hasPaidEntitlement);
    case "SYNC":
    case "SHARE":
      if (!opts.isSignedIn) {
        return { allowed: false, reason: "NEEDS_ACCOUNT" };
      }
      if (!opts.hasPaidEntitlement) {
        return { allowed: false, reason: "NEEDS_UPGRADE" };
      }
      return { allowed: true };
    default:
      return { allowed: true };
  }
}

// ─── Display helpers ─────────────────────────────────────────────────────────

export function getDraftLimit(
  isSignedIn: boolean,
  hasPaidEntitlement: boolean,
): number | null {
  if (hasPaidEntitlement) return null; // unlimited
  return isSignedIn ? FREE_DRAFT_LIMIT : ANONYMOUS_DRAFT_LIMIT;
}
