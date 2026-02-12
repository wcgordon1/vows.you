// ─── Analytics Stubs ─────────────────────────────────────────────────────────
// Event tracking interface. NEVER includes vow text, titles, or excerpts.
// Replace console.debug calls with your real analytics provider later.

type AnalyticsEvent =
  | { event: "draft_created" }
  | { event: "draft_deleted" }
  | { event: "draft_switched" }
  | { event: "new_draft_clicked" }
  | { event: "new_draft_blocked_free_limit" }
  | { event: "export_clicked" }
  | { event: "export_blocked_needs_account" }
  | { event: "export_blocked_needs_upgrade" }
  | { event: "signup_started_from_gate"; gate: string }
  | { event: "signup_completed_from_gate"; gate: string }
  | { event: "paywall_viewed"; trigger: string }
  | { event: "purchase_completed" }
  | { event: "practice_mode_opened" }
  | { event: "practice_mode_completed" }
  | { event: "see_improvements_clicked" };

export function track(payload: AnalyticsEvent): void {
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", payload.event, payload);
  }

  // TODO: Wire to Plausible / PostHog / Segment / etc.
  // e.g. posthog.capture(payload.event, payload);
}
