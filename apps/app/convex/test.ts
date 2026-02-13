// Trivial test function — delete this file after verifying connectivity.
// Usage in browser console or React component:
//   import { api } from "../convex/_generated/api";
//   const result = useQuery(api.test.ping);   // → { ok: true, ts: <number> }

import { query } from "./_generated/server";

export const ping = query({
  args: {},
  handler: async () => {
    return { ok: true, ts: Date.now() };
  },
});
