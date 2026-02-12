/**
 * Re-export bridge for the vowReview library from root src/.
 * Single import point for the app — if monorepo structure changes,
 * only this file needs updating.
 */

// Types
export type {
  AnalysisMode,
  VowCategory,
  SeverityWeight,
  SeverityBucket,
  LengthBucket,
  VowMatchSpan,
  CategoryCounts,
  TopPhraseEntry,
  InsightsCopy,
  VowAnalysis,
} from "../../../../src/lib/vowReview";

// Matcher
export { findWeakSpans, getMatchStats } from "../../../../src/lib/vowReview";

// Scorer
export {
  analyzeText,
  emptyAnalysis,
  getSeverityBucketDisplay,
  getLengthBucketDisplay,
  getCategoryDisplayName,
  formatWeakRate,
} from "../../../../src/lib/vowReview";

// Heuristics
export { countWords as vowCountWords } from "../../../../src/lib/vowReview";
