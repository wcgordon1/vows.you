"use client";

import { TopBar } from "./top-bar";
import { EditorArea } from "./editor-area";
import { GuidePanel } from "./guide-panel";
import { AuthGateModal } from "./auth-gate-modal";
import { PaywallModal } from "./paywall-modal";
import { WorkspaceProvider } from "../hooks/use-workspace";

export function WorkspaceLayout() {
  return (
    <WorkspaceProvider>
      <TopBar />
      {/* Canvas container — the "one object" wrapper */}
      <div className="flex-1 min-h-0 p-4 md:p-6 lg:p-8">
        <div className="flex h-full rounded-2xl border border-base-200/80 bg-white/60 shadow-sm backdrop-blur-sm overflow-hidden">
          <EditorArea />
          <GuidePanel />
        </div>
      </div>

      {/* Modals — rendered at workspace root so they overlay everything */}
      <AuthGateModal />
      <PaywallModal />
    </WorkspaceProvider>
  );
}
