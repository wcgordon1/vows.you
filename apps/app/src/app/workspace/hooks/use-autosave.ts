"use client";

import { useEffect, useRef } from "react";
import type { Editor } from "@tiptap/react";
import { useWorkspace } from "./use-workspace";

const AUTOSAVE_DEBOUNCE_MS = 800;

/**
 * Debounced autosave: listens to Tiptap editor updates and persists
 * the content to the draft store via the workspace context.
 */
export function useAutosave(editor: Editor | null) {
  const { updateActiveDraftContent, state } = useWorkspace();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeDraftId = state.activeDraftId;

  useEffect(() => {
    if (!editor) return;

    const handler = () => {
      // Clear any pending save
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        const json = editor.getJSON() as Record<string, unknown>;
        updateActiveDraftContent(json);
      }, AUTOSAVE_DEBOUNCE_MS);
    };

    editor.on("update", handler);

    return () => {
      editor.off("update", handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [editor, updateActiveDraftContent, activeDraftId]);
}
