"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { Editor } from "@tiptap/react";
import { FileDown, Play } from "lucide-react";
import { PracticeMode } from "./practice-mode";
import { ExportPrintView } from "./export-print-view";
import {
  extractPlainText,
  countWords,
  estimateSpeakingTime,
  type TiptapJSON,
} from "../lib/vow-utils";
import { useWorkspace } from "../hooks/use-workspace";
import { track } from "../lib/analytics";

interface EditorFooterProps {
  editor: Editor | null;
}

/**
 * Debounce a value by `delay` ms.
 */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function EditorFooter({ editor }: EditorFooterProps) {
  const [showPractice, setShowPractice] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const { requestAction, activeDraft } = useWorkspace();

  // Track editor updates via a revision counter
  const [revision, setRevision] = useState(0);
  const revisionRef = useRef(revision);

  useEffect(() => {
    if (!editor) return;

    const handler = () => {
      revisionRef.current += 1;
      setRevision(revisionRef.current);
    };

    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor]);

  const debouncedRevision = useDebouncedValue(revision, 150);

  // Derive stats from the debounced revision
  const { wordCount, readingTime, tiptapJSON } = useMemo(() => {
    if (!editor) {
      return {
        wordCount: 0,
        readingTime: "< 1 min",
        tiptapJSON: null as TiptapJSON | null,
      };
    }

    void debouncedRevision;

    const json = editor.getJSON() as TiptapJSON;
    const text = extractPlainText(json);
    const wc = countWords(text);
    const time = estimateSpeakingTime(text);

    return { wordCount: wc, readingTime: time.display, tiptapJSON: json };
  }, [editor, debouncedRevision]);

  // ── Export handler (gated) ──────────────────────────────────────────────

  function handleExportClick() {
    track({ event: "export_clicked" });
    const result = requestAction("EXPORT_PDF");
    if (result.allowed) {
      setShowExport(true);
    }
    // If not allowed, requestAction already opened the appropriate modal
  }

  return (
    <>
      <div className="flex items-center justify-between px-8 py-3 border-t border-base-100">
        {/* Left — Stats */}
        <div className="text-xs font-medium text-base-500 tracking-wide">
          {wordCount} words &middot; {readingTime}
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportClick}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-base-500 transition-colors hover:bg-sand-100 hover:text-base-700"
          >
            <FileDown className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            onClick={() => {
              track({ event: "practice_mode_opened" });
              setShowPractice(true);
            }}
            className="flex items-center gap-1.5 rounded-full bg-accent-500 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-accent-600"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Practice
          </button>
        </div>
      </div>

      {showPractice && tiptapJSON && (
        <PracticeMode
          tiptapJSON={tiptapJSON}
          onClose={() => setShowPractice(false)}
        />
      )}

      {showExport && tiptapJSON && (
        <ExportPrintView
          tiptapJSON={tiptapJSON}
          title={activeDraft?.title ?? "My Vows"}
          onClose={() => setShowExport(false)}
        />
      )}
    </>
  );
}
