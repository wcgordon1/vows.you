"use client";

import { WorkspaceProvider } from "./hooks/use-workspace";
import { AuthGateModal } from "./components/auth-gate-modal";
import { PaywallModal } from "./components/paywall-modal";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <div className="h-screen flex flex-col bg-sand-100 overflow-hidden workspace-bg">
        {children}
      </div>

      {/* Modals — rendered at layout root so they overlay everything */}
      <AuthGateModal />
      <PaywallModal />
    </WorkspaceProvider>
  );
}
