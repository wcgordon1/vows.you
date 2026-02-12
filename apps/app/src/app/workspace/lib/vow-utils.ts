// ─── Types ───────────────────────────────────────────────────────────────────

export interface TiptapJSON {
  type: string;
  content?: TiptapJSON[];
  text?: string;
  attrs?: Record<string, unknown>;
}

export interface Segment {
  text: string;
  paragraphIndex: number;
}

export type SpeedPreset = "slow" | "medium" | "fast";

// ─── Constants ───────────────────────────────────────────────────────────────

export const WPM_PRESETS: Record<SpeedPreset, number> = {
  slow: 120,
  medium: 150,
  fast: 180,
};

// Punctuation pause durations in milliseconds
const PAUSE_COMMA_MS = 180;
const PAUSE_SEMICOLON_MS = 220;
const PAUSE_PERIOD_MS = 380;
const PAUSE_ELLIPSIS_MS = 600;
const PAUSE_PARAGRAPH_MS = 500;

const SEGMENT_MIN_DURATION_MS = 700;

// ─── Text Extraction ─────────────────────────────────────────────────────────

/**
 * Recursively walk a Tiptap JSON doc and produce plain text that preserves
 * paragraph/heading boundaries as `\n\n` and hard breaks as `\n`.
 */
export function extractPlainText(
  doc: TiptapJSON,
  options?: { skipHeadings?: boolean },
): string {
  if (!doc || !doc.content) return "";

  const blocks: string[] = [];

  for (const node of doc.content) {
    if (node.type === "heading" && options?.skipHeadings) {
      continue;
    }

    if (
      node.type === "paragraph" ||
      node.type === "heading" ||
      node.type === "blockquote"
    ) {
      const blockText = extractInlineText(node);
      blocks.push(blockText);
    } else if (node.type === "bulletList" || node.type === "orderedList") {
      // Flatten list items into blocks
      if (node.content) {
        for (const listItem of node.content) {
          if (listItem.content) {
            for (const inner of listItem.content) {
              blocks.push(extractInlineText(inner));
            }
          }
        }
      }
    } else {
      // Fallback: try to extract inline text from any unknown block
      blocks.push(extractInlineText(node));
    }
  }

  return blocks
    .map((b) => b.trim())
    .filter(Boolean)
    .join("\n\n");
}

function extractInlineText(node: TiptapJSON): string {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return "\n";

  if (!node.content) return "";

  return node.content.map(extractInlineText).join("");
}

// ─── Word Count ──────────────────────────────────────────────────────────────

/**
 * Count words using Intl.Segmenter when available, with a regex fallback.
 */
export function countWords(text: string): number {
  if (!text.trim()) return 0;

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    try {
      const segmenter = new Intl.Segmenter("en", { granularity: "word" });
      let count = 0;
      for (const seg of segmenter.segment(text)) {
        if (seg.isWordLike) count++;
      }
      return count;
    } catch {
      // Fall through to regex
    }
  }

  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

// ─── Punctuation Pause Calculation ───────────────────────────────────────────

/**
 * Sum all punctuation-based pauses in a string (milliseconds).
 */
function countPunctuationPausesMs(text: string): number {
  let total = 0;

  // Ellipsis (must check before periods)
  const ellipses = text.match(/\.{3}|…/g);
  if (ellipses) total += ellipses.length * PAUSE_ELLIPSIS_MS;

  // Periods / exclamation / question (exclude ellipsis dots already counted)
  const stripped = text.replace(/\.{3}|…/g, "");
  const sentences = stripped.match(/[.!?]+/g);
  if (sentences) total += sentences.length * PAUSE_PERIOD_MS;

  // Semicolons and colons
  const semiColons = text.match(/[;:]/g);
  if (semiColons) total += semiColons.length * PAUSE_SEMICOLON_MS;

  // Commas
  const commas = text.match(/,/g);
  if (commas) total += commas.length * PAUSE_COMMA_MS;

  return total;
}

/**
 * Count paragraph breaks and return their pause in milliseconds.
 */
function countParagraphPausesMs(text: string): number {
  const breaks = text.match(/\n\n/g);
  return breaks ? breaks.length * PAUSE_PARAGRAPH_MS : 0;
}

// ─── Speaking Time Estimate ──────────────────────────────────────────────────

export function estimateSpeakingTime(
  text: string,
  wpm: number = WPM_PRESETS.medium,
): { seconds: number; display: string } {
  const words = countWords(text);
  if (words === 0) return { seconds: 0, display: "< 1 min" };

  const baseSeconds = (words / wpm) * 60;
  const punctuationMs =
    countPunctuationPausesMs(text) + countParagraphPausesMs(text);
  const totalSeconds = baseSeconds + punctuationMs / 1000;

  const minutes = Math.round(totalSeconds / 60);
  const display = minutes < 1 ? "~ 1 min" : `~ ${minutes} min`;

  return { seconds: totalSeconds, display };
}

// ─── Segment Splitting ───────────────────────────────────────────────────────

/**
 * Split text into teleprompter segments:
 *  1. Split by paragraph (\n\n)
 *  2. Within each paragraph, split on punctuation boundaries while keeping
 *     the punctuation attached to its phrase.
 */
export function splitIntoSegments(text: string): Segment[] {
  if (!text.trim()) return [];

  const paragraphs = text.split(/\n\n/).filter((p) => p.trim());
  const segments: Segment[] = [];

  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const para = paragraphs[pIdx].trim();
    // Split on punctuation boundaries: after . ! ? … , ; : followed by whitespace
    // Keep the punctuation attached to the preceding text
    const phrases = para
      .split(/(?<=[.!?…,;:])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const phrase of phrases) {
      segments.push({ text: phrase, paragraphIndex: pIdx });
    }
  }

  return segments;
}

// ─── Segment Duration ────────────────────────────────────────────────────────

/**
 * Compute how long (ms) a segment should be displayed during playback.
 */
export function computeSegmentDuration(
  segment: Segment,
  wpm: number,
): number {
  const words = countWords(segment.text);
  const baseMs = (words / wpm) * 60 * 1000;
  const pauseMs = countPunctuationPausesMs(segment.text);
  return Math.max(baseMs + pauseMs, SEGMENT_MIN_DURATION_MS);
}
