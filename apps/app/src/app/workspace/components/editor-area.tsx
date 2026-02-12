"use client";

import { TiptapEditor } from "./tiptap-editor";

export function EditorArea() {
  return (
    <div className="flex-1 flex justify-center overflow-hidden bg-white">
      <div className="w-full max-w-[760px] flex flex-col min-h-0">
        <TiptapEditor />
      </div>
    </div>
  );
}
