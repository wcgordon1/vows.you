"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Editor } from "@tiptap/react";
import { FileDown, Play, Sparkles } from "lucide-react";
import { ExportPrintView } from "./export-print-view";
import {
  extractPlainText,
  countWords,
  estimateSpeakingTime,
  type TiptapJSON,
} from "../lib/vow-utils";
import { useWorkspace } from "../hooks/use-workspace";
import { track } from "../lib/analytics";
import type { VowAnalysis } from "@/lib/vow-review";

interface EditorFooterProps {
  editor: Editor | null;
  analysis: VowAnalysis;
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

export function EditorFooter({ editor, analysis }: EditorFooterProps) {
  const router = useRouter();
  const [showExport, setShowExport] = useState(false);
  const { requestAction, activeDraft, state } = useWorkspace();
  const isPaid = state.hasPaidEntitlement;

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

  // ── Improvements handler ──────────────────────────────────────────────

  const showImprovements = analysis.totalWords >= 50 && analysis.weakHits > 0;

  function handleImprovementsClick() {
    track({ event: "see_improvements_clicked" });
    if (!isPaid) {
      requestAction("VIEW_SUGGESTIONS");
      return;
    }
    // Paid users: toggle highlights or scroll to suggestions panel
    if (editor) {
      editor.commands.setWeakPhraseSpans(analysis.spans);
    }
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
          {showImprovements && (
            <button
              onClick={handleImprovementsClick}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-base-500 transition-colors hover:bg-sand-100 hover:text-base-700"
            >
              <Sparkles className="h-3.5 w-3.5" />
              See improvements
              <span className="flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-accent-100 text-[10px] font-semibold text-accent-700">
                {analysis.weakHits}
              </span>
            </button>
          )}
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
              router.push("/workspace/practice");
            }}
            className="flex items-center gap-1.5 rounded-full bg-accent-500 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-accent-600"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Practice
          </button>
        </div>
      </div>

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
