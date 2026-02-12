"use client";

import { TopBar } from "./top-bar";
import { EditorArea } from "./editor-area";
import { GuidePanel } from "./guide-panel";

export function WorkspaceLayout() {
  return (
    <>
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <EditorArea />
        <GuidePanel />
      </div>
    </>
  );
}
