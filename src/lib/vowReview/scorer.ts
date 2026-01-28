/**
 * Scoring and analysis for wedding vow review.
 * Implements severity bucket calculation, category counts, read time, length buckets, and insights generation.
 */

import type {
	AnalysisMode,
	SeverityBucket,
	LengthBucket,
	CategoryCounts,
	TopPhraseEntry,
	InsightsCopy,
	VowAnalysis,
	VowMatchSpan,
	ScoringThresholds,
	ModeThresholds,
} from './types'
import { countWords, detectIntensifierOveruse } from './heuristics'
import { getMatchStats } from './matcher'

/**
 * Scoring thresholds for different modes.
 *
 * Vows mode (stricter):
 * - Great: weakHits <= 2 OR weakRate < 0.015
 * - Fair: 3–6 OR 0.015–0.035
 * - Weak: >= 7 OR >0.035
 *
 * Speech mode (more forgiving):
 * - Great: weakHits <= 4 OR weakRate < 0.020
 * - Fair: 5–10 OR 0.020–0.045
 * - Weak: >= 11 OR >0.045
 */
export const scoringThresholds: ScoringThresholds = {
	vows: {
		great: { maxHits: 2, maxRate: 0.015 },
		fair: { maxHits: 6, maxRate: 0.035 },
	},
	speech: {
		great: { maxHits: 4, maxRate: 0.02 },
		fair: { maxHits: 10, maxRate: 0.045 },
	},
}

/**
 * Length thresholds for vows (in words and seconds at 140 WPM).
 *
 * - too-short: totalWords < 120 OR readTimeSeconds < 50
 * - great: 120–340 words OR 50–160 seconds
 * - too-long: totalWords > 450 OR readTimeSeconds > 195 (3:15)
 */
const LENGTH_THRESHOLDS = {
	tooShortWords: 120,
	tooShortSeconds: 50,
	greatMaxWords: 340,
	greatMaxSeconds: 160,
	tooLongWords: 450,
	tooLongSeconds: 195,
}

/**
 * Get thresholds for a given mode.
 */
function getThresholds(mode: AnalysisMode): ModeThresholds {
	return scoringThresholds[mode] ?? scoringThresholds.vows
}

/**
 * Calculate read time in seconds at speaking pace (140 WPM).
 */
function calculateReadTime(totalWords: number): { seconds: number; label: string } {
	const seconds = Math.round((totalWords / 140) * 60)
	const minutes = Math.floor(seconds / 60)
	const remainingSeconds = seconds % 60
	const label = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
	return { seconds, label }
}

/**
 * Calculate length bucket based on word count and read time.
 */
function calculateLengthBucket(totalWords: number, readTimeSeconds: number): LengthBucket {
	if (totalWords < LENGTH_THRESHOLDS.tooShortWords || readTimeSeconds < LENGTH_THRESHOLDS.tooShortSeconds) {
		return 'too-short'
	}
	if (totalWords > LENGTH_THRESHOLDS.tooLongWords || readTimeSeconds > LENGTH_THRESHOLDS.tooLongSeconds) {
		return 'too-long'
	}
	return 'great'
}

/**
 * Generate length guidance message.
 */
function generateLengthGuidance(lengthBucket: LengthBucket, totalWords: number, readTimeSeconds: number): string {
	switch (lengthBucket) {
		case 'too-short':
			const wordsToAdd = Math.max(0, LENGTH_THRESHOLDS.tooShortWords - totalWords)
			return wordsToAdd > 0
				? `Your vows are quite short. Consider adding ${wordsToAdd}+ words—one memory and a couple specific promises.`
				: `Your vows are under 1 minute. Add a memory or more specific promises to reach 1:30–2:00.`
		case 'too-long':
			const wordsToTrim = totalWords - LENGTH_THRESHOLDS.greatMaxWords
			const targetTime = '2:00–2:30'
			return `At ${Math.floor(readTimeSeconds / 60)}:${(readTimeSeconds % 60).toString().padStart(2, '0')}, your vows are on the longer side. Consider trimming ~${wordsToTrim} words to land around ${targetTime}.`
		case 'great':
		default:
			return `Your vow length is ceremony-ready at ${Math.floor(readTimeSeconds / 60)}:${(readTimeSeconds % 60).toString().padStart(2, '0')}. Most officiants recommend 1–2 minutes.`
	}
}

/**
 * Calculate severity bucket based on hits, rate, length, and intensifier overuse.
 */
function calculateSeverityBucket(
	weakHits: number,
	weakRate: number,
	lengthBucket: LengthBucket,
	intensifierPenalty: number,
	mode: AnalysisMode
): SeverityBucket {
	const thresholds = getThresholds(mode)

	// Base bucket from hits
	let hitsBucket: SeverityBucket
	if (weakHits <= thresholds.great.maxHits) {
		hitsBucket = 'great'
	} else if (weakHits <= thresholds.fair.maxHits) {
		hitsBucket = 'fair'
	} else {
		hitsBucket = 'weak'
	}

	// Base bucket from rate
	let rateBucket: SeverityBucket
	if (weakRate < thresholds.great.maxRate) {
		rateBucket = 'great'
	} else if (weakRate <= thresholds.fair.maxRate) {
		rateBucket = 'fair'
	} else {
		rateBucket = 'weak'
	}

	// Start with the worse of hits/rate
	const bucketOrder: SeverityBucket[] = ['great', 'fair', 'weak']
	let baseIndex = Math.max(bucketOrder.indexOf(hitsBucket), bucketOrder.indexOf(rateBucket))

	// Add length penalty
	if (lengthBucket === 'too-long') {
		baseIndex = Math.min(baseIndex + 1, 2) // Bigger penalty
	} else if (lengthBucket === 'too-short') {
		baseIndex = Math.min(baseIndex + 0.5, 2) // Smaller penalty
	}

	// Add intensifier penalty
	baseIndex = Math.min(baseIndex + intensifierPenalty * 0.5, 2)

	return bucketOrder[Math.round(baseIndex)]
}

/**
 * Build category counts from spans.
 */
function buildCategoryCounts(spans: VowMatchSpan[]): CategoryCounts {
	const counts: CategoryCounts = {
		cliche_opening: 0,
		cliche_closing: 0,
		generic_promise: 0,
		vague_admiration: 0,
		cringe_phrase: 0,
		filler_intensifier: 0,
		overpromise_absolute: 0,
		too_formal_scripted: 0,
	}

	for (const span of spans) {
		if (span.category in counts) {
			counts[span.category]++
		}
	}

	return counts
}

/**
 * Get top N worst phrases by count and weight.
 */
function getTopPhrases(
	byPhrase: Map<string, { count: number; span: VowMatchSpan }>,
	limit = 5
): TopPhraseEntry[] {
	const entries = Array.from(byPhrase.entries())

	// Sort by weight DESC (severity), then by count DESC
	entries.sort(([, a], [, b]) => {
		const weightDiff = b.span.severityWeight - a.span.severityWeight
		if (weightDiff !== 0) {
			return weightDiff
		}
		return b.count - a.count
	})

	return entries.slice(0, limit).map(([phraseKey, { count, span }]) => ({
		phraseKey,
		displayText: span.text,
		count,
		category: span.category,
		weight: span.severityWeight,
		suggestions: span.suggestions,
		proofPrompts: span.proofPrompts,
		why: span.why,
	}))
}

/**
 * Get category display name.
 */
export function getCategoryDisplayName(category: string): string {
	const names: Record<string, string> = {
		cliche_opening: 'Cliché openings',
		cliche_closing: 'Cliché closings',
		generic_promise: 'Generic promises',
		vague_admiration: 'Vague admiration',
		cringe_phrase: 'Cringe phrases',
		filler_intensifier: 'Filler intensifiers',
		overpromise_absolute: 'Overpromises/absolutes',
		too_formal_scripted: 'Too formal/scripted',
	}
	return names[category] ?? category
}

/**
 * Generate insights copy based on analysis.
 */
function generateInsights(
	severityBucket: SeverityBucket,
	lengthBucket: LengthBucket,
	weakHits: number,
	categoryCounts: CategoryCounts,
	topPhrases: TopPhraseEntry[],
	readTimeSeconds: number,
	_mode: AnalysisMode
): InsightsCopy {
	// Generate headline based on severity and length
	let headline: string
	if (severityBucket === 'great' && lengthBucket === 'great') {
		headline = 'Your vows are authentic and ceremony-ready!'
	} else if (severityBucket === 'great') {
		headline = lengthBucket === 'too-short'
			? 'Great authenticity! Consider adding more content.'
			: 'Great authenticity! Consider trimming for impact.'
	} else if (severityBucket === 'fair') {
		headline = 'Good start—a few phrases could be more personal.'
	} else {
		headline = 'Several phrases could sound more like you. Let\'s fix that.'
	}

	// Generate bullets based on findings
	const bullets: string[] = []

	// Read time bullet
	const minutes = Math.floor(readTimeSeconds / 60)
	const seconds = readTimeSeconds % 60
	const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`
	bullets.push(`Read time: ${timeStr} (ideal for ceremonies: 1:00–2:30)`)

	// Most common issue category
	const sortedCategories = Object.entries(categoryCounts)
		.filter(([, count]) => count > 0)
		.sort(([, a], [, b]) => b - a)

	if (sortedCategories.length > 0) {
		const [topCategory, topCount] = sortedCategories[0]
		const categoryName = getCategoryDisplayName(topCategory)
		bullets.push(`Most common issue: ${categoryName} (${topCount} found)`)
	}

	// Top phrase mention
	if (topPhrases.length > 0) {
		const top = topPhrases[0]
		if (top.count > 1) {
			bullets.push(`"${top.displayText}" appears ${top.count} times`)
		} else {
			bullets.push(`Top phrase to personalize: "${top.displayText}"`)
		}
	}

	// If no issues
	if (weakHits === 0) {
		bullets.push('No common clichés detected—your vows sound personal!')
	}

	// Action steps based on findings
	const actionSteps: string[] = []

	switch (severityBucket) {
		case 'great':
			actionSteps.push('Read your vows aloud to check the flow.')
			actionSteps.push('Consider adding one specific memory that only you two share.')
			if (lengthBucket === 'too-short') {
				actionSteps.push('Add 2-3 specific promises about how you\'ll show up.')
			}
			break
		case 'fair':
			actionSteps.push('Click highlighted phrases to see personalization suggestions.')
			actionSteps.push('Replace generic promises with specific commitments.')
			actionSteps.push('Add one concrete memory or inside joke.')
			if (sortedCategories.length > 0 && sortedCategories[0][0] === 'generic_promise') {
				actionSteps.push('For each "I promise," add HOW you\'ll keep that promise.')
			}
			break
		case 'weak':
			actionSteps.push('Start by fixing the high-severity (red) highlights.')
			actionSteps.push('Replace clichés with specific memories or examples.')
			actionSteps.push('Ask yourself: "Would anyone else say this exact thing?"')
			actionSteps.push('Add names, places, dates, or inside references.')
			if (lengthBucket === 'too-long') {
				actionSteps.push('Cut generic filler to make room for personal details.')
			}
			break
	}

	return {
		headline,
		bullets,
		actionSteps,
	}
}

/**
 * Perform full analysis on text.
 */
export function analyzeText(
	text: string,
	spans: VowMatchSpan[],
	mode: AnalysisMode
): VowAnalysis {
	const totalWords = countWords(text)
	const stats = getMatchStats(spans)
	const { seconds: readTimeSeconds, label: readTimeLabel } = calculateReadTime(totalWords)
	const lengthBucket = calculateLengthBucket(totalWords, readTimeSeconds)
	const lengthGuidance = generateLengthGuidance(lengthBucket, totalWords, readTimeSeconds)

	const weakHits = stats.totalMatches
	const uniqueWeakPhrases = stats.uniquePhrases
	const weakRate = totalWords > 0 ? weakHits / totalWords : 0
	const totalSeverityScore = stats.totalSeverityScore

	const intensifierResult = detectIntensifierOveruse(text)
	const categoryCounts = buildCategoryCounts(spans)
	const severityBucket = calculateSeverityBucket(
		weakHits,
		weakRate,
		lengthBucket,
		intensifierResult.penaltyScore,
		mode
	)
	const topPhrases = getTopPhrases(stats.byPhrase, 5)
	const insights = generateInsights(
		severityBucket,
		lengthBucket,
		weakHits,
		categoryCounts,
		topPhrases,
		readTimeSeconds,
		mode
	)

	return {
		totalWords,
		readTimeSeconds,
		readTimeLabel,
		lengthBucket,
		lengthGuidance,
		weakHits,
		uniqueWeakPhrases,
		weakRate,
		totalSeverityScore,
		categoryCounts,
		severityBucket,
		topPhrases,
		insights,
		spans,
	}
}

/**
 * Get empty analysis for initial state.
 */
export function emptyAnalysis(): VowAnalysis {
	return {
		totalWords: 0,
		readTimeSeconds: 0,
		readTimeLabel: '0:00',
		lengthBucket: 'too-short',
		lengthGuidance: 'Paste your vows to get started.',
		weakHits: 0,
		uniqueWeakPhrases: 0,
		weakRate: 0,
		totalSeverityScore: 0,
		categoryCounts: {
			cliche_opening: 0,
			cliche_closing: 0,
			generic_promise: 0,
			vague_admiration: 0,
			cringe_phrase: 0,
			filler_intensifier: 0,
			overpromise_absolute: 0,
			too_formal_scripted: 0,
		},
		severityBucket: 'great',
		topPhrases: [],
		insights: {
			headline: 'Paste your vows to analyze',
			bullets: [],
			actionSteps: [],
		},
		spans: [],
	}
}

/**
 * Format weak rate as percentage string.
 */
export function formatWeakRate(rate: number): string {
	return `${(rate * 100).toFixed(1)}%`
}

/**
 * Get severity bucket display info.
 */
export function getSeverityBucketDisplay(bucket: SeverityBucket): {
	label: string
	description: string
	colorClass: string
} {
	switch (bucket) {
		case 'great':
			return {
				label: 'Great',
				description: 'Authentic and personal',
				colorClass: 'text-green-600 dark:text-green-400',
			}
		case 'fair':
			return {
				label: 'Fair',
				description: 'Some phrases to personalize',
				colorClass: 'text-amber-600 dark:text-amber-400',
			}
		case 'weak':
			return {
				label: 'Needs Work',
				description: 'Several clichés to replace',
				colorClass: 'text-red-600 dark:text-red-400',
			}
	}
}

/**
 * Get length bucket display info.
 */
export function getLengthBucketDisplay(bucket: LengthBucket): {
	label: string
	colorClass: string
} {
	switch (bucket) {
		case 'too-short':
			return {
				label: 'Too Short',
				colorClass: 'text-amber-600 dark:text-amber-400',
			}
		case 'great':
			return {
				label: 'Good Length',
				colorClass: 'text-green-600 dark:text-green-400',
			}
		case 'too-long':
			return {
				label: 'Too Long',
				colorClass: 'text-amber-600 dark:text-amber-400',
			}
	}
}
