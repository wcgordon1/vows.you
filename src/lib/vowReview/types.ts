/**
 * Shared types for the Wedding Vow Review tool.
 */

/** Analysis mode - Vows is stricter, Speech is more forgiving */
export type AnalysisMode = 'vows' | 'speech'

/** Categories of weak/cliché phrases in wedding vows */
export type VowCategory =
	| 'cliche_opening'
	| 'cliche_closing'
	| 'generic_promise'
	| 'vague_admiration'
	| 'cringe_phrase'
	| 'filler_intensifier'
	| 'overpromise_absolute'
	| 'too_formal_scripted'

/** Severity weight levels */
export type SeverityWeight = 1 | 2 | 3

/** Severity bucket for UI display */
export type SeverityBucket = 'great' | 'fair' | 'weak'

/** Length bucket for vow length guidance */
export type LengthBucket = 'too-short' | 'great' | 'too-long'

/** Conditional rule types for context-aware matching */
export type ConditionalRuleType =
	| 'requires-no-specificity' // Flag only if no specificity (names, dates, places) nearby

/** Conditional rule definition */
export interface ConditionalRule {
	type: ConditionalRuleType
	/** Character window to search for context (default 100) */
	windowChars?: number
}

/** Lexicon item representing a weak/cliché phrase pattern */
export interface VowLexiconItem {
	/** Unique identifier for this lexicon entry */
	key: string
	/** Regex patterns to match (case-insensitive, word-boundary aware) */
	patterns: RegExp[]
	/** Category of weakness */
	category: VowCategory
	/** Explanation of why this is weak (gentle, non-judgmental) */
	why: string
	/** Alternative suggestions (5-10) */
	suggestions: string[]
	/** Questions to prompt personalization (3-6) */
	proofPrompts: string[]
	/** Severity weight: 3 = high, 2 = medium, 1 = low */
	weight: SeverityWeight
	/** Optional conditional rule for context-aware matching */
	conditionalRule?: ConditionalRule
}

/** A matched span in the text */
export interface VowMatchSpan {
	/** Start index in original text */
	start: number
	/** End index in original text (exclusive) */
	end: number
	/** Matched text */
	text: string
	/** Lexicon key that matched */
	phraseKey: string
	/** Category of weakness */
	category: VowCategory
	/** Severity weight */
	severityWeight: SeverityWeight
	/** Why this is weak */
	why: string
	/** Alternative suggestions */
	suggestions: string[]
	/** Proof prompts for personalization */
	proofPrompts: string[]
}

/** Category counts for dashboard */
export interface CategoryCounts {
	cliche_opening: number
	cliche_closing: number
	generic_promise: number
	vague_admiration: number
	cringe_phrase: number
	filler_intensifier: number
	overpromise_absolute: number
	too_formal_scripted: number
}

/** Top phrase entry for "worst phrases" list */
export interface TopPhraseEntry {
	phraseKey: string
	displayText: string
	count: number
	category: VowCategory
	weight: SeverityWeight
	suggestions: string[]
	proofPrompts: string[]
	why: string
}

/** Insights copy for UI */
export interface InsightsCopy {
	headline: string
	bullets: string[]
	actionSteps: string[]
}

/** Full analysis result */
export interface VowAnalysis {
	/** Total word count in input */
	totalWords: number
	/** Read time in seconds (at 140 WPM speaking pace) */
	readTimeSeconds: number
	/** Read time label formatted as mm:ss */
	readTimeLabel: string
	/** Length bucket (too-short/great/too-long) */
	lengthBucket: LengthBucket
	/** Human-friendly length guidance */
	lengthGuidance: string
	/** Total weak phrase matches */
	weakHits: number
	/** Count of unique weak phrases matched */
	uniqueWeakPhrases: number
	/** Weak rate = weakHits / totalWords */
	weakRate: number
	/** Sum of severity weights for all matches */
	totalSeverityScore: number
	/** Counts by category */
	categoryCounts: CategoryCounts
	/** Severity bucket (great/fair/weak) */
	severityBucket: SeverityBucket
	/** Top 5 worst phrases */
	topPhrases: TopPhraseEntry[]
	/** Insights copy for UI */
	insights: InsightsCopy
	/** All matched spans */
	spans: VowMatchSpan[]
}

/** Scoring thresholds for a mode */
export interface ModeThresholds {
	great: {
		maxHits: number
		maxRate: number
	}
	fair: {
		maxHits: number
		maxRate: number
	}
	// Anything above fair thresholds = weak
}

/** All scoring thresholds */
export interface ScoringThresholds {
	vows: ModeThresholds
	speech: ModeThresholds
}
