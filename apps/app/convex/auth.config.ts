// Convex ↔ Clerk JWT integration
//
// SETUP REQUIRED:
// 1. Clerk Dashboard → JWT Templates → create a template named "convex"
// 2. Convex Dashboard → Settings → Environment Variables → add:
//      Name:  CLERK_JWT_ISSUER_DOMAIN
//      Value: https://<your-clerk-frontend-api> (e.g. https://light-sunbird-97.clerk.accounts.dev)
//
// NOTE: process.env here refers to CONVEX environment variables (set in
// Convex dashboard), not Next.js .env.local values.

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
