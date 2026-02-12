# MVP Master Plan — vows.you (Marketing Astro + App Next.js)

## Decisions (locked)
- Repo: single repo monorepo
- Marketing: Astro at repo root
- App: Next.js in `apps/app`
- App domain: `app.vows.you`
- Auth: Clerk
- Backend: Convex (drafts)
- Payments: Polar one-time $129 (after drafts work)
- Vercel previews: do NOT enable auth/billing for MVP (avoid preview-origin chaos)
- Privacy: never log vow text or send vow text to analytics

## Phase 0 — Setup & sanity (goal: no surprises)
### 0.1 Create branch
- `git checkout -b feat/mvp-app`

### 0.2 Create Next.js app
- Create `apps/app` with `create-next-app`
- Confirm `npm run dev` works locally

### 0.3 Deploy skeleton app to Vercel
- Create a Vercel Project "vows-app" with Root Directory `apps/app`
- Deploy and confirm basic page loads

## Phase 1 — Styling parity (goal: it looks like the marketing site)
### 1.1 Tailwind v4 in Next app
- Install `tailwindcss @tailwindcss/postcss @tailwindcss/typography @tailwindcss/forms tailwind-scrollbar-hide`
- Ensure `postcss.config.mjs` uses `@tailwindcss/postcss`

### 1.2 Copy global styles
- Copy `src/styles/global.css` (Astro) → `apps/app/src/app/globals.css` (Next)
- Confirm `layout.tsx` imports `./globals.css`

### 1.3 Fonts
- Ensure Geist + Noto Serif are loaded in the app OR update CSS variables to match the app fonts

## Phase 2 — Auth (goal: login works locally and in prod)
### 2.1 Clerk local dev
- Install `@clerk/nextjs`
- Add `.env.local` keys in `apps/app`
- Add ClerkProvider in app layout
- Add middleware protection (start by protecting `/dashboard`)
- Add routes:
  - `/sign-in`
  - `/sign-up`
  - `/dashboard`

### 2.2 Clerk production
- Add `app.vows.you` to Clerk allowed origins/redirect URLs
- Set env vars in Vercel Production for the app project
- Confirm auth works on `https://app.vows.you`

## Phase 3 — Drafts backend (goal: users can save vows server-side)
### 3.1 Convex setup
- Install `convex`
- Run `npx convex dev`
- Configure Clerk <-> Convex auth

### 3.2 Data model: drafts
- `drafts`: { userId (clerk), title, body, createdAt, updatedAt, deletedAt? }
- Backend functions:
  - createDraft
  - listDrafts (user-scoped)
  - getDraft (user-scoped)
  - updateDraft (user-scoped)
  - deleteDraft (user-scoped)

### 3.3 App UI
- `/dashboard` lists drafts + "New Draft"
- `/drafts/[id]` editor + autosave
- Render vow text as plain text (no HTML) to avoid XSS

## Phase 4 — Payments (goal: unlock paid tier safely)
### 4.1 Polar checkout
- Only logged-in users can start checkout
- Server creates checkout with metadata: { clerkUserId, purchaseId }

### 4.2 Polar webhook (security-critical)
- Verify webhook signature using raw request body
- Idempotency: store processed event IDs
- On confirmed payment: grant entitlement to clerkUserId
- On refund/chargeback: revoke entitlement (decide policy)

### 4.3 Feature gating
- Never unlock on client redirect
- App checks entitlement server-side / via Convex

## Phase 5 — Hardening (goal: no footguns)
- Disable auth/billing on Preview deployments OR use a single staging domain
- Rate limit checkout creation + webhook endpoints
- Never log vow contents
- Ensure analytics never capture input text
- Basic error handling + audit logs for payment events

## Rollout checklist (production)
- Marketing buttons link to:
  - `https://app.vows.you/sign-in`
  - `https://app.vows.you/sign-up`
- Vercel projects:
  - "vows-marketing" root `/` on `vows.you`
  - "vows-app" root `apps/app` on `app.vows.you`
- Env vars set in correct project + correct environment