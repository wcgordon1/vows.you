"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { Editor } from "@tiptap/react";
import { Eye, Play } from "lucide-react";
import { PracticeMode } from "./practice-mode";
import {
  extractPlainText,
  countWords,
  estimateSpeakingTime,
  type TiptapJSON,
} from "../lib/vow-utils";

interface EditorFooterProps {
  editor: Editor | null;
}

/**
 * Debounce a value by `delay` ms. Returns the latest value after the delay
 * has elapsed without a new update.
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

  // Track editor updates via a revision counter that bumps on every transaction
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

    // Access debouncedRevision to create dependency
    void debouncedRevision;

    const json = editor.getJSON() as TiptapJSON;
    const text = extractPlainText(json);
    const wc = countWords(text);
    const time = estimateSpeakingTime(text);

    return { wordCount: wc, readingTime: time.display, tiptapJSON: json };
  }, [editor, debouncedRevision]);

  return (
    <>
      <div className="flex items-center justify-between px-8 py-3 border-t border-base-100">
        {/* Left — Stats */}
        <div className="text-xs font-medium text-base-500 tracking-wide">
          {wordCount} words &middot; {readingTime}
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-base-500 transition-colors hover:bg-sand-100 hover:text-base-700">
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
          <button
            onClick={() => setShowPractice(true)}
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
    </>
  );
}
