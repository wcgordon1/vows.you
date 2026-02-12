"use client";

import { TiptapEditor } from "./tiptap-editor";

export function EditorArea() {
  return (
    <div className="flex-1 flex items-start justify-center p-6 overflow-hidden">
      <div className="w-full max-w-[720px] flex flex-col bg-white rounded-xl border border-base-300 shadow-sm overflow-hidden min-h-0 max-h-full">
        <TiptapEditor />
      </div>
    </div>
  );
}
