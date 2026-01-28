/**
 * Wedding Vow Review library.
 * Barrel exports for all public APIs.
 */

// Types
export type {
	AnalysisMode,
	VowCategory,
	SeverityWeight,
	SeverityBucket,
	LengthBucket,
	ConditionalRuleType,
	ConditionalRule,
	VowLexiconItem,
	VowMatchSpan,
	CategoryCounts,
	TopPhraseEntry,
	InsightsCopy,
	VowAnalysis,
	ModeThresholds,
	ScoringThresholds,
} from './types'

// Heuristics
export {
	countWords,
	getTokens,
	detectSpecificityNearby,
	detectIntensifierOveruse,
	escapeRegex,
	concreteNounsList,
} from './heuristics'

// Lexicon
export {
	vowLexicon,
	lexiconByKey,
	getSortedPatterns,
} from './lexicon'

// Matcher
export {
	findWeakSpans,
	getMatchStats,
} from './matcher'

// Render
export type { Segment } from './render'
export {
	buildSegments,
	segmentsToFragment,
	renderHighlightedText,
	verifySegments,
} from './render'

// Scorer
export {
	scoringThresholds,
	analyzeText,
	emptyAnalysis,
	formatWeakRate,
	getSeverityBucketDisplay,
	getLengthBucketDisplay,
	getCategoryDisplayName,
} from './scorer'
