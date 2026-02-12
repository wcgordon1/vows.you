/**
 * Tiptap Extension: WeakPhraseHighlight
 *
 * Adds ProseMirror decorations for weak/cliché phrases detected by vowReview.
 * Uses decorations (not marks) so the document model is never modified —
 * highlights are visual-only and don't affect saved content.
 *
 * Usage:
 *   editor.commands.setWeakPhraseSpans(spans)   // update highlights
 *   editor.commands.clearWeakPhraseSpans()       // remove all highlights
 */

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Node as PmNode } from "@tiptap/pm/model";
import type { VowMatchSpan, SeverityWeight } from "@/lib/vow-review";

// ─── Position Mapping ────────────────────────────────────────────────────────

interface TextRun {
  /** Offset in the synthetic analysis text */
  textOffset: number;
  /** ProseMirror position of the first character */
  pmPos: number;
  /** Length of this text run */
  length: number;
}

/**
 * Walk the ProseMirror document and build a mapping between the
 * analysis text (blocks joined by spaces) and ProseMirror positions.
 */
function buildTextRuns(doc: PmNode): { text: string; runs: TextRun[] } {
  const parts: string[] = [];
  const runs: TextRun[] = [];
  let textOffset = 0;
  let isFirst = true;

  doc.descendants((node, pos) => {
    if (node.isTextblock) {
      if (!isFirst) {
        // Space between blocks (matches what vowReview sees)
        parts.push(" ");
        textOffset += 1;
      }
      isFirst = false;

      node.forEach((child, offset) => {
        if (child.isText && child.text) {
          parts.push(child.text);
          runs.push({
            textOffset,
            pmPos: pos + 1 + offset,
            length: child.text.length,
          });
          textOffset += child.text.length;
        }
      });

      return false; // don't descend into inline nodes again
    }
  });

  return { text: parts.join(""), runs };
}

/**
 * Convert a position in the analysis text to a ProseMirror document position.
 * Returns -1 if the position falls in a synthetic space between blocks.
 */
function textPosToPm(textPos: number, runs: TextRun[]): number {
  for (const run of runs) {
    const runEnd = run.textOffset + run.length;
    if (textPos >= run.textOffset && textPos < runEnd) {
      return run.pmPos + (textPos - run.textOffset);
    }
  }
  // If past the last run, clamp to the end of the last run
  if (runs.length > 0) {
    const last = runs[runs.length - 1];
    return last.pmPos + last.length;
  }
  return -1;
}

// ─── Decoration Building ─────────────────────────────────────────────────────

function severityClass(weight: SeverityWeight): string {
  switch (weight) {
    case 3:
      return "weak-phrase weak-phrase--high";
    case 2:
      return "weak-phrase weak-phrase--med";
    case 1:
    default:
      return "weak-phrase weak-phrase--low";
  }
}

function buildDecorations(
  doc: PmNode,
  spans: VowMatchSpan[],
): DecorationSet {
  if (spans.length === 0) return DecorationSet.empty;

  const { runs } = buildTextRuns(doc);
  const decorations: Decoration[] = [];

  for (const span of spans) {
    const from = textPosToPm(span.start, runs);
    const to = textPosToPm(span.end, runs);

    if (from === -1 || to === -1 || from >= to) continue;

    decorations.push(
      Decoration.inline(from, to, {
        class: severityClass(span.severityWeight),
        "data-phrase-key": span.phraseKey,
        "data-category": span.category,
        "data-weight": String(span.severityWeight),
      }),
    );
  }

  return DecorationSet.create(doc, decorations);
}

// ─── Plugin ──────────────────────────────────────────────────────────────────

const PLUGIN_KEY = new PluginKey("weakPhraseHighlight");
const META_KEY = "weakPhraseUpdate";

// ─── Extension ───────────────────────────────────────────────────────────────

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    weakPhraseHighlight: {
      setWeakPhraseSpans: (spans: VowMatchSpan[]) => ReturnType;
      clearWeakPhraseSpans: () => ReturnType;
    };
  }
}

export const WeakPhraseHighlight = Extension.create({
  name: "weakPhraseHighlight",

  addStorage() {
    return {
      spans: [] as VowMatchSpan[],
    };
  },

  addCommands() {
    return {
      setWeakPhraseSpans:
        (spans: VowMatchSpan[]) =>
        ({ editor, tr, dispatch }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (editor.storage as any).weakPhraseHighlight.spans = spans;
          if (dispatch) {
            tr.setMeta(META_KEY, true);
            dispatch(tr);
          }
          return true;
        },
      clearWeakPhraseSpans:
        () =>
        ({ editor, tr, dispatch }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (editor.storage as any).weakPhraseHighlight.spans = [];
          if (dispatch) {
            tr.setMeta(META_KEY, true);
            dispatch(tr);
          }
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin({
        key: PLUGIN_KEY,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, oldDecos, _oldState, newState) {
            // Rebuild if our meta flag was set or if the doc changed
            if (tr.getMeta(META_KEY) || tr.docChanged) {
              return buildDecorations(
                newState.doc,
                extension.storage.spans,
              );
            }
            // Otherwise keep existing decorations mapped to new positions
            return oldDecos.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return PLUGIN_KEY.getState(state);
          },
        },
      }),
    ];
  },
});
