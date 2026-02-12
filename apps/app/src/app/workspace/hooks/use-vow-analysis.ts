"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import type { Node as PmNode } from "@tiptap/pm/model";
import {
  findWeakSpans,
  analyzeText,
  emptyAnalysis,
  type VowAnalysis,
} from "@/lib/vow-review";

const MIN_WORD_COUNT = 300;

/**
 * Extract text from a ProseMirror document with spaces between textblocks.
 * This MUST match the same text representation used by the decoration mapper
 * in weak-phrase-highlight.ts (buildTextRuns) so span positions align.
 */
function extractAnalysisText(doc: PmNode): string {
  const parts: string[] = [];
  let isFirst = true;

  doc.descendants((node) => {
    if (node.isTextblock) {
      if (!isFirst) {
        parts.push(" ");
      }
      isFirst = false;

      node.forEach((child) => {
        if (child.isText && child.text) {
          parts.push(child.text);
        }
      });

      return false;
    }
  });

  return parts.join("");
}

/**
 * Bridges the Tiptap editor to the vowReview analysis library.
 * Runs automatically on a debounced timer whenever the editor content changes.
 *
 * Includes a synthetic "too short" penalty when word count < 300.
 */
export function useVowAnalysis(
  editor: Editor | null,
  debounceMs = 500,
): VowAnalysis {
  const [analysis, setAnalysis] = useState<VowAnalysis>(emptyAnalysis());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTextRef = useRef("");

  const runAnalysis = useCallback((text: string) => {
    if (!text.trim()) {
      setAnalysis(emptyAnalysis());
      return;
    }

    const spans = findWeakSpans(text, "vows");
    const result = analyzeText(text, spans, "vows");

    // ── Synthetic "too short" error ────────────────────────────────
    // If word count < 300, inject an extra hit to nudge the user.
    if (result.totalWords > 0 && result.totalWords < MIN_WORD_COUNT) {
      const boosted: VowAnalysis = {
        ...result,
        weakHits: result.weakHits + 1,
      };

      // Bump severity bucket if it was "great" — short vows shouldn't feel great
      if (boosted.severityBucket === "great") {
        boosted.severityBucket = "fair";
      }

      setAnalysis(boosted);
    } else {
      setAnalysis(result);
    }
  }, []);

  useEffect(() => {
    if (!editor) return;

    const handler = () => {
      // Extract text with spaces between blocks — must match buildTextRuns()
      const text = extractAnalysisText(editor.state.doc);

      // Skip if text hasn't changed
      if (text === lastTextRef.current) return;
      lastTextRef.current = text;

      // Debounce the analysis
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => runAnalysis(text), debounceMs);
    };

    // Run once on mount with current content
    handler();

    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [editor, debounceMs, runAnalysis]);

  return analysis;
}
