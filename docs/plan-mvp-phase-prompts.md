# Phase Prompts — vows.you MVP (Astro marketing + Next.js app + Clerk + Convex + Polar)

Use this file to run the project in “planning mode” without loading too much at once.
Each phase has a copy/paste prompt intended for a coding agent.

Reference master plan: `docs/plan-mvp.md`.

We will build all features and gate free / paid tiers at the end. Already have checkGate, requestAction, and hasPaidEntitlement wired up. It's literally just wrapping existing buttons with if (!isPaid) { requestAction("X"); return; } -- a few lines per feature.

---

## Global constraints (apply to every phase)

- Repo is a monorepo:
  - Marketing: Astro at repo root (`/`)
  - App: Next.js in `apps/app`
- Domains:
  - Marketing: `https://vows.you`
  - App: `https://app.vows.you`
- MVP scope: “vows drafts only”
  - No wedding website builder
  - No custom domains
- Security / privacy:
  - Never log vow text (server logs, client logs, analytics, error trackers)
  - Never render stored vow content as HTML (`dangerouslySetInnerHTML` is forbidden)
  - Draft access must be enforced server-side (no trusting client `userId`)
- Vercel previews:
  - For MVP: do NOT enable auth/billing in Preview deployments (avoid redirect/origin chaos)
  - Only Local + Production must work
- Payment gating:
  - Never unlock features based on a client-side “success” redirect
  - Unlock only after verified webhook / verified backend confirmation
  - Webhooks must verify signature and be idempotent

Definition of done (global):
- Local dev works
- Production works
- No secrets committed
- No PII leaks in logs/analytics
- Clear README-ish notes in the plan docs for future you

---

## Phase 0 — Setup & sanity

### Prompt (copy/paste)
You are working in repo `/Users/williamgordon/Downloads/brightlight-main`.

Goal:
- Create a Next.js app at `apps/app` with its own `package.json`
- Ensure it runs locally
- Ensure the monorepo layout is clean and future-proof

Constraints:
- Do not modify the Astro marketing app behavior.
- Next.js app must be self-contained under `apps/app`.
- Do not introduce auth/billing yet.

Tasks:
- Create branch `feat/mvp-app` (provide bash command).
- Generate Next.js app into `apps/app` (App Router, TS, ESLint, src/ dir, optional Tailwind).
- Ensure `apps/app` dev server runs.
- Add minimal routes:
  - `/` (simple landing within the app)
  - `/dashboard` placeholder (no auth yet)
- Provide commands to run dev for both apps (Astro + Next).

Pitfalls to avoid:
- Installing Next deps into the root `package.json` by accident.
- Confusing root scripts vs app scripts.
- Forgetting to set correct working directory when running commands.

Acceptance checks:
- `npm run dev` works in repo root (Astro).
- `npm run dev` works in `apps/app` (Next).
- `apps/app/package.json` exists and is the only place Next deps live.

Output:
- Exact bash commands executed
- Final folder structure summary
- Any notes needed for Vercel later (root directory for app is `apps/app`)

---

## Phase 1 — Styling parity

### Prompt (copy/paste)
Goal:
- Make the Next.js app visually match the Astro marketing site by reusing Tailwind v4 + global tokens.

Constraints:
- Tailwind v4 must be used in Next.js because `src/styles/global.css` uses:
  - `@import "tailwindcss";`
  - `@plugin ...`
  - `@theme { ... }`
- Keep styling DRY if possible, but prefer “works reliably” over perfection.

Tasks:
- Install Tailwind v4 tooling in `apps/app`:
  - `tailwindcss`, `@tailwindcss/postcss`, `@tailwindcss/typography`, `@tailwindcss/forms`, `tailwind-scrollbar-hide`
- Ensure `apps/app/postcss.config.mjs` uses `@tailwindcss/postcss`.
- Copy contents of `src/styles/global.css` into Next’s `apps/app/src/app/globals.css`.
- Ensure `apps/app/src/app/layout.tsx` imports `./globals.css`.
- Handle fonts:
  - The CSS expects `Geist`, `Geist Mono`, `Noto Serif`.
  - Either load these fonts in Next (preferred) or change CSS vars to match what Next loads.
- Provide a quick visual spot-check list:
  - background colors
  - accent colors
  - serif headings
  - button styles (if any)
  - typography plugin behavior

Pitfalls to avoid:
- Mixing Tailwind v3 setup guides with v4 (wrong directives, wrong config).
- Forgetting PostCSS plugin causing `@theme`/`@plugin` to be ignored.
- Assuming fonts exist when they aren’t loaded (silent mismatch).
- Import order issues (globals not being loaded).

Acceptance checks:
- Next app renders with the same color tokens as marketing.
- No build errors about Tailwind directives.
- Fonts are either loaded or intentionally replaced.

Output:
- Commands to install deps
- Files touched list
- What was chosen for fonts and why

---

## Phase 2 — Auth (Clerk)

### Prompt (copy/paste)
Goal:
- Add Clerk auth to the Next.js app with sign-in/up and a protected dashboard.

Constraints:
- App domain is `app.vows.you` in production.
- For MVP: Preview deployments must NOT require working auth (avoid allowed-origin chaos).
- Start minimal: protect `/dashboard` only.
- No vow drafts storage yet (Phase 3).

Tasks:
- Install `@clerk/nextjs` in `apps/app`.
- Add `ClerkProvider` to `apps/app/src/app/layout.tsx`.
- Add Clerk middleware:
  - protect `/dashboard` and any future app-only routes
  - allow `/sign-in` and `/sign-up`
- Add routes/pages:
  - `/sign-in` using Clerk components
  - `/sign-up` using Clerk components
  - `/dashboard` shows user info and a “Sign out” button/link
- Add local env var instructions:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`

Preview env policy (explicit):
- If `VERCEL_ENV === "preview"`, the app should show a friendly message or disable auth routes.
- Do NOT attempt to configure Clerk for every preview URL.

Pitfalls to avoid:
- Redirect loops (protected page redirects to sign-in which redirects back).
- Wrong sign-in URLs when using subdomain.
- Missing env vars in the correct environment.
- Accidentally running middleware on static assets.

Acceptance checks:
- Local: sign-in and sign-up work at `http://localhost:3000/sign-in` and `/sign-up`.
- Local: `/dashboard` redirects to sign-in if logged out.
- Local: `/dashboard` loads when logged in.
- Production plan: list exact Clerk dashboard settings needed for `https://app.vows.you`.

Output:
- Checklist of Clerk dashboard settings (dev + prod)
- All env vars and where they must be set (local + Vercel prod + dev)
- Any middleware matcher notes

---

## Phase 3 — Drafts backend (Convex)

### Prompt (copy/paste)
Goal:
- Implement server-side storage for vow drafts with strict per-user access control.

Constraints:
- Never trust client-supplied `userId`.
- All draft access must be scoped to the authenticated Clerk user identity on the server.
- Never log vow text.
- Rendering vow text must be safe (no HTML injection).

Tasks:
- Add Convex to `apps/app` and initialize it.
- Integrate Clerk auth with Convex (JWT/identity).
- Data model (minimum):
  - drafts: `{ userId, title, body, createdAt, updatedAt }`
- Backend functions:
  - `createDraft(title?, body?)`
  - `listDrafts()`
  - `getDraft(id)`
  - `updateDraft(id, patch)`
  - `deleteDraft(id)` (soft delete ok)
- Next.js UI:
  - `/dashboard`: list drafts + “New draft”
  - `/drafts/[id]`: editor with autosave debounce
- Security requirements:
  - `getDraft` must verify ownership
  - `listDrafts` must filter by `userId`
  - `updateDraft/deleteDraft` must verify ownership
- Data privacy:
  - do not send vow text to analytics events
  - do not include vow text in error payloads

Pitfalls to avoid:
- Authorization holes (e.g. fetching by id without owner check).
- Querying drafts client-side without server enforcement.
- Storing huge drafts without limits (consider a max length for MVP).
- XSS: do not render draft as HTML.

Acceptance checks:
- A user can only see their own drafts.
- Two different users cannot access each other’s draft by guessing IDs.
- Autosave works and does not spam the backend.
- No vow text in logs.

Output:
- Schema / table definition
- Functions list + auth checks described
- UI routes and how they call the backend

---

## Phase 4 — Payments (Polar one-time $129)

### Prompt (copy/paste)
Goal:
- Add a one-time payment ($129) using Polar, with secure webhooks, and grant entitlements after payment confirmation.

Constraints:
- Unlock must be driven by verified webhook events (not redirects).
- Webhook signature verification is mandatory.
- Webhook handler must be idempotent.
- For MVP: do not support Polar in Preview deployments.
- Entitlements must be keyed to `clerkUserId` (stable identifier).

Tasks:
- Define entitlement:
  - name: `vows_pro_lifetime` (or similar)
  - grantedAt timestamp
  - revokedAt timestamp (if refunds/chargebacks)
- Implement:
  - `POST /api/polar/checkout` (auth required)
    - creates checkout session with metadata `{ clerkUserId, purchaseId }`
  - `POST /api/polar/webhook`
    - uses raw body to verify signature
    - idempotency: store `eventId` processed
    - on successful payment: grant entitlement in DB
    - on refund/chargeback: revoke entitlement (policy)
- App gating:
  - UI checks entitlement to show locked/unlocked features
  - Server-side checks enforce it (don’t rely on client state)

Pitfalls to avoid:
- Parsing JSON before verifying signature (breaks verification).
- Missing idempotency (double grants).
- Using email as user key.
- Preview env accidentally calling prod Polar endpoints.
- Not handling refunds.

Acceptance checks:
- A paid user gets entitlement via webhook only.
- Replayed webhook does not duplicate entitlements.
- Non-paid users cannot access paid features.
- Webhook endpoint rejects invalid signatures.

Output:
- List of Polar env vars + where to set them
- Webhook verification approach
- Idempotency storage strategy

---

## Phase 5 — Hardening & operational safety

### Prompt (copy/paste)
Goal:
- Reduce risk: privacy leaks, abuse, and production debugging pain.

Tasks:
- Preview env policy enforced:
  - auth/billing disabled or gated
- Add rate limits:
  - checkout creation endpoint
  - any expensive endpoints
- Logging:
  - ensure vow text is never logged
  - ensure errors do not include vow content
- Analytics:
  - disable input autocapture
  - track only aggregate metrics (counts, lengths), never content
- Content security:
  - add CSP to reduce XSS blast radius
  - confirm no `dangerouslySetInnerHTML` for drafts

Pitfalls to avoid:
- Overlogging request bodies.
- Shipping with analytics capturing form fields.
- CSP too strict breaking Clerk components (set CSP carefully).

Acceptance checks:
- Can demonstrate no vow text in logs/analytics.
- Basic abuse protection exists.
- Production is stable and debuggable.

Output:
- Final checklist
- Any policies documented in `docs/plan-mvp.md` (if needed)

---

## Notes for future phases (not MVP)
- Sharing links
- Collaboration
- Wedding website builder
- Subscriptions instead of one-time
- Custom domains 