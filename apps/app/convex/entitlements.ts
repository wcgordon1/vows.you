// ─── Entitlements (stub for Phase 4) ──────────────────────────────────────────
// Read path is wired now. Phase 4 adds the entitlements table + Polar webhook
// that writes to it. At that point, this query returns real data.

import { query } from "./_generated/server";

/** Check if the current user has a paid entitlement. */
export const hasPaid = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    // Phase 4: uncomment when entitlements table is added to schema
    // const userId = identity.subject;
    // const entitlement = await ctx.db
    //   .query("entitlements")
    //   .withIndex("by_user", (q) => q.eq("userId", userId))
    //   .first();
    //
    // if (!entitlement) return false;
    // return !entitlement.revokedAt;

    return false;
  },
});
