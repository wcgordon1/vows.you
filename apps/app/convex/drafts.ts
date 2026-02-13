// ─── Drafts CRUD ──────────────────────────────────────────────────────────────
// All functions extract userId from the Clerk JWT via Convex auth identity.
// Never trust a client-supplied userId.
// Never log vow text (body field).

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireAuth(ctx: { auth: { getUserIdentity: () => Promise<unknown> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return (identity as { subject: string }).subject; // Clerk user ID
}

// Max body size guard — Tiptap JSON shouldn't exceed ~500KB for MVP
const MAX_BODY_SIZE = 500_000;

function validateBody(body: unknown) {
  if (body === undefined || body === null) return;
  const size = JSON.stringify(body).length;
  if (size > MAX_BODY_SIZE) {
    throw new Error(`Draft body too large (${size} bytes, max ${MAX_BODY_SIZE})`);
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** List all non-deleted drafts for the current user, newest first. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const drafts = await ctx.db
      .query("drafts")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId).eq("deletedAt", undefined),
      )
      .order("desc")
      .collect();

    return drafts;
  },
});

/** Get a single draft by ID, verifying ownership. */
export const get = query({
  args: { id: v.id("drafts") },
  handler: async (ctx, { id }) => {
    const userId = await requireAuth(ctx);
    const draft = await ctx.db.get(id);

    if (!draft || draft.userId !== userId) return null;
    if (draft.deletedAt) return null;

    return draft;
  },
});

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Create a new empty draft. */
export const create = mutation({
  args: {
    title: v.optional(v.string()),
    body: v.optional(v.any()),
  },
  handler: async (ctx, { title, body }) => {
    const userId = await requireAuth(ctx);
    validateBody(body);

    const now = Date.now();
    const id = await ctx.db.insert("drafts", {
      userId,
      title: title ?? "Untitled",
      body: body ?? null,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

/** Update a draft's body and/or title. Verifies ownership. */
export const update = mutation({
  args: {
    id: v.id("drafts"),
    title: v.optional(v.string()),
    body: v.optional(v.any()),
  },
  handler: async (ctx, { id, title, body }) => {
    const userId = await requireAuth(ctx);
    const draft = await ctx.db.get(id);

    if (!draft || draft.userId !== userId) {
      throw new Error("Draft not found");
    }

    validateBody(body);

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (title !== undefined) patch.title = title;
    if (body !== undefined) patch.body = body;

    await ctx.db.patch(id, patch);
  },
});

/** Rename a draft. Verifies ownership. */
export const rename = mutation({
  args: {
    id: v.id("drafts"),
    title: v.string(),
  },
  handler: async (ctx, { id, title }) => {
    const userId = await requireAuth(ctx);
    const draft = await ctx.db.get(id);

    if (!draft || draft.userId !== userId) {
      throw new Error("Draft not found");
    }

    await ctx.db.patch(id, { title, updatedAt: Date.now() });
  },
});

/** Soft-delete a draft. Verifies ownership. */
export const remove = mutation({
  args: { id: v.id("drafts") },
  handler: async (ctx, { id }) => {
    const userId = await requireAuth(ctx);
    const draft = await ctx.db.get(id);

    if (!draft || draft.userId !== userId) {
      throw new Error("Draft not found");
    }

    await ctx.db.patch(id, { deletedAt: Date.now() });
  },
});

/** Migrate local drafts to Convex on first sign-in. */
export const migrateFromLocal = mutation({
  args: {
    drafts: v.array(
      v.object({
        localId: v.string(), // client-side ID (for dedup)
        title: v.string(),
        body: v.optional(v.any()),
        createdAt: v.number(),
        updatedAt: v.number(),
      }),
    ),
  },
  handler: async (ctx, { drafts }) => {
    const userId = await requireAuth(ctx);

    // Check if user already has drafts (migration already happened)
    const existing = await ctx.db
      .query("drafts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      // User already has server drafts — skip migration to avoid duplicates.
      // Return empty array so client knows to just clear local.
      return [];
    }

    const insertedIds: string[] = [];
    for (const draft of drafts) {
      validateBody(draft.body);
      const id = await ctx.db.insert("drafts", {
        userId,
        title: draft.title,
        body: draft.body ?? null,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      });
      insertedIds.push(id);
    }

    return insertedIds;
  },
});
