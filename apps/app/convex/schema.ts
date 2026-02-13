import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Drafts ─────────────────────────────────────────────────────────────────
  // Core vow drafts table. body stores Tiptap JSON via v.any() so the schema
  // stays flexible as the editor evolves.
  drafts: defineTable({
    userId: v.string(), // Clerk subject (user ID)
    title: v.string(),
    body: v.optional(v.any()), // Tiptap JSON document
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()), // soft delete timestamp
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "deletedAt"]),

  // Phase 4 — Entitlements (uncomment when implementing payments)
  // entitlements: defineTable({
  //   userId: v.string(),
  //   entitlement: v.string(),       // e.g. "vows_pro_lifetime"
  //   grantedAt: v.number(),
  //   revokedAt: v.optional(v.number()),
  //   polarEventId: v.optional(v.string()), // idempotency key
  // }).index("by_user", ["userId"])
  //   .index("by_event", ["polarEventId"]),

  // Future — AI chat
  // chat_sessions: defineTable({ ... }),
  // chat_messages: defineTable({ ... }),
});
