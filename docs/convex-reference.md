# Convex Reference — vows.you app

Everything about how Convex is set up, the gotchas we hit, and how to evolve the schema going forward.

---

## Architecture overview

```
Anonymous user → IndexedDB (draft-store.ts) → local only
Signed-in user → Convex (drafts table) → server is source of truth
Sign-in event  → migrate local drafts to Convex → clear IndexedDB
```

The single integration point is `use-workspace.tsx`. Every component calls the same functions (`createDraft`, `updateActiveDraftContent`, etc.) — the provider routes to the correct store based on auth state.

---

## File map

| File | What it does |
|------|-------------|
| `apps/app/convex/schema.ts` | Table definitions, indexes |
| `apps/app/convex/drafts.ts` | CRUD mutations/queries for drafts (7 functions) |
| `apps/app/convex/entitlements.ts` | `hasPaid` query stub (Phase 4) |
| `apps/app/convex/auth.config.ts` | Clerk JWT provider config |
| `apps/app/convex/tsconfig.json` | TypeScript config for Convex server functions |
| `apps/app/convex/_generated/` | **Auto-generated** by `npx convex dev` — don't edit |
| `apps/app/src/app/convex-client-provider.tsx` | Client component: `ClerkProvider` + `ConvexProviderWithClerk` |
| `apps/app/src/app/layout.tsx` | Root layout wraps children in `ConvexClerkProvider` |
| `apps/app/src/app/workspace/hooks/use-workspace.tsx` | Dual-store logic — all draft operations route here |
| `apps/app/src/app/workspace/lib/draft-store.ts` | IndexedDB/localStorage store for anonymous drafts (unchanged) |

---

## Environment variables

### Next.js (`apps/app/.env.local`)

| Variable | Source | Notes |
|----------|--------|-------|
| `CONVEX_DEPLOYMENT` | Auto-filled by `npx convex dev` | e.g. `dev:friendly-ox-39` |
| `NEXT_PUBLIC_CONVEX_URL` | Auto-filled by `npx convex dev` | e.g. `https://friendly-ox-39.convex.cloud` |
| `CLERK_JWT_ISSUER_DOMAIN` | Reference only | Not read by Next.js at runtime |

### Convex Dashboard (Settings > Environment Variables)

| Variable | Value | Why |
|----------|-------|-----|
| `CLERK_JWT_ISSUER_DOMAIN` | `https://light-sunbird-97.clerk.accounts.dev` | `auth.config.ts` reads this to verify Clerk JWTs |

**Important:** `process.env` inside `convex/` files refers to **Convex** env vars (set in Convex dashboard), NOT Next.js `.env.local` values. They are completely separate runtimes.

### Production (Vercel + Convex)

When deploying to production:

1. Run `npx convex deploy` to create a production Convex deployment
2. Set Vercel env vars: `NEXT_PUBLIC_CONVEX_URL` (production URL), `CONVEX_DEPLOYMENT` (production name)
3. In Clerk: switch to Production instance, create `convex` JWT template
4. In Convex production dashboard: set `CLERK_JWT_ISSUER_DOMAIN` to Clerk production domain

---

## Clerk + Convex auth setup

Three things must exist for auth to work:

1. **Clerk JWT Template** named exactly `convex` (Clerk Dashboard > Configure > JWT Templates > Convex preset)
2. **Convex env var** `CLERK_JWT_ISSUER_DOMAIN` set to your Clerk Frontend API URL (just the domain, NOT the `/.well-known/jwks.json` path — Convex appends that automatically)
3. **`ConvexProviderWithClerk`** wrapping the app in `convex-client-provider.tsx`

### How auth flows

1. User signs in via Clerk
2. Clerk issues a JWT using the `convex` template
3. `ConvexProviderWithClerk` passes the JWT to Convex on every request
4. Convex functions call `ctx.auth.getUserIdentity()` to get the verified identity
5. `identity.subject` is the Clerk user ID — used as `userId` on all records

---

## Gotchas we hit

### 1. Phantom drafts on page refresh

**Problem:** Clerk's `useAuth().isSignedIn` starts as `undefined` (loading), which we coerced to `false`. The anonymous draft loader ran during this window, created an empty local draft, then Clerk resolved to `true`, and the migration effect shipped the phantom draft to Convex. Every refresh = new "Untitled" draft.

**Fix:** Destructure `isLoaded` from `useAuth()` and gate ALL effects on `clerkLoaded`:

```typescript
const { isSignedIn: clerkSignedIn, isLoaded: clerkLoaded } = useAuth();

useEffect(() => {
  if (!clerkLoaded) return;  // <-- wait for Clerk to resolve
  if (isSignedIn) return;
  // ...load local drafts
}, [clerkLoaded, isSignedIn]);
```

### 2. Active draft not restored after refresh

**Problem:** For signed-in users, `activeDraftId` starts as `null` in the reducer. The sync effect always picked `drafts[0]` instead of restoring from `sessionStorage`.

**Fix:** Check `sessionStorage` before falling back:

```typescript
useEffect(() => {
  if (!isLoaded || drafts.length === 0) return;
  if (state.activeDraftId && drafts.find(d => d.id === state.activeDraftId)) return;

  // Try sessionStorage first
  const savedId = draftStore.getActiveDraftId();
  if (savedId && drafts.find(d => d.id === savedId)) {
    dispatch({ type: "DRAFT_SWITCHED", id: savedId });
    return;
  }

  // Fallback
  const id = drafts[0].id;
  draftStore.setActiveDraftId(id);
  dispatch({ type: "DRAFT_SWITCHED", id });
}, [drafts, isLoaded, state.activeDraftId]);
```

### 3. Convex env vars vs Next.js env vars

`convex/auth.config.ts` runs on Convex's servers. `process.env.CLERK_JWT_ISSUER_DOMAIN` there reads from the **Convex dashboard**, not `.env.local`. We wasted time before realizing this.

### 4. CLERK_JWT_ISSUER_DOMAIN is the base domain only

Use `https://light-sunbird-97.clerk.accounts.dev` — NOT `https://light-sunbird-97.clerk.accounts.dev/.well-known/jwks.json`. Convex appends the JWKS path internally.

---

## Current schema (`convex/schema.ts`)

```typescript
drafts: defineTable({
  userId: v.string(),          // Clerk user ID (from identity.subject)
  title: v.string(),
  body: v.optional(v.any()),   // Tiptap JSON document
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),  // soft delete
})
  .index("by_user", ["userId"])
  .index("by_user_active", ["userId", "deletedAt"])
```

---

## How to update the schema

### Safe changes (non-breaking, just push)

These require NO migration. Just edit `schema.ts` and `npx convex dev` picks it up:

- **Add a new optional field:** `newField: v.optional(v.string())`
- **Add a new table:** `newTable: defineTable({ ... })`
- **Add a new index:** `.index("by_whatever", ["field1", "field2"])`

### Unsafe changes (need migration)

- **Remove a field:** Write a migration to strip the field from all docs first, then remove from schema
- **Change a field type:** (e.g. `v.string()` to `v.number()`) — requires migrating all existing docs
- **Rename a field:** Same as remove + add — write a migration to copy values, then update schema
- **Make a required field optional** (or vice versa): Must migrate existing docs to match

### Migration pattern

Convex doesn't have built-in migrations like SQL. You write a one-off mutation:

```typescript
// convex/migrations.ts (delete after running)
export const addFieldX = mutation({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("drafts").collect();
    for (const doc of docs) {
      await ctx.db.patch(doc._id, { newField: "default_value" });
    }
  },
});
```

Run it once via the Convex dashboard (Functions tab > run mutation), then delete the file.

---

## Predicted future schema additions

Here's what we'll likely need as features land. All designed as **non-breaking additions**.

### Phase 4 — Entitlements (payments)

```typescript
entitlements: defineTable({
  userId: v.string(),
  entitlement: v.string(),           // "vows_pro_lifetime"
  grantedAt: v.number(),
  revokedAt: v.optional(v.number()), // set on refund/chargeback
  polarEventId: v.optional(v.string()), // webhook idempotency key
})
  .index("by_user", ["userId"])
  .index("by_event", ["polarEventId"])
```

**To activate:** Uncomment in `schema.ts`, update `entitlements.ts` query, add webhook handler.

### AI coach / chat

```typescript
chat_sessions: defineTable({
  userId: v.string(),
  draftId: v.optional(v.id("drafts")),  // linked draft (optional)
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_draft", ["draftId"]),

chat_messages: defineTable({
  sessionId: v.id("chat_sessions"),
  role: v.string(),                      // "user" | "assistant" | "system"
  content: v.string(),
  createdAt: v.number(),
})
  .index("by_session", ["sessionId"])
```

### Drafts table — likely new optional fields

| Field | Type | When | Why |
|-------|------|------|-----|
| `wordCount` | `v.optional(v.number())` | When we add analytics | Avoid recomputing on every load |
| `lastAnalysis` | `v.optional(v.any())` | When AI coach ships | Cache vow analysis results |
| `sharedAt` | `v.optional(v.number())` | Sharing feature | Track if/when draft was shared |
| `shareToken` | `v.optional(v.string())` | Sharing feature | Public share link token |
| `templateId` | `v.optional(v.string())` | If templates link to drafts | Which template generated this |
| `tags` | `v.optional(v.array(v.string()))` | Organization feature | User-applied labels |

All are `v.optional()` so adding them is always a non-breaking push.

### User settings / preferences

```typescript
user_settings: defineTable({
  userId: v.string(),
  theme: v.optional(v.string()),
  autoSaveInterval: v.optional(v.number()),
  defaultFont: v.optional(v.string()),
  onboardingComplete: v.optional(v.boolean()),
})
  .index("by_user", ["userId"])
```

---

## Running Convex

### Local development

```bash
# Terminal 1 — Convex (watches + deploys functions to dev)
cd apps/app && npx convex dev

# Terminal 2 — Next.js
cd apps/app && npm run dev
```

### Production deploy

```bash
cd apps/app && npx convex deploy
```

### Useful commands

```bash
npx convex login          # Switch accounts
npx convex logout         # Log out
npx convex dev            # Start dev watcher
npx convex deploy         # Deploy to production
npx convex data           # View data in terminal
npx convex env set KEY VALUE   # Set env var from CLI
```

---

## Security rules (from plan-mvp-phase-prompts.md)

- **Never trust client-supplied userId** — always use `ctx.auth.getUserIdentity().subject`
- **Never log vow text** — the `body` field must not appear in logs, analytics, or error payloads
- **Never render as HTML** — `dangerouslySetInnerHTML` is forbidden for draft content
- **Ownership check on every function** — `requireAuth()` + `draft.userId !== userId` guard
- **Body size limit** — 500KB max via `validateBody()` to prevent abuse
- **Soft delete** — `deletedAt` timestamp instead of hard delete (recoverable)
