# Environment Variables — `apps/app`

All variables go in `apps/app/.env.local` (gitignored by `apps/app/.gitignore`).

## Required

| Variable | Where to get it | Notes |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [Clerk Dashboard → API Keys](https://dashboard.clerk.com/last-active?path=api-keys) | Starts with `pk_test_` (dev) or `pk_live_` (prod) |
| `CLERK_SECRET_KEY` | [Clerk Dashboard → API Keys](https://dashboard.clerk.com/last-active?path=api-keys) | Starts with `sk_test_` (dev) or `sk_live_` (prod) |

## Optional (defaults shown)

| Variable | Default | Notes |
|---|---|---|
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | Route where Clerk redirects unauthenticated users |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` | Route for new user registration |

## Vercel deployment

- **Production**: set all four variables above with production Clerk keys.
- **Preview**: intentionally omit Clerk keys. The app detects missing keys and disables auth gracefully.

## Clerk dashboard settings

### Development instance

- Allowed origins: `http://localhost:3000`

### Production instance (`app.vows.you`)

- Allowed origins: `https://app.vows.you`
- Home URL: `https://app.vows.you`
- Sign-in URL: `https://app.vows.you/sign-in`
- Sign-up URL: `https://app.vows.you/sign-up`
- After sign-in URL: `https://app.vows.you/`
- After sign-up URL: `https://app.vows.you/`
