"use client";

import { useCallback, useRef } from "react";
import { X, Printer } from "lucide-react";
import { extractPlainText, type TiptapJSON } from "../lib/vow-utils";

interface ExportPrintViewProps {
  tiptapJSON: TiptapJSON;
  title: string;
  onClose: () => void;
}

/**
 * Beautifully typeset print view for vow export.
 * Uses window.print() scoped to a print-optimized layout.
 * Paid-only feature — gating is handled by the caller.
 */
export function ExportPrintView({
  tiptapJSON,
  title,
  onClose,
}: ExportPrintViewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const plainText = extractPlainText(tiptapJSON, { skipHeadings: true });
  const paragraphs = plainText
    .split(/\n\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Screen-only toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 print:hidden">
        <h2 className="text-lg font-serif font-semibold text-base-900">
          Export Preview
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-600"
          >
            <Printer className="h-4 w-4" />
            Save PDF
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-full text-base-400 transition-colors hover:bg-sand-100 hover:text-base-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Print-optimized content */}
      <div className="flex-1 overflow-y-auto bg-sand-50 print:bg-white">
        <div
          ref={printRef}
          className="max-w-lg mx-auto px-8 py-16 print:max-w-none print:px-[2cm] print:py-[2.5cm]"
        >
          {/* Title */}
          <h1 className="text-center text-2xl font-serif font-semibold text-base-900 mb-2 print:text-3xl print:mb-4">
            {title}
          </h1>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mb-12 print:mb-16">
            <div className="h-px w-12 bg-base-200" />
            <span className="text-base-300 text-sm">&hearts;</span>
            <div className="h-px w-12 bg-base-200" />
          </div>

          {/* Paragraphs */}
          <div className="space-y-6 print:space-y-8">
            {paragraphs.map((para, i) => (
              <p
                key={i}
                className="text-lg font-serif leading-relaxed text-base-800 text-center print:text-xl print:leading-loose"
              >
                {para}
              </p>
            ))}
          </div>

          {/* Bottom decorative divider */}
          <div className="flex items-center justify-center gap-3 mt-12 print:mt-16">
            <div className="h-px w-12 bg-base-200" />
            <span className="text-base-300 text-sm">&hearts;</span>
            <div className="h-px w-12 bg-base-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
